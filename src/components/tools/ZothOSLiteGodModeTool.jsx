import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { isLocalRuntime } from '../../utils/sovereignRuntime';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PROVIDERS_56 = [
  {
    id: 'ollama',
    label: 'Ollama Local (8)',
    endpoint: 'http://127.0.0.1:11434/v1',
    envKey: 'OLLAMA_HOST',
    models: [
      'qwen3:8b',
      'llama3.3:8b',
      'deepseek-r1:8b',
      'mistral-nemo:12b',
      'gemma3:12b',
      'phi4:14b',
      'codestral:22b',
      'nomic-embed-text',
    ],
  },
  {
    id: 'hermes',
    label: 'Hermes / Nous (6)',
    endpoint: 'https://inference-api.nousresearch.com/v1',
    envKey: 'NOUS_API_KEY',
    models: [
      'Hermes-3-Llama-3.1-70B',
      'Hermes-3-Llama-3.1-8B',
      'DeepHermes-3-Preview-24B',
      'Hermes-Function-Caller-v2',
      'Nous-Forge-Coder-32B',
      'Hermes-Flash-Router',
    ],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek ★ (6)',
    endpoint: 'https://api.deepseek.com/v1',
    envKey: 'DEEPSEEK_API_KEY',
    models: [
      'deepseek-v4-flash-0731',
      'deepseek-chat',
      'deepseek-reasoner',
      'deepseek-coder-v2',
      'deepseek-r1-distill-32b',
      'deepseek-vl2',
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (8)',
    endpoint: 'https://openrouter.ai/api/v1',
    envKey: 'OPENROUTER_API_KEY',
    models: [
      'deepseek/deepseek-v4-flash-0731',
      'nousresearch/hermes-3-llama-3.1-405b',
      'meta-llama/llama-3.3-70b-instruct',
      'qwen/qwen-2.5-coder-32b-instruct',
      'mistralai/codestral-2501',
      'google/gemini-2.5-flash',
      'anthropic/claude-sonnet-4',
      'x-ai/grok-3-mini',
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI (7)',
    endpoint: 'https://api.openai.com/v1',
    envKey: 'OPENAI_API_KEY',
    models: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'o3',
      'o4-mini',
      'gpt-4o',
      'text-embedding-3-small',
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic (7)',
    endpoint: 'https://api.anthropic.com/v1',
    envKey: 'ANTHROPIC_API_KEY',
    models: [
      'claude-opus-4-0',
      'claude-sonnet-4-0',
      'claude-3-7-sonnet-latest',
      'claude-3-5-haiku-latest',
      'claude-3-5-sonnet-latest',
      'claude-code-sonnet',
      'claude-batch-haiku',
    ],
  },
  {
    id: 'gemini',
    label: 'Google Gemini (7)',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    envKey: 'GEMINI_API_KEY',
    models: [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemma-3-27b-it',
      'text-embedding-004',
      'gemini-2.5-live',
    ],
  },
  {
    id: 'groq',
    label: 'Groq LPU (7)',
    endpoint: 'https://api.groq.com/openai/v1',
    envKey: 'GROQ_API_KEY',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'deepseek-r1-distill-llama-70b',
      'qwen-qwq-32b',
      'gemma2-9b-it',
      'whisper-large-v3-turbo',
      'mixtral-8x7b-32768',
    ],
  },
];

const BOOT_MODES = [
  {
    id: 'toram',
    name: 'Amnesic RAM-Only (toram noswap)',
    cmdline: 'boot=live toram noswap noprompt quiet splash',
    desc: 'Loads SquashFS into system RAM, unmounts USB media, and wipes 100% of volatile state on power-off.',
  },
  {
    id: 'luks',
    name: 'LUKS2 Encrypted USB Vault',
    cmdline: 'boot=live persistence persistence-encryption=luks noswap',
    desc: 'Mounts AES-XTS-512 encrypted partition via zoth-lite-storage for keys, repos, and ZothNet peers.',
  },
  {
    id: 'universal',
    name: 'Universal Safe Graphics (SWCursor)',
    cmdline: 'boot=live nomodeset noswap xforcevesa',
    desc: 'Guaranteed boot on legacy Intel/AMD/NVIDIA laptops, Apple T2, and VirtualBox/QEMU hypervisors.',
  },
];

export default function ZothOSLiteGodModeTool() {
  const [selectedProviderId, setSelectedProviderId] = useState('deepseek');
  const [selectedModel, setSelectedModel] = useState('deepseek-v4-flash-0731');
  const [modelFilter, setModelFilter] = useState('');
  const [bootMode, setBootMode] = useState(BOOT_MODES[0]);
  const [playing, setPlaying] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  const totalModelsCount = useMemo(
    () => PROVIDERS_56.reduce((sum, p) => sum + p.models.length, 0),
    []
  );

  const activeProvider = useMemo(
    () => PROVIDERS_56.find((p) => p.id === selectedProviderId) || PROVIDERS_56[0],
    [selectedProviderId]
  );

  const filteredModels = useMemo(() => {
    const q = modelFilter.trim().toLowerCase();
    if (!q) return activeProvider.models;
    return PROVIDERS_56.flatMap((p) =>
      p.models
        .filter((m) => m.toLowerCase().includes(q) || p.label.toLowerCase().includes(q))
        .map((m) => `${m} (${p.id})`)
    );
  }, [activeProvider, modelFilter]);

  useEffect(() => {
    if (!isLocalRuntime()) return undefined;
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8145/api/system-status');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setLiveStatus(json);
        }
      } catch (_e) {}
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) timeRef.current += dt;
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 680;
      const ch = canvas.clientHeight || 300;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Authentic ZothOS-Lite v1.2 Tails-Style Amnesic Monotone (#F7F7F4 Paper Ivory + #000000 Pure Ink)
      ctx.fillStyle = '#F7F7F4';
      ctx.fillRect(0, 0, cw, ch);

      // Subtle Bayer 4x4 paper halftone grid
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let gx = 8; gx < cw; gx += 12) {
        for (let gy = 36; gy < ch - 28; gy += 12) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Top XFCE / Amnesic Monotone Bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, 28);
      ctx.font = `800 10px ${mono}`;
      ctx.fillStyle = '#F7F7F4';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⣿ ZOTHOS-LITE v1.2 // AMNESIC MONOTONE // ${bootMode.id.toUpperCase()}`, 12, 14);
      ctx.textAlign = 'right';
      ctx.fillText(
        liveStatus ? 'LOCAL :8145 ACTIVE • 56 MODELS' : `${totalModelsCount} MODELS • 8 PROVIDERS`,
        cw - 12,
        14
      );

      // Left Monotone Terminal Window
      const winX = 18;
      const winY = 42;
      const winW = Math.min(340, cw * 0.52);
      const winH = ch - 82;

      ctx.fillStyle = '#000000';
      ctx.fillRect(winX + 4, winY + 4, winW, winH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(winX, winY, winW, winH);

      ctx.fillStyle = '#000000';
      ctx.fillRect(winX, winY, winW, 22);
      ctx.fillStyle = '#F7F7F4';
      ctx.textAlign = 'left';
      ctx.font = `700 9.5px ${mono}`;
      ctx.fillText('▣ zoth-lite-models --active', winX + 8, winY + 11);

      ctx.fillStyle = '#000000';
      ctx.font = `600 9.5px ${mono}`;
      const termLines = [
        `$ zoth-lite-welcome --verify`,
        `[OK] RAM Hygiene : ${bootMode.id === 'toram' ? 'TORAM + NOSWAP' : bootMode.id.toUpperCase()}`,
        `[OK] Providers   : 8 (${totalModelsCount} curated models)`,
        `[OK] Active LLM  : ${selectedModel.slice(0, 26)}`,
        `[OK] Auth Env    : $${activeProvider.envKey}`,
        `[OK] ZothNet Mesh: WireGuard + Yggdrasil`,
        `[OK] Zero Trace  : Volatile tmpfs armed`,
      ];
      termLines.forEach((ln, idx) => {
        const y = winY + 38 + idx * 18;
        if (y < winY + winH - 8) {
          ctx.fillText(ln, winX + 10, y);
        }
      });

      // Right Animated U+2800 Braille Ring on Ivory Paper
      const rxCenter = winX + winW + (cw - (winX + winW)) * 0.5;
      const ryCenter = ch * 0.52;
      const glyphs = ' ⠁⠃⠇⠏⠟⠿⣿';
      ctx.font = `800 11px ${mono}`;
      ctx.textAlign = 'center';
      const maxRadius = Math.min(72, (cw - (winX + winW)) * 0.36);
      for (let ox = -maxRadius - 18; ox <= maxRadius + 18; ox += 12) {
        for (let oy = -maxRadius - 14; oy <= maxRadius + 14; oy += 12) {
          const d = Math.hypot(ox, oy);
          const wave = Math.cos((d - maxRadius * 0.72) * 0.11 - t * 2.4) * Math.exp(-Math.abs(d - maxRadius * 0.72) / 28);
          const norm = Math.max(0, Math.min(1, (wave + 0.5) * 0.85));
          const gi = Math.floor(norm * (glyphs.length - 1));
          if (gi > 1) {
            ctx.fillStyle = gi > 5 ? '#000000' : 'rgba(0,0,0,0.45)';
            ctx.fillText(glyphs[gi], rxCenter + ox, ryCenter + oy);
          }
        }
      }

      // Bottom Status Strip
      ctx.fillStyle = '#EAEAE4';
      ctx.fillRect(0, ch - 24, cw, 24);
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, ch - 24);
      ctx.lineTo(cw, ch - 24);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = `700 9px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`KERNEL: ${bootMode.cmdline}`, 12, ch - 11);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, bootMode, selectedModel, activeProvider, liveStatus, totalModelsCount]);

  const cliSnippet = useMemo(
    () => `# ZothOS-Lite v1.2 — Universal Amnesic Security OS (${totalModelsCount} Models / 8 Providers)
zoth-lite-welcome --check
zoth-lite-models --provider ${activeProvider.id} --set "${selectedModel}"
zoth-lite-storage --mode ${bootMode.id} --status
zoth-lite-pkg --verify-arsenal`,
    [activeProvider.id, selectedModel, bootMode.id, totalModelsCount]
  );

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadProfile = () => {
    const profile = {
      os: 'ZothOS-Lite',
      version: '1.2.0',
      theme: 'Tails-Style Amnesic Monotone (#F7F7F4 / #000000)',
      totalCuratedModels: totalModelsCount,
      providersCount: PROVIDERS_56.length,
      selectedProvider: {
        id: activeProvider.id,
        endpoint: activeProvider.endpoint,
        envKey: activeProvider.envKey,
      },
      selectedModel,
      recommendedLightweightPath: 'DeepSeek Flash (deepseek-v4-flash-0731) via Hermes Agent by Nous Research',
      bootProfile: bootMode,
      cliCommands: cliSnippet.split('\n').filter((l) => !l.startsWith('#')),
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zothos-lite-v1.2-${activeProvider.id}-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: '#F7F7F4',
        color: '#000000',
        border: '2px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        mb: 4,
      }}
    >
      {/* Monotone Paper & Ink Header */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '2px solid #000000',
          bgcolor: '#000000',
          color: '#F7F7F4',
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
              p: 0.9,
              bgcolor: '#F7F7F4',
              color: '#000000',
              border: '1.5px solid #F7F7F4',
              display: 'flex',
            }}
          >
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 900, color: '#F7F7F4', letterSpacing: '0.08em' }}>
                ZOTHOS-LITE v1.2 // AMNESIC MONOTONE OS
              </Typography>
              <Chip
                label={`${totalModelsCount} MODELS • 8 PROVIDERS • TORAM NOSWAP`}
                size="small"
                sx={{
                  height: 20,
                  borderRadius: 0,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  bgcolor: '#F7F7F4',
                  color: '#000000',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#D6D6D0', fontFamily: mono, display: 'block', mt: 0.3, fontSize: '0.68rem' }}>
              1:1 OS & Web Parity (#F7F7F4 Paper Ivory / #000000 Ink) • Recommended Fast Cloud: DeepSeek Flash via Hermes Agent
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            href="https://zothos-lite.nullai.tech"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              borderRadius: 0,
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#F7F7F4',
              borderColor: '#F7F7F4',
              '&:hover': { bgcolor: '#F7F7F4', color: '#000000', borderColor: '#F7F7F4' },
            }}
          >
            zothos-lite.nullai.tech
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPlaying((p) => !p)}
            startIcon={playing ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 0,
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#F7F7F4',
              borderColor: 'rgba(247,247,244,0.55)',
            }}
          >
            {playing ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleDownloadProfile}
            startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 0,
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 900,
              bgcolor: '#F7F7F4',
              color: '#000000',
              '&:hover': { bgcolor: '#E5E5DF' },
            }}
          >
            Export .JSON Profile
          </Button>
        </Stack>
      </Box>

      <Grid container>
        {/* Left Pane: Monotone Desktop Canvas + Boot Hygiene Profiles */}
        <Grid xs={12} md={7} sx={{ borderRight: { md: '2px solid #000000' }, bgcolor: '#F7F7F4' }}>
          <Box sx={{ width: '100%', height: { xs: 260, sm: 300 }, borderBottom: '2px solid #000000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F7F7F4' }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 900, color: '#000000', mb: 1, letterSpacing: '0.06em' }}>
              1. SELECT BOOT & STORAGE HYGIENE PROFILE
            </Typography>
            <Grid container spacing={1.2}>
              {BOOT_MODES.map((m) => {
                const active = bootMode.id === m.id;
                return (
                  <Grid xs={12} sm={4} key={m.id}>
                    <Box
                      onClick={() => setBootMode(m)}
                      sx={{
                        p: 1.2,
                        height: '100%',
                        cursor: 'pointer',
                        bgcolor: active ? '#000000' : '#FFFFFF',
                        color: active ? '#F7F7F4' : '#000000',
                        border: '1.5px solid #000000',
                        boxShadow: active ? 'none' : '3px 3px 0px #000000',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <Typography sx={{ fontFamily: mono, fontSize: '0.69rem', fontWeight: 900 }}>
                        {m.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.64rem', color: active ? '#E2E2DC' : '#333333', mt: 0.5, lineHeight: 1.35 }}>
                        {m.desc}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        {/* Right Pane: Interactive 56-Model / 8-Provider Selector + CLI */}
        <Grid xs={12} md={5} sx={{ p: 2.2, bgcolor: '#EFEFE9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 900, color: '#000000', letterSpacing: '0.06em' }}>
                2. {totalModelsCount} CURATED MODELS ACROSS 8 PROVIDERS
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, color: '#333333' }}>
                zoth-lite-models
              </Typography>
            </Stack>

            <TextField
              size="small"
              fullWidth
              placeholder="Search all 56 models (e.g. deepseek, hermes, qwen, claude)..."
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              sx={{
                mb: 1.2,
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  color: '#000000',
                  '& fieldset': { borderColor: '#000000', borderWidth: '1.5px' },
                },
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.2 }}>
              {PROVIDERS_56.map((p) => {
                const isSel = p.id === selectedProviderId && !modelFilter.trim();
                return (
                  <Button
                    key={p.id}
                    size="small"
                    onClick={() => {
                      setModelFilter('');
                      setSelectedProviderId(p.id);
                      setSelectedModel(p.models[0]);
                    }}
                    sx={{
                      borderRadius: 0,
                      px: 1,
                      py: 0.3,
                      minWidth: 0,
                      fontFamily: mono,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: isSel ? '#000000' : '#FFFFFF',
                      color: isSel ? '#F7F7F4' : '#000000',
                      border: '1.5px solid #000000',
                      '&:hover': { bgcolor: '#000000', color: '#F7F7F4' },
                    }}
                  >
                    {p.label}
                  </Button>
                );
              })}
            </Box>

            <Box
              sx={{
                maxHeight: 132,
                overflowY: 'auto',
                p: 1,
                bgcolor: '#FFFFFF',
                border: '1.5px solid #000000',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.6,
              }}
            >
              {filteredModels.map((m) => {
                const cleanModel = m.replace(/\s+\([a-z]+\)$/, '');
                const active = selectedModel === cleanModel;
                return (
                  <Chip
                    key={m}
                    label={m}
                    size="small"
                    onClick={() => setSelectedModel(cleanModel)}
                    sx={{
                      borderRadius: 0,
                      height: 22,
                      fontFamily: mono,
                      fontSize: '0.63rem',
                      fontWeight: active ? 900 : 700,
                      bgcolor: active ? '#000000' : '#F7F7F4',
                      color: active ? '#F7F7F4' : '#000000',
                      border: '1px solid #000000',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box sx={{ p: 1.4, bgcolor: '#000000', color: '#F7F7F4', border: '1.5px solid #000000' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#F7F7F4', fontWeight: 900 }}>
                ZOTHOS-LITE v1.2 CLI QUICKSTART
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy('cli', cliSnippet)}
                startIcon={copiedKey === 'cli' ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                sx={{
                  borderRadius: 0,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  color: '#000000',
                  bgcolor: '#F7F7F4',
                  py: 0.1,
                  px: 1,
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#E2E2DC' },
                }}
              >
                {copiedKey === 'cli' ? 'Copied' : 'Copy CLI'}
              </Button>
            </Stack>
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: mono,
                fontSize: '0.66rem',
                lineHeight: 1.45,
                color: '#F7F7F4',
                overflowX: 'auto',
              }}
            >
              {cliSnippet}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
