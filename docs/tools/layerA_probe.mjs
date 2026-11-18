#!/usr/bin/env node
/**
 * Layer A interactive-quality probe (zero-dep CDP, system Chrome).
 * For each route: loads the page, enumerates every interactive control,
 * issues a REAL mouse click at its centre (occlusion-aware), and classifies
 * the outcome as request | dom-change | no-op | disabled | link | occluded.
 * Non-GET requests are stubbed so the review never mutates backend state.
 *
 *   node layerA_probe.mjs --base http://127.0.0.1:8148 --routes / /mobile --out report.json
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const vals = [];
  for (let j = i + 1; j < args.length && !args[j].startsWith('--'); j++) vals.push(args[j]);
  return vals.length ? vals : true;
};
const BASE = String(opt('base', ['http://127.0.0.1:8148'])[0]).replace(/\/$/, '');
const ROUTES = opt('routes', ['/']);
const OUT = opt('out', [path.join(os.homedir(), '.hermes/cache/scratch/layerA_pixelcast.json')])[0];
const VW = 1440, VH = 900;
const PORT = 9300 + Math.floor(Math.random() * 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn('google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-proxy-server',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  `--window-size=${VW},${VH}`, '--mute-audio', '--renderer-process-limit=2',
  `--user-data-dir=/tmp/layerA-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

let ws; let seq = 0; const pending = new Map(); let errors = []; let dialogs = [];
const callTimeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('cdp-timeout')), ms));
async function connect() {
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* booting */ }
    if (!ws) await sleep(200);
  }
  if (!ws) throw new Error('no page target');
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push('console.error: ' + m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '));
    }
    if (m.method === 'Page.javascriptDialogOpening') {
      dialogs.push({ type: m.params.type, message: String(m.params.message || '').slice(0, 120) });
      try { ws.send(JSON.stringify({ id: ++seq, method: 'Page.handleJavaScriptDialog', params: { accept: false } })); } catch {}
    }
  });
}
const send = (method, params = {}) => Promise.race([
  new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); }),
  callTimeout(20000).catch((e) => { return { __timeout: true, method }; }),
]);
const evaluate = async (expr, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
  if (r.result?.exceptionDetails) return { __err: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r.result?.result?.value;
};

const HOOK = `
window.__pcCalls = [];
window.__pcErr = [];
if (!window.__pcHooked) {
  window.__pcHooked = true;
  const _f = window.fetch;
  window.fetch = function () {
    let u = '', m = 'GET', b = null;
    const a0 = arguments[0];
    if (typeof a0 === 'string') u = a0; else if (a0 && a0.url) { u = a0.url; m = (a0.method || 'GET'); }
    const o = arguments[1] || {};
    if (o.method) m = o.method;
    if (o.body) b = String(o.body).slice(0, 160);
    window.__pcCalls.push({ u: u, m: m.toUpperCase(), b: b, t: Date.now() });
    if (m.toUpperCase() !== 'GET') {
      return Promise.resolve(new Response(JSON.stringify({ ok: true, review_stub: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return _f.apply(this, arguments).catch((e) => { window.__pcErr.push(String(e && e.message || e)); throw e; });
  };
  const _o = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) { window.__pcCalls.push({ u: u, m: String(m).toUpperCase(), via: 'xhr', t: Date.now() }); return _o.apply(this, arguments); };
  window.__pcEl = null;
  window.__pcClickTargets = [];
  document.addEventListener('click', function (e) {
    const t = e.target;
    const c = t && t.closest ? t.closest('button,input,select,textarea,a[href],[role=button],[onclick],canvas,summary') : null;
    const all = [...document.querySelectorAll('button,input,select,textarea,a[href],[role=button],[onclick],canvas,summary')];
    window.__pcClickTargets.push({
      t: Date.now(), idx: c ? all.indexOf(c) : -1,
      tag: (t && t.tagName || '').toLowerCase(), id: (t && t.id) || '', cls: String((t && t.className) || '').slice(0, 40),
      own: !!(window.__pcEl && c && (c === window.__pcEl || window.__pcEl.contains(c))),
      owner: c ? (c.tagName.toLowerCase() + '#' + (c.id || '') + (c.dataset && c.dataset.key ? '[dk=' + c.dataset.key + ']' : '')) : (t ? t.tagName.toLowerCase() + '#none' : 'null')
    });
  }, true);
}`;

const FP = `(() => {
  const t = document.body ? (document.body.innerText || '') : '';
  let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return JSON.stringify({
    body: document.body ? document.body.className : '',
    textHash: h, textLen: t.length,
    disabled: [...document.querySelectorAll('button')].map((b) => (b.disabled ? 1 : 0)).join(''),
    canvas: [...document.querySelectorAll('canvas')].map((c) => c.width + 'x' + c.height),
    overlays: [...document.querySelectorAll('.modal,.overlay,.paywall,[data-lock]')].filter((e) => getComputedStyle(e).display !== 'none').length,
    storage: Object.keys(localStorage).length,
    url: location.href
  });
})()`;

const SEL = 'button,input,select,textarea,a[href],[role=button],[onclick],canvas,summary';
const ENUM = `(() => {
  const sel = '${SEL}';
  const els = [...document.querySelectorAll(sel)];
  return els.map((e, i) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return {
      i: i, tag: e.tagName.toLowerCase(), id: e.id || '', cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60),
      label: (e.innerText || e.value || e.getAttribute('title') || e.getAttribute('aria-label') || e.getAttribute('placeholder') || '').trim().replace(/\\s+/g, ' ').slice(0, 46),
      dataKey: e.dataset ? (e.dataset.key || '') : '', href: e.getAttribute('href') || '',
      type: e.getAttribute('type') || '', disabled: !!e.disabled,
      visible: !!(e.offsetParent !== null || e.tagName === 'CANVAS') && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none',
      w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2)
    };
  });
})()`;

async function review(route) {
  errors = []; dialogs = [];
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Page.navigate', { url: BASE + route });
  await sleep(1800);
  await evaluate(HOOK);
  const overall = await evaluate(`(() => ({
    overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    title: document.title, controls: document.querySelectorAll('button,input,select,textarea,a[href],[role=button],canvas').length,
    blurLocked: [...document.querySelectorAll('*')].filter((e) => /blur\\(/.test(getComputedStyle(e).filter) && e.getBoundingClientRect().width > 200).length,
    paywallText: /paywall|unlock|subscribe|license key|trial expired/i.test(document.body.innerText),
    bodyBlur: getComputedStyle(document.body).filter
  }))()`);

  const controls = await evaluate(ENUM);
  // ambient baseline: learn the polling signatures the app fires on its own
  const ambientSigs = new Set();
  for (let k = 0; k < 5; k++) {
    await evaluate('window.__pcCalls = []');
    await sleep(800);
    ((await evaluate('window.__pcCalls')) || []).forEach((x) => ambientSigs.add(x.m + ' ' + x.u));
  }
  const stageGeom = await evaluate(`(() => { const s = document.querySelector('#viewportStage'); if (!s) return null; const r = s.getBoundingClientRect(); const cs = getComputedStyle(s); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), pos: cs.position, z: cs.zIndex, pe: cs.pointerEvents }; })()`);
  const results = [];
  const routeT0 = Date.now();
  for (const c of controls) {
    if (Date.now() - routeT0 > 150000) { results.push({ ...c, verdict: 'skipped-budget' }); continue; }
    if (!c.visible) { results.push({ ...c, verdict: 'hidden' }); continue; }
    if (c.tag === 'a' && c.href && !c.href.startsWith('#') && !c.href.startsWith('http://127.0.0.1')) {
      results.push({ ...c, verdict: 'external-link', note: c.href.slice(0, 80) }); continue;
    }
    // Resolve the control by IDENTITY, not by document index: the DOM mutates
    // during the sweep (app re-renders, overlays come and go), so a raw index
    // can point at an unrelated element by the time we click.
    const jq = JSON.stringify;
    const refExpr = c.id
      ? `document.getElementById(${jq(c.id)})`
      : (c.dataKey
        ? `[...document.querySelectorAll('[data-key]')].find(function (b) { return b.dataset.key === ${jq(c.dataKey)}; })`
        : `[...document.querySelectorAll('${SEL}')][${c.i}]`);
    const scroll = await evaluate(`(() => { const e = ${refExpr}; if (!e || !e.isConnected) return null; if (e.tagName.toLowerCase() !== ${jq(c.tag)} || (e.id || '') !== ${jq(c.id)} || ((e.dataset && e.dataset.key) || '') !== ${jq(c.dataKey || '')}) return { stale: 1 }; window.__pcEl = e; e.scrollIntoView({ block: 'center' }); return { ok: 1 }; })()`);
    if (!scroll) { results.push({ ...c, verdict: 'gone' }); continue; }
    if (scroll.stale) { results.push({ ...c, verdict: 'stale-ref' }); continue; }
    await sleep(180);
    const box = await evaluate(`(() => { const e = window.__pcEl; if (!e || !e.isConnected) return null; const r = e.getBoundingClientRect(); const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); const list = document.elementsFromPoint(x, y) || []; const t = list[0] || document.elementFromPoint(x, y); const own = function (n) { return !!(n && (n === e || e.contains(n) || n.contains(e))); }; const st = list.slice(0, 5).map(function (n) { return n.tagName.toLowerCase() + '#' + (n.id || '') + '.' + String(n.className || '').slice(0, 24) + '@' + getComputedStyle(n).position + (own(n) ? '*' : ''); }); return { x: x, y: y, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, top: t ? (t.tagName.toLowerCase() + '#' + (t.id || '') + '.' + String(t.className || '').slice(0, 30)) : 'none', selfTop: own(t), stackHasSelf: list.some(own), stack: st }; })()`);
    if (!box) { results.push({ ...c, verdict: 'gone' }); continue; }
    const top = box.top;
    // Neutralize modal state a previous click may have left behind. A real click
    // on "Toggle Fullscreen" calls #viewportStage.requestFullscreen(), which
    // promotes the mirror column into the browser's top layer (position:fixed,
    // covering the whole viewport) — every later control then looks occluded.
    // Exit fullscreen before each click so each verdict describes that control,
    // not leftover page state.
    const fsState = await evaluate(`(() => { const was = !!document.fullscreenElement; if (was) document.exitFullscreen(); return { was: was, now: !!document.fullscreenElement }; })()`);
    const dl0 = dialogs.length;
    await evaluate(`window.__pcCalls = []; window.__pcClickTargets = []`);
    const before = await evaluate(FP);
    // real pointer click at centre
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y, button: 'none', clickCount: 0 });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 });
    await sleep(500);
    const after = await evaluate(FP);
    const hit = (((await evaluate(`window.__pcClickTargets`)) || []).slice(-1)[0]) || null;
    const calls = (await evaluate(`window.__pcCalls`)) || [];
    const sigs = calls.map((x) => `${x.m} ${x.u}`);
    const clickSigs = sigs.filter((s) => !ambientSigs.has(s));
    const reached = !!(hit && hit.own);
    let verdict;
    if (c.disabled) verdict = 'disabled';
    else if (!reached && !box.selfTop && box.stackHasSelf) verdict = 'click-occluded';
    else if (!reached && !box.selfTop && !box.stackHasSelf) verdict = 'click-miss';
    else if (!reached) verdict = 'click-lost';
    else if (clickSigs.length) verdict = 'wired-request';
    else if (before !== after) verdict = 'wired-dom';
    else verdict = 'no-effect';
    // did the click navigate away?
    const afterUrl = (await evaluate('location.href')) || '';
    if (afterUrl && afterUrl !== BASE + route && !afterUrl.startsWith(BASE + route + '#')) {
      verdict = 'navigated';
      await send('Page.navigate', { url: BASE + route });
      await sleep(1800);
      await evaluate(HOOK);
    }
    // Follow-up for blocked clicks: dispatch a synthetic click straight on the
    // element, bypassing whatever covered it, to answer "is this control wired
    // at all?" separately from "can a real pointer reach it?".
    let directVerdict = null;
    let directSigs = [];
    let directDialogs = 0;
    if (!reached && !c.disabled) {
      const dl1 = dialogs.length;
      await evaluate('window.__pcCalls = []; window.__pcClickTargets = []');
      const b2 = await evaluate(FP);
      await evaluate('(() => { const e = window.__pcEl; if (!e || !e.isConnected) return null; e.scrollIntoView({ block: "center" }); e.click(); return 1; })()');
      await sleep(400);
      const a2 = await evaluate(FP);
      const c2 = (await evaluate('window.__pcCalls')) || [];
      directSigs = c2.map((x) => `${x.m} ${x.u}`).filter((s) => !ambientSigs.has(s));
      directDialogs = dialogs.length - dl1;
      directVerdict = directSigs.length ? 'wired-request' : (b2 !== a2 ? 'wired-dom' : (directDialogs ? 'blocked-by-dialog' : 'inert'));
    }
    results.push({
      ...c, verdict, reached, hitTarget: hit ? `${hit.tag}#${hit.id}.${hit.cls}` : null, hitOwner: hit ? hit.owner : null,
      selfTop: box.selfTop, stackHasSelf: box.stackHasSelf, directVerdict, directSigs, directDialogs,
      fsWasActive: !!(fsState && fsState.was), dialogsDuring: dialogs.length - dl0,
      calls: sigs.slice(0, 4), clickSigs, ambientOnly: clickSigs.length === 0 && sigs.length > 0,
      domChanged: before !== after, topEl: top, rect: box.rect, stack: box.stack, afterUrl
    });
  }
  const errs = errors.slice();
  const summary = {
    route, ...overall,
    controlsVisible: results.filter((r) => r.verdict !== 'hidden').length,
    byVerdict: results.reduce((a, r) => { a[r.verdict] = (a[r.verdict] || 0) + 1; return a; }, {}),
    directWired: results.filter((r) => r.directVerdict === 'wired-request' || r.directVerdict === 'wired-dom').length,
    directInert: results.filter((r) => r.directVerdict === 'inert').length,
    directDialogBlocked: results.filter((r) => r.directVerdict === 'blocked-by-dialog').length,
    staleRefs: results.filter((r) => r.verdict === 'stale-ref').length,
    fullscreenLeftovers: results.filter((r) => r.fsWasActive).length,
    dialogs: dialogs.slice(0, 6),
    stageGeom, ambientSigs: [...ambientSigs],
    errors: errs.slice(0, 8),
  };
  return { summary, results };
}

try {
  await connect();
  const report = [];
  for (const r of ROUTES) report.push(await review(r));
  fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
  for (const { summary, results } of report) {
    console.log(`\n=== ${summary.route} ===`);
    console.log(`title="${summary.title}" overflowPx=${summary.overflowPx} controls=${summary.controls} visible=${summary.controlsVisible} blurLocked=${summary.blurLocked} paywallText=${summary.paywallText} errors=${summary.errors.length}`);
    console.log('verdicts: ' + JSON.stringify(summary.byVerdict));
    if (summary.dialogs && summary.dialogs.length) console.log('DIALOGS: ' + JSON.stringify(summary.dialogs));
    for (const r of results) {
      if (r.verdict === 'hidden') continue;
      console.log(`  [${r.verdict}] <${r.tag}${r.id ? ' #' + r.id : ''}${r.dataKey ? ' data-key=' + r.dataKey : ''}> "${r.label}"${r.directVerdict ? ' direct=' + r.directVerdict : ''}${r.clickSigs && r.clickSigs.length ? ' -> ' + r.clickSigs.join(' | ') : (r.calls && r.calls.length ? ' (ambient only: ' + r.calls.join(' | ') + ')' : '')}${r.note ? ' (' + r.note + ')' : ''}`);
    }
    if (summary.errors.length) console.log('ERRORS: ' + summary.errors.join('\n  '));
  }
  console.log(`\nreport -> ${OUT}`);
} catch (e) {
  console.error('PROBE FAILED:', e.message);
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill('SIGKILL');
}
