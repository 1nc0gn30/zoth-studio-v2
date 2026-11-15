#!/usr/bin/env python3
"""Sovereign ecosystem inventory + parity audit.

Collects real evidence (filesystem, git, ports, CLI binaries) for every repo
under /home/zoth/NullAITech and emits a JSON ledger. No network, no writes to
any repo.
"""
import json
import os
import re
import shutil
import subprocess
from datetime import datetime, timezone

BASE = "/home/zoth/NullAITech"
STUDIO = os.path.join(BASE, "zoth-studio-v2")
CHROOT_BIN = os.path.join(BASE, "zoth-os/config/includes.chroot/usr/local/bin")
LOCAL_BIN = "/home/zoth/.local/bin"
USR_BIN = "/usr/local/bin"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.json")

# Infrastructure directories that are never Zoth Studio tools.
INFRA = {
    "bin", "src", "tests", "prompts", "research", "sites", "generated-sites",
    "media-assets", "security-captures", "growth-distribution", "docs", "node_modules",
}


def read_text(path, limit=200000):
    try:
        with open(path, "r", errors="replace") as fh:
            return fh.read(limit)
    except OSError:
        return ""


def parse_tools_data():
    """Extract the declared toolsData.js entries."""
    src = read_text(os.path.join(STUDIO, "src/data/toolsData.js"))
    entries = {}
    for block in re.finditer(r"\{\s*\n\s*id:\s*'([^']+)'(.*?)\n  \},", src, re.S):
        tid, body = block.group(1), block.group(2)

        def field(name):
            m = re.search(rf"\n\s*{name}:\s*'?([^'\n,]+)'?,", body)
            return m.group(1).strip() if m else None

        port = re.search(r"\n\s*localPort:\s*(\d+)", body)
        entries[tid] = {
            "id": tid,
            "repo": field("repo"),
            "name": field("name"),
            "category": field("category"),
            "executionType": field("executionType"),
            "version": field("version"),
            "localPort": int(port.group(1)) if port else None,
            "published": "published: false" not in body,
        }
    return entries


def tool_component_ids():
    """Tool ids the studio page knows how to render (map keys, not lazy imports)."""
    page = read_text(os.path.join(STUDIO, "src/pages/RealToolWorkspacePage.jsx"))
    return set(re.findall(r"'([a-z0-9\-]+)':\s*[A-Za-z]", page))


def repo_facts(path, name):
    facts = {
        "repo": name,
        "path": path,
        "has_readme": False,
        "readme_bytes": 0,
        "version": None,
        "stack": [],
        "declared_port": None,
        "cli_binaries": [],
        "git_branch": None,
        "git_dirty": None,
    }
    for candidate in ("README.md", "README.MD", "readme.md"):
        rp = os.path.join(path, candidate)
        if os.path.isfile(rp):
            facts["has_readme"] = True
            facts["readme_bytes"] = os.path.getsize(rp)
            break

    pkg = os.path.join(path, "package.json")
    if os.path.isfile(pkg):
        facts["stack"].append("node")
        try:
            pj = json.loads(read_text(pkg, 100000))
            facts["version"] = pj.get("version")
            facts["package_name"] = pj.get("name")
        except (ValueError, TypeError):
            pass
    if os.path.isfile(os.path.join(path, "pyproject.toml")) or os.path.isfile(os.path.join(path, "setup.py")):
        facts["stack"].append("python")
    if os.path.isfile(os.path.join(path, "Cargo.toml")):
        facts["stack"].append("rust")

    # Declared port: search server entrypoints, not the whole tree (fast + precise).
    port_re = re.compile(r"(?:PORT|port)\s*[:=]\s*['\"]?(\d{4,5})")
    for sub in ("server.js", "server.py", "src/server.js", "src/index.js", "src/server.py",
                "app.py", "main.py", "src/main.py", "index.js", "src/server.ts"):
        sp = os.path.join(path, sub)
        if os.path.isfile(sp):
            m = port_re.search(read_text(sp, 60000))
            if m:
                facts["declared_port"] = int(m.group(1))
                break

    # CLI binaries for this tool across the three surfaces.
    for label, d in (("usr_local_bin", USR_BIN), ("local_bin", LOCAL_BIN), ("chroot", CHROOT_BIN)):
        if os.path.isdir(d):
            for entry in os.listdir(d):
                if entry == name:
                    facts["cli_binaries"].append(f"{label}:{entry}")

    # git state
    try:
        facts["git_branch"] = subprocess.run(
            ["git", "-C", path, "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=10,
        ).stdout.strip() or None
        facts["git_dirty"] = bool(subprocess.run(
            ["git", "-C", path, "status", "--porcelain"],
            capture_output=True, text=True, timeout=20,
        ).stdout.strip())
    except (subprocess.SubprocessError, OSError):
        pass
    return facts


def main():
    tools = parse_tools_data()
    components = tool_component_ids()

    repos = sorted(
        d for d in os.listdir(BASE)
        if os.path.isdir(os.path.join(BASE, d))
        and not d.startswith(".")
        and d not in INFRA
    )
    facts = [repo_facts(os.path.join(BASE, r), r) for r in repos]

    by_repo = {f["repo"]: f for f in facts}

    # --- Port collisions among declared tools ---
    ports = {}
    for t in tools.values():
        if t["localPort"] is not None:
            ports.setdefault(t["localPort"], []).append(t["id"])
    collisions = {str(p): sorted(ids) for p, ids in ports.items() if len(ids) > 1}

    # --- Orphans: code repos that are not declared in toolsData.js ---
    orphans = []
    for f in facts:
        if f["repo"] in ("zoth-studio-v2", "zoth-os"):
            continue
        declared = f["repo"] in {t["repo"] for t in tools.values()}
        if declared:
            continue
        # Only consider it a candidate orphan tool if it looks like a real app/bin.
        looks_like_tool = bool(f["stack"]) or bool(f["cli_binaries"]) or f["declared_port"] is not None
        orphans.append({**f, "looks_like_tool": looks_like_tool})

    # --- Tri-surface matrix ---
    matrix = []
    for t in sorted(tools.values(), key=lambda x: x["id"]):
        f = by_repo.get(t["repo"] or "", {})
        matrix.append({
            "id": t["id"],
            "name": t["name"],
            "repo": t["repo"],
            "category": t["category"],
            "executionType": t["executionType"],
            "version": t["version"],
            "localPort": t["localPort"],
            "A_standalone_repo": bool(f),
            "A_has_readme": f.get("has_readme", False),
            "B_studio_component": t["id"] in components,
            "C_cli_binaries": f.get("cli_binaries", []),
            "E_visual_verified": False,
        })

    ledger = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "declared_tools": len(tools),
            "filesystem_repos": len(facts),
            "studio_component_map_ids": len(components),
            "orphan_candidates": len(orphans),
            "orphan_likely_tools": sum(1 for o in orphans if o["looks_like_tool"]),
            "port_collisions": len(collisions),
        },
        "port_collisions": collisions,
        "orphans": orphans,
        "matrix": matrix,
    }
    with open(OUT, "w") as fh:
        json.dump(ledger, fh, indent=2)

    print(f"ledger -> {OUT}")
    print("counts:", json.dumps(ledger["counts"], indent=2))
    print("\nport collisions:", json.dumps(collisions, indent=2) or "none")
    print("\nlikely orphan tools:")
    for o in orphans:
        if o["looks_like_tool"]:
            print(f"  {o['repo']:<34} stack={','.join(o['stack']) or '-':<10} port={o['declared_port']} readme={'y' if o['has_readme'] else 'n'}")
    print("\nno-A (declared tool with no matching repo dir):")
    for m in matrix:
        if not m["A_standalone_repo"]:
            print("  ", m["id"], m["repo"])
    print("\nno-B (declared tool with no studio component):")
    for m in matrix:
        if not m["B_studio_component"]:
            print("  ", m["id"], m["repo"])


if __name__ == "__main__":
    main()
