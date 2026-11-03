#!/usr/bin/env bash
# Scan the working tree with .gitleaks.toml. Same command CI runs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks is not on PATH. Install v8.30.1; see docs/SECRET-HYGIENE.md." >&2
  exit 127
fi

args=(dir . --config .gitleaks.toml --redact --verbose --no-banner)
if [[ -n "${CI:-}" ]]; then
  args+=(--no-color)
fi

exec gitleaks "${args[@]}" "$@"
