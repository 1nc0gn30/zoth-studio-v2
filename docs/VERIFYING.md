# Verifying a Zoth Studio release

v2.1.0 and later releases carry cryptographic verification and provenance assets:

- `SHA256SUMS` - SHA-256 of every release asset (taken from GitHub's server-side asset digests).
- `SHA256SUMS.cosign.bundle` - a Sigstore signature over `SHA256SUMS`, made by this repo's
  `release-sign.yml` workflow with GitHub OIDC (no long-lived key), logged in Rekor.
- `virustotal-report.md` - VirusTotal multi-engine scan report with permalinks for each binary/installer asset.

GitHub also stores SLSA build provenance for `SHA256SUMS` (Attestations tab).

## 1. Verify the signature

```bash
cosign verify-blob SHA256SUMS \
  --bundle SHA256SUMS.cosign.bundle \
  --certificate-identity-regexp '^https://github.com/NullAITech/zoth-studio-v2/\.github/workflows/release-sign\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

Expected: `Verified OK`. The identity check proves the file was signed by this
repo's workflow and not by someone else.

## 2. Verify provenance (optional)

```bash
gh attestation verify SHA256SUMS --repo NullAITech/zoth-studio-v2
```

## 3. Verify downloaded desktop binaries

```bash
sha256sum --ignore-missing -c SHA256SUMS
```
