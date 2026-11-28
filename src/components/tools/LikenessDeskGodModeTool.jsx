import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  DEFAULT_MOUTH_ROI,
  LIKENESS_MCP_TOOLS,
  validateMouthRoi,
  clampMouthRoi,
  formatPipelineTelemetry,
  buildSpeakCliCommand,
} from '../../utils/likenessDeskEngine';
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
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import FaceIcon from '@mui/icons-material/Face';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import SovereignBand from '../sovereign/SovereignBand.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:9395';

export default function LikenessDeskGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast WCAG AA tokens (>= 4.5:1 on both Obsidian Dark and Editorial Ivory Light)
  const gold = isDark ? '#E5C158' : '#7A5600';
  const goldBg = isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(122, 86, 0, 0.10)';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(4, 120, 87, 0.10)';
  const cyan = isDark ? '#38BDF8' : '#0E7490';
  const cyanBg = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(14, 116, 144, 0.10)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,23,20,0.16)';
  const surfaceSoft = isDark ? '#0B0C11' : '#F4F1EA';
  const inkPrimary = isDark ? '#F4EFE6' : '#1E293B';
  const inkMuted = isDark ? '#A8A29E' : '#475569';

  const canvasRef = useRef(null);
  const portraitImgRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const videoRef = useRef(null);
  const videoUrlRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [speechPrompt, setSpeechPrompt] = useState(
    'Local AI video double verification running on loopback 127.0.0.1:9395.'
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [copiedKey, setCopiedKey] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hasPortraitImg, setHasPortraitImg] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  const [rawStatus, setRawStatus] = useState(null);
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [mouthRoi, setMouthRoi] = useState(DEFAULT_MOUTH_ROI);
  const [savingRoi, setSavingRoi] = useState(false);

  const telemetry = formatPipelineTelemetry(rawStatus, daemonOnline);

  const loadPortrait = useCallback(async () => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/portrait?t=${Date.now()}`, {
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) {
        portraitImgRef.current = null;
        setHasPortraitImg(false);
        return;
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        if (portraitImgRef.current && portraitImgRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(portraitImgRef.current.src);
        }
        portraitImgRef.current = img;
        setHasPortraitImg(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        setHasPortraitImg(false);
      };
      img.src = objUrl;
    } catch {
      setHasPortraitImg(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/status`, {
        signal: AbortSignal.timeout(1800),
      });
      if (res.ok) {
        const data = await res.json();
        setRawStatus(data);
        setDaemonOnline(true);
        if (data.mouth) {
          setMouthRoi(clampMouthRoi(data.mouth));
        }
        if (data.face && !portraitImgRef.current) {
          loadPortrait();
        }
      } else {
        setDaemonOnline(false);
      }
    } catch {
      setDaemonOnline(false);
    }
  }, [loadPortrait]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      clearInterval(interval);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      if (portraitImgRef.current && portraitImgRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(portraitImgRef.current.src);
      }
    };
  }, [fetchStatus]);

  // Draw either real /api/portrait + calibrated mouth ROI box, or crisp geometric guide when no portrait exists
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#06070B' : '#F4F1EA';
    ctx.fillRect(0, 0, width, height);

    const img = portraitImgRef.current;
    const padTop = 52;
    const padBottom = 26;
    const availH = height - padTop - padBottom;

    if (img && img.naturalWidth > 0) {
      const scale = Math.min((width - 24) / img.naturalWidth, availH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (width - dw) / 2;
      const dy = padTop + (availH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);

      // Draw actual calibrated mouth ROI box over the real portrait
      const mx = dx + mouthRoi.x * dw;
      const my = dy + mouthRoi.y * dh;
      const mw = mouthRoi.w * dw;
      const mh = mouthRoi.h * dh;

      ctx.fillStyle = isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(4, 120, 87, 0.16)';
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = emerald;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mw, mh);

      ctx.font = `600 11px ${mono}`;
      ctx.fillStyle = isDark ? '#08080B' : '#FFFFFF';
      const label = `ROI (${mouthRoi.x.toFixed(2)}, ${mouthRoi.y.toFixed(2)}, ${mouthRoi.w.toFixed(2)}x${mouthRoi.h.toFixed(2)})`;
      const tw = ctx.measureText(label).width + 10;
      ctx.fillStyle = isDark ? 'rgba(8,8,11,0.84)' : 'rgba(26,23,20,0.88)';
      ctx.fillRect(mx, Math.max(padTop, my - 20), tw, 18);
      ctx.fillStyle = '#F4EFE6';
      ctx.fillText(label, mx + 5, Math.max(padTop + 13, my - 7));
    } else {
      // Crisp geometric portrait calibration guide (honest offline/no-portrait representation)
      const cx = width / 2;
      const cy = padTop + availH * 0.48;
      const rx = 86;
      const ry = 108;

      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = cyan;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 32, cy - 22, 10, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy - 22, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Normalized mouth ROI mapped onto the geometric frame
      const fx = cx - rx;
      const fy = cy - ry;
      const fw = rx * 2;
      const fh = ry * 2;
      const mx = fx + mouthRoi.x * fw;
      const my = fy + mouthRoi.y * fh;
      const mw = mouthRoi.w * fw;
      const mh = mouthRoi.h * fh;

      ctx.fillStyle = isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(4, 120, 87, 0.16)';
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = emerald;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mw, mh);

      ctx.font = `600 12px ${mono}`;
      ctx.fillStyle = inkMuted;
      ctx.textAlign = 'center';
      ctx.fillText(
        daemonOnline ? 'No portrait uploaded yet on :9395' : 'Start :9395 daemon to load local portrait',
        cx,
        height - 16
      );
      ctx.textAlign = 'left';
    }

    // Top HUD strip with high contrast on both themes
    ctx.fillStyle = isDark ? 'rgba(12, 13, 19, 0.92)' : 'rgba(255, 255, 255, 0.94)';
    ctx.fillRect(0, 0, width, 46);
    ctx.strokeStyle = cardBorder;
    ctx.beginPath();
    ctx.moveTo(0, 46);
    ctx.lineTo(width, 46);
    ctx.stroke();

    ctx.font = `700 11px ${mono}`;
    ctx.fillStyle = daemonOnline ? emerald : gold;
    ctx.fillText(
      `● ${telemetry.modeLabel}  |  LOCAL GPU · OPTIONAL XAI CHAT`,
      14,
      19
    );
    ctx.fillStyle = inkPrimary;
    ctx.font = `600 11px ${mono}`;
    ctx.fillText(
      `GPU: ${telemetry.gpuLabel}  |  ROI: ${mouthRoi.x.toFixed(2)}, ${mouthRoi.y.toFixed(2)}`,
      14,
      36
    );
  }, [isDark, hasPortraitImg, mouthRoi, daemonOnline, telemetry, gold, emerald, cyan, inkPrimary, inkMuted, cardBorder]);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Real :9395 synthesis + audio/MP4 playback (zero fake setTimeout animation)
  const handleSynthesize = async () => {
    const line = speechPrompt.trim();
    if (line.length < 2) {
      setFeedback({ severity: 'warning', text: 'Enter at least 2 characters to speak.' });
      return;
    }
    stopPlayback();
    setIsSynthesizing(true);
    setFeedback(null);
    try {
      const res = await fetch(`${DAEMON_BASE}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: line }),
      });
      const contentType = res.headers.get('content-type') || '';
      const modeHeader = res.headers.get('x-likeness-mode') || '';
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setFeedback({ severity: 'error', text: err.error || `Synthesis failed (HTTP ${res.status}).` });
        return;
      }
      if (contentType.includes('audio/wav')) {
        const wavBlob = await res.blob();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const wavUrl = URL.createObjectURL(wavBlob);
        audioUrlRef.current = wavUrl;

        // Also request /api/face/render if face + GPU are available
        let gotVideo = false;
        if (rawStatus?.face && rawStatus?.faceGpu) {
          try {
            const vRes = await fetch(`${DAEMON_BASE}/api/face/render`, {
              method: 'POST',
              headers: { 'Content-Type': 'audio/wav' },
              body: wavBlob,
            });
            if (vRes.ok && (vRes.headers.get('content-type') || '').includes('video/mp4')) {
              const mp4Blob = await vRes.blob();
              if (mp4Blob.size > 1000) {
                if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
                const mp4Url = URL.createObjectURL(mp4Blob);
                videoUrlRef.current = mp4Url;
                setVideoPreviewUrl(mp4Url);
                gotVideo = true;
              }
            }
          } catch {
            gotVideo = false;
          }
        }

        const audio = audioRef.current;
        if (audio) {
          audio.src = wavUrl;
          audio.playbackRate = playbackRate;
          audio.onended = () => setIsPlaying(false);
          setIsPlaying(true);
          audio.play().catch(() => setIsPlaying(false));
        }

        const modeNote = modeHeader === 'lazy_preview'
          ? 'Played local lazy-GPU preview WAV (restart daemon without LIKENESS_LAZY_GPU=1 for live voice synthesis).'
          : `Synthesized ${(wavBlob.size / 1024).toFixed(1)} KB WAV${gotVideo ? ' + rendered MP4 lip-sync clip' : ''}.`;
        setFeedback({ severity: 'success', text: modeNote });
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          severity: 'info',
          text: data.note || `Daemon responded (${data.mode || 'ok'}).`,
        });
      }
    } catch {
      setFeedback({
        severity: 'warning',
        text: 'Likeness Desk daemon (:9395) is offline. Run `LIKENESS_LAZY_GPU=1 likeness-desk serve` to connect.',
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveMouthRoi = async () => {
    const check = validateMouthRoi(mouthRoi);
    if (!check.valid) {
      setFeedback({ severity: 'error', text: check.error });
      return;
    }
    setSavingRoi(true);
    setFeedback(null);
    try {
      const res = await fetch(`${DAEMON_BASE}/api/mouth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mouth: check.roi }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ severity: 'error', text: data.error || `HTTP ${res.status}` });
        return;
      }
      setMouthRoi(clampMouthRoi(data.mouth));
      setFeedback({ severity: 'success', text: 'Saved calibrated mouth ROI to :9395 profile.json.' });
      fetchStatus();
    } catch {
      setFeedback({ severity: 'warning', text: 'Daemon (:9395) offline — mouth ROI validated locally only.' });
    } finally {
      setSavingRoi(false);
    }
  };

  const handleCopyCli = (key, cmd) => {
    navigator.clipboard?.writeText(cmd)?.catch?.(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateRoiField = (field, value) => {
    setMouthRoi((prev) => clampMouthRoi({ ...prev, [field]: value }));
  };

  const cliSpeakCmd = buildSpeakCliCommand(speechPrompt);

  return (
    <Box sx={{ width: '100%', py: 1.5 }}>
      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(16,185,129,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(122,86,0,0.08) 0%, rgba(4,120,87,0.05) 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.28)' : 'rgba(122,86,0,0.28)',
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              useFlexGap
              sx={{ mb: 0.75, flexWrap: 'wrap' }}
            >
              <FaceIcon sx={{ color: gold, fontSize: 26, flexShrink: 0 }} />
              <Typography
                component="h3"
                variant="h5"
                sx={{ fontWeight: 800, letterSpacing: -0.4, color: inkPrimary }}
              >
                Likeness Desk (AI Video Double)
              </Typography>
              <Chip
                label="v2.6.0"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: goldBg,
                  color: gold,
                  border: `1px solid ${gold}`,
                }}
              />
              <Chip
                label="100% UNLOCKED"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: emeraldBg,
                  color: emerald,
                  border: `1px solid ${emerald}`,
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ maxWidth: 740, color: inkMuted }}>
              Local GPU voice cloning (Chatterbox Turbo :9396) and Wav2Lip mouth lip-sync (:9397) over loopback :9395.
              Optional xAI chat activates only if XAI_API_KEY is configured.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Chip
              label={daemonOnline ? `DAEMON :9395 (${telemetry.modeLabel})` : 'DAEMON :9395 OFFLINE'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: daemonOnline ? emeraldBg : goldBg,
                color: daemonOnline ? emerald : gold,
                border: `1px solid ${daemonOnline ? emerald : gold}`,
              }}
            />
            {isLocalRuntime() && (
              <Button
                variant="outlined"
                size="small"
                href={DAEMON_BASE}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  borderColor: gold,
                  color: gold,
                  minHeight: 36,
                  '&:hover': { borderColor: gold, bgcolor: goldBg },
                }}
              >
                Standalone :9395 ↗
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Scrollable Navigation Tabs for 390px mobile parity */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Likeness Desk workstation views"
          sx={{
            mt: 2,
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              py: 0.75,
              fontFamily: mono,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: inkMuted,
              '&.Mui-selected': { color: gold },
            },
            '& .MuiTabs-indicator': { bgcolor: gold },
          }}
        >
          <Tab label="Video Double Studio" />
          <Tab label="Mouth ROI & Playback" />
          <Tab label="CLI, MCP & Diagnostics" />
        </Tabs>
      </Paper>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      )}

      {/* Hidden real HTMLAudioElement for live WAV playback */}
      <audio ref={audioRef} preload="none" />

      {/* Tab 0: Video Double Studio */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: cardBorder,
                bgcolor: isDark ? '#05060B' : '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                aria-label="Likeness Desk portrait and mouth ROI calibration canvas"
                style={{
                  width: '100%',
                  maxWidth: 560,
                  height: 'auto',
                  borderRadius: 8,
                  border: `1px solid ${cardBorder}`,
                  display: 'block',
                }}
              />

              {videoPreviewUrl && (
                <Box sx={{ mt: 1.5, width: '100%', maxWidth: 560 }}>
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    style={{ width: '100%', borderRadius: 8, display: 'block' }}
                  />
                </Box>
              )}

              {/* Wrapping Playback & GPU Status Row (zero overflow on 390px mobile) */}
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  mt: 2,
                  width: '100%',
                  flexWrap: 'wrap',
                }}
              >
                <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant={isPlaying ? 'contained' : 'outlined'}
                    onClick={isPlaying ? stopPlayback : handleSynthesize}
                    disabled={isSynthesizing}
                    startIcon={isPlaying ? <StopIcon /> : <RecordVoiceOverIcon />}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      minHeight: 40,
                      bgcolor: isPlaying ? gold : 'transparent',
                      color: isPlaying ? (isDark ? '#08080B' : '#FFFFFF') : gold,
                      borderColor: gold,
                      '&:hover': { bgcolor: gold, color: isDark ? '#08080B' : '#FFFFFF' },
                    }}
                  >
                    {isPlaying ? 'Stop Audio' : 'Speak via :9395'}
                  </Button>
                  <IconButton
                    size="small"
                    aria-label="Refresh daemon status and portrait"
                    onClick={() => { fetchStatus(); loadPortrait(); }}
                    sx={{
                      minWidth: 40,
                      minHeight: 40,
                      border: '1px solid',
                      borderColor: cardBorder,
                      color: inkPrimary,
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Chip
                  icon={<MemoryIcon sx={{ fontSize: '1rem !important', color: `${emerald} !important` }} />}
                  label={`GPU: ${telemetry.gpuLabel}`}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    maxWidth: '100%',
                    bgcolor: emeraldBg,
                    color: emerald,
                    border: `1px solid ${emerald}`,
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} lg={5}>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: cardBorder,
                  bgcolor: isDark ? '#0B0C11' : '#FFFFFF',
                }}
              >
                <Typography
                  component="h4"
                  variant="subtitle2"
                  sx={{ fontFamily: mono, fontWeight: 800, mb: 0.75, color: gold }}
                >
                  LOCAL SPEECH &amp; LIP-SYNC DISPATCH
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 2, color: inkMuted }}>
                  Calls POST http://127.0.0.1:9395/api/speak and plays returned audio/wav (plus /api/face/render MP4 when active).
                </Typography>

                <TextField
                  id="likeness-speech-prompt"
                  label="Spoken line for video double"
                  fullWidth
                  multiline
                  rows={4}
                  value={speechPrompt}
                  onChange={(e) => setSpeechPrompt(e.target.value)}
                  placeholder="Enter a line for your local video double..."
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      fontFamily: mono,
                      fontSize: '0.82rem',
                    },
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
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    minHeight: 44,
                    bgcolor: gold,
                    color: isDark ? '#08080B' : '#FFFFFF',
                    '&:hover': { bgcolor: isDark ? '#D4AF37' : '#5E4200' },
                    mb: 1,
                  }}
                >
                  {isSynthesizing ? 'Contacting :9395...' : 'Speak & Play Output'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={copiedKey === 'cli' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => handleCopyCli('cli', cliSpeakCmd)}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minHeight: 40,
                    borderColor: cardBorder,
                    color: inkPrimary,
                  }}
                >
                  {copiedKey === 'cli' ? 'Copied CLI Command' : 'Copy ZothOS CLI Command'}
                </Button>
              </Paper>

              {/* Hardware Telemetry Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: cardBorder,
                  bgcolor: isDark ? '#0B0C11' : '#FFFFFF',
                }}
              >
                <Typography
                  component="h4"
                  variant="subtitle2"
                  sx={{ fontFamily: mono, fontWeight: 800, mb: 1.5, color: emerald }}
                >
                  LOCAL PIPELINE STATUS
                </Typography>

                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: inkPrimary }}>
                      Voice Profile
                    </Typography>
                    <Chip
                      label={telemetry.voiceLabel}
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.7rem', bgcolor: emeraldBg, color: emerald }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: inkPrimary }}>
                      Wav2Lip Face Stage
                    </Typography>
                    <Chip
                      label={telemetry.faceLabel}
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.7rem', bgcolor: cyanBg, color: cyan }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: inkPrimary }}>
                      Network Policy
                    </Typography>
                    <Chip
                      label={telemetry.egressLabel}
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.7rem', bgcolor: goldBg, color: gold }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Real Mouth ROI Calibration & Client Playback Speed */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: cardBorder,
            bgcolor: isDark ? '#0B0C11' : '#FFFFFF',
          }}
        >
          <Typography component="h4" variant="h6" sx={{ fontWeight: 800, mb: 0.75, color: inkPrimary }}>
            Mouth ROI Calibration &amp; Client Playback Speed
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.5, color: inkMuted }}>
            Adjust normalized mouth bounding box coordinates (enforcing x+w &le; 1 and y+h &le; 1) and persist directly to
            POST http://127.0.0.1:9395/api/mouth. Client playback speed applies locally to HTMLAudioElement.playbackRate.
          </Typography>

          <Grid container spacing={2.5}>
            {[
              { key: 'x', label: 'Mouth ROI X Offset', min: 0, max: 0.96, color: gold },
              { key: 'y', label: 'Mouth ROI Y Offset', min: 0, max: 0.97, color: gold },
              { key: 'w', label: 'Mouth ROI Width', min: 0.04, max: 1 - mouthRoi.x, color: emerald },
              { key: 'h', label: 'Mouth ROI Height', min: 0.03, max: 1 - mouthRoi.y, color: emerald },
            ].map((item) => (
              <Grid xs={12} sm={6} key={item.key}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: inkPrimary }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: item.color }}>
                      {mouthRoi[item.key].toFixed(2)}
                    </Typography>
                  </Stack>
                  <Slider
                    aria-label={item.label}
                    size="small"
                    value={mouthRoi[item.key]}
                    min={item.min}
                    max={Math.max(item.min + 0.01, Number(item.max.toFixed(2)))}
                    step={0.01}
                    onChange={(_, val) => updateRoiField(item.key, Number(val))}
                    sx={{ color: item.color }}
                  />
                </Box>
              </Grid>
            ))}

            <Grid xs={12} sm={6}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: inkPrimary }}>
                    Client Audio Playback Speed
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: cyan }}>
                    {playbackRate.toFixed(2)}x
                  </Typography>
                </Stack>
                <Slider
                  aria-label="Client audio playback speed"
                  size="small"
                  value={playbackRate}
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  onChange={(_, val) => {
                    const next = Number(val);
                    setPlaybackRate(next);
                    if (audioRef.current) audioRef.current.playbackRate = next;
                  }}
                  sx={{ color: cyan }}
                />
              </Box>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1.5} useFlexGap sx={{ mt: 2.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={savingRoi}
              onClick={handleSaveMouthRoi}
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                minHeight: 42,
                bgcolor: gold,
                color: isDark ? '#08080B' : '#FFFFFF',
                '&:hover': { bgcolor: isDark ? '#D4AF37' : '#5E4200' },
              }}
            >
              {savingRoi ? 'Saving ROI...' : 'Save Mouth ROI to :9395'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setMouthRoi(DEFAULT_MOUTH_ROI)}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                minHeight: 42,
                borderColor: cardBorder,
                color: inkPrimary,
              }}
            >
              Reset Default Box
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Tab 2: CLI, MCP & Diagnostics (Theme-aware Ivory/Obsidian code card) */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: cardBorder,
            bgcolor: isDark ? '#0B0C11' : '#FFFFFF',
          }}
        >
          <Typography component="h4" variant="h6" sx={{ fontWeight: 800, mb: 0.75, color: inkPrimary }}>
            ZothOS CLI, Stdio MCP Server &amp; Loopback Endpoints
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: inkMuted }}>
            Operate Likeness Desk from terminal shells or MCP clients (`{LIKENESS_MCP_TOOLS.join(', ')}`).
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: surfaceSoft,
              color: inkPrimary,
              border: '1px solid',
              borderColor: isDark ? 'rgba(212,175,55,0.22)' : '#D6CFC2',
              fontFamily: mono,
              fontSize: '0.82rem',
              borderRadius: 1.5,
              mb: 2,
              overflowX: 'auto',
              lineHeight: 1.7,
            }}
          >
            <Box sx={{ color: inkMuted }}># Start loopback coordinator safely without loading CUDA weights</Box>
            <Box sx={{ color: gold, fontWeight: 700 }}>LIKENESS_LAZY_GPU=1 likeness-desk serve --port 9395</Box>
            <Box sx={{ color: inkMuted, mt: 1 }}># Inspect live daemon status &amp; redacted JSON telemetry</Box>
            <Box sx={{ color: emerald, fontWeight: 700 }}>likeness-desk status &amp;&amp; likeness-desk --json</Box>
            <Box sx={{ color: inkMuted, mt: 1 }}># Launch zero-dependency JSON-RPC 2.0 stdio MCP server (4 tools)</Box>
            <Box sx={{ color: cyan, fontWeight: 700 }}>likeness-desk mcp</Box>
            <Box sx={{ color: inkMuted, mt: 1 }}># Launch real-status Unicode Braille TUI</Box>
            <Box sx={{ color: gold, fontWeight: 700 }}>likeness-desk-tui --status</Box>
          </Paper>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {LIKENESS_MCP_TOOLS.map((toolName) => (
              <Chip
                key={toolName}
                label={`MCP: ${toolName}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: cyanBg,
                  color: cyan,
                  border: `1px solid ${cyan}`,
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Sovereign Visualisation Band (canonical props) */}
      <Box sx={{ mt: 3 }}>
        <SovereignBand
          seed="likeness-desk"
          variant="particle-orbit"
          eyebrow="Voice & Real-Time · :9395"
          caption="Likeness Desk (AI Video Double)"
          label="Likeness Desk local AI video double telemetry visualisation"
        />
      </Box>
    </Box>
  );
}
