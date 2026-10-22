import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Play, Pause, Copy, Check, Layers, Terminal, Cpu, Box as BoxIcon
} from 'lucide-react';

const FOUNDRY_MODES = {
  'zoth-webgen': {
    title: 'Zoth WebGen Autonomous Site Foundry',
    subtitle: '6-Archetype Full-Stack Compiler with Schema.org AEO & Triple-Viewport Guardrails',
    accent: '#D4AF37',
    glyphs: ' ·,:;+*?%S#@'
  },
  'zoth-swarm-multiplexer': {
    title: 'Zoth Swarm Daemon Multiplexer',
    subtitle: '22-Daemon Loopback PTY Multiplexer & Byzantine Quorum Bus (:8094–:8121)',
    accent: '#22D3EE',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿'
  },
  'zoth-civilization': {
    title: 'Zoth Multi-Agent Civilization Engine',
    subtitle: 'Emergent Autonomous Agent Society, Resource Ledger & Consensus Simulation',
    accent: '#10B981',
    glyphs: ' ·░▒▓█'
  },
  'vision-gesture-control': {
    title: 'Vision 21-Joint 3D Spatial Hand Tracker',
    subtitle: 'Sub-15ms MediaPipe Skeletal Kinematics & Air-Canvas MCP Bridge',
    accent: '#A855F7',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿'
  },
  'likeness-desk': {
    title: 'Likeness Desk Identity & Rights Vault',
    subtitle: 'Cryptographic Biometric Consent Ledger & Perceptual Hash Watermarker',
    accent: '#EC4899',
    glyphs: ' .01379ACEF#'
  },
  'bolt-diy': {
    title: 'Bolt.DIY Local Full-Stack Sandbox',
    subtitle: 'Air-Gapped WebContainer & Local Ollama Code Generation Workbench',
    accent: '#F59E0B',
    glyphs: ' ·,:;+*?%S#@'
  },
  'city-desk': {
    title: 'City Desk 1,000-Page Programmatic Trade & Geo Engine',
    subtitle: 'Static Trade × City AEO Matrix, Schema.org LocalBusiness Graph & Zero-Bloat Navbar',
    accent: '#10B981',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿'
  }
};

export default function ZothFoundryGodModeTool({ tool }) {
  const slug = tool?.id || 'zoth-webgen';
  const mode = FOUNDRY_MODES[slug] || {
    title: `${tool?.name || 'Sovereign Foundry'} God-Mode Studio`,
    subtitle: 'Deterministic 60fps ASCII/Vector Synthesizer & Autonomous Artifact Compiler',
    accent: '#D4AF37',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿'
  };

  const [density, setDensity] = useState(52);
  const [harmonic, setHarmonic] = useState(3.0);
  const [directive, setDirective] = useState(
    `Compile production artifact for ${tool?.name || 'Sovereign Foundry'} with zero console errors and verified contact metadata`
  );
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      if (running) t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 350;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05060b';
      ctx.fillRect(0, 0, cw, ch);

      const cols = density;
      const rows = Math.max(16, Math.round(cols * (ch / cw) * 0.55));
      const cellW = cw / cols;
      const cellH = ch / rows;
      const ramp = mode.glyphs;

      ctx.font = `600 ${Math.max(8, Math.floor(cellH * 0.88))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        const ny = (r / (rows - 1)) * 2 - 1;
        for (let c = 0; c < cols; c++) {
          const nx = ((c / (cols - 1)) * 2 - 1) * (cw / ch) * 0.75;
          const dist = Math.hypot(nx, ny);
          const ang = Math.atan2(ny, nx);
          const v = Math.max(
            0,
            Math.min(
              0.99,
              0.48 +
                0.35 * Math.cos(dist * 11 - t * 3.4 + Math.sin(ang * harmonic)) +
                0.22 * Math.sin(nx * 6 * harmonic + t * 2.1)
            )
          );
          const idx = Math.floor(v * ramp.length);
          if (idx > 0) {
            ctx.fillStyle = v > 0.78 ? '#FFFBEB' : mode.accent;
            ctx.globalAlpha = 0.16 + v * 0.82;
            ctx.fillText(ramp[idx], c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
            ctx.globalAlpha = 1;
          }
        }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`FOUNDRY_CORE // ${slug.toUpperCase()} // ${cols}x${rows} MATRIX`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [density, harmonic, running, mode.accent, mode.glyphs, slug]);

  const manifest = JSON.stringify(
    {
      workstation: slug,
      title: mode.title,
      operator: 'Neal Frazier (Neal Frazier Tech)',
      directPhone: '(555) 555-0199',
      dispatchEmail: 'neal@nealfrazier.tech',
      gridMatrix: `${density} cols`,
      harmonicOrder: harmonic,
      directive
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(manifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#07080e] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0b0d16] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4AF37] font-bold">
                {mode.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                60 FPS SOVEREIGN CORE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{mode.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5"
          >
            {running ? <Pause className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {running ? 'Pause Shader' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F5E6AB] border border-[#D4AF37]/40 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Manifest Copied' : 'Export Foundry Spec'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#05060b]">
          <canvas ref={canvasRef} className="w-full h-[350px] block" />
        </div>

        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[#080a12]">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Foundry Execution Directive
              </label>
              <textarea
                rows={2}
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>ASCII MATRIX DENSITY</span>
                <span className="text-[#D4AF37]">{density} cols</span>
              </div>
              <input
                type="range"
                min="36"
                max="84"
                step="2"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>SYMMETRY HARMONIC ORDER</span>
                <span className="text-[#D4AF37]">{harmonic.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={harmonic}
                onChange={(e) => setHarmonic(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-[155px]">
            {manifest}
          </pre>
        </div>
      </div>
    </div>
  );
}
