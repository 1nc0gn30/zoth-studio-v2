/**
 * Zoth Edge Forge & Micro-Kernel Sandbox — Pure Zero-Dependency Engine (v2.3.0)
 *
 * Mirrored byte-identically between:
 *   - src/utils/edgeForgeEngine.js (Browser / Vite bundle)
 *   - server/edge-forge-engine.mjs (Node loopback Studio API)
 *
 * Invariants:
 *   - Zero external dependencies
 *   - Zero Math.random() / zero setTimeout()
 *   - Real WebAssembly 1.0 binary assembler, section parser, and live executor
 *   - Deterministic FIPS 180-4 SHA-256 artifact & response receipts
 *   - Automatic /home/<user> path redaction to ~/ and CSV formula neutralization
 */

export const EDGE_FORGE_VERSION = '2.3.0';

/* ============================================================================
   1. Home-Path Redaction & CSV Formula Neutralization
   ============================================================================ */

export function redactHomePaths(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/file:\/\/\/home\/[a-zA-Z0-9._-]+(?=\/|$)/g, 'file://~')
    .replace(/\/home\/[a-zA-Z0-9._-]+(?=\/|$)/g, '~')
    .replace(/\/Users\/[a-zA-Z0-9._-]+(?=\/|$)/g, '~')
    .replace(/[A-Za-z]:\\Users\\[a-zA-Z0-9._-]+(?=\\|$)/g, '~');
}

export function redactPayload(value) {
  if (typeof value === 'string') return redactHomePaths(value);
  if (Array.isArray(value)) return value.map((item) => redactPayload(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactPayload(v);
    }
    return out;
  }
  return value;
}

export function neutralizeCsvCell(value) {
  const cleaned = redactHomePaths(String(value ?? ''));
  const formulaSafe = /^[=+\-@\t\r]/.test(cleaned) ? `'${cleaned}` : cleaned;
  if (/[",\n\r]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return formulaSafe;
}

/* ============================================================================
   2. Synchronous Pure-JS FIPS 180-4 SHA-256 (String or Uint8Array)
   ============================================================================ */

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function toUint8Array(input) {
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return new TextEncoder().encode(String(input ?? ''));
}

export function sha256Hex(input) {
  const bytes = toUint8Array(input);
  const len = bytes.length;
  const bitLenHi = Math.floor((len * 8) / 0x100000000);
  const bitLenLo = (len * 8) >>> 0;

  const padLen = ((len + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 8, bitLenHi, false);
  dv.setUint32(padLen - 4, bitLenLo, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = dv.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

/* ============================================================================
   3. Base64 & LEB128 Binary Encoding Helpers
   ============================================================================ */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes) {
  const u8 = toUint8Array(bytes);
  let out = '';
  for (let i = 0; i < u8.length; i += 3) {
    const b0 = u8[i];
    const b1 = i + 1 < u8.length ? u8[i + 1] : 0;
    const b2 = i + 2 < u8.length ? u8[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;
    out += BASE64_CHARS[(triplet >> 18) & 0x3f];
    out += BASE64_CHARS[(triplet >> 12) & 0x3f];
    out += i + 1 < u8.length ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    out += i + 2 < u8.length ? BASE64_CHARS[triplet & 0x3f] : '=';
  }
  return out;
}

export function base64ToBytes(b64) {
  const clean = String(b64 || '').replace(/[^A-Za-z0-9+/=]/g, '');
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = BASE64_CHARS.indexOf(clean[i]);
    const c1 = BASE64_CHARS.indexOf(clean[i + 1]);
    const c2 = clean[i + 2] === '=' ? -1 : BASE64_CHARS.indexOf(clean[i + 2]);
    const c3 = clean[i + 3] === '=' ? -1 : BASE64_CHARS.indexOf(clean[i + 3]);
    if (c0 < 0 || c1 < 0) break;
    out.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) out.push(((c1 & 0x0f) << 4) | (c2 >> 2));
    if (c3 >= 0) out.push(((c2 & 0x03) << 6) | c3);
  }
  return new Uint8Array(out);
}

export function bytesToHexPreview(bytes, maxBytes = 96) {
  const u8 = toUint8Array(bytes);
  const slice = u8.slice(0, maxBytes);
  const lines = [];
  for (let i = 0; i < slice.length; i += 16) {
    const offsetHex = i.toString(16).padStart(4, '0');
    const row = Array.from(slice.slice(i, i + 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    lines.push(`${offsetHex}: ${row}`);
  }
  if (u8.length > maxBytes) {
    lines.push(`... (+${u8.length - maxBytes} more bytes)`);
  }
  return lines.join('\n');
}

export function encodeULEB128(value) {
  let v = Number(value) >>> 0;
  const out = [];
  do {
    let byte = v & 0x7f;
    v >>>= 7;
    if (v !== 0) byte |= 0x80;
    out.push(byte);
  } while (v !== 0);
  return out;
}

export function encodeSLEB128(value) {
  let v = Math.trunc(Number(value) || 0);
  const out = [];
  let more = true;
  while (more) {
    let byte = v & 0x7f;
    v >>= 7;
    const signBit = (byte & 0x40) !== 0;
    if ((v === 0 && !signBit) || (v === -1 && signBit)) {
      more = false;
    } else {
      byte |= 0x80;
    }
    out.push(byte);
  }
  return out;
}

export function decodeULEB128(bytes, startOffset = 0) {
  let result = 0;
  let shift = 0;
  let offset = startOffset;
  while (offset < bytes.length) {
    const byte = bytes[offset];
    offset += 1;
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      return { value: result >>> 0, nextOffset: offset };
    }
    shift += 7;
    if (shift > 35) break;
  }
  return { value: 0, nextOffset: offset };
}

function encodeStringBytes(str) {
  const raw = new TextEncoder().encode(str);
  return [...encodeULEB128(raw.length), ...raw];
}

function makeWasmSection(sectionId, payload) {
  return [sectionId, ...encodeULEB128(payload.length), ...payload];
}

/* ============================================================================
   4. Real WebAssembly 1.0 Binary Assembler, Inspector & Live Executor
   ============================================================================ */

export const WASM_SECTION_NAMES = {
  0: 'Custom',
  1: 'Type',
  2: 'Import',
  3: 'Function',
  4: 'Table',
  5: 'Memory',
  6: 'Global',
  7: 'Export',
  8: 'Start',
  9: 'Element',
  10: 'Code',
  11: 'Data',
  12: 'DataCount',
};

export const WASM_KERNEL_PRESETS = [
  {
    id: 'add_i32',
    label: 'add_i32(a, b)',
    exportName: 'add_i32',
    paramNames: ['a', 'b'],
    defaultArgs: [17, 25],
    signature: '(param $a i32) (param $b i32) (result i32)',
    summary: 'Deterministic 32-bit integer addition kernel compiled directly into WebAssembly 1.0 bytecode.',
    wat: `(module
  (func (export "add_i32") (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add)
)`,
  },
  {
    id: 'fib_i32',
    label: 'fib_i32(n)',
    exportName: 'fib_i32',
    paramNames: ['n'],
    defaultArgs: [10],
    signature: '(param $n i32) (result i32)',
    summary: 'Iterative O(n) Fibonacci micro-kernel using structured WASM block/loop control flow and local registers.',
    wat: `(module
  (func (export "fib_i32") (param $n i32) (result i32)
    (local $a i32) (local $b i32) (local $i i32) (local $tmp i32)
    i32.const 0
    local.set $a
    i32.const 1
    local.set $b
    i32.const 0
    local.set $i
    (block $done
      (loop $step
        local.get $i
        local.get $n
        i32.ge_s
        br_if $done
        local.get $a
        local.get $b
        i32.add
        local.set $tmp
        local.get $b
        local.set $a
        local.get $tmp
        local.set $b
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $step
      )
    )
    local.get $a)
)`,
  },
  {
    id: 'checksum_xor',
    label: 'checksum_xor(a, b)',
    exportName: 'checksum_xor',
    paramNames: ['a', 'b'],
    defaultArgs: [1337, 4096],
    signature: '(param $a i32) (param $b i32) (result i32)',
    summary: 'Deterministic Knuth-multiplier XOR edge packet mixer for zero-dependency request fingerprinting.',
    wat: `(module
  (func (export "checksum_xor") (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.xor
    i32.const -1640531535
    i32.mul
    local.get $a
    i32.const 3
    i32.shr_u
    i32.xor)
)`,
  },
  {
    id: 'clamped_scale',
    label: 'clamped_scale(x, factor)',
    exportName: 'clamped_scale',
    paramNames: ['x', 'factor'],
    defaultArgs: [40, 3],
    signature: '(param $x i32) (param $factor i32) (result i32)',
    summary: 'Branchless saturating scaler clamping (x * factor) into [0, 1000] via WASM select instructions.',
    wat: `(module
  (func (export "clamped_scale") (param $x i32) (param $factor i32) (result i32)
    (local $prod i32)
    local.get $x
    local.get $factor
    i32.mul
    local.set $prod
    local.get $prod
    i32.const 0
    local.get $prod
    i32.const 0
    i32.gt_s
    select
    local.set $prod
    i32.const 1000
    local.get $prod
    local.get $prod
    i32.const 1000
    i32.gt_s
    select)
)`,
  },
];

export function assembleWasmPreset(presetId = 'add_i32', params = {}) {
  const preset = WASM_KERNEL_PRESETS.find((p) => p.id === presetId) || WASM_KERNEL_PRESETS[0];
  const exportName = preset.exportName;
  const maxClamp = Number.isFinite(Number(params.maxClamp))
    ? Math.max(1, Math.min(1000000, Math.trunc(Number(params.maxClamp))))
    : 1000;

  let paramTypes;
  let localDecls;
  let bodyOpcodes;

  if (preset.id === 'fib_i32') {
    paramTypes = [0x7f]; // (i32) -> (i32)
    localDecls = [0x01, 0x04, 0x7f]; // 4 extra i32 locals: a(1), b(2), i(3), tmp(4)
    bodyOpcodes = [
      0x41, 0x00, 0x21, 0x01, // i32.const 0; local.set 1
      0x41, 0x01, 0x21, 0x02, // i32.const 1; local.set 2
      0x41, 0x00, 0x21, 0x03, // i32.const 0; local.set 3
      0x02, 0x40, // block (void)
      0x03, 0x40, // loop (void)
      0x20, 0x03, 0x20, 0x00, 0x4e, 0x0d, 0x01, // local.get 3; local.get 0; i32.ge_s; br_if 1
      0x20, 0x01, 0x20, 0x02, 0x6a, 0x21, 0x04, // local.get 1; local.get 2; i32.add; local.set 4
      0x20, 0x02, 0x21, 0x01, // local.get 2; local.set 1
      0x20, 0x04, 0x21, 0x02, // local.get 4; local.set 2
      0x20, 0x03, 0x41, 0x01, 0x6a, 0x21, 0x03, // local.get 3; i32.const 1; i32.add; local.set 3
      0x0c, 0x00, // br 0
      0x0b, // end loop
      0x0b, // end block
      0x20, 0x01, // local.get 1
      0x0b, // end func
    ];
  } else if (preset.id === 'checksum_xor') {
    paramTypes = [0x7f, 0x7f]; // (i32, i32) -> (i32)
    localDecls = [0x00];
    bodyOpcodes = [
      0x20, 0x00, // local.get 0
      0x20, 0x01, // local.get 1
      0x73, // i32.xor
      0x41, ...encodeSLEB128(-1640531535), // i32.const 0x9e3779b1 (signed)
      0x6c, // i32.mul
      0x20, 0x00, // local.get 0
      0x41, 0x03, // i32.const 3
      0x76, // i32.shr_u
      0x73, // i32.xor
      0x0b, // end
    ];
  } else if (preset.id === 'clamped_scale') {
    paramTypes = [0x7f, 0x7f]; // (i32, i32) -> (i32)
    localDecls = [0x01, 0x01, 0x7f]; // 1 extra i32 local: prod(2)
    const maxEncoded = encodeSLEB128(maxClamp);
    bodyOpcodes = [
      0x20, 0x00, 0x20, 0x01, 0x6c, 0x21, 0x02, // prod = x * factor
      0x20, 0x02, 0x41, 0x00, 0x20, 0x02, 0x41, 0x00, 0x4a, 0x1b, 0x21, 0x02, // prod = prod > 0 ? prod : 0
      0x41, ...maxEncoded, 0x20, 0x02, 0x20, 0x02, 0x41, ...maxEncoded, 0x4a, 0x1b, // prod > max ? max : prod
      0x0b, // end
    ];
  } else {
    paramTypes = [0x7f, 0x7f]; // (i32, i32) -> (i32)
    localDecls = [0x00];
    bodyOpcodes = [
      0x20, 0x00, // local.get 0
      0x20, 0x01, // local.get 1
      0x6a, // i32.add
      0x0b, // end
    ];
  }

  // Section 1: Type (1 func type)
  const typeSection = makeWasmSection(1, [
    0x01, // 1 type
    0x60, // func
    ...encodeULEB128(paramTypes.length),
    ...paramTypes,
    0x01, // 1 result
    0x7f, // i32
  ]);

  // Section 3: Function (1 func using type index 0)
  const funcSection = makeWasmSection(3, [0x01, 0x00]);

  // Section 7: Export (1 func export -> index 0)
  const exportSection = makeWasmSection(7, [
    0x01,
    ...encodeStringBytes(exportName),
    0x00, // kind: func
    0x00, // func index 0
  ]);

  // Section 10: Code (1 body)
  const funcBody = [...localDecls, ...bodyOpcodes];
  const codeSection = makeWasmSection(10, [
    0x01,
    ...encodeULEB128(funcBody.length),
    ...funcBody,
  ]);

  const bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // \0asm magic
    0x01, 0x00, 0x00, 0x00, // WASM version 1
    ...typeSection,
    ...funcSection,
    ...exportSection,
    ...codeSection,
  ]);

  const inspection = inspectWasmBinary(bytes);

  return {
    presetId: preset.id,
    label: preset.label,
    exportName,
    paramNames: preset.paramNames,
    defaultArgs: preset.defaultArgs,
    signature: preset.signature,
    summary: preset.summary,
    wat: preset.wat,
    bytes,
    base64: inspection.base64,
    hexPreview: inspection.hexPreview,
    sha256: inspection.sha256,
    byteLength: bytes.length,
    inspection,
  };
}

export function inspectWasmBinary(inputBytes) {
  const bytes = toUint8Array(inputBytes);
  const sha256 = sha256Hex(bytes);
  const base64 = bytesToBase64(bytes);
  const hexPreview = bytesToHexPreview(bytes);

  if (bytes.length < 8) {
    return {
      validMagic: false,
      magicHex: '',
      version: null,
      byteLength: bytes.length,
      sha256,
      base64,
      hexPreview,
      sections: [],
      exports: [],
      error: 'Binary shorter than 8-byte WebAssembly header.',
    };
  }

  const validMagic =
    bytes[0] === 0x00 &&
    bytes[1] === 0x61 &&
    bytes[2] === 0x73 &&
    bytes[3] === 0x6d;

  const magicHex = Array.from(bytes.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  const version =
    bytes[4] |
    (bytes[5] << 8) |
    (bytes[6] << 16) |
    (bytes[7] << 24);

  const sections = [];
  const exports = [];
  let offset = 8;

  if (validMagic) {
    while (offset < bytes.length) {
      const sectionStart = offset;
      const id = bytes[offset];
      offset += 1;
      const { value: payloadSize, nextOffset } = decodeULEB128(bytes, offset);
      const payloadOffset = nextOffset;
      const sectionEnd = Math.min(bytes.length, payloadOffset + payloadSize);

      sections.push({
        id,
        name: WASM_SECTION_NAMES[id] || `Section(${id})`,
        offset: sectionStart,
        payloadOffset,
        payloadSize,
        totalBytes: sectionEnd - sectionStart,
      });

      // Parse Export section (id 7) symbol names and kinds
      if (id === 7 && payloadOffset < sectionEnd) {
        const kindMap = { 0: 'func', 1: 'table', 2: 'memory', 3: 'global' };
        let cur = payloadOffset;
        const countRes = decodeULEB128(bytes, cur);
        cur = countRes.nextOffset;
        for (let i = 0; i < countRes.value && cur < sectionEnd; i += 1) {
          const nameLenRes = decodeULEB128(bytes, cur);
          cur = nameLenRes.nextOffset;
          const nameBytes = bytes.slice(cur, Math.min(sectionEnd, cur + nameLenRes.value));
          cur += nameLenRes.value;
          const name = new TextDecoder().decode(nameBytes);
          const kind = kindMap[bytes[cur]] || 'unknown';
          cur += 1;
          const idxRes = decodeULEB128(bytes, cur);
          cur = idxRes.nextOffset;
          exports.push({ name, kind, index: idxRes.value });
        }
      }

      if (sectionEnd <= sectionStart) break;
      offset = sectionEnd;
    }
  }

  return {
    validMagic,
    magicHex,
    version,
    byteLength: bytes.length,
    sha256,
    base64,
    hexPreview,
    sections,
    exports,
    error: validMagic ? null : 'Invalid WebAssembly magic header (expected 00 61 73 6d).',
  };
}

export async function executeWasmModule(inputBytes, exportName = null, rawArgs = []) {
  const bytes = toUint8Array(inputBytes);
  const args = (Array.isArray(rawArgs) ? rawArgs : []).map((n) => Math.trunc(Number(n) || 0));

  if (typeof WebAssembly === 'undefined') {
    return {
      ok: false,
      valid: false,
      error: 'WebAssembly runtime unavailable in current environment.',
    };
  }

  const valid = WebAssembly.validate(bytes);
  if (!valid) {
    return {
      ok: false,
      valid: false,
      error: 'WebAssembly.validate() rejected module binary.',
    };
  }

  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const exportKeys = Object.keys(instance.exports || {});
  const targetExport =
    exportName && typeof instance.exports[exportName] === 'function'
      ? exportName
      : exportKeys.find((k) => typeof instance.exports[k] === 'function');

  if (!targetExport) {
    return {
      ok: false,
      valid: true,
      exports: exportKeys,
      error: 'WASM module validated cleanly but exposes no callable function export.',
    };
  }

  const tExecStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const result = instance.exports[targetExport](...args);
  const tExecEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const instantiateUs = Math.max(1, Math.round((tExecStart - t0) * 1000));
  const execUs = Math.max(1, Math.round((tExecEnd - tExecStart) * 1000));

  return {
    ok: true,
    valid: true,
    exportName: targetExport,
    args,
    result,
    instantiateUs,
    execUs,
    exports: exportKeys,
    sha256: sha256Hex(bytes),
  };
}

/* ============================================================================
   5. Multi-Target Edge Worker, Container & Micro-Kernel Synthesizer
   ============================================================================ */

export const EDGE_TARGETS = [
  {
    id: 'netlify-edge',
    name: 'Netlify Edge (Deno)',
    category: 'Edge Runtime',
    filename: 'netlify/edge-functions/sovereign-edge.ts',
    configFilename: 'netlify.toml',
    baseArtifactKb: 18,
    baseColdStartMs: 14,
    baseWarmExecMs: 1.8,
    isolation: 'V8 / Deno Isolate (Zero Node fs)',
    summary: 'Zero-dependency Deno Edge Function with security headers and deterministic SHA-256 response tagging.',
  },
  {
    id: 'cloudflare-worker',
    name: 'Cloudflare Worker',
    category: 'Edge Runtime',
    filename: 'src/worker.js',
    configFilename: 'wrangler.toml',
    baseArtifactKb: 12,
    baseColdStartMs: 5,
    baseWarmExecMs: 1.1,
    isolation: 'V8 Isolate (0ms-class sub-isolate)',
    summary: 'ES Module Worker with strict method guard, loopback-only CORS, and wrangler.toml route bindings.',
  },
  {
    id: 'wasi-enclave',
    name: 'WASI Micro-Enclave',
    category: 'WASM / WASI',
    filename: 'src/enclave_main.rs',
    configFilename: 'wasi-capabilities.json',
    baseArtifactKb: 44,
    baseColdStartMs: 8,
    baseWarmExecMs: 0.7,
    isolation: 'WASI Capability Sandbox (wasm32-wasip1)',
    summary: 'Rust wasm32-wasip1 micro-enclave paired with a deny-by-default WASI capability manifest.',
  },
  {
    id: 'oci-scratch',
    name: 'OCI Scratch Container',
    category: 'Container',
    filename: 'Dockerfile',
    configFilename: 'seccomp-zero-egress.json',
    baseArtifactKb: 1850,
    baseColdStartMs: 145,
    baseWarmExecMs: 2.4,
    isolation: 'FROM scratch + Read-Only RootFS + Seccomp',
    summary: 'Multi-stage static musl Dockerfile dropping all Linux capabilities with zero-egress seccomp policy.',
  },
  {
    id: 'kvm-microkernel',
    name: 'QEMU/KVM Micro-Kernel',
    category: 'Bare-Metal VM',
    filename: 'kvm-microvm-launch.sh',
    configFilename: 'microvm-manifest.json',
    baseArtifactKb: 9600,
    baseColdStartMs: 420,
    baseWarmExecMs: 3.1,
    isolation: 'Hardware KVM + -net none + Read-Only SquashFS',
    summary: 'Air-gapped QEMU/KVM micro-VM profile binding -net none, readonly squashfs, and strict memory ceiling.',
  },
];

function sanitizeSlug(raw, fallback = 'zoth-edge-kernel') {
  const cleaned = String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return cleaned || fallback;
}

function sanitizeRoutePath(raw, fallback = '/api/edge/health') {
  const cleaned = String(raw || '').trim();
  if (!cleaned || !cleaned.startsWith('/')) return fallback;
  return cleaned.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 80) || fallback;
}

export function synthesizeEdgeTarget(targetId = 'netlify-edge', rawConfig = {}) {
  const meta = EDGE_TARGETS.find((t) => t.id === targetId) || EDGE_TARGETS[0];
  const serviceName = sanitizeSlug(rawConfig.serviceName, 'zoth-edge-kernel');
  const routePath = sanitizeRoutePath(rawConfig.routePath, '/api/edge/telemetry');
  const memoryMb = Math.max(16, Math.min(4096, Math.trunc(Number(rawConfig.memoryMb) || 128)));
  const zeroEgress = rawConfig.zeroEgress !== false;
  const readOnlyRootfs = rawConfig.readOnlyRootfs !== false;
  const wasmPresetId = rawConfig.wasmPresetId || 'add_i32';
  const wasmArtifact = assembleWasmPreset(wasmPresetId);

  let sourceCode = '';
  let configCode = '';

  if (meta.id === 'netlify-edge') {
    sourceCode = `// ${meta.filename} — Synthesized by Zoth Edge Forge v${EDGE_FORGE_VERSION}
// Service: ${serviceName} | Route: ${routePath} | Zero-Egress: ${zeroEgress}

export default async function handler(request: Request, context: { geo?: { city?: string; country?: { name?: string } } }) {
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const payload = {
    service: '${serviceName}',
    route: url.pathname,
    runtime: 'Netlify Edge (Deno)',
    zeroEgress: ${zeroEgress},
    wasmKernel: '${wasmArtifact.exportName}',
    wasmSha256: '${wasmArtifact.sha256}',
    edgePop: context?.geo?.city || 'local-enclave',
  };

  return new Response(request.method === 'HEAD' ? null : JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'cache-control': 'no-store',
    },
  });
}

export const config = { path: '${routePath}' };
`;
    configCode = `# ${meta.configFilename} — Zoth Edge Forge Route Binding
[build]
  publish = "dist"

[[edge_functions]]
  path = "${routePath}"
  function = "${serviceName}"

[[headers]]
  for = "${routePath}"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;
  } else if (meta.id === 'cloudflare-worker') {
    sourceCode = `// ${meta.filename} — Synthesized by Zoth Edge Forge v${EDGE_FORGE_VERSION}
// Service: ${serviceName} | Route: ${routePath} | Zero-Egress: ${zeroEgress}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '${routePath}') {
      return new Response(JSON.stringify({ error: 'Route not matched', path: url.pathname }), {
        status: 404,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }
    const body = {
      service: '${serviceName}',
      runtime: 'Cloudflare Module Worker',
      zeroEgress: ${zeroEgress},
      wasmKernel: '${wasmArtifact.exportName}',
      wasmSha256: '${wasmArtifact.sha256}',
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'SAMEORIGIN',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    });
  },
};
`;
    configCode = `# ${meta.configFilename} — Zoth Edge Forge Worker Manifest
name = "${serviceName}"
main = "${meta.filename}"
compatibility_date = "2026-10-01"
workers_dev = false

[vars]
ZERO_EGRESS = "${zeroEgress}"
WASM_KERNEL = "${wasmArtifact.exportName}"
`;
  } else if (meta.id === 'wasi-enclave') {
    sourceCode = `// ${meta.filename} — Rust wasm32-wasip1 Micro-Enclave (Zoth Edge Forge v${EDGE_FORGE_VERSION})
// Build: rustc --target wasm32-wasip1 -O ${meta.filename} -o ${serviceName}.wasm

#![no_std]

#[no_mangle]
pub extern "C" fn add_i32(a: i32, b: i32) -> i32 {
    a.wrapping_add(b)
}

#[no_mangle]
pub extern "C" fn fib_i32(n: i32) -> i32 {
    let (mut a, mut b) = (0i32, 1i32);
    let mut i = 0i32;
    while i < n {
        let next = a.wrapping_add(b);
        a = b;
        b = next;
        i += 1;
    }
    a
}

#[no_mangle]
pub extern "C" fn checksum_xor(a: i32, b: i32) -> i32 {
    let mixed = (a ^ b).wrapping_mul(-1640531535i32);
    mixed ^ ((a as u32) >> 3) as i32
}
`;
    configCode = JSON.stringify(
      {
        schemaVersion: EDGE_FORGE_VERSION,
        service: serviceName,
        target: 'wasm32-wasip1',
        wasmKernel: wasmArtifact.exportName,
        wasmSha256: wasmArtifact.sha256,
        memoryLimitMiB: memoryMb,
        capabilities: {
          networkSockets: !zeroEgress,
          filesystemWrite: !readOnlyRootfs,
          preopenedDirs: readOnlyRootfs ? [] : ['/sandbox/tmp:ro'],
          envAllowlist: ['EDGE_SERVICE_ID'],
          deterministicClock: true,
        },
      },
      null,
      2
    );
  } else if (meta.id === 'oci-scratch') {
    sourceCode = `# ${meta.filename} — Multi-Stage Zero-Egress Scratch Container (Zoth Edge Forge v${EDGE_FORGE_VERSION})
FROM rust:1.82-alpine AS builder
RUN apk add --no-cache musl-dev
WORKDIR /build
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl \\
    && strip target/x86_64-unknown-linux-musl/release/${serviceName}

FROM scratch
LABEL org.opencontainers.image.title="${serviceName}"
LABEL org.zoth.edge.wasm_sha256="${wasmArtifact.sha256}"
LABEL org.zoth.edge.zero_egress="${zeroEgress}"
COPY --from=builder /build/target/x86_64-unknown-linux-musl/release/${serviceName} /${serviceName}
USER 65532:65532
ENTRYPOINT ["/${serviceName}", "--bind", "127.0.0.1:8080"]
`;
    configCode = JSON.stringify(
      {
        schemaVersion: EDGE_FORGE_VERSION,
        service: serviceName,
        defaultAction: 'SCMP_ACT_ERRNO',
        architectures: ['SCMP_ARCH_X86_64'],
        readOnlyRootfs,
        zeroEgress,
        dropCapabilities: ['ALL'],
        memoryLimitMiB: memoryMb,
        allowedSyscalls: [
          'read',
          'write',
          'close',
          'fstat',
          'mmap',
          'mprotect',
          'munmap',
          'brk',
          'rt_sigaction',
          'rt_sigprocmask',
          'clock_gettime',
          'exit',
          'exit_group',
          ...(zeroEgress ? [] : ['socket', 'connect']),
        ],
      },
      null,
      2
    );
  } else {
    sourceCode = `#!/usr/bin/env bash
# ${meta.filename} — Air-Gapped QEMU/KVM Micro-Kernel Launcher (Zoth Edge Forge v${EDGE_FORGE_VERSION})
set -euo pipefail

KERNEL_IMG="\${1:-./vmlinuz-edge}"
ROOTFS_SQFS="\${2:-./${serviceName}.squashfs}"

exec qemu-system-x86_64 \\
  -enable-kvm \\
  -cpu host \\
  -smp 2 \\
  -m ${memoryMb}M \\
  -nographic \\
  -nodefaults \\
  -serial stdio \\
  -kernel "\${KERNEL_IMG}" \\
  -drive "file=\${ROOTFS_SQFS},format=raw,readonly=${readOnlyRootfs ? 'on' : 'off'},if=virtio" \\
  ${zeroEgress ? '-net none \\' : '-netdev user,id=n0 -device virtio-net-pci,netdev=n0 \\'}
  -append "console=ttyS0 root=/dev/vda ${readOnlyRootfs ? 'ro' : 'rw'} quiet panic=1"
`;
    configCode = JSON.stringify(
      {
        schemaVersion: EDGE_FORGE_VERSION,
        service: serviceName,
        hypervisor: 'qemu-system-x86_64',
        accelerator: 'kvm',
        vcpus: 2,
        memoryMiB: memoryMb,
        networkMode: zeroEgress ? 'none (air-gapped)' : 'user-nat',
        rootfsMode: readOnlyRootfs ? 'readonly-squashfs' : 'readwrite',
        wasmKernel: wasmArtifact.exportName,
        wasmSha256: wasmArtifact.sha256,
      },
      null,
      2
    );
  }

  const combinedDigest = sha256Hex(`${meta.id}\n${sourceCode}\n---\n${configCode}`);

  return {
    version: EDGE_FORGE_VERSION,
    targetId: meta.id,
    name: meta.name,
    category: meta.category,
    isolation: meta.isolation,
    summary: meta.summary,
    config: {
      serviceName,
      routePath,
      memoryMb,
      zeroEgress,
      readOnlyRootfs,
      wasmPresetId: wasmArtifact.presetId,
    },
    artifacts: {
      source: {
        filename: meta.filename,
        content: sourceCode,
        byteLength: new TextEncoder().encode(sourceCode).length,
        sha256: sha256Hex(sourceCode),
      },
      config: {
        filename: meta.configFilename,
        content: configCode,
        byteLength: new TextEncoder().encode(configCode).length,
        sha256: sha256Hex(configCode),
      },
    },
    estimatedFootprintKb: meta.baseArtifactKb + Math.ceil(wasmArtifact.byteLength / 1024),
    estimatedColdStartMs: meta.baseColdStartMs,
    estimatedWarmExecMs: meta.baseWarmExecMs,
    manifestSha256: combinedDigest,
  };
}

/* ============================================================================
   6. Deterministic Edge Request & Cold-Start Budget Simulator (Zero Math.random)
   ============================================================================ */

export function simulateEdgeRequest(targetId = 'netlify-edge', requestConfig = {}) {
  const meta = EDGE_TARGETS.find((t) => t.id === targetId) || EDGE_TARGETS[0];
  const method = String(requestConfig.method || 'GET').toUpperCase().trim();
  const configuredRoute = sanitizeRoutePath(requestConfig.configuredRoute, '/api/edge/telemetry');
  const requestPath = sanitizeRoutePath(requestConfig.requestPath, configuredRoute);
  const coldStart = Boolean(requestConfig.coldStart);
  const zeroEgress = requestConfig.zeroEgress !== false;
  const payloadBytes = Math.max(0, Math.min(1048576, Math.trunc(Number(requestConfig.payloadBytes) || 512)));

  const allowedMethods = ['GET', 'HEAD', 'POST'];
  let status = 200;
  let routeMatch = 'exact';
  let verdict = 'ALLOWED';

  if (!allowedMethods.includes(method)) {
    status = 405;
    verdict = 'METHOD_BLOCKED';
  } else if (requestPath === configuredRoute) {
    routeMatch = 'exact';
  } else if (requestPath.startsWith(`${configuredRoute}/`)) {
    routeMatch = 'prefix';
  } else {
    routeMatch = 'miss';
    status = 404;
    verdict = 'ROUTE_NOT_FOUND';
  }

  // Deterministic budget calculation
  const payloadPenaltyMs = Number(((payloadBytes / 65536) * 1.4).toFixed(2));
  const coldMs = coldStart ? meta.baseColdStartMs : 0;
  const totalLatencyMs = Number((coldMs + meta.baseWarmExecMs + payloadPenaltyMs).toFixed(2));
  const artifactKb = meta.baseArtifactKb + Math.ceil(payloadBytes / 1024);

  const responseHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-embedder-policy': 'credentialless',
    'x-zoth-egress-policy': zeroEgress ? 'deny-all-wan' : 'allowlist-only',
    'cache-control': 'no-store',
  };

  const receiptInput = JSON.stringify({
    version: EDGE_FORGE_VERSION,
    targetId: meta.id,
    method,
    configuredRoute,
    requestPath,
    status,
    coldStart,
    zeroEgress,
    payloadBytes,
  });

  return {
    version: EDGE_FORGE_VERSION,
    targetId: meta.id,
    targetName: meta.name,
    method,
    configuredRoute,
    requestPath,
    routeMatch,
    status,
    verdict,
    coldStart,
    zeroEgress,
    timing: {
      coldStartMs: coldMs,
      warmExecMs: meta.baseWarmExecMs,
      payloadSerializationMs: payloadPenaltyMs,
      totalLatencyMs,
    },
    footprint: {
      artifactKb,
      isolation: meta.isolation,
    },
    responseHeaders,
    receiptSha256: sha256Hex(receiptInput),
  };
}

/* ============================================================================
   7. Host Toolchain Snapshot & Offline Fallback Builders
   ============================================================================ */

export const EXPECTED_HOST_TOOLCHAINS = [
  { id: 'wat2wasm', label: 'wat2wasm (WABT)', category: 'WASM', purpose: 'Compile WebAssembly Text (.wat) directly to .wasm binaries' },
  { id: 'rustc', label: 'rustc', category: 'WASM / Native', purpose: 'Compile Rust crates for wasm32-wasip1 and static musl binaries' },
  { id: 'cargo', label: 'cargo', category: 'WASM / Native', purpose: 'Rust package & workspace release build orchestrator' },
  { id: 'wasm-pack', label: 'wasm-pack', category: 'WASM', purpose: 'Bundle Rust-generated WebAssembly packages for browser/edge' },
  { id: 'wasmtime', label: 'wasmtime', category: 'WASI Runtime', purpose: 'Execute WASI micro-enclaves locally with capability flags' },
  { id: 'docker', label: 'docker', category: 'Container', purpose: 'Build and inspect OCI multi-stage FROM scratch images' },
  { id: 'podman', label: 'podman', category: 'Container', purpose: 'Rootless OCI container build and zero-egress execution' },
  { id: 'qemu-system-x86_64', label: 'qemu-system-x86_64', category: 'Micro-Kernel', purpose: 'Boot hardware-accelerated KVM micro-VMs with -net none' },
  { id: 'clang', label: 'clang', category: 'Native / WASM', purpose: 'LLVM C/C++ compiler supporting --target=wasm32' },
  { id: 'gcc', label: 'gcc', category: 'Native', purpose: 'GNU C compiler for static Linux binaries and kernel helpers' },
];

export function buildHostToolchainSnapshot({ toolchains = [], kvm = false, checkedAt = '' } = {}) {
  const normalized = toolchains.map((item) => ({
    id: String(item.id || ''),
    label: String(item.label || item.id || ''),
    category: String(item.category || 'Toolchain'),
    purpose: String(item.purpose || ''),
    installed: Boolean(item.installed),
    path: item.path ? redactHomePaths(String(item.path)) : null,
    version: item.version ? redactHomePaths(String(item.version)).slice(0, 120) : null,
  }));

  const installedCount = normalized.filter((t) => t.installed).length;

  return redactPayload({
    version: EDGE_FORGE_VERSION,
    mode: 'LIVE_HOST_TOOLCHAINS',
    checkedAt: checkedAt || new Date().toISOString(),
    kvm: Boolean(kvm),
    summary: {
      total: normalized.length,
      installed: installedCount,
      missing: normalized.length - installedCount,
      wat2wasmReady: normalized.some((t) => t.id === 'wat2wasm' && t.installed),
      kvmReady: Boolean(kvm) && normalized.some((t) => t.id === 'qemu-system-x86_64' && t.installed),
    },
    toolchains: normalized,
    presets: WASM_KERNEL_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      exportName: p.exportName,
      signature: p.signature,
      defaultArgs: p.defaultArgs,
    })),
    targets: EDGE_TARGETS.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      filename: t.filename,
      configFilename: t.configFilename,
    })),
  });
}

export function buildOfflineToolchainSnapshot(reason = 'Loopback Studio API (:3000) unavailable — running in browser-only mode') {
  return {
    version: EDGE_FORGE_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt: new Date().toISOString(),
    reason: redactHomePaths(reason),
    kvm: false,
    summary: {
      total: EXPECTED_HOST_TOOLCHAINS.length,
      installed: 0,
      missing: EXPECTED_HOST_TOOLCHAINS.length,
      wat2wasmReady: false,
      kvmReady: false,
    },
    toolchains: EXPECTED_HOST_TOOLCHAINS.map((spec) => ({
      ...spec,
      installed: false,
      path: null,
      version: 'Unavailable (browser offline fallback)',
    })),
    presets: WASM_KERNEL_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      exportName: p.exportName,
      signature: p.signature,
      defaultArgs: p.defaultArgs,
    })),
    targets: EDGE_TARGETS.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      filename: t.filename,
      configFilename: t.configFilename,
    })),
  };
}

/* ============================================================================
   8. Sanitized JSON, Markdown & Formula-Safe CSV Exporters
   ============================================================================ */

export function exportEdgeJson({ wasm, execution, targetSynthesis, simulation, hostSnapshot } = {}) {
  const manifest = redactPayload({
    schema: 'zoth.edge-forge.manifest.v2',
    version: EDGE_FORGE_VERSION,
    generatedAt: new Date().toISOString(),
    mode: hostSnapshot?.mode || 'BROWSER_OFFLINE_FALLBACK',
    wasmModule: wasm
      ? {
          presetId: wasm.presetId || 'custom',
          exportName: wasm.exportName || null,
          byteLength: wasm.byteLength || 0,
          sha256: wasm.sha256 || '',
          sections: wasm.inspection?.sections || [],
          exports: wasm.inspection?.exports || [],
          execution: execution || null,
        }
      : null,
    edgeTarget: targetSynthesis
      ? {
          targetId: targetSynthesis.targetId,
          name: targetSynthesis.name,
          isolation: targetSynthesis.isolation,
          estimatedFootprintKb: targetSynthesis.estimatedFootprintKb,
          estimatedColdStartMs: targetSynthesis.estimatedColdStartMs,
          manifestSha256: targetSynthesis.manifestSha256,
          files: [
            { filename: targetSynthesis.artifacts.source.filename, sha256: targetSynthesis.artifacts.source.sha256, byteLength: targetSynthesis.artifacts.source.byteLength },
            { filename: targetSynthesis.artifacts.config.filename, sha256: targetSynthesis.artifacts.config.sha256, byteLength: targetSynthesis.artifacts.config.byteLength },
          ],
        }
      : null,
    requestSimulation: simulation || null,
    hostToolchains: hostSnapshot
      ? {
          mode: hostSnapshot.mode,
          kvm: hostSnapshot.kvm,
          summary: hostSnapshot.summary,
          toolchains: hostSnapshot.toolchains,
        }
      : null,
  });
  return JSON.stringify(manifest, null, 2);
}

export function exportEdgeMarkdown({ wasm, execution, targetSynthesis, simulation, hostSnapshot } = {}) {
  const lines = [
    `# Zoth Edge Forge & Micro-Kernel Sandbox Dossier (v${EDGE_FORGE_VERSION})`,
    '',
    `- **Runtime Mode:** \`${hostSnapshot?.mode || 'BROWSER_OFFLINE_FALLBACK'}\``,
    `- **Hardware KVM:** \`${hostSnapshot?.kvm ? 'AVAILABLE (/dev/kvm)' : 'UNAVAILABLE'}\``,
    '',
  ];

  if (wasm) {
    lines.push('## 1. WebAssembly Binary Module');
    lines.push(`- **Preset / Export:** \`${wasm.presetId || 'custom'}\` -> \`${wasm.exportName || 'unknown'}\``);
    lines.push(`- **Binary Size:** ${wasm.byteLength || 0} bytes`);
    lines.push(`- **FIPS 180-4 SHA-256:** \`${wasm.sha256 || ''}\``);
    if (execution?.ok) {
      lines.push(`- **Live Execution Result:** \`${execution.exportName}(${(execution.args || []).join(', ')}) = ${execution.result}\` (${execution.execUs} us)`);
    }
    lines.push('');
    lines.push('| Section ID | Name | Offset | Payload Bytes |');
    lines.push('| :---: | :--- | :---: | :---: |');
    for (const sec of wasm.inspection?.sections || []) {
      lines.push(`| ${sec.id} | ${sec.name} | 0x${sec.offset.toString(16).padStart(2, '0')} | ${sec.payloadSize} |`);
    }
    lines.push('');
  }

  if (targetSynthesis) {
    lines.push('## 2. Synthesized Edge / Micro-Kernel Target');
    lines.push(`- **Target:** ${targetSynthesis.name} (\`${targetSynthesis.targetId}\`)`);
    lines.push(`- **Isolation Boundary:** ${targetSynthesis.isolation}`);
    lines.push(`- **Estimated Footprint / Cold Start:** ${targetSynthesis.estimatedFootprintKb} KB / ${targetSynthesis.estimatedColdStartMs} ms`);
    lines.push(`- **Manifest SHA-256:** \`${targetSynthesis.manifestSha256}\``);
    lines.push('');
  }

  if (simulation) {
    lines.push('## 3. Deterministic Request Dry-Run');
    lines.push(`- **Request:** \`${simulation.method} ${simulation.requestPath}\` (Route match: \`${simulation.routeMatch}\`)`);
    lines.push(`- **Status / Verdict:** \`HTTP ${simulation.status}\` (\`${simulation.verdict}\`)`);
    lines.push(`- **Total Latency:** ${simulation.timing.totalLatencyMs} ms (cold: ${simulation.timing.coldStartMs} ms, warm: ${simulation.timing.warmExecMs} ms)`);
    lines.push(`- **Receipt SHA-256:** \`${simulation.receiptSha256}\``);
    lines.push('');
  }

  if (hostSnapshot?.toolchains?.length) {
    lines.push('## 4. Host Toolchain Inventory');
    lines.push('| Toolchain | Category | Status | Path | Version |');
    lines.push('| :--- | :--- | :---: | :--- | :--- |');
    for (const tc of hostSnapshot.toolchains) {
      lines.push(`| ${tc.id} | ${tc.category} | ${tc.installed ? 'INSTALLED' : 'MISSING'} | \`${tc.path || '-'}\` | ${tc.version || '-'} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');

  return redactHomePaths(lines.join('\n'));
}

export function exportEdgeCsv({ targets = EDGE_TARGETS, hostSnapshot = null, customRows = [] } = {}) {
  const header = ['RowType', 'Identifier', 'Category', 'Status', 'ArtifactOrPath', 'FootprintOrVersion', 'ColdStartMs', 'IsolationOrPurpose'];
  const rows = [header.map(neutralizeCsvCell).join(',')];

  for (const t of targets) {
    rows.push(
      [
        'EDGE_TARGET',
        t.id,
        t.category,
        'READY',
        t.filename,
        `${t.baseArtifactKb} KB`,
        t.baseColdStartMs,
        t.isolation,
      ]
        .map(neutralizeCsvCell)
        .join(',')
    );
  }

  for (const tc of hostSnapshot?.toolchains || []) {
    rows.push(
      [
        'HOST_TOOLCHAIN',
        tc.id,
        tc.category,
        tc.installed ? 'INSTALLED' : 'MISSING',
        tc.path || '',
        tc.version || '',
        0,
        tc.purpose || '',
      ]
        .map(neutralizeCsvCell)
        .join(',')
    );
  }

  for (const extra of customRows) {
    rows.push(
      [
        extra.rowType || 'CUSTOM',
        extra.id || '',
        extra.category || '',
        extra.status || '',
        extra.artifact || '',
        extra.metric || '',
        extra.latency ?? 0,
        extra.note || '',
      ]
        .map(neutralizeCsvCell)
        .join(',')
    );
  }

  return rows.join('\n');
}
