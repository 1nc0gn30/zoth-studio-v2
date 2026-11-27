/**
 * Sovereign Operator IDE & Code Foundry — Pure Deterministic Engine (v2.3.0)
 *
 * Shared byte-identically between browser (`src/utils/ideEngine.js`)
 * and loopback Studio API (`server/ide-engine.mjs`).
 *
 * Invariants:
 *  - Zero external dependencies, zero eval(), zero new Function(), zero Math.random().
 *  - Strict read-only workspace containment helpers (slug allowlist + secret-file denylist).
 *  - Mandatory ~/ home-path redaction, token/key masking, and CSV formula neutralization.
 *  - Deterministic FIPS 180-4 SHA-256 receipts, multi-language AST/symbol extractor,
 *    static security & hygiene linter, LCS unified diff/patch builder, and pure
 *    recursive-descent expression evaluator.
 */

export const IDE_ENGINE_VERSION = '2.3.0';

export const EXPECTED_IDE_TOOLCHAINS = Object.freeze([
  { id: 'node', label: 'Node.js', category: 'Runtime', args: ['--version'], purpose: 'JavaScript / ESM runtime' },
  { id: 'npm', label: 'npm', category: 'Package Manager', args: ['--version'], purpose: 'Node package manager & test runner' },
  { id: 'python3', label: 'Python 3', category: 'Runtime', args: ['--version'], purpose: 'Python interpreter & tooling' },
  { id: 'rg', label: 'ripgrep', category: 'Search', args: ['--version'], purpose: 'Fast regex workspace search' },
  { id: 'git', label: 'Git', category: 'VCS', args: ['--version'], purpose: 'Source control & diff engine' },
  { id: 'rustc', label: 'rustc', category: 'Compiler', args: ['--version'], purpose: 'Rust compiler' },
  { id: 'cargo', label: 'Cargo', category: 'Build', args: ['--version'], purpose: 'Rust package & test harness' },
  { id: 'go', label: 'Go', category: 'Compiler', args: ['version'], purpose: 'Go toolchain' },
  { id: 'gcc', label: 'GCC', category: 'Compiler', args: ['--version'], purpose: 'GNU C/C++ compiler' },
  { id: 'clang', label: 'Clang', category: 'Compiler', args: ['--version'], purpose: 'LLVM C/C++ compiler' },
  { id: 'eslint', label: 'ESLint', category: 'Linter', args: ['--version'], purpose: 'Static JavaScript linter' },
]);

export const SUPPORTED_IDE_LANGUAGES = Object.freeze([
  'javascript',
  'jsx',
  'typescript',
  'python',
  'rust',
  'json',
  'yaml',
  'markdown',
]);

export const REPO_SLUG_REGEX = /^[A-Za-z0-9._-]{1,100}$/;

const TOKEN_PATTERNS = [
  /\bgithub_pat_[A-Za-z0-9_]{12,}\b/g,
  /\bghp_[A-Za-z0-9_]{12,}\b/g,
  /\bgho_[A-Za-z0-9_]{12,}\b/g,
  /\bghu_[A-Za-z0-9_]{12,}\b/g,
  /\bghs_[A-Za-z0-9_]{12,}\b/g,
  /\bghr_[A-Za-z0-9_]{12,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

const PRIVATE_KEY_BLOCK_RE = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g;
const PRIVATE_KEY_HEADER_RE = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i;
const URL_EMBEDDED_CRED_RE = /(https?:\/\/)([^/\s:@]+):([^/\s@]+)@/gi;
const HOME_PATH_RE = /(?:\/home|\/Users)\/[A-Za-z0-9._-]+(?=\/|["'`\s,;:)>\]]|$)/g;

const BLOCKED_EXACT_NAMES = new Set([
  '.env',
  'hosts.yml',
  '.git-credentials',
  'credentials.json',
  '.npmrc',
  '.netrc',
  '.pypirc',
]);

const BLOCKED_EXTENSIONS = [
  '.pem',
  '.key',
  '.p12',
  '.pfx',
  '.db',
  '.sqlite',
  '.sqlite3',
  '.sqlite-wal',
  '.sqlite-shm',
];

const BLOCKED_PREFIXES = [
  '.env.',
  'id_rsa',
  'id_ed25519',
  'id_ecdsa',
  'id_dsa',
];

// ============================================================================
// 1. PURE SYNCHRONOUS FIPS 180-4 SHA-256 (ZERO DEPENDENCIES)
// ============================================================================

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

function utf8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(String(str));
  }
  const s = unescape(encodeURIComponent(String(str)));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i);
  return out;
}

export function sha256Hex(input) {
  const data = input instanceof Uint8Array ? input : utf8Bytes(input === null || input === undefined ? '' : String(input));
  const len = data.length;
  const bitLenHi = Math.floor((len * 8) / 0x100000000);
  const bitLenLo = (len * 8) >>> 0;
  const paddedLen = ((len + 9 + 63) & ~63);
  const buf = new Uint8Array(paddedLen);
  buf.set(data);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, bitLenHi, false);
  view.setUint32(paddedLen - 4, bitLenLo, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
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
    .map((n) => n.toString(16).padStart(8, '0'))
    .join('');
}

// ============================================================================
// 2. SECURITY CONTAINMENT & REDACTION HELPERS
// ============================================================================

export function isValidRepoSlug(slug) {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..') return false;
  if (trimmed.startsWith('.')) return false;
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) return false;
  return REPO_SLUG_REGEX.test(trimmed);
}

export function isValidRelativeFilePath(relPath) {
  if (typeof relPath !== 'string') return false;
  const trimmed = relPath.trim();
  if (!trimmed || trimmed.length > 320) return false;
  if (trimmed.includes('\0') || trimmed.includes('\\')) return false;
  if (trimmed.startsWith('/') || /^[A-Za-z]:/.test(trimmed)) return false;
  const segments = trimmed.split('/');
  for (const seg of segments) {
    if (!seg || seg === '.' || seg === '..') return false;
    if (/[\r\n\t]/.test(seg)) return false;
  }
  return true;
}

export function isBlockedSecretPath(relPath) {
  if (typeof relPath !== 'string') return true;
  const normalized = relPath.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized) return true;
  const lower = normalized.toLowerCase();
  const segments = lower.split('/').filter(Boolean);
  if (segments.length === 0) return true;

  for (const seg of segments) {
    if (seg === '.git') return true;
    if (BLOCKED_EXACT_NAMES.has(seg)) return true;
    if (seg.includes('secret') || seg.includes('token')) return true;
    for (const prefix of BLOCKED_PREFIXES) {
      if (seg.startsWith(prefix)) return true;
    }
    for (const ext of BLOCKED_EXTENSIONS) {
      if (seg.endsWith(ext)) return true;
    }
  }
  return false;
}

export function redactIdeString(input) {
  if (input === null || input === undefined) return '';
  let out = String(input);
  out = out.replace(PRIVATE_KEY_BLOCK_RE, '[REDACTED_PRIVATE_KEY]');
  if (PRIVATE_KEY_HEADER_RE.test(out)) {
    out = out.replace(PRIVATE_KEY_HEADER_RE, '[REDACTED_PRIVATE_KEY]');
  }
  out = out.replace(URL_EMBEDDED_CRED_RE, '$1[REDACTED_CRED]@');
  for (const re of TOKEN_PATTERNS) {
    out = out.replace(re, '[REDACTED_TOKEN]');
  }
  out = out.replace(HOME_PATH_RE, '~');
  return out;
}

export function redactIdeOutput(value) {
  if (typeof value === 'string') return redactIdeString(value);
  if (Array.isArray(value)) return value.map((item) => redactIdeOutput(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactIdeOutput(v);
    }
    return out;
  }
  return value;
}

export function neutralizeCsvCell(value) {
  const safe = redactIdeString(value === null || value === undefined ? '' : String(value));
  const trimmedStart = safe.replace(/^ +/, '');
  const needsPrefix =
    safe.length > 0 &&
    (/^[=+\-@\t\r]/.test(safe) || /^[=+\-@\t\r]/.test(trimmedStart));
  return needsPrefix ? `'${safe}` : safe;
}

function escapeCsvField(value) {
  const cell = neutralizeCsvCell(value);
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function gradeFromScore(score) {
  const n = Number(score) || 0;
  if (n >= 95) return 'A+';
  if (n >= 90) return 'A';
  if (n >= 80) return 'B';
  if (n >= 70) return 'C';
  if (n >= 60) return 'D';
  return 'F';
}

export function detectLanguageFromFilename(filename = '', fallback = 'javascript') {
  const lower = String(filename || '').trim().toLowerCase();
  if (lower.endsWith('.tsx') || lower.endsWith('.ts') || lower.endsWith('.mts')) return 'typescript';
  if (lower.endsWith('.jsx')) return 'jsx';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.rs')) return 'rust';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  const norm = String(fallback || 'javascript').trim().toLowerCase();
  return SUPPORTED_IDE_LANGUAGES.includes(norm) ? norm : 'javascript';
}

// ============================================================================
// 3. MULTI-LANGUAGE LEXER & STRUCTURAL AST / SYMBOL OUTLINE EXTRACTOR
// ============================================================================

function checkBrackets(code, language) {
  const lang = String(language || 'javascript').toLowerCase();
  if (lang === 'markdown' || lang === 'yaml') {
    return {
      balanced: true,
      openCounts: { '(': 0, '{': 0, '[': 0 },
      closeCounts: { ')': 0, '}': 0, ']': 0 },
      issues: [],
    };
  }

  const pairs = { '(': ')', '{': '}', '[': ']' };
  const closers = { ')': '(', '}': '{', ']': '[' };
  const openCounts = { '(': 0, '{': 0, '[': 0 };
  const closeCounts = { ')': 0, '}': 0, ']': 0 };
  const stack = [];
  const issues = [];

  const isPy = lang === 'python';
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;
  let line = 1;

  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];
    const next = code[i + 1] || '';

    if (ch === '\n') {
      line += 1;
      inLineComment = false;
      escaped = false;
      continue;
    }

    if (inLineComment) continue;

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingle || inDouble || inBacktick) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (inSingle && ch === "'") inSingle = false;
      else if (inDouble && ch === '"') inDouble = false;
      else if (inBacktick && ch === '`') inBacktick = false;
      continue;
    }

    if (isPy && ch === '#') {
      inLineComment = true;
      continue;
    }
    if (!isPy && ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (!isPy && ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (ch === "'") {
      // In Rust, lifetimes like 'a or 'static are not char literals if followed by ident without closing quote
      if (lang === 'rust') {
        const closeQuoteIdx = code.indexOf("'", i + 1);
        const isCharLit =
          (code[i + 1] === '\\' && closeQuoteIdx > i + 1 && closeQuoteIdx <= i + 6) ||
          (closeQuoteIdx === i + 2 && code[i + 1] !== '\n');
        if (!isCharLit) continue;
      }
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`' && (lang === 'javascript' || lang === 'jsx' || lang === 'typescript')) {
      inBacktick = true;
      continue;
    }

    if (pairs[ch]) {
      openCounts[ch] += 1;
      stack.push({ ch, line });
    } else if (closers[ch]) {
      closeCounts[ch] += 1;
      const expectedOpen = closers[ch];
      if (stack.length === 0) {
        issues.push({ line, message: `Unmatched closing '${ch}' with no opening '${expectedOpen}'.` });
      } else {
        const top = stack[stack.length - 1];
        if (top.ch !== expectedOpen) {
          issues.push({
            line,
            message: `Mismatched closing '${ch}'; expected '${pairs[top.ch]}' for '${top.ch}' opened on line ${top.line}.`,
          });
        } else {
          stack.pop();
        }
      }
    }
  }

  for (const unclosed of stack) {
    issues.push({
      line: unclosed.line,
      message: `Unclosed '${unclosed.ch}' opened on line ${unclosed.line}.`,
    });
  }

  return {
    balanced: issues.length === 0,
    openCounts,
    closeCounts,
    issues: issues.slice(0, 20),
  };
}

function countTokens(code) {
  const matches = String(code || '').match(/[A-Za-z_][A-Za-z0-9_]*|0x[0-9a-fA-F]+|\d+(?:\.\d+)?|===|!==|==|!=|<=|>=|&&|\|\||\?\?|=>|::|->|[{}()[\].,;:+\-*/%&|^~!<>?=]/g);
  return matches ? matches.length : 0;
}

export function analyzeSourceStructure(code = '', language = 'javascript') {
  const src = String(code ?? '');
  const lang = SUPPORTED_IDE_LANGUAGES.includes(String(language || '').toLowerCase())
    ? String(language).toLowerCase()
    : 'javascript';
  const lines = src.length === 0 ? [] : src.split(/\r?\n/);

  const imports = [];
  const exportsList = [];
  const symbols = [];
  let nonEmptyLines = 0;
  let commentLines = 0;
  let branchCount = 0;
  let jsonValid = null;
  let jsonError = null;

  if (lang === 'json') {
    try {
      const parsed = JSON.parse(src);
      jsonValid = true;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const key of Object.keys(parsed)) {
          const lineIdx = lines.findIndex((l) => l.includes(`"${key}"`));
          const val = parsed[key];
          const valKind = Array.isArray(val) ? `array(${val.length})` : val === null ? 'null' : typeof val;
          symbols.push({ kind: 'key', name: key, line: lineIdx >= 0 ? lineIdx + 1 : 1, detail: valKind });
        }
      }
    } catch (err) {
      jsonValid = false;
      jsonError = err?.message || 'Invalid JSON syntax';
    }
  }

  for (let idx = 0; idx < lines.length; idx += 1) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();
    const lineNo = idx + 1;
    if (!trimmed) continue;
    nonEmptyLines += 1;

    const isComment =
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      ((lang === 'python' || lang === 'yaml') && trimmed.startsWith('#'));

    if (isComment) {
      commentLines += 1;
      continue;
    }

    if (lang === 'javascript' || lang === 'jsx' || lang === 'typescript') {
      const impMatch = trimmed.match(/^import\s+(.+?)\s+from\s+['"]([^'"]+)['"]/);
      if (impMatch) {
        imports.push({ name: impMatch[1].trim(), source: impMatch[2], line: lineNo });
      }
      const reqMatch = trimmed.match(/(?:const|let|var)\s+(\{?[\w\s,]+\}?)\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/);
      if (reqMatch) {
        imports.push({ name: reqMatch[1].trim(), source: reqMatch[2], line: lineNo });
      }
      const expFn = trimmed.match(/^export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
      if (expFn) {
        exportsList.push({ name: expFn[1], kind: 'function', line: lineNo });
        symbols.push({ kind: 'function', name: expFn[1], line: lineNo, detail: 'exported' });
      } else {
        const fnDecl = trimmed.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
        if (fnDecl) {
          symbols.push({ kind: 'function', name: fnDecl[1], line: lineNo, detail: 'local' });
        }
      }
      const expConst = trimmed.match(/^export\s+const\s+([A-Za-z_$][\w$]*)\s*=/);
      if (expConst) {
        const isArrow = /=>/.test(trimmed);
        exportsList.push({ name: expConst[1], kind: isArrow ? 'function' : 'const', line: lineNo });
        symbols.push({ kind: isArrow ? 'arrow-fn' : 'const', name: expConst[1], line: lineNo, detail: 'exported' });
      } else {
        const arrowLocal = trimmed.match(/^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
        if (arrowLocal) {
          symbols.push({ kind: 'arrow-fn', name: arrowLocal[1], line: lineNo, detail: 'local' });
        }
      }
      const clsMatch = trimmed.match(/^(?:export\s+(?:default\s+)?)?class\s+([A-Za-z_$][\w$]*)/);
      if (clsMatch) {
        if (trimmed.startsWith('export')) exportsList.push({ name: clsMatch[1], kind: 'class', line: lineNo });
        symbols.push({ kind: 'class', name: clsMatch[1], line: lineNo, detail: trimmed.startsWith('export') ? 'exported' : 'local' });
      }
      const ifaceMatch = trimmed.match(/^(?:export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)/);
      if (ifaceMatch) {
        if (trimmed.startsWith('export')) exportsList.push({ name: ifaceMatch[1], kind: 'type', line: lineNo });
        symbols.push({ kind: 'type', name: ifaceMatch[1], line: lineNo, detail: lang });
      }
      const branches = trimmed.match(/\b(?:if|else\s+if|for|while|case|catch)\b|&&|\|\||\?\?|\?[^?:.\s]/g);
      if (branches) branchCount += branches.length;
    } else if (lang === 'python') {
      const fromImp = trimmed.match(/^from\s+([A-Za-z0-9_.]+)\s+import\s+(.+)$/);
      if (fromImp) {
        imports.push({ name: fromImp[2].trim(), source: fromImp[1], line: lineNo });
      } else {
        const plainImp = trimmed.match(/^import\s+([A-Za-z0-9_.,\s]+)$/);
        if (plainImp) {
          imports.push({ name: plainImp[1].trim(), source: plainImp[1].trim(), line: lineNo });
        }
      }
      const pyDef = trimmed.match(/^(?:async\s+)?def\s+([A-Za-z_][\w]*)\s*\(/);
      if (pyDef) {
        const isMethod = /^\s+/.test(rawLine);
        symbols.push({ kind: isMethod ? 'method' : 'function', name: pyDef[1], line: lineNo, detail: isMethod ? 'class member' : 'module' });
        if (!isMethod && !pyDef[1].startsWith('_')) exportsList.push({ name: pyDef[1], kind: 'function', line: lineNo });
      }
      const pyClass = trimmed.match(/^class\s+([A-Za-z_][\w]*)/);
      if (pyClass) {
        symbols.push({ kind: 'class', name: pyClass[1], line: lineNo, detail: 'class' });
        if (!pyClass[1].startsWith('_')) exportsList.push({ name: pyClass[1], kind: 'class', line: lineNo });
      }
      const branches = trimmed.match(/\b(?:if|elif|for|while|except|and|or)\b/g);
      if (branches) branchCount += branches.length;
    } else if (lang === 'rust') {
      const useMatch = trimmed.match(/^(?:pub\s+)?use\s+([^;]+);/);
      if (useMatch) {
        imports.push({ name: useMatch[1].trim(), source: useMatch[1].trim().split('::')[0], line: lineNo });
      }
      const fnMatch = trimmed.match(/^(pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_][\w]*)/);
      if (fnMatch) {
        const isPub = Boolean(fnMatch[1]);
        symbols.push({ kind: 'fn', name: fnMatch[2], line: lineNo, detail: isPub ? 'pub' : 'private' });
        if (isPub) exportsList.push({ name: fnMatch[2], kind: 'fn', line: lineNo });
      }
      const structMatch = trimmed.match(/^(pub(?:\([^)]*\))?\s+)?(struct|enum|trait)\s+([A-Za-z_][\w]*)/);
      if (structMatch) {
        const isPub = Boolean(structMatch[1]);
        symbols.push({ kind: structMatch[2], name: structMatch[3], line: lineNo, detail: isPub ? 'pub' : 'private' });
        if (isPub) exportsList.push({ name: structMatch[3], kind: structMatch[2], line: lineNo });
      }
      const implMatch = trimmed.match(/^impl(?:<[^>]+>)?\s+([A-Za-z_][\w:<>,\s]*?)\s*\{/);
      if (implMatch) {
        symbols.push({ kind: 'impl', name: implMatch[1].trim(), line: lineNo, detail: 'impl block' });
      }
      const branches = trimmed.match(/\b(?:if|else\s+if|for|while|loop|match)\b|&&|\|\||=>/g);
      if (branches) branchCount += branches.length;
    } else if (lang === 'yaml') {
      const topKey = rawLine.match(/^([A-Za-z0-9_.-]+)\s*:(.*)$/);
      if (topKey) {
        symbols.push({ kind: 'section', name: topKey[1], line: lineNo, detail: topKey[2].trim() || 'mapping' });
      }
    } else if (lang === 'markdown') {
      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        symbols.push({ kind: `h${heading[1].length}`, name: heading[2].trim(), line: lineNo, detail: `level ${heading[1].length}` });
      }
    }
  }

  const bracketBalance = checkBrackets(src, lang);
  const cyclomaticComplexity = Math.max(1, 1 + branchCount);
  const complexityBand =
    cyclomaticComplexity <= 8 ? 'LOW' : cyclomaticComplexity <= 18 ? 'MODERATE' : 'HIGH';

  return {
    language: lang,
    lineCount: lines.length,
    nonEmptyLines,
    commentLines,
    byteLength: utf8Bytes(src).length,
    tokenCount: countTokens(src),
    imports,
    exports: exportsList,
    symbols,
    bracketBalance,
    cyclomaticComplexity,
    complexityBand,
    jsonValid,
    jsonError,
    sha256: sha256Hex(src),
  };
}

// ============================================================================
// 4. DETERMINISTIC STATIC SECURITY & HYGIENE LINTER
// ============================================================================

const LINT_RULES = [
  {
    id: 'SEC-EVAL',
    severity: 'CRITICAL',
    pattern: /\beval\s*\(|\bnew\s+Function\s*\(/,
    message: 'Dynamic code execution via eval() or new Function() detected.',
    hint: 'Replace with pure AST/expression parsing or structured dispatch tables.',
  },
  {
    id: 'SEC-XSS-HTML',
    severity: 'CRITICAL',
    pattern: /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|\bdocument\.write\s*\(/,
    message: 'Unsafe raw HTML injection sink detected.',
    hint: 'Render declarative JSX/DOM nodes with textContent instead of raw HTML assignment.',
  },
  {
    id: 'SEC-SHELL-EXEC',
    severity: 'CRITICAL',
    pattern: /\bchild_process\b.*\bexec(?:Sync)?\s*\(|\bexecSync\s*\(|\bsubprocess\.[^(]*\([^)]*shell\s*=\s*True|\bos\.system\s*\(/,
    message: 'Shell-interpolated process execution detected.',
    hint: 'Use shell-free execFileSync / subprocess.run([...], shell=False) with strict argument allowlists.',
  },
  {
    id: 'SEC-SECRET-KEY',
    severity: 'CRITICAL',
    pattern: /\b(?:ghp_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]{12,}|sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,})\b|-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/,
    message: 'Hardcoded secret token or private key material detected in source.',
    hint: 'Remove secret immediately, rotate credentials, and inject at runtime via environment or vault.',
  },
  {
    id: 'SEC-HOME-PATH',
    severity: 'HIGH',
    pattern: /(?:\/home|\/Users)\/[A-Za-z0-9._-]+\//,
    message: 'Literal local home directory path detected.',
    hint: 'Use ~/ or os.homedir() / relative workspace paths to prevent host username leakage.',
  },
  {
    id: 'SEC-EXT-CDN',
    severity: 'HIGH',
    pattern: /https?:\/\/(?:fonts\.googleapis\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|esm\.sh)\b/i,
    message: 'External CDN asset URL violates zero-egress invariant.',
    hint: 'Self-host fonts and bundles locally under public/ or src/ with zero external network requests.',
  },
  {
    id: 'HYG-DEBUG-STMT',
    severity: 'MEDIUM',
    pattern: /\bdebugger\b\s*;?/,
    message: 'Leftover debugger breakpoint statement detected.',
    hint: 'Remove debugger statements before committing production modules.',
  },
  {
    id: 'HYG-CONSOLE-LOG',
    severity: 'INFO',
    pattern: /\bconsole\.log\s*\(/,
    message: 'Debug console.log() statement found.',
    hint: 'Remove verbose console.log calls or route through structured telemetry.',
  },
];

const SEVERITY_DEDUCTION = {
  CRITICAL: 28,
  HIGH: 14,
  MEDIUM: 6,
  INFO: 2,
};

export function lintSourceCode(code = '', language = 'javascript', filename = 'buffer.js') {
  const src = String(code ?? '');
  const lang = detectLanguageFromFilename(filename, language);
  const lines = src.length === 0 ? [] : src.split(/\r?\n/);
  const findings = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const lineText = lines[idx];
    const lineNo = idx + 1;
    for (const rule of LINT_RULES) {
      if (rule.pattern.test(lineText)) {
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          line: lineNo,
          message: rule.message,
          hint: rule.hint,
          excerpt: redactIdeString(lineText.trim()).slice(0, 120),
        });
      }
    }
  }

  const structure = analyzeSourceStructure(src, lang);
  if (!structure.bracketBalance.balanced) {
    for (const issue of structure.bracketBalance.issues.slice(0, 5)) {
      findings.push({
        ruleId: 'SYN-BRACKET',
        severity: 'HIGH',
        line: issue.line,
        message: issue.message,
        hint: 'Balance opening and closing delimiters (), {}, and [].',
        excerpt: redactIdeString((lines[issue.line - 1] || '').trim()).slice(0, 120),
      });
    }
  }
  if (lang === 'json' && structure.jsonValid === false) {
    findings.push({
      ruleId: 'SYN-JSON',
      severity: 'HIGH',
      line: 1,
      message: `Invalid JSON: ${structure.jsonError}`,
      hint: 'Verify quotes, commas, and closing brackets in JSON payload.',
      excerpt: '',
    });
  }

  const summary = {
    critical: findings.filter((f) => f.severity === 'CRITICAL').length,
    high: findings.filter((f) => f.severity === 'HIGH').length,
    medium: findings.filter((f) => f.severity === 'MEDIUM').length,
    info: findings.filter((f) => f.severity === 'INFO').length,
    total: findings.length,
  };

  let penalty = 0;
  for (const f of findings) {
    penalty += SEVERITY_DEDUCTION[f.severity] || 2;
  }
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const grade = gradeFromScore(score);

  return {
    filename: redactIdeString(filename || 'buffer.js'),
    language: lang,
    findings,
    summary,
    score,
    grade,
    sha256: sha256Hex(`${filename}:${lang}:${score}:${findings.map((f) => `${f.ruleId}@${f.line}`).join(',')}`),
  };
}

// ============================================================================
// 5. DETERMINISTIC LCS UNIFIED DIFF / PATCH GENERATOR
// ============================================================================

function computeLineOps(oldLines, newLines) {
  const n = oldLines.length;
  const m = newLines.length;

  // Bounded LCS DP for normal code files (<= 600 lines each)
  if (n * m <= 360000) {
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        if (oldLines[i] === newLines[j]) {
          dp[i][j] = dp[i + 1][j + 1] + 1;
        } else {
          dp[i][j] = dp[i + 1][j] >= dp[i][j + 1] ? dp[i + 1][j] : dp[i][j + 1];
        }
      }
    }
    const ops = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (oldLines[i] === newLines[j]) {
        ops.push({ type: 'context', oldLine: i + 1, newLine: j + 1, text: oldLines[i] });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: 'remove', oldLine: i + 1, newLine: null, text: oldLines[i] });
        i += 1;
      } else {
        ops.push({ type: 'add', oldLine: null, newLine: j + 1, text: newLines[j] });
        j += 1;
      }
    }
    while (i < n) {
      ops.push({ type: 'remove', oldLine: i + 1, newLine: null, text: oldLines[i] });
      i += 1;
    }
    while (j < m) {
      ops.push({ type: 'add', oldLine: null, newLine: j + 1, text: newLines[j] });
      j += 1;
    }
    return ops;
  }

  // Linear fallback for very large files
  const ops = [];
  const maxLen = Math.max(n, m);
  for (let k = 0; k < maxLen; k += 1) {
    if (k < n && k < m && oldLines[k] === newLines[k]) {
      ops.push({ type: 'context', oldLine: k + 1, newLine: k + 1, text: oldLines[k] });
    } else {
      if (k < n) ops.push({ type: 'remove', oldLine: k + 1, newLine: null, text: oldLines[k] });
      if (k < m) ops.push({ type: 'add', oldLine: null, newLine: k + 1, text: newLines[k] });
    }
  }
  return ops;
}

export function computeUnifiedDiff(originalText = '', modifiedText = '', filename = 'buffer.js', contextLines = 3) {
  const safeName = redactIdeString(filename || 'buffer.js').replace(/^\/+/, '');
  const oldLines = originalText === '' ? [] : String(originalText).split(/\r?\n/);
  const newLines = modifiedText === '' ? [] : String(modifiedText).split(/\r?\n/);
  const ops = computeLineOps(oldLines, newLines);

  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const op of ops) {
    if (op.type === 'add') added += 1;
    else if (op.type === 'remove') removed += 1;
    else unchanged += 1;
  }

  const changeIndices = [];
  for (let i = 0; i < ops.length; i += 1) {
    if (ops[i].type !== 'context') changeIndices.push(i);
  }

  if (changeIndices.length === 0) {
    const emptyPatch = `--- a/${safeName}\n+++ b/${safeName}\n`;
    return {
      filename: safeName,
      hasChanges: false,
      stats: { added: 0, removed: 0, unchanged, hunks: 0 },
      hunks: [],
      lines: [
        { type: 'header', oldLine: null, newLine: null, text: `--- a/${safeName}` },
        { type: 'header', oldLine: null, newLine: null, text: `+++ b/${safeName}` },
      ],
      patchText: emptyPatch,
      sha256: sha256Hex(emptyPatch),
    };
  }

  const ranges = [];
  for (const idx of changeIndices) {
    const start = Math.max(0, idx - contextLines);
    const end = Math.min(ops.length - 1, idx + contextLines);
    if (ranges.length === 0 || start > ranges[ranges.length - 1].end + 1) {
      ranges.push({ start, end });
    } else {
      ranges[ranges.length - 1].end = Math.max(ranges[ranges.length - 1].end, end);
    }
  }

  const outputLines = [
    { type: 'header', oldLine: null, newLine: null, text: `--- a/${safeName}` },
    { type: 'header', oldLine: null, newLine: null, text: `+++ b/${safeName}` },
  ];
  const patchLines = [`--- a/${safeName}`, `+++ b/${safeName}`];
  const hunks = [];

  for (const range of ranges) {
    const slice = ops.slice(range.start, range.end + 1);
    const oldCount = slice.filter((o) => o.type !== 'add').length;
    const newCount = slice.filter((o) => o.type !== 'remove').length;
    const firstOld = slice.find((o) => o.oldLine !== null)?.oldLine || (oldCount === 0 ? 0 : 1);
    const firstNew = slice.find((o) => o.newLine !== null)?.newLine || (newCount === 0 ? 0 : 1);
    const headerText = `@@ -${firstOld},${oldCount} +${firstNew},${newCount} @@`;

    hunks.push({ oldStart: firstOld, oldCount, newStart: firstNew, newCount, header: headerText });
    outputLines.push({ type: 'hunk', oldLine: null, newLine: null, text: headerText });
    patchLines.push(headerText);

    for (const op of slice) {
      const prefix = op.type === 'add' ? '+' : op.type === 'remove' ? '-' : ' ';
      outputLines.push({
        type: op.type,
        oldLine: op.oldLine,
        newLine: op.newLine,
        text: `${prefix}${op.text}`,
      });
      patchLines.push(`${prefix}${op.text}`);
    }
  }

  const patchText = `${patchLines.join('\n')}\n`;
  return {
    filename: safeName,
    hasChanges: true,
    stats: { added, removed, unchanged, hunks: hunks.length },
    hunks,
    lines: outputLines,
    patchText,
    sha256: sha256Hex(patchText),
  };
}

// ============================================================================
// 6. SAFE PURE-EXPRESSION EVALUATOR (ZERO eval(), ZERO new Function())
// ============================================================================

function toBase64Utf8(str) {
  const bytes = utf8Bytes(String(str));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += chars[(triple >> 18) & 63];
    out += chars[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? chars[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? chars[triple & 63] : '=';
  }
  return out;
}

function fromBase64Utf8(b64) {
  const clean = String(b64 || '').replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
    throw new Error('Invalid base64 string');
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = chars.indexOf(clean[i]);
    const c2 = chars.indexOf(clean[i + 1]);
    const c3 = clean[i + 2] === '=' ? -1 : chars.indexOf(clean[i + 2]);
    const c4 = clean[i + 3] === '=' ? -1 : chars.indexOf(clean[i + 3]);
    bytes.push((c1 << 2) | (c2 >> 4));
    if (c3 >= 0) bytes.push(((c2 & 15) << 4) | (c3 >> 2));
    if (c4 >= 0) bytes.push(((c3 & 3) << 6) | c4);
  }
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }
  return String.fromCharCode(...bytes);
}

const PURE_CONSTANTS = Object.freeze({
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  SQRT2: Math.SQRT2,
});

const PURE_FUNCTIONS = Object.freeze({
  abs: (x) => Math.abs(Number(x)),
  ceil: (x) => Math.ceil(Number(x)),
  floor: (x) => Math.floor(Number(x)),
  round: (x) => Math.round(Number(x)),
  sqrt: (x) => Math.sqrt(Number(x)),
  log: (x) => Math.log(Number(x)),
  log2: (x) => Math.log2(Number(x)),
  log10: (x) => Math.log10(Number(x)),
  sin: (x) => Math.sin(Number(x)),
  cos: (x) => Math.cos(Number(x)),
  tan: (x) => Math.tan(Number(x)),
  pow: (a, b) => {
    const exp = Number(b);
    if (!Number.isFinite(exp) || Math.abs(exp) > 1000) throw new Error('Exponent out of safe range (-1000..1000)');
    return Math.pow(Number(a), exp);
  },
  min: (...args) => {
    if (args.length === 0) throw new Error('min() requires at least 1 argument');
    return Math.min(...args.map(Number));
  },
  max: (...args) => {
    if (args.length === 0) throw new Error('max() requires at least 1 argument');
    return Math.max(...args.map(Number));
  },
  clamp: (val, lo, hi) => Math.min(Number(hi), Math.max(Number(lo), Number(val))),
  len: (x) => String(x ?? '').length,
  upper: (x) => String(x ?? '').toUpperCase(),
  lower: (x) => String(x ?? '').toLowerCase(),
  trim: (x) => String(x ?? '').trim(),
  hex: (x) => `0x${(Number(x) >>> 0).toString(16)}`,
  sha256: (x) => sha256Hex(String(x ?? '')),
  base64Encode: (x) => toBase64Utf8(String(x ?? '')),
  base64Decode: (x) => fromBase64Utf8(String(x ?? '')),
  jsonValid: (x) => {
    try {
      JSON.parse(String(x ?? ''));
      return true;
    } catch {
      return false;
    }
  },
  regexTest: (pattern, input) => {
    const p = String(pattern ?? '');
    const s = String(input ?? '');
    if (p.length > 120 || s.length > 1024) throw new Error('regexTest input exceeds safe bounds');
    if (/\([^)]*[+*][^)]*\)[+*]/.test(p)) throw new Error('Nested quantifier regex blocked for ReDoS safety');
    const re = new RegExp(p);
    return re.test(s);
  },
});

function tokenizeExpression(expr) {
  const tokens = [];
  let i = 0;
  const len = expr.length;

  while (i < len) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // String literal
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let val = '';
      i += 1;
      let closed = false;
      while (i < len) {
        const c = expr[i];
        if (c === '\\' && i + 1 < len) {
          const n = expr[i + 1];
          if (n === 'n') val += '\n';
          else if (n === 't') val += '\t';
          else if (n === 'r') val += '\r';
          else val += n;
          i += 2;
          continue;
        }
        if (c === quote) {
          closed = true;
          i += 1;
          break;
        }
        val += c;
        i += 1;
      }
      if (!closed) throw new Error('Unterminated string literal');
      tokens.push({ type: 'string', value: val });
      continue;
    }

    // Number literal (hex, bin, oct, dec, sci)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(expr[i + 1] || ''))) {
      const slice = expr.slice(i);
      const m = slice.match(/^(?:0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/);
      if (!m) throw new Error(`Invalid numeric literal at position ${i}`);
      tokens.push({ type: 'number', value: Number(m[0]) });
      i += m[0].length;
      continue;
    }

    // Identifier / keyword
    if (/[A-Za-z_]/.test(ch)) {
      const slice = expr.slice(i);
      const m = slice.match(/^[A-Za-z_][A-Za-z0-9_]*/);
      const word = m[0];
      if (word === 'true') tokens.push({ type: 'boolean', value: true });
      else if (word === 'false') tokens.push({ type: 'boolean', value: false });
      else if (word === 'null') tokens.push({ type: 'null', value: null });
      else tokens.push({ type: 'ident', value: word });
      i += word.length;
      continue;
    }

    // Multi-char operators
    const three = expr.slice(i, i + 3);
    if (three === '===' || three === '!==' || three === '>>>') {
      tokens.push({ type: 'op', value: three });
      i += 3;
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (['**', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '??'].includes(two)) {
      tokens.push({ type: 'op', value: two });
      i += 2;
      continue;
    }

    // Single-char operators & punctuation
    if ('+-*/%&|^~!<>?:(),'.includes(ch)) {
      const punc = '(),?:'.includes(ch) ? ch : 'op';
      tokens.push({ type: punc, value: ch });
      i += 1;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }

  return tokens;
}

export function evaluatePureExpression(expression) {
  const start = Date.now();
  const raw = String(expression ?? '').trim();
  if (!raw) {
    return {
      ok: false,
      expression: '',
      error: 'Expression cannot be empty.',
      engine: 'PURE_RECURSIVE_DESCENT_AST',
    };
  }
  if (raw.length > 2048) {
    return {
      ok: false,
      expression: redactIdeString(raw.slice(0, 120)),
      error: 'Expression exceeds 2,048 character safety cap.',
      engine: 'PURE_RECURSIVE_DESCENT_AST',
    };
  }

  try {
    const tokens = tokenizeExpression(raw);
    if (tokens.length > 512) {
      throw new Error('Expression exceeds 512 token safety cap');
    }

    let pos = 0;
    let depth = 0;
    const peek = () => tokens[pos] || null;
    const consume = () => tokens[pos++];

    const enter = () => {
      depth += 1;
      if (depth > 64) throw new Error('Expression recursion depth exceeds 64');
    };
    const leave = () => {
      depth -= 1;
    };

    function parseTernary() {
      enter();
      try {
        let cond = parseNullish();
        if (peek()?.type === '?') {
          consume();
          const consequent = parseTernary();
          if (peek()?.type !== ':') throw new Error("Expected ':' in ternary expression");
          consume();
          const alternate = parseTernary();
          return cond ? consequent : alternate;
        }
        return cond;
      } finally {
        leave();
      }
    }

    function parseNullish() {
      let left = parseLogicalOr();
      while (peek()?.type === 'op' && peek().value === '??') {
        consume();
        const right = parseLogicalOr();
        left = left !== null && left !== undefined ? left : right;
      }
      return left;
    }

    function parseLogicalOr() {
      let left = parseLogicalAnd();
      while (peek()?.type === 'op' && peek().value === '||') {
        consume();
        const right = parseLogicalAnd();
        left = left || right;
      }
      return left;
    }

    function parseLogicalAnd() {
      let left = parseBitOr();
      while (peek()?.type === 'op' && peek().value === '&&') {
        consume();
        const right = parseBitOr();
        left = left && right;
      }
      return left;
    }

    function parseBitOr() {
      let left = parseBitXor();
      while (peek()?.type === 'op' && peek().value === '|') {
        consume();
        left = (Number(left) | Number(parseBitXor()));
      }
      return left;
    }

    function parseBitXor() {
      let left = parseBitAnd();
      while (peek()?.type === 'op' && peek().value === '^') {
        consume();
        left = (Number(left) ^ Number(parseBitAnd()));
      }
      return left;
    }

    function parseBitAnd() {
      let left = parseEquality();
      while (peek()?.type === 'op' && peek().value === '&') {
        consume();
        left = (Number(left) & Number(parseEquality()));
      }
      return left;
    }

    function parseEquality() {
      let left = parseComparison();
      while (peek()?.type === 'op' && ['==', '!=', '===', '!=='].includes(peek().value)) {
        const op = consume().value;
        const right = parseComparison();
        if (op === '==' || op === '===') left = left === right;
        else left = left !== right;
      }
      return left;
    }

    function parseComparison() {
      let left = parseShift();
      while (peek()?.type === 'op' && ['<', '<=', '>', '>='].includes(peek().value)) {
        const op = consume().value;
        const right = parseShift();
        if (op === '<') left = left < right;
        else if (op === '<=') left = left <= right;
        else if (op === '>') left = left > right;
        else left = left >= right;
      }
      return left;
    }

    function parseShift() {
      let left = parseAdditive();
      while (peek()?.type === 'op' && ['<<', '>>', '>>>'].includes(peek().value)) {
        const op = consume().value;
        const right = parseAdditive();
        if (op === '<<') left = Number(left) << Number(right);
        else if (op === '>>') left = Number(left) >> Number(right);
        else left = Number(left) >>> Number(right);
      }
      return left;
    }

    function parseAdditive() {
      let left = parseMultiplicative();
      while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseMultiplicative();
        if (op === '+') {
          left = typeof left === 'string' || typeof right === 'string'
            ? `${left}${right}`
            : Number(left) + Number(right);
        } else {
          left = Number(left) - Number(right);
        }
      }
      return left;
    }

    function parseMultiplicative() {
      let left = parseExponent();
      while (peek()?.type === 'op' && ['*', '/', '%'].includes(peek().value)) {
        const op = consume().value;
        const right = parseExponent();
        if (op === '*') left = Number(left) * Number(right);
        else if (op === '/') {
          if (Number(right) === 0) throw new Error('Division by zero');
          left = Number(left) / Number(right);
        } else {
          if (Number(right) === 0) throw new Error('Modulo by zero');
          left = Number(left) % Number(right);
        }
      }
      return left;
    }

    function parseExponent() {
      const base = parseUnary();
      if (peek()?.type === 'op' && peek().value === '**') {
        consume();
        const exp = parseExponent();
        if (!Number.isFinite(Number(exp)) || Math.abs(Number(exp)) > 1000) {
          throw new Error('Exponent out of safe range (-1000..1000)');
        }
        return Math.pow(Number(base), Number(exp));
      }
      return base;
    }

    function parseUnary() {
      const tok = peek();
      if (tok?.type === 'op' && ['+', '-', '!', '~'].includes(tok.value)) {
        consume();
        const val = parseUnary();
        if (tok.value === '+') return +Number(val);
        if (tok.value === '-') return -Number(val);
        if (tok.value === '!') return !val;
        return ~Number(val);
      }
      return parsePrimary();
    }

    function parsePrimary() {
      const tok = peek();
      if (!tok) throw new Error('Unexpected end of expression');

      if (tok.type === 'number' || tok.type === 'string' || tok.type === 'boolean' || tok.type === 'null') {
        consume();
        return tok.value;
      }

      if (tok.type === '(') {
        consume();
        const val = parseTernary();
        if (peek()?.type !== ')') throw new Error("Expected closing ')'");
        consume();
        return val;
      }

      if (tok.type === 'ident') {
        const name = consume().value;
        if (peek()?.type === '(') {
          consume();
          const args = [];
          if (peek()?.type !== ')') {
            while (true) {
              args.push(parseTernary());
              if (peek()?.type === ',') {
                consume();
                continue;
              }
              break;
            }
          }
          if (peek()?.type !== ')') throw new Error(`Expected closing ')' for ${name}()`);
          consume();
          if (!Object.prototype.hasOwnProperty.call(PURE_FUNCTIONS, name)) {
            throw new Error(`Function '${name}' is not in the pure evaluator allowlist`);
          }
          return PURE_FUNCTIONS[name](...args);
        }
        if (Object.prototype.hasOwnProperty.call(PURE_CONSTANTS, name)) {
          return PURE_CONSTANTS[name];
        }
        throw new Error(`Unknown identifier '${name}'`);
      }

      throw new Error(`Unexpected token '${tok.value}'`);
    }

    const value = parseTernary();
    if (pos < tokens.length) {
      throw new Error(`Unexpected trailing token '${tokens[pos].value}'`);
    }

    const safeValue = typeof value === 'string' ? redactIdeString(value) : value;
    const formatted =
      typeof safeValue === 'string'
        ? JSON.stringify(safeValue)
        : safeValue === null
        ? 'null'
        : String(safeValue);

    return {
      ok: true,
      expression: redactIdeString(raw),
      value: safeValue,
      valueType: safeValue === null ? 'null' : typeof safeValue,
      formatted,
      tokensCount: tokens.length,
      durationMs: Math.max(0, Date.now() - start),
      engine: 'PURE_RECURSIVE_DESCENT_AST',
    };
  } catch (err) {
    return {
      ok: false,
      expression: redactIdeString(raw),
      error: redactIdeString(err?.message || 'Evaluation failed'),
      engine: 'PURE_RECURSIVE_DESCENT_AST',
    };
  }
}

// ============================================================================
// 7. SANITIZED EXPORTS & STARTER BUFFER PACK
// ============================================================================

export function buildIdeExports({
  filename = 'buffer.js',
  language = 'javascript',
  structure = null,
  lint = null,
  diff = null,
} = {}) {
  const safeName = redactIdeString(filename);
  const safeLang = detectLanguageFromFilename(safeName, language);
  const safeStruct = redactIdeOutput(structure || analyzeSourceStructure('', safeLang));
  const safeLint = redactIdeOutput(lint || lintSourceCode('', safeLang, safeName));
  const safeDiff = redactIdeOutput(diff || computeUnifiedDiff('', '', safeName));

  const payload = redactIdeOutput({
    schemaVersion: IDE_ENGINE_VERSION,
    tool: 'ide',
    filename: safeName,
    language: safeLang,
    structure: {
      lineCount: safeStruct.lineCount,
      nonEmptyLines: safeStruct.nonEmptyLines,
      byteLength: safeStruct.byteLength,
      tokenCount: safeStruct.tokenCount,
      cyclomaticComplexity: safeStruct.cyclomaticComplexity,
      complexityBand: safeStruct.complexityBand,
      bracketBalanced: safeStruct.bracketBalance?.balanced ?? true,
      importsCount: safeStruct.imports?.length || 0,
      exportsCount: safeStruct.exports?.length || 0,
      symbols: safeStruct.symbols || [],
      sha256: safeStruct.sha256,
    },
    lint: {
      score: safeLint.score,
      grade: safeLint.grade,
      summary: safeLint.summary,
      findings: safeLint.findings || [],
      sha256: safeLint.sha256,
    },
    diff: {
      hasChanges: safeDiff.hasChanges,
      stats: safeDiff.stats,
      sha256: safeDiff.sha256,
    },
  });

  const receiptSha256 = sha256Hex(JSON.stringify(payload));
  const fullPayload = { ...payload, receiptSha256 };

  const json = JSON.stringify(fullPayload, null, 2);

  const mdLines = [
    `# Sovereign Operator IDE — Review Brief (${safeName})`,
    '',
    `- **Engine Version:** \`v${IDE_ENGINE_VERSION}\``,
    `- **Language:** \`${safeLang}\``,
    `- **Lines / Tokens / Bytes:** ${safeStruct.lineCount} lines · ${safeStruct.tokenCount} tokens · ${safeStruct.byteLength} B`,
    `- **Cyclomatic Complexity:** ${safeStruct.cyclomaticComplexity} (${safeStruct.complexityBand})`,
    `- **Security & Hygiene Score:** ${safeLint.score}/100 (${safeLint.grade}) — ${safeLint.summary.total} finding(s)`,
    `- **Diff Summary:** +${safeDiff.stats.added} / -${safeDiff.stats.removed} (${safeDiff.stats.hunks} hunk(s))`,
    `- **SHA-256 Receipt:** \`${receiptSha256}\``,
    '',
    '## Extracted AST Symbols',
    ...(safeStruct.symbols.length
      ? safeStruct.symbols.map((s) => `- \`L${s.line}\` **${s.kind}** \`${s.name}\` (${s.detail})`)
      : ['- _No top-level symbols detected._']),
    '',
    '## Static Security & Hygiene Findings',
    ...(safeLint.findings.length
      ? safeLint.findings.map((f) => `- **[${f.severity}]** \`${f.ruleId}\` (Line ${f.line}): ${f.message} — _${f.hint}_`)
      : ['- No static security or hygiene issues detected.']),
    '',
    '## Unified Patch',
    '```diff',
    safeDiff.patchText.trimEnd(),
    '```',
  ];

  const csvRows = [
    ['category', 'severity', 'rule_or_kind', 'line', 'name_or_message', 'detail_or_hint'].map(escapeCsvField).join(','),
    ...safeStruct.symbols.map((s) =>
      ['symbol', 'INFO', s.kind, String(s.line), s.name, s.detail].map(escapeCsvField).join(',')
    ),
    ...safeLint.findings.map((f) =>
      ['lint', f.severity, f.ruleId, String(f.line), f.message, f.hint].map(escapeCsvField).join(',')
    ),
  ];

  return {
    receiptSha256,
    json,
    markdown: `${mdLines.join('\n')}\n`,
    csv: `${csvRows.join('\n')}\n`,
    patch: safeDiff.patchText,
  };
}

export const IDE_STARTER_FILES = Object.freeze([
  {
    id: 'sovereign_guard',
    filename: 'sovereign_guard.mjs',
    language: 'javascript',
    description: 'Loopback Host/Origin guard & path containment verifier',
    content: [
      "import path from 'node:path';",
      '',
      'const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);',
      '',
      'export function isTrustedLoopbackHost(rawHost) {',
      '  const host = String(rawHost || "").trim().toLowerCase();',
      '  if (!host) return false;',
      '  const bare = host.startsWith("[") ? host.slice(1, host.indexOf("]")) : host.split(":")[0];',
      '  return LOOPBACK_HOSTS.has(bare);',
      '}',
      '',
      'export function assertContainedPath(rootDir, relTarget) {',
      '  const base = path.resolve(rootDir);',
      '  const resolved = path.resolve(base, relTarget);',
      '  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {',
      '    throw new Error("Path traversal blocked");',
      '  }',
      '  return resolved;',
      '}',
      '',
      'export class LoopbackPolicyGate {',
      '  constructor(maxBytes = 65536) {',
      '    this.maxBytes = maxBytes;',
      '  }',
      '',
      '  allows(host, byteLength) {',
      '    return isTrustedLoopbackHost(host) && byteLength <= this.maxBytes;',
      '  }',
      '}',
    ].join('\n'),
  },
  {
    id: 'telemetry_probe',
    filename: 'telemetry_probe.py',
    language: 'python',
    description: 'Zero-egress loopback socket probe with latency percentiles',
    content: [
      'from dataclasses import dataclass',
      'import socket',
      'import time',
      '',
      'LOOPBACK_ADDR = "127.0.0.1"',
      '',
      '@dataclass',
      'class ProbeSample:',
      '    port: int',
      '    online: bool',
      '    rtt_ms: float',
      '',
      'def probe_loopback_port(port: int, timeout_s: float = 0.25) -> ProbeSample:',
      '    started = time.perf_counter()',
      '    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:',
      '        sock.settimeout(timeout_s)',
      '        code = sock.connect_ex((LOOPBACK_ADDR, port))',
      '    elapsed = round((time.perf_counter() - started) * 1000.0, 2)',
      '    return ProbeSample(port=port, online=(code == 0), rtt_ms=elapsed)',
      '',
      'def summarize_samples(samples: list[ProbeSample]) -> dict:',
      '    online = [s for s in samples if s.online]',
      '    if not online:',
      '        return {"up": 0, "total": len(samples), "max_ms": 0.0}',
      '    return {',
      '        "up": len(online),',
      '        "total": len(samples),',
      '        "max_ms": max(s.rtt_ms for s in online),',
      '    }',
    ].join('\n'),
  },
  {
    id: 'consensus_hash',
    filename: 'consensus_hash.rs',
    language: 'rust',
    description: 'Byzantine Fault Tolerant quorum threshold calculator',
    content: [
      'use std::cmp::max;',
      '',
      'pub struct QuorumSpec {',
      '    pub nodes: usize,',
      '    pub max_faults: usize,',
      '    pub quorum: usize,',
      '}',
      '',
      'impl QuorumSpec {',
      '    pub fn compute(nodes: usize) -> Result<Self, &\'static str> {',
      '        if nodes < 4 {',
      '            return Err("BFT requires at least 4 nodes (3f + 1)");',
      '        }',
      '        let max_faults = (nodes - 1) / 3;',
      '        let quorum = max(2 * max_faults + 1, (2 * nodes) / 3 + 1);',
      '        Ok(Self { nodes, max_faults, quorum })',
      '    }',
      '',
      '    pub fn reaches_quorum(&self, approvals: usize) -> bool {',
      '        approvals >= self.quorum',
      '    }',
      '}',
    ].join('\n'),
  },
  {
    id: 'ci_gate',
    filename: 'ci_gate.yml',
    language: 'yaml',
    description: 'Pinned zero-egress CI workflow manifest',
    content: [
      'name: Sovereign IDE Verification Gate',
      'on:',
      '  push:',
      '    branches: [main]',
      'permissions:',
      '  contents: read',
      'concurrency:',
      '  group: ide-gate-${{ github.ref }}',
      '  cancel-in-progress: true',
      'jobs:',
      '  verify:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9b6834',
      '      - run: npm test',
      '      - run: bash tools/scan-secrets.sh',
    ].join('\n'),
  },
]);

export const IDE_VULNERABLE_SAMPLE = Object.freeze({
  filename: 'unsafe_handler.mjs',
  language: 'javascript',
  content: [
    '// Sample with intentional static security findings for audit verification',
    'import { execSync } from "node:child_process";',
    '',
    'const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter";',
    'const WORK_DIR = "/home/operator/workspace/app";',
    `const LEAKED_KEY = "${['ghp', '1234567890abcdef1234567890abcdef'].join('_')}";`,
    '',
    'export function runUnsafe(userInput, targetEl) {',
    '  debugger;',
    '  console.log("debug", userInput);',
    '  targetEl.innerHTML = userInput;',
    '  const val = eval(userInput);',
    '  return execSync("ls " + userInput) + val;',
    '}',
  ].join('\n'),
});

export const IDE_HARDENED_SAMPLE = Object.freeze({
  filename: 'hardened_handler.mjs',
  language: 'javascript',
  content: [
    '// Hardened zero-egress handler: zero eval, zero shell interpolation, zero secrets',
    'import { execFileSync } from "node:child_process";',
    '',
    'const WORK_DIR = "~/workspace/app";',
    'const ALLOWED_FLAGS = new Set(["--version", "--help"]);',
    '',
    'export function runHardened(flag, targetEl) {',
    '  if (!ALLOWED_FLAGS.has(flag)) {',
    '    throw new Error("Disallowed argument");',
    '  }',
    '  const output = execFileSync("/usr/bin/git", [flag], { encoding: "utf8", timeout: 1500 });',
    '  if (targetEl) {',
    '    targetEl.textContent = `${WORK_DIR}: ${output.trim()}`;',
    '  }',
    '  return output.trim();',
    '}',
  ].join('\n'),
});

export function buildOfflineIdeSnapshot() {
  return {
    version: IDE_ENGINE_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    readOnly: true,
    zeroEgress: true,
    checkedAt: new Date().toISOString(),
    toolchains: EXPECTED_IDE_TOOLCHAINS.map((spec) => ({
      id: spec.id,
      label: spec.label,
      category: spec.category,
      purpose: spec.purpose,
      installed: false,
      path: null,
      version: null,
    })),
    summary: {
      installedToolchains: 0,
      totalToolchains: EXPECTED_IDE_TOOLCHAINS.length,
      repoCount: 0,
    },
    repos: [],
    note: 'Loopback Studio API (127.0.0.1:3000) unreachable — running 100% client-side with multi-file starter buffers, AST outlining, static security linter, unified diff engine, and pure expression evaluator.',
  };
}

export function buildLiveIdeSnapshot({ toolchains = [], repos = [], checkedAt = new Date().toISOString() } = {}) {
  const safeToolchains = redactIdeOutput(toolchains);
  const safeRepos = redactIdeOutput(repos);
  const installedCount = safeToolchains.filter((t) => t.installed).length;
  return {
    version: IDE_ENGINE_VERSION,
    mode: 'LIVE_HOST_WORKSPACE',
    readOnly: true,
    zeroEgress: true,
    checkedAt,
    toolchains: safeToolchains,
    summary: {
      installedToolchains: installedCount,
      totalToolchains: safeToolchains.length,
      repoCount: safeRepos.length,
    },
    repos: safeRepos,
    note: 'Read-only loopback host toolchain and ~/NullAITech/ workspace inspector active. Secret files (.env*, *.pem, *.key, id_rsa*, hosts.yml, *.db) are strictly blocked.',
  };
}
