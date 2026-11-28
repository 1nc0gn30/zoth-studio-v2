import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  IconButton, Alert, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';
import CompressIcon from '@mui/icons-material/Compress';
import StorageIcon from '@mui/icons-material/Storage';
import LanIcon from '@mui/icons-material/Lan';
import RefreshIcon from '@mui/icons-material/Refresh';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import { SovereignJsonTree } from '../sovereign/SovereignWidgets.jsx';
import {
  MCP_LENS_LOCAL_BASE,
  PRESET_SCHEMAS,
  INITIAL_FRAMES,
  minifySchemaDocument,
  buildDeterministicReplayFrame,
  formatLiveBridgeFrame,
} from '../../utils/mcpLensEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function McpLensGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const seqRef = useRef(INITIAL_FRAMES.length + 1);

  const [activeTab, setActiveTab] = useState(0);

  // Sniffer State
  const [frames, setFrames] = useState(INITIAL_FRAMES);
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrame, setSelectedFrame] = useState(INITIAL_FRAMES[1]);
  const [simMethod, setSimMethod] = useState('tools/call');
  const [simParams, setSimParams] = useState('{\n  "name": "sqlite_query_records",\n  "arguments": {\n    "database_path": "~/data/sovereign.db",\n    "query": "SELECT id, name FROM items LIMIT 3;"\n  }\n}');

  // Live :8109 Daemon Bridge State
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonStats, setDaemonStats] = useState(null);
  const [liveTools, setLiveTools] = useState([]);

  // Token Auditor State
  const [schemaText, setSchemaText] = useState(PRESET_SCHEMAS['standard-tools']);
  const [minifiedSchema, setMinifiedSchema] = useState('');
  const [tokenStats, setTokenStats] = useState({ rawTokens: 0, minTokens: 0, savedPercent: 0 });
  const [schemaError, setSchemaError] = useState('');
  const [simError, setSimError] = useState('');

  const [copiedKey, setCopiedKey] = useState('');
  const [liveConnectors, setLiveConnectors] = useState(null);

  const goldColor = isDark ? '#D4AF37' : '#7A5808';
  const emeraldColor = isDark ? '#34D399' : '#047857';
  const skyColor = isDark ? '#38BDF8' : '#0369A1';
  const crimsonColor = isDark ? '#FB7185' : '#B91C1C';
  const goldBtnBg = isDark ? '#D4AF37' : '#7A5808';
  const goldBtnInk = isDark ? '#08080B' : '#FFFFFF';

  const syncLiveDaemon = useCallback(async () => {
    try {
      const healthRes = await fetch(`${MCP_LENS_LOCAL_BASE}/api/health`);
      if (!healthRes.ok) {
        setDaemonOnline(false);
        return;
      }
      const [statsRes, trafficRes, toolsRes] = await Promise.all([
        fetch(`${MCP_LENS_LOCAL_BASE}/api/stats`),
        fetch(`${MCP_LENS_LOCAL_BASE}/api/traffic?limit=50`),
        fetch(`${MCP_LENS_LOCAL_BASE}/api/tools`),
      ]);
      setDaemonOnline(true);
      if (statsRes.ok) setDaemonStats(await statsRes.json());
      if (trafficRes.ok) {
        const tData = await trafficRes.json();
        if (Array.isArray(tData.frames) && tData.frames.length > 0) {
          const mapped = tData.frames.slice().reverse().map(formatLiveBridgeFrame);
          setFrames(mapped);
          setSelectedFrame((prev) => prev || mapped[0]);
        }
      }
      if (toolsRes.ok) {
        const tlData = await toolsRes.json();
        if (Array.isArray(tlData.tools)) setLiveTools(tlData.tools);
      }
    } catch (_err) {
      setDaemonOnline(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/studio/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.services) setLiveConnectors(data.services);
      })
      .catch(() => {});

    syncLiveDaemon();
    return () => { active = false; };
  }, [syncLiveDaemon]);

  const handleMinifySchema = useCallback(async () => {
    try {
      const localRes = minifySchemaDocument(schemaText);
      setMinifiedSchema(localRes.minifiedText);
      setTokenStats({
        rawTokens: localRes.rawTokens,
        minTokens: localRes.minTokens,
        savedPercent: localRes.savedPercent,
      });
      setSchemaError('');

      if (daemonOnline) {
        try {
          const parsed = JSON.parse(schemaText);
          const singleTool = Array.isArray(parsed?.tools) && parsed.tools.length === 1 ? parsed.tools[0] : (!Array.isArray(parsed?.tools) ? parsed : null);
          if (singleTool && typeof singleTool === 'object' && !Array.isArray(singleTool)) {
            const resp = await fetch(`${MCP_LENS_LOCAL_BASE}/api/minify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tool: singleTool }),
            });
            if (resp.ok) {
              const apiData = await resp.json();
              setMinifiedSchema(JSON.stringify(apiData.minified_schema));
              setTokenStats({
                rawTokens: apiData.original_tokens,
                minTokens: apiData.minified_tokens,
                savedPercent: Math.round(apiData.savings_percent || 0),
              });
            }
          }
        } catch (_err) {}
      }
    } catch (e) {
      setSchemaError('Invalid JSON Schema: ' + e.message);
    }
  }, [schemaText, daemonOnline]);

  useEffect(() => {
    handleMinifySchema();
  }, [handleMinifySchema]);

  const handleInjectFrame = async () => {
    let parsedParams = {};
    try {
      parsedParams = JSON.parse(simParams);
      setSimError('');
    } catch (e) {
      setSimError('Params must be valid JSON: ' + e.message);
      return;
    }

    if (daemonOnline && simMethod === 'tools/call') {
      try {
        const res = await fetch(`${MCP_LENS_LOCAL_BASE}/api/replay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_name: parsedParams.name || 'sqlite_query_records',
            arguments: parsedParams.arguments || {},
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const newFrame = buildDeterministicReplayFrame({
            sequenceNumber: seqRef.current++,
            method: simMethod,
            params: parsedParams,
            source: '127.0.0.1:8109 /api/replay',
            response: data.response,
          });
          setFrames((prev) => [newFrame, ...prev]);
          setSelectedFrame(newFrame);
          syncLiveDaemon();
          return;
        }
      } catch (_err) {}
    }

    const newFrame = buildDeterministicReplayFrame({
      sequenceNumber: seqRef.current++,
      method: simMethod,
      params: parsedParams,
    });
    setFrames((prev) => [newFrame, ...prev]);
    setSelectedFrame(newFrame);
  };

  const filteredFrames = useMemo(() => {
    return frames.filter((f) => {
      const matchMethod = methodFilter === 'ALL' || f.method.startsWith(methodFilter);
      const matchQuery = !searchQuery ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(f.params).toLowerCase().includes(searchQuery.toLowerCase());
      return matchMethod && matchQuery;
    });
  }, [frames, methodFilter, searchQuery]);

  const copyToClipboard = (text, key = 'default') => {
    navigator.clipboard?.writeText(text)?.catch?.(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? '' : prev)), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(frames, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-traffic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mcpConfigRecipe = `{
  "mcpServers": {
    "mcp-lens": {
      "command": "mcp-lens",
      "args": ["mcp"]
    }
  }
}`;

  const proxyCliRecipe = `# Start hardened loopback cockpit on 127.0.0.1:8109
mcp-lens serve --port 8109

# Wrap any child MCP server transparently
mcp-lens proxy --port 8109 -- npx -y @modelcontextprotocol/server-filesystem /tmp

# Run native 6-tool stdio JSON-RPC 2.0 MCP server
mcp-lens mcp`;

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      {/* 1. Open-Access Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(20,20,25,0.95) 100%)'
            : 'linear-gradient(135deg, #FEF7E0 0%, #FFFFFF 100%)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.45)' : 'rgba(122,88,8,0.35)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Chip
              label={
                <Box component="span" sx={{ color: isDark ? '#050508 !important' : '#FFFFFF !important', fontWeight: 800 }}>
                  ✦ 100% FREE &amp; OPEN ACCESS
                </Box>
              }
              size="small"
              sx={{
                bgcolor: isDark ? '#34D399' : '#047857',
                color: isDark ? '#050508 !important' : '#FFFFFF !important',
                '& .MuiChip-label': {
                  color: isDark ? '#050508 !important' : '#FFFFFF !important',
                  fontWeight: 800,
                },
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: mono,
              }}
            />
            <Chip
              label={daemonOnline
                ? `● LIVE :8109 BRIDGE (${daemonStats?.total_frames ?? frames.length} FRAMES · ${daemonStats?.discovered_tools_count ?? liveTools.length} TOOLS)`
                : '○ OFFLINE ENGINE (IN-BROWSER DETERMINISTIC)'}
              size="small"
              variant="outlined"
              sx={{
                height: 'auto',
                py: 0.35,
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  color: daemonOnline ? emeraldColor : goldColor,
                  fontWeight: 700,
                },
                fontSize: '0.68rem',
                fontFamily: mono,
                borderColor: daemonOnline ? emeraldColor : (isDark ? 'rgba(212,175,55,0.5)' : '#7A5808'),
              }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={syncLiveDaemon}
              sx={{
                minHeight: 36,
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                color: goldColor,
                borderColor: isDark ? 'rgba(212,175,55,0.45)' : 'rgba(122,88,8,0.4)',
              }}
            >
              Sync :8109
            </Button>
          </Stack>
          <Typography
            component="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              letterSpacing: -0.3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: 1,
              overflowWrap: 'anywhere',
            }}
          >
            <span>MCP Lens v2.6.0 Workstation Deck</span>
            <Typography component="span" sx={{ fontSize: '0.84rem', color: 'text.secondary', fontWeight: 500 }}>
              (Model Context Protocol JSON-RPC Sniffer, Token Optimizer &amp; 6-Tool Stdio MCP Server)
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Inspect live loopback <code>:8109</code> frames, replay <code>tools/call</code> payloads, and minify tool JSON schemas with deterministic BPE token accounting.
          </Typography>
        </Box>
      </Paper>

      {/* Live Loopback Connectors Strip */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(14,16,23,0.92)' : '#FFFFFF',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,24,40,0.12)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.4, fontFamily: mono, color: isDark ? '#F5F5F7' : '#101828' }}>
            LIVE LOOPBACK CONNECTORS &amp; MODEL GATEWAYS
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
            Source: /api/studio/status + 127.0.0.1:8109
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1.2}>
          {[
            {
              id: 'mcp-lens',
              label: `MCP Lens (:8109)${daemonOnline ? ` · v${daemonStats?.version || '2.6.0'}` : ' · Idle'}`,
              up: daemonOnline,
              href: MCP_LENS_LOCAL_BASE,
            },
            {
              id: 'agy-hermes-proxy',
              label: `AGY-Hermes (:18000)${liveConnectors?.['agy-hermes-proxy']?.modelsCount ? ` · ${liveConnectors['agy-hermes-proxy'].modelsCount} models` : ''}`,
              up: Boolean(liveConnectors?.['agy-hermes-proxy']?.up),
              href: 'http://127.0.0.1:18000/',
            },
            {
              id: 'ollama',
              label: `Ollama (:11434)${liveConnectors?.ollama?.models?.length ? ` · ${liveConnectors.ollama.models.length} models` : ''}`,
              up: Boolean(liveConnectors?.ollama?.up),
            },
            {
              id: 'memory',
              label: `Neuro-Memory (:${liveConnectors?.memory?.port || 8094})`,
              up: Boolean(liveConnectors?.memory?.up),
            },
            {
              id: 'bridge',
              label: `Sovereign Bridge (:${liveConnectors?.bridge?.port || 8102})`,
              up: Boolean(liveConnectors?.bridge?.up),
            },
          ].map((item) => (
            <Chip
              key={item.id}
              component={item.href ? 'a' : 'div'}
              href={item.href}
              target={item.href ? '_blank' : undefined}
              rel={item.href ? 'noopener noreferrer' : undefined}
              clickable={Boolean(item.href)}
              label={`${item.up ? '●' : '○'} ${item.label}`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.74rem',
                height: 'auto',
                minHeight: 34,
                py: 0.4,
                px: 0.6,
                maxWidth: '100%',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  color: item.up
                    ? (isDark ? '#34D399' : '#047857')
                    : (isDark ? '#CBD5E1' : '#334155'),
                },
                bgcolor: item.up
                  ? (isDark ? 'rgba(52,211,153,0.14)' : 'rgba(4,120,87,0.10)')
                  : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.06)'),
                border: '1px solid',
                borderColor: item.up
                  ? (isDark ? 'rgba(52,211,153,0.35)' : 'rgba(4,120,87,0.32)')
                  : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(16,24,40,0.16)'),
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<LanIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="JSON-RPC Waterfall Sniffer" />
          <Tab icon={<CompressIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Token Weight Auditor & Minifier" />
          <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="CLI & Stdio MCP Recipes" />
        </Tabs>
      </Paper>

      {/* TAB 0: JSON-RPC WATERFALL SNIFFER */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <FilterListIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 700 }}>Filter:</Typography>
                {['ALL', 'tools', 'resources', 'initialize'].map((m) => {
                  const active = methodFilter === m;
                  return (
                    <Chip
                      key={m}
                      label={
                        <Box component="span" sx={{ color: active ? `${goldBtnInk} !important` : (isDark ? '#E2E8F0 !important' : '#101828 !important'), fontWeight: 700 }}>
                          {m}
                        </Box>
                      }
                      size="small"
                      onClick={() => setMethodFilter(m)}
                      sx={{
                        minHeight: { xs: 44, sm: 34 },
                        fontFamily: mono,
                        fontWeight: 700,
                        cursor: 'pointer',
                        bgcolor: active ? goldBtnBg : 'transparent',
                        color: active ? `${goldBtnInk} !important` : (isDark ? '#E2E8F0 !important' : '#101828 !important'),
                        '& .MuiChip-label': {
                          color: active ? `${goldBtnInk} !important` : (isDark ? '#E2E8F0 !important' : '#101828 !important'),
                          fontWeight: 700,
                        },
                        border: '1px solid',
                        borderColor: active ? goldBtnBg : 'divider',
                      }}
                    />
                  );
                })}
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  size="small"
                  label="Search frames"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  inputProps={{ 'aria-label': 'Search JSON-RPC frames' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { fontFamily: mono, fontSize: '0.8rem', minHeight: 44 },
                  }}
                  sx={{ width: { xs: '100%', sm: 220 } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportJson}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, textTransform: 'none' }}
                >
                  Export JSON
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} lg={7}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 520 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>TIME</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>METHOD</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>STATUS</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>LATENCY</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>SIZE</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}>TOKENS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFrames.map((frame) => {
                      const isSelected = selectedFrame?.id === frame.id;
                      return (
                        <TableRow
                          key={frame.id}
                          hover
                          onClick={() => setSelectedFrame(frame)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.12)' : 'rgba(122,88,8,0.10)') : 'inherit',
                          }}
                        >
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: 'text.secondary' }}>{frame.timestamp}</TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 700, color: skyColor }}>{frame.method}</TableCell>
                          <TableCell>
                            <Chip
                              label={frame.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontFamily: mono,
                                fontWeight: 800,
                                bgcolor: frame.status.includes('200')
                                  ? (isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF5')
                                  : (isDark ? 'rgba(251,113,133,0.16)' : '#FEF2F2'),
                                '& .MuiChip-label': {
                                  color: frame.status.includes('200') ? emeraldColor : crimsonColor,
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{frame.durationMs}ms</TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{frame.bytes} B</TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700 }}>~{frame.tokens} tok</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Replay / Frame Dispatcher */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mt: 3,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon sx={{ fontSize: 18, color: goldColor }} />
                {daemonOnline ? 'Dispatch Live Frame via :8109 /api/replay' : 'Validate & Replay JSON-RPC Frame'}
              </Typography>
              <SovereignEyebrow accent={goldColor} right="Simulation & Testing">
                {'mcp-lens'}
              </SovereignEyebrow>
              {isDark && (
                <SovereignBand
                  seed="mcp-lens"
                  eyebrow="Simulation & Testing"
                  caption="MCP Lens"
                  label="MCP Lens — Zoth sovereign visualisation"
                />
              )}
              {simError && (
                <Alert severity="error" sx={{ mb: 1.5, fontFamily: mono, fontSize: '0.76rem' }}>
                  {simError}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontFamily: mono, fontSize: '0.8rem' }}>Method</InputLabel>
                    <Select
                      value={simMethod}
                      label="Method"
                      onChange={(e) => setSimMethod(e.target.value)}
                      sx={{ fontFamily: mono, fontSize: '0.8rem', minHeight: 44 }}
                    >
                      <MenuItem value="tools/call">tools/call</MenuItem>
                      <MenuItem value="tools/list">tools/list</MenuItem>
                      <MenuItem value="resources/read">resources/read</MenuItem>
                      <MenuItem value="prompts/get">prompts/get</MenuItem>
                      <MenuItem value="ping">ping</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={8}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleInjectFrame}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      minHeight: 44,
                      bgcolor: goldBtnBg,
                      color: goldBtnInk,
                      fontWeight: 800,
                      fontFamily: mono,
                      '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#5E4305' },
                    }}
                  >
                    {daemonOnline ? 'Replay via :8109' : 'Dispatch Deterministic Frame'}
                  </Button>
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Params (JSON)"
                    value={simParams}
                    onChange={(e) => setSimParams(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? '#0D0D11' : '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', color: goldColor }}>
                  {selectedFrame ? `Frame Inspector: ${selectedFrame.id}` : 'Select a Frame'}
                </Typography>
                {selectedFrame && (
                  <IconButton
                    size="small"
                    aria-label="Copy selected frame JSON"
                    onClick={() => copyToClipboard(JSON.stringify(selectedFrame, null, 2), 'frame')}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    {copiedKey === 'frame' ? <CheckIcon sx={{ fontSize: 16, color: emeraldColor }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                )}
              </Stack>

              {selectedFrame ? (
                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <SovereignJsonTree
                    data={selectedFrame.params}
                    title={`REQUEST PARAMS (${selectedFrame.method})`}
                    accent="#38BDF8"
                    initialDepth={2}
                    maxHeight={240}
                  />
                  <SovereignJsonTree
                    data={selectedFrame.result}
                    title={`RESPONSE PAYLOAD (${selectedFrame.status})`}
                    accent="#10B981"
                    initialDepth={2}
                    maxHeight={260}
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                  <Typography sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.85rem' }}>
                    Click any frame on the left to inspect raw JSON-RPC payload.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: BPE TOKEN WEIGHT AUDITOR & MINIFIER */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>RAW SCHEMA TOKENS</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: crimsonColor }}>
                    {tokenStats.rawTokens}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>MINIFIED TOKENS</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: emeraldColor }}>
                    {tokenStats.minTokens}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>TOKEN OVERHEAD SAVED</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: goldColor }}>
                    {tokenStats.savedPercent}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem' }}>
                  Raw MCP Tool Schema (JSON)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setSchemaText(PRESET_SCHEMAS['standard-tools'])} sx={{ minHeight: 36, fontFamily: mono, fontSize: '0.72rem' }}>
                    Tools Preset
                  </Button>
                  <Button size="small" onClick={() => setSchemaText(PRESET_SCHEMAS['ghidra-bridge'])} sx={{ minHeight: 36, fontFamily: mono, fontSize: '0.72rem' }}>
                    Ghidra Preset
                  </Button>
                </Stack>
              </Stack>
              {schemaError && (
                <Alert severity="error" sx={{ mb: 1.5, fontFamily: mono, fontSize: '0.76rem' }}>
                  {schemaError}
                </Alert>
              )}
              <TextField
                fullWidth
                multiline
                rows={14}
                label="Raw MCP Tool Schema JSON"
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                inputProps={{ 'aria-label': 'Raw MCP Tool Schema JSON' }}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.75rem' } }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleMinifySchema}
                startIcon={<CompressIcon />}
                sx={{
                  mt: 2,
                  minHeight: 44,
                  bgcolor: goldBtnBg,
                  color: goldBtnInk,
                  fontWeight: 800,
                  fontFamily: mono,
                  '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#5E4305' },
                }}
              >
                Run Token Minifier &amp; Optimizer
              </Button>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? '#0D0D11' : '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem', color: emeraldColor }}>
                  Optimized Zero-Bloat MCP Output
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Copy minified MCP schema"
                  onClick={() => copyToClipboard(minifiedSchema, 'minified')}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  {copiedKey === 'minified' ? <CheckIcon sx={{ fontSize: 16, color: emeraldColor }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Stack>

              <Box
                sx={{
                  flexGrow: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: isDark ? '#050508' : '#F4F1EA',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  overflowY: 'auto',
                  maxHeight: 380,
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {minifiedSchema || '// Click "Run Token Minifier" to optimize'}
                </pre>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: CLI & STDIO MCP RECIPES */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', color: skyColor }}>
                  Antigravity / Claude Desktop Stdio MCP Entry (6 Tools)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedKey === 'recipe-mcp' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyToClipboard(mcpConfigRecipe, 'recipe-mcp')}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none' }}
                >
                  {copiedKey === 'recipe-mcp' ? 'Copied' : 'Copy JSON'}
                </Button>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Register the native stdio JSON-RPC 2.0 MCP server (<code>mcp-lens mcp</code>) exposing <code>mcp_audit_schema_tokens</code>, <code>mcp_minify_schema</code>, <code>mcp_parse_frame</code>, <code>mcp_get_traffic</code>, <code>mcp_replay_tool</code>, and <code>mcp_diagnostics</code>:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: isDark ? '#050508' : '#F4F1EA', border: '1px solid', borderColor: 'divider', fontFamily: mono, fontSize: '0.78rem' }}>
                <pre style={{ margin: 0, overflowX: 'auto' }}>{mcpConfigRecipe}</pre>
              </Paper>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', color: goldColor }}>
                  Loopback Cockpit &amp; Transparent Stdio Proxy CLI
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedKey === 'recipe-cli' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyToClipboard(proxyCliRecipe, 'recipe-cli')}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none' }}
                >
                  {copiedKey === 'recipe-cli' ? 'Copied' : 'Copy CLI'}
                </Button>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Verified ZothOS CLI commands (<code>mcp-lens serve</code>, <code>mcp-lens proxy</code>, <code>mcp-lens mcp</code>):
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: isDark ? '#050508' : '#F4F1EA', border: '1px solid', borderColor: 'divider', fontFamily: mono, fontSize: '0.78rem' }}>
                <pre style={{ margin: 0, overflowX: 'auto' }}>{proxyCliRecipe}</pre>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
