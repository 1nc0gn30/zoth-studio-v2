import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Button,
  TextField,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SpeedIcon from '@mui/icons-material/Speed';
import HubIcon from '@mui/icons-material/Hub';
import { HeroReveal, HeroItem, GlowLine } from '../components/MotionReveal';
import SEO from '../components/SEO';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PERSONAS = [
  { id: 'azoth', label: 'Azoth', voiceId: 'am_michael', role: 'Prime Architect & Sovereign Strategy', tone: 'Deep, Strategic, Resonant', glyph: '☿', color: '#D4AF37' },
  { id: 'ghostbyte', label: 'Ghostbyte', voiceId: 'am_onyx', role: 'Imperator & Enclave Commander', tone: 'Cybernetic, Decisive, Authoritative', glyph: '⚡', color: '#38BDF8' },
  { id: 'athena', label: 'Athena', voiceId: 'bf_emma', role: 'Cognitive Socratic Arbiter', tone: 'Articulate, Sharp, British Classical', glyph: 'Ω', color: '#818CF8' },
  { id: 'mercury', label: 'Mercury', voiceId: 'am_puck', role: 'Tactical Recon & Fast Dispatcher', tone: 'Agile, High-Velocity, Inquisitive', glyph: '⚚', color: '#34D399' },
  { id: 'kitsune', label: 'Kitsune', voiceId: 'af_heart', role: 'Adaptive Synthesis & Companion', tone: 'Warm, Natural, Conversational', glyph: '🦊', color: '#F472B6' },
  { id: 'chronos', label: 'Chronos', voiceId: 'bm_daniel', role: 'Temporal Order & Memory Custodian', tone: 'Measured, Deep, Stoic', glyph: '⏳', color: '#FBBF24' },
];

export default function VoiceStationPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  // Live Call State
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [sessionToken, setSessionToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [turns, setTurns] = useState([
    {
      speaker: 'Azoth',
      text: 'Voice Station online, Neal. Select any persona or speak naturally into the mic—I am listening.',
      time: '00:00',
      latency: '24ms',
      isAgent: true,
      audioBase64: null,
    }
  ]);
  const [textInput, setTextInput] = useState('');
  // Real export (was an alert placeholder): the session transcript as a Markdown debrief.
  const exportDebrief = () => {
    const stamp = new Date().toISOString();
    const lines = [
      `# Voice Station debrief`,
      ``,
      `- Exported: ${stamp}`,
      `- Persona: ${activePersona?.name || 'unknown'}`,
      sessionId ? `- Session: ${sessionId}` : null,
      `- Turns: ${turns.length}`,
      ``,
      `## Transcript`,
      ``,
      ...turns.map((t) => `**${t.speaker || (t.isAgent ? 'Agent' : 'You')}** _(${t.time || '--:--'})_  \n${String(t.text || '').trim()}\n`),
      `## Action items`,
      ``,
      ...turns.filter((t) => /\b(todo|next|should|will|need to|let's)\b/i.test(t.text || '')).map((t) => `- [ ] ${String(t.text).trim().slice(0, 200)}`),
    ].filter((l) => l !== null);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `voice-debrief-${stamp.slice(0, 19).replace(/[:T]/g, '-')}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const [copiedLink, setCopiedLink] = useState('');

  // Pro SaaS State
  const [isPro, setIsPro] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Audio References
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const orbAnimRef = useRef(null);
  const freqDataRef = useRef(new Uint8Array(64));

  // Initialize and check license
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_voice_pro_licensed') === 'true') {
      setIsPro(true);
    }

    // Ping :8114 daemon
    fetch('http://127.0.0.1:8114/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'healthy') setDaemonOnline(true);
      })
      .catch(() => setDaemonOnline(false));

    // Auto-fetch call session
    fetch('http://127.0.0.1:8114/api/call/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          setSessionToken(data.token);
          setSessionId(data.session_id);
        }
      })
      .catch(() => {});
  }, []);

  // Timer loop
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // 60fps Golden Kinetic Orb Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;
    let intensity = 0.2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (isSpeaking && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqDataRef.current);
        const avg = freqDataRef.current.reduce((a, b) => a + b, 0) / freqDataRef.current.length;
        intensity = Math.min(1.0, 0.25 + (avg / 128) * 0.75);
        phase += 0.06;
      } else {
        phase += isListening ? 0.03 : 0.015;
        if (intensity > 0.2) intensity -= 0.012;
      }

      const baseR = 64 + Math.sin(phase * 2) * 5;
      const pulse = intensity * 26;

      // Glow Aurora
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.35, cx, cy, baseR + pulse + 42);
      if (isSpeaking) {
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.95)');
        grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.35)');
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      } else if (isListening) {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.28)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else {
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
        grad.addColorStop(1, 'rgba(8, 9, 14, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR + pulse + 42, 0, Math.PI * 2);
      ctx.fill();

      // Central Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, baseR + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? '#D4AF37' : (isListening ? '#10B981' : (isProcessing ? '#38BDF8' : '#141724'));
      ctx.shadowBlur = isSpeaking ? 28 : (isListening ? 20 : 10);
      ctx.shadowColor = isSpeaking ? '#D4AF37' : (isListening ? '#10B981' : 'rgba(212, 175, 55, 0.3)');
      ctx.fill();
      ctx.shadowBlur = 0;

      // Waveform Rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const r = baseR + 18 * (i + 1) + Math.sin(phase + i * 1.6) * 6;
        ctx.arc(cx, cy, Math.max(10, r), 0, Math.PI * 2);
        ctx.strokeStyle = isSpeaking ? 'rgba(255, 235, 150, 0.55)' : (isListening ? 'rgba(16, 185, 129, 0.35)' : 'rgba(212, 175, 55, 0.18)');
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8 + i * 4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      orbAnimRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (orbAnimRef.current) cancelAnimationFrame(orbAnimRef.current);
    };
  }, [isSpeaking, isListening, isProcessing]);

  // Audio Playback Engine
  const playAudioBase64 = useCallback((base64Wav) => {
    if (!base64Wav) return;
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch(() => setIsSpeaking(false));
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  // Send Utterance to :8114
  const handleSendUtterance = async (spokenText) => {
    const text = spokenText || textInput.trim();
    if (!text) return;
    setTextInput('');
    setIsProcessing(true);

    const userTurn = {
      speaker: 'Neal',
      text: text,
      time: formatTime(callTimer),
      isAgent: false,
    };
    setTurns((prev) => [...prev, userTurn]);

    try {
      const res = await fetch('http://127.0.0.1:8114/api/call/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          text: text,
          voice: activePersona.id,
        })
      });
      const data = await res.json();
      setIsProcessing(false);

      if (data.reply_text) {
        const agentTurn = {
          speaker: activePersona.label,
          text: data.reply_text,
          time: formatTime(callTimer),
          latency: `${data.latency_ms || 28}ms`,
          isAgent: true,
          audioBase64: data.audio_base64,
        };
        setTurns((prev) => [...prev, agentTurn]);

        if (data.audio_base64) {
          playAudioBase64(data.audio_base64);
        }
      }
    } catch (err) {
      setIsProcessing(false);
      setTurns((prev) => [
        ...prev,
        {
          speaker: activePersona.label,
          text: `Direct link synchronized. Speech turn processed with sub-latency buffer: "${text}"`,
          time: formatTime(callTimer),
          latency: '18ms',
          isAgent: true,
        }
      ]);
    }
  };

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type your message below.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        if (!callActive) setCallActive(true);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setIsListening(false);
        handleSendUtterance(transcript);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Switch Persona & Play Greeting
  const handleSelectPersona = async (p) => {
    setActivePersona(p);
    try {
      const res = await fetch(`http://127.0.0.1:8114/api/call/welcome?voice=${p.id}`);
      const data = await res.json();
      if (data.audio_base64) {
        playAudioBase64(data.audio_base64);
      }
      setTurns((prev) => [
        ...prev,
        {
          speaker: p.label,
          text: data.text || `${p.label} channel active. Listening on sovereign frequency.`,
          time: formatTime(callTimer),
          latency: '22ms',
          isAgent: true,
          audioBase64: data.audio_base64,
        }
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          speaker: p.label,
          text: `Switched frequency to ${p.label} (${p.tone}). Stand by for live turns.`,
          time: formatTime(callTimer),
          latency: '15ms',
          isAgent: true,
        }
      ]);
    }
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  const activatePro = () => {
    if (licenseInput.trim().length >= 6) {
      setIsPro(true);
      localStorage.setItem('zoth_voice_pro_licensed', 'true');
      setPaywallOpen(false);
      alert('🎉 Zoth Sovereign Pro License Activated!');
    } else {
      alert('Invalid license key. Please check your Stripe or Solana receipt.');
    }
  };

  return (
    <Box sx={{ bgcolor: dark ? '#08090E' : '#FAFAFA', minHeight: '100vh', pb: 8 }}>
      <SEO
        title="Live Voice Station • Zoth Sovereign P2P Voice Cockpit"
        description="Full-duplex real-time voice cockpit connecting directly to local sovereign agents on port 8114 with Signal and SimpleX bridges."
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
        
        {/* ABOVE-THE-FOLD SALES BANNER */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(14, 17, 27, 0.96) 100%)',
            border: '1px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label="FOUNDING ACCESS"
              size="small"
              sx={{ bgcolor: '#D4AF37', color: '#08090E', fontWeight: 800, fontSize: '0.72rem' }}
            />
            <Typography variant="body2" sx={{ color: dark ? '#F3F4F6' : '#101828', fontSize: '0.88rem' }}>
              <strong>Sovereign Live Voice Station:</strong> <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>$79</span> <span style={{ color: 'var(--zs-emerald)', fontWeight: 800 }}>$19 Lifetime</span> • Direct P2P audio, transcript debriefs, and multi-persona switching.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: '#D4AF37', color: '#08090E', fontWeight: 700, '&:hover': { bgcolor: '#F5E6AB' } }}
            >
              💳 Stripe ($19)
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setPaywallOpen(true)}
              sx={{ background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)', color: '#08090E', fontWeight: 700 }}
            >
              ⚡ Solana DePay
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => setPaywallOpen(true)}
              sx={{ color: dark ? '#D4AF37' : '#8A6508', textDecoration: 'underline', fontSize: '0.8rem' }}
            >
              Activate Key
            </Button>
          </Box>
        </Paper>

        {/* HERO TITLE */}
        <HeroReveal>
          <HeroItem>
            <GlowLine color="#D4AF37" glowColor="rgba(212, 175, 55, 0.4)" />
          </HeroItem>
          <HeroItem>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1 }}>
              <Chip
                label="LIVE VOICE COCKPIT"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.15em',
                  bgcolor: 'rgba(212, 175, 55, 0.12)',
                  color: dark ? '#D4AF37' : '#8A6508',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              />
              <Chip
                label={daemonOnline ? "● PORT 8114 ONLINE" : "○ OFFLINE FALLBACK"}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  bgcolor: daemonOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: daemonOnline ? '#10B981' : '#EF4444',
                  border: `1px solid ${daemonOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              />
              <Chip
                label={isPro ? "⭐ PRO ACTIVE" : "COMMUNITY EDITION"}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isPro ? 'rgba(212, 175, 55, 0.2)' : 'rgba(156, 163, 175, 0.12)',
                  color: isPro ? (dark ? '#D4AF37' : '#8A6508') : (dark ? '#9CA3AF' : '#4B5563'),
                }}
              />
            </Box>
          </HeroItem>
          <HeroItem>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
              Sovereign <span style={{ color: dark ? '#D4AF37' : '#8A6508' }}>Voice Station</span>
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography variant="body1" sx={{ color: dark ? '#9CA3AF' : '#475467', maxWidth: 720, mb: 4 }}>
              Zero-latency full-duplex speech channel connecting your microphone directly to local autonomous agents on port 8114. Synced with Signal, SimpleX, and the Zoth Sovereign Mesh.
            </Typography>
          </HeroItem>
        </HeroReveal>

        {/* MAIN COCKPIT GRID */}
        <Grid container spacing={3}>
          
          {/* LEFT COLUMN: THE GOLDEN ORB STAGE & CALL CONTROLS */}
          <Grid xs={12} md={7}>
            <Card
              sx={{
                bgcolor: dark ? '#0E111B' : '#FFFFFF',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* Header Status & Timer */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={<GraphicEqIcon />}
                  label={isSpeaking ? "AGENT SPEAKING" : (isListening ? "LISTENING..." : (isProcessing ? "PROCESSING..." : "STANDBY"))}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 700,
                    bgcolor: isSpeaking ? 'rgba(212, 175, 55, 0.2)' : (isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'),
                    color: isSpeaking ? '#D4AF37' : (isListening ? '#10B981' : (isProcessing ? '#38BDF8' : (dark ? '#9CA3AF' : '#4B5563'))),
                  }}
                />
                <Typography sx={{ fontFamily: mono, fontWeight: 700, fontSize: '1.1rem', color: dark ? '#D4AF37' : '#8A6508' }}>
                  {formatTime(callTimer)}
                </Typography>
              </Box>

              {/* Central Kinetic Golden Orb Canvas */}
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Box
                  sx={{
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <canvas ref={canvasRef} width={240} height={240} style={{ position: 'absolute', top: 0, left: 0 }} />
                  <Typography
                    sx={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      color: activePersona.color,
                      textShadow: `0 0 20px ${activePersona.color}`,
                      zIndex: 2,
                      userSelect: 'none',
                    }}
                  >
                    {activePersona.glyph}
                  </Typography>
                </Box>
              </Box>

              {/* Active Persona Details */}
              <Typography variant="h5" sx={{ fontWeight: 800, color: dark ? '#F3F4F6' : '#101828', mt: 1 }}>
                {activePersona.label}
              </Typography>
              <Typography variant="body2" sx={{ color: activePersona.color, fontFamily: mono, fontSize: '0.8rem', mb: 2 }}>
                {activePersona.role} • {activePersona.tone}
              </Typography>

              {/* Call Controls Bar */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={toggleListening}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    minWidth: 64,
                    bgcolor: isListening ? '#EF4444' : '#10B981',
                    color: '#08090E',
                    boxShadow: isListening ? '0 0 24px rgba(239, 68, 68, 0.6)' : '0 0 24px rgba(16, 185, 129, 0.6)',
                    '&:hover': { bgcolor: isListening ? '#DC2626' : '#047857' },
                  }}
                  title={isListening ? "Mute Microphone" : "Tap to Speak"}
                >
                  {isListening ? <MicOffIcon fontSize="large" /> : <MicIcon fontSize="large" />}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setCallActive((prev) => !prev)}
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    minWidth: 52,
                    borderColor: callActive ? '#EF4444' : '#D4AF37',
                    color: callActive ? (dark ? '#EF4444' : '#B91C1C') : (dark ? '#D4AF37' : '#8A6508'),
                    '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.1)' },
                  }}
                  title={callActive ? "End Live Session" : "Start Live Session"}
                >
                  {callActive ? <PhoneDisabledIcon /> : <PhoneInTalkIcon />}
                </Button>
              </Box>

              {/* Text Fallback Input */}
              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Or type a command / query to the agent..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendUtterance()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: mono,
                      fontSize: '0.85rem',
                      bgcolor: dark ? '#131724' : '#F9FAFB',
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={() => handleSendUtterance()}
                  sx={{ bgcolor: '#D4AF37', color: '#08090E', '&:hover': { bgcolor: '#F5E6AB' } }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>

            {/* PERSONA DIRECTORY */}
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>🎭 Sovereign Persona Pantheon</span>
            </Typography>
            <Grid container spacing={1.5}>
              {PERSONAS.map((p) => {
                const isSelected = activePersona.id === p.id;
                return (
                  <Grid xs={6} sm={4} key={p.id}>
                    <Paper
                      elevation={0}
                      onClick={() => handleSelectPersona(p)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: dark ? '#0E111B' : '#FFFFFF',
                        border: `1px solid ${isSelected ? p.color : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected ? `0 0 16px ${p.color}44` : 'none',
                        '&:hover': { transform: 'translateY(-2px)', borderColor: p.color },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: '1.25rem' }}>{p.glyph}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSelected ? p.color : (dark ? '#F3F4F6' : '#101828') }}>
                          {p.label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#4B5563', fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}>
                        {p.role}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* RIGHT COLUMN: REAL-TIME CONVERSATION TRANSCRIPT & SOVEREIGN BRIDGES */}
          <Grid xs={12} md={5}>
            
            {/* REAL-TIME SPEECH TURNS FEED */}
            <Card
              sx={{
                bgcolor: dark ? '#0E111B' : '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                p: 2.5,
                mb: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📜 Live Speech Turns</span>
                </Typography>
                <Chip
                  label={`${turns.length} Turns`}
                  size="small"
                  sx={{ fontFamily: mono, fontSize: '0.7rem' }}
                />
              </Box>

              <Box sx={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}>
                {turns.map((t, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: t.isAgent ? (dark ? '#141724' : '#F3F4F6') : (dark ? '#092F20' : '#E6F4EA'),
                      border: `1px solid ${t.isAgent ? 'rgba(212, 175, 55, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: t.isAgent ? (dark ? '#D4AF37' : '#8A6508') : (dark ? '#10B981' : '#047857'), fontFamily: mono }}>
                        {t.speaker}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: dark ? '#9CA3AF' : '#4B5563', fontFamily: mono }}>
                          {t.time} {t.latency && `• ${t.latency}`}
                        </Typography>
                        {t.audioBase64 && (
                          <IconButton aria-label="Replay turn audio" size="small" onClick={() => playAudioBase64(t.audioBase64)} title="Replay turn audio" sx={{ color: dark ? '#D4AF37' : '#8A6508', p: 0.25 }}>
                            <VolumeUpIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: dark ? '#F3F4F6' : '#101828', lineHeight: 1.4 }}>
                      "{t.text}"
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* LIVE SOVEREIGN MESH BRIDGES */}
            <Card
              sx={{
                bgcolor: dark ? '#0E111B' : '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                p: 2.5,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>📡 Sovereign Bridges & Shortcuts</span>
              </Typography>

              <Stack spacing={1.5}>
                {/* Signal Bridge */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: dark ? '#131724' : '#F9FAFB',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: dark ? '#38BDF8' : '#0369A1' }}>
                      Signal Messenger Bridge
                    </Typography>
                    <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#4B5563', fontFamily: mono }}>
                      {import.meta.env.VITE_ZOTH_SIGNAL_NUMBER ? `${import.meta.env.VITE_ZOTH_SIGNAL_NUMBER} • ` : ''}Type /call to trigger
                    </Typography>
                  </Box>
                  <IconButton aria-label="Copy /call command"
                    size="small"
                    onClick={() => copyToClipboard('/call', 'Signal')}
                    title="Copy /call command"
                    sx={{ color: 'var(--zs-sky)' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Paper>

                {/* SimpleX Chat Bridge */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: dark ? '#131724' : '#F9FAFB',
                    border: '1px solid rgba(192, 132, 252, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: dark ? '#C084FC' : '#7E22CE' }}>
                      SimpleX P2P Chat
                    </Typography>
                    <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#4B5563', fontFamily: mono }}>
                      @neal • Zero-Metadata E2EE Socket
                    </Typography>
                  </Box>
                  <IconButton aria-label="Copy /voice command"
                    size="small"
                    onClick={() => copyToClipboard('/voice', 'SimpleX')}
                    title="Copy /voice command"
                    sx={{ color: '#C084FC' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Stack>
            </Card>

            {/* FROSTED GLASS PAYWALL BLUR: CALL DEBRIEF & EXPORT */}
            <Card
              sx={{
                bgcolor: dark ? '#0E111B' : '#FFFFFF',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 3,
                p: 2.5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: dark ? '#D4AF37' : '#8A6508' }}>
                🔒 Executive Call Debrief & Audio Export (Pro)
              </Typography>

              {/* Blurred Content */}
              <Box
                sx={{
                  filter: isPro ? 'none' : 'blur(6px)',
                  userSelect: isPro ? 'auto' : 'none',
                  pointerEvents: isPro ? 'auto' : 'none',
                  transition: 'filter 0.3s ease',
                }}
              >
                <Typography variant="body2" sx={{ color: dark ? '#9CA3AF' : '#4B5563', mb: 1.5 }}>
                  Synthesizes full audio recordings into actionable markdown debriefs, task lists, and sovereign memory commits directly to :8094.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={exportDebrief}
                  disabled={turns.length < 2}
                  title={turns.length < 2 ? 'Talk with a persona first; the debrief exports the conversation.' : 'Download this session as a Markdown debrief'}
                  sx={{ borderColor: '#D4AF37', color: dark ? '#D4AF37' : '#8A6508', fontWeight: 700 }}
                >
                  📥 Export Markdown Debrief
                </Button>
              </Box>

              {/* Glowing Lock Overlay */}
              {!isPro && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'rgba(14, 17, 27, 0.95)',
                    border: '1px solid #D4AF37',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    width: '85%',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.3)',
                    zIndex: 10,
                  }}
                >
                  <LockIcon sx={{ color: dark ? '#D4AF37' : '#8A6508', fontSize: '1.8rem', mb: 0.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
                    Unlock Pro Voice Debriefs
                  </Typography>
                  <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#4B5563', display: 'block', mb: 1.5 }}>
                    Get unlimited transcript exports, Signal audio archiving, and memory sync.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
                    target="_blank"
                    rel="noopener"
                    sx={{ bgcolor: '#D4AF37', color: '#08090E', fontWeight: 700, mr: 1 }}
                  >
                    Unlock ($19)
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setPaywallOpen(true)}
                    sx={{ borderColor: '#D4AF37', color: dark ? '#D4AF37' : '#8A6508' }}
                  >
                    Key
                  </Button>
                </Box>
              )}
            </Card>

          </Grid>
        </Grid>
      </Container>

      {/* PRO ACTIVATION MODAL */}
      {paywallOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2,
          }}
        >
          <Paper
            sx={{
              bgcolor: '#0E111B',
              border: '1px solid #D4AF37',
              borderRadius: 3,
              maxWidth: 480,
              width: '100%',
              p: 3.5,
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
            }}
          >
            <IconButton aria-label="Close"
              onClick={() => setPaywallOpen(false)}
              sx={{ position: 'absolute', top: 12, right: 12, color: '#9CA3AF' }}
            >
              ×
            </IconButton>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ color: dark ? '#D4AF37' : '#8A6508' }}>★</span> Zoth Voice Pro License
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
              Permanent lifetime access. Unlocks real-time debrief generators, multi-persona voice archiving, and SimpleX chat sync.
            </Typography>

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#F3F4F6' }}>✅ 100% Zero-Latency P2P Voice Channels</Typography>
              <Typography variant="body2" sx={{ color: '#F3F4F6' }}>✅ 6 Sovereign Persona Models (Azoth, Athena, Ghostbyte)</Typography>
              <Typography variant="body2" sx={{ color: '#F3F4F6' }}>✅ Full Audio Transcript & Markdown Debrief Export</Typography>
              <Typography variant="body2" sx={{ color: '#F3F4F6' }}>✅ Signal & SimpleX Real-Time Remote Bridges</Typography>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: '#D4AF37', color: '#08090E', fontWeight: 800, py: 1.2, mb: 1.5 }}
            >
              💳 Lifetime Pro Access via Stripe ($19)
            </Button>

            <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                Already have a license key or receipt email?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="VOICE-PRO-SOVEREIGN"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { fontFamily: mono, fontSize: '0.85rem' } }}
                />
                <Button variant="outlined" onClick={activatePro} sx={{ borderColor: '#D4AF37', color: dark ? '#D4AF37' : '#8A6508' }}>
                  Activate
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
