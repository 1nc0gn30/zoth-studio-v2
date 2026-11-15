#!/usr/bin/env python3
"""Hermes 24h mission — auditable local commit gate (HEAD-safe).

Why this exists: `/home/zoth/NullAITech/*` repos carry the owner's own
uncommitted work-in-progress, and the owner's tooling commits on `main` while
this mission runs. So this gate never switches branches, never touches the
owner's index, never pushes, and commits ONLY the explicit paths handed to it:

  1. builds a temporary index seeded from HEAD and stages exactly `--paths`,
  2. aborts if a staged path matches a forbidden artifact name
     (`.env`, `auth.json`, `*token*`, `*.pem`, `*.key`, `*.db`, `*.sqlite`, ...),
  3. aborts if any staged ADDED line matches a credential pattern
     (`sk-`, `ghp_`, `AIza`, `xoxb-`, `BEGIN ... PRIVATE KEY`, AKIA, JWT, ...),
  4. aborts if a staged added line is not recognised as Hermes mission output
     (marker whitelist; override with --allow-unknown) so the owner's unrelated
     edits are never silently swept in,
  5. writes the commit onto refs/heads/chore/hermes-24h-sovereign-parity with
     `git commit-tree` + `git update-ref`, leaving HEAD, the real index and the
     working tree of the owner's branch exactly as they were.
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile

BRANCH = "chore/hermes-24h-sovereign-parity"
SCRATCH = "/home/zoth/.hermes/cache/scratch"

FORBIDDEN_PATH = [
    r"(^|/)\.env(\..*)?$", r"(^|/)auth\.json$", r"mcp[-_]?tokens", r"\.pem$", r"\.key$",
    r"\.db$", r"\.sqlite3?$", r"(^|/)cookies?\.txt$", r"id_rsa", r"\.p12$", r"credentials",
]
SECRET_LINE = [
    r"sk-[A-Za-z0-9]{16,}", r"ghp_[A-Za-z0-9]{20,}", r"gho_[A-Za-z0-9]{20,}",
    r"AIza[0-9A-Za-z_-]{30,}", r"xox[baprs]-[0-9A-Za-z-]{10,}", r"-----BEGIN [A-Z ]*PRIVATE KEY",
    r"AKIA[0-9A-Z]{16}", r"eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.", r"sk_live_[A-Za-z0-9]{10,}",
    r"rk_live_[A-Za-z0-9]{10,}",
]
# Every legitimate added line produced by this mission matches >=1 marker.
MISSION_MARKER = [
    r"application/ld\+json", r'"@context"', r'"@type"', r"WebApplication", r"FAQPage",
    r"og:", r"twitter:", r"buy\.stripe\.com", r"GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK",
    r"footer-support", r"Solana tip address", r"rel=\"noopener", r"user-select",
    r"parity_probe", r"ldtype_upgrade", r"SOVEREIGN_ECOSYSTEM_ATLAS", r"PARITY_CHECKPOINT_LOG",
    r"seo_alchemist", r"atlas_gen", r"hermes_commit", r"hermes", r"Hermes",
    r"tri-surface", r"Tri-Surface", r"ZothOS", r"zoth-os", r"Layer A", r"Layer E",
    r"</?script", r"</?meta", r"</?head", r"</?body", r"</?html", r"name=\"description\"",
    # structural lines of the JSON-LD / HTML / Markdown this mission writes
    r"^\s*[\{\}\[\],]+\s*$", r"^\s*<!--", r"^-+>\s*$", r"^\s*</?[a-zA-Z!]", r"^\s*\"",
]


def git(repo, args, env=None, check=True):
    p = subprocess.run(["git", "-C", repo] + args, capture_output=True, text=True, env=env)
    if check and p.returncode != 0:
        raise SystemExit("FAILED: git %s\n%s%s" % (" ".join(args), p.stdout, p.stderr))
    return p.stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--paths", required=True, help="comma-separated paths relative to --repo")
    ap.add_argument("--message", required=True)
    ap.add_argument("--allow-unknown", action="store_true")
    a = ap.parse_args()

    repo = os.path.abspath(a.repo)
    paths = [p.strip() for p in a.paths.split(",") if p.strip()]
    name = os.path.basename(repo)
    if git(repo, ["rev-parse", "--is-inside-work-tree"]).strip() != "true":
        print("SKIP  %-34s not-a-git-repo" % name)
        return 0

    bad = [p for p in paths if any(re.search(rx, p, re.I) for rx in FORBIDDEN_PATH)]
    if bad:
        print("ABORT %-34s forbidden-path %s" % (name, bad))
        return 4

    head_branch_before = git(repo, ["rev-parse", "--abbrev-ref", "HEAD"]).strip()
    head_sha_before = git(repo, ["rev-parse", "HEAD"]).strip()

    # temp index -> the owner's real index and working tree are never touched
    tmpdir = tempfile.mkdtemp(prefix="hermes-idx-", dir=SCRATCH)
    env = dict(os.environ, GIT_INDEX_FILE=os.path.join(tmpdir, "index"))
    git(repo, ["read-tree", "HEAD"], env=env)
    git(repo, ["add", "--"] + paths, env=env)

    diff = git(repo, ["diff", "--cached", "--unified=0", "--"] + paths, env=env)
    if not diff.strip():
        print("SKIP  %-34s nothing-staged (already committed / unchanged)" % name)
        return 0

    added = [l[1:] for l in diff.splitlines() if l.startswith("+") and not l.startswith("+++")]
    removed = [l[1:] for l in diff.splitlines() if l.startswith("-") and not l.startswith("---")]
    secrets = [(rx, l[:110]) for l in added for rx in SECRET_LINE if re.search(rx, l)]
    if secrets:
        print("ABORT %-34s credential-pattern" % name)
        for rx, l in secrets[:5]:
            print("   %s :: %s" % (rx, l))
        return 5

    if not a.allow_unknown:
        unknown = [l for l in added if l.strip() and not any(re.search(rx, l) for rx in MISSION_MARKER)]
        if unknown:
            print("ABORT %-34s unrecognised-staged-lines (%d)" % (name, len(unknown)))
            for l in unknown[:6]:
                print("   %s" % l[:150])
            return 6

    tree = git(repo, ["write-tree"], env=env).strip()
    tip = subprocess.run(["git", "-C", repo, "rev-parse", "--verify", "--quiet", "refs/heads/" + BRANCH],
                         capture_output=True, text=True).stdout.strip()
    parent = tip or head_sha_before
    commit = git(repo, ["commit-tree", tree, "-p", parent, "-m", a.message]).strip()
    git(repo, ["update-ref", "refs/heads/" + BRANCH, commit])

    # verify: HEAD untouched, branch advanced, commit contents match intent
    head_branch_after = git(repo, ["rev-parse", "--abbrev-ref", "HEAD"]).strip()
    head_sha_after = git(repo, ["rev-parse", "HEAD"]).strip()
    stat = git(repo, ["show", "--stat", "--format=", commit])
    files = len([l for l in stat.splitlines() if "|" in l])
    head_untouched = (head_branch_before == head_branch_after and head_sha_before == head_sha_after)
    print("%s %-34s %s  files=%d +%d/-%d  HEAD-untouched=%s  parents=%s"
          % ("COMMITTED" if head_untouched else "WARN-HEAD-MOVED", name, commit[:8], files,
             len(added), len(removed), head_untouched, parent[:8]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
