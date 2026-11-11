import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function AdytumPage() {
  return (
    <TechnicalReferencePage
      tone="gold"
      parentRoute="/adytum"
      parentLabel="Adytum Overview"
      kicker="ADYTUM WORKFLOW SPECIFICATION // :8135"
      title="Adytum 22-Stage Workflow Reference"
      summary="Pipeline manifest specification, JSON Schema boundary gates, and CLI commands for running deterministic multi-step AI workflows locally."
      repoUrl="https://github.com/NullAITech/adytum-alchemist-ai-workflow"
      repoLabel="Clone Adytum Workflow"
      cloneCommand="git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git && cd adytum-alchemist-ai-workflow"
      installSteps={[
        '# 1. Clone the standalone Adytum workflow repository',
        'git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git',
        'cd adytum-alchemist-ai-workflow',
        '',
        '# 2. Start local Adytum loopback server on 127.0.0.1:8135',
        'python3 server.py --port 8135',
        'curl -s http://127.0.0.1:8135/health',
      ]}
      cliCommands={[
        { cmd: 'adytum validate <manifest.json>', desc: 'Verify DAG acyclicity and Draft 2020-12 JSON Schema definitions across all stages.' },
        { cmd: 'adytum run <manifest.json>', desc: 'Execute stages sequentially or in parallel against local Ollama, Hermes, or CLI tools.' },
        { cmd: 'adytum resume <run-id>', desc: 'Resume an interrupted pipeline from the last verified JSONL disk checkpoint.' },
        { cmd: 'adytum inspect <run-id> --json', desc: 'Print stage latencies, retry counts, and schema validation transcripts.' },
      ]}
      contractTitle="Workflow Stage Contract"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          pipeline: 'architecture-audit',
          stages: [
            {
              id: '01-decompose',
              runner: 'hermes-local',
              outputSchema: {
                type: 'object',
                required: ['modules', 'invariants'],
              },
              maxRetries: 2,
            },
            {
              id: '02-verify',
              runner: 'cli',
              command: 'npm test',
              requireExitZero: true,
            },
          ],
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Deterministic Stage Gating',
          body: 'Downstream stages never execute until upstream outputs satisfy both JSON Schema validation and exit-code invariants.',
        },
        {
          heading: 'Immutable Local Checkpoints',
          body: 'Each ratified stage writes a SHA-256-hashed checkpoint under .adytum/runs/ for reproducible auditing.',
        },
        {
          heading: 'Model-Agnostic Execution',
          body: 'Switch seamlessly between local Ollama weights, DeepSeek-Flash via Hermes, or deterministic shell scripts.',
        },
      ]}
    />
  );
}
