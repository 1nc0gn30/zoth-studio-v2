import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function MemoryPage() {
  return (
    <TechnicalReferencePage
      tone="purple"
      parentRoute="/memory"
      parentLabel="Memory Overview"
      kicker="LUCY NETRUNNER MEMORY HUB & :8094 SPECIFICATION"
      title="Lucy Netrunner Memory Hub & STDP Daemon Reference"
      summary="Verified CLI, strictly read-only Studio loopback API (/api/studio/netrunner-memory), and standing 127.0.0.1:8094 REST documentation for the persistent SQLite WAL + Asymmetric Hebbian STDP synaptic memory graph."
      repoUrl="https://github.com/NullAITech/neuro-memory-daemon"
      repoLabel="Clone Neuro-Memory Daemon"
      cloneCommand="git clone https://github.com/NullAITech/neuro-memory-daemon.git && cd neuro-memory-daemon"
      showSupportStrip={false}
      installSteps={[
        '# 1. Clone the standalone Neuro-Memory repository',
        'git clone https://github.com/NullAITech/neuro-memory-daemon.git',
        'cd neuro-memory-daemon',
        '',
        '# 2. Launch local SQLite WAL + STDP daemon on 127.0.0.1:8094',
        'python3 -m neuro_memory_daemon.cli serve --port 8094',
        '',
        '# 3. Inspect read-only health & live synaptic counts',
        'curl -s http://127.0.0.1:8094/health',
        'curl -s http://127.0.0.1:8094/api/stats',
        '',
        '# 4. Open Lucy Netrunner Memory Hub in Zoth Studio',
        'zoth open netrunner-memory',
      ]}
      cliCommands={[
        {
          cmd: 'python3 -m neuro_memory_daemon.cli serve --port 8094',
          desc: 'Start the standing loopback Neuro-Memory daemon backed by local SQLite WAL storage under ~/.zoth/memory.',
        },
        {
          cmd: 'GET http://127.0.0.1:8094/health',
          desc: 'Returns daemon liveness JSON: { status, version, service, timestamp } (strictly read-only).',
        },
        {
          cmd: 'GET http://127.0.0.1:8094/api/stats',
          desc: 'Returns live cortex telemetry: total_memories, total_synapses, synaptic_density, working_memory_usage, average_importance, average_accesses, and categories.',
        },
        {
          cmd: 'GET http://127.0.0.1:8094/api/memories?limit=24',
          desc: 'Returns bounded read-only engram records including id, text, tags, importance, category, access_count, and synapse weights.',
        },
        {
          cmd: 'GET http://127.0.0.1:8094/api/graph',
          desc: 'Returns synaptic graph topology (nodes, edges, links, total_nodes, total_edges) for multi-hop CA3/CA1 visualization.',
        },
        {
          cmd: 'GET http://127.0.0.1:3000/api/studio/netrunner-memory',
          desc: 'Hardened Studio loopback bridge (Host/Origin 403, ~/ redaction, SHA-256 receipt) aggregating strictly read-only GET probes across :8094.',
        },
        {
          cmd: 'POST http://127.0.0.1:3000/api/studio/netrunner-memory/evaluate',
          desc: 'Pure deterministic server-side STDP (Δw(0)=0), Ebbinghaus retention, BM25 + cosine recall, and CA3/CA1 trace evaluator (64 KB / 413 cap, zero writes to :8094).',
        },
      ]}
      contractTitle="Hardened Studio Loopback & Read-Only :8094 Contract"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          workstation: 'netrunner-memory',
          name: 'Lucy Netrunner Memory Hub',
          version: '2.4.0',
          canonicalRoute: '/workstations/netrunner-memory',
          cli: 'zoth open netrunner-memory --json',
          daemonCommand: 'python3 -m neuro_memory_daemon.cli serve --port 8094',
          readOnlyStudioEndpoints: {
            snapshot: 'GET http://127.0.0.1:3000/api/studio/netrunner-memory',
            evaluate: 'POST http://127.0.0.1:3000/api/studio/netrunner-memory/evaluate',
          },
          readOnlyDaemonEndpoints: [
            'GET http://127.0.0.1:8094/health',
            'GET http://127.0.0.1:8094/api/stats',
            'GET http://127.0.0.1:8094/api/memories?limit=24',
            'GET http://127.0.0.1:8094/api/graph',
          ],
          invariants: [
            'strictly-read-only-8094-probes',
            'host-and-origin-403-enforced',
            'post-body-limit-64kb-413',
            'home-path-redacted-to-tilde',
            'stdp-zero-latency-neutral',
          ],
        },
        null,
        2,
      )}
      architectureNotes={[
        {
          heading: 'Asymmetric Hebbian STDP Law (Δw(0) = 0)',
          body: 'Causal co-retrieval (Δt > 0) potentiates synapses via Δw = A+ exp(-Δt / τ+), anti-causal timing (Δt < 0) depresses via -A- exp(Δt / τ-), and Δt = 0 remains strictly neutral (Δw(0) = 0).',
        },
        {
          heading: 'Strict Read-Only Protection of Standing :8094',
          body: 'Lucy Netrunner Memory Hub never issues POST, PUT, or DELETE writes against 127.0.0.1:8094. All STDP experiments, neuromodulator presets, and BM25 + hashed n-gram cosine queries execute deterministically in-memory.',
        },
        {
          heading: 'Zero Cloud Leakage & Verified Exports',
          body: 'Every host home path is redacted to ~/, all browser assets resolve with zero external requests, and JSON, Markdown, and formula-safe CSV exports include synchronous FIPS 180-4 SHA-256 receipts.',
        },
      ]}
    />
  );
}
