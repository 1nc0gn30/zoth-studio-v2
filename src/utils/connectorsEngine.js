/**
 * Connectors Hub — Pure Loopback AI Provider, Agent Harness & MCP Config Engine (v2.3.0)
 *
 * Mirrored byte-identically between browser (`src/utils/connectorsEngine.js`)
 * and Studio API server (`server/connectors-engine.mjs`).
 *
 * Security & Honesty Invariants:
 *  - Strict loopback-only probe validation (`127.0.0.1`, `localhost`, `[::1]`) on unprivileged ports `1024..65535`
 *  - Zero plaintext API keys stored or emitted — all generated configs strictly use `${ENV_VAR}` placeholders
 *  - Automatic `/home/<user>/`, `file:///home/<user>/`, and `/Users/<user>/` redaction to `~/`
 *  - Formula-injection-neutralized CSV (`=`, `+`, `-`, `@`, `\t`, `\r`)
 *  - Honest offline browser fallback with zero fabricated latency or live telemetry
 */

export const CONNECTORS_SCHEMA_VERSION = '2.3.0';

export const ALLOWED_LOOPBACK_HOSTS = Object.freeze([
  '127.0.0.1',
  'localhost',
  '[::1]',
  '::1',
]);

export const AI_PROVIDER_CONNECTORS = Object.freeze([
  {
    id: 'agy-hermes-proxy',
    name: 'AGY-Hermes Proxy',
    category: 'provider',
    protocol: 'OpenAI-Compat HTTP',
    host: '127.0.0.1',
    port: 18000,
    probePath: '/health',
    modelsPath: '/v1/models',
    baseUrl: 'http://127.0.0.1:18000/v1',
    envKeyVar: 'ZOTH_API_KEY',
    defaultModel: 'claude-sonnet-4-6',
    description: 'Hardened loopback OpenAI-compatible proxy bridging local coding agents & Hermes.',
    capabilities: ['/v1/models', '/v1/chat/completions', '/health'],
  },
  {
    id: 'ollama',
    name: 'Ollama Local Runtime',
    category: 'provider',
    protocol: 'REST / OpenAI-Compat',
    host: '127.0.0.1',
    port: 11434,
    probePath: '/api/tags',
    modelsPath: '/api/tags',
    baseUrl: 'http://127.0.0.1:11434/v1',
    envKeyVar: 'OLLAMA_API_KEY',
    defaultModel: 'qwen2.5-coder:7b',
    description: 'Local GGUF inference daemon with zero external egress and OpenAI /v1 endpoint.',
    capabilities: ['/api/tags', '/api/chat', '/v1/chat/completions'],
  },
  {
    id: 'lm-studio',
    name: 'LM Studio Local Server',
    category: 'provider',
    protocol: 'OpenAI-Compat HTTP',
    host: '127.0.0.1',
    port: 1234,
    probePath: '/v1/models',
    modelsPath: '/v1/models',
    baseUrl: 'http://127.0.0.1:1234/v1',
    envKeyVar: 'LM_STUDIO_API_KEY',
    defaultModel: 'local-model',
    description: 'Desktop local GGUF/MLX model server exposing OpenAI-compatible endpoints on :1234.',
    capabilities: ['/v1/models', '/v1/chat/completions', '/v1/embeddings'],
  },
  {
    id: 'vllm-local',
    name: 'vLLM / OpenAI-Compat Gateway',
    category: 'provider',
    protocol: 'OpenAI-Compat HTTP',
    host: '127.0.0.1',
    port: 8000,
    probePath: '/v1/models',
    modelsPath: '/v1/models',
    baseUrl: 'http://127.0.0.1:8000/v1',
    envKeyVar: 'VLLM_API_KEY',
    defaultModel: 'local-vllm',
    description: 'High-throughput GPU OpenAI-compatible local inference server on :8000.',
    capabilities: ['/v1/models', '/v1/chat/completions', '/health'],
  },
]);

export const AGENT_HARNESS_CONNECTORS = Object.freeze([
  {
    id: 'hermes',
    name: 'Hermes Agent',
    binary: 'hermes',
    category: 'harness',
    configPath: '~/.hermes/config.yaml',
    description: 'Autonomous local agent gateway with skills, memory, and MCP orchestration.',
    recommendedProvider: 'agy-hermes-proxy',
  },
  {
    id: 'agy',
    name: 'Antigravity CLI',
    binary: 'agy',
    category: 'harness',
    configPath: '~/.gemini/antigravity-cli/mcp/',
    description: 'Interactive coding agent runtime with lazy-loaded MCP server directories.',
    recommendedProvider: 'agy-hermes-proxy',
  },
  {
    id: 'claude',
    name: 'Claude Code CLI',
    binary: 'claude',
    category: 'harness',
    configPath: '~/.claude.json',
    description: 'Terminal coding agent supporting stdio/SSE MCP servers and custom base URLs.',
    recommendedProvider: 'agy-hermes-proxy',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex CLI',
    binary: 'codex',
    category: 'harness',
    configPath: '~/.codex/config.toml',
    description: 'TOML-configured terminal coding agent compatible with loopback OpenAI providers.',
    recommendedProvider: 'agy-hermes-proxy',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    binary: 'gemini',
    category: 'harness',
    configPath: '~/.gemini/settings.json',
    description: 'Terminal agent supporting MCP tool registries and local tool execution.',
    recommendedProvider: 'ollama',
  },
  {
    id: 'opencode',
    name: 'OpenCode CLI',
    binary: 'opencode',
    category: 'harness',
    configPath: '~/.config/opencode/config.json',
    description: 'Open-source terminal coding assistant with pluggable local OpenAI providers.',
    recommendedProvider: 'ollama',
  },
]);

export const ZOTH_BRIDGE_CONNECTORS = Object.freeze([
  {
    id: 'neuro-memory',
    name: 'Neuro-Memory Daemon',
    category: 'bridge',
    transport: 'HTTP Loopback',
    host: '127.0.0.1',
    port: 8094,
    probePath: '/api/health',
    mcpCommand: 'neuro-memory-daemon',
    mcpArgs: ['mcp'],
    description: 'STDP biomorphic synaptic memory substrate & episodic recall daemon.',
    capabilities: ['/api/health', '/api/recall', '/api/engrams'],
  },
  {
    id: 'sovereign-agent-bridge',
    name: 'Sovereign Agent Bridge',
    category: 'bridge',
    transport: 'HTTP Loopback',
    host: '127.0.0.1',
    port: 8102,
    probePath: '/api/health',
    mcpCommand: 'sovereign-agent-bridge',
    mcpArgs: ['mcp'],
    description: 'Loopback signal bridge, cross-agent message bus & tool policy gatekeeper.',
    capabilities: ['/api/health', '/api/channels', '/api/agents/live'],
  },
  {
    id: 'zoth-vault',
    name: 'Zoth Vault Daemon',
    category: 'bridge',
    transport: 'HTTP Loopback',
    host: '127.0.0.1',
    port: 8787,
    probePath: '/health',
    mcpCommand: 'envguard-secrets-vault',
    mcpArgs: ['mcp'],
    description: 'Local encrypted credential vault & Argon2id secret enclave.',
    capabilities: ['/health', '/api/status'],
  },
  {
    id: 'chronicle-vault',
    name: 'Chronicle Vault',
    category: 'bridge',
    transport: 'HTTP Loopback',
    host: '127.0.0.1',
    port: 8161,
    probePath: '/health',
    mcpCommand: 'zoth-memory-vault',
    mcpArgs: ['mcp'],
    description: 'SQLite FTS5 cross-agent continuity archive & recall daemon.',
    capabilities: ['/health', '/api/overview', '/api/continuity/recall'],
  },
  {
    id: 'zoth-bolt',
    name: 'Zoth Bolt / WebGen',
    category: 'bridge',
    transport: 'HTTP Loopback',
    host: '127.0.0.1',
    port: 5173,
    probePath: '/api/health',
    mcpCommand: 'zoth-bolt',
    mcpArgs: ['mcp'],
    description: 'Local full-stack layout foundry & real-time SSE build bridge.',
    capabilities: ['/api/health', '/api/webgen/control'],
  },
  {
    id: 'azoth-local-agent',
    name: 'AZOTH Local Agent',
    category: 'bridge',
    transport: 'HTTP + MCP Stdio',
    host: '127.0.0.1',
    port: 8136,
    probePath: '/api/health',
    mcpCommand: 'azoth-local-agent',
    mcpArgs: ['mcp'],
    description: 'Hardened loopback FastAPI Archon agent exposing 36 local MCP tools.',
    capabilities: ['/api/health', '36 MCP stdio tools'],
  },
  {
    id: 'mcp-lens',
    name: 'MCP Lens Sniffer',
    category: 'bridge',
    transport: 'HTTP + MCP Proxy',
    host: '127.0.0.1',
    port: 8109,
    probePath: '/health',
    mcpCommand: 'python3',
    mcpArgs: ['-m', 'mcp_lens.cli', 'sniff', '--port', '8109'],
    description: 'JSON-RPC 2.0 MCP traffic inspector and BPE token overhead auditor.',
    capabilities: ['/health', 'stdio/SSE sniff', 'token audit'],
  },
  {
    id: 'fieldkit-mcp',
    name: 'NullAI FieldKit MCP',
    category: 'bridge',
    transport: 'MCP Stdio',
    host: 'stdio',
    port: null,
    probePath: null,
    mcpCommand: 'fieldkit-mcp',
    mcpArgs: ['--stdio'],
    description: 'Physical AI mission DAG state machine, 3D FOV/raycast verification, near-field voice gate & biometric vault MCP bridge (10 stdio tools).',
    capabilities: ['10 stdio tools', 'DAG + 3D raycast', 'AES-256-GCM vault'],
  },
]);

const SENSITIVE_KEY_PATTERN = /(key|token|secret|pass|password|passwd|auth|credential|cookie|private|jwt|bearer|api_?key)/i;

const SECRET_VALUE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi,
  /\bsk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{12,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bglpat-[A-Za-z0-9_-]{12,}\b/g,
  /\bnvapi-[A-Za-z0-9_-]{12,}\b/g,
  /\bnpm_[A-Za-z0-9]{16,}\b/g,
];

/**
 * Redacts literal host home paths (`/home/<user>/`, `/Users/<user>/`, `file:///home/...`)
 * and secret/token patterns from any text string.
 */
export function sanitizeConnectorText(input) {
  if (input === null || input === undefined) return '';
  let out = String(input);
  // Strip NUL and dangerous control characters while keeping newline & tab
  out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Normalize file:///home/<user>/ and file:///Users/<user>/
  out = out.replace(/file:\/\/\/(?:home|Users)\/[^/\s"'`<>]+\//g, '~/');
  // Normalize /home/<user>/ and /Users/<user>/
  out = out.replace(/\/(?:home|Users)\/[A-Za-z0-9._-]+\//g, '~/');
  out = out.replace(/\/(?:home|Users)\/[A-Za-z0-9._-]+(?=$|[\s"'`,;:])/g, '~');
  // Normalize Windows C:\Users\<user>\
  out = out.replace(/[A-Za-z]:\\Users\\[^\\\s"'`<>]+\\/g, '~/');
  // Redact secret token shapes
  for (const rx of SECRET_VALUE_PATTERNS) {
    out = out.replace(rx, '[REDACTED_SECRET]');
  }
  return out;
}

/**
 * Recursively sanitizes any payload object/array so zero `/home/<user>/` paths
 * or plaintext secret shapes can ever escape API responses or exports.
 */
export function sanitizeConnectorPayload(value, depth = 0) {
  if (depth > 12) return null;
  if (typeof value === 'string') return sanitizeConnectorText(value);
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeConnectorPayload(item, depth + 1));
  }
  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    const safeKey = sanitizeConnectorText(k);
    if (
      SENSITIVE_KEY_PATTERN.test(safeKey) &&
      typeof v === 'string' &&
      v.trim() !== '' &&
      !/^\$\{[A-Z0-9_]+\}$/.test(v.trim()) &&
      safeKey !== 'envKeyVar' &&
      safeKey !== 'envPlaceholders'
    ) {
      clean[safeKey] = '[REDACTED_SECRET]';
    } else {
      clean[safeKey] = sanitizeConnectorPayload(v, depth + 1);
    }
  }
  return clean;
}

/**
 * Converts a key name into a safe uppercase `${ENV_VAR}` placeholder.
 */
export function toEnvPlaceholder(keyName, fallback = 'CONNECTOR_SECRET') {
  const norm = String(keyName || '')
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  return `\${${norm || fallback}}`;
}

/**
 * Normalizes and strictly redacts a discovered local MCP server configuration.
 * Never returns raw API keys, auth headers, or literal `/home/<user>/` paths.
 */
export function redactMcpServerConfig(name, rawConfig = {}, source = 'local-config') {
  const safeName = sanitizeConnectorText(String(name || 'unnamed-mcp')).slice(0, 80);
  const cfg = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  const transport = cfg.url || cfg.serverUrl
    ? (String(cfg.transport || '').toLowerCase() === 'streamable-http' ? 'streamable-http' : 'sse/http')
    : 'stdio';

  const command = cfg.command ? sanitizeConnectorText(String(cfg.command)) : null;
  const rawArgs = Array.isArray(cfg.args) ? cfg.args : [];
  const args = rawArgs.map((arg, idx) => {
    const str = String(arg ?? '');
    const prev = idx > 0 ? String(rawArgs[idx - 1] ?? '') : '';
    if (SENSITIVE_KEY_PATTERN.test(prev) || /^--?(?:api-?key|token|secret|password)=/i.test(str)) {
      const eqIdx = str.indexOf('=');
      if (eqIdx > 0) {
        const flagName = str.slice(0, eqIdx);
        return `${flagName}=${toEnvPlaceholder(flagName.replace(/^-+/, ''))}`;
      }
      return '[REDACTED_SECRET]';
    }
    return sanitizeConnectorText(str);
  });

  let safeUrl = null;
  if (cfg.url || cfg.serverUrl) {
    try {
      const parsed = new URL(String(cfg.url || cfg.serverUrl));
      parsed.username = '';
      parsed.password = '';
      for (const [qk] of parsed.searchParams.entries()) {
        if (SENSITIVE_KEY_PATTERN.test(qk)) {
          parsed.searchParams.set(qk, toEnvPlaceholder(qk));
        }
      }
      safeUrl = sanitizeConnectorText(parsed.toString());
    } catch {
      safeUrl = sanitizeConnectorText(String(cfg.url || cfg.serverUrl));
    }
  }

  const envPlaceholders = {};
  let redactedKeysCount = 0;

  if (cfg.env && typeof cfg.env === 'object' && !Array.isArray(cfg.env)) {
    for (const key of Object.keys(cfg.env)) {
      const cleanKey = sanitizeConnectorText(key);
      envPlaceholders[cleanKey] = toEnvPlaceholder(cleanKey);
      redactedKeysCount += 1;
    }
  }
  if (cfg.headers && typeof cfg.headers === 'object' && !Array.isArray(cfg.headers)) {
    for (const key of Object.keys(cfg.headers)) {
      const cleanKey = sanitizeConnectorText(key);
      if (SENSITIVE_KEY_PATTERN.test(cleanKey)) {
        envPlaceholders[cleanKey] = toEnvPlaceholder(cleanKey);
        redactedKeysCount += 1;
      }
    }
  }

  const toolCount = Number.isFinite(Number(cfg.toolCount)) ? Math.max(0, Math.floor(Number(cfg.toolCount))) : null;

  return {
    id: `mcp-${safeName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
    name: safeName,
    source: sanitizeConnectorText(source),
    transport,
    command,
    args,
    url: safeUrl,
    toolCount,
    envPlaceholders,
    redactedKeysCount,
    sanitized: true,
  };
}

/**
 * Strictly validates a loopback probe target to eliminate all SSRF vectors.
 *
 * Accepts:
 *  - `{ host?, port, path? }`
 *  - `{ target: "127.0.0.1:11434" | "http://127.0.0.1:18000/health" | "localhost:8094" }`
 *  - numeric port `11434`
 *  - string `"127.0.0.1:11434"` or `"http://127.0.0.1:18000/health"`
 *
 * Strictly permits ONLY:
 *  - host in `127.0.0.1`, `localhost`, `[::1]`, `::1`
 *  - integer port in `1024..65535` (rejects privileged `<1024`)
 *  - HTTP path starting with `/` without `..` or control chars
 */
export function validateLoopbackProbeTarget(input) {
  if (input === null || input === undefined || typeof input === 'boolean') {
    return { valid: false, error: 'Probe target is required (loopback port 1024..65535).' };
  }

  let rawHost = '127.0.0.1';
  let rawPort = null;
  let rawPath = '/';

  if (typeof input === 'number') {
    rawPort = input;
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return { valid: false, error: 'Probe target cannot be empty.' };
    }
    if (/^\d+$/.test(trimmed)) {
      rawPort = Number(trimmed);
    } else {
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
      if (hasScheme && !/^https?:\/\//i.test(trimmed)) {
        return { valid: false, error: 'Only http:// loopback URLs are allowed.' };
      }
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !hasScheme && !/^(?:localhost|127\.0\.0\.1|\[::1\]):\d+/i.test(trimmed)) {
        return { valid: false, error: 'Unsupported scheme or non-loopback target blocked.' };
      }
      if (/[@\\\s]/.test(trimmed)) {
        return { valid: false, error: 'Credentials, whitespace, and backslashes are not allowed in probe targets.' };
      }
      let parsed;
      try {
        parsed = new URL(hasScheme ? trimmed : `http://${trimmed}`);
      } catch {
        return { valid: false, error: 'Invalid loopback target format.' };
      }
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'Only HTTP loopback probes are allowed.' };
      }
      if (parsed.username || parsed.password) {
        return { valid: false, error: 'Embedded credentials are not allowed.' };
      }
      rawHost = parsed.hostname.toLowerCase();
      if (!parsed.port) {
        return { valid: false, error: 'Explicit unprivileged port (1024..65535) is required.' };
      }
      rawPort = Number(parsed.port);
      rawPath = `${parsed.pathname || '/'}${parsed.search || ''}`;
    }
  } else if (typeof input === 'object' && !Array.isArray(input)) {
    if (typeof input.target === 'string' && input.target.trim() && (input.port === undefined || input.port === null || input.port === '')) {
      return validateLoopbackProbeTarget(input.target);
    }
    if (input.host !== undefined && input.host !== null && String(input.host).trim() !== '') {
      rawHost = String(input.host).trim().toLowerCase();
    }
    rawPort = input.port;
    if (input.path !== undefined && input.path !== null && String(input.path).trim() !== '') {
      rawPath = String(input.path).trim();
    }
  } else {
    return { valid: false, error: 'Invalid probe target payload.' };
  }

  // Reject any host containing scheme, slashes, whitespace, or non-loopback address
  if (rawHost.includes('://') || /[\s/@\\?#]/.test(rawHost) || !ALLOWED_LOOPBACK_HOSTS.includes(rawHost)) {
    return {
      valid: false,
      error: `Non-loopback host "${sanitizeConnectorText(rawHost).slice(0, 64)}" is blocked. Only 127.0.0.1 / localhost loopback targets are permitted.`,
    };
  }

  // Validate port strictly as integer 1024..65535
  if (typeof rawPort === 'boolean' || rawPort === null || rawPort === undefined || String(rawPort).trim() === '') {
    return { valid: false, error: 'Port is required and must be an integer between 1024 and 65535.' };
  }
  const portStr = String(rawPort).trim();
  if (!/^\d{1,5}$/.test(portStr)) {
    return { valid: false, error: `Invalid port "${sanitizeConnectorText(portStr).slice(0, 24)}". Must be an integer between 1024 and 65535.` };
  }
  const port = Number(portStr);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    return { valid: false, error: `Port ${port} is out of allowed unprivileged loopback range (1024..65535).` };
  }

  // Validate probe path strictly
  let safePath = String(rawPath || '/').trim();
  if (!safePath.startsWith('/')) safePath = `/${safePath}`;
  if (/[\x00-\x1F\x7F\s\\]/.test(safePath) || safePath.includes('..') || safePath.startsWith('//') || safePath.length > 160) {
    return { valid: false, error: 'Invalid probe path (traversal, protocol-relative, or control characters rejected).' };
  }

  return {
    valid: true,
    host: '127.0.0.1',
    port,
    path: safePath,
    url: `http://127.0.0.1:${port}${safePath}`,
  };
}

/**
 * Generates an Antigravity / Claude Desktop / Claude Code compatible `mcpServers` JSON config.
 * Strictly emits `${ENV_VAR}` placeholders — never plaintext secrets.
 */
export function generateMcpServersJson(selectedIds = [], discoveredServers = [], options = {}) {
  const chosen = new Set(Array.isArray(selectedIds) && selectedIds.length > 0
    ? selectedIds
    : ['neuro-memory', 'sovereign-agent-bridge', 'azoth-local-agent', 'fieldkit-mcp']);

  const mcpServers = {};

  for (const bridge of ZOTH_BRIDGE_CONNECTORS) {
    if (!chosen.has(bridge.id)) continue;
    const entry = {
      command: bridge.mcpCommand,
      args: [...bridge.mcpArgs],
    };
    if (bridge.port) {
      entry.env = {
        ZOTH_LOOPBACK_URL: `http://127.0.0.1:${bridge.port}`,
        ZOTH_API_KEY: '${ZOTH_API_KEY}',
      };
    }
    mcpServers[bridge.id] = entry;
  }

  for (const srv of Array.isArray(discoveredServers) ? discoveredServers : []) {
    if (!chosen.has(srv.id) && !chosen.has(srv.name)) continue;
    const clean = redactMcpServerConfig(srv.name, srv, srv.source);
    if (clean.url) {
      const entry = { url: clean.url };
      if (Object.keys(clean.envPlaceholders).length > 0) {
        entry.env = { ...clean.envPlaceholders };
      }
      mcpServers[clean.name] = entry;
    } else if (clean.command) {
      const entry = { command: clean.command, args: clean.args };
      if (Object.keys(clean.envPlaceholders).length > 0) {
        entry.env = { ...clean.envPlaceholders };
      }
      mcpServers[clean.name] = entry;
    }
  }

  if (Object.keys(mcpServers).length === 0) {
    mcpServers['fieldkit-mcp'] = {
      command: 'fieldkit-mcp',
      args: ['--stdio'],
    };
  }

  const payload = options.includeMetadata
    ? { _comment: 'Generated by Zoth Studio Connectors Hub v2.3.0 — replace ${ENV_VAR} in shell env, never commit keys.', mcpServers }
    : { mcpServers };

  return `${JSON.stringify(payload, null, 2)}\n`;
}

/**
 * Generates an OpenAI-compatible `.env` snippet pointing at loopback providers.
 * Strictly emits `${ENV_VAR}` placeholders — never plaintext keys.
 */
export function generateOpenAiCompatEnv(selectedIds = [], options = {}) {
  const chosen = new Set(Array.isArray(selectedIds) && selectedIds.length > 0
    ? selectedIds
    : ['agy-hermes-proxy', 'ollama']);

  const primary = chosen.has('agy-hermes-proxy')
    ? AI_PROVIDER_CONNECTORS[0]
    : chosen.has('ollama')
    ? AI_PROVIDER_CONNECTORS[1]
    : chosen.has('lm-studio')
    ? AI_PROVIDER_CONNECTORS[2]
    : chosen.has('vllm-local')
    ? AI_PROVIDER_CONNECTORS[3]
    : AI_PROVIDER_CONNECTORS[0];

  const model = sanitizeConnectorText(options.model || primary.defaultModel || 'qwen2.5-coder:7b');

  const lines = [
    '# Zoth Studio Connectors Hub v2.3.0 — Loopback OpenAI-Compatible .env',
    '# Zero plaintext keys: export real secrets in your local shell or Zoth Vault (:8787).',
    `OPENAI_BASE_URL=${primary.baseUrl}`,
    `OPENAI_API_KEY=\${${primary.envKeyVar || 'OPENAI_API_KEY'}}`,
    `OPENAI_MODEL=${model}`,
    '',
    '# Secondary loopback inference endpoints',
  ];

  if (chosen.has('agy-hermes-proxy')) {
    lines.push('AGY_HERMES_BASE_URL=http://127.0.0.1:18000/v1');
    lines.push('ZOTH_API_KEY=${ZOTH_API_KEY}');
  }
  if (chosen.has('ollama')) {
    lines.push('OLLAMA_HOST=http://127.0.0.1:11434');
    lines.push('OLLAMA_OPENAI_BASE_URL=http://127.0.0.1:11434/v1');
  }
  if (chosen.has('lm-studio')) {
    lines.push('LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1');
  }
  if (chosen.has('vllm-local')) {
    lines.push('VLLM_BASE_URL=http://127.0.0.1:8000/v1');
  }

  const activeBridges = ZOTH_BRIDGE_CONNECTORS.filter((b) => chosen.has(b.id) && b.port);
  if (activeBridges.length > 0) {
    lines.push('', '# Selected ZothOS loopback bridges');
    for (const b of activeBridges) {
      const envName = `${b.id.replace(/[^a-z0-9]+/gi, '_').toUpperCase()}_URL`;
      lines.push(`${envName}=http://127.0.0.1:${b.port}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Generates a Hermes Agent `config.yaml` provider & MCP snippet using `${ENV_VAR}` placeholders.
 */
export function generateHermesConfigYaml(selectedIds = [], options = {}) {
  const chosen = new Set(Array.isArray(selectedIds) && selectedIds.length > 0
    ? selectedIds
    : ['agy-hermes-proxy', 'neuro-memory', 'azoth-local-agent']);

  const useProxy = chosen.has('agy-hermes-proxy') || !chosen.has('ollama');
  const provider = useProxy ? AI_PROVIDER_CONNECTORS[0] : AI_PROVIDER_CONNECTORS[1];
  const model = sanitizeConnectorText(options.model || provider.defaultModel);

  const lines = [
    '# ~/.hermes/config.yaml — Generated by Zoth Studio Connectors Hub v2.3.0',
    '# Secrets stay in shell env or Zoth Vault (:8787); never commit plaintext keys.',
    'model:',
    `  provider: custom`,
    `  default: ${model}`,
    `  base_url: ${provider.baseUrl}`,
    `  api_key: "\${${provider.envKeyVar}}"`,
    '',
    'mcp_servers:',
  ];

  const bridges = ZOTH_BRIDGE_CONNECTORS.filter((b) => chosen.has(b.id));
  const list = bridges.length > 0 ? bridges : [ZOTH_BRIDGE_CONNECTORS[0], ZOTH_BRIDGE_CONNECTORS[5]];
  for (const b of list) {
    lines.push(`  ${b.id}:`);
    lines.push(`    command: ${b.mcpCommand}`);
    lines.push(`    args: [${b.mcpArgs.map((a) => JSON.stringify(a)).join(', ')}]`);
    if (b.port) {
      lines.push('    env:');
      lines.push(`      ZOTH_LOOPBACK_URL: "http://127.0.0.1:${b.port}"`);
      lines.push('      ZOTH_API_KEY: "${ZOTH_API_KEY}"');
    }
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Generates an OpenAI Codex CLI `config.toml` provider & MCP snippet using `env_key` indirection.
 */
export function generateCodexConfigToml(selectedIds = [], options = {}) {
  const chosen = new Set(Array.isArray(selectedIds) && selectedIds.length > 0
    ? selectedIds
    : ['agy-hermes-proxy', 'neuro-memory', 'fieldkit-mcp']);

  const useProxy = chosen.has('agy-hermes-proxy') || !chosen.has('ollama');
  const provider = useProxy ? AI_PROVIDER_CONNECTORS[0] : AI_PROVIDER_CONNECTORS[1];
  const providerKey = useProxy ? 'zoth_local_proxy' : 'zoth_ollama';
  const model = sanitizeConnectorText(options.model || provider.defaultModel);

  const lines = [
    '# ~/.codex/config.toml — Generated by Zoth Studio Connectors Hub v2.3.0',
    '# Uses env_key indirection (${ENV_VAR} resolved at runtime) — zero plaintext keys.',
    `model = "${model}"`,
    `model_provider = "${providerKey}"`,
    '',
    `[model_providers.${providerKey}]`,
    `name = "${provider.name}"`,
    `base_url = "${provider.baseUrl}"`,
    `env_key = "${provider.envKeyVar}"`,
    'wire_api = "chat"',
  ];

  const bridges = ZOTH_BRIDGE_CONNECTORS.filter((b) => chosen.has(b.id));
  const list = bridges.length > 0 ? bridges : [ZOTH_BRIDGE_CONNECTORS[0], ZOTH_BRIDGE_CONNECTORS[7]];
  for (const b of list) {
    lines.push('');
    lines.push(`[mcp_servers.${b.id.replace(/-/g, '_')}]`);
    lines.push(`command = ${JSON.stringify(b.mcpCommand)}`);
    lines.push(`args = [${b.mcpArgs.map((a) => JSON.stringify(a)).join(', ')}]`);
    if (b.port) {
      lines.push(`env = { ZOTH_LOOPBACK_URL = "http://127.0.0.1:${b.port}", ZOTH_API_KEY = "\${ZOTH_API_KEY}" }`);
    }
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Filters a connector list by status (`ALL`, `ONLINE`, `OFFLINE`) and free-text query.
 */
export function filterConnectors(items = [], { status = 'ALL', query = '' } = {}) {
  const st = String(status || 'ALL').toUpperCase();
  const q = String(query || '').trim().toLowerCase();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const isUp = Boolean(item?.online || item?.present);
    if (st === 'ONLINE' && !isUp) return false;
    if (st === 'OFFLINE' && isUp) return false;
    if (!q) return true;
    const hay = [
      item.id,
      item.name,
      item.category,
      item.protocol,
      item.transport,
      item.binary,
      item.source,
      item.port ? String(item.port) : '',
      item.description,
      ...(Array.isArray(item.capabilities) ? item.capabilities : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

/**
 * Computes aggregate live/detected counts across all 4 connector classes.
 */
export function computeConnectorSummary(snapshot = {}) {
  const providers = Array.isArray(snapshot.providers) ? snapshot.providers : [];
  const harnesses = Array.isArray(snapshot.harnesses) ? snapshot.harnesses : [];
  const bridges = Array.isArray(snapshot.bridges) ? snapshot.bridges : [];
  const mcpServers = Array.isArray(snapshot.mcpServers) ? snapshot.mcpServers : [];

  const onlineProviders = providers.filter((p) => p.online).length;
  const detectedHarnesses = harnesses.filter((h) => h.present).length;
  const onlineBridges = bridges.filter((b) => b.online).length;
  const totalModels = providers.reduce((acc, p) => acc + (Number.isFinite(p.modelsCount) ? p.modelsCount : 0), 0);

  return {
    providersOnline: onlineProviders,
    providersTotal: providers.length,
    harnessesDetected: detectedHarnesses,
    harnessesTotal: harnesses.length,
    bridgesOnline: onlineBridges,
    bridgesTotal: bridges.length,
    mcpServersDiscovered: mcpServers.length,
    totalModels,
  };
}

/**
 * Builds an honest offline/static browser fallback snapshot when `:3000` is unreachable.
 * Strictly avoids fabricating latency, model counts, or live online statuses.
 */
export function buildOfflineConnectorsSnapshot(reason = 'Studio loopback API (:3000) not reachable') {
  const checkedAt = new Date().toISOString();
  const providers = AI_PROVIDER_CONNECTORS.map((p) => ({
    ...p,
    online: false,
    status: 'unprobed',
    statusCode: null,
    latencyMs: null,
    modelsCount: null,
    version: null,
  }));
  const harnesses = AGENT_HARNESS_CONNECTORS.map((h) => ({
    ...h,
    present: false,
    status: 'unprobed',
    location: null,
  }));
  const bridges = ZOTH_BRIDGE_CONNECTORS.map((b) => ({
    ...b,
    online: false,
    status: 'unprobed',
    statusCode: null,
    latencyMs: null,
  }));
  const mcpServers = [];
  const snapshot = {
    schemaVersion: CONNECTORS_SCHEMA_VERSION,
    mode: 'browser-fallback',
    liveApiReachable: false,
    reason: sanitizeConnectorText(reason),
    checkedAt,
    providers,
    harnesses,
    bridges,
    mcpServers,
  };
  return {
    ...snapshot,
    summary: computeConnectorSummary(snapshot),
  };
}

/**
 * Neutralizes CSV spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`)
 * and applies RFC4180 quoting.
 */
export function neutralizeCsvCell(value) {
  let str = sanitizeConnectorText(value === null || value === undefined ? '' : String(value));
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports a sanitized JSON diagnostic report.
 */
export function buildConnectorsJsonExport(snapshot) {
  const clean = sanitizeConnectorPayload({
    schemaVersion: snapshot?.schemaVersion || CONNECTORS_SCHEMA_VERSION,
    mode: snapshot?.mode || 'browser-fallback',
    liveApiReachable: Boolean(snapshot?.liveApiReachable),
    checkedAt: snapshot?.checkedAt || new Date().toISOString(),
    summary: computeConnectorSummary(snapshot),
    providers: snapshot?.providers || [],
    harnesses: snapshot?.harnesses || [],
    bridges: snapshot?.bridges || [],
    mcpServers: snapshot?.mcpServers || [],
    attribution: 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
  });
  return `${JSON.stringify(clean, null, 2)}\n`;
}

/**
 * Exports a sanitized Markdown diagnostic brief.
 */
export function buildConnectorsMarkdownExport(snapshot) {
  const clean = sanitizeConnectorPayload(snapshot || {});
  const summary = computeConnectorSummary(clean);
  const lines = [
    '# Zoth Studio Connectors Hub — Diagnostic Report',
    '',
    `- **Schema Version:** \`${clean.schemaVersion || CONNECTORS_SCHEMA_VERSION}\``,
    `- **Runtime Mode:** \`${clean.mode || 'browser-fallback'}\``,
    `- **Checked At:** \`${clean.checkedAt || new Date().toISOString()}\``,
    `- **AI Providers Online:** ${summary.providersOnline} / ${summary.providersTotal} (${summary.totalModels} models)`,
    `- **CLI Harnesses Detected:** ${summary.harnessesDetected} / ${summary.harnessesTotal}`,
    `- **Core Bridges Online:** ${summary.bridgesOnline} / ${summary.bridgesTotal}`,
    `- **Discovered Local MCP Servers:** ${summary.mcpServersDiscovered} (100% secret-redacted)`,
    '',
    '## AI Providers & Inference Gateways',
    '',
    '| Connector | Target | Status | Latency | Models |',
    '| :--- | :--- | :---: | :---: | :---: |',
  ];

  for (const p of clean.providers || []) {
    const rtt = p.latencyMs !== null && p.latencyMs !== undefined ? `${p.latencyMs}ms` : '—';
    const models = p.modelsCount !== null && p.modelsCount !== undefined ? String(p.modelsCount) : '—';
    lines.push(`| ${p.name} | \`${p.host}:${p.port}\` | ${p.online ? 'ONLINE' : (p.status || 'OFFLINE').toUpperCase()} | ${rtt} | ${models} |`);
  }

  lines.push(
    '',
    '## Agent Harnesses & CLI Runtimes',
    '',
    '| Harness | Binary | Status | Sanitized Location |',
    '| :--- | :--- | :---: | :--- |',
  );
  for (const h of clean.harnesses || []) {
    lines.push(`| ${h.name} | \`${h.binary}\` | ${h.present ? 'DETECTED' : (h.status || 'MISSING').toUpperCase()} | \`${h.location || '—'}\` |`);
  }

  lines.push(
    '',
    '## Core Zoth Loopback Bridges',
    '',
    '| Bridge | Target | Transport | Status | Latency |',
    '| :--- | :--- | :--- | :---: | :---: |',
  );
  for (const b of clean.bridges || []) {
    const target = b.port ? `${b.host}:${b.port}` : 'stdio';
    const rtt = b.latencyMs !== null && b.latencyMs !== undefined ? `${b.latencyMs}ms` : '—';
    lines.push(`| ${b.name} | \`${target}\` | ${b.transport} | ${b.online ? 'ONLINE' : (b.status || 'OFFLINE').toUpperCase()} | ${rtt} |`);
  }

  if (Array.isArray(clean.mcpServers) && clean.mcpServers.length > 0) {
    lines.push(
      '',
      '## Discovered Local MCP Servers (Secret-Redacted)',
      '',
      '| Name | Transport | Source | Redacted Keys |',
      '| :--- | :--- | :--- | :---: |',
    );
    for (const s of clean.mcpServers) {
      lines.push(`| \`${s.name}\` | ${s.transport} | ${s.source} | ${s.redactedKeysCount || 0} |`);
    }
  }

  lines.push('', '---', 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');
  return `${lines.join('\n')}\n`;
}

/**
 * Exports a formula-neutralized CSV inventory across all connector classes.
 */
export function buildConnectorsCsvExport(snapshot) {
  const clean = sanitizeConnectorPayload(snapshot || {});
  const header = ['class', 'id', 'name', 'target', 'status', 'latency_ms', 'models_or_tools', 'source_or_config'];
  const rows = [header.join(',')];

  for (const p of clean.providers || []) {
    rows.push([
      'provider',
      p.id,
      p.name,
      `${p.host}:${p.port}`,
      p.online ? 'ONLINE' : (p.status || 'OFFLINE').toUpperCase(),
      p.latencyMs ?? '',
      p.modelsCount ?? '',
      p.baseUrl || '',
    ].map(neutralizeCsvCell).join(','));
  }

  for (const h of clean.harnesses || []) {
    rows.push([
      'harness',
      h.id,
      h.name,
      h.binary,
      h.present ? 'DETECTED' : (h.status || 'MISSING').toUpperCase(),
      '',
      '',
      h.location || h.configPath || '',
    ].map(neutralizeCsvCell).join(','));
  }

  for (const b of clean.bridges || []) {
    rows.push([
      'bridge',
      b.id,
      b.name,
      b.port ? `${b.host}:${b.port}` : 'stdio',
      b.online ? 'ONLINE' : (b.status || 'OFFLINE').toUpperCase(),
      b.latencyMs ?? '',
      '',
      b.transport || '',
    ].map(neutralizeCsvCell).join(','));
  }

  for (const s of clean.mcpServers || []) {
    rows.push([
      'mcp',
      s.id || s.name,
      s.name,
      s.url || s.command || 'stdio',
      'DISCOVERED',
      '',
      s.toolCount ?? '',
      s.source || '',
    ].map(neutralizeCsvCell).join(','));
  }

  return `${rows.join('\n')}\n`;
}
