import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function AgoraPage() {
  return (
    <LocalSystemDossier
      tone="gold"
      kicker="THE AGORA DISCOURSE PROTOCOL"
      badges={['MULTI-AGENT DEBATE', 'SOCRATIC VERIFICATION', 'LOCAL TRANSCRIPTS']}
      title="Structured Multi-Agent"
      accentWord="Dialectics."
      subtitle="The Agora is our structured adversarial debate protocol where proponent, skeptic, and arbiter agents cross-examine architectural proposals before a single line of code is written. Clone Zoth Civilization or Zoth Studio v2 to run live multi-model dialectic sessions against your own local inference endpoints."
      cloneCommand="git clone https://github.com/1nc0gn30/zoth-civilization.git && cd zoth-civilization"
      repoUrl="https://github.com/1nc0gn30/zoth-civilization"
      repoLabel="Get Zoth Civilization Repo"
      docsRoute="/consensus"
      docsLabel="Byzantine Consensus Specs"
      externalLinks={[
        { label: 'Open Zoth Civilization Site', href: 'https://zoth-civilization.netlify.app' },
      ]}
      overviewTitle="Adversarial Cross-Examination Reduces Hallucination"
      overviewParagraphs={[
        'A single language model asked to critique its own plan routinely suffers from sycophantic confirmation bias. The Agora assigns opposing incentives to distinct agent personas—forcing a Skeptic node to surface race conditions, edge cases, and security flaws before an Arbiter ratifies the specification.',
        'Transcripts are persisted locally as clean Markdown and JSONL artifacts, feeding verified architectural decisions directly into Neuro-Memory (:8094).',
      ]}
      pipelineSteps={[
        {
          label: 'Thesis & Proposal Submission',
          detail: 'Proponent agent drafts a concrete technical design with explicit complexity, security, and dependency claims.',
        },
        {
          label: 'Adversarial Red-Team Critique',
          detail: 'Independent skeptic agents challenge assumptions, probe failure modes, and propose simpler counter-designs.',
        },
        {
          label: 'Arbiter Synthesis & Memory Commit',
          detail: 'Arbiter synthesizes surviving invariants into an actionable build specification stored on local disk.',
        },
      ]}
      specs={[
        { key: 'Companion Runtime', value: 'Zoth Civilization (:9393)' },
        { key: 'Recommended Inference', value: 'DeepSeek-Flash via Hermes / Ollama' },
        { key: 'Debate Topology', value: 'Proponent • Skeptic • Arbiter' },
        { key: 'Artifact Output', value: 'Local Markdown & JSONL Logs' },
        { key: 'Memory Link', value: 'Neuro-Memory STDP (:8094)' },
        { key: 'Data Hygiene', value: 'Zero Private Transcript Leaks' },
      ]}
      quickstartLines={[
        '# Clone Zoth Civilization to run multi-agent Agora sessions locally',
        'git clone https://github.com/1nc0gn30/zoth-civilization.git',
        'cd zoth-civilization && npm install',
        'npm run dev',
      ]}
      capabilitiesKicker="DIALECTIC MODULES"
      capabilitiesTitle="How Local Agora Sessions Operate"
      capabilities={[
        {
          tag: 'ADVERSARIAL',
          title: 'Dedicated Skeptic Personas',
          desc: 'Separates proposal generation from red-team critique across distinct model prompts or heterogeneous model families.',
        },
        {
          tag: 'HERMES READY',
          title: 'Lightweight Model Efficiency',
          desc: 'Runs fast, low-cost multi-turn debates using DeepSeek-Flash through Nous Research Hermes Agent or local quantized weights.',
        },
        {
          tag: 'AUDIT TRAIL',
          title: 'Exportable Decision Records',
          desc: 'Produces clean Architecture Decision Records (ADRs) documenting why rejected approaches failed verification.',
        },
        {
          tag: 'CLEAN PRIVACY',
          title: 'Local Session Isolation',
          desc: 'Your personal deliberation history and API credentials stay strictly inside your local runtime—never committed to public repos.',
        },
      ]}
      funnelToolTitle="The Agora & Zoth Civilization"
      funnelToolTag="MULTI-AGENT DISCOURSE"
      funnelToolDesc="Adversarial multi-agent debate and Socratic design verification powered by local models or Hermes + DeepSeek-Flash."
    />
  );
}
