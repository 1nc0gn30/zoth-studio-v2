import http from 'node:http';
import fs from 'node:fs';

function requestJson(port, urlPath, { method = 'GET', body = null, timeout = 900 } = {}) {
  return new Promise((resolve) => {
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        timeout,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': payload.length }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          if (text) {
            try {
              json = JSON.parse(text);
            } catch {
              json = { raw: text.slice(0, 400) };
            }
          }
          resolve({ up: res.statusCode > 0 && res.statusCode < 500, status: res.statusCode, json });
        });
      }
    );
    req.on('error', () => resolve({ up: false, status: 0, json: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ up: false, status: 0, json: null });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function localModels(tags) {
  const models = tags?.models || [];
  return models
    .map((model) => model.name)
    .filter((name) => name && !/cloud/i.test(name));
}

function probeClassic() {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 8088, path: '/studio/index.html', method: 'GET', timeout: 900 },
      (res) => {
        res.resume();
        resolve(res.statusCode > 0 && res.statusCode < 400);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

export async function probeStatus() {
  const [memory, bridge, vault, ollama, classic] = await Promise.all([
    requestJson(8788, '/health'),
    requestJson(8789, '/api/health'),
    requestJson(8787, '/health'),
    requestJson(11434, '/api/tags'),
    probeClassic(),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    kvm: fs.existsSync('/dev/kvm'),
    services: {
      memory: {
        name: 'Neuro memory daemon',
        port: 8788,
        up: memory.up,
        detail: memory.json,
      },
      bridge: {
        name: 'Sovereign agent bridge',
        port: 8789,
        up: bridge.up,
        detail: bridge.json,
      },
      vault: {
        name: 'Vault daemon',
        port: 8787,
        up: vault.up,
        detail: vault.json,
      },
      ollama: {
        name: 'Ollama',
        port: 11434,
        up: ollama.up,
        models: ollama.up ? localModels(ollama.json) : [],
      },
      classic: {
        name: 'Classic studio',
        port: 8088,
        up: classic,
      },
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

export function studioMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith('/api/studio')) {
      next();
      return;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/studio/status') {
        send(res, 200, await probeStatus());
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/memory') {
        const query = url.searchParams.get('q') || '';
        const path = query
          ? `/api/memories?q=${encodeURIComponent(query)}&limit=50`
          : '/api/memories?limit=50';
        const result = await requestJson(8788, path);
        if (!result.up) {
          send(res, 503, {
            error: 'Memory daemon is not answering on 127.0.0.1:8788.',
            hint: 'npm run zoth -- up',
          });
          return;
        }
        send(res, result.status || 200, result.json || { memories: [] });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/bridge') {
        const [health, channels, stats] = await Promise.all([
          requestJson(8789, '/api/health'),
          requestJson(8789, '/api/channels'),
          requestJson(8789, '/api/stats'),
        ]);
        if (!health.up) {
          send(res, 503, {
            error: 'Signal bridge is not answering on 127.0.0.1:8789.',
            hint: 'npm run zoth -- up',
          });
          return;
        }
        send(res, 200, { health: health.json, channels: channels.json, stats: stats.json });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/adytum') {
        const body = await readBody(req);
        const model = String(body.model || '');
        if (!model || /cloud/i.test(model)) {
          send(res, 400, { error: 'Pick a local model. Cloud model names are not sent.' });
          return;
        }
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          send(res, 400, { error: 'The planner needs a message list.' });
          return;
        }
        const result = await requestJson(11434, '/api/chat', {
          method: 'POST',
          timeout: 180000,
          body: { model, messages: body.messages, stream: false },
        });
        if (!result.up) {
          send(res, 503, { error: 'Ollama is not answering on 127.0.0.1:11434.' });
          return;
        }
        const text = result.json?.message?.content;
        if (!text) {
          send(res, 502, { error: 'Ollama returned no text.', detail: result.json });
          return;
        }
        send(res, 200, {
          model,
          text,
          gateOpened: /\[GATE OPENED\]/i.test(text),
          reflectionNeeded: /\[REFLECTION NEEDED\]/i.test(text),
        });
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/bridge/send' || url.pathname === '/api/studio/bridge/consensus')) {
        const upstream = url.pathname.endsWith('/send') ? '/api/send' : '/api/consensus';
        const body = await readBody(req);
        const result = await requestJson(8789, upstream, { method: 'POST', body, timeout: 8000 });
        if (!result.up) {
          send(res, 503, {
            error: 'Signal bridge is not answering on 127.0.0.1:8789.',
            hint: 'npm run zoth -- up',
          });
          return;
        }
        send(res, result.status || 200, result.json || {});
        return;
      }

      send(res, 404, { error: 'Unknown studio API route.' });
    } catch (error) {
      send(res, 400, { error: error.message || 'Bad request' });
    }
  };
}
