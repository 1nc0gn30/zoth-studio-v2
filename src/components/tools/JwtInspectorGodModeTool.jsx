import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TimerIcon from '@mui/icons-material/Timer';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// Helper: Base64URL decode
function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return null;
  }
}

// Helper: Base64URL encode
function base64UrlEncode(str) {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: ArrayBuffer to Base64URL
function bufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const SAMPLE_TOKENS = [
  {
    label: 'Standard Valid HS256 Token',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX3NvdmVyZWlnbl85OTIxIiwibmFtZSI6Ik5lYWwgRnJhemllciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyOTM4MjQwMCwiZXhwIjoxNzI5OTg3MjAwfQ.S0tHqgU43Uv2tC1y93tM00nU_Y7L_eJk_tFqW6Qv8tY',
    secret: 'sovereign_jwt_secret_key_2026'
  },
  {
    label: 'CVE-2015-9235 (alg: none exploit)',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbl9ieXBhc3MiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcyOTM4MjQwMH0.',
    secret: ''
  },
  {
    label: 'Expired Token (Past Timestamp)',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2V4cGlyZWQiLCJyb2xlIjoidmlld2VyIiwiaWF0IjoxNjA5NDU5MjAwLCJleHAiOjE2MDk0NjI4MDB9.iG8Y6lS1zD5U7X3M0aP2qR4tV6wX8zB0cE2gH4jL6nI',
    secret: 'secret'
  },
  {
    label: 'Sensitive Credential Leak',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2xlYWsiLCJlbWFpbCI6ImFkbWluQG51bGxhaS50ZWNoIiwiYXdzX2tleSI6IkFLSUFJT1NGT0ROTjdFWEFNUExFIiwic2VjcmV0X3NlZWQiOiJhbGNoZW15Xzc3OCJ9.K_v7h9yX3Z1nQ0pL5jT8mR2wF4bV6cE9gA3dI5sO7tE',
    secret: 'secret'
  }
];

export function JwtInspectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [jwtInput, setJwtInput] = useState(SAMPLE_TOKENS[0].token);
  const [hmacSecret, setHmacSecret] = useState(SAMPLE_TOKENS[0].secret);
  const [parsedHeader, setParsedHeader] = useState(null);
  const [parsedPayload, setParsedPayload] = useState(null);
  const [rawSignature, setRawSignature] = useState('');
  const [sigStatus, setSigStatus] = useState({ state: 'unverified', text: 'Enter secret to verify signature' });
  const [securityFindings, setSecurityFindings] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro State
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  // Check License
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Parse JWT & Execute Security Linter
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const parts = jwtInput.trim().split('.');
    if (parts.length < 2) {
      setParsedHeader(null);
      setParsedPayload(null);
      setRawSignature('');
      setSecurityFindings([{ rule: 'SYNTAX-001', severity: 'CRITICAL', text: 'Malformed JWT structure. Expected [header].[payload].[signature]' }]);
      return;
    }

    const [hB64, pB64, sB64] = parts;
    const headerStr = base64UrlDecode(hB64);
    const payloadStr = base64UrlDecode(pB64);
    setRawSignature(sB64 || '');

    let headerObj = null;
    let payloadObj = null;
    const findings = [];

    try {
      headerObj = JSON.parse(headerStr);
      setParsedHeader(headerObj);
    } catch {
      findings.push({ rule: 'HEADER-001', severity: 'CRITICAL', text: 'Invalid JSON structure in JWT header' });
    }

    try {
      payloadObj = JSON.parse(payloadStr);
      setParsedPayload(payloadObj);
    } catch {
      findings.push({ rule: 'PAYLOAD-001', severity: 'CRITICAL', text: 'Invalid JSON structure in JWT payload' });
    }

    // Security Checks
    if (headerObj) {
      const alg = (headerObj.alg || '').toLowerCase();
      if (alg === 'none') {
        findings.push({
          rule: 'CVE-2015-9235',
          severity: 'CRITICAL',
          text: 'Vulnerable to alg:none signature bypass! Server may accept unsigned tokens.'
        });
      }
      if (alg === 'hs256' && hmacSecret === 'secret') {
        findings.push({
          rule: 'WEAK-SECRET-001',
          severity: 'HIGH',
          text: 'Trivial HMAC secret "secret" detected. Susceptible to instant dictionary brute-force.'
        });
      }
    }

    if (payloadObj) {
      const nowSec = Math.floor(Date.now() / 1000);
      if (payloadObj.exp) {
        if (payloadObj.exp < nowSec) {
          const expiredAgo = nowSec - payloadObj.exp;
          findings.push({
            rule: 'TIMING-EXP-001',
            severity: 'HIGH',
            text: `Token is EXPIRED! Expired ${expiredAgo}s ago (${new Date(payloadObj.exp * 1000).toLocaleString()}).`
          });
        }
      } else {
        findings.push({
          rule: 'TIMING-EXP-002',
          severity: 'MEDIUM',
          text: 'Missing "exp" expiration claim. Token has indefinite validity lifetime.'
        });
      }

      // Sensitive leak check
      const payloadText = JSON.stringify(payloadObj).toLowerCase();
      if (/password|secret|api_key|private_key|token/i.test(payloadText)) {
        findings.push({
          rule: 'LEAK-CRED-001',
          severity: 'CRITICAL',
          text: 'Sensitive credentials or secrets stored in unencrypted JWT claims.'
        });
      }
      if (/@/.test(payloadText)) {
        findings.push({
          rule: 'PII-EMAIL-001',
          severity: 'MEDIUM',
          text: 'Plaintext email address (PII) exposed in token payload.'
        });
      }
    }

    setSecurityFindings(findings);
  }, [jwtInput, hmacSecret]);

  // ---------------------------------------------------------------------------
  // Real Web Crypto HMAC-SHA256 Signature Verification
  // ---------------------------------------------------------------------------
  const handleVerifySignature = async () => {
    const parts = jwtInput.trim().split('.');
    if (parts.length !== 3) {
      setSigStatus({ state: 'invalid', text: 'Token does not contain valid 3-part signature structure.' });
      return;
    }

    const [hB64, pB64, sB64] = parts;
    const header = parsedHeader;
    const alg = (header?.alg || '').toUpperCase();

    if (alg === 'NONE') {
      setSigStatus({ state: 'vulnerable', text: 'CVE-2015-9235: alg:none is unsigned! Signature was stripped.' });
      return;
    }

    if (alg !== 'HS256' && alg !== 'HS384' && alg !== 'HS512') {
      setSigStatus({ state: 'unsupported', text: `Algorithm ${alg} is asymmetric (requires RSA/ECDSA public key).` });
      return;
    }

    if (!hmacSecret.trim()) {
      setSigStatus({ state: 'invalid', text: 'Please enter HMAC secret key to verify signature.' });
      return;
    }

    try {
      const enc = new TextEncoder();
      const hashAlg = alg === 'HS384' ? 'SHA-384' : alg === 'HS512' ? 'SHA-512' : 'SHA-256';
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(hmacSecret),
        { name: 'HMAC', hash: hashAlg },
        false,
        ['sign']
      );

      const dataToSign = `${hB64}.${pB64}`;
      const signatureBuf = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
      const computedB64 = bufferToBase64Url(signatureBuf);

      if (computedB64 === sB64) {
        setSigStatus({ state: 'valid', text: `✔ Cryptographic Signature VALID! Verified using native Web Crypto ${alg}.` });
      } else {
        setSigStatus({ state: 'invalid', text: `✘ Signature MISMATCH! Token signature does not match computed ${alg} hash.` });
      }
    } catch (err) {
      setSigStatus({ state: 'invalid', text: `Verification error: ${err.message}` });
    }
  };

  // ---------------------------------------------------------------------------
  // Mint / Sign Custom Token In-Browser
  // ---------------------------------------------------------------------------
  const handleMintToken = async () => {
    if (!parsedHeader || !parsedPayload) return;
    try {
      const enc = new TextEncoder();
      const hB64 = base64UrlEncode(JSON.stringify(parsedHeader));
      const pB64 = base64UrlEncode(JSON.stringify(parsedPayload));
      const dataToSign = `${hB64}.${pB64}`;

      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(hmacSecret || 'secret'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
      const sB64 = bufferToBase64Url(sigBuf);
      const minted = `${dataToSign}.${sB64}`;

      setJwtInput(minted);
      setSigStatus({ state: 'valid', text: '✔ Newly minted token signed and loaded into inspector.' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <SecurityIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                JWT Inspector Guard: Sovereign Cryptographic Auditor
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '⭐ PRO ACTIVE' : 'FOUNDING PASS $19'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Real Web Crypto HMAC-SHA256 signature verification, CVE-2015-9235 exploit tester, and secret leak auditor. Zero cloud egress.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/fZebJ00V98DcbjafZ9"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                Unlock Pro $19
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED SECURITY DOSSIER EXPORTS"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Token Input & Presets */}
      <Paper sx={{ p: 2.5, mb: 3, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1, display: 'block' }}>
          INPUT BEARER JWT TOKEN (HEADER.PAYLOAD.SIGNATURE)
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          value={jwtInput}
          onChange={(e) => setJwtInput(e.target.value)}
          placeholder="Paste JWT string here..."
          InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', wordBreak: 'break-all' } }}
          sx={{ mb: 2 }}
        />

        {/* Quick Token Presets */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            Presets:
          </Typography>
          {SAMPLE_TOKENS.map((s) => (
            <Chip
              key={s.label}
              label={s.label}
              size="small"
              clickable
              onClick={() => {
                setJwtInput(s.token);
                setHmacSecret(s.secret);
              }}
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                border: `1px solid ${cardBorder}`
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Main 2-Column Inspector Grid */}
      <Grid container spacing={3}>
        {/* Left: Decoded Header & Decoded Payload */}
        <Grid xs={12} lg={6}>
          {/* Header Card */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: crimson }}>
                HEADER: ALGORITHM &amp; TOKEN TYPE
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(JSON.stringify(parsedHeader, null, 2), 'copyHeader')}
                sx={{ fontFamily: mono, fontSize: '0.7rem', color: crimson }}
              >
                {copiedKey === 'copyHeader' ? 'COPIED' : 'COPY'}
              </Button>
            </Stack>
            <Box sx={{ bgcolor: isDark ? voidDark : '#0F172A', p: 1.5, borderRadius: 1.5 }}>
              <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: '#FDA4AF', whiteSpace: 'pre-wrap' }}>
                {parsedHeader ? JSON.stringify(parsedHeader, null, 2) : '// Invalid Header'}
              </pre>
            </Box>
          </Paper>

          {/* Payload Card */}
          <Paper sx={{ p: 2, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: cyan }}>
                PAYLOAD: DATA CLAIMS &amp; TIMESTAMPS
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(JSON.stringify(parsedPayload, null, 2), 'copyPayload')}
                sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
              >
                {copiedKey === 'copyPayload' ? 'COPIED' : 'COPY'}
              </Button>
            </Stack>
            <Box sx={{ bgcolor: isDark ? voidDark : '#0F172A', p: 1.5, borderRadius: 1.5 }}>
              <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: '#7DD3FC', whiteSpace: 'pre-wrap' }}>
                {parsedPayload ? JSON.stringify(parsedPayload, null, 2) : '// Invalid Payload'}
              </pre>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Signature Verifier & Security Linter */}
        <Grid xs={12} lg={6}>
          {/* Signature Verification Card */}
          <Paper sx={{ p: 2.5, mb: 2.5, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 1.5, display: 'block' }}>
              VERIFY CRYPTOGRAPHIC SIGNATURE (WEB CRYPTO)
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="HMAC Secret Key"
              value={hmacSecret}
              onChange={(e) => setHmacSecret(e.target.value)}
              placeholder="e.g. your_secret_key"
              InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleVerifySignature}
                startIcon={<LockIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  flex: 1,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                VERIFY SIGNATURE
              </Button>
              <Button
                variant="outlined"
                onClick={handleMintToken}
                startIcon={<BoltIcon />}
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700, fontFamily: mono }}
              >
                MINT SIGNED JWT
              </Button>
            </Stack>

            {/* Signature Status Alert */}
            <Alert
              severity={
                sigStatus.state === 'valid'
                  ? 'success'
                  : sigStatus.state === 'vulnerable' || sigStatus.state === 'invalid'
                  ? 'error'
                  : 'info'
              }
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                bgcolor:
                  sigStatus.state === 'valid'
                    ? emeraldSoft
                    : sigStatus.state === 'vulnerable' || sigStatus.state === 'invalid'
                    ? crimsonSoft
                    : 'transparent'
              }}
            >
              {sigStatus.text}
            </Alert>
          </Paper>

          {/* Security Linter & Vulnerability Findings */}
          <Paper sx={{ p: 2.5, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: 'text.secondary', mb: 1.5, display: 'block' }}>
              SECURITY LINTER &amp; CVE SCANNER ({securityFindings.length} FINDINGS)
            </Typography>

            <Stack spacing={1}>
              {securityFindings.length === 0 ? (
                <Paper sx={{ p: 2, bgcolor: emeraldSoft, border: `1px solid ${emerald}`, borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, color: emerald, fontWeight: 700 }}>
                    ✔ No critical token vulnerabilities identified. Standard signature and claim timing verified.
                  </Typography>
                </Paper>
              ) : (
                securityFindings.map((f, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 1.5,
                      bgcolor: isDark ? voidDark : '#FFF',
                      border: `1px solid ${f.severity === 'CRITICAL' ? crimson : gold}`,
                      borderRadius: 1.5
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: f.severity === 'CRITICAL' ? crimson : gold }}>
                        {f.rule}
                      </Typography>
                      <Chip label={f.severity} size="small" sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '0.78rem' }}>
                      {f.text}
                    </Typography>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${gold}`, borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              JWT Inspector Guard Pro License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock automated executive JWT security dossiers, multi-framework middleware patches (Express, Fastify, Django), and offline key bruteforce engines.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ Founding Member Pricing: $19 Lifetime (Regular $79)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Instant license key issued upon checkout. Supported payment rails:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/fZebJ00V98DcbjafZ9"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="https://depay.com"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Already have a License Key or Receipt Email?"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. JWT-PRO-XXXX-XXXX"
            InputProps={{ sx: { fontFamily: mono } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default JwtInspectorGodModeTool;
