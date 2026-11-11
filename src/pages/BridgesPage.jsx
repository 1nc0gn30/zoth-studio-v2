import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function BridgesPage() {
  return (
    <LocalSystemDossier
      tone="sky"
      kicker="SOVEREIGN AGENT BRIDGES"
      badges={['LOCAL DAEMON :8102', 'MCP STDIO / SSE', 'LOOPBACK & TAILSCALE']}
      title="Zero-Trust IPC & Local"
      accentWord="Command Bridges."
      subtitle="Connecting autonomous agents to your terminal, filesystem, debugger, and memory graph requires authenticated local transport—not exposed public webhooks. Clone the Sovereign Agent Bridge repository to wire MCP servers, Unix domain sockets, and encrypted Tailscale/WireGuard tunnels cleanly across your machines."
      cloneCommand="git clone https://github.com/NullAITech/sovereign-agent-bridge.git && cd sovereign-agent-bridge"
      repoUrl="https://github.com/NullAITech/sovereign-agent-bridge"
      repoLabel="Get Sovereign Bridge Repo"
      docsRoute="/ax/docs"
      docsLabel="MCP & AX Transport Docs"
      overviewTitle="Loopback-Bound Transport Between Agents and Host Tools"
      overviewParagraphs={[
        'Modern AI workflows span multiple runtimes: terminal agents like Hermes and Claude Code, IDE extensions, Ghidra reverse-engineering bridges (:8131), and persistent memory daemons (:8094). Exposing those capabilities on 0.0.0.0 invites remote code execution.',
        'Sovereign Agent Bridge enforces strict 127.0.0.1 loopback and Unix socket bindings, cross-origin write rejection, and scoped capability tokens—extending across private developer workstations only over authenticated WireGuard/Tailscale interfaces.',
      ]}
      pipelineSteps={[
        {
          label: 'Loopback & Unix Socket Binding',
          detail: 'All local tool daemons bind exclusively to 127.0.0.1 or /run/zoth/*.sock with strict Origin header validation.',
        },
        {
          label: 'Protocol Translation (stdio <-> HTTP/SSE)',
          detail: 'Bridges stdio-only MCP servers cleanly to local HTTP/SSE consumers with structured JSON-RPC framing.',
        },
        {
          label: 'Optional Encrypted Mesh Relay',
          detail: 'Routes multi-machine GPU inference or swarm tasks exclusively across tailscale0 / WireGuard peers.',
        },
      ]}
      specs={[
        { key: 'Bridge Daemon', value: '127.0.0.1:8102' },
        { key: 'CLI Entrypoint', value: 'sovereign-agent-bridge' },
        { key: 'Supported Transports', value: 'MCP stdio • JSON-RPC SSE • Unix Sockets' },
        { key: 'Cross-Origin Defense', value: '403 Reject on Non-Loopback Origins' },
        { key: 'Private Mesh', value: 'WireGuard / tailscale0 Compatible' },
        { key: 'Default MCP Posture', value: 'Explicit Opt-In per Server' },
      ]}
      quickstartLines={[
        '# Clone standalone Sovereign Agent Bridge repository',
        'git clone https://github.com/NullAITech/sovereign-agent-bridge.git',
        'cd sovereign-agent-bridge && npm install',
        '',
        '# Inspect local bridge daemon configuration',
        'node server.js --help',
      ]}
      capabilitiesKicker="TRANSPORT SECURITY"
      capabilitiesTitle="Engineered for Safe Local Tool Execution"
      capabilities={[
        {
          tag: 'LOOPBACK ONLY',
          title: 'Zero Public Port Exposure',
          desc: 'Binds strictly to localhost and rejects cross-origin browser mutation attempts (verified by automated 403 CSRF tests).',
        },
        {
          tag: 'MCP MULTIPLEX',
          title: 'Unified MCP Routing',
          desc: 'Connects Hermes Agent, Zoth Egregore, and IDE clients to local memory, AST, and security tools through one clean router.',
        },
        {
          tag: 'MESH READY',
          title: 'Tailscale & WireGuard Native',
          desc: 'Pair a lightweight laptop running ZothOS-Lite with a headless local GPU workstation over encrypted point-to-point tunnels.',
        },
        {
          tag: 'AUDIT LOGS',
          title: 'Structured JSON-RPC Tracing',
          desc: 'Logs every tool invocation, exit status, and latency metric locally so agent behavior is transparent and reproducible.',
        },
      ]}
      funnelToolTitle="Sovereign Agent Bridge"
      funnelToolTag="IPC & MCP TRANSPORT"
      funnelToolDesc="Loopback-bound MCP & JSON-RPC command bridge for connecting local coding agents to host CLI tools safely."
    />
  );
}
