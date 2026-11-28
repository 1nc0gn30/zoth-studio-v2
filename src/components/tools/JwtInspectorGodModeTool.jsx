import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Tabs, Tab, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import BugReportIcon from '@mui/icons-material/BugReport';
import KeyIcon from '@mui/icons-material/VpnKey';
import DownloadIcon from '@mui/icons-material/Download';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import { useCopy } from '../sovereign/hooks.js';
import {
  JWT_ENGINE_VERSION,
  base64UrlEncodeJson,
  lintJwtSecurity,
  signHmacJwt,
  verifyHmacJwt,
  verifyAsymmetricJwt,
  generateEs256KeypairAndSign,
  createEs256DpopProof,
  verifyEs256DpopProof,
  crackHmacWeakSecret,
  tamperJwt,
  buildAuditExports,
} from '../../utils/jwtInspectorEngine.js';

const mono = 'ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace';

const buildDemoToken = (header, payload, sig = '') =>
  `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}.${sig}`;

const SAMPLE_TOKENS = [
  {
    label: 'Standard Valid HS256',
    token: buildDemoToken(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'user_sovereign_9921', name: '1nc0gn30', org: 'NullAI', role: 'admin', iat: 1729382400, exp: 1893456000 },
      '43Nv0NohcGAqTUCxiqpJxApl7uXKWtIEzZPlqNkRnvI'
    ),
    secret: 'sovereign_jwt_secret_key_2026',
  },
  {
    label: 'CVE-2015-9235 (alg: none)',
    token: buildDemoToken(
      { alg: 'none', typ: 'JWT' },
      { sub: 'admin_bypass', role: 'superadmin', iat: 1729382400 },
      ''
    ),
    secret: '',
  },
  {
    label: 'CVE-2018-1000531 (kid traversal)',
    token: buildDemoToken(
      { alg: 'HS256', typ: 'JWT', kid: '../../../dev/null' },
      { sub: 'attacker', role: 'root', exp: 2050480000 },
      'demo_kid_traversal_sig'
    ),
    secret: '',
  },
  {
    label: 'Sensitive Credential Leak',
    token: buildDemoToken(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'user_leak', email: 'admin@example.invalid', api_key: 'demo_placeholder_key', secret_seed: 'demo_seed_778' },
      'demo_leak_sig'
    ),
    secret: 'secret',
  },
];

export function JwtInspectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dual-Theme High-Contrast Editorial Ivory (Light) + Obsidian Gold (Dark) tokens (all >= 4.5:1 WCAG AA)
  const palette = isDark
    ? {
        surface: '#11131A',
        surfaceAlt: '#171A24',
        codeBg: '#0C0E14',
        border: '#272B3A',
        text: '#F8FAFC',
        textMuted: '#A3B1C6',
        gold: '#E5C158',
        goldBg: '#241F10',
        emerald: '#34D399',
        emeraldBg: '#0E261F',
        crimson: '#FB7185',
        crimsonBg: '#2A1219',
        sapphire: '#38BDF8',
        sapphireBg: '#0F2230',
        btnPrimaryBg: '#E5C158',
        btnPrimaryFg: '#08080B',
      }
    : {
        surface: '#FFFFFF',
        surfaceAlt: '#F5F0E4',
        codeBg: '#F3EFE6',
        border: '#D6CEB8',
        text: '#141417',
        textMuted: '#475467',
        gold: '#8A6500',
        goldBg: '#FEF7DC',
        emerald: '#047857',
        emeraldBg: '#ECFDF5',
        crimson: '#991B1B',
        crimsonBg: '#FEF2F2',
        sapphire: '#0369A1',
        sapphireBg: '#F0F9FF',
        btnPrimaryBg: '#8A6500',
        btnPrimaryFg: '#FFFFFF',
      };

  const [activeTab, setActiveTab] = useState(0);
  const [jwtInput, setJwtInput] = useState(SAMPLE_TOKENS[0].token);
  const [hmacSecret, setHmacSecret] = useState(SAMPLE_TOKENS[0].secret);
  const [mintAlg, setMintAlg] = useState('HS256');
  const [jwkInput, setJwkInput] = useState('');
  const [sigStatus, setSigStatus] = useState({
    state: 'info',
    text: 'Ready to verify HS256/HS384/HS512 or RS256/ES256 JWK via native Web Crypto. alg:none fails closed.',
  });
  const [crackStatus, setCrackStatus] = useState({ state: 'info', text: 'Test active HMAC token against common weak secrets.' });
  const [dpopMethod, setDpopMethod] = useState('POST');
  const [dpopUrl, setDpopUrl] = useState('https://api.example.com/v1/payments');
  const [dpopProof, setDpopProof] = useState('');
  const [dpopJkt, setDpopJkt] = useState('');
  const [dpopStatus, setDpopStatus] = useState({
    state: 'info',
    text: 'Mint real Web Crypto ECDSA P-256 (ES256) RFC 9449 DPoP proofs and verify signatures mathematically.',
  });
  const [bridgeStatus, setBridgeStatus] = useState({
    mode: 'BROWSER_OFFLINE_FALLBACK',
    text: 'Idle — click Probe :8124 to connect to a running local Python REST daemon, or run 100% in-browser.',
  });
  const { copied: copiedKey, copy } = useCopy(2000);

  const audit = useMemo(() => lintJwtSecurity(jwtInput, { hmacSecret }), [jwtInput, hmacSecret]);
  const exportsBundle = useMemo(() => buildAuditExports(audit), [audit]);

  useEffect(() => {
    setSigStatus({
      state: 'info',
      text: `Parsed ${audit.parsed.algorithm} token (${audit.parsed.entropy.toFixed(3)} bits/byte). Click Verify Signature.`,
    });
  }, [jwtInput]);

  const handleVerifySignature = async () => {
    const alg = String(audit.parsed.algorithm || '').toUpperCase();
    if (alg === 'ES256' || alg === 'RS256' || alg === 'RS384' || alg === 'RS512') {
      let jwkObj = null;
      if (jwkInput.trim()) {
        try {
          jwkObj = JSON.parse(jwkInput);
        } catch (err) {
          setSigStatus({ state: 'error', text: `Invalid JWK JSON: ${err.message}` });
          return;
        }
      } else if (audit.parsed.header?.jwk) {
        jwkObj = audit.parsed.header.jwk;
      } else {
        setSigStatus({ state: 'warning', text: `Algorithm ${alg} requires a public JWK JSON below.` });
        return;
      }
      const res = await verifyAsymmetricJwt(jwtInput, jwkObj);
      setSigStatus({ state: res.valid ? 'success' : 'error', text: `${res.valid ? '✔' : '✘'} ${res.reason}` });
      return;
    }

    const res = await verifyHmacJwt(jwtInput, hmacSecret, { allowNone: false });
    setSigStatus({ state: res.valid ? 'success' : 'error', text: `${res.valid ? '✔' : '✘'} ${res.reason}` });
  };

  const handleMintHmac = async () => {
    if (!audit.parsed.payload) return;
    const hdr = { ...(audit.parsed.header || {}), alg: mintAlg, typ: 'JWT' };
    const minted = await signHmacJwt(hdr, audit.parsed.payload, hmacSecret || 'sovereign_jwt_secret_key_2026', mintAlg);
    setJwtInput(minted);
    setSigStatus({ state: 'success', text: `✔ Minted signed ${mintAlg} JWT via native Web Crypto.` });
  };

  const handleGenerateEs256 = async () => {
    const now = Math.floor(Date.now() / 1000);
    const { token, publicJwk, thumbprint } = await generateEs256KeypairAndSign({
      sub: 'operator_ecdsa',
      iss: 'https://auth.nullai.tech',
      role: 'auditor',
      iat: now,
      exp: now + 86400,
    });
    setJwtInput(token);
    setJwkInput(JSON.stringify(publicJwk, null, 2));
    setSigStatus({ state: 'success', text: `✔ Generated ephemeral ECDSA P-256 keypair (jkt: ${thumbprint}) & signed ES256 JWT.` });
  };

  const handleTamper = async (attackType) => {
    const mutated = await tamperJwt(jwtInput, attackType);
    setJwtInput(mutated);
    setSigStatus({ state: 'warning', text: `Applied "${attackType}" tamper vector to active JWT.` });
  };

  const handleCrack = async () => {
    const res = await crackHmacWeakSecret(jwtInput);
    if (res.found) {
      setHmacSecret(res.secret);
      setCrackStatus({
        state: 'error',
        text: `CRACKED (${res.algorithm}): Weak secret "${res.secret}" recovered in ${res.attempts} checks.`,
      });
    } else {
      setCrackStatus({
        state: 'success',
        text: `Not matched in ${res.attempts} dictionary candidates (${res.algorithm}).`,
      });
    }
  };

  const handleMintDpop = async () => {
    const res = await createEs256DpopProof({ method: dpopMethod, url: dpopUrl, accessToken: jwtInput });
    setDpopProof(res.proofJwt);
    setDpopJkt(res.jkt);
    setDpopStatus({
      state: 'success',
      text: `✔ Minted real ES256 DPoP proof (EC P-256) | jkt: ${res.jkt} | htu: ${res.htu}`,
    });
  };

  const handleCorruptDpop = () => {
    const parts = dpopProof.trim().split('.');
    if (parts.length !== 3) return;
    setDpopProof(`${parts[0]}.${parts[1]}.COMPLETELY_FORGED_GARBAGE_SIG`);
    setDpopStatus({ state: 'warning', text: 'Replaced DPoP signature with forged bytes. Click Verify Proof to test fail-closed rejection.' });
  };

  const handleVerifyDpop = async () => {
    const res = await verifyEs256DpopProof({
      proofJwt: dpopProof,
      method: dpopMethod,
      url: dpopUrl,
      accessToken: jwtInput,
      boundJkt: dpopJkt || undefined,
    });
    if (res.valid) {
      setDpopStatus({
        state: 'success',
        text: `✔ DPoP VALID (ES256 cryptographic signature & RFC 9449 bindings verified) | jkt: ${res.jkt}`,
      });
    } else {
      setDpopStatus({
        state: 'error',
        text: `✘ DPoP REJECTED: ${res.errors.join(' ')}`,
      });
    }
  };

  const handleProbeBridge = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8124/health', { cache: 'no-store' });
      if (resp.ok) {
        const h = await resp.json();
        setBridgeStatus({
          mode: 'LOOPBACK_8124_CONNECTED',
          text: `Connected to loopback 127.0.0.1:8124 (${h.service} v${h.version}).`,
        });
        return;
      }
    } catch {}
    setBridgeStatus({
      mode: 'BROWSER_OFFLINE_FALLBACK',
      text: 'BROWSER_OFFLINE_FALLBACK: Loopback :8124 daemon is idle. Start `python3 server.py` locally or continue 100% in-browser.',
    });
  };

  const downloadBlob = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header Banner (Single clean open-access header — Coffee/Solana lives exclusively in Studio footer) */}
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          bgcolor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: palette.goldBg,
              color: palette.gold,
              border: `1px solid ${palette.gold}`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SecurityIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.text }}>
                JWT Inspector Guard v{JWT_ENGINE_VERSION}
              </Typography>
              <Chip
                size="small"
                label={`SCORE ${audit.score}/100 · GRADE ${audit.grade}`}
                sx={{
                  bgcolor: audit.score >= 80 ? palette.emeraldBg : palette.crimsonBg,
                  color: audit.score >= 80 ? palette.emerald : palette.crimson,
                  border: `1px solid ${audit.score >= 80 ? palette.emerald : palette.crimson}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
              <Chip
                size="small"
                label={`ENTROPY ${audit.parsed.entropy.toFixed(3)} b/B`}
                sx={{
                  bgcolor: palette.goldBg,
                  color: palette.gold,
                  border: `1px solid ${palette.gold}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: palette.textMuted, mt: 0.4, fontSize: '0.82rem' }}>
              Web Crypto HS256/384/512 &amp; RS256/ES256 JWK verifier, RFC 9449 ECDSA P-256 DPoP studio, CVE linter, and weak-secret auditor. Zero cloud egress.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Token Input & Quick Presets */}
      <Paper sx={{ p: 2.5, mb: 2.5, bgcolor: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id="studio-jwt-token-input"
          label="Bearer JWT Token (Header.Payload.Signature)"
          value={jwtInput}
          onChange={(e) => setJwtInput(e.target.value)}
          placeholder="Paste compact JWT string here..."
          InputProps={{
            sx: {
              fontFamily: mono,
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              bgcolor: palette.codeBg,
              color: palette.text,
            },
          }}
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }} alignItems="center">
          <Typography variant="caption" sx={{ color: palette.textMuted, fontWeight: 700, fontFamily: mono }}>
            PRESETS:
          </Typography>
          {SAMPLE_TOKENS.map((s) => (
            <Button
              key={s.label}
              size="small"
              variant="outlined"
              onClick={() => {
                setJwtInput(s.token);
                setHmacSecret(s.secret);
              }}
              sx={{
                minHeight: 44,
                fontFamily: mono,
                fontSize: '0.74rem',
                fontWeight: 700,
                color: palette.text,
                borderColor: palette.border,
                bgcolor: palette.surfaceAlt,
                '&:hover': { borderColor: palette.gold },
              }}
            >
              {s.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      <SovereignEyebrow accent={palette.gold} right="Security & Recon">
        {'jwt-inspector-guard'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'jwt-inspector-guard'}
        eyebrow={'Security & Recon'}
        caption={'JWT Inspector Guard v2.6.0'}
        label={'JWT Inspector Guard — Zoth cryptographic visualisation'}
      />

      {/* 4-Tab Full Parity Navigation */}
      <Paper sx={{ mb: 2.5, bgcolor: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="JWT Inspector Guard Deck Tabs"
          sx={{
            borderBottom: `1px solid ${palette.border}`,
            '& .MuiTab-root': { minHeight: 48, fontFamily: mono, fontWeight: 700, fontSize: '0.78rem', color: palette.textMuted },
            '& .Mui-selected': { color: `${palette.gold} !important` },
            '& .MuiTabs-indicator': { bgcolor: palette.gold },
          }}
        >
          <Tab label="1. Decode & Linter" />
          <Tab label="2. Verify & Mint (HS/RS/ES)" />
          <Tab label="3. Tamper & Cracker" />
          <Tab label="4. ES256 DPoP & :8124 Bridge" />
        </Tabs>

        {/* TAB 0: Decode & Linter */}
        {activeTab === 0 && (
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.crimson }}>
                      HEADER: ALGORITHM &amp; JOSE PARAMETERS
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copy(JSON.stringify(audit.parsed.header, null, 2), 'hdr')}
                      sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: palette.crimson }}
                    >
                      {copiedKey === 'hdr' ? 'COPIED' : 'COPY'}
                    </Button>
                  </Stack>
                  <Box sx={{ bgcolor: palette.codeBg, border: `1px solid ${palette.border}`, p: 1.5, borderRadius: 1.5, overflowX: 'auto' }}>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: palette.text, whiteSpace: 'pre-wrap' }}>
                      {audit.parsed.header ? JSON.stringify(audit.parsed.header, null, 2) : '// Invalid Header'}
                    </pre>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.sapphire }}>
                      PAYLOAD: RFC 7519 CLAIMS
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copy(JSON.stringify(audit.parsed.payload, null, 2), 'pay')}
                      sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: palette.sapphire }}
                    >
                      {copiedKey === 'pay' ? 'COPIED' : 'COPY'}
                    </Button>
                  </Stack>
                  <Box sx={{ bgcolor: palette.codeBg, border: `1px solid ${palette.border}`, p: 1.5, borderRadius: 1.5, overflowX: 'auto' }}>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: palette.text, whiteSpace: 'pre-wrap' }}>
                      {audit.parsed.payload ? JSON.stringify(audit.parsed.payload, null, 2) : '// Invalid Payload'}
                    </pre>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.text, mb: 1.5, display: 'block' }}>
                    SECURITY LINTER &amp; CVE SCANNER ({audit.findings.length} FINDINGS)
                  </Typography>
                  <Stack spacing={1.2}>
                    {audit.findings.length === 0 ? (
                      <Paper sx={{ p: 2, bgcolor: palette.emeraldBg, border: `1px solid ${palette.emerald}`, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: mono, color: palette.emerald, fontWeight: 700 }}>
                          ✔ No critical vulnerabilities identified. Signature structure, header rules, and claim timing passed.
                        </Typography>
                      </Paper>
                    ) : (
                      audit.findings.map((f, idx) => {
                        const isCrit = f.severity === 'CRITICAL';
                        const isHigh = f.severity === 'HIGH';
                        const fg = isCrit ? palette.crimson : isHigh ? palette.gold : palette.sapphire;
                        const bg = isCrit ? palette.crimsonBg : isHigh ? palette.goldBg : palette.sapphireBg;
                        return (
                          <Paper key={idx} sx={{ p: 1.5, bgcolor: bg, border: `1px solid ${fg}`, borderRadius: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: fg }}>
                                {f.rule}
                              </Typography>
                              <Chip
                                label={f.severity}
                                size="small"
                                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: palette.surface, color: fg, border: `1px solid ${fg}` }}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ color: palette.text, fontSize: '0.8rem' }}>
                              {f.text}
                            </Typography>
                            {f.remediation && (
                              <Typography variant="caption" sx={{ color: palette.textMuted, display: 'block', mt: 0.5, fontFamily: mono }}>
                                Fix: {f.remediation}
                              </Typography>
                            )}
                          </Paper>
                        );
                      })
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Verify & Mint (HS256/384/512 + RS256/ES256 JWK) */}
        {activeTab === 1 && (
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold, mb: 1.5, display: 'block' }}>
                    VERIFY CRYPTOGRAPHIC SIGNATURE (HMAC + ASYMMETRIC JWK)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="HMAC Secret Key (HS256 / HS384 / HS512)"
                    value={hmacSecret}
                    onChange={(e) => setHmacSecret(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem', bgcolor: palette.codeBg, color: palette.text } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Public JWK JSON (RS256 / ES256)"
                    value={jwkInput}
                    onChange={(e) => setJwkInput(e.target.value)}
                    placeholder='{"kty":"EC","crv":"P-256","x":"...","y":"..."}'
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', bgcolor: palette.codeBg, color: palette.text } }}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleVerifySignature}
                      startIcon={<LockIcon />}
                      sx={{ minHeight: 44, bgcolor: palette.btnPrimaryBg, color: palette.btnPrimaryFg, fontWeight: 800, fontFamily: mono }}
                    >
                      VERIFY SIGNATURE
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleGenerateEs256}
                      startIcon={<KeyIcon />}
                      sx={{ minHeight: 44, borderColor: palette.sapphire, color: palette.sapphire, fontWeight: 700, fontFamily: mono }}
                    >
                      GENERATE ES256 &amp; SIGN
                    </Button>
                  </Stack>
                  <Alert
                    severity={sigStatus.state}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      color: palette.text,
                      bgcolor: sigStatus.state === 'success' ? palette.emeraldBg : sigStatus.state === 'error' ? palette.crimsonBg : palette.sapphireBg,
                      border: `1px solid ${sigStatus.state === 'success' ? palette.emerald : sigStatus.state === 'error' ? palette.crimson : palette.sapphire}`,
                    }}
                  >
                    {sigStatus.text}
                  </Alert>
                </Paper>
              </Grid>

              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.sapphire, mb: 1.5, display: 'block' }}>
                    MINT SIGNED HMAC TOKEN (ALGORITHM-AWARE)
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="mint-alg-label">HMAC Algorithm</InputLabel>
                    <Select
                      labelId="mint-alg-label"
                      value={mintAlg}
                      label="HMAC Algorithm"
                      onChange={(e) => setMintAlg(e.target.value)}
                      sx={{ fontFamily: mono, bgcolor: palette.codeBg, color: palette.text, minHeight: 44 }}
                    >
                      <MenuItem value="HS256">HS256 (HMAC-SHA256)</MenuItem>
                      <MenuItem value="HS384">HS384 (HMAC-SHA384)</MenuItem>
                      <MenuItem value="HS512">HS512 (HMAC-SHA512)</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleMintHmac}
                    startIcon={<BoltIcon />}
                    sx={{ minHeight: 44, bgcolor: palette.emerald, color: isDark ? '#08080B' : '#FFFFFF', fontWeight: 800, fontFamily: mono }}
                  >
                    MINT SIGNED {mintAlg} JWT
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: Tamper & Dictionary Cracker */}
        {activeTab === 2 && (
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.crimson, mb: 1.5, display: 'block' }}>
                    1-CLICK EXPLOIT TAMPER LAB
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" onClick={() => handleTamper('none')} startIcon={<BugReportIcon />} sx={{ minHeight: 44, borderColor: palette.crimson, color: palette.crimson, fontFamily: mono, fontWeight: 700 }}>
                      CVE-2015-9235 (alg:none)
                    </Button>
                    <Button variant="outlined" onClick={() => handleTamper('kid_traversal')} sx={{ minHeight: 44, borderColor: palette.crimson, color: palette.crimson, fontFamily: mono, fontWeight: 700 }}>
                      kid Path Traversal
                    </Button>
                    <Button variant="outlined" onClick={() => handleTamper('jku_ssrf')} sx={{ minHeight: 44, borderColor: palette.gold, color: palette.gold, fontFamily: mono, fontWeight: 700 }}>
                      jku SSRF URL
                    </Button>
                    <Button variant="outlined" onClick={() => handleTamper('admin_escalate')} sx={{ minHeight: 44, borderColor: palette.sapphire, color: palette.sapphire, fontFamily: mono, fontWeight: 700 }}>
                      Escalate Role=admin
                    </Button>
                    <Button variant="outlined" onClick={() => handleTamper('strip_signature')} sx={{ minHeight: 44, borderColor: palette.border, color: palette.text, fontFamily: mono, fontWeight: 700 }}>
                      Strip Signature
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              <Grid xs={12} lg={6}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold, mb: 1.5, display: 'block' }}>
                    WEAK HMAC DICTIONARY CRACKER (WEB CRYPTO)
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleCrack}
                    sx={{ minHeight: 44, mb: 2, bgcolor: palette.btnPrimaryBg, color: palette.btnPrimaryFg, fontFamily: mono, fontWeight: 800 }}
                  >
                    RUN WEAK-SECRET AUDIT
                  </Button>
                  <Alert
                    severity={crackStatus.state}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      color: palette.text,
                      bgcolor: crackStatus.state === 'error' ? palette.crimsonBg : crackStatus.state === 'success' ? palette.emeraldBg : palette.sapphireBg,
                      border: `1px solid ${crackStatus.state === 'error' ? palette.crimson : crackStatus.state === 'success' ? palette.emerald : palette.sapphire}`,
                    }}
                  >
                    {crackStatus.text}
                  </Alert>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 3: Real WebCrypto ES256 DPoP Studio, Loopback Bridge & Exports */}
        {activeTab === 3 && (
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid xs={12} lg={7}>
                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.emerald, mb: 1.5, display: 'block' }}>
                    RFC 9449 ECDSA P-256 (ES256) DPoP STUDIO
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="dpop-method-label">Method</InputLabel>
                      <Select
                        labelId="dpop-method-label"
                        value={dpopMethod}
                        label="Method"
                        onChange={(e) => setDpopMethod(e.target.value)}
                        sx={{ fontFamily: mono, bgcolor: palette.codeBg, color: palette.text, minHeight: 44 }}
                      >
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Target HTU URL"
                      value={dpopUrl}
                      onChange={(e) => setDpopUrl(e.target.value)}
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem', bgcolor: palette.codeBg, color: palette.text } }}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="DPoP Proof JWT (typ: dpop+jwt)"
                    value={dpopProof}
                    onChange={(e) => setDpopProof(e.target.value)}
                    placeholder="Click Mint ES256 DPoP Proof to generate a real P-256 ECDSA proof..."
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.76rem', bgcolor: palette.codeBg, color: palette.text } }}
                    sx={{ mb: 1.5 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Button variant="contained" onClick={handleMintDpop} sx={{ minHeight: 44, bgcolor: palette.btnPrimaryBg, color: palette.btnPrimaryFg, fontFamily: mono, fontWeight: 800 }}>
                      MINT ES256 PROOF
                    </Button>
                    <Button variant="outlined" onClick={handleVerifyDpop} sx={{ minHeight: 44, borderColor: palette.emerald, color: palette.emerald, fontFamily: mono, fontWeight: 700 }}>
                      VERIFY PROOF
                    </Button>
                    <Button variant="outlined" onClick={handleCorruptDpop} sx={{ minHeight: 44, borderColor: palette.crimson, color: palette.crimson, fontFamily: mono, fontWeight: 700 }}>
                      FORGE SIG TEST
                    </Button>
                  </Stack>
                  <Alert
                    severity={dpopStatus.state}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.76rem',
                      color: palette.text,
                      bgcolor: dpopStatus.state === 'success' ? palette.emeraldBg : dpopStatus.state === 'error' ? palette.crimsonBg : palette.sapphireBg,
                      border: `1px solid ${dpopStatus.state === 'success' ? palette.emerald : dpopStatus.state === 'error' ? palette.crimson : palette.sapphire}`,
                    }}
                  >
                    {dpopStatus.text}
                  </Alert>
                </Paper>
              </Grid>

              <Grid xs={12} lg={5}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.sapphire, mb: 1, display: 'block' }}>
                    OPTIONAL LOOPBACK :8124 BRIDGE
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: palette.textMuted, display: 'block', mb: 1.2 }}>
                    STATUS: {bridgeStatus.mode}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleProbeBridge}
                    sx={{ minHeight: 44, mb: 1.2, borderColor: palette.sapphire, color: palette.sapphire, fontFamily: mono, fontWeight: 700 }}
                  >
                    PROBE 127.0.0.1:8124/HEALTH
                  </Button>
                  <Typography variant="body2" sx={{ color: palette.text, fontSize: '0.78rem', fontFamily: mono }}>
                    {bridgeStatus.text}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold, mb: 1.2, display: 'block' }}>
                    FORMULA-SAFE AUDIT EXPORTS
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadBlob('jwt-audit.json', exportsBundle.json, 'application/json')} sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, color: palette.text, borderColor: palette.border }}>
                      JSON
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadBlob('jwt-audit.md', exportsBundle.markdown, 'text/markdown')} sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, color: palette.text, borderColor: palette.border }}>
                      MARKDOWN
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadBlob('jwt-audit.csv', exportsBundle.csv, 'text/csv')} sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, color: palette.text, borderColor: palette.border }}>
                      CSV
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default JwtInspectorGodModeTool;
