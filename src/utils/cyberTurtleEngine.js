/**
 * Cyber Turtle Studio v2.6.0 — Shared Studio ESM Vector Geometry Engine
 * Deterministic L-System synthesis (including Pythagoras 0/1), bounded Logo DSL,
 * Nearest-Neighbor + 2-Opt TSP Air-Travel Optimizer, Pen-Up Gated Auto-Fit 200mm
 * CNC G-Code Exporter, Theme-Aware Escaped SVG Exporter, and 2x4 Unicode Braille Rasterizer.
 */

export const VERSION = '2.6.0';
export const MAX_REPEAT = 10000;
export const MAX_STEPS = 100000;
export const MAX_RECURSION_DEPTH = 64;
export const MAX_CIRCLE_STEPS = 720;
export const MAX_ITERATIONS = 14;
export const MAX_SYMBOLS = 250000;

const SAFE_COLOR_RE = /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d{1,3}(?:\.\d+)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|none|transparent|currentColor|[a-zA-Z]{3,24})$/i;

export function sanitizeSvgColor(val, fallback = '#10B981') {
  if (typeof val !== 'string') return fallback;
  const cleaned = val.trim();
  return SAFE_COLOR_RE.test(cleaned) ? cleaned : fallback;
}

export function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const LSYSTEM_PRESETS = [
  { id: 'koch', name: 'Koch Snowflake', axiom: 'F--F--F', angle: 60, iter: 4, rules: { F: 'F+F--F+F' } },
  { id: 'sierpinski', name: 'Sierpinski Arrowhead', axiom: 'A', angle: 60, iter: 6, rules: { A: 'B-A-B', B: 'A+B+A' } },
  { id: 'dragon', name: 'Dragon Curve', axiom: 'FX', angle: 90, iter: 10, rules: { X: 'X+YF+', Y: '-FX-Y' } },
  { id: 'plant', name: 'Fractal Plant', axiom: 'X', angle: 25, iter: 5, rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' } },
  { id: 'pythagoras', name: 'Pythagoras Tree', axiom: '0', angle: 45, iter: 6, rules: { '1': '11', '0': '1[+0]-0' } },
  { id: 'hilbert', name: 'Hilbert Curve', axiom: 'L', angle: 90, iter: 5, rules: { L: '+RF-LFL-FR+', R: '-LF+RFR+FL-' } },
  { id: 'gosper', name: 'Gosper Flowsnake', axiom: 'A', angle: 60, iter: 4, rules: { A: 'A-B--B+A++AA+B-', B: '+A-BB--B-A++A+B' } },
];

export const LOGO_SAMPLES = [
  {
    id: 'flower',
    name: 'Flower of Life',
    code: 'color #10B981\nrepeat 12 [\n  circle 50\n  rt 30\n]',
  },
  {
    id: 'koch_logo',
    name: 'Recursive Koch Logo',
    code: 'to koch :len :depth\n  if :depth == 0 [ fd :len stop ]\n  koch :len / 3 :depth - 1\n  lt 60\n  koch :len / 3 :depth - 1\n  rt 120\n  koch :len / 3 :depth - 1\n  lt 60\n  koch :len / 3 :depth - 1\nend\nrepeat 3 [ koch 150 3 rt 120 ]',
  },
  {
    id: 'spiral',
    name: 'Spiral Vortex',
    code: 'make "len 8\nrepeat 64 [\n  fd :len\n  rt 89\n  make "len :len + 2.5\n]',
  },
  {
    id: 'tsp_grid',
    name: 'Disconnected Plotter Grid (2-Opt TSP)',
    code: 'repeat 6 [\n  repeat 4 [ fd 26 rt 90 ]\n  pu fd 58 rt 60 pd\n]',
  },
];

export function expandLSystem(axiom, rulesObj, iterations) {
  const iters = Math.floor(Number(iterations));
  if (!Number.isFinite(iters) || iters < 0 || iters > MAX_ITERATIONS) {
    throw new Error(`L-System iterations ${iterations} out of bounds (0..${MAX_ITERATIONS})`);
  }
  let current = String(axiom || '');
  if (current.length > MAX_SYMBOLS) {
    throw new Error(`L-System axiom exceeds max symbols (${MAX_SYMBOLS})`);
  }
  const rules = rulesObj && typeof rulesObj === 'object' ? rulesObj : {};
  for (let i = 0; i < iters; i++) {
    let next = '';
    for (let j = 0; j < current.length; j++) {
      const ch = current[j];
      next += Object.prototype.hasOwnProperty.call(rules, ch) ? String(rules[ch]) : ch;
      if (next.length > MAX_SYMBOLS) {
        throw new Error(`L-System expansion exceeded max symbols (${MAX_SYMBOLS})`);
      }
    }
    current = next;
  }
  return current;
}

export function interpretLSystem(instructions, turnAngle = 60, step = 10) {
  let x = 0;
  let y = 0;
  let curAngle = 90;
  const rad = (deg) => (deg * Math.PI) / 180;
  const stack = [];
  const segments = [];

  for (let i = 0; i < instructions.length; i++) {
    if (segments.length >= MAX_STEPS) {
      throw new Error(`Turtle step limit exceeded (${MAX_STEPS})`);
    }
    const ch = instructions[i];
    if (ch === 'F' || ch === 'G' || ch === 'A' || ch === 'B' || ch === '0' || ch === '1') {
      const nx = x + Math.cos(rad(curAngle)) * step;
      const ny = y + Math.sin(rad(curAngle)) * step;
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, is_draw: true });
      x = nx;
      y = ny;
    } else if (ch === 'f') {
      const nx = x + Math.cos(rad(curAngle)) * step;
      const ny = y + Math.sin(rad(curAngle)) * step;
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, is_draw: false });
      x = nx;
      y = ny;
    } else if (ch === '+') {
      curAngle -= turnAngle;
    } else if (ch === '-') {
      curAngle += turnAngle;
    } else if (ch === '[') {
      stack.push({ x, y, curAngle });
    } else if (ch === ']') {
      if (stack.length > 0) {
        const st = stack.pop();
        if (Math.hypot(x - st.x, y - st.y) > 1e-6) {
          segments.push({ x1: x, y1: y, x2: st.x, y2: st.y, is_draw: false });
        }
        x = st.x;
        y = st.y;
        curAngle = st.curAngle;
      }
    }
  }
  return computeGeometry(segments);
}

function evalSafeArith(exprStr, vars) {
  const s = String(exprStr || '').trim();
  if (!s) return 0;
  if (/^:[a-zA-Z_][a-zA-Z0-9_-]*$/.test(s)) return Number(vars[s.slice(1)] ?? 0);
  const sub = s.replace(/:([a-zA-Z_][a-zA-Z0-9_-]*)/g, (_, name) => String(Number(vars[name] ?? 0)));
  const tokens = sub.match(/\d*\.?\d+(?:[eE][+-]?\d+)?|[+\-*/%()]|[a-zA-Z_][a-zA-Z0-9_]*/g);
  if (!tokens || !tokens.length) return 0;
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const parseExpr = () => {
    let l = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const r = parseTerm();
      l = op === '+' ? l + r : l - r;
    }
    return l;
  };
  const parseTerm = () => {
    let l = parseFactor();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = next();
      const r = parseFactor();
      l = op === '*' ? l * r : op === '/' ? (r === 0 ? 0 : l / r) : (r === 0 ? 0 : l % r);
    }
    return l;
  };
  const parseFactor = () => {
    const t = peek();
    if (t === '+') { next(); return parseFactor(); }
    if (t === '-') { next(); return -parseFactor(); }
    if (t === '(') { next(); const v = parseExpr(); if (peek() === ')') next(); return v; }
    if (t !== undefined && /^[a-zA-Z_]/.test(t)) {
      next();
      const low = t.toLowerCase();
      if (low === 'pi') return Math.PI;
      if (low === 'e') return Math.E;
      if (Object.prototype.hasOwnProperty.call(vars, t)) return Number(vars[t]);
      return 0;
    }
    next();
    const num = parseFloat(t);
    return Number.isFinite(num) ? num : 0;
  };
  const out = parseExpr();
  return Number.isFinite(out) ? out : 0;
}

export function executeLogoDsl(script) {
  const cleaned = String(script || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/(;|\/\/|(?<![a-zA-Z0-9_])#(?!([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b)).*$/, ''))
    .join(' ');
  const raw = cleaned.match(/\[|\]|<=|>=|==|!=|[<>]|"[a-zA-Z0-9_#-]+|:[a-zA-Z0-9_-]+|#[0-9a-fA-F]{3,8}|[a-zA-Z_][a-zA-Z0-9_]*|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?|[+\-*/%()]|[^\s\[\]]+/g) || [];
  const stack = [[]];
  for (const tok of raw) {
    if (tok === '[') { const b = []; stack[stack.length - 1].push(b); stack.push(b); }
    else if (tok === ']') { if (stack.length > 1) stack.pop(); }
    else stack[stack.length - 1].push(tok);
  }
  const tree = stack[0];

  let x = 0, y = 0, heading = 0, penDown = true, stepCount = 0, recDepth = 0;
  const stateStack = [];
  const segments = [];
  let vars = {};
  const procs = {};
  const STOP_SIG = { __stop: true };
  const rad = (deg) => (deg * Math.PI) / 180;

  const tick = (n = 1) => {
    stepCount += n;
    if (stepCount > MAX_STEPS) throw new Error(`Logo step budget exceeded (${MAX_STEPS})`);
  };

  const forward = (d) => {
    const nx = x + Math.cos(rad(heading)) * d;
    const ny = y + Math.sin(rad(heading)) * d;
    if (Math.hypot(nx - x, ny - y) > 1e-9) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, is_draw: penDown });
    }
    x = nx; y = ny;
  };

  const readExpr = (arr, start) => {
    if (start >= arr.length || Array.isArray(arr[start])) return [0, start];
    const parts = [String(arr[start])];
    let j = start + 1;
    while (j + 1 < arr.length && !Array.isArray(arr[j]) && ['+', '-', '*', '/', '%'].includes(String(arr[j]))) {
      if (Array.isArray(arr[j + 1])) break;
      parts.push(String(arr[j]), String(arr[j + 1]));
      j += 2;
    }
    return [evalSafeArith(parts.join(' '), vars), j];
  };

  const evalCond = (arr, start) => {
    const [lhs, idx] = readExpr(arr, start);
    if (idx < arr.length && !Array.isArray(arr[idx]) && ['=', '==', '!=', '<', '<=', '>', '>='].includes(String(arr[idx]))) {
      const op = String(arr[idx]);
      const [rhs, ni] = readExpr(arr, idx + 1);
      if (op === '=' || op === '==') return [Math.abs(lhs - rhs) < 1e-9, ni];
      if (op === '!=') return [Math.abs(lhs - rhs) >= 1e-9, ni];
      if (op === '<') return [lhs < rhs, ni];
      if (op === '<=') return [lhs <= rhs, ni];
      if (op === '>') return [lhs > rhs, ni];
      if (op === '>=') return [lhs >= rhs, ni];
    }
    return [Boolean(lhs), idx];
  };

  const exec = (arr) => {
    let i = 0;
    while (i < arr.length) {
      tick(1);
      const tok = arr[i];
      if (Array.isArray(tok)) { exec(tok); i++; continue; }
      const cmd = String(tok).toLowerCase();
      if (cmd === 'stop') throw STOP_SIG;
      else if (cmd === 'fd' || cmd === 'forward') { const [d, ni] = readExpr(arr, i + 1); forward(d); i = ni; }
      else if (cmd === 'bk' || cmd === 'backward' || cmd === 'back') { const [d, ni] = readExpr(arr, i + 1); forward(-d); i = ni; }
      else if (cmd === 'lt' || cmd === 'left') { const [a, ni] = readExpr(arr, i + 1); heading = (heading + a) % 360; i = ni; }
      else if (cmd === 'rt' || cmd === 'right') { const [a, ni] = readExpr(arr, i + 1); heading = (heading - a) % 360; i = ni; }
      else if (cmd === 'pu' || cmd === 'penup') { penDown = false; i++; }
      else if (cmd === 'pd' || cmd === 'pendown') { penDown = true; i++; }
      else if (cmd === 'push') { stateStack.push({ x, y, heading, penDown }); i++; }
      else if (cmd === 'pop') {
        if (stateStack.length) {
          const st = stateStack.pop();
          segments.push({ x1: x, y1: y, x2: st.x, y2: st.y, is_draw: false });
          ({ x, y, heading, penDown } = st);
        }
        i++;
      } else if (cmd === 'color' || cmd === 'pencolor' || cmd === 'width' || cmd === 'pensize') {
        i += (i + 1 < arr.length && !Array.isArray(arr[i + 1])) ? 2 : 1;
      } else if (cmd === 'circle') {
        const [r, ni] = readExpr(arr, i + 1);
        const count = Math.max(16, Math.min(MAX_CIRCLE_STEPS, Math.floor(Math.abs(r) * 0.7) + 24));
        const stepAng = 360 / count;
        const chord = 2 * Math.abs(r) * Math.sin(rad(stepAng / 2));
        for (let k = 0; k < count; k++) {
          tick(1);
          heading = (heading + stepAng / 2) % 360;
          forward(chord);
          heading = (heading + stepAng / 2) % 360;
        }
        i = ni;
      } else if (cmd === 'if') {
        const [cond, ni] = evalCond(arr, i + 1);
        if (ni < arr.length && Array.isArray(arr[ni])) { if (cond) exec(arr[ni]); i = ni + 1; } else i = ni;
      } else if (cmd === 'repeat') {
        const [cntF, ni] = readExpr(arr, i + 1);
        const cnt = Math.floor(cntF);
        if (cnt < 0 || cnt > MAX_REPEAT) throw new Error(`repeat count ${cnt} out of bounds (0..${MAX_REPEAT})`);
        if (ni < arr.length && Array.isArray(arr[ni])) {
          for (let k = 1; k <= cnt; k++) { vars.repcount = k; exec(arr[ni]); }
          i = ni + 1;
        } else i = ni;
      } else if (cmd === 'make' || cmd === 'set' || cmd === 'let') {
        if (i + 2 < arr.length) {
          const vn = String(arr[i + 1]).replace(/^["':]+/, '');
          const [val, ni] = readExpr(arr, i + 2);
          vars[vn] = val;
          i = ni;
        } else i++;
      } else if (cmd === 'to') {
        const pn = String(arr[i + 1] || '').toLowerCase();
        const params = [];
        let idx = i + 2;
        while (idx < arr.length && !Array.isArray(arr[idx]) && String(arr[idx]).startsWith(':')) {
          params.push(String(arr[idx]).slice(1));
          idx++;
        }
        const body = [];
        while (idx < arr.length && (Array.isArray(arr[idx]) || String(arr[idx]).toLowerCase() !== 'end')) {
          body.push(arr[idx]);
          idx++;
        }
        procs[pn] = { params, body };
        i = idx < arr.length ? idx + 1 : arr.length;
      } else if (procs[cmd]) {
        if (recDepth >= MAX_RECURSION_DEPTH) throw new Error(`Logo recursion limit exceeded (${MAX_RECURSION_DEPTH})`);
        const { params, body } = procs[cmd];
        const saved = { ...vars };
        let ni = i + 1;
        const vals = [];
        for (let p = 0; p < params.length; p++) {
          const [v, nextI] = readExpr(arr, ni);
          vals.push(v);
          ni = nextI;
        }
        params.forEach((p, idxP) => { vars[p] = vals[idxP]; });
        recDepth++;
        try { exec(body); } catch (sig) { if (sig !== STOP_SIG) throw sig; }
        finally { recDepth--; vars = saved; }
        i = ni;
      } else i++;
    }
  };

  try { exec(tree); } catch (sig) { if (sig !== STOP_SIG) throw sig; }
  return computeGeometry(segments);
}

export function computeGeometry(segments) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let drawDist = 0;
  let rapidDist = 0;
  let drawCount = 0;
  let lastX = null;
  let lastY = null;
  let pathD = '';

  for (const s of segments) {
    const d = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
    if (s.is_draw !== false) {
      drawCount++;
      drawDist += d;
      if (lastX !== null) {
        const jump = Math.hypot(s.x1 - lastX, s.y1 - lastY);
        if (jump > 0.05) rapidDist += jump;
      }
      lastX = s.x2; lastY = s.y2;
      minX = Math.min(minX, s.x1, s.x2);
      maxX = Math.max(maxX, s.x1, s.x2);
      minY = Math.min(minY, s.y1, s.y2);
      maxY = Math.max(maxY, s.y1, s.y2);
      pathD += `M ${s.x1.toFixed(2)} ${(-s.y1).toFixed(2)} L ${s.x2.toFixed(2)} ${(-s.y2).toFixed(2)} `;
    }
  }
  if (!Number.isFinite(minX)) { minX = -100; maxX = 100; minY = -100; maxY = 100; }
  const pad = 20;
  const vw = Math.max(20, maxX - minX + pad * 2);
  const vh = Math.max(20, maxY - minY + pad * 2);
  const viewBox = `${(minX - pad).toFixed(2)} ${(-(maxY + pad)).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;

  return {
    segments,
    pathD: pathD.trim(),
    viewBox,
    bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
    stats: {
      segments: drawCount,
      drawDistance: Math.round(drawDist),
      rapidTravel: Math.round(rapidDist),
    },
  };
}

export function optimizeToolpath2Opt(segments, maxPasses = 40) {
  const drawSegs = segments.filter((s) => s.is_draw !== false);
  if (drawSegs.length === 0) {
    return {
      segments: [],
      airMovesBefore: [],
      airMovesAfter: [],
      initialAirTravel: 0,
      optimizedAirTravel: 0,
      savedMm: 0,
      reductionPercent: 0,
      polylines: 0,
    };
  }
  const polylines = [];
  let cur = [drawSegs[0]];
  for (let i = 1; i < drawSegs.length; i++) {
    const prev = cur[cur.length - 1];
    const seg = drawSegs[i];
    if (Math.hypot(seg.x1 - prev.x2, seg.y1 - prev.y2) < 0.05) cur.push(seg);
    else { polylines.push(cur); cur = [seg]; }
  }
  polylines.push(cur);

  const startOf = (pl) => ({ x: pl[0].x1, y: pl[0].y1 });
  const endOf = (pl) => ({ x: pl[pl.length - 1].x2, y: pl[pl.length - 1].y2 });
  const revPl = (pl) => pl.slice().reverse().map((s) => ({ ...s, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 }));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const measure = (order) => {
    let air = 0;
    const moves = [];
    let pos = { x: 0, y: 0 };
    for (const pl of order) {
      const s = startOf(pl);
      const d = dist(pos, s);
      if (d > 0.05) { air += d; moves.push({ x1: pos.x, y1: pos.y, x2: s.x, y2: s.y }); }
      pos = endOf(pl);
    }
    return { air, moves };
  };

  const before = measure(polylines);
  if (polylines.length <= 1) {
    return {
      segments: drawSegs,
      airMovesBefore: before.moves,
      airMovesAfter: before.moves,
      initialAirTravel: Number(before.air.toFixed(1)),
      optimizedAirTravel: Number(before.air.toFixed(1)),
      savedMm: 0,
      reductionPercent: 0,
      polylines: polylines.length,
    };
  }

  const remaining = polylines.slice();
  const ordered = [];
  let pos = { x: 0, y: 0 };
  while (remaining.length) {
    let bestI = 0, bestRev = false, bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dF = dist(pos, startOf(remaining[i]));
      const dR = dist(pos, endOf(remaining[i]));
      if (dF < bestD) { bestD = dF; bestI = i; bestRev = false; }
      if (dR < bestD) { bestD = dR; bestI = i; bestRev = true; }
    }
    const chosen = remaining.splice(bestI, 1)[0];
    const orient = bestRev ? revPl(chosen) : chosen;
    ordered.push(orient);
    pos = endOf(orient);
  }

  const n = ordered.length;
  if (n >= 3 && n <= 400) {
    let improved = true;
    let pass = 0;
    while (improved && pass < maxPasses) {
      improved = false;
      pass++;
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          const prevPt = i === 0 ? { x: 0, y: 0 } : endOf(ordered[i - 1]);
          const nextPt = j + 1 < n ? startOf(ordered[j + 1]) : null;
          const curC = dist(prevPt, startOf(ordered[i])) + (nextPt ? dist(endOf(ordered[j]), nextPt) : 0);
          const newC = dist(prevPt, endOf(ordered[j])) + (nextPt ? dist(startOf(ordered[i]), nextPt) : 0);
          if (newC + 1e-4 < curC) {
            const flipped = ordered.slice(i, j + 1).reverse().map(revPl);
            ordered.splice(i, j - i + 1, ...flipped);
            improved = true;
          }
        }
      }
    }
  }

  const after = measure(ordered);
  const optSegs = [];
  for (let i = 0; i < ordered.length; i++) {
    if (i > 0) {
      const e = endOf(ordered[i - 1]);
      const s = startOf(ordered[i]);
      if (dist(e, s) > 0.05) optSegs.push({ x1: e.x, y1: e.y, x2: s.x, y2: s.y, is_draw: false });
    }
    for (const seg of ordered[i]) optSegs.push(seg);
  }
  const saved = Math.max(0, before.air - after.air);
  const pct = before.air > 0.01 ? (saved / before.air) * 100 : 0;

  return {
    segments: optSegs,
    airMovesBefore: before.moves,
    airMovesAfter: after.moves,
    initialAirTravel: Number(before.air.toFixed(1)),
    optimizedAirTravel: Number(after.air.toFixed(1)),
    savedMm: Number(saved.toFixed(1)),
    reductionPercent: Number(pct.toFixed(1)),
    polylines: polylines.length,
  };
}

export function exportAutoFitGCode(segments, { bedWidth = 200, bedHeight = 200, margin = 10, title = 'Cyber Turtle Plot' } = {}) {
  const drawSegs = segments.filter((s) => s.is_draw !== false);
  const lines = [
    `; Cyber Turtle Studio v${VERSION} — Auto-Fit ${bedWidth}x${bedHeight}mm CNC G-Code`,
    `; Pattern: ${title} | Segments: ${drawSegs.length}`,
    'G21 ; Millimeters',
    'G90 ; Absolute coordinates',
    'G17 ; XY plane',
    'G0 Z5.000 F3000 ; Pen up',
  ];
  if (drawSegs.length === 0) {
    lines.push('G0 X0.000 Y0.000', 'M2');
    return lines.join('\n');
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of drawSegs) {
    minX = Math.min(minX, s.x1, s.x2);
    maxX = Math.max(maxX, s.x1, s.x2);
    minY = Math.min(minY, s.y1, s.y2);
    maxY = Math.max(maxY, s.y1, s.y2);
  }
  const spanX = Math.max(1e-3, maxX - minX);
  const spanY = Math.max(1e-3, maxY - minY);
  const scale = Math.min((bedWidth - margin * 2) / spanX, (bedHeight - margin * 2) / spanY);
  const ox = (bedWidth - spanX * scale) / 2 - minX * scale;
  const oy = (bedHeight - spanY * scale) / 2 - minY * scale;
  const map = (px, py) => ({
    x: Math.max(0, Math.min(bedWidth, px * scale + ox)),
    y: Math.max(0, Math.min(bedHeight, py * scale + oy)),
  });

  let penDown = false;
  let lastX = null, lastY = null;
  for (const s of segments) {
    const p1 = map(s.x1, s.y1);
    const p2 = map(s.x2, s.y2);
    if (s.is_draw === false) {
      if (penDown) { lines.push('G0 Z5.000 ; Pen up'); penDown = false; }
      lines.push(`G0 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} F3000 ; Rapid travel`);
      lastX = p2.x; lastY = p2.y;
      continue;
    }
    if (lastX === null || Math.hypot(p1.x - lastX, p1.y - lastY) > 0.05) {
      if (penDown) { lines.push('G0 Z5.000 ; Pen up'); penDown = false; }
      lines.push(`G0 X${p1.x.toFixed(3)} Y${p1.y.toFixed(3)} F3000 ; Rapid to start`);
    }
    if (!penDown) { lines.push('G1 Z0.000 F600 ; Pen down'); penDown = true; }
    lines.push(`G1 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} F1200`);
    lastX = p2.x; lastY = p2.y;
  }
  if (penDown) lines.push('G0 Z5.000 ; Pen up');
  lines.push('G0 X0.000 Y0.000 ; Origin', 'M2 ; End');
  return lines.join('\n');
}

export function exportThemeAwareSvg(geometry, { isDark = true, title = 'Cyber Turtle Drawing', stroke = null, airMoves = [] } = {}) {
  const bg = isDark ? '#08080B' : '#FAF8F3';
  const strokeCol = sanitizeSvgColor(stroke || (isDark ? '#D4AF37' : '#0F172A'), isDark ? '#D4AF37' : '#0F172A');
  const airPath = airMoves.length
    ? `\n  <path d="${airMoves.map((m) => `M ${m.x1.toFixed(2)} ${(-m.y1).toFixed(2)} L ${m.x2.toFixed(2)} ${(-m.y2).toFixed(2)}`).join(' ')}" fill="none" stroke="#F59E0B" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.7" />`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(geometry.viewBox)}" width="800" height="800">\n  <title>${escapeXml(title)}</title>\n  <rect x="-100000" y="-100000" width="200000" height="200000" fill="${bg}" />\n  <path d="${escapeXml(geometry.pathD)}" fill="none" stroke="${strokeCol}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />${airPath}\n</svg>`;
}

export function rasterizeBraille(segments, charW = 52, charH = 18) {
  const drawSegs = segments.filter((s) => s.is_draw !== false);
  if (drawSegs.length === 0) return '[Empty Vector Canvas]';
  const W = Math.max(12, Math.min(100, Math.floor(charW)));
  const H = Math.max(6, Math.min(48, Math.floor(charH)));
  const pixW = W * 2, pixH = H * 4;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of drawSegs) {
    minX = Math.min(minX, s.x1, s.x2); maxX = Math.max(maxX, s.x1, s.x2);
    minY = Math.min(minY, s.y1, s.y2); maxY = Math.max(maxY, s.y1, s.y2);
  }
  const scale = Math.min((pixW - 4) / Math.max(1e-3, maxX - minX), (pixH - 4) / Math.max(1e-3, maxY - minY));
  const ox = pixW / 2 - ((minX + maxX) / 2) * scale;
  const oy = pixH / 2 - ((minY + maxY) / 2) * scale;
  const bits = Array.from({ length: H }, () => new Uint8Array(W));
  const MASK = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  const plot = (px, py) => {
    if (px < 0 || px >= pixW || py < 0 || py >= pixH) return;
    bits[py >> 2][px >> 1] |= MASK[py & 3][px & 1];
  };
  for (const s of drawSegs) {
    let x0 = Math.round(s.x1 * scale + ox);
    let y0 = Math.round(pixH - 1 - (s.y1 * scale + oy));
    const x1 = Math.round(s.x2 * scale + ox);
    const y1 = Math.round(pixH - 1 - (s.y2 * scale + oy));
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      plot(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
  return bits.map((row) => Array.from(row, (b) => (b ? String.fromCharCode(0x2800 | b) : ' ')).join('')).join('\n');
}
