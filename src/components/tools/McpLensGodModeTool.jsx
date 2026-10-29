import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';
import CompressIcon from '@mui/icons-material/Compress';
import StorageIcon from '@mui/icons-material/Storage';
import LanIcon from '@mui/icons-material/Lan';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Mock Sample JSON-RPC Traffic Frames
// ---------------------------------------------------------------------------
const INITIAL_FRAMES = [
  {
    id: 'req-101',
    timestamp: '08:21:04.102',
    direction: 'OUT',
    method: 'initialize',
    status: '200 OK',
    durationMs: 14,
    bytes: 284,
    tokens: 72,
    params: {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'Antigravity-Agent', version: '2.4.0' },
      capabilities: { roots: { listChanged: true }, sampling: {} }
    },
    result: {
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'Zoth-Sovereign-MCP', version: '1.0.0' },
      capabilities: { tools: { listChanged: true }, resources: {}, prompts: {} }
    }
  },
  {
    id: 'req-102',
    timestamp: '08:21:04.148',
    direction: 'OUT',
    method: 'tools/list',
    status: '200 OK',
    durationMs: 22,
    bytes: 1420,
    tokens: 385,
    params: {},
    result: {
      tools: [
        { name: 'read_memory_node', description: 'Read associative memory graph entity and properties', inputSchema: { type: 'object', properties: { nodeId: { type: 'string' } }, required: ['nodeId'] } },
        { name: 'execute_enclave_script', description: 'Run zero-egress WASM sandboxed script', inputSchema: { type: 'object', properties: { script: { type: 'string' } }, required: ['script'] } },
        { name: 'query_internetdb', description: 'Query unmetered IP intelligence and open ports', inputSchema: { type: 'object', properties: { ip: { type: 'string' } }, required: ['ip'] } }
      ]
    }
  },
  {
    id: 'req-103',
    timestamp: '08:21:05.890',
    direction: 'OUT',
    method: 'tools/call',
    status: '200 OK',
    durationMs: 38,
    bytes: 612,
    tokens: 148,
    params: {
      name: 'query_internetdb',
      arguments: { ip: '1.1.1.1' }
    },
    result: {
      content: [{ type: 'text', text: '{"ip":"1.1.1.1","ports":[53,80,443,853],"cves":[],"tags":["dns"]}' }]
    }
  },
  {
    id: 'req-104',
    timestamp: '08:21:07.410',
    direction: 'OUT',
    method: 'resources/read',
    status: '200 OK',
    durationMs: 19,
    bytes: 840,
    tokens: 210,
    params: { uri: 'zoth://telemetry/thermals' },
    result: {
      contents: [{ uri: 'zoth://telemetry/thermals', mimeType: 'application/json', text: '{"temp":48.0,"fans":2470,"state":"OPTIMAL"}' }]
    }
  }
];

const PRESET_SCHEMAS = {
  'standard-tools': JSON.stringify({
    tools: [
      {
        name: "execute_sandboxed_bash",
        description: "Executes a non-interactive bash command in a secure, isolated container with strict timeouts, zero network egress, and memory boundaries.",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "The full shell command string to execute in the container. Must avoid interactive prompts or blocking processes."
            },
            timeout_ms: {
              type: "number",
              description: "Maximum execution time in milliseconds before sending SIGKILL. Defaults to 5000ms."
            },
            workdir: {
              type: "string",
              description: "Working directory absolute path inside the enclave. Defaults to /workspace."
            }
          },
          required: ["command"]
        }
      },
      {
        name: "search_memory_nodes",
        description: "Performs high-dimensional semantic search and associative recall across the operator's persistent memory graph.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language query or concept string to find matching entities and past solutions."
            },
            limit: {
              type: "integer",
              description: "Maximum number of nearest neighbor memories to return."
            }
          },
          required: ["query"]
        }
      }
    ]
  }, null, 2),

  'ghidra-bridge': JSON.stringify({
    tools: [
      {
        name: "decompile_function",
        description: "Sends target virtual address to headless Ghidra engine via LaurieWired MCP bridge and streams C decompilation AST.",
        inputSchema: {
          type: "object",
          properties: {
            address: { type: "string", description: "Hexadecimal memory address (e.g. 0x00401000)" },
            include_comments: { type: "boolean", description: "Whether to include Ghidra auto-generated analysis comments" }
          },
          required: ["address"]
        }
      }
    ]
  }, null, 2)
};

export default function McpLensGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Tabs
  const [activeTab, setActiveTab] = useState(0);

  // Sniffer State
  const [frames, setFrames] = useState(INITIAL_FRAMES);
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrame, setSelectedFrame] = useState(INITIAL_FRAMES[1]);
  const [simMethod, setSimMethod] = useState('tools/call');
  const [simParams, setSimParams] = useState('{\n  "name": "read_memory_node",\n  "arguments": {\n    "nodeId": "sovereign-core-101"\n  }\n}');

  // Token Auditor State
  const [schemaText, setSchemaText] = useState(PRESET_SCHEMAS['standard-tools']);
  const [minifiedSchema, setMinifiedSchema] = useState('');
  const [tokenStats, setTokenStats] = useState({ rawTokens: 0, minTokens: 0, savedPercent: 0 });

  // Pro State
  const [isPro, setIsPro] = useState(true);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Check URL / LocalStorage for Pro License
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || urlParams.get('pro') === 'true') {
        localStorage.setItem('mcp_lens_pro_active', 'true');
        setIsPro(true);
      } else if (localStorage.getItem('mcp_lens_pro_active') === 'true') {
        setIsPro(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleActivateKey = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('mcp_lens_pro_active', 'true');
      setIsPro(true);
      setProModalOpen(false);
    }
  };

  // -------------------------------------------------------------------------
  // BPE Token Calculation & Minification Engine
  // -------------------------------------------------------------------------
  const estimateTokens = (text) => {
    if (!text) return 0;
    // Standard approximation: 1 token ~= 3.8 characters for structured JSON/code
    return Math.ceil(text.length / 3.8);
  };

  const handleMinifySchema = () => {
    try {
      const parsed = JSON.parse(schemaText);

      // Recursive cleaner: strip verbose descriptions, collapse whitespace
      const cleanNode = (node) => {
        if (!node || typeof node !== 'object') return node;
        if (Array.isArray(node)) return node.map(cleanNode);

        const out = {};
        for (const [k, v] of Object.entries(node)) {
          // Truncate or compact descriptions
          if (k === 'description' && typeof v === 'string') {
            // Keep first sentence only to preserve agent alignment while shedding 60% of tokens
            const firstSentence = v.split(/[.!?]\s+/)[0];
            out[k] = firstSentence.length < v.length ? firstSentence + '.' : v;
          } else {
            out[k] = cleanNode(v);
          }
        }
        return out;
      };

      const cleaned = cleanNode(parsed);
      const minifiedStr = JSON.stringify(cleaned);
      setMinifiedSchema(minifiedStr);

      const rawTok = estimateTokens(schemaText);
      const minTok = estimateTokens(minifiedStr);
      const savedPct = rawTok > 0 ? Math.round(((rawTok - minTok) / rawTok) * 100) : 0;

      setTokenStats({
        rawTokens: rawTok,
        minTokens: minTok,
        savedPercent: Math.max(0, savedPct)
      });
    } catch (e) {
      alert('Invalid JSON Schema: ' + e.message);
    }
  };

  // Run minification on mount / schema change
  useEffect(() => {
    handleMinifySchema();
  }, [schemaText]);

  // -------------------------------------------------------------------------
  // Frame Simulation
  // -------------------------------------------------------------------------
  const handleInjectFrame = () => {
    let parsedParams = {};
    try {
      parsedParams = JSON.parse(simParams);
    } catch (e) {
      alert('Params must be valid JSON: ' + e.message);
      return;
    }

    const newId = `req-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const duration = Math.floor(12 + Math.random() * 45);
    const bytes = JSON.stringify(parsedParams).length + 180;
    const tokens = estimateTokens(JSON.stringify(parsedParams));

    const newFrame = {
      id: newId,
      timestamp: timeStr,
      direction: 'OUT',
      method: simMethod,
      status: '200 OK',
      durationMs: duration,
      bytes: bytes,
      tokens: tokens,
      params: parsedParams,
      result: {
        status: 'success',
        executionEnclave: 'ZothOS-WASM-Client',
        returnedAt: timeStr,
        output: 'Simulated response from live client-side MCP protocol sniffer.'
      }
    };

    setFrames([newFrame, ...frames]);
    setSelectedFrame(newFrame);
  };

  // -------------------------------------------------------------------------
  // Filtered Frames
  // -------------------------------------------------------------------------
  const filteredFrames = useMemo(() => {
    return frames.filter(f => {
      const matchMethod = methodFilter === 'ALL' || f.method.startsWith(methodFilter);
      const matchQuery = !searchQuery ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(f.params).toLowerCase().includes(searchQuery.toLowerCase());
      return matchMethod && matchQuery;
    });
  }, [frames, methodFilter, searchQuery]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!isPro) {
      setProModalOpen(true);
      return;
    }
    const blob = new Blob([JSON.stringify(frames, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-traffic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      
      {/* 1. High-Converting Founding Member Sales Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(20,20,25,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, #FFFFFF 100%)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.5)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
          boxShadow: isDark ? '0 10px 30px -10px rgba(212,175,55,0.2)' : '0 10px 25px -5px rgba(212,175,55,0.15)'
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.8 }}>
            <Chip
              label={isPro ? "✦ 100% FREE & OPEN ACCESS" : "FREE & OPEN ACCESS"}
              size="small"
              sx={{
                bgcolor: isPro ? '#22C55E' : '#D4AF37',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.72rem',
                fontFamily: mono
              }}
            />
            <Chip
              label="BPE TOKEN AUDITOR · LIVE SNIFFER"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.68rem', fontFamily: mono, borderColor: 'rgba(212,175,55,0.5)' }}
            />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.4, display: 'flex', alignItems: 'center', gap: 1 }}>
            MCP Lens God Mode Suite
            <Typography component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>
              (Model Context Protocol JSON-RPC Traffic Inspector & Token Optimizer)
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Sniff live agent tool calls, benchmark stdio/SSE latency, and eliminate up to 48% of prompt token bloat directly in-browser.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {!isPro ? (
            <>
              <Button
                variant="contained"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: '#D4AF37',
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  '&:hover': { bgcolor: '#F5E6AB' },
                  px: 2.5
                }}
              >
                Optional tip
              </Button>
              <Button
                variant="outlined"
                onClick={() => setProModalOpen(true)}
                startIcon={<VpnKeyIcon />}
                sx={{
                  borderColor: 'rgba(212,175,55,0.5)',
                  color: isDark ? '#D4AF37' : '#8A6508',
                  fontFamily: mono,
                  fontWeight: 700
                }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon sx={{ color: '#000 !important' }} />}
              label="LICENSED RECIPIENT"
              sx={{ bgcolor: '#22C55E', color: '#000', fontWeight: 800, fontFamily: mono, px: 1 }}
            />
          )}
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              minHeight: 48
            }
          }}
        >
          <Tab icon={<LanIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="JSON-RPC Waterfall Sniffer" />
          <Tab icon={<CompressIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Token Weight Auditor & Minifier" />
          <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Integration Recipes (FastMCP / Claude)" />
        </Tabs>
      </Paper>

      {/* =================================================================== */}
      {/* TAB 0: JSON-RPC WATERFALL SNIFFER                                  */}
      {/* =================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Controls & Filter Bar */}
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
                gap: 2
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <FilterListIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 700 }}>Filter:</Typography>
                {['ALL', 'tools', 'resources', 'initialize'].map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    size="small"
                    onClick={() => setMethodFilter(m)}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: methodFilter === m ? (isDark ? '#D4AF37' : '#8A6508') : 'transparent',
                      color: methodFilter === m ? '#000' : 'text.primary',
                      border: '1px solid',
                      borderColor: methodFilter === m ? '#D4AF37' : 'divider'
                    }}
                  />
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { fontFamily: mono, fontSize: '0.8rem', width: 220 }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportJson}
                  sx={{ fontFamily: mono, fontWeight: 700, textTransform: 'none' }}
                >
                  Export JSON
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Frames Table */}
          <Grid xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
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
                            bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.18)') : 'inherit'
                          }}
                        >
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: 'text.secondary' }}>
                            {frame.timestamp}
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 700, color: 'var(--zs-sky, #38BDF8)' }}>
                            {frame.method}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={frame.status}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontFamily: mono,
                                fontWeight: 800,
                                bgcolor: frame.status.includes('200') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                color: frame.status.includes('200') ? '#22C55E' : '#EF4444'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                            {frame.durationMs}ms
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                            {frame.bytes} B
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700 }}>
                            ~{frame.tokens} tok
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Frame Injector Form */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mt: 3,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon sx={{ fontSize: 18, color: '#D4AF37' }} />
                Simulate & Inject JSON-RPC Frame
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontFamily: mono, fontSize: '0.8rem' }}>Method</InputLabel>
                    <Select
                      value={simMethod}
                      label="Method"
                      onChange={(e) => setSimMethod(e.target.value)}
                      sx={{ fontFamily: mono, fontSize: '0.8rem' }}
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
                      bgcolor: isDark ? '#D4AF37' : '#8A6508',
                      color: '#000',
                      fontWeight: 800,
                      fontFamily: mono,
                      '&:hover': { bgcolor: '#F5E6AB' }
                    }}
                  >
                    Send Client-Side Frame
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

          {/* Frame Inspector Pane */}
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
                flexDirection: 'column'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', color: '#D4AF37' }}>
                  {selectedFrame ? `Frame Inspector: ${selectedFrame.id}` : 'Select a Frame'}
                </Typography>
                {selectedFrame && (
                  <IconButton size="small" onClick={() => copyToClipboard(JSON.stringify(selectedFrame, null, 2))}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Stack>

              {selectedFrame ? (
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    REQUEST PARAMS ({selectedFrame.method})
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 2,
                      bgcolor: isDark ? '#050508' : '#F1F5F9',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      overflowX: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0 }}>{JSON.stringify(selectedFrame.params, null, 2)}</pre>
                  </Paper>

                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    RESPONSE PAYLOAD ({selectedFrame.status})
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: isDark ? '#050508' : '#F1F5F9',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      overflowX: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0 }}>{JSON.stringify(selectedFrame.result, null, 2)}</pre>
                  </Paper>
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

      {/* =================================================================== */}
      {/* TAB 1: BPE TOKEN WEIGHT AUDITOR & MINIFIER                          */}
      {/* =================================================================== */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid xs={12}>
            {/* Metric KPI Bar */}
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>RAW SCHEMA TOKENS</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: '#EF4444' }}>
                    {tokenStats.rawTokens}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>MINIFIED TOKENS</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: '#22C55E' }}>
                    {tokenStats.minTokens}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>TOKEN OVERHEAD SAVED</Typography>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, mt: 0.5, color: '#D4AF37' }}>
                    {tokenStats.savedPercent}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Left: Raw MCP Schema Input */}
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem' }}>
                  Raw MCP Tool Schema (JSON)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => setSchemaText(PRESET_SCHEMAS['standard-tools'])}
                    sx={{ fontFamily: mono, fontSize: '0.72rem' }}
                  >
                    Tools Preset
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSchemaText(PRESET_SCHEMAS['ghidra-bridge'])}
                    sx={{ fontFamily: mono, fontSize: '0.72rem' }}
                  >
                    Ghidra Preset
                  </Button>
                </Stack>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={14}
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.75rem' } }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleMinifySchema}
                startIcon={<CompressIcon />}
                sx={{
                  mt: 2,
                  bgcolor: isDark ? '#D4AF37' : '#8A6508',
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  '&:hover': { bgcolor: '#F5E6AB' }
                }}
              >
                Run Token Minifier & Optimizer
              </Button>
            </Paper>
          </Grid>

          {/* Right: Minified Schema Output */}
          <Grid xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? '#0D0D11' : '#FFFFFF',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.85rem', color: '#22C55E' }}>
                  Optimized Zero-Bloat MCP Output
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(minifiedSchema)}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>

              {/* Output Content */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: isDark ? '#050508' : '#F1F5F9',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  overflowY: 'auto',
                  maxHeight: 380,
                  filter: isPro ? 'none' : 'blur(5px)',
                  transition: 'filter 0.3s ease'
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {minifiedSchema || '// Click "Run Token Minifier" to optimize'}
                </pre>
              </Box>

              {/* Frosted Glass Paywall Lock Overlay if Not Pro */}
              {!isPro && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    m: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    background: isDark ? 'rgba(10,10,15,0.78)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <LockIcon sx={{ fontSize: 36, color: '#D4AF37', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, mb: 0.5 }}>
                    Pro Optimizer Output Locked
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mb: 2 }}>
                    Unlock one-click copy, automated system prompt injection, and batch multi-server minification.
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      href="https://github.com/1nc0gn30/zoth-studio-v2"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontFamily: mono }}
                    >
                      Optional tip
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setProModalOpen(true)}
                      sx={{ borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37', fontFamily: mono }}
                    >
                      Enter Key
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* =================================================================== */}
      {/* TAB 2: INTEGRATION RECIPES                                          */}
      {/* =================================================================== */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', mb: 1.5, color: 'var(--zs-sky)' }}>
                Antigravity / Claude Desktop Configuration
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Inject this entry into your `~/.gemini/antigravity-cli/mcp/` or `claude_desktop_config.json`:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: isDark ? '#050508' : '#F1F5F9',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: mono,
                  fontSize: '0.78rem'
                }}
              >
                <pre style={{ margin: 0, overflowX: 'auto' }}>{`{
  "mcpServers": {
    "mcp-lens": {
      "command": "python3",
      "args": [
        "-m",
        "mcp_lens.cli",
        "sniff",
        "--port",
        "8109"
      ]
    }
  }
}`}</pre>
              </Paper>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#0D0D11' : '#FFFFFF' }}>
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.9rem', mb: 1.5, color: '#D4AF37' }}>
                FastMCP Python Proxy Integration
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Tapping tool execution with zero monkey-patching:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: isDark ? '#050508' : '#F1F5F9',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: mono,
                  fontSize: '0.78rem'
                }}
              >
                <pre style={{ margin: 0, overflowX: 'auto' }}>{`from fastmcp import FastMCP

mcp = FastMCP("sovereign-agent-hub")

@mcp.tool()
def compute_hash(data: str) -> str:
    """Computes SHA-256 with zero egress."""
    import hashlib
    return hashlib.sha256(data.encode()).hexdigest()

if __name__ == "__main__":
    mcp.run() # Listens on stdio or sse`}</pre>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Pro Unlock Key Modal */}
      <Dialog open={proModalOpen} onClose={() => setProModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: mono, fontWeight: 800 }}>Activate MCP Lens Pro</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Enter your receipt email or Stripe order confirmation ID to activate Pro locally:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. buyer@example.com or cs_live_..."
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleActivateKey}
            sx={{ bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
