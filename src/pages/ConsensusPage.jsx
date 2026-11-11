import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function ConsensusPage() {
  return (
    <LocalSystemDossier
      tone="emerald"
      kicker="BYZANTINE CONSENSUS ENGINE"
      badges={['LOCAL DAEMON :8096', 'N >= 3F + 1 QUORUM', 'CROSS-MODEL VERIFICATION']}
      title="Fault-Tolerant Multi-Model"
      accentWord="Quorum Verification."
      subtitle="High-assurance engineering cannot trust a single stochastic completion. Our Byzantine Consensus layer evaluates code patches, security audits, and formal claims across N >= 3f + 1 independent model instances—ratifying outputs only when a verifiable supermajority converges."
      cloneCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2"
      repoUrl="https://github.com/NullAITech/zoth-studio-v2"
      repoLabel="Get Zoth Studio Repo"
      docsRoute="/docs/math"
      docsLabel="Read Formal Math Proofs"
      overviewTitle="Applying Classical BFT Quorum Bounds to Stochastic Agents"
      overviewParagraphs={[
        'In distributed systems, tolerating f faulty or hallucinating worker nodes requires a minimum pool of N = 3f + 1 independent participants and a 2f + 1 commit quorum. When synthesizing security-critical code or cryptographic transforms, dispatching identical specifications across diverse local models exposes subtle logic divergences immediately.',
        'Combined with deterministic test vector harnesses (`scripts/test-ground-truth.mjs`), Consensus rejects any candidate patch that fails either mathematical ground-truth checks or cross-model semantic agreement.',
      ]}
      pipelineSteps={[
        {
          label: 'Parallel Heterogeneous Fan-Out',
          detail: 'Dispatches identical task contracts across independent local Ollama weights, Hermes workers, or configured API endpoints.',
        },
        {
          label: 'AST & Test-Vector Normalization',
          detail: 'Canonicalizes candidate outputs and executes deterministic unit/crypto test vectors against each candidate.',
        },
        {
          label: '2f + 1 Supermajority Commit',
          detail: 'Commits the verified artifact only when quorum threshold and zero-error runtime checks pass simultaneously.',
        },
      ]}
      specs={[
        { key: 'Loopback Service', value: '127.0.0.1:8096' },
        { key: 'Fault Tolerance Bound', value: 'N >= 3f + 1 (Up to 33% Faulty Nodes)' },
        { key: 'Commit Threshold', value: '2f + 1 Verified Supermajority' },
        { key: 'Ground-Truth Harness', value: 'node scripts/test-ground-truth.mjs' },
        { key: 'Math Specification', value: '/docs/math (Six Formal Pillars)' },
        { key: 'Execution Mode', value: 'Local CLI & Daemon Verification' },
      ]}
      quickstartLines={[
        '# Clone Zoth Studio v2 & run the deterministic ground-truth suite',
        'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        'cd zoth-studio-v2 && npm install',
        'npm run test:ground-truth',
      ]}
      capabilitiesKicker="CONSENSUS GUARANTEES"
      capabilitiesTitle="Deterministic Verification Over Guesswork"
      capabilities={[
        {
          tag: 'QUORUM MATH',
          title: '3f + 1 Fault Isolation',
          desc: 'Isolates outlier hallucinations, truncated completions, and prompt-injected worker responses before they reach your codebase.',
        },
        {
          tag: 'GROUND TRUTH',
          title: 'RFC & Crypto Vector Gating',
          desc: 'Pairs model voting with hard mathematical assertions—Shannon entropy, HMAC-SHA256, and AST parse checks.',
        },
        {
          tag: 'HETEROGENEOUS',
          title: 'Cross-Family Model Diversity',
          desc: 'Combines DeepSeek, Qwen, Llama, and frontier models locally so correlated single-family blind spots are caught.',
        },
        {
          tag: 'ZERO BLOAT',
          title: 'Scriptable CLI Exit Codes',
          desc: 'Designed to run in real local CI hooks and terminal pipelines rather than decorative browser sliders.',
        },
      ]}
      funnelToolTitle="Byzantine Consensus & Ground-Truth Verifier"
      funnelToolTag="CONSENSUS & FORMAL VERIFICATION"
      funnelToolDesc="N >= 3f + 1 multi-model quorum engine and cryptographic ground-truth verification suite inside Zoth Studio v2."
    />
  );
}
