import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  TextField,
  Divider,
  MenuItem,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import SensorsIcon from '@mui/icons-material/Sensors';
import MemoryIcon from '@mui/icons-material/Memory';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

/**
 * Aether Observatory — God-Mode workstation (Layer B).
 *
 * Live client for the standalone daemon on 127.0.0.1:8160.
 * Zero simulated fallbacks; adapts cleanly to Obsidian Dark and Editorial Ivory Light themes;
 * enforces >= 44px mobile touch targets across all interactive controls.
 */
const BASE = 'http://127.0.0.1:8160';

async function api(path, { timeoutMs = 8000, method = 'GET', body } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: ctl.signal,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const pct = (n) => (typeof n === 'number' ? `${n.toFixed(1)}%` : '—');
const c1 = (n) => (typeof n === 'number' ? n.toFixed(1) : '—');

function Stat({ label, value, accent, hint }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        minWidth: 120,
        flex: '1 1 120px',
        bgcolor: 'transparent',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.2, opacity: 0.72, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Tooltip title={hint || ''} disableHoverListener={!hint}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: accent || 'text.primary', lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Tooltip>
    </Paper>
  );
}

export default function AetherObservatoryGodModeTool() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const GOLD = dark ? '#D4AF37' : '#8C6239';
  const CYAN = dark ? '#38BDF8' : '#0B7498';
  const OK = dark ? '#22C55E' : '#156A43';
  const ERR = dark ? '#EF4444' : '#AA2E24';

  const [status, setStatus] = useState('connecting'); // connecting | online | offline
  const [err, setErr] = useState(null);
  const [health, setHealth] = useState(null);
  const [live, setLive] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [totalStored, setTotalStored] = useState(0);
  const [diff, setDiff] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [triage, setTriage] = useState(null);
  const [triageBusy, setTriageBusy] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [polling, setPolling] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [filter, setFilter] = useState('');
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [h, l, n, s, p] = await Promise.all([
        api('/health'),
        api('/api/telemetry/live'),
        api('/api/constellation/nodes'),
        api('/api/timeline/snapshots?limit=120'),
        api('/api/providers').catch(() => ({ providers: [] })),
      ]);
      if (!alive.current) return;
      setHealth(h);
      setLive(l);
      setNodes(Array.isArray(n.nodes) ? n.nodes : []);
      const fr = Array.isArray(s.frames) ? s.frames : [];
      setFrames(fr);
      setTotalStored(s.totalCount ?? h.totalSnapshots ?? fr.length);
      if (Array.isArray(p?.providers) && p.providers.length) setProviders(p.providers);
      setT1((prev) => prev || (fr[fr.length - 1] ? String(fr[fr.length - 1].epoch) : ''));
      setT2((prev) => prev || (fr[0] ? String(fr[0].epoch) : ''));
      setStatus('online');
      setErr(null);
      setLastSync(new Date());
    } catch (e) {
      if (!alive.current) return;
      setStatus('offline');
      setErr(e.name === 'AbortError' ? 'request timed out' : e.message);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    refresh();
    return () => { alive.current = false; };
  }, [refresh]);

  useEffect(() => {
    if (!polling) return undefined;
    const id = setInterval(refresh, Math.max(2, intervalSec) * 1000);
    return () => clearInterval(id);
  }, [polling, intervalSec, refresh]);

  const runDiff = useCallback(async (a, b) => {
    if (!a || !b) return;
    setBusy(true);
    try {
      setDiff(await api(`/api/timeline/diff?t1=${a}&t2=${b}`));
      setErr(null);
    } catch (e) {
      setErr(e.message);
      setDiff(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const recordNow = useCallback(async () => {
    setBusy(true);
    try {
      await api('/api/snapshot/now', { method: 'POST' });
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const runTriage = useCallback(async () => {
    setTriageBusy(true);
    try {
      const res = await api('/api/ai/analyze', {
        method: 'POST',
        timeoutMs: 16000,
        body: {
          provider: selectedProvider,
          ...(t1 && t2 ? { t1: Number(t1), t2: Number(t2) } : {}),
        },
      });
      setTriage(res);
    } catch (e) {
      setTriage({ mode: 'error', summary: e.message, anomalies: [] });
    } finally {
      setTriageBusy(false);
    }
  }, [selectedProvider, t1, t2]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) =>
      [n.name, n.category, String(n.port), n.processName, String(n.pid)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)));
  }, [nodes, filter]);

  const zones = useMemo(() => {
    const z = live?.thermals?.zones || [];
    return [...z].sort((a, b) => b.celsius - a.celsius).slice(0, 8);
  }, [live]);

  const pkgTemp = live?.thermals?.packageC ?? zones[0]?.celsius ?? null;
  const zothCount = nodes.filter((n) => n.zothTool).length;

  const exportDiagnostics = useCallback((kind) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    let body;
    let name;
    if (kind === 'json') {
      body = JSON.stringify({ exportedAt: new Date().toISOString(), base: BASE, health, live, nodes, totalStored, diff, triage }, null, 2);
      name = `aether-observatory-${stamp}.json`;
    } else {
      const lines = [
        '# Aether Observatory — Telemetry Diagnostic',
        '',
        `- Exported: ${new Date().toISOString()}`,
        `- Source: ${BASE}`,
        `- Host: ${live?.hostname || 'unknown'} (${live?.platform || 'unknown'})`,
        `- Uptime: ${live?.uptimeSec ?? '—'}s`,
        '',
        '## Load & Thermals',
        '',
        `- load1: ${live?.cpu?.load1 ?? '—'}  busy: ${pct(live?.cpu?.busyPct)}  cores: ${live?.cpu?.coreCount ?? '—'}`,
        `- CPU package temp: ${pkgTemp != null ? `${pkgTemp}°C` : '—'}`,
        `- fan: ${live?.thermals?.fanRpm != null ? `${live.thermals.fanRpm} RPM` : '—'}`,
        `- memory used: ${pct(live?.memory?.usedPct)}`,
        '',
        '## Live listeners',
        '',
        '| port | proto | name | category | pid | latency ms | zoth tool |',
        '| --- | --- | --- | --- | --- | --- | --- |',
        ...nodes.map((n) => `| ${n.port} | ${n.proto || 'tcp'} | ${n.name || ''} | ${n.category || ''} | ${n.pid ?? ''} | ${n.latencyMs ?? ''} | ${n.zothTool ? 'yes' : 'no'} |`),
        '',
        '## Timeline diff',
        '',
        diff
          ? `- window: ${diff.t1?.ts} → ${diff.t2?.ts} (${diff.windowSec ?? 0}s)\n- spawned ports: ${(diff.spawnedPorts || []).join(', ') || 'none'}\n- terminated ports: ${(diff.terminatedPorts || []).join(', ') || 'none'}\n- load delta: ${diff.loadDelta}  busy delta: ${diff.busyDeltaPct}%  thermal delta: ${diff.thermalDeltaC}°C`
          : '- no diff computed',
        '',
      ];
      body = lines.join('\n');
      name = `aether-observatory-${stamp}.md`;
    }
    const blob = new Blob([body], { type: kind === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [health, live, nodes, totalStored, diff, triage, pkgTemp]);

  const statusColor = status === 'online' ? OK : status === 'connecting' ? GOLD : ERR;
  const tapBtnSx = { fontFamily: 'monospace', minHeight: 44 };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Dual-theme adaptive header telemetry ribbon (zero black slab in Light Mode) */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          borderColor: dark ? 'rgba(212,175,55,0.28)' : 'rgba(140,98,57,0.32)',
          background: dark
            ? 'linear-gradient(90deg, rgba(13,18,32,0.92), rgba(16,24,40,0.86))'
            : 'linear-gradient(90deg, rgba(247,244,235,0.96), rgba(242,238,225,0.94))',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: GOLD }}>
            AETHER-OBSERVATORY · ZERO-EGRESS TELEMETRY · 127.0.0.1:8160 · MCP STDIO
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: CYAN }}>
            {live ? `CPU ${pct(live.cpu?.busyPct)} · PKG ${pkgTemp ?? '—'}°C · ${nodes.length} SOCKETS` : 'READY FOR LOOPBACK DAEMON'}
          </Typography>
        </Stack>
      </Paper>

      <SovereignEyebrow accent={GOLD}>Layer B · God-Mode Workstation</SovereignEyebrow>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            Aether Observatory
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.78 }}>
            Sovereign cyber-physical telemetry · 3D constellation · acoustic sonification · flight recorder · MCP
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            icon={<SensorsIcon sx={{ fontSize: 16 }} />}
            label={status.toUpperCase()}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              minHeight: 36,
              bgcolor: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}66`,
            }}
          />
          {lastSync && (
            <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.72 }}>
              sync {lastSync.toLocaleTimeString()}
            </Typography>
          )}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} sx={tapBtnSx}>
            Refresh
          </Button>
          <Button
            variant={polling ? 'contained' : 'outlined'}
            onClick={() => setPolling((p) => !p)}
            sx={tapBtnSx}
          >
            {polling ? 'Polling on' : 'Polling off'}
          </Button>
          <TextField
            select
            size="small"
            label="Cadence"
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            sx={{ width: 108, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12 } }}
          >
            {[2, 5, 10, 30].map((s) => (
              <MenuItem key={s} value={s} sx={{ fontFamily: 'monospace', fontSize: 12 }}>{s}s</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {status === 'offline' && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2, borderColor: `${ERR}88`, bgcolor: dark ? '#2a1212' : '#FEF2F2' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: ERR, fontFamily: 'monospace', fontSize: 13 }}>
                Observatory daemon not reachable at {BASE}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.85, mt: 0.5 }}>
                {err ? `reason: ${err}` : 'no response'}. Start it with <code>aether-observatory serve --port 8160</code>, then click Refresh.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              href={`${BASE}/?theme=${dark ? 'dark' : 'light'}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ...tapBtnSx, whiteSpace: 'nowrap' }}
            >
              Open :8160
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Stat label="CPU" value={live?.cpu?.model ? live.cpu.model.split('@')[0].trim() : '—'} hint={live?.cpu?.model} />
        <Stat label="Load 1m" value={c1(live?.cpu?.load1)} accent={CYAN} />
        <Stat label="Busy" value={pct(live?.cpu?.busyPct)} accent={CYAN} />
        <Stat label="Cores" value={live?.cpu?.coreCount ?? '—'} />
        <Stat label="Mem used" value={pct(live?.memory?.usedPct)} />
        <Stat
          label="CPU Pkg"
          value={pkgTemp != null ? `${pkgTemp}°C` : '—'}
          accent={pkgTemp != null && pkgTemp > 75 ? ERR : OK}
          hint={live?.thermals?.fanRpm ? `Fan: ${live.thermals.fanRpm} RPM` : 'Package id 0 / x86_pkg_temp'}
        />
        <Stat label="Listeners" value={live?.listening?.count ?? nodes.length ?? '—'} />
        <Stat label="Zoth tools" value={`${zothCount}/${nodes.length}`} accent={GOLD} />
        <Stat label="Stored" value={totalStored.toLocaleString()} accent={GOLD} />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' }, gap: 2 }}>
        {/* Constellation */}
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
              LIVE CONSTELLATION · {filtered.length} NODES
            </Typography>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              label="Filter"
              placeholder="port / name / pid"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ width: { xs: '100%', sm: 220 }, '& .MuiInputBase-root': { minHeight: 44 }, '& input': { fontFamily: 'monospace', fontSize: 12 } }}
            />
          </Stack>
          <Box sx={{ maxHeight: 390, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                  <th style={{ padding: '6px' }}>PORT</th>
                  <th style={{ padding: '6px' }}>PROTO</th>
                  <th style={{ padding: '6px' }}>NAME</th>
                  <th style={{ padding: '6px' }}>CATEGORY</th>
                  <th style={{ padding: '6px' }}>PID</th>
                  <th style={{ padding: '6px' }}>LAT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={`${n.port}-${n.pid}-${n.proto}`} style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                    <td style={{ padding: '6px', color: n.zothTool ? GOLD : undefined, fontWeight: n.zothTool ? 700 : 400 }}>
                      {n.port}
                    </td>
                    <td style={{ padding: '6px', opacity: 0.72 }}>{n.proto || 'tcp'}</td>
                    <td style={{ padding: '6px' }}>{n.name || n.processName || '—'}</td>
                    <td style={{ padding: '6px', opacity: 0.78 }}>{n.category || 'System'}</td>
                    <td style={{ padding: '6px', opacity: 0.78 }}>{n.pid ?? '—'}</td>
                    <td style={{ padding: '6px', color: n.latencyMs != null && n.latencyMs > 200 ? ERR : undefined }}>
                      {n.latencyMs != null ? `${n.latencyMs}ms` : '—'}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, opacity: 0.65 }}>
                      {status === 'online' ? 'no listeners match this filter' : 'awaiting daemon…'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>

        <Stack spacing={2}>
          {/* Thermals */}
          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1, mb: 1.5 }}>
              THERMAL ZONES
            </Typography>
            <Stack spacing={0.75}>
              {zones.map((z) => (
                <Box key={z.zone}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 11 }}>{z.label || z.zone}</Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: z.celsius > 75 ? ERR : GOLD }}>
                      {z.celsius}°C
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (z.celsius / 100) * 100)}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: 'divider',
                      '& .MuiLinearProgress-bar': { bgcolor: z.celsius > 75 ? ERR : z.celsius > 58 ? GOLD : CYAN },
                    }}
                  />
                </Box>
              ))}
              {!zones.length && (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.65 }}>no thermal zones reported</Typography>
              )}
            </Stack>
          </Paper>

          {/* Flight recorder */}
          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <HistoryIcon sx={{ fontSize: 16, color: GOLD }} />
              <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
                FLIGHT RECORDER
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" disabled={busy || status !== 'online'} onClick={recordNow} sx={{ ...tapBtnSx, fontSize: 11 }}>
                Record now
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
              <TextField
                select
                size="small"
                label="From (T1)"
                value={t1}
                onChange={(e) => setT1(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 11 } }}
              >
                {frames.map((f) => (
                  <MenuItem key={`a${f.epoch}`} value={String(f.epoch)} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {f.ts.slice(11, 19)} · L{f.load1} · {f.packageC ?? '—'}°C
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="To (T2)"
                value={t2}
                onChange={(e) => setT2(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 11 } }}
              >
                {frames.map((f) => (
                  <MenuItem key={`b${f.epoch}`} value={String(f.epoch)} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {f.ts.slice(11, 19)} · L{f.load1} · {f.packageC ?? '—'}°C
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                disabled={busy || !t1 || !t2 || status !== 'online'}
                onClick={() => runDiff(t1, t2)}
                sx={tapBtnSx}
              >
                Diff
              </Button>
            </Stack>
            {diff ? (
              <Box sx={{ fontFamily: 'monospace', fontSize: 11.5, lineHeight: 1.7 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.72 }}>
                  {diff.t1?.ts} → {diff.t2?.ts} ({diff.windowSec ?? 0}s)
                </Typography>
                <Box>spawned ports: {diff.spawnedPorts?.length ? diff.spawnedPorts.join(', ') : 'none'}</Box>
                <Box>terminated ports: {diff.terminatedPorts?.length ? diff.terminatedPorts.join(', ') : 'none'}</Box>
                <Box>load Δ {diff.loadDelta} · busy Δ {diff.busyDeltaPct}% · thermal Δ {diff.thermalDeltaC}°C{diff.thermalSpike ? ' ⚠ spike' : ''}</Box>
                <Box>mem Δ {diff.memDeltaPct}% · process Δ {diff.processDelta}</Box>
              </Box>
            ) : (
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.65 }}>
                {frames.length ? 'pick two frames and run a diff' : 'no snapshots recorded yet'}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportDiagnostics('md')} sx={{ ...tapBtnSx, fontSize: 11 }}>
                Markdown
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportDiagnostics('json')} sx={{ ...tapBtnSx, fontSize: 11 }}>
                JSON
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                endIcon={<OpenInNewIcon />}
                href={`${BASE}/?theme=${dark ? 'dark' : 'light'}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...tapBtnSx, fontSize: 11 }}
              >
                3D deck
              </Button>
            </Stack>
          </Paper>

          {/* Sovereign AI Anomaly Triage */}
          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: CYAN }} />
              <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
                SOVEREIGN AI TRIAGE
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Provider"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 11 } }}
              >
                <MenuItem value="auto" sx={{ fontFamily: 'monospace', fontSize: 11 }}>Auto (Best Local)</MenuItem>
                {providers.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {p.label}{!p.available ? ' (offline)' : p.guarded ? ' (guarded)' : ''}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                disabled={triageBusy || status !== 'online'}
                onClick={runTriage}
                sx={tapBtnSx}
              >
                {triageBusy ? 'Analyzing…' : 'Run Triage'}
              </Button>
            </Stack>
            {triage ? (
              <Box sx={{ fontFamily: 'monospace', fontSize: 11.5, lineHeight: 1.6 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 10.5, opacity: 0.7, mb: 0.5 }}>
                  mode: {triage.mode} · provider: {triage.provider} ({triage.model || 'n/a'}) · {triage.latencyMs ?? 0}ms
                </Typography>
                <Typography sx={{ fontSize: 12.5, mb: 0.75 }}>{triage.summary}</Typography>
                {(triage.anomalies || []).length > 0 && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {triage.anomalies.map((a, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        label={`${String(a.severity || 'info').toUpperCase()}: ${a.detail}`}
                        sx={{ fontFamily: 'monospace', fontSize: 10.5 }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            ) : (
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.65 }}>
                Runs AGY Bridge (:18000), Ollama (:11434), or deterministic offline rules over live telemetry &amp; diffs.
              </Typography>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.75, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MemoryIcon sx={{ fontSize: 16, color: CYAN }} />
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.85 }}>
                {health ? `daemon v${health.version} · uptime ${Math.floor((health.uptimeSec || 0) / 60)}m · db ${health.db ? 'attached' : 'none'} · ${totalStored.toLocaleString()} frames` : 'daemon metadata unavailable'}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
