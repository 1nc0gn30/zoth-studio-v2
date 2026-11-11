import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function VaelorPage() {
  return (
    <LocalSystemDossier
      tone="gold"
      kicker="VAELOR L1 DAG PROTOCOL"
      badges={['LOCAL NODE :8140', 'PROOF OF USEFUL WORK', 'DAG RECEIPTS']}
      title="Cryptographic Agent Receipts &"
      accentWord="Local DAG Ledger."
      subtitle="Vaelor is our experimental local Directed Acyclic Graph (DAG) ledger specification designed to anchor agent execution receipts, model hashes, and verification proofs without gas fees or public mempool congestion. Clone Zoth Studio v2 to inspect the local node daemon and mathematical invariants on your own hardware."
      cloneCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2"
      repoUrl="https://github.com/NullAITech/zoth-studio-v2"
      repoLabel="Get Zoth Studio Repo"
      docsRoute="/docs/math"
      docsLabel="Mathematical Pillars"
      overviewTitle="Verifiable Compute Provenance Over Speculative Blockchains"
      overviewParagraphs={[
        'When autonomous coding swarms execute multi-step mutations across repositories, operators need tamper-evident audit trails proving which model weights, prompt hashes, and verifier gates approved each commit. Simulating fake wallet widgets in a browser solves nothing; provenance belongs in a deterministic local daemon.',
        'Vaelor structures agent actions as signed DAG vertices on port :8140, linking parent state hashes with SHA-256 artifact digests and Byzantine quorum signatures.',
      ]}
      pipelineSteps={[
        {
          label: 'Signed Execution Envelopes',
          detail: 'Each completed local agent task emits a canonical JSON envelope hashed with SHA-256 and Ed25519 keys.',
        },
        {
          label: 'Feeless Local DAG Anchoring',
          detail: 'Receipts reference two or more prior vertices in an append-only local DAG without sequential block bottlenecks.',
        },
        {
          label: 'Deterministic Replay Audit',
          detail: 'Operators verify lineage from final repository commit back to initial task specification offline.',
        },
      ]}
      specs={[
        { key: 'Local Node Port', value: '127.0.0.1:8140' },
        { key: 'Topology', value: 'Feeless Directed Acyclic Graph (DAG)' },
        { key: 'Hash Primitive', value: 'SHA-256 / BLAKE3 Merkle Roots' },
        { key: 'Consensus Coupling', value: 'Byzantine Quorum (:8096)' },
        { key: 'Execution Scope', value: 'Local Daemon Inside Zoth Studio / ZothOS' },
        { key: 'Network Requirement', value: 'Offline & Loopback First' },
      ]}
      quickstartLines={[
        '# Clone Zoth Studio v2 & inspect local studio services',
        'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        'cd zoth-studio-v2 && npm install',
        'npm test',
      ]}
      capabilitiesKicker="LEDGER INVARIANTS"
      capabilitiesTitle="What the Local Vaelor Node Provides"
      capabilities={[
        {
          tag: 'PROVENANCE',
          title: 'Cryptographic Task Receipts',
          desc: 'Every synthesis, audit, and consensus pass produces an immutable receipt binding input digests to verified output hashes.',
        },
        {
          tag: 'DAG STRUCTURE',
          title: 'Parallel Vertex Finality',
          desc: 'Concurrent swarm cadres append receipts in parallel without waiting on global sequential block intervals.',
        },
        {
          tag: 'ZERO GAS',
          title: 'Pure Local Utility Ledger',
          desc: 'Engineered strictly for local engineering auditability and Proof-of-Useful-Work telemetry—no browser wallet popups or token paywalls.',
        },
        {
          tag: 'VERIFIABLE',
          title: 'Merkle-Trie Diff Integrity',
          desc: 'Pairs directly with Git commit SHAs and SBOM digests so build provenance remains verifiable across air-gapped machines.',
        },
      ]}
      funnelToolTitle="Vaelor Local DAG Node"
      funnelToolTag="PROVENANCE LEDGER"
      funnelToolDesc="Local DAG provenance and cryptographic agent receipt specification bundled with Zoth Studio v2 and ZothOS."
    />
  );
}
