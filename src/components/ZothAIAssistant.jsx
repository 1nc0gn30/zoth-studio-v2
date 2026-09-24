import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Chip, CircularProgress, Stack, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import MemoryIcon from '@mui/icons-material/Memory';
import BoltIcon from '@mui/icons-material/Bolt';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* ==========================================================================
   Zoth AI — local Qwen2.5-0.5B-Instruct run in-browser via Transformers.js.
   Uses WebGPU when the browser exposes it, falls back to WASM/CPU otherwise.
   Each tool registers a set of "actions" (name -> {desc, fn}) that the model
   can invoke to make live changes to the tool.
   ========================================================================== */

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
const MODEL_DTYPE = 'q4';

let pipelinePromise = null;

function loadPipeline() {
  if (pipelinePromise) return pipelinePromise;
  pipelinePromise = (async () => {
    const { pipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = false;
    // Prefer WebGPU, fall back to WASM.
    const device = navigator.gpu ? 'webgpu' : 'wasm';
    const gen = await pipeline('text-generation', MODEL_ID, { dtype: MODEL_DTYPE, device });
    return gen;
  })();
  return pipelinePromise;
}

export default function ZothAIAssistant({ toolName, actions = [], accent = '#D4AF37' }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error | running
  const [log, setLog] = useState([]);
  const [device, setDevice] = useState(null);
  const genRef = useRef(null);

  const pushLog = useCallback((entry) => {
    setLog((prev) => [...prev.slice(-19), entry]);
  }, []);

  const init = useCallback(async () => {
    if (genRef.current) return;
    setStatus('loading');
    pushLog({ type: 'sys', text: `Loading ${MODEL_ID} (${MODEL_DTYPE})…` });
    try {
      const gen = await loadPipeline();
      genRef.current = gen;
      setDevice(navigator.gpu ? 'webgpu' : 'wasm');
      setStatus('ready');
      pushLog({ type: 'sys', text: `Model ready on ${navigator.gpu ? 'WebGPU' : 'WASM/CPU'}. Ask me to change the ${toolName}.` });
    } catch (e) {
      setStatus('error');
      pushLog({ type: 'err', text: `Model load failed: ${String(e).slice(0, 160)}` });
    }
  }, [toolName, pushLog]);

  // Do not auto-download the model. Qwen2.5 is ~400MB; the user starts it.

  const actionList = actions
    .map((a) => `- ${a.name}: ${a.desc}`)
    .join('\n');

  const run = useCallback(async () => {
    const text = input.trim();
    if (!text || status === 'running') return;
    if (!genRef.current) {
      await init();
      if (!genRef.current) return;
    }
    setInput('');
    setStatus('running');
    pushLog({ type: 'user', text });

    const system = [
      `You are Zoth AI, the embedded assistant for the "${toolName}" tool in Zoth Studio.`,
      `You can change the tool live by calling ONE action. Available actions:`,
      actionList,
      `Respond with ONLY a JSON object of the form {"action":"<name>","value":<value>} — no prose, no markdown.`,
      `If the request is not actionable, respond {"action":"none","value":""}.`,
    ].join('\n');

    try {
      const out = await genRef.current(
        [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
        { max_new_tokens: 64, do_sample: false, temperature: 0 }
      );
      const raw = (out?.[0]?.generated_text?.[1]?.content || out?.[0]?.generated_text || '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        pushLog({ type: 'ai', text: raw.slice(0, 200) });
        setStatus('ready');
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        pushLog({ type: 'err', text: 'Model returned malformed JSON.' });
        setStatus('ready');
        return;
      }
      const { action, value } = parsed;
      const target = actions.find((a) => a.name === action);
      if (target) {
        target.fn(value);
        pushLog({ type: 'ai', text: `✓ ${target.desc} → ${JSON.stringify(value)}` });
      } else {
        pushLog({ type: 'ai', text: `No action "${action}" — ${raw.slice(0, 120)}` });
      }
    } catch (e) {
      pushLog({ type: 'err', text: `Inference error: ${String(e).slice(0, 160)}` });
    }
    setStatus('ready');
  }, [input, status, toolName, actionList, actions, pushLog, init]);

  const statusChip = {
    idle: { label: 'NOT LOADED', color: theme.palette.text.secondary },
    loading: { label: 'LOADING MODEL…', color: '#F59E0B' },
    ready: { label: device === 'webgpu' ? 'READY · WEBGPU' : 'READY · WASM', color: '#34D399' },
    running: { label: 'THINKING…', color: '#38BDF8' },
    error: { label: 'ERROR', color: '#F87171' },
  }[status];

  return (
    <Paper
      sx={{
        mt: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
        }}
      >
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: isDark ? 'rgba(212,175,55,0.16)' : '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoAwesomeIcon sx={{ color: gold }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Zoth AI <span style={{ color: gold }}>· {toolName}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.66rem' }}>
            Qwen2.5-0.5B-Instruct · local · {device === 'webgpu' ? 'WebGPU' : 'WASM/CPU'}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={statusChip.label}
          sx={{
            height: 22,
            fontSize: '0.6rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: statusChip.color,
            bgcolor: isDark ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
            border: `1px solid ${statusChip.color}55`,
          }}
        />
      </Box>

      {/* Log */}
      <Box sx={{ px: 2.5, py: 1.5, minHeight: 90, maxHeight: 180, overflowY: 'auto', bgcolor: isDark ? '#0B0B12' : '#FCFCFD' }}>
        {log.length === 0 && (
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.72rem' }}>
            Local Qwen2.5 loads on first Run (WebGPU when the browser has it, otherwise WASM). It does not phone home after the weights are cached.
          </Typography>
        )}
        {log.map((entry, i) => (
          <Box key={i} sx={{ mb: 0.75, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.66rem', color: {
              user: '#38BDF8', ai: '#34D399', sys: theme.palette.text.secondary, err: '#F87171',
            }[entry.type], fontWeight: 800, minWidth: 34 }}>
              {entry.type === 'user' ? 'YOU' : entry.type === 'ai' ? 'ZOTH' : entry.type === 'err' ? 'ERR' : 'SYS'}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontFamily: mono, fontSize: '0.72rem', wordBreak: 'break-word' }}>
              {entry.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, display: 'flex', gap: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Ask Zoth AI to change the ${toolName}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
          disabled={status === 'running' || status === 'loading'}
          sx={{ '& .MuiOutlinedInput-root': { fontFamily: mono, fontSize: '0.82rem' } }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={run}
          disabled={status === 'running' || status === 'loading' || !input.trim()}
          startIcon={status === 'running' ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          sx={{ minWidth: 110, fontWeight: 800 }}
        >
          {status === 'running' ? 'Running' : status === 'loading' ? 'Loading' : status === 'idle' ? 'Load & run' : 'Run'}
        </Button>
      </Box>

      {/* Action hints */}
      <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {actions.slice(0, 6).map((a) => (
          <Chip
            key={a.name}
            size="small"
            label={a.name}
            onClick={() => setInput(`change the ${a.name.replace(/([A-Z])/g, ' $1').toLowerCase()}`)}
            sx={{ fontSize: '0.62rem', fontWeight: 700, fontFamily: mono, bgcolor: isDark ? 'rgba(212,175,55,0.1)' : '#F2F4F7', color: gold, border: `1px solid ${theme.palette.divider}` }}
          />
        ))}
      </Box>
    </Paper>
  );
}
