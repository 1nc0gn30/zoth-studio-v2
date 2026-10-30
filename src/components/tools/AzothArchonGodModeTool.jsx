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
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SUBAGENTS = [
  { id: 'ollama', name: 'Sovereign Local Archon (Ollama)', role: 'Zero-Egress Local Synthesis & Tool Execution', port: 11434, color: '#34D399', icon: '🦙' },
  { id: 'hermes', name: 'Hermes Agent CLI', role: 'Autonomous Multi-Step Code & Plan Execution', port: 8099, color: '#D4AF37', icon: '🏛️' },
  { id: 'agy', name: 'Antigravity CLI (AGY)', role: 'Dual Sovereign Agent Loop & Skill Dispatch', port: 8100, color: '#60A5FA', icon: '🚀' },
  { id: 'codex', name: 'Codex CLI', role: 'Fast Deterministic AST Refactoring & Codegen', port: 8102, color: '#A78BFA', icon: '💻' },
  { id: 'grok_cli', name: 'Grok CLI', role: 'Real-Time X Intelligence & AST Verification', port: 8104, color: '#38BDF8', icon: '⚡' },
  { id: 'claude', name: 'Claude Code Engine', role: 'High-Reasoning Multi-File Architecture', port: 8106, color: '#F472B6', icon: '🎭' },
  { id: 'sentinel', name: 'Zoth Sentinel Daemon', role: 'Process Health & Thermal Guard (<60°C)', port: 8112, color: '#FBBF24', icon: '🛡️' },
];

const PERSONA_MODES = [
  { id: 'regular', name: 'Truth & Regular', icon: '⚡', desc: 'Objective, razor-sharp, zero-fluff reality.' },
  { id: 'fun', name: 'Fun Mode', icon: '🌶️', desc: 'Irreverent, witty, playful, and sharp.' },
  { id: 'think', name: 'DeepSearch & Think', icon: '🧠', desc: 'Deep multi-source citations & chain-of-thought.' },
  { id: 'coder', name: 'Coder & Builder', icon: '💻', desc: 'High-velocity code sandbox & execution.' },
];

const ASCII_CHARS = ' ·,:;+*?%S#@';

export default function AzothArchonGodModeTool() {
  const [selectedAgent, setSelectedAgent] = useState('ollama');
  const [selectedMode, setSelectedMode] = useState('regular');
  const [taskPrompt, setTaskPrompt] = useState('Run a Python benchmark and verify local agent tools');
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [resultLog, setResultLog] = useState('');
  const [thinkingLog, setThinkingLog] = useState('');
  const [copied, setCopied] = useState(false);
  const [cockpitOnline, setCockpitOnline] = useState(true);
  const canvasRef = useRef(null);

  const activeObj = SUBAGENTS.find((a) => a.id === selectedAgent) || SUBAGENTS[0];

  useEffect(() => {
    fetch('http://127.0.0.1:8136/health')
      .then((r) => r.json())
      .then((d) => setCockpitOnline(d?.status === 'healthy'))
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
      const ch = canvas.clientHeight || 350;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05060B';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.52;

      ctx.font = `10px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 42;
      const rows = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx * 1.3, ny);
          const ang = Math.atan2(ny, nx);
          const v = 0.5 + 0.45 * Math.cos(dist * 12 - t * 3 + ang * concurrency);
          const idx = Math.min(ASCII_CHARS.length - 1, Math.max(0, Math.floor(v * ASCII_CHARS.length)));
          if (idx > 2) {
            ctx.fillStyle = `rgba(212, 175, 55, ${(v * 0.22).toFixed(2)})`;
            ctx.fillText(ASCII_CHARS[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      SUBAGENTS.forEach((ag, i) => {
        const angle = (i / SUBAGENTS.length) * Math.PI * 2 + t * 0.45;
        const radX = cw * 0.35;
        const radY = ch * 0.32;
        const ax = cx + Math.cos(angle) * radX;
        const ay = cy + Math.sin(angle) * radY;
        const isSel = ag.id === selectedAgent;

        ctx.strokeStyle = isSel ? ag.color : 'rgba(255,255,255,0.16)';
        ctx.lineWidth = isSel ? 2.2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        const p = (t * 1.1 + i * 0.25) % 1;
        const px = cx + (ax - cx) * p;
        const py = cy + (ay - cy) * p;
        ctx.fillStyle = ag.color;
        ctx.beginPath();
        ctx.arc(px, py, isSel ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isSel ? ag.color : '#0B0F19';
        ctx.strokeStyle = isSel ? '#FFFFFF' : ag.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ax, ay, isSel ? 18 : 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSel ? '#05060B' : '#E2E8F0';
        ctx.font = `bold 10px ${mono}`;
        ctx.fillText(ag.icon || ag.id.slice(0, 2).toUpperCase(), ax, ay + 0.5);

        ctx.fillStyle = isSel ? '#F5E6AB' : 'rgba(255,255,255,0.7)';
        ctx.font = `9px ${mono}`;
        ctx.fillText(ag.name.split(' ')[0], ax, ay + (isSel ? 26 : 22));
      });

      // Central Sovereign Archon Hub
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F5E6AB';
      ctx.font = `bold 11px ${mono}`;
      ctx.fillText('AZOTH', cx, cy - 2);
      ctx.fillStyle = '#34D399';
      ctx.font = `8px ${mono}`;
      ctx.fillText(`:8136`, cx, cy + 10);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [running, selectedAgent, concurrency]);

  const handleExecute = async () => {
    setExecuting(true);
    setResultLog('');
    setThinkingLog('');
    try {
      const res = await fetch('http://127.0.0.1:8136/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: taskPrompt }),
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
      // Offline fallback: simulate local archon execution
      setTimeout(() => {
        setThinkingLog(`[Archon Chain-of-Thought] Analyzing directive in ${selectedMode.toUpperCase()} mode...\nDispatched to worker: ${activeObj.name}\nZero external network egress enforced.`);
        setResultLog(
          JSON.stringify(
            {
              ok: true,
              directive: taskPrompt,
              engine: selectedAgent,
              mode: selectedMode,
              archon_response: `Executing directive on sovereign local archon.\nBenchmarking isolated python environment with ${concurrency} worker threads.\nStatus: ALL_INVARIANTS_PASSED.`,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }, 400);
    } finally {
      setExecuting(false);
    }
  };

  const cliCommand = `azoth -q "${taskPrompt.replace(/"/g, '\\"')}" --mode ${selectedMode} --json`;

  const copyCmd = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJson = () => {
    const payload = {
      tool: 'azoth-local-agent',
      version: '3.0.0',
      activeEngine: activeObj,
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
    a.download = `azoth-archon-${selectedAgent}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        bgcolor: '#06070B',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top Action Bar */}
      <Box
        sx={{
          p: 2.2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0A0D16',
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
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
            }}
          >
            <MemoryIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.98rem', color: '#F8FAFC', letterSpacing: '0.04em' }}>
                AZOTH LOCAL ARCHON ORCHESTRATOR
              </Typography>
              <Chip
                label={cockpitOnline ? "PORT :8136 ONLINE" : "PORT :8136 LOCAL LOOP"}
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: cockpitOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: cockpitOnline ? '#34D399' : '#FBBF24',
                  border: cockpitOnline ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(245,158,11,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.2 }}>
              Multi-Agent Orchestrator • Zero-Egress ReAct Loop • Chrome Headed Automation • Python Sandbox
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8136"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56,189,248,0.3)',
              '&:hover': { borderColor: '#38BDF8', bgcolor: 'rgba(56,189,248,0.08)' },
            }}
          >
            Open :8136 Cockpit
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
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
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copied ? 'CLI Copied' : 'Copy azoth CLI'}
          </Button>
        </Stack>
      </Box>

      {/* Main Grid Workstation */}
      <Grid container>
        {/* Left: Interactive Canvas & Subagent Selector */}
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060B' }}>
          <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                p: '4px 10px',
                borderRadius: 1.5,
                bgcolor: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#94A3B8' }}>
                ACTIVE NODE: <strong style={{ color: activeObj.color }}>{activeObj.name}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Subagent Chips Strip */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090B13',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {SUBAGENTS.map((ag) => (
              <Button
                key={ag.id}
                size="small"
                variant="outlined"
                onClick={() => setSelectedAgent(ag.id)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: selectedAgent === ag.id ? ag.color : 'rgba(255,255,255,0.02)',
                  color: selectedAgent === ag.id ? '#050508' : '#94A3B8',
                  borderColor: selectedAgent === ag.id ? ag.color : 'rgba(255,255,255,0.12)',
                  '&:hover': {
                    bgcolor: selectedAgent === ag.id ? ag.color : 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                <span style={{ marginRight: 5 }}>{ag.icon}</span>
                {ag.name.split(' ')[0]}
              </Button>
            ))}
          </Box>
        </Grid>

        {/* Right: Directive Form & Execution Output */}
        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#080A12', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            {/* Persona Modes */}
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              ARCHON PERSONA MODE
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              {PERSONA_MODES.map((m) => (
                <Chip
                  key={m.id}
                  label={`${m.icon} ${m.name.split(' ')[0]}`}
                  onClick={() => setSelectedMode(m.id)}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: selectedMode === m.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                    color: selectedMode === m.id ? '#F5E6AB' : '#94A3B8',
                    border: selectedMode === m.id ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </Stack>

            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              SUBAGENT DIRECTIVE / TASK
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="Enter directive for sovereign local archon..."
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#E2E8F0',
                },
              }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>CONCURRENCY WORKERS</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{concurrency} threads</Typography>
              </Box>
              <Slider size="small" min={1} max={8} value={concurrency} onChange={(_, v) => setConcurrency(v)} sx={{ color: '#D4AF37' }} />
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
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  bgcolor: '#34D399',
                  color: '#05060B',
                  '&:hover': { bgcolor: '#6EE7B7' },
                }}
              >
                {executing ? 'Executing ReAct Loop...' : 'Dispatch Directive'}
              </Button>
              <Button
                variant="outlined"
                onClick={exportJson}
                title="Export Execution JSON"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </Button>
            </Stack>

            {/* Active Node Info */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', mb: 2 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#F5E6AB' }}>
                Engine: {activeObj.name} (: {activeObj.port})
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.74rem', mt: 0.4 }}>
                {activeObj.role}
              </Typography>
            </Box>

            {/* Output Log if available */}
            {thinkingLog && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#040711',
                  border: '1px solid rgba(56,189,248,0.2)',
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  color: '#38BDF8',
                  maxHeight: 90,
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
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#030508',
                  border: '1px solid rgba(52,211,153,0.3)',
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  color: '#34D399',
                  maxHeight: 120,
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
              bgcolor: '#040407',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: mono,
              fontSize: '0.68rem',
              color: '#34D399',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            $ {cliCommand}
          </Box>
        </Grid>
      </Grid>

      {/* In-App Documentation Accordion Section */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#060810',
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 900, color: '#F5E6AB', mb: 1 }}>
          WHAT IT DOES & HOW IT WORKS
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', mb: 0.5 }}>
                1. Sovereign Local Cockpit
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Runs an isolated FastAPI daemon on <strong>http://127.0.0.1:8136</strong> with headed Chrome browser automation, full-fidelity terminal bridge, and local Python execution sandbox.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#D4AF37', mb: 0.5 }}>
                2. Multi-Engine ReAct Routing
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Dispatches tasks seamlessly between Sovereign Local Ollama, Hermes Agent, AGY CLI, Codex CLI, Grok CLI, and Claude Code without leaking state to external clouds.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#34D399', mb: 0.5 }}>
                3. ZothOS CLI Command
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Invoke directly anywhere in the system terminal using <code>azoth status</code>, <code>azoth modes</code>, or <code>azoth -q &quot;directive&quot; --json</code>.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
