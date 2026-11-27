import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function HexStrikeShowcasePage() {
  return (
    <LocalSystemDossier
      tone="crimson"
      kicker="HEXSTRIKE SECURITY ARSENAL // v3.2.0"
      badges={['ON-DEMAND DAEMON :8138', '156 TOOLS · 8 MCP TOOLS', 'LOCAL-FIRST AUDIT']}
      title="Local Security Auditing &"
      accentWord="Defensive Reconnaissance."
      subtitle="HexStrike pairs a 156-tool security command synthesizer with real local defensive engines: loopback TCP socket probing, live/offline HTTP security header grading, exact Shannon byte entropy analysis, local repository static auditing, and 8 JSON-RPC 2.0 MCP tools."
      toolRoute="/tools/hexstrike-arsenal"
      toolLabel="Open HexStrike Arsenal in Zoth Studio"
      cloneCommand="git clone https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal.git && cd NullAI-HexStrike-AI-Terminal"
      repoUrl="https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal"
      repoLabel="Get HexStrike Arsenal Repo"
      docsRoute="/hexstrike/docs"
      docsLabel="CLI & MCP Architecture Docs"
      overviewTitle="Hardened Loopback Auditing & Deterministic Reporting"
      overviewParagraphs={[
        'HexStrike runs standalone on Python 3 standard library (server.py, cli.py, mcp_server.py) with zero required cloud dependencies. Every command synthesizer target is validated against a strict allowlist and shell-quoted, while live socket and HTTP header probes stay scoped to loopback (127.0.0.1 / localhost / ::1) by default.',
        'All scores and reports are computed strictly from observed headers, byte distributions, loopback socket states, and local static code findings—exportable as Markdown, JSON, or formula-safe CSV with zero paywalls.',
      ]}
      pipelineSteps={[
        {
          label: 'Scoped Loopback Probing',
          detail: 'Checks local TCP listeners and HTTP security headers on 127.0.0.1:8138 or parses pasted raw headers offline.',
        },
        {
          label: 'Entropy & Static Code Auditing',
          detail: 'Computes exact Shannon byte entropy (0.0-8.0 bits/byte) and scans local source trees for shell sinks, eval/innerHTML, disabled TLS, and secret shapes.',
        },
        {
          label: 'Honest Observed Reporting',
          detail: 'Exports reproducible Markdown, JSON, and formula-safe CSV reports reflecting only verified measurements.',
        },
      ]}
      specs={[
        { key: 'Loopback API', value: '127.0.0.1:8138 (on-demand)' },
        { key: 'CLI Entrypoints', value: 'hexstrike-arsenal / hexstrike' },
        { key: 'Host OS Parity', value: 'Debian / Kali / Parrot / ZothOS' },
        { key: 'Defensive Engines', value: 'Headers + Shannon Entropy + Static Audit + Loopback Scan' },
        { key: 'MCP Integration', value: '8 JSON-RPC 2.0 Stdio Tools (mcp_server.py)' },
        { key: 'Network Policy', value: 'Loopback Default · Opt-In Public Lookups in Studio' },
      ]}
      quickstartLines={[
        '# Clone standalone HexStrike repository',
        'git clone https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal.git',
        'cd NullAI-HexStrike-AI-Terminal',
        '',
        '# Start hardened loopback server on 127.0.0.1:8138',
        'python3 server.py --port 8138',
      ]}
      capabilitiesKicker="DEFENSIVE & RECON MODULES"
      capabilitiesTitle="Verified Local CLI, Daemon & MCP Capabilities"
      capabilities={[
        {
          tag: 'HEADERS & SOCKETS',
          title: 'HTTP Header & Loopback Port Auditing',
          desc: 'Grades HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, and Permissions-Policy on loopback URLs or offline header dumps, plus bounded TCP connect_ex probes.',
        },
        {
          tag: 'ENTROPY & STATIC',
          title: 'Shannon Byte Entropy & Code Hygiene',
          desc: 'Measures exact 0.0-8.0 bits/byte entropy on files or hex payloads and detects unsafe subprocess shell sinks, eval/innerHTML, disabled TLS, and secret shapes.',
        },
        {
          tag: 'CATALOG & CMD',
          title: '156-Tool Safe Command Synthesizer',
          desc: 'Filters 156 Kali/Parrot security tools across 11 categories and generates shell-quoted invocations with leading-dash and metacharacter rejection.',
        },
        {
          tag: '8 MCP TOOLS',
          title: 'Native JSON-RPC 2.0 Stdio Server',
          desc: 'Exposes hexstrike_list_tools, hexstrike_generate_cmd, hexstrike_port_scan, hexstrike_target_intel, hexstrike_generate_report, hexstrike_audit_headers, hexstrike_shannon_entropy, and hexstrike_audit_repo.',
        },
      ]}
      funnelToolTitle="HexStrike Security Arsenal v3.2"
      funnelToolTag="SECURITY & RECON"
      funnelToolDesc="Local-first 156-tool security catalog, HTTP header & Shannon entropy auditor, loopback socket probe, and 8-tool MCP server."
    />
  );
}
