import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function ConsensusPage() {
  return (
    <LocalSystemDossier
      tone="emerald"
      kicker="BYZANTINE CONSENSUS ENGINE"
      badges={['HYBRID WORKSTATION', 'N >= 3F + 1 QUORUM', 'SHA-256 MERKLE RECEIPTS']}
      title="Fault-Tolerant Multi-Model"
      accentWord="Quorum Verification."
      subtitle="High-assurance engineering cannot trust a single stochastic completion. Our Byzantine Consensus layer evaluates code patches, unified diffs, and security claims across N >= 3f + 1 independent validators or local loopback models (:18000 AGY-Hermes and :11434 Ollama)—ratifying outputs only when a verifiable supermajority converges."
      toolRoute="/workstations/consensus"
      toolLabel="Open Consensus Battle Arena"
      cloneCommand="zoth open consensus"
      repoUrl="https://github.com/NullAITech/zoth-studio-v2"
      repoLabel="Get Zoth Studio Repo"
      docsRoute="/docs/math"
      docsLabel="Read Formal Math Proofs"
      showSupportStrip={false}
      overviewTitle="Applying Classical BFT Quorum Bounds to Stochastic Agents"
      overviewParagraphs={[
        'In distributed systems, tolerating f faulty or hallucinating worker nodes requires a minimum pool of N = 3f + 1 independent participants and a 2f + 1 supermajority commit quorum. When auditing security-critical diffs or configuration changes, evaluating identical specifications across independent specialist rubrics or local loopback models exposes logic divergences immediately.',
        'Paired with our pure consensus verification suite (scripts/test-consensus-engine.mjs via npm run test:consensus), the arena seals every round into a canonical FIPS 180-4 SHA-256 binary Merkle receipt and halts ratification whenever faults exceed f_max = floor((N - 1) / 3).',
      ]}
      pipelineSteps={[
        {
          label: 'Deterministic Rubric or Loopback Model Fan-Out',
          detail: 'Runs 100% in-browser across 4 to 7 domain validators or dispatches up to 4 local loopback models on 127.0.0.1:18000 (AGY-Hermes) and 127.0.0.1:11434 (Ollama) through POST /api/studio/consensus/run.',
        },
        {
          label: 'Unified Diff & Static Invariant Analysis',
          detail: 'Parses diff hunks line-by-line to surface eval/XSS sinks, wildcard 0.0.0.0 binds, SELECT * queries, weak hashes, and positive loopback/error-handling guards.',
        },
        {
          label: '2f + 1 Supermajority Commit & SHA-256 Merkle Seal',
          detail: 'Computes exact BFT safety/liveness verdicts (QUORUM_REACHED, BYZANTINE_SPLIT, or FAULT_THRESHOLD_EXCEEDED) and exports sanitized JSON, Markdown, and formula-neutralized CSV receipts.',
        },
      ]}
      specs={[
        { key: 'Interactive Workstation', value: '/workstations/consensus (v2.3.0)' },
        { key: 'Studio Loopback APIs', value: '127.0.0.1:3000 /api/studio/consensus/{models,run}' },
        { key: 'Local Model Gateways', value: '127.0.0.1:18000 (AGY-Hermes) & :11434 (Ollama)' },
        { key: 'Fault Tolerance Bound', value: 'N >= 3f + 1 (f_max = floor((N - 1) / 3))' },
        { key: 'Commit Threshold', value: 'Q = max(2f + 1, floor(2N / 3) + 1)' },
        { key: 'Automated Test Suite', value: 'npm run test:consensus (scripts/test-consensus-engine.mjs)' },
      ]}
      quickstartLines={[
        '# Open the interactive Byzantine Consensus Battle Arena',
        'zoth open consensus',
        '# Query discovered local loopback models (:18000 & :11434)',
        'curl -sS http://127.0.0.1:3000/api/studio/consensus/models | jq .',
        '# Run the pure BFT quorum & SHA-256 Merkle unit test suite',
        'npm run test:consensus',
      ]}
      capabilitiesKicker="CONSENSUS GUARANTEES"
      capabilitiesTitle="Deterministic Verification Over Guesswork"
      capabilities={[
        {
          tag: 'QUORUM MATH',
          title: '3f + 1 Fault Isolation',
          desc: 'Isolates equivocating, timed-out, or hallucinating validators and halts commits immediately when f exceeds floor((N - 1) / 3).',
        },
        {
          tag: 'SHA-256 MERKLE',
          title: 'Cryptographic Receipt Sealing',
          desc: 'Seals the proposal digest and canonical sorted validator votes into a genuine FIPS 180-4 SHA-256 binary Merkle root with one-click integrity verification.',
        },
        {
          tag: 'HYBRID MODELS',
          title: 'In-Browser + Loopback Inference',
          desc: 'Executes deterministically offline in any browser or fans out to live local AGY-Hermes (:18000) and Ollama (:11434) models with SSRF allowlists and 12s timeouts.',
        },
        {
          tag: 'SANITIZED EXPORTS',
          title: 'Audit-Ready JSON, MD & CSV',
          desc: 'Exports home-path-redacted JSON and Markdown briefs plus spreadsheet formula-neutralized CSV vote matrices with zero external telemetry.',
        },
      ]}
      funnelToolTitle="Byzantine Consensus Battle Arena"
      funnelToolTag="CONSENSUS & FORMAL VERIFICATION"
      funnelToolDesc="Hybrid N >= 3f + 1 multi-agent quorum workstation, unified diff arbiter, and SHA-256 Merkle verdict engine inside Zoth Studio v2."
    />
  );
}
