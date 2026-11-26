import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:8097';
const USD_PER_1K_TOKENS = 0.005; // $5 / 1M tokens — unified with backend matcher.py

const PREVIEW_ROUTES = [
  {
    id: 'preview-openai-chat',
    method: 'POST',
    path: '/v1/chat/completions',
    provider: 'openai',
    raw_body: '{"model":"gpt-4o","messages":[{"role":"user","content":"Analyze security posture of port 8097"}]}',
    response_status: 200,
    response_body: JSON.stringify({
      id: 'chatcmpl-mock-preview-01',
      object: 'chat.completion',
      created: 1700000000,
      model: 'gpt-4o',
      choices: [{
        index: 0,
        message: { role: 'assistant', content: 'Port 8097 is bound to 127.0.0.1 running Agent Mock Twin v2.6.0 with zero external egress.' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 24, completion_tokens: 26, total_tokens: 50 },
    }, null, 2),
    token_estimate: 50,
    description: 'OpenAI GPT-4o Chat Completions Mock',
  },
  {
    id: 'preview-anthropic-msg',
    method: 'POST',
    path: '/v1/messages',
    provider: 'anthropic',
    raw_body: '{"model":"claude-3-5-sonnet-20241022","messages":[{"role":"user","content":"Generate hardened systemd service"}]}',
    response_status: 200,
    response_body: JSON.stringify({
      id: 'msg_mock_preview_02',
      type: 'message',
      role: 'assistant',
      model: 'claude-3-5-sonnet-20241022',
      content: [{ type: 'text', text: '[Service]\nKillMode=control-group\nNoNewPrivileges=yes\nProtectSystem=strict' }],
      usage: { input_tokens: 28, output_tokens: 32 },
    }, null, 2),
    token_estimate: 60,
    description: 'Anthropic Claude 3.5 Sonnet Messages Mock',
  },
  {
    id: 'preview-ollama-gen',
    method: 'POST',
    path: '/api/generate',
    provider: 'ollama',
    raw_body: '{"model":"qwen2.5:7b","prompt":"List active local mock ports"}',
    response_status: 200,
    response_body: JSON.stringify({
      model: 'qwen2.5:7b',
      response: 'Active loopback mock twin on 127.0.0.1:8097 with SQLite WAL storage.',
      done: true,
      eval_count: 32,
    }, null, 2),
    token_estimate: 32,
    description: 'Ollama Local Generate Mock',
  },
  {
    id: 'preview-openapi-user',
    method: 'GET',
    path: '/v1/users/{id}',
    provider: 'custom',
    raw_body: '',
    response_status: 200,
    response_body: JSON.stringify({ id: '42', role: 'autonomous-agent', verified: true }, null, 2),
    token_estimate: 18,
    description: 'OpenAPI {id} Path-Template Route',
  },
];

function providerBaseUrl(route) {
  const path = String(route.path || '');
  const prov = String(route.provider || '').toLowerCase();
  if (prov === 'anthropic' || path.startsWith('/v1/messages')) return 'https://api.anthropic.com';
  if (prov === 'ollama' || path.startsWith('/api/generate')) return 'http://127.0.0.1:11434';
  if (prov === 'openai' || path.startsWith('/v1/chat') || path.startsWith('/v1/embeddings') || path.startsWith('/v1/models')) {
    return 'https://api.openai.com';
  }
  return 'http://127.0.0.1:8097';
}

function defaultBodyForEndpoint(endpoint) {
  if (endpoint === '/v1/messages') {
    return JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Run local validation suite with $0 token cost.' }],
    }, null, 2);
  }
  if (endpoint === '/api/generate') {
    return JSON.stringify({ model: 'qwen2.5:7b', prompt: 'List active local mock ports' }, null, 2);
  }
  if (endpoint === '/v1/embeddings') {
    return JSON.stringify({ model: 'text-embedding-3-small', input: 'Agent memory recall query' }, null, 2);
  }
  if (endpoint === '/v1/users/42') {
    return '';
  }
  return JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Analyze security posture of port 8097' }],
  }, null, 2);
}

export function AgentMockTwinGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-Contrast Dual-Theme Tokens (>= 4.5:1 in both Editorial Ivory Light & Obsidian Dark)
  const emerald = isDark ? '#10B981' : '#047857';
  const emeraldSoft = isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(4, 120, 87, 0.10)';
  const gold = isDark ? '#E5C358' : '#9A7209';
  const goldSoft = isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(154, 114, 9, 0.10)';
  const crimson = isDark ? '#FB7185' : '#BE123C';
  const crimsonSoft = isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(190, 18, 60, 0.10)';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const purple = isDark ? '#C084FC' : '#6D28D9';
  const surfaceBg = isDark ? '#10121A' : '#FFFFFF';
  const elevatedBg = isDark ? '#080A10' : '#F3EFE6';
  const codeInk = isDark ? '#E2E8F0' : '#1C1917';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 25, 23, 0.12)';

  // Live Daemon Connection State
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonVersion, setDaemonVersion] = useState('2.6.0');
  const [offlinePreview, setOfflinePreview] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Live Data State (Zero fake seeded hits!)
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    total_hits: 0,
    total_tokens_saved: 0,
    total_usd_saved: 0.0,
    routes_count: 0,
  });

  const [activeTab, setActiveTab] = useState(0);
  const [testEndpoint, setTestEndpoint] = useState('/v1/chat/completions');
  const [testMethod, setTestMethod] = useState('POST');
  const [testPromptPayload, setTestPromptPayload] = useState(defaultBodyForEndpoint('/v1/chat/completions'));
  const [executionResult, setExecutionResult] = useState(null);
  const [chaosRate, setChaosRate] = useState(0.0);
  const [chaosType, setChaosType] = useState('429_rate_limit');
  const [baseLatencyMs, setBaseLatencyMs] = useState(25);
  const [jitterMs, setJitterMs] = useState(15);
  const [copiedKey, setCopiedKey] = useState(null);

  const syncFromDaemon = useCallback(async () => {
    try {
      const hResp = await fetch(`${DAEMON_BASE}/health`, { cache: 'no-store' });
      if (!hResp.ok) throw new Error(`HTTP ${hResp.status}`);
      const health = await hResp.json();
      if (!health || health.service !== 'agent-mock-twin') throw new Error('Unexpected service');

      setDaemonOnline(true);
      setDaemonVersion(health.version || '2.6.0');
      setSyncError('');

      const [rRes, sRes, cRes] = await Promise.all([
        fetch(`${DAEMON_BASE}/api/routes`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch(`${DAEMON_BASE}/api/stats`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch(`${DAEMON_BASE}/api/config`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      ]);

      if (rRes?.success && Array.isArray(rRes.routes)) setRoutes(rRes.routes);
      if (sRes?.success && sRes.stats) setStats(sRes.stats);
      if (cRes?.success && cRes.config) {
        setBaseLatencyMs(cRes.config.base_latency_ms ?? 25);
        setJitterMs(cRes.config.jitter_ms ?? 15);
        setChaosRate(cRes.config.chaos_rate ?? 0.0);
        setChaosType(cRes.config.chaos_type || '429_rate_limit');
      }
    } catch (_) {
      setDaemonOnline(false);
    }
  }, []);

  useEffect(() => {
    syncFromDaemon();
  }, [syncFromDaemon]);

  const activeRoutes = daemonOnline ? routes : (offlinePreview ? PREVIEW_ROUTES : []);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pushConfigToDaemon = async (nextCfg) => {
    if (!daemonOnline) return;
    try {
      await fetch(`${DAEMON_BASE}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextCfg),
      });
    } catch (_) {}
  };

  const handleUploadPreviewRoutes = async () => {
    if (!daemonOnline) {
      setOfflinePreview(true);
      return;
    }
    try {
      const resp = await fetch(`${DAEMON_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(PREVIEW_ROUTES),
      });
      if (resp.ok) {
        await syncFromDaemon();
      }
    } catch (err) {
      setSyncError(String(err));
    }
  };

  const handleClearDaemon = async () => {
    if (daemonOnline) {
      try {
        await fetch(`${DAEMON_BASE}/api/clear`, { method: 'POST' });
        await syncFromDaemon();
      } catch (_) {}
    } else {
      setStats({ total_hits: 0, total_tokens_saved: 0, total_usd_saved: 0.0, routes_count: 0 });
    }
    setExecutionResult(null);
  };

  const handleExecuteMockRequest = async () => {
    const method = testEndpoint === '/v1/users/42' ? 'GET' : testMethod;
    if (daemonOnline) {
      try {
        const resp = await fetch(`${DAEMON_BASE}/api/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, path: testEndpoint, body: testPromptPayload }),
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          let parsed = data.response_body;
          try { parsed = JSON.parse(data.response_body); } catch (_) {}
          setExecutionResult({
            source: 'live-daemon',
            status: data.response_status ?? 200,
            statusText: `${data.response_status ?? 200} (${String(data.match_type || 'exact').toUpperCase()})`,
            latencyMs: data.latency_ms ?? 0,
            matchTier: String(data.match_type || 'fallback').toUpperCase(),
            tokensSaved: data.tokens_saved ?? 0,
            usdSaved: data.usd_saved ?? 0.0,
            response: parsed,
          });
          await syncFromDaemon();
          return;
        }
      } catch (err) {
        setSyncError(`Failed to reach :8097 — ${err.message}`);
      }
    }

    // Opt-in Offline Browser Preview Execution
    if (!offlinePreview) {
      setSyncError('Local daemon :8097 is offline. Start `agent-mock-twin serve` or enable Offline Browser Preview.');
      return;
    }

    if (chaosRate > 0 && Math.random() < chaosRate) {
      const codeMap = { '429_rate_limit': 429, '500_internal_error': 500, '503_service_unavailable': 503, 'timeout_hang': 504 };
      const code = codeMap[chaosType] || 429;
      setExecutionResult({
        source: 'offline-preview',
        status: code,
        statusText: `${code} CHAOS FAULT`,
        latencyMs: baseLatencyMs,
        matchTier: 'CHAOS',
        tokensSaved: 0,
        usdSaved: 0.0,
        response: { error: { code, type: chaosType, message: 'Offline preview chaos fault' } },
      });
      setStats((prev) => ({ ...prev, total_hits: prev.total_hits + 1 }));
      return;
    }

    const matched = PREVIEW_ROUTES.find(
      (r) => r.path === testEndpoint || (r.path === '/v1/users/{id}' && testEndpoint.startsWith('/v1/users/'))
    );
    const tokens = matched ? matched.token_estimate : 35;
    const usd = Number(((tokens / 1000) * USD_PER_1K_TOKENS).toFixed(5));
    let parsed = { mock: true, path: testEndpoint, status: 'offline_preview' };
    if (matched) {
      try { parsed = JSON.parse(matched.response_body); } catch (_) {}
    }

    setExecutionResult({
      source: 'offline-preview',
      status: 200,
      statusText: matched ? (matched.path.includes('{') ? '200 (TEMPLATE)' : '200 (EXACT)') : '200 (FALLBACK)',
      latencyMs: baseLatencyMs,
      matchTier: matched ? (matched.path.includes('{') ? 'TEMPLATE' : 'EXACT') : 'FALLBACK',
      tokensSaved: tokens,
      usdSaved: usd,
      response: parsed,
    });
    setStats((prev) => ({
      ...prev,
      total_hits: prev.total_hits + 1,
      total_tokens_saved: prev.total_tokens_saved + tokens,
      total_usd_saved: Number((prev.total_usd_saved + usd).toFixed(4)),
      routes_count: PREVIEW_ROUTES.length,
    }));
  };

  const generateMswCode = () => {
    const list = activeRoutes.length ? activeRoutes : PREVIEW_ROUTES;
    return `// Mock Service Worker (MSW) Handlers — Agent Mock Twin v${daemonVersion}
import { http, HttpResponse } from 'msw';

export const handlers = [
${list
  .map((r) => {
    const base = providerBaseUrl(r);
    const m = String(r.method || 'POST').toLowerCase();
    const mswPath = String(r.path || '/').replace(/\{([^}]+)\}/g, ':$1');
    const body = String(r.response_body || '{}').replace(/\n/g, '\n    ');
    return `  http.${m}('${base}${mswPath}', async () => {\n    return HttpResponse.json(${body}, { status: ${r.response_status || 200} });\n  }),`;
  })
  .join('\n\n')}
];`;
  };

  const generatePytestCode = () => {
    const list = activeRoutes.length ? activeRoutes : PREVIEW_ROUTES;
    return `# pytest / responses fixtures — Agent Mock Twin v${daemonVersion}
import pytest
import responses

@pytest.fixture
def mock_agent_twin():
    with responses.RequestsMock() as rsps:
${list
  .map((r) => {
    const base = providerBaseUrl(r);
    const m = String(r.method || 'POST').upper();
    const samplePath = String(r.path || '/').replace(/\{[^}]+\}/g, '42');
    return `        rsps.add(\n            responses.${m},\n            '${base}${samplePath}',\n            body='''${r.response_body || '{}'}''',\n            status=${r.response_status || 200},\n            content_type='application/json',\n        )`;
  })
  .join('\n')}
        yield rsps`;
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Clean Header & Single Compact Support Row (Zero Squished Buttons) */}
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F0 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: goldSoft, color: gold, display: 'flex', flexShrink: 0 }}>
            <MemoryIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                Agent Mock Twin Control Deck v{daemonVersion}
              </Typography>
              <Chip
                size="small"
                icon={daemonOnline ? <CheckCircleIcon style={{ color: emerald }} /> : <CloudOffIcon style={{ color: crimson }} />}
                label={daemonOnline ? 'LIVE :8097 CONNECTED' : 'DAEMON OFFLINE'}
                sx={{
                  bgcolor: daemonOnline ? emeraldSoft : crimsonSoft,
                  color: daemonOnline ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono,
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Loopback SQLite WAL mock daemon ($5/1M unified savings rate), OpenAPI &#123;param&#125; matching &amp; live chaos injection.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={syncFromDaemon}
            startIcon={<RefreshIcon />}
            sx={{ minHeight: 44, whiteSpace: 'nowrap', fontFamily: mono, fontWeight: 700, borderColor: cardBorder, color: 'text.primary' }}
          >
            SYNC :8097
          </Button>
          <Button
            variant="contained"
            size="small"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noreferrer"
            startIcon={<BoltIcon />}
            sx={{
              minHeight: 44,
              px: 2,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              bgcolor: gold,
              color: isDark ? '#08080B' : '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              '&:hover': { bgcolor: isDark ? '#D4AF37' : '#7C5B06' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleCopy('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', 'solTip')}
            sx={{
              minHeight: 44,
              px: 1.8,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderColor: cyan,
              color: cyan,
              fontWeight: 700,
              fontSize: '0.75rem',
              fontFamily: mono,
            }}
          >
            {copiedKey === 'solTip' ? '✓ COPIED SOL' : '◎ TIP SOL'}
          </Button>
        </Stack>
      </Paper>

      {/* Honest Offline Banner + Explicit Opt-In Preview Toggle */}
      {!daemonOnline && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5, alignItems: 'center', border: `1px solid ${gold}`, bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FFFBEB' }}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={offlinePreview}
                  onChange={(e) => {
                    setOfflinePreview(e.target.checked);
                    setSyncError('');
                  }}
                />
              }
              label={<Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>Offline Browser Preview</Typography>}
            />
          }
        >
          <strong>Local Daemon Offline</strong> — Run <code>agent-mock-twin serve --host 127.0.0.1 --port 8097</code> for live SQLite WAL replay, or enable Offline Browser Preview.
        </Alert>
      )}

      {syncError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSyncError('')}>
          {syncError}
        </Alert>
      )}

      <SovereignEyebrow accent={gold} right="Simulation & Testing">
        agent-mock-twin // 127.0.0.1:8097
      </SovereignEyebrow>

      {/* High-Contrast KPI Strip */}
      <Grid container spacing={2} sx={{ mb: 2.5, mt: 0.5 }}>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, fontWeight: 700 }}>
                SAVED TOKEN SPEND
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: emerald, mt: 0.5 }}>
                ${Number(stats.total_usd_saved || 0).toFixed(4)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, fontWeight: 700 }}>
                TOKENS SAVED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: cyan, mt: 0.5 }}>
                {Number(stats.total_tokens_saved || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, fontWeight: 700 }}>
                MOCK REPLAY HITS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: gold, mt: 0.5 }}>
                {Number(stats.total_hits || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} md={3}>
          <Card sx={{ bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, fontWeight: 700 }}>
                INDEXED ROUTES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: purple, mt: 0.5 }}>
                {activeRoutes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Deck Paper */}
      <Paper sx={{ bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2, p: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2.5,
            borderBottom: `1px solid ${cardBorder}`,
            '& .MuiTab-root': { fontFamily: mono, fontWeight: 800, fontSize: '0.78rem', minHeight: 44 },
          }}
        >
          <Tab icon={<PlayArrowIcon />} iconPosition="start" label="REPLAY SIMULATOR" />
          <Tab icon={<MemoryIcon />} iconPosition="start" label={`ROUTES (${activeRoutes.length})`} />
          <Tab icon={<CodeIcon />} iconPosition="start" label="CODE EXPORT (MSW & PYTEST)" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={2.5}>
            <Grid xs={12} lg={6}>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="amt-endpoint-label">Mock API Endpoint</InputLabel>
                  <Select
                    labelId="amt-endpoint-label"
                    value={testEndpoint}
                    label="Mock API Endpoint"
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestEndpoint(val);
                      setTestMethod(val === '/v1/users/42' ? 'GET' : 'POST');
                      setTestPromptPayload(defaultBodyForEndpoint(val));
                    }}
                    sx={{ fontFamily: mono, minHeight: 44 }}
                  >
                    <MenuItem value="/v1/chat/completions">POST OpenAI /v1/chat/completions</MenuItem>
                    <MenuItem value="/v1/messages">POST Anthropic /v1/messages</MenuItem>
                    <MenuItem value="/api/generate">POST Ollama /api/generate</MenuItem>
                    <MenuItem value="/v1/embeddings">POST Embeddings /v1/embeddings</MenuItem>
                    <MenuItem value="/v1/users/42">GET OpenAPI Template /v1/users/42</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Inbound Request Payload (JSON)"
                  value={testPromptPayload}
                  onChange={(e) => setTestPromptPayload(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                />

                {/* Live Config Controls Wired to POST /api/config */}
                <Paper sx={{ p: 2, bgcolor: elevatedBg, border: `1px solid ${chaosRate > 0 ? crimson : cardBorder}`, borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: chaosRate > 0 ? crimson : 'text.primary' }}>
                      Live Latency &amp; Chaos Config
                    </Typography>
                    <Chip
                      label={daemonOnline ? 'SYNCED TO :8097/api/config' : 'LOCAL PREVIEW'}
                      size="small"
                      sx={{ bgcolor: daemonOnline ? emeraldSoft : goldSoft, color: daemonOnline ? emerald : gold, fontWeight: 800, fontFamily: mono, fontSize: '0.68rem' }}
                    />
                  </Stack>

                  <Grid container spacing={1.5}>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Base Latency (ms)"
                        value={baseLatencyMs}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                          setBaseLatencyMs(v);
                          pushConfigToDaemon({ base_latency_ms: v, jitter_ms: jitterMs, chaos_rate: chaosRate, chaos_type: chaosType });
                        }}
                        InputProps={{ sx: { fontFamily: mono, minHeight: 44 } }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Chaos Rate (0..1)"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                        value={chaosRate}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(1, Number(e.target.value) || 0));
                          setChaosRate(v);
                          pushConfigToDaemon({ base_latency_ms: baseLatencyMs, jitter_ms: jitterMs, chaos_rate: v, chaos_type: chaosType });
                        }}
                        InputProps={{ sx: { fontFamily: mono, minHeight: 44 } }}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="amt-chaos-type">Chaos Fault Type</InputLabel>
                        <Select
                          labelId="amt-chaos-type"
                          value={chaosType}
                          label="Chaos Fault Type"
                          onChange={(e) => {
                            const v = e.target.value;
                            setChaosType(v);
                            pushConfigToDaemon({ base_latency_ms: baseLatencyMs, jitter_ms: jitterMs, chaos_rate: chaosRate, chaos_type: v });
                          }}
                          sx={{ fontFamily: mono, minHeight: 44 }}
                        >
                          <MenuItem value="429_rate_limit">429 Rate Limit Exceeded</MenuItem>
                          <MenuItem value="500_internal_error">500 Internal Server Error</MenuItem>
                          <MenuItem value="503_service_unavailable">503 Service Unavailable</MenuItem>
                          <MenuItem value="timeout_hang">504 Gateway Timeout</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    onClick={handleExecuteMockRequest}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      flex: 1,
                      minHeight: 44,
                      bgcolor: emerald,
                      color: isDark ? '#08080B' : '#FFFFFF',
                      fontWeight: 800,
                      fontFamily: mono,
                      '&:hover': { bgcolor: isDark ? '#059669' : '#065F46' },
                    }}
                  >
                    EXECUTE MOCK MATCH &amp; REPLAY
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleUploadPreviewRoutes}
                    sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, borderColor: gold, color: gold }}
                  >
                    SEED 4 ROUTES
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearDaemon}
                    startIcon={<DeleteIcon />}
                    sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700 }}
                  >
                    CLEAR
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid xs={12} lg={6}>
              {executionResult ? (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: elevatedBg,
                    border: `1px solid ${executionResult.status >= 400 ? crimson : emerald}`,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={executionResult.statusText}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          bgcolor: executionResult.status >= 400 ? crimsonSoft : emeraldSoft,
                          color: executionResult.status >= 400 ? crimson : emerald,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, fontWeight: 700 }}>
                        {executionResult.latencyMs}ms
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                      {executionResult.matchTier} · {executionResult.source}
                    </Typography>
                  </Stack>

                  <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 330 }}>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: executionResult.status >= 400 ? crimson : codeInk, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(executionResult.response, null, 2)}
                    </pre>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                      Saved: <strong>{executionResult.tokensSaved} tok (${Number(executionResult.usdSaved || 0).toFixed(5)})</strong>
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(JSON.stringify(executionResult.response, null, 2), 'copyResult')}
                      sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', color: cyan, fontWeight: 700 }}
                    >
                      {copiedKey === 'copyResult' ? 'COPIED' : 'COPY JSON'}
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 5,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: elevatedBg,
                    border: `1px dashed ${cardBorder}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary', textAlign: 'center' }}>
                    Click &ldquo;EXECUTE MOCK MATCH &amp; REPLAY&rdquo; to dispatch a real replay request to 127.0.0.1:8097.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: elevatedBg }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: elevatedBg }}>Path</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: elevatedBg }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: elevatedBg }}>Tokens</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, fontFamily: mono, bgcolor: elevatedBg }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, fontFamily: mono, color: 'text.secondary' }}>
                      No routes indexed yet. Click &ldquo;SEED 4 ROUTES&rdquo; in Simulator or upload a HAR / OpenAPI file.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeRoutes.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, color: emerald }}>{r.method}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', color: cyan, fontWeight: 700 }}>{r.path}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{String(r.provider || 'custom').toUpperCase()}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: gold, fontWeight: 700 }}>~{r.token_estimate ?? 0}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => {
                            const targetPath = String(r.path || '/').replace(/\{[^}]+\}/g, '42');
                            setTestEndpoint(targetPath);
                            setTestMethod(r.method || 'POST');
                            setTestPromptPayload(r.raw_body || defaultBodyForEndpoint(targetPath));
                            setActiveTab(0);
                          }}
                          sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', color: cyan, fontWeight: 700 }}
                        >
                          TEST
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: elevatedBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, fontWeight: 800 }}>
                    NODE.JS / MSW HANDLERS (PROVIDER-AWARE URLS)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(generateMswCode(), 'copyMsw')}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', color: cyan, fontWeight: 700 }}
                  >
                    {copiedKey === 'copyMsw' ? 'COPIED' : 'COPY'}
                  </Button>
                </Stack>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: codeInk, maxHeight: 300, overflowY: 'auto' }}>
                  {generateMswCode()}
                </pre>
              </Paper>
            </Grid>

            <Grid xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: elevatedBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                    PYTHON PYTEST / RESPONSES FIXTURES
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(generatePytestCode(), 'copyPytest')}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', color: gold, fontWeight: 700 }}
                  >
                    {copiedKey === 'copyPytest' ? 'COPIED' : 'COPY'}
                  </Button>
                </Stack>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: codeInk, maxHeight: 300, overflowY: 'auto' }}>
                  {generatePytestCode()}
                </pre>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

export default AgentMockTwinGodModeTool;
