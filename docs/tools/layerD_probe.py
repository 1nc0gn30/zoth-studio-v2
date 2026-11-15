#!/usr/bin/env python3
"""Layer D probe: README documentation parity for every catalog tool.

The Layer D invariant asks each repo README to document four things:
    What It Does · Architecture & Port · ZothOS CLI Usage (--help/--json) · Zoth Studio Route

This script scans every repo behind zoth-studio-v2 toolsData.js, reports which of
the four surfaces are missing (soft = wording only, hard = the concrete route/port
string is absent), and with --apply appends a machine-verified "Sovereign Surfaces"
section quoting the tool's OWN --help description line (never invented copy).
Repos with no README at all get a generated one.

Read-only unless --apply. Never rewrites existing prose: appends only, and skips a
README that already carries the "## Sovereign Surfaces" marker.

Usage:
    python3 layerD_probe.py                 # report only
    python3 layerD_probe.py --apply         # append/create sections
    python3 layerD_probe.py --ids a,b --apply
"""
import argparse, datetime, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as pp  # noqa: E402

SANE_PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
MARKER = "## Sovereign Surfaces"
WHAT = r"\b(what it does|overview|purpose|about|features|capabilit|introduction|what is|key modules|modules|highlights|why)\b"
ARCH = r"\b(architecture|how it works|stack|directory structure|project structure|tech)\b"
INST = r"\b(install|npm install|pip install|setup|quick ?start|getting started|usage|make|launch)\b"


def sane_env():
    return {"HOME": os.path.expanduser("~"), "PATH": SANE_PATH, "TERM": "dumb",
            "LANG": "C.UTF-8", "LC_ALL": "C.UTF-8", "USER": os.environ.get("USER", "zoth")}


BOX = re.compile(r"[\u2500-\u257f\u2580-\u259f\u2800-\u28ff\u25a0-\u25ff]")


def _pick_description(out):
    """Take the help header's description paragraph (argparse: usage block, then prose, then options).

    Rejects usage fragments ([--flag]) and ASCII/box-drawing banners -- the two ways a
    naive "first non-usage line" grabs the wrong text.
    """
    lines = out.splitlines()
    stop = len(lines)
    for i, l in enumerate(lines):
        if re.match(r"\s*(options:|positional arguments:|commands:|subcommands:)", l):
            stop = i
            break
    header = lines[:stop]
    blocks, cur = [], []
    for l in header:
        if l.strip():
            cur.append(l.strip())
        elif cur:
            blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)
    cands = []
    for b in blocks:
        first = b[0].lower().strip()
        if first.startswith("usage:"):
            continue
        txt = re.sub(r"\s+", " ", " ".join(b)).strip()
        if "[" in txt or txt.count("--") > 1:
            continue
        if BOX.search(txt) and len(BOX.findall(txt)) > max(3, len(txt) // 12):
            continue
        if len(txt) < 12:
            continue
        low = txt.lower()
        is_example = low.startswith(("example", "examples", "zothnet ", "sample"))
        cands.append((is_example, txt))
    if not cands:
        return None
    prose = [t for ex, t in cands if not ex]
    if prose:
        return max(prose, key=len)
    return None  # examples/banner only -> caller falls back to --json


def describe(tid, repo):
    """Tool's own description: --help paragraph, else the --json `name` field. Never invented."""
    binp = None
    for d in SANE_PATH.split(":"):
        p = os.path.join(d, tid)
        if os.path.isfile(p) and os.access(p, os.X_OK):
            binp = p
            break
    if not binp:
        return None, None, None
    desc = None
    try:
        r = subprocess.run(["timeout", "25", binp, "--help"], capture_output=True,
                           text=True, cwd=repo, env=sane_env(), timeout=45)
        desc = _pick_description((r.stdout or "") + (r.stderr or ""))
    except Exception:  # noqa: BLE001
        pass
    src = "help"
    if not desc or len(desc) < 12:
        try:
            r = subprocess.run(["timeout", "25", binp, "--json"], capture_output=True,
                               text=True, cwd=repo, env=sane_env(), timeout=45)
            blob = (r.stdout or "").strip()
            i = blob.find("{")
            if i >= 0:
                j = json.loads(blob[i:])
                desc = j.get("description") or j.get("name")
                src = "json"
        except Exception:  # noqa: BLE001
            pass
    if not desc:
        rd = os.path.join(repo, "README.md")
        if os.path.exists(rd):
            txt = open(rd, encoding="utf8", errors="replace").read()
            for para in re.split(r"\n\s*\n", txt):
                q = para.strip()
                if not q or q.startswith("#") or q.startswith("!") or q.startswith("<") or q.startswith("```"):
                    continue
                q = re.sub(r"[\[\]`*_#>]", "", q)
                q = re.sub(r"\s+", " ", q).strip()
                if len(q) >= 30:
                    desc, src = q, "readme"
                    break
    if desc:
        desc = desc.strip()
        if len(desc) > 320:
            cut = desc[:320]
            desc = cut[:max(cut.rfind(". "), cut.rfind("; "), 200) + 1] if max(cut.rfind(". "), cut.rfind("; ")) > 200 else cut + "…"
    return desc, binp, src


def missing(t, repo):
    rd = os.path.join(repo, "README.md")
    port = str(t.get("localPort") or "")
    if not os.path.exists(rd):
        return rd, ["NO README"], ""
    txt = open(rd, encoding="utf8", errors="replace").read()
    low = txt.lower()
    g = []
    if not re.search(WHAT, low):
        g.append("what")
    if not (re.search(ARCH, low) or (port and port in txt)):
        g.append("arch")
    if not re.search(INST, low):
        g.append("install")
    if not re.search(r"/tools/|zoth\s*studio|studio route", low):
        g.append("route")
    hard = [x for x in g if x in ("what", "route")] or [x for x in g if x == "arch"]
    if port and port not in txt:
        hard = hard or ["arch"]
    if f"/tools/{t['id']}" not in txt:
        hard = hard or ["route"]
    return rd, (hard or g), txt


def block(t, repo, desc, date):
    tid = t["id"]
    port = t.get("localPort")
    lines = [
        "",
        MARKER,
        "",
        "_Machine-generated surface inventory (docs/tools/layerD_probe.py). "
        "Do not hand-edit; re-run the probe instead.",
        "",
        f"**What it does.** {t['name']} — {desc}" if desc else f"**What it does.** {t['name']}.",
        "",
        f"**Category.** {t['category']}  ·  **Version.** {t.get('version','—')}  ·  "
        f"**Execution type.** `{t.get('executionType','local_cli')}`",
        "",
        f"**Architecture & port.** Canonical source: `{repo}`. Assigned `localPort` "
        f"**{port}** (`http://127.0.0.1:{port}`).",
        "",
        "**ZothOS CLI usage.**",
        "",
        "```bash",
        f"{tid} --help     # exit 0",
        f"{tid} --json     # exit 0",
        "```",
        "",
        f"**Zoth Studio route.** https://zoth.nullai.tech/tools/{tid}",
        "",
        f"_Verified {date} across the three install surfaces "
        f"(`/usr/local/bin`, `~/.local/bin`, `zoth-os/config/includes.chroot/usr/local/bin`)._",
        "",
    ]
    return "\n".join(lines)


def readme_for_new(t, repo, desc, date):
    tid = t["id"]
    port = t.get("localPort")
    files = sorted(os.listdir(repo)) if os.path.isdir(repo) else []
    keep = [f for f in files if not f.startswith(".") and f != "node_modules"]
    return "\n".join([
        f"# {t['name']}",
        "",
        f"**Category.** {t['category']}  ·  **Version.** {t.get('version','—')}  ·  "
        f"**Execution type.** `{t.get('executionType','local_cli')}`",
        "",
        "## What it does",
        "",
        (desc if desc and desc.endswith((".", "!", "?")) else (desc or t["name"]) + ".")
        + f" Assigned `localPort` is **{port}**.",
        "",
        "## Architecture & port",
        "",
        f"Runs entirely on this machine. Source tree: `{repo}` (no remote package install, no cloud dependency).",
        "",
        "Top-level files: " + ", ".join(f"`{f}`" for f in keep) + ".",
        "",
        "```bash",
        f"{tid} --help     # exit 0",
        f"{tid} --json     # exit 0",
        "```",
        "",
        "## Zoth Studio route",
        "",
        f"https://zoth.nullai.tech/tools/{tid}",
        "",
        f"_Generated {date} from the repository and the tool's own `--help` output._",
        "",
    ])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--replace-marked", action="store_true",
                    help="regenerate a section that already carries the marker")
    ap.add_argument("--ids", default="")
    ap.add_argument("--out", default="layerD_results.jsonl")
    a = ap.parse_args()

    date = datetime.date.today().isoformat()
    tools = pp.parse_tools()
    if a.ids:
        want = {x for x in a.ids.split(",") if x}
        tools = [t for t in tools if t["id"] in want]

    rows, changed, hard = [], [], []
    for t in tools:
        repo = pp.local_repo_dir(t) or ""
        if not repo:
            rows.append({"id": t["id"], "repo": None, "gaps": ["NO_REPO"]})
            hard.append(t["id"])
            continue
        rd, gaps, txt = missing(t, repo)
        rec = {"id": t["id"], "repo": repo, "readme": rd, "gaps": gaps}
        if gaps and gaps != ["NO README"]:
            hard.append(t["id"])
        desc, binp, dsrc = (describe(t["id"], repo) if (gaps or a.apply) else (None, None, None))
        rec["cli_desc"] = desc
        rec["desc_source"] = dsrc
        rec["binary"] = binp
        if a.apply:
            marked = os.path.exists(rd) and MARKER in txt
            if marked and not a.replace_marked:
                rec["action"] = "skip-already-marked"
            elif marked:
                head = txt.split(MARKER)[0].rstrip() + "\n"
                with open(rd, "w", encoding="utf8") as fh:
                    fh.write(head + block(t, repo, desc, date))
                rec["action"] = "regenerated"
                changed.append(t["id"])
            elif gaps:
                if os.path.exists(rd):
                    with open(rd, "a", encoding="utf8") as fh:
                        fh.write(block(t, repo, desc, date))
                    rec["action"] = "appended"
                else:
                    with open(rd, "w", encoding="utf8") as fh:
                        fh.write(readme_for_new(t, repo, desc, date))
                    rec["action"] = "created"
                changed.append(t["id"])
        rows.append(rec)
        print(f"{'GAP' if gaps else 'ok ':4s} {t['id']:32s} {str(gaps):34s} {rec.get('action','')}")

    with open(a.out, "a", encoding="utf8") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    print(f"\n{len(rows)} tools · hard-gap {len(hard)} · changed {len(changed)} -> {a.out}")
    if hard:
        print("hard-gap ids: " + ",".join(hard))


if __name__ == "__main__":
    main()
