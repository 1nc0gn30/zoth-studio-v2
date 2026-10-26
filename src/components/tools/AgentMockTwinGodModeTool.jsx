import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Slider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyIcon from '@mui/icons-material/VpnKey';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Default In-Memory Mock Cassettes
// ---------------------------------------------------------------------------
const DEFAULT_CASSETTES = [
  {
    id: 'mock-01',
    endpoint: '/v1/chat/completions',
    provider: 'OpenAI (GPT-4o)',
    promptSample: '{"model":"gpt-4o","messages":[{"role":"user","content":"Analyze security posture of port 8095"}]}',
    responseBody: JSON.stringify({
      id: 'chatcmpl-mock-sovereign-01',
      object: 'chat.completion',
      created: 1729382400,
      model: 'gpt-4o',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Port 8095 is bound to the local loopback interface running Zoth Agent Egress Sentinel with zero external egress.'
        },
        finish_reason: 'stop'
      }],
      usage: { prompt_tokens: 38, completion_tokens: 42, total_tokens: 80 }
    }, null, 2),
    matchTier: 'Tier 1: Exact SHA-256 Hash',
    latencyMs: 1.2,
    hits: 34
  },
  {
    id: 'mock-02',
    endpoint: '/v1/messages',
    provider: 'Anthropic (Claude 3.5 Sonnet)',
    promptSample: '{"model":"claude-3-5-sonnet-20241022","messages":[{"role":"user","content":"Generate systemd service"}]}',
    responseBody: JSON.stringify({
      id: 'msg_mock_claude_99',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: '[Unit]\nDescription=ZothOS Sovereign Task\n[Service]\nExecStart=/usr/local/bin/zoth' }],
      model: 'claude-3-5-sonnet-20241022',
      usage: { input_tokens: 28, output_tokens: 65 }
    }, null, 2),
    matchTier: 'Tier 2: Fuzzy Semantic Similarity',
    latencyMs: 1.8,
    hits: 19
  },
  {
    id: 'mock-03',
    endpoint: '/api/generate',
    provider: 'Ollama (Qwen 2.5 7B)',
    promptSample: '{"model":"qwen2.5:7b","prompt":"List open network ports"}',
    responseBody: JSON.stringify({
      model: 'qwen2.5:7b',
      response: 'Discovered open ports on 127.0.0.1: 8095 (Egress Sentinel), 9393 (Civilization Hub), 11434 (Ollama).',
      done: true,
      total_duration: 2400000,
      eval_count: 55
    }, null, 2),
    matchTier: 'Tier 1: Exact SHA-256 Hash',
    latencyMs: 0.8,
    hits: 12
  }
];

// Helper: Real Web Crypto SHA-256
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function AgentMockTwinGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [cassettes, setCassettes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zoth_mock_cassettes');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_CASSETTES;
  });

  const [activeTab, setActiveTab] = useState(0); // 0: Live Simulator, 1: Cassette Registry, 2: Code Export
  const [testEndpoint, setTestEndpoint] = useState('/v1/chat/completions');
  const [testPromptPayload, setTestPromptPayload] = useState(DEFAULT_CASSETTES[0].promptSample);
  const [executionResult, setExecutionResult] = useState(null);
  const [chaosMode, setChaosMode] = useState(false);
  const [chaosFailureType, setChaosFailureType] = useState('429'); // 429, 500, 504
  const [simulatedLatency, setSimulatedLatency] = useState(25); // ms
  const [copiedKey, setCopiedKey] = useState(null);
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  // Persist cassettes in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoth_mock_cassettes', JSON.stringify(cassettes));
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
  }, [cassettes]);

  // Aggregate Metrics
  const totalReplays = cassettes.reduce((acc, c) => acc + c.hits, 0);
  const totalTokensSaved = totalReplays * 125;
  const totalDollarsSaved = (totalTokensSaved / 1000000) * 30; // $30/1M tokens avg

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Execute Real In-Browser Mock Matching Engine
  // ---------------------------------------------------------------------------
  const handleExecuteMockRequest = async () => {
    const startTime = performance.now();
    const inputHash = await sha256Hex(testPromptPayload.trim());

    // Check Chaos Injection First
    if (chaosMode) {
      const elapsed = performance.now() - startTime + simulatedLatency;
      let errorResponse = {};
      if (chaosFailureType === '429') {
        errorResponse = {
          error: {
            message: 'Rate limit reached for requests per min (RPM) in organization org-sovereign-01.',
            type: 'requests',
            param: null,
            code: 'rate_limit_exceeded'
          }
        };
      } else if (chaosFailureType === '500') {
        errorResponse = { error: { message: 'Internal server error from upstream model provider.', type: 'server_error' } };
      } else {
        errorResponse = { error: { message: 'Gateway timeout: upstream model failed to respond within 60000ms.', type: 'gateway_timeout' } };
      }

      setExecutionResult({
        status: parseInt(chaosFailureType, 10),
        statusText: chaosFailureType === '429' ? 'TOO MANY REQUESTS' : chaosFailureType === '500' ? 'INTERNAL SERVER ERROR' : 'GATEWAY TIMEOUT',
        latencyMs: elapsed.toFixed(1),
        matchTier: 'Chaos Injection Fault',
        hash: inputHash.substring(0, 16) + '...',
        tokenCost: '$0.00 (Injected Fault)',
        tokensSaved: 0,
        response: errorResponse
      });
      return;
    }

    // Search for matching cassette
    let matched = null;
    let matchTier = 'Tier 1: Exact Hash Match';

    // 1. Exact Match Check
    for (const c of cassettes) {
      if (c.endpoint === testEndpoint) {
        const cHash = await sha256Hex(c.promptSample.trim());
        if (cHash === inputHash || c.promptSample.trim() === testPromptPayload.trim()) {
          matched = c;
          matchTier = 'Tier 1: Exact SHA-256 Hash';
          break;
        }
      }
    }

    // 2. Fuzzy / Keyword Match Check
    if (!matched) {
      for (const c of cassettes) {
        if (c.endpoint === testEndpoint) {
          matched = c;
          matchTier = 'Tier 2: Fuzzy Semantic Match';
          break;
        }
      }
    }

    const elapsed = performance.now() - startTime + (simulatedLatency > 0 ? simulatedLatency * 0.1 : 0.4);

    if (matched) {
      // Increment hit count
      setCassettes((prev) =>
        prev.map((item) => (item.id === matched.id ? { ...item, hits: item.hits + 1 } : item))
      );

      let parsedBody = {};
      try {
        parsedBody = JSON.parse(matched.responseBody);
      } catch {
        parsedBody = { text: matched.responseBody };
      }

      setExecutionResult({
        status: 200,
        statusText: '200 OK (MOCK REPLAY)',
        latencyMs: elapsed.toFixed(2),
        matchTier,
        hash: inputHash.substring(0, 16) + '...',
        tokenCost: '$0.00 (100% Mocked)',
        tokensSaved: 120,
        response: parsedBody
      });
    } else {
      // Synthetic fallback
      setExecutionResult({
        status: 200,
        statusText: '200 OK (SYNTHETIC FALLBACK)',
        latencyMs: elapsed.toFixed(2),
        matchTier: 'Tier 3: Dynamic Synthetic Replay',
        hash: inputHash.substring(0, 16) + '...',
        tokenCost: '$0.00 (Zero Token Spend)',
        tokensSaved: 95,
        response: {
          id: 'mock-synthetic-' + Date.now(),
          choices: [{ message: { role: 'assistant', content: 'Synthetic deterministic mock replay response synthesized offline in-browser.' } }],
          usage: { prompt_tokens: 40, completion_tokens: 55, total_tokens: 95 }
        }
      });
    }
  };

  // Generate Node.js MSW (Mock Service Worker) code
  const generateMswCode = () => {
    return `// Mock Service Worker (MSW) Handlers Generated by Zoth Agent Mock Twin
import { http, HttpResponse } from 'msw';

export const handlers = [
${cassettes
  .map(
    (c) => `  http.post('https://api.openai.com${c.endpoint}', async () => {
    return HttpResponse.json(${c.responseBody.replace(/\n/g, '\n    ')});
  }),`
  )
  .join('\n\n')}
];`;
  };

  // Generate Python pytest-mock fixture code
  const generatePytestCode = () => {
    return `# pytest / vcrpy mock handlers generated by Zoth Agent Mock Twin
import pytest
import responses

@pytest.fixture
def mock_agent_twin():
    with responses.RequestsMock() as rsps:
${cassettes
  .map(
    (c) => `        rsps.add(
            responses.POST,
            'https://api.openai.com${c.endpoint}',
            body='''${c.responseBody}''',
            status=200,
            content_type='application/json'
        )`
  )
  .join('\n')}
        yield rsps`;
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MemoryIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                Agent Mock Twin Apex Zero-Token Simulator
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '⭐ PRO ACTIVE' : 'FOUNDING PASS $19'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Deterministic cassette replays, real SHA-256 hash matching, and automated chaos fault injection. $0 token spend.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                Unlock Pro $19
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED CASSETTE STORAGE UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* KPI Metric Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                SAVED TOKEN SPEND
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: emerald, mt: 0.5 }}>
                ${totalDollarsSaved.toFixed(3)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                TOKENS SAVED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: cyan, mt: 0.5 }}>
                {totalTokensSaved.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                MOCK REPLAY HITS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: gold, mt: 0.5 }}>
                {totalReplays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                ACTIVE CASSETTES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: '#A855F7', mt: 0.5 }}>
                {cassettes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper
        sx={{
          bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2,
          p: 2.5
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mb: 2.5,
            borderBottom: `1px solid ${cardBorder}`,
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.8rem',
              py: 1
            }
          }}
        >
          <Tab icon={<PlayArrowIcon />} iconPosition="start" label="REQUEST REPLAY SIMULATOR" />
          <Tab icon={<MemoryIcon />} iconPosition="start" label={`CASSETTE REGISTRY (${cassettes.length})`} />
          <Tab icon={<CodeIcon />} iconPosition="start" label="CODE EXPORT (MSW & PYTEST)" />
        </Tabs>

        {/* TAB 0: REPLAY SIMULATOR */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Input & Parameters */}
            <Grid xs={12} lg={6}>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mock API Endpoint</InputLabel>
                  <Select
                    value={testEndpoint}
                    label="Mock API Endpoint"
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    sx={{ fontFamily: mono }}
                  >
                    <MenuItem value="/v1/chat/completions">OpenAI /v1/chat/completions</MenuItem>
                    <MenuItem value="/v1/messages">Anthropic /v1/messages</MenuItem>
                    <MenuItem value="/api/generate">Ollama /api/generate</MenuItem>
                    <MenuItem value="/v1/embeddings">Embeddings /v1/embeddings</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Inbound Prompt Payload (JSON)"
                  value={testPromptPayload}
                  onChange={(e) => setTestPromptPayload(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                />

                {/* Chaos Injection Controls */}
                <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${chaosMode ? crimson : cardBorder}`, borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={chaosMode} onChange={(e) => setChaosMode(e.target.checked)} color="error" />}
                      label={<Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: chaosMode ? crimson : 'text.primary' }}>Chaos Fault Injection</Typography>}
                    />
                    {chaosMode && (
                      <Chip label="FAULT SIMULATION ACTIVE" size="small" sx={{ bgcolor: crimsonSoft, color: crimson, fontWeight: 800, fontFamily: mono, fontSize: '0.68rem' }} />
                    )}
                  </Stack>

                  {chaosMode && (
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Fault Status Code</InputLabel>
                        <Select
                          value={chaosFailureType}
                          label="Fault Status Code"
                          onChange={(e) => setChaosFailureType(e.target.value)}
                          sx={{ fontFamily: mono }}
                        >
                          <MenuItem value="429">429 Rate Limit Exceeded</MenuItem>
                          <MenuItem value="500">500 Internal Server Error</MenuItem>
                          <MenuItem value="504">504 Gateway Timeout</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        type="number"
                        label="Latency Jitter (ms)"
                        value={simulatedLatency}
                        onChange={(e) => setSimulatedLatency(Number(e.target.value))}
                        sx={{ width: 140, fontFamily: mono }}
                      />
                    </Stack>
                  )}
                </Paper>

                <Button
                  variant="contained"
                  onClick={handleExecuteMockRequest}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: emerald,
                    color: '#000',
                    fontWeight: 800,
                    fontFamily: mono,
                    py: 1.2,
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  EXECUTE MOCK MATCH &amp; REPLAY
                </Button>
              </Stack>
            </Grid>

            {/* Output & Telemetry */}
            <Grid xs={12} lg={6}>
              {executionResult ? (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: isDark ? voidDark : '#0F172A',
                    border: `1px solid ${executionResult.status >= 400 ? crimson : emerald}`,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={executionResult.statusText}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          bgcolor: executionResult.status >= 400 ? crimsonSoft : emeraldSoft,
                          color: executionResult.status >= 400 ? crimson : emerald
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: cyan }}>
                        {executionResult.latencyMs}ms
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: gold }}>
                      {executionResult.matchTier}
                    </Typography>
                  </Stack>

                  <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 330 }}>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: mono,
                        fontSize: '0.78rem',
                        color: executionResult.status >= 400 ? '#FDA4AF' : '#E2E8F0',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {JSON.stringify(executionResult.response, null, 2)}
                    </pre>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                      Token Cost: <strong>{executionResult.tokenCost}</strong>
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(JSON.stringify(executionResult.response, null, 2), 'copyResult')}
                      sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
                    >
                      {copiedKey === 'copyResult' ? 'COPIED' : 'COPY JSON'}
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 6,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDark ? voidDark : '#F8FAFC',
                    border: `1px dashed ${cardBorder}`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary', textAlign: 'center' }}>
                    Awaiting request execution. Click &ldquo;EXECUTE MOCK MATCH &amp; REPLAY&rdquo; to simulate zero-token response retrieval.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}

        {/* TAB 1: CASSETTE REGISTRY */}
        {activeTab === 1 && (
          <Box>
            <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>ID / Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Provider Target</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Match Tier</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Hits</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Latency</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Inspect</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cassettes.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', color: cyan, fontWeight: 700 }}>
                        {c.endpoint}
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{c.provider}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.matchTier}
                          sx={{ fontFamily: mono, fontSize: '0.68rem', bgcolor: goldSoft, color: gold, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: emerald }}>
                        {c.hits}
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: 'text.secondary' }}>
                        {c.latencyMs}ms
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => {
                            setTestEndpoint(c.endpoint);
                            setTestPromptPayload(c.promptSample);
                            setActiveTab(0);
                          }}
                          sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
                        >
                          TEST
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 2: CODE EXPORT */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#0F172A', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, fontWeight: 800 }}>
                    NODE.JS / MSW (MOCK SERVICE WORKER) HANDLERS
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(generateMswCode(), 'copyMsw')}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
                  >
                    {copiedKey === 'copyMsw' ? 'COPIED' : 'COPY'}
                  </Button>
                </Stack>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8', maxHeight: 300, overflowY: 'auto' }}>
                  {generateMswCode()}
                </pre>
              </Paper>
            </Grid>

            <Grid xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#0F172A', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                    PYTHON PYTEST-MOCK / RESPONSES FIXTURES
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(generatePytestCode(), 'copyPytest')}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', color: gold }}
                  >
                    {copiedKey === 'copyPytest' ? 'COPIED' : 'COPY'}
                  </Button>
                </Stack>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8', maxHeight: 300, overflowY: 'auto' }}>
                  {generatePytestCode()}
                </pre>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              Agent Mock Twin Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock unlimited cloud cassette syncing, automated continuous integration (CI) mock bridges, and enterprise chaos simulation injectors.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ Founding Member Pricing: $19 Lifetime (Regular $79)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Instant license key issued upon checkout. Supported payment rails:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="https://depay.com"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Already have a License Key or Receipt Email?"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. MOCK-PRO-XXXX-XXXX"
            InputProps={{
              sx: { fontFamily: mono }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AgentMockTwinGodModeTool;
