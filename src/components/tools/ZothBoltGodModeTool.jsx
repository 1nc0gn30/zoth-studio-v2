import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Zoth Bolt — GodMode harness for the REAL bolt.diy fork.
 *
 * Single source of truth: ~/NullAITech/bolt.diy served by Remix/Vite on
 * 127.0.0.1:5173. Studio mounts the actual workbench in a same-origin iframe
 * via the /bolt/ proxy (vite.config.js), so it works on loopback, LAN and
 * Tailscale alike — no hardcoded 127.0.0.1 in the browser.
 *
 * This component is a thin harness around that workbench:
 *  - drives the fork through /api/webgen/control (same-origin proxied)
 *  - watches the live event bus at /api/webgen/events (SSE)
 *  - polls get_status / health for build state and preview URL
 *
 * There is no simulated preview here. The braille stand-in is retired.
 */

const CONTROL = '/api/webgen/control';
const EVENTS = '/api/webgen/events';
const HEALTH = '/api/health';
const BOLT_URL = '/bolt/';

async function control(body) {
  const res = await fetch(CONTROL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function eventSummary(ev) {
  switch (ev.type) {
    case 'CONNECTED':
      return `bus connected · ${Object.keys(ev.state?.files || {}).length} files on bridge`;
    case 'PROMPT_AND_BUILD':
      return `build requested · ${(ev.prompt || '').slice(0, 80)}${ev.model ? ` · ${ev.model}` : ''}`;
    case 'SET_PROMPT':
      return `prompt set · ${(ev.prompt || '').slice(0, 80)}`;
    case 'SUBMIT':
      return 'submit dispatched';
    case 'SET_FRAMEWORK':
      return `framework → ${ev.framework}`;
    case 'SET_DESIGN_SCHEME':
      return `design scheme → ${ev.scheme || ev.presetId}`;
    case 'WRITE_FILE':
      return `write_file → ${ev.path}`;
    case 'INSERT_MEDIA_PACK':
      return `media pack → ${ev.industry} (${ev.assets?.length ?? 0} assets)`;
    default:
      return ev.type || 'event';
  }
}

export default function ZothBoltGodModeTool({ tool }) {
  const [forkUp, setForkUp] = useState(null); // null = probing
  const [booting, setBooting] = useState(false);
  const [bootLog, setBootLog] = useState('');
  const [frameKey, setFrameKey] = useState(0);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [frameworks, setFrameworks] = useState([]);
  const [framework, setFramework] = useState('');
  const [palettes, setPalettes] = useState([]);
  const [palette, setPalette] = useState('');

  const [status, setStatus] = useState(null); // get_status payload
  const [events, setEvents] = useState([]);
  const [busLive, setBusLive] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [notice, setNotice] = useState('');

  const [showFiles, setShowFiles] = useState(false);
  const [openFile, setOpenFile] = useState(null); // {path, content}
  const [toolCmd, setToolCmd] = useState('');
  const [toolOut, setToolOut] = useState(null);
  const [toolRunning, setToolRunning] = useState(false);

  const esRef = useRef(null);
  const promptRef = useRef(null);

  /* ---- fork health probe -------------------------------------------------- */
  const probe = useCallback(async () => {
    try {
      const res = await fetch(HEALTH, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      setForkUp(res.ok && (json.engine === 'bolt.diy' || json.status === 'ok'));
      return res.ok;
    } catch {
      setForkUp(false);
      return false;
    }
  }, []);

  useEffect(() => {
    probe();
    const t = setInterval(probe, 15000);
    return () => clearInterval(t);
  }, [probe]);

  /* ---- SSE: live event bus ------------------------------------------------ */
  useEffect(() => {
    if (!forkUp) return undefined;
    const es = new EventSource(EVENTS);
    esRef.current = es;
    es.onopen = () => setBusLive(true);
    es.onmessage = (msg) => {
      try {
        const ev = JSON.parse(msg.data);
        setEvents((prev) => [{ ...ev, at: Date.now() }, ...prev].slice(0, 60));
        if (ev.type === 'CONNECTED' && ev.state) {
          setStatus((prev) => ({
            ...(prev || {}),
            isStreaming: ev.state.isStreaming,
            previewUrl: ev.state.previewUrl,
            fileCount: Object.keys(ev.state.files || {}).length,
            files: Object.keys(ev.state.files || {}),
            lastPrompt: ev.state.lastPrompt,
          }));
        }
      } catch {
        /* keepalive comment or malformed frame — ignore */
      }
    };
    es.onerror = () => setBusLive(false);
    return () => {
      es.close();
      esRef.current = null;
      setBusLive(false);
    };
  }, [forkUp, frameKey]);

  /* ---- status poll while mounted ------------------------------------------ */
  const refreshStatus = useCallback(async () => {
    try {
      const { ok, json } = await control({ action: 'get_status' });
      if (ok && json.success) setStatus(json);
    } catch {
      /* fork busy — next tick retries */
    }
  }, []);

  useEffect(() => {
    if (!forkUp) return undefined;
    refreshStatus();
    const t = setInterval(refreshStatus, 6000);
    return () => clearInterval(t);
  }, [forkUp, refreshStatus]);

  /* ---- design catalog ------------------------------------------------------ */
  useEffect(() => {
    if (!forkUp) return;
    (async () => {
      try {
        const { ok, json } = await control({ action: 'get_design_catalog' });
        if (!ok || !json.success) return;
        setFrameworks(json.frameworks || []);
        setPalettes(json.palettes || []);
        if ((json.frameworks || []).length && !framework) {
          setFramework(json.frameworks[0].id || json.frameworks[0].name || '');
        }
      } catch {
        /* catalog optional — workbench has its own */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forkUp]);

  /* ---- actions ------------------------------------------------------------- */
  const bootFork = useCallback(async () => {
    setBooting(true);
    setBootLog('Requesting supervisor boot…');
    try {
      const res = await fetch('/api/studio/supervisor/boot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'bolt' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `boot failed (${res.status})`);
      setBootLog('Fork booting — Remix/Vite dev server takes ~10–30s…');
      for (let i = 0; i < 40; i += 1) {
        await new Promise((r) => setTimeout(r, 2000));
        if (await probe()) {
          setBootLog('');
          setFrameKey((k) => k + 1);
          setBooting(false);
          return;
        }
      }
      setBootLog('Boot timed out. Start it manually: cd ~/NullAITech/bolt.diy && npm run dev -- --port 5173');
    } catch (err) {
      setBootLog(String(err.message || err));
    }
    setBooting(false);
  }, [probe]);

  const dispatchBuild = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      promptRef.current?.focus();
      return;
    }
    setDispatching(true);
    setNotice('');
    try {
      const body = { action: 'prompt_and_build', prompt: text };
      if (framework) body.template = framework;
      const { ok, json } = await control(body);
      if (!ok) throw new Error(json.error || `control returned ${json.status || 'error'}`);
      if (!json.clientsNotified) {
        setNotice('No Bolt workbench is connected to the bus — open the workbench below so it can execute the build.');
      } else {
        setNotice(`Dispatched to ${json.clientsNotified} connected workbench client${json.clientsNotified > 1 ? 's' : ''}.`);
      }
      refreshStatus();
    } catch (err) {
      setNotice(`Dispatch failed: ${err.message || err}`);
    }
    setDispatching(false);
  }, [prompt, framework, refreshStatus]);

  const applyPalette = useCallback(
    async (id) => {
      setPalette(id);
      if (!id) return;
      const scheme = palettes.find((p) => (p.id || p.name) === id);
      try {
        await control({ action: 'apply_design_preset', presetId: id, scheme });
      } catch {
        /* non-fatal */
      }
    },
    [palettes],
  );

  const readFileFromBridge = useCallback(async (path) => {
    try {
      const { ok, json } = await control({ action: 'read_file', path });
      if (ok && json.success) setOpenFile({ path, content: json.content });
      else setOpenFile({ path, content: `// ${json.error || 'file not available on the bridge'}` });
    } catch (err) {
      setOpenFile({ path, content: `// read failed: ${err.message || err}` });
    }
  }, []);

  const runTool = useCallback(async () => {
    const cmd = toolCmd.trim();
    if (!cmd) return;
    setToolRunning(true);
    setToolOut(null);
    try {
      const { ok, json } = await control({ action: 'run_tool', command: cmd, timeout: 45000 });
      if (!ok && !json.command) throw new Error(json.error || 'run_tool failed');
      setToolOut(json);
    } catch (err) {
      setToolOut({ success: false, output: String(err.message || err), exitCode: 1 });
    }
    setToolRunning(false);
  }, [toolCmd]);

  /* ---- render -------------------------------------------------------------- */
  const streaming = Boolean(status?.isStreaming);
  const fileCount = status?.fileCount ?? 0;
  const previewUrl = status?.previewUrl || '';

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col gap-3 bg-[#07080d] p-3 text-zinc-200">
      {/* header */}
      <header className="flex flex-wrap items-center gap-2 rounded-lg border border-[#d4af37]/25 bg-[#0c0e16] px-3 py-2">
        <span className="text-base" aria-hidden="true">⚡</span>
        <h2 className="text-sm font-semibold tracking-wide text-[#d4af37]">
          ZOTH BOLT <span className="font-normal text-zinc-400">· bolt.diy fork · :5173</span>
        </h2>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
              forkUp === null
                ? 'border-zinc-600 text-zinc-400'
                : forkUp
                  ? 'border-emerald-500/40 text-emerald-400'
                  : 'border-red-500/40 text-red-400'
            }`}
            role="status"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${forkUp ? 'bg-emerald-400' : forkUp === false ? 'bg-red-400' : 'bg-zinc-500'}`} />
            {forkUp === null ? 'probing…' : forkUp ? 'fork live' : 'fork down'}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${busLive ? 'border-[#d4af37]/40 text-[#d4af37]' : 'border-zinc-600 text-zinc-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${busLive ? 'bg-[#d4af37]' : 'bg-zinc-600'}`} />
            bus {busLive ? 'live' : 'idle'}
          </span>
          {streaming && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 px-2 py-0.5 text-sky-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              building…
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setFrameLoaded(false);
              setFrameKey((k) => k + 1);
              probe();
            }}
            className="rounded border border-zinc-600 px-2 py-0.5 text-zinc-300 hover:border-[#d4af37]/60 hover:text-[#d4af37]"
          >
            Reload workbench
          </button>
          <a
            href={BOLT_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-zinc-600 px-2 py-0.5 text-zinc-300 hover:border-[#d4af37]/60 hover:text-[#d4af37]"
          >
            Open full ↗
          </a>
        </div>
      </header>

      {/* fork offline banner */}
      {forkUp === false && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm">
          <span>The bolt.diy fork is not answering on :5173.</span>
          <button
            type="button"
            onClick={bootFork}
            disabled={booting}
            className="rounded bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black hover:bg-[#e6c65a] disabled:opacity-50"
          >
            {booting ? 'Booting…' : 'Boot fork via supervisor'}
          </button>
          {bootLog && <span className="text-xs text-zinc-400">{bootLog}</span>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        {/* workbench embed — the real fork */}
        <section
          aria-label="Zoth Bolt workbench"
          className="relative min-h-[380px] flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-black lg:min-h-0"
        >
          {forkUp !== false ? (
            <>
              {!frameLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#07080d] text-sm text-zinc-500">
                  <span className="animate-pulse">Loading bolt.diy workbench…</span>
                </div>
              )}
              <iframe
                key={frameKey}
                src={BOLT_URL}
                title="Zoth Bolt — bolt.diy workbench"
                onLoad={() => setFrameLoaded(true)}
                className="h-full w-full border-0"
                allow="clipboard-read; clipboard-write; cross-origin-isolated"
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-500">
              <span className="text-2xl" aria-hidden="true">⚡</span>
              <p>Workbench offline. Boot the fork to load the real bolt.diy UI here.</p>
              <code className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-400">
                cd ~/NullAITech/bolt.diy && npm run dev -- --port 5173
              </code>
            </div>
          )}
        </section>

        {/* harness rail */}
        <aside className="flex w-full flex-col gap-3 overflow-y-auto lg:w-[360px] lg:shrink-0" aria-label="Bolt harness controls">
          {/* prompt dispatch */}
          <div className="rounded-lg border border-zinc-800 bg-[#0c0e16] p-3">
            <label htmlFor="bolt-prompt" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Dispatch build
            </label>
            <textarea
              id="bolt-prompt"
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') dispatchBuild();
              }}
              rows={3}
              placeholder="Describe the site or app to build… (Ctrl+Enter to dispatch)"
              className="w-full resize-y rounded border border-zinc-700 bg-[#07080d] p-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-[#d4af37]/60 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                aria-label="Framework"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-[#07080d] px-2 py-1 text-xs text-zinc-300 focus:border-[#d4af37]/60 focus:outline-none"
              >
                {frameworks.length === 0 && <option value="">default framework</option>}
                {frameworks.map((f) => (
                  <option key={f.id || f.name} value={f.id || f.name}>
                    {f.name || f.id}
                  </option>
                ))}
              </select>
              <select
                aria-label="Color palette"
                value={palette}
                onChange={(e) => applyPalette(e.target.value)}
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-[#07080d] px-2 py-1 text-xs text-zinc-300 focus:border-[#d4af37]/60 focus:outline-none"
              >
                <option value="">palette…</option>
                {palettes.map((p) => (
                  <option key={p.id || p.name} value={p.id || p.name}>
                    {p.name || p.id}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={dispatchBuild}
              disabled={dispatching || forkUp === false}
              className="mt-2 w-full rounded bg-[#d4af37] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#e6c65a] disabled:opacity-50"
            >
              {dispatching ? 'Dispatching…' : '⚡ Prompt & build'}
            </button>
            {notice && <p className="mt-2 text-xs text-zinc-400">{notice}</p>}
          </div>

          {/* live state */}
          <div className="rounded-lg border border-zinc-800 bg-[#0c0e16] p-3 text-xs">
            <h3 className="mb-2 font-semibold uppercase tracking-wider text-zinc-400">Bridge state</h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-zinc-300">
              <dt className="text-zinc-500">Clients</dt>
              <dd>{status?.connectedClients ?? '—'}</dd>
              <dt className="text-zinc-500">Files</dt>
              <dd>{fileCount}</dd>
              <dt className="text-zinc-500">Streaming</dt>
              <dd>{streaming ? 'yes' : 'no'}</dd>
              <dt className="text-zinc-500">Preview</dt>
              <dd className="truncate">
                {previewUrl ? (
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline">
                    open ↗
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </dl>
            {status?.lastPrompt && (
              <p className="mt-2 line-clamp-2 border-t border-zinc-800 pt-2 text-zinc-500">
                last: {status.lastPrompt}
              </p>
            )}
            {fileCount > 0 && (
              <div className="mt-2 border-t border-zinc-800 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFiles((v) => !v)}
                  className="text-[#d4af37] hover:underline"
                  aria-expanded={showFiles}
                >
                  {showFiles ? 'Hide' : 'Show'} {fileCount} synced files
                </button>
                {showFiles && (
                  <ul className="mt-1 max-h-36 space-y-0.5 overflow-y-auto font-mono text-[11px]">
                    {(status?.files || []).map((f) => (
                      <li key={f}>
                        <button
                          type="button"
                          onClick={() => readFileFromBridge(f)}
                          className="w-full truncate text-left text-zinc-400 hover:text-[#d4af37]"
                          title={`Read ${f} from bridge`}
                        >
                          {f}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* file viewer */}
          {openFile && (
            <div className="rounded-lg border border-zinc-800 bg-[#0c0e16] p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-[#d4af37]">{openFile.path}</span>
                <button type="button" onClick={() => setOpenFile(null)} className="text-xs text-zinc-500 hover:text-zinc-300" aria-label="Close file viewer">
                  ✕
                </button>
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-[#07080d] p-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                {openFile.content}
              </pre>
            </div>
          )}

          {/* tool runner — fork runs local CLI tools */}
          <div className="rounded-lg border border-zinc-800 bg-[#0c0e16] p-3">
            <label htmlFor="bolt-tool" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Run tool on fork host
            </label>
            <div className="flex gap-2">
              <input
                id="bolt-tool"
                value={toolCmd}
                onChange={(e) => setToolCmd(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runTool()}
                placeholder="e.g. zoth-webgen --help"
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-[#07080d] px-2 py-1 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-[#d4af37]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={runTool}
                disabled={toolRunning || forkUp === false}
                className="rounded border border-[#d4af37]/50 px-2 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-50"
              >
                {toolRunning ? '…' : 'Run'}
              </button>
            </div>
            {toolOut && (
              <div className="mt-2">
                <p className={`text-[11px] ${toolOut.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  exit {toolOut.exitCode} · {toolOut.durationMs != null ? `${toolOut.durationMs}ms` : ''}
                </p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[#07080d] p-2 font-mono text-[11px] text-zinc-300">
                  {toolOut.output || '(no output)'}
                </pre>
              </div>
            )}
          </div>

          {/* event log */}
          <div className="rounded-lg border border-zinc-800 bg-[#0c0e16] p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Event bus {busLive ? '· live' : ''}
            </h3>
            {events.length === 0 ? (
              <p className="text-xs text-zinc-600">No events yet — dispatch a build or open the workbench.</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto text-[11px]" aria-live="polite">
                {events.map((ev, i) => (
                  <li key={`${ev.at}-${i}`} className="flex gap-2 border-b border-zinc-800/60 pb-1">
                    <span className="shrink-0 font-mono text-zinc-600">{fmtTime(ev.at)}</span>
                    <span className="text-zinc-300">{eventSummary(ev)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <footer className="text-[11px] text-zinc-600">
        {tool?.name || 'Zoth Bolt'} · source of truth: ~/NullAITech/bolt.diy (Remix/Vite :5173) · embedded same-origin via /bolt/ proxy
      </footer>
    </div>
  );
}
