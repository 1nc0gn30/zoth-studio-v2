import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function MemoryPage() {
  return (
    <TechnicalReferencePage
      tone="purple"
      parentRoute="/memory"
      parentLabel="Memory Overview"
      kicker="NEURO-MEMORY SPECIFICATION // :8094"
      title="Neuro-Memory STDP Daemon Reference"
      summary="CLI, loopback REST, and Model Context Protocol documentation for running the persistent SQLite WAL + Spike-Timing-Dependent Plasticity (STDP) memory graph locally."
      repoUrl="https://github.com/NullAITech/neuro-memory-daemon"
      repoLabel="Clone Neuro-Memory Daemon"
      cloneCommand="git clone https://github.com/NullAITech/neuro-memory-daemon.git && cd neuro-memory-daemon"
      installSteps={[
        '# 1. Clone the standalone Neuro-Memory repository',
        'git clone https://github.com/NullAITech/neuro-memory-daemon.git',
        'cd neuro-memory-daemon',
        '',
        '# 2. Launch local SQLite WAL + STDP daemon on 127.0.0.1:8094',
        'python3 server.py --host 127.0.0.1 --port 8094',
        '',
        '# 3. Verify health endpoint',
        'curl -s http://127.0.0.1:8094/health',
      ]}
      cliCommands={[
        { cmd: 'neuro-memory-daemon --port 8094', desc: 'Start the loopback memory daemon backed by ~/.zoth/memory/engrams.db (SQLite WAL).' },
        { cmd: 'GET http://127.0.0.1:8094/health', desc: 'Returns database WAL status, total engram count, and active synaptic edge count.' },
        { cmd: 'POST http://127.0.0.1:8094/api/store', desc: 'Ingest a structured observation with tags, source repo, and embedding vector.' },
        { cmd: 'POST http://127.0.0.1:8094/api/recall', desc: 'Query hybrid FTS5 + cosine + STDP synaptic salience rankings for relevant context.' },
      ]}
      contractTitle="MCP Memory Attachment"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          mcpServers: {
            'neuro-memory': {
              command: 'python3',
              args: ['/opt/neuro-memory-daemon/mcp_stdio.py'],
              env: {
                NEURO_MEMORY_URL: 'http://127.0.0.1:8094',
                NEURO_DB_PATH: '~/.zoth/memory/engrams.db',
              },
            },
          },
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'STDP Plasticity Rule',
          body: 'Causal co-retrieval within τ+ reinforces directed edge weights via Δw = A+ exp(-Δt / τ+), prioritizing proven architectural facts.',
        },
        {
          heading: 'Zero Cloud Vector Leakage',
          body: 'All embeddings, entity relations, and session notes reside strictly on local disk under SQLite Write-Ahead Logging.',
        },
        {
          heading: 'Obsidian Markdown Compatibility',
          body: 'Supports bidirectional synchronization with local Markdown vaults without altering human-authored frontmatter.',
        },
      ]}
    />
  );
}
