/**
 * Pure Cryptographic JWT Inspector Guard Engine (v2.6.0)
 * Shared byte-identically between browser (src/utils/jwtInspectorEngine.js)
 * and Node server/tests (server/jwt-inspector-engine.mjs).
 *
 * Zero external dependencies. Uses standard Web Crypto (globalThis.crypto.subtle).
 */

export const JWT_ENGINE_VERSION = '2.6.0';

export const WEAK_HMAC_SECRETS = [
  'secret', 'password', 'password123', '123456', '12345678', 'admin', 'jwt', 'key', 'root',
  'your-256-bit-secret', 'your-secret-key', 'my-secret-key', 'jwt_secret', 'supersecret',
  'secret123', 'changeme', 'letmein', 'welcome', 'test', 'demo', 'development', 'production',
  'default', 'master', 'token', 'access', 'private', 'api_key', 'qwerty', '123456789',
  'sovereign_jwt_secret_key_2026', 'sovereign-jwt-256bit-demo-key-2026', 'shhhhh', 'auth0',
  'firebase', 'supabase', 'nextauth', 'jsonwebtoken', 'flask_secret_key', 'django_secret_key'
];

function getSubtle() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto SubtleCrypto API is unavailable in this runtime.');
}

function getRandomBytes(len) {
  const out = new Uint8Array(len);
  globalThis.crypto.getRandomValues(out);
  return out;
}

export function base64UrlToBytes(str) {
  const clean = String(str || '').trim().replace(/-/g, '+').replace(/_/g, '/');
  if (!clean) return new Uint8Array(0);
  const padLen = (4 - (clean.length % 4)) % 4;
  const padded = clean + '='.repeat(padLen);
  if (typeof atob === 'function') {
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

export function bytesToBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (typeof btoa === 'function') {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecodeString(str) {
  try {
    const bytes = base64UrlToBytes(str);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function base64UrlEncodeString(str) {
  return bytesToBase64Url(new TextEncoder().encode(String(str)));
}

export function base64UrlDecodeJson(str) {
  const decoded = base64UrlDecodeString(str);
  if (decoded === null) return null;
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function base64UrlEncodeJson(obj) {
  return base64UrlEncodeString(JSON.stringify(obj));
}

export function calculateShannonEntropy(input) {
  const bytes = new TextEncoder().encode(String(input || ''));
  if (bytes.length === 0) return 0;
  const counts = new Map();
  for (let i = 0; i < bytes.length; i++) {
    counts.set(bytes[i], (counts.get(bytes[i]) || 0) + 1);
  }
  let h = 0;
  const n = bytes.length;
  for (const count of counts.values()) {
    const p = count / n;
    h -= p * Math.log2(p);
  }
  return Number(h.toFixed(4));
}

export function parseJwt(token) {
  const raw = String(token || '').trim();
  const parts = raw.split('.');
  if (parts.length < 2 || parts.length > 3) {
    return {
      isValidFormat: false,
      rawToken: raw,
      headerB64: parts[0] || '',
      payloadB64: parts[1] || '',
      signatureB64: parts[2] || '',
      header: null,
      payload: null,
      algorithm: 'UNKNOWN',
      entropy: calculateShannonEntropy(raw),
      error: 'Malformed JWT structure: expected 3 dot-separated Base64URL segments.',
    };
  }
  const [headerB64, payloadB64, signatureB64 = ''] = parts;
  const header = base64UrlDecodeJson(headerB64);
  const payload = base64UrlDecodeJson(payloadB64);
  const isValidFormat = Boolean(header && typeof header === 'object' && payload && typeof payload === 'object');
  return {
    isValidFormat,
    rawToken: raw,
    headerB64,
    payloadB64,
    signatureB64,
    header,
    payload,
    algorithm: (header && header.alg) ? String(header.alg) : 'UNKNOWN',
    entropy: calculateShannonEntropy(raw),
    error: isValidFormat ? null : 'Failed to parse Base64URL JSON header or payload.',
  };
}

export function validateClaims(payload, options = {}) {
  const now = typeof options.currentTime === 'number' ? options.currentTime : Math.floor(Date.now() / 1000);
  const leeway = Number(options.leeway || 0);
  const errors = [];
  const warnings = [];
  let expired = false;
  let timeToExpirySec = null;

  if (!payload || typeof payload !== 'object') {
    return { valid: false, expired: false, timeToExpirySec: null, errors: ['Payload is not a JSON object.'], warnings: [] };
  }

  if (payload.exp !== undefined) {
    if (typeof payload.exp !== 'number') {
      errors.push('Claim "exp" must be a numeric Unix timestamp.');
    } else {
      timeToExpirySec = Math.round(payload.exp - now);
      if (now > payload.exp + leeway) {
        expired = true;
        errors.push(`Token expired ${Math.abs(timeToExpirySec)}s ago.`);
      }
    }
  } else {
    warnings.push('Missing "exp" expiration claim; token never expires.');
  }

  if (payload.nbf !== undefined) {
    if (typeof payload.nbf !== 'number') {
      errors.push('Claim "nbf" must be a numeric Unix timestamp.');
    } else if (now < payload.nbf - leeway) {
      errors.push(`Token not valid before ${payload.nbf} (${Math.round(payload.nbf - now)}s ahead).`);
    }
  }

  if (payload.iat !== undefined && typeof payload.iat === 'number') {
    if (payload.iat > now + leeway + 300) {
      warnings.push(`Claim "iat" is issued in the future (${Math.round(payload.iat - now)}s ahead).`);
    }
    if (typeof payload.exp === 'number' && payload.exp < payload.iat) {
      errors.push('Chronological anomaly: "exp" precedes "iat".');
    }
  }

  if (options.expectedIssuer && payload.iss !== options.expectedIssuer) {
    errors.push(`Issuer mismatch: expected "${options.expectedIssuer}", got "${payload.iss}".`);
  }

  if (options.expectedAudience) {
    const audList = Array.isArray(payload.aud) ? payload.aud : (payload.aud ? [payload.aud] : []);
    if (!audList.includes(options.expectedAudience)) {
      errors.push(`Audience mismatch: expected "${options.expectedAudience}".`);
    }
  }

  return {
    valid: errors.length === 0,
    expired,
    timeToExpirySec,
    errors,
    warnings,
  };
}

export function lintJwtSecurity(token, options = {}) {
  const parsed = parseJwt(token);
  const findings = [];
  let score = 100;

  if (!parsed.isValidFormat) {
    return {
      parsed,
      claims: validateClaims(null),
      score: 0,
      grade: 'F',
      riskLevel: 'CRITICAL',
      findings: [{ rule: 'SYNTAX-001', severity: 'CRITICAL', text: parsed.error, remediation: 'Supply a valid 3-part compact JWS token.' }],
    };
  }

  const { header, payload, signatureB64 } = parsed;
  const alg = String(header.alg || '').trim();
  const algUpper = alg.toUpperCase();

  if (!alg || algUpper === 'NONE') {
    score -= 55;
    findings.push({
      rule: 'CVE-2015-9235',
      severity: 'CRITICAL',
      text: `Unsigned alg:"${alg}" token allows arbitrary payload forgery when verifiers omit an explicit algorithm allowlist.`,
      remediation: 'Reject alg:none unconditionally and pin HS256, ES256, or RS256.',
    });
  }

  if (!signatureB64 && algUpper !== 'NONE') {
    score -= 45;
    findings.push({
      rule: 'SIG-EMPTY-001',
      severity: 'CRITICAL',
      text: `Algorithm ${alg} declared but JWS signature segment is empty.`,
      remediation: 'Reject unsigned tokens lacking a cryptographic signature.',
    });
  }

  if (header.kid !== undefined) {
    const kidStr = String(header.kid);
    if (/\.\.|\/dev\/null|\/etc\/|['";]|union\s+select/i.test(kidStr)) {
      score -= 35;
      findings.push({
        rule: 'CVE-2018-1000531',
        severity: 'CRITICAL',
        text: `Header "kid" ("${kidStr}") contains path traversal or SQL injection syntax.`,
        remediation: 'Look up kid strictly in a static in-memory key map; never pass kid to filesystem paths or SQL queries.',
      });
    }
  }

  if (header.jku) {
    score -= 30;
    findings.push({
      rule: 'CVE-2018-0114',
      severity: 'HIGH',
      text: `Untrusted "jku" header URL ("${String(header.jku)}") poses SSRF and attacker-key spoofing risks.`,
      remediation: 'Disable dynamic jku key fetching or pin an immutable trusted domain allowlist.',
    });
  }

  if (header.x5u) {
    score -= 30;
    findings.push({
      rule: 'HEADER-X5U-001',
      severity: 'HIGH',
      text: `Untrusted "x5u" certificate URL ("${String(header.x5u)}") embedded in JOSE header.`,
      remediation: 'Ignore client-supplied x5u URLs and validate with local root certificates.',
    });
  }

  if (header.jwk && String(header.typ || '').toLowerCase() !== 'dpop+jwt') {
    score -= 25;
    findings.push({
      rule: 'HEADER-JWK-001',
      severity: 'HIGH',
      text: 'Inline public "jwk" embedded in bearer JWT header.',
      remediation: 'Never trust self-embedded header JWK keys for bearer token verification.',
    });
  }

  if (options.hmacSecret && algUpper.startsWith('HS')) {
    if (WEAK_HMAC_SECRETS.includes(String(options.hmacSecret)) || String(options.hmacSecret).length < 16) {
      score -= 25;
      findings.push({
        rule: 'WEAK-SECRET-001',
        severity: 'HIGH',
        text: 'Configured HMAC secret is short (<16 chars) or present in common weak-secret dictionaries.',
        remediation: 'Use at least 256 bits (32+ cryptographically random bytes) for HMAC secrets.',
      });
    }
  }

  const claims = validateClaims(payload, options);
  if (claims.expired) {
    score -= 20;
    findings.push({
      rule: 'TIMING-EXP-001',
      severity: 'HIGH',
      text: claims.errors.find((e) => e.includes('expired')) || 'Token is expired.',
      remediation: 'Reject expired tokens and require re-authentication.',
    });
  } else if (payload.exp === undefined) {
    score -= 15;
    findings.push({
      rule: 'TIMING-EXP-002',
      severity: 'MEDIUM',
      text: 'Missing "exp" expiration claim; token has indefinite validity.',
      remediation: 'Include a bounded exp claim (15-60 minutes for access tokens).',
    });
  }

  if (payload.nbf !== undefined && claims.errors.some((e) => e.includes('not valid before'))) {
    score -= 10;
    findings.push({
      rule: 'TIMING-NBF-001',
      severity: 'MEDIUM',
      text: claims.errors.find((e) => e.includes('not valid before')),
      remediation: 'Enforce nbf temporal gating with bounded clock skew leeway.',
    });
  }

  const sensitiveKeyRe = /(password|passwd|secret|api[_-]?key|private[_-]?key|ssn|credit[_-]?card|seed|aws[_-]?key)/i;
  const leakedKeys = Object.keys(payload).filter((k) => sensitiveKeyRe.test(k));
  if (leakedKeys.length > 0) {
    score -= 35;
    findings.push({
      rule: 'LEAK-CRED-001',
      severity: 'CRITICAL',
      text: `Sensitive credentials exposed in cleartext JWT payload keys: ${leakedKeys.join(', ')}.`,
      remediation: 'Remove secrets from JWT claims or encrypt payloads via JWE.',
    });
  }

  const payloadStr = JSON.stringify(payload);
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(payloadStr)) {
    score -= 5;
    findings.push({
      rule: 'PII-EMAIL-001',
      severity: 'LOW',
      text: 'Plaintext email address (PII) detected inside unencrypted JWT payload.',
      remediation: 'Prefer opaque subject identifiers (sub) when PII minimization is required.',
    });
  }

  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const riskLevel = score >= 85 ? 'LOW' : score >= 60 ? 'MEDIUM' : score >= 40 ? 'HIGH' : 'CRITICAL';

  return { parsed, claims, score, grade, riskLevel, findings };
}

export async function signHmacJwt(header, payload, secret, alg = 'HS256') {
  const algUpper = String(alg || header?.alg || 'HS256').toUpperCase();
  const hdr = { ...(header || {}), alg: algUpper === 'NONE' ? 'none' : algUpper, typ: (header && header.typ) || 'JWT' };
  const hB64 = base64UrlEncodeJson(hdr);
  const pB64 = base64UrlEncodeJson(payload || {});
  if (algUpper === 'NONE') {
    return `${hB64}.${pB64}.`;
  }
  const hash = algUpper === 'HS384' ? 'SHA-384' : algUpper === 'HS512' ? 'SHA-512' : 'SHA-256';
  const blockSize = algUpper === 'HS256' ? 64 : 128;
  const enc = new TextEncoder();
  const rawKey = enc.encode(String(secret ?? ''));
  // Per RFC 2104, an empty HMAC key is mathematically identical to a block of zero bytes (WebCrypto rejects 0-length keys)
  const keyBytes = rawKey.length > 0 ? rawKey : new Uint8Array(blockSize);
  const key = await getSubtle().importKey('raw', keyBytes, { name: 'HMAC', hash }, false, ['sign']);
  const sigBuf = await getSubtle().sign('HMAC', key, enc.encode(`${hB64}.${pB64}`));
  return `${hB64}.${pB64}.${bytesToBase64Url(sigBuf)}`;
}

export async function verifyHmacJwt(token, secret, options = {}) {
  const parsed = parseJwt(token);
  if (!parsed.isValidFormat) return { valid: false, algorithm: 'UNKNOWN', reason: 'Malformed JWT' };
  const alg = String(options.algorithm || parsed.algorithm || 'HS256').toUpperCase();
  if (alg === 'NONE') {
    if (!options.allowNone) {
      return { valid: false, algorithm: 'none', reason: 'CVE-2015-9235: alg:none rejected by default (fail-closed).' };
    }
    return { valid: parsed.signatureB64 === '', algorithm: 'none', reason: 'Explicit allowNone opt-in.' };
  }
  if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
    return { valid: false, algorithm: alg, reason: `Algorithm ${alg} is not an HMAC algorithm.` };
  }
  const hash = alg === 'HS384' ? 'SHA-384' : alg === 'HS512' ? 'SHA-512' : 'SHA-256';
  const blockSize = alg === 'HS256' ? 64 : 128;
  const enc = new TextEncoder();
  const rawKey = enc.encode(String(secret ?? ''));
  const keyBytes = rawKey.length > 0 ? rawKey : new Uint8Array(blockSize);
  const key = await getSubtle().importKey('raw', keyBytes, { name: 'HMAC', hash }, false, ['sign']);
  const sigBuf = await getSubtle().sign('HMAC', key, enc.encode(`${parsed.headerB64}.${parsed.payloadB64}`));
  const expected = bytesToBase64Url(sigBuf);
  const valid = expected === parsed.signatureB64;
  return {
    valid,
    algorithm: alg,
    reason: valid ? `Signature verified via Web Crypto ${alg}.` : `Signature mismatch for ${alg}.`,
  };
}

export async function verifyAsymmetricJwt(token, jwk) {
  const parsed = parseJwt(token);
  if (!parsed.isValidFormat) return { valid: false, algorithm: 'UNKNOWN', reason: 'Malformed JWT' };
  const alg = String(parsed.algorithm || '').toUpperCase();
  if (!jwk || typeof jwk !== 'object') {
    return { valid: false, algorithm: alg, reason: 'Public JWK object is required.' };
  }
  if (String(jwk.kty || '').toLowerCase() === 'oct') {
    return { valid: false, algorithm: alg, reason: 'Symmetric oct JWK is not valid for asymmetric verification.' };
  }
  try {
    const data = new TextEncoder().encode(`${parsed.headerB64}.${parsed.payloadB64}`);
    const sigBytes = base64UrlToBytes(parsed.signatureB64);
    if (alg === 'ES256') {
      const pub = { ...jwk };
      delete pub.d;
      delete pub.key_ops;
      const key = await getSubtle().importKey('jwk', pub, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const valid = await getSubtle().verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sigBytes, data);
      return { valid, algorithm: alg, reason: valid ? 'ES256 ECDSA P-256 signature verified.' : 'ES256 signature verification failed.' };
    }
    if (['RS256', 'RS384', 'RS512'].includes(alg)) {
      const hash = alg === 'RS384' ? 'SHA-384' : alg === 'RS512' ? 'SHA-512' : 'SHA-256';
      const pub = { ...jwk };
      ['d', 'p', 'q', 'dp', 'dq', 'qi', 'key_ops'].forEach((k) => delete pub[k]);
      const key = await getSubtle().importKey('jwk', pub, { name: 'RSASSA-PKCS1-v1_5', hash }, false, ['verify']);
      const valid = await getSubtle().verify({ name: 'RSASSA-PKCS1-v1_5' }, key, sigBytes, data);
      return { valid, algorithm: alg, reason: valid ? `${alg} RSA signature verified.` : `${alg} signature verification failed.` };
    }
    return { valid: false, algorithm: alg, reason: `Unsupported asymmetric algorithm: ${alg}` };
  } catch (err) {
    return { valid: false, algorithm: alg, reason: `Verification error: ${err.message}` };
  }
}

export async function generateEs256KeypairAndSign(payload, headerExtra = {}) {
  const kp = await getSubtle().generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const rawPub = await getSubtle().exportKey('jwk', kp.publicKey);
  const publicJwk = { kty: 'EC', crv: 'P-256', x: rawPub.x, y: rawPub.y, use: 'sig' };
  const header = { alg: 'ES256', typ: 'JWT', ...headerExtra };
  const hB64 = base64UrlEncodeJson(header);
  const pB64 = base64UrlEncodeJson(payload);
  const sigBuf = await getSubtle().sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    kp.privateKey,
    new TextEncoder().encode(`${hB64}.${pB64}`)
  );
  const token = `${hB64}.${pB64}.${bytesToBase64Url(sigBuf)}`;
  const thumbprint = await computeJwkThumbprint(publicJwk);
  return { token, publicJwk, thumbprint };
}

export async function computeJwkThumbprint(jwk) {
  if (!jwk || typeof jwk !== 'object') throw new Error('Invalid JWK object');
  let canonical;
  if (jwk.kty === 'EC') {
    canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
  } else if (jwk.kty === 'RSA') {
    canonical = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
  } else {
    throw new Error(`Unsupported JWK kty for RFC 7638 thumbprint: ${jwk.kty}`);
  }
  const digest = await getSubtle().digest('SHA-256', new TextEncoder().encode(canonical));
  return bytesToBase64Url(digest);
}

export async function computeAccessTokenHash(accessToken) {
  const digest = await getSubtle().digest('SHA-256', new TextEncoder().encode(String(accessToken || '')));
  return bytesToBase64Url(digest);
}

export function normalizeDpopHtu(rawUrl) {
  const u = new URL(String(rawUrl || '').trim());
  let host = u.host.toLowerCase();
  if (u.protocol === 'https:' && host.endsWith(':443')) host = host.slice(0, -4);
  if (u.protocol === 'http:' && host.endsWith(':80')) host = host.slice(0, -3);
  return `${u.protocol.toLowerCase()}//${host}${u.pathname || '/'}`;
}

export async function createEs256DpopProof({ method = 'POST', url = 'https://api.example.com/v1/resource', accessToken = '', nonce = '' } = {}) {
  const normHtu = normalizeDpopHtu(url);
  const kp = await getSubtle().generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const rawPub = await getSubtle().exportKey('jwk', kp.publicKey);
  const publicJwk = { kty: 'EC', crv: 'P-256', x: rawPub.x, y: rawPub.y, use: 'sig' };
  const jkt = await computeJwkThumbprint(publicJwk);
  const claims = {
    jti: `dpop-${bytesToBase64Url(getRandomBytes(16))}`,
    htm: String(method).toUpperCase().trim(),
    htu: normHtu,
    iat: Math.floor(Date.now() / 1000),
  };
  let ath = null;
  if (accessToken) {
    ath = await computeAccessTokenHash(accessToken);
    claims.ath = ath;
  }
  if (nonce) claims.nonce = nonce;
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: publicJwk };
  const hB64 = base64UrlEncodeJson(header);
  const pB64 = base64UrlEncodeJson(claims);
  const sigBuf = await getSubtle().sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    kp.privateKey,
    new TextEncoder().encode(`${hB64}.${pB64}`)
  );
  return {
    proofJwt: `${hB64}.${pB64}.${bytesToBase64Url(sigBuf)}`,
    jkt,
    ath,
    htu: normHtu,
    htm: claims.htm,
    publicJwk,
  };
}

export async function verifyEs256DpopProof({ proofJwt, method = 'POST', url = 'https://api.example.com/v1/resource', accessToken = '', expectedNonce = '', boundJkt = '' }) {
  const parsed = parseJwt(proofJwt);
  const errors = [];
  if (!parsed.isValidFormat) {
    return { valid: false, signatureValid: false, jkt: '', errors: ['Malformed DPoP compact JWS.'] };
  }
  const { header, payload } = parsed;
  if (header.typ !== 'dpop+jwt') errors.push('Header "typ" must equal "dpop+jwt".');
  if (!header.alg || String(header.alg).toLowerCase() === 'none' || String(header.alg).toUpperCase().startsWith('HS')) {
    errors.push(`Forbidden DPoP algorithm "${header.alg}".`);
  }
  if (!header.jwk || typeof header.jwk !== 'object' || header.jwk.kty === 'oct') {
    errors.push('RFC 9449 §4.2 requires an embedded asymmetric public JWK (kty != oct).');
  }
  if (header.jwk && header.jwk.d) errors.push('Private key parameter "d" exposed in DPoP JWK header.');

  let sigRes = { valid: false };
  if (header.jwk && header.jwk.kty !== 'oct') {
    sigRes = await verifyAsymmetricJwt(proofJwt, header.jwk);
  }
  if (!sigRes.valid) errors.push('Cryptographic DPoP signature verification failed.');

  const normExpected = normalizeDpopHtu(url);
  if (String(payload.htm || '').toUpperCase() !== String(method).toUpperCase()) {
    errors.push(`HTTP method mismatch: expected ${method}, got ${payload.htm}.`);
  }
  if (!payload.htu || normalizeDpopHtu(payload.htu) !== normExpected) {
    errors.push(`HTTP URI mismatch: expected ${normExpected}, got ${payload.htu}.`);
  }
  if (accessToken) {
    const expectedAth = await computeAccessTokenHash(accessToken);
    if (payload.ath !== expectedAth) errors.push('Access token hash (ath) mismatch.');
  }
  if (expectedNonce && payload.nonce !== expectedNonce) {
    errors.push('Server nonce challenge mismatch.');
  }

  let jkt = '';
  if (header.jwk && header.jwk.kty !== 'oct') {
    try { jkt = await computeJwkThumbprint(header.jwk); } catch {}
  }
  if (boundJkt && jkt !== boundJkt) {
    errors.push('Token confirmation binding (cnf.jkt) mismatch.');
  }

  return {
    valid: sigRes.valid && errors.length === 0,
    signatureValid: Boolean(sigRes.valid),
    jkt,
    errors,
  };
}

export async function crackHmacWeakSecret(token, extraWords = []) {
  const parsed = parseJwt(token);
  if (!parsed.isValidFormat) return { found: false, secret: null, attempts: 0, algorithm: 'UNKNOWN' };
  const alg = String(parsed.algorithm || 'HS256').toUpperCase();
  if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
    return { found: false, secret: null, attempts: 0, algorithm: alg };
  }
  const candidates = [...new Set([...extraWords, ...WEAK_HMAC_SECRETS])];
  for (let i = 0; i < candidates.length; i++) {
    const res = await verifyHmacJwt(token, candidates[i], { algorithm: alg });
    if (res.valid) {
      return { found: true, secret: candidates[i], attempts: i + 1, algorithm: alg };
    }
  }
  return { found: false, secret: null, attempts: candidates.length, algorithm: alg };
}

export async function tamperJwt(token, attackType) {
  const parsed = parseJwt(token);
  if (!parsed.isValidFormat) return token;
  const header = { ...parsed.header };
  const payload = { ...parsed.payload };
  if (attackType === 'none') {
    header.alg = 'none';
    return `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}.`;
  }
  if (attackType === 'strip_signature') {
    return `${parsed.headerB64}.${parsed.payloadB64}.`;
  }
  if (attackType === 'kid_traversal') {
    header.kid = '../../../dev/null';
    return signHmacJwt(header, payload, '', 'HS256');
  }
  if (attackType === 'jku_ssrf') {
    header.jku = 'https://attacker.example.invalid/jwks.json';
    return signHmacJwt(header, payload, 'secret', 'HS256');
  }
  if (attackType === 'admin_escalate') {
    payload.role = 'admin';
    payload.is_admin = true;
    const alg = ['HS256', 'HS384', 'HS512'].includes(String(header.alg).toUpperCase()) ? String(header.alg).toUpperCase() : 'HS256';
    return signHmacJwt(header, payload, 'secret', alg);
  }
  return token;
}

export function csvSafeCell(value) {
  const s = String(value ?? '');
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function buildAuditExports(audit) {
  const jsonText = JSON.stringify(
    {
      tool: 'jwt-inspector-guard',
      version: JWT_ENGINE_VERSION,
      algorithm: audit.parsed.algorithm,
      entropy: audit.parsed.entropy,
      score: audit.score,
      grade: audit.grade,
      riskLevel: audit.riskLevel,
      findings: audit.findings,
    },
    null,
    2
  );

  const mdLines = [
    `# JWT Inspector Guard Audit (v${JWT_ENGINE_VERSION})`,
    '',
    `- **Algorithm**: \`${audit.parsed.algorithm}\``,
    `- **Score**: \`${audit.score}/100 (Grade ${audit.grade} · ${audit.riskLevel})\``,
    `- **Shannon Entropy**: \`${audit.parsed.entropy} bits/byte\``,
    '',
    `## Findings (${audit.findings.length})`,
    '',
    ...audit.findings.map((f) => `- **[${f.severity}] ${f.rule}**: ${f.text}`),
  ];

  const csvRows = [
    ['rule', 'severity', 'text', 'remediation'].map(csvSafeCell).join(','),
    ...audit.findings.map((f) => [f.rule, f.severity, f.text, f.remediation].map(csvSafeCell).join(',')),
  ];

  return { json: jsonText, markdown: mdLines.join('\n'), csv: csvRows.join('\n') };
}
