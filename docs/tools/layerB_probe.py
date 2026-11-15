#!/usr/bin/env python3
"""Layer B probe: Zoth Studio v2 God-Mode route parity (/tools/<id>).

Invariant: every tool in toolsData.js resolves to a DEDICATED component in
src/components/tools/ via the registry in src/pages/RealToolWorkspacePage.jsx
(ENCLAVE_TOOL_COMPONENTS, honouring WORKSTATION_TOOL_ALIASES). Tools that fall
through to the generic WebGPUToolWorkstation are reported as gaps.
Read-only.

Usage: python3 layerB_probe.py [--ids a,b] [--json-out PATH]
"""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import parity_probe as pp  # noqa: E402

SCRATCH = "/home/zoth/.hermes/cache/scratch"
STUDIO = "/home/zoth/NullAITech/zoth-studio-v2"
PAGE = os.path.join(STUDIO, "src/pages/RealToolWorkspacePage.jsx")
COMPDIR = os.path.join(STUDIO, "src/components/tools")


def parse_registry():
    t = open(PAGE, encoding="utf8").read()
    reg = {}
    m = re.search(r"const ENCLAVE_TOOL_COMPONENTS\s*=\s*\{(.*?)\n\s*\};", t, re.S)
    if m:
        for k, v in re.findall(r"'([^']+)'\s*:\s*(\w+)", m.group(1)):
            reg[k] = v
    al = {}
    m = re.search(r"const WORKSTATION_TOOL_ALIASES\s*=\s*\{(.*?)\n\s*\};", t, re.S)
    if m:
        for k, v in re.findall(r"'([^']+)'\s*:\s*'([^']+)'", m.group(1)):
            al[k] = v
    imports = dict(re.findall(r"import\s+(\w+)\s+from\s+'[^']*?/([\w.]+)'", t))
    imports.update({m: m + ".jsx" for m in re.findall(r"import\('\.\./components/tools/(\w+)(?:\.jsx)?'\)", t)})
    return reg, al, imports


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", default="")
    ap.add_argument("--json-out", default=os.path.join(SCRATCH, "layerB_results.jsonl"))
    a = ap.parse_args()

    reg, aliases, imports = parse_registry()
    tools = pp.parse_tools()
    if a.ids:
        want = {x for x in a.ids.split(",") if x}
        tools = [t for t in tools if t["id"] in want]

    stats = {"mapped": 0, "alias": 0, "generic": 0}
    missing_named = []
    for t in tools:
        tid = t["id"]
        how = None
        comp = reg.get(tid)
        if comp:
            how = "mapped"
        elif tid in aliases:
            comp = reg.get(aliases[tid])
            how = "alias" if comp else None
        if not comp and how is None:
            for k, v in reg.items():  # tolerate small id drift (e.g. trailing -studio)
                if k.rstrip("-studio") == tid.rstrip("-studio") or k.replace("-", "") == tid.replace("-", ""):
                    comp, how = v, "fuzzy"
                    break
        comp = comp or ""
        src = imports.get(comp) or ((comp + ".jsx") if comp else "")
        exists = bool(comp) and os.path.exists(os.path.join(COMPDIR, src))
        if comp and not exists:  # tolerate barrel/default-dir component names
            cand = [f for f in os.listdir(COMPDIR) if f.lower().startswith(comp.lower()[:12])]
            exists = bool(cand)
            src = cand[0] if cand else src
        status = "ok" if (comp and exists) else ("generic" if not comp else "missing-file")
        stats["mapped" if status == "ok" and how == "mapped" else
              "alias" if status == "ok" else "generic"] += 1
        if status == "ok":
            lines = sum(1 for _ in open(os.path.join(COMPDIR, src), encoding="utf8", errors="replace"))
        else:
            lines = 0
            missing_named.append(tid)
        rec = {"id": tid, "component": comp, "file": src, "status": status,
               "how": how, "lines": lines, "repo": pp.local_repo_dir(t) or ""}
        with open(a.json_out, "a") as fh:
            fh.write(json.dumps(rec) + "\n")
        print(f"{('OK ' if status == 'ok' else status.upper()):9s} {tid:34s} {str(comp):38s} "
              f"{src:44s} {lines:>5} lines  ({how})", flush=True)

    print("\n=== summary:", json.dumps(stats), "| not dedicated:", missing_named)


if __name__ == "__main__":
    main()
