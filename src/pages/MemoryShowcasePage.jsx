import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function MemoryShowcasePage() {
  return (
    <LocalSystemDossier
      tone="purple"
      kicker="NEURO-MEMORY DAEMON"
      badges={['LOCAL DAEMON :8094', 'STDP SYNAPTIC GRAPH', 'SQLITE WAL + VECTOR']}
      title="Persistent Synaptic Memory That"
      accentWord="Consolidates Locally."
      subtitle="AI coding agents lose architectural context every time a terminal session closes. Neuro-Memory runs as a lightweight loopback daemon on port :8094, storing episodic engrams in a local SQLite WAL graph weighted by Spike-Timing-Dependent Plasticity (STDP) so active facts strengthen and stale noise decays naturally."
      cloneCommand="git clone https://github.com/NullAITech/neuro-memory-daemon.git && cd neuro-memory-daemon"
      repoUrl="https://github.com/NullAITech/neuro-memory-daemon"
      repoLabel="Get Neuro-Memory Repo"
      docsRoute="/memory/docs"
      docsLabel="STDP Memory Specification"
      overviewTitle="Biological Hebbian Plasticity Over Static RAG"
      overviewParagraphs={[
        'Conventional vector databases treat a six-month-old broken snippet with the exact same cosine weight as a verified fix written five minutes ago. Neuro-Memory pairs dense semantic embeddings with temporal synaptic weights governed by causal recall intervals.',
        'When an agent retrieves an engram and subsequently succeeds on a build or verification step, the causal edge weight strengthens; unused or contradicted nodes decay exponentially without polluting future context windows.',
      ]}
      pipelineSteps={[
        {
          label: 'Episodic Engram Ingestion',
          detail: 'CLI tools, MCP servers, and Obsidian notes commit structured observations over 127.0.0.1:8094.',
        },
        {
          label: 'STDP Synaptic Weight Update',
          detail: 'Co-retrieved engrams update edge weights via Δw = A+ exp(-Δt / τ+) for causal reinforcement.',
        },
        {
          label: 'Hybrid Graph + Vector Recall',
          detail: 'Sub-millisecond SQLite FTS5 + cosine similarity + synaptic salience ranking returns high-signal context.',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8094' },
        { key: 'CLI Entrypoint', value: 'neuro-memory-daemon' },
        { key: 'Storage Engine', value: 'SQLite3 WAL + Local Embeddings' },
        { key: 'Plasticity Rule', value: 'Asymmetric Hebbian STDP' },
        { key: 'Agent Transport', value: 'HTTP REST + MCP stdio' },
        { key: 'Data Residency', value: '100% Local Disk (~/.zoth/memory)' },
      ]}
      quickstartLines={[
        '# Clone standalone daemon & start on loopback :8094',
        'git clone https://github.com/NullAITech/neuro-memory-daemon.git',
        'cd neuro-memory-daemon && python3 server.py --port 8094',
        '',
        '# Store & query engrams from your local terminal',
        'curl -s http://127.0.0.1:8094/health',
      ]}
      capabilitiesKicker="MEMORY SUBSTRATE"
      capabilitiesTitle="Engineered for Long-Horizon Local Agents"
      capabilities={[
        {
          tag: 'PLASTICITY',
          title: 'STDP Temporal Weighting',
          desc: 'Connections strengthen when recalled together in successful workflows and decay gracefully when superseded.',
        },
        {
          tag: 'HYBRID INDEX',
          title: 'Vector + Lexical + Graph Recall',
          desc: 'Combines semantic embeddings, exact symbol matching (FTS5), and multi-hop entity traversal in one local binary.',
        },
        {
          tag: 'MCP NATIVE',
          title: 'Universal Agent Attachment',
          desc: 'Exposes standard Model Context Protocol tools so Hermes, Claude Code, Cursor, and Pantheon Swarm share one memory graph.',
        },
        {
          tag: 'ZERO CLOUD',
          title: 'Air-Gapped SQLite Persistence',
          desc: 'Your codebase architecture, credentials context, and research notes never touch a third-party SaaS vector store.',
        },
      ]}
      funnelToolTitle="Neuro-Memory STDP Daemon"
      funnelToolTag="MEMORY & GRAPH"
      funnelToolDesc="Local STDP synaptic memory daemon (:8094) with SQLite WAL persistence, hybrid semantic search, and MCP integration."
    />
  );
}
