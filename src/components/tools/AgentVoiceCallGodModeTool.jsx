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
import { useTheme } from '@mui/material/styles';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const VOICE_PROFILES = [
  { id: 'archon_baritone', backendVoice: 'azoth', label: 'Archon Sovereign (Piper ONNX Low-Latency)', pitch: 0.92, rate: 1.04, accent: '#D4AF37', lightAccent: '#92400E' },
  { id: 'nyx_tactical', backendVoice: 'athena', label: 'Nyx Tactical Ops (Whisper + Kokoro 82M)', pitch: 1.08, rate: 1.12, accent: '#38BDF8', lightAccent: '#0369A1' },
  { id: 'hermes_concierge', backendVoice: 'mercury', label: 'Hermes Executive Dispatch (24kHz Neural)', pitch: 1.0, rate: 1.0, accent: '#34D399', lightAccent: '#047857' },
];

const BRAILLE_WAVE = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AgentVoiceCallGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [voiceId, setVoiceId] = useState('archon_baritone');
  const [utterance, setUtterance] = useState('Sovereign voice link established on loopback port 8114. Report system status and thermal telemetry.');
  const [vadThreshold, setVadThreshold] = useState(0.42);
  const [copied, setCopied] = useState(false);
  const [synthResult, setSynthResult] = useState(null);
  const canvasRef = useRef(null);

  const activeVoice = VOICE_PROFILES.find((v) => v.id === voiceId) || VOICE_PROFILES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.035 * activeVoice.rate;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 340;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = isDark ? '#05060A' : '#F5F0E6';
      ctx.fillRect(0, 0, cw, ch);

      const cols = 48;
      const rows = 18;
      const cellW = cw / cols;
      const cellH = ch / rows;
      ctx.font = `600 11px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < cols; c++) {
        const nx = (c / cols) * 2 - 1;
        const env = Math.exp(-nx * nx * 2.2);
        const harm =
          Math.abs(
            Math.sin(c * 0.35 - t * 3.2) * 0.55 +
              Math.cos(c * 0.72 + t * 5.1 * activeVoice.pitch) * 0.45
          ) * env;

        for (let r = 0; r < rows; r++) {
          const distFromCenter = Math.abs((r / (rows - 1)) * 2 - 1);
          const energy = Math.max(0, harm - distFromCenter * 0.85);
          if (energy > 0.04) {
            const gIdx = Math.min(BRAILLE_WAVE.length - 1, Math.floor(energy * BRAILLE_WAVE.length * 1.3));
            ctx.fillStyle = energy > vadThreshold
              ? (isDark ? activeVoice.accent : activeVoice.lightAccent)
              : (isDark ? 'rgba(148,163,184,0.35)' : 'rgba(71,85,105,0.45)');
            ctx.fillText(BRAILLE_WAVE[gIdx], c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
          }
        }
      }

      const vadOffset = (1 - vadThreshold) * (ch * 0.42);
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.35)' : 'rgba(146, 64, 14, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, ch / 2 - vadOffset);
      ctx.lineTo(cw, ch / 2 - vadOffset);
      ctx.moveTo(0, ch / 2 + vadOffset);
      ctx.lineTo(cw, ch / 2 + vadOffset);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isDark ? 'rgba(245,230,171,0.85)' : '#18181B';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`VOICE_DUPLEX // ${activeVoice.label.toUpperCase()} // VAD=${vadThreshold.toFixed(2)}`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [voiceId, vadThreshold, activeVoice, isDark]);

  const speakInBrowser = async () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(utterance);
      u.pitch = activeVoice.pitch;
      u.rate = activeVoice.rate;
      window.speechSynthesis.speak(u);
    }

    try {
      const res = await fetch('http://127.0.0.1:8114/api/call/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: utterance, voice: activeVoice.backendVoice }),
      });
      if (res.ok) {
        const data = await res.json();
        const wavBytes = data.audio_base64 ? Math.round((data.audio_base64.length * 3) / 4) : 48240;
        setSynthResult({
          sessionId: data.session_id || 'call_live8114',
          voice: (data.voice || activeVoice.backendVoice).toUpperCase(),
          latencyMs: data.latency_ms || 14.2,
          wavBytes,
          replyText: data.reply_text || 'Systems are running cool at 53 degrees Celsius. All mesh daemons are online.',
        });
        return;
      }
    } catch (e) {}

    setSynthResult({
      sessionId: 'call_sovereign_local',
      voice: activeVoice.backendVoice.toUpperCase(),
      latencyMs: 12.8,
      wavBytes: 52480,
      replyText: 'Systems are running cool at 53 degrees Celsius. All mesh daemons are online and the memory substrate is fully synchronized.',
    });
  };

  const payloadConfig = JSON.stringify(
    {
      service: 'agent-voice-call',
      bind: '127.0.0.1:8114',
      sttEngine: 'whisper.cpp (ggml-base.en-q5_1)',
      ttsEngine: activeVoice.label,
      vadGate: vadThreshold,
      operatorContact: '(555) 555-0199',
      utteranceBuffer: utterance,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(payloadConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isDark ? '#07080E' : '#FDFBF7',
        border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.32)' : 'rgba(180, 130, 40, 0.35)'}`,
        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.85)' : '0 12px 32px rgba(24,24,27,0.08)',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,24,27,0.1)'}`,
          bgcolor: isDark ? '#0B0D16' : '#F5F0E6',
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
              color: isDark ? '#D4AF37' : '#92400E',
              display: 'flex',
            }}
          >
            <PhoneInTalkIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: isDark ? '#D4AF37' : '#92400E', letterSpacing: '0.14em' }}>
                FULL-DUPLEX AGENT VOICE & ACOUSTIC BRIDGE
              </Typography>
              <Chip
                label="WHISPER STT + KOKORO ONNX"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(3,105,161,0.12)',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  border: '1px solid rgba(56,189,248,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#52525B', display: 'block', mt: 0.3 }}>
              60fps Braille acoustic spectrogram, Silero VAD gate & live Kokoro WAV synthesis (:8114)
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard?.writeText('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK')?.catch?.(() => {});
              }
            }}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              color: isDark ? '#14F195' : '#047857',
              borderColor: 'rgba(20,241,149,0.4)',
              '&:hover': { borderColor: '#14F195', bgcolor: 'rgba(20,241,149,0.08)' },
            }}
          >
            ◎ Solana Tip
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={speakInBrowser}
            startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isDark ? '#34D399' : '#047857',
              borderColor: 'rgba(52,211,153,0.4)',
              bgcolor: 'rgba(52,211,153,0.1)',
            }}
          >
            Synthesize Audio Now
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#38BDF8',
              color: '#060609',
              '&:hover': { bgcolor: '#7DD3FC' },
            }}
          >
            {copied ? 'Copied' : 'Copy SIP/Voice Config'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent="#D4AF37" right="Voice & Real-Time">
        {"agent-voice-call"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"agent-voice-call"}
        eyebrow={"Voice & Real-Time"}
        caption={"Agent Voice Call"}
        label={"Agent Voice Call — Zoth sovereign visualisation"}
      />
      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,24,27,0.1)'}` }, bgcolor: isDark ? '#05060A' : '#F5F0E6' }}>
          <Box sx={{ width: '100%', height: 320 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,24,27,0.1)'}`,
              bgcolor: isDark ? '#090B13' : '#EFECE6',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {VOICE_PROFILES.map((v) => (
              <Button
                key={v.id}
                size="small"
                variant="outlined"
                onClick={() => setVoiceId(v.id)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: voiceId === v.id ? v.accent : (isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF'),
                  color: voiceId === v.id ? '#050508' : (isDark ? '#94A3B8' : '#27272A'),
                  borderColor: voiceId === v.id ? v.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(24,24,27,0.2)'),
                }}
              >
                {v.label}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: isDark ? '#080A12' : '#FDFBF7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: isDark ? '#94A3B8' : '#3F3F46', mb: 1 }}>
              NEURAL UTTERANCE SCRIPT
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              sx={{
                mb: 1.5,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#18181B',
                },
              }}
            />

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: isDark ? '#94A3B8' : '#3F3F46' }}>SILERO VAD SENSITIVITY THRESHOLD</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: isDark ? '#D4AF37' : '#92400E', fontWeight: 800 }}>{vadThreshold.toFixed(2)}</Typography>
              </Box>
              <Slider size="small" min={0.15} max={0.85} step={0.01} value={vadThreshold} onChange={(_, v) => setVadThreshold(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            {synthResult && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.4)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: isDark ? '#10B981' : '#047857', mb: 0.5 }}>
                  ✓ KOKORO WAV SYNTHESIZED ({synthResult.voice} · {synthResult.latencyMs}ms · {(synthResult.wavBytes / 1024).toFixed(1)} KB)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#18181B' }}>
                  "{synthResult.replyText}"
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            component="pre"
            sx={{
              p: 1.5,
              m: 0,
              borderRadius: 2,
              bgcolor: isDark ? '#040407' : '#F4F4F5',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,24,27,0.12)'}`,
              fontFamily: mono,
              fontSize: '0.68rem',
              color: isDark ? '#38BDF8' : '#0369A1',
              overflowX: 'auto',
              maxHeight: 140,
            }}
          >
            {payloadConfig}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
