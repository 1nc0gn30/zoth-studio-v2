import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import BugReportIcon from '@mui/icons-material/BugReport';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SecurityIcon from '@mui/icons-material/Security';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Sample Decompiled Binaries Database
// ---------------------------------------------------------------------------
const SAMPLE_PROGRAMS = [
  {
    id: 'zoth-vault-daemon',
    name: 'zoth-vault-daemon.elf',
    arch: 'x86_64',
    format: 'ELF 64-bit LSB pie executable',
    compiler: 'rustc 1.82.0 (LLVM 19.1)',
    entryPoint: '0x00401020',
    totalFunctions: 42,
    functions: [
      {
        name: 'main',
        address: '0x00401020',
        size: 148,
        pseudocode: `int main(int argc, char **argv) {
    vault_config_t config;
    int status = vault_init(&config, 8787);
    if (status != 0) {
        log_error("Failed to bind vault enclave on 127.0.0.1:8787");
        return 1;
    }
    argon2id_kdf_init(&config.argon_ctx, 64 * 1024, 3, 4);
    chacha20_poly1305_seal_init(&config.aead_ctx);
    log_info("Zoth Vault Ring-0 Custody Daemon online.");
    return event_loop_run(&config);
}`
      },
      {
        name: 'argon2id_kdf_derive',
        address: '0x00401340',
        size: 324,
        pseudocode: `int argon2id_kdf_derive(const uint8_t *pwd, size_t pwd_len,
                        const uint8_t *salt, size_t salt_len,
                        uint8_t *out_key, size_t key_len) {
    if (!pwd || pwd_len == 0 || !out_key || key_len < 32) {
        return -EINVAL;
    }
    argon2_context ctx = {
        .out = out_key,
        .outlen = key_len,
        .pwd = (uint8_t *)pwd,
        .pwdlen = pwd_len,
        .salt = (uint8_t *)salt,
        .saltlen = salt_len,
        .m_cost = 65536, /* 64 MB memory-hard */
        .t_cost = 3,     /* 3 iterations */
        .lanes = 4
    };
    return argon2id_ctx(&ctx);
}`
      },
      {
        name: 'chacha20_poly1305_decrypt',
        address: '0x00401780',
        size: 256,
        pseudocode: `int chacha20_poly1305_decrypt(const uint8_t *ciphertext, size_t ct_len,
                               const uint8_t *tag, const uint8_t *nonce,
                               const uint8_t *key, uint8_t *plaintext) {
    int ret = crypto_aead_chacha20poly1305_ietf_decrypt(
        plaintext, NULL, NULL, ciphertext, ct_len, tag, sizeof(tag), nonce, key
    );
    if (ret != 0) {
        memzero_explicit(plaintext, ct_len);
        return -EAUTH;
    }
    return 0;
}`
      }
    ],
    strings: [
      { address: '0x00403010', value: '127.0.0.1:8787' },
      { address: '0x00403024', value: 'Zoth Vault Ring-0 Custody Daemon online.' },
      { address: '0x00403050', value: 'Failed to bind vault enclave on 127.0.0.1:8787' },
      { address: '0x00403080', value: 'argon2id_chacha20poly1305_v3' }
    ],
    imports: ['libsodium.so.23', 'libc.so.6', 'libpthread.so.0']
  },
  {
    id: 'kernel-module-rootkit-probe',
    name: 'probe_check.ko',
    arch: 'x86_64',
    format: 'ELF 64-bit LSB relocatable, Linux 6.12',
    compiler: 'gcc 14.2.0',
    entryPoint: '0x00000000',
    totalFunctions: 18,
    functions: [
      {
        name: 'init_module',
        address: '0x00000000',
        size: 96,
        pseudocode: `int init_module(void) {
    pr_info("ZothOS kernel integrity sentinel loaded.\\n");
    hook_sys_call_table_verifier();
    register_kprobe(&kp_execve);
    return 0;
}`
      },
      {
        name: 'hook_sys_call_table_verifier',
        address: '0x00000060',
        size: 180,
        pseudocode: `static void hook_sys_call_table_verifier(void) {
    unsigned long *sys_call_table = (unsigned long *)kallsyms_lookup_name("sys_call_table");
    if (!sys_call_table) return;
    pr_info("sys_call_table at %px verified against read-only CR0 WP bit\\n", sys_call_table);
}`
      }
    ],
    strings: [
      { address: '0x00000200', value: 'ZothOS kernel integrity sentinel loaded.' },
      { address: '0x00000230', value: 'sys_call_table at %px verified against read-only CR0 WP bit' }
    ],
    imports: ['vmlinux']
  }
];

export function GhidraMcpGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Palette tokens
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const goldBorder = 'rgba(212, 175, 55, 0.4)';
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const emeraldBorder = 'rgba(0, 255, 157, 0.38)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [selectedProgram, setSelectedProgram] = useState(SAMPLE_PROGRAMS[0]);
  const [selectedFunction, setSelectedFunction] = useState(SAMPLE_PROGRAMS[0].functions[0]);
  const [activeTab, setActiveTab] = useState(0);
  const [ghidraHost, setGhidraHost] = useState('http://127.0.0.1:8080/');
  const [isConnecting, setIsConnecting] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState('OFFLINE');
  const [commentInput, setCommentInput] = useState('');
  const [annotatedComments, setAnnotatedComments] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro State
  const [isProLicensed, setIsProLicensed] = useState(true);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || urlParams.get('pro') === 'true') {
        localStorage.setItem('ghidra_pro_licensed', 'true');
        setIsProLicensed(true);
      } else {
        const stored = localStorage.getItem('ghidra_pro_licensed');
        if (stored === 'true') setIsProLicensed(true);
      }
    }
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length >= 6) {
      localStorage.setItem('ghidra_pro_licensed', 'true');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const testGhidraConnection = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(ghidraHost, { method: 'GET', mode: 'no-cors' });
      setBridgeStatus('ONLINE (Listener Active)');
    } catch (err) {
      setBridgeStatus('OFFLINE (GhidraMCP Plugin not listening on :8080)');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setAnnotatedComments(prev => ({
      ...prev,
      [selectedFunction.address]: [...(prev[selectedFunction.address] || []), commentInput.trim()]
    }));
    setCommentInput('');
  };

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* =====================================================================
          1. HIGH-CONVERTING MONETIZATION SALES FUNNEL BANNER
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.14) 0%, rgba(56, 189, 248, 0.12) 50%, rgba(8, 8, 11, 0.98) 100%)'
            : 'linear-gradient(135deg, #F0F9FF 0%, #FFFBEB 100%)',
          border: `1px solid ${goldBorder}`,
          boxShadow: isDark ? '0 12px 32px rgba(212, 175, 55, 0.15)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label="⚡ FOUNDING PASS"
                size="small"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
              />
              <Typography variant="body2" sx={{ color: cyan, fontWeight: 700, fontFamily: mono }}>
                REVERSE ENGINEERING SUITE
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#FFFFFF' : '#111827' }}>
              GhidraMCP Autonomous Binary Analysis Workstation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Powered by LaurieWired's GhidraMCP. Connects autonomous LLM agents to NSA Ghidra for automated function decompilation, variable renaming, and zero-telemetry reverse engineering.
            </Typography>
          </Grid>

          <Grid xs={12} md={5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems="center">
              <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontFamily: mono }}>
                  $79.00 REGULAR
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                  $19.00 <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>LIFETIME</span>
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  component="a"
                  href="https://github.com/1nc0gn30/zoth-studio-v2"
                  target="_blank"
                  rel="noopener"
                  startIcon={<BoltIcon />}
                  sx={{
                    bgcolor: gold,
                    color: '#000',
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: '#B89628' }
                  }}
                >
                  STRIPE $19
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href="https://github.com/1nc0gn30/zoth-studio-v2"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    borderColor: cyan,
                    color: cyan,
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: cyanSoft }
                  }}
                >
                  SOLANA DEPAY
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowPaywallModal(true)}
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textDecoration: 'underline' }}
              >
                Already have a license key or receipt? Activate Pro
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          2. WORKSTATION HUD
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: isDark ? '#10121A' : '#FFFFFF',
          border: `1px solid ${cardBorder}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: cyanSoft, color: cyan, display: 'flex' }}>
                <MemoryIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#111827' }}>
                  GhidraMCP <span style={{ color: cyan }}>Decompiler & AST Engine</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  LaurieWired Specification · Apache-2.0 · Localhost IPC Protocol
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip
                icon={isProLicensed ? <CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: `${emerald} !important` }} /> : <LockIcon sx={{ fontSize: '0.9rem !important', color: `${gold} !important` }} />}
                label={isProLicensed ? "⭐ PRO ACTIVE" : "FOUNDING PASS ($19)"}
                size="small"
                onClick={() => !isProLicensed && setShowPaywallModal(true)}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : goldSoft,
                  color: isProLicensed ? emerald : gold,
                  fontWeight: 800,
                  fontFamily: mono,
                  border: `1px solid ${isProLicensed ? emeraldBorder : goldBorder}`,
                  cursor: isProLicensed ? 'default' : 'pointer'
                }}
              />
              <Chip
                label="GHIDRA 12.1.4 READY"
                size="small"
                sx={{ bgcolor: cyanSoft, color: cyan, fontWeight: 700, fontFamily: mono }}
              />
              <Chip
                label="PYGHIDRA HEADLESS"
                size="small"
                sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 700, fontFamily: mono }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper sx={{ p: 1.5, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono, display: 'block', mb: 0.5 }}>
                LOCAL GHIDRA MCP SERVER ENDPOINT:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  value={ghidraHost}
                  onChange={(e) => setGhidraHost(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', color: '#38BDF8' } }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={testGhidraConnection}
                  disabled={isConnecting}
                  sx={{ fontFamily: mono, fontSize: '0.7rem', color: emerald, borderColor: emeraldBorder, whiteSpace: 'nowrap' }}
                >
                  {isConnecting ? 'Testing...' : 'Test Link'}
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color: bridgeStatus.includes('ONLINE') ? emerald : 'text.secondary', fontFamily: mono, mt: 0.5, display: 'block' }}>
                Status: {bridgeStatus}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          3. BINARY PROGRAM SELECTOR & NAVIGATION TABS
          ===================================================================== */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Inspected Binary File</InputLabel>
              <Select
                value={selectedProgram.id}
                label="Inspected Binary File"
                onChange={(e) => {
                  const prog = SAMPLE_PROGRAMS.find(p => p.id === e.target.value);
                  setSelectedProgram(prog);
                  setSelectedFunction(prog.functions[0]);
                }}
                sx={{ fontFamily: mono, fontSize: '0.82rem' }}
              >
                {SAMPLE_PROGRAMS.map(p => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                    {p.name} ({p.arch} · {p.format})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <Chip label={`Entry: ${selectedProgram.entryPoint}`} size="small" sx={{ fontFamily: mono, fontSize: '0.72rem' }} />
              <Chip label={`${selectedProgram.totalFunctions} Functions`} size="small" sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: cyanSoft, color: cyan }} />
              <Chip label={selectedProgram.compiler} size="small" sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: goldSoft, color: gold }} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${cardBorder}`,
          '& .MuiTab-root': {
            fontFamily: mono,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.secondary',
            '&.Mui-selected': { color: cyan }
          },
          '& .MuiTabs-indicator': { bgcolor: cyan }
        }}
      >
        <Tab icon={<CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="⚡ Decompiler Pseudocode & AST" />
        <Tab icon={<MemoryIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="📋 Strings, Imports & Exports" />
        <Tab icon={<SettingsEthernetIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🛠️ LaurieWired MCP Commands" />
      </Tabs>

      {/* =====================================================================
          TAB 0: DECOMPILER PSEUDOCODE
          ===================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: gold }}>
                FUNCTIONS ({selectedProgram.functions.length})
              </Typography>
              <Stack spacing={1}>
                {selectedProgram.functions.map(fn => {
                  const isSelected = selectedFunction.address === fn.address;
                  return (
                    <Box
                      key={fn.address}
                      onClick={() => setSelectedFunction(fn)}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: isSelected ? cyanSoft : isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        border: `1px solid ${isSelected ? cyan : 'transparent'}`,
                        '&:hover': { bgcolor: cyanSoft }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? cyan : 'text.primary' }}>
                          {fn.name}()
                        </Typography>
                        <Chip label={fn.address} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem', height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontFamily: mono }}>
                        Size: {fn.size} bytes
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={8}>
            <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                    {selectedFunction.name} <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>at {selectedFunction.address}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                    Decompiled via Ghidra Decompiler Engine
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleCopy(selectedFunction.pseudocode, 'decomp')}
                  startIcon={copiedKey === 'decomp' ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                  sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan, borderColor: 'rgba(56,189,248,0.4)' }}
                >
                  {copiedKey === 'decomp' ? 'Copied' : 'Copy C Code'}
                </Button>
              </Box>

              <Paper sx={{ p: 2, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', mb: 2 }}>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.6, overflowX: 'auto' }}>
                  {selectedFunction.pseudocode}
                </pre>
              </Paper>

              {/* Annotation & Comments */}
              <Box sx={{ p: 2, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: gold, fontWeight: 700, fontFamily: mono, display: 'block', mb: 1 }}>
                  💬 GHIDRA ANNOTATIONS & AGENT COMMENTS
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add Ghidra comment (e.g. Verified zero-telemetry key derivation loop)..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleAddComment}
                    sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, whiteSpace: 'nowrap' }}
                  >
                    Add
                  </Button>
                </Stack>

                {annotatedComments[selectedFunction.address] && (
                  <Stack spacing={0.8}>
                    {annotatedComments[selectedFunction.address].map((c, i) => (
                      <Box key={i} sx={{ p: 1, bgcolor: 'rgba(212,175,55,0.08)', borderRadius: 1, border: '1px solid rgba(212,175,55,0.2)' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#F8FAFC' }}>
                          // {c}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* =====================================================================
          TAB 1: STRINGS & IMPORTS
          ===================================================================== */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: gold }}>
                Extracted ASCII / UTF-8 Strings
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: voidDark, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.7rem' }}>ADDRESS</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.7rem' }}>STRING VALUE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProgram.strings.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', color: cyan }}>{s.address}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#F8FAFC' }}>"{s.value}"</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: emerald }}>
                Dynamic Library Imports & Linkages
              </Typography>
              <Stack spacing={1}>
                {selectedProgram.imports.map((imp, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: voidDark, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#38BDF8', fontWeight: 700 }}>
                      {imp}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* =====================================================================
          TAB 2: LAURIEWIRED GHIDRA MCP COMMANDS
          ===================================================================== */}
      {activeTab === 2 && (
        <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: cyan }}>
            LaurieWired GhidraMCP Agent Commands & One-Liners
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Execute these commands directly in your terminal or register in any MCP-compatible agent environment:
          </Typography>

          <Grid container spacing={2}>
            {[
              {
                title: 'Start GhidraMCP Bridge (Connected to Ghidra GUI)',
                cmd: 'uvx --from git+https://github.com/LaurieWired/GhidraMCP ghidra-mcp --ghidra-server http://127.0.0.1:8080/'
              },
              {
                title: 'Headless Binary Analysis (PyGhidra - No GUI)',
                cmd: 'uvx --python 3.13 --from "ghidra-mcp[headless] @ git+https://github.com/LaurieWired/GhidraMCP" ghidra-mcp --headless --binary /usr/local/bin/zoth-vault-daemon'
              },
              {
                title: 'Add to Claude Code',
                cmd: 'claude mcp add ghidra -- uvx --from git+https://github.com/LaurieWired/GhidraMCP ghidra-mcp --ghidra-server http://127.0.0.1:8080/'
              },
              {
                title: 'Run Streamable HTTP MCP Daemon',
                cmd: 'uvx --from git+https://github.com/LaurieWired/GhidraMCP ghidra-mcp --transport streamable-http --mcp-host 127.0.0.1 --mcp-port 8081 --ghidra-server http://127.0.0.1:8080/'
              }
            ].map((c, i) => (
              <Grid xs={12} key={i}>
                <Paper sx={{ p: 1.5, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography variant="caption" sx={{ color: gold, fontFamily: mono, fontWeight: 700, display: 'block', mb: 0.5 }}>
                    {c.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>
                      {c.cmd}
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopy(c.cmd, `ghidra_cmd_${i}`)} sx={{ color: '#94A3B8' }}>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* =====================================================================
          PRO ACTIVATION DIALOG
          ===================================================================== */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#10121A' : '#FFFFFF',
            border: `1px solid ${goldBorder}`,
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, color: gold, pb: 1 }}>
          ✦ 100% OPEN ACCESS
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Enter your receipt email or license key to permanently unlock all advanced reverse-engineering exports:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. GHIDRA-PRO-2026-XXXX or neal@..."
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon sx={{ color: gold, fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: { fontFamily: mono, fontSize: '0.82rem' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GhidraMcpGodModeTool;
