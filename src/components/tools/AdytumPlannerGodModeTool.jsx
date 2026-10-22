import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, Play, Pause, Copy, Check, Sparkles, Terminal, Layers, ShieldCheck
} from 'lucide-react';

const HERMETIC_KEYS = [
  { key: 0, arcana: '0 · The Fool (Aleph)', phase: 'Zero-State Intention', gate: 'Air / Pneuma', prompt: 'Strip all inherited assumptions; define the irreducible sovereign objective.' },
  { key: 1, arcana: 'I · The Magician (Beth)', phase: 'Tool & Will Alignment', gate: 'Mercury / Logos', prompt: 'Bind local CLI tools, MCP endpoints, and hardware compute to the single intention.' },
  { key: 7, arcana: 'VII · The Chariot (Cheth)', phase: 'Deterministic Execution Vector', gate: 'Cancer / Armor', prompt: 'Lock the execution harness into a bounded, zero-drift trajectory with verify gates.' },
  { key: 9, arcana: 'IX · The Hermit (Yod)', phase: 'Air-Gapped Incubation', gate: 'Virgo / Lantern', prompt: 'Isolate the reasoning loop inside loopback silicon (127.0.0.1) with zero external egress.' },
  { key: 11, arcana: 'XI · Justice (Lamed)', phase: 'Invariant Equilibrium Audit', gate: 'Libra / Scales', prompt: 'Verify mathematical invariants, memory safety, and cryptographic proofs before commit.' },
  { key: 21, arcana: 'XXI · The World (Tau)', phase: 'Manifestation & Seal', gate: 'Saturn / Crown', prompt: 'Seal the compiled artifact, emit deterministic SHA-256 manifest, and close the rite.' }
];

const BRAILLE_RAMP = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AdytumPlannerGodModeTool() {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [intention, setIntention] = useState('Architect zero-egress Byzantine consensus enclave with deterministic local verification');
  const [incubationDepth, setIncubationDepth] = useState(5);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const activeKey = HERMETIC_KEYS[selectedIdx] || HERMETIC_KEYS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const sephiroth = [
      { id: 'Kether', x: 0.5, y: 0.12 },
      { id: 'Chokmah', x: 0.76, y: 0.24 },
      { id: 'Binah', x: 0.24, y: 0.24 },
      { id: 'Chesed', x: 0.76, y: 0.45 },
      { id: 'Geburah', x: 0.24, y: 0.45 },
      { id: 'Tiphereth', x: 0.5, y: 0.52 },
      { id: 'Netzach', x: 0.76, y: 0.68 },
      { id: 'Hod', x: 0.24, y: 0.68 },
      { id: 'Yesod', x: 0.5, y: 0.78 },
      { id: 'Malkuth', x: 0.5, y: 0.91 }
    ];

    const paths = [
      [0, 1], [0, 2], [0, 5], [1, 2], [1, 3], [1, 5], [2, 4], [2, 5],
      [3, 4], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8],
      [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [8, 9]
    ];

    const render = () => {
      if (running) t += 0.018;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#06050a';
      ctx.fillRect(0, 0, cw, ch);

      // Background ASCII Braille sacred standing wave
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 38;
      const rows = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx, ny);
          const wave = 0.5 + 0.5 * Math.cos(dist * 10 - t * 2.4 + selectedIdx);
          const idx = Math.min(BRAILLE_RAMP.length - 1, Math.floor(wave * BRAILLE_RAMP.length));
          if (idx > 1) {
            ctx.fillStyle = `rgba(212, 175, 55, ${(wave * 0.22).toFixed(2)})`;
            ctx.fillText(BRAILLE_RAMP[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      // Draw 22 Hermetic Paths
      paths.forEach(([a, b], i) => {
        const na = sephiroth[a];
        const nb = sephiroth[b];
        const x1 = na.x * cw, y1 = na.y * ch;
        const x2 = nb.x * cw, y2 = nb.y * ch;
        const isActive = (i % HERMETIC_KEYS.length) === selectedIdx;

        ctx.strokeStyle = isActive ? 'rgba(212, 175, 55, 0.85)' : 'rgba(168, 85, 247, 0.24)';
        ctx.lineWidth = isActive ? 2.2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Traveling photon pulse
        const p = (t * 0.65 + i * 0.13) % 1;
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        ctx.fillStyle = isActive ? '#F5E6AB' : '#A855F7';
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 3.2 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw 10 Sephiroth nodes
      sephiroth.forEach((node, idx) => {
        const x = node.x * cw;
        const y = node.y * ch;
        const pulse = 1 + 0.14 * Math.sin(t * 3 + idx);

        ctx.fillStyle = '#090812';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, 11 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F5E6AB';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(node.id.toUpperCase(), x, y - 17);
      });

      ctx.fillStyle = 'rgba(245, 230, 171, 0.7)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ADYTUM // 22-KEY HERMETIC RITE // KEY [${activeKey.arcana.toUpperCase()}]`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedIdx, running, activeKey.arcana]);

  const artifactJson = JSON.stringify(
    {
      protocol: 'adytum.hermetic.rite.v1',
      selectedArcana: activeKey.arcana,
      alchemicalPhase: activeKey.phase,
      elementalGate: activeKey.gate,
      sovereignIntention: intention,
      incubationMinutes: incubationDepth,
      localModelGate: 'ollama://qwen2.5-coder:1.5b-instruct (127.0.0.1:11434)',
      directive: activeKey.prompt
    },
    null,
    2
  );

  const copyPlan = () => {
    navigator.clipboard?.writeText(artifactJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#07070c] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0b0b14] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4AF37] font-bold">
                Adytum 22-Key Hermetic Planning Rite
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                60 FPS TREE OF LIFE LATTICE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Deterministic intention crystallization, 5-minute incubation timer &amp; local-model gate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5"
          >
            {running ? <Pause className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {running ? 'Pause Lattice' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={copyPlan}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F5E6AB] border border-[#D4AF37]/40 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Rite Copied' : 'Export Rite Manifest'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050509]">
          <canvas ref={canvasRef} className="w-full h-[360px] block" />
          <div className="p-3 border-t border-white/10 bg-[#090912] flex flex-wrap gap-1.5">
            {HERMETIC_KEYS.map((item, idx) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  selectedIdx === idx
                    ? 'bg-[#D4AF37]/20 text-[#F5E6AB] border-[#D4AF37]/50 font-semibold'
                    : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {item.arcana}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[#090910]">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Sovereign Intention Vector
              </label>
              <textarea
                rows={2}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>INCUBATION GATE DURATION</span>
                <span className="text-[#D4AF37]">{incubationDepth} min</span>
              </div>
              <input
                type="range"
                min="1"
                max="22"
                value={incubationDepth}
                onChange={(e) => setIncubationDepth(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <div className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase">
                {activeKey.arcana} — {activeKey.phase}
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{activeKey.prompt}</p>
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-[160px]">
            {artifactJson}
          </pre>
        </div>
      </div>
    </div>
  );
}
