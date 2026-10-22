import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall, Mic, Volume2, Play, Pause, Copy, Check, Radio
} from 'lucide-react';

const VOICE_PROFILES = [
  { id: 'archon_baritone', label: 'Archon Sovereign (Piper ONNX Low-Latency)', pitch: 0.92, rate: 1.04, accent: '#D4AF37' },
  { id: 'nyx_tactical', label: 'Nyx Tactical Ops (Whisper + Kokoro 82M)', pitch: 1.08, rate: 1.12, accent: '#22D3EE' },
  { id: 'hermes_concierge', label: 'Hermes Executive Dispatch (24kHz Neural)', pitch: 1.0, rate: 1.0, accent: '#10B981' }
];

const BRAILLE_WAVE = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AgentVoiceCallGodModeTool() {
  const [voiceId, setVoiceId] = useState('archon_baritone');
  const [utterance, setUtterance] = useState('Sovereign voice link established on loopback port 8109. Zero external cloud audio telemetry.');
  const [vadThreshold, setVadThreshold] = useState(0.42);
  const [running, setRunning] = useState(true);
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
      if (running) t += 0.035 * activeVoice.rate;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 340;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, cw, ch);

      const cols = 48;
      const rows = 18;
      const cellW = cw / cols;
      const cellH = ch / rows;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < cols; c++) {
        const nx = (c / cols) * 2 - 1;
        const env = Math.exp(-nx * nx * 2.2);
        const harm = Math.abs(
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

      // VAD threshold horizon lines
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

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`VOICE_DUPLEX // ${activeVoice.label.toUpperCase()} // VAD=${vadThreshold.toFixed(2)}`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [voiceId, vadThreshold, running, activeVoice]);

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
      utteranceBuffer: utterance
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
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#07080e] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0b0d16] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4AF37] font-bold">
                Full-Duplex Agent Voice &amp; Acoustic Bridge
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                WHISPER STT + PIPER ONNX
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              60fps Braille acoustic spectrogram, Silero VAD gate &amp; WebSpeech synthesis test
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={speakInBrowser}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Synthesize Audio Now
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F5E6AB] border border-[#D4AF37]/40 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy SIP/Voice Config'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#05060a]">
          <canvas ref={canvasRef} className="w-full h-[340px] block" />
          <div className="p-3 border-t border-white/10 bg-[#090b13] flex flex-wrap gap-1.5">
            {VOICE_PROFILES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoiceId(v.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  voiceId === v.id
                    ? 'bg-[#D4AF37]/20 text-[#F5E6AB] border-[#D4AF37]/50 font-semibold'
                    : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[#080a12]">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Neural Utterance Script
              </label>
              <textarea
                rows={3}
                value={utterance}
                onChange={(e) => setUtterance(e.target.value)}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>SILERO VAD SENSITIVITY THRESHOLD</span>
                <span className="text-[#D4AF37]">{vadThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.85"
                step="0.01"
                value={vadThreshold}
                onChange={(e) => setVadThreshold(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-[165px]">
            {payloadConfig}
          </pre>
        </div>
      </div>
    </div>
  );
}
