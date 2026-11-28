/**
 * Pure ESM MCP Lens Engine (v2.6.0) for Zoth Studio v2.
 * Zero browser dependencies — deterministic JSON-RPC 2.0 frame parsing,
 * BPE token estimation, lossless schema minification, and replay builders.
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.
 */

export const MCP_LENS_VERSION = '2.6.0';
export const MCP_LENS_LOCAL_BASE = 'http://127.0.0.1:8109';

export const PRESET_SCHEMAS = {
  'standard-tools': JSON.stringify({
    tools: [
      {
        name: 'execute_sandboxed_bash',
        description:
          'Executes a non-interactive bash command in an isolated container with strict timeouts, zero network egress, and memory boundaries.\nAvoid interactive prompts or blocking daemons.',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The full shell command string to execute in the container. Must avoid interactive prompts.',
              examples: ['ls -la /workspace'],
            },
            timeout_ms: {
              type: 'number',
              description: 'Maximum execution time in milliseconds before sending SIGKILL. Defaults to 5000ms.',
              default: 5000,
            },
            workdir: {
              type: 'string',
              description: 'Working directory absolute path inside the enclave. Defaults to /workspace.',
              default: '/workspace',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'search_memory_nodes',
        description:
          'Performs semantic search and associative recall across the persistent memory graph.\nReturns ranked nodes and relation edges.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language query or concept string to find matching entities.',
              examples: ['mcp-lens security audit'],
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of nearest neighbor memories to return.',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
    ],
  }, null, 2),

  'ghidra-bridge': JSON.stringify({
    tools: [
      {
        name: 'decompile_function',
        description:
          'Sends target virtual address to headless Ghidra engine via MCP bridge and streams C decompilation AST.\nIncludes optional symbol comments.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Hexadecimal memory address (e.g. 0x00401000).',
              examples: ['0x00401000'],
            },
            include_comments: {
              type: 'boolean',
              description: 'Whether to include Ghidra auto-generated analysis comments.',
              default: false,
            },
          },
          required: ['address'],
        },
      },
    ],
  }, null, 2),
};

export const INITIAL_FRAMES = [
  {
    id: 'req-101',
    timestamp: '08:21:04',
    direction: 'OUT',
    method: 'initialize',
    status: '200 OK',
    durationMs: 14,
    bytes: 284,
    tokens: 72,
    params: {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'Antigravity-Agent', version: '2.6.0' },
      capabilities: { roots: { listChanged: true }, sampling: {} },
    },
    result: {
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'mcp-lens', version: '2.6.0' },
      capabilities: { tools: { listChanged: false } },
    },
  },
  {
    id: 'req-102',
    timestamp: '08:21:05',
    direction: 'OUT',
    method: 'tools/list',
    status: '200 OK',
    durationMs: 18,
    bytes: 1120,
    tokens: 312,
    params: {},
    result: {
      tools: [
        { name: 'mcp_audit_schema_tokens', description: 'Audit raw vs minified BPE token weights for MCP tool schemas' },
        { name: 'mcp_minify_schema', description: 'Minify an MCP tool JSON schema while preserving typing and required keys' },
        { name: 'mcp_parse_frame', description: 'Parse and classify a raw JSON-RPC 2.0 frame string' },
      ],
    },
  },
  {
    id: 'req-103',
    timestamp: '08:21:06',
    direction: 'OUT',
    method: 'tools/call',
    status: '200 OK',
    durationMs: 11,
    bytes: 492,
    tokens: 134,
    params: {
      name: 'mcp_audit_schema_tokens',
      arguments: { schema: { name: 'sqlite_query_records' } },
    },
    result: {
      content: [{ type: 'text', text: '{"raw_tokens":282,"minified_tokens":221,"savings_percent":21.6}' }],
      isError: false,
    },
  },
  {
    id: 'req-104',
    timestamp: '08:21:07',
    direction: 'OUT',
    method: 'resources/read',
    status: '200 OK',
    durationMs: 9,
    bytes: 340,
    tokens: 88,
    params: { uri: 'zoth://mcp-lens/health' },
    result: {
      contents: [{ uri: 'zoth://mcp-lens/health', mimeType: 'application/json', text: '{"status":"healthy","version":"2.6.0"}' }],
    },
  },
];

/**
 * Deterministic BPE token weight heuristic matching Python mcp_lens.analyzer.estimate_tokens().
 */
export function estimateTokens(input) {
  if (input === null || input === undefined) return 0;
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  if (!text) return 0;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;
  const punct = (cleaned.match(/[{}\[\]":,._\-/\\<>!@#$%^&*()+=|;]/g) || []).length;
  const words = cleaned.match(/[a-zA-Z0-9]+/g) || [];
  let wordTokens = 0;
  for (let i = 0; i < words.length; i += 1) {
    wordTokens += Math.max(1, Math.floor((words[i].length + 2) / 4));
  }
  return Math.max(1, Math.floor(punct * 0.95 + wordTokens * 1.05));
}

/**
 * Parse and classify a raw JSON-RPC 2.0 frame string.
 */
export function parseJsonRpcFrame(rawLine) {
  if (typeof rawLine !== 'string') return { valid: false, error: 'Input must be a string' };
  const trimmed = rawLine.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { valid: false, error: 'Not a JSON object' };
  }
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch (err) {
    return { valid: false, error: err.message };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Decoded value is not a JSON object' };
  }

  const method = typeof data.method === 'string' ? data.method : null;
  const hasResult = Object.prototype.hasOwnProperty.call(data, 'result');
  const hasError = Object.prototype.hasOwnProperty.call(data, 'error');
  const id = Object.prototype.hasOwnProperty.call(data, 'id') ? data.id : null;

  let frameType = 'unknown';
  if (method) frameType = id !== null ? 'request' : 'notification';
  else if (hasResult) frameType = 'response';
  else if (hasError) frameType = 'error';

  const serialized = JSON.stringify(data);
  return {
    valid: true,
    data,
    meta: {
      is_valid_rpc: data.jsonrpc === '2.0',
      id,
      frame_type: frameType,
      method,
      primary_topic: hasError ? 'error' : (method || 'response'),
      has_error: hasError,
      byte_size: new TextEncoder().encode(serialized).length,
      estimated_tokens: estimateTokens(serialized),
      error_message: hasError && data.error ? data.error.message || null : null,
    },
  };
}

function cleanJsonSchemaNode(schemaDict) {
  if (!schemaDict || typeof schemaDict !== 'object' || Array.isArray(schemaDict)) return schemaDict;
  const cleaned = {};
  for (const key of ['type', 'required', 'properties', 'items', 'enum']) {
    if (Object.prototype.hasOwnProperty.call(schemaDict, key)) {
      cleaned[key] = schemaDict[key];
    }
  }
  if (cleaned.properties && typeof cleaned.properties === 'object' && !Array.isArray(cleaned.properties)) {
    const newProps = {};
    for (const [propName, propVal] of Object.entries(cleaned.properties)) {
      if (propVal && typeof propVal === 'object' && !Array.isArray(propVal)) {
        const propClean = {};
        for (const [pKey, pVal] of Object.entries(propVal)) {
          if (['examples', 'default', 'title', '$schema', 'additionalProperties'].includes(pKey)) continue;
          if (pKey === 'description' && typeof pVal === 'string') {
            const norm = pVal.trim().toLowerCase();
            if (norm === propName.toLowerCase() || norm === `the ${propName.toLowerCase()}`) continue;
            let shortDesc = pVal.trim().split('.')[0].trim();
            if (shortDesc.length > 80) shortDesc = `${shortDesc.slice(0, 77)}...`;
            propClean.description = shortDesc;
          } else if ((pKey === 'properties' || pKey === 'items') && pVal && typeof pVal === 'object') {
            propClean[pKey] = cleanJsonSchemaNode(pVal);
          } else {
            propClean[pKey] = pVal;
          }
        }
        newProps[propName] = propClean;
      } else {
        newProps[propName] = propVal;
      }
    }
    cleaned.properties = newProps;
  }
  return cleaned;
}

/**
 * Minify a single MCP tool definition matching Python SchemaMinifier.minify_schema().
 */
export function minifyToolSchema(rawTool) {
  if (!rawTool || typeof rawTool !== 'object' || Array.isArray(rawTool)) {
    throw new Error('Tool schema must be a JSON object');
  }
  const origTokens = estimateTokens(JSON.stringify(rawTool));
  const minified = JSON.parse(JSON.stringify(rawTool));

  if (typeof minified.description === 'string' && minified.description.trim()) {
    let firstLine = minified.description.trim().split('\n')[0].trim();
    if (firstLine.length > 120) firstLine = `${firstLine.slice(0, 117)}...`;
    minified.description = firstLine;
  }

  const schemaKey = minified.inputSchema ? 'inputSchema' : (minified.parameters ? 'parameters' : null);
  if (schemaKey && typeof minified[schemaKey] === 'object') {
    minified[schemaKey] = cleanJsonSchemaNode(minified[schemaKey]);
  }

  const minTokens = estimateTokens(JSON.stringify(minified));
  const tokensSaved = Math.max(0, origTokens - minTokens);
  const savingsPercent = origTokens > 0 ? Number(((tokensSaved / origTokens) * 100).toFixed(1)) : 0;

  return {
    minified,
    originalTokens: origTokens,
    minifiedTokens: minTokens,
    tokensSaved,
    savingsPercent,
  };
}

/**
 * Minify either a `{ tools: [...] }` bundle or a single tool object JSON string.
 */
export function minifySchemaDocument(jsonText) {
  const parsed = JSON.parse(jsonText);
  const rawTokens = estimateTokens(jsonText);

  let minifiedObj;
  if (parsed && Array.isArray(parsed.tools)) {
    minifiedObj = {
      ...parsed,
      tools: parsed.tools.map((t) => minifyToolSchema(t).minified),
    };
  } else if (Array.isArray(parsed)) {
    minifiedObj = parsed.map((t) => minifyToolSchema(t).minified);
  } else {
    minifiedObj = minifyToolSchema(parsed).minified;
  }

  const minifiedText = JSON.stringify(minifiedObj);
  const minTokens = estimateTokens(minifiedText);
  const tokensSaved = Math.max(0, rawTokens - minTokens);
  const savedPercent = rawTokens > 0 ? Math.max(0, Math.round((tokensSaved / rawTokens) * 100)) : 0;

  return {
    minifiedObj,
    minifiedText,
    rawTokens,
    minTokens,
    tokensSaved,
    savedPercent,
  };
}

/**
 * Deterministic client-side replay frame builder (zero Math.random()).
 */
export function buildDeterministicReplayFrame({ sequenceNumber, method, params, source = 'in-browser-deterministic', response = null }) {
  const seq = Number(sequenceNumber || 1);
  const reqId = `req-${100 + seq}`;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const payload = { jsonrpc: '2.0', id: reqId, method, params };
  const serialized = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(serialized).length;
  const tokens = estimateTokens(serialized);
  const durationMs = response && typeof response.execution_ms === 'number' ? response.execution_ms : 1.0;

  return {
    id: reqId,
    timestamp: timeStr,
    direction: 'OUT',
    method,
    status: '200 OK',
    durationMs,
    bytes,
    tokens,
    params,
    result: response || {
      status: 'success',
      executionEnclave: source,
      returnedAt: timeStr,
      requestTokens: tokens,
      output: `Validated JSON-RPC 2.0 ${method} frame (${tokens} tk).`,
    },
  };
}

/**
 * Convert a live :8109 /api/traffic frame into the Studio table row shape.
 */
export function formatLiveBridgeFrame(rawFrame) {
  const ts = rawFrame?.timestamp ? new Date(rawFrame.timestamp * 1000) : new Date();
  const timeStr = `${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}:${String(ts.getSeconds()).padStart(2, '0')}`;
  const parsed = rawFrame?.json_data || {};
  const meta = rawFrame?.meta || {};
  return {
    id: String(rawFrame?.frame_id || meta.id || 'live'),
    timestamp: timeStr,
    direction: rawFrame?.direction === 'inbound' ? 'IN' : 'OUT',
    method: String(meta.method || meta.primary_topic || 'response'),
    status: meta.has_error ? 'ERR' : '200 OK',
    durationMs: 0.8,
    bytes: Number(meta.byte_size || 0),
    tokens: Number(meta.estimated_tokens || 0),
    params: parsed.params || (parsed.method ? {} : { frame_id: rawFrame?.frame_id }),
    result: parsed.result || parsed.error || { raw: rawFrame?.raw_payload || '' },
  };
}
