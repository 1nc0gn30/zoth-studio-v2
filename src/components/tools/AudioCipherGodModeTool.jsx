import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Tabs, Tab, Alert, Slider, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ShieldIcon from '@mui/icons-material/Shield';
import DialpadIcon from '@mui/icons-material/Dialpad';
import RadioIcon from '@mui/icons-material/Radio';
import SensorsIcon from '@mui/icons-material/Sensors';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:8096';

// ---------------------------------------------------------------------------
// Standard CRC-32 & CRC-16-CCITT (100% wire-compatible with Python backend)
// ---------------------------------------------------------------------------
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC32_TABLE[i] = c;
}
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = (c >>> 8) ^ CRC32_TABLE[(c ^ bytes[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function crc16Ccitt(bytes) {
  let crc = 0xFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? (((crc << 1) ^ 0x1021) & 0xFFFF) : ((crc << 1) & 0xFFFF);
  }
  return crc;
}

function bytesToBase64(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
function concatBytes(...arrs) {
  const total = arrs.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
function readString(view, offset, length) {
  let s = '';
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

function samplesToWavBuffer(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, Math.round(samples[i]))), true);
  }
  return buffer;
}

function createHarmonicWavCarrier(durationSec = 4, baseFreq = 432) {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSec;
  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let env = 1.0;
    if (t < 0.2) env = t / 0.2;
    else if (t > durationSec - 0.3) env = (durationSec - t) / 0.3;
    const s =
      (Math.sin(2 * Math.PI * baseFreq * t) * 0.45 +
        Math.sin(2 * Math.PI * (baseFreq * 1.25) * t) * 0.25 +
        Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.15) * env;
    samples[i] = Math.floor(s * 32767);
  }
  return samplesToWavBuffer(samples, sampleRate);
}

// Standard Wire-Compatible LSB Steganography: 'STEG' (4B) + LE uint32 len (4B) + LE uint32 CRC-32 (4B)
function embedSecretIntoWav(wavBuffer, secretString) {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(secretString);
  const checksum = crc32(secretBytes);
  const header = new Uint8Array(12);
  header.set([0x53, 0x54, 0x45, 0x47], 0); // 'STEG'
  const hv = new DataView(header.buffer);
  hv.setUint32(4, secretBytes.length, true);
  hv.setUint32(8, checksum, true);

  const fullPayload = concatBytes(header, secretBytes);
  const totalBits = fullPayload.length * 8;
  const newWavBuffer = wavBuffer.slice(0);
  const view = new DataView(newWavBuffer);
  const numSamples = Math.floor((newWavBuffer.byteLength - 44) / 2);
  if (totalBits > numSamples) {
    throw new Error(`Payload exceeds carrier capacity (${totalBits} bits needed, ${numSamples} samples available).`);
  }
  let bitIdx = 0;
  for (let i = 0; i < fullPayload.length; i++) {
    const byteVal = fullPayload[i];
    for (let b = 7; b >= 0; b--) {
      const bit = (byteVal >> b) & 1;
      const off = 44 + bitIdx * 2;
      view.setInt16(off, (view.getInt16(off, true) & ~1) | bit, true);
      bitIdx++;
    }
  }
  return { stegoWavBuffer: newWavBuffer, bitsEmbedded: totalBits, bytesEmbedded: fullPayload.length, checksum };
}

function extractSecretFromWav(wavBuffer) {
  const view = new DataView(wavBuffer);
  const numSamples = Math.floor((wavBuffer.byteLength - 44) / 2);
  if (numSamples < 96) throw new Error('Audio carrier too short to contain a STEG header.');
  const readBytes = (startBit, count) => {
    const out = new Uint8Array(count);
    let bit = startBit;
    for (let i = 0; i < count; i++) {
      let v = 0;
      for (let b = 7; b >= 0; b--) {
        const s = view.getInt16(44 + bit * 2, true);
        v |= (s & 1) << b;
        bit++;
      }
      out[i] = v;
    }
    return { bytes: out, nextBit: bit };
  };
  const { bytes: hdr, nextBit } = readBytes(0, 12);
  if (String.fromCharCode(hdr[0], hdr[1], hdr[2], hdr[3]) !== 'STEG') {
    throw new Error('No STEG steganographic signature detected in 16-bit PCM carrier.');
  }
  const hv = new DataView(hdr.buffer);
  const payloadLen = hv.getUint32(4, true);
  const expectedCrc = hv.getUint32(8, true);
  if (payloadLen > (numSamples - nextBit) / 8) {
    throw new Error(`Corrupted carrier: header declares ${payloadLen} bytes exceeding audio length.`);
  }
  const { bytes: payload } = readBytes(nextBit, payloadLen);
  const actualCrc = crc32(payload);
  if (actualCrc !== expectedCrc) {
    throw new Error(`CRC-32 integrity failure (expected 0x${expectedCrc.toString(16)}, got 0x${actualCrc.toString(16)}).`);
  }
  return { text: new TextDecoder().decode(payload), crcHex: `0x${actualCrc.toString(16).toUpperCase()}` };
}

function goertzel(samples, targetFreq, sampleRate) {
  const k = Math.round((samples.length * targetFreq) / sampleRate);
  const omega = (2 * Math.PI * k) / samples.length;
  const coeff = 2 * Math.cos(omega);
  let q0 = 0, q1 = 0, q2 = 0;
  for (let i = 0; i < samples.length; i++) {
    q0 = coeff * q1 - q2 + samples[i];
    q2 = q1;
    q1 = q0;
  }
  return q1 * q1 + q2 * q2 - coeff * q1 * q2;
}

async function deriveMasterKeyJs(audioBytes, volumeDb, salt) {
  const vb = new ArrayBuffer(8);
  new DataView(vb).setFloat64(0, volumeDb, true);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', concatBytes(audioBytes, new Uint8Array(vb))));
  const base = await crypto.subtle.importKey('raw', digest, 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, 256));
}
async function hmacSha256Js(keyBytes, msgBytes) {
  const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, msgBytes));
}
async function keystreamJs(encKey, iv, length) {
  const blocks = [];
  let gen = 0, ctr = 0;
  while (gen < length) {
    const cb = new ArrayBuffer(8);
    const dv = new DataView(cb);
    dv.setUint32(0, ctr >>> 0, true);
    dv.setUint32(4, Math.floor(ctr / 0x100000000), true);
    const blk = await hmacSha256Js(encKey, concatBytes(iv, new Uint8Array(cb)));
    blocks.push(blk);
    gen += blk.length;
    ctr++;
  }
  return concatBytes(...blocks).subarray(0, length);
}

const DTMF_FREQS = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633]
};
const MORSE_MAP = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',
  M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',
  Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',
  8:'---..',9:'----.',' ':'/'
};

export function AudioCipherGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const emerald = isDark ? '#10B981' : '#047857';
  const emeraldSoft = isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(4, 120, 87, 0.10)';
  const gold = isDark ? '#D4AF37' : '#8C6A2E';
  const goldSoft = isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(140, 106, 46, 0.12)';
  const goldInk = isDark ? '#08080B' : '#FFFDF8';
  const crimson = isDark ? '#F87171' : '#B91C1C';
  const crimsonSoft = isDark ? 'rgba(248, 113, 113, 0.14)' : 'rgba(185, 28, 28, 0.10)';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const cyanSoft = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(3, 105, 161, 0.10)';
  const voidDark = '#08080B';
  const surfaceBg = isDark ? '#10121A' : '#FFFDF8';
  const subSurfaceBg = isDark ? '#08080B' : '#F4EFE3';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(24, 22, 19, 0.14)';

  const [daemonOnline, setDaemonOnline] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: LSB Stego, 1: Cipher, 2: Steganalysis, 3: DTMF, 4: Morse, 5: BFSK
  const [secretMessage, setSecretMessage] = useState(
    'SOVEREIGN_ENCLAVE_DEPLOY_KEY=zoth_sec_f99a38217bb4c009\nCOORDINATES=36.8508_N_75.9780_W'
  );
  const [cipherText, setCipherText] = useState('Top Secret Sovereign Agent Directive #757');
  const [volumeDb, setVolumeDb] = useState(50);
  const [encryptedB64, setEncryptedB64] = useState('');
  const [audioKeyB64, setAudioKeyB64] = useState('');
  const [dtmfDigits, setDtmfDigits] = useState('18005550199#');
  const [morseText, setMorseText] = useState('SOS ZOTH 757');
  const [morseWpm, setMorseWpm] = useState(20);
  const [fskPayload, setFskPayload] = useState('AIRGAP_PACKET_016');
  const [fskBaud, setFskBaud] = useState(300);
  const [fskBand, setFskBand] = useState('audible');

  const [carrierDuration, setCarrierDuration] = useState(4);
  const [carrierFreq, setCarrierFreq] = useState(432);
  const [activeAudioBuffer, setActiveAudioBuffer] = useState(null);
  const [hasStegoEmbedded, setHasStegoEmbedded] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStats, setAudioStats] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const probe = async () => {
      try {
        const res = await fetch(`${DAEMON_BASE}/health`, { cache: 'no-store' });
        if (alive && res.ok) {
          const data = await res.json();
          setDaemonOnline(data?.service === 'audiocipher-stego-engine');
        }
      } catch {
        if (alive) setDaemonOnline(false);
      }
    };
    probe();
    generateNewCarrier(carrierDuration, carrierFreq);
    return () => {
      alive = false;
      stopPlayback();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#08080B';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let y = 28; y < h; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const numBars = 48, barW = (w - numBars * 2) / numBars;
    for (let i = 0; i < numBars; i++) {
      const r = i / numBars;
      const amp = Math.min(1, Math.exp(-Math.pow((r - 0.18) * 9, 2)) + Math.exp(-Math.pow((r - 0.26) * 11, 2)) * 0.6 + (hasStegoEmbedded ? 0.14 : 0.04));
      const bh = Math.max(4, amp * (h - 24));
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, hasStegoEmbedded ? '#D4AF37' : '#38BDF8');
      grad.addColorStop(1, hasStegoEmbedded ? '#10B981' : '#6366F1');
      ctx.fillStyle = grad;
      ctx.fillRect(i * (barW + 2), h - bh, barW, bh);
    }
    ctx.strokeStyle = hasStegoEmbedded ? '#10B981' : '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 8;
      const y = 34 + Math.sin(t) * 14 + Math.sin(t * 1.25) * 6;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [activeAudioBuffer, hasStegoEmbedded, isPlaying, carrierFreq]);

  const apiCall = async (path, body) => {
    const res = await fetch(`${DAEMON_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  };

  const updateBufferStats = (buf, label = `${carrierFreq} Hz`) => {
    const view = new DataView(buf);
    const sr = view.getUint32(24, true) || 44100;
    const numSamples = Math.max(0, Math.floor((buf.byteLength - 44) / 2));
    setActiveAudioBuffer(buf);
    setAudioStats({
      duration: (numSamples / sr).toFixed(2),
      frequency: label,
      sampleRate: sr,
      numSamples,
      maxCapacityBytes: Math.max(0, Math.floor(numSamples / 8) - 12),
    });
  };

  const generateNewCarrier = (sec, freq) => {
    stopPlayback();
    const buf = createHarmonicWavCarrier(sec, freq);
    setHasStegoEmbedded(false);
    setOutputText('');
    updateBufferStats(buf, `${freq} Hz`);
    setStatusMessage(`Synthesized 16-bit PCM WAV carrier (${sec}s @ ${freq}Hz). Wire format: STEG + LE uint32 + CRC-32.`);
    setStatusType('info');
  };

  const initAudioEngine = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  };

  const startPlayback = async () => {
    if (!activeAudioBuffer) return;
    try {
      initAudioEngine();
      stopPlayback();
      const decoded = await audioContextRef.current.decodeAudioData(activeAudioBuffer.slice(0));
      const src = audioContextRef.current.createBufferSource();
      src.buffer = decoded;
      src.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      src.onended = () => setIsPlaying(false);
      src.start(0);
      sourceNodeRef.current = src;
      setIsPlaying(true);
    } catch (err) {
      setStatusMessage(`Playback error: ${err.message}`);
      setStatusType('error');
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); sourceNodeRef.current.disconnect(); } catch {}
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buf = evt.target.result;
        const view = new DataView(buf);
        if (readString(view, 0, 4) !== 'RIFF' || readString(view, 8, 4) !== 'WAVE') {
          throw new Error('Selected file is not a valid RIFF/WAVE (.wav) file.');
        }
        stopPlayback();
        setHasStegoEmbedded(false);
        updateBufferStats(buf, file.name);
        setStatusMessage(`Loaded external 16-bit PCM WAV: ${file.name}`);
        setStatusType('info');
      } catch (err) {
        setStatusMessage(`File error: ${err.message}`);
        setStatusType('error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadWav = () => {
    if (!activeAudioBuffer) return;
    const url = URL.createObjectURL(new Blob([activeAudioBuffer], { type: 'audio/wav' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `audiocipher_stego_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Mode 0: LSB Stego ---
  const handleEmbedSecret = async () => {
    if (!secretMessage.trim() || !activeAudioBuffer) return;
    try {
      stopPlayback();
      if (daemonOnline) {
        const carrierB64 = bytesToBase64(new Uint8Array(activeAudioBuffer));
        const res = await apiCall('/api/stego/embed', { payload: secretMessage, carrier_wav_base64: carrierB64 });
        updateBufferStats(base64ToArrayBuffer(res.stego_wav_base64), 'Stego WAV (:8096)');
        setHasStegoEmbedded(true);
        setOutputText(`Embedded ${res.payload_size_bytes} bytes via live :8096 daemon (STEG + LE uint32 + CRC-32).`);
        setStatusMessage('Embedded payload via live :8096 daemon.');
        setStatusType('success');
        return;
      }
      const { stegoWavBuffer, bitsEmbedded, checksum } = embedSecretIntoWav(activeAudioBuffer, secretMessage);
      updateBufferStats(stegoWavBuffer, 'Stego WAV (Offline)');
      setHasStegoEmbedded(true);
      setOutputText(`Embedded ${bitsEmbedded} bits offline (STEG + LE uint32 + CRC-32 0x${checksum.toString(16).toUpperCase()}).`);
      setStatusMessage('Embedded payload offline with standard STEG + CRC-32 wire format.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Embed failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleExtractSecret = async () => {
    if (!activeAudioBuffer) return;
    try {
      if (daemonOnline) {
        const carrierB64 = bytesToBase64(new Uint8Array(activeAudioBuffer));
        const res = await apiCall('/api/stego/extract', { carrier_wav_base64: carrierB64 });
        setOutputText(res.extracted_text);
        setStatusMessage(`Extracted ${res.length_bytes} bytes via :8096 (CRC-32 verified).`);
        setStatusType('success');
        return;
      }
      const { text, crcHex } = extractSecretFromWav(activeAudioBuffer);
      setOutputText(text);
      setStatusMessage(`Extracted offline payload (CRC-32 ${crcHex} verified).`);
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Extract failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // --- Mode 1: Acoustic Keyed Cipher (v2 key-separated) ---
  const handleEncryptCipher = async () => {
    try {
      if (daemonOnline) {
        const res = await apiCall('/api/encrypt', { payload: cipherText, volume_db: volumeDb });
        setEncryptedB64(res.encrypted_blob_base64);
        setAudioKeyB64(res.audio_key_base64);
        updateBufferStats(base64ToArrayBuffer(res.audio_key_base64), 'Cipher Audio Key (:8096)');
        setOutputText(res.encrypted_blob_base64);
        setStatusMessage(`Encrypted via :8096 (${res.length_bytes} B, AC2 v2 key-separated PBKDF2 200k).`);
        setStatusType('success');
        return;
      }
      const wavBytes = new Uint8Array(activeAudioBuffer || createHarmonicWavCarrier(1, 440));
      const keyB64 = bytesToBase64(wavBytes);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const enc = new TextEncoder();
      const plain = enc.encode(cipherText);
      const mk = await deriveMasterKeyJs(wavBytes, volumeDb, salt);
      const ek = await hmacSha256Js(mk, enc.encode('audiocipher-enc-v2'));
      const ak = await hmacSha256Js(mk, enc.encode('audiocipher-mac-v2'));
      const ks = await keystreamJs(ek, iv, plain.length);
      const ct = new Uint8Array(plain.length);
      for (let i = 0; i < plain.length; i++) ct[i] = plain[i] ^ ks[i];
      const macInput = concatBytes(new Uint8Array([0x41, 0x43, 0x32, 0x02]), salt, iv, ct);
      const blob = concatBytes(macInput, await hmacSha256Js(ak, macInput));
      const b64 = bytesToBase64(blob);
      setEncryptedB64(b64);
      setAudioKeyB64(keyB64);
      setOutputText(b64);
      setStatusMessage(`Encrypted offline (${blob.length} B, AC2 v2 key-separated PBKDF2 200k).`);
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Encrypt failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleDecryptCipher = async () => {
    if (!encryptedB64 || !audioKeyB64) {
      setStatusMessage('Encrypt a payload first.');
      setStatusType('error');
      return;
    }
    try {
      if (daemonOnline) {
        const res = await apiCall('/api/decrypt', {
          encrypted_blob_base64: encryptedB64,
          audio_base64: audioKeyB64,
          volume_db: volumeDb,
        });
        setOutputText(res.decrypted_text);
        setStatusMessage('Decrypted & HMAC-authenticated via :8096.');
        setStatusType('success');
        return;
      }
      const blob = new Uint8Array(base64ToArrayBuffer(encryptedB64));
      const wavBytes = new Uint8Array(base64ToArrayBuffer(audioKeyB64));
      const enc = new TextEncoder();
      const salt = blob.subarray(4, 20), iv = blob.subarray(20, 36);
      const ct = blob.subarray(36, blob.length - 32), tag = blob.subarray(blob.length - 32);
      const mk = await deriveMasterKeyJs(wavBytes, volumeDb, salt);
      const ek = await hmacSha256Js(mk, enc.encode('audiocipher-enc-v2'));
      const ak = await hmacSha256Js(mk, enc.encode('audiocipher-mac-v2'));
      const expected = await hmacSha256Js(ak, blob.subarray(0, blob.length - 32));
      let diff = 0;
      for (let i = 0; i < 32; i++) diff |= (tag[i] ^ expected[i]);
      if (diff !== 0) throw new Error('Authentication failed: wrong dB or tampered ciphertext.');
      const ks = await keystreamJs(ek, iv, ct.length);
      const pt = new Uint8Array(ct.length);
      for (let i = 0; i < ct.length; i++) pt[i] = ct[i] ^ ks[i];
      setOutputText(new TextDecoder().decode(pt));
      setStatusMessage('Decrypted & HMAC-authenticated offline.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Decrypt failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // --- Mode 2: Steganalysis ---
  const handleSteganalysis = async () => {
    if (!activeAudioBuffer) return;
    try {
      if (daemonOnline) {
        const carrierB64 = bytesToBase64(new Uint8Array(activeAudioBuffer));
        const rep = await apiCall('/api/steganalysis', { carrier_wav_base64: carrierB64 });
        setOutputText(JSON.stringify(rep, null, 2));
        setStatusMessage(`Steganalysis (:8096): ${rep.forensic_verdict} (${rep.confidence_score}% confidence)`);
        setStatusType(rep.stego_detected ? 'warning' : 'success');
        return;
      }
      let detected = false;
      try { extractSecretFromWav(activeAudioBuffer); detected = true; } catch {}
      setOutputText(JSON.stringify({ mode: 'offline-scan', stego_detected: detected, signature: detected ? 'STEG+CRC32' : 'NONE' }, null, 2));
      setStatusMessage(detected ? 'Offline scan detected STEG LSB signature.' : 'Offline scan: clean carrier.');
      setStatusType(detected ? 'warning' : 'success');
    } catch (err) {
      setStatusMessage(`Steganalysis failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // --- Mode 3: DTMF ---
  const handleDtmfSynth = async () => {
    try {
      if (daemonOnline) {
        const res = await apiCall('/api/dtmf/synthesize', { digits: dtmfDigits, tone_duration: 0.1, silence_duration: 0.05 });
        updateBufferStats(base64ToArrayBuffer(res.wav_base64), 'DTMF WAV (:8096)');
        setOutputText(`Synthesized DTMF [${res.digits}] (${res.duration_seconds}s) via :8096.`);
        setStatusMessage('DTMF WAV synthesized via :8096.');
        setStatusType('success');
        return;
      }
      const sr = 8000, toneN = 800, pauseN = 400;
      const samples = new Int16Array(dtmfDigits.length * (toneN + pauseN));
      let off = 0;
      for (const ch of dtmfDigits.toUpperCase()) {
        const pair = DTMF_FREQS[ch] || [0, 0];
        for (let i = 0; i < toneN; i++) {
          const t = i / sr;
          samples[off++] = Math.round((Math.sin(2 * Math.PI * pair[0] * t) + Math.sin(2 * Math.PI * pair[1] * t)) * 8000);
        }
        off += pauseN;
      }
      updateBufferStats(samplesToWavBuffer(samples, sr), 'DTMF WAV (Offline)');
      setOutputText(`Synthesized DTMF [${dtmfDigits.toUpperCase()}] offline.`);
      setStatusMessage('DTMF WAV synthesized offline.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`DTMF failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleDtmfDecode = async () => {
    if (!activeAudioBuffer) return;
    try {
      if (daemonOnline) {
        const wavB64 = bytesToBase64(new Uint8Array(activeAudioBuffer));
        const res = await apiCall('/api/dtmf/decode', { wav_base64: wavB64, tone_duration: 0.1, silence_duration: 0.05 });
        setOutputText(`Decoded DTMF Digits: ${res.decoded_digits}`);
        setStatusMessage(`Goertzel decoded via :8096: ${res.decoded_digits}`);
        setStatusType('success');
        return;
      }
      const view = new DataView(activeAudioBuffer);
      const sr = view.getUint32(24, true) || 8000;
      const n = Math.floor((activeAudioBuffer.byteLength - 44) / 2);
      const samples = new Int16Array(n);
      for (let i = 0; i < n; i++) samples[i] = view.getInt16(44 + i * 2, true);
      const toneN = Math.round(sr * 0.1), step = Math.round(sr * 0.15);
      const low = [697, 770, 852, 941], high = [1209, 1336, 1477, 1633];
      let decoded = '';
      for (let d = 0; d < Math.floor(n / step); d++) {
        const blk = samples.subarray(d * step, d * step + toneN);
        const bl = low.reduce((a, b) => goertzel(blk, b, sr) > goertzel(blk, a, sr) ? b : a, low[0]);
        const bh = high.reduce((a, b) => goertzel(blk, b, sr) > goertzel(blk, a, sr) ? b : a, high[0]);
        for (const [k, pair] of Object.entries(DTMF_FREQS)) if (pair[0] === bl && pair[1] === bh) { decoded += k; break; }
      }
      setOutputText(`Decoded DTMF Digits (Offline): ${decoded}`);
      setStatusMessage(`Goertzel decoded offline: ${decoded}`);
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`DTMF decode failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // --- Mode 4: Morse ---
  const handleMorseSynth = async () => {
    try {
      if (daemonOnline) {
        const res = await apiCall('/api/morse', { text: morseText, frequency: 800.0, wpm: morseWpm });
        updateBufferStats(base64ToArrayBuffer(res.wav_base64), 'Morse WAV (:8096)');
        setOutputText(`Notation: ${res.morse_notation}\nDuration: ${res.duration_seconds}s @ ${morseWpm} WPM`);
        setStatusMessage('ITU Morse synthesized via :8096.');
        setStatusType('success');
        return;
      }
      const notation = morseText.toUpperCase().split('').map(c => MORSE_MAP[c] || '').filter(Boolean).join(' ');
      const sr = 22050, unit = Math.round(sr * (1.2 / morseWpm));
      const buf = [];
      for (const ch of notation) {
        if (ch === '.' || ch === '-') {
          const len = ch === '.' ? unit : unit * 3;
          for (let i = 0; i < len; i++) buf.push(Math.round(Math.sin(2 * Math.PI * 800 * (i / sr)) * 15000));
          for (let i = 0; i < unit; i++) buf.push(0);
        } else if (ch === ' ') { for (let i = 0; i < unit * 2; i++) buf.push(0); }
        else if (ch === '/') { for (let i = 0; i < unit * 6; i++) buf.push(0); }
      }
      updateBufferStats(samplesToWavBuffer(Int16Array.from(buf), sr), 'Morse WAV (Offline)');
      setOutputText(`Notation: ${notation}`);
      setStatusMessage('ITU Morse synthesized offline.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Morse failed: ${err.message}`);
      setStatusType('error');
    }
  };

  // --- Mode 5: BFSK Modem ---
  const handleFskModulate = async () => {
    try {
      const ultrasonic = fskBand === 'ultrasonic';
      if (daemonOnline) {
        const res = await apiCall('/api/fsk-modulate', { payload: fskPayload, baud_rate: fskBaud, ultrasonic });
        updateBufferStats(base64ToArrayBuffer(res.wav_base64), `BFSK ${fskBaud}b (:8096)`);
        setOutputText(`BFSK Modulated via :8096 (${res.duration_seconds}s, ${res.mark_frequency_hz}/${res.space_frequency_hz} Hz, 0x55/0x7E + CRC-16).`);
        setStatusMessage('BFSK waveform modulated via :8096.');
        setStatusType('success');
        return;
      }
      const markF = ultrasonic ? 18500 : 1200, spaceF = ultrasonic ? 20000 : 2200;
      const sr = 44100, spb = Math.max(1, Math.round(sr / fskBaud));
      const dataBytes = new TextEncoder().encode(fskPayload);
      const lenHdr = new Uint8Array([(dataBytes.length >> 8) & 0xFF, dataBytes.length & 0xFF]);
      const crcVal = crc16Ccitt(concatBytes(lenHdr, dataBytes));
      const packet = concatBytes(new Uint8Array([0x55, 0x55, 0x55, 0x55, 0x7E]), lenHdr, dataBytes, new Uint8Array([(crcVal >> 8) & 0xFF, crcVal & 0xFF]));
      const bits = [1, 1, 1, 1, 1, 1, 1, 1];
      for (const byte of packet) {
        bits.push(0);
        for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1);
        bits.push(1);
      }
      bits.push(1, 1, 1, 1, 1, 1, 1, 1);
      const samples = new Int16Array(bits.length * spb);
      let phase = 0, off = 0;
      for (const bit of bits) {
        const step = 2 * Math.PI * (bit ? markF : spaceF) / sr;
        for (let i = 0; i < spb; i++) { phase = (phase + step) % (2 * Math.PI); samples[off++] = Math.round(Math.sin(phase) * 16383); }
      }
      updateBufferStats(samplesToWavBuffer(samples, sr), `BFSK ${fskBaud}b (Offline)`);
      setOutputText(`BFSK Modulated offline (0x55/0x7E + CRC-16 0x${crcVal.toString(16).toUpperCase()}).`);
      setStatusMessage('BFSK waveform modulated offline.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`BFSK modulate failed: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleFskDemodulate = async () => {
    if (!activeAudioBuffer) return;
    try {
      const ultrasonic = fskBand === 'ultrasonic';
      if (daemonOnline) {
        const wavB64 = bytesToBase64(new Uint8Array(activeAudioBuffer));
        const res = await apiCall('/api/fsk-demodulate', { wav_base64: wavB64, baud_rate: fskBaud, ultrasonic });
        setOutputText(`Decoded: ${res.decoded_text}\nCRC-16: ${res.telemetry?.crc16_hex} | SNR: ${res.telemetry?.estimated_snr_db} dB`);
        setStatusMessage('BFSK demodulated & CRC-16 verified via :8096.');
        setStatusType('success');
        return;
      }
      const view = new DataView(activeAudioBuffer);
      const sr = view.getUint32(24, true) || 44100;
      const n = Math.floor((activeAudioBuffer.byteLength - 44) / 2);
      const samples = new Int16Array(n);
      for (let i = 0; i < n; i++) samples[i] = view.getInt16(44 + i * 2, true);
      const markF = ultrasonic ? 18500 : 1200, spaceF = ultrasonic ? 20000 : 2200;
      const spb = Math.max(1, Math.round(sr / fskBaud));
      const bits = [];
      for (let b = 0; b < Math.floor(n / spb); b++) {
        const sl = samples.subarray(b * spb, (b + 1) * spb);
        bits.push(goertzel(sl, markF, sr) >= goertzel(sl, spaceF, sr) ? 1 : 0);
      }
      const bytes = [];
      for (let i = 0; i + 10 <= bits.length;) {
        if (bits[i] === 0 && bits[i + 9] === 1) {
          let v = 0;
          for (let b = 0; b < 8; b++) v |= (bits[i + 1 + b] << b);
          bytes.push(v); i += 10;
        } else i++;
      }
      const dIdx = bytes.indexOf(0x7E);
      if (dIdx < 0 || dIdx + 5 > bytes.length) throw new Error('No 0x7E BFSK frame delimiter found.');
      const rem = bytes.slice(dIdx + 1);
      const len = (rem[0] << 8) | rem[1];
      const body = new Uint8Array(rem.slice(2, 2 + len));
      const rxCrc = (rem[2 + len] << 8) | rem[3 + len];
      const expCrc = crc16Ccitt(concatBytes(new Uint8Array([rem[0], rem[1]]), body));
      if (rxCrc !== expCrc) throw new Error('CRC-16 mismatch.');
      setOutputText(`Decoded Offline: ${new TextDecoder().decode(body)} (CRC-16 0x${rxCrc.toString(16).toUpperCase()})`);
      setStatusMessage('BFSK demodulated & CRC-16 verified offline.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`BFSK demodulate failed: ${err.message}`);
      setStatusType('error');
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <SovereignEyebrow accent={emerald} right={daemonOnline ? 'LIVE :8096 DAEMON' : 'OFFLINE BROWSER MODE'}>
        {'audiocipher-stego-engine'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'audiocipher-stego-engine'}
        eyebrow={'Zoth Studio v2.6.0'}
        caption={'AudioCipher Stego Studio — 6-Mode Hybrid Acoustic Cryptography & Stego Deck'}
        label={'AudioCipher Stego Studio — Zoth sovereign visualisation'}
      />

      <Grid container spacing={3}>
        {/* Left Column: Spectrum Canvas & Carrier Controls */}
        <Grid xs={12} lg={5}>
          <Paper sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                AUDIO SPECTRUM MONITOR
              </Typography>
              <Chip
                size="small"
                icon={<MusicNoteIcon sx={{ fontSize: '14px !important' }} />}
                label={hasStegoEmbedded ? 'STEGO SEALED' : daemonOnline ? 'LIVE :8096' : 'OFFLINE PCM'}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: hasStegoEmbedded ? goldSoft : emeraldSoft,
                  color: hasStegoEmbedded ? gold : emerald,
                }}
              />
            </Stack>

            <Box sx={{ bgcolor: voidDark, border: `1px solid ${cardBorder}`, borderRadius: 2, p: 1, mb: 2, overflow: 'hidden' }}>
              <canvas ref={canvasRef} width={360} height={140} style={{ width: '100%', height: '140px', display: 'block' }} />
            </Box>

            <Stack direction="row" spacing={1.25} alignItems="stretch" sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={isPlaying ? stopPlayback : startPlayback}
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  bgcolor: isPlaying ? crimson : emerald,
                  color: '#FFFDF8',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  minHeight: 44,
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {isPlaying ? 'PAUSE' : 'PLAY WAV'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDownloadWav}
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: cardBorder,
                  color: 'text.primary',
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  minHeight: 44,
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                SAVE .WAV
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid xs={6}>
                <TextField
                  fullWidth size="small" type="number" label="Duration (sec)"
                  value={carrierDuration}
                  onChange={(e) => setCarrierDuration(Math.max(1, Math.min(30, Number(e.target.value))))}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  fullWidth size="small" type="number" label="Freq (Hz)"
                  value={carrierFreq}
                  onChange={(e) => setCarrierFreq(Math.max(60, Math.min(2000, Number(e.target.value))))}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.25} alignItems="stretch">
              <Button
                size="small" variant="outlined"
                onClick={() => generateNewCarrier(carrierDuration, carrierFreq)}
                startIcon={<RefreshIcon />}
                sx={{
                  borderColor: cyan, color: cyan, fontFamily: mono, fontWeight: 700,
                  fontSize: '0.74rem', minHeight: 44, whiteSpace: 'nowrap', flex: 1,
                }}
              >
                NEW CARRIER
              </Button>
              <Button
                size="small" variant="outlined" component="label"
                startIcon={<UploadFileIcon />}
                sx={{
                  borderColor: cardBorder, color: 'text.primary', fontFamily: mono, fontWeight: 700,
                  fontSize: '0.74rem', minHeight: 44, whiteSpace: 'nowrap', flex: 1,
                }}
              >
                IMPORT WAV
                <input type="file" accept=".wav,audio/wav" hidden onChange={handleFileUpload} />
              </Button>
            </Stack>

            {audioStats && (
              <Paper sx={{ p: 1.5, mt: 2, bgcolor: subSurfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block' }}>
                  16-bit PCM WAV • {audioStats.sampleRate} Hz • {audioStats.duration}s ({audioStats.frequency})
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold, display: 'block', mt: 0.5, fontWeight: 700 }}>
                  Samples: {audioStats.numSamples.toLocaleString()} • LSB Capacity: {audioStats.maxCapacityBytes.toLocaleString()} B
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>

        {/* Right Column: 6-Mode Hybrid Workstation */}
        <Grid xs={12} lg={7}>
          <Paper sx={{ p: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                borderBottom: `1px solid ${cardBorder}`,
                '& .MuiTab-root': { fontFamily: mono, fontWeight: 700, fontSize: '0.75rem', minHeight: 44 },
              }}
            >
              <Tab icon={<ShieldIcon fontSize="small" />} iconPosition="start" label="LSB Stego" />
              <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Cipher v2" />
              <Tab icon={<GraphicEqIcon fontSize="small" />} iconPosition="start" label="Steganalysis" />
              <Tab icon={<DialpadIcon fontSize="small" />} iconPosition="start" label="DTMF" />
              <Tab icon={<RadioIcon fontSize="small" />} iconPosition="start" label="Morse" />
              <Tab icon={<SensorsIcon fontSize="small" />} iconPosition="start" label="BFSK Modem" />
            </Tabs>

            {statusMessage && (
              <Alert
                severity={statusType}
                sx={{
                  mb: 2,
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: statusType === 'success' ? emeraldSoft : statusType === 'error' ? crimsonSoft : cyanSoft,
                  color: statusType === 'success' ? emerald : statusType === 'error' ? crimson : cyan,
                  border: `1px solid ${statusType === 'success' ? emerald : statusType === 'error' ? crimson : cyan}`,
                }}
              >
                {statusMessage}
              </Alert>
            )}

            {activeTab === 0 && (
              <Box>
                <TextField
                  fullWidth multiline rows={4} label="Covert Payload (STEG + LE uint32 + CRC-32)"
                  value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }} sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={handleEmbedSecret} startIcon={<LockIcon />}
                    sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    EMBED LSB
                  </Button>
                  <Button variant="outlined" onClick={handleExtractSecret} startIcon={<LockOpenIcon />}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    EXTRACT LSB
                  </Button>
                </Stack>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <TextField
                  fullWidth multiline rows={3} label="Plaintext for v2 Key-Separated Acoustic Cipher"
                  value={cipherText} onChange={(e) => setCipherText(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }} sx={{ mb: 2 }}
                />
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                  Volume Modifier Key: <strong>{volumeDb} dB</strong> (200,000 PBKDF2 rounds + separate enc/mac keys)
                </Typography>
                <Slider value={volumeDb} min={10} max={90} onChange={(_, v) => setVolumeDb(v)} sx={{ color: gold, mb: 2 }} />
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={handleEncryptCipher} startIcon={<LockIcon />}
                    sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    ENCRYPT (AC2 v2)
                  </Button>
                  <Button variant="outlined" onClick={handleDecryptCipher} startIcon={<LockOpenIcon />}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    DECRYPT &amp; VERIFY
                  </Button>
                </Stack>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Run forensic PoV chi-square, LSB header detection, and ultrasonic HF energy analysis on the active 16-bit PCM WAV buffer.
                </Typography>
                <Button variant="contained" onClick={handleSteganalysis} startIcon={<GraphicEqIcon />}
                  sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                  RUN FORENSIC STEGANALYSIS
                </Button>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <TextField
                  fullWidth size="small" label="DTMF Digits (0-9, A-D, *, #)"
                  value={dtmfDigits} onChange={(e) => setDtmfDigits(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }} sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={handleDtmfSynth}
                    sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    SYNTHESIZE DTMF
                  </Button>
                  <Button variant="outlined" onClick={handleDtmfDecode}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    GOERTZEL DECODE
                  </Button>
                </Stack>
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <TextField
                  fullWidth size="small" label="ITU Morse Message"
                  value={morseText} onChange={(e) => setMorseText(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }} sx={{ mb: 2 }}
                />
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                  Speed: <strong>{morseWpm} WPM</strong> (800 Hz PCM)
                </Typography>
                <Slider value={morseWpm} min={5} max={40} onChange={(_, v) => setMorseWpm(v)} sx={{ color: gold, mb: 2 }} />
                <Button variant="contained" onClick={handleMorseSynth}
                  sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                  SYNTHESIZE MORSE WAV
                </Button>
              </Box>
            )}

            {activeTab === 5 && (
              <Box>
                <TextField
                  fullWidth size="small" label="BFSK Air-Gap Payload (0x55/0x7E + CRC-16)"
                  value={fskPayload} onChange={(e) => setFskPayload(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }} sx={{ mb: 2 }}
                />
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Baud Rate</InputLabel>
                      <Select value={fskBaud} label="Baud Rate" onChange={(e) => setFskBaud(Number(e.target.value))}>
                        <MenuItem value={300}>300 baud</MenuItem>
                        <MenuItem value={600}>600 baud</MenuItem>
                        <MenuItem value={1200}>1200 baud</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Carrier Band</InputLabel>
                      <Select value={fskBand} label="Carrier Band" onChange={(e) => setFskBand(e.target.value)}>
                        <MenuItem value="audible">Audible (1200/2200 Hz)</MenuItem>
                        <MenuItem value="ultrasonic">Ultrasonic (18.5/20.0 kHz)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={handleFskModulate}
                    sx={{ bgcolor: gold, color: goldInk, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    MODULATE BFSK
                  </Button>
                  <Button variant="outlined" onClick={handleFskDemodulate}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontWeight: 800, minHeight: 44, whiteSpace: 'nowrap' }}>
                    DEMODULATE CRC-16
                  </Button>
                </Stack>
              </Box>
            )}

            {outputText && (
              <Paper sx={{ p: 2, mt: 2.5, bgcolor: subSurfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: emerald, fontWeight: 800 }}>
                    ENGINE OUTPUT
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(outputText, 'out')}
                    sx={{ fontFamily: mono, fontSize: '0.72rem', color: gold, minHeight: 36 }}
                  >
                    {copiedKey === 'out' ? 'COPIED' : 'COPY'}
                  </Button>
                </Stack>
                <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {outputText}
                </pre>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AudioCipherGodModeTool;
