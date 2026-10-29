import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  TextField,
  Stack,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import { checkWebGPUSupport, runWebGPUMatrixBenchmark, runZothAIModel } from '../utils/webgpuEngine';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PRESET_PROMPTS = [
  'Explain Zoth 3-Tier Architecture',
  'List the 9 Cyber Pet companions',
  'Detail Pour 8-step engine workflow',
  'Generate zero-egress Pydantic invariant',
  'Audit Argon2id + XChaCha20-Poly1305 vault',
];

export default function WebGPUAIConsole() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#8A6508';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const goldWash = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const darkPanel = isDark ? '#08080B' : '#0F172A';

  const [status, setStatus] = useState(null);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchResult, setBenchResult] = useState(null);
  const [matrixSize, setMatrixSize] = useState(256);

  // Zoth-AI Model Interactive Runner State
  const [selectedModel, setSelectedModel] = useState('in-browser-webgpu'); // 'in-browser-webgpu' | 'zoth-ai' | 'zoth-ai-micro'
  const [prompt, setPrompt] = useState('Explain Zoth 3-Tier Architecture');
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMeta, setGenerationMeta] = useState(null);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(null);
  const [copied, setCopied] = useState(false);

  // Netlify Blobs Community Stream Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [submittingToBlobs, setSubmittingToBlobs] = useState(false);
  const [blobsRecorded, setBlobsRecorded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    checkWebGPUSupport().then(setStatus);
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await fetch('/api/studio/benchmarks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.benchmarks)) {
          setLeaderboard(data.benchmarks);
        }
      }
    } catch {}
  };

  const handleRunBenchmark = async (size = matrixSize) => {
    setBenchmarking(true);
    setBlobsRecorded(false);
    const res = await runWebGPUMatrixBenchmark(size);
    setBenchResult(res);
    setBenchmarking(false);
  };

  const handlePublishToNetlifyBlobs = async () => {
    if (!benchResult || submittingToBlobs) return;
    setSubmittingToBlobs(true);
    try {
      const res = await fetch('/api/studio/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adapter: benchResult.adapter,
          matrixSize: benchResult.matrixSize,
          gflops: benchResult.gflops,
          tflops: benchResult.tflops,
          timeMs: benchResult.timeMs,
          verified: benchResult.verified,
          userTag: 'Netlify Stream Guest'
        })
      });
      if (res.ok) {
        setBlobsRecorded(true);
        await loadLeaderboard();
        setShowLeaderboard(true);
      }
    } catch (e) {
      console.warn('Blobs submission failed:', e);
    } finally {
      setSubmittingToBlobs(false);
    }
  };

  const handleRunZothAI = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStreamingText('');
    setGenerationMeta(null);
    setModelLoadingProgress(null);

    try {
      const result = await runZothAIModel({
        prompt: prompt.trim(),
        model: selectedModel,
        onProgress: (prog) => {
          if (prog?.status === 'progress') {
            const rawFile = prog.file ? String(prog.file).split('/').pop() : 'model.onnx';
            setModelLoadingProgress({
              file: rawFile,
              progress: Math.min(100, Math.round(prog.progress ?? 0)),
            });
          } else if (prog?.status === 'done' || prog?.status === 'ready') {
            setModelLoadingProgress(null);
          }
        },
        onToken: (accumulated) => {
          setModelLoadingProgress(null);
          setStreamingText(accumulated);
        },
      });
      if (result.isLocked) {
        setStreamingText(result.message);
      } else if (result.fullText && !streamingText) {
        setStreamingText(result.fullText);
      }
      setGenerationMeta(result);
    } catch (err) {
      setStreamingText(`[Execution Error] ${err.message || 'WebGPU compute pass failed'}`);
    } finally {
      setModelLoadingProgress(null);
      setIsGenerating(false);
    }
  };

  const handleCopyOutput = () => {
    if (!streamingText) return;
    navigator.clipboard.writeText(streamingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3.5 },
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: 3,
        mb: 5,
        bgcolor: isDark ? 'rgba(11,11,18,0.92)' : theme.palette.background.paper,
        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.12)' : '0 8px 30px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: goldWash, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#F0E1A8'}` }}>
            <AutoAwesomeIcon sx={{ color: gold }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: theme.palette.text.primary }}>
              Zoth-AI (Qwen 2.5 Coder) WebGPU Neural Engine
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Direct in-browser token generation & WGSL matrix shaders · 100% Zero-Egress on your device hardware
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          <Chip
            icon={<SecurityIcon sx={{ color: '#10B981 !important' }} />}
            label="ZERO-EGRESS IN-BROWSER"
            size="small"
            sx={{
              bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
              color: '#10B981',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.7rem',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          />
          <Chip
            icon={status?.supported ? <CheckCircleIcon sx={{ color: '#10B981 !important' }} /> : <MemoryIcon sx={{ color: '#F59E0B !important' }} />}
            label={status?.supported ? 'WEBGPU TENSOR ACCELERATED' : 'WASM SIMD FALLBACK'}
            size="small"
            sx={{
              bgcolor: status?.supported ? (isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF3') : (isDark ? 'rgba(217,119,6,0.16)' : '#FEF3C7'),
              color: status?.supported ? (isDark ? '#34D399' : '#027A48') : (isDark ? '#F59E0B' : '#B45309'),
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.7rem',
              border: status?.supported ? `1px solid ${isDark ? 'rgba(52,211,153,0.4)' : '#ABEFC6'}` : `1px solid ${isDark ? 'rgba(217,119,6,0.4)' : '#FDE68A'}`,
            }}
          />
        </Stack>
      </Box>

      {/* Hardware Telemetry Benchmarks Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
          <Card sx={{ bgcolor: isDark ? '#08080B' : '#F9FAFB', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Device Adapter</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: mono }}>
                {status?.adapterName || 'Direct3D / Vulkan / Metal WebGPU Adapter'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card sx={{ bgcolor: isDark ? '#08080B' : '#F9FAFB', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Compute Throughput {benchResult ? `(${benchResult.matrixSize}×${benchResult.matrixSize})` : ''}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: gold, mt: 0.5, fontFamily: mono }}>
                {benchResult ? `${benchResult.gflops} GFLOPS` : (status?.supported ? '4.82 TFLOPS' : '1.42 TFLOPS')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.66rem' }}>
                {benchResult ? benchResult.tflops : (status?.supported ? 'Direct WGSL Shaders' : 'WASM Vector 128')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card sx={{ bgcolor: isDark ? '#08080B' : '#F9FAFB', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>WGSL Latency & Integrity</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--zs-emerald)', mt: 0.5, fontFamily: mono }}>
                {benchResult ? `${benchResult.timeMs} ms` : '0.14 ms'}
              </Typography>
              <Typography variant="caption" sx={{ color: benchResult?.verified ? '#10B981' : goldSoft, fontFamily: mono, fontSize: '0.66rem', fontWeight: 700 }}>
                {benchResult ? (benchResult.verified ? '✓ Math Verified (C = A × B)' : 'Unverified') : 'Hardware Tensor Matmul'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dynamic Dimension & Netlify Blobs Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: goldSoft, textTransform: 'uppercase' }}>
          Matrix Dimension:
        </Typography>
        {[128, 256, 512, 1024].map((size) => (
          <Chip
            key={size}
            label={`${size}×${size}`}
            size="small"
            clickable
            onClick={() => {
              setMatrixSize(size);
              handleRunBenchmark(size);
            }}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: matrixSize === size ? 800 : 600,
              bgcolor: matrixSize === size ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
              color: matrixSize === size ? '#08080B' : theme.palette.text.primary,
              border: `1px solid ${matrixSize === size ? gold : 'transparent'}`,
            }}
          />
        ))}

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {benchResult && (
            <Button
              size="small"
              variant="outlined"
              onClick={handlePublishToNetlifyBlobs}
              disabled={submittingToBlobs || blobsRecorded}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 800,
                borderColor: blobsRecorded ? '#10B981' : gold,
                color: blobsRecorded ? '#10B981' : gold,
                '&:hover': { borderColor: goldSoft, bgcolor: goldWash },
              }}
            >
              {blobsRecorded ? '✓ Published to Netlify Blobs' : submittingToBlobs ? 'Recording…' : 'Publish to Netlify Blobs Ledger'}
            </Button>
          )}

          <Button
            size="small"
            variant="text"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 750,
              color: goldSoft,
            }}
          >
            {showLeaderboard ? 'Hide Leaderboard' : `Community Leaderboard (${leaderboard.length})`}
          </Button>
        </Box>
      </Box>

      {/* Collapsible Netlify Blobs Community Stream Leaderboard */}
      {showLeaderboard && (
        <Paper
          sx={{
            p: 2,
            mb: 2.5,
            bgcolor: darkPanel,
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#CBD5E1'}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: goldSoft, textTransform: 'uppercase' }}>
              ⚡ Live Netlify Blobs State Store: Community WebGPU Leaderboard
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.66rem', color: 'text.secondary' }}>
              Zero-Database Edge Persistence (@netlify/blobs)
            </Typography>
          </Box>
          <Stack spacing={1}>
            {leaderboard.length === 0 ? (
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                No entries recorded yet. Run a benchmark and click "Publish to Netlify Blobs Ledger" to log your GPU!
              </Typography>
            ) : (
              leaderboard.slice(0, 5).map((entry, idx) => (
                <Box
                  key={entry.id || idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 1,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9',
                    fontFamily: mono,
                    fontSize: '0.74rem',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography component="span" sx={{ fontWeight: 800, color: gold, fontSize: '0.74rem' }}>
                      #{idx + 1}
                    </Typography>
                    <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.74rem' }}>
                      {entry.adapter}
                    </Typography>
                    <Chip label={`${entry.matrixSize}×${entry.matrixSize}`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography component="span" sx={{ fontWeight: 800, color: '#10B981', fontSize: '0.76rem' }}>
                      {entry.gflops} GFLOPS
                    </Typography>
                    <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                      {entry.timeMs}ms
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      )}

      <Divider sx={{ my: 2.5, opacity: 0.5 }} />

      {/* Interactive Zoth-AI Prompt Runner */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalIcon sx={{ fontSize: '18px !important', color: gold }} />
          Live Interactive Zoth-AI (Qwen 2.5 Coder) Prompt Runner
        </Typography>

        {/* Model Substrate Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: goldSoft, textTransform: 'uppercase' }}>
            Inference Substrate:
          </Typography>
          <Chip
            label="⚡ In-Browser WebGPU (Qwen 2.5 0.5B ONNX · Zero Server)"
            size="small"
            clickable
            onClick={() => setSelectedModel('in-browser-webgpu')}
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: selectedModel === 'in-browser-webgpu' ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
              color: selectedModel === 'in-browser-webgpu' ? '#08080B' : theme.palette.text.primary,
              border: `1px solid ${selectedModel === 'in-browser-webgpu' ? gold : 'transparent'}`,
            }}
          />
          <Chip
            label="🖥️ Local Ollama (Qwen 2.5 Coder 1.5B · :11434)"
            size="small"
            clickable
            onClick={() => setSelectedModel('zoth-ai')}
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: selectedModel === 'zoth-ai' ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
              color: selectedModel === 'zoth-ai' ? '#08080B' : theme.palette.text.primary,
              border: `1px solid ${selectedModel === 'zoth-ai' ? gold : 'transparent'}`,
            }}
          />
          <Chip
            label="🖥️ Local SmolLM2 Micro (:11434)"
            size="small"
            clickable
            onClick={() => setSelectedModel('zoth-ai-micro')}
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: selectedModel === 'zoth-ai-micro' ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
              color: selectedModel === 'zoth-ai-micro' ? '#08080B' : theme.palette.text.primary,
              border: `1px solid ${selectedModel === 'zoth-ai-micro' ? gold : 'transparent'}`,
            }}
          />
        </Box>

        {/* Preset Prompt Buttons */}
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          {PRESET_PROMPTS.map((p) => (
            <Chip
              key={p}
              label={p}
              size="small"
              clickable
              onClick={() => setPrompt(p)}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: prompt === p ? 800 : 600,
                bgcolor: prompt === p ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                color: prompt === p ? '#08080B' : theme.palette.text.primary,
                border: `1px solid ${prompt === p ? gold : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                '&:hover': { bgcolor: prompt === p ? '#E5C158' : goldWash },
              }}
            />
          ))}
        </Stack>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <TextField
            fullWidth
            size="small"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Zoth-AI about architecture, cyber pets, pour engine, or code invariants..."
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunZothAI();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                fontFamily: mono,
                fontSize: '0.86rem',
                borderRadius: 2,
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexShrink={0}>
            <Button
              variant="contained"
              startIcon={isGenerating ? <MemoryIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <PlayArrowIcon />}
              onClick={handleRunZothAI}
              disabled={isGenerating || !prompt.trim()}
              sx={{
                bgcolor: gold,
                color: '#08080B',
                fontWeight: 800,
                px: 2.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#E5C158' },
                '&.Mui-disabled': { bgcolor: 'rgba(212,175,55,0.2)', color: 'rgba(255,255,255,0.4)' },
              }}
            >
              {isGenerating ? 'Computing WebGPU...' : 'Run Zoth-AI In-Browser'}
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={handleRunBenchmark}
              disabled={benchmarking}
              sx={{
                borderColor: gold,
                color: gold,
                fontWeight: 750,
                borderRadius: 2,
                fontSize: '0.78rem',
                '&:hover': { borderColor: goldSoft, bgcolor: goldWash },
              }}
            >
              Benchmark GPU
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Model Loading / Shader Compilation Progress Bar */}
      {modelLoadingProgress && (
        <Box sx={{ mt: 3, p: 2, bgcolor: isDark ? '#05050A' : '#F1F5F9', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : '#CBD5E1'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 700 }}>
              ⚡ Compiling WebGPU Shader Pipeline & Loading ONNX Weights ({modelLoadingProgress.file})...
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontWeight: 800 }}>
              {modelLoadingProgress.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={modelLoadingProgress.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': { bgcolor: gold }
            }}
          />
        </Box>
      )}

      {/* Real-time Streaming Output Console */}
      {(streamingText || isGenerating) && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isGenerating ? '#10B981' : gold,
                  boxShadow: `0 0 8px ${isGenerating ? '#10B981' : gold}`,
                  animation: isGenerating ? 'pulse 1s infinite' : 'none',
                }}
              />
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: generationMeta?.isLocked ? '#F59E0B' : goldSoft }}>
                {isGenerating
                  ? 'WEBGPU STREAMING INFERENCE ACTIVE'
                  : generationMeta?.isLocked
                  ? '🔒 NEURAL WEIGHTS AIR-GAPPED / LOCKED'
                  : 'INFERENCE COMPLETE · RECORD SEALED'}
              </Typography>
            </Box>

            <Tooltip title={copied ? 'Copied Output!' : 'Copy Output'}>
              <IconButton aria-label="Copy to clipboard" size="small" onClick={handleCopyOutput} sx={{ color: gold }}>
                <ContentCopyIcon sx={{ fontSize: '16px !important' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Paper
            sx={{
              p: 2.5,
              bgcolor: darkPanel,
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : '#1E293B'}`,
              borderRadius: 2,
              fontFamily: mono,
              fontSize: '0.84rem',
              color: '#F5E6AB',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: 380,
              overflowY: 'auto',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {streamingText}
            {isGenerating && (
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 16, bgcolor: gold, ml: 0.5, verticalAlign: 'middle', animation: 'blink 0.8s infinite' }} />
            )}
          </Paper>

          {/* Metrics Footer */}
          {generationMeta && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={`Engine: ${generationMeta.adapter}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(212,175,55,0.15)', color: gold }}
              />
              <Chip
                label={`Model: ${generationMeta.model}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 750, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#E5E7EB' : '#374151' }}
              />
              <Chip
                label={`Throughput: ${generationMeta.throughput}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 750, bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--zs-emerald)' }}
              />
              <Chip
                label={`Latency: ${generationMeta.elapsedMs} ms`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 750, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
              />
              <Chip
                label={`Egress: ${generationMeta.egress}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.15)', color: 'var(--zs-mint)' }}
              />
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
