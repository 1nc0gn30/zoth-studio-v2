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
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

/**
 * Aether Observatory — God-Mode workstation (Layer B).
 *
 * Live client for the standalone flagship daemon on :8160. Every panel is
 * backed by a real HTTP call to the local observatory API — no canned data.
 * When the daemon is unreachable the component reports the real failure and
 * links out to the standalone workstation instead of inventing output.
 */
const BASE = 'http://127.0.0.1:8160';
const GOLD = '#D4AF37';
const CYAN = '#38BDF8';

async function api(path, timeoutMs = 4000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
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
      <Typography sx={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.2, opacity: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Tooltip title={hint || ''} disableHoverListener={!hint}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 19, fontWeight: 600, color: accent || 'text.primary', lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Tooltip>
    </Paper>
  );
}

export default function AetherObservatoryGodModeTool() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const [status, setStatus] = useState('connecting'); // connecting | live | offline
  const [err, setErr] = useState(null);
  const [health, setHealth] = useState(null);
  const [live, setLive] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [diff, setDiff] = useState(null);
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
      const [h, l, n, s] = await Promise.all([
        api('/health'),
        api('/api/telemetry/live'),
        api('/api/constellation/nodes'),
        api('/api/timeline/snapshots?limit=120'),
      ]);
      if (!alive.current) return;
      setHealth(h);
      setLive(l);
      setNodes(Array.isArray(n.nodes) ? n.nodes : []);
      const fr = Array.isArray(s.frames) ? s.frames : [];
      setFrames(fr);
      setT1((prev) => prev || (fr[0] ? String(fr[0].epoch) : ''));
      setT2((prev) => prev || (fr[fr.length - 1] ? String(fr[fr.length - 1].epoch) : ''));
      setStatus('live');
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
      await api('/api/snapshot/now');
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }, [refresh]);

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

  const maxZone = zones[0];
  const zothCount = nodes.filter((n) => n.zothTool).length;

  const exportDiagnostics = useCallback((kind) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    let body;
    let name;
    if (kind === 'json') {
      body = JSON.stringify({ exportedAt: new Date().toISOString(), base: BASE, health, live, nodes, frames: frames.length, diff }, null, 2);
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
        '## Load',
        '',
        `- load1: ${live?.cpu?.load1 ?? '—'}  busy: ${pct(live?.cpu?.busyPct)}  cores: ${live?.cpu?.coreCount ?? '—'}`,
        `- package temp: ${maxZone ? `${maxZone.label} ${maxZone.celsius}C` : '—'}`,
        `- memory used: ${pct(live?.memory?.usedPct)}`,
        '',
        '## Live listeners',
        '',
        '| port | name | category | pid | latency ms | zoth tool |',
        '| --- | --- | --- | --- | --- | --- |',
        ...nodes.map((n) => `| ${n.port} | ${n.name || ''} | ${n.category || ''} | ${n.pid ?? ''} | ${n.latencyMs ?? ''} | ${n.zothTool ? 'yes' : 'no'} |`),
        '',
        '## Timeline diff',
        '',
        diff
          ? `- window: ${diff.t1?.ts} → ${diff.t2?.ts}\n- spawned ports: ${(diff.spawnedPorts || []).join(', ') || 'none'}\n- terminated ports: ${(diff.terminatedPorts || []).join(', ') || 'none'}\n- load delta: ${diff.loadDelta}  busy delta: ${diff.busyDeltaPct}%  thermal delta: ${diff.thermalDeltaC}C`
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
  }, [health, live, nodes, frames.length, diff, maxZone]);

  const statusColor = status === 'live' ? '#22C55E' : status === 'connecting' ? GOLD : '#EF4444';

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <SovereignBand />
      <SovereignEyebrow accent={GOLD}>Layer B · God-Mode Workstation</SovereignEyebrow>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            Aether Observatory
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.7 }}>
            Sovereign cyber-physical telemetry · 3D constellation · acoustic sonification · flight recorder
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            icon={<SensorsIcon sx={{ fontSize: 15 }} />}
            label={status.toUpperCase()}
            sx={{ fontFamily: 'monospace', bgcolor: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}66` }}
          />
          {lastSync && (
            <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.6 }}>
              sync {lastSync.toLocaleTimeString()}
            </Typography>
          )}
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} sx={{ fontFamily: 'monospace' }}>
            Refresh
          </Button>
          <Button
            size="small"
            variant={polling ? 'contained' : 'outlined'}
            onClick={() => setPolling((p) => !p)}
            sx={{ fontFamily: 'monospace' }}
          >
            {polling ? 'Polling on' : 'Polling off'}
          </Button>
          <TextField
            select
            size="small"
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            sx={{ width: 96, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12 } }}
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
          sx={{ p: 2, mb: 2, borderColor: '#EF444488', bgcolor: dark ? '#2a1212' : '#FEF2F2' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#EF4444', fontFamily: 'monospace', fontSize: 13 }}>
                Observatory daemon not reachable at {BASE}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.85, mt: 0.5 }}>
                {err ? `reason: ${err}` : 'no response'}. This workstation reads the standalone daemon live — no cached
                or simulated values are shown. Start it with{' '}
                <code>aether-observatory serve --port 8160</code> (or <code>npm start</code> in the repo), then refresh.
                If the daemon is already up, its JSON API may predate the CORS header added in
                <code> src/server.js</code> — restart it to pick that up.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              href={BASE}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
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
          label="Pkg temp"
          value={maxZone ? `${maxZone.celsius}°C` : '—'}
          accent={maxZone && maxZone.celsius > 72 ? '#EF4444' : '#22C55E'}
          hint={maxZone ? `${maxZone.label} (${maxZone.zone})` : ''}
        />
        <Stat label="Listeners" value={live?.listening?.count ?? live?.listening?.ports?.length ?? nodes.length ?? '—'} />
        <Stat label="Zoth tools" value={`${zothCount}/${nodes.length}`} accent={GOLD} />
        <Stat label="Snapshots" value={frames.length} accent={GOLD} />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' }, gap: 2 }}>
        {/* Constellation */}
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
              LIVE CONSTELLATION · {filtered.length} NODES
            </Typography>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              placeholder="filter port / name / pid"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ width: 220, '& input': { fontFamily: 'monospace', fontSize: 12 } }}
            />
          </Stack>
          <Box sx={{ maxHeight: 380, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                  <th style={{ padding: '4px 6px' }}>PORT</th>
                  <th style={{ padding: '4px 6px' }}>NAME</th>
                  <th style={{ padding: '4px 6px' }}>CATEGORY</th>
                  <th style={{ padding: '4px 6px' }}>PID</th>
                  <th style={{ padding: '4px 6px' }}>UP</th>
                  <th style={{ padding: '4px 6px' }}>LAT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={`${n.port}-${n.pid}-${n.proto}`} style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                    <td style={{ padding: '4px 6px', color: n.zothTool ? GOLD : undefined, fontWeight: n.zothTool ? 700 : 400 }}>
                      {n.port}
                    </td>
                    <td style={{ padding: '4px 6px' }}>{n.name || n.processName || '—'}</td>
                    <td style={{ padding: '4px 6px', opacity: 0.75 }}>{n.category || 'System'}</td>
                    <td style={{ padding: '4px 6px', opacity: 0.75 }}>{n.pid ?? '—'}</td>
                    <td style={{ padding: '4px 6px', opacity: 0.75 }}>
                      {typeof n.uptimeSec === 'number' ? `${Math.floor(n.uptimeSec / 60)}m` : '—'}
                    </td>
                    <td style={{ padding: '4px 6px', color: n.latencyMs != null && n.latencyMs > 200 ? '#EF4444' : undefined }}>
                      {n.latencyMs != null ? `${n.latencyMs}` : '—'}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, opacity: 0.6 }}>
                      {status === 'live' ? 'no listeners match this filter' : 'awaiting daemon…'}
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
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: z.celsius > 72 ? '#EF4444' : GOLD }}>
                      {z.celsius}°C
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (z.celsius / 100) * 100)}
                    sx={{
                      height: 5,
                      borderRadius: 1,
                      bgcolor: 'divider',
                      '& .MuiLinearProgress-bar': { bgcolor: z.celsius > 72 ? '#EF4444' : z.celsius > 55 ? GOLD : CYAN },
                    }}
                  />
                </Box>
              ))}
              {!zones.length && (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.6 }}>no thermal zones reported</Typography>
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
              <Button size="small" variant="outlined" disabled={busy || status !== 'live'} onClick={recordNow} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                Record now
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
              <TextField
                select
                size="small"
                label="From"
                value={t1}
                onChange={(e) => setT1(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 11 } }}
              >
                {frames.map((f) => (
                  <MenuItem key={`a${f.epoch}`} value={String(f.epoch)} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {f.ts} · L{f.load1} · {f.packageC}°C
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="To"
                value={t2}
                onChange={(e) => setT2(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 11 } }}
              >
                {frames.map((f) => (
                  <MenuItem key={`b${f.epoch}`} value={String(f.epoch)} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {f.ts} · L{f.load1} · {f.packageC}°C
                  </MenuItem>
                ))}
              </TextField>
              <Button
                size="small"
                variant="contained"
                disabled={busy || !t1 || !t2 || status !== 'live'}
                onClick={() => runDiff(t1, t2)}
                sx={{ fontFamily: 'monospace' }}
              >
                Diff
              </Button>
            </Stack>
            {diff ? (
              <Box sx={{ fontFamily: 'monospace', fontSize: 11.5, lineHeight: 1.7 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.65 }}>
                  {diff.t1?.ts} → {diff.t2?.ts}
                </Typography>
                <Box>spawned ports: {diff.spawnedPorts?.length ? diff.spawnedPorts.join(', ') : 'none'}</Box>
                <Box>terminated ports: {diff.terminatedPorts?.length ? diff.terminatedPorts.join(', ') : 'none'}</Box>
                <Box>load Δ {diff.loadDelta} · busy Δ {diff.busyDeltaPct}% · thermal Δ {diff.thermalDeltaC}°C{diff.thermalSpike ? ' ⚠ spike' : ''}</Box>
                <Box>mem Δ {diff.memDeltaPct}% · process Δ {diff.processDelta}</Box>
              </Box>
            ) : (
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.6 }}>
                {frames.length ? 'pick two frames and run a diff' : 'no snapshots recorded yet'}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportDiagnostics('md')} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                Markdown
              </Button>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportDiagnostics('json')} sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                JSON
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                endIcon={<OpenInNewIcon />}
                href={`${BASE}/`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontFamily: 'monospace', fontSize: 11 }}
              >
                3D deck
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MemoryIcon sx={{ fontSize: 16, color: CYAN }} />
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.8 }}>
                {health ? `daemon v${health.version} · uptime ${Math.floor((health.uptimeSec || 0) / 60)}m · db ${health.db ? 'attached' : 'none'}` : 'daemon metadata unavailable'}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
