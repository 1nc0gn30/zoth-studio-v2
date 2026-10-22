import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Play, Pause, Copy, Check, Terminal, GitBranch, Zap
} from 'lucide-react';

const SUBAGENTS = [
  { id: 'hermes', name: 'Hermes Agent (Copilot GPT-4o)', role: 'Autonomous Code & Refactoring', port: 8099, color: '#D4AF37' },
  { id: 'grok', name: 'Grok CLI (Fast Recon)', role: 'Rapid AST & Spec Verification', port: 8104, color: '#22D3EE' },
  { id: 'ollama', name: 'Ollama Local (Qwen2.5 1.5B)', role: 'Zero-Egress Loopback Gate', port: 11434, color: '#10B981' },
  { id: 'sentinel', name: 'Zoth Sentinel Daemon', role: 'Thermal & Memory Guard (<60°C)', port: 8112, color: '#A855F7' }
];

const ASCII_CHARS = ' ·,:;+*?%S#@';

export default function AzothArchonGodModeTool() {
  const [selectedAgent, setSelectedAgent] = useState('hermes');
  const [taskPrompt, setTaskPrompt] = useState('Audit and synthesize 60fps ASCII & Braille motion shaders across sovereign workspaces');
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const activeObj = SUBAGENTS.find((a) => a.id === selectedAgent) || SUBAGENTS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      if (running) t += 0.024;
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

      const cx = cw * 0.5;
      const cy = ch * 0.52;

      // ASCII field ring around Archon hub
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 42, rows = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx * 1.3, ny);
          const ang = Math.atan2(ny, nx);
          const v = 0.5 + 0.45 * Math.cos(dist * 12 - t * 3 + ang * concurrency);
          const idx = Math.min(ASCII_CHARS.length - 1, Math.max(0, Math.floor(v * ASCII_CHARS.length)));
          if (idx > 2) {
            ctx.fillStyle = `rgba(212, 175, 55, ${(v * 0.22).toFixed(2)})`;
            ctx.fillText(ASCII_CHARS[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      // Draw orbital subagents and dispatch packets
      SUBAGENTS.forEach((ag, i) => {
        const angle = (i / SUBAGENTS.length) * Math.PI * 2 + t * 0.45;
        const radX = cw * 0.31;
        const radY = ch * 0.31;
        const ax = cx + Math.cos(angle) * radX;
        const ay = cy + Math.sin(angle) * radY;
        const isSel = ag.id === selectedAgent;

        ctx.strokeStyle = isSel ? ag.color : 'rgba(255,255,255,0.16)';
        ctx.lineWidth = isSel ? 2.2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Packet stream
        const p = (t * 1.1 + i * 0.25) % 1;
        const px = cx + (ax - cx) * p;
        const py = cy + (ay - cy) * p;
        ctx.fillStyle = ag.color;
        ctx.beginPath();
        ctx.arc(px, py, isSel ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = '#090c15';
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = isSel ? 2.5 : 1.4;
        ctx.beginPath();
        ctx.arc(ax, ay, isSel ? 22 : 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillText(ag.id.toUpperCase(), ax, ay - 2);
        ctx.fillStyle = ag.color;
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillText(`:${ag.port}`, ax, ay + 9);
      });

      // Center Archon Kernel
      ctx.fillStyle = '#0d101b';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F5E6AB';
      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.fillText('AZOTH', cx, cy - 4);
      ctx.fillStyle = '#34D399';
      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.fillText('ARCHON v3', cx, cy + 8);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`AZOTH_ORCHESTRATOR // ENGINE=${selectedAgent.toUpperCase()} // WORKERS=${concurrency} // NICE=10`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedAgent, concurrency, running]);

  const cliCommand = `nice -n 10 ~/NullAITech/bin/zoth-agent-conductor dispatch --engine ${selectedAgent} --dir ~/NullAITech "${taskPrompt.replace(/"/g, '\\"')}"`;

  const copyCmd = () => {
    navigator.clipboard?.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#07080e] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0b0d16] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4AF37] font-bold">
                AZOTH Local Archon Orchestrator
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ZERO-TELEMETRY DISPATCH DAG
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-agent loopback dispatcher for Hermes, Grok CLI, and local Ollama models
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
            {running ? 'Pause DAG' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={copyCmd}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F5E6AB] border border-[#D4AF37]/40 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Dispatch CLI Copied' : 'Copy Dispatch Command'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#05060b]">
          <canvas ref={canvasRef} className="w-full h-[350px] block" />
          <div className="p-3 border-t border-white/10 bg-[#090b13] flex flex-wrap gap-1.5">
            {SUBAGENTS.map((ag) => (
              <button
                key={ag.id}
                type="button"
                onClick={() => setSelectedAgent(ag.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  selectedAgent === ag.id
                    ? 'bg-[#D4AF37]/20 text-[#F5E6AB] border-[#D4AF37]/50 font-semibold'
                    : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {ag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[#080a12]">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Subagent Dispatch Directive
              </label>
              <textarea
                rows={2}
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>SWARM WORKER CONCURRENCY</span>
                <span className="text-[#D4AF37]">{concurrency} threads</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[11px] font-mono font-bold text-[#F5E6AB]">
                Active Engine: {activeObj.name} (127.0.0.1:{activeObj.port})
              </div>
              <p className="text-xs text-zinc-400 mt-1">{activeObj.role}</p>
            </div>
          </div>

          <div className="rounded-xl bg-black/70 border border-white/10 p-3">
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Sovereign Conductor CLI Invocation
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap break-all">
              $ {cliCommand}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
