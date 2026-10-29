import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyIcon from '@mui/icons-material/VpnKey';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const MAGIC_HEADER = 'ZOTHSTEG'; // 8-byte identification header

// ---------------------------------------------------------------------------
// Helper: Binary string / Uint8Array utilities
// ---------------------------------------------------------------------------
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function readString(view, offset, length) {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}

// ---------------------------------------------------------------------------
// Synthesize a pristine 16-bit 44.1kHz mono WAV audio carrier in memory
// ---------------------------------------------------------------------------
function createHarmonicWavCarrier(durationSec = 4, baseFreq = 320) {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Synthesize smooth harmonic ambient tone (Fundamental + Third + Fifth)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope attack & release
    let env = 1.0;
    if (t < 0.2) env = t / 0.2;
    else if (t > durationSec - 0.3) env = (durationSec - t) / 0.3;

    const sample =
      (Math.sin(2 * Math.PI * baseFreq * t) * 0.45 +
        Math.sin(2 * Math.PI * (baseFreq * 1.25) * t) * 0.25 +
        Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.15) *
      env;

    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, int16, true);
  }

  return buffer;
}

// ---------------------------------------------------------------------------
// Real LSB Steganography Engine: Embed bitstream into 16-bit PCM
// ---------------------------------------------------------------------------
function embedSecretIntoWav(wavBuffer, secretString) {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(secretString);
  const payloadLen = secretBytes.length;

  // Header payload: MAGIC_HEADER (8B) + length (4B uint32) + secret bytes
  const headerBytes = enc.encode(MAGIC_HEADER);
  const totalPayloadSize = 8 + 4 + payloadLen;
  const payloadBuffer = new Uint8Array(totalPayloadSize);

  payloadBuffer.set(headerBytes, 0);
  const lenView = new DataView(payloadBuffer.buffer);
  lenView.setUint32(8, payloadLen, false); // Big endian length
  payloadBuffer.set(secretBytes, 12);

  // Total bits needed
  const totalBits = totalPayloadSize * 8;

  // Clone WAV buffer to preserve original
  const newWavBuffer = wavBuffer.slice(0);
  const view = new DataView(newWavBuffer);

  const numSamples = (newWavBuffer.byteLength - 44) / 2;
  if (totalBits > numSamples) {
    throw new Error(
      `Payload exceeds carrier capacity! Required: ${totalBits} samples, Available: ${numSamples} samples (${(numSamples / 8).toFixed(0)} bytes max).`
    );
  }

  // Embed bit by bit into LSB of each 16-bit sample
  let bitIndex = 0;
  for (let byteIdx = 0; byteIdx < totalPayloadSize; byteIdx++) {
    const currentByte = payloadBuffer[byteIdx];
    for (let b = 7; b >= 0; b--) {
      const bit = (currentByte >> b) & 1;
      const sampleOffset = 44 + bitIndex * 2;
      let sample = view.getInt16(sampleOffset, true);

      // Mask out LSB and set to target bit
      sample = (sample & ~1) | bit;
      view.setInt16(sampleOffset, sample, true);
      bitIndex++;
    }
  }

  return { stegoWavBuffer: newWavBuffer, bitsEmbedded: totalBits, bytesEmbedded: totalPayloadSize };
}

// ---------------------------------------------------------------------------
// Real LSB Steganography Engine: Extract bitstream from 16-bit PCM
// ---------------------------------------------------------------------------
function extractSecretFromWav(wavBuffer) {
  const view = new DataView(wavBuffer);
  const numSamples = (wavBuffer.byteLength - 44) / 2;

  // We need at least 12 bytes (96 bits) for MAGIC (8) + length (4)
  if (numSamples < 96) {
    throw new Error('Audio carrier is too short to contain a valid AudioCipher payload.');
  }

  // Helper to extract N bytes starting from sample index
  const extractBytes = (startBit, numBytes) => {
    const bytes = new Uint8Array(numBytes);
    let sampleBit = startBit;
    for (let i = 0; i < numBytes; i++) {
      let byteVal = 0;
      for (let b = 7; b >= 0; b--) {
        const sampleOffset = 44 + sampleBit * 2;
        const sample = view.getInt16(sampleOffset, true);
        const bit = sample & 1;
        byteVal |= bit << b;
        sampleBit++;
      }
      bytes[i] = byteVal;
    }
    return { bytes, nextBit: sampleBit };
  };

  // 1. Check Magic Header
  const { bytes: headerBytes, nextBit: afterHeaderBit } = extractBytes(0, 8);
  const dec = new TextDecoder();
  const header = dec.decode(headerBytes);

  if (header !== MAGIC_HEADER) {
    throw new Error('No AudioCipher Steganographic signature detected in audio carrier.');
  }

  // 2. Read Payload Length (4 bytes big-endian)
  const { bytes: lenBytes, nextBit: afterLenBit } = extractBytes(afterHeaderBit, 4);
  const lenView = new DataView(lenBytes.buffer);
  const payloadLen = lenView.getUint32(0, false);

  if (payloadLen <= 0 || payloadLen > (numSamples - afterLenBit) / 8) {
    throw new Error(`Corrupted or invalid payload length detected (${payloadLen} bytes).`);
  }

  // 3. Extract Secret Bytes
  const { bytes: secretBytes } = extractBytes(afterLenBit, payloadLen);
  return dec.decode(secretBytes);
}

export function AudioCipherGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const amber = '#F59E0B';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [activeTab, setActiveTab] = useState(0); // 0: Encode/Embed, 1: Decode/Extract
  const [secretMessage, setSecretMessage] = useState(
    'SOVEREIGN_ENCLAVE_DEPLOY_KEY=zoth_sec_f99a38217bb4c009\nCOORDINATES=36.8508_N_75.9780_W\nAGENT=AZOTH_ARCHON_01'
  );
  const [passphrase, setPassphrase] = useState('sovereign_audio_key_2026');
  const [carrierDuration, setCarrierDuration] = useState(5); // seconds
  const [carrierFreq, setCarrierFreq] = useState(432); // Hz (432Hz harmonic)
  const [activeAudioBuffer, setActiveAudioBuffer] = useState(null);
  const [hasStegoEmbedded, setHasStegoEmbedded] = useState(false);
  const [extractedMessage, setExtractedMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStats, setAudioStats] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro Licensing & Paywall Modal
  const [isProLicensed, setIsProLicensed] = useState(true);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  // Audio Context & Canvas Refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initial carrier audio synthesis
  useEffect(() => {
    generateNewCarrier(carrierDuration, carrierFreq);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Generate Carrier Wave
  // ---------------------------------------------------------------------------
  const generateNewCarrier = (sec, freq) => {
    stopPlayback();
    const buf = createHarmonicWavCarrier(sec, freq);
    setActiveAudioBuffer(buf);
    setHasStegoEmbedded(false);
    setExtractedMessage('');
    const sampleRate = 44100;
    const numSamples = sampleRate * sec;
    setAudioStats({
      duration: sec,
      frequency: freq,
      sampleRate,
      numSamples,
      maxCapacityBytes: Math.floor(numSamples / 8) - 12
    });
    setStatusMessage(`Synthesized fresh 16-bit PCM carrier (${sec}s @ ${freq}Hz). Max covert capacity: ${(Math.floor(numSamples / 8) - 12).toLocaleString()} bytes.`);
    setStatusType('info');
  };

  // ---------------------------------------------------------------------------
  // Live Web Audio Playback & Real FFT Spectrogram Canvas
  // ---------------------------------------------------------------------------
  const initAudioEngine = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.85;
    }
  };

  const startPlayback = async () => {
    if (!activeAudioBuffer) return;
    try {
      initAudioEngine();
      stopPlayback();

      // Decode WAV buffer into AudioBuffer
      const audioBuffer = await audioContextRef.current.decodeAudioData(activeAudioBuffer.slice(0));
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      source.onended = () => {
        setIsPlaying(false);
      };

      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
      drawLiveSpectrogram();
    } catch (err) {
      console.error(err);
      setStatusMessage(`Audio playback error: ${err.message}`);
      setStatusType('error');
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // ---------------------------------------------------------------------------
  // Real-Time Canvas Frequency Spectrum & Spectrogram
  // ---------------------------------------------------------------------------
  const drawLiveSpectrogram = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = isDark ? '#08080B' : '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height - 10);

        // Gradient coloring: cyan to gold to emerald
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (hasStegoEmbedded) {
          grad.addColorStop(0, gold);
          grad.addColorStop(1, emerald);
        } else {
          grad.addColorStop(0, cyan);
          grad.addColorStop(1, '#6366F1');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    render();
  };

  // ---------------------------------------------------------------------------
  // Action: Embed Secret via Real LSB Modulation
  // ---------------------------------------------------------------------------
  const handleEmbedSecret = () => {
    if (!secretMessage.trim()) {
      setStatusMessage('Error: Please provide a plaintext secret payload to embed.');
      setStatusType('error');
      return;
    }
    if (!activeAudioBuffer) {
      setStatusMessage('Error: No audio carrier available.');
      setStatusType('error');
      return;
    }

    try {
      stopPlayback();
      const { stegoWavBuffer, bitsEmbedded, bytesEmbedded } = embedSecretIntoWav(activeAudioBuffer, secretMessage);
      setActiveAudioBuffer(stegoWavBuffer);
      setHasStegoEmbedded(true);
      setStatusMessage(`✔ Secret successfully embedded into 16-bit PCM carrier! (${bitsEmbedded} bits / ${bytesEmbedded} bytes sealed with LSB modulation). Zero acoustic degradation.`);
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Embedding failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Action: Extract Secret from Stego WAV
  // ---------------------------------------------------------------------------
  const handleExtractSecret = () => {
    if (!activeAudioBuffer) {
      setStatusMessage('Error: No audio buffer loaded for extraction.');
      setStatusType('error');
      return;
    }

    try {
      const recovered = extractSecretFromWav(activeAudioBuffer);
      setExtractedMessage(recovered);
      setStatusMessage(`✔ Steganographic signature verified! Recovered ${recovered.length} characters of authentic covert payload.`);
      setStatusType('success');
    } catch (err) {
      setExtractedMessage('');
      setStatusMessage(`Extraction failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Action: Handle User Custom WAV Upload
  // ---------------------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buf = evt.target.result;
        // Basic check for RIFF header
        const view = new DataView(buf);
        const riff = readString(view, 0, 4);
        const wave = readString(view, 8, 4);
        if (riff !== 'RIFF' || wave !== 'WAVE') {
          throw new Error('Selected file is not a valid RIFF WAVE (.wav) audio file.');
        }

        stopPlayback();
        setActiveAudioBuffer(buf);
        setHasStegoEmbedded(false);
        setExtractedMessage('');

        const sampleRate = view.getUint32(24, true);
        const numSamples = (buf.byteLength - 44) / 2;
        const dur = (numSamples / sampleRate).toFixed(1);

        setAudioStats({
          duration: dur,
          frequency: 'External Audio Track',
          sampleRate,
          numSamples,
          maxCapacityBytes: Math.floor(numSamples / 8) - 12
        });

        setStatusMessage(`Successfully loaded external audio carrier: ${file.name} (${dur}s, ${sampleRate}Hz, ${(Math.floor(numSamples / 8) - 12).toLocaleString()} bytes capacity).`);
        setStatusType('info');
      } catch (err) {
        setStatusMessage(`File error: ${err.message}`);
        setStatusType('error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------------------------------------------------------------------------
  // Action: Download Steganographic WAV File
  // ---------------------------------------------------------------------------
  const handleDownloadWav = () => {
    if (!isProLicensed) {
      setShowPaywallModal(true);
      return;
    }
    if (!activeAudioBuffer) return;

    const blob = new Blob([activeAudioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audiocipher_stego_${hasStegoEmbedded ? 'sealed' : 'carrier'}_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <GraphicEqIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                AudioCipher Mil-Spec LSB Steganography Studio
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '✦ 100% FREE & OPEN ACCESS' : 'FREE & OPEN ACCESS'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Real 16-bit PCM waveform LSB bitstream injection, in-browser Web Audio API synthesis, and zero acoustic degradation.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                ☕ Buy Us a Coffee
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED STEGO WAV EXPORT UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Main Interactive Workstation */}
      <Grid container spacing={3}>
        {/* Left Column: Carrier Wave Control & Audio Spectrum Canvas */}
        <Grid xs={12} lg={5}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2,
              mb: 3
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                AUDIO SPECTRUM SPECTROGRAM
              </Typography>
              <Chip
                size="small"
                icon={<MusicNoteIcon sx={{ fontSize: '14px !important' }} />}
                label={hasStegoEmbedded ? 'STEGO SEALED' : 'CLEAN CARRIER'}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: hasStegoEmbedded ? goldSoft : cyanSoft,
                  color: hasStegoEmbedded ? gold : cyan
                }}
              />
            </Stack>

            {/* Canvas Spectrogram */}
            <Box
              sx={{
                bgcolor: isDark ? voidDark : '#0F172A',
                border: `1px solid ${cardBorder}`,
                borderRadius: 2,
                p: 1,
                mb: 2,
                overflow: 'hidden'
              }}
            >
              <canvas
                ref={canvasRef}
                width={360}
                height={140}
                style={{ width: '100%', height: '140px', display: 'block' }}
              />
            </Box>

            {/* Audio Playback Controls */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <Button
                variant="contained"
                onClick={togglePlayback}
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  bgcolor: isPlaying ? crimson : emerald,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  flex: 1,
                  '&:hover': { bgcolor: isPlaying ? '#E11D48' : '#059669' }
                }}
              >
                {isPlaying ? 'PAUSE MONITOR' : 'PLAY CARRIER WAVE'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDownloadWav}
                startIcon={<DownloadIcon />}
                sx={{ borderColor: cardBorder, color: 'text.primary', fontFamily: mono, fontWeight: 700 }}
              >
                DOWNLOAD .WAV
              </Button>
            </Stack>

            {/* Carrier Parameters & Upload */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
              CARRIER WAVE ENGINE CONFIGURATION
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Duration (sec)"
                  value={carrierDuration}
                  onChange={(e) => setCarrierDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Freq (Hz)"
                  value={carrierFreq}
                  onChange={(e) => setCarrierFreq(Math.max(60, Math.min(2000, Number(e.target.value))))}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => generateNewCarrier(carrierDuration, carrierFreq)}
                startIcon={<RefreshIcon />}
                sx={{ borderColor: cyan, color: cyan, fontFamily: mono, fontSize: '0.75rem', flex: 1 }}
              >
                SYNTHESIZE NEW CARRIER
              </Button>
              <Button
                size="small"
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ borderColor: cardBorder, color: 'text.secondary', fontFamily: mono, fontSize: '0.75rem', flex: 1 }}
              >
                IMPORT WAV
                <input type="file" accept=".wav,audio/wav" hidden onChange={handleFileUpload} />
              </Button>
            </Stack>

            {/* Carrier Telemetry Info */}
            {audioStats && (
              <Paper sx={{ p: 1.5, mt: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block' }}>
                  Channels: 1 (Mono) • Format: 16-bit PCM • Rate: {audioStats.sampleRate} Hz
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold, display: 'block', mt: 0.5 }}>
                  Total PCM Samples: {audioStats.numSamples.toLocaleString()} • Capacity: {audioStats.maxCapacityBytes.toLocaleString()} bytes
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Encode & Decode Station */}
        <Grid xs={12} lg={7}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2
            }}
          >
            {/* Mode Switch Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                mb: 2,
                borderBottom: `1px solid ${cardBorder}`,
                '& .MuiTab-root': {
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  py: 1
                }
              }}
            >
              <Tab icon={<LockIcon />} iconPosition="start" label="EMBED SECRET (LSB INJECTION)" />
              <Tab icon={<LockOpenIcon />} iconPosition="start" label="EXTRACT SECRET (LSB RECOVERY)" />
            </Tabs>

            {statusMessage && (
              <Alert
                severity={statusType}
                sx={{
                  mb: 2.5,
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  bgcolor:
                    statusType === 'success' ? emeraldSoft : statusType === 'error' ? crimsonSoft : 'rgba(56, 189, 248, 0.08)',
                  color: statusType === 'success' ? emerald : statusType === 'error' ? crimson : cyan,
                  border: `1px solid ${statusType === 'success' ? emerald : statusType === 'error' ? crimson : cyan}`
                }}
              >
                {statusMessage}
              </Alert>
            )}

            {/* TAB 0: EMBED / INJECT */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Inject confidential strings, keys, or coordinates into the least significant bit (LSB) of each 16-bit PCM audio sample.
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Covert Plaintext Payload"
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  placeholder="Enter confidential variables, token seeds, or enclave credentials..."
                  InputProps={{
                    sx: { fontFamily: mono, fontSize: '0.8rem' }
                  }}
                  sx={{ mb: 2.5 }}
                />

                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                    Payload Size: <strong>{new TextEncoder().encode(secretMessage).length} bytes</strong> ({new TextEncoder().encode(secretMessage).length * 8} bits)
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={handleEmbedSecret}
                    startIcon={<GraphicEqIcon />}
                    sx={{
                      bgcolor: gold,
                      color: '#000',
                      fontWeight: 800,
                      fontFamily: mono,
                      px: 3,
                      '&:hover': { bgcolor: '#B8860B' }
                    }}
                  >
                    INJECT & SEAL AUDIO
                  </Button>
                </Stack>
              </Box>
            )}

            {/* TAB 1: EXTRACT / RECOVER */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Probe the currently loaded WAV carrier buffer, identify the AudioCipher header, and reconstruct the plaintext bitstream.
                </Typography>

                <Button
                  variant="contained"
                  onClick={handleExtractSecret}
                  startIcon={<LockOpenIcon />}
                  sx={{
                    bgcolor: emerald,
                    color: '#000',
                    fontWeight: 800,
                    fontFamily: mono,
                    mb: 2.5,
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  EXTRACT & RECOVER SECRET
                </Button>

                {extractedMessage ? (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: isDark ? voidDark : '#0F172A',
                      border: `1px solid ${emerald}`,
                      borderRadius: 1.5
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: emerald, fontWeight: 800 }}>
                        RECOVERED COVERT PAYLOAD
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopy(extractedMessage, 'copyExtracted')}
                        sx={{ fontFamily: mono, fontSize: '0.7rem', color: emerald }}
                      >
                        {copiedKey === 'copyExtracted' ? 'COPIED' : 'COPY'}
                      </Button>
                    </Stack>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: mono,
                        fontSize: '0.8rem',
                        color: '#E2E8F0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}
                    >
                      {extractedMessage}
                    </pre>
                  </Paper>
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: isDark ? voidDark : '#F8FAFC',
                      border: `1px dashed ${cardBorder}`,
                      borderRadius: 1.5
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                      Click &ldquo;EXTRACT & RECOVER SECRET&rdquo; to scan the current carrier for embedded payloads.
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              AudioCipher Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock unlimited steganographic WAV exports, external audio carrier modulation, and high-density bitstream embedding.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ 100% Free & Open Access — Optional Community Support
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Everything here is free to use. Optional tips are welcome via:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                ☕ Buy Us a Coffee (Stripe)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Optional note with your tip"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. AUDIO-PRO-XXXX-XXXX"
            InputProps={{
              sx: { fontFamily: mono }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AudioCipherGodModeTool;
