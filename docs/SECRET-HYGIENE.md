# Secret hygiene

Hardcoded personal data and live keys were removed from this tree. These checks exist so they cannot land on `main` again. Nothing in the product behavior changes.

## Never commit

- Real phone numbers. The scanner rejects the 948 area-code family in dashed, dotted, spaced, parenthesized, compact 10-digit, and leading-`1` forms. That is the Signal-account shape that was removed. Demo UI keeps the reserved fictional number `+1-555-555-0199` only.
- A `SIGNAL_ACCOUNT` or signal recipient set to any other real NANP number. Fictional `555` numbers and the reserved `555-01xx` exchange stay allowed.
- Absolute developer homes and machine mounts: `/home/zoth` and `/media/neo/`.
- Disk identity paths: `/dev/disk/by-uuid/`, `/dev/disk/by-partuuid/`, and `/dev/disk/by-id/` hardware serials. The scrubbed UUID prefix is listed in `.gitleaks.toml` and is rejected wherever it appears.
- `SOLANA_PRIVATE_KEY` set to a base58 string that looks like a real address (about 32–44 characters) or keypair (about 64–88). Entropy is high enough on those values that the scan fails.

## Fixtures

`SAMPLE_ENV` and EnvGuard sample files use placeholders only:

- `YOUR_*` for passwords, tokens, and API keys
- `SOLANA_ADDRESS` with a `Demo` prefix, never a real address and never the label `SOLANA_PRIVATE_KEY`

Any `SOLANA_PRIVATE_KEY` inside an EnvGuard file, a sample-env file, or a `SAMPLE_ENV` assignment fails, including low-entropy fakes.

## Public receive address

The treasury receive address named in the allowlist comment in `.gitleaks.toml` is public payment information. It may appear only on the labeled checkout and treasury surfaces already listed there: Agora, the DePay funnel, the public `solanaWallet` catalog, the public llms checkout copy, and the tool pages that copy that same receiver. Do not add it to new files, and do not assign it to `SOLANA_PRIVATE_KEY`.

## Run the scan locally

CI runs [gitleaks](https://github.com/gitleaks/gitleaks) v8.30.1 with `.gitleaks.toml` on every pull request and every push, including `main`. The job fails when there is a finding.

```bash
# Current tree. Same directory scan the workflow runs.
gitleaks dir --config .gitleaks.toml --redact=100 --verbose .

# Staged changes, using the hook pinned in .pre-commit-config.yaml.
pre-commit install
pre-commit run gitleaks
```

Install gitleaks v8.30.1 from the upstream release, or let pre-commit build that pinned hook.

NullAITech is a GitHub organization. `gitleaks/gitleaks-action` does not scan until the repository or organization has a `GITLEAKS_LICENSE` secret (free key from [gitleaks.io](https://gitleaks.io)). The workflow still fails on findings without that secret, because it also runs the v8.30.1 binary directly. Adding the secret turns on the action's pull-request comments and its commit-range scan.
