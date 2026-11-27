import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Stack,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import HubIcon from '@mui/icons-material/Hub';
import LanIcon from '@mui/icons-material/Lan';
import TuneIcon from '@mui/icons-material/Tune';
import DescriptionIcon from '@mui/icons-material/Description';
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SecurityIcon from '@mui/icons-material/Security';
import {
  CONNECTORS_SCHEMA_VERSION,
  AI_PROVIDER_CONNECTORS,
  ZOTH_BRIDGE_CONNECTORS,
  validateLoopbackProbeTarget,
  generateMcpServersJson,
  generateOpenAiCompatEnv,
  generateHermesConfigYaml,
  generateCodexConfigToml,
  filterConnectors,
  computeConnectorSummary,
  buildOfflineConnectorsSnapshot,
  buildConnectorsJsonExport,
  buildConnectorsMarkdownExport,
  buildConnectorsCsvExport,
} from '../../utils/connectorsEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

async function fetchLiveConnectors(timeoutMs = 5000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/studio/connectors', {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, reason: 'Static deployment (non-JSON response)' };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Loopback Studio API unreachable',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function probeLoopbackEndpoint({ host = '127.0.0.1', port, path = '/' }) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 3000);
  try {
    const res = await fetch('/api/studio/connectors/probe', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ host, port, path }),
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, error: 'Live loopback probe requires Zoth Studio running locally on 127.0.0.1:3000.' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err?.name === 'AbortError'
        ? 'Loopback probe timed out'
        : 'Loopback Studio API (:3000) unreachable in static/offline browser mode.',
    };
  } finally {
    clearTimeout(timer);
  }
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConnectorsHubGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast WCAG AA dual-theme palette (0 dark slabs in Light Mode, >= 4.5:1 everywhere)
  const tk = useMemo(
    () => ({
      bg: isDark ? '#090B11' : '#F8F6F0',
      card: isDark ? '#0E121B' : '#FFFFFF',
      inset: isDark ? '#121723' : '#F2EFE6',
      codeBg: isDark ? '#06080D' : '#F4F1EA',
      codeInk: isDark ? '#E2E8F0' : '#101828',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.16)',
      ink: isDark ? '#F5F1E6' : '#101828',
      muted: isDark ? '#CBD5E1' : '#334155',
      gold: isDark ? '#D4AF37' : '#7A5808',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF7E0',
      goldBorder: isDark ? 'rgba(212, 175, 55, 0.42)' : '#B8860B',
      goldBtnBg: isDark ? '#D4AF37' : '#7A5808',
      goldBtnInk: isDark ? '#08080B' : '#FFFFFF',
      emerald: isDark ? '#34D399' : '#047857',
      emeraldSoft: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      emeraldBorder: isDark ? 'rgba(52, 211, 153, 0.38)' : '#059669',
      sky: isDark ? '#38BDF8' : '#0369A1',
      skySoft: isDark ? 'rgba(56, 189, 248, 0.14)' : '#F0F9FF',
      skyBorder: isDark ? 'rgba(56, 189, 248, 0.36)' : '#0284C7',
      amber: isDark ? '#FBBF24' : '#92400E',
      amberSoft: isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFFBEB',
      crimson: isDark ? '#FB7185' : '#B91C1C',
      crimsonSoft: isDark ? 'rgba(251, 113, 133, 0.14)' : '#FEF2F2',
    }),
    [isDark]
  );

  const aliveRef = useRef(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(() => buildOfflineConnectorsSnapshot('Probing local Studio loopback API...'));
  const [statusNote, setStatusNote] = useState('Probing local loopback connectors...');

  // Tab 0 filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [probingId, setProbingId] = useState('');
  const [probeBanner, setProbeBanner] = useState(null);

  // Tab 1 custom loopback prober & MCP filter
  const [customPort, setCustomPort] = useState('18000');
  const [customPath, setCustomPath] = useState('/health');
  const [customProbing, setCustomProbing] = useState(false);
  const [customProbeResult, setCustomProbeResult] = useState(null);
  const [mcpQuery, setMcpQuery] = useState('');

  // Tab 2 Config & .env Forge
  const [selectedConfigIds, setSelectedConfigIds] = useState([
    'agy-hermes-proxy',
    'ollama',
    'neuro-memory',
    'sovereign-agent-bridge',
    'azoth-local-agent',
    'fieldkit-mcp',
  ]);
  const [configFormat, setConfigFormat] = useState('mcp-json');
  const [preferredModel, setPreferredModel] = useState('claude-sonnet-4-6');

  // Tab 3 Diagnostic Export
  const [exportFormat, setExportFormat] = useState('json');
  const [copiedKey, setCopiedKey] = useState('');

  const copyWithFeedback = useCallback((text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? '' : prev));
    }, 1800);
  }, []);

  const refreshConnectors = useCallback(async () => {
    setLoading(true);
    const res = await fetchLiveConnectors(5000);
    if (!aliveRef.current) return;
    if (res.ok && res.data && Array.isArray(res.data.providers)) {
      setSnapshot(res.data);
      setStatusNote(
        `Live loopback telemetry · 127.0.0.1:3000 · v${res.data.schemaVersion || CONNECTORS_SCHEMA_VERSION}`
      );
    } else {
      const offline = buildOfflineConnectorsSnapshot(res.reason || 'Loopback Studio API unreachable');
      setSnapshot(offline);
      setStatusNote(
        `Offline browser fallback (${res.reason || 'loopback unavailable'}) — zero fabricated latency or statuses`
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refreshConnectors();
    return () => {
      aliveRef.current = false;
    };
  }, [refreshConnectors]);

  const summary = useMemo(() => computeConnectorSummary(snapshot), [snapshot]);
  const isLive = snapshot.mode === 'loopback-live' && Boolean(snapshot.liveApiReachable);

  const filteredProviders = useMemo(
    () => filterConnectors(snapshot.providers, { status: statusFilter, query: searchQuery }),
    [snapshot.providers, statusFilter, searchQuery]
  );

  const filteredHarnesses = useMemo(
    () => filterConnectors(snapshot.harnesses, { status: statusFilter, query: searchQuery }),
    [snapshot.harnesses, statusFilter, searchQuery]
  );

  const filteredBridges = useMemo(
    () => filterConnectors(snapshot.bridges, { status: 'ALL', query: mcpQuery }),
    [snapshot.bridges, mcpQuery]
  );

  const filteredMcpServers = useMemo(() => {
    const q = mcpQuery.trim().toLowerCase();
    const list = Array.isArray(snapshot.mcpServers) ? snapshot.mcpServers : [];
    if (!q) return list;
    return list.filter((s) =>
      `${s.name} ${s.transport} ${s.source} ${s.command || ''} ${s.url || ''}`.toLowerCase().includes(q)
    );
  }, [snapshot.mcpServers, mcpQuery]);

  const handleSingleConnectorProbe = async (connector) => {
    if (!connector?.port) return;
    setProbingId(connector.id);
    setProbeBanner(null);
    const res = await probeLoopbackEndpoint({
      host: '127.0.0.1',
      port: connector.port,
      path: connector.probePath || '/',
    });
    setProbingId('');
    if (!res.ok) {
      setProbeBanner({ severity: 'warning', text: `${connector.name} (:${connector.port}): ${res.error}` });
      return;
    }
    const d = res.data;
    setSnapshot((prev) => {
      const updateList = (arr) =>
        (arr || []).map((item) =>
          item.id === connector.id
            ? {
                ...item,
                online: Boolean(d.online),
                status: d.online ? 'online' : 'offline',
                statusCode: d.statusCode ?? null,
                latencyMs: d.latencyMs ?? null,
              }
            : item
        );
      const next = {
        ...prev,
        checkedAt: d.checkedAt || new Date().toISOString(),
        providers: updateList(prev.providers),
        bridges: updateList(prev.bridges),
      };
      return { ...next, summary: computeConnectorSummary(next) };
    });
    setProbeBanner({
      severity: d.online ? 'success' : 'info',
      text: d.online
        ? `${connector.name} (127.0.0.1:${d.port}${d.path}) ONLINE · HTTP ${d.statusCode || 200} · ${d.latencyMs}ms${d.summary ? ` · ${d.summary}` : ''}`
        : `${connector.name} (127.0.0.1:${d.port}${d.path}) OFFLINE (${d.summary || 'connection refused'})`,
    });
  };

  const handleCustomProbe = async (overridePort, overridePath) => {
    const portVal = overridePort !== undefined ? String(overridePort) : customPort;
    const pathVal = overridePath !== undefined ? String(overridePath) : customPath;
    if (overridePort !== undefined) setCustomPort(portVal);
    if (overridePath !== undefined) setCustomPath(pathVal);

    const validation = validateLoopbackProbeTarget({ host: '127.0.0.1', port: portVal, path: pathVal });
    if (!validation.valid) {
      setCustomProbeResult({ ok: false, error: validation.error });
      return;
    }
    setCustomProbing(true);
    const res = await probeLoopbackEndpoint({
      host: '127.0.0.1',
      port: validation.port,
      path: validation.path,
    });
    setCustomProbing(false);
    if (!res.ok) {
      setCustomProbeResult({ ok: false, error: res.error });
    } else {
      setCustomProbeResult({ ok: true, data: res.data });
    }
  };

  const toggleConfigId = (id) => {
    setSelectedConfigIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const generatedConfig = useMemo(() => {
    if (configFormat === 'env') {
      return generateOpenAiCompatEnv(selectedConfigIds, { model: preferredModel });
    }
    if (configFormat === 'hermes-yaml') {
      return generateHermesConfigYaml(selectedConfigIds, { model: preferredModel });
    }
    if (configFormat === 'codex-toml') {
      return generateCodexConfigToml(selectedConfigIds, { model: preferredModel });
    }
    return generateMcpServersJson(selectedConfigIds, snapshot.mcpServers, { includeMetadata: true });
  }, [configFormat, selectedConfigIds, snapshot.mcpServers, preferredModel]);

  const configFilename = useMemo(() => {
    if (configFormat === 'env') return 'zoth-loopback.env';
    if (configFormat === 'hermes-yaml') return 'hermes-config.yaml';
    if (configFormat === 'codex-toml') return 'codex-config.toml';
    return 'mcp-servers.json';
  }, [configFormat]);

  const exportContent = useMemo(() => {
    if (exportFormat === 'markdown') return buildConnectorsMarkdownExport(snapshot);
    if (exportFormat === 'csv') return buildConnectorsCsvExport(snapshot);
    return buildConnectorsJsonExport(snapshot);
  }, [exportFormat, snapshot]);

  const handleDownloadExport = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (exportFormat === 'markdown') {
      downloadTextFile(`zoth-connectors-report-${stamp}.md`, exportContent, 'text/markdown;charset=utf-8');
    } else if (exportFormat === 'csv') {
      downloadTextFile(`zoth-connectors-inventory-${stamp}.csv`, exportContent, 'text/csv;charset=utf-8');
    } else {
      downloadTextFile(`zoth-connectors-snapshot-${stamp}.json`, exportContent, 'application/json;charset=utf-8');
    }
  };

  return (
    <Box
      data-testid="connectors-hub-workstation"
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Workstation Deck Header (Zero duplicate Coffee/Solana CTA — single CTA lives in global Footer) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: tk.card,
          border: `1px solid ${tk.border}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip
                size="small"
                label={isLive ? '● LIVE LOOPBACK 127.0.0.1:3000' : '○ OFFLINE BROWSER FALLBACK'}
                sx={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: isLive ? tk.emeraldSoft : tk.amberSoft,
                  color: isLive ? tk.emerald : tk.amber,
                  border: `1px solid ${isLive ? tk.emeraldBorder : tk.goldBorder}`,
                }}
              />
              <Chip
                size="small"
                icon={<SecurityIcon sx={{ fontSize: '15px !important', color: `${tk.sky} !important` }} />}
                label="SSRF-GUARDED · ZERO PLAINTEXT KEYS"
                sx={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  bgcolor: tk.skySoft,
                  color: tk.sky,
                  border: `1px solid ${tk.skyBorder}`,
                }}
              />
            </Stack>
            <Typography
              component="h2"
              sx={{
                fontFamily: DISPLAY,
                fontSize: { xs: '1.2rem', sm: '1.45rem' },
                fontWeight: 700,
                color: tk.ink,
                lineHeight: 1.25,
                overflowWrap: 'anywhere',
              }}
            >
              Connectors Hub — AI Providers, CLI Harnesses &amp; MCP Bridges
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: '0.86rem',
                color: tk.muted,
                lineHeight: 1.55,
              }}
            >
              {statusNote}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              onClick={refreshConnectors}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                minHeight: 44,
                px: 2,
                fontFamily: MONO,
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: tk.goldBtnBg,
                color: tk.goldBtnInk,
                '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
              }}
            >
              {loading ? 'Probing…' : 'Refresh All'}
            </Button>
          </Stack>
        </Box>

        {/* Summary KPI Grid */}
        <Grid container spacing={1.5}>
          {[
            {
              label: 'AI PROVIDERS',
              value: `${summary.providersOnline} / ${summary.providersTotal}`,
              sub: summary.totalModels > 0 ? `${summary.totalModels} live models` : (isLive ? '0 active models' : 'Unprobed offline'),
              color: summary.providersOnline > 0 ? tk.emerald : tk.muted,
            },
            {
              label: 'CLI HARNESSES',
              value: `${summary.harnessesDetected} / ${summary.harnessesTotal}`,
              sub: isLive ? 'Safe PATH presence check' : 'Local CLI probe offline',
              color: summary.harnessesDetected > 0 ? tk.sky : tk.muted,
            },
            {
              label: 'LOOPBACK BRIDGES',
              value: `${summary.bridgesOnline} / ${summary.bridgesTotal}`,
              sub: '127.0.0.1 enclave sockets',
              color: summary.bridgesOnline > 0 ? tk.emerald : tk.muted,
            },
            {
              label: 'LOCAL MCP SERVERS',
              value: String(summary.mcpServersDiscovered),
              sub: 'Secrets redacted to ${ENV_VAR}',
              color: tk.gold,
            },
          ].map((kpi) => (
            <Grid xs={6} md={3} key={kpi.label}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: tk.inset,
                  border: `1px solid ${tk.border}`,
                  height: '100%',
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.08em' }}>
                  {kpi.label}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: { xs: '1.15rem', sm: '1.35rem' }, fontWeight: 800, color: kpi.color, mt: 0.35 }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: tk.muted, mt: 0.25 }}>
                  {kpi.sub}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Scrollable 4-Tab Navigation */}
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: 2,
          bgcolor: tk.card,
          border: `1px solid ${tk.border}`,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Connectors Hub sections"
          sx={{
            '& .MuiTabs-indicator': { bgcolor: tk.gold, height: 3 },
            '& .MuiTab-root': {
              minHeight: 48,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              color: tk.muted,
              '&.Mui-selected': { color: tk.gold },
            },
          }}
        >
          <Tab icon={<HubIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Live AI Providers & Harnesses" />
          <Tab icon={<LanIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="MCP & Loopback Bridges" />
          <Tab icon={<TuneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Config & .env Forge" />
          <Tab icon={<DescriptionIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Diagnostic Export & Offline Inspector" />
        </Tabs>
      </Paper>

      {/* ================================================================= */}
      {/* TAB 0: LIVE AI PROVIDERS & HARNESSES                              */}
      {/* ================================================================= */}
      {activeTab === 0 && (
        <Box>
          {probeBanner && (
            <Alert severity={probeBanner.severity} sx={{ mb: 2, fontFamily: MONO, fontSize: '0.78rem' }}>
              {probeBanner.text}
            </Alert>
          )}

          {/* Filter & Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {['ALL', 'ONLINE', 'OFFLINE'].map((st) => {
                const active = statusFilter === st;
                return (
                  <Button
                    key={st}
                    size="small"
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setStatusFilter(st)}
                    sx={{
                      minHeight: 44,
                      minWidth: 68,
                      px: 1.75,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      bgcolor: active ? tk.goldBtnBg : 'transparent',
                      color: active ? tk.goldBtnInk : tk.ink,
                      borderColor: active ? tk.goldBtnBg : tk.border,
                      '&:hover': {
                        bgcolor: active ? (isDark ? '#E5C65C' : '#5E4305') : tk.inset,
                        borderColor: tk.gold,
                      },
                    }}
                  >
                    {st}
                  </Button>
                );
              })}
            </Stack>

            <TextField
              size="small"
              label="Filter providers or harnesses"
              placeholder="Search Ollama, 18000, hermes, claude..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputProps={{ 'aria-label': 'Filter AI providers and CLI harnesses', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: tk.muted }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: MONO, fontSize: '0.8rem', minHeight: 44 },
              }}
              sx={{ width: { xs: '100%', sm: 310 } }}
            />
          </Paper>

          {/* AI Providers Grid */}
          <Typography
            component="h3"
            sx={{
              fontFamily: MONO,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 1.5,
            }}
          >
            Local AI Providers &amp; Inference Gateways ({filteredProviders.length})
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {filteredProviders.map((prov) => (
              <Grid xs={12} md={6} key={prov.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: tk.card,
                    border: `1px solid ${prov.online ? tk.emeraldBorder : tk.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.02rem', color: tk.ink }}>
                          {prov.name}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.sky, fontWeight: 700 }}>
                          {prov.host}:{prov.port} · {prov.protocol}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={prov.online ? 'ONLINE' : (prov.status === 'unprobed' ? 'UNPROBED' : 'OFFLINE')}
                        sx={{
                          fontFamily: MONO,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          bgcolor: prov.online ? tk.emeraldSoft : tk.inset,
                          color: prov.online ? tk.emerald : tk.muted,
                          border: `1px solid ${prov.online ? tk.emeraldBorder : tk.border}`,
                        }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mb: 1.25, lineHeight: 1.5 }}>
                      {prov.description}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        label={`RTT: ${prov.latencyMs !== null && prov.latencyMs !== undefined ? `${prov.latencyMs}ms` : '—'}`}
                        sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.inset, color: tk.ink }}
                      />
                      <Chip
                        size="small"
                        label={`Models: ${prov.modelsCount !== null && prov.modelsCount !== undefined ? prov.modelsCount : '—'}`}
                        sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.inset, color: tk.ink }}
                      />
                      {prov.version && (
                        <Chip
                          size="small"
                          label={`v${prov.version}`}
                          sx={{ fontFamily: MONO, fontSize: '0.72rem', bgcolor: tk.goldSoft, color: tk.gold }}
                        />
                      )}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={probingId === prov.id}
                      onClick={() => handleSingleConnectorProbe(prov)}
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: tk.gold,
                        borderColor: tk.goldBorder,
                        '&:hover': { bgcolor: tk.goldSoft, borderColor: tk.gold },
                      }}
                    >
                      {probingId === prov.id ? 'Probing…' : 'Live Probe'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => copyWithFeedback(prov.baseUrl, `url-${prov.id}`)}
                      startIcon={copiedKey === `url-${prov.id}` ? <CheckIcon /> : <ContentCopyIcon />}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: tk.ink,
                        borderColor: tk.border,
                        '&:hover': { bgcolor: tk.inset },
                      }}
                    >
                      {copiedKey === `url-${prov.id}` ? 'Copied Base URL' : 'Copy /v1 URL'}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* CLI Harnesses Matrix */}
          <Typography
            component="h3"
            sx={{
              fontFamily: MONO,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 1.5,
            }}
          >
            Agent Harnesses &amp; CLI Runtimes ({filteredHarnesses.length})
          </Typography>

          <Grid container spacing={2}>
            {filteredHarnesses.map((h) => (
              <Grid xs={12} sm={6} md={4} key={h.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: tk.card,
                    border: `1px solid ${h.present ? tk.skyBorder : tk.border}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <TerminalIcon sx={{ fontSize: 18, color: h.present ? tk.sky : tk.muted }} />
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.96rem', color: tk.ink }}>
                        {h.name}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={h.present ? 'DETECTED' : (h.status === 'unprobed' ? 'UNPROBED' : 'NOT FOUND')}
                      sx={{
                        fontFamily: MONO,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: h.present ? tk.emeraldSoft : tk.inset,
                        color: h.present ? tk.emerald : tk.muted,
                        border: `1px solid ${h.present ? tk.emeraldBorder : tk.border}`,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mb: 1, lineHeight: 1.45 }}>
                    {h.description}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.ink, overflowWrap: 'anywhere' }}>
                    bin: <strong>{h.binary}</strong> · path: {h.location || '—'}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, mt: 0.35, overflowWrap: 'anywhere' }}>
                    config: {h.configPath}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ================================================================= */}
      {/* TAB 1: MCP & LOOPBACK BRIDGES                                     */}
      {/* ================================================================= */}
      {activeTab === 1 && (
        <Box>
          {/* SSRF-Guarded Custom Loopback Prober */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 2.5,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Typography
              component="h3"
              sx={{
                fontFamily: MONO,
                fontSize: '0.84rem',
                fontWeight: 800,
                color: tk.gold,
                mb: 0.75,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              SSRF-Guarded Loopback Prober (127.0.0.1 · Ports 1024–65535)
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mb: 2 }}>
              Sends a bounded (&le; 1200ms) health check via <code>POST /api/studio/connectors/probe</code> strictly to <code>127.0.0.1</code>. External hosts, RFC1918 LAN IPs, IMDS, and privileged ports &lt; 1024 are rejected with HTTP 400.
            </Typography>

            <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid xs={12} sm={4} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Loopback Port (1024-65535)"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  inputProps={{ 'aria-label': 'Loopback port number', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
                  InputProps={{ sx: { fontFamily: MONO, fontSize: '0.84rem', minHeight: 44 } }}
                />
              </Grid>
              <Grid xs={12} sm={5} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Health Path"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  inputProps={{ 'aria-label': 'Loopback HTTP health path', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
                  InputProps={{ sx: { fontFamily: MONO, fontSize: '0.84rem', minHeight: 44 } }}
                />
              </Grid>
              <Grid xs={12} sm={3} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={customProbing}
                  onClick={() => handleCustomProbe()}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    bgcolor: tk.goldBtnBg,
                    color: tk.goldBtnInk,
                    '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
                  }}
                >
                  {customProbing ? 'Probing 127.0.0.1…' : 'Probe 127.0.0.1'}
                </Button>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: customProbeResult ? 2 : 0 }}>
              {[
                { label: ':18000 Proxy', port: 18000, path: '/health' },
                { label: ':11434 Ollama', port: 11434, path: '/api/tags' },
                { label: ':8094 Memory', port: 8094, path: '/api/health' },
                { label: ':8102 Bridge', port: 8102, path: '/api/health' },
                { label: ':8787 Vault', port: 8787, path: '/health' },
                { label: ':8161 Chronicle', port: 8161, path: '/health' },
                { label: ':8136 Azoth', port: 8136, path: '/api/health' },
                { label: ':8109 MCP Lens', port: 8109, path: '/health' },
              ].map((preset) => (
                <Button
                  key={preset.port}
                  size="small"
                  variant="outlined"
                  onClick={() => handleCustomProbe(preset.port, preset.path)}
                  sx={{
                    minHeight: 44,
                    px: 1.4,
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.ink,
                    borderColor: tk.border,
                    '&:hover': { bgcolor: tk.inset, borderColor: tk.gold },
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>

            {customProbeResult && (
              <Alert
                severity={customProbeResult.ok ? (customProbeResult.data?.online ? 'success' : 'info') : 'error'}
                sx={{ fontFamily: MONO, fontSize: '0.78rem' }}
              >
                {customProbeResult.ok
                  ? `127.0.0.1:${customProbeResult.data.port}${customProbeResult.data.path} → ${customProbeResult.data.online ? 'ONLINE' : 'OFFLINE'} | HTTP ${customProbeResult.data.statusCode ?? 0} | RTT: ${customProbeResult.data.latencyMs !== null && customProbeResult.data.latencyMs !== undefined ? `${customProbeResult.data.latencyMs}ms` : '—'} | ${customProbeResult.data.summary || 'ok'}`
                  : customProbeResult.error}
              </Alert>
            )}
          </Paper>

          {/* Filter Input for Bridges & MCP Servers */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Filter bridges & local MCP servers"
              placeholder="Search memory, 8102, azoth, fieldkit, stdio..."
              value={mcpQuery}
              onChange={(e) => setMcpQuery(e.target.value)}
              inputProps={{ 'aria-label': 'Filter core bridges and local MCP servers', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: tk.muted }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: MONO, fontSize: '0.82rem', minHeight: 44, bgcolor: tk.card },
              }}
            />
          </Box>

          {/* Core Zoth Loopback Daemons & Bridges */}
          <Typography
            component="h3"
            sx={{
              fontFamily: MONO,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 1.5,
            }}
          >
            Core Zoth Loopback Daemons &amp; Bridges ({filteredBridges.length})
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {filteredBridges.map((bridge) => (
              <Grid xs={12} sm={6} md={4} key={bridge.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: tk.card,
                    border: `1px solid ${bridge.online ? tk.emeraldBorder : tk.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.25,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.96rem', color: tk.ink }}>
                        {bridge.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={bridge.online ? 'ONLINE' : (bridge.status === 'unprobed' ? 'UNPROBED' : 'OFFLINE')}
                        sx={{
                          fontFamily: MONO,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: bridge.online ? tk.emeraldSoft : tk.inset,
                          color: bridge.online ? tk.emerald : tk.muted,
                          border: `1px solid ${bridge.online ? tk.emeraldBorder : tk.border}`,
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.sky, fontWeight: 700, mb: 0.75 }}>
                      {bridge.port ? `127.0.0.1:${bridge.port}` : 'stdio'} · {bridge.transport}
                      {bridge.latencyMs !== null && bridge.latencyMs !== undefined ? ` · ${bridge.latencyMs}ms` : ''}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: tk.muted, lineHeight: 1.45 }}>
                      {bridge.description}
                    </Typography>
                  </Box>

                  {bridge.port && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={probingId === bridge.id}
                      onClick={() => handleSingleConnectorProbe(bridge)}
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        minHeight: 44,
                        alignSelf: 'flex-start',
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: tk.gold,
                        borderColor: tk.goldBorder,
                        '&:hover': { bgcolor: tk.goldSoft },
                      }}
                    >
                      {probingId === bridge.id ? 'Probing…' : `Probe :${bridge.port}`}
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Discovered Local MCP Servers (Secret-Redacted) */}
          <Typography
            component="h3"
            sx={{
              fontFamily: MONO,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 1.5,
            }}
          >
            Discovered Local MCP Servers — Secret &amp; Home-Path Sanitized ({filteredMcpServers.length})
          </Typography>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              overflow: 'hidden',
            }}
          >
            {filteredMcpServers.length === 0 ? (
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.86rem', color: tk.muted }}>
                  {isLive
                    ? 'No local MCP server definitions matched the active filter.'
                    : 'Local MCP server discovery runs strictly over 127.0.0.1:3000. Open Config & .env Forge to generate sanitized MCP configs offline.'}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Mobile stacked card view (<= 600px) — prevents horizontal clipping of source & tool counts */}
                <Stack
                  spacing={1.25}
                  sx={{
                    display: { xs: 'flex', sm: 'none' },
                    p: 1.5,
                  }}
                >
                  {filteredMcpServers.map((srv) => (
                    <Box
                      key={srv.id || srv.name}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: tk.inset,
                        border: `1px solid ${tk.border}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 800, color: tk.ink, wordBreak: 'break-word' }}>
                          {srv.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={srv.transport}
                          sx={{
                            height: 22,
                            fontFamily: MONO,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: tk.card,
                            color: tk.sky,
                            border: `1px solid ${tk.border}`,
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.muted, wordBreak: 'break-all', mb: 0.6 }}>
                        {srv.source}
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.emerald, fontWeight: 700, wordBreak: 'break-word' }}>
                        {srv.toolCount !== null && srv.toolCount !== undefined ? `${srv.toolCount} tools · ` : ''}
                        {srv.redactedKeysCount ? `${srv.redactedKeysCount} keys → \${ENV_VAR}` : 'sanitized ~/'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Tablet & desktop structured table (>= 600px) */}
                <TableContainer sx={{ display: { xs: 'none', sm: 'block' }, maxHeight: 380 }}>
                  <Table size="small" stickyHeader aria-label="Discovered local MCP servers">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.74rem', bgcolor: tk.inset, color: tk.ink }}>SERVER</TableCell>
                        <TableCell sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.74rem', bgcolor: tk.inset, color: tk.ink }}>TRANSPORT</TableCell>
                        <TableCell sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.74rem', bgcolor: tk.inset, color: tk.ink }}>SOURCE</TableCell>
                        <TableCell sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.74rem', bgcolor: tk.inset, color: tk.ink }}>TOOLS / REDACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMcpServers.map((srv) => (
                        <TableRow key={srv.id || srv.name}>
                          <TableCell sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: tk.ink }}>
                            {srv.name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.sky, fontWeight: 700 }}>
                            {srv.transport}
                          </TableCell>
                          <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, wordBreak: 'break-word' }}>
                            {srv.source}
                          </TableCell>
                          <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.emerald, fontWeight: 700 }}>
                            {srv.toolCount !== null && srv.toolCount !== undefined ? `${srv.toolCount} tools · ` : ''}
                            {srv.redactedKeysCount ? `${srv.redactedKeysCount} keys → \${ENV_VAR}` : 'sanitized ~/'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Box>
      )}

      {/* ================================================================= */}
      {/* TAB 2: CONFIG & .ENV FORGE                                        */}
      {/* ================================================================= */}
      {activeTab === 2 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
                height: '100%',
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: tk.gold,
                  mb: 1,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                1. Select Connectors &amp; Model Target
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mb: 2 }}>
                All generated files use <code>{'${ENV_VAR}'}</code> placeholders and loopback URLs — zero plaintext API keys are stored or emitted.
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Default Model Identifier"
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                inputProps={{ 'aria-label': 'Default model identifier for generated configs', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
                InputProps={{ sx: { fontFamily: MONO, fontSize: '0.82rem', minHeight: 44 } }}
                sx={{ mb: 2 }}
              />

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.ink, mb: 0.75 }}>
                AI PROVIDERS
              </Typography>
              <Stack spacing={0.25} sx={{ mb: 2 }}>
                {AI_PROVIDER_CONNECTORS.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    control={
                      <Checkbox
                        checked={selectedConfigIds.includes(p.id)}
                        onChange={() => toggleConfigId(p.id)}
                        sx={{ color: tk.gold, '&.Mui-checked': { color: tk.gold }, minWidth: 44, minHeight: 44 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.ink }}>
                        {p.name} (:{p.port})
                      </Typography>
                    }
                  />
                ))}
              </Stack>

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.ink, mb: 0.75 }}>
                MCP &amp; LOOPBACK BRIDGES
              </Typography>
              <Stack spacing={0.25}>
                {ZOTH_BRIDGE_CONNECTORS.map((b) => (
                  <FormControlLabel
                    key={b.id}
                    control={
                      <Checkbox
                        checked={selectedConfigIds.includes(b.id)}
                        onChange={() => toggleConfigId(b.id)}
                        sx={{ color: tk.gold, '&.Mui-checked': { color: tk.gold }, minWidth: 44, minHeight: 44 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.ink }}>
                        {b.name} ({b.port ? `:${b.port}` : 'stdio'})
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: tk.gold,
                  mb: 1.5,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                2. Real-Time Sanitized Config Output
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {[
                  { id: 'mcp-json', label: 'MCP mcpServers JSON' },
                  { id: 'env', label: 'OpenAI-Compat .env' },
                  { id: 'hermes-yaml', label: 'Hermes config.yaml' },
                  { id: 'codex-toml', label: 'Codex config.toml' },
                ].map((fmt) => {
                  const active = configFormat === fmt.id;
                  return (
                    <Button
                      key={fmt.id}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setConfigFormat(fmt.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? tk.goldBtnBg : 'transparent',
                        color: active ? tk.goldBtnInk : tk.ink,
                        borderColor: active ? tk.goldBtnBg : tk.border,
                        '&:hover': {
                          bgcolor: active ? (isDark ? '#E5C65C' : '#5E4305') : tk.inset,
                        },
                      }}
                    >
                      {fmt.label}
                    </Button>
                  );
                })}
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  mb: 2,
                  p: 2,
                  flexGrow: 1,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.codeInk,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.76rem',
                  lineHeight: 1.55,
                  overflow: 'auto',
                  maxHeight: 420,
                  whiteSpace: 'pre',
                }}
              >
                {generatedConfig}
              </Box>

              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  onClick={() => copyWithFeedback(generatedConfig, `cfg-${configFormat}`)}
                  startIcon={copiedKey === `cfg-${configFormat}` ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: tk.goldBtnBg,
                    color: tk.goldBtnInk,
                    '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
                  }}
                >
                  {copiedKey === `cfg-${configFormat}` ? 'Copied Config' : 'Copy Config'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => downloadTextFile(configFilename, generatedConfig, 'text/plain;charset=utf-8')}
                  startIcon={<DownloadIcon />}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.ink,
                    borderColor: tk.border,
                    '&:hover': { bgcolor: tk.inset, borderColor: tk.gold },
                  }}
                >
                  Download {configFilename}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ================================================================= */}
      {/* TAB 3: DIAGNOSTIC EXPORT & OFFLINE INSPECTOR                      */}
      {/* ================================================================= */}
      {activeTab === 3 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
                height: '100%',
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: tk.gold,
                  mb: 1,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Offline Inspector &amp; Security Guarantees
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink }}>
                    RUNTIME MODE
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: isLive ? tk.emerald : tk.amber, fontWeight: 700, mt: 0.25 }}>
                    {isLive ? 'loopback-live (127.0.0.1:3000)' : 'browser-fallback (honest offline)'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink }}>
                    ZERO PLAINTEXT SECRETS
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: tk.muted, mt: 0.25 }}>
                    Zero API keys in <code>localStorage</code>, DOM, or API responses. All exports scrub secret shapes and emit <code>{'${ENV_VAR}'}</code>.
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink }}>
                    PATH &amp; CSV HARDENING
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: tk.muted, mt: 0.25 }}>
                    All literal user home directories are rewritten to <code>~/</code>, and CSV cells neutralize leading <code>= + - @ \t \r</code> formula prefixes.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: tk.gold,
                  mb: 1.5,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Sanitized Diagnostic Export Preview
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {[
                  { id: 'json', label: 'Sanitized JSON' },
                  { id: 'markdown', label: 'Markdown Brief' },
                  { id: 'csv', label: 'Formula-Safe CSV' },
                ].map((fmt) => {
                  const active = exportFormat === fmt.id;
                  return (
                    <Button
                      key={fmt.id}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setExportFormat(fmt.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.75,
                        fontFamily: MONO,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? tk.goldBtnBg : 'transparent',
                        color: active ? tk.goldBtnInk : tk.ink,
                        borderColor: active ? tk.goldBtnBg : tk.border,
                        '&:hover': {
                          bgcolor: active ? (isDark ? '#E5C65C' : '#5E4305') : tk.inset,
                        },
                      }}
                    >
                      {fmt.label}
                    </Button>
                  );
                })}
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  mb: 2,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.codeInk,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  lineHeight: 1.55,
                  overflow: 'auto',
                  maxHeight: 360,
                  whiteSpace: 'pre',
                }}
              >
                {exportContent}
              </Box>

              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  onClick={() => copyWithFeedback(exportContent, `exp-${exportFormat}`)}
                  startIcon={copiedKey === `exp-${exportFormat}` ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: tk.goldBtnBg,
                    color: tk.goldBtnInk,
                    '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
                  }}
                >
                  {copiedKey === `exp-${exportFormat}` ? 'Copied Report' : 'Copy Report'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDownloadExport}
                  startIcon={<DownloadIcon />}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.ink,
                    borderColor: tk.border,
                    '&:hover': { bgcolor: tk.inset, borderColor: tk.gold },
                  }}
                >
                  Download {exportFormat.toUpperCase()}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
