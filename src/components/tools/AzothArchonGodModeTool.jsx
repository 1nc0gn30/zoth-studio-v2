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
  Unstable_Grid2 as Grid,
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SUBAGENTS = [
  { id: 'hermes', name: 'Hermes Agent (Copilot GPT-4o)', role: 'Autonomous Code & Refactoring', port: 8099, color: '#D4AF37' },
  { id: 'grok', name: 'Grok CLI (Fast Recon)', role: 'Rapid AST & Spec Verification', port: 8104, color: '#38BDF8' },
  { id: 'ollama', name: 'Ollama Local (Qwen2.5 1.5B)', role: 'Zero-Egress Loopback Gate', port: 11434, color: '#34D399' },
  { id: 'sentinel', name: 'Zoth Sentinel Daemon', role: 'Thermal & Memory Guard (<60°C)', port: 8112, color: '#C084FC' },
];

const ASCII_CHARS = ' ·,:;+*?%S#@';

export default function AzothArchonGodModeTool() {
  const [selectedAgent, setSelectedAgent] = useState('hermes');
  const [taskPrompt, setTaskPrompt] = useState('Audit and synthesize 60fps ASCII & Braille motion shaders across sovereign workspaces');
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const activeObj = SUBAGENTS.find((a) => a.id === selectedAgent) || SUBAGENTS[0];

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
        const radX = cw * 0.31;
        const radY = ch * 0.31;
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
        ctx.arc(px, py, isSel ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#090C15';
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = isSel ? 2.5 : 1.4;
        ctx.beginPath();
        ctx.arc(ax, ay, isSel ? 22 : 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 9px ${mono}`;
        ctx.fillText(ag.id.toUpperCase(), ax, ay - 2);
        ctx.fillStyle = ag.color;
        ctx.font = `600 8px ${mono}`;
        ctx.fillText(`:${ag.port}`, ax, ay + 9);
      });

      ctx.fillStyle = '#0D101B';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F5E6AB';
      ctx.font = `800 10px ${mono}`;
      ctx.fillText('AZOTH', cx, cy - 4);
      ctx.fillStyle = '#34D399';
      ctx.font = `600 8px ${mono}`;
      ctx.fillText('ARCHON v3', cx, cy + 8);

      ctx.fillStyle = 'rgba(245,230,171,0.7)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`AZOTH_ORCHESTRATOR // ENGINE=${selectedAgent.toUpperCase()} // WORKERS=${concurrency} // NICE=10`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedAgent, concurrency, running]);

  const cliCommand = `nice -n 10 ~/NullAITech/bin/zoth-agent-conductor dispatch --engine ${selectedAgent} --dir ~/NullAITech "${taskPrompt.replace(/"/g, '\\"')}"`;

  const copyCmd = () => {
    navigator.clipboard?.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080E',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0D16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.14)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <MemoryIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                AZOTH LOCAL ARCHON ORCHESTRATOR
              </Typography>
              <Chip
                label="ZERO-TELEMETRY DISPATCH DAG"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(16,185,129,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Multi-agent loopback dispatcher for Hermes, Grok CLI, and local Ollama models
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            {running ? 'Pause DAG' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={copyCmd}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copied ? 'Dispatch CLI Copied' : 'Copy Dispatch Command'}
          </Button>
        </Stack>
      </Box>

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060B' }}>
          <Box sx={{ width: '100%', height: 350 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
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
                }}
              >
                {ag.name}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#080A12', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              SUBAGENT DISPATCH DIRECTIVE
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                },
              }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>SWARM WORKER CONCURRENCY</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{concurrency} threads</Typography>
              </Box>
              <Slider size="small" min={1} max={8} value={concurrency} onChange={(_, v) => setConcurrency(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#F5E6AB' }}>
                Active Engine: {activeObj.name} (127.0.0.1:{activeObj.port})
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.78rem', mt: 0.5 }}>
                {activeObj.role}
              </Typography>
            </Box>
          </Box>

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
    </Paper>
  );
}
