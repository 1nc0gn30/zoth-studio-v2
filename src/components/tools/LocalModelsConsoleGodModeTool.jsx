import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CalculateIcon from '@mui/icons-material/Calculate';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import {
  GPU_PRESETS,
  KV_PRECISION_PROFILES,
  MODEL_ARCH_PRESETS,
  MODELS_CONSOLE_SCHEMA_VERSION,
  QUANTIZATION_PROFILES,
  buildOfflineModelsSnapshot,
  estimateGgufVramFit,
  formatModelsConsoleExports,
  synthesizeModelCommands,
} from '../../utils/modelsConsoleEngine';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Zoth Local Models Console (v2.4.0)
 * Pure-MUI Dual-Theme Workstation (Editorial Ivory Light + Obsidian Gold Dark).
 *
 * Unifies strictly read-only live Ollama (:11434 /api/tags + /api/ps),
 * AGY-Hermes Proxy (:18000 /v1/models), optional LM Studio/vLLM/llama.cpp probes,
 * read-only host GPU telemetry (Quadro P1000 / custom VRAM), deterministic GGUF
 * weight + KV-cache VRAM fit calculator, safe copy-only CLI/Modelfile/curl
 * synthesizer, and formula-safe JSON/Markdown/CSV exports with honest
 * BROWSER_OFFLINE_FALLBACK.
 */
export default function LocalModelsConsoleGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B0D12',
        card: '#12151E',
        inset: '#171B26',
        ink: '#F5F2EA',
        muted: '#B4BAC6',
        border: 'rgba(212, 175, 55, 0.28)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldBg: '#2A220B',
        goldBorder: '#9A781A',
        goldBtnBg: '#D4AF37',
        goldBtnInk: '#0B0D12',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        amber: '#FBBF24',
        amberBg: '#2B1F09',
        amberBorder: '#8A6312',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        red: '#FCA5A5',
        redBg: '#301417',
        redBorder: '#8F2B34',
        codeBg: '#0E1118',
      };
    }
    return {
      bg: '#FAF8F3',
      card: '#FFFFFF',
      inset: '#F4EFE4',
      ink: '#101828',
      muted: '#475467',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#7A5600',
      goldBg: '#F6EED6',
      goldBorder: '#C7A95A',
      goldBtnBg: '#7A5600',
      goldBtnInk: '#FFFFFF',
      emerald: '#0B5E38',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      amber: '#7C4A03',
      amberBg: '#FDF2DC',
      amberBorder: '#DFB66A',
      sky: '#0E4F7A',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      red: '#991B1B',
      redBg: '#FEF2F2',
      redBorder: '#F3B4B4',
      codeBg: '#F4EFE4',
    };
  }, [isDark]);

  const [activeTab, setActiveTab] = useState(0);
  const [snapshot, setSnapshot] = useState(() => buildOfflineModelsSnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Tab 1: Catalog filters & selected model
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [fitFilter, setFitFilter] = useState('ALL');
  const [selectedModelId, setSelectedModelId] = useState('ollama:qwen2.5:0.5b');

  // Tab 3: GGUF + KV-Cache VRAM Fit Calculator state
  const [archPresetId, setArchPresetId] = useState('qwen2.5:1.5b');
  const [paramsB, setParamsB] = useState('1.54');
  const [quantization, setQuantization] = useState('Q4_K_M');
  const [contextLen, setContextLen] = useState('8192');
  const [kvPrecision, setKvPrecision] = useState('FP16');
  const [gpuPresetId, setGpuPresetId] = useState('quadro-p1000-4g');
  const [customVramGiB, setCustomVramGiB] = useState('4');
  const [layersInput, setLayersInput] = useState('28');
  const [kvHeadsInput, setKvHeadsInput] = useState('2');
  const [headDimInput, setHeadDimInput] = useState('128');

  // Tab 4: Modelfile / CLI customizer
  const [temperatureInput, setTemperatureInput] = useState('0.2');
  const [systemPromptInput, setSystemPromptInput] = useState(
    'You are a concise, deterministic local engineering assistant. Report concrete facts and verified paths only.',
  );

  const fetchLiveModels = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh ? '/api/studio/models?refresh=1' : '/api/studio/models';
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && data.ok && Array.isArray(data.models)) {
        setSnapshot(data);
        if (data.models.length > 0) {
          setSelectedModelId((prev) =>
            data.models.some((m) => m.id === prev) ? prev : data.models[0].id,
          );
        }
      }
    } catch {
      setSnapshot((prev) => (prev.mode === 'LIVE_LOOPBACK' ? prev : buildOfflineModelsSnapshot()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveModels(false);
  }, [fetchLiveModels]);

  const selectedModel = useMemo(() => {
    const list = snapshot.models || [];
    return list.find((m) => m.id === selectedModelId) || list[0] || {
      id: 'ollama:qwen2.5:0.5b',
      name: 'qwen2.5:0.5b',
      providerId: 'ollama',
      providerPort: 11434,
      contextLength: 4096,
    };
  }, [snapshot.models, selectedModelId]);

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (snapshot.models || []).filter((m) => {
      if (providerFilter !== 'ALL' && m.providerId !== providerFilter) return false;
      if (fitFilter === 'FITS_VRAM' && m.hostGpuVerdict !== 'FITS_VRAM') return false;
      if (fitFilter === 'LOADED' && !m.loadedInVram) return false;
      if (!q) return true;
      return (
        String(m.name || '').toLowerCase().includes(q) ||
        String(m.displayName || '').toLowerCase().includes(q) ||
        String(m.family || '').toLowerCase().includes(q) ||
        String(m.quantization || '').toLowerCase().includes(q) ||
        String(m.ownedBy || '').toLowerCase().includes(q)
      );
    });
  }, [snapshot.models, providerFilter, fitFilter, searchQuery]);

  const effectiveGpuVramGiB = useMemo(() => {
    if (gpuPresetId === 'custom') return Number(customVramGiB) || 4;
    const preset = GPU_PRESETS.find((g) => g.id === gpuPresetId);
    return preset ? preset.vramGiB : 4;
  }, [gpuPresetId, customVramGiB]);

  const vramEstimate = useMemo(() => {
    return estimateGgufVramFit({
      paramsB: Number(paramsB),
      quantization,
      contextLen: Number(contextLen),
      kvPrecision,
      gpuVramGiB: effectiveGpuVramGiB,
      layers: Number(layersInput) || undefined,
      kvHeads: Number(kvHeadsInput) || undefined,
      headDim: Number(headDimInput) || undefined,
    });
  }, [paramsB, quantization, contextLen, kvPrecision, effectiveGpuVramGiB, layersInput, kvHeadsInput, headDimInput]);

  const synthesizedCommands = useMemo(() => {
    return synthesizeModelCommands(selectedModel, {
      contextLen: Number(contextLen) || selectedModel?.contextLength || 4096,
      gpuLayers: vramEstimate?.ok ? vramEstimate.recommendedGpuLayers : 99,
      temperature: Number(temperatureInput) || 0.2,
      systemPrompt: systemPromptInput,
    });
  }, [selectedModel, contextLen, vramEstimate, temperatureInput, systemPromptInput]);

  const exportsBundle = useMemo(() => {
    return formatModelsConsoleExports(snapshot, vramEstimate?.ok ? vramEstimate : null, synthesizedCommands);
  }, [snapshot, vramEstimate, synthesizedCommands]);

  const handleCopy = useCallback(async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((curr) => (curr === id ? '' : curr)), 1800);
  }, []);

  const applyArchPreset = useCallback((preset) => {
    setArchPresetId(preset.id);
    setParamsB(String(preset.paramsB));
    setLayersInput(String(preset.layers));
    setKvHeadsInput(String(preset.kvHeads));
    setHeadDimInput(String(preset.headDim));
    setContextLen(String(preset.defaultContext));
    setQuantization(preset.defaultQuant);
  }, []);

  const loadModelIntoCalculator = useCallback((model) => {
    setSelectedModelId(model.id);
    if (model.paramsB) {
      setArchPresetId('custom');
      setParamsB(String(model.paramsB));
      const matchedQuant = QUANTIZATION_PROFILES.find((q) => q.id === model.quantization)?.id || 'Q4_K_M';
      setQuantization(matchedQuant);
      setContextLen(String(Math.min(model.contextLength || 4096, 32768)));
      setLayersInput('');
      setKvHeadsInput('');
      setHeadDimInput('');
    }
    setActiveTab(2);
  }, []);

  const verdictStyle = useCallback(
    (verdict) => {
      if (verdict === 'FITS_VRAM') {
        return { fg: tk.emerald, bg: tk.emeraldBg, border: tk.emeraldBorder, label: 'FITS VRAM' };
      }
      if (verdict === 'PARTIAL_CPU_OFFLOAD') {
        return { fg: tk.amber, bg: tk.amberBg, border: tk.amberBorder, label: 'PARTIAL OFFLOAD' };
      }
      if (verdict === 'REMOTE_OR_PROXY') {
        return { fg: tk.sky, bg: tk.skyBg, border: tk.skyBorder, label: 'PROXY ROUTED' };
      }
      if (verdict === 'EXCEEDS_BUDGET') {
        return { fg: tk.red, bg: tk.redBg, border: tk.redBorder, label: 'EXCEEDS VRAM' };
      }
      return { fg: tk.muted, bg: tk.inset, border: tk.borderSoft, label: String(verdict || 'UNKNOWN') };
    },
    [tk],
  );

  const isLive = snapshot.mode === 'LIVE_LOOPBACK';
  const gpuUsedPct = Math.min(100, Math.max(0, Number(snapshot.gpu?.usedPct || 0)));

  return (
    <Box
      sx={{
        bgcolor: tk.bg,
        color: tk.ink,
        borderRadius: 2.5,
        border: `1px solid ${tk.border}`,
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {/* Top Status & Refresh Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: `1px solid ${tk.borderSoft}`,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Chip
              size="small"
              icon={<MemoryIcon sx={{ color: `${isLive ? tk.emerald : tk.amber} !important`, fontSize: 16 }} />}
              label={isLive ? 'LIVE_LOOPBACK · READ-ONLY PROBES' : 'BROWSER_OFFLINE_FALLBACK · CURATED SNAPSHOT'}
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isLive ? tk.emeraldBg : tk.amberBg,
                color: isLive ? tk.emerald : tk.amber,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.amberBorder}`,
                height: 28,
              }}
            />
            <Chip
              size="small"
              label={`SCHEMA v${MODELS_CONSOLE_SCHEMA_VERSION}`}
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: tk.goldBg,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
                height: 28,
              }}
            />
          </Box>
          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              color: tk.ink,
              lineHeight: 1.25,
            }}
          >
            Local Models Console — Ollama, AGY-Hermes &amp; GGUF VRAM Planner
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: tk.muted, mt: 0.35 }}>
            Strictly read-only inventory across Ollama (:11434), AGY-Hermes Proxy (:18000), optional local runtimes, and host GPU VRAM. Zero automatic pulls or model loads.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            disabled={loading}
            onClick={() => fetchLiveModels(true)}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
            }}
          >
            {loading ? 'Probing...' : 'Refresh Probes'}
          </Button>
        </Box>
      </Box>

      {/* Honest Offline Banner when static */}
      {!isLive && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor: tk.amberBg,
            color: tk.amber,
            border: `1px solid ${tk.amberBorder}`,
            '& .MuiAlert-icon': { color: tk.amber },
          }}
        >
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tk.ink }}>
            {snapshot.offlineNotice}
          </Typography>
        </Alert>
      )}

      {/* KPI Strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          {
            label: 'TOTAL DISCOVERED MODELS',
            value: String(snapshot.summary?.totalModels ?? 0),
            sub: `${snapshot.summary?.localGgufCount ?? 0} Ollama GGUF · ${snapshot.summary?.routedProxyCount ?? 0} AGY-Hermes`,
            accent: tk.gold,
          },
          {
            label: 'ACTIVE VRAM RESIDENCY (/api/ps)',
            value: `${snapshot.summary?.loadedCount ?? 0} loaded`,
            sub: `${snapshot.summary?.loadedVramMiB ?? 0} MiB Ollama VRAM allocated`,
            accent: tk.emerald,
          },
          {
            label: 'HOST GPU CAPACITY',
            value: `${snapshot.gpu?.freeMiB ?? 0} MiB free`,
            sub: `${snapshot.gpu?.name || 'Host GPU'} (${snapshot.gpu?.usedMiB ?? 0}/${snapshot.gpu?.totalMiB ?? 0} MiB)`,
            accent: tk.sky,
          },
          {
            label: 'ONLINE PROVIDERS',
            value: `${snapshot.summary?.onlineProviders ?? 0} / ${snapshot.summary?.totalProviders ?? 5}`,
            sub: `${snapshot.summary?.fitsHostGpuCount ?? 0} GGUF models fit host VRAM`,
            accent: tk.gold,
          },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.label}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                height: '100%',
                bgcolor: tk.card,
                border: `1px solid ${tk.borderSoft}`,
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.06em' }}>
                {kpi.label}
              </Typography>
              <Typography sx={{ fontFamily: DISPLAY, fontSize: '1.35rem', fontWeight: 700, color: kpi.accent, mt: 0.4 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.muted, mt: 0.35 }}>
                {kpi.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 4 Clean Tabs — Zero Desktop Clipping, >= 44px Tap Targets */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: tk.card,
          border: `1px solid ${tk.borderSoft}`,
          borderRadius: 2,
          mb: 2.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Local Models Console sections"
          sx={{
            px: 1,
            borderBottom: `1px solid ${tk.borderSoft}`,
            '& .MuiTabs-indicator': { backgroundColor: tk.gold, height: 3 },
            '& .MuiTab-root': {
              minHeight: 48,
              fontFamily: MONO,
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.muted,
              '&.Mui-selected': { color: tk.gold },
            },
          }}
        >
          <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Installed Catalog (${snapshot.summary?.totalModels ?? 0})`} />
          <Tab icon={<MemoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`VRAM & GPU (${snapshot.summary?.loadedCount ?? 0})`} />
          <Tab icon={<CalculateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="GGUF Fit Calculator" />
          <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="CLI, Modelfile & Exports" />
        </Tabs>

        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          {/* TAB 0: INSTALLED & LIVE CATALOG */}
          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <TextField
                  id="models-catalog-search"
                  label="Search models by name, family, quant, or owner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 320 },
                    flex: { xs: '1 1 100%', md: '0 1 380px' },
                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink },
                    '& .MuiInputLabel-root': { color: tk.muted },
                  }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    { id: 'ALL', label: `All (${snapshot.models?.length ?? 0})` },
                    { id: 'ollama', label: `Ollama (${snapshot.summary?.localGgufCount ?? 0})` },
                    { id: 'agy-hermes', label: `AGY-Hermes (${snapshot.summary?.routedProxyCount ?? 0})` },
                  ].map((opt) => {
                    const active = providerFilter === opt.id;
                    return (
                      <Button
                        key={opt.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => setProviderFilter(opt.id)}
                        sx={{
                          minHeight: 44,
                          px: 1.75,
                          fontFamily: MONO,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: active ? tk.goldBtnBg : 'transparent',
                          color: active ? tk.goldBtnInk : tk.ink,
                          borderColor: active ? tk.goldBtnBg : tk.border,
                          '&:hover': {
                            bgcolor: active ? tk.goldBtnBg : tk.inset,
                            borderColor: tk.gold,
                          },
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}

                  <Button
                    size="small"
                    variant={fitFilter === 'FITS_VRAM' ? 'contained' : 'outlined'}
                    onClick={() => setFitFilter((f) => (f === 'FITS_VRAM' ? 'ALL' : 'FITS_VRAM'))}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: MONO,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: fitFilter === 'FITS_VRAM' ? tk.emeraldBg : 'transparent',
                      color: fitFilter === 'FITS_VRAM' ? tk.emerald : tk.ink,
                      borderColor: fitFilter === 'FITS_VRAM' ? tk.emeraldBorder : tk.border,
                      '&:hover': { bgcolor: tk.emeraldBg },
                    }}
                  >
                    Fits Host GPU
                  </Button>
                </Box>
              </Box>

              {filteredModels.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                  <Typography sx={{ color: tk.muted, fontSize: '0.9rem' }}>
                    No models matched your current search and provider filters.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={1.5}>
                  {filteredModels.map((m) => {
                    const vStyle = verdictStyle(m.hostGpuVerdict);
                    const isSelected = selectedModel?.id === m.id;
                    return (
                      <Grid item xs={12} md={6} key={m.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.75,
                            height: '100%',
                            bgcolor: isSelected ? tk.goldBg : tk.inset,
                            border: `1px solid ${isSelected ? tk.goldBorder : tk.borderSoft}`,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 1.25,
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                              <Typography
                                component="h4"
                                sx={{
                                  fontFamily: MONO,
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  color: tk.ink,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {m.name}
                              </Typography>
                              <Chip
                                size="small"
                                label={vStyle.label}
                                sx={{
                                  fontFamily: MONO,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: vStyle.bg,
                                  color: vStyle.fg,
                                  border: `1px solid ${vStyle.border}`,
                                  height: 24,
                                }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                              <Chip
                                size="small"
                                label={`${m.providerId} :${m.providerPort}`}
                                sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, bgcolor: tk.card, color: tk.ink, border: `1px solid ${tk.borderSoft}` }}
                              />
                              <Chip
                                size="small"
                                label={`Params: ${m.paramLabel}`}
                                sx={{ fontFamily: MONO, fontSize: '0.7rem', bgcolor: tk.card, color: tk.muted, border: `1px solid ${tk.borderSoft}` }}
                              />
                              <Chip
                                size="small"
                                label={`Quant: ${m.quantization}`}
                                sx={{ fontFamily: MONO, fontSize: '0.7rem', bgcolor: tk.card, color: tk.muted, border: `1px solid ${tk.borderSoft}` }}
                              />
                              {m.sizeGiB > 0 && (
                                <Chip
                                  size="small"
                                  label={`${m.sizeGiB} GiB`}
                                  sx={{ fontFamily: MONO, fontSize: '0.7rem', bgcolor: tk.card, color: tk.muted, border: `1px solid ${tk.borderSoft}` }}
                                />
                              )}
                              <Chip
                                size="small"
                                label={`Ctx: ${Number(m.contextLength || 0).toLocaleString()}`}
                                sx={{ fontFamily: MONO, fontSize: '0.7rem', bgcolor: tk.card, color: tk.muted, border: `1px solid ${tk.borderSoft}` }}
                              />
                              {m.loadedInVram && (
                                <Chip
                                  size="small"
                                  label={`IN VRAM (${m.vramMiB} MiB)`}
                                  sx={{
                                    fontFamily: MONO,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    bgcolor: tk.emeraldBg,
                                    color: tk.emerald,
                                    border: `1px solid ${tk.emeraldBorder}`,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 0.75, borderTop: `1px solid ${tk.borderSoft}` }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedModelId(m.id);
                                setActiveTab(3);
                              }}
                              sx={{
                                minHeight: 44,
                                px: 1.5,
                                fontFamily: MONO,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: tk.ink,
                                borderColor: tk.border,
                              }}
                            >
                              CLI &amp; curl
                            </Button>
                            {m.paramsB ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => loadModelIntoCalculator(m)}
                                sx={{
                                  minHeight: 44,
                                  px: 1.5,
                                  fontFamily: MONO,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: tk.gold,
                                  borderColor: tk.goldBorder,
                                }}
                              >
                                Size in Calculator
                              </Button>
                            ) : null}
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* TAB 1: VRAM RESIDENCY & GPU */}
          {activeTab === 1 && (
            <Stack spacing={2.25}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                  <Box>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', color: tk.ink }}>
                      Host GPU VRAM Posture — {snapshot.gpu?.name || 'Host GPU'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>
                      Source: {snapshot.gpu?.source || 'nvidia-smi-readonly'}
                      {snapshot.gpu?.driverVersion ? ` · Driver ${snapshot.gpu.driverVersion}` : ''}
                      {snapshot.gpu?.utilizationGpuPct !== null && snapshot.gpu?.utilizationGpuPct !== undefined
                        ? ` · GPU Util ${snapshot.gpu.utilizationGpuPct}%`
                        : ''}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${snapshot.gpu?.usedMiB ?? 0} / ${snapshot.gpu?.totalMiB ?? 4096} MiB (${gpuUsedPct}%)`}
                    sx={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: tk.skyBg,
                      color: tk.sky,
                      border: `1px solid ${tk.skyBorder}`,
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={gpuUsedPct}
                  aria-label="Host GPU VRAM utilization percentage"
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: tk.card,
                    border: `1px solid ${tk.borderSoft}`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: gpuUsedPct > 85 ? tk.red : gpuUsedPct > 65 ? tk.amber : tk.emerald,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, mt: 1 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.ink }}>
                    Used: <strong>{snapshot.gpu?.usedMiB ?? 0} MiB</strong>
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.emerald }}>
                    Free Headroom: <strong>{snapshot.gpu?.freeMiB ?? 0} MiB</strong>
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.muted }}>
                    Total Budget: <strong>{snapshot.gpu?.totalGiB ?? 4} GiB</strong>
                  </Typography>
                </Box>
              </Paper>

              <Box>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.02rem', color: tk.ink, mb: 1.25 }}>
                  Loaded Ollama Models in VRAM (GET /api/ps — Read-Only)
                </Typography>
                {(snapshot.loadedModels || []).length === 0 ? (
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                    <Typography sx={{ fontSize: '0.86rem', color: tk.muted }}>
                      No models are currently loaded in Ollama VRAM.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={1.5}>
                    {snapshot.loadedModels.map((lm) => (
                      <Grid item xs={12} md={6} key={lm.name}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: tk.emeraldBg, border: `1px solid ${tk.emeraldBorder}`, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.95rem', color: tk.ink }}>
                              {lm.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${lm.vramMiB} MiB VRAM`}
                              sx={{ fontFamily: MONO, fontWeight: 700, bgcolor: tk.card, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}` }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            <Chip size="small" label={`Params: ${lm.paramLabel}`} sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.card, color: tk.ink }} />
                            <Chip size="small" label={`Quant: ${lm.quantization}`} sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.card, color: tk.ink }} />
                            <Chip size="small" label={`Ctx: ${Number(lm.contextLength || 0).toLocaleString()}`} sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.card, color: tk.ink }} />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>

              <Box>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.02rem', color: tk.ink, mb: 1.25 }}>
                  Local Provider Health Matrix (Loopback Read-Only Probes)
                </Typography>
                <Grid container spacing={1.5}>
                  {(snapshot.providers || []).map((prov) => (
                    <Grid item xs={12} sm={6} lg={4} key={prov.id}>
                      <Paper elevation={0} sx={{ p: 1.75, height: '100%', bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.92rem', color: tk.ink }}>
                            {prov.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={prov.status}
                            sx={{
                              fontFamily: MONO,
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              bgcolor: prov.online ? tk.emeraldBg : tk.card,
                              color: prov.online ? tk.emerald : tk.muted,
                              border: `1px solid ${prov.online ? tk.emeraldBorder : tk.borderSoft}`,
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.gold, mt: 0.5 }}>
                          {prov.host}:{prov.port} · {prov.protocol}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: tk.muted, mt: 0.5 }}>
                          {prov.role}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink, mt: 0.75 }}>
                          Models: <strong>{prov.modelCount}</strong>
                          {prov.latencyMs !== null ? ` · Probe RTT: ${prov.latencyMs} ms` : ' · Not listening'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          )}

          {/* TAB 2: GGUF & KV-CACHE VRAM FIT CALCULATOR */}
          {activeTab === 2 && (
            <Stack spacing={2.25}>
              <Box>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1 }}>
                  Quick Model Architecture Presets
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {MODEL_ARCH_PRESETS.map((preset) => {
                    const active = archPresetId === preset.id;
                    return (
                      <Button
                        key={preset.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => applyArchPreset(preset)}
                        sx={{
                          minHeight: 44,
                          px: 1.5,
                          fontFamily: MONO,
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          bgcolor: active ? tk.goldBtnBg : 'transparent',
                          color: active ? tk.goldBtnInk : tk.ink,
                          borderColor: active ? tk.goldBtnBg : tk.border,
                        }}
                      >
                        {preset.id}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    id="calc-params-b"
                    label="Parameters (Billions)"
                    type="number"
                    fullWidth
                    size="small"
                    value={paramsB}
                    onChange={(e) => {
                      setArchPresetId('custom');
                      setParamsB(e.target.value);
                    }}
                    inputProps={{ step: '0.1', min: '0.1', max: '1000' }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    id="calc-quantization"
                    select
                    label="Weight Quantization"
                    fullWidth
                    size="small"
                    value={quantization}
                    onChange={(e) => setQuantization(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  >
                    {QUANTIZATION_PROFILES.map((qp) => (
                      <MenuItem key={qp.id} value={qp.id}>
                        {qp.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    id="calc-context-len"
                    label="Context Window (Tokens)"
                    type="number"
                    fullWidth
                    size="small"
                    value={contextLen}
                    onChange={(e) => setContextLen(e.target.value)}
                    inputProps={{ step: '1024', min: '256', max: '1048576' }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    id="calc-kv-precision"
                    select
                    label="KV Cache Precision"
                    fullWidth
                    size="small"
                    value={kvPrecision}
                    onChange={(e) => setKvPrecision(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  >
                    {KV_PRECISION_PROFILES.map((kv) => (
                      <MenuItem key={kv.id} value={kv.id}>
                        {kv.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    id="calc-gpu-preset"
                    select
                    label="Target GPU VRAM Budget"
                    fullWidth
                    size="small"
                    value={gpuPresetId}
                    onChange={(e) => {
                      setGpuPresetId(e.target.value);
                      const found = GPU_PRESETS.find((g) => g.id === e.target.value);
                      if (found && found.id !== 'custom') setCustomVramGiB(String(found.vramGiB));
                    }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  >
                    {GPU_PRESETS.map((gp) => (
                      <MenuItem key={gp.id} value={gp.id}>
                        {gp.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {gpuPresetId === 'custom' && (
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      id="calc-custom-vram"
                      label="Custom VRAM (GiB)"
                      type="number"
                      fullWidth
                      size="small"
                      value={customVramGiB}
                      onChange={(e) => setCustomVramGiB(e.target.value)}
                      inputProps={{ step: '1', min: '1', max: '2048' }}
                      sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    />
                  </Grid>
                )}

                <Grid item xs={4} sm={4} md={2}>
                  <TextField
                    id="calc-layers"
                    label="Layers (opt)"
                    type="number"
                    fullWidth
                    size="small"
                    value={layersInput}
                    onChange={(e) => setLayersInput(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
                <Grid item xs={4} sm={4} md={2}>
                  <TextField
                    id="calc-kv-heads"
                    label="KV Heads (opt)"
                    type="number"
                    fullWidth
                    size="small"
                    value={kvHeadsInput}
                    onChange={(e) => setKvHeadsInput(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
                <Grid item xs={4} sm={4} md={2}>
                  <TextField
                    id="calc-head-dim"
                    label="Head Dim (opt)"
                    type="number"
                    fullWidth
                    size="small"
                    value={headDimInput}
                    onChange={(e) => setHeadDimInput(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
              </Grid>

              {!vramEstimate.ok ? (
                <Alert severity="error" sx={{ bgcolor: tk.redBg, color: tk.red, border: `1px solid ${tk.redBorder}` }}>
                  {vramEstimate.error}
                </Alert>
              ) : (
                <>
                  {(() => {
                    const vs = verdictStyle(vramEstimate.verdict);
                    return (
                      <Paper elevation={0} sx={{ p: 2, bgcolor: vs.bg, border: `1px solid ${vs.border}`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                            <Chip
                              size="small"
                              label={vs.label}
                              sx={{ fontFamily: MONO, fontWeight: 700, bgcolor: tk.card, color: vs.fg, border: `1px solid ${vs.border}` }}
                            />
                            <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.95rem', color: tk.ink }}>
                              {vramEstimate.breakdown.totalMiB} MiB ({vramEstimate.breakdown.totalGiB} GiB) / {vramEstimate.inputs.budgetMiB} MiB ({vramEstimate.breakdown.utilizationPct}%)
                            </Typography>
                          </Box>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.muted }}>
                            SHA-256: {vramEstimate.receiptSha256.slice(0, 16)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.88rem', color: tk.ink, mb: 1.5 }}>
                          {vramEstimate.verdictSummary}
                        </Typography>
                        <Grid container spacing={1.5}>
                          {[
                            { label: 'GGUF WEIGHTS', val: `${vramEstimate.breakdown.weightMiB} MiB (${vramEstimate.breakdown.weightGiB} GiB)` },
                            { label: 'GQA KV CACHE', val: `${vramEstimate.breakdown.kvCacheMiB} MiB (${vramEstimate.inputs.layers}L × ${vramEstimate.inputs.kvHeads}H × ${vramEstimate.inputs.headDim}D)` },
                            { label: 'RUNTIME OVERHEAD', val: `${vramEstimate.breakdown.overheadMiB} MiB (CUDA/GGML buffers)` },
                            { label: 'GPU LAYERS / MAX CTX', val: `${vramEstimate.recommendedGpuLayers}/${vramEstimate.inputs.layers} layers · max ${vramEstimate.maxContextAtBudget.toLocaleString()} ctx` },
                          ].map((cell) => (
                            <Grid item xs={12} sm={6} lg={3} key={cell.label}>
                              <Paper elevation={0} sx={{ p: 1.25, bgcolor: tk.card, border: `1px solid ${tk.borderSoft}`, borderRadius: 1.5 }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted }}>
                                  {cell.label}
                                </Typography>
                                <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700, color: tk.ink, mt: 0.35 }}>
                                  {cell.val}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    );
                  })()}

                  <Box>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1 }}>
                      Quantization Tradeoff Matrix ({vramEstimate.inputs.paramsB}B · {vramEstimate.inputs.contextLen.toLocaleString()} ctx · {vramEstimate.inputs.gpuVramGiB} GiB GPU)
                    </Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box
                        component="table"
                        sx={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontFamily: MONO,
                          fontSize: '0.78rem',
                          '& th, & td': {
                            textAlign: 'left',
                            p: 1.15,
                            borderBottom: `1px solid ${tk.borderSoft}`,
                            whiteSpace: 'nowrap',
                          },
                          '& th': { color: tk.muted, bgcolor: tk.inset, fontWeight: 700 },
                          '& td': { color: tk.ink },
                        }}
                      >
                        <thead>
                          <tr>
                            <th>Quant</th>
                            <th>BPW</th>
                            <th>Weights</th>
                            <th>KV Cache</th>
                            <th>Total VRAM</th>
                            <th>Utilization</th>
                            <th>Fit Verdict</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vramEstimate.quantMatrix.map((row) => {
                            const rv = verdictStyle(row.verdict);
                            return (
                              <tr key={row.quantization}>
                                <td><strong>{row.quantization}</strong></td>
                                <td>{row.bitsPerWeight}</td>
                                <td>{row.weightMiB} MiB</td>
                                <td>{row.kvCacheMiB} MiB</td>
                                <td><strong>{row.totalMiB} MiB</strong></td>
                                <td>{row.utilizationPct}%</td>
                                <td>
                                  <Chip
                                    size="small"
                                    label={rv.label}
                                    sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, bgcolor: rv.bg, color: rv.fg, border: `1px solid ${rv.border}`, height: 24 }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Stack>
          )}

          {/* TAB 3: CLI, MODELFILE, CURL & EXPORTS */}
          {activeTab === 3 && (
            <Stack spacing={2.25}>
              <Alert
                severity="info"
                sx={{
                  bgcolor: tk.skyBg,
                  color: tk.sky,
                  border: `1px solid ${tk.skyBorder}`,
                  '& .MuiAlert-icon': { color: tk.sky },
                }}
              >
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tk.ink }}>
                  {synthesizedCommands.safetyNotice}
                </Typography>
              </Alert>

              <Grid container spacing={1.5}>
                <Grid item xs={12} md={5}>
                  <TextField
                    id="cmd-selected-model"
                    select
                    label="Selected Model for Snippets"
                    fullWidth
                    size="small"
                    value={selectedModel?.id || ''}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  >
                    {(snapshot.models || []).map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.providerId} — {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <TextField
                    id="cmd-temperature"
                    label="Temperature"
                    type="number"
                    fullWidth
                    size="small"
                    value={temperatureInput}
                    onChange={(e) => setTemperatureInput(e.target.value)}
                    inputProps={{ step: '0.1', min: '0', max: '2' }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
                <Grid item xs={12} sm={8} md={5}>
                  <TextField
                    id="cmd-system-prompt"
                    label="Modelfile SYSTEM Directive"
                    fullWidth
                    size="small"
                    value={systemPromptInput}
                    onChange={(e) => setSystemPromptInput(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.inset, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {[
                  {
                    id: 'ollama-cli',
                    title: 'Ollama Operator CLI Commands (Copy-Only)',
                    code: [
                      `# Inspect active VRAM models (read-only)`,
                      synthesizedCommands.ollamaPs,
                      ``,
                      `# Inspect model metadata & template (read-only)`,
                      synthesizedCommands.ollamaShow,
                      ``,
                      `# Interactive local session`,
                      synthesizedCommands.ollamaRun,
                    ].join('\n'),
                  },
                  {
                    id: 'modelfile',
                    title: 'Deterministic Ollama Modelfile',
                    code: synthesizedCommands.modelfile,
                  },
                  {
                    id: 'curl-openai',
                    title: `Loopback OpenAI-Compatible curl (127.0.0.1:${synthesizedCommands.port})`,
                    code: synthesizedCommands.curlOpenAi,
                  },
                ].map((block) => (
                  <Grid item xs={12} key={block.id}>
                    <Paper elevation={0} sx={{ p: 1.75, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                        <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.94rem', color: tk.ink }}>
                          {block.title}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={copiedId === block.id ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                          onClick={() => handleCopy(block.id, block.code)}
                          sx={{
                            minHeight: 44,
                            px: 1.75,
                            fontFamily: MONO,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: copiedId === block.id ? tk.emerald : tk.ink,
                            borderColor: copiedId === block.id ? tk.emeraldBorder : tk.border,
                          }}
                        >
                          {copiedId === block.id ? 'Copied' : 'Copy Snippet'}
                        </Button>
                      </Box>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: tk.codeBg,
                          color: tk.ink,
                          border: `1px solid ${tk.borderSoft}`,
                          fontFamily: MONO,
                          fontSize: '0.78rem',
                          lineHeight: 1.55,
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {block.code}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Formula-Safe Exports */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.border}`, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.98rem', color: tk.ink }}>
                      Verified Inventory &amp; VRAM Fit Exports
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.muted, mt: 0.35 }}>
                      Redacted ~/ paths · Spreadsheet formula-safe CSV · Receipt SHA-256: {exportsBundle.receiptSha256}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadTextFile('zoth-local-models-report.json', exportsBundle.json, 'application/json')}
                      sx={{ minHeight: 44, px: 1.75, fontFamily: MONO, fontWeight: 700, fontSize: '0.75rem', bgcolor: tk.goldBtnBg, color: tk.goldBtnInk }}
                    >
                      Export JSON
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadTextFile('zoth-local-models-report.md', exportsBundle.markdown, 'text/markdown')}
                      sx={{ minHeight: 44, px: 1.75, fontFamily: MONO, fontWeight: 700, fontSize: '0.75rem', color: tk.ink, borderColor: tk.border }}
                    >
                      Export Markdown
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadTextFile('zoth-local-models-catalog.csv', exportsBundle.csv, 'text/csv')}
                      sx={{ minHeight: 44, px: 1.75, fontFamily: MONO, fontWeight: 700, fontSize: '0.75rem', color: tk.ink, borderColor: tk.border }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
