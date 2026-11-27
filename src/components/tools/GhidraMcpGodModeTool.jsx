import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  GHIDRA_MCP_VERSION,
  GHIDRA_MCP_TOOLS,
  DEFAULT_BRIDGE_URL,
  validateLoopbackBridgeUrl,
  parseBinaryBuffer,
  applyVariableAnnotations,
  isValidSymbolArg,
} from '../../utils/ghidraMcpEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SAMPLE_PROGRAMS = [
  {
    id: 'zoth-vault-daemon',
    name: 'zoth-vault-daemon.elf',
    arch: 'x86_64',
    format: 'ELF64',
    compiler: 'rustc 1.82.0 (LLVM 19.1)',
    entryPoint: '0x00401020',
    totalFunctions: 42,
    overallEntropy: 5.9142,
    overallStatus: 'NORMAL',
    sections: [
      { name: '.text', vaddr: '0x401000', offset: '0x1000', size: 16384, flags: 'AX', entropy: 6.1421, status: 'ELEVATED', packed: false },
      { name: '.rodata', vaddr: '0x405000', offset: '0x5000', size: 4096, flags: 'A', entropy: 4.892, status: 'NORMAL', packed: false },
      { name: '.data', vaddr: '0x406000', offset: '0x6000', size: 1024, flags: 'WA', entropy: 2.4115, status: 'NORMAL', packed: false },
      { name: '.vault_blob', vaddr: '0x407000', offset: '0x7000', size: 2048, flags: 'A', entropy: 7.4812, status: 'PACKED / ENCRYPTED', packed: true },
    ],
    hexDump: [
      '0x00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|',
      '0x00000010  03 00 3e 00 01 00 00 00  20 10 40 00 00 00 00 00  |..>..... .@.....|',
      '0x00000020  f3 0f 1e fa 55 48 89 e5  48 83 ec 50 89 7d bc 48  |....UH..H..P.}.H|',
      '0x00000030  5a 6f 74 68 20 56 61 75  6c 74 20 52 69 6e 67 2d  |Zoth Vault Ring-|',
    ].join('\n'),
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
}`,
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
        .m_cost = 65536,
        .t_cost = 3,
        .lanes = 4
    };
    return argon2id_ctx(&ctx);
}`,
      },
    ],
    strings: [
      { offset: '0x00403010', value: '127.0.0.1:8787' },
      { offset: '0x00403024', value: 'Zoth Vault Ring-0 Custody Daemon online.' },
      { offset: '0x00403050', value: 'Failed to bind vault enclave on 127.0.0.1:8787' },
      { offset: '0x00403080', value: 'argon2id_chacha20poly1305_v3' },
    ],
    imports: ['libsodium.so.23', 'libc.so.6', 'libpthread.so.0'],
  },
  {
    id: 'probe_check.ko',
    name: 'probe_check.ko',
    arch: 'x86_64',
    format: 'ELF64',
    compiler: 'gcc 14.2.0',
    entryPoint: '0x00000000',
    totalFunctions: 18,
    overallEntropy: 5.1045,
    overallStatus: 'NORMAL',
    sections: [
      { name: '.text', vaddr: '0x0', offset: '0x40', size: 2048, flags: 'AX', entropy: 5.6122, status: 'NORMAL', packed: false },
      { name: '.rodata', vaddr: '0x840', offset: '0x840', size: 512, flags: 'A', entropy: 4.441, status: 'NORMAL', packed: false },
      { name: '.modinfo', vaddr: '0xa40', offset: '0xa40', size: 256, flags: 'A', entropy: 4.1098, status: 'NORMAL', packed: false },
    ],
    hexDump: [
      '0x00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|',
      '0x00000010  01 00 3e 00 01 00 00 00  00 00 00 00 00 00 00 00  |..>.............|',
    ].join('\n'),
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
}`,
      },
      {
        name: 'hook_sys_call_table_verifier',
        address: '0x00000060',
        size: 180,
        pseudocode: `static void hook_sys_call_table_verifier(void) {
    unsigned long *sys_call_table = (unsigned long *)kallsyms_lookup_name("sys_call_table");
    if (!sys_call_table) return;
    pr_info("sys_call_table at %px verified against read-only CR0 WP bit\\n", sys_call_table);
}`,
      },
    ],
    strings: [
      { offset: '0x00000200', value: 'ZothOS kernel integrity sentinel loaded.' },
      { offset: '0x00000230', value: 'sys_call_table at %px verified against read-only CR0 WP bit' },
    ],
    imports: ['vmlinux'],
  },
];

export function GhidraMcpGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dual-Theme WCAG AA+ Palette Tokens (Zero Light-Mode <4.5:1 failures, Zero Dark Slabs)
  const surfaceBg = isDark ? '#121622' : '#FFFFFF';
  const subSurfaceBg = isDark ? '#0B0E16' : '#F7F4EC';
  const codeBg = isDark ? '#0A0D14' : '#F7F4EC';
  const codeInk = isDark ? '#E6EDF7' : '#1A1712';
  const cardBorder = isDark ? 'rgba(232, 196, 106, 0.28)' : 'rgba(124, 92, 20, 0.30)';
  const subtleBorder = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(26, 23, 18, 0.16)';
  const inkPrimary = isDark ? '#F4EFE6' : '#1A1712';
  const inkMuted = isDark ? '#B6C0D2' : '#4A443A';
  const gold = isDark ? '#E8C46A' : '#7C5C14';
  const goldBg = isDark ? 'rgba(232, 196, 106, 0.16)' : '#F5ECD6';
  const goldBtnInk = isDark ? '#0B0D12' : '#FFFFFF';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const cyanBg = isDark ? 'rgba(56, 189, 248, 0.16)' : '#E0F2FE';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(52, 211, 153, 0.16)' : '#D1FAE5';
  const danger = isDark ? '#FB7185' : '#B91C1C';
  const dangerBg = isDark ? 'rgba(251, 113, 133, 0.16)' : '#FEE2E2';

  const fileInputRef = useRef(null);

  const [selectedProgram, setSelectedProgram] = useState(SAMPLE_PROGRAMS[0]);
  const [selectedFunction, setSelectedFunction] = useState(SAMPLE_PROGRAMS[0].functions[0]);
  const [activeTab, setActiveTab] = useState(0);

  // Honest loopback daemon state — NEVER defaults to ONLINE without verified 200 OK JSON
  const [ghidraHost, setGhidraHost] = useState(DEFAULT_BRIDGE_URL);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState('IDLE (Not Probed)');
  const [bridgeOnline, setBridgeOnline] = useState(false);
  const [bridgeEngines, setBridgeEngines] = useState(null);
  const [bridgeError, setBridgeError] = useState('');

  // Client-side uploaded binary analysis state
  const [uploadedReport, setUploadedReport] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Variable annotations + live comments
  const [oldVarInput, setOldVarInput] = useState('config');
  const [newVarInput, setNewVarInput] = useState('vault_cfg');
  const [varRenames, setVarRenames] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [annotatedComments, setAnnotatedComments] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const activeSections = uploadedReport ? uploadedReport.sections : selectedProgram.sections;
  const activeHexDump = uploadedReport
    ? uploadedReport.hexRows.map((r) => r.line).join('\n')
    : selectedProgram.hexDump;
  const activeStrings = uploadedReport ? uploadedReport.strings : selectedProgram.strings;

  const displayedPseudocode = useMemo(() => {
    const key = `${selectedProgram.id}:${selectedFunction.name}`;
    return applyVariableAnnotations(selectedFunction.pseudocode, varRenames[key] || {});
  }, [selectedProgram.id, selectedFunction, varRenames]);

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text)?.catch?.(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const testGhidraConnection = async () => {
    setBridgeError('');
    const checked = validateLoopbackBridgeUrl(ghidraHost);
    if (!checked.valid) {
      setBridgeOnline(false);
      setBridgeEngines(null);
      setBridgeStatus('BLOCKED (Loopback URL Required)');
      setBridgeError(checked.error);
      return;
    }

    setIsConnecting(true);
    try {
      const res = await fetch(`${checked.normalized}/health`, { method: 'GET' });
      if (!res.ok) {
        setBridgeOnline(false);
        setBridgeEngines(null);
        setBridgeStatus(`OFFLINE (HTTP ${res.status})`);
        return;
      }
      const data = await res.json();
      if (data && data.status === 'healthy') {
        setBridgeOnline(true);
        setBridgeEngines(data.engines || null);
        setBridgeStatus(`ONLINE (${data.service || 'ghidra-mcp-bridge'} v${data.version || GHIDRA_MCP_VERSION} on :${data.port || 8131})`);
      } else {
        setBridgeOnline(false);
        setBridgeEngines(null);
        setBridgeStatus('OFFLINE (Unexpected health response)');
      }
    } catch {
      setBridgeOnline(false);
      setBridgeEngines(null);
      setBridgeStatus(`OFFLINE (Not listening on ${checked.normalized})`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLiveDecompileFromDaemon = async () => {
    setBridgeError('');
    const checked = validateLoopbackBridgeUrl(ghidraHost);
    if (!checked.valid) {
      setBridgeError(checked.error);
      return;
    }
    try {
      const res = await fetch(
        `${checked.normalized}/api/decompile?program=${encodeURIComponent(selectedProgram.id)}&fn=${encodeURIComponent(selectedFunction.name)}`
      );
      const data = await res.json();
      if (res.ok && data.pseudocode) {
        setSelectedFunction((prev) => ({ ...prev, pseudocode: data.pseudocode }));
        setBridgeOnline(true);
        setBridgeStatus(`ONLINE (Live decompile: ${data.engine_used || 'daemon'})`);
      } else {
        setBridgeError(data.error || `HTTP ${res.status}`);
      }
    } catch {
      setBridgeError(`Could not reach ${checked.normalized}. Start with: ghidra-mcp-bridge serve`);
    }
  };

  const handleBinaryUpload = async (evt) => {
    setUploadError('');
    const file = evt.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) {
      setUploadError('File exceeds 16 MiB in-browser analysis cap.');
      return;
    }
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const report = parseBinaryBuffer(buf, file.name);
      setUploadedReport(report);
      setActiveTab(1);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse binary file');
    }
  };

  const handleRenameVariable = async () => {
    const oldN = oldVarInput.trim();
    const newN = newVarInput.trim();
    if (!isValidSymbolArg(oldN) || !isValidSymbolArg(newN)) {
      setBridgeError('Variable names must match ^[A-Za-z0-9_.@:$+-]{1,128}$');
      return;
    }
    setBridgeError('');
    const key = `${selectedProgram.id}:${selectedFunction.name}`;
    setVarRenames((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [oldN]: newN },
    }));

    if (bridgeOnline) {
      const checked = validateLoopbackBridgeUrl(ghidraHost);
      if (checked.valid) {
        try {
          await fetch(`${checked.normalized}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: 'tools/call',
              params: {
                name: 'annotate_variable',
                arguments: {
                  program_id: selectedProgram.id,
                  function: selectedFunction.name,
                  old_name: oldN,
                  new_name: newN,
                },
              },
            }),
          });
        } catch {
          // Local annotation already applied
        }
      }
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setAnnotatedComments((prev) => ({
      ...prev,
      [selectedFunction.address]: [...(prev[selectedFunction.address] || []), commentInput.trim()],
    }));
    setCommentInput('');
  };

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* 1. Open-Access Sovereign Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: surfaceBg,
          border: `1px solid ${cardBorder}`,
        }}
      >
        <SovereignEyebrow accent={cyan} right="Security & Enclave">
          ghidra-mcp-bridge
        </SovereignEyebrow>
        <SovereignBand
          seed="ghidra-mcp-bridge"
          eyebrow="Security & Enclave"
          caption="GhidraMCP Binary Reverse Engineering Bridge"
          label="GhidraMCP Binary Reverse Engineering Bridge — Zoth visualization"
        />
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                label={`v${GHIDRA_MCP_VERSION} · FREE & OPEN`}
                size="small"
                sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.74rem' }}
              />
              <Typography variant="body2" sx={{ color: cyan, fontWeight: 800, fontFamily: mono }}>
                REVERSE ENGINEERING WORKSTATION
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.75, color: inkPrimary }}>
              GhidraMCP Local Binary Analysis &amp; 8-Tool MCP Bridge
            </Typography>
            <Typography variant="body2" sx={{ color: inkMuted, mt: 0.5 }}>
              In-browser ELF/PE/Mach-O/WASM header, section, hex dump, and Shannon entropy parser paired with the local Python loopback daemon on 127.0.0.1:8131 (inspired by LaurieWired/GhidraMCP).
            </Typography>
          </Grid>

          <Grid xs={12} md={5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems="center">
              <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                <Typography variant="caption" sx={{ color: inkMuted, fontFamily: mono, display: 'block' }}>
                  ZERO EGRESS • LOCAL LOOPBACK
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                  100% OPEN ACCESS
                </Typography>
              </Box>

              <Button
                variant="contained"
                component="a"
                href="https://github.com/1nc0gn30/ghidra-mcp-bridge"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  minHeight: 44,
                  bgcolor: gold,
                  color: goldBtnInk,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  '&:hover': { bgcolor: gold, filter: 'brightness(1.08)' },
                }}
              >
                GITHUB SOURCE
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Workstation HUD & Loopback Bridge Probe */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: surfaceBg,
          border: `1px solid ${cardBorder}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: cyanBg, color: cyan, display: 'flex' }}>
                <MemoryIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: inkPrimary }}>
                  GhidraMCP <Box component="span" sx={{ color: cyan }}>Decompiler &amp; Binary Engine</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: inkMuted, fontFamily: mono }}>
                  JSON-RPC 2.0 MCP 2024-11-05 · 8 Registered Tools · Loopback :8131
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '0.95rem !important', color: `${emerald} !important` }} />}
                label="IN-BROWSER PARSER READY"
                size="small"
                sx={{
                  bgcolor: emeraldBg,
                  color: emerald,
                  fontWeight: 800,
                  fontFamily: mono,
                  border: `1px solid ${emerald}`,
                }}
              />
              {bridgeEngines ? (
                <>
                  <Chip
                    label={`GHIDRA: ${bridgeEngines.ghidra_headless || 'UNAVAILABLE'}`}
                    size="small"
                    sx={{ bgcolor: cyanBg, color: cyan, fontWeight: 700, fontFamily: mono }}
                  />
                  <Chip
                    label={`RADARE2: ${bridgeEngines.radare2 || 'UNAVAILABLE'}`}
                    size="small"
                    sx={{ bgcolor: goldBg, color: gold, fontWeight: 700, fontFamily: mono }}
                  />
                </>
              ) : (
                <Chip
                  label="DAEMON TELEMETRY: PROBE :8131 TO INSPECT"
                  size="small"
                  sx={{ bgcolor: goldBg, color: gold, fontWeight: 700, fontFamily: mono }}
                />
              )}
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                bgcolor: subSurfaceBg,
                borderRadius: 2,
                border: `1px solid ${subtleBorder}`,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  id="ghidra-bridge-host-input"
                  label="Loopback Bridge Endpoint (:8131)"
                  fullWidth
                  size="small"
                  value={ghidraHost}
                  onChange={(e) => setGhidraHost(e.target.value)}
                  InputLabelProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', color: inkMuted } }}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem', color: inkPrimary, minHeight: 44 } }}
                  sx={{ '& .MuiInputBase-input': { minHeight: 44, py: 0, boxSizing: 'border-box' } }}
                />
                <Button
                  variant="outlined"
                  onClick={testGhidraConnection}
                  disabled={isConnecting}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: emerald,
                    borderColor: emerald,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isConnecting ? 'Probing...' : 'Probe :8131'}
                </Button>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: bridgeOnline ? emerald : inkMuted,
                  fontFamily: mono,
                  fontWeight: 700,
                  mt: 1,
                  display: 'block',
                }}
              >
                Status: {bridgeStatus}
              </Typography>
              {bridgeError && (
                <Alert severity="warning" sx={{ mt: 1, py: 0, fontFamily: mono, fontSize: '0.74rem' }}>
                  {bridgeError}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Binary Program Selector & Client-Side Binary File Drop/Upload */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: surfaceBg,
          border: `1px solid ${cardBorder}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel id="ghidra-binary-select-label" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                Inspected Binary Target
              </InputLabel>
              <Select
                labelId="ghidra-binary-select-label"
                id="ghidra-binary-select"
                value={selectedProgram.id}
                label="Inspected Binary Target"
                inputProps={{ 'aria-label': 'Inspected Binary Target' }}
                onChange={(e) => {
                  const prog = SAMPLE_PROGRAMS.find((p) => p.id === e.target.value) || SAMPLE_PROGRAMS[0];
                  setSelectedProgram(prog);
                  setSelectedFunction(prog.functions[0]);
                  setUploadedReport(null);
                }}
                sx={{ fontFamily: mono, fontSize: '0.82rem', minHeight: 44 }}
              >
                {SAMPLE_PROGRAMS.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                    {p.name} ({p.arch} · {p.format})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <input
                ref={fileInputRef}
                id="ghidra-binary-upload-input"
                type="file"
                aria-label="Upload local ELF, PE, Mach-O, or WASM binary for client-side inspection"
                style={{ display: 'none' }}
                onChange={handleBinaryUpload}
              />
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: cyan,
                  borderColor: cyan,
                }}
              >
                Parse Local Binary (ELF/PE/Mach-O/WASM)
              </Button>
              <Chip
                label={`Format: ${uploadedReport ? uploadedReport.format : selectedProgram.format}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.74rem', bgcolor: cyanBg, color: cyan, fontWeight: 700, height: 32 }}
              />
              <Chip
                label={`Entry: ${uploadedReport ? uploadedReport.entryPoint : selectedProgram.entryPoint}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.74rem', bgcolor: goldBg, color: gold, fontWeight: 700, height: 32 }}
              />
            </Stack>
          </Grid>
        </Grid>

        {uploadError && (
          <Alert severity="error" sx={{ mt: 1.5, fontFamily: mono, fontSize: '0.78rem' }}>
            {uploadError}
          </Alert>
        )}
        {uploadedReport && (
          <Alert severity="success" sx={{ mt: 1.5, fontFamily: mono, fontSize: '0.78rem' }}>
            Parsed in browser: <strong>{uploadedReport.name}</strong> ({uploadedReport.format}, {uploadedReport.arch},{' '}
            {uploadedReport.sizeBytes.toLocaleString()} B, H={uploadedReport.overallEntropy.toFixed(4)} [{uploadedReport.overallStatus}],{' '}
            {uploadedReport.sections.length} sections)
          </Alert>
        )}
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${subtleBorder}`,
          '& .MuiTab-root': {
            minHeight: 48,
            fontFamily: mono,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'none',
            color: inkMuted,
            '&.Mui-selected': { color: cyan },
          },
          '& .MuiTabs-indicator': { bgcolor: cyan },
        }}
      >
        <Tab icon={<CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Decompiler Pseudocode & Annotations" />
        <Tab icon={<DataObjectIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Sections, Shannon Entropy & Hex" />
        <Tab icon={<MemoryIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Strings & Imports" />
        <Tab icon={<SettingsEthernetIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="8 MCP Tools & ZothOS CLI (:8131)" />
      </Tabs>

      {/* TAB 0: DECOMPILER PSEUDOCODE & VARIABLE ANNOTATIONS */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: gold, fontFamily: mono }}>
                FUNCTIONS ({selectedProgram.functions.length})
              </Typography>
              <Stack spacing={1}>
                {selectedProgram.functions.map((fn) => {
                  const isSelected = selectedFunction.address === fn.address;
                  return (
                    <Button
                      key={fn.address}
                      onClick={() => setSelectedFunction(fn)}
                      fullWidth
                      sx={{
                        minHeight: 54,
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: isSelected ? cyanBg : subSurfaceBg,
                        border: `1px solid ${isSelected ? cyan : subtleBorder}`,
                        color: isSelected ? cyan : inkPrimary,
                      }}
                    >
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 800, color: isSelected ? cyan : inkPrimary }}>
                          {fn.name}()
                        </Typography>
                        <Typography variant="caption" sx={{ color: inkMuted, fontFamily: mono }}>
                          {fn.address} · {fn.size} B
                        </Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                    {selectedFunction.name}{' '}
                    <Box component="span" sx={{ color: inkMuted, fontSize: '0.84rem' }}>
                      at {selectedFunction.address}
                    </Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: inkMuted, fontFamily: mono }}>
                    Structured C Pseudocode AST · Variable Rename Store Active
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleLiveDecompileFromDaemon}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: emerald, borderColor: emerald }}
                  >
                    Live :8131 Decompile
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCopy(displayedPseudocode, 'decomp')}
                    startIcon={copiedKey === 'decomp' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: cyan, borderColor: cyan }}
                  >
                    {copiedKey === 'decomp' ? 'Copied' : 'Copy C Code'}
                  </Button>
                </Stack>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: codeBg,
                  borderRadius: 2,
                  border: `1px solid ${subtleBorder}`,
                  mb: 2,
                }}
              >
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.8rem', color: codeInk, lineHeight: 1.6, overflowX: 'auto' }}>
                  {displayedPseudocode}
                </pre>
              </Paper>

              {/* Variable Rename + Comment Box (Light-Safe Surface) */}
              <Box sx={{ p: 2, bgcolor: subSurfaceBg, borderRadius: 2, border: `1px solid ${subtleBorder}` }}>
                <Typography variant="caption" sx={{ color: gold, fontWeight: 800, fontFamily: mono, display: 'block', mb: 1.2 }}>
                  VARIABLE RENAME &amp; ANALYST ANNOTATIONS
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    id="ghidra-old-var-input"
                    label="Original Variable"
                    size="small"
                    value={oldVarInput}
                    onChange={(e) => setOldVarInput(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem', minHeight: 44 } }}
                    sx={{ '& .MuiInputBase-input': { minHeight: 44, py: 0, boxSizing: 'border-box' } }}
                  />
                  <TextField
                    id="ghidra-new-var-input"
                    label="Renamed Variable"
                    size="small"
                    value={newVarInput}
                    onChange={(e) => setNewVarInput(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem', minHeight: 44 } }}
                    sx={{ '& .MuiInputBase-input': { minHeight: 44, py: 0, boxSizing: 'border-box' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleRenameVariable}
                    sx={{ minHeight: 44, bgcolor: gold, color: goldBtnInk, fontWeight: 800, fontFamily: mono, whiteSpace: 'nowrap' }}
                  >
                    Rename Var
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
                  <TextField
                    id="ghidra-comment-input"
                    label="Function Note / Audit Comment"
                    fullWidth
                    size="small"
                    placeholder="Record control-flow or KDF observation..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem', minHeight: 44 } }}
                    sx={{ '& .MuiInputBase-input': { minHeight: 44, py: 0, boxSizing: 'border-box' } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddComment}
                    sx={{ minHeight: 44, color: cyan, borderColor: cyan, fontWeight: 800, fontFamily: mono, whiteSpace: 'nowrap' }}
                  >
                    Add Note
                  </Button>
                </Stack>

                {annotatedComments[selectedFunction.address] && (
                  <Stack spacing={0.8}>
                    {annotatedComments[selectedFunction.address].map((c, i) => (
                      <Box key={i} sx={{ p: 1, bgcolor: surfaceBg, borderRadius: 1, border: `1px solid ${subtleBorder}` }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: inkPrimary }}>
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

      {/* TAB 1: SECTIONS, SHANNON ENTROPY & HEX DUMP */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                  Section Table &amp; Per-Section Shannon Entropy ({uploadedReport ? uploadedReport.name : selectedProgram.name})
                </Typography>
                <Chip
                  label={`Overall H = ${(uploadedReport ? uploadedReport.overallEntropy : selectedProgram.overallEntropy).toFixed(4)} bits/byte`}
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: cyanBg, color: cyan }}
                />
              </Stack>

              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: codeBg, borderRadius: 2, border: `1px solid ${subtleBorder}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['SECTION', 'VADDR', 'OFFSET', 'SIZE (B)', 'FLAGS', 'ENTROPY', 'STATUS'].map((h) => (
                        <TableCell key={h} sx={{ color: gold, fontFamily: mono, fontSize: '0.72rem', fontWeight: 800 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSections.map((s, idx) => (
                      <TableRow key={`${s.name}-${idx}`}>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: cyan, fontWeight: 700 }}>{s.name}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk }}>{s.vaddr}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk }}>{s.offset}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk }}>{s.size}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk }}>{s.flags}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk, fontWeight: 700 }}>
                          {Number(s.entropy).toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.status}
                            size="small"
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: s.packed ? dangerBg : emeraldBg,
                              color: s.packed ? danger : emerald,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: cyan, fontFamily: mono }}>
                16-Byte Hexadecimal + ASCII Header Dump
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: codeBg, borderRadius: 2, border: `1px solid ${subtleBorder}` }}>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: codeInk, lineHeight: 1.6, overflowX: 'auto' }}>
                  {activeHexDump}
                </pre>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: STRINGS & IMPORTS */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: gold, fontFamily: mono }}>
                Extracted ASCII / UTF-8 Strings ({activeStrings.length})
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: codeBg, borderRadius: 2, border: `1px solid ${subtleBorder}`, maxHeight: 360 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: gold, fontFamily: mono, fontSize: '0.72rem', fontWeight: 800 }}>OFFSET</TableCell>
                      <TableCell sx={{ color: gold, fontFamily: mono, fontSize: '0.72rem', fontWeight: 800 }}>STRING VALUE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeStrings.slice(0, 60).map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: cyan }}>{s.offset || s.address}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: codeInk }}>"{s.value}"</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: emerald, fontFamily: mono }}>
                Dynamic Library Imports &amp; Linkages
              </Typography>
              <Stack spacing={1}>
                {selectedProgram.imports.map((imp, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: subSurfaceBg, borderRadius: 1.5, border: `1px solid ${subtleBorder}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', color: cyan, fontWeight: 700 }}>
                      {imp}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 3: 8 MCP TOOLS & ZOTHOS CLI COMMANDS (:8131) */}
      {activeTab === 3 && (
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.75, color: cyan, fontFamily: mono }}>
            ZothOS GhidraMCP v{GHIDRA_MCP_VERSION} — 8 MCP Tools &amp; Local CLI Commands (:8131)
          </Typography>
          <Typography variant="body2" sx={{ color: inkMuted, mb: 2 }}>
            Run the hardened local daemon on 127.0.0.1:8131 or register the stdio JSON-RPC 2.0 MCP transport directly with Claude Code, Cursor, or AGY:
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {[
              {
                title: 'Start Hardened Loopback Daemon (:8131)',
                cmd: 'ghidra-mcp-bridge serve --host 127.0.0.1 --port 8131',
              },
              {
                title: 'Register Stdio MCP Server (JSON-RPC 2.0 · 8 Tools)',
                cmd: 'ghidra-mcp-bridge mcp',
              },
              {
                title: 'Inspect ELF/PE/Mach-O Sections & Shannon Entropy',
                cmd: 'ghidra-mcp-bridge sections /bin/echo',
              },
              {
                title: 'Live Toolchain & Binary Telemetry TUI',
                cmd: 'ghidra-mcp-bridge-tui --status --json',
              },
            ].map((c, i) => (
              <Grid xs={12} md={6} key={i}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: subSurfaceBg, borderRadius: 2, border: `1px solid ${subtleBorder}` }}>
                  <Typography variant="caption" sx={{ color: gold, fontFamily: mono, fontWeight: 800, display: 'block', mb: 0.5 }}>
                    {c.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: cyan, wordBreak: 'break-all' }}>
                      {c.cmd}
                    </Typography>
                    <IconButton
                      aria-label={`Copy ${c.title}`}
                      onClick={() => handleCopy(c.cmd, `ghidra_cmd_${i}`)}
                      sx={{ minWidth: 44, minHeight: 44, color: inkMuted }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: gold, fontFamily: mono }}>
            REGISTERED MCP TOOLS (8)
          </Typography>
          <Grid container spacing={1.5}>
            {GHIDRA_MCP_TOOLS.map((tool) => (
              <Grid xs={12} sm={6} key={tool.name}>
                <Box sx={{ p: 1.5, bgcolor: subSurfaceBg, borderRadius: 1.5, border: `1px solid ${subtleBorder}` }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 800, color: cyan }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: inkMuted, display: 'block', mt: 0.25 }}>
                    {tool.summary}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default GhidraMcpGodModeTool;
