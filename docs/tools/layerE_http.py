#!/usr/bin/env python3
"""Layer E fleet driver, CORRECTED: serve each tool's web root over a throwaway
loopback HTTP origin, then run the canonical capture.mjs harness against it.

Why: many tools link assets root-absolute (`href="/style.css"`). Under file://
those resolve to file:///style.css and 404, so the page renders UNSTYLED and any
overflowPx measured over file:// is an artifact of the harness, not a real defect.
Serving the web root as "/" makes root-absolute and relative refs both resolve
exactly as they do on the tool's own server. One temp server per tool, on an
ephemeral free port, killed immediately after; no protected daemon is touched.

Records append to layerE_results_http.jsonl (one line per tool, resumable).
`--mode live` instead captures the tool's OWN declared localPort when it is
already listening (real deployment, real API), never starting anything.

Usage:
  python3 layerE_http.py --from 1 --count 12
  python3 layerE_http.py --ids zoth-bounty,zothnet --mode live
"""
import argparse, json, os, re, socket, subprocess, sys, time, contextlib, signal

STUDIO = "/home/zoth/NullAITech/zoth-studio-v2"
SCRATCH = "/home/zoth/.hermes/cache/scratch"
CAPTURE = "/home/zoth/.gemini/config/skills/ui-verification-loop/scripts/capture.mjs"
sys.path.insert(0, os.path.join(STUDIO, "docs", "tools"))
import parity_probe as pp  # noqa: E402

THERMAL_LIMIT = 70.0

# Tools whose own server serves the entry document at a path other than its
# static webroot filename (live mode only). Everything else uses "/<file>".
LIVE_ROUTE = {"zothnet": "/"}


def pkg_temp():
    try:
        out = subprocess.run(["sensors"], capture_output=True, text=True, timeout=15).stdout
        for line in out.splitlines():
            if line.startswith("Package id 0"):
                return float(line.split("+")[1].split("°")[0])
    except Exception:
        pass
    return None


def free_port():
    with contextlib.closing(socket.socket()) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def listening_ports():
    out = subprocess.run(["ss", "-tlnp"], capture_output=True, text=True).stdout
    ports = set()
    for line in out.splitlines()[1:]:
        parts = line.split()
        if len(parts) > 3:
            with contextlib.suppress(ValueError):
                ports.add(int(parts[3].rsplit(":", 1)[1]))
    return ports


def wait_port(port, timeout=8.0):
    t0 = time.time()
    while time.time() - t0 < timeout:
        with contextlib.closing(socket.socket()) as s:
            s.settimeout(0.4)
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return True
        time.sleep(0.15)
    return False


def run_capture(base, route, out, viewports="mobile,tablet,desktop", timeout=200):
    cmd = ["node", CAPTURE, "--base", base, "--routes", route, "--out", out,
           "--viewports", viewports, "--wait", "1800"]
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "secs": round(time.time() - t0, 1)}
    txt = p.stdout.strip()
    i = txt.find("[")
    if i < 0:
        return {"status": "no-report", "rc": p.returncode,
                "stderr": p.stderr.strip()[-300:], "secs": round(time.time() - t0, 1)}
    try:
        rep = json.loads(txt[i:])
    except Exception as e:
        return {"status": "unparsable", "err": str(e)[:120], "secs": round(time.time() - t0, 1)}
    errs = sorted({e for r in rep for e in (r.get("errors") or [])})
    api_errs = [e for e in errs if ("/api/" in e or "not valid JSON" in e
                                    or "Failed to fetch" in e or "ERR_CONNECTION_REFUSED" in e)]
    other_errs = [e for e in errs if e not in api_errs]
    return {
        "status": "ok", "secs": round(time.time() - t0, 1),
        "overflowPx": max((r.get("overflowPx") or 0) for r in rep),
        "imgsMissingAlt": max((r.get("imgsMissingAlt") or 0) for r in rep),
        "errors": errs[:8], "error_count": len(errs),
        "api_errors": api_errs[:4], "api_error_count": len(api_errs),
        "other_errors": other_errs[:4], "other_error_count": len(other_errs),
        "blank_viewports": [r["viewport"] for r in rep if (r.get("textLength") or 0) < 40],
        "per_vp": {r["viewport"]: {"overflowPx": r.get("overflowPx"), "textLength": r.get("textLength"),
                                   "buttons": r.get("buttons"), "imgsMissingAlt": r.get("imgsMissingAlt"),
                                   "title": (r.get("title") or "")[:70]} for r in rep},
        "shots": sorted(os.listdir(out)) if os.path.isdir(out) else [],
    }


def abs_ref_probe(port, html_path):
    """curl each root-absolute asset ref served by this origin: proof the CSS/img
    that 404'd over file:// is real under http."""
    import re
    try:
        html = open(html_path, encoding="utf-8", errors="replace").read()
    except Exception:
        return {}
    refs = sorted(set(re.findall(r'(?:href|src)="(/[^"]+)"', html)))[:6]
    res = {}
    for r in refs:
        p = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
                            "-m", "8", f"http://127.0.0.1:{port}{r}"],
                           capture_output=True, text=True)
        res[r] = p.stdout.strip()
    return res


def looks_dev(doc):
    """A Vite/webpack *dev* entry: it loads an untranspiled source module, which a
    plain static server serves as text -> the SPA never boots and every geometry
    measurement is meaningless. Such tools must be measured from their built
    document (dist/) or over their own dev server (mode=live)."""
    try:
        txt = open(doc, encoding="utf8", errors="replace").read()
    except Exception:
        return False
    return bool(re.search(r'(?:src|href)="[^"]*/src/[^"]*\.(?:tsx?|jsx|vue|svelte)"', txt))


def pick_entry(repo):
    """Prefer the deployed document (dist/), then the driver's own choice.
    Returns (path, kind)."""
    dist = os.path.join(repo, "dist", "index.html")
    if os.path.exists(dist):
        return dist, "built"
    e = pp.find_entry(repo)
    if not e:
        return None, None
    if looks_dev(e):
        return e, "dev"
    kind = "static" if os.sep + "public" + os.sep in e else "root"
    return e, kind


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="start", type=int, default=1)
    ap.add_argument("--count", type=int, default=0)
    ap.add_argument("--ids", default="")
    ap.add_argument("--mode", default="static", choices=["static", "live"])
    ap.add_argument("--viewports", default="mobile,tablet,desktop")
    ap.add_argument("--out", default=os.path.join(SCRATCH, "layerE_results_http.jsonl"))
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()

    tools = pp.parse_tools()
    if a.ids:
        want = [x for x in a.ids.split(",") if x]
        sel = [t for t in tools if t["id"] in want]
    else:
        sel = tools[a.start - 1: (a.start - 1 + a.count) if a.count else None]

    outfile = a.out
    done = set()
    if os.path.exists(outfile) and not a.force:
        for line in open(outfile):
            with contextlib.suppress(Exception):
                d = json.loads(line)
                if d.get("mode") == a.mode:
                    done.add(d["id"])

    live = listening_ports()
    n = 0
    for t in sel:
        tid = t["id"]
        if tid in done:
            continue
        n += 1
        repo = pp.local_repo_dir(t)
        rec = {"id": tid, "idx": tools.index(t) + 1, "mode": a.mode, "repo": repo}
        if not repo:
            rec.update(status="no-repo")
        else:
            entry, entry_kind = pick_entry(repo)
            if not entry:
                rec.update(status="no-entry")
            else:
                webroot, route = os.path.dirname(entry), "/" + os.path.basename(entry)
                rec.update(entry=os.path.relpath(entry, repo), webroot=os.path.relpath(webroot, repo),
                           entry_kind=entry_kind)
                if a.mode == "live":
                    port = int(t.get("localPort") or 0)
                    # A tool's own server may route the entry document at a path of
                    # its choosing (e.g. a Go mux serving the dashboard at "/"), so
                    # the static webroot filename is not always the live URL.
                    route = LIVE_ROUTE.get(tid, route)
                    rec.update(port=port, route=route)
                    if port not in live:
                        rec.update(status="not-listening")
                    else:
                        out = os.path.join(SCRATCH, "shots-layerE-live", tid)
                        rec.update(run_capture(f"http://127.0.0.1:{port}", route, out, a.viewports))
                else:
                    port = free_port()
                    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(port),
                                            "--bind", "127.0.0.1", "--directory", webroot],
                                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                           start_new_session=True)
                    try:
                        if not wait_port(port):
                            rec.update(status="server-failed", port=port)
                        else:
                            rec.update(port=port, abs_refs=abs_ref_probe(port, entry))
                            out = os.path.join(SCRATCH, "shots-layerE-http", tid)
                            rec.update(run_capture(f"http://127.0.0.1:{port}", route, out, a.viewports))
                    finally:
                        with contextlib.suppress(Exception):
                            os.killpg(os.getpgid(srv.pid), signal.SIGTERM)
                        with contextlib.suppress(Exception):
                            srv.wait(timeout=5)
        with open(outfile, "a") as fh:
            fh.write(json.dumps(rec) + "\n")
        flags = []
        if rec.get("status") != "ok":
            flags.append(rec.get("status", "?"))
        if rec.get("overflowPx"):
            flags.append(f"OVERFLOW={rec['overflowPx']}")
        if rec.get("imgsMissingAlt"):
            flags.append(f"ALT={rec['imgsMissingAlt']}")
        if rec.get("other_error_count"):
            flags.append(f"ERRother={rec['other_error_count']}:{(rec.get('other_errors') or [''])[0][:50]}")
        if rec.get("api_error_count"):
            flags.append(f"ERRapi={rec['api_error_count']}")
        if rec.get("blank_viewports"):
            flags.append("BLANK=" + ",".join(rec["blank_viewports"]))
        if rec.get("entry_kind") == "dev":
            flags.append("DEV-ENTRY")
        badrefs = [k for k, v in (rec.get("abs_refs") or {}).items() if not v.startswith("2")]
        if badrefs:
            flags.append("BADREF=" + ",".join(badrefs[:3]))
        print(f"[{rec['idx']:2d}] {tid:32s} {' '.join(flags) if flags else 'CLEAN'}"
              f"  ({rec.get('secs','-')}s)", flush=True)
        if n % 8 == 0:
            temp = pkg_temp()
            print(f"    -- thermal: {temp}°C", flush=True)
            while temp and temp > THERMAL_LIMIT:
                time.sleep(20)
                temp = pkg_temp()
                print(f"    -- cooling, thermal: {temp}°C", flush=True)


if __name__ == "__main__":
    main()
