#!/usr/bin/env python3
"""Layer C CLI-invariant verifier with a SANITIZED environment.

Hard lesson (harness artifact #3): running `<bin> --help` from a Python kernel
whose PATH leaks an unrelated venv (e.g. /home/zoth/.hermes/installs/*/venv with a
broken `openai`) makes healthy tools exit 1 with an import traceback. Verdicts
must therefore be taken under a minimal, deterministic environment:

    HOME, PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin, TERM=dumb, LANG=C.UTF-8

This script re-checks the Layer C invariant -- `<tool> --help` and `<tool> --json`
exit 0 with clean output -- for every catalog tool, using the PATH-resolved
binary, cwd = the tool's repo, and records one JSONL row per tool.

Usage: python3 layerC_cli_check.py [--ids a,b] [--out PATH] [--timeout 25]
"""
import argparse, json, os, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as pp  # noqa: E402

SANE_PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"


def sane_env():
    return {
        "HOME": os.path.expanduser("~"),
        "PATH": SANE_PATH,
        "TERM": "dumb",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "USER": os.environ.get("USER", "zoth"),
    }


def resolved(tid):
    for d in SANE_PATH.split(":"):
        p = os.path.join(d, tid)
        if os.path.isfile(p) and os.access(p, os.X_OK):
            return p
    return None


def call(binp, flag, repo, timeout):
    cmd = ["timeout", str(timeout), binp, flag]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=repo,
                           env=sane_env(), timeout=timeout + 20)
        out = (r.stdout or "") + (r.stderr or "")
        first = next((l.strip() for l in out.splitlines() if l.strip()), "")
        return r.returncode, first[:200], out[:400]
    except subprocess.TimeoutExpired:
        return 124, "TIMEOUT", ""
    except Exception as e:  # noqa: BLE001
        return 125, f"spawn-error: {e}", ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", default="")
    ap.add_argument("--out", default="layerC_cli_results.jsonl")
    ap.add_argument("--timeout", type=int, default=25)
    a = ap.parse_args()

    tools = pp.parse_tools()
    if a.ids:
        want = {x for x in a.ids.split(",") if x}
        tools = [t for t in tools if t["id"] in want]

    rows, bad = [], []
    for t in tools:
        tid = t["id"]
        repo = pp.local_repo_dir(t) or ""
        binp = resolved(tid)
        if not binp:
            rows.append({"id": tid, "binary": None, "verdict": "no_binary"})
            continue
        he, h1, _ = call(binp, "--help", repo, a.timeout)
        je, j1, jraw = call(binp, "--json", repo, a.timeout)
        verdict = "ok"
        if he != 0 and je != 0:
            verdict = "both_fail"
        elif he != 0:
            verdict = "help_fail"
        elif je != 0:
            verdict = "json_fail"
        rec = {"id": tid, "binary": binp, "repo": repo, "help_exit": he, "help_first": h1,
               "json_exit": je, "json_first": j1, "json_raw_head": jraw[:200], "verdict": verdict}
        rows.append(rec)
        if verdict != "ok":
            bad.append(rec)
        print(f"{verdict:9s} {tid:32s} help={he} json={je}  {h1[:70]}")

    with open(a.out, "a", encoding="utf8") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")

    ok = sum(1 for r in rows if r.get("verdict") == "ok")
    print(f"\nchecked {len(rows)} tools: ok={ok} problems={len(bad)}  -> {a.out}")
    for r in bad:
        print(f"  {r['verdict']:9s} {r['id']:32s} help_exit={r.get('help_exit')} json_exit={r.get('json_exit')} :: {r.get('help_first','')[:110]}")


if __name__ == "__main__":
    main()
