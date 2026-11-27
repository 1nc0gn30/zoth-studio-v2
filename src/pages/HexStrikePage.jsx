import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function HexStrikePage() {
  return (
    <TechnicalReferencePage
      tone="crimson"
      parentRoute="/hexstrike"
      parentLabel="HexStrike Overview"
      kicker="HEXSTRIKE SPECIFICATION // v3.2.0 // :8138"
      title="HexStrike Security Arsenal Reference"
      summary="Local installation, CLI subcommands, 8 JSON-RPC 2.0 MCP tools, and defensive audit contracts for NullAI-HexStrike-AI-Terminal on Linux and ZothOS."
      repoUrl="https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal"
      repoLabel="Clone HexStrike Arsenal"
      cloneCommand="git clone https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal.git && cd NullAI-HexStrike-AI-Terminal"
      installSteps={[
        '# 1. Clone the standalone HexStrike repository',
        'git clone https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal.git',
        'cd NullAI-HexStrike-AI-Terminal',
        '',
        '# 2. Standalone server.py, cli.py, and mcp_server.py use Python 3 stdlib only',
        '#    (Optional FastAPI backend dependencies live in backend/requirements.txt)',
        'python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt',
        '',
        '# 3. Start the hardened loopback daemon on 127.0.0.1:8138 (on-demand)',
        'python3 server.py --host 127.0.0.1 --port 8138',
      ]}
      cliCommands={[
        { cmd: 'hexstrike-arsenal list --min-score 10 --json', desc: 'Filter the 156-tool catalog by category, tag, or usefulness rating.' },
        { cmd: 'hexstrike-arsenal cmd nmap 127.0.0.1 --json', desc: 'Generate shell-quoted invocation syntax with strict target allowlist validation.' },
        { cmd: 'hexstrike-arsenal scan 127.0.0.1 --ports 22,3000,8138 --json', desc: 'Run bounded loopback TCP socket probe (max 64 ports, loopback enforced by default).' },
        { cmd: 'hexstrike-arsenal headers --url http://127.0.0.1:8138 --json', desc: 'Audit HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, and Permissions-Policy.' },
        { cmd: 'hexstrike-arsenal entropy --file README.md --json', desc: 'Calculate exact Shannon byte entropy (0.00-8.00 bits/byte) and printable ASCII ratio.' },
        { cmd: 'hexstrike-arsenal audit --path . --json', desc: 'Run local static defensive checks (shell sinks, eval/innerHTML, disabled TLS, secret shapes).' },
        { cmd: 'hexstrike-arsenal mcp', desc: 'Start the 8-tool JSON-RPC 2.0 stdio MCP server (hexstrike_list_tools, hexstrike_generate_cmd, hexstrike_port_scan, hexstrike_target_intel, hexstrike_generate_report, hexstrike_audit_headers, hexstrike_shannon_entropy, hexstrike_audit_repo).' },
      ]}
      contractTitle="HTTP Header Audit Output Schema"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          target: 'http://127.0.0.1:8138/',
          mode: 'loopback_live',
          http_status: 200,
          observed_header_count: 8,
          score: 70,
          max_score: 100,
          grade: 'B',
          disclosures: [],
          findings: [
            {
              header: 'Content-Security-Policy',
              status: 'PASS',
              earned: 25,
              weight: 25,
            },
            {
              header: 'X-Content-Type-Options',
              status: 'PASS',
              earned: 15,
              weight: 15,
            },
          ],
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Hardened Loopback HTTP Guardrails',
          body: 'server.py enforces a strict loopback Host allowlist (400 on DNS-rebinding hosts), exact-origin loopback CORS (403 on cross-origin POST/OPTIONS), 64 KiB POST limits (413), CSP and security headers, and zero Python version disclosure.',
        },
        {
          heading: 'Honest Observed Audits Only',
          body: 'Header scores, Shannon byte entropy, loopback TCP probes, and static repository checks report strictly observed measurements—never hardcoded 100/100 grades or fabricated scan credits.',
        },
        {
          heading: 'Unified ZothOS CLI & 8-Tool MCP Parity',
          body: 'Both hexstrike-arsenal and hexstrike resolve portably to cli.py across $HOME and /opt/hexstrike-arsenal, paired with a live Braille TUI monitor (hexstrike-arsenal-tui) and 8 stdio MCP tools.',
        },
      ]}
    />
  );
}
