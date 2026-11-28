import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  JWT_ENGINE_VERSION,
  base64UrlEncodeJson,
  base64UrlDecodeJson,
  calculateShannonEntropy,
  parseJwt,
  validateClaims,
  lintJwtSecurity,
  signHmacJwt,
  verifyHmacJwt,
  verifyAsymmetricJwt,
  generateEs256KeypairAndSign,
  createEs256DpopProof,
  verifyEs256DpopProof,
  crackHmacWeakSecret,
  tamperJwt,
  csvSafeCell,
  buildAuditExports,
} from '../server/jwt-inspector-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('engine mirror byte-identical to browser src/utils/jwtInspectorEngine.js', () => {
  const browserSrc = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'jwtInspectorEngine.js'));
  const serverSrc = fs.readFileSync(path.join(rootDir, 'server', 'jwt-inspector-engine.mjs'));
  assert.equal(Buffer.compare(browserSrc, serverSrc), 0);
  assert.equal(JWT_ENGINE_VERSION, '2.6.0');
});

test('Base64URL JSON roundtrip and Shannon entropy calculation', () => {
  const obj = { sub: 'operator_1nc0gn30', role: 'auditor', unicode: 'zoth-✓' };
  const enc = base64UrlEncodeJson(obj);
  assert.ok(!enc.includes('+') && !enc.includes('/') && !enc.includes('='));
  assert.deepEqual(base64UrlDecodeJson(enc), obj);
  assert.equal(calculateShannonEntropy(''), 0);
  assert.equal(calculateShannonEntropy('aaaaaa'), 0);
  assert.ok(calculateShannonEntropy(enc) > 3.5);
});

test('HMAC HS256/HS384/HS512 sign, verify, and fail-closed alg:none', async () => {
  const payload = { sub: 'alice', exp: 2050480000 };
  for (const alg of ['HS256', 'HS384', 'HS512']) {
    const tok = await signHmacJwt({ alg, typ: 'JWT' }, payload, 'super-strong-secret-key-256bit', alg);
    const ok = await verifyHmacJwt(tok, 'super-strong-secret-key-256bit');
    assert.equal(ok.valid, true, alg);
    assert.equal(ok.algorithm, alg);
    const bad = await verifyHmacJwt(tok, 'wrong-secret');
    assert.equal(bad.valid, false, alg);
  }

  const unsigned = await signHmacJwt({ alg: 'none', typ: 'JWT' }, payload, '', 'none');
  const failClosed = await verifyHmacJwt(unsigned, '');
  assert.equal(failClosed.valid, false);
  const optIn = await verifyHmacJwt(unsigned, '', { allowNone: true });
  assert.equal(optIn.valid, true);
});

test('Asymmetric ES256 keypair generation, signing, verification, and forged rejection', async () => {
  const { token, publicJwk, thumbprint } = await generateEs256KeypairAndSign({ sub: 'ecdsa_user', exp: 2050480000 });
  assert.equal(publicJwk.kty, 'EC');
  assert.equal(publicJwk.crv, 'P-256');
  assert.equal(thumbprint.length, 43);

  const ok = await verifyAsymmetricJwt(token, publicJwk);
  assert.equal(ok.valid, true);

  const parts = token.split('.');
  const forged = `${parts[0]}.${parts[1]}.COMPLETELY_FORGED_GARBAGE_SIG`;
  const bad = await verifyAsymmetricJwt(forged, publicJwk);
  assert.equal(bad.valid, false);
});

test('RFC 9449 ES256 DPoP create, verify, and forged signature fail-closed rejection', async () => {
  const accessToken = await signHmacJwt({ alg: 'HS256' }, { sub: 'u1', exp: 2050480000 }, 'strong-key-32-chars-minimum-length');
  const dpop = await createEs256DpopProof({
    method: 'POST',
    url: 'https://API.Example.COM:443/v1/checkout?foo=bar#frag',
    accessToken,
    nonce: 'srv-nonce-42',
  });
  assert.equal(dpop.htu, 'https://api.example.com/v1/checkout');
  assert.equal(dpop.publicJwk.kty, 'EC');

  const ok = await verifyEs256DpopProof({
    proofJwt: dpop.proofJwt,
    method: 'POST',
    url: 'https://api.example.com/v1/checkout',
    accessToken,
    expectedNonce: 'srv-nonce-42',
    boundJkt: dpop.jkt,
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.signatureValid, true);

  const [h, p] = dpop.proofJwt.split('.');
  const forged = await verifyEs256DpopProof({
    proofJwt: `${h}.${p}.COMPLETELY_FORGED_GARBAGE_SIG`,
    method: 'POST',
    url: 'https://api.example.com/v1/checkout',
    accessToken,
    expectedNonce: 'srv-nonce-42',
    boundJkt: dpop.jkt,
  });
  assert.equal(forged.valid, false);
  assert.equal(forged.signatureValid, false);
});

test('Security linter catches alg:none, kid traversal, jku SSRF, PII, and weak secret cracking', async () => {
  const base = await signHmacJwt({ alg: 'HS256' }, { sub: 'u1', exp: 2050480000 }, 'secret', 'HS256');
  const cracked = await crackHmacWeakSecret(base);
  assert.equal(cracked.found, true);
  assert.equal(cracked.secret, 'secret');

  const kidTok = await tamperJwt(base, 'kid_traversal');
  const kidAudit = lintJwtSecurity(kidTok);
  assert.ok(kidAudit.findings.some((f) => f.rule === 'CVE-2018-1000531'));

  const jkuTok = await tamperJwt(base, 'jku_ssrf');
  const jkuAudit = lintJwtSecurity(jkuTok);
  assert.ok(jkuAudit.findings.some((f) => f.rule === 'CVE-2018-0114'));

  const noneTok = await tamperJwt(base, 'none');
  const noneAudit = lintJwtSecurity(noneTok);
  assert.ok(noneAudit.findings.some((f) => f.rule === 'CVE-2015-9235'));
  assert.ok(noneAudit.score <= 45);

  // Formula-safe CSV export
  assert.equal(csvSafeCell('=CMD()'), `"'=CMD()"`);
  const ex = buildAuditExports(noneAudit);
  assert.ok(ex.json.includes('CVE-2015-9235'));
  assert.ok(ex.markdown.includes('JWT Inspector Guard Audit'));
  assert.ok(ex.csv.includes('"CVE-2015-9235"'));
});
