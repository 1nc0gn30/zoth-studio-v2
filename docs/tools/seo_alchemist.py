#!/usr/bin/env python3
"""Layer A SEO/AEO alchemist — Phase 2 of the Hermes 24h mission.

Injects the fleet-standard OpenGraph/Twitter block and a schema.org @graph
(SoftwareApplication + FAQPage) into one tool's standalone entry document,
using only the tool's own toolsData.js record + README, so nothing is invented.

Guarantees:
  * one tool per invocation (the mission's one-tool-at-a-time sweep)
  * idempotent — refuses to touch a document that already has application/ld+json
  * non-destructive — the original is copied to the 24h backup dir first
  * self-validating — re-parses the injected JSON-LD and re-runs the Layer A
    checks from parity_probe.py, printing the before/after gap lists

Usage:
  python3 docs/tools/seo_alchemist.py zoth-bounty
  python3 docs/tools/seo_alchemist.py zoth-bounty --dry-run
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parity_probe import parse_tools, find_entry, probe_layer_a  # noqa: E402

ROOT = "~/NullAITech"
BACKUP = "~/.hermes/cache/scratch/backups-24h"
STRIPE = "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
SOLANA = "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
OG_IMAGE = "https://zoth.nullai.tech/og-zoth.png"
MARKER = "<!-- SEO/AEO alchemist · Hermes 24h parity mission -->"


def clip(s, n=190):
    s = re.sub(r"\s+", " ", (s or "")).strip()
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(" ", 1)[0]
    return cut.rstrip(" ,;:.") + "…"


def esc(s):
    return (s.replace("&", "&amp;").replace('"', "&quot;")
            .replace("<", "&lt;").replace(">", "&gt;"))


def build_block(t, readme_head=""):
    name = t.get("name") or t["id"]
    desc = clip(t.get("description") or readme_head or name, 190)
    port = t.get("localPort") or 0
    local = t.get("localUrl") or (f"http://127.0.0.1:{port}" if port else "")
    live = (t.get("liveUrl") or "").strip()
    canonical = live if live.startswith("http") else ""
    pull = clip(t.get("pull") or "", 150)
    pricing = t.get("pricing") or "100% Free & Open-Access"
    version = t.get("version") or ""
    cat = t.get("category") or "DeveloperApplication"
    exec_type = t.get("executionType") or "browser"

    faqs = [
        (f"What is {name}?",
         f"{name} is a {cat.lower()} tool from the NullAI / ZothOS sovereign arsenal. "
         f"{clip(t.get('description') or name, 300)}"),
        (f"How do I run {name} locally?",
         (f"Launch it with `{pull}` " if pull else "")
         + (f"It then serves on {local} (assigned local port {port})." if local else "")
         + (" It also ships as a Zoth Studio route at https://zoth.nullai.tech/tools/"
            f"{t['id']}.")),
        (f"Is {name} free, or is there a paywall?",
         f"{pricing} — no paywall, no blur-lock, no trial gate. Optional support is "
         f"accepted via Buy Us a Coffee on Stripe ({STRIPE}) and the Solana tip address "
         f"{SOLANA}."),
    ]

    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["WebApplication", "SoftwareApplication"],
                "name": name,
                "url": canonical or (f"https://zoth.nullai.tech/tools/{t['id']}"),
                "applicationCategory": cat,
                "operatingSystem": "Linux, ZothOS, Web",
                "softwareVersion": version,
                "description": desc,
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
                "creator": {"@type": "Organization",
                            "name": "1nc0gn30 • NullAI",
                            "url": "https://nullai.tech"},
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": q,
                     "acceptedAnswer": {"@type": "Answer", "text": a}}
                    for q, a in faqs
                ],
            },
        ],
    }
    ld = json.dumps(graph, indent=2, ensure_ascii=False)

    lines = [MARKER]
    if canonical:
        lines.append(f'  <link rel="canonical" href="{esc(canonical)}" />')
    lines.append('  <!-- OpenGraph & Twitter Cards -->')
    for prop, val in (("og:title", name), ("og:description", clip(desc, 200)),
                      ("og:type", "website"),
                      ("og:url", canonical or f"https://zoth.nullai.tech/tools/{t['id']}"),
                      ("og:image", OG_IMAGE)):
        lines.append(f'  <meta property="{prop}" content="{esc(val)}" />')
    lines.append('  <meta name="twitter:card" content="summary_large_image" />')
    for nm, val in (("twitter:site", "@1nc0gn30"), ("twitter:creator", "@1nc0gn30"),
                    ("twitter:title", name), ("twitter:description", clip(desc, 200)),
                    ("twitter:image", OG_IMAGE)):
        lines.append(f'  <meta name="{nm}" content="{esc(val)}" />')
    lines.append('  <!-- Schema.org Graph (SoftwareApplication + FAQPage) -->')
    lines.append('  <script type="application/ld+json">')
    lines.extend(("  " + l) for l in ld.splitlines())
    lines.append("  </script>")
    return "\n".join(lines), exec_type


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tool")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true",
                    help="replace an existing alchemist block instead of refusing")
    args = ap.parse_args()

    tools = {t["id"]: t for t in parse_tools()}
    if args.tool not in tools:
        print(json.dumps({"error": "unknown tool id", "id": args.tool, "known": len(tools)}))
        return 2
    t = tools[args.tool]
    repo = os.path.join(ROOT, t.get("repo") or t["id"])
    entry = find_entry(repo)
    if not entry:
        print(json.dumps({"error": "no entry document", "id": args.tool, "repo": repo}))
        return 3

    before = probe_layer_a(repo)
    html = open(entry, encoding="utf-8", errors="replace").read()
    readme = os.path.join(repo, "README.md")
    readme_head = ""
    if os.path.isfile(readme):
        rtxt = open(readme, encoding="utf-8", errors="replace").read()
        m = re.search(r"\n\n([^\n#>][^\n]{40,400})", rtxt)
        readme_head = m.group(1) if m else ""

    has_ld = bool(re.search(r'<script[^>]+application/ld\+json', html, re.I))
    has_block = MARKER in html
    if (has_ld or has_block) and not args.force:
        print(json.dumps({"id": args.tool, "action": "skip",
                          "reason": "ld+json already present" if has_ld else "alchemist block present",
                          "entry": entry, "before": before}, indent=2))
        return 0

    block, exec_type = build_block(t, readme_head)
    if not re.search(r"</head>", html, re.I):
        print(json.dumps({"error": "no </head> anchor", "id": args.tool, "entry": entry}))
        return 4

    if has_block:
        html = re.sub(re.escape(MARKER) + r".*?</script>", block, html, count=1, flags=re.S)
    else:
        html = re.sub(r"</head>", block + "\n</head>", html, count=1, flags=re.I)

    # self-validate the injected JSON-LD before anything is written
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    try:
        assert m is not None, "ld+json block not found after injection"
        parsed = json.loads(m.group(1))
        assert parsed["@graph"][1]["@type"] == "FAQPage"
    except Exception as e:  # pragma: no cover - defensive
        print(json.dumps({"error": f"injected JSON-LD invalid: {e}", "id": args.tool}))
        return 5

    if args.dry_run:
        print(json.dumps({"id": args.tool, "action": "dry-run", "entry": entry,
                          "would_insert_bytes": len(block), "before": before,
                          "executionType": exec_type}, indent=2))
        return 0

    os.makedirs(BACKUP, exist_ok=True)
    sha = hashlib.sha256(open(entry, "rb").read()).hexdigest()[:8]
    bpath = os.path.join(BACKUP, f"{args.tool}.index.html.orig-{sha}")
    if not os.path.exists(bpath):
        shutil.copy2(entry, bpath)
    open(entry, "w", encoding="utf-8").write(html)

    after = probe_layer_a(repo)
    print(json.dumps({"id": args.tool, "action": "patched", "entry": entry,
                      "backup": bpath, "inserted_bytes": len(block),
                      "executionType": exec_type,
                      "gap_before": before.get("a_gap"), "gap_after": after.get("a_gap"),
                      "og_tags": after.get("og_tags"), "ldjson_ok": after.get("has_ldjson"),
                      "faq_ok": after.get("has_faq")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
