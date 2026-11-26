import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CONNECTORS_SCHEMA_VERSION,
  AI_PROVIDER_CONNECTORS,
  AGENT_HARNESS_CONNECTORS,
  ZOTH_BRIDGE_CONNECTORS,
  sanitizeConnectorText,
  sanitizeConnectorPayload,
  redactMcpServerConfig,
  validateLoopbackProbeTarget,
  generateMcpServersJson,
  generateOpenAiCompatEnv,
  generateHermesConfigYaml,
  generateCodexConfigToml,
  filterConnectors,
  computeConnectorSummary,
  buildOfflineConnectorsSnapshot,
  neutralizeCsvCell,
  buildConnectorsJsonExport,
  buildConnectorsMarkdownExport,
  buildConnectorsCsvExport,
} from '../src/utils/connectorsEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const FAKE_HOME = '/home/operator/';
const FAKE_FILE_HOME = 'file:///home/operator/';

test('connectorsEngine.js and server/connectors-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/connectorsEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/connectors-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server Connectors engines must remain byte-identical');
  assert.equal(CONNECTORS_SCHEMA_VERSION, '2.3.0');
  assert.equal(AI_PROVIDER_CONNECTORS.length, 4);
  assert.equal(AGENT_HARNESS_CONNECTORS.length, 6);
  assert.equal(ZOTH_BRIDGE_CONNECTORS.length, 8);
});

test('validateLoopbackProbeTarget blocks SSRF (external hosts, IMDS, RFC1918, privileged ports, bad schemes, traversal) and allows loopback 1024..65535', () => {
  // Valid targets
  for (const good of [
    { host: '127.0.0.1', port: 11434, path: '/api/tags' },
    { host: 'localhost', port: 18000, path: '/health' },
    { host: '[::1]', port: 8094, path: '/api/health' },
    18000,
    '127.0.0.1:11434',
    'http://127.0.0.1:18000/health',
    { target: 'http://localhost:8102/api/health' },
  ]) {
    const res = validateLoopbackProbeTarget(good);
    assert.equal(res.valid, true, `Expected valid for ${JSON.stringify(good)}: ${res.error}`);
    assert.equal(res.host, '127.0.0.1');
    assert.ok(res.port >= 1024 && res.port <= 65535);
  }

  // Blocked SSRF & malformed targets
  for (const bad of [
    { host: '169.254.169.254', port: 8080, path: '/latest/meta-data/' },
    { host: 'example.com', port: 8080 },
    { host: '192.168.1.1', port: 8080 },
    { host: '10.0.0.1', port: 8080 },
    { host: '0.0.0.0', port: 8080 },
    { host: '127.0.0.1', port: 80 },
    { host: '127.0.0.1', port: 22 },
    { host: '127.0.0.1', port: 1023 },
    { host: '127.0.0.1', port: 65536 },
    { host: '127.0.0.1', port: 18000, path: '/../../etc/passwd' },
    { host: '127.0.0.1', port: 18000, path: '//evil.example/x' },
    'file:///etc/passwd',
    'gopher://127.0.0.1:11434/',
    'http://user:pass@127.0.0.1:18000/health',
    'http://169.254.169.254:8080/',
    'javascript:alert(1)',
    null,
    '',
    true,
  ]) {
    const res = validateLoopbackProbeTarget(bad);
    assert.equal(res.valid, false, `Expected invalid for ${JSON.stringify(bad)}`);
    assert.ok(res.error && res.error.length > 5);
  }
});

test('sanitizeConnectorText, sanitizeConnectorPayload & redactMcpServerConfig scrub secrets and /home/ paths', () => {
  const fakeSk = ['sk', '-', 'a'.repeat(24)].join('');
  const fakeGhp = ['ghp', '_', 'B'.repeat(24)].join('');
  const dirty = `Loaded ${FAKE_HOME}.hermes/mcp.json and ${FAKE_FILE_HOME}vault with Bearer secretTokenValue99 ${fakeSk} ${fakeGhp}\x00`;
  const clean = sanitizeConnectorText(dirty);

  assert.ok(!clean.includes(FAKE_HOME));
  assert.ok(!clean.includes('file:///home/'));
  assert.ok(!clean.includes(fakeSk));
  assert.ok(!clean.includes(fakeGhp));
  assert.ok(!clean.includes('secretTokenValue99'));
  assert.ok(!clean.includes('\x00'));
  assert.ok(clean.includes('~/.hermes/mcp.json'));
  assert.ok(clean.includes('[REDACTED_SECRET]'));

  const redactedMcp = redactMcpServerConfig('demo-mcp', {
    command: `${FAKE_HOME}.local/bin/demo-mcp`,
    args: ['--config', `${FAKE_HOME}.config/demo.json`, `--api-key=${fakeSk}`],
    env: {
      OPENAI_API_KEY: fakeSk,
      GITHUB_TOKEN: fakeGhp,
    },
    headers: {
      Authorization: `Bearer ${fakeSk}`,
    },
  }, `${FAKE_HOME}.claude.json`);

  assert.equal(redactedMcp.command, '~/.local/bin/demo-mcp');
  assert.equal(redactedMcp.args[1], '~/.config/demo.json');
  assert.equal(redactedMcp.args[2], '--api-key=${API_KEY}');
  assert.equal(redactedMcp.envPlaceholders.OPENAI_API_KEY, '${OPENAI_API_KEY}');
  assert.equal(redactedMcp.envPlaceholders.GITHUB_TOKEN, '${GITHUB_TOKEN}');
  assert.equal(redactedMcp.envPlaceholders.Authorization, '${AUTHORIZATION}');
  assert.equal(redactedMcp.redactedKeysCount, 3);
  assert.ok(!JSON.stringify(redactedMcp).includes(fakeSk));
  assert.ok(!JSON.stringify(redactedMcp).includes(fakeGhp));
  assert.ok(!JSON.stringify(redactedMcp).includes(FAKE_HOME));

  const payload = sanitizeConnectorPayload({
    apiKey: fakeSk,
    envKeyVar: 'ZOTH_API_KEY',
    nestedPath: `${FAKE_HOME}NullAITech`,
  });
  assert.equal(payload.apiKey, '[REDACTED_SECRET]');
  assert.equal(payload.envKeyVar, 'ZOTH_API_KEY');
  assert.equal(payload.nestedPath, '~/NullAITech');
});

test('Config generators emit valid MCP JSON, OpenAI .env, Hermes YAML, and Codex TOML strictly with ${ENV_VAR} placeholders', () => {
  const selected = ['agy-hermes-proxy', 'ollama', 'neuro-memory', 'fieldkit-mcp'];

  const mcpJson = generateMcpServersJson(selected, [], { includeMetadata: true });
  const parsedMcp = JSON.parse(mcpJson);
  assert.ok(parsedMcp.mcpServers['neuro-memory']);
  assert.ok(parsedMcp.mcpServers['fieldkit-mcp']);
  assert.equal(parsedMcp.mcpServers['neuro-memory'].env.ZOTH_API_KEY, '${ZOTH_API_KEY}');

  const envText = generateOpenAiCompatEnv(selected, { model: 'qwen2.5-coder:7b' });
  assert.ok(envText.includes('OPENAI_BASE_URL=http://127.0.0.1:18000/v1'));
  assert.ok(envText.includes('OPENAI_API_KEY=${ZOTH_API_KEY}'));
  assert.ok(envText.includes('OLLAMA_HOST=http://127.0.0.1:11434'));
  assert.ok(!/\bsk-[A-Za-z0-9]{10,}/.test(envText));

  const yamlText = generateHermesConfigYaml(selected, { model: 'claude-sonnet-4-6' });
  assert.ok(yamlText.includes('base_url: http://127.0.0.1:18000/v1'));
  assert.ok(yamlText.includes('api_key: "${ZOTH_API_KEY}"'));
  assert.ok(yamlText.includes('neuro-memory:'));

  const tomlText = generateCodexConfigToml(selected, { model: 'claude-sonnet-4-6' });
  assert.ok(tomlText.includes('base_url = "http://127.0.0.1:18000/v1"'));
  assert.ok(tomlText.includes('env_key = "ZOTH_API_KEY"'));
  assert.ok(tomlText.includes('[mcp_servers.neuro_memory]'));
});

test('Offline browser fallback is honest and filters/summary work deterministically', () => {
  const offline = buildOfflineConnectorsSnapshot('Static Netlify host');
  assert.equal(offline.mode, 'browser-fallback');
  assert.equal(offline.liveApiReachable, false);
  assert.equal(offline.summary.providersOnline, 0);
  assert.equal(offline.summary.harnessesDetected, 0);
  assert.equal(offline.summary.bridgesOnline, 0);
  for (const p of offline.providers) {
    assert.equal(p.latencyMs, null);
    assert.equal(p.modelsCount, null);
    assert.equal(p.status, 'unprobed');
  }

  const filtered = filterConnectors(offline.providers, { status: 'ALL', query: '11434' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'ollama');
  assert.equal(filterConnectors(offline.providers, { status: 'ONLINE' }).length, 0);
});

test('JSON, Markdown, and formula-neutralized CSV exporters redact paths and neutralize CSV formulas', () => {
  assert.equal(neutralizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"` );
  assert.equal(neutralizeCsvCell('+1+2'), "'+1+2");
  assert.equal(neutralizeCsvCell('-10'), "'-10");
  assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), "'@SUM(A1:A2)");
  assert.equal(neutralizeCsvCell('\tINJECT'), "'\tINJECT");
  assert.equal(neutralizeCsvCell('\rINJECT'), `"'\rINJECT"`);

  const snap = {
    schemaVersion: CONNECTORS_SCHEMA_VERSION,
    mode: 'loopback-live',
    liveApiReachable: true,
    checkedAt: '2026-11-26T19:45:00Z',
    providers: [
      {
        ...AI_PROVIDER_CONNECTORS[0],
        online: true,
        status: 'online',
        latencyMs: 4,
        modelsCount: 27,
      },
    ],
    harnesses: [
      {
        ...AGENT_HARNESS_CONNECTORS[0],
        present: true,
        status: 'detected',
        location: `${FAKE_HOME}.local/bin/hermes`,
      },
    ],
    bridges: [
      {
        ...ZOTH_BRIDGE_CONNECTORS[0],
        name: '=EVIL_BRIDGE()',
        online: true,
        status: 'online',
        latencyMs: 2,
      },
    ],
    mcpServers: [
      {
        id: 'mcp-test',
        name: '+INJECT',
        transport: 'stdio',
        source: `${FAKE_HOME}.hermes/mcp_servers.json`,
        toolCount: 4,
        redactedKeysCount: 1,
      },
    ],
  };

  const jsonOut = buildConnectorsJsonExport(snap);
  assert.ok(!jsonOut.includes(FAKE_HOME));
  const parsed = JSON.parse(jsonOut);
  assert.equal(parsed.summary.providersOnline, 1);
  assert.equal(parsed.harnesses[0].location, '~/.local/bin/hermes');

  const mdOut = buildConnectorsMarkdownExport(snap);
  assert.ok(mdOut.includes('# Zoth Studio Connectors Hub — Diagnostic Report'));
  assert.ok(mdOut.includes('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform'));
  assert.ok(!mdOut.includes(FAKE_HOME));

  const csvOut = buildConnectorsCsvExport(snap);
  assert.ok(csvOut.includes("'=EVIL_BRIDGE()"));
  assert.ok(csvOut.includes("'+INJECT"));
  assert.ok(!csvOut.includes(FAKE_HOME));
});
