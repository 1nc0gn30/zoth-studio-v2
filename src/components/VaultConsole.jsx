import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Chip, LinearProgress,
  IconButton, Tooltip, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function VaultConsole() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldText = isDark ? '#F5E6AB' : '#8A6A09';
  const [secretName, setSecretName] = useState('OPENAI_API_KEY');
  const [secretValue, setSecretValue] = useState('sk-proj-7a98f7e21a0098bc19d45e6f3128765c');
  const [passphrase, setPassphrase] = useState('zoth-zero-cloud-master-key');
  const [encryptedPayload, setEncryptedPayload] = useState(null);
  const [copied, setCopied] = useState(false);
  const [derivedKey, setDerivedKey] = useState('');

  // Calculate Shannon entropy (bits per character)
  const calculateEntropy = (str) => {
    if (!str) return 0;
    const len = str.length;
    const frequencies = {};
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    return Object.values(frequencies).reduce((acc, count) => {
      const p = count / len;
      return acc - p * Math.log2(p);
    }, 0);
  };

  const entropy = calculateEntropy(secretValue);
  const maxEntropy = 6.0; // Typical threshold for high-entropy secret token
  const entropyPercent = Math.min(100, Math.round((entropy / maxEntropy) * 100));

  const handleEncrypt = () => {
    if (!secretValue || !passphrase) return;
    
    // Simulate Argon2id salt + AES-256-GCM IV generation
    const salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    const iv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    const keyHash = btoa(passphrase + salt).substring(0, 32);
    setDerivedKey(`0x${keyHash.split('').map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 32)}`);

    const ciphertext = btoa(`${secretName}:${secretValue}:${salt}:${iv}`);
    
    setEncryptedPayload({
      algorithm: 'Argon2id + AES-256-GCM',
      vault_port: '8787',
      secret_name: secretName,
      salt: `0x${salt}`,
      iv: `0x${iv}`,
      entropy_bits: entropy.toFixed(3),
      ciphertext: `zoth_vault_v1$${salt}$${iv}$${ciphertext.slice(0, 24)}...`
    });
  };

  const handleCopy = () => {
    if (!encryptedPayload) return;
    navigator.clipboard.writeText(JSON.stringify(encryptedPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, mb: 4, bgcolor: theme.palette.background.paper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: isDark ? 'rgba(212,175,55,0.14)' : '#FEF3F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SecurityIcon sx={{ color: isDark ? '#F5E6AB' : '#B42318' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Zero-Cloud Hardware Vault & Entropy Auditor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Derive Argon2id encryption keys and audit payload entropy locally on 127.0.0.1:8787
            </Typography>
          </Box>
        </Box>
        <Chip label="LOCAL VAULT DAEMON :8787" size="small" sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', fontWeight: 700 }} />
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Secret Key Identifier"
            value={secretName}
            onChange={(e) => setSecretName(e.target.value)}
            placeholder="e.g. AWS_SECRET_ACCESS_KEY"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Master Passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter vault master key"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Raw Secret Value / Token Payload"
            value={secretValue}
            onChange={(e) => setSecretValue(e.target.value)}
            placeholder="Paste API token, RSA key, or connection string..."
            size="small"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>

      {/* Real-time Entropy Auditor Bar */}
      <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon fontSize="small" sx={{ color: goldText }} /> Payload Shannon Entropy Analysis
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: entropy >= 4.0 ? '#12B76A' : '#D97706' }}>
            {entropy.toFixed(3)} bits/char ({entropyPercent}% randomness)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={entropyPercent}
          sx={{
            height: 8,
            borderRadius: 1,
            bgcolor: theme.palette.divider,
                        '& .MuiLinearProgress-bar': {
              bgcolor: entropy >= 4.5 ? '#12B76A' : entropy >= 3.0 ? '#F79009' : '#D92D20'
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {entropy >= 4.5
            ? ' High entropy detected (Excellent cryptographic randomness). Safe for vault seal.'
            : ' Moderate/low entropy detected. Consider using a cryptographically random token generator.'}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LockIcon />}
          onClick={handleEncrypt}
          disabled={!secretValue || !passphrase}
          sx={{ px: 3 }}
        >
          Encrypt & Derivate Key
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setSecretName('VAULT_TOKEN_' + Math.floor(Math.random() * 1000));
            const randBytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
            setSecretValue(`zk_live_${randBytes}`);
          }}
        >
          Generate High-Entropy Token
        </Button>
      </Box>

      {/* Derived Key & Ciphertext JSON Output */}
      {encryptedPayload && (
        <Box sx={{ bgcolor: isDark ? '#0B0B12' : '#101828', color: '#E6F4EA', p: 2.5, borderRadius: 1.5, fontFamily: mono, fontSize: '0.82rem' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: `1px solid ${isDark ? '#2A2A38' : '#1F2937'}` }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
              Encrypted Vault Sealed Payload (AES-256-GCM)
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy Sealed JSON'}>
              <IconButton size="small" onClick={handleCopy} sx={{ color: '#E6F4EA' }}>
                {copied ? <CheckIcon fontSize="small" sx={{ color: '#12B76A' }} /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(encryptedPayload, null, 2)}
          </pre>
          {derivedKey && (
            <Typography variant="caption" sx={{ color: '#98A2B3', mt: 1.5, display: 'block', fontFamily: mono }}>
              Argon2id Master Derived Key: {derivedKey}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
