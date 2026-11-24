import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  MONO,
  rgba,
} from '../sovereign';
import { isLocalRuntime } from '../../utils/sovereignRuntime';

const DEFAULT_PORT = 8190;
const BASE = `http://127.0.0.1:${DEFAULT_PORT}`;
const ACCENT_DARK = '#34D399';
const ACCENT_LIGHT = '#047857';

const BOT_OS_MODULES = [
  {
    index: '01',
    name: 'Chat & Dynamic Models',
    endpoint: '/api/models · /api/chat/run · /api/chat/stream/<id>',
    desc: 'Multi-engine deck for Hermes, Antigravity (AGY), and Cove with dynamic model discovery, reasoning effort controls, SSE streaming, and file uploads.',
  },
  {
    index: '02',
    name: 'Chronicle Convos',
    endpoint: '/api/convos · /api/continuity',
    desc: 'Live proxy to Chronicle Vault (:8161) for SQLite FTS5 transcript search, open continuity loop resolution, and thread resume directly into Chat.',
  },
  {
    index: '03',
    name: 'Social Browser Recorder & Scheduler',
    endpoint: '/api/social/* · social_scheduler',
    desc: 'Persistent Chrome profiles for Instagram, YouTube, and X with click/type JSON playbook recording, scheduled runs, and confirmation screenshots.',
  },
  {
    index: '04',
    name: 'Netlify Cove',
    endpoint: '/api/cove/sites · /api/cove/search',
    desc: 'Live Netlify site inventory, local Cove Knowledge Base full-text search, and one-click Ask Cove context injection into active prompts.',
  },
  {
    index: '05',
    name: 'Host Telemetry & Android APK v1.4.0',
    endpoint: '/api/system/telemetry · /api/macros',
    desc: 'Live host RAM, disk, CPU thermal zones, and GPU VRAM gauges, Tailscale HTTPS Serve pairing, and standalone Android APK v1.4.0 / PWA install.',
  },
];

const DEFAULT_MACROS = [
  {
    id: 'fleet-health',
    name: 'Fleet Health',
    category: 'system',
    description: 'Live status of Zoth Bot OS (:8190), Chronicle Vault (:8161), Zoth Studio (:3000), and host telemetry.',
  },
  {
    id: 'cove-summary',
    name: 'Cove Summary',
    category: 'cove',
    description: 'Cove knowledge base doc count and live Netlify site count from cove_bridge.',
  },
  {
    id: 'social-queue',
    name: 'Social Queue',
    category: 'social',
    description: 'Scheduled social automation jobs count and next due job from social_scheduler.',
  },
  {
    id: 'comfy-status',
    name: 'Comfy Status',
    category: 'media',
    description: 'Live zoth-comfy status --json readiness, key source, and available presets.',
  },
];

const CLI_MODES = [
  { id: 'status', label: 'Daemon Status' },
  { id: 'serve', label: 'Start Server' },
  { id: 'macro-curl', label: 'Probe Macro API' },
  { id: 'telemetry-curl', label: 'Host Telemetry' },
  { id: 'systemd', label: 'Systemd Service' },
  { id: 'tailscale', label: 'Tailscale HTTPS' },
  { id: 'install', label: 'Clone & Install' },
];

async function probeLocalJson(path, timeoutMs = 2800) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, status: res.status, data: null };
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

export default function ZothBotOSGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const [localEnv] = useState(() => isLocalRuntime());
  const [connStatus, setConnStatus] = useState(() => (isLocalRuntime() ? 'syncing' : 'offline'));
  const [health, setHealth] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [macros, setMacros] = useState(DEFAULT_MACROS);
  const [macrosLive, setMacrosLive] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [lastProbe, setLastProbe] = useState(null);

  const [selectedMacro, setSelectedMacro] = useState('fleet-health');
  const [cliMode, setCliMode] = useState('status');
  const [portInput, setPortInput] = useState(String(DEFAULT_PORT));
  const [includeToken, setIncludeToken] = useState(false);

  const alive = useRef(true);

  const probeDaemon = useCallback(async () => {
    if (!isLocalRuntime()) {
      setConnStatus('offline');
      return;
    }
    setConnStatus('syncing');
    const [hRes, tRes, mRes] = await Promise.all([
      probeLocalJson('/health'),
      probeLocalJson('/api/system/telemetry'),
      probeLocalJson('/api/macros'),
    ]);
    if (!alive.current) return;

    if (hRes.ok && hRes.data?.ok) {
      setHealth(hRes.data);
      setConnStatus('online');
      setLastProbe(new Date());
      setAuthRequired(tRes.status === 401 || mRes.status === 401);
      if (tRes.ok && tRes.data?.ok) {
        setTelemetry(tRes.data);
      } else {
        setTelemetry(null);
      }
      if (mRes.ok && Array.isArray(mRes.data?.macros) && mRes.data.macros.length > 0) {
        setMacros(mRes.data.macros);
        setMacrosLive(true);
      } else {
        setMacrosLive(false);
      }
    } else {
      setHealth(null);
      setTelemetry(null);
      setMacrosLive(false);
      setAuthRequired(false);
      setConnStatus('offline');
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    if (localEnv) {
      probeDaemon();
    }
    return () => {
      alive.current = false;
    };
  }, [localEnv, probeDaemon]);

  const sanitizedPort = useMemo(() => {
    const n = parseInt(portInput, 10);
    return Number.isFinite(n) && n >= 1024 && n <= 65535 ? n : DEFAULT_PORT;
  }, [portInput]);

  const activeMacroObj = useMemo(
    () => macros.find((m) => m.id === selectedMacro) || macros[0] || DEFAULT_MACROS[0],
    [macros, selectedMacro],
  );

  const generatedCommand = useMemo(() => {
    const authFlag = includeToken ? ' -H "Authorization: Bearer $ZOTH_BOT_TOKEN"' : '';
    switch (cliMode) {
      case 'serve':
        return `zoth-bot-os serve --port ${sanitizedPort}`;
      case 'macro-curl':
        return `curl -sS${authFlag} http://127.0.0.1:${sanitizedPort}/api/macros | python3 -m json.tool\n# Execute macro "${activeMacroObj.id}":\ncurl -sS -X POST${authFlag} -H "Content-Type: application/json" -d '{"id":"${activeMacroObj.id}"}' http://127.0.0.1:${sanitizedPort}/api/macros/run`;
      case 'telemetry-curl':
        return `curl -sS${authFlag} http://127.0.0.1:${sanitizedPort}/api/system/telemetry | python3 -m json.tool`;
      case 'systemd':
        return `systemctl --user status zoth-bot-os.service\nsystemctl --user restart zoth-bot-os.service`;
      case 'tailscale':
        return `tailscale serve --bg --https=${sanitizedPort} http://127.0.0.1:${sanitizedPort}\ntailscale serve status`;
      case 'install':
        return `git clone https://github.com/1nc0gn30/zoth-bot-os.git\ncd zoth-bot-os\npython3 server.py --port ${sanitizedPort}`;
      case 'status':
      default:
        return `zoth-bot-os status && zoth-bot-os models && zoth-bot-os system`;
    }
  }, [cliMode, sanitizedPort, includeToken, activeMacroObj.id]);

  const handleExportSpec = () => {
    downloadJson('zoth-bot-os-command-spec.json', {
      tool: 'zoth-bot-os',
      version: health?.version || '1.4.0',
      daemon_connected: connStatus === 'online',
      port: sanitizedPort,
      selected_macro: activeMacroObj,
      cli_mode: cliMode,
      command: generatedCommand,
      modules: BOT_OS_MODULES,
      telemetry: telemetry || null,
      exported_at: new Date().toISOString(),
    });
  };

  const isOnline = connStatus === 'online';
  const ramPct = telemetry?.ram?.available ? telemetry.ram.used_pct : null;
  const diskPct = telemetry?.disk?.available ? telemetry.disk.used_pct : null;
  const cpuTemp = telemetry?.cpu?.available ? telemetry.cpu.temp_c : null;

  const kpis = [
    {
      label: 'Daemon :8190',
      value: isOnline ? 'Connected' : 'Offline',
      status: isOnline ? `v${health?.version || '1.4.0'}` : 'LOCAL ONLY',
      accent: isOnline ? '#34D399' : '#F59E0B',
    },
    {
      label: 'Host RAM',
      value: ramPct != null ? `${ramPct}%` : 'Local Only',
      unit: telemetry?.ram?.available
        ? `${(telemetry.ram.used_mb / 1024).toFixed(1)}/${(telemetry.ram.total_mb / 1024).toFixed(0)} GB`
        : undefined,
      accent: '#38BDF8',
    },
    {
      label: 'Disk / Thermal',
      value: diskPct != null ? `${diskPct}%` : '5 Modules',
      unit: cpuTemp != null ? `${cpuTemp}°C CPU` : 'APK v1.4.0',
      accent: '#D4AF37',
    },
    {
      label: 'Macros',
      value: String(macros.length),
      unit: macrosLive ? 'live API' : 'built-in spec',
      accent: '#C084FC',
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={isOnline ? 'online' : connStatus === 'syncing' ? 'syncing' : 'offline'}
        label={
          isOnline
            ? 'Connected to Local Daemon :8190'
            : connStatus === 'syncing'
            ? 'Probing 127.0.0.1:8190...'
            : 'Local Daemon Offline — Install & Run on ZothOS'
        }
        port={isOnline ? DEFAULT_PORT : undefined}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
      {lastProbe && isOnline && (
        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
          verified {lastProbe.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );

  const actions = [
    ...(localEnv
      ? [{ label: 'Re-Probe :8190', icon: <RefreshIcon fontSize="small" />, onClick: probeDaemon }]
      : []),
    {
      label: copied === 'cmd' ? 'Copied Command' : 'Copy CLI Command',
      icon: copied === 'cmd' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(generatedCommand, 'cmd'),
    },
    {
      label: 'Export Spec JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleExportSpec,
    },
    ...(localEnv && isOnline
      ? [
          {
            label: 'Launch Local Daemon :8190',
            icon: <OpenInNewIcon fontSize="small" />,
            href: BASE,
            primary: true,
          },
        ]
      : [
          {
            label: 'Get zoth-bot-os on GitHub',
            icon: <GitHubIcon fontSize="small" />,
            href: 'https://github.com/1nc0gn30/zoth-bot-os',
            primary: true,
          },
        ]),
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="FIVE INTEGRATED MODULES"
        title="Zoth Bot OS Architecture"
        subtitle="Runs locally on 127.0.0.1:8190 or privately over your Tailscale tailnet"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {BOT_OS_MODULES.map((mod) => (
            <Box
              key={mod.index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  <Box component="span" sx={{ fontFamily: MONO, color: accent, mr: 0.75 }}>
                    {mod.index}
                  </Box>
                  {mod.name}
                </Typography>
                <Chip
                  label={mod.endpoint}
                  size="small"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.64rem',
                    height: 20,
                    maxWidth: '100%',
                    bgcolor: rgba(accent, 0.1),
                    color: accent,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                {mod.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="HOST TELEMETRY (:8190)"
        title={isOnline ? 'Live Local Host Gauges' : 'Local Telemetry Preview'}
        subtitle={
          isOnline
            ? `Streaming directly from ${BASE}/api/system/telemetry`
            : 'Telemetry reads /proc, disk usage, thermal zones, and GPU VRAM only when running locally'
        }
        accent={accent}
      >
        {isOnline && telemetry ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {telemetry.ram?.available && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700 }}>RAM</Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: 11.5, color: 'text.secondary' }}>
                    {(telemetry.ram.used_mb / 1024).toFixed(1)} / {(telemetry.ram.total_mb / 1024).toFixed(1)} GB ({telemetry.ram.used_pct}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Number(telemetry.ram.used_pct) || 0)}
                  sx={{ height: 7, borderRadius: 4 }}
                />
              </Box>
            )}
            {telemetry.disk?.available && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700 }}>
                    DISK ({telemetry.disk.mount || '/'})
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: 11.5, color: 'text.secondary' }}>
                    {telemetry.disk.used_gb} / {telemetry.disk.total_gb} GB ({telemetry.disk.used_pct}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Number(telemetry.disk.used_pct) || 0)}
                  sx={{ height: 7, borderRadius: 4 }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {telemetry.cpu?.available && (
                <Chip
                  size="small"
                  label={`CPU Thermal: ${telemetry.cpu.temp_c}°C`}
                  sx={{ fontFamily: MONO, fontSize: 11 }}
                />
              )}
              {telemetry.gpu?.available && (
                <Chip
                  size="small"
                  label={`GPU: ${telemetry.gpu.name || 'Detected'} (${telemetry.gpu.vram_used_pct ?? 0}% VRAM)`}
                  sx={{ fontFamily: MONO, fontSize: 11 }}
                />
              )}
              {health?.active_jobs != null && (
                <Chip
                  size="small"
                  label={`Active Agent Jobs: ${health.active_jobs}`}
                  sx={{ fontFamily: MONO, fontSize: 11 }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
            {authRequired
              ? 'Local daemon :8190 responded on /health, and Bearer token auth is enabled for /api/system/telemetry. Pass ZOTH_BOT_TOKEN in the CLI builder on the right.'
              : 'No local daemon was reached at http://127.0.0.1:8190 from this browser session. Install Zoth Bot OS on Linux or ZothOS to read live RAM, disk, thermal, and GPU telemetry and pair the Android APK v1.4.0.'}
          </Typography>
        )}
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="INTERACTIVE MACRO & CLI BUILDER"
        title="Command & Automation Workbench"
        subtitle="Select a macro and execution mode to generate exact local CLI, systemd, or curl commands"
        accent={accent}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
          1. SELECT MACRO ({macrosLive ? 'LIVE FROM :8190/api/macros' : '4 BUILT-IN MACROS'})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {macros.map((m) => {
            const active = m.id === activeMacroObj.id;
            return (
              <Chip
                key={m.id}
                label={`${m.name} (${m.category || 'macro'})`}
                clickable
                onClick={() => setSelectedMacro(m.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box
          sx={{
            p: 1.35,
            mb: 2,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
          }}
        >
          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: accent }}>
            MACRO: {activeMacroObj.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.35 }}>
            {activeMacroObj.description}
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
          2. SELECT COMMAND MODE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 2 }}>
          {CLI_MODES.map((mode) => {
            const active = mode.id === cliMode;
            return (
              <Chip
                key={mode.id}
                label={mode.label}
                size="small"
                clickable
                onClick={() => setCliMode(mode.id)}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.18) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.28)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            label="Loopback Port"
            value={portInput}
            onChange={(e) => setPortInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            sx={{ width: 150, '& input': { fontFamily: MONO, fontSize: 13 } }}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={includeToken}
                onChange={(e) => setIncludeToken(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem' }}>
                Include $ZOTH_BOT_TOKEN header
              </Typography>
            }
          />
        </Box>

        <SovereignCodeBlock
          title="GENERATED COMMAND"
          badge={cliMode.toUpperCase()}
          code={generatedCommand}
          filename={`zoth-bot-os-${cliMode}.sh`}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={copied === 'inline-cmd' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy(generatedCommand, 'inline-cmd')}
            sx={{
              minHeight: 40,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: accent,
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            {copied === 'inline-cmd' ? 'Copied Command' : 'Copy Command'}
          </Button>
          {localEnv && isOnline && (
            <Button
              variant="outlined"
              size="small"
              component="a"
              href={BASE}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon fontSize="small" />}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                borderColor: accent,
                color: accent,
              }}
            >
              Open http://127.0.0.1:8190
            </Button>
          )}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="ANDROID APK v1.4.0 & TAILSCALE PWA"
        title="Mobile Pairing & Local Deployment"
        subtitle="No public cloud relay required — your phone connects privately over Tailscale"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
            1. Start the local daemon on your Linux or ZothOS machine via <code>zoth-bot-os serve --port 8190</code> (or <code>systemctl --user start zoth-bot-os.service</code>).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
            2. Expose port 8190 strictly inside your private Tailscale tailnet using <code>tailscale serve --bg --https=8190 http://127.0.0.1:8190</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
            3. Open the System tab in the local deck to scan the pairing QR code on Android (APK v1.4.0 or Chrome Install App) or iOS Safari (Add to Home Screen).
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TerminalIcon fontSize="small" />}
              onClick={() => copy('git clone https://github.com/1nc0gn30/zoth-bot-os.git && cd zoth-bot-os && python3 server.py --port 8190', 'quick-run')}
              sx={{ minHeight: 38, fontFamily: MONO, fontSize: '0.72rem', textTransform: 'none' }}
            >
              {copied === 'quick-run' ? 'Copied Quickstart' : 'Copy Local Install One-Liner'}
            </Button>
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {!isOnline && (
        <Box sx={{ mb: 2 }}>
          <SovereignAlertBanner
            severity="info"
            title="Local Daemon Offline — Install & Run on ZothOS"
            message={
              localEnv
                ? 'Zoth Bot OS (:8190) is not responding on http://127.0.0.1:8190. Start it with "systemctl --user start zoth-bot-os.service" or "zoth-bot-os serve --port 8190", then click Re-Probe.'
                : 'You are viewing the interactive configuration preview on the web. Zoth Bot OS executes locally on your machine (:8190) and over your private Tailscale network — use the CLI builder below to install and run it locally.'
            }
          />
        </Box>
      )}
      <SovereignWorkstationShell
        id="zoth-bot-os"
        category="SWARM & CORE · DAEMON :8190"
        title="Zoth Bot OS Command Deck"
        subtitle="Mobile-first PWA, Android APK v1.4.0, and desktop Command Deck unifying Hermes, Antigravity (AGY), Chronicle Vault, Social Browser Playbooks, Netlify Cove, and live host telemetry."
        version={health?.version || '1.4.0'}
        variant="hex-lattice"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
