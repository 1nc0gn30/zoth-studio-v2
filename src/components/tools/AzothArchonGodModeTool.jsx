import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Slider,
  CircularProgress,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import { isLocalRuntime } from '../../utils/sovereignRuntime';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SUBAGENTS = [
  { id: 'ollama', name: 'Sovereign Local Archon (Ollama)', role: 'Offline local synthesis & tool execution via 127.0.0.1:11434', transport: 'Loopback API (:11434)', colorDark: '#34D399', colorLight: '#047857', icon: '🦙' },
  { id: 'hermes', name: 'Hermes Agent CLI', role: 'Autonomous multi-step code & plan execution', transport: 'Local CLI Binary', colorDark: '#D4AF37', colorLight: '#9A6F0B', icon: '🏛️' },
  { id: 'agy', name: 'Antigravity CLI (AGY)', role: 'Dual sovereign agent loop & skill dispatch', transport: 'Local CLI Binary', colorDark: '#60A5FA', colorLight: '#0369A1', icon: '🚀' },
  { id: 'codex', name: 'Codex CLI', role: 'Deterministic AST refactoring & codegen', transport: 'Local CLI Binary', colorDark: '#A78BFA', colorLight: '#6D28D9', icon: '💻' },
  { id: 'grok_cli', name: 'Grok CLI', role: 'Live X intelligence & deep research synthesis', transport: 'Local CLI Binary', colorDark: '#38BDF8', colorLight: '#0369A1', icon: '⚡' },
  { id: 'claude', name: 'Claude Code CLI', role: 'High-reasoning multi-file architecture', transport: 'Local CLI Binary', colorDark: '#F472B6', colorLight: '#BE123C', icon: '🎭' },
  { id: 'gemini', name: 'Gemini CLI', role: 'Multimodal verification & codebase synthesis', transport: 'Local CLI Binary', colorDark: '#FBBF24', colorLight: '#92400E', icon: '✦' },
];

const PERSONA_MODES = [
  { id: 'regular', name: 'Truth & Regular', icon: '⚡', desc: 'Objective, direct technical synthesis.' },
  { id: 'fun', name: 'Fun Mode', icon: '🌶️', desc: 'Informal, sharp conversational register.' },
  { id: 'think', name: 'DeepSearch & Think', icon: '🧠', desc: 'Chain-of-thought reasoning & citations.' },
  { id: 'coder', name: 'Coder & Builder', icon: '💻', desc: 'Sandbox Python & workspace engineering.' },
];

const ALLOWED_DUCKY_OPCODES = new Set([
  'REM', 'VAR', 'DELAY', 'RANDOM_DELAY', 'STRING', 'STRINGLN', 'ENTER', 'TAB',
  'SPACE', 'ESCAPE', 'BACKSPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'HOME', 'END',
  'PAGE_UP', 'PAGE_DOWN', 'CTRL+T', 'CTRL+W', 'CTRL+L', 'CTRL+V', 'CTRL+C',
  'CTRL+A', 'CTRL+ENTER', 'NAVIGATE', 'CLICK', 'MOUSE_MOVE', 'SCROLL',
  'WAIT_FOR', 'SCREENSHOT', 'REPLAY', 'REPEAT', 'LOG',
]);

const ASCII_CHARS = ' ·,:;+*?%S#@';

function runDeterministicOfflinePlanner(promptText, engineId, modeId, workers) {
  const trimmed = (promptText || '').trim();
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const firstWord = (lines[0] || '').split(/\s+/)[0]?.toUpperCase() || '';
  const looksLikeDucky = lines.length > 0 && ALLOWED_DUCKY_OPCODES.has(firstWord);

  if (looksLikeDucky) {
    const vars = {};
    const errors = [];
    const warnings = [];
    let opcodeCount = 0;
    lines.forEach((line, idx) => {
      const ln = idx + 1;
      const sp = line.indexOf(' ');
      const op = (sp === -1 ? line : line.slice(0, sp)).toUpperCase();
      const arg = sp === -1 ? '' : line.slice(sp + 1).trim();
      if (!ALLOWED_DUCKY_OPCODES.has(op)) {
        errors.push(`Line ${ln}: Unknown DuckyScript opcode '${op}'`);
        return;
      }
      opcodeCount += 1;
      if (op === 'VAR') {
        const m = arg.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
        if (!m) errors.push(`Line ${ln}: VAR requires KEY=VALUE syntax`);
        else vars[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      }
      if (op === 'NAVIGATE') {
        const expanded = arg.replace(/\$([A-Z0-9_]+)/gi, (_, k) => vars[k] || `$${k}`);
        if (/^(file:|javascript:|data:)/i.test(expanded) || /169\.254\.|127\.0\.0\.1|localhost|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./i.test(expanded)) {
          errors.push(`Line ${ln}: SSRF guard rejects target '${expanded}'`);
        }
      }
      if ((op === 'SCREENSHOT' || op === 'REPLAY') && (arg.includes('..') || arg.startsWith('/'))) {
        warnings.push(`Line ${ln}: '${arg}' must remain inside sandbox/workspace/`);
      }
    });
    return {
      thinking: `[Client DuckyScript Validator]\nParsed ${lines.length} line(s), ${opcodeCount} recognized opcode(s), ${errors.length} error(s), ${warnings.length} warning(s).\nEnforced public HTTP/HTTPS SSRF & workspace path containment checks.`,
      result: JSON.stringify({
        ok: errors.length === 0,
        planner: 'client-duckyscript-validator-v3.1.0',
        valid: errors.length === 0,
        opcode_count: opcodeCount,
        declared_vars: vars,
        errors,
        warnings,
      }, null, 2),
    };
  }

  const lower = trimmed.toLowerCase();
  const planSteps = [];
  const tools = [];
  if (/python|bench|code|script|test|lint/.test(lower)) {
    tools.push('azoth_run_python', 'azoth_list_files');
    planSteps.push('1. Execute bounded Python verification inside sandbox/workspace/ (run_python)');
  }
  if (/search|research|news|citation|deep/.test(lower)) {
    tools.push('azoth_deep_search', 'azoth_fetch_page');
    planSteps.push('2. Run SSRF-guarded DeepSearch query & extract cited sources (deep_search)');
  }
  if (/browser|page|login|cookie|screenshot|click/.test(lower)) {
    tools.push('azoth_browser_navigate', 'azoth_browser_extract');
    planSteps.push('3. Drive persistent Playwright Chromium tab over public HTTP/HTTPS (browser_navigate)');
  }
  if (/ducky|macro|automation/.test(lower)) {
    tools.push('azoth_duckyscript');
    planSteps.push('4. Validate & run DuckyScript macro against target surface (duckyscript)');
  }
  if (/vm|docker|container|guest|terminal|shell/.test(lower)) {
    tools.push('azoth_vm_status', 'azoth_vm_exec');
    planSteps.push('5. Probe Docker/Podman Guest OS container before running command (vm_status -> vm_exec)');
  }
  if (tools.length === 0) {
    tools.push('azoth_agent_query', 'azoth_list_files');
    planSteps.push('1. Route directive through local ReAct loop with workspace inspection (azoth_agent_query)');
  }

  return {
    thinking: `[Client ReAct Planner · Offline Fallback]\nEngine: ${engineId} | Mode: ${modeId.toUpperCase()} | Planned Concurrency: ${workers}\nSelected ${tools.length} tool(s): ${tools.join(', ')}\nNo external network egress performed.`,
    result: JSON.stringify({
      ok: true,
      planner: 'client-react-planner-v3.1.0',
      daemon_state: 'offline_client_fallback',
      engine: engineId,
      mode: modeId,
      concurrency_hint: workers,
      selected_mcp_tools: tools,
      execution_plan: planSteps,
      cli_invocation: `azoth --engine ${engineId} --mode ${modeId} -q "${trimmed.replace(/"/g, '\\"')}" --json`,
    }, null, 2),
  };
}

export default function AzothArchonGodModeTool({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isZothBot = (tool?.id || '') === 'zoth-bot';
  const [selectedAgent, setSelectedAgent] = useState(isZothBot ? 'hermes' : 'ollama');
  const [selectedMode, setSelectedMode] = useState(isZothBot ? 'coder' : 'regular');
  const [taskPrompt, setTaskPrompt] = useState(
    isZothBot
      ? 'Route encrypted Telegram/Matrix bot command through Hermes with zero-egress sandbox'
      : 'Run a Python benchmark and verify local agent tools',
  );
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [resultLog, setResultLog] = useState('');
  const [thinkingLog, setThinkingLog] = useState('');
  const [copied, setCopied] = useState(false);
  const [cockpitOnline, setCockpitOnline] = useState(false);
  const [daemonVersion, setDaemonVersion] = useState('3.1.0');
  const canvasRef = useRef(null);

  // Editorial Ivory Light vs Obsidian Gold Dark tokens (>= 4.5:1 contrast everywhere)
  const tk = isDark
    ? {
        shellBg: '#08080B',
        headerBg: '#0E1017',
        panelBg: '#0C0F17',
        subtleBg: '#131620',
        canvasBg: '#06070B',
        textPrimary: '#F5F5F7',
        textSecondary: '#A3AAB8',
        gold: '#D4AF37',
        goldSoft: 'rgba(212, 175, 55, 0.14)',
        goldText: '#F5E6AB',
        emerald: '#34D399',
        emeraldBg: 'rgba(16, 185, 129, 0.15)',
        emeraldBorder: 'rgba(52, 211, 153, 0.36)',
        cyan: '#38BDF8',
        cyanBg: 'rgba(56, 189, 248, 0.15)',
        cyanBorder: 'rgba(56, 189, 248, 0.36)',
        border: 'rgba(255, 255, 255, 0.12)',
        borderAccent: 'rgba(212, 175, 55, 0.34)',
        codeBg: '#05060A',
        codeInk: '#34D399',
        thinkBg: '#070B14',
        thinkInk: '#7DD3FC',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.48)',
      }
    : {
        shellBg: '#FFFFFF',
        headerBg: '#FAF8F3',
        panelBg: '#FFFFFF',
        subtleBg: '#F3EFE6',
        canvasBg: '#FAF8F3',
        textPrimary: '#101828',
        textSecondary: '#475467',
        gold: '#9A6F0B',
        goldSoft: 'rgba(184, 134, 11, 0.12)',
        goldText: '#7A5808',
        emerald: '#047857',
        emeraldBg: '#ECFDF5',
        emeraldBorder: '#A7F3D0',
        cyan: '#0369A1',
        cyanBg: '#E0F2FE',
        cyanBorder: '#7DD3FC',
        border: 'rgba(16, 24, 40, 0.12)',
        borderAccent: 'rgba(154, 111, 11, 0.38)',
        codeBg: '#F3EFE6',
        codeInk: '#181613',
        thinkBg: '#F0F9FF',
        thinkInk: '#0C4A6E',
        shadow: '0 8px 28px rgba(16, 24, 40, 0.06)',
      };

  const activeObj = SUBAGENTS.find((a) => a.id === selectedAgent) || SUBAGENTS[0];
  const activeColor = isDark ? activeObj.colorDark : activeObj.colorLight;

  useEffect(() => {
    setSelectedAgent(isZothBot ? 'hermes' : 'ollama');
    setSelectedMode(isZothBot ? 'coder' : 'regular');
    setTaskPrompt(
      isZothBot
        ? 'Route encrypted Telegram/Matrix bot command through Hermes with zero-egress sandbox'
        : 'Run a Python benchmark and verify local agent tools',
    );
  }, [isZothBot]);

  useEffect(() => {
    if (!isLocalRuntime()) {
      setCockpitOnline(false);
      return;
    }
    fetch('http://127.0.0.1:8136/health')
      .then((r) => r.json())
      .then((d) => {
        setCockpitOnline(d?.status === 'healthy');
        if (d?.version) setDaemonVersion(d.version);
      })
      .catch(() => setCockpitOnline(false));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      if (running) t += 0.024;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 340;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = isDark ? '#06070B' : '#FAF8F3';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.52;

      ctx.font = `10px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 40;
      const rows = 16;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx * 1.3, ny);
          const ang = Math.atan2(ny, nx);
          const v = 0.5 + 0.45 * Math.cos(dist * 12 - t * 3 + ang * concurrency);
          const idx = Math.min(ASCII_CHARS.length - 1, Math.max(0, Math.floor(v * ASCII_CHARS.length)));
          if (idx > 2) {
            ctx.fillStyle = isDark
              ? `rgba(212, 175, 55, ${(v * 0.22).toFixed(2)})`
              : `rgba(154, 111, 11, ${(v * 0.2).toFixed(2)})`;
            ctx.fillText(ASCII_CHARS[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      SUBAGENTS.forEach((ag, i) => {
        const angle = (i / SUBAGENTS.length) * Math.PI * 2 + t * 0.42;
        const radX = cw * 0.35;
        const radY = ch * 0.32;
        const ax = cx + Math.cos(angle) * radX;
        const ay = cy + Math.sin(angle) * radY;
        const isSel = ag.id === selectedAgent;
        const agColor = isDark ? ag.colorDark : ag.colorLight;

        ctx.strokeStyle = isSel ? agColor : (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(16,24,40,0.16)');
        ctx.lineWidth = isSel ? 2.2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        const p = (t * 1.1 + i * 0.25) % 1;
        const px = cx + (ax - cx) * p;
        const py = cy + (ay - cy) * p;
        ctx.fillStyle = agColor;
        ctx.beginPath();
        ctx.arc(px, py, isSel ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isSel ? agColor : (isDark ? '#111624' : '#FFFFFF');
        ctx.strokeStyle = isSel ? (isDark ? '#FFFFFF' : '#101828') : agColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ax, ay, isSel ? 18 : 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSel ? (isDark ? '#06070B' : '#FFFFFF') : (isDark ? '#F5F5F7' : '#101828');
        ctx.font = `bold 10px ${mono}`;
        ctx.fillText(ag.icon || ag.id.slice(0, 2).toUpperCase(), ax, ay + 0.5);

        ctx.fillStyle = isSel ? (isDark ? '#F5E6AB' : '#7A5808') : (isDark ? 'rgba(255,255,255,0.75)' : '#475467');
        ctx.font = `bold 9px ${mono}`;
        ctx.fillText(ag.name.split(' ')[0], ax, ay + (isSel ? 26 : 22));
      });

      // Central Archon Hub
      ctx.fillStyle = isDark ? '#111827' : '#FFFFFF';
      ctx.strokeStyle = isDark ? '#D4AF37' : '#9A6F0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#F5E6AB' : '#101828';
      ctx.font = `bold 11px ${mono}`;
      ctx.fillText('AZOTH', cx, cy - 3);
      ctx.fillStyle = isDark ? '#34D399' : '#047857';
      ctx.font = `bold 8px ${mono}`;
      ctx.fillText(':8136', cx, cy + 10);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [running, selectedAgent, concurrency, isDark]);

  const handleExecute = async () => {
    setExecuting(true);
    setResultLog('');
    setThinkingLog('');
    try {
      if (!isLocalRuntime()) {
        throw new Error('offline_mode');
      }
      const res = await fetch('http://127.0.0.1:8136/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: taskPrompt,
          engine: selectedAgent,
          mode: selectedMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCockpitOnline(true);
        if (data.thinking) setThinkingLog(data.thinking);
        setResultLog(data.reply || JSON.stringify(data, null, 2));
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      const offline = runDeterministicOfflinePlanner(taskPrompt, selectedAgent, selectedMode, concurrency);
      setThinkingLog(offline.thinking);
      setResultLog(offline.result);
    } finally {
      setExecuting(false);
    }
  };

  const loadSampleDucky = () => {
    setTaskPrompt('REM Validate public navigation & workspace screenshot\nVAR TARGET=https://example.com\nNAVIGATE $TARGET\nDELAY 1200\nSCREENSHOT verify_home.png');
  };

  const cliCommand = isZothBot
    ? `zoth-bot --engine ${selectedAgent} --mode ${selectedMode} --dispatch "${taskPrompt.replace(/"/g, '\\"')}"`
    : `azoth --engine ${selectedAgent} --mode ${selectedMode} -q "${taskPrompt.replace(/"/g, '\\"')}" --json`;

  const copyCmd = () => {
    navigator.clipboard?.writeText(cliCommand)?.catch?.(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJson = () => {
    const payload = {
      tool: isZothBot ? 'zoth-bot' : 'azoth-local-agent',
      version: daemonVersion,
      activeEngine: { id: activeObj.id, name: activeObj.name, transport: activeObj.transport },
      mode: selectedMode,
      concurrency,
      taskPrompt,
      cliCommand,
      resultLog,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isZothBot ? 'zoth-bot' : 'azoth-archon'}-${selectedAgent}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${tk.borderAccent}`,
        bgcolor: tk.shellBg,
        boxShadow: tk.shadow,
      }}
    >
      {/* Top Action Bar */}
      <Box
        sx={{
          p: 2.2,
          borderBottom: `1px solid ${tk.border}`,
          bgcolor: tk.headerBg,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: tk.goldSoft,
              border: `1px solid ${tk.borderAccent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tk.gold,
            }}
          >
            <MemoryIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography component="h3" sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.96rem', color: tk.textPrimary, letterSpacing: '0.03em' }}>
                {isZothBot ? 'ZOTH BOT AUTONOMOUS GATEWAY & ARCHON BUS' : 'AZOTH LOCAL ARCHON ORCHESTRATOR'}
              </Typography>
              <Chip
                label={cockpitOnline ? `PORT :8136 ONLINE (v${daemonVersion})` : 'CLIENT PLANNER & VALIDATOR ACTIVE'}
                size="small"
                sx={{
                  height: 22,
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: cockpitOnline ? tk.emeraldBg : tk.cyanBg,
                  color: cockpitOnline ? tk.emerald : tk.cyan,
                  border: `1px solid ${cockpitOnline ? tk.emeraldBorder : tk.cyanBorder}`,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: tk.textSecondary, display: 'block', mt: 0.3 }}>
              {isZothBot
                ? 'Telegram / Matrix / Discord Sovereign Bot Gateway • Hermes • Zero-Egress Sandbox'
                : 'Hardened Loopback ReAct Agent • 36 MCP Tools • DuckyScript Validator • Playwright Sandbox'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {isLocalRuntime() && (
            <Button
              size="small"
              variant="outlined"
              href={`http://127.0.0.1:8136/?theme=${isDark ? 'dark' : 'light'}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
              sx={{
                minHeight: 44,
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 800,
                color: tk.cyan,
                borderColor: tk.cyanBorder,
                '&:hover': { borderColor: tk.cyan, bgcolor: tk.cyanBg },
              }}
            >
              Open :8136 Cockpit
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: tk.textPrimary,
              borderColor: tk.border,
            }}
          >
            {running ? 'Pause Orbit' : 'Resume'}
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={copyCmd}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: tk.gold,
              color: isDark ? '#060609' : '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#7A5808' },
            }}
          >
            {copied ? 'CLI Copied' : 'Copy azoth CLI'}
          </Button>
        </Stack>
      </Box>

      {/* Main Grid Workstation */}
      <SovereignEyebrow accent={tk.cyan} right="Zoth Studio">
        azoth-local-agent
      </SovereignEyebrow>
      <SovereignBand
        seed="azoth-archon-orchestrator"
        eyebrow="Zoth Studio"
        caption="AZOTH Local Archon Agent"
        label="AZOTH Local Archon Agent sovereign visualisation"
      />
      <Grid container>
        {/* Left: Interactive Canvas & Subagent Selector */}
        <Grid xs={12} md={7} sx={{ borderRight: { md: `1px solid ${tk.border}` }, bgcolor: tk.canvasBg }}>
          <Box sx={{ width: '100%', height: 340, position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                p: '5px 10px',
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(8,8,11,0.78)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${tk.border}`,
                backdropFilter: 'blur(4px)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: tk.textSecondary }}>
                ACTIVE ENGINE: <strong style={{ color: activeColor }}>{activeObj.name}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Subagent Chips Strip */}
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${tk.border}`,
              bgcolor: tk.subtleBg,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {SUBAGENTS.map((ag) => {
              const agCol = isDark ? ag.colorDark : ag.colorLight;
              const sel = selectedAgent === ag.id;
              return (
                <Button
                  key={ag.id}
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedAgent(ag.id)}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: sel ? agCol : tk.panelBg,
                    color: sel ? (isDark ? '#050508' : '#FFFFFF') : tk.textPrimary,
                    borderColor: sel ? agCol : tk.border,
                    '&:hover': {
                      bgcolor: sel ? agCol : tk.goldSoft,
                      borderColor: agCol,
                    },
                  }}
                >
                  <span style={{ marginRight: 5 }}>{ag.icon}</span>
                  {ag.name.split(' ')[0]}
                </Button>
              );
            })}
          </Box>
        </Grid>

        {/* Right: Directive Form & Execution Output */}
        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: tk.panelBg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            {/* Persona Modes */}
            <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: tk.textSecondary, mb: 1 }}>
              ARCHON PERSONA MODE
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              {PERSONA_MODES.map((m) => {
                const sel = selectedMode === m.id;
                return (
                  <Button
                    key={m.id}
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedMode(m.id)}
                    sx={{
                      minHeight: 44,
                      px: 1.5,
                      borderRadius: 99,
                      fontFamily: mono,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: sel ? tk.goldSoft : tk.subtleBg,
                      color: sel ? tk.goldText : tk.textPrimary,
                      borderColor: sel ? tk.gold : tk.border,
                    }}
                  >
                    {m.icon} {m.name.split(' ')[0]}
                  </Button>
                );
              })}
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography component="label" htmlFor="azoth-directive-input" sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: tk.textSecondary }}>
                DIRECTIVE OR DUCKYSCRIPT PAYLOAD
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={loadSampleDucky}
                startIcon={<CodeIcon sx={{ fontSize: 14 }} />}
                sx={{ minHeight: 36, fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: tk.gold, textTransform: 'none' }}
              >
                Load Ducky Sample
              </Button>
            </Box>
            <TextField
              id="azoth-directive-input"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="Enter Archon directive or DuckyScript macro..."
              inputProps={{ 'aria-label': 'Sovereign Archon Directive or DuckyScript Payload' }}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  bgcolor: tk.subtleBg,
                  color: tk.textPrimary,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: tk.border,
                },
              }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: tk.textSecondary }}>PLANNER WORKER HINT</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: tk.gold, fontWeight: 800 }}>{concurrency} workers</Typography>
              </Box>
              <Slider
                size="small"
                min={1}
                max={8}
                value={concurrency}
                aria-label="Planner worker concurrency hint"
                onChange={(_, v) => setConcurrency(v)}
                sx={{ color: tk.gold }}
              />
            </Box>

            {/* Execute Button */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleExecute}
                disabled={executing}
                startIcon={executing ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  bgcolor: tk.emerald,
                  color: isDark ? '#05060B' : '#FFFFFF',
                  '&:hover': { bgcolor: isDark ? '#6EE7B7' : '#065F46' },
                }}
              >
                {executing ? 'Dispatching...' : (cockpitOnline ? 'Execute on :8136' : 'Compile Plan / Lint Ducky')}
              </Button>
              <Button
                variant="outlined"
                onClick={exportJson}
                aria-label="Export Execution JSON"
                title="Export Execution JSON"
                sx={{
                  minHeight: 44,
                  minWidth: 48,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: tk.textPrimary,
                  borderColor: tk.border,
                }}
              >
                <DownloadIcon sx={{ fontSize: 18 }} />
              </Button>
            </Stack>

            {/* Active Engine Info */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: tk.subtleBg, border: `1px solid ${tk.border}`, mb: 2 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: tk.goldText }}>
                Engine: {activeObj.name} · {activeObj.transport}
              </Typography>
              <Typography variant="body2" sx={{ color: tk.textSecondary, fontSize: '0.76rem', mt: 0.4 }}>
                {activeObj.role}
              </Typography>
            </Box>

            {/* Output Log if available */}
            {thinkingLog && (
              <Box
                sx={{
                  p: 1.25,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: tk.thinkBg,
                  border: `1px solid ${tk.cyanBorder}`,
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  color: tk.thinkInk,
                  maxHeight: 100,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {thinkingLog}
              </Box>
            )}

            {resultLog && (
              <Box
                sx={{
                  p: 1.25,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  border: `1px solid ${tk.emeraldBorder}`,
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  color: tk.codeInk,
                  maxHeight: 140,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {resultLog}
              </Box>
            )}
          </Box>

          {/* CLI Code Preview */}
          <Box
            component="pre"
            sx={{
              p: 1.5,
              m: 0,
              borderRadius: 2,
              bgcolor: tk.codeBg,
              border: `1px solid ${tk.border}`,
              fontFamily: mono,
              fontSize: '0.7rem',
              color: tk.codeInk,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            $ {cliCommand}
          </Box>
        </Grid>
      </Grid>

      {/* In-App Documentation Section */}
      <Box
        sx={{
          p: 2.5,
          borderTop: `1px solid ${tk.border}`,
          bgcolor: tk.headerBg,
        }}
      >
        <Typography component="h3" sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 900, color: tk.goldText, mb: 1.2 }}>
          WHAT IT DOES &amp; HOW IT WORKS (v3.1.0)
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: tk.panelBg, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: tk.cyan, mb: 0.5 }}>
                1. Hardened Loopback Cockpit (:8136)
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.textSecondary, lineHeight: 1.55 }}>
                Runs FastAPI on <strong>http://127.0.0.1:8136</strong> with strict Host/Origin allowlists, per-boot CSPRNG token gating on privileged routes, SSRF guards, and dual-theme UI.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: tk.panelBg, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: tk.gold, mb: 0.5 }}>
                2. Multi-Engine Routing &amp; 36 MCP Tools
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.textSecondary, lineHeight: 1.55 }}>
                Dispatches prompts across Ollama, Hermes, AGY, Codex, Grok CLI, Claude, and Gemini, and exposes <code>azoth_agent_query</code> plus 35 native <code>azoth_*</code> tools over JSON-RPC 2.0 MCP stdio.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: tk.panelBg, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: tk.emerald, mb: 0.5 }}>
                3. ZothOS CLI &amp; Live TUI
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.textSecondary, lineHeight: 1.55 }}>
                Invoke directly via <code>azoth status</code>, <code>azoth modes</code>, <code>azoth tools</code>, <code>azoth mcp</code>, <code>azoth -q &quot;directive&quot; --json</code>, or <code>azoth-local-agent-tui</code>.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
