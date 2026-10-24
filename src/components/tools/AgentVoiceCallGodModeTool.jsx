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
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const VOICE_PROFILES = [
  { id: 'archon_baritone', label: 'Archon Sovereign (Piper ONNX Low-Latency)', pitch: 0.92, rate: 1.04, accent: '#D4AF37' },
  { id: 'nyx_tactical', label: 'Nyx Tactical Ops (Whisper + Kokoro 82M)', pitch: 1.08, rate: 1.12, accent: '#38BDF8' },
  { id: 'hermes_concierge', label: 'Hermes Executive Dispatch (24kHz Neural)', pitch: 1.0, rate: 1.0, accent: '#34D399' },
];

const BRAILLE_WAVE = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AgentVoiceCallGodModeTool() {
  const [voiceId, setVoiceId] = useState('archon_baritone');
  const [utterance, setUtterance] = useState('Sovereign voice link established on loopback port 8109. Zero external cloud audio telemetry.');
  const [vadThreshold, setVadThreshold] = useState(0.42);
  const [copied, setCopied] = useState(false);
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
      ctx.fillStyle = '#05060A';
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
            ctx.fillStyle = energy > vadThreshold ? activeVoice.accent : 'rgba(148,163,184,0.35)';
            ctx.fillText(BRAILLE_WAVE[gIdx], c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
          }
        }
      }

      const vadOffset = (1 - vadThreshold) * (ch * 0.42);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, ch / 2 - vadOffset);
      ctx.lineTo(cw, ch / 2 - vadOffset);
      ctx.moveTo(0, ch / 2 + vadOffset);
      ctx.lineTo(cw, ch / 2 + vadOffset);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(245,230,171,0.7)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`VOICE_DUPLEX // ${activeVoice.label.toUpperCase()} // VAD=${vadThreshold.toFixed(2)}`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [voiceId, vadThreshold, activeVoice]);

  const speakInBrowser = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(utterance);
      u.pitch = activeVoice.pitch;
      u.rate = activeVoice.rate;
      window.speechSynthesis.speak(u);
    }
  };

  const payloadConfig = JSON.stringify(
    {
      service: 'agent-voice-call',
      bind: '127.0.0.1:8109',
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
            <PhoneInTalkIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                FULL-DUPLEX AGENT VOICE &amp; ACOUSTIC BRIDGE
              </Typography>
              <Chip
                label="WHISPER STT + PIPER ONNX"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(56,189,248,0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56,189,248,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              60fps Braille acoustic spectrogram, Silero VAD gate &amp; WebSpeech synthesis test
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={speakInBrowser}
            startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#34D399',
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
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copied ? 'Copied' : 'Copy SIP/Voice Config'}
          </Button>
        </Stack>
      </Box>

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060A' }}>
          <Box sx={{ width: '100%', height: 340 }}>
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
                  bgcolor: voiceId === v.id ? v.accent : 'rgba(255,255,255,0.02)',
                  color: voiceId === v.id ? '#050508' : '#94A3B8',
                  borderColor: voiceId === v.id ? v.accent : 'rgba(255,255,255,0.12)',
                }}
              >
                {v.label}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#080A12', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              NEURAL UTTERANCE SCRIPT
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                },
              }}
            />

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>SILERO VAD SENSITIVITY THRESHOLD</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{vadThreshold.toFixed(2)}</Typography>
              </Box>
              <Slider size="small" min={0.15} max={0.85} step={0.01} value={vadThreshold} onChange={(_, v) => setVadThreshold(v)} sx={{ color: '#D4AF37' }} />
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
              color: '#38BDF8',
              overflowX: 'auto',
              maxHeight: 155,
            }}
          >
            {payloadConfig}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
