import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Stack,
  Alert,
  Switch,
  FormControlLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import {
  EDGE_FORGE_VERSION,
  WASM_KERNEL_PRESETS,
  EDGE_TARGETS,
  assembleWasmPreset,
  inspectWasmBinary,
  executeWasmModule,
  base64ToBytes,
  synthesizeEdgeTarget,
  simulateEdgeRequest,
  buildOfflineToolchainSnapshot,
  exportEdgeJson,
  exportEdgeMarkdown,
  exportEdgeCsv,
} from '../../utils/edgeForgeEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

async function fetchStudioJson(endpoint, options = {}, timeoutMs = 4500) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      ...options,
      signal: ctl.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, status: res.status, reason: 'Static deployment (non-JSON response)' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, status: res.status, reason: data?.error || `HTTP ${res.status}`, data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Loopback Studio API (:3000) unavailable',
    };
  } finally {
    clearTimeout(timer);
  }
}

function downloadBlob(filename, data, mimeType) {
  const blob = data instanceof Uint8Array
    ? new Blob([data], { type: mimeType })
    : new Blob([String(data)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TABS = [
  { id: 'wasm', label: '1. WASM Binary Forge', icon: MemoryIcon },
  { id: 'edge', label: '2. Edge Worker & Simulator', icon: CloudQueueIcon },
  { id: 'toolchains', label: '3. Host Toolchains & KVM', icon: TerminalIcon },
  { id: 'exports', label: '4. Artifacts & Exports', icon: DescriptionIcon },
];

export default function EdgeForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(
    () =>
      isDark
        ? {
            bg: '#08080B',
            card: '#11141D',
            subtle: '#0B0E15',
            codeBg: '#090B10',
            text: '#F5F1E6',
            muted: '#C5CBD8',
            gold: '#D4AF37',
            goldBg: 'rgba(212, 175, 55, 0.14)',
            onGold: '#08080B',
            emerald: '#34D399',
            emeraldBg: 'rgba(52, 211, 153, 0.14)',
            cyan: '#38BDF8',
            cyanBg: 'rgba(56, 189, 248, 0.14)',
            crimson: '#F87171',
            crimsonBg: 'rgba(248, 113, 113, 0.14)',
            border: 'rgba(245, 241, 230, 0.14)',
            strongBorder: 'rgba(212, 175, 55, 0.42)',
          }
        : {
            bg: '#FAF8F3',
            card: '#FFFFFF',
            subtle: '#F4F1EA',
            codeBg: '#F4F1EA',
            text: '#101828',
            muted: '#344054',
            gold: '#7A5808',
            goldBg: '#FEF6DC',
            onGold: '#FFFFFF',
            emerald: '#047857',
            emeraldBg: '#ECFDF5',
            cyan: '#0369A1',
            cyanBg: '#F0F9FF',
            crimson: '#B42318',
            crimsonBg: '#FEF2F2',
            border: 'rgba(16, 24, 40, 0.14)',
            strongBorder: 'rgba(122, 88, 8, 0.42)',
          },
    [isDark]
  );

  const [activeTab, setActiveTab] = useState('wasm');
  const [copiedKey, setCopiedKey] = useState('');

  // Tab 1: WASM Binary Forge
  const [selectedPresetId, setSelectedPresetId] = useState('add_i32');
  const initialWasm = useMemo(() => assembleWasmPreset('add_i32'), []);
  const [watSource, setWatSource] = useState(initialWasm.wat);
  const [arg0, setArg0] = useState(String(initialWasm.defaultArgs[0]));
  const [arg1, setArg1] = useState(String(initialWasm.defaultArgs[1] ?? 0));
  const [wasmArtifact, setWasmArtifact] = useState(initialWasm);
  const [wasmExecution, setWasmExecution] = useState(null);
  const [compileSource, setCompileSource] = useState('IN_BROWSER_ASSEMBLER');
  const [compileNotice, setCompileNotice] = useState('');
  const [compiling, setCompiling] = useState(false);

  // Tab 2: Edge Worker & Simulator
  const [targetId, setTargetId] = useState('netlify-edge');
  const [serviceName, setServiceName] = useState('zoth-edge-kernel');
  const [routePath, setRoutePath] = useState('/api/edge/telemetry');
  const [memoryMb, setMemoryMb] = useState('128');
  const [zeroEgress, setZeroEgress] = useState(true);
  const [readOnlyRootfs, setReadOnlyRootfs] = useState(true);
  const [simMethod, setSimMethod] = useState('GET');
  const [simPath, setSimPath] = useState('/api/edge/telemetry');
  const [simPayloadBytes, setSimPayloadBytes] = useState('512');
  const [simColdStart, setSimColdStart] = useState(true);

  // Tab 3: Host Toolchains & KVM
  const [hostSnapshot, setHostSnapshot] = useState(() => buildOfflineToolchainSnapshot('Probing loopback Studio API (:3000)...'));
  const [probingHost, setProbingHost] = useState(false);
  const [edgeTelemetry, setEdgeTelemetry] = useState(null);

  // Tab 4: Exports preview
  const [exportPreviewTab, setExportPreviewTab] = useState('json');

  const activePreset = useMemo(
    () => WASM_KERNEL_PRESETS.find((p) => p.id === selectedPresetId) || WASM_KERNEL_PRESETS[0],
    [selectedPresetId]
  );

  const runExecution = useCallback(async (bytes, exportName, argsList) => {
    try {
      const execResult = await executeWasmModule(bytes, exportName, argsList);
      setWasmExecution(execResult);
    } catch (err) {
      setWasmExecution({ ok: false, valid: false, error: err?.message || 'WASM execution failed' });
    }
  }, []);

  // Run initial live WebAssembly.instantiate() on mount
  useEffect(() => {
    runExecution(initialWasm.bytes, initialWasm.exportName, initialWasm.defaultArgs);
  }, [initialWasm, runExecution]);

  // Probe live host toolchains + local /api/edge/telemetry on mount
  const probeHost = useCallback(async () => {
    setProbingHost(true);
    const [tcRes, edgeRes] = await Promise.all([
      fetchStudioJson('/api/studio/edge-forge'),
      fetchStudioJson('/api/edge/telemetry'),
    ]);
    if (tcRes.ok && tcRes.data?.toolchains) {
      setHostSnapshot(tcRes.data);
    } else {
      setHostSnapshot(buildOfflineToolchainSnapshot(tcRes.reason || 'Loopback Studio API (:3000) unavailable'));
    }
    if (edgeRes.ok && edgeRes.data) {
      setEdgeTelemetry({ online: true, data: edgeRes.data });
    } else {
      setEdgeTelemetry({ online: false, reason: edgeRes.reason || 'Local /api/edge/telemetry unavailable' });
    }
    setProbingHost(false);
  }, []);

  useEffect(() => {
    probeHost();
  }, [probeHost]);

  const handleSelectPreset = async (presetId) => {
    setSelectedPresetId(presetId);
    const built = assembleWasmPreset(presetId);
    setWatSource(built.wat);
    setArg0(String(built.defaultArgs[0] ?? 0));
    setArg1(String(built.defaultArgs[1] ?? 0));
    setWasmArtifact(built);
    setCompileSource('IN_BROWSER_ASSEMBLER');
    setCompileNotice('');
    await runExecution(built.bytes, built.exportName, built.defaultArgs);
  };

  const getCurrentArgs = useCallback(() => {
    if (activePreset.paramNames.length === 1) {
      return [Math.trunc(Number(arg0) || 0)];
    }
    return [Math.trunc(Number(arg0) || 0), Math.trunc(Number(arg1) || 0)];
  }, [activePreset.paramNames.length, arg0, arg1]);

  const handleAssembleAndExecute = async () => {
    setCompiling(true);
    setCompileNotice('');
    const args = getCurrentArgs();
    const trimmedWat = watSource.trim();
    const isCustomWat = trimmedWat !== activePreset.wat.trim();

    if (isCustomWat && hostSnapshot.mode === 'LIVE_HOST_TOOLCHAINS' && hostSnapshot.summary?.wat2wasmReady) {
      const res = await fetchStudioJson('/api/studio/edge-forge/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wat: trimmedWat, presetId: selectedPresetId }),
      });
      if (res.ok && res.data?.base64) {
        const bytes = base64ToBytes(res.data.base64);
        const inspection = inspectWasmBinary(bytes);
        const expName = inspection.exports[0]?.name || activePreset.exportName;
        setWasmArtifact({
          presetId: 'custom-wat',
          label: `${expName}() [wat2wasm]`,
          exportName: expName,
          wat: trimmedWat,
          bytes,
          base64: inspection.base64,
          hexPreview: inspection.hexPreview,
          sha256: inspection.sha256,
          byteLength: bytes.length,
          inspection,
        });
        setCompileSource(res.data.compiler || 'LOCAL_WAT2WASM');
        await runExecution(bytes, expName, args);
        setCompiling(false);
        return;
      }
      setCompileNotice(res.reason || 'Local wat2wasm compile returned an error; fell back to in-browser assembler.');
    }

    const built = assembleWasmPreset(selectedPresetId);
    setWasmArtifact(built);
    setCompileSource('IN_BROWSER_ASSEMBLER');
    await runExecution(built.bytes, built.exportName, args);
    setCompiling(false);
  };

  const handleCompileViaServer = async () => {
    setCompiling(true);
    setCompileNotice('');
    const args = getCurrentArgs();
    const res = await fetchStudioJson('/api/studio/edge-forge/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wat: watSource, presetId: selectedPresetId }),
    });
    if (res.ok && res.data?.base64) {
      const bytes = base64ToBytes(res.data.base64);
      const inspection = inspectWasmBinary(bytes);
      const expName = inspection.exports[0]?.name || activePreset.exportName;
      setWasmArtifact({
        presetId: res.data.presetId || selectedPresetId,
        label: `${expName}() [${res.data.compiler || 'wat2wasm'}]`,
        exportName: expName,
        wat: watSource,
        bytes,
        base64: inspection.base64,
        hexPreview: inspection.hexPreview,
        sha256: inspection.sha256,
        byteLength: bytes.length,
        inspection,
      });
      setCompileSource(res.data.compiler || 'LOCAL_WAT2WASM');
      await runExecution(bytes, expName, args);
    } else {
      setCompileNotice(
        `${res.reason || 'Server compile unavailable'}. In-browser WebAssembly 1.0 assembler remains active.`
      );
    }
    setCompiling(false);
  };

  // Synthesize active edge/container/KVM target deterministically
  const targetSynthesis = useMemo(
    () =>
      synthesizeEdgeTarget(targetId, {
        serviceName,
        routePath,
        memoryMb: Number(memoryMb) || 128,
        zeroEgress,
        readOnlyRootfs,
        wasmPresetId: selectedPresetId,
      }),
    [targetId, serviceName, routePath, memoryMb, zeroEgress, readOnlyRootfs, selectedPresetId]
  );

  // Deterministic request dry-run
  const requestSimulation = useMemo(
    () =>
      simulateEdgeRequest(targetId, {
        method: simMethod,
        configuredRoute: routePath,
        requestPath: simPath,
        coldStart: simColdStart,
        zeroEgress,
        payloadBytes: Number(simPayloadBytes) || 512,
      }),
    [targetId, simMethod, routePath, simPath, simColdStart, zeroEgress, simPayloadBytes]
  );

  const exportArtifacts = useMemo(() => {
    const state = {
      wasm: wasmArtifact,
      execution: wasmExecution,
      targetSynthesis,
      simulation: requestSimulation,
      hostSnapshot,
    };
    return {
      json: exportEdgeJson(state),
      markdown: exportEdgeMarkdown(state),
      csv: exportEdgeCsv({ targets: EDGE_TARGETS, hostSnapshot }),
    };
  }, [wasmArtifact, wasmExecution, targetSynthesis, requestSimulation, hostSnapshot]);

  const handleCopy = (key, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const buttonBaseSx = {
    minHeight: 44,
    fontFamily: MONO,
    fontSize: '0.76rem',
    fontWeight: 700,
    textTransform: 'none',
    transition: 'none',
  };

  return (
    <Box
      data-testid="edge-forge-workstation"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.text,
      }}
    >
      {/* Workstation Header Strip */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 0.5,
            }}
          >
            ZOTH EDGE FORGE &amp; MICRO-KERNEL SANDBOX · v{EDGE_FORGE_VERSION}
          </Typography>
          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              fontWeight: 700,
              color: tk.text,
              lineHeight: 1.25,
            }}
          >
            WebAssembly 1.0 Binary Assembler, Multi-Target Edge Forge &amp; Host Toolchain Probe
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            icon={<SecurityIcon sx={{ fontSize: '0.9rem !important', color: `${tk.emerald} !important` }} />}
            label={hostSnapshot.mode === 'LIVE_HOST_TOOLCHAINS' ? 'LIVE :3000 TOOLCHAINS' : 'BROWSER OFFLINE FALLBACK'}
            sx={{
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: '0.7rem',
              bgcolor: hostSnapshot.mode === 'LIVE_HOST_TOOLCHAINS' ? tk.emeraldBg : tk.goldBg,
              color: hostSnapshot.mode === 'LIVE_HOST_TOOLCHAINS' ? tk.emerald : tk.gold,
              border: `1px solid ${tk.border}`,
            }}
          />
          <Chip
            size="small"
            label={`KVM: ${hostSnapshot.kvm ? '/dev/kvm READY' : 'BROWSER ONLY'}`}
            sx={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: tk.subtle,
              color: tk.text,
              border: `1px solid ${tk.border}`,
            }}
          />
        </Stack>
      </Stack>

      {/* Wrapping Accessible Tab Bar (Zero Mobile Overflow, >= 44px Height) */}
      <Box
        role="tablist"
        aria-label="Edge Forge workstation sections"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 3,
          pb: 1.5,
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              data-testid={`edge-forge-tab-${tab.id}`}
              variant={selected ? 'contained' : 'outlined'}
              startIcon={<IconComp sx={{ fontSize: 16 }} />}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                ...buttonBaseSx,
                px: 1.75,
                bgcolor: selected ? tk.gold : tk.card,
                color: selected ? tk.onGold : tk.text,
                borderColor: selected ? tk.gold : tk.border,
                '&:hover': {
                  bgcolor: selected ? tk.gold : tk.subtle,
                  borderColor: tk.gold,
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* ====================================================================
          TAB 1: WASM BINARY FORGE
          ==================================================================== */}
      {activeTab === 'wasm' && (
        <Box data-testid="edge-forge-panel-wasm">
          <Grid container spacing={2.5}>
            <Grid xs={12} lg={6}>
              <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text, mb: 0.75 }}>
                  1. Kernel Preset &amp; WebAssembly Text (WAT) Source
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', color: tk.muted, mb: 2 }}>
                  Assembles genuine spec-compliant WebAssembly 1.0 binaries (<code>00 61 73 6d</code>) client-side or compiles custom WAT via local <code>wat2wasm</code> on <code>:3000</code>, then runs real <code>WebAssembly.instantiate()</code>.
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {WASM_KERNEL_PRESETS.map((preset) => {
                    const active = selectedPresetId === preset.id;
                    return (
                      <Button
                        key={preset.id}
                        data-testid={`wasm-preset-${preset.id}`}
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => handleSelectPreset(preset.id)}
                        sx={{
                          ...buttonBaseSx,
                          px: 1.4,
                          bgcolor: active ? tk.gold : tk.subtle,
                          color: active ? tk.onGold : tk.text,
                          borderColor: active ? tk.gold : tk.border,
                          '&:hover': { bgcolor: active ? tk.gold : tk.card, borderColor: tk.gold },
                        }}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  rows={9}
                  label="WebAssembly Text Format (.wat)"
                  value={watSource}
                  onChange={(e) => setWatSource(e.target.value)}
                  inputProps={{ 'aria-label': 'WebAssembly Text Format source editor' }}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      bgcolor: tk.codeBg,
                      color: tk.text,
                      fontFamily: MONO,
                      fontSize: '0.78rem',
                    },
                    '& .MuiInputLabel-root': { color: tk.muted, fontFamily: MONO, fontSize: '0.8rem' },
                  }}
                />

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={`Argument 0 (${activePreset.paramNames[0] || 'a'})`}
                      value={arg0}
                      onChange={(e) => setArg0(e.target.value)}
                      inputProps={{ 'aria-label': `WASM parameter ${activePreset.paramNames[0] || 'a'}` }}
                      sx={{
                        '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                        '& .MuiInputLabel-root': { color: tk.muted },
                      }}
                    />
                  </Grid>
                  {activePreset.paramNames.length > 1 && (
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={`Argument 1 (${activePreset.paramNames[1] || 'b'})`}
                        value={arg1}
                        onChange={(e) => setArg1(e.target.value)}
                        inputProps={{ 'aria-label': `WASM parameter ${activePreset.paramNames[1] || 'b'}` }}
                        sx={{
                          '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                          '& .MuiInputLabel-root': { color: tk.muted },
                        }}
                      />
                    </Grid>
                  )}
                </Grid>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    data-testid="wasm-assemble-execute-btn"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={compiling}
                    onClick={handleAssembleAndExecute}
                    sx={{
                      ...buttonBaseSx,
                      px: 2,
                      bgcolor: tk.gold,
                      color: tk.onGold,
                      '&:hover': { bgcolor: tk.gold },
                    }}
                  >
                    {compiling ? 'Compiling...' : 'Assemble & Execute Live WASM'}
                  </Button>
                  <Button
                    data-testid="wasm-compile-server-btn"
                    variant="outlined"
                    disabled={compiling}
                    onClick={handleCompileViaServer}
                    sx={{
                      ...buttonBaseSx,
                      px: 1.6,
                      color: tk.cyan,
                      borderColor: tk.border,
                      '&:hover': { borderColor: tk.cyan, bgcolor: tk.cyanBg },
                    }}
                  >
                    Compile WAT (:3000 wat2wasm)
                  </Button>
                  <Button
                    data-testid="wasm-download-btn"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadBlob(`${wasmArtifact.exportName || 'kernel'}.wasm`, wasmArtifact.bytes, 'application/wasm')}
                    sx={{
                      ...buttonBaseSx,
                      px: 1.6,
                      color: tk.emerald,
                      borderColor: tk.border,
                      '&:hover': { borderColor: tk.emerald, bgcolor: tk.emeraldBg },
                    }}
                  >
                    Download .wasm ({wasmArtifact.byteLength} B)
                  </Button>
                </Stack>

                {compileNotice && (
                  <Alert severity="info" sx={{ mt: 2, fontFamily: MONO, fontSize: '0.76rem', bgcolor: tk.subtle, color: tk.text }}>
                    {compileNotice}
                  </Alert>
                )}
              </Box>
            </Grid>

            <Grid xs={12} lg={6}>
              <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text, mb: 1.25 }}>
                  2. Live WebAssembly.instantiate() Execution &amp; Binary Inspector
                </Typography>

                {/* Live Execution Readout */}
                <Box
                  data-testid="wasm-execution-readout"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 1.5,
                    bgcolor: tk.subtle,
                    border: `1px solid ${tk.strongBorder}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                      LIVE EXECUTION RESULT ({compileSource})
                    </Typography>
                    <Chip
                      size="small"
                      label={wasmExecution?.ok ? 'WebAssembly.validate() PASS' : 'EXECUTION ERROR'}
                      sx={{
                        fontFamily: MONO,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: wasmExecution?.ok ? tk.emeraldBg : tk.crimsonBg,
                        color: wasmExecution?.ok ? tk.emerald : tk.crimson,
                      }}
                    />
                  </Stack>

                  {wasmExecution?.ok ? (
                    <Box>
                      <Typography sx={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 800, color: tk.text, mb: 0.75 }}>
                        {wasmExecution.exportName}({(wasmExecution.args || []).join(', ')}) ={' '}
                        <Box component="span" sx={{ color: tk.emerald }}>{String(wasmExecution.result)}</Box>
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.muted }}>
                          Instantiate: <strong>{wasmExecution.instantiateUs} us</strong>
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.muted }}>
                          Exec: <strong>{wasmExecution.execUs} us</strong>
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.muted }}>
                          Size: <strong>{wasmArtifact.byteLength} bytes</strong>
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.muted }}>
                          Magic: <strong>{wasmArtifact.inspection?.magicHex} (v{wasmArtifact.inspection?.version})</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', color: tk.crimson }}>
                      {wasmExecution?.error || 'Initializing WebAssembly runtime...'}
                    </Typography>
                  )}
                </Box>

                {/* SHA-256 Artifact Hash */}
                <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, bgcolor: tk.codeBg, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.muted, mb: 0.35 }}>
                    FIPS 180-4 SHA-256 ARTIFACT DIGEST
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text, wordBreak: 'break-all' }}>
                    {wasmArtifact.sha256}
                  </Typography>
                </Box>

                {/* Parsed Section Table */}
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.gold, mb: 0.75 }}>
                  PARSED WASM SECTION TABLE ({wasmArtifact.inspection?.sections?.length || 0} SECTIONS)
                </Typography>
                <Box sx={{ overflowX: 'auto', mb: 2, borderRadius: 1.5, border: `1px solid ${tk.border}` }}>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontFamily: MONO,
                      fontSize: '0.75rem',
                      bgcolor: tk.subtle,
                      '& th, & td': {
                        px: 1.25,
                        py: 0.85,
                        textAlign: 'left',
                        borderBottom: `1px solid ${tk.border}`,
                        color: tk.text,
                      },
                      '& th': { color: tk.muted, fontWeight: 800, fontSize: '0.7rem' },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Section</th>
                        <th>Offset</th>
                        <th>Payload</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(wasmArtifact.inspection?.sections || []).map((sec) => (
                        <tr key={`${sec.id}-${sec.offset}`}>
                          <td>{sec.id}</td>
                          <td><strong>{sec.name}</strong></td>
                          <td>0x{sec.offset.toString(16).padStart(2, '0')}</td>
                          <td>{sec.payloadSize} B</td>
                          <td>{sec.totalBytes} B</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>

                {/* Binary Hex Dump Preview */}
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.muted, mb: 0.5 }}>
                  COMPILED .WASM BINARY HEX PREVIEW
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: tk.codeBg,
                    color: tk.text,
                    border: `1px solid ${tk.border}`,
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    lineHeight: 1.5,
                    overflowX: 'auto',
                  }}
                >
                  {wasmArtifact.hexPreview}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ====================================================================
          TAB 2: EDGE WORKER, CONTAINER & KVM FORGE + REQUEST SIMULATOR
          ==================================================================== */}
      {activeTab === 'edge' && (
        <Box data-testid="edge-forge-panel-edge">
          <Box sx={{ mb: 2.5 }}>
            <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text, mb: 1 }}>
              1. Select Edge Runtime, Container, or Micro-Kernel Target
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {EDGE_TARGETS.map((t) => {
                const active = targetId === t.id;
                return (
                  <Button
                    key={t.id}
                    data-testid={`edge-target-${t.id}`}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setTargetId(t.id)}
                    sx={{
                      ...buttonBaseSx,
                      px: 1.5,
                      bgcolor: active ? tk.gold : tk.card,
                      color: active ? tk.onGold : tk.text,
                      borderColor: active ? tk.gold : tk.border,
                      '&:hover': { bgcolor: active ? tk.gold : tk.subtle, borderColor: tk.gold },
                    }}
                  >
                    {t.name}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Config Bar */}
          <Box sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Service Slug"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  inputProps={{ 'aria-label': 'Service slug name' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Edge Route Path"
                  value={routePath}
                  onChange={(e) => setRoutePath(e.target.value)}
                  inputProps={{ 'aria-label': 'Edge route path' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Memory Ceiling (MiB)"
                  value={memoryMb}
                  onChange={(e) => setMemoryMb(e.target.value)}
                  inputProps={{ 'aria-label': 'Memory ceiling in MiB' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={zeroEgress}
                        onChange={(e) => setZeroEgress(e.target.checked)}
                        inputProps={{ 'aria-label': 'Enforce zero-egress isolation' }}
                      />
                    }
                    label={<Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.text }}>Zero-Egress Network Lock</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={readOnlyRootfs}
                        onChange={(e) => setReadOnlyRootfs(e.target.checked)}
                        inputProps={{ 'aria-label': 'Enforce read-only root filesystem' }}
                      />
                    }
                    label={<Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.text }}>Read-Only RootFS</Typography>}
                  />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.muted }}>
                    Isolation: <strong>{targetSynthesis.isolation}</strong> · Est. {targetSynthesis.estimatedFootprintKb} KB · Cold {targetSynthesis.estimatedColdStartMs} ms
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Generated Artifacts */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid xs={12} lg={7}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold }}>
                      {targetSynthesis.artifacts.source.filename}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                      {targetSynthesis.artifacts.source.byteLength} B · SHA-256: {targetSynthesis.artifacts.source.sha256.slice(0, 16)}...
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={copiedKey === 'src' ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={() => handleCopy('src', targetSynthesis.artifacts.source.content)}
                      sx={{ ...buttonBaseSx, color: tk.text, borderColor: tk.border }}
                    >
                      {copiedKey === 'src' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        downloadBlob(
                          targetSynthesis.artifacts.source.filename.split('/').pop(),
                          targetSynthesis.artifacts.source.content,
                          'text/plain;charset=utf-8'
                        )
                      }
                      sx={{ ...buttonBaseSx, color: tk.emerald, borderColor: tk.border }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.75,
                    borderRadius: 1.5,
                    bgcolor: tk.codeBg,
                    color: tk.text,
                    border: `1px solid ${tk.border}`,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    lineHeight: 1.5,
                    maxHeight: 340,
                    overflow: 'auto',
                  }}
                >
                  {targetSynthesis.artifacts.source.content}
                </Box>
              </Box>
            </Grid>

            <Grid xs={12} lg={5}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.cyan }}>
                      {targetSynthesis.artifacts.config.filename}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                      {targetSynthesis.artifacts.config.byteLength} B · SHA-256: {targetSynthesis.artifacts.config.sha256.slice(0, 16)}...
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={copiedKey === 'cfg' ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={() => handleCopy('cfg', targetSynthesis.artifacts.config.content)}
                      sx={{ ...buttonBaseSx, color: tk.text, borderColor: tk.border }}
                    >
                      {copiedKey === 'cfg' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        downloadBlob(
                          targetSynthesis.artifacts.config.filename.split('/').pop(),
                          targetSynthesis.artifacts.config.content,
                          'text/plain;charset=utf-8'
                        )
                      }
                      sx={{ ...buttonBaseSx, color: tk.emerald, borderColor: tk.border }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.75,
                    borderRadius: 1.5,
                    bgcolor: tk.codeBg,
                    color: tk.text,
                    border: `1px solid ${tk.border}`,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    lineHeight: 1.5,
                    maxHeight: 340,
                    overflow: 'auto',
                  }}
                >
                  {targetSynthesis.artifacts.config.content}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Deterministic Request Dry-Run Simulator */}
          <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text, mb: 1.5 }}>
              2. Deterministic Edge Request &amp; Cold-Start Budget Simulator
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid xs={12} sm={3}>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {['GET', 'HEAD', 'POST', 'DELETE'].map((m) => (
                    <Button
                      key={m}
                      variant={simMethod === m ? 'contained' : 'outlined'}
                      onClick={() => setSimMethod(m)}
                      sx={{
                        ...buttonBaseSx,
                        minWidth: 56,
                        px: 1.2,
                        bgcolor: simMethod === m ? tk.gold : tk.subtle,
                        color: simMethod === m ? tk.onGold : tk.text,
                        borderColor: simMethod === m ? tk.gold : tk.border,
                      }}
                    >
                      {m}
                    </Button>
                  ))}
                </Stack>
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Simulated Request Path"
                  value={simPath}
                  onChange={(e) => setSimPath(e.target.value)}
                  inputProps={{ 'aria-label': 'Simulated request path' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />
              </Grid>
              <Grid xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Payload Bytes"
                  value={simPayloadBytes}
                  onChange={(e) => setSimPayloadBytes(e.target.value)}
                  inputProps={{ 'aria-label': 'Simulated payload size in bytes' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.subtle, color: tk.text, fontFamily: MONO },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />
              </Grid>
              <Grid xs={12} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={simColdStart}
                      onChange={(e) => setSimColdStart(e.target.checked)}
                      inputProps={{ 'aria-label': 'Include cold start latency' }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>Cold Start</Typography>}
                />
              </Grid>
            </Grid>

            <Box sx={{ p: 1.75, borderRadius: 1.5, bgcolor: tk.subtle, border: `1px solid ${tk.border}` }}>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  label={`HTTP ${requestSimulation.status} · ${requestSimulation.verdict}`}
                  sx={{
                    fontFamily: MONO,
                    fontWeight: 800,
                    bgcolor: requestSimulation.status === 200 ? tk.emeraldBg : tk.crimsonBg,
                    color: requestSimulation.status === 200 ? tk.emerald : tk.crimson,
                  }}
                />
                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>
                  Route Match: <strong>{requestSimulation.routeMatch}</strong>
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>
                  Total Budget: <strong>{requestSimulation.timing.totalLatencyMs} ms</strong> (cold {requestSimulation.timing.coldStartMs} ms + warm {requestSimulation.timing.warmExecMs} ms)
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>
                  Artifact: <strong>{requestSimulation.footprint.artifactKb} KB</strong>
                </Typography>
              </Stack>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, wordBreak: 'break-all' }}>
                Deterministic SHA-256 Receipt: {requestSimulation.receiptSha256}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ====================================================================
          TAB 3: LIVE HOST TOOLCHAINS & KVM PROBE
          ==================================================================== */}
      {activeTab === 'toolchains' && (
        <Box data-testid="edge-forge-panel-toolchains">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text }}>
                Local Host Compilers, Container Engines &amp; Hardware KVM Probe
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: tk.muted }}>
                Queried from <code>GET /api/studio/edge-forge</code> (loopback <code>Host</code> allowlisted, <code>~</code> home-path redacted).
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              disabled={probingHost}
              onClick={probeHost}
              sx={{ ...buttonBaseSx, px: 2, bgcolor: tk.gold, color: tk.onGold, '&:hover': { bgcolor: tk.gold } }}
            >
              {probingHost ? 'Probing...' : 'Re-Probe Host Toolchains'}
            </Button>
          </Stack>

          {hostSnapshot.mode !== 'LIVE_HOST_TOOLCHAINS' && (
            <Alert severity="info" sx={{ mb: 2, bgcolor: tk.subtle, color: tk.text, border: `1px solid ${tk.border}` }}>
              <strong>BROWSER_OFFLINE_FALLBACK:</strong> {hostSnapshot.reason || 'Start local Zoth Studio on 127.0.0.1:3000 to inspect installed host binaries.'} All in-browser WASM assembly and target synthesizers remain 100% functional.
            </Alert>
          )}

          {/* KPI Strip */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {[
              { label: 'TOOLCHAINS INSTALLED', value: `${hostSnapshot.summary?.installed ?? 0} / ${hostSnapshot.summary?.total ?? 10}`, tone: tk.emerald },
              { label: 'WAT2WASM COMPILER', value: hostSnapshot.summary?.wat2wasmReady ? 'READY' : 'BROWSER FALLBACK', tone: tk.cyan },
              { label: 'HARDWARE /dev/kvm', value: hostSnapshot.kvm ? 'AVAILABLE' : 'UNAVAILABLE', tone: tk.gold },
              { label: 'QEMU MICRO-VM', value: hostSnapshot.summary?.kvmReady ? 'KVM + QEMU READY' : 'MANIFEST ONLY', tone: tk.text },
            ].map((kpi) => (
              <Grid xs={12} sm={6} md={3} key={kpi.label}>
                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: tk.muted, mb: 0.4 }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.95rem', fontWeight: 800, color: kpi.tone }}>
                    {kpi.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Toolchains Table */}
          <Box sx={{ overflowX: 'auto', mb: 2.5, borderRadius: 2, border: `1px solid ${tk.border}`, bgcolor: tk.card }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: MONO,
                fontSize: '0.76rem',
                '& th, & td': {
                  px: 1.5,
                  py: 1.1,
                  textAlign: 'left',
                  borderBottom: `1px solid ${tk.border}`,
                  color: tk.text,
                },
                '& th': { color: tk.muted, fontWeight: 800, fontSize: '0.7rem', bgcolor: tk.subtle },
              }}
            >
              <thead>
                <tr>
                  <th>Toolchain</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Resolved Path</th>
                  <th>Detected Version</th>
                </tr>
              </thead>
              <tbody>
                {(hostSnapshot.toolchains || []).map((tc) => (
                  <tr key={tc.id}>
                    <td><strong>{tc.label}</strong></td>
                    <td>{tc.category}</td>
                    <td>
                      <Chip
                        size="small"
                        label={tc.installed ? 'INSTALLED' : 'ABSENT'}
                        sx={{
                          fontFamily: MONO,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: tc.installed ? tk.emeraldBg : tk.subtle,
                          color: tc.installed ? tk.emerald : tk.muted,
                        }}
                      />
                    </td>
                    <td>{tc.path || '—'}</td>
                    <td>{tc.version || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>

          {/* Local Edge Telemetry Readout */}
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: tk.gold, mb: 0.75 }}>
              LOCAL LOOPBACK EDGE TELEMETRY (GET /api/edge/telemetry)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: tk.codeBg,
                color: tk.text,
                border: `1px solid ${tk.border}`,
                fontFamily: MONO,
                fontSize: '0.74rem',
                overflowX: 'auto',
              }}
            >
              {edgeTelemetry?.online
                ? JSON.stringify(edgeTelemetry.data, null, 2)
                : JSON.stringify({ status: 'OFFLINE_FALLBACK', reason: edgeTelemetry?.reason || 'Static mode' }, null, 2)}
            </Box>
          </Box>
        </Box>
      )}

      {/* ====================================================================
          TAB 4: SANITIZED ARTIFACTS & EXPORTS
          ==================================================================== */}
      {activeTab === 'exports' && (
        <Box data-testid="edge-forge-panel-exports">
          <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.text, mb: 0.75 }}>
            Sanitized Build Manifest, Markdown Dossier &amp; Formula-Safe CSV Exports
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: tk.muted, mb: 2 }}>
            Every export redacts local user home directories to <code>~/</code> and prefixes spreadsheet formula characters (<code>= + - @</code>) to prevent CSV injection.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {[
              { id: 'json', label: 'JSON Build Manifest', ext: 'json', mime: 'application/json' },
              { id: 'markdown', label: 'Markdown Dossier', ext: 'md', mime: 'text/markdown' },
              { id: 'csv', label: 'CSV Target Matrix', ext: 'csv', mime: 'text/csv' },
            ].map((item) => (
              <Button
                key={item.id}
                variant={exportPreviewTab === item.id ? 'contained' : 'outlined'}
                onClick={() => setExportPreviewTab(item.id)}
                sx={{
                  ...buttonBaseSx,
                  px: 1.6,
                  bgcolor: exportPreviewTab === item.id ? tk.gold : tk.card,
                  color: exportPreviewTab === item.id ? tk.onGold : tk.text,
                  borderColor: exportPreviewTab === item.id ? tk.gold : tk.border,
                }}
              >
                {item.label}
              </Button>
            ))}

            <Button
              variant="outlined"
              startIcon={copiedKey === exportPreviewTab ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={() => handleCopy(exportPreviewTab, exportArtifacts[exportPreviewTab])}
              sx={{ ...buttonBaseSx, px: 1.6, color: tk.text, borderColor: tk.border }}
            >
              {copiedKey === exportPreviewTab ? 'Copied!' : 'Copy Active Export'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const map = {
                  json: ['edge-forge-manifest.json', 'application/json;charset=utf-8'],
                  markdown: ['edge-forge-dossier.md', 'text/markdown;charset=utf-8'],
                  csv: ['edge-forge-matrix.csv', 'text/csv;charset=utf-8'],
                };
                const [fname, mime] = map[exportPreviewTab];
                downloadBlob(fname, exportArtifacts[exportPreviewTab], mime);
              }}
              sx={{ ...buttonBaseSx, px: 1.6, color: tk.emerald, borderColor: tk.border }}
            >
              Download .{exportPreviewTab === 'markdown' ? 'md' : exportPreviewTab}
            </Button>
          </Stack>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 2,
              bgcolor: tk.codeBg,
              color: tk.text,
              border: `1px solid ${tk.border}`,
              fontFamily: MONO,
              fontSize: '0.75rem',
              lineHeight: 1.5,
              maxHeight: 420,
              overflow: 'auto',
            }}
          >
            {exportArtifacts[exportPreviewTab]}
          </Box>
        </Box>
      )}
    </Box>
  );
}
