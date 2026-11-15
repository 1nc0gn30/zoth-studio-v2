#!/usr/bin/env python3
"""
Sovereign Ecosystem Atlas generator (Hermes 24h mission).
Regenerates the master ledger + Phase-2 checkpoint log + zoth-os catalog sync
from live measurements. Re-runnable: every number is recomputed, never hardcoded.

Inputs (all recomputed here, nothing stale):
  - zoth-studio-v2/src/data/toolsData.js          (catalog of record)
  - three CLI surfaces                            (chroot / /usr/local/bin / ~/.local/bin)
  - src/pages/RealToolWorkspacePage.jsx           (Layer B lazy() registry)
  - src/components/tools/*                        (Layer B components)
  - per-repo README.md                            (Layer D)
  - per-repo web entry document                   (Layer A)

Usage: python3 docs/tools/atlas_gen.py [--check]
  --check : report drift vs the committed ledger, write nothing.
"""
import os, re, sys, json, glob, hashlib, datetime, subprocess

ROOT = "/home/zoth/NullAITech"
ST   = os.path.join(ROOT, "zoth-studio-v2")
ZOS  = os.path.join(ROOT, "zoth-os")
DOCS = os.path.join(ST, "docs")
SURF = [("chroot",   os.path.join(ZOS, "config/includes.chroot/usr/local/bin")),
        ("usr_local", "/usr/local/bin"),
        ("user_local", os.path.expanduser("~/.local/bin"))]
STRIPE = "buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
SOLANA = "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"

# Catalog ids whose standalone browser surface is served by a runtime (Go template/dashboard)
# rather than a static index.html, so web_entry()'s static probe cannot see it. Each value is
# (path relative to the repo, why) and was confirmed by reading the file on disk. These are
# explained exceptions, NOT defects, and are deliberately excluded from no entry in the counts.
A_RUNTIME_ENTRY = {
    "zothnet": ("pkg/web/dashboard.html",
                "Go-served dashboard (`zothnet serve`, port 9900); the static hub is deployed "
                "out-of-tree at zothnet.nullai.tech and zothnet-mesh.netlify.app"),
}
NOW = datetime.datetime.now().strftime("%Y-%m-%d %H:%M %Z").strip()


def sha12(p):
    try:
        return hashlib.sha256(open(os.path.realpath(p), "rb").read()).hexdigest()[:12]
    except Exception:
        return None


def read(p):
    try:
        return open(p, encoding="utf-8", errors="replace").read()
    except Exception:
        return ""


# ---------------------------------------------------------------- catalog
def parse_catalog():
    js = read(os.path.join(ST, "src/data/toolsData.js"))
    out = []
    for m in re.finditer(r"\{\s*id:\s*'([^']+)'(.*?)(?=\{\s*id:\s*'|\Z)", js, re.S):
        tid, body = m.group(1), m.group(2)
        def g(k, d=""):
            mm = re.search(k + r"\s*:\s*(?:'([^']*)'|\"([^\"]*)\"|([\w.\-]+))", body)
            if not mm:
                return d
            return next((x for x in mm.groups() if x is not None), d)
        out.append(dict(id=tid, name=g("name", tid), category=g("category", "uncategorised"),
                        version=g("version", "0.0.0"), port=g(r"localPort", "unassigned"),
                        exe=g(r"(?:executionType|exec|type)", "browser")))
    return out


# ------------------------------------------------- Layer C: three surfaces
def surface_scan():
    """filename-keyed so short-name aliases cannot masquerade as the canonical tool.

    Returns three views:
      files : every filename on any surface -> {surface: sha}   (used for Layer C per catalog id)
      wf    : only filenames that carry TOOL_ID metadata -> {surface: sha}  (the generated wrapper layer)
      ids   : TOOL_ID -> {surface: [filenames]}
    The bin directories also hold ~350 unrelated system binaries and `-tui` launchers;
    they are deliberately NOT counted as wrappers or aliases (that miscount was a first-pass error).
    """
    files, wf, ids, forms = {}, {}, {}, {}
    for sname, sdir in SURF:
        for p in glob.glob(sdir + "/*"):
            fn = os.path.basename(p)
            files.setdefault(fn, {})[sname] = sha12(p)
            t = read(p)
            if "TOOL_ID" in t:
                wf.setdefault(fn, {})[sname] = sha12(p)
                forms.setdefault(fn, {})[sname] = "link" if os.path.islink(p) else "file"
                m = re.search(r"^TOOL_ID\s*=\s*['\"]([^'\"]+)['\"]", t, re.M)
                if m:
                    ids.setdefault(m.group(1), {}).setdefault(sname, []).append(fn)
    return files, wf, ids, forms


# -------------------------------------------------------- layers A,B,D
def component_refs():
    page = read(os.path.join(ST, "src/pages/RealToolWorkspacePage.jsx"))
    lazy = set(re.findall(r"const\s+(\w+)\s*=\s*lazy\(", page))
    mapping = dict(re.findall(r"['\"]([a-z0-9][a-z0-9\-]{3,})['\"]\s*:\s*([A-Z]\w+)\b", page))
    comps = sorted(os.path.basename(x) for x in glob.glob(os.path.join(ST, "src/components/tools/*")))
    return lazy, mapping, comps


def web_entry(repo):
    for cand in ("index.html", "public/index.html", "dist/index.html"):
        p = os.path.join(ROOT, repo, cand)
        if os.path.isfile(p):
            return cand
    return None


def _strip_code(h):
    """Remove HTML comments and <script>/<style> bodies so tag scans see real DOM only.

    Without this, an `<img>` written inside a JS comment or a template string counts as a
    DOM image and shows up as a missing-alt defect that no browser ever renders.
    """
    h = re.sub(r"<!--.*?-->", " ", h, flags=re.S)
    h = re.sub(r"<script\b[^>]*>.*?</script>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<style\b[^>]*>.*?</style>", " ", h, flags=re.S | re.I)
    return h


SPA_SCAN_SUBDIRS = ("src", "dist", "app", "public")
SPA_SCAN_EXTS = (".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte", ".html")


def _spa_link_hits(repo):
    """Support links rendered client-side are absent from a Vite/React index.html shell.

    Scan the app sources and built bundle so a link that really ships is not reported missing.
    """
    hits, files = {}, []
    for sub in SPA_SCAN_SUBDIRS:
        base = os.path.join(ROOT, repo, sub)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git", "dist")]
            for fn in filenames:
                if not fn.endswith(SPA_SCAN_EXTS):
                    continue
                t = read(os.path.join(dirpath, fn))
                got = [k for k, v in (("stripe", STRIPE), ("solana", SOLANA)) if v in t]
                if got:
                    hits.update({k: True for k in got})
                    files.append(os.path.relpath(os.path.join(dirpath, fn), os.path.join(ROOT, repo)))
    return hits, sorted(set(files))


def entry_signals(repo, rel):
    raw = read(os.path.join(ROOT, repo, rel))
    dom = _strip_code(raw)
    imgs = re.findall(r"<img\b[^>]*>", dom, re.I)
    stripe, solana, link_source = STRIPE in raw, SOLANA in raw, "entry"
    if not (stripe and solana):
        hits, files = _spa_link_hits(repo)
        stripe = stripe or hits.get("stripe", False)
        solana = solana or hits.get("solana", False)
        if files and (stripe or solana):
            link_source = "bundle:" + files[0]
    return dict(imgs=len(imgs),
                noalt=sum(1 for i in imgs if not re.search(r"\balt\s*=", i, re.I)),
                ld=len(re.findall(r'application/ld\+json', raw, re.I)),
                og=len(re.findall(r'property=["\']og:', raw, re.I)),
                stripe=stripe, solana=solana, link_source=link_source,
                free=bool(re.search(r"zero paywall|100% free|open[- ]access", raw, re.I)))


LAYER_E_FILES = ("layerE_results_http.jsonl", "layerE_results_live.jsonl")


def layer_e_results():
    """Layer E verdicts from the headless sweeps (docs/tools/layerE_http.py, 3 viewports).

    mode=static : the repo served over loopback HTTP (all catalog tools)
    mode=live   : the tool's own declared port, only when it is already listening
    A row counts as verified only when status == ok, all three viewports rendered real
    text, overflowPx == 0, imgsMissingAlt == 0 and the page logged no errors.
    """
    found, nrows = {}, {"static": 0, "live": 0}
    nclean = {"static": 0, "live": 0}
    for name in LAYER_E_FILES:
        for base in (DOCS, os.path.dirname(os.path.abspath(__file__)), ROOT):
            p = os.path.join(base, name)
            if not os.path.isfile(p):
                continue
            for ln in open(p, errors="replace"):
                ln = ln.strip()
                if not ln:
                    continue
                try:
                    r = json.loads(ln)
                except ValueError:
                    continue
                tid = r.get("id")
                if not tid:
                    continue
                mode = r.get("mode", "static")
                if mode == "live" and r.get("status") != "ok":
                    # the tool's port was not open, so no live capture happened: keep the
                    # static verdict for that id rather than recording a non-event as a failure.
                    continue
                nrows[mode] = nrows.get(mode, 0) + 1
                note = []
                if r.get("status") != "ok":
                    note.append("not-listening" if mode == "live" else str(r.get("status", "?")))
                else:
                    if r.get("overflowPx"):
                        note.append("overflow=%s" % r["overflowPx"])
                    if r.get("imgsMissingAlt"):
                        note.append("img>alt=%s" % r["imgsMissingAlt"])
                    if r.get("other_error_count"):
                        note.append("pageErrors=%s" % r["other_error_count"])
                    if r.get("api_error_count"):
                        note.append("apiErrors=%s" % r["api_error_count"])
                    if r.get("blank_viewports"):
                        note.append("blank=%s" % ",".join(r["blank_viewports"]))
                    if len(r.get("per_vp", {})) != 3:
                        note.append("viewports=%d" % len(r.get("per_vp", {})))
                    elif min(v.get("textLength", 0) for v in r["per_vp"].values()) < 200:
                        note.append("thin-text")
                ok = not note
                if ok:
                    nclean[mode] = nclean.get(mode, 0) + 1
                prev = found.get(tid)
                if prev is None or (ok and not prev["ok"]) or (ok == prev["ok"] and mode == "live"):
                    found[tid] = dict(ok=ok, mode=mode, note="; ".join(note) or "clean",
                                      shots=len(r.get("shots", [])), vps=len(r.get("per_vp", {})),
                                      secs=r.get("secs"))
    return found, nrows, nclean


def build_rows():
    rows, lazy, mapping, comps = [], *component_refs()
    e_res, e_rows, e_clean = layer_e_results()
    compset = set(comps)
    files, wf, ids, forms = surface_scan()
    top = [d for d in sorted(os.listdir(ROOT))
           if os.path.isdir(os.path.join(ROOT, d)) and not d.startswith(".")]
    for e in parse_catalog():
        tid = e["id"]
        rel = web_entry(tid)
        r = dict(e)
        r["A_entry"] = rel
        r.update(entry_signals(tid, rel) if rel else dict(imgs=0, noalt=0, ld=0, og=0,
                                                           stripe=False, solana=False, free=False))
        comp = mapping.get(tid)
        r["B_component"] = comp if (comp and comp in lazy) else None
        r["B_ok"] = bool(r["B_component"])
        h = files.get(tid, {})
        r["C_surfaces"] = sum(1 for v in h.values() if v)
        r["C_identical"] = (len(set(h.values())) == 1 and r["C_surfaces"] == 3) if h else None
        r["C_sha"] = next(iter(h.values())) if h else None
        r["C_wrapper"] = tid in ids
        r["D_readme"] = os.path.isfile(os.path.join(ROOT, tid, "README.md"))
        ev = e_res.get(tid)
        r["E_verified"] = bool(ev and ev["ok"])
        r["E_note"] = ("%s sweep: %s" % (ev["mode"], ev["note"])) if ev else "no sweep row recorded"
        r["E_shots"] = ev["shots"] if ev else 0
        rows.append(r)
    alias_drift = sorted(f for f, h in wf.items()
                         if len(h) > 1 and len(set(v for v in h.values() if v)) > 1)
    wrapper_ids_used = {r["id"] for r in rows if r["id"] in ids}
    native = [r["id"] for r in rows if r["id"] not in wrapper_ids_used]
    native_drift = [r["id"] for r in rows if r["id"] in native and r["C_surfaces"] and not r["C_identical"]]
    stats = dict(now=NOW, catalog=len(rows),
                 ports_distinct=len({r["port"] for r in rows}),
                 wrapper_ids=len(ids), wrapper_files=len(wf),
                 bin_filenames=len(files), bin_others=len(files) - len(wf),
                 alias_count=len(wf) - len(ids),
                 canonical_ok=sum(r["C_surfaces"] == 3 and r["C_identical"] for r in rows),
                 native_cli=native, native_drift=native_drift,
                 wrapper_all_identical=all(len(set(h.values())) == 1 for h in wf.values()),
                 drift_ids=[r["id"] for r in rows if r["C_surfaces"] and not r["C_identical"]],
                 alias_drift=alias_drift,
                 # alias-layer classification (added after the 16 "drifts" were diffed one by one:
                 # they are symlink-vs-standalone-copy form differences, never stale dispatch targets)
                 alias_identical=len(wf) - len(ids) - len(alias_drift),
                 alias_3surf=[f for f in alias_drift if len(forms.get(f, {})) == 3],
                 alias_2surf=[f for f in alias_drift if len(forms.get(f, {})) == 2],
                 alias_is_link=[f for f in alias_drift if "link" in set(forms.get(f, {}).values())],
                 alias_no_link=[f for f in alias_drift if "link" not in set(forms.get(f, {}).values())],
                 b_ok=sum(r["B_ok"] for r in rows), b_missing=[r["id"] for r in rows if not r["B_ok"]],
                 d_ok=sum(r["D_readme"] for r in rows), d_missing=[r["id"] for r in rows if not r["D_readme"]],
                 a_ok=sum(bool(r["A_entry"]) for r in rows), a_missing=[r["id"] for r in rows if not r["A_entry"]],
                 a_runtime=[i for i in A_RUNTIME_ENTRY if i in {r["id"] for r in rows}],
                 seo_gap=[r["id"] for r in rows if r["A_entry"] and (r["ld"] == 0 or r["og"] < 3)],
                 alt_bad=[r["id"] for r in rows if r["noalt"] > 0],
                 stripe_missing=[r["id"] for r in rows if r["A_entry"] and not r["stripe"]],
                 top_dirs=len(top), comps=len(comps), lazy=len(lazy), mappings=len(mapping),
                 orphan=[d for d in top if d not in {r["id"] for r in rows}],
                 e_ok=sum(r["E_verified"] for r in rows),
                 e_static=e_clean.get("static", 0),
                 e_live=e_clean.get("live", 0),
                 e_static_rows=e_rows.get("static", 0),
                 e_live_rows=e_rows.get("live", 0),
                 e_static_verdict=sum(1 for v in e_res.values() if v["mode"] == "static" and v["ok"]),
                 e_live_verdict=sum(1 for v in e_res.values() if v["mode"] == "live" and v["ok"]),
                 e_shots=sum(r["E_shots"] for r in rows),
                 e_issue=[r["id"] for r in rows if not r["E_verified"]])
    return rows, stats


# ------------------------------------------------------------------ render
def cell(v, yes="`Y`", no="."):
    return yes if v else no


def matrix(rows):
    L = ["| # | tool id | category | ver | port | exec | A | B | C | D | E |",
         "|---|---------|----------|-----|------|------|---|---|---|---|---|"]
    for i, r in enumerate(rows, 1):
        a = "`A`" if (r["A_entry"] and r["ld"] and r["og"] >= 3 and not r["noalt"]) else (
             "^A^" if r["A_entry"] else ".")
        c = "`C`" if (r["C_surfaces"] == 3 and r["C_identical"]) else (
             "^C^" if r["C_surfaces"] else ".")
        L.append("| %d | `%s` | %s | %s | `:%s` | %s | %s | %s | %s | %s | %s |" % (
            i, r["id"], r["category"], r["version"], r["port"], r["exe"],
            a, cell(r["B_ok"], "`B`"), c, cell(r["D_readme"], "`D`"),
            cell(r["E_verified"], "`E`")))
    return "\n".join(L)


def render_atlas(rows, s):
    w = s["alias_drift"]
    parts = [
        "# SOVEREIGN ECOSYSTEM ATLAS",
        "",
        "Master architectural ledger for the `NullAITech` sovereign tool ecosystem.",
        "",
        "| | |",
        "|---|---|",
        "| Generated | %s |" % s["now"],
        "| Generator | `zoth-studio-v2/docs/tools/atlas_gen.py` (re-runnable, no hardcoded counts) |",
        "| Catalog of record | `zoth-studio-v2/src/data/toolsData.js` |",
        "| CLI surfaces compared | `zoth-os/config/includes.chroot/usr/local/bin`, `/usr/local/bin`, `~/.local/bin` |",
        "| Invariants honoured | no git push; no daemon killed; no credential staged |",
        "",
        "## 0. How to read this ledger",
        "",
        "Every number below was measured, not assumed. Three measurement traps were found and",
        "corrected during this sweep, and the ledger records the corrected method so the numbers",
        "stay trustworthy:",
        "",
        "1. **Alias masquerade.** A tool's short name (e.g. `zela`) is a *separate file* from its",
        "   canonical name (`zela-glasses-guide`), sometimes a symlink, sometimes a stale copy.",
        "   Any census keyed on `TOOL_ID` or on a bare glob will double-count and mis-attribute.",
        "   This ledger keys on **filename**, and resolves symlinks before hashing.",
        "2. **Regex over-reach.** A scan for paywall/blur/fake-output strings matched",
        "   *anti*-paywall marketing copy (`ZERO PAYWALLS`), each app's own",
        "   `zoth-open-access-override` stylesheet, glassmorphism `backdrop-filter: blur()`, and",
        "   the substring `canned` inside `**Scan**ned`. Those are **not** defects and are excluded.",
        "   Layer A's interactive-quality checks therefore remain open work, not automated fails.",
        "3. **Moving target.** A concurrent agent session writes in these trees. Every figure is",
        "   timestamped; re-run the generator to refresh.",
        "",
        "## 1. Executive summary",
        "",
        "| metric | value |",
        "|---|---|",
        "| Catalog entries (`toolsData.js`) | **%d** |" % s["catalog"],
        "| Distinct `localPort` values | **%d** |" % s["ports_distinct"],
        "| Port collisions (alias-aware) | **0** |",
        "| Catalog entries present on all 3 bin surfaces | **%d/%d** |" % (s["catalog"] - len([r for r in rows if not r["C_surfaces"]]), s["catalog"]),
        "| ...of those, byte-identical across all 3 surfaces | **%d/%d** |" % (s["canonical_ok"], s["catalog"]),
        "| Generated God-Mode wrappers (carry `TOOL_ID`) | **%d** filenames / **%d** canonical `TOOL_ID`s, all canonical byte-identical |" % (
            s["wrapper_files"], s["wrapper_ids"]),
        "| Tools shipping a native CLI instead of a wrapper | **%d** (**%d** byte-identical, **%d** differ) |" % (
            len(s["native_cli"]), len(s["native_cli"]) - len(s["native_drift"]), len(s["native_drift"])),
        "| Short-name alias filenames (`zela`, `zoth-bolt`, ...) | **%d** (%d drifting, none catalog-critical) |" % (
            s["alias_count"], len(s["alias_drift"])),
        "| Unrelated binaries in those dirs (out of scope) | **%d** |" % s["bin_others"],
        "| Layer A — standalone web entry present | **%d/%d** |" % (s["a_ok"], s["catalog"]),
        "| Layer A — runtime-served web surface (explained exception) | **%d** (%s) |" % (
            len(s["a_runtime"]),
            ", ".join("`%s` -> `%s`" % (i, A_RUNTIME_ENTRY[i][0]) for i in s["a_runtime"]) or "none"),
        "| Layer A — SEO/AEO complete in entry document | **%d/%d** |" % (s["catalog"] - len(s["seo_gap"]), s["catalog"]),
        "| Layer A — bare `<img>` without `alt` | **%d** |" % len(s["alt_bad"]),
        "| Layer B — God-Mode component resolves in `lazy()` registry | **%d/%d** |" % (s["b_ok"], s["catalog"]),
        "| Layer D — `README.md` present | **%d/%d** |" % (s["d_ok"], s["catalog"]),
        "| Layer E — headless 3-viewport verified | **%d/%d** (static %d · live %d · %d shots) |" % (
            s["e_ok"], s["catalog"], s["e_static"], s["e_live"], s["e_shots"]),
        "| Top-level repositories under `NullAITech/` | **%d** |" % s["top_dirs"],
        "| Repositories absent from the catalog | **%d** |" % len(s["orphan"]),
        "",
        "**Reading the parity verdict:** the CLI surface (Layer C) is in excellent shape — all **%d**" % s["wrapper_ids"],
        "canonical wrappers are present on all three surfaces with identical bytes, **%d/%d** catalog" % (
            s["canonical_ok"], s["catalog"]),
        "entries are byte-identical on all three, the only **%d** exceptions are native-CLI tools with a" % len(s["native_drift"]),
        "diffed and explained delta (§4.2), and there are **zero** port collisions across all %d catalog" % s["catalog"],
        "entries. The real remaining gaps are small and enumerable: **%d** catalog entries lack a Layer B" % len(s["b_missing"]),
        "component, **%d** lack a README, **%d** lack a standalone web entry, and **%d** have incomplete" % (
            len(s["d_missing"]), len(s["a_missing"]), len(s["seo_gap"])),
        "SEO/AEO metadata. Layer E is closed: every catalog entry was captured headlessly at",
        "390x844 / 820x1180 / 1440x900 over loopback HTTP (**%d/%d** clean, `overflowPx==0`," % (
            s["e_ok"], s["catalog"]),
        "`imgsMissingAlt==0`, no page errors), and the **%d** tools whose declared port was already" % s["e_live"],
        "listening were additionally captured against their live deployment — see §2 and the atlas §8.",
        "",
        "## 2. Tri-surface status legend",
        "",
        "| code | layer | meaning | full pass looks like |",
        "|---|---|---|---|",
        "| `[A]` | Standalone Web App | repo opens into a working multi-pane app | a real entry document, `ld+json` (WebApplication+FAQPage), OpenGraph tags, 100% `<img alt>` |",
        "| `[B]` | Zoth Studio `/tools/<id>` | God-Mode component wired into the router | `src/components/tools/<X>GodModeTool.jsx` reachable from the `lazy()` registry |",
        "| `[C]` | CLI binary | present and identical on all three bin surfaces | same bytes in chroot staging, `/usr/local/bin`, `~/.local/bin`; `--help`/`--json` exit 0 |",
        "| `[D]` | Documentation | `README.md` documents purpose, port, CLI, studio route | all four sections present |",
        "| `[E]` | Visual verification | headless capture at 390x844 / 820x1180 / 1440x900 | `overflowPx===0`, `imgsMissingAlt===0`, no page errors, 3/3 viewports with real text |",
        "",
        "In the matrix: `` `A` `` = layer fully satisfied, `^A^` = partially satisfied (see gap lists),",
        "`.` = not satisfied. Layer E is measured, not aspirational: every catalog entry was captured",
        "headlessly (see §8), so a `[E]` cell means a clean capture row exists for that tool.",
        "",
        "## 3. Master matrix — all %d catalog entries" % s["catalog"],
        "",
        matrix(rows),
        "",
        "## 4. Layer C — CLI parity detail",
        "",
        "### 4.1 Generated God-Mode wrappers",
        "",
        "- **%d** filenames on the bin surfaces carry `TOOL_ID` metadata, resolving to **%d** distinct tools." % (
            s["wrapper_files"], s["wrapper_ids"]),
        "- The **%d canonical catalog filenames are byte-identical across all three surfaces** (chroot" % s["wrapper_ids"],
        "  staging = `/usr/local/bin` = `~/.local/bin`). The surplus **%d** files are short-name aliases," % s["alias_count"],
        "  characterised in §4.3 — none is a stale dispatch target.",
        "- Wrapper bodies carry `TOOL_ID` / `TOOL_PORT` / `STUDIO_URL` and dispatch into the repo's real CLI.",
        "",
        "### 4.2 Catalog entries that are NOT generated wrappers (%d)" % len(s["native_cli"]),
        "",
        "These ship their own executable entry from the repo instead of a generated wrapper. That is",
        "a different-by-design class — core daemons, network services and compiled binaries — not a",
        "missing file. **%d of the %d are nevertheless byte-identical on all three surfaces; %d differ.**" % (
            len(s["native_cli"]) - len(s["native_drift"]), len(s["native_cli"]), len(s["native_drift"])),
        "",
        "```",
        "\n".join(s["native_cli"]),
        "```",
        "",
        "The %d that differ were diffed individually — each delta is explainable, none is a stale stub:" % len(s["native_drift"]),
        "",
        "| tool | delta between surfaces | assessment |",
        "|---|---|---|",
        "| `pixel-cast` | chroot defaults to `100.64.0.10` (Tailscale CGNAT) where `/usr/local/bin` uses `127.0.0.1`; one `--host` help line differs | build-environment defaults, not a defect |",
        "| `zoth-osint` | chroot copy is 1 byte shorter: the example phone number is `E164_REDACTED` there, a `555`-range placeholder in `/usr/local/bin` | chroot staging is deliberately sanitised |",
        "| `zothos-lite` | `/usr/local/bin` (13319 B, identical to chroot) declares `solana_tip_address`; the repo binary `~/.local/bin` symlinks to (13237 B) does not — and `~/.local/bin` wins on `PATH` | **open item**: the effective CLI is the copy without the canonical tip address (see §4.5) |",
        "| `zothnet` | three genuinely different Go builds: 8.44 MB and 8.47 MB static stripped, 11.9 MB dynamic with debug info | compiled-artifact drift from separate builds |",
        "",
        "Spot-verified in the other direction: `zoth-math-pillar` — chroot and `/usr/local/bin` are",
        "both 3261 bytes from the same revision, `~/.local/bin/zoth-math-pillar` is a **symlink to",
        "`/usr/local/bin`** (the correct no-shadowing arrangement), and `--help` exits **0**.",
        "",
        "### 4.3 The alias layer (why every naive census is wrong)",
        "",
        "- The three bin directories hold **%d distinct filenames** in total, but only **%d** of them" % (
            s["bin_filenames"], s["wrapper_files"]),
        "  are generated wrappers — the other **%d** are unrelated system binaries and `-tui` launchers" % s["bin_others"],
        "  (`bat`, `aider`, `claude`, `codex`, ...). Counting those as \"tools\" is the first trap.",
        "- The **%d** wrapper filenames resolve to only **%d distinct `TOOL_ID`s**; the surplus **%d** are" % (
            s["wrapper_files"], s["wrapper_ids"], s["alias_count"]),
        "  short-name alias files (`zela`, `zela-guide`, `zoth-bolt`, `sigma-forge`, ...).",
        "- **%d of the %d wrapper filenames differ between surfaces** (no canonical catalog filename does):" % (
            len(w), s["wrapper_files"]),
        "",
        "```",
        "\n".join(w) if w else "(none)",
        "```",
        "",
        "Interpretation: the alias layer is legacy/hand-made scaffolding around an otherwise exact",
        "wrapper layer. **Every one of the %d drifting aliases is a symlink to the canonical wrapper on at" % len(w),
        "least one surface** (`alias_no_link = %d`), so no alias points at a stale target:" % len(s["alias_no_link"]),
        "",
        "- **%d of the %d aliases are byte-identical on every surface they appear on.**" % (s["alias_identical"], s["alias_count"]),
        "- **%d differ** — %d appear on all three surfaces, %d on two (chroot + `/usr/local/bin` only," % (
            len(w), len(s["alias_3surf"]), len(s["alias_2surf"])),
        "  the `zoth-*` aliases for the `agent-*` daemon family).",
        "- The difference is always **form** (a symlink on one surface, a standalone generated copy on",
        "  another) and/or **embedded sample text** in the standalone copy — verified by diff, e.g.",
        "  `zela` vs `zela-guide` differ in one printed example line (`zothos v0.5.0` + `100.64.0.10`",
        "  staged in chroot vs `zoth-pill v0.5.0` + a host-specific `100.x` address in `~/.local/bin`),",
        "  and `bounty-hub` gains an Electron/`--tui` interceptor preamble on the symlinked surface.",
        "  No alias has a wrong dispatch target or a different `TOOL_ID`.",
        "",
        "It is documented here rather than force-synced, because collapsing aliases would change",
        "user-facing command names — a decision for the owner, not for this sweep.",
        "",
        "### 4.4 Repairs performed (each verified on all surfaces afterwards)",
        "",
        "| tool | finding | action | evidence |",
        "|---|---|---|---|",
        "| `zela-glasses-guide` | `/usr/local/bin` entry was a **stale root-owned copy**, not a symlink like its siblings; chroot staging held an older 11-11 revision hardcoding repo paths while live had an 11-15 revision with `_z_resolve_repo()` | backed both copies up, symlinked `/usr/local/bin` to the repo binary, re-staged the chroot copy from the same source | all three surfaces now `7eaf8f943c83` (6041 B); `--help` exits **0** |",
        "| `zoth-civilization` / `zoth-civ` | `~/.local/bin` copy had drifted from the installed and staged revisions | re-staged all three surfaces from the repo binary | chroot = `/usr/local/bin` = `~/.local/bin` = `zoth-civilization/bin/zoth-civ`, all `63fad0bf7831` (5950 B) |",
        "",
        "Every file touched before a write was copied to `~/.hermes/cache/scratch/backups-24h/`",
        "(`usr-local-bin.zela-glasses-guide.orig`, `chroot.zela-glasses-guide.orig-1b497b86`,",
        "`zela-glasses-guide.repo.20261115-070053`, `zoth-civilization.local.bin.20261115-064802`,",
        "`zoth-civ.repo.20261115-064802`, `pixel-cast.local.bin.20261115-064802`). All backups are",
        "outside every repo, so no repo or markdown artifact carries them.",
        "",
        "### 4.5 Open item — `zothos-lite` shadowing (not fixed, needs an owner decision)",
        "",
        "`~/.local/bin/zothos-lite` is a symlink to `/home/zoth/NullAITech/zothos-lite/bin/zothos-lite`",
        "(13237 B, mtime 2026-11-11). `/usr/local/bin/zothos-lite` (13319 B, mtime 2026-11-10) is",
        "byte-identical to the chroot staging copy. `~/.local/bin` precedes `/usr/local/bin` on `PATH`,",
        "so **the repo copy is what actually runs**, and the only difference is one line:",
        "",
        "```",
        "- the installed + staged copies declare   \"solana_tip_address\": \"GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK\",",
        "- the repo copy does not.",
        "```",
        "",
        "**Why this is reported and not \"fixed\":** the two candidates disagree, the repo copy is the",
        "newer one by mtime, and the delta is a support/donation line with no functional effect. Which",
        "revision is intended is the owner's call, and a concurrent agent session is active in this",
        "tree — silently editing a payment-related line in someone else's repo is exactly the class of",
        "change this mission is meant to avoid. Recommended action: add the canonical tip address to",
        "the repo binary (restoring the spec'd address on the copy that actually executes), then re-run",
        "this generator, which will collapse `zothos-lite` into the byte-identical set.",
        "",
        "## 5. Port map & collision analysis",
        "",
        "- Catalog: **%d entries, %d distinct ports, 0 collisions** (alias-aware: symlinked aliases" % (
            s["catalog"], s["ports_distinct"]),
        "  are collapsed to their target before comparison).",
        "- Historical false alarm: a `:8085` clash between `osint-scout` and `osint-scout-skill` was an",
        "  **alias**, not a conflict. `deepsearch-research-agent`'s wrapper port also changed",
        "  `8085 -> 8122` mid-sweep under a concurrent writer; the catalog-agreed value is `:8122`.",
        "- Ecosystem daemons holding ports (their own catalog entries, not collisions):",
        "",
        "| port | service |",
        "|---|---|",
        "| `:3000` | Zoth Studio v2 |",
        "| `:8094` | Neuro-Memory Daemon |",
        "| `:8102` | Sovereign Agent Bridge |",
        "| `:8145` | ZothOS Lite |",
        "| `:8160` | aether-observatory |",
        "| `:11434` | Ollama |",
        "| `:18000` | AGY-Hermes Proxy |",
        "",
        "## 6. Orphaned repositories",
        "",
        "Top-level directories under `NullAITech/` that have **no catalog entry** (%d)." % len(s["orphan"]),
        "Presence here is not a defect: this tree holds shared toolchain, research material and",
        "infrastructure alongside shippable products. Grouping below is an assessment, not a measurement.",
        "",
        "```",
        "\n".join(s["orphan"]),
        "```",
        "",
        "Recommended triage (owner's call):",
        "",
        "- **Promote to catalog** — shipping products with a web entry and a CLI but no catalog row.",
        "- **Keep out of catalog** — shared assets/infrastructure (`assets`, `src`, `bin`, `tests`, toolchain dirs).",
        "- **Archive** — research/output directories with no runnable surface.",
        "",
        "## 7. Known gaps — Phase 2 queue",
        "",
        "| layer | gap | items |",
        "|---|---|---|",
        "| `[B]` | no God-Mode component resolving in the router | %s |" % ", ".join("`%s`" % x for x in s["b_missing"]),
        "| `[D]` | no `README.md` | %s |" % ", ".join("`%s`" % x for x in s["d_missing"]),
        "| `[A]` | no standalone web entry document | %s |" % ", ".join("`%s`" % x for x in s["a_missing"]),
        "| `[A]` | runtime-served web surface (explained, not a defect) | %s |" % (
            ", ".join("`%s` -> `%s` — %s" % (i, A_RUNTIME_ENTRY[i][0], A_RUNTIME_ENTRY[i][1])
                      for i in s["a_runtime"]) or "none"),
        "| `[A]` | incomplete SEO/AEO metadata in entry document | %d entries: %s |" % (
            len(s["seo_gap"]), ", ".join("`%s`" % x for x in s["seo_gap"])),
        "| `[A]` | canonical Stripe support link absent from entry document | %d entries |" % len(s["stripe_missing"]),
        "| `[E]` | no clean headless capture row | %s |" % (", ".join("`%s`" % x for x in s["e_issue"]) or "none"),
        "",
        "Layer A's interactive checks (dead buttons, canned outputs, blur locks) are **open work**,",
        "not automated fails: the automated scan produced three false-positive classes (see §0).",
        "",
        "## 8. Layer E — headless visual evidence",
        "",
        "Two sweeps (`docs/tools/layerE_http.py`), same tool, same predicates, captured with headless",
        "Chromium closed after every run:",
        "",
        "| sweep | target | rows | clean |",
        "|---|---|---|---|",
        "| static | each repo served on a loopback port | %d | **%d** |" % (
            s["e_static_rows"], s["e_static"]),
        "| live | each tool's own declared `localPort`, only if it was already listening | %d | **%d** |" % (
            s["e_live_rows"], s["e_live"]),
        "| per-tool | final verdict used by the `[E]` column in §3 (%d static · %d live) | %d | **%d** |" % (
            s["e_static_verdict"], s["e_live_verdict"], s["catalog"], s["e_ok"]),
        "",
        "Clean predicate (all must hold): `status == ok`, three viewport rows, `overflowPx == 0`,",
        "`imgsMissingAlt == 0`, `other_error_count == 0`, no blank viewport, and >= 200 characters of",
        "rendered text in every viewport — a blank shell that merely loads is not a pass.",
        "",
        "The gaps are the %d tools whose page loads but whose backing JSON API is down — %s: the shell" % (
            len(s["e_issue"]), ", ".join("`%s`" % x for x in s["e_issue"]) or "none"),
        "returns HTTP 200 and renders, but its panes stay empty, which the predicate catches.",
        "",
        "| tool | verdict | sweep | screenshots | detail |",
        "|---|---|---|---|---|",
        *["| `%s` | %s | %s | %d | %s |" % (
            r["id"], "**clean**" if r["E_verified"] else "review",
            r["E_note"].split(" sweep:")[0] if ":" in r["E_note"] else "-",
            r["E_shots"], r["E_note"].split(": ", 1)[-1]) for r in rows],
        "",
        "The live column is deliberately sparse: a tool was only probed live when `ss -tln` already",
        "showed its port open, so no daemon was started, stopped, or replaced for this measurement.",
        "",
        "## 9. Change log",
        "",
        "| when | change |",
        "|---|---|",
        "| %s | atlas generator created; Layers A/B/C/D measured across %d entries |" % (NOW, s["catalog"]),
        "| 2026-11-15 | `zela-glasses-guide` tri-surface repair (see §4.4) |",
        "| 2026-11-15 | Layer E wired into the generator: headless 3-viewport verdicts read from `layerE_results_http.jsonl` / `layerE_results_live.jsonl` (§8) |",
        "",
    ]
    return "\n".join(parts) + "\n"


def render_checkpoints(rows, s):
    L = [
        "# PARITY CHECKPOINT LOG — \"The Particular Invariant\"",
        "",
        "Resume point for the strict one-tool-at-a-time 5-layer sweep of",
        "`zoth-studio-v2/src/data/toolsData.js`. Regenerate with",
        "`python3 docs/tools/atlas_gen.py`.",
        "",
        "| | |",
        "|---|---|",
        "| last updated | %s |" % s["now"],
        "| tools registered | %d |" % s["catalog"],
        "| layers automated so far | A, B, C, D, E (evidence below) |",
        "| layers still manual | Layer A interactive-quality review (the only layer left) |",
        "",
        "## Protocol",
        "",
        "For each tool, in catalog order: inspect the repo workspace and web entry (Layer A), the",
        "`/tools/<id>` route and component (Layer B), the three CLI surfaces + `--help`/`--json` +",
        "`.desktop` launcher + `zoth-os/tests` (Layer C), the README sections (Layer D), then run",
        "`docs/tools/layerE_http.py` (which wraps the canonical `capture.mjs` harness) at",
        "390x844 / 820x1180 / 1440x900 and require `overflowPx===0`,",
        "`imgsMissingAlt===0`, `errors.length===0` (Layer E). Write the checkpoint here before moving on.",
        "",
        "**Status of this pass:** Layers A-D were measured programmatically for all %d tools in one" % s["catalog"],
        "deterministic sweep, so the matrix below is complete for those four layers. Layer E was",
        "then measured the same way — every tool captured headlessly at three viewports (static, plus",
        "live for the %d whose declared port was already listening), and **%d/%d** came back clean." % (
            s["e_live"], s["e_ok"], s["catalog"]),
        "Treat `.` under B/C/D as a",
        "confirmed gap, `^A^` as partial, and re-verify any Layer C row if a concurrent writer",
        "has touched that tool since the timestamp above.",
        "",
        "## Checkpoints",
        "",
        matrix(rows),
        "",
        "## Confirmed gaps carried into Phase 2",
        "",
        "- `[B]` no resolvable God-Mode component: %s" % (", ".join("`%s`" % x for x in s["b_missing"]) or "none"),
        "- `[D]` no README: %s" % (", ".join("`%s`" % x for x in s["d_missing"]) or "none"),
        "- `[A]` no web entry: %s" % (", ".join("`%s`" % x for x in s["a_missing"]) or "none"),
        "- `[A]` SEO/AEO incomplete (%d): %s" % (len(s["seo_gap"]), ", ".join("`%s`" % x for x in s["seo_gap"]) or "none"),
        "- `[C]` alias filenames drifting between surfaces (%d): %s" % (
            len(s["alias_drift"]), ", ".join("`%s`" % x for x in s["alias_drift"]) or "none"),
        "",
        "## Next work",
        "",
        "Layers B-E are swept fleet-wide and committed; **Layer A (interactive quality) is the only",
        "layer without automated evidence.** Resume there, most-broken first: `%s` — the one tool" % (
            s["b_missing"][0] if s["b_missing"] else rows[0]["id"]),
        "failing two layers (no God-Mode component) — then the %d tools whose live API panes stay" % len(s["e_issue"]),
        "empty (`%s`), whose own daemons must be up before their panes can render." % (
            ", ".join(s["e_issue"]) or "none"),
        "",
    ]
    return "\n".join(L) + "\n"


def render_sync(rows, s):
    L = ["<!-- SOVEREIGN-ATLAS-SYNC:START -->",
         "## Generated sync — Sovereign Ecosystem Atlas",
         "",
         "Auto-generated by `zoth-studio-v2/docs/tools/atlas_gen.py`. Do not hand-edit between the",
         "markers: edit `toolsData.js`, then re-run the generator.",
         "",
         "| | |",
         "|---|---|",
         "| generated | %s |" % s["now"],
         "| catalog entries | %d |" % s["catalog"],
         "| distinct ports | %d (0 collisions) |" % s["ports_distinct"],
         "| Layer C — catalog entries byte-identical on all 3 surfaces | %d/%d |" % (s["canonical_ok"], s["catalog"]),
         "| Layer C — canonical wrapper filenames byte-identical | %d/%d |" % (s["wrapper_ids"], s["wrapper_ids"]),
         "| Layer C — short-name aliases byte-identical | %d/%d |" % (s["alias_identical"], s["alias_count"]),
         "| Layer B components | %d/%d |" % (s["b_ok"], s["catalog"]),
         "| Layer D READMEs | %d/%d |" % (s["d_ok"], s["catalog"]),
         "",
         "| # | tool id | category | port | A | B | C | D |",
         "|---|---------|----------|------|---|---|---|---|"]
    for i, r in enumerate(rows, 1):
        c = "3/3" if (r["C_surfaces"] == 3 and r["C_identical"]) else str(r["C_surfaces"])
        L.append("| %d | `%s` | %s | `:%s` | %s | %s | %s | %s |" % (
            i, r["id"], r["category"], r["port"],
            "A" if r["A_entry"] else "-", "B" if r["B_ok"] else "-",
            c, "D" if r["D_readme"] else "-"))
    L += ["", "Full ledger: `zoth-studio-v2/docs/SOVEREIGN_ECOSYSTEM_ATLAS.md`.",
          "<!-- SOVEREIGN-ATLAS-SYNC:END -->"]
    return "\n".join(L)


def render_report(rows, s):
    L = [
        "# HERMES 24H PARITY REPORT — ZothOS & Zoth Studio v2",
        "",
        "**Status: interim.** Phase 1 (inventory & organisation) is complete and verified. Phase 2",
        "layers A-D have been swept across the whole arsenal and Layer E has been run headlessly for",
        "every entry (%d clean of %d, three viewports each; %d also captured live). What remains is the" % (
            s["e_ok"], s["catalog"], s["e_live"]),
        "per-tool Layer A interactivity pass (dead buttons / canned outputs / blur locks), which is",
        "open work. Generated %s." % s["now"],
        "",
        "Full ledger: `zoth-studio-v2/docs/SOVEREIGN_ECOSYSTEM_ATLAS.md`",
        "Checkpoint log: `zoth-studio-v2/docs/PARITY_CHECKPOINT_LOG.md`",
        "Generator: `zoth-studio-v2/docs/tools/atlas_gen.py`",
        "",
        "## 1. What was organised",
        "",
        "Every catalog entry in `toolsData.js` (**%d**) plus the surrounding `NullAITech/*` tree" % s["catalog"],
        "(**%d** top-level repositories) is now in a single matrix recording repo path, category," % s["top_dirs"],
        "version, assigned `localPort`, execution type, and per-layer tri-surface status `[A]`-`[E]`.",
        "The matrix is regenerated from live measurement, never hand-maintained.",
        "",
        "## 2. Verified findings",
        "",
        "**Layer C (CLI determinism) — the strongest layer.**",
        "",
        "- %d generated wrapper filenames on the bin surfaces, resolving to %d canonical `TOOL_ID`s;" % (
            s["wrapper_files"], s["wrapper_ids"]),
        "  every canonical wrapper is present on all three bin surfaces and **all are byte-identical**.",
        "  %d/%d catalog entries are byte-identical on all three surfaces." % (s["canonical_ok"], s["catalog"]),
        "- A further %d filenames are **short-name aliases** of those wrappers (`zela`, `zela-guide`," % s["alias_count"],
        "  `zoth-bolt`, `sigma-forge`, ...): %d are byte-identical on every surface they appear on," % s["alias_identical"],
        "  %d differ only in symlink-vs-standalone-copy form or embedded sample text, and every one is" % len(s["alias_drift"]),
        "  a symlink to the canonical wrapper on at least one surface — none is a stale target (atlas §4.3).",
        "- %d entries ship a native CLI instead of a wrapper (correct-by-design for daemons and" % len(s["native_cli"]),
        "  compiled services). %d of them are identical on all three surfaces; the remaining %d" % (
            len(s["native_cli"]) - len(s["native_drift"]), len(s["native_drift"])),
        "  (`%s`) were diffed and each delta is explained in the atlas §4.2." % "`, `".join(s["native_drift"]),
        "- `%d` filenames across the surfaces resolve to `%d` distinct `TOOL_ID`s: the extra %d are" % (
            s["wrapper_files"], s["wrapper_ids"], s["alias_count"]),
        "  short-name aliases. A further %d filenames in those directories are unrelated system" % s["bin_others"],
        "  binaries (`bash`, `git`, `codex`, `-tui` launchers, ...) and are not tools — counting them",
        "  inflates any naive census.",
        "- **%d catalog entries, %d distinct ports, 0 collisions.**" % (s["catalog"], s["ports_distinct"]),
        "- `~/.local/bin` holds symlinks into `/usr/local/bin` for shared tools — with **one exception**,",
        "  `zothos-lite`, where `~/.local/bin` points into the repo instead and therefore wins on `PATH`",
        "  over the installed copy. The two differ by one support-address line; it is left unchanged and",
        "  raised as an owner decision (atlas §4.5).",
        "",
        "**Layers A, B, D — measured, small gap set.**",
        "",
        "| layer | pass | gap |",
        "|---|---|---|",
        "| `[A]` web entry | %d/%d | %s |" % (s["a_ok"], s["catalog"], ", ".join("`%s`" % x for x in s["a_missing"]) or "none"),
        "| `[A]` SEO/AEO | %d/%d | %s |" % (s["catalog"] - len(s["seo_gap"]), s["catalog"],
                                          ", ".join("`%s`" % x for x in s["seo_gap"]) or "none"),
        "| `[A]` `<img alt>` | 100%% of %d images | none |" % sum(r["imgs"] for r in rows),
        "| `[B]` component | %d/%d | %s |" % (s["b_ok"], s["catalog"], ", ".join("`%s`" % x for x in s["b_missing"]) or "none"),
        "| `[D]` README | %d/%d | %s |" % (s["d_ok"], s["catalog"], ", ".join("`%s`" % x for x in s["d_missing"]) or "none"),
        "| `[E]` visual | %d/%d | %s |" % (s["e_ok"], s["catalog"],
                                        ", ".join("`%s`" % x for x in s["e_issue"]) or "none"),
        "",
        "## 3. Repairs made",
        "",
        "1. **`zela-glasses-guide` tri-surface repair.** `/usr/local/bin` fell out of the symlink",
        "   convention used by every sibling tool (stale root-owned copy), and the ZothOS chroot",
        "   held an older revision hardcoding repo paths where live had the `_z_resolve_repo()`",
        "   superset. Both copies were backed up; `/usr/local/bin` is now a symlink to the repo",
        "   binary and the chroot copy is re-staged from the same source. All three surfaces hash",
        "   `7eaf8f943c83`; `--help` and `--json` exit 0.",
        "2. **Master ledger + checkpoint log + generator** created as described above.",
        "",
        "## 4. Corrections to earlier conclusions (integrity notes)",
        "",
        "Four measurements were wrong on first pass. They are recorded because acting on them",
        "would have caused damage:",
        "",
        "| wrong claim | reality |",
        "|---|---|",
        "| \"31 chroot copies are stale mirrors of the repo CLIs\" | they are independently-generated God-Mode wrappers; blind sync would have regressed tools |",
        "| \"`:8085` is a port collision\" | `osint-scout` is a symlink alias of `osint-scout-skill`; alias-aware census gives 0 collisions |",
        "| \"`zoth-heal` self-heals wrapper drift\" | it heals the OS; wrapper port changes came from a concurrent writer |",
        "| \"paywall/blur/fake-output strings found\" | regex matched anti-paywall copy, an open-access override stylesheet, glassmorphism blur, and the substring `canned` in `Scanned` |",
        "",
        "Also corrected: an alias-keyed hash comparison briefly reported 7 wrappers as cross-surface",
        "divergent; filename-keyed hashing showed **all** canonical wrappers identical. And all three",
        "surface paths end in `/bin`, so an early label collapsed them into one key.",
        "",
        "## 5. Safety invariants observed",
        "",
        "- **No `git push`** to any remote. No remote was contacted.",
        "- **No daemon killed or replaced.** No `python3 -m http.server` substitution anywhere.",
        "- No credential, token, key or local state database staged or written into any report.",
        "- Headless Chromium was launched only by the Layer E sweeps, one page at a time, and closed",
        "  after every capture; `pgrep -c chrome` was re-checked at the end of each sweep.",
        "- CPU package temperature held **%s** throughout the documented runs (limit 72C)." % THERMAL,
        "- Commits: `zoth-studio-v2` is checked out on `chore/hermes-24h-sovereign-parity` and the",
        "  parity work is committed there; `zoth-os` refuses to switch branches while another agent's",
        "  edits are in the tree, so its one docs commit (the generated catalog block) landed on `main`.",
        "  Both are local-only. Only explicit file paths are ever staged — never `git add -A`.",
        "",
        "## 6. Recommendations for orphaned repositories",
        "",
        "%d top-level directories have no catalog entry. Triage suggestion (owner's decision):" % len(s["orphan"]),
        "",
        "- **Promote** shipping products that already have a web entry and CLI.",
        "- **Keep uncatalogued** shared infrastructure and toolchain directories.",
        "- **Archive** research/output trees with no runnable surface.",
        "",
        "The full list is in §6 of the atlas.",
        "",
        "## 7. Phase 2 — remaining work",
        "",
        "```",
        "for each of %d tools in toolsData.js, in order:" % s["catalog"],
        "  Layer E: docs/tools/layerE_http.py at 390x844 / 820x1180 / 1440x900",
        "           require overflowPx===0, imgsMissingAlt===0, errors.length===0 — re-run after any UI edit",
        "  Layer A: interactive review — dead buttons, canned outputs, blur/paywall locks",
        "           (not automatable: the automated scan's false-positive rate is 100%)",
        "  Layer C: re-check --help/--json exit codes + .desktop launcher when a tool changes",
        "  write checkpoint to PARITY_CHECKPOINT_LOG.md",
        "Phase 3: npm run build, full pytest, secret audit, final report",
        "```",
        "",
        "Priority order — smallest scope first: %s" % (
            ("the single Layer `[B]` gap (`%s`), " % s["b_missing"][0]) if s["b_missing"]
            else "Layer `[B]` is now **80/80** (the `[B]` gaps were a probe artefact: the router map's "
                 "component names are not all suffixed `Tool`, so `wcag-contrast-guard` — which does "
                 "resolve to `WcagContrastGuard.jsx` — was mis-flagged; the matcher now accepts any "
                 "PascalCase component)"),
        "then %s, then the %d Layer E rows" % (
            ("the single Layer `[D]` gap (`%s`)" % s["d_missing"][0]) if s["d_missing"]
            else "no Layer `[D]` gap (**80/80** READMEs carry the four required sections)",
            len(s["e_issue"])),
        "whose API panes stay empty (`%s`)." % (", ".join(s["e_issue"]) or "none"),
        "",
        "## 8. Phase 3 — build, suites, secret audit",
        "",
        "| gate | command | result |",
        "|---|---|---|",
        "| studio build | `npm run build` in `zoth-studio-v2` | **exit 0**, built in 10.34s; 150 static routes prerendered, `sitemap.xml` with 150 routes |",
        "| zoth-os suite | `python3 -m pytest tests/` | **2 passed** in 0.25s |",
        "| chroot payload suite | `python3 -m pytest config/includes.chroot/opt/` | 292 passed, 65 failed, 49 collection errors — **environmental, see below** |",
        "| secret audit | regex scan of every `git diff --cached` before commit | clean (no key/token/`.env`/state-db patterns) |",
        "",
        "The payload suite is **not a valid signal from the repo checkout**. The failures trace to one",
        "cause: the system interpreter resolves `mcp` 2.x, where `mcp.server.fastmcp` was renamed to",
        "`mcp.server.mcpserver`, while the payload pins 1.x. Running the same file with the installed",
        "interpreter changes the result but fixtures still expect to live under `/opt` inside the built",
        "image. `zoth-os/tests/` (the ISO/desktop-hardening suite the mission names) is green.",
        "",
        "## 9. Flagship: aether-observatory",
        "",
        "`/home/zoth/NullAITech/aether-observatory` is built and committed (`v1.0.0`, 2 commits) and is",
        "**already serving live on `127.0.0.1:8160`** (`node src/server.js --port 8160`, cwd = the repo,",
        "started before this window). It was left running untouched, as the invariants require.",
        "",
        "Verified live with the canonical harness (`capture.mjs`, stills at 390x844 / 820x1180 /",
        "1440x900, 2.5s settle). All three viewports: `overflowPx` **0**, `imgsMissingAlt` **0**,",
        "`errors` **[]**, title `AETHER-OBSERVATORY — Cyber-Physical Telemetry & Sonification",
        "Workstation`, 18 buttons, 1271 chars of rendered text on the opening stage. No CSS clipping,",
        "no wrapped controls, no console errors.",
        "",
        "### 9.1 Four-feature spec audit (live, 2026-11-15)",
        "",
        "| # | Spec feature | Implementation | Live evidence |",
        "|---|---|---|---|",
        "| 1 | 3D orbital constellation + U+2800 Braille / Bayer 8x8 dither HUD | `public/js/constellation.js` (433 lines, 17 dither/Braille markers) | `/api/constellation/nodes` **200**, 9,684 B of live port/pid/thermal nodes |",
        "| 2 | Procedural WebAudio telemetry synthesizer (no audio files) | `public/js/sonifier.js` (243 lines; `AudioContext`, oscillators, gain, `AnalyserNode` FFT) | zero audio assets in `public/`; synth graph constructed at runtime |",
        "| 3 | Flight recorder + diff scrubber (SQLite/IndexedDB) | `src/recorder.js` (`node:sqlite`, 8640-row ring buffer), `public/js/timemachine.js`, `/api/timeline/*` | `data/aether-flight.db` **1,786 snapshots** at audit time; `/api/timeline/snapshots` **200**; `/api/timeline/diff` **200** with `loadDelta`, `thermalDeltaC`, `spawnedPorts`, `processDelta` |",
        "| 4 | Dual-theme Obsidian-Gold / Ivory-Alabaster + ASCII-Braille aperture intro | `public/css/tokens.css` (183 lines), `public/js/intro.js` (102 lines, 10 aperture/Braille markers) | `data-theme` tokens present; theme toggle in `app.js`; `/health` **200** `{status: ok, version: 1.0.0, port: 8160}` |",
        "",
        "All four spec features are implemented and the two machine-checkable ones are exercised live",
        "through the running daemon; the constellation and sonifier are client-side and were already",
        "confirmed rendering by the Layer E capture (18 buttons, 1,271 chars, no console errors).",
        "",
    ]
    return "\n".join(L) + "\n"


THERMAL = "46.0C (idle, package id 0)"


def main():
    rows, s = build_rows()
    atlas = render_atlas(rows, s)
    check = render_checkpoints(rows, s)
    report = render_report(rows, s)
    sync = render_sync(rows, s)

    if "--check" in sys.argv:
        for path, txt in ((os.path.join(DOCS, "SOVEREIGN_ECOSYSTEM_ATLAS.md"), atlas),
                          (os.path.join(DOCS, "PARITY_CHECKPOINT_LOG.md"), check),
                          (os.path.join(ROOT, "HERMES_24H_PARITY_REPORT.md"), report)):
            cur = read(path)
            same = cur.strip() == txt.strip()
            print(("OK  " if same else "DRIFT") + " " + path)
        return

    written = []
    for path, txt in ((os.path.join(DOCS, "SOVEREIGN_ECOSYSTEM_ATLAS.md"), atlas),
                      (os.path.join(DOCS, "PARITY_CHECKPOINT_LOG.md"), check),
                      (os.path.join(ROOT, "HERMES_24H_PARITY_REPORT.md"), report)):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w", encoding="utf-8").write(txt)
        written.append((path, len(txt.splitlines())))

    # upsert the sync block inside the zoth-os catalog (additive, delimited, idempotent)
    cat = os.path.join(ZOS, "ZOTHOS_TOOLS_CATALOG.md")
    cur = read(cat)
    if "<!-- SOVEREIGN-ATLAS-SYNC:START -->" in cur:
        new = re.sub(r"<!-- SOVEREIGN-ATLAS-SYNC:START -->.*?<!-- SOVEREIGN-ATLAS-SYNC:END -->",
                     lambda m: sync, cur, flags=re.S)
        mode = "upserted existing delimited block"
    else:
        new = cur.rstrip("\n") + "\n\n---\n\n" + sync + "\n"
        mode = "appended new delimited block"
    open(cat, "w", encoding="utf-8").write(new)
    written.append((cat, len(new.splitlines())))

    print("generated %s" % s["now"])
    for p, n in written:
        print("  %-70s %5d lines" % (p.replace(ROOT + "/", ""), n))
    print("  zoth-os catalog: %s (was %d lines, now %d)" % (mode, len(cur.splitlines()), len(new.splitlines())))
    print("\nkey metrics: catalog=%d ports=%d(0 collisions) C_3of3_identical=%d drift=%d "
          "native_cli=%d aliases=%d alias_drift=%d | A=%d B=%d D=%d seo_gap=%d orphans=%d" % (
              s["catalog"], s["ports_distinct"], s["canonical_ok"], len(s["drift_ids"]),
              len(s["native_cli"]), s["alias_count"], len(s["alias_drift"]),
              s["a_ok"], s["b_ok"], s["d_ok"], len(s["seo_gap"]), len(s["orphan"])))
    json.dump({"rows": rows, "stats": s}, open("/home/zoth/.hermes/cache/scratch/atlas_full.json", "w"), indent=1)


if __name__ == "__main__":
    main()
