import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function HexStrikeShowcasePage() {
  return (
    <LocalSystemDossier
      tone="crimson"
      kicker="HEXSTRIKE SECURITY ARSENAL"
      badges={['LOCAL DAEMON :8138', 'DEFENSIVE & RED-TEAM CLI', 'AIR-GAPPED RECON']}
      title="Local Security Auditing &"
      accentWord="Threat Reconnaissance."
      subtitle="Real security tooling cannot run inside a sandboxed browser tab—it requires raw sockets, local binary inspection, and direct filesystem access. Clone the HexStrike repository or boot ZothOS to run automated vulnerability triage, CVE correlation, binary entropy analysis, and secret auditing entirely on your own hardware."
      cloneCommand="git clone https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal.git && cd NullAI-HexStrike-AI-Terminal"
      repoUrl="https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal"
      repoLabel="Get HexStrike Terminal Repo"
      docsRoute="/hexstrike/docs"
      docsLabel="Security Architecture Docs"
      overviewTitle="Operator-Controlled Reconnaissance & Audit Automation"
      overviewParagraphs={[
        'HexStrike unifies classic offensive and defensive Linux utilities—Nmap, Nuclei, Semgrep, Gitleaks, and binary entropy analyzers—behind a structured local terminal and MCP interface. Every scan executes strictly from your host interface with explicit target scope.',
        'Findings are normalized into deterministic JSON and Markdown audit reports correlating open services, dependency CVEs, exposed secrets, and remediation diffs without transmitting sensitive scan telemetry to external SaaS dashboards.',
      ]}
      pipelineSteps={[
        {
          label: 'Scoped Surface Enumeration',
          detail: 'Executes local port, service, TLS cipher, and HTTP header inspection against authorized targets.',
        },
        {
          label: 'CVE & Static AST Correlation',
          detail: 'Cross-references discovered versions and source trees against CVE advisories, Semgrep rules, and entropy anomalies.',
        },
        {
          label: 'Remediation & Verification Report',
          detail: 'Produces reproducible PoC transcripts and patch recommendations stored strictly on local disk.',
        },
      ]}
      specs={[
        { key: 'Loopback API', value: '127.0.0.1:8138' },
        { key: 'CLI Entrypoint', value: 'hexstrike' },
        { key: 'Host OS Parity', value: 'Debian / Kali / Parrot / ZothOS' },
        { key: 'Static Analyzers', value: 'Semgrep + Gitleaks + Shannon Entropy' },
        { key: 'MCP Integration', value: 'Scoped Read/Audit Tool Contracts' },
        { key: 'Network Policy', value: 'Zero Third-Party Telemetry' },
      ]}
      quickstartLines={[
        '# Clone standalone HexStrike terminal repository',
        'git clone https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal.git',
        'cd NullAI-HexStrike-AI-Terminal',
        '',
        '# Start local loopback server on 127.0.0.1:8138',
        'python3 server.py --port 8138',
      ]}
      capabilitiesKicker="SECURITY MODULES"
      capabilitiesTitle="Native Linux & Local CLI Capabilities"
      capabilities={[
        {
          tag: 'RECON & TLS',
          title: 'Service & Header Auditing',
          desc: 'Inspect open ports, TLS certificate chains, HSTS/CSP security headers, and CORS misconfigurations from your local network interface.',
        },
        {
          tag: 'CVE TRIAGE',
          title: 'Dependency & Advisory Matching',
          desc: 'Correlate lockfiles, container layers, and service banners against known vulnerability advisories with CVSS severity breakdowns.',
        },
        {
          tag: 'FORENSICS',
          title: 'Binary Entropy & Stego Inspection',
          desc: 'Compute byte-level Shannon entropy, inspect ELF/PE sections, and detect concealed payloads or leaked high-entropy credentials.',
        },
        {
          tag: 'ZOTHOS PARITY',
          title: 'Pre-Integrated on ZothOS v3.4',
          desc: 'Ships alongside 150+ Kali and Parrot security packages inside ZothOS with default-deny UFW firewall rules and Tor ghostmode support.',
        },
      ]}
      funnelToolTitle="HexStrike AI Security Terminal"
      funnelToolTag="SECURITY & RECON"
      funnelToolDesc="Local offensive security audit terminal, CVE correlator, and binary forensics suite for Linux and ZothOS."
    />
  );
}
