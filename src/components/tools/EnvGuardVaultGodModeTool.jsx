import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import TerminalIcon from '@mui/icons-material/Terminal';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  ENVGUARD_VERSION,
  MCP_TOOLS,
  PBKDF2_DEFAULT_ITERATIONS,
  PBKDF2_MIN_ITERATIONS,
  PBKDF2_MAX_ITERATIONS,
  SAMPLE_PRESETS,
  auditRotation,
  calculatePassphraseEntropy,
  diffEnvironments,
  executeRotation,
  generateEnvExample,
  generateSecurePassphrase,
  maskEnvContent,
  scanSecrets,
  shamirCombine,
  shamirSplit,
  vaultDecrypt,
  vaultEncrypt,
} from '../../utils/envguardEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export function EnvGuardVaultGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Strict WCAG AA >= 4.5:1 dual-theme tokens (Editorial Ivory Light / Obsidian Gold Dark)
  const tk = useMemo(
    () =>
      isDark
        ? {
            bgCard: '#131722',
            bgSubtle: '#0D1119',
            bgCode: '#0B0E15',
            border: 'rgba(232, 196, 106, 0.24)',
            borderSubtle: 'rgba(255, 255, 255, 0.12)',
            ink: '#F4EFE6',
            inkSec: '#C9C1B3',
            gold: '#E8C46A',
            goldBg: 'rgba(232, 196, 106, 0.14)',
            goldBtnFg: '#0B0D12',
            ok: '#6EE7B7',
            okBg: 'rgba(16, 185, 129, 0.16)',
            info: '#7DD3FC',
            infoBg: 'rgba(56, 189, 248, 0.14)',
            warn: '#FCD34D',
            warnBg: 'rgba(245, 158, 11, 0.16)',
            danger: '#FDA4AF',
            dangerBg: 'rgba(244, 63, 94, 0.18)',
          }
        : {
            bgCard: '#FFFFFF',
            bgSubtle: '#F6F3EC',
            bgCode: '#F3EFE6',
            border: 'rgba(122, 89, 18, 0.30)',
            borderSubtle: 'rgba(26, 23, 18, 0.14)',
            ink: '#1A1712',
            inkSec: '#474137',
            gold: '#7A5912',
            goldBg: '#F5ECD7',
            goldBtnFg: '#FFFFFF',
            ok: '#046C4E',
            okBg: '#E3F5EE',
            info: '#035A8C',
            infoBg: '#E3F2FB',
            warn: '#8A4B08',
            warnBg: '#FDF1DF',
            danger: '#B42318',
            dangerBg: '#FDECEB',
          },
    [isDark]
  );

  // Navigation & Shared State
  const [activeTab, setActiveTab] = useState(0);
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [copiedKey, setCopiedKey] = useState(null);

  // Tab 0: Scanner State
  const [presetKey, setPresetKey] = useState('nextjs-leak');
  const [scanInput, setScanInput] = useState(SAMPLE_PRESETS['nextjs-leak']);
  const scanResult = useMemo(() => scanSecrets(scanInput, 80), [scanInput]);

  // Tab 1: Vault State
  const [passphrase, setPassphrase] = useState('EnvGuardSovereignMasterKey#2026!');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [kdfIterations, setKdfIterations] = useState(PBKDF2_DEFAULT_ITERATIONS);
  const [vaultFormat, setVaultFormat] = useState('json');
  const [rawPayload, setRawPayload] = useState(SAMPLE_PRESETS['nextjs-leak']);
  const [vaultEnvelope, setVaultEnvelope] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');

  // Tab 2: Masker / Example / Diff State
  const [maskInput, setMaskInput] = useState(SAMPLE_PRESETS['nextjs-leak']);
  const [maskMode, setMaskMode] = useState('partial');
  const [maskOutput, setMaskOutput] = useState('');
  const [diffA, setDiffA] = useState('PORT=3000\nNODE_ENV=development\nDEBUG=true\nAPI_BASE=http://127.0.0.1:8088');
  const [diffB, setDiffB] = useState('PORT=8088\nNODE_ENV=production\nDEBUG=false\nREDIS_URL=redis://127.0.0.1:6379/0');
  const diffResult = useMemo(() => diffEnvironments(diffA, diffB), [diffA, diffB]);

  // Tab 3: Shamir Quorum & Rotation Sentinel State
  const [shamirSecret, setShamirSecret] = useState('ENVGUARD_MASTER_KEY_2026_QUORUM_DEMO');
  const [shamirK, setShamirK] = useState(3);
  const [shamirN, setShamirN] = useState(5);
  const [shamirSharesText, setShamirSharesText] = useState('');
  const [shamirRecovered, setShamirRecovered] = useState('');
  const [rotInput, setRotInput] = useState(SAMPLE_PRESETS['rotation-demo']);
  const [rotDays, setRotDays] = useState(90);
  const [rotOutput, setRotOutput] = useState('');
  const rotAudit = useMemo(() => auditRotation(rotInput, new Date(), rotDays), [rotInput, rotDays]);

  // Probe local :8088 loopback daemon cleanly (non-blocking)
  useEffect(() => {
    let active = true;
    const isLocalHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
    if (!isLocalHost) return undefined;
    fetch('http://127.0.0.1:8088/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && d.app === 'envguard-secrets-vault') setDaemonOnline(true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const entropyBits = calculatePassphraseEntropy(passphrase);
  const strengthLabel = entropyBits >= 80 ? 'HIGH ENTROPY' : entropyBits >= 55 ? 'STRONG' : entropyBits >= 35 ? 'MODERATE' : 'WEAK';
  const strengthColor = entropyBits >= 80 ? tk.ok : entropyBits >= 55 ? tk.gold : entropyBits >= 35 ? tk.warn : tk.danger;

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleEncrypt = async () => {
    try {
      const res = await vaultEncrypt(rawPayload, passphrase, {
        iterations: Number(kdfIterations),
        format: vaultFormat,
      });
      setVaultEnvelope(res.output);
      setStatusMessage(
        `Vault sealed via PBKDF2-HMAC-SHA256 (${res.kdf_iterations.toLocaleString()} rounds) + AES-256-CTR (128-bit) + HMAC-SHA256 (${res.ciphertext_bytes} B).`
      );
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Encryption failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleDecrypt = async () => {
    try {
      const res = await vaultDecrypt(vaultEnvelope, passphrase);
      setDecryptedOutput(res.decrypted_content);
      setStatusMessage(
        `HMAC-SHA256 tag verified (${res.kdf_iterations.toLocaleString()} PBKDF2 rounds) and decrypted cleanly.`
      );
      setStatusType('success');
    } catch (err) {
      setDecryptedOutput('');
      setStatusMessage(`Decryption failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleGenerateKey = () => {
    setPassphrase(generateSecurePassphrase(32));
    setStatusMessage('Generated 32-character high-entropy master passphrase.');
    setStatusType('info');
  };

  const handleWipeMemory = () => {
    setPassphrase('');
    setRawPayload('');
    setVaultEnvelope('');
    setDecryptedOutput('');
    setStatusMessage('Cleared in-memory passphrase, plaintext, and envelope buffers.');
    setStatusType('info');
  };

  const handleDownloadVault = () => {
    if (!vaultEnvelope) return;
    const blob = new Blob([vaultEnvelope], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `envguard-secrets-${Date.now()}.vault`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShamirSplit = async () => {
    try {
      const res = await shamirSplit(shamirSecret, Number(shamirK), Number(shamirN), 'studio-quorum');
      setShamirSharesText(res.armored_shares.join('\n'));
      setShamirRecovered('');
      setStatusMessage(`Generated ${res.total_shares} GF(256) checksummed shares (quorum ${res.threshold}-of-${res.total_shares}).`);
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Shamir split failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleShamirCombine = async () => {
    try {
      const blocks = shamirSharesText
        .split(/(?=-----BEGIN ENVGUARD SECRET SHARE-----)/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await shamirCombine(blocks);
      setShamirRecovered(res.secret_text);
      setStatusMessage('All SHA-256 share checksums verified and secret reconstructed.');
      setStatusType('success');
    } catch (err) {
      setShamirRecovered('');
      setStatusMessage(`Shamir reconstruction rejected: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleRotateExecute = () => {
    const res = executeRotation(rotInput, Number(rotDays) || 90);
    setRotOutput(res.updated_content);
    setStatusMessage(`Rotated ${res.rotated_count} secret(s) with refreshed ${res.rotation_days}-day TTL metadata.`);
    setStatusType('success');
  };

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        envguard: {
          command: 'python3',
          args: ['-m', 'envguard_secrets_vault', 'mcp'],
        },
      },
    },
    null,
    2
  );

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* 1. OPERATOR HUD HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: 3,
          bgcolor: tk.bgCard,
          border: `1px solid ${tk.border}`,
        }}
      >
        <SovereignEyebrow accent={tk.gold} right={`v${ENVGUARD_VERSION} · Security & Recon`}>
          envguard-secrets-vault
        </SovereignEyebrow>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, mb: 1.5 }}>
          <SovereignBand
            seed="envguard-secrets-vault"
            eyebrow="Security & Recon"
            caption="EnvGuard Secrets Vault"
            label="EnvGuard Secrets Vault — Zoth sovereign visualisation"
          />
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
              <Box
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  bgcolor: tk.goldBg,
                  color: tk.gold,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <LockIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  variant="h5"
                  sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: tk.ink, lineHeight: 1.2 }}
                >
                  EnvGuard <Box component="span" sx={{ color: tk.gold }}>Secrets Vault</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: tk.inkSec, fontFamily: mono, display: 'block', mt: 0.35 }}>
                  PBKDF2-HMAC-SHA256 (600k) · AES-256-CTR + HMAC-SHA256 · GF(256) Shamir · 11 MCP Tools
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '0.95rem !important', color: `${tk.ok} !important` }} />}
                label="AES-256-CTR-HMAC-SHA256"
                size="small"
                sx={{ bgcolor: tk.okBg, color: tk.ok, fontWeight: 700, fontFamily: mono, border: `1px solid ${tk.ok}` }}
              />
              <Chip
                icon={<VpnKeyIcon sx={{ fontSize: '0.95rem !important', color: `${tk.info} !important` }} />}
                label="PBKDF2 600K DEFAULT"
                size="small"
                sx={{ bgcolor: tk.infoBg, color: tk.info, fontWeight: 700, fontFamily: mono, border: `1px solid ${tk.info}` }}
              />
              <Chip
                label={daemonOnline ? 'LOOPBACK :8088 ONLINE' : 'IN-BROWSER WEBCRYPTO'}
                size="small"
                sx={{ bgcolor: tk.goldBg, color: tk.gold, fontWeight: 700, fontFamily: mono, border: `1px solid ${tk.gold}` }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: tk.bgSubtle,
                border: `1px solid ${tk.borderSubtle}`,
                textAlign: 'center',
              }}
            >
              <Grid container spacing={1}>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: tk.inkSec, fontWeight: 700, display: 'block' }}>
                    KEY ENTROPY
                  </Typography>
                  <Typography component="div" variant="h6" sx={{ fontWeight: 800, color: strengthColor, fontFamily: mono }}>
                    {entropyBits}b
                  </Typography>
                  <Typography variant="caption" sx={{ color: strengthColor, fontSize: '0.68rem', fontWeight: 700 }}>
                    {strengthLabel}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: tk.inkSec, fontWeight: 700, display: 'block' }}>
                    SCAN SCORE
                  </Typography>
                  <Typography
                    component="div"
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: scanResult.score >= 80 ? tk.ok : tk.danger,
                      fontFamily: mono,
                    }}
                  >
                    {scanResult.score}/100
                  </Typography>
                  <Typography variant="caption" sx={{ color: tk.inkSec, fontSize: '0.68rem', fontWeight: 700 }}>
                    GRADE {scanResult.grade}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: tk.inkSec, fontWeight: 700, display: 'block' }}>
                    EGRESS
                  </Typography>
                  <Typography component="div" variant="h6" sx={{ fontWeight: 800, color: tk.info, fontFamily: mono }}>
                    LOCAL
                  </Typography>
                  <Typography variant="caption" sx={{ color: tk.info, fontSize: '0.68rem', fontWeight: 700 }}>
                    ZERO CLOUD
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Master Passphrase Bar — Zero Button Collisions */}
        <Box sx={{ mt: 2.25, pt: 2, borderTop: `1px solid ${tk.borderSubtle}` }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <TextField
              size="small"
              fullWidth
              type={showPassphrase ? 'text' : 'password'}
              label="Master Vault Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              inputProps={{ 'aria-label': 'Master Vault Passphrase' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon sx={{ color: tk.gold, fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label={showPassphrase ? 'Hide master passphrase' : 'Show master passphrase'}
                      onClick={() => setShowPassphrase((v) => !v)}
                      sx={{ minWidth: 40, minHeight: 40, color: tk.inkSec }}
                    >
                      {showPassphrase ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: tk.bgSubtle,
                '& .MuiInputBase-input': { fontFamily: mono, color: tk.ink },
              }}
            />
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap' }} useFlexGap>
              <Button
                variant="outlined"
                onClick={handleGenerateKey}
                startIcon={<RefreshIcon />}
                sx={{
                  minHeight: 44,
                  px: 2,
                  borderColor: tk.gold,
                  color: tk.gold,
                  whiteSpace: 'nowrap',
                  fontFamily: mono,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Generate Key
              </Button>
              <Button
                variant="outlined"
                onClick={handleWipeMemory}
                startIcon={<DeleteSweepIcon />}
                sx={{
                  minHeight: 44,
                  px: 2,
                  borderColor: tk.danger,
                  color: tk.danger,
                  whiteSpace: 'nowrap',
                  fontFamily: mono,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Wipe Memory
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {statusMessage && (
        <Alert severity={statusType} sx={{ mb: 2, fontFamily: mono, fontSize: '0.82rem' }}>
          {statusMessage}
        </Alert>
      )}

      {/* 2. FIVE WORKSTATION TABS (Single Icon Each) */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="EnvGuard Studio Modules"
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${tk.borderSubtle}`,
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.86rem',
            minHeight: 48,
            color: tk.inkSec,
            '&.Mui-selected': { color: tk.gold },
          },
          '& .MuiTabs-indicator': { bgcolor: tk.gold, height: 3 },
        }}
      >
        <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label="Scanner & Entropy" />
        <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="AES-256-CTR Vault" />
        <Tab icon={<CompareArrowsIcon fontSize="small" />} iconPosition="start" label="Masker, Example & Diff" />
        <Tab icon={<GroupWorkIcon fontSize="small" />} iconPosition="start" label="Shamir Quorum & Rotation" />
        <Tab icon={<TerminalIcon fontSize="small" />} iconPosition="start" label="MCP (11 Tools) & CLI" />
      </Tabs>

      {/* TAB 0: SECRET SCANNER & ENTROPY */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Raw .env Input
                </Typography>
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <InputLabel id="preset-select-label">Sample Preset</InputLabel>
                  <Select
                    labelId="preset-select-label"
                    label="Sample Preset"
                    value={presetKey}
                    inputProps={{ 'aria-label': 'Sample Preset' }}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPresetKey(next);
                      setScanInput(SAMPLE_PRESETS[next]);
                      setRawPayload(SAMPLE_PRESETS[next]);
                      setMaskInput(SAMPLE_PRESETS[next]);
                    }}
                  >
                    <MenuItem value="nextjs-leak">Next.js Production Leak</MenuItem>
                    <MenuItem value="rotation-demo">Expired TTL Rotation</MenuItem>
                    <MenuItem value="clean-config">Clean Local Config</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={12}
                label="Environment file content to audit"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                inputProps={{ 'aria-label': 'Environment file content to audit' }}
                sx={{
                  bgcolor: tk.bgCode,
                  '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink },
                }}
              />
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Live Audit Findings ({scanResult.total_findings})
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={`Critical: ${scanResult.metrics.critical_count}`}
                    sx={{ bgcolor: tk.dangerBg, color: tk.danger, fontWeight: 700, fontFamily: mono }}
                  />
                  <Chip
                    size="small"
                    label={`High/Med: ${scanResult.metrics.high_count + scanResult.metrics.medium_count}`}
                    sx={{ bgcolor: tk.warnBg, color: tk.warn, fontWeight: 700, fontFamily: mono }}
                  />
                </Stack>
              </Stack>

              <Stack spacing={1.25} sx={{ maxHeight: 350, overflowY: 'auto', pr: 0.5 }}>
                {scanResult.findings.length === 0 ? (
                  <Alert severity="success">Zero exposed secrets detected. Posture score 100/100 (A+).</Alert>
                ) : (
                  scanResult.findings.map((f, idx) => (
                    <Box
                      key={`${f.id}-${f.line}-${idx}`}
                      sx={{
                        p: 1.35,
                        borderRadius: 2,
                        bgcolor: tk.bgSubtle,
                        border: `1px solid ${tk.borderSubtle}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.75}>
                        <Chip
                          size="small"
                          label={`${f.severity} · ${f.name}`}
                          sx={{
                            bgcolor: f.severity === 'CRITICAL' ? tk.dangerBg : tk.warnBg,
                            color: f.severity === 'CRITICAL' ? tk.danger : tk.warn,
                            fontWeight: 700,
                            fontFamily: mono,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontFamily: mono, color: tk.inkSec }}>
                          Line {f.line} · Entropy {f.entropy}b
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: mono, color: tk.ink, mt: 0.75, wordBreak: 'break-all' }}>
                        {f.key} = {f.masked_sample}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tk.inkSec, display: 'block', mt: 0.5 }}>
                        Remediation: {f.remediation}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: AES-256-CTR-HMAC VAULT */}
      {activeTab === 1 && (
        <Grid container spacing={2.5}>
          <Grid xs={12}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Grid container spacing={2} alignItems="center">
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={`PBKDF2 Iterations (${PBKDF2_MIN_ITERATIONS.toLocaleString()} – ${PBKDF2_MAX_ITERATIONS.toLocaleString()})`}
                    value={kdfIterations}
                    onChange={(e) => setKdfIterations(e.target.value)}
                    inputProps={{ min: PBKDF2_MIN_ITERATIONS, max: PBKDF2_MAX_ITERATIONS, step: 50000 }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="vault-fmt-label">Envelope Format</InputLabel>
                    <Select
                      labelId="vault-fmt-label"
                      label="Envelope Format"
                      value={vaultFormat}
                      inputProps={{ 'aria-label': 'Envelope Format' }}
                      onChange={(e) => setVaultFormat(e.target.value)}
                    >
                      <MenuItem value="json">JSON Vault Envelope (envguard-vault-v1)</MenuItem>
                      <MenuItem value="armor">ASCII Armored Block (CLI/MCP native)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Plaintext .env Payload
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setRawPayload(SAMPLE_PRESETS['nextjs-leak'])}
                  sx={{ color: tk.gold, fontFamily: mono, fontWeight: 700, minHeight: 44 }}
                >
                  Load Sample
                </Button>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={10}
                label="Plaintext secrets for encryption"
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                inputProps={{ 'aria-label': 'Plaintext secrets for encryption' }}
                sx={{
                  bgcolor: tk.bgCode,
                  '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleEncrypt}
                startIcon={<LockIcon />}
                sx={{
                  mt: 1.75,
                  minHeight: 46,
                  bgcolor: tk.gold,
                  color: tk.goldBtnFg,
                  fontWeight: 800,
                  '&:hover': { bgcolor: tk.gold, filter: 'brightness(0.92)' },
                }}
              >
                Seal Secrets (PBKDF2 + AES-256-CTR-HMAC)
              </Button>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Sealed Envelope &amp; Decrypt
                </Typography>
                {vaultEnvelope && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(vaultEnvelope, 'env')}
                      sx={{ minHeight: 40, borderColor: tk.gold, color: tk.gold, fontFamily: mono, fontWeight: 700 }}
                    >
                      {copiedKey === 'env' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadVault}
                      sx={{ minHeight: 40, borderColor: tk.ok, color: tk.ok, fontFamily: mono, fontWeight: 700 }}
                    >
                      Download
                    </Button>
                  </Stack>
                )}
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={5}
                label="Sealed vault envelope (JSON or ASCII armor)"
                value={vaultEnvelope}
                onChange={(e) => setVaultEnvelope(e.target.value)}
                inputProps={{ 'aria-label': 'Sealed vault envelope' }}
                sx={{
                  bgcolor: tk.bgCode,
                  '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.76rem', color: tk.ink },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleDecrypt}
                startIcon={<LockOpenIcon />}
                sx={{
                  my: 1.5,
                  minHeight: 46,
                  bgcolor: tk.ok,
                  color: isDark ? '#0B0D12' : '#FFFFFF',
                  fontWeight: 800,
                  '&:hover': { bgcolor: tk.ok, filter: 'brightness(0.92)' },
                }}
              >
                Verify HMAC-SHA256 &amp; Decrypt
              </Button>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: tk.bgCode,
                  color: tk.ink,
                  border: `1px solid ${tk.borderSubtle}`,
                  borderRadius: 2,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  minHeight: 112,
                  maxHeight: 165,
                  overflowY: 'auto',
                }}
              >
                {decryptedOutput ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{decryptedOutput}</pre>
                ) : (
                  <Typography variant="body2" sx={{ color: tk.inkSec, fontFamily: mono, fontSize: '0.78rem' }}>
                    Verified plaintext will appear here after HMAC-SHA256 authentication succeeds.
                  </Typography>
                )}
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: MASKER, .env.example & DIFF */}
      {activeTab === 2 && (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                    Masker &amp; .env.example Input
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel id="mask-mode-label">Mode</InputLabel>
                    <Select
                      labelId="mask-mode-label"
                      label="Mode"
                      value={maskMode}
                      inputProps={{ 'aria-label': 'Masking Mode' }}
                      onChange={(e) => setMaskMode(e.target.value)}
                    >
                      <MenuItem value="partial">Partial Mask</MenuItem>
                      <MenuItem value="full">Full Mask</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={7}
                  label="Source .env for masking"
                  value={maskInput}
                  onChange={(e) => setMaskInput(e.target.value)}
                  inputProps={{ 'aria-label': 'Source .env for masking' }}
                  sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink } }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }} useFlexGap>
                  <Button
                    variant="contained"
                    onClick={() => setMaskOutput(maskEnvContent(maskInput, maskMode).masked_content)}
                    sx={{ minHeight: 44, bgcolor: tk.gold, color: tk.goldBtnFg, fontWeight: 700 }}
                  >
                    Mask Credentials
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setMaskOutput(generateEnvExample(maskInput).example_content)}
                    sx={{ minHeight: 44, borderColor: tk.gold, color: tk.gold, fontWeight: 700 }}
                  >
                    Generate .env.example
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                    Sanitized Output
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(maskOutput, 'maskOut')}
                    sx={{ minHeight: 40, borderColor: tk.gold, color: tk.gold, fontFamily: mono }}
                  >
                    {copiedKey === 'maskOut' ? 'Copied' : 'Copy'}
                  </Button>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={9}
                  label="Sanitized .env output"
                  value={maskOutput}
                  InputProps={{ readOnly: true }}
                  inputProps={{ 'aria-label': 'Sanitized .env output' }}
                  sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink } }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink, mb: 1.5 }}>
              Environment Diff Comparator ({diffResult.differences_count} Differences · {diffResult.identical_values_count} Identical)
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Environment A (.env.development)"
                  value={diffA}
                  onChange={(e) => setDiffA(e.target.value)}
                  inputProps={{ 'aria-label': 'Environment A content' }}
                  sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink } }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Environment B (.env.production)"
                  value={diffB}
                  onChange={(e) => setDiffB(e.target.value)}
                  inputProps={{ 'aria-label': 'Environment B content' }}
                  sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink } }}
                />
              </Grid>
            </Grid>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {diffResult.differences.map((d) => (
                <Box
                  key={d.key}
                  sx={{
                    p: 1.1,
                    borderRadius: 1.5,
                    bgcolor: tk.bgSubtle,
                    border: `1px solid ${tk.borderSubtle}`,
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    color: tk.ink,
                  }}
                >
                  <strong>{d.key}</strong> ({d.status}) — A: {d.val_a ?? 'MISSING'} | B: {d.val_b ?? 'MISSING'}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* TAB 3: SHAMIR QUORUM & ROTATION SENTINEL */}
      {activeTab === 3 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink, mb: 1.5 }}>
                GF(256) Shamir (k, n) Quorum
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Master Secret to Split"
                value={shamirSecret}
                onChange={(e) => setShamirSecret(e.target.value)}
                sx={{ mb: 1.5, bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, color: tk.ink } }}
              />
              <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Threshold (k)"
                    value={shamirK}
                    onChange={(e) => setShamirK(e.target.value)}
                    inputProps={{ min: 2, max: 15 }}
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Total Shares (n)"
                    value={shamirN}
                    onChange={(e) => setShamirN(e.target.value)}
                    inputProps={{ min: 2, max: 20 }}
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
                <Button variant="contained" onClick={handleShamirSplit} sx={{ minHeight: 44, bgcolor: tk.gold, color: tk.goldBtnFg, fontWeight: 700 }}>
                  Split Over GF(256)
                </Button>
                <Button variant="outlined" onClick={handleShamirCombine} sx={{ minHeight: 44, borderColor: tk.ok, color: tk.ok, fontWeight: 700 }}>
                  Verify &amp; Reconstruct
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={7}
                label="Armored Shamir Shares (SHA-256 checksum verified)"
                value={shamirSharesText}
                onChange={(e) => setShamirSharesText(e.target.value)}
                inputProps={{ 'aria-label': 'Armored Shamir shares' }}
                sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.74rem', color: tk.ink } }}
              />
              {shamirRecovered && (
                <Alert severity="success" sx={{ mt: 1.25, fontFamily: mono }}>
                  Reconstructed Secret: {shamirRecovered}
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  TTL Rotation Sentinel
                </Typography>
                <Chip
                  size="small"
                  label={`Compliance ${rotAudit.compliance_score}/100 · Expired: ${rotAudit.expired_count}`}
                  sx={{
                    bgcolor: rotAudit.expired_count > 0 ? tk.dangerBg : tk.okBg,
                    color: rotAudit.expired_count > 0 ? tk.danger : tk.ok,
                    fontFamily: mono,
                    fontWeight: 700,
                  }}
                />
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Annotated .env (# @created / # @expires)"
                value={rotInput}
                onChange={(e) => setRotInput(e.target.value)}
                inputProps={{ 'aria-label': 'Annotated .env for rotation audit' }}
                sx={{ mb: 1.5, bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.78rem', color: tk.ink } }}
              />
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
                <TextField
                  size="small"
                  type="number"
                  label="Policy Days"
                  value={rotDays}
                  onChange={(e) => setRotDays(Number(e.target.value) || 90)}
                  sx={{ width: 120 }}
                />
                <Button variant="contained" onClick={handleRotateExecute} sx={{ minHeight: 44, bgcolor: tk.gold, color: tk.goldBtnFg, fontWeight: 700 }}>
                  Rotate Expired Keys
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Rotated .env output"
                value={rotOutput}
                InputProps={{ readOnly: true }}
                inputProps={{ 'aria-label': 'Rotated .env output' }}
                sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.78rem', color: tk.ink } }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 4: MCP SERVER (11 REAL TOOLS) & CLI */}
      {activeTab === 4 && (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                    Stdio MCP Server Configuration
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(mcpConfigJson, 'mcpCfg')}
                    sx={{ minHeight: 40, borderColor: tk.gold, color: tk.gold, fontFamily: mono }}
                  >
                    {copiedKey === 'mcpCfg' ? 'Copied' : 'Copy JSON'}
                  </Button>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="MCP JSON configuration"
                  value={mcpConfigJson}
                  InputProps={{ readOnly: true }}
                  inputProps={{ 'aria-label': 'MCP JSON configuration' }}
                  sx={{ bgcolor: tk.bgCode, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem', color: tk.ink } }}
                />
              </Paper>
            </Grid>
            <Grid xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink, mb: 1.25 }}>
                  Verified ZothOS CLI &amp; TUI Commands
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    bgcolor: tk.bgCode,
                    color: tk.ink,
                    border: `1px solid ${tk.borderSubtle}`,
                    borderRadius: 2,
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                  }}
                >
                  <pre style={{ margin: 0 }}>{`envguard-secrets-vault scan .env --json --min-score 80
envguard-secrets-vault mask .env --mode partial
envguard-secrets-vault example .env --output .env.example
envguard-secrets-vault encrypt .env --out .env.enc
envguard-secrets-vault decrypt .env.enc --out .env
envguard-secrets-vault shamir split "MASTER_KEY" -k 3 -n 5 --json
envguard-secrets-vault rotate .env --audit-only --json
envguard-secrets-vault test
envguard-secrets-vault-tui --once --json`}</pre>
                </Paper>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, bgcolor: tk.bgCard, border: `1px solid ${tk.borderSubtle}` }}>
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink, mb: 1.5 }}>
              Registered Stdio MCP Tools ({MCP_TOOLS.length})
            </Typography>
            <Grid container spacing={1.5}>
              {MCP_TOOLS.map((t) => (
                <Grid xs={12} sm={6} md={4} key={t.name}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: tk.bgSubtle,
                      border: `1px solid ${tk.borderSubtle}`,
                      height: '100%',
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.84rem', color: tk.gold }}>
                      {t.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tk.inkSec, fontSize: '0.82rem', mt: 0.5 }}>
                      {t.desc || t.summary}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}

export default EnvGuardVaultGodModeTool;
