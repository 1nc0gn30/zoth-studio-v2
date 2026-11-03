#!/usr/bin/env bash
# Scan GitHub Release binary/installer assets with VirusTotal API v3.
# Respects free-tier rate limits (~4 req/min), outputs virustotal-report.md,
# uploads it as a release asset, and exits non-zero only when a high-confidence
# engine set flags a binary.
#
# Required env:
#   GITHUB_REPOSITORY  (e.g. NullAITech/zoth-studio-v2)
#   TAG                (release tag, e.g. v2.1.0)
#   GH_TOKEN           (GitHub Actions token with contents:write)
#   VT_API_KEY         (VirusTotal API v3 key from Actions secrets)

set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${TAG:?TAG is required}"
: "${GH_TOKEN:?GH_TOKEN is required}"

REPORT="virustotal-report.md"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

HIGH_CONFIDENCE_ENGINES='^(Microsoft|Kaspersky|BitDefender|ESET-NOD32|CrowdStrike|SentinelOne|Symantec|Sophos|Malwarebytes|ClamAV|Google|Avast|McAfee)$'
MAX_DIRECT_BYTES=$((32 * 1024 * 1024))
MAX_LARGE_BYTES=$((650 * 1024 * 1024))

{
  echo "# VirusTotal Release Scan Report (\`${TAG}\`)"
  echo ""
  echo "- **Repository:** \`${GITHUB_REPOSITORY}\`"
  echo "- **Release Tag:** \`${TAG}\`"
  echo "- **Scanned At (UTC):** \`$(date -u +"%Y-%m-%dT%H:%M:%SZ")\`"
  echo ""
} > "$REPORT"

if [[ -z "${VT_API_KEY:-}" ]]; then
  {
    echo "> [!NOTE]"
    echo "> \`VT_API_KEY\` secret is not configured in GitHub Actions yet. Skipping live VirusTotal upload."
    echo "> Verify asset integrity via \`SHA256SUMS\` and \`SHA256SUMS.cosign.bundle\` (see \`docs/TRUST.md\`)."
  } >> "$REPORT"
  cat "$REPORT"
  exit 0
fi

# Fetch binary/installer asset names & sizes; skip signatures, checksums, SBOMs, reports, and source archives.
ASSETS_JSON="$(gh api "repos/${GITHUB_REPOSITORY}/releases/tags/${TAG}" --jq '.assets')"
mapfile -t ASSET_LINES < <(
  printf '%s' "$ASSETS_JSON" | jq -r '
    .[]
    | select(.name | test("(SHA256SUMS|virustotal-report\\.md|\\.(sig|pem|bundle|intoto\\.jsonl|spdx\\.json|cdx\\.json|sha256|txt|md))$"; "i") | not)
    | select(.name | test("\\.(AppImage|deb|rpm|dmg|exe|msi|iso|run|pkg|bin|tar\\.gz|zip)$|^ZothStudio-|^zoth-studio-linux-"; "i"))
    | "\(.name)\t\(.size)"
  '
)

if [[ "${#ASSET_LINES[@]}" -eq 0 ]]; then
  echo "No binary/installer assets matched on release ${TAG}." >> "$REPORT"
  gh release upload "$TAG" "$REPORT" --clobber --repo "$GITHUB_REPOSITORY" || true
  exit 0
fi

{
  echo "| Asset Filename | SHA-256 | Detections (Positives / Total) | High-Confidence Positives | VirusTotal Permalink |"
  echo "| :--- | :--- | :--- | :--- | :--- |"
} >> "$REPORT"

HIGH_CONF_FAILURES=0

for line in "${ASSET_LINES[@]}"; do
  name="${line%%$'\t'*}"
  size="${line##*$'\t'}"

  if (( size > MAX_LARGE_BYTES )); then
    echo "| \`${name}\` | *(skipped: >650 MB)* | N/A | 0 | Exceeds VT API limit; verify via \`SHA256SUMS\` |" >> "$REPORT"
    continue
  fi

  dest="${WORKDIR}/${name}"
  gh release download "$TAG" --pattern "$name" --dir "$WORKDIR" --clobber --repo "$GITHUB_REPOSITORY"
  sha256="$(sha256sum "$dest" | awk '{print $1}')"
  vt_gui_url="https://www.virustotal.com/gui/file/${sha256}"

  http_code="$(curl -sS -o "${WORKDIR}/vt_lookup.json" -w '%{http_code}' \
    -H "x-apikey: ${VT_API_KEY}" \
    "https://www.virustotal.com/api/v3/files/${sha256}" || echo "000")"

  if [[ "$http_code" != "200" ]]; then
    sleep 16
    upload_url="https://www.virustotal.com/api/v3/files"
    if (( size > MAX_DIRECT_BYTES )); then
      upload_url="$(curl -sSf -H "x-apikey: ${VT_API_KEY}" \
        "https://www.virustotal.com/api/v3/files/upload_url" | jq -r '.data')"
    fi

    analysis_id="$(curl -sSf -X POST "$upload_url" \
      -H "x-apikey: ${VT_API_KEY}" \
      -F "file=@${dest}" | jq -r '.data.id // empty')"

    if [[ -n "$analysis_id" ]]; then
      for _ in 1 2 3 4 5 6; do
        sleep 20
        status="$(curl -sSf -H "x-apikey: ${VT_API_KEY}" \
          "https://www.virustotal.com/api/v3/analyses/${analysis_id}" | jq -r '.data.attributes.status // empty')"
        if [[ "$status" == "completed" ]]; then
          break
        fi
      done
    fi

    sleep 16
    http_code="$(curl -sS -o "${WORKDIR}/vt_lookup.json" -w '%{http_code}' \
      -H "x-apikey: ${VT_API_KEY}" \
      "https://www.virustotal.com/api/v3/files/${sha256}" || echo "000")"
  fi

  if [[ "$http_code" == "200" ]]; then
    malicious="$(jq -r '.data.attributes.last_analysis_stats.malicious // 0' "${WORKDIR}/vt_lookup.json")"
    suspicious="$(jq -r '.data.attributes.last_analysis_stats.suspicious // 0' "${WORKDIR}/vt_lookup.json")"
    harmless="$(jq -r '.data.attributes.last_analysis_stats.harmless // 0' "${WORKDIR}/vt_lookup.json")"
    undetected="$(jq -r '.data.attributes.last_analysis_stats.undetected // 0' "${WORKDIR}/vt_lookup.json")"
    positives=$(( malicious + suspicious ))
    total=$(( positives + harmless + undetected ))

    hi_conf="$(jq -r --arg re "$HIGH_CONFIDENCE_ENGINES" '
      [ .data.attributes.last_analysis_results // {} | to_entries[]
        | select(.key | test($re))
        | select(.value.category == "malicious")
      ] | length
    ' "${WORKDIR}/vt_lookup.json")"

    if (( hi_conf > 0 )); then
      HIGH_CONF_FAILURES=$(( HIGH_CONF_FAILURES + hi_conf ))
    fi

    echo "| \`${name}\` | \`${sha256:0:16}…\` | **${positives} / ${total}** | **${hi_conf}** | [View Report](${vt_gui_url}) |" >> "$REPORT"
  else
    echo "| \`${name}\` | \`${sha256:0:16}…\` | Pending analysis | 0 | [Lookup SHA-256](${vt_gui_url}) |" >> "$REPORT"
  fi

  rm -f "$dest"
done

cat "$REPORT"
gh release upload "$TAG" "$REPORT" --clobber --repo "$GITHUB_REPOSITORY"

if (( HIGH_CONF_FAILURES > 0 )); then
  echo "::error::High-confidence VirusTotal engines flagged one or more release binaries."
  exit 1
fi
