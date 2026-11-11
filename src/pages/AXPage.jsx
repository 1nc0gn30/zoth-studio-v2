import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function AXPage() {
  return (
    <TechnicalReferencePage
      tone="cyan"
      parentRoute="/ax"
      parentLabel="AX Overview"
      kicker="AX & MCP DISCOVERY SPECIFICATION"
      title="Agent Experience (AX) & Registry Reference"
      summary="Specification for machine-readable agent manifests (/.well-known/mcp.json, /.well-known/agent.json, /llms.txt, and /api/tools.json) and local registry integrity verification."
      repoUrl="https://github.com/NullAITech/zoth-studio-v2"
      repoLabel="Clone Zoth Studio v2"
      cloneCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2"
      installSteps={[
        '# 1. Clone Zoth Studio v2 to access the canonical 77-tool registry',
        'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        'cd zoth-studio-v2',
        '',
        '# 2. Run registry schema & port-collision integrity checks',
        'python3 scripts/registry-check.py',
        'node scripts/test-arsenal.mjs',
      ]}
      cliCommands={[
        { cmd: 'GET /.well-known/mcp.json', desc: 'Returns Model Context Protocol server capabilities, transports, and tool descriptors.' },
        { cmd: 'GET /.well-known/agent.json', desc: 'Returns autonomous agent identity, repository provenance, and protocol endpoints.' },
        { cmd: 'GET /api/tools.json', desc: 'Returns the canonical 77-tool JSON registry with unique ports, CLI binaries, and GitHub clone URLs.' },
        { cmd: 'GET /llms.txt', desc: 'Returns a concise Markdown architecture map optimized for LLM context windows.' },
      ]}
      contractTitle="Canonical Tool Registry Entry (/api/tools.json)"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          id: 'neuro-memory-daemon',
          name: 'Neuro-Memory Daemon',
          category: 'Memory & Brain',
          execution_type: 'local_cli',
          port: 8094,
          github: 'https://github.com/NullAITech/neuro-memory-daemon',
          pull: 'git clone https://github.com/NullAITech/neuro-memory-daemon.git',
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Single Source of Truth',
          body: 'public/api/tools.json drives static prerendering, CLI catalogs, and agent discovery—enforced by scripts/registry-check.py.',
        },
        {
          heading: 'Collision-Free Loopback Ports',
          body: 'Every daemon in the 77-tool registry is assigned a strictly unique localhost port verified on every test run.',
        },
        {
          heading: 'Schema.org JSON-LD Parity',
          body: 'Every prerendered route includes structured SoftwareApplication and FAQPage JSON-LD metadata for accurate indexing.',
        },
      ]}
    />
  );
}
