import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import TerminalIcon from '@mui/icons-material/Terminal';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HubIcon from '@mui/icons-material/Hub';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  useCopy,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_DARK = '#34D399';
const ACCENT_LIGHT = '#047857';
const MULTIPLEXER_PORT = 8141;
const MULTIPLEXER_BASE_URL = `http://127.0.0.1:${MULTIPLEXER_PORT}`;

const HARNESSES = {
  Hermes: {
    id: 'Hermes',
    label: 'Hermes',
    execCmd: 'hermes --format stream-json',
    vramGb: 0.4,
    rpmPerSlot: 24,
    defaultTokenBudgetK: 220,
    color: '#34D399',
  },
  AGY: {
    id: 'AGY',
    label: 'AGY',
    execCmd: 'agy run --non-interactive',
    vramGb: 0.3,
    rpmPerSlot: 20,
    defaultTokenBudgetK: 260,
    color: '#D4AF37',
  },
  'Claude Code': {
    id: 'Claude Code',
    label: 'Claude Code',
    execCmd: 'claude --print --output-format stream-json',
    vramGb: 0.3,
    rpmPerSlot: 18,
    defaultTokenBudgetK: 300,
    color: '#A78BFA',
  },
  Codex: {
    id: 'Codex',
    label: 'Codex',
    execCmd: 'codex exec --quiet',
    vramGb: 0.3,
    rpmPerSlot: 22,
    defaultTokenBudgetK: 200,
    color: '#38BDF8',
  },
  'Ollama Local': {
    id: 'Ollama Local',
    label: 'Ollama Local',
    execCmd: 'ollama run qwen2.5-coder:7b',
    vramGb: 5.4,
    rpmPerSlot: 0,
    defaultTokenBudgetK: 160,
    color: '#F59E0B',
  },
};

const TIERS = [
  { id: 'command', label: 'Tier 1 · Command / Architect', range: 'T01–T04', accent: SOV.gold },
  { id: 'builders', label: 'Tier 2 · Builders / Verifiers', range: 'T05–T14', accent: SOV.emerald },
  { id: 'scouts', label: 'Tier 3 · Scouts / Auditors', range: 'T15–T21', accent: SOV.cyber },
];

const INITIAL_SLOTS = [
  // Tier 1: Command / Architect (4 terminals)
  { id: 'T01', name: 'Swarm Coordinator', tier: 'command', active: true, harness: 'Hermes', role: 'reader', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-swarm-multiplexer', concurrency: 2, vramGb: 0.4, tokenBudgetK: 300 },
  { id: 'T02', name: 'Systems Architect', tier: 'command', active: true, harness: 'AGY', role: 'reader', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 280 },
  { id: 'T03', name: 'Release Captain', tier: 'command', active: true, harness: 'Claude Code', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 260 },
  { id: 'T04', name: 'Security Gatekeeper', tier: 'command', active: true, harness: 'Hermes', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-os', concurrency: 1, vramGb: 0.4, tokenBudgetK: 200 },
  // Tier 2: Builders / Verifiers (10 terminals)
  { id: 'T05', name: 'Frontend Workstation Builder', tier: 'builders', active: true, harness: 'AGY', role: 'writer', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 2, vramGb: 0.3, tokenBudgetK: 280 },
  { id: 'T06', name: 'UI Polish & Theme Author', tier: 'builders', active: true, harness: 'Claude Code', role: 'writer', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 260 },
  { id: 'T07', name: 'Daemon API Engineer', tier: 'builders', active: true, harness: 'Codex', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-swarm-multiplexer', concurrency: 2, vramGb: 0.3, tokenBudgetK: 220 },
  { id: 'T08', name: 'CLI Binary Packager', tier: 'builders', active: true, harness: 'Ollama Local', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-os', concurrency: 1, vramGb: 5.4, tokenBudgetK: 160 },
  { id: 'T09', name: 'Unit & Contract Verifier', tier: 'builders', active: true, harness: 'Codex', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 2, vramGb: 0.3, tokenBudgetK: 180 },
  { id: 'T10', name: 'Viewport Screenshot QA', tier: 'builders', active: false, harness: 'AGY', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 160 },
  { id: 'T11', name: 'MCP Protocol Bridge Dev', tier: 'builders', active: false, harness: 'Hermes', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-relay', concurrency: 1, vramGb: 0.4, tokenBudgetK: 220 },
  { id: 'T12', name: 'Docs & README Synchronizer', tier: 'builders', active: false, harness: 'Ollama Local', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 4.8, tokenBudgetK: 140 },
  { id: 'T13', name: 'Schema & Guardrail Linter', tier: 'builders', active: false, harness: 'Codex', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 140 },
  { id: 'T14', name: 'Build & Bundle Optimizer', tier: 'builders', active: false, harness: 'Claude Code', role: 'writer', isolation: 'git-worktree', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 220 },
  // Tier 3: Scouts / Auditors (7 terminals)
  { id: 'T15', name: 'Repo Cartographer', tier: 'scouts', active: true, harness: 'Ollama Local', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 2, vramGb: 5.4, tokenBudgetK: 150 },
  { id: 'T16', name: 'Secret & PII Pre-Push Auditor', tier: 'scouts', active: true, harness: 'Hermes', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.4, tokenBudgetK: 140 },
  { id: 'T17', name: 'CVE & Dependency Scout', tier: 'scouts', active: false, harness: 'Hermes', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/shodan-surface-sentinel', concurrency: 1, vramGb: 0.4, tokenBudgetK: 160 },
  { id: 'T18', name: 'Passive OSINT Scout', tier: 'scouts', active: false, harness: 'Codex', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/osint-scout-skill', concurrency: 1, vramGb: 0.3, tokenBudgetK: 160 },
  { id: 'T19', name: 'Memory Engram Sync', tier: 'scouts', active: false, harness: 'Ollama Local', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-memory-vault', concurrency: 1, vramGb: 3.2, tokenBudgetK: 120 },
  { id: 'T20', name: 'SSE Telemetry Watcher', tier: 'scouts', active: false, harness: 'Hermes', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-swarm-multiplexer', concurrency: 1, vramGb: 0.4, tokenBudgetK: 120 },
  { id: 'T21', name: 'Regression Diff Sentinel', tier: 'scouts', active: false, harness: 'Claude Code', role: 'reader', isolation: 'shared-cwd', cwd: '~/NullAITech/zoth-studio-v2', concurrency: 1, vramGb: 0.3, tokenBudgetK: 180 },
];

const SSE_EVENT_TYPES = ['all', 'pane.spawn', 'pane.stdout', 'task.dispatch', 'conflict.warn', 'vram.pressure', 'heartbeat'];

function normalizePath(p) {
  return String(p || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();
}

export default function ZothSwarmMultiplexerGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_DARK, isDark);
  const { copied, copy } = useCopy();

  const [daemonState, setDaemonState] = useState('remote');
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      setDaemonState('remote');
      return undefined;
    }
    const ctrl = new AbortController();
    fetch(`${MULTIPLEXER_BASE_URL}/health`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('offline'))))
      .then(() => setDaemonState('online'))
      .catch(() => {
        if (!ctrl.signal.aborted) setDaemonState('offline');
      });
    return () => ctrl.abort();
  }, []);

  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [selectedId, setSelectedId] = useState('T05');
  const [vramCapGb, setVramCapGb] = useState(16);
  const [sseTierFilter, setSseTierFilter] = useState('all');
  const [sseHarnessFilter, setSseHarnessFilter] = useState('all');
  const [sseEventFilter, setSseEventFilter] = useState('all');
  const [exportTab, setExportTab] = useState('topology'); // 'topology' | 'tmux' | 'curl'

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedId) || slots[0],
    [slots, selectedId],
  );

  const updateSlot = (id, patch) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  };

  const handleHarnessChange = (id, harnessName) => {
    const meta = HARNESSES[harnessName] || HARNESSES.Hermes;
    updateSlot(id, {
      harness: harnessName,
      vramGb: meta.vramGb,
      tokenBudgetK: meta.defaultTokenBudgetK,
    });
  };

  const applyFleetPreset = (preset) => {
    setSlots((prev) =>
      prev.map((slot, idx) => {
        if (preset === 'blitz21') {
          return { ...slot, active: true };
        }
        if (preset === 'local-ollama') {
          const on = idx < 6;
          return {
            ...slot,
            active: on,
            harness: 'Ollama Local',
            vramGb: idx < 2 ? 5.4 : 2.2,
            tokenBudgetK: 160,
          };
        }
        if (preset === 'audit-readonly') {
          return {
            ...slot,
            active: slot.tier === 'scouts' || slot.id === 'T01' || slot.id === 'T04',
            role: 'reader',
          };
        }
        return INITIAL_SLOTS[idx];
      }),
    );
  };

  // Real-time resource, parallelism, and conflict calculation
  const telemetry = useMemo(() => {
    const activeSlots = slots.filter((s) => s.active);
    const totalThreads = activeSlots.reduce((acc, s) => acc + Number(s.concurrency || 1), 0);
    const totalVramGb = Number(
      activeSlots.reduce((acc, s) => acc + Number(s.vramGb || 0), 0).toFixed(1),
    );
    const totalRpm = activeSlots.reduce((acc, s) => {
      const h = HARNESSES[s.harness] || HARNESSES.Hermes;
      return acc + h.rpmPerSlot * Number(s.concurrency || 1);
    }, 0);
    const totalTokenBudgetK = activeSlots.reduce((acc, s) => acc + Number(s.tokenBudgetK || 0), 0);

    // Conflict detection: two or more active writers sharing the exact same normalized repo path without branch/worktree isolation
    const writerBuckets = new Map();
    activeSlots
      .filter((s) => s.role === 'writer' && s.isolation !== 'git-worktree')
      .forEach((s) => {
        const key = normalizePath(s.cwd);
        if (!key) return;
        if (!writerBuckets.has(key)) writerBuckets.set(key, []);
        writerBuckets.get(key).push(s);
      });

    const conflicts = [];
    const conflictingIds = new Set();
    writerBuckets.forEach((group, pathKey) => {
      if (group.length > 1) {
        conflicts.push({
          path: group[0].cwd,
          normalizedPath: pathKey,
          agents: group.map((g) => ({ id: g.id, name: g.name, harness: g.harness })),
        });
        group.forEach((g) => conflictingIds.add(g.id));
      }
    });

    const vramPct = Math.min(100, Math.round((totalVramGb / Math.max(1, vramCapGb)) * 100));
    const vramOver = totalVramGb > vramCapGb;

    return {
      activeSlots,
      activeCount: activeSlots.length,
      totalThreads,
      totalVramGb,
      vramPct,
      vramOver,
      totalRpm,
      totalTokenBudgetK,
      conflicts,
      conflictingIds,
    };
  }, [slots, vramCapGb]);

  const handleAutoIsolateConflicts = () => {
    if (telemetry.conflictingIds.size === 0) return;
    setSlots((prev) =>
      prev.map((s) =>
        telemetry.conflictingIds.has(s.id) ? { ...s, isolation: 'git-worktree' } : s,
      ),
    );
  };

  // Deterministic SSE preview stream derived from active topology + conflicts + VRAM state
  const sseStreamEvents = useMemo(() => {
    const events = [];
    telemetry.activeSlots.forEach((s) => {
      events.push({
        id: `ev-spawn-${s.id}`,
        type: 'pane.spawn',
        tier: s.tier,
        harness: s.harness,
        slot: s.id,
        msg: `Spawned ${s.id} (${s.name}) via ${s.harness} [${s.role} · ${s.isolation}] in ${s.cwd}`,
      });
      events.push({
        id: `ev-dispatch-${s.id}`,
        type: 'task.dispatch',
        tier: s.tier,
        harness: s.harness,
        slot: s.id,
        msg: `Budget=${s.tokenBudgetK}k tok/hr · concurrency=${s.concurrency} · vram=${s.vramGb}GB`,
      });
    });
    telemetry.conflicts.forEach((c, idx) => {
      events.push({
        id: `ev-conflict-${idx}`,
        type: 'conflict.warn',
        tier: 'builders',
        harness: c.agents[0]?.harness || 'Hermes',
        slot: c.agents.map((a) => a.id).join('+'),
        msg: `WRITE COLLISION on ${c.path} (${c.agents.map((a) => a.id).join(', ')}) — enable git-worktree isolation`,
      });
    });
    if (telemetry.vramOver) {
      events.push({
        id: 'ev-vram',
        type: 'vram.pressure',
        tier: 'command',
        harness: 'Ollama Local',
        slot: 'GPU',
        msg: `Estimated VRAM ${telemetry.totalVramGb}GB exceeds ${vramCapGb}GB host budget`,
      });
    }
    events.push({
      id: 'ev-hb',
      type: 'heartbeat',
      tier: 'command',
      harness: 'Hermes',
      slot: 'DAEMON',
      msg: `Multiplexer :${MULTIPLEXER_PORT} ready · ${telemetry.activeCount}/21 panes · ${telemetry.totalThreads} threads · ${telemetry.totalRpm} RPM`,
    });

    return events.filter((ev) => {
      if (sseTierFilter !== 'all' && ev.tier !== sseTierFilter) return false;
      if (sseHarnessFilter !== 'all' && ev.harness !== sseHarnessFilter) return false;
      if (sseEventFilter !== 'all' && ev.type !== sseEventFilter) return false;
      return true;
    });
  }, [telemetry, vramCapGb, sseTierFilter, sseHarnessFilter, sseEventFilter]);

  const topologyJson = useMemo(() => {
    const payload = {
      schema: 'zoth-swarm-multiplexer/topology/v2.5',
      daemon_url: MULTIPLEXER_BASE_URL,
      host_vram_cap_gb: vramCapGb,
      summary: {
        active_panes: telemetry.activeCount,
        total_slots: slots.length,
        parallel_threads: telemetry.totalThreads,
        estimated_vram_gb: telemetry.totalVramGb,
        estimated_api_rpm: telemetry.totalRpm,
        hourly_token_budget_k: telemetry.totalTokenBudgetK,
        write_conflicts: telemetry.conflicts.length,
      },
      conflicts: telemetry.conflicts,
      terminals: slots.map((s) => ({
        id: s.id,
        name: s.name,
        tier: s.tier,
        active: s.active,
        harness: s.harness,
        command: (HARNESSES[s.harness] || HARNESSES.Hermes).execCmd,
        role: s.role,
        isolation: s.isolation,
        cwd: s.cwd,
        concurrency: s.concurrency,
        vram_gb: s.vramGb,
        token_budget_k: s.tokenBudgetK,
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [slots, telemetry, vramCapGb]);

  const tmuxScript = useMemo(() => {
    const active = telemetry.activeSlots;
    const lines = [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '# Zoth 21-Agent Swarm Multiplexer — Deterministic tmux Session Launcher',
      'SESSION="zoth-swarm-21"',
      'tmux has-session -t "$SESSION" 2>/dev/null && tmux kill-session -t "$SESSION"',
      '',
    ];
    if (active.length === 0) {
      lines.push('echo "No active terminals enabled in topology."');
      return lines.join('\n');
    }
    active.forEach((s, idx) => {
      const cmd = (HARNESSES[s.harness] || HARNESSES.Hermes).execCmd;
      const expandedCwd = s.cwd.replace(/^~\//, '$HOME/');
      const worktreeNote = s.isolation === 'git-worktree' ? ` # worktree: .worktrees/${s.id.toLowerCase()}` : '';
      if (idx === 0) {
        lines.push(`tmux new-session -d -s "$SESSION" -n "${s.id}-${s.tier}" -c "${expandedCwd}"${worktreeNote}`);
        lines.push(`tmux send-keys -t "$SESSION:${s.id}-${s.tier}" "echo '[${s.id}] ${s.name} (${s.harness})' && ${cmd}" C-m`);
      } else {
        lines.push(`tmux new-window -t "$SESSION" -n "${s.id}-${s.tier}" -c "${expandedCwd}"${worktreeNote}`);
        lines.push(`tmux send-keys -t "$SESSION:${s.id}-${s.tier}" "echo '[${s.id}] ${s.name} (${s.harness})' && ${cmd}" C-m`);
      }
    });
    lines.push('', 'tmux attach -t "$SESSION"');
    return lines.join('\n');
  }, [telemetry.activeSlots]);

  const curlPayloads = useMemo(() => {
    const sseQuery = new URLSearchParams();
    if (sseTierFilter !== 'all') sseQuery.set('tier', sseTierFilter);
    if (sseHarnessFilter !== 'all') sseQuery.set('harness', sseHarnessFilter);
    if (sseEventFilter !== 'all') sseQuery.set('event', sseEventFilter);
    const qs = sseQuery.toString();
    const sseUrl = `${MULTIPLEXER_BASE_URL}/api/events${qs ? `?${qs}` : ''}`;

    const spawnPayload = JSON.stringify({
      id: selectedSlot.id,
      name: selectedSlot.name,
      tier: selectedSlot.tier,
      harness: selectedSlot.harness,
      role: selectedSlot.role,
      isolation: selectedSlot.isolation,
      cwd: selectedSlot.cwd,
      concurrency: selectedSlot.concurrency,
      token_budget_k: selectedSlot.tokenBudgetK,
    });

    return [
      '# 1. Start local 21-Agent Swarm Multiplexer daemon on 127.0.0.1:8141',
      'cd ~/NullAITech/zoth-swarm-multiplexer && python3 server.py --port 8141',
      '',
      '# 2. Liveness & fleet status probe',
      `curl -sS "${MULTIPLEXER_BASE_URL}/health" | jq .`,
      '',
      `# 3. Spawn / update selected terminal (${selectedSlot.id} · ${selectedSlot.harness})`,
      `curl -sS -X POST "${MULTIPLEXER_BASE_URL}/api/panes/spawn" \\`,
      '  -H "Content-Type: application/json" \\',
      `  -d '${spawnPayload}'`,
      '',
      '# 4. Push full swarm-topology.json manifest',
      `curl -sS -X PUT "${MULTIPLEXER_BASE_URL}/api/topology" \\`,
      '  -H "Content-Type: application/json" \\',
      '  --data-binary @swarm-topology.json',
      '',
      '# 5. Subscribe to filtered SSE telemetry stream',
      `curl -sS -N "${sseUrl}"`,
    ].join('\n');
  }, [selectedSlot, sseTierFilter, sseHarnessFilter, sseEventFilter]);

  const activeExport = useMemo(() => {
    if (exportTab === 'tmux') {
      return { title: 'launch-swarm-tmux.sh', badge: 'TMUX LAUNCH SCRIPT', code: tmuxScript };
    }
    if (exportTab === 'curl') {
      return { title: 'swarm-api-8141.sh', badge: 'DAEMON CURL :8141', code: curlPayloads };
    }
    return { title: 'swarm-topology.json', badge: '21-SLOT TOPOLOGY JSON', code: topologyJson };
  }, [exportTab, topologyJson, tmuxScript, curlPayloads]);

  const kpis = [
    {
      label: 'Active Panes',
      value: `${telemetry.activeCount}/21`,
      unit: `${telemetry.totalThreads} threads`,
      accent: ACCENT_DARK,
    },
    {
      label: 'VRAM Footprint',
      value: `${telemetry.totalVramGb} GB`,
      unit: `cap ${vramCapGb} GB (${telemetry.vramPct}%)`,
      accent: telemetry.vramOver ? SOV.crimson : SOV.emerald,
    },
    {
      label: 'Est. API RPM',
      value: String(telemetry.totalRpm),
      unit: `${telemetry.totalTokenBudgetK}k tok/hr`,
      accent: SOV.gold,
    },
    {
      label: 'Write Conflicts',
      value: String(telemetry.conflicts.length),
      unit: telemetry.conflicts.length > 0 ? 'shared-cwd writers' : 'clean isolation',
      accent: telemetry.conflicts.length > 0 ? SOV.crimson : SOV.emerald,
    },
  ];

  const statusNode = (
    <SovereignStatusPill
      status={daemonState === 'online' ? 'online' : 'standby'}
      label={
        daemonState === 'online'
          ? 'LOCALHOST :8141 MULTIPLEXER ONLINE'
          : daemonState === 'offline'
            ? 'LOCALHOST :8141 OFFLINE · TOPOLOGY ARCHITECT READY'
            : 'CLIENT TOPOLOGY ARCHITECT · ZERO REMOTE CALLS'
      }
      sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
    />
  );

  const actions = [
    {
      label: copied === 'topology' ? 'Copied Topology JSON' : 'Copy Topology JSON',
      icon: copied === 'topology' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(topologyJson, 'topology'),
      primary: true,
    },
    {
      label: 'Download swarm-topology.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(topologyJson, 'swarm-topology.json', 'application/json;charset=utf-8'),
    },
    {
      label: 'Download tmux Script',
      icon: <TerminalIcon fontSize="small" />,
      onClick: () => downloadText(tmuxScript, 'launch-swarm-tmux.sh', 'text/x-shellscript;charset=utf-8'),
    },
  ];

  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? SOV.slate : '#475467';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : '#F8F6F0';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,24,40,0.12)';

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SovereignAlertBanner
        severity={daemonState === 'online' ? 'success' : 'info'}
        title="Runtime Scope Disclosure — Local Multiplexer Control Plane"
        message={
          daemonState === 'online'
            ? 'Detected local zoth-swarm-multiplexer daemon on 127.0.0.1:8141. Configure all 21 terminal slots, resolve repo write conflicts, and export manifests or curl dispatch calls.'
            : 'Topology design, VRAM/RPM budgeting, writer conflict detection, and tmux/JSON generation execute 100% client-side. Start python3 server.py --port 8141 on your ZothOS host to execute live panes.'
        }
      />

      <SovereignCard
        index="01"
        eyebrow="21-TERMINAL DECK TOPOLOGY"
        title="Autonomous Agent Deck (3 Tiers)"
        subtitle="Click any slot to edit harness, working directory, isolation mode, and token/VRAM budgets"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {[
            { id: 'default', label: 'Balanced 11-Agent Squad' },
            { id: 'blitz21', label: 'Full 21-Terminal Blitz' },
            { id: 'local-ollama', label: 'Zero-Cloud Local Ollama' },
            { id: 'audit-readonly', label: 'Read-Only Audit Sweep' },
          ].map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              clickable
              onClick={() => applyFleetPreset(p.id)}
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.7rem',
                border: `1px solid ${rgba(accent, 0.4)}`,
                color: accent,
                bgcolor: rgba(ACCENT_DARK, isDark ? 0.1 : 0.06),
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TIERS.map((tier) => {
            const tierSlots = slots.filter((s) => s.tier === tier.id);
            const tierActive = tierSlots.filter((s) => s.active).length;
            const tierAccent = resolveModeAccent(tier.accent, isDark);
            return (
              <Box key={tier.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tierAccent, letterSpacing: '0.06em' }}>
                    {tier.label} ({tier.range})
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: textSecondary }}>
                    {tierActive}/{tierSlots.length} active
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 1,
                  }}
                >
                  {tierSlots.map((slot) => {
                    const isSelected = slot.id === selectedSlot.id;
                    const hasConflict = telemetry.conflictingIds.has(slot.id);
                    const hColor = resolveModeAccent((HARNESSES[slot.harness] || HARNESSES.Hermes).color, isDark);
                    return (
                      <Box
                        key={slot.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(slot.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedId(slot.id);
                          }
                        }}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          bgcolor: isSelected
                            ? rgba(tier.accent, isDark ? 0.18 : 0.12)
                            : slot.active
                              ? surfaceBg
                              : 'transparent',
                          border: `1px solid ${
                            hasConflict
                              ? resolveModeAccent(SOV.crimson, isDark)
                              : isSelected
                                ? tierAccent
                                : slot.active
                                  ? rgba(tierAccent, 0.35)
                                  : borderSubtle
                          }`,
                          opacity: slot.active ? 1 : 0.62,
                          transition: 'border-color 140ms ease, opacity 140ms ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.35 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: hasConflict ? resolveModeAccent(SOV.crimson, isDark) : tierAccent }}>
                            {slot.id}
                          </Typography>
                          <Chip
                            size="small"
                            label={slot.active ? 'ON' : 'OFF'}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSlot(slot.id, { active: !slot.active });
                            }}
                            sx={{
                              height: 18,
                              fontFamily: MONO,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: slot.active ? rgba(SOV.emerald, isDark ? 0.25 : 0.15) : rgba(SOV.slate, 0.15),
                              color: slot.active ? resolveModeAccent(SOV.emerald, isDark) : textSecondary,
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: textPrimary,
                            lineHeight: 1.25,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={slot.name}
                        >
                          {slot.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.64rem', color: hColor, fontWeight: 700 }}>
                            {slot.harness}
                          </Typography>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.62rem', color: textSecondary }}>
                            {slot.role === 'writer' ? 'W' : 'R'}·x{slot.concurrency}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="ACTIVE SLOT INSPECTOR"
        title={`${selectedSlot.id} · ${selectedSlot.name}`}
        subtitle="Hot-swap AI harness, working directory, write isolation, concurrency, and resource budgets"
        accent={SOV.gold}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={selectedSlot.active}
                onChange={(e) => updateSlot(selectedSlot.id, { active: e.target.checked })}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: textPrimary }}>
                {selectedSlot.active ? 'Terminal Active in Multiplexer Fleet' : 'Terminal Parked (Standby)'}
              </Typography>
            }
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <FormControl size="small">
              <InputLabel>AI Harness</InputLabel>
              <Select
                label="AI Harness"
                value={selectedSlot.harness}
                onChange={(e) => handleHarnessChange(selectedSlot.id, e.target.value)}
                sx={{ fontFamily: MONO, fontSize: '0.8rem' }}
              >
                {Object.values(HARNESSES).map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    {h.label} ({h.vramGb} GB VRAM)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Workspace Role</InputLabel>
              <Select
                label="Workspace Role"
                value={selectedSlot.role}
                onChange={(e) => updateSlot(selectedSlot.id, { role: e.target.value })}
                sx={{ fontFamily: MONO, fontSize: '0.8rem' }}
              >
                <MenuItem value="reader">reader (Read-Only Scout / Verifier)</MenuItem>
                <MenuItem value="writer">writer (Code / File Author)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Branch Isolation</InputLabel>
              <Select
                label="Branch Isolation"
                value={selectedSlot.isolation}
                onChange={(e) => updateSlot(selectedSlot.id, { isolation: e.target.value })}
                sx={{ fontFamily: MONO, fontSize: '0.8rem' }}
              >
                <MenuItem value="git-worktree">git-worktree (Isolated Branch)</MenuItem>
                <MenuItem value="shared-cwd">shared-cwd (Direct Working Copy)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="number"
              label="Concurrency Slots (1–4)"
              value={selectedSlot.concurrency}
              inputProps={{ min: 1, max: 4 }}
              onChange={(e) => updateSlot(selectedSlot.id, { concurrency: Math.min(4, Math.max(1, Number(e.target.value) || 1)) })}
              InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
            />
          </Box>

          <TextField
            size="small"
            fullWidth
            label="Working Directory (PWD)"
            placeholder="~/NullAITech/zoth-studio-v2"
            value={selectedSlot.cwd}
            onChange={(e) => updateSlot(selectedSlot.id, { cwd: e.target.value })}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField
              size="small"
              type="number"
              label="VRAM Budget (GB)"
              value={selectedSlot.vramGb}
              inputProps={{ min: 0, max: 48, step: 0.2 }}
              onChange={(e) => updateSlot(selectedSlot.id, { vramGb: Math.max(0, Number(e.target.value) || 0) })}
              InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
            />
            <TextField
              size="small"
              type="number"
              label="Token Budget (k / hr)"
              value={selectedSlot.tokenBudgetK}
              inputProps={{ min: 20, max: 2000, step: 20 }}
              onChange={(e) => updateSlot(selectedSlot.id, { tokenBudgetK: Math.max(20, Number(e.target.value) || 100) })}
              InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
            />
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SovereignCard
        index="03"
        eyebrow="RESOURCE & CONFLICT ENGINE"
        title="Live Parallelism, VRAM & Write-Collision Guard"
        subtitle="Flags multiple active writer terminals targeting the same working directory without git-worktree isolation"
        accent={telemetry.conflicts.length > 0 || telemetry.vramOver ? SOV.crimson : ACCENT_DARK}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2.5,
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: surfaceBg,
            border: `1px solid ${borderSubtle}`,
            mb: 2,
          }}
        >
          <SovereignGauge
            value={telemetry.vramPct}
            min={0}
            max={100}
            label="VRAM LOAD"
            unit="%"
            status={telemetry.vramOver ? 'OVER CAP' : `${telemetry.totalVramGb}/${vramCapGb}GB`}
            thresholds={{ warn: 75, danger: 92 }}
            size={136}
          />
          <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MemoryIcon fontSize="small" sx={{ color: accent }} />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: textPrimary }}>
                HOST GPU VRAM CEILING
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.25 }}>
              {[4, 8, 12, 16, 24, 48].map((gb) => (
                <Chip
                  key={gb}
                  size="small"
                  clickable
                  label={`${gb} GB`}
                  onClick={() => setVramCapGb(gb)}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: vramCapGb === gb ? 700 : 500,
                    bgcolor: vramCapGb === gb ? rgba(ACCENT_DARK, isDark ? 0.22 : 0.14) : 'transparent',
                    color: vramCapGb === gb ? accent : textSecondary,
                    border: `1px solid ${vramCapGb === gb ? rgba(accent, 0.55) : borderSubtle}`,
                  }}
                />
              ))}
            </Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: textSecondary }}>
              Active Panes: <strong style={{ color: textPrimary }}>{telemetry.activeCount}/21</strong> · Threads: <strong style={{ color: textPrimary }}>{telemetry.totalThreads}</strong> · Est RPM: <strong style={{ color: textPrimary }}>{telemetry.totalRpm}</strong>
            </Typography>
          </Box>
        </Box>

        {telemetry.conflicts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: rgba(SOV.emerald, isDark ? 0.12 : 0.08),
              border: `1px solid ${rgba(SOV.emerald, 0.35)}`,
            }}
          >
            <CheckCircleOutlineIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.emerald, isDark) }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: textPrimary }}>
              Zero workspace write collisions. All concurrent writers are isolated or targeting distinct repositories.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <WarningAmberIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.crimson, isDark) }} />
                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: resolveModeAccent(SOV.crimson, isDark) }}>
                  {telemetry.conflicts.length} WORKSPACE WRITE CONFLICT(S) DETECTED
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                startIcon={<AutoFixHighIcon fontSize="small" />}
                onClick={handleAutoIsolateConflicts}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  bgcolor: resolveModeAccent(SOV.crimson, isDark),
                  color: '#FFFFFF',
                }}
              >
                Auto-Isolate via git-worktree
              </Button>
            </Box>

            {telemetry.conflicts.map((conflict) => (
              <Box
                key={conflict.normalizedPath}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: rgba(SOV.crimson, isDark ? 0.12 : 0.07),
                  border: `1px solid ${rgba(SOV.crimson, 0.4)}`,
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: textPrimary }}>
                  Shared Path: {conflict.path}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textSecondary, mt: 0.35 }}>
                  Conflicting Writers: {conflict.agents.map((a) => `${a.id} (${a.name} · ${a.harness})`).join(' vs ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* SSE Telemetry Event Stream Filter */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
            <FilterListIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.cyber, isDark) }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: textPrimary }}>
              SSE TELEMETRY STREAM FILTER (/api/events · {sseStreamEvents.length} events)
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1, mb: 1.25 }}>
            <FormControl size="small">
              <InputLabel>Tier</InputLabel>
              <Select
                label="Tier"
                value={sseTierFilter}
                onChange={(e) => setSseTierFilter(e.target.value)}
                sx={{ fontFamily: MONO, fontSize: '0.76rem' }}
              >
                <MenuItem value="all">All Tiers</MenuItem>
                <MenuItem value="command">Tier 1 · Command</MenuItem>
                <MenuItem value="builders">Tier 2 · Builders</MenuItem>
                <MenuItem value="scouts">Tier 3 · Scouts</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Harness</InputLabel>
              <Select
                label="Harness"
                value={sseHarnessFilter}
                onChange={(e) => setSseHarnessFilter(e.target.value)}
                sx={{ fontFamily: MONO, fontSize: '0.76rem' }}
              >
                <MenuItem value="all">All Harnesses</MenuItem>
                {Object.keys(HARNESSES).map((h) => (
                  <MenuItem key={h} value={h}>{h}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Event Type</InputLabel>
              <Select
                label="Event Type"
                value={sseEventFilter}
                onChange={(e) => setSseEventFilter(e.target.value)}
                sx={{ fontFamily: MONO, fontSize: '0.76rem' }}
              >
                {SSE_EVENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t === 'all' ? 'All Events' : t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              maxHeight: 190,
              overflowY: 'auto',
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: isDark ? '#06080E' : '#F4F1E8',
              border: `1px solid ${borderSubtle}`,
              fontFamily: MONO,
              fontSize: '0.72rem',
              lineHeight: 1.6,
            }}
          >
            {sseStreamEvents.length === 0 ? (
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: textSecondary }}>
                No events match the active SSE filter.
              </Typography>
            ) : (
              sseStreamEvents.slice(0, 18).map((ev) => {
                const evCol =
                  ev.type === 'conflict.warn' || ev.type === 'vram.pressure'
                    ? resolveModeAccent(SOV.crimson, isDark)
                    : ev.type === 'heartbeat'
                      ? resolveModeAccent(SOV.gold, isDark)
                      : accent;
                return (
                  <Box key={ev.id} sx={{ color: textPrimary, mb: 0.4 }}>
                    <Box component="span" sx={{ color: evCol, fontWeight: 700 }}>
                      [{ev.type}]
                    </Box>{' '}
                    <Box component="span" sx={{ color: textSecondary }}>
                      ({ev.slot})
                    </Box>{' '}
                    {ev.msg}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="DISPATCH MANIFEST & CLI EXPORTER"
        title="swarm-topology.json, tmux & Loopback :8141 Payloads"
        subtitle="Export deterministic fleet manifests or invoke the local multiplexer daemon on 127.0.0.1:8141"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {[
            { id: 'topology', label: 'swarm-topology.json', icon: <HubIcon fontSize="small" /> },
            { id: 'tmux', label: 'tmux Launch Script' },
            { id: 'curl', label: 'curl :8141 Payloads' },
          ].map((tab) => {
            const active = exportTab === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setExportTab(tab.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(ACCENT_DARK, isDark ? 0.2 : 0.14) : 'transparent',
                  color: active ? accent : textSecondary,
                  border: `1px solid ${active ? rgba(accent, 0.55) : borderSubtle}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={activeExport.title}
          badge={activeExport.badge}
          code={activeExport.code}
          filename={activeExport.title}
          accent={ACCENT_DARK}
          maxHeight={330}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zoth-swarm-multiplexer"
      category="SWARM & CORE"
      title="21-Agent Swarm Multiplexer"
      subtitle="21-terminal autonomous agent topology planner, hot-swappable harness allocator, write-collision detector, and SSE telemetry dispatcher for 127.0.0.1:8141. Engineered by Neal Frazier Tech (@1nc0gn30) · NullAI Platform."
      version="2.5.0"
      accent={ACCENT_DARK}
      metrics={kpis}
      actions={actions}
      status={statusNode}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={6}
      rightCols={6}
      tutorialSteps={[
        {
          title: 'Configure the 21-Slot Agent Deck',
          description: 'Toggle terminals across Command, Builders, and Scouts tiers and assign Hermes, AGY, Claude Code, Codex, or Ollama Local per slot.',
        },
        {
          title: 'Resolve Write Collisions & VRAM Ceilings',
          description: 'Monitor live VRAM footprint and click Auto-Isolate whenever two active writer terminals share the same working directory.',
        },
        {
          title: 'Export Topology & Dispatch to :8141',
          description: 'Download swarm-topology.json, launch directly in tmux, or push live spawn payloads to your local daemon on http://127.0.0.1:8141.',
        },
      ]}
    />
  );
}
