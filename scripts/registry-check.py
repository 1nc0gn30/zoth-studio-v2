#!/usr/bin/env python3
"""
ZothOS Registry Integrity Checker (registry-check)
Single source of truth: public/api/tools.json

Validates:
1. tools.json parses and has valid schema
2. Every tool port is strictly unique (zero port collisions)
3. toolsData.js tool count equals registry tool count
4. catalog.json tool count equals registry tool count
5. Workstations count is verified and consistent
"""

import sys
import os
import json
import re

GOLD = '\033[38;2;212;175;55m'
GREEN = '\033[32m'
RED = '\033[31m'
CYAN = '\033[36m'
DIM = '\033[2m'
BOLD = '\033[1m'
RESET = '\033[0m'

def fail(msg):
    print(f"  {RED}✖ FAIL:{RESET} {msg}", file=sys.stderr)
    sys.exit(1)

def ok(msg):
    print(f"  {GREEN}✔ PASS:{RESET} {msg}")

def main():
    print(f"\n{GOLD}{BOLD}ZOTH REGISTRY INTEGRITY GATE{RESET}\n")

    # Locate studio root
    candidates = [
        os.path.expanduser('~/NullAITech/zoth-studio-v2'),
        '/opt/zoth-studio',
        os.getcwd()
    ]
    studio_root = None
    for c in candidates:
        if os.path.exists(os.path.join(c, 'public/api/tools.json')):
            studio_root = c
            break

    if not studio_root:
        fail("Could not locate zoth-studio-v2 repository root.")

    tools_json_path = os.path.join(studio_root, 'public/api/tools.json')
    tools_data_path = os.path.join(studio_root, 'src/data/toolsData.js')
    workstations_path = os.path.join(studio_root, 'src/data/workstations.js')
    catalog_path = os.path.expanduser('~/NullAITech/zoth-npm/catalog.json')

    # 1. Parse tools.json
    try:
        with open(tools_json_path, 'r', encoding='utf-8') as f:
            registry = json.load(f)
    except Exception as e:
        fail(f"Could not parse {tools_json_path}: {e}")

    tools = registry.get('tools', [])
    registry_count = len(tools)
    if registry_count == 0:
        fail("Registry contains 0 tools.")
    ok(f"tools.json parsed successfully ({registry_count} tools declared)")

    # 2. Port collision check
    ports = {}
    for t in tools:
        tid = t.get('id', 'unknown')
        port = t.get('port')
        if not port:
            # Fall back to inspecting pull command or local_url
            m = re.search(r'http\.server\s+(\d+)', t.get('pull', ''))
            if m:
                port = int(m.group(1))
            elif t.get('local_url'):
                m2 = re.search(r':(\d+)', t['local_url'])
                if m2:
                    port = int(m2.group(1))
        
        if port:
            ports.setdefault(port, []).append(tid)

    collisions = {p: ts for p, ts in ports.items() if len(ts) > 1}
    if collisions:
        msg = "; ".join(f":{p} claimed by {ts}" for p, ts in collisions.items())
        fail(f"Port collisions detected in registry: {msg}")
    ok(f"Port collision check passed: {len(ports)} unique loopback ports, 0 collisions")

    # 3. toolsData.js count check
    if os.path.exists(tools_data_path):
        with open(tools_data_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tool_ids = re.findall(r'id:\s*[\'\"]([^\'\"]+)[\'\"]', code)
        if len(tool_ids) != registry_count:
            fail(f"Row count mismatch: toolsData.js has {len(tool_ids)} tools, but tools.json has {registry_count}")
        ok(f"Page row count match: toolsData.js ({len(tool_ids)}) == tools.json ({registry_count})")
    else:
        fail(f"toolsData.js not found at {tools_data_path}")

    # 4. catalog.json count check
    if os.path.exists(catalog_path):
        with open(catalog_path, 'r', encoding='utf-8') as f:
            cat = json.load(f)
        if len(cat) != registry_count:
            fail(f"Catalog count mismatch: catalog.json has {len(cat)} tools, tools.json has {registry_count}")
        ok(f"Catalog match: catalog.json ({len(cat)}) == tools.json ({registry_count})")

    # 5. Workstations integrity
    if os.path.exists(workstations_path):
        with open(workstations_path, 'r', encoding='utf-8') as f:
            w_code = f.read()
        w_ids = re.findall(r'id:\s*[\'\"]([^\'\"]+)[\'\"]', w_code)
        unique_w_ids = set(w_ids)
        if len(w_ids) != len(unique_w_ids):
            fail(f"Duplicate workstation IDs found in {workstations_path}")
        ok(f"Workstations integrity verified: {len(w_ids)} unique workstations")

    print(f"\n{GOLD}{BOLD}✔ ALL REGISTRY INTEGRITY CHECKS PASSED (exit 0){RESET}\n")
    sys.exit(0)

if __name__ == '__main__':
    main()
