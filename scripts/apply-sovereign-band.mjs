#!/usr/bin/env node
/**
 * apply-sovereign-band.mjs — structure-aware codemod that wires the sovereign
 * visual system (canvas band + typographic tiers) into every Zoth Studio tool
 * component, WITHOUT touching component logic.
 *
 * Why a codemod and not 52 hand edits: src/components/tools/ holds 52 files
 * (6-3,744 lines) with heterogeneous heading idioms (h5 x52, h6 x71, h4 x9,
 * body2 x158 ...). Guessing insertion points by regex would eventually produce
 * unbalanced JSX; the only safe way to add JSX to 52 hand-written files is to
 * parse them, splice text at real node offsets, and REFUSE TO WRITE anything
 * whose output does not re-parse.
 *
 * Per file it does at most four things, all additive:
 *   1. import SovereignBand + SovereignEyebrow (+ titleBaseSx/ledeSx when used)
 *   2. insert  <SovereignEyebrow accent="..">id · category</SovereignEyebrow>
 *      followed by <SovereignBand seed=".." eyebrow=".." caption=".." meta={[..]} />
 *      — before the first <Grid container> (header first), else as the root's
 *      first child.
 *   3. merge `...titleBaseSx` as the FIRST property of the first heading's sx
 *      inside the header <Paper> (existing props win, so per-tool fonts and
 *      colours are never overridden)
 *   4. merge `...ledeSx` into the first plain-text Typography after that title
 *
 * Guarantees: idempotent (skips files already carrying SovereignBand), every
 * emitted accent comes from palette.js `bandAccent` (same function the band
 * itself calls), and a file is written only if the result re-parses.
 *
 *   node scripts/apply-sovereign-band.mjs            # dry run, prints table
 *   node scripts/apply-sovereign-band.mjs --apply     # writes the files
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import { bandAccent } from '../src/components/sovereign/palette.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TOOLS = path.join(ROOT, 'src/components/tools');
const PAGE = path.join(ROOT, 'src/pages/RealToolWorkspacePage.jsx');
const DATA = path.join(ROOT, 'src/data/toolsData.js');

const APPLY = process.argv.includes('--apply');
const PARSER_OPTS = { sourceType: 'module', plugins: ['jsx'], errorRecovery: false };

/* ── data: tool id -> { name, category, version } ─────────────────────────── */
let BY_COMPONENT = new Map(); // Component -> id   (from RealToolWorkspacePage)
let BY_ID = new Map(); // id -> { name, category, version }

function loadMaps() {
  const page = fs.readFileSync(PAGE, 'utf8');
  const mapStart = page.indexOf('ENCLAVE_TOOL_COMPONENTS');
  if (mapStart < 0) throw new Error('ENCLAVE_TOOL_COMPONENTS not found');
  const slice = page.slice(mapStart);
  const re = /'([^']+)':\s*([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(slice))) {
    const [, id, comp] = m;
    if (!BY_COMPONENT.has(comp)) BY_COMPONENT.set(comp, id); // first (canonical) id wins
  }

  const data = fs.readFileSync(DATA, 'utf8');
  const entryRe = /\{\s*\n\s*id:\s*'([^']+)'([\s\S]*?)\n\s*\},/g;
  let e;
  while ((e = entryRe.exec(data))) {
    const [, id, body] = e;
    const pick = (k) => {
      const r = new RegExp(`${k}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(body);
      return r ? r[1].replace(/\\'/g, "'") : null;
    };
    BY_ID.set(id, { name: pick('name'), category: pick('category'), version: pick('version') });
  }
  if (!BY_COMPONENT.size || !BY_ID.size) throw new Error('map load failed');
}

/* ── tiny AST helpers ─────────────────────────────────────────────────────── */
function buildParents(node, parent, out) {
  out.set(node, parent || null);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === 'string') buildParents(c, node, out);
    } else if (v && typeof v.type === 'string') {
      buildParents(v, node, out);
    }
  }
  return out;
}

const jsxName = (el) => {
  const n = el.name;
  if (!n) return null;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${jsxName({ name: n.object })}.${n.property.name}`;
  return null;
};
const attr = (el, name) => el.attributes.find((a) => a.type === 'JSXAttribute' && a.name && a.name.name === name);
const isChildrenList = (p) => p && (p.type === 'JSXElement' || p.type === 'JSXFragment');
// For a JSXOpeningElement, parents.get(node) is its OWN JSXElement, so "is this
// element sitting in a children list" needs the grandparent. Without this the
// codemod happily targets a <Grid container> inside {tab === 0 && (...)} and
// splices a sibling into an expression position.
const inChildrenList = (opening, parents) => isChildrenList(parents.get(parents.get(opening.node)));
const lineStart = (src, pos) => src.lastIndexOf('\n', pos - 1) + 1;
const indentOf = (src, pos) => {
  const ls = lineStart(src, pos);
  const m = /^[ \t]*/.exec(src.slice(ls, pos));
  return m ? m[0] : '';
};
const orient = (src, pos) => src.slice(lineStart(src, pos), lineStart(src, pos) + 20).match(/^\s*/)[0];

function resolveFn(ast) {
  const unwrap = (n) => {
    let cur = n;
    for (let i = 0; i < 6 && cur; i++) {
      if (cur.type === 'Identifier') {
        let found = null;
        for (const s of ast.program.body) {
          if (s.type === 'VariableDeclaration') {
            for (const d of s.declarations) if (d.id && d.id.name === cur.name) found = d.init;
          }
          if (s.type === 'FunctionDeclaration' && s.id && s.id.name === cur.name) return s;
        }
        cur = found;
        continue;
      }
      if (cur.type === 'CallExpression') {
        const fnArg = cur.arguments.find((a) => /Function|Arrow/.test(a.type));
        cur = fnArg || cur.callee;
        continue;
      }
      return cur;
    }
    return cur;
  };
  for (const s of ast.program.body) {
    if (s.type === 'ExportDefaultDeclaration') return unwrap(s.declaration);
    if (s.type === 'ExportNamedDeclaration' && s.specifiers) {
      for (const sp of s.specifiers) {
        if (sp.exported && sp.exported.name === 'default') return unwrap(sp.local);
      }
    }
  }
  return null;
}

function jsxRootOf(fn) {
  if (!fn) return null;
  if (fn.type === 'ArrowFunctionExpression' && /JSX/.test(fn.body.type)) return fn.body;
  const block = fn.body && fn.body.type === 'BlockStatement' ? fn.body : null;
  if (!block) return null;
  let best = null;
  for (const st of block.body) {
    const candidates = [];
    if (st.type === 'ReturnStatement') candidates.push(st.argument);
    if (st.type === 'VariableDeclaration') for (const d of st.declarations) candidates.push(d.init);
    for (const c of candidates) {
      if (c && (c.type === 'JSXElement' || c.type === 'JSXFragment')) {
        if (!best || c.end - c.start > best.end - best.start) best = c;
      }
    }
  }
  return best;
}

/* ── heading detection ────────────────────────────────────────────────────── */
const HEADING_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
function headingOf(opening) {
  const v = attr(opening, 'variant');
  if (!v || !v.value || v.value.type !== 'StringLiteral') return null;
  return HEADING_VARIANTS.has(v.value.value) ? v.value.value : null;
}
const isIntrinsic = (el) => /^[a-z]/.test(jsxName(el.openingElement) || 'Z');
function plainTextOnly(el) {
  return el.children.every((c) => {
    if (c.type === 'JSXText') return true;
    if (c.type === 'JSXExpressionContainer') {
      return !/JSX/.test(c.expression.type) && c.expression.type !== 'NullLiteral';
    }
    // intrinsic children (<span>, <code>, <br>) are fine as long as they only
    // render text; a nested component means the element is dynamic
    if (c.type === 'JSXElement') return isIntrinsic(c) && plainTextOnly(c);
    if (c.type === 'JSXFragment') return plainTextOnly(c);
    return false;
  });
}
const textOf = (el) =>
  el.children
    .map((c) => {
      if (c.type === 'JSXText') return c.value;
      if (c.type === 'JSXElement') return textOf(c);
      if (c.type === 'JSXFragment') return textOf(c);
      if (c.type === 'JSXExpressionContainer' && c.expression.type === 'StringLiteral') return c.expression.value;
      if (c.type === 'JSXExpressionContainer' && c.expression.type === 'TemplateLiteral')
        return c.expression.quasis.map((q) => q.value.cooked).join('…');
      return '…';
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

/* ── one file ─────────────────────────────────────────────────────────────── */
function planFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const base = path.basename(file, '.jsx');
  const notes = [];
  if (/SovereignBand/.test(src)) return { base, file, skip: 'already wired' };

  let ast;
  try {
    ast = parse(src, PARSER_OPTS);
  } catch (err) {
    return { base, file, skip: `parse failed: ${err.message}` };
  }
  const parents = buildParents(ast, null, new Map());

  // structural census of openings, in source order
  const openings = [];
  for (const [node, parent] of parents) {
    if (node.type === 'JSXOpeningElement' && !node.selfClosing) openings.push({ node, parent });
  }
  openings.sort((a, b) => a.node.start - b.node.start);

  const grid = openings.find(
    (o) => jsxName(o.node) === 'Grid' && attr(o.node, 'container') && inChildrenList(o, parents),
  );
  const gridEl = grid ? parents.get(grid.node) : null;
  const firstPaper = openings.find((o) => jsxName(o.node) === 'Paper' && inChildrenList(o, parents));
  const firstPaperEl = firstPaper ? parents.get(firstPaper.node) : null;

  const fn = resolveFn(ast);
  const root = jsxRootOf(fn);

  // target 1: the band insertion point
  let target = null;
  let how = null;
  if (grid && (!firstPaper || grid.node.start > firstPaper.node.start)) {
    target = grid.node;
    how = 'before-grid';
  } else if (root) {
    how = 'root-first-child';
  } else {
    return { base, file, skip: 'no default-export root JSX' };
  }

  const id = BY_COMPONENT.get(base) || base.replace(/GodModeTool$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const meta = BY_ID.get(id) || {};
  const name = meta.name || base.replace(/GodModeTool$/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  const category = meta.category || 'Zoth Studio';
  const accent = bandAccent(id);

  const splices = []; // {at, text}
  const bandSeed = JSON.stringify(id);

  // ── the band + eyebrow block
  // Insertion is always at a LINE START so the code we add keeps the host
  // file's own indentation and the following element keeps its own.
  let insAt;
  let ind;
  if (how === 'before-grid') {
    insAt = lineStart(src, grid.node.start);
    ind = orient(src, grid.node.start);
  } else {
    const kids = root.children ? root.children.filter((c) => c.type !== 'JSXText' || c.value.trim()) : [];
    const anchor = kids.length ? kids[0] : null;
    insAt = anchor ? anchor.start : root.openingElement.end;
    const before = src.slice(lineStart(src, insAt), insAt);
    if (/^[ \t]*$/.test(before)) {
      // same line discipline as before-grid: splice at the line start so the
      // new siblings land at the anchor's indent instead of doubling it
      ind = before;
      insAt = lineStart(src, insAt);
    } else {
      // the root's first child shares its line with the opening tag — start a
      // fresh line at the root's indentation + 2
      ind = orient(src, root.openingElement.start) + '  ';
      splices.push({ at: insAt, text: '\n', kind: 'newline' });
    }
  }
  const block =
    `${ind}<SovereignEyebrow accent=${JSON.stringify(accent)} right=${JSON.stringify(category)}>\n` +
    `${ind}  {${JSON.stringify(id)}}\n` +
    `${ind}</SovereignEyebrow>\n` +
    `${ind}<SovereignBand\n` +
    `${ind}  seed={${bandSeed}}\n` +
    `${ind}  eyebrow={${JSON.stringify(category)}}\n` +
    `${ind}  caption={${JSON.stringify(name)}}\n` +
    `${ind}  label={${JSON.stringify(`${name} — Zoth sovereign visualisation`)}}\n` +
    `${ind}/>\n`;
  splices.push({ at: insAt, text: block, kind: how });

  // ── typographic tiers.
  // The title must be the page heading ABOVE the content grid: several tools
  // wrap their stat cards in the same <Paper> as the header, so "first heading
  // inside the Paper" lands on a stat number and the responsive font-size clamp
  // in titleBaseSx would rescale it. Above-the-grid is the real header region.
  // It must also render plain text of a convincing length — otherwise a score
  // readout such as `{report.securityScore}/100` (an h4 inside the header box)
  // would be treated as the page title.
  const contentStart = grid ? grid.node.start : root.end;
  const insideHeading = (node) => {
    let p = parents.get(node);
    while (p) {
      if (p.type === 'JSXElement' && headingOf(p.openingElement)) return true;
      p = parents.get(p);
    }
    return false;
  };
  let titleNode = null;
  for (const o of openings) {
    if (o.node.start >= contentStart) break;
    if (!headingOf(o.node)) continue;
    const el = parents.get(o.node);
    if (!el || !plainTextOnly(el)) continue;
    if (textOf(el).length < 12) continue;
    if (insideHeading(el)) continue;
    titleNode = o.node;
    break;
  }

  const imports = ['SovereignBand', 'SovereignEyebrow'];

  if (titleNode) {
    const sx = attr(titleNode, 'sx');
    if (sx && sx.value && sx.value.type === 'JSXExpressionContainer' && sx.value.expression.type === 'ObjectExpression') {
      const obj = sx.value.expression;
      splices.push({ at: obj.start + 1, text: ' ...titleBaseSx,', kind: 'title-sx-merge' });
    } else if (!sx) {
      splices.push({ at: titleNode.name.end, text: ` sx={{ ...titleBaseSx }}`, kind: 'title-sx-add' });
    } else {
      notes.push('title sx not an object literal — left alone');
    }
    imports.push('titleBaseSx');
    // lede: first plain-text Typography between the title and the content grid,
    // never one nested inside the title heading itself
    const lede = openings.find(
      (o) =>
        o.node.start > titleNode.end &&
        o.node.start < contentStart &&
        jsxName(o.node) === 'Typography' &&
        inChildrenList(o, parents) &&
        !insideHeading(parents.get(o.node)),
    );
    const ledeEl = lede ? parents.get(lede.node) : null;
    if (lede && ledeEl && plainTextOnly(ledeEl) && textOf(ledeEl).length >= 20) {
      const sx2 = attr(lede.node, 'sx');
      if (sx2 && sx2.value && sx2.value.type === 'JSXExpressionContainer' && sx2.value.expression.type === 'ObjectExpression') {
        splices.push({ at: sx2.value.expression.start + 1, text: ' ...ledeSx,', kind: 'lede-sx-merge' });
        imports.push('ledeSx');
      } else {
        notes.push('lede has no object sx — left alone');
      }
    }
  } else {
    notes.push('no heading found — tiers not applied');
  }

  // ── imports, after the last top-level import
  let lastImport = null;
  for (const s of ast.program.body) {
    if (s.type === 'ImportDeclaration') lastImport = s;
    else if (lastImport) break;
  }
  if (!lastImport) return { base, file, skip: 'no import block' };
  const uniq = [...new Set(imports)];
  const bandLine = `\nimport SovereignBand from '../sovereign/SovereignBand.jsx';`;
  const typoLine = `\nimport { ${uniq.filter((i) => i !== 'SovereignBand').join(', ')} } from '../sovereign/typography.jsx';`;
  splices.push({ at: lastImport.end, text: bandLine + typoLine, kind: 'imports' });

  // ── apply, then re-parse: nothing is written unless it parses
  const out = applySplices(src, splices);
  try {
    parse(out, PARSER_OPTS);
  } catch (err) {
    return {
      base,
      file,
      skip: `OUTPUT INVALID (${err.message})`,
      how,
      insAt,
      ctx: JSON.stringify(src.slice(Math.max(0, insAt - 90), insAt + 90)),
      notes,
    };
  }
  return { base, file, src, out, id, name, category, accent, how, title: titleNode ? headingOf(titleNode) : null, kinds: splices.map((s) => s.kind), notes };
}

function applySplices(src, splices) {
  return splices
    .slice()
    .sort((a, b) => b.at - a.at)
    .reduce((acc, s) => acc.slice(0, s.at) + s.text + acc.slice(s.at), src);
}

/* ── run ──────────────────────────────────────────────────────────────────── */
loadMaps();
const files = fs.readdirSync(TOOLS).filter((f) => f.endsWith('.jsx')).sort();
const results = files.map((f) => planFile(path.join(TOOLS, f)));
const ok = results.filter((r) => r.out);
const bad = results.filter((r) => r.skip);

console.log(`tools: ${files.length}  |  writable: ${ok.length}  |  skipped: ${bad.length}`);
const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad('file', 40)} ${pad('how', 17)} ${pad('title', 4)} ${pad('accent', 8)} kinds`);
for (const r of ok) {
  console.log(`${pad(r.base, 40)} ${pad(r.how, 17)} ${pad(r.title || '-', 4)} ${pad(r.accent, 8)} ${r.kinds.join(',')}${r.notes.length ? '  // ' + r.notes.join('; ') : ''}`);
}
for (const r of bad) console.log(`${pad(r.base, 40)} SKIP: ${r.skip}`);
const tally = {};
for (const r of ok) for (const k of r.kinds) tally[k] = (tally[k] || 0) + 1;
console.log('\nkinds:', JSON.stringify(tally));

fs.writeFileSync('/tmp/sov-band-report.json', JSON.stringify(results.map(({ src, out, ...r }) => r), null, 2));

if (APPLY) {
  let n = 0;
  for (const r of ok) {
    fs.writeFileSync(r.file, r.out);
    n++;
  }
  console.log(`\nWROTE ${n} files.`);
} else {
  console.log('\n(dry run — pass --apply to write)');
}
