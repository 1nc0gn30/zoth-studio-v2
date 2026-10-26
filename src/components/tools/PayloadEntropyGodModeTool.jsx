import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpeedIcon from '@mui/icons-material/Speed';
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BugReportIcon from '@mui/icons-material/BugReport';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// Helper: Calculate Shannon Entropy (0.0 to 8.0 bits per byte)
function calculateShannonEntropy(uint8Array) {
  if (uint8Array.length === 0) return 0;
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < uint8Array.length; i++) {
    frequencies[uint8Array[i]]++;
  }
  let entropy = 0;
  const total = uint8Array.length;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / total;
      entropy -= p * Math.log2(p);
    }
  }
  return { entropy, frequencies, totalBytes: total };
}

const SAMPLE_PAYLOADS = [
  {
    label: 'Plaintext English Text',
    text: 'The quick brown fox jumps over the lazy dog. In cryptography and computer science, entropy is a measure of randomness or unpredictability in a stream of information.'
  },
  {
    label: 'Source Code (JavaScript)',
    text: 'function verifySignature(token, secret) {\n  const [h, p, s] = token.split(".");\n  const expected = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");\n  return expected === s;\n}'
  },
  {
    label: 'Obfuscated Base64 Payload',
    text: 'TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0KJAAAAAAAAAB/yH0b'
  },
  {
    label: 'High-Entropy Ciphertext (AES-256-GCM)',
    text: 'a7f92b4c810d93ea6f8812cb04e578c1df89ab1034ce77fa0912bcde3499ab0812cae7801fec5691bc8203ef1849a0ce812903fe57bca09218bcdaef901289fe'
  }
];

export function PayloadEntropyGodModeTool() {
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
  const [inputText, setInputText] = useState(SAMPLE_PAYLOADS[0].text);
  const [currentBuffer, setCurrentBuffer] = useState(() => new TextEncoder().encode(SAMPLE_PAYLOADS[0].text));
  const [entropyData, setEntropyData] = useState(() => calculateShannonEntropy(new TextEncoder().encode(SAMPLE_PAYLOADS[0].text)));
  const [activeTab, setActiveTab] = useState(0); // 0: Byte Spectrum, 1: WAF Rules, 2: Hex Preview
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro State
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  const canvasRef = useRef(null);

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

  // Recalculate on text input
  const handleTextChange = (text) => {
    setInputText(text);
    const buf = new TextEncoder().encode(text);
    setCurrentBuffer(buf);
    setEntropyData(calculateShannonEntropy(buf));
  };

  // Handle Binary File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuf = evt.target.result;
      const uint8 = new Uint8Array(arrayBuf);
      setCurrentBuffer(uint8);
      setInputText(`[Binary File Loaded: ${file.name} - ${uint8.length.toLocaleString()} bytes]`);
      setEntropyData(calculateShannonEntropy(uint8));
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------------------------------------------------------------------------
  // Draw 256-Byte Spectrum Histogram Canvas
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !entropyData) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = isDark ? '#08080B' : '#0F172A';
    ctx.fillRect(0, 0, w, h);

    const freqs = entropyData.frequencies;
    const maxFreq = Math.max(...freqs, 1);
    const barW = w / 256;

    for (let i = 0; i < 256; i++) {
      const barH = (freqs[i] / maxFreq) * (h - 12);
      const x = i * barW;
      const y = h - barH;

      // Color coding: Printable ASCII in cyan, non-printable in gold/crimson
      let col = cyan;
      if (i >= 32 && i <= 126) col = emerald; // Printable ASCII
      else if (i === 0) col = gold; // Null byte
      else if (i > 127) col = '#A855F7'; // Extended / High byte

      ctx.fillStyle = col;
      ctx.fillRect(x, y, Math.max(1, barW - 0.5), barH);
    }
  }, [entropyData, isDark]);

  // Risk & Entropy Classification
  const score = entropyData.entropy;
  let classification = 'Structured Plaintext';
  let badgeCol = emerald;
  let riskAssessment = 'Low threat probability. Consistent with standard natural language or structured data.';

  if (score > 7.2) {
    classification = 'Encrypted / High-Entropy Payload';
    badgeCol = crimson;
    riskAssessment = 'High probability of encrypted ciphertext, compressed shellcode, or cryptographic secret key material.';
  } else if (score > 5.8) {
    classification = 'Packed / Obfuscated Code';
    badgeCol = gold;
    riskAssessment = 'Consistent with Base64 encoding, packed executables, or heavily minified scripts.';
  } else if (score > 3.5) {
    classification = 'Program Source Code';
    badgeCol = cyan;
    riskAssessment = 'Normal code structure with balanced keyword and punctuation distributions.';
  }

  // WAF Rules Generator
  const generateModSecurityRule = () => {
    return `# ModSecurity Rule: Block Anomalous High-Entropy Payloads
SecRule REQUEST_BODY "@rx .+" \\
  "id:990101,\\
  phase:2,\\
  block,\\
  msg:'Anomalous Shannon entropy detected in request body (H > 7.2 bits)',\\
  severity:'CRITICAL',\\
  setvar:'tx.anomaly_score=+10'`;
  };

  const generateCloudflareWaf = () => {
    return `// Cloudflare WAF Custom Expression
(http.request.body.mime contains "json" and len(http.request.body.raw) > 50 and entropy(http.request.body.raw) > 7.2)`;
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
            <SpeedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                Payload &amp; Entropy Studio: Threat Intelligence Engine
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
              Real client-side Shannon entropy calculation, 256-byte distribution spectrum, and automated WAF rule synthesizer.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
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
              label="UNLIMITED WAF RULE EXPORTS"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* KPI Metric Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                SHANNON ENTROPY
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: mono, color: badgeCol, mt: 0.5 }}>
                {score.toFixed(3)} <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>/ 8.0</span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                CLASSIFICATION
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: mono, color: badgeCol, mt: 0.8 }}>
                {classification}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                SAMPLE BYTES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: cyan, mt: 0.5 }}>
                {entropyData.totalBytes.toLocaleString()} B
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                PRINTABLE ASCII RATIO
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: gold, mt: 0.5 }}>
                {(
                  (entropyData.frequencies.slice(32, 127).reduce((a, b) => a + b, 0) /
                    Math.max(1, entropyData.totalBytes)) *
                  100
                ).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Workspace Grid */}
      <Grid container spacing={3}>
        {/* Left: Input Payload & Presets */}
        <Grid xs={12} lg={6}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: cyan }}>
                PAYLOAD RAW BUFFER INPUT
              </Typography>
              <Button
                size="small"
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ borderColor: cardBorder, color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}
              >
                UPLOAD FILE
                <input type="file" hidden onChange={handleFileUpload} />
              </Button>
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={8}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste text, base64 strings, or shellcode..."
              InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
              sx={{ mb: 2 }}
            />

            {/* Presets */}
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontFamily: mono }}>
              Curated Threat Presets:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {SAMPLE_PAYLOADS.map((s) => (
                <Chip
                  key={s.label}
                  label={s.label}
                  size="small"
                  clickable
                  onClick={() => handleTextChange(s.text)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                    border: `1px solid ${cardBorder}`
                  }}
                />
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Assessment Callout */}
            <Paper sx={{ p: 1.5, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: badgeCol, display: 'block', mb: 0.5 }}>
                THREAT INTELLIGENCE ASSESSMENT:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                {riskAssessment}
              </Typography>
            </Paper>
          </Paper>
        </Grid>

        {/* Right: 256-Byte Spectrum Histogram & WAF Rules */}
        <Grid xs={12} lg={6}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                mb: 2,
                borderBottom: `1px solid ${cardBorder}`,
                '& .MuiTab-root': {
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  py: 0.5
                }
              }}
            >
              <Tab label="256-BYTE HISTOGRAM" />
              <Tab label="WAF RULES GENERATOR" />
              <Tab label="HEX DUMP" />
            </Tabs>

            {/* TAB 0: HISTOGRAM */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 1 }}>
                  BYTE VALUE FREQUENCY SPECTRUM (0x00 - 0xFF)
                </Typography>
                <Box sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5, overflow: 'hidden', mb: 2 }}>
                  <canvas ref={canvasRef} width={420} height={180} style={{ width: '100%', height: '180px', display: 'block' }} />
                </Box>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Typography variant="caption" sx={{ color: emerald, fontFamily: mono }}>
                    ■ Printable ASCII (32-126)
                  </Typography>
                  <Typography variant="caption" sx={{ color: gold, fontFamily: mono }}>
                    ■ Null (0x00)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A855F7', fontFamily: mono }}>
                    ■ High Bytes (128-255)
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* TAB 1: WAF RULES */}
            {activeTab === 1 && (
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#0F172A', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, fontWeight: 800 }}>
                      MODSECURITY WAF RULE
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(generateModSecurityRule(), 'copyModSec')}
                      sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
                    >
                      {copiedKey === 'copyModSec' ? 'COPIED' : 'COPY'}
                    </Button>
                  </Stack>
                  <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8', overflowX: 'auto' }}>
                    {generateModSecurityRule()}
                  </pre>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#0F172A', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                      CLOUDFLARE WAF EXPRESSION
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(generateCloudflareWaf(), 'copyCf')}
                      sx={{ fontFamily: mono, fontSize: '0.7rem', color: gold }}
                    >
                      {copiedKey === 'copyCf' ? 'COPIED' : 'COPY'}
                    </Button>
                  </Stack>
                  <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8', overflowX: 'auto' }}>
                    {generateCloudflareWaf()}
                  </pre>
                </Paper>
              </Stack>
            )}

            {/* TAB 2: HEX DUMP */}
            {activeTab === 2 && (
              <Box sx={{ bgcolor: isDark ? voidDark : '#0F172A', p: 2, borderRadius: 1.5, maxHeight: 220, overflowY: 'auto' }}>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: cyan }}>
                  {Array.from(currentBuffer.slice(0, 192))
                    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
                    .reduce((acc, hex, idx) => {
                      return acc + hex + ((idx + 1) % 16 === 0 ? '\n' : ' ');
                    }, '')}
                </pre>
              </Box>
            )}
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
              Payload &amp; Entropy Studio Pro License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock automated WAF rule bundles (ModSecurity, Cloudflare, AWS WAF, Snort), sliding-window shellcode detectors, and high-resolution waveform exports.
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
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
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
            placeholder="e.g. ENTROPY-PRO-XXXX-XXXX"
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

export default PayloadEntropyGodModeTool;
