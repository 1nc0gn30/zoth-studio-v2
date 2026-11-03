# Security & Supply-Chain Trust Architecture (`NullAITech/zoth-studio-v2`)

This document describes the automated security scanning, supply-chain provenance, and binary verification controls enforced on `NullAITech/zoth-studio-v2` for users, enterprise auditors, and AI plugin/connector marketplace reviewers.

---

## 1. Automated Security & Supply-Chain Controls

| Control | Workflow | Scope & Cadence | Output / Verification |
| :--- | :--- | :--- | :--- |
| **Secret & PII Scanning** | [`.github/workflows/gitleaks.yml`](../.github/workflows/gitleaks.yml) | Every push & pull request (`tools/scan-secrets.sh` + `.gitleaks.toml`) | Fails CI on any leaked credential, token, or PII pattern |
| **CodeQL SAST** | [`.github/workflows/codeql.yml`](../.github/workflows/codeql.yml) | Push to `main`, PRs, weekly cron (`javascript-typescript`, `python`, `actions`) | SARIF uploaded to GitHub Security → Code Scanning |
| **Semgrep SAST** | [`.github/workflows/semgrep.yml`](../.github/workflows/semgrep.yml) | Push to `main`, PRs, weekly cron (`p/security-audit`, `p/secrets`, `p/default`) | SARIF uploaded to GitHub Security → Code Scanning |
| **OpenSSF Scorecard** | [`.github/workflows/scorecard.yml`](../.github/workflows/scorecard.yml) | Push to `main`, weekly cron (`publish_results: true`) | Public badge & report at [`scorecard.dev`](https://scorecard.dev/viewer/?repo=github.com/NullAITech/zoth-studio-v2) |
| **SPDX & CycloneDX SBOM** | [`.github/workflows/sbom.yml`](../.github/workflows/sbom.yml) | Push to `main` & published releases | `zoth-studio-source.spdx.json` & `zoth-studio-source.cdx.json` attached to releases |
| **Sigstore Cosign + SLSA Provenance** | [`.github/workflows/release-sign.yml`](../.github/workflows/release-sign.yml) | Every published release | Keyless OIDC `SHA256SUMS.cosign.bundle` + GitHub Attestations |
| **VirusTotal Binary Scan** | [`.github/workflows/virustotal-release.yml`](../.github/workflows/virustotal-release.yml) | Every published release & manual dispatch (`tools/virustotal-release.sh`) | Uploads `virustotal-report.md` with per-asset SHA-256 & VT permalinks to the release |

---

## 2. VirusTotal Release Policy

1. **Binary & Installer Scope**: `tools/virustotal-release.sh` downloads only binary/installer release assets (`.AppImage`, `.deb`, `.rpm`, `.dmg`, `.exe`, `.msi`, `.run`, `.tar.gz`, `.zip`, and native macOS/Linux/Windows executables) within VirusTotal's API size limit and skips checksums, `.sig`, `.pem`, `.bundle`, `.intoto.jsonl`, and SBOM JSON files.
2. **Rate-Limited Free-Tier Compatibility**: Requests are paced at ~4 requests/minute so standard VirusTotal API keys (`VT_API_KEY` stored in GitHub Actions repository secrets—never committed to git) operate without quota errors.
3. **High-Confidence Gate & Outage Resilience**: The script fails if any high-confidence engine (`Microsoft`, `Kaspersky`, `BitDefender`, `ESET-NOD32`, `CrowdStrike`, `SentinelOne`, `Symantec`, `Sophos`, `Malwarebytes`, `ClamAV`, `Google`, `Avast`, `McAfee`) flags an asset as malicious, while `continue-on-error: true` at the workflow level prevents transient VirusTotal API outages from blocking signed release publication.
4. **Maintainer Setup**: Repository maintainers configure `VT_API_KEY` under **Settings → Secrets and variables → Actions → Repository secrets**.

---

## 3. How Users & Reviewers Verify Releases

See [`docs/VERIFYING.md`](VERIFYING.md) for step-by-step commands:

```bash
# 1. Verify keyless Sigstore Cosign signature over SHA256SUMS
cosign verify-blob SHA256SUMS \
  --bundle SHA256SUMS.cosign.bundle \
  --certificate-identity-regexp '^https://github.com/NullAITech/zoth-studio-v2/\.github/workflows/release-sign\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com

# 2. Verify SLSA build provenance attestation
gh attestation verify SHA256SUMS --repo NullAITech/zoth-studio-v2

# 3. Verify local asset SHA-256 digests and inspect virustotal-report.md on the Release page
sha256sum --ignore-missing -c SHA256SUMS
```

---

## 4. Independence & Attribution Disclosure

Zoth Studio and ZOTHOS are independent open-source software products engineered by **1nc0gn30 (`@1nc0gn30`) / NullAI Tech (`nullai.tech`)**. Integrations with third-party AI platforms, protocols, or marketplaces (including xAI Grok, Cursor, Nous Research Hermes, Anthropic Claude, and OpenAI) are independent interoperability connectors and do not imply formal corporate partnership or endorsement.
