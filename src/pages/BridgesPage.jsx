import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function BridgesPage() {
  return (
    <LocalSystemDossier
      tone="sky"
      kicker="SOVEREIGN AGENT BRIDGES"
      badges={['LOCAL DAEMON :8102', 'PYTHON STDLIB', 'LOOPBACK & TAILSCALE']}
      title="Zero-Trust IPC & Local"
      accentWord="Command Bridges."
      subtitle="Connecting autonomous agents to your terminal, filesystem, debugger, and memory graph requires authenticated local transport—not exposed public webhooks. Launch the live Zoth Swarm NOC workstation or clone the zero-dependency Python Sovereign Agent Bridge repository to wire local loopback IPC and encrypted Tailscale/WireGuard tunnels."
      toolRoute="/workstations/bus-monitor"
      toolLabel="Open Live Bus Monitor NOC"
      cloneCommand="git clone https://github.com/NullAITech/sovereign-agent-bridge.git && cd sovereign-agent-bridge"
      repoUrl="https://github.com/NullAITech/sovereign-agent-bridge"
      repoLabel="Get Sovereign Bridge Repo"
      docsRoute="/ax/docs"
      docsLabel="MCP & AX Transport Docs"
      overviewTitle="Loopback-Bound Transport Between Agents and Host Tools"
      overviewParagraphs={[
        'Modern AI workflows span multiple runtimes: terminal agents like Hermes and Claude Code, IDE extensions, Ghidra reverse-engineering bridges (:8131), and persistent memory daemons (:8094). Exposing those capabilities on 0.0.0.0 invites remote code execution.',
        'Zoth Studio (:3000) enforces strict loopback Host and Origin validation (403 Reject on untrusted hosts or cross-origin mutations across /api/studio/bridge* and /api/studio/bus/*), while Sovereign Agent Bridge (:8102) runs a zero-dependency Python stdlib HTTP daemon with HKDF-SHA256 / SHA256-CTR / HMAC-SHA256 signed message envelopes.',
      ]}
      pipelineSteps={[
        {
          label: 'Studio Loopback & Host Guard (:3000)',
          detail: 'All /api/studio/bus/* and /api/studio/bridge* endpoints enforce strict 127.0.0.1 / localhost / [::1] Host validation on GET and POST plus Origin checks on mutations.',
        },
        {
          label: 'Python Stdlib Signal Bridge (:8102)',
          detail: 'Zero-dependency Python http.server exposing /api/health, /api/stats, /api/send, and /api/agents/live with HKDF-SHA256 + SHA256-CTR + HMAC-SHA256 envelope protection.',
        },
        {
          label: 'Optional Encrypted Mesh Relay',
          detail: 'Routes multi-machine GPU inference or swarm tasks exclusively across tailscale0 / WireGuard peers without opening public inbound ports.',
        },
      ]}
      specs={[
        { key: 'Bridge Daemon', value: '127.0.0.1:8102 (Python stdlib)' },
        { key: 'Studio NOC Proxy', value: '127.0.0.1:3000 (/api/studio/bus/*)' },
        { key: 'CLI Entrypoint', value: 'sovereign-agent-bridge' },
        { key: 'Envelope Crypto', value: 'HKDF-SHA256 · SHA256-CTR · HMAC-SHA256' },
        { key: 'Studio API Defense', value: '403 Reject on Untrusted Host / Origin' },
        { key: 'Private Mesh', value: 'WireGuard / tailscale0 Compatible' },
      ]}
      quickstartLines={[
        '# Clone standalone Sovereign Agent Bridge repository (zero-dependency Python)',
        'git clone https://github.com/NullAITech/sovereign-agent-bridge.git',
        'cd sovereign-agent-bridge && python3 server.py --port 8102',
        '',
        '# Or inspect CLI subcommands (health, channels, send, consensus, pulse)',
        'sovereign-agent-bridge --help',
      ]}
      capabilitiesKicker="TRANSPORT SECURITY"
      capabilitiesTitle="Engineered for Safe Local Tool Execution"
      capabilities={[
        {
          tag: 'LOOPBACK ONLY',
          title: 'Zero Public Port Exposure',
          desc: 'Studio API routes bind strictly to 127.0.0.1 and reject DNS-rebinding Host headers and cross-origin browser mutations with HTTP 403.',
        },
        {
          tag: 'REAL RTT NOC',
          title: 'Measured Loopback Telemetry',
          desc: 'Open the live Bus Monitor NOC workstation (/workstations/bus-monitor) to probe 12 core loopback daemons, measure exact p50/p95 RTTs, and inspect :8102 sessions.',
        },
        {
          tag: 'MESH READY',
          title: 'Tailscale & WireGuard Native',
          desc: 'Pair a lightweight laptop running ZothOS-Lite with a headless local GPU workstation over encrypted point-to-point tunnels.',
        },
        {
          tag: 'CRYPTO ENVELOPE',
          title: 'HKDF-SHA256 & HMAC-SHA256',
          desc: 'Sign and verify canonical bridge frames offline in-browser via WebCrypto or locally via Python stdlib with zero external dependencies.',
        },
      ]}
      funnelToolTitle="Sovereign Agent Bridge"
      funnelToolTag="IPC & SIGNAL BRIDGE"
      funnelToolDesc="Zero-dependency Python loopback signal bridge and Zoth Swarm NOC workstation for connecting local coding agents safely."
      showSupportStrip={false}
    />
  );
}
