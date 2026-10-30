#!/usr/bin/env python3
"""Census of src/components/tools/*.jsx — what each tool renders, so the
sovereign band can be inserted by structure, not by guesswork."""
import os
import re
import sys

TOOLS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'components', 'tools')

HEADING = re.compile(r'<(?:Typography[^>]*?variant="(h\d|subtitle\d|overline|body\d)"|<(h[1-6])\b)')
FILES = sorted(f for f in os.listdir(TOOLS) if f.endswith('.jsx'))

shared = {}
for f in FILES:
    p = os.path.join(TOOLS, f)
    src = open(p, encoding='utf-8').read()
    lines = src.split('\n')
    flags = {
        'lines': len(lines),
        'header': 'ToolHeader' in src,
        'band': 'SovereignBand' in src,
        'canvas': 'canvas' in src,
        'raf': 'requestAnimationFrame' in src,
        'braille': 'Braille' in src or '\\u2800' in src,
        'bayer': 'BAYER' in src or 'Bayer' in src,
        'scanline': 'scanline' in src.lower(),
        'orbit': 'orbit' in src.lower(),
        'paper': '<Paper' in src,
        'grid': '<Grid container' in src,
        'defexp': 'export default function' in src,
        'imgs': len(re.findall(r'<canvas', src)),
    }
    shared[f] = flags

def pct(k):
    n = sum(1 for v in shared.values() if v[k])
    return f'{k}: {n}/{len(FILES)}'

print('== shared flags over', len(FILES), 'tool files ==')
for k in ['header', 'band', 'canvas', 'raf', 'braille', 'bayer', 'scanline', 'orbit', 'paper', 'grid', 'defexp']:
    print(' ', pct(k))

print('\n== per-file (name | lines | H | C | R | paper | grid | canvas#) ==')
for f in FILES:
    v = shared[f]
    print(f'  {f:52s} {v["lines"]:5d} {"H" if v["header"] else "-"} {"C" if v["canvas"] else "-"} '
          f'{"R" if v["raf"] else "-"} {"P" if v["paper"] else "-"} {"G" if v["grid"] else "-"} {v["imgs"]}')

print('\n== heading variants used ==')
hv = {}
for f in FILES:
    src = open(os.path.join(TOOLS, f), encoding='utf-8').read()
    for m in HEADING.finditer(src):
        k = m.group(1) or m.group(2)
        hv[k] = hv.get(k, 0) + 1
for k, n in sorted(hv.items(), key=lambda x: -x[1]):
    print(f'  {k}: {n}')

print('\n== sibling components in src/components (top level) ==')
comp = os.path.dirname(TOOLS)
for f in sorted(os.listdir(comp)):
    p = os.path.join(comp, f)
    if os.path.isfile(p):
        print(f'  {f}  {os.path.getsize(p)}b')
    else:
        print(f'  {f}/  ({len(os.listdir(p))} entries)')

if len(sys.argv) > 1:
    for name in sys.argv[1:]:
        p = os.path.join(TOOLS, name) if not name.startswith('/') else name
        src = open(p, encoding='utf-8').read()
        head = src.split('\n')[:70]
        print(f'\n===== {name} (first 70 lines of {len(src.splitlines())}) =====')
        for i, l in enumerate(head, 1):
            print(f'{i:4d}| {l}')
