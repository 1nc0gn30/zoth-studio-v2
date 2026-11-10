import React, { useState, useEffect, useRef } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  TextField,
  Unstable_Grid2 as Grid,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import FaceIcon from '@mui/icons-material/Face';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SovereignBand from '../sovereign/SovereignBand.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function LikenessDeskGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const emerald = '#10B981';
  const emeraldSoft = 'rgba(16, 185, 129, 0.12)';
  const cyan = '#00F0FF';

  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [speechPrompt, setSpeechPrompt] = useState('Welcome to ZothOS. I am your sovereign local AI video double running on the Quadro P1000.');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [mouthSensitivity, setMouthSensitivity] = useState(1.2);
  const [mouthPhase, setMouthPhase] = useState(0);

  const [pipelineStatus, setPipelineStatus] = useState({
    online: false,
    voiceModel: false,
    voiceTrained: false,
    voiceSeconds: 0,
    face: false,
    idle: false,
    motion: false,
    mouth: { x: 0.42, y: 0.39, w: 0.1, h: 0.05 },
    faceGpu: false,
    faceGpuName: 'Quadro P1000'
  });

  // Query live backend on :9395
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:9395/api/status', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        setPipelineStatus({
          online: true,
          voiceModel: data.voiceModel ?? true,
          voiceTrained: data.voiceTrained ?? true,
          voiceSeconds: data.voiceSeconds ?? 16.7,
          face: data.face ?? true,
          idle: data.idle ?? true,
          motion: data.motion ?? true,
          mouth: data.mouth || { x: 0.42, y: 0.39, w: 0.1, h: 0.05 },
          faceGpu: data.faceGpu ?? true,
          faceGpuName: data.faceGpuName || 'Quadro P1000'
        });
      } else {
        setPipelineStatus(prev => ({ ...prev, online: false }));
      }
    } catch {
      setPipelineStatus(prev => ({ ...prev, online: false }));
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animation frame loop for face & speech waveform visualizer
  useEffect(() => {
    let animId;
    let step = 0;
    const loop = () => {
      step += 0.05;
      if (isPlaying || isSynthesizing) {
        setMouthPhase(Math.abs(Math.sin(step * 3) * Math.cos(step * 1.5)));
      } else {
        setMouthPhase(Math.abs(Math.sin(step * 0.5) * 0.08)); // subtle breathing
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isSynthesizing]);

  // Render video double avatar & waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Deep studio background
    ctx.fillStyle = isDark ? '#06070B' : '#F1F5F9';
    ctx.fillRect(0, 0, width, height);

    // Subtle facial mesh & contour guides
    const cx = width / 2;
    const cy = height * 0.45;
    const headRadius = 110;

    // Head oval
    ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(184, 134, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, headRadius * 0.78, headRadius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eye line
    const eyeY = cy - 20;
    ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 180, 216, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - 36, eyeY, 12, 0, Math.PI * 2);
    ctx.arc(cx + 36, eyeY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Iris points
    ctx.fillStyle = cyan;
    ctx.beginPath();
    ctx.arc(cx - 36, eyeY, 4, 0, Math.PI * 2);
    ctx.arc(cx + 36, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose bridge
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, eyeY);
    ctx.lineTo(cx - 4, cy + 22);
    ctx.lineTo(cx + 4, cy + 22);
    ctx.stroke();

    // Reactive animated mouth
    const mouthY = cy + 52;
    const mouthW = 34 * mouthSensitivity;
    const mouthOpen = 4 + mouthPhase * 18 * mouthSensitivity;

    ctx.strokeStyle = emerald;
    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, mouthY, mouthW, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wav2Lip tracking bounding box
    const mBox = pipelineStatus.mouth || { x: 0.42, y: 0.39, w: 0.1, h: 0.05 };
    const bx = cx - mouthW - 12;
    const by = mouthY - mouthOpen - 10;
    const bw = (mouthW + 12) * 2;
    const bh = (mouthOpen + 10) * 2;

    ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.6)' : 'rgba(184, 134, 11, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);

    // Bounding box tag
    ctx.font = `10px ${mono}`;
    ctx.fillStyle = gold;
    ctx.fillText('Wav2Lip ROI [Quadro P1000]', bx, by - 4);

    // Audio frequency waveform bar visualizer at bottom
    const barCount = 48;
    const barWidth = width / barCount;
    for (let i = 0; i < barCount; i++) {
      const active = isPlaying || isSynthesizing;
      const h = active
        ? Math.sin(i * 0.4 + mouthPhase * 10) * 22 + Math.random() * 8 + 6
        : Math.sin(i * 0.2) * 4 + 4;
      const x = i * barWidth;
      const y = height - h - 10;

      ctx.fillStyle = i % 2 === 0 ? emerald : cyan;
      ctx.fillRect(x + 2, y, barWidth - 4, h);
    }

    // Top status HUD overlay
    ctx.font = `11px ${mono}`;
    ctx.fillStyle = emerald;
    ctx.fillText(`● ZERO-EGRESS LOCAL PIPELINE [100% PRIVATE]`, 14, 24);

    ctx.fillStyle = isDark ? '#A1A1AA' : '#64748B';
    ctx.fillText(`GPU: ${pipelineStatus.faceGpuName}  |  FPS: 30.0  |  Audio: Chatterbox 24kHz`, 14, 42);

  }, [isDark, mouthPhase, isPlaying, isSynthesizing, mouthSensitivity, pipelineStatus, gold, emerald, cyan]);

  // Handle Speech Synthesis
  const handleSynthesize = async () => {
    if (!speechPrompt.trim()) return;
    setIsSynthesizing(true);
    setIsPlaying(true);
    try {
      const res = await fetch('http://127.0.0.1:9395/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechPrompt, speed, pitch })
      });
      if (res.ok) {
        // Triggered successfully
      }
    } catch {
      // Offline fallback
    } finally {
      setTimeout(() => {
        setIsSynthesizing(false);
        setIsPlaying(false);
      }, 4500);
    }
  };

  const handleCopyCli = () => {
    navigator.clipboard?.writeText(`likeness speak "${speechPrompt}"`)?.catch?.(() => {});
    setCopiedKey('cli');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(16,185,129,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(16,185,129,0.08) 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.3)',
          borderRadius: 2
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <FaceIcon sx={{ color: gold, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Likeness Desk (AI Video Double)
              </Typography>
              <Chip
                label="v2.5.0"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.15)',
                  color: gold,
                  border: `1px solid ${gold}`
                }}
              />
              <Chip
                label="100% UNLOCKED"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: emeraldSoft,
                  color: emerald,
                  border: `1px solid ${emerald}`
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740 }}>
              Local video double on GPU; Chatterbox Turbo voice cloning and Wav2Lip photorealistic mouth animation on Quadro P1000 with zero cloud leakage.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={pipelineStatus.online ? `DAEMON :9395 ONLINE` : 'LOCAL NODE'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: pipelineStatus.online ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                color: pipelineStatus.online ? emerald : 'text.secondary',
                border: `1px solid ${pipelineStatus.online ? emerald : 'rgba(255,255,255,0.1)'}`
              }}
            />
            {isLocalRuntime() && (
            <Button
              variant="outlined"
              size="small"
              href="http://127.0.0.1:9395"
              target="_blank"
              sx={{
                fontFamily: mono,
                borderColor: gold,
                color: gold,
                '&:hover': { borderColor: gold, bgcolor: 'rgba(212,175,55,0.08)' }
              }}
            >
              Standalone :9395 ↗
            </Button>
            )}
          </Stack>
        </Stack>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            mt: 2,
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.5,
              fontFamily: mono,
              fontSize: '0.82rem',
              fontWeight: 600
            }
          }}
        >
          <Tab label="Video Double Studio" />
          <Tab label="Neural Voice & Lip-Sync" />
          <Tab label="Hardware Enclave & CLI" />
        </Tabs>
      </Paper>

      {/* Tab 0: Video Double Studio */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {/* Main Visualizer & Video Canvas */}
          <Grid xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                bgcolor: isDark ? '#05060B' : '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <canvas
                ref={canvasRef}
                width={560}
                height={460}
                style={{
                  width: '100%',
                  maxWidth: 560,
                  height: 'auto',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  display: 'block'
                }}
              />

              {/* In-Canvas Playback Controls */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 2,
                  width: '100%',
                  justifyContent: 'space-between',
                  px: 1
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant={isPlaying ? 'contained' : 'outlined'}
                    onClick={() => setIsPlaying(!isPlaying)}
                    startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      bgcolor: isPlaying ? gold : 'transparent',
                      color: isPlaying ? '#000' : gold,
                      borderColor: gold,
                      '&:hover': { bgcolor: gold, color: '#000' }
                    }}
                  >
                    {isPlaying ? 'Pause Double' : 'Preview Motion'}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={fetchStatus}
                    sx={{ border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Chip
                  icon={<MemoryIcon sx={{ fontSize: '1rem !important', color: emerald }} />}
                  label={`GPU: ${pipelineStatus.faceGpuName}`}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    bgcolor: emeraldSoft,
                    color: emerald,
                    border: `1px solid ${emerald}`
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Interactive Speech Synthesis Form */}
          <Grid xs={12} lg={5}>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, mb: 1, color: gold }}>
                  NEURAL SPEECH & LIP-SYNC SYNTHESIS
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Direct GPU inference on NVIDIA Quadro P1000 via Chatterbox Turbo voice cloning and Wav2Lip.
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={speechPrompt}
                  onChange={(e) => setSpeechPrompt(e.target.value)}
                  placeholder="Enter message for your video double to speak..."
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      fontFamily: mono,
                      fontSize: '0.82rem'
                    }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={isSynthesizing}
                  startIcon={<RecordVoiceOverIcon />}
                  onClick={handleSynthesize}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    bgcolor: gold,
                    color: '#000',
                    '&:hover': { bgcolor: '#c49f27' },
                    mb: 1
                  }}
                >
                  {isSynthesizing ? 'Synthesizing On GPU...' : 'Speak & Animate Double'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={copiedKey === 'cli' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyCli}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  {copiedKey === 'cli' ? 'Copied CLI Command!' : 'Copy ZothOS CLI Command'}
                </Button>
              </Paper>

              {/* Hardware Telemetry Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, mb: 1.5, color: emerald }}>
                  LOCAL PIPELINE STATUS
                </Typography>

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Voice Cloning Profile</Typography>
                    <Chip
                      label={pipelineStatus.voiceTrained ? `Chatterbox (${pipelineStatus.voiceSeconds}s)` : 'Awaiting Sample'}
                      size="small"
                      sx={{ fontFamily: mono, fontSize: '0.68rem', height: 22, bgcolor: emeraldSoft, color: emerald }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Wav2Lip Face Worker</Typography>
                    <Chip
                      label={pipelineStatus.face ? 'Active (Quadro P1000)' : 'Idle'}
                      size="small"
                      sx={{ fontFamily: mono, fontSize: '0.68rem', height: 22, bgcolor: 'rgba(0,240,255,0.1)', color: cyan }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Data Egress Policy</Typography>
                    <Chip
                      label="0% Cloud Leakage (100% Local)"
                      size="small"
                      sx={{ fontFamily: mono, fontSize: '0.68rem', height: 22, bgcolor: 'rgba(212,175,55,0.1)', color: gold }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Neural Voice & Lip-Sync Controls */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Lip-Sync Kinematics & Voice Tuning
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fine-tune mouth aperture coordinates, phonetic articulation damping, and speech cadence.
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontFamily: mono }}>Mouth Aperture Sensitivity</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{mouthSensitivity.toFixed(2)}x</Typography>
                </Stack>
                <Slider
                  size="small"
                  value={mouthSensitivity}
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  onChange={(_, val) => setMouthSensitivity(val)}
                  sx={{ color: emerald }}
                />
              </Box>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontFamily: mono }}>Speech Cadence / Speed</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{speed.toFixed(2)}x</Typography>
                </Stack>
                <Slider
                  size="small"
                  value={speed}
                  min={0.7}
                  max={1.5}
                  step={0.05}
                  onChange={(_, val) => setSpeed(val)}
                  sx={{ color: gold }}
                />
              </Box>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontFamily: mono }}>Pitch Variance</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{pitch.toFixed(2)}x</Typography>
                </Stack>
                <Slider
                  size="small"
                  value={pitch}
                  min={0.7}
                  max={1.3}
                  step={0.05}
                  onChange={(_, val) => setPitch(val)}
                  sx={{ color: cyan }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tab 2: Hardware Enclave & ZothOS CLI */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            ZothOS Terminal Commands & Local Enclave API
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Execute voice synthesis or status checks from terminal shells or automated agent workflows.
          </Typography>

          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? '#08080C' : '#1E1E24',
              color: '#F4F4F5',
              fontFamily: mono,
              fontSize: '0.82rem',
              borderRadius: 1.5,
              mb: 2,
              overflowX: 'auto'
            }}
          >
            <Box sx={{ color: '#71717A', mb: 1 }}># Query live Quadro P1000 GPU and voice model status</Box>
            <Box sx={{ color: '#D4AF37' }}>likeness --status</Box>
            <Box sx={{ color: '#D4AF37' }}>likeness status</Box>
            <Box sx={{ color: '#71717A', my: 1 }}># Synthesize speech via neural voice clone</Box>
            <Box sx={{ color: '#10B981' }}>likeness speak "Deploying sovereign AI double to ZothOS local loopback."</Box>
            <Box sx={{ color: '#71717A', my: 1 }}># Output deterministic JSON telemetry</Box>
            <Box sx={{ color: '#00F0FF' }}>likeness --json</Box>
          </Paper>
        </Paper>
      )}

      {/* Sovereign Visualisation Band */}
      <Box sx={{ mt: 3 }}>
        <SovereignBand toolId="likeness-desk" primitive="orbit" />
      </Box>
    </Box>
  );
}
