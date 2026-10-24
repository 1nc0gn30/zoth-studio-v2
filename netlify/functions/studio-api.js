/**
 * Netlify function: public studio showcase API.
 * Read-only sample status, memory, and bridge payloads.
 * Writes stay on the loopback server in server/studio-api.mjs.
 */

const SITE_ORIGIN = 'https://zoth.nullai.tech';
const MAX_QUERY = 120;

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*nullai\.tech$/;

const SAMPLE_MEMORIES = [
  {
    id: 'MEM-001',
    category: 'kernel',
    cluster: 'Kernel',
    weight: 0.98,
    text: 'Spike-Timing-Dependent Plasticity (STDP) biomorphic decay algorithm active in local SQLite vector database.',
    author: 'Azoth',
    tags: ['stdp', 'synaptic', 'decay']
  },
  {
    id: 'MEM-002',
    category: 'oracle',
    cluster: 'Lucy Oracle',
    weight: 0.99,
    text: 'Lucy Cognitive Memory Oracle active on loopback semantic bus. STDP memory indexing continuous cross-session knowledge.',
    author: 'Lucy',
    tags: ['memory', 'lucy', 'oracle']
  },
  {
    id: 'MEM-003',
    category: 'consensus',
    cluster: 'Consensus',
    weight: 0.94,
    text: '3-Agent Byzantine Triangulation synthesized: Azoth, Chronos, and Athena signed block consensus #8849.',
    author: 'Athena',
    tags: ['consensus', 'byzantine', 'triangulation']
  },
  {
    id: 'MEM-004',
    category: 'security',
    cluster: 'Security',
    weight: 0.96,
    text: 'Zero-Egress enclave verified. Loopback containment active with 0 external tracking endpoints.',
    author: 'Lycan',
    tags: ['zero-egress', 'entropy', 'security']
  }
];

function isAllowedOrigin(origin) {
  if (!origin || typeof origin !== 'string' || origin.length > 200) return false;
  if (origin === SITE_ORIGIN) return true;
  if (ALLOWED_ORIGIN.test(origin)) return true;
  try {
    const url = new URL(origin);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
    return local && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch {
    return false;
  }
}

function responseHeaders(origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Vary': 'Origin',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '600';
  }
  return headers;
}

function json(statusCode, origin, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...responseHeaders(origin), ...extraHeaders },
    body: JSON.stringify(payload),
  };
}

function routeKey(event) {
  const rawPath = event.path || '';
  return rawPath
    .replace(/^\/\.netlify\/functions\/studio-api\/?/, '')
    .replace(/^\/api\/studio\/?/, '')
    .replace(/\/+$/, '');
}

function cleanQuery(raw) {
  return String(raw || '').replace(/[\u0000-\u001F\u007F]/g, '').slice(0, MAX_QUERY);
}

function statusPayload() {
  return {
    checkedAt: new Date().toISOString(),
    environment: 'Netlify Hosted Showcase (Zero-Egress Guaranteed)',
    kvm: false,
    services: {
      swarm: {
        name: 'Swarm multiplexer',
        port: 8989,
        up: true,
        detail: { mode: 'Local Multiplexer', agents: 21 }
      },
      memory: {
        name: 'Neuro memory daemon',
        port: 8094,
        up: true,
        detail: { mode: 'Netlify Cloud Showcase', vector_count: SAMPLE_MEMORIES.length }
      },
      bridge: {
        name: 'Sovereign agent bridge',
        port: 8102,
        up: true,
        detail: { mode: 'Netlify Cloud Showcase', agents: 21 }
      },
      azoth: {
        name: 'Azoth local agent',
        port: 8790,
        up: true,
        detail: { role: 'Prime Alchemist Orchestrator' }
      },
      ollama: {
        name: 'Ollama',
        port: 11434,
        up: false,
        models: [],
        note: 'Run locally at 127.0.0.1:11434 for offline silicon inference'
      },
      civilization: {
        name: 'Zoth civilization',
        port: 9393,
        up: true,
        adytumCycleCount: 4,
        observationalCycles: 4,
        detail: { day: 6, leader: 'AZOTH', adytumCycles: 4 }
      }
    }
  };
}

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: responseHeaders(origin), body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return json(405, origin, { error: 'Method not allowed.' }, { Allow: 'GET, OPTIONS' });
  }

  const subpath = routeKey(event);

  if (subpath === 'status' || subpath === '') {
    return json(200, origin, statusPayload());
  }

  if (subpath === 'memory') {
    const q = cleanQuery(event.queryStringParameters?.q || '');
    const needle = q.toLowerCase();
    const filtered = needle
      ? SAMPLE_MEMORIES.filter((m) =>
          m.text.toLowerCase().includes(needle) ||
          m.id.toLowerCase().includes(needle) ||
          m.category.includes(needle))
      : SAMPLE_MEMORIES;

    return json(200, origin, {
      query: q,
      count: filtered.length,
      memories: filtered,
      results: filtered
    });
  }

  if (subpath === 'bridge') {
    return json(200, origin, {
      status: 'online',
      transport: 'WebSocket / Loopback Mesh',
      peers: 21,
      message: 'Sovereign Agent Bridge active. Ready for inter-agent consensus packets.'
    });
  }

  return json(404, origin, { error: 'Unknown studio API route.' });
}
