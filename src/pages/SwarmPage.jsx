import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function SwarmPage() {
  return (
    <TechnicalReferencePage
      tone="emerald"
      parentRoute="/swarm"
      parentLabel="Swarm Overview"
      kicker="SWARM PROTOCOL SPECIFICATION // :8141"
      title="Pantheon Swarm Multiplexer Reference"
      summary="Technical reference for cloning, configuring, and dispatching multi-agent DAG workflows locally via NullAITech/zoth-swarm-multiplexer, Nous Research Hermes Agent, and Zoth Egregore."
      repoUrl="https://github.com/NullAITech/zoth-swarm-multiplexer"
      repoLabel="Clone Swarm Multiplexer"
      cloneCommand="git clone https://github.com/NullAITech/zoth-swarm-multiplexer.git && cd zoth-swarm-multiplexer"
      installSteps={[
        '# 1. Clone the standalone multiplexer repository',
        'git clone https://github.com/NullAITech/zoth-swarm-multiplexer.git',
        'cd zoth-swarm-multiplexer',
        '',
        '# 2. Start loopback multiplexer on 127.0.0.1:8141',
        'python3 server.py --port 8141',
        '',
        '# 3. Optional: Clone Zoth Egregore (DeepSeek-Flash + Hermes Agent)',
        'git clone https://github.com/1nc0gn30/zoth-egregore.git',
      ]}
      cliCommands={[
        { cmd: 'zoth-swarm status --json', desc: 'Inspect active worker cadres, loopback queue depth, and local model connectivity.' },
        { cmd: 'zoth-swarm dispatch --spec task.json', desc: 'Decompose a structured engineering goal into git-worktree-isolated worker jobs.' },
        { cmd: 'GET http://127.0.0.1:8141/health', desc: 'Loopback daemon liveness probe returning active worker pool metrics.' },
        { cmd: 'POST http://127.0.0.1:8141/api/dispatch', desc: 'Submit a typed DAG payload from local CLI or MCP bridge (cross-origin browser writes blocked).' },
      ]}
      contractTitle="MCP Server Configuration"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          mcpServers: {
            'zoth-swarm': {
              command: 'python3',
              args: ['/opt/zoth-swarm-multiplexer/swarm_cli.py', '--mcp'],
              env: {
                SWARM_HOST: '127.0.0.1',
                SWARM_PORT: '8141',
                MEMORY_ENDPOINT: 'http://127.0.0.1:8094',
              },
            },
          },
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Git Worktree Isolation',
          body: 'Each parallel worker cadre operates inside a dedicated git worktree so concurrent edits never race on the main index.',
        },
        {
          heading: 'Verifier Gate Requirement',
          body: 'Patches produced by implementation cadres must pass unit tests and Gitleaks secret scanning before merge.',
        },
        {
          heading: 'Hermes & DeepSeek-Flash Pairing',
          body: 'Configured to run efficiently over Nous Research Hermes Agent with DeepSeek-Flash or local Ollama weights.',
        },
      ]}
    />
  );
}
