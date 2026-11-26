import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldIcon from '@mui/icons-material/Shield';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const DAEMON_BASE = 'http://127.0.0.1:8095';
const SOLANA_TIP = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

const OFFLINE_PREVIEW_EVENTS = [
  {
    id: 'preview-01',
    domain: 'api.openai.com',
    remote_port: 443,
    protocol: 'HTTPS',
    method: 'CONNECT',
    bytes_sent: 1840,
    bytes_recv: 12400,
    status_code: 200,
    quarantined: false,
    category: 'llm_api',
    notes: 'Offline preview sample (daemon idle)',
  },
  {
    id: 'preview-02',
    domain: 'api.segment.io',
    remote_port: 443,
    protocol: 'HTTPS',
    method: 'CONNECT',
    bytes_sent: 0,
    bytes_recv: 0,
    status_code: 403,
    quarantined: true,
    category: 'telemetry_tracker',
    notes: 'Blocked by pre-relay TLS SNI telemetry policy (preview)',
  },
  {
    id: 'preview-03',
    domain: '169.254.169.254',
    remote_port: 80,
    protocol: 'HTTP',
    method: 'GET',
    bytes_sent: 0,
    bytes_recv: 0,
    status_code: 403,
    quarantined: true,
    category: 'private_network',
    notes: 'Blocked by RFC1918 / Cloud Metadata SSRF guard (preview)',
  },
];

export default function AgentEgressSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dual-theme Editorial Ivory Light + Obsidian Dark tokens
  const surfaceBg = isDark ? 'rgba(12,10,16,0.92)' : '#FFFFFF';
  const subtleBg = isDark ? 'rgba(255,255,255,0.03)' : '#F3EFE6';
  const radarBg = isDark ? '#0A0B10' : '#FAF7F0';
  const codeBg = isDark ? '#090A0F' : '#F3EFE6';
  const inkPrimary = isDark ? '#F1F5F9' : '#1C1917';
  const inkSecondary = isDark ? '#94A3B8' : '#57534E';
  const goldInk = isDark ? '#D4AF37' : '#9A7209';
  const emeraldInk = isDark ? '#34D399' : '#047857';
  const crimsonInk = isDark ? '#EF4444' : '#BE123C';
  const skyInk = isDark ? '#38BDF8' : '#0369A1';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(28,25,23,0.14)';
  const borderAccent = isDark ? 'rgba(212,175,55,0.34)' : 'rgba(154,114,9,0.38)';

  const [daemonOnline, setDaemonOnline] = useState(false);
  const [probing, setProbing] = useState(true);
  const [offlinePreview, setOfflinePreview] = useState(false);
  const [proxyPort, setProxyPort] = useState(8195);
  const [quarantineMode, setQuarantineMode] = useState('block_telemetry');
  const [stats, setStats] = useState({ total_requests: 0, total_domains: 0, total_quarantined: 0 });
  const [domains, setDomains] = useState([]);
  const [events, setEvents] = useState([]);
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [protectedPorts, setProtectedPorts] = useState([8095, 8195]);
  const [ruleDomainInput, setRuleDomainInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const canvasRef = useRef(null);

  const syncFromDaemon = useCallback(async () => {
    try {
      const healthRes = await fetch(`${DAEMON_BASE}/api/health`, { cache: 'no-store' });
      if (!healthRes.ok) throw new Error('offline');
      const health = await healthRes.json();
      if (!health || health.status !== 'ok') throw new Error('unhealthy');

      setDaemonOnline(true);
      setProbing(false);
      setProxyPort(health.proxy_port || 8195);
      if (health.quarantine_mode) setQuarantineMode(health.quarantine_mode);
      if (Array.isArray(health.protected_ports)) setProtectedPorts(health.protected_ports);

      const [statsRes, domRes, trRes, rulesRes] = await Promise.all([
        fetch(`${DAEMON_BASE}/api/stats`, { cache: 'no-store' }),
        fetch(`${DAEMON_BASE}/api/domains`, { cache: 'no-store' }),
        fetch(`${DAEMON_BASE}/api/traffic?limit=25`, { cache: 'no-store' }),
        fetch(`${DAEMON_BASE}/api/rules`, { cache: 'no-store' }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (domRes.ok) {
        const dJson = await domRes.json();
        setDomains(dJson.domains || []);
      }
      if (trRes.ok) {
        const tJson = await trRes.json();
        setEvents(tJson.events || []);
      }
      if (rulesRes.ok) {
        const rJson = await rulesRes.json();
        if (rJson.quarantine_mode) setQuarantineMode(rJson.quarantine_mode);
        setAllowedDomains(rJson.allowed_domains || []);
        setBlockedDomains(rJson.blocked_domains || []);
        if (Array.isArray(rJson.protected_ports)) setProtectedPorts(rJson.protected_ports);
      }
    } catch (_err) {
      setDaemonOnline(false);
      setProbing(false);
    }
  }, []);

  useEffect(() => {
    syncFromDaemon();
    const timer = setInterval(syncFromDaemon, 5000);
    return () => clearInterval(timer);
  }, [syncFromDaemon]);

  const displayedEvents = useMemo(() => {
    if (daemonOnline) return events;
    return offlinePreview ? OFFLINE_PREVIEW_EVENTS : [];
  }, [daemonOnline, events, offlinePreview]);

  const handleQuarantineChange = async (nextMode) => {
    setQuarantineMode(nextMode);
    if (!daemonOnline) {
      setStatusMessage('Daemon offline — start local daemon to enforce quarantine mode live.');
      return;
    }
    try {
      const res = await fetch(`${DAEMON_BASE}/api/quarantine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode }),
      });
      if (res.ok) {
        setStatusMessage(`Live daemon policy updated to ${nextMode.toUpperCase()}.`);
        syncFromDaemon();
      } else {
        setStatusMessage('Daemon rejected policy update.');
      }
    } catch (_err) {
      setStatusMessage('Could not reach 127.0.0.1:8095.');
    }
  };

  const handleRuleMutation = async (listKind, action, domainVal) => {
    const clean = (domainVal || '').trim();
    if (!clean) return;
    if (!daemonOnline) {
      setStatusMessage('Local daemon offline — start agent-egress-sentinel serve to edit live rules.');
      return;
    }
    const endpoint = listKind === 'allow' ? '/api/rules/allow' : '/api/rules/block';
    try {
      const res =
        action === 'add'
          ? await fetch(`${DAEMON_BASE}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain: clean }),
            })
          : await fetch(`${DAEMON_BASE}${endpoint}?domain=${encodeURIComponent(clean)}`, {
              method: 'DELETE',
            });
      if (res.ok) {
        setRuleDomainInput('');
        setStatusMessage(
          action === 'add'
            ? `Added '${clean}' to live ${listKind}list.`
            : `Removed '${clean}' from live ${listKind}list.`
        );
        syncFromDaemon();
      }
    } catch (_err) {
      setStatusMessage('Failed to update live daemon rules.');
    }
  };

  const cliSnippet = useMemo(
    () =>
      `# Start live web radar (:8095) + userspace proxy (:${proxyPort})
agent-egress-sentinel serve --web-port 8095 --proxy-port ${proxyPort} --quarantine ${quarantineMode}

# Route any AI agent process through Sentinel
HTTP_PROXY=http://127.0.0.1:${proxyPort} HTTPS_PROXY=http://127.0.0.1:${proxyPort} python3 my_agent.py

# Start stdio MCP server (3 tools: egress_audit_status, egress_set_quarantine, egress_manage_rules)
agent-egress-sentinel mcp --port 8095`,
    [proxyPort, quarantineMode]
  );

  const handleCopyText = (key, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dual-Theme Kinetic Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let angle = 0;

    const render = () => {
      angle = (angle + 0.025) % (Math.PI * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 190;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.min(w, h) * 0.42;

      [0.35, 0.68, 1.0].forEach((rFrac, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * rFrac, 0, Math.PI * 2);
        if (idx === 2) {
          ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.45)' : 'rgba(154,114,9,0.45)';
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(28,25,23,0.14)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(154,114,9,0.18)';
      ctx.fill();

      const plotSource = displayedEvents.slice(0, 8);
      plotSource.forEach((ev, i) => {
        const a = (i / Math.max(plotSource.length, 1)) * Math.PI * 2 + 0.4;
        const blocked = Boolean(ev.quarantined);
        const dist = blocked ? maxR * 0.92 : maxR * 0.54;
        const px = cx + Math.cos(a) * dist;
        const py = cy + Math.sin(a) * dist;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = blocked
          ? (isDark ? 'rgba(239,68,68,0.55)' : 'rgba(190,18,60,0.48)')
          : (isDark ? 'rgba(52,211,153,0.55)' : 'rgba(4,120,87,0.48)');
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = blocked ? crimsonInk : emeraldInk;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = goldInk;
      ctx.fill();

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [displayedEvents, isDark, crimsonInk, emeraldInk, goldInk]);

  return (
    <Box sx={{ width: '100%' }}>
      <SovereignEyebrow accent={crimsonInk} right="Security & Network">
        {'agent-egress-sentinel'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'agent-egress-sentinel'}
        eyebrow={'Security & Network · v2.6.0'}
        caption={'Agent Egress Sentinel // Userspace Proxy (:8195), Pre-Relay TLS SNI & SSRF Guard'}
        label={'Agent Egress Sentinel — Zoth sovereign visualisation'}
      />

      {/* Single Dual-Theme Open-Access Support Strip */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#F3EFE6',
          border: `1px solid ${borderAccent}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            label="✦ 100% FREE & OPEN ACCESS"
            size="small"
            sx={{
              bgcolor: emeraldInk,
              color: '#FFFFFF',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.68rem',
            }}
          />
          <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: goldInk, fontWeight: 700 }}>
            Zero Paywalls · Python Stdlib Egress Proxy (:8195) &amp; Live Radar (:8095)
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              minHeight: { xs: 44, sm: 34 },
              bgcolor: goldInk,
              color: isDark ? '#08080B' : '#FFFFFF',
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#7D5B06' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyText('solana', SOLANA_TIP)}
            sx={{
              minHeight: { xs: 44, sm: 34 },
              borderColor: emeraldInk,
              color: emeraldInk,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            {copiedKey === 'solana' ? '✓ Copied Solana Tip' : '◎ Solana Tip'}
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 3,
          bgcolor: surfaceBg,
          border: `1px solid ${borderAccent}`,
          boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.55)' : '0 10px 28px rgba(28,25,23,0.06)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '0.95rem !important', color: `${daemonOnline ? emeraldInk : crimsonInk} !important` }} />}
                label={
                  probing
                    ? 'PROBING 127.0.0.1:8095...'
                    : daemonOnline
                    ? `LIVE DAEMON ONLINE (:8095 / PROXY :${proxyPort})`
                    : 'LOCAL DAEMON OFFLINE (:8095)'
                }
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  bgcolor: daemonOnline
                    ? (isDark ? 'rgba(52,211,153,0.14)' : 'rgba(4,120,87,0.1)')
                    : (isDark ? 'rgba(239,68,68,0.14)' : 'rgba(190,18,60,0.1)'),
                  color: daemonOnline ? emeraldInk : crimsonInk,
                  border: `1px solid ${daemonOnline ? emeraldInk : crimsonInk}`,
                }}
              />
              <Chip
                label={`REQS: ${stats.total_requests || 0} · DOMAINS: ${stats.total_domains || 0} · BLOCKED: ${stats.total_quarantined || 0}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  bgcolor: subtleBg,
                  color: inkPrimary,
                  border: `1px solid ${borderSubtle}`,
                }}
              />
            </Stack>
            <Typography component="h2" variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400, color: inkPrimary }}>
              Userspace Egress Proxy &amp; <span style={{ color: crimsonInk }}>SNI / SSRF Sentinel</span>
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={syncFromDaemon}
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              borderColor: borderAccent,
              color: goldInk,
            }}
          >
            Refresh :8095
          </Button>
        </Stack>

        {!daemonOnline && !probing && (
          <Alert
            severity="warning"
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7',
              color: isDark ? '#FDE68A' : '#78350F',
              border: `1px solid ${isDark ? 'rgba(245,158,11,0.35)' : 'rgba(180,83,9,0.35)'}`,
              '& .MuiAlert-icon': { color: isDark ? '#F59E0B' : '#B45309' },
            }}
            action={
              <FormControlLabel
                control={
                  <Switch
                    checked={offlinePreview}
                    onChange={(e) => setOfflinePreview(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700 }}>
                    Offline Preview
                  </Typography>
                }
              />
            }
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 700 }}>
              Local Daemon Offline — Run <code>agent-egress-sentinel serve --web-port 8095 --proxy-port 8195</code> for live proxy telemetry.
            </Typography>
          </Alert>
        )}

        {statusMessage && (
          <Alert
            severity="info"
            onClose={() => setStatusMessage('')}
            sx={{ mb: 2, borderRadius: 2, fontFamily: mono, fontSize: '0.74rem' }}
          >
            {statusMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              {/* Live Policy Control */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderSubtle}` }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: goldInk, mb: 1.25 }}>
                  LIVE QUARANTINE POLICY &amp; RULE EDITOR ({daemonOnline ? 'CONNECTED :8095' : 'DAEMON IDLE'})
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel id="studio-egress-policy-label">Quarantine Mode</InputLabel>
                  <Select
                    labelId="studio-egress-policy-label"
                    label="Quarantine Mode"
                    value={quarantineMode}
                    onChange={(e) => handleQuarantineChange(e.target.value)}
                    sx={{ minHeight: { xs: 44, sm: 38 }, fontFamily: mono, fontSize: '0.76rem' }}
                  >
                    <MenuItem value="allow_all">ALLOW ALL (Monitor + SSRF Guard)</MenuItem>
                    <MenuItem value="block_telemetry">BLOCK TELEMETRY (Defend)</MenuItem>
                    <MenuItem value="zero_egress">ZERO EGRESS (Loopback Only)</MenuItem>
                    <MenuItem value="allowlist_only">ALLOWLIST ONLY (Strict)</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Domain or Wildcard Rule"
                    placeholder="api.segment.io or *.tracker.net"
                    value={ruleDomainInput}
                    onChange={(e) => setRuleDomainInput(e.target.value)}
                    InputProps={{ sx: { minHeight: { xs: 44, sm: 38 }, fontFamily: mono, fontSize: '0.76rem' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleRuleMutation('allow', 'add', ruleDomainInput)}
                    sx={{
                      minHeight: { xs: 44, sm: 38 },
                      whiteSpace: 'nowrap',
                      bgcolor: emeraldInk,
                      color: '#FFFFFF',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                    }}
                  >
                    + Allow
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleRuleMutation('block', 'add', ruleDomainInput)}
                    sx={{
                      minHeight: { xs: 44, sm: 38 },
                      whiteSpace: 'nowrap',
                      bgcolor: crimsonInk,
                      color: '#FFFFFF',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                    }}
                  >
                    + Block
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: emeraldInk, mb: 0.5 }}>
                      ALLOWLIST ({allowedDomains.length})
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {allowedDomains.length === 0 ? (
                        <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: inkSecondary }}>None configured</Typography>
                      ) : (
                        allowedDomains.map((d) => (
                          <Chip
                            key={d}
                            label={d}
                            size="small"
                            onDelete={() => handleRuleMutation('allow', 'remove', d)}
                            deleteIcon={<DeleteOutlineIcon />}
                            sx={{ fontFamily: mono, fontSize: '0.7rem', color: inkPrimary }}
                          />
                        ))
                      )}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: crimsonInk, mb: 0.5 }}>
                      BLOCKLIST ({blockedDomains.length})
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {blockedDomains.length === 0 ? (
                        <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: inkSecondary }}>None configured</Typography>
                      ) : (
                        blockedDomains.map((d) => (
                          <Chip
                            key={d}
                            label={d}
                            size="small"
                            onDelete={() => handleRuleMutation('block', 'remove', d)}
                            deleteIcon={<DeleteOutlineIcon />}
                            sx={{ fontFamily: mono, fontSize: '0.7rem', color: inkPrimary }}
                          />
                        ))
                      )}
                    </Stack>
                  </Box>
                </Stack>

                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: inkSecondary, mt: 1.25 }}>
                  Protected Self-Control Ports: <strong>{protectedPorts.join(', ')}</strong> · SSRF Guard: RFC1918 + 169.254.0.0/16 + IPv6 ULA
                </Typography>
              </Box>

              {/* CLI & MCP Invocation Reference */}
              <Box sx={{ borderRadius: 2, bgcolor: codeBg, border: `1px solid ${borderAccent}`, overflow: 'hidden' }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 1.5, py: 0.75, borderBottom: `1px solid ${borderSubtle}` }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: goldInk, fontWeight: 800 }}>
                    LOCAL DAEMON &amp; STDIO MCP COMMANDS
                  </Typography>
                  <Button
                    size="small"
                    startIcon={copiedKey === 'cli' ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={() => handleCopyText('cli', cliSnippet)}
                    sx={{ minHeight: { xs: 44, sm: 32 }, fontFamily: mono, fontSize: '0.68rem', color: goldInk }}
                  >
                    {copiedKey === 'cli' ? 'Copied' : 'Copy CLI'}
                  </Button>
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    color: inkPrimary,
                    overflowX: 'auto',
                  }}
                >
                  {cliSnippet}
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              {/* Dual-Theme Radar Viewport */}
              <Box
                sx={{
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: `1px solid ${borderAccent}`,
                  bgcolor: radarBg,
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.85,
                    borderBottom: `1px solid ${borderSubtle}`,
                    bgcolor: subtleBg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: goldInk, fontWeight: 800 }}>
                    EGRESS RADAR ({daemonOnline ? 'LIVE :8095 STREAM' : offlinePreview ? 'OFFLINE PREVIEW' : 'IDLE'})
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: skyInk, fontWeight: 700 }}>
                    PROXY 127.0.0.1:{proxyPort}
                  </Typography>
                </Box>
                <Box
                  component="canvas"
                  ref={canvasRef}
                  aria-label="Live egress perimeter radar"
                  sx={{ width: '100%', height: 185, display: 'block' }}
                />
              </Box>

              {/* Live Captured Events (or honest empty/offline notice) */}
              <Stack spacing={1} sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {displayedEvents.length === 0 ? (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: subtleBg,
                      border: `1px dashed ${borderSubtle}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: inkSecondary }}>
                      {daemonOnline
                        ? `Connected to :8095 (${domains.length} observed domains). No captured events yet — route traffic via HTTP_PROXY=http://127.0.0.1:${proxyPort}.`
                        : 'Daemon offline. Start agent-egress-sentinel serve or toggle Offline Preview above to inspect sample frames.'}
                    </Typography>
                  </Box>
                ) : (
                  displayedEvents.slice(0, 10).map((ev) => {
                    const blocked = Boolean(ev.quarantined);
                    return (
                      <Box
                        key={ev.id}
                        sx={{
                          p: 1.35,
                          borderRadius: 2,
                          bgcolor: subtleBg,
                          border: `1px solid ${blocked ? (isDark ? 'rgba(239,68,68,0.32)' : 'rgba(190,18,60,0.3)') : (isDark ? 'rgba(52,211,153,0.32)' : 'rgba(4,120,87,0.3)')}`,
                          borderLeft: `3px solid ${blocked ? crimsonInk : emeraldInk}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: inkPrimary }}>
                            {ev.domain}:{ev.remote_port || 443}
                          </Typography>
                          <Chip
                            icon={
                              blocked ? (
                                <BlockIcon sx={{ fontSize: '0.85rem !important', color: `${crimsonInk} !important` }} />
                              ) : (
                                <CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: `${emeraldInk} !important` }} />
                              )
                            }
                            label={blocked ? 'QUARANTINED' : `${ev.method || 'OK'} ${ev.status_code || 200}`}
                            size="small"
                            sx={{
                              height: 22,
                              fontFamily: mono,
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              color: blocked ? crimsonInk : emeraldInk,
                              bgcolor: blocked
                                ? (isDark ? 'rgba(239,68,68,0.14)' : 'rgba(190,18,60,0.1)')
                                : (isDark ? 'rgba(52,211,153,0.14)' : 'rgba(4,120,87,0.1)'),
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: inkSecondary }}>
                          {ev.protocol || 'HTTPS'} · {(ev.bytes_sent || 0) + (ev.bytes_recv || 0)}B · {ev.category || 'unknown'} — {ev.notes || 'Captured via :8195 proxy'}
                        </Typography>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
