#!/usr/bin/env python3
"""
Ensure all Zoth Studio v2 local fleet ports and enclave daemons are online.
Supports --watch to keep all daemons + Zoth Studio (:3000) running continuously.
Paths resolve under $HOME (NullAITech layout) so the script is portable.
"""

import os
import sys
import time
import socket
import subprocess
from pathlib import Path

HOME = Path(os.environ.get("HOME") or Path.home())
NULLAI = Path(os.environ.get("NULLAITECH_ROOT") or (HOME / "NullAITech"))
STUDIO = Path(os.environ.get("ZOTH_STUDIO_ROOT") or (NULLAI / "zoth-studio-v2"))
WEBGEN = Path(os.environ.get("ZOTH_WEBGEN_ROOT") or (NULLAI / "zoth-webgen"))
BOLT = Path(os.environ.get("ZOTH_BOLT_ROOT") or (NULLAI / "bolt.diy"))
HERMES_LAB = Path(os.environ.get("HERMES_LAB_ROOT") or (HOME / "hermes-laboratory"))


def threaded_http_cmd(port: int, directory: str) -> list:
    code = (
        "import os; from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer; "
        f"os.chdir({directory!r}); "
        f"s = ThreadingHTTPServer(('127.0.0.1', {port}), SimpleHTTPRequestHandler); "
        "s.serve_forever()"
    )
    return ["python3", "-c", code]


FLEET_DAEMONS = [
    (
        3000,
        ["node", str(STUDIO / "server" / "serve.mjs"), "--port", "3000"],
        str(STUDIO),
        "/tmp/zoth-studio-3000.log",
        {},
    ),
    (
        8092,
        ["python3", str(WEBGEN / "server.py"), "--port", "8092"],
        str(WEBGEN),
        "/tmp/zoth-webgen-8092.log",
        {},
    ),
    (
        8790,
        ["python3", str(STUDIO / "bin" / "swarm_daemon.py")],
        str(STUDIO),
        "/tmp/zoth-swarm-8790.log",
        {},
    ),
    (
        5173,
        ["nice", "-n", "15", "npm", "run", "dev"],
        str(BOLT),
        "/tmp/zoth-bolt-5173.log",
        {},
    ),
    (
        5174,
        threaded_http_cmd(5174, str(NULLAI / "cron-rhythm-studio" / "public")),
        str(NULLAI),
        "/tmp/zoth-port-5174.log",
        {},
    ),
    (
        8135,
        threaded_http_cmd(8135, str(NULLAI / "storefront-catalog" / "public")),
        str(NULLAI),
        "/tmp/zoth-port-8135.log",
        {},
    ),
    (
        8136,
        threaded_http_cmd(8136, str(STUDIO / "dist" / "tools" / "webmcp-protocol-inspector")),
        str(NULLAI),
        "/tmp/zoth-port-8136.log",
        {},
    ),
    (
        8137,
        threaded_http_cmd(8137, str(HERMES_LAB)),
        str(HERMES_LAB),
        "/tmp/zoth-port-8137.log",
        {},
    ),
    (
        8138,
        threaded_http_cmd(8138, str(STUDIO / "dist" / "tools" / "azoth-local-agent")),
        str(NULLAI),
        "/tmp/zoth-port-8138.log",
        {},
    ),
    (
        8888,
        threaded_http_cmd(8888, str(STUDIO / "dist" / "tools" / "hexstrike-arsenal")),
        str(NULLAI),
        "/tmp/zoth-port-8888.log",
        {},
    ),
    (
        9395,
        ["node", str(NULLAI / "likeness-desk" / "server.js")],
        str(NULLAI / "likeness-desk"),
        "/tmp/zoth-port-9395.log",
        {"LIKENESS_LAZY_GPU": "1"},
    ),
]


def is_port_up(port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.35):
            return True
    except OSError:
        return False


def ensure_once(procs: dict) -> list:
    started = []
    for port, cmd, cwd, log_path, extra_env in FLEET_DAEMONS:
        if not is_port_up(port):
            env = os.environ.copy()
            env.update(extra_env or {})
            lf = open(log_path, "ab")
            p = subprocess.Popen(
                cmd,
                cwd=cwd,
                stdout=lf,
                stderr=lf,
                stdin=subprocess.DEVNULL,
                env=env,
            )
            procs[port] = (p, lf)
            started.append(port)
    return started


def main():
    watch = "--watch" in sys.argv
    restart_studio = "--restart-studio" in sys.argv
    if restart_studio:
        serve = str(STUDIO / "server" / "serve.mjs")
        os.system(f"pkill -f {serve!r} || true")
        os.system("pkill -f 'http.server 8137' || true")
        time.sleep(0.4)

    procs = {}
    started = ensure_once(procs)
    if started:
        time.sleep(1.0)
    up_count = sum(1 for port, *_ in FLEET_DAEMONS if is_port_up(port))
    print(
        f"Fleet supervisor checked {len(FLEET_DAEMONS)} daemons "
        f"({up_count} online, newly started: {started})",
        flush=True,
    )

    if watch:
        while True:
            time.sleep(5.0)
            ensure_once(procs)


if __name__ == "__main__":
    main()
