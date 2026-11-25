import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function AdytumPage() {
  return (
    <TechnicalReferencePage
      tone="gold"
      parentRoute="/adytum"
      parentLabel="Adytum Planner Overview"
      kicker="ADYTUM PLANNER REFERENCE // :8135 · v2.4.0"
      title="Adytum Planner CLI & Loopback API Reference"
      summary="Verified ZothOS CLI subcommands, loopback HTTP endpoints (GET /api/keys, POST /api/validate, POST /api/harden), and local-first architecture for the 22-Key Hermetic AI Workbench."
      repoUrl="https://github.com/1nc0gn30/adytum-alchemist-ai-workflow"
      repoLabel="Clone Adytum Planner"
      cloneCommand="git clone https://github.com/1nc0gn30/adytum-alchemist-ai-workflow.git && cd adytum-alchemist-ai-workflow"
      installSteps={[
        '# 1. Clone the standalone Adytum Planner repository',
        'git clone https://github.com/1nc0gn30/adytum-alchemist-ai-workflow.git',
        'cd adytum-alchemist-ai-workflow',
        '',
        '# 2. Run verification suites (JS + Python)',
        'npm test && pytest -v',
        '',
        '# 3. Start local loopback daemon on 127.0.0.1:8135',
        'adytum serve --port 8135',
        'curl -s http://127.0.0.1:8135/health',
      ]}
      cliCommands={[
        { cmd: 'adytum list [--json]', desc: 'List all 22 Major Arcana Hermetic keys, elemental gates, and architectural directives.' },
        { cmd: 'adytum key <0-21> [--json]', desc: 'Inspect a single Key (0 The Fool through 21 The World) in human-readable or JSON format.' },
        { cmd: 'adytum invariants [project] [--json]', desc: 'Generate a complete 22-point Hermetic architectural checklist for your project.' },
        { cmd: 'adytum validate <file-or-text> [--json]', desc: 'Run the negation-aware 15-rule Hermetic Gatekeeper (exits 0 when score >= 70, exits 1 otherwise).' },
        { cmd: 'adytum harden <file-or-text> [--json]', desc: 'Coherently rewrite flawed/negated draft specs and append missing invariant clauses to reach 100/100 (A+).' },
        { cmd: 'adytum serve --port 8135', desc: 'Launch server.py bound strictly to 127.0.0.1:8135 with /health, /api/keys, /api/validate, and /api/harden.' },
      ]}
      contractTitle="POST /api/validate JSON Response Contract"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          passed: true,
          score: 100,
          grade: 'A+',
          summary: 'Specification passes the Hermetic Quality Gate. Architecture is robust, testable, and bounded.',
          checks: [
            {
              keyNumber: 0,
              keyName: '0 · The Fool (Aleph)',
              rule: 'Intention & Purpose Defined (Aleph)',
              passed: true,
              weight: 5,
              recommendation: null,
            },
            {
              keyNumber: 9,
              keyName: 'IX · The Hermit (Yod)',
              rule: 'Deterministic Verification Test Suite (Yod)',
              passed: true,
              weight: 6,
              recommendation: null,
            },
          ],
          blockers: [],
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Hardened Loopback Enclave (server.py)',
          body: 'Binds exclusively to 127.0.0.1:8135, validates Origin via urllib.parse (rejecting cross-origin requests with 403), supports OPTIONS preflight (204), and enforces strict realpath containment to prevent traversal oracles.',
        },
        {
          heading: 'Secret-Redacted Local Session Exports',
          body: 'Browser progress, notes, and provider preferences stay in localStorage; Export Session JSON strips all OpenAI and Ollama Cloud API keys automatically before generating the download.',
        },
        {
          heading: '100% Offline Curriculum + Local Ollama',
          body: 'All 22 Major Arcana lessons, canonical BOTA texts, and contemplation timers operate completely offline, with optional local Ollama (:11434) auto-discovery for Socratic initiation.',
        },
      ]}
    />
  );
}
