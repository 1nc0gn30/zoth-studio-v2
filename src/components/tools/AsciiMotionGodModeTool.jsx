import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, Play, Pause, Copy, Check, Download, Sparkles, Sliders,
  Layers, Cpu, RefreshCw, Code2, Eye
} from 'lucide-react';

const GLYPH_RAMPS = {
  ascii: {
    id: 'ascii',
    label: 'Sovereign ASCII (@#S%?*+:.)',
    chars: ' ·,:;+*?%S#@'
  },
  braille: {
    id: 'braille',
    label: 'Unicode Braille (⠁⠃⠇⠏⠟⠿⣿)',
    chars: ' ⠁⠃⠇⠏⠟⠿⣿'
  },
  blocks: {
    id: 'blocks',
    label: 'Block Density (░▒▓█)',
    chars: ' ·░▒▓█'
  },
  hex: {
    id: 'hex',
    label: 'Cyber Hex (01379CEF)',
    chars: ' .01379ACEF#'
  }
};

const SHADER_PRESETS = {
  torus4d: {
    id: 'torus4d',
    name: '4D Rotating Torus Knot',
    subtitle: 'Harmonic topological surface with dual-axis phase precession',
    accent: '#D4AF37'
  },
  merkaba: {
    id: 'merkaba',
    name: 'Sacred Merkaba Hypercube',
    subtitle: 'Counter-rotating star tetrahedron & golden ratio interference rings',
    accent: '#A855F7'
  },
  datamosh: {
    id: 'datamosh',
    name: 'CRT Datamosh Wavefront',
    subtitle: 'I-frame displacement vectors with scanline quantization',
    accent: '#EC4899'
  },
  quorum: {
    id: 'quorum',
    name: 'Byzantine Quorum Vortex',
    subtitle: '4-node consensus spiral with cryptographic phase locking',
    accent: '#22D3EE'
  },
  radar: {
    id: 'radar',
    name: 'Perimeter Radar Matrix',
    subtitle: '360° polar sweep with deterministic harmonic target pings',
    accent: '#10B981'
  },
  sigil: {
    id: 'sigil',
    name: 'ZothOS Kernel Sigil',
    subtitle: 'Standing wave lattice & sovereign enclave boundary field',
    accent: '#F59E0B'
  }
};

const SLUG_DEFAULTS = {
  'datamosh-glitch-studio': { preset: 'datamosh', ramp: 'blocks' },
  'nexus-3d-scene-studio': { preset: 'torus4d', ramp: 'ascii' },
  'ufo-sacred-geometry': { preset: 'merkaba', ramp: 'braille' },
  'cyber-turtle-studio': { preset: 'sigil', ramp: 'ascii' },
  'og-canvas-forge': { preset: 'quorum', ramp: 'braille' }
};

function evaluateField(nx, ny, t, preset, warp, freq) {
  const x = nx * freq;
  const y = ny * freq;
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);

  if (preset === 'torus4d') {
    const ring1 = Math.cos((r - 0.52 - 0.14 * Math.sin(3 * a + t * 2.1)) * 13);
    const twist = Math.sin(4 * a - t * 2.6 + r * 6 * warp);
    const core = Math.exp(-r * 2.2) * Math.cos(r * 16 - t * 4);
    return Math.max(0, Math.min(1, (ring1 * 0.5 + twist * 0.35 + core * 0.45 + 0.55)));
  }

  if (preset === 'merkaba') {
    const tri1 = Math.cos(3 * (a + t * 0.9)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const tri2 = Math.cos(3 * (a - t * 0.9 + Math.PI / 3)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const lattice = Math.sin((x * Math.cos(t * 0.5) - y * Math.sin(t * 0.5)) * 10 * warp) *
                    Math.cos((x * Math.sin(t * 0.5) + y * Math.cos(t * 0.5)) * 10 * warp);
    const center = Math.exp(-r * 3.8);
    return Math.max(0, Math.min(1, 0.48 + tri1 * 0.45 + tri2 * 0.45 + lattice * 0.25 + center * 0.4));
  }

  if (preset === 'datamosh') {
    const glitchShift = Math.sin(Math.floor((ny + 1) * 12) * 3.7 + Math.floor(t * 6)) * 0.35 * warp;
    const gx = x + glitchShift;
    const band = Math.sin(gx * 8 - t * 5) * Math.cos(y * 14 + Math.sin(t * 3) * 2);
    const macroblock = ((Math.floor((gx + 2) * 4) ^ Math.floor((y + 2) * 4)) % 5) / 5;
    return Math.max(0, Math.min(1, 0.45 + band * 0.45 + (macroblock - 0.5) * 0.35 * warp));
  }

  if (preset === 'quorum') {
    const spiral = Math.sin(r * 15 - t * 4.2 + a * 4);
    const nodes = Math.cos(a * 4 - t * 1.8) * Math.exp(-Math.abs(r - 0.58) * 5);
    const pulse = Math.exp(-r * 2.5) * (0.5 + 0.5 * Math.sin(t * 5));
    return Math.max(0, Math.min(1, 0.48 + spiral * 0.32 * warp + nodes * 0.42 + pulse * 0.3));
  }

  if (preset === 'radar') {
    const sweepAngle = (t * 2.2) % (Math.PI * 2);
    let diff = ((a - sweepAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const beam = Math.exp(-diff * 3.2) * Math.exp(-r * 0.9);
    const rings = Math.pow(Math.max(0, Math.cos(r * 16)), 6) * 0.55;
    const cross = (Math.abs(nx) < 0.035 || Math.abs(ny) < 0.035) ? 0.45 : 0;
    return Math.max(0, Math.min(1, beam * 0.85 + rings + cross));
  }

  // sigil
  const hexWave = Math.cos(6 * a + Math.sin(r * 10 - t * 3) * warp * 2);
  const seal = Math.exp(-Math.abs(r - 0.62) * 6.5) + Math.exp(-Math.abs(r - 0.32) * 7.5);
  const standing = Math.cos(r * 18 - t * 3.8) * 0.35;
  return Math.max(0, Math.min(1, 0.25 + seal * 0.55 + hexWave * 0.25 + standing));
}

export default function AsciiMotionGodModeTool({ tool }) {
  const defaultCfg = SLUG_DEFAULTS[tool?.slug] || { preset: 'torus4d', ramp: 'ascii' };
  const [preset, setPreset] = useState(defaultCfg.preset);
  const [rampKey, setRampKey] = useState(defaultCfg.ramp);
  const [cols, setCols] = useState(68);
  const [speed, setSpeed] = useState(1.0);
  const [warp, setWarp] = useState(1.15);
  const [freq, setFreq] = useState(1.25);
  const [playing, setPlaying] = useState(true);
  const [asciiSnapshot, setAsciiSnapshot] = useState('');
  const [copiedMode, setCopiedMode] = useState(null);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const cfg = SLUG_DEFAULTS[tool?.slug];
    if (cfg) {
      setPreset(cfg.preset);
      setRampKey(cfg.ramp);
    }
  }, [tool?.slug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();
    let frameCounter = 0;

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) {
        timeRef.current += dt * speed;
      }
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 760;
      const ch = canvas.clientHeight || 380;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep Obsidian Void
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, cw, ch);

      const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
      const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

      const rows = Math.max(16, Math.round(cols * (ch / cw) * 0.55));
      const cellW = cw / cols;
      const cellH = ch / rows;
      const fontSize = Math.max(9, Math.min(18, Math.floor(cellH * 0.92)));

      ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textRows = [];
      const captureText = frameCounter % 12 === 0;

      for (let r = 0; r < rows; r++) {
        const ny = (r / (rows - 1)) * 2 - 1;
        let rowStr = '';
        for (let c = 0; c < cols; c++) {
          const nx = ((c / (cols - 1)) * 2 - 1) * (cw / ch) * 0.72;
          const v = evaluateField(nx, ny, t, preset, warp, freq);
          const idx = Math.min(ramp.length - 1, Math.max(0, Math.floor(v * ramp.length)));
          const chGlyph = ramp[idx];
          if (captureText) rowStr += chGlyph;

          if (idx > 0) {
            const alpha = (0.14 + v * 0.86).toFixed(2);
            if (v > 0.78) {
              ctx.fillStyle = `rgba(255, 250, 235, ${alpha})`;
            } else {
              ctx.fillStyle = activePreset.accent;
              ctx.globalAlpha = Number(alpha);
            }
            ctx.fillText(chGlyph, c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
            ctx.globalAlpha = 1;
          }
        }
        if (captureText) textRows.push(rowStr);
      }

      // Subtle CRT scanline & vignette overlay
      const grad = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.15, cw / 2, ch / 2, cw * 0.65);
      grad.addColorStop(0, 'rgba(5,5,8,0)');
      grad.addColorStop(1, 'rgba(5,5,8,0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // Top HUD telemetry stamp
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ASCII_SHADER // ${activePreset.name.toUpperCase()} // ${cols}x${rows} MATRIX // t=${t.toFixed(2)}s`,
        14,
        18
      );

      ctx.restore();

      if (captureText) {
        setAsciiSnapshot(textRows.join('\n'));
      }
      frameCounter++;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [preset, rampKey, cols, speed, warp, freq, playing]);

  const copyPayload = (mode) => {
    const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
    const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

    let text = '';
    if (mode === 'frame') {
      text = [
        `/* ZOTH STUDIO // ASCII MOTION FRAME (${activePreset.name}) */`,
        asciiSnapshot
      ].join('\n');
    } else if (mode === 'embed') {
      text = `<!-- Zoth Studio Standalone 60FPS ASCII Motion Shader (${activePreset.name}) -->
<pre id="zoth-ascii-stage" style="background:#050508;color:${activePreset.accent};font:600 11px/1.15 'JetBrains Mono',monospace;padding:20px;border-radius:12px;overflow:hidden;margin:0;"></pre>
<script>
(function(){
  const pre = document.getElementById('zoth-ascii-stage');
  const ramp = ${JSON.stringify(ramp)};
  const cols = ${Math.min(cols, 72)}, rows = 26;
  let t = 0;
  function tick(){
    t += 0.04 * ${speed};
    let out = '';
    for (let r = 0; r < rows; r++) {
      const ny = (r / (rows - 1)) * 2 - 1;
      for (let c = 0; c < cols; c++) {
        const nx = ((c / (cols - 1)) * 2 - 1) * 1.35;
        const dist = Math.hypot(nx * ${freq}, ny * ${freq});
        const ang = Math.atan2(ny, nx);
        const v = Math.max(0, Math.min(0.99, 0.5 + 0.35 * Math.cos(dist * 12 - t * 3.5) + 0.25 * Math.sin(ang * 4 + t * 2)));
        out += ramp[Math.floor(v * ramp.length)];
      }
      out += '\\n';
    }
    pre.textContent = out;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
</script>`;
    }

    navigator.clipboard?.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 1800);
  };

  const activePresetObj = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#07080d]/95 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)]">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-white/10 bg-[#0b0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
                ASCII &amp; Braille Motion Synth
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                60 FPS DETERMINISTIC
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activePresetObj.name} — {activePresetObj.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
          >
            {playing ? <Pause className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {playing ? 'Pause Field' : 'Resume Field'}
          </button>

          <button
            type="button"
            onClick={() => copyPayload('frame')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F3E5AB] border border-[#D4AF37]/40 transition"
          >
            {copiedMode === 'frame' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedMode === 'frame' ? 'ASCII Copied' : 'Copy ASCII Frame'}
          </button>

          <button
            type="button"
            onClick={() => copyPayload('embed')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 transition"
          >
            {copiedMode === 'embed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
            {copiedMode === 'embed' ? 'Snippet Copied' : 'Export HTML/JS Shader'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left 60fps ASCII Stage + Right Parameter & Matrix Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* 60fps Canvas Viewport */}
        <div className="lg:col-span-8 relative border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050508]">
          <canvas
            ref={canvasRef}
            className="w-full h-[360px] sm:h-[420px] block"
          />

          {/* Preset Selector Pill Strip */}
          <div className="p-3 bg-[#090b11]/95 border-t border-white/10 flex flex-wrap items-center gap-1.5">
            {Object.values(SHADER_PRESETS).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition border ${
                  preset === item.id
                    ? 'bg-[#D4AF37]/20 text-[#F3E5AB] border-[#D4AF37]/50 font-semibold'
                    : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Controls & Live ASCII Buffer */}
        <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[#090b10]">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Character Ramp Quantizer
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(GLYPH_RAMPS).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRampKey(r.id)}
                    className={`px-2.5 py-2 rounded-lg text-left text-[11px] font-mono border transition ${
                      rampKey === r.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#F3E5AB]'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate font-semibold">{r.label.split(' (')[0]}</div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{r.chars}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>MATRIX COLUMNS</span>
                  <span className="text-[#D4AF37]">{cols} cols</span>
                </div>
                <input
                  type="range"
                  min="42"
                  max="96"
                  step="2"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>TEMPORAL VELOCITY</span>
                  <span className="text-[#D4AF37]">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>HARMONIC WARP</span>
                  <span className="text-[#D4AF37]">{warp.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.4"
                  step="0.05"
                  value={warp}
                  onChange={(e) => setWarp(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>FIELD FREQUENCY</span>
                  <span className="text-[#D4AF37]">{freq.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.2"
                  step="0.05"
                  value={freq}
                  onChange={(e) => setFreq(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Live Raw ASCII Stream Preview */}
          <div className="rounded-xl border border-white/10 bg-[#050508] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              <span>LIVE DOM TEXT BUFFER</span>
              <span className="text-emerald-400">READY TO EMBED</span>
            </div>
            <pre className="text-[7px] leading-[7.5px] font-mono text-[#D4AF37]/80 overflow-hidden max-h-[115px] select-all">
              {asciiSnapshot}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
