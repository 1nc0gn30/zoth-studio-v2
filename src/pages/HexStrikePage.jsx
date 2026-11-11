import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function HexStrikePage() {
  return (
    <TechnicalReferencePage
      tone="crimson"
      parentRoute="/hexstrike"
      parentLabel="HexStrike Overview"
      kicker="HEXSTRIKE SPECIFICATION // :8138"
      title="HexStrike Security Terminal Reference"
      summary="Local installation, CLI usage, and audit report schema for NullAI-HexStrike-AI-Terminal across Debian, Kali, Parrot, and ZothOS hosts."
      repoUrl="https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal"
      repoLabel="Clone HexStrike Terminal"
      cloneCommand="git clone https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal.git && cd NullAI-HexStrike-AI-Terminal"
      installSteps={[
        '# 1. Clone the standalone HexStrike security repository',
        'git clone https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal.git',
        'cd NullAI-HexStrike-AI-Terminal',
        '',
        '# 2. Install Python dependencies inside a local virtualenv',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt',
        '',
        '# 3. Start local loopback terminal daemon on 127.0.0.1:8138',
        'python3 server.py --port 8138',
      ]}
      cliCommands={[
        { cmd: 'hexstrike audit --repo <path>', desc: 'Run local Semgrep static rules, Gitleaks secret detection, and Shannon entropy checks.' },
        { cmd: 'hexstrike headers --url <target>', desc: 'Inspect HSTS, CSP, X-Frame-Options, Referrer-Policy, and TLS certificate chains.' },
        { cmd: 'hexstrike entropy --file <binary>', desc: 'Calculate byte-distribution entropy (0.00–8.00 bits/byte) to detect packed/encrypted sections.' },
        { cmd: 'hexstrike report --format json', desc: 'Export deterministic JSON and Markdown vulnerability triage reports to local disk.' },
      ]}
      contractTitle="Audit Finding Output Schema"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          schemaVersion: '1.0',
          executionHost: '127.0.0.1',
          egressTelemetry: false,
          findings: [
            {
              id: 'HS-2026-001',
              severity: 'HIGH',
              scanner: 'gitleaks-8.30.1',
              target: 'config/env.sample',
              remediation: 'Rotate credential and move secret into zoth-vault (Argon2id).',
            },
          ],
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Authorized Local Execution Only',
          body: 'Designed strictly for auditing repositories, containers, and infrastructure you own or have explicit written authorization to test.',
        },
        {
          heading: 'Air-Gapped Report Storage',
          body: 'Scan findings and target metadata remain strictly on your local filesystem—never uploaded to external cloud scanners.',
        },
        {
          heading: 'Native ZothOS Integration',
          body: 'Pre-installed on ZothOS v3.4 alongside Nmap, Wireshark, Nuclei, and UFW default-deny firewall profiles.',
        },
      ]}
    />
  );
}
