import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MCP_LENS_VERSION,
  PRESET_SCHEMAS,
  estimateTokens,
  parseJsonRpcFrame,
  minifyToolSchema,
  minifySchemaDocument,
  buildDeterministicReplayFrame,
  formatLiveBridgeFrame,
} from '../src/utils/mcpLensEngine.js';

test('MCP_LENS_VERSION is unified at 2.6.0', () => {
  assert.equal(MCP_LENS_VERSION, '2.6.0');
});

test('estimateTokens returns 0 for empty input and positive integer for JSON', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens(null), 0);
  assert.ok(estimateTokens('hello world') >= 2);
  assert.ok(estimateTokens({ query: 'SELECT * FROM users;', limit: 10 }) >= 10);
});

test('parseJsonRpcFrame classifies valid request, response, and error frames', () => {
  const req = parseJsonRpcFrame('{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"x"}}');
  assert.equal(req.valid, true);
  assert.equal(req.meta.frame_type, 'request');
  assert.equal(req.meta.primary_topic, 'tools/call');
  assert.equal(req.meta.is_valid_rpc, true);

  const err = parseJsonRpcFrame('{"jsonrpc":"2.0","id":8,"error":{"code":-32601,"message":"Not found"}}');
  assert.equal(err.valid, true);
  assert.equal(err.meta.has_error, true);
  assert.equal(err.meta.error_message, 'Not found');
});

test('parseJsonRpcFrame rejects malformed or non-object input cleanly', () => {
  assert.equal(parseJsonRpcFrame('not json').valid, false);
  assert.equal(parseJsonRpcFrame('[1,2,3]').valid, false);
  assert.equal(parseJsonRpcFrame('{broken').valid, false);
});

test('minifyToolSchema reduces bloated tool schema while preserving required fields and types', () => {
  const raw = {
    name: 'db_query',
    description: 'Run read-only SQL query.\nExtra multi-line documentation that bloats prompts.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'The SQL SELECT query string to run against SQLite.',
          examples: ['SELECT * FROM items LIMIT 5;'],
          default: 'SELECT 1;',
        },
      },
      required: ['sql'],
    },
  };
  const out = minifyToolSchema(raw);
  assert.ok(out.minifiedTokens < out.originalTokens);
  assert.ok(out.tokensSaved > 0);
  assert.deepEqual(out.minified.inputSchema.required, ['sql']);
  assert.equal(out.minified.inputSchema.properties.sql.type, 'string');
  assert.equal(out.minified.inputSchema.properties.sql.examples, undefined);
});

test('minifySchemaDocument handles bundled tools presets and achieves positive savings', () => {
  const res = minifySchemaDocument(PRESET_SCHEMAS['standard-tools']);
  assert.ok(res.rawTokens > res.minTokens);
  assert.ok(res.savedPercent > 0);
  assert.equal(res.minifiedObj.tools.length, 2);
});

test('minifySchemaDocument handles ghidra-bridge preset', () => {
  const res = minifySchemaDocument(PRESET_SCHEMAS['ghidra-bridge']);
  assert.equal(res.minifiedObj.tools[0].name, 'decompile_function');
  assert.ok(res.minTokens <= res.rawTokens);
});

test('buildDeterministicReplayFrame produces deterministic IDs and token counts without Math.random', () => {
  const f1 = buildDeterministicReplayFrame({
    sequenceNumber: 5,
    method: 'tools/call',
    params: { name: 'sqlite_query_records', arguments: { query: 'SELECT 1;' } },
  });
  assert.equal(f1.id, 'req-105');
  assert.equal(f1.status, '200 OK');
  assert.ok(f1.tokens > 0);
  assert.equal(f1.durationMs, 1.0);
});

test('formatLiveBridgeFrame maps daemon :8109 frame shape accurately', () => {
  const row = formatLiveBridgeFrame({
    frame_id: 'f_123_1',
    direction: 'inbound',
    timestamp: 1700000000,
    raw_payload: '{"jsonrpc":"2.0","id":1,"method":"ping"}',
    json_data: { jsonrpc: '2.0', id: 1, method: 'ping', params: {} },
    meta: { method: 'ping', primary_topic: 'ping', byte_size: 40, estimated_tokens: 14, has_error: false },
  });
  assert.equal(row.id, 'f_123_1');
  assert.equal(row.direction, 'IN');
  assert.equal(row.method, 'ping');
  assert.equal(row.tokens, 14);
  assert.equal(row.status, '200 OK');
});
