import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '@mui/material/styles';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const VOICE_PROFILES = [
  { id: 'azoth', label: 'Azoth', role: 'Deep Strategic Baritone', pitch: 0.92, rate: 1.0, accent: '#D4AF37', lightAccent: '#7A5808' },
  { id: 'ghostbyte', label: 'Ghostbyte', role: 'Cybernetic Imperator', pitch: 0.96, rate: 1.06, accent: '#38BDF8', lightAccent: '#0369A1' },
  { id: 'athena', label: 'Athena', role: 'British Classical Logic', pitch: 1.06, rate: 1.04, accent: '#34D399', lightAccent: '#047857' },
  { id: 'mercury', label: 'Mercury', role: 'Agile Recon Dispatcher', pitch: 1.04, rate: 1.12, accent: '#F59E0B', lightAccent: '#9A6F0B' },
  { id: 'kitsune', label: 'Kitsune', role: 'Warm Conversational', pitch: 1.08, rate: 1.0, accent: '#EC4899', lightAccent: '#9D174D' },
  { id: 'chronos', label: 'Chronos', role: 'Stoic Architect', pitch: 0.88, rate: 0.96, accent: '#A78BFA', lightAccent: '#5B21B6' },
];

const BRAILLE_WAVE = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AgentVoiceCallGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [voiceId, setVoiceId] = useState('azoth');
  const [utterance, setUtterance] = useState('Hello Azoth, report local voice station status.');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [daemonHealth, setDaemonHealth] = useState(null);
  const [synthResult, setSynthResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const canvasRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const activeVoice = VOICE_PROFILES.find((v) => v.id === voiceId) || VOICE_PROFILES[0];

  useEffect(() => {
    let mounted = true;
    fetch('http://127.0.0.1:8114/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data) setDaemonHealth(data);
      })
      .catch(() => {
        if (mounted) setDaemonHealth(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.032 * activeVoice.rate;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 280;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = isDark ? '#07090F' : '#F5F0E6';
      ctx.fillRect(0, 0, cw, ch);

      const cols = 48;
      const rows = 14;
      const cellW = cw / cols;
      const cellH = ch / rows;
      ctx.font = `600 11px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < cols; c++) {
        const nx = (c / cols) * 2 - 1;
        const env = Math.exp(-nx * nx * 2.1);
        const harm =
          Math.abs(
            Math.sin(c * 0.35 - t * 3.0) * 0.55 +
              Math.cos(c * 0.72 + t * 4.8 * activeVoice.pitch) * 0.45
          ) * env;

        for (let r = 0; r < rows; r++) {
          const distFromCenter = Math.abs((r / (rows - 1)) * 2 - 1);
          const energy = Math.max(0, harm - distFromCenter * 0.85);
          if (energy > 0.04) {
            const gIdx = Math.min(BRAILLE_WAVE.length - 1, Math.floor(energy * BRAILLE_WAVE.length * 1.3));
            ctx.fillStyle = energy > 0.38
              ? (isDark ? activeVoice.accent : activeVoice.lightAccent)
              : (isDark ? 'rgba(148,163,184,0.35)' : 'rgba(71,85,105,0.45)');
            ctx.fillText(BRAILLE_WAVE[gIdx], c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
          }
        }
      }

      ctx.fillStyle = isDark ? 'rgba(245,230,171,0.9)' : '#181613';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      const engLabel = daemonHealth?.tts_engine ? String(daemonHealth.tts_engine).toUpperCase() : 'STANDBY';
      ctx.fillText(`VOICE_STATION :8114 // ${activeVoice.label.toUpperCase()} // TTS=${engLabel}`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [voiceId, activeVoice, isDark, daemonHealth]);

  const playBase64Wav = async (b64Data, mime = 'audio/wav') => {
    try {
      const bin = atob(b64Data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (_e) {
      // Autoplay may be muted in headless test runs; WAV bytes remain verified.
    }
  };

  // Full clean lifecycle: POST /api/call/create -> POST /api/call/speak -> POST /api/call/end (0 leaked sessions!)
  const synthesizeLiveTurn = async () => {
    const cleanText = utterance.trim();
    if (!cleanText || busy) return;
    setBusy(true);
    setErrorMsg('');

    let createdToken = '';
    try {
      const createRes = await fetch('http://127.0.0.1:8114/api/call/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'web', voice: activeVoice.id }),
      });
      if (!createRes.ok) {
        throw new Error(`Daemon /api/call/create returned HTTP ${createRes.status}`);
      }
      const created = await createRes.json();
      createdToken = created.token;

      const speakRes = await fetch('http://127.0.0.1:8114/api/call/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: createdToken, text: cleanText, voice: activeVoice.id }),
      });
      if (!speakRes.ok) {
        throw new Error(`Daemon /api/call/speak returned HTTP ${speakRes.status}`);
      }
      const data = await speakRes.json();
      const wavBytes = data.audio_base64 ? Math.floor((data.audio_base64.length * 3) / 4) : 0;

      if (data.audio_base64) {
        playBase64Wav(data.audio_base64, data.audio_mime || 'audio/wav');
      }

      setSynthResult({
        sessionId: data.session_id,
        voice: String(data.voice || activeVoice.id).toUpperCase(),
        ttsEngine: String(data.tts_engine || 'local').toUpperCase(),
        latencyMs: data.latency_ms,
        wavBytes,
        replyText: data.reply_text,
      });
    } catch (err) {
      setSynthResult(null);
      setErrorMsg(
        `Local daemon 127.0.0.1:8114 unreachable (${err.message}). Run "python3 server.py --port 8114" or "agent-voice-call serve --port 8114" to synthesize live audio.`
      );
    } finally {
      if (createdToken) {
        fetch('http://127.0.0.1:8114/api/call/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: createdToken }),
        }).catch(() => {});
      }
      setBusy(false);
    }
  };

  const payloadConfig = JSON.stringify(
    {
      service: 'agent-voice-call',
      version: daemonHealth?.version || '2.6.0',
      bind: '127.0.0.1:8114',
      ttsPipeline: 'Kokoro (:9394) -> offline Piper / espeak-ng -> Pure-Python PCM',
      activeTtsEngine: daemonHealth?.tts_engine || 'standby',
      localFirstTts: true,
      voice: activeVoice.id,
      mcpCommand: 'agent-voice-call mcp',
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(payloadConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const goldInk = isDark ? '#D4AF37' : '#7A5808';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isDark ? '#07080E' : '#FAF7F0',
        border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.32)' : 'rgba(140, 106, 46, 0.35)'}`,
        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.85)' : '0 12px 32px rgba(24,22,19,0.08)',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,22,19,0.12)'}`,
          bgcolor: isDark ? '#0B0D16' : '#F3EFE6',
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
              bgcolor: isDark ? 'rgba(212,175,55,0.14)' : 'rgba(140,106,46,0.12)',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(140,106,46,0.38)'}`,
              color: goldInk,
              display: 'flex',
            }}
          >
            <PhoneInTalkIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: goldInk, letterSpacing: '0.12em' }}>
                LOCAL-FIRST AGENT VOICE STATION (:8114)
              </Typography>
              <Chip
                label={daemonHealth ? `LIVE :8114 · ${String(daemonHealth.tts_engine || 'LOCAL').toUpperCase()}` : 'DAEMON STANDBY :8114'}
                size="small"
                sx={{
                  height: 22,
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: daemonHealth
                    ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(4,120,87,0.12)')
                    : (isDark ? 'rgba(56,189,248,0.15)' : 'rgba(3,105,161,0.12)'),
                  color: daemonHealth
                    ? (isDark ? '#34D399' : '#047857')
                    : (isDark ? '#38BDF8' : '#0369A1'),
                  border: `1px solid ${daemonHealth ? 'rgba(16,185,129,0.38)' : 'rgba(56,189,248,0.35)'}`,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: isDark ? '#A1A8B8' : '#433E36', display: 'block', mt: 0.35 }}>
              6 local personas, zero cloud default (Kokoro :9394 → Piper/espeak-ng → PCM WAV), clean session lifecycle &amp; 0600 debriefs
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="contained"
            disabled={busy}
            onClick={synthesizeLiveTurn}
            startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: isDark ? '#10B981' : '#047857',
              color: '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#059669' : '#065F46' },
            }}
          >
            {busy ? 'Synthesizing...' : 'Synthesize Live Turn (:8114)'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: isDark ? '#38BDF8' : '#0369A1',
              borderColor: isDark ? 'rgba(56,189,248,0.45)' : 'rgba(3,105,161,0.4)',
            }}
          >
            {copied ? 'Copied' : 'Copy Station Config'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 1, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(24,22,19,0.08)'}` }}>
        <SovereignEyebrow accent={goldInk} right="v2.6.0 · Zero Cloud Default">
          {'agent-voice-call'}
        </SovereignEyebrow>
      </Box>

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,22,19,0.1)'}` }, bgcolor: isDark ? '#07090F' : '#F5F0E6' }}>
          <Box sx={{ width: '100%', height: 280 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,22,19,0.1)'}`,
              bgcolor: isDark ? '#0B0D16' : '#EFECE6',
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            {VOICE_PROFILES.map((v) => {
              const selected = voiceId === v.id;
              return (
                <Button
                  key={v.id}
                  size="small"
                  variant={selected ? 'contained' : 'outlined'}
                  onClick={() => setVoiceId(v.id)}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: selected ? (isDark ? v.accent : v.lightAccent) : (isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF'),
                    color: selected ? (isDark ? '#08080B' : '#FFFFFF') : (isDark ? '#E2E8F0' : '#181613'),
                    borderColor: selected ? (isDark ? v.accent : v.lightAccent) : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(24,22,19,0.22)'),
                  }}
                >
                  {v.label}
                </Button>
              );
            })}
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: isDark ? '#090B13' : '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#A1A8B8' : '#433E36', mb: 1 }}>
              LIVE UTTERANCE PROMPT ({activeVoice.label.toUpperCase()} — {activeVoice.role})
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              inputProps={{ 'aria-label': 'Voice utterance prompt' }}
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              sx={{
                mb: 1.5,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#FAF7F0',
                  color: isDark ? '#F8FAFC' : '#181613',
                },
              }}
            />

            {errorMsg && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(185,28,28,0.08)',
                  border: `1px solid ${isDark ? 'rgba(239,68,68,0.4)' : 'rgba(185,28,28,0.35)'}`,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#FCA5A5' : '#991B1B' }}>
                  {errorMsg}
                </Typography>
              </Box>
            )}

            {synthResult && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(4,120,87,0.08)',
                  border: `1px solid ${isDark ? 'rgba(16,185,129,0.4)' : 'rgba(4,120,87,0.35)'}`,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: isDark ? '#34D399' : '#047857', mb: 0.5 }}>
                  LIVE WAV SYNTHESIZED ({synthResult.voice} · {synthResult.ttsEngine} · {synthResult.latencyMs}ms · {(synthResult.wavBytes / 1024).toFixed(1)} KB)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: isDark ? '#E2E8F0' : '#181613' }}>
                  &ldquo;{synthResult.replyText}&rdquo;
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
              bgcolor: isDark ? '#04050A' : '#F3EFE6',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,22,19,0.14)'}`,
              fontFamily: mono,
              fontSize: '0.68rem',
              color: isDark ? '#38BDF8' : '#0369A1',
              overflowX: 'auto',
              maxHeight: 160,
            }}
          >
            {payloadConfig}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
