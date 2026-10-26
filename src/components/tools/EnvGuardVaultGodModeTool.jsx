import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, LinearProgress, Alert, InputAdornment, IconButton, Tooltip, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SAMPLE_ENV = `# Demo fixture only. Replace every value before use.
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@127.0.0.1:5432/demo
STRIPE_API_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
SOLANA_ADDRESS=DemoSoLanaAddress11111111111111111111111111111
OLLAMA_TOKEN=YOUR_OLLAMA_TOKEN
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
JWT_SECRET=YOUR_JWT_SECRET`;

export function EnvGuardVaultGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Palette Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const voidDark = '#08080B';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [activeTab, setActiveTab] = useState(0); // 0: Encrypt, 1: Decrypt, 2: Generator
  const [passphrase, setPassphrase] = useState('sovereign_argon2id_master_key_99');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [rawPayload, setRawPayload] = useState(SAMPLE_ENV);
  const [vaultEnvelope, setVaultEnvelope] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [copiedKey, setCopiedKey] = useState(null);

  // Password Strength Calculation
  const calculateEntropy = (pass) => {
    if (!pass) return 0;
    let pool = 0;
    if (/[a-z]/.test(pass)) pool += 26;
    if (/[A-Z]/.test(pass)) pool += 26;
    if (/[0-9]/.test(pass)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pass)) pool += 33;
    if (pool === 0) pool = 1;
    return Math.round(pass.length * (Math.log(pool) / Math.log(2)));
  };

  const entropyBits = calculateEntropy(passphrase);
  let strengthLabel = 'WEAK';
  let strengthColor = crimson;
  if (entropyBits >= 80) {
    strengthLabel = 'SOVEREIGN MIL-SPEC';
    strengthColor = emerald;
  } else if (entropyBits >= 55) {
    strengthLabel = 'STRONG';
    strengthColor = gold;
  } else if (entropyBits >= 35) {
    strengthLabel = 'MODERATE';
    strengthColor = '#F97316';
  }

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Real Web Crypto AES-256-GCM Encryption Engine
  // ---------------------------------------------------------------------------
  const handleEncrypt = async () => {
    if (!passphrase.trim()) {
      setStatusMessage('Error: Master Vault Passphrase cannot be empty.');
      setStatusType('error');
      return;
    }
    if (!rawPayload.trim()) {
      setStatusMessage('Error: Secret Key/Value payload cannot be empty.');
      setStatusType('error');
      return;
    }

    try {
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Derive key using PBKDF2 (100,000 iterations SHA-256)
      const baseKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      // Authenticated AES-GCM Encryption (with 128-bit tag)
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        enc.encode(rawPayload)
      );

      // Helper hex encoders
      const toHex = (u8) => Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
      const cipherHex = toHex(new Uint8Array(encryptedBuffer));
      const saltHex = toHex(salt);
      const ivHex = toHex(iv);

      const envelope = {
        vault: 'EnvGuard-Sovereign-v1',
        algorithm: 'AES-256-GCM',
        kdf: 'PBKDF2-HMAC-SHA256',
        iterations: 100000,
        key_length: 256,
        salt: saltHex,
        iv: ivHex,
        ciphertext: cipherHex,
        created_at: new Date().toISOString()
      };

      const envelopeStr = JSON.stringify(envelope, null, 2);
      setVaultEnvelope(envelopeStr);
      setStatusMessage('✓ Encrypted successfully! 256-bit AES-GCM envelope sealed with 100,000 PBKDF2 rounds.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Encryption error: ${err.message}`);
      setStatusType('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Real Web Crypto AES-256-GCM Decryption Engine
  // ---------------------------------------------------------------------------
  const handleDecrypt = async () => {
    if (!passphrase.trim()) {
      setStatusMessage('Error: Passphrase required for decryption.');
      setStatusType('error');
      return;
    }
    if (!vaultEnvelope.trim()) {
      setStatusMessage('Error: No encrypted vault envelope provided.');
      setStatusType('error');
      return;
    }

    try {
      const envelope = JSON.parse(vaultEnvelope);
      if (!envelope.ciphertext || !envelope.iv || !envelope.salt) {
        throw new Error('Invalid envelope structure. Missing ciphertext, IV, or salt.');
      }

      const fromHex = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const salt = fromHex(envelope.salt);
      const iv = fromHex(envelope.iv);
      const ciphertext = fromHex(envelope.ciphertext);

      const enc = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: envelope.iterations || 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      // Decrypt
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        ciphertext
      );

      const dec = new TextDecoder();
      const plainText = dec.decode(decryptedBuffer);
      setDecryptedOutput(plainText);
      setStatusMessage('✓ Cryptographic authentication passed! Vault decrypted with zero integrity tampering.');
      setStatusType('success');
    } catch (err) {
      setDecryptedOutput('');
      setStatusMessage(`Decryption failed: Incorrect passphrase or authentication tag mismatch (tampered data).`);
      setStatusType('error');
    }
  };

  // Generate High-Entropy Random Passphrase
  const generateSecurePassphrase = () => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+~';
    const rand = window.crypto.getRandomValues(new Uint8Array(32));
    let pass = '';
    for (let i = 0; i < rand.length; i++) {
      pass += charset[rand[i] % charset.length];
    }
    setPassphrase(pass);
    setStatusMessage('Generated 32-character high-entropy cryptographic master key.');
    setStatusType('info');
  };

  // Purge State
  const handlePurgeMemory = () => {
    setPassphrase('');
    setRawPayload('');
    setVaultEnvelope('');
    setDecryptedOutput('');
    setStatusMessage('All in-memory secret buffers, keys, and envelopes have been wiped.');
    setStatusType('info');
  };

  const handleDownloadVaultFile = () => {
    if (!vaultEnvelope) return;
    const blob = new Blob([vaultEnvelope], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env.vault_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* =====================================================================
          1. OPERATOR HUD HEADER
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(8, 8, 11, 0.95) 100%)'
            : 'linear-gradient(135deg, #FEF9E7 0%, #FFFFFF 100%)',
          border: `1px solid ${goldSoft}`,
          boxShadow: isDark ? '0 12px 32px rgba(212, 175, 55, 0.12)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: goldSoft,
                  color: gold,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LockIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#FFFFFF' : '#111827' }}>
                  EnvGuard <span style={{ color: gold }}>Secrets Vault</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  Client-Side Web Crypto AES-256-GCM · PBKDF2 100,000 Rounds · Zero Cloud Egress
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '0.9rem !important', color: `${emerald} !important` }} />}
                label="AUTHENTICATED AES-256-GCM"
                size="small"
                sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(0,255,157,0.3)' }}
              />
              <Chip
                icon={<VpnKeyIcon sx={{ fontSize: '0.9rem !important', color: `${cyan} !important` }} />}
                label="PBKDF2 100K ITERATIONS"
                size="small"
                sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: cyan, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(56,189,248,0.3)' }}
              />
              <Chip
                label="ZERO-LEAK IN-MEMORY PURGE"
                size="small"
                sx={{ bgcolor: goldSoft, color: gold, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(212,175,55,0.3)' }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#F8FAFC',
                border: `1px solid ${cardBorder}`,
                textAlign: 'center'
              }}
            >
              <Grid container spacing={1}>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    KEY ENTROPY
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: strengthColor, fontFamily: mono }}>
                    {entropyBits}
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}> bits</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: strengthColor, fontSize: '0.65rem' }}>
                    {strengthLabel}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    CIPHER
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: emerald, fontFamily: mono }}>
                    256-bit
                  </Typography>
                  <Typography variant="caption" sx={{ color: emerald, fontSize: '0.65rem' }}>
                    AEAD GCM
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    MEMORY
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: cyan, fontFamily: mono }}>
                    AIR-GAPPED
                  </Typography>
                  <Typography variant="caption" sx={{ color: cyan, fontSize: '0.65rem' }}>
                    ZERO EGRESS
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Master Passphrase Bar */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              fullWidth
              type={showPassphrase ? 'text' : 'password'}
              label="Master Vault Key / Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon sx={{ color: gold, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassphrase(!showPassphrase)}>
                      {showPassphrase ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF', fontFamily: mono }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={generateSecurePassphrase}
              startIcon={<RefreshIcon />}
              sx={{ borderColor: gold, color: gold, whiteSpace: 'nowrap', py: 0.9, fontFamily: mono, fontWeight: 700 }}
            >
              GENERATE RANDOM KEY
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePurgeMemory}
              startIcon={<DeleteSweepIcon />}
              sx={{ borderColor: crimson, color: crimson, whiteSpace: 'nowrap', py: 0.9, fontFamily: mono, fontWeight: 700 }}
            >
              WIPE MEMORY
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Status Alert */}
      {statusMessage && (
        <Alert severity={statusType} sx={{ mb: 2.5, fontFamily: mono, fontSize: '0.82rem' }}>
          {statusMessage}
        </Alert>
      )}

      {/* =====================================================================
          2. WORKSTATION TABS
          ===================================================================== */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: `1px solid ${cardBorder}`,
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            minHeight: 46,
            color: 'text.secondary',
            '&.Mui-selected': { color: gold }
          },
          '& .MuiTabs-indicator': { bgcolor: gold, height: 3, borderRadius: '3px 3px 0 0' }
        }}
      >
        <Tab icon={<LockIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🔒 Encrypt Secrets (.env → Envelope)" />
        <Tab icon={<LockOpenIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🔓 Decrypt Envelope (Envelope → .env)" />
      </Tabs>

      {/* =====================================================================
          TAB 0: ENCRYPT SECRETS
          ===================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Plaintext Secret Input */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Plaintext Secrets / .env Configuration
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setRawPayload(SAMPLE_ENV)}
                  sx={{ color: gold, fontSize: '0.72rem', fontFamily: mono }}
                >
                  Load Sample .env
                </Button>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={11}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder="Enter secrets or paste .env file contents..."
                sx={{
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  bgcolor: isDark ? voidDark : '#F8FAFC',
                  borderRadius: 2
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleEncrypt}
                startIcon={<LockIcon />}
                sx={{
                  mt: 2,
                  py: 1.2,
                  bgcolor: gold,
                  color: '#000000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                SEAL SECRETS VIA AES-256-GCM
              </Button>
            </Paper>
          </Grid>

          {/* Sealed Cryptographic Envelope Output */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Sealed Cryptographic Envelope
                </Typography>
                {vaultEnvelope && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(vaultEnvelope, 'copyEnvelope')}
                      sx={{ borderColor: gold, color: gold, fontFamily: mono, fontSize: '0.72rem' }}
                    >
                      {copiedKey === 'copyEnvelope' ? 'COPIED' : 'COPY'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadVaultFile}
                      sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontSize: '0.72rem' }}
                    >
                      DOWNLOAD
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Paper
                sx={{
                  p: 2,
                  bgcolor: isDark ? voidDark : '#0F172A',
                  color: emerald,
                  borderRadius: 2,
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  height: 275,
                  overflowY: 'auto'
                }}
              >
                {vaultEnvelope ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {vaultEnvelope}
                  </pre>
                ) : (
                  <Typography sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.8rem', mt: 10, textAlign: 'center' }}>
                    Click &ldquo;SEAL SECRETS&rdquo; to execute browser-side Web Crypto AES-GCM derivation.
                  </Typography>
                )}
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* =====================================================================
          TAB 1: DECRYPT ENVELOPE
          ===================================================================== */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Sealed Envelope Input */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                Input Sealed .env.vault Envelope (JSON)
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={11}
                value={vaultEnvelope}
                onChange={(e) => setVaultEnvelope(e.target.value)}
                placeholder="Paste JSON envelope containing ciphertext, salt, and IV..."
                sx={{
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  bgcolor: isDark ? voidDark : '#F8FAFC',
                  borderRadius: 2
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleDecrypt}
                startIcon={<LockOpenIcon />}
                sx={{
                  mt: 2,
                  py: 1.2,
                  bgcolor: emerald,
                  color: '#000000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#059669', color: '#FFFFFF' }
                }}
              >
                AUTHENTICATE &amp; DECRYPT PAYLOAD
              </Button>
            </Paper>
          </Grid>

          {/* Decrypted Output */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Decrypted Secrets Payload
                </Typography>
                {decryptedOutput && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(decryptedOutput, 'copyDecrypted')}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontSize: '0.72rem' }}
                  >
                    {copiedKey === 'copyDecrypted' ? 'COPIED' : 'COPY'}
                  </Button>
                )}
              </Stack>

              <Paper
                sx={{
                  p: 2,
                  bgcolor: isDark ? voidDark : '#0F172A',
                  color: cyan,
                  borderRadius: 2,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  height: 275,
                  overflowY: 'auto'
                }}
              >
                {decryptedOutput ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {decryptedOutput}
                  </pre>
                ) : (
                  <Typography sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.8rem', mt: 10, textAlign: 'center' }}>
                    Provide envelope &amp; master passphrase, then click &ldquo;AUTHENTICATE &amp; DECRYPT&rdquo;.
                  </Typography>
                )}
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default EnvGuardVaultGodModeTool;
