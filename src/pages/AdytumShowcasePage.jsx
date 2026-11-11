import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function AdytumShowcasePage() {
  return (
    <LocalSystemDossier
      tone="gold"
      kicker="ADYTUM WORKFLOW ENGINE"
      badges={['LOCAL DAEMON :8135', '22-STAGE PIPELINE', 'JSON SCHEMA I/O']}
      title="Deterministic AI Workflow"
      accentWord="Pipelines."
      subtitle="Adytum replaces brittle prompt chains with contract-validated local execution graphs. Define multi-stage planning, synthesis, and verification pipelines once—every intermediate payload is validated against strict JSON schemas before advancing to the next local model or tool call."
      cloneCommand="git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git && cd adytum-alchemist-ai-workflow"
      repoUrl="https://github.com/NullAITech/adytum-alchemist-ai-workflow"
      repoLabel="Get Adytum Workflow Repo"
      docsRoute="/adytum/docs"
      docsLabel="Workflow Engine Docs"
      overviewTitle="Schema-Enforced Multi-Step Execution"
      overviewParagraphs={[
        'Unconstrained agent loops drift off-spec when intermediate outputs contain malformed fields or hallucinated assumptions. Adytum structures complex engineering rites into up to 22 discrete stages, enforcing explicit input/output schemas and pre-flight invariants at every boundary.',
        'When a stage fails validation, Adytum triggers bounded local repair with exact schema error diagnostics rather than cascading corrupted state downstream.',
      ]}
      pipelineSteps={[
        {
          label: 'Contract & DAG Declaration',
          detail: 'Define stage prompts, tool bindings, and JSON Schema contracts in version-controlled YAML/JSON manifests.',
        },
        {
          label: 'Local Model & Tool Execution',
          detail: 'Stages dispatch against local Ollama models, Hermes Agent, or CLI binaries with deterministic seed and timeout controls.',
        },
        {
          label: 'Boundary Validation & Checkpointing',
          detail: 'Outputs are verified against schema invariants and checkpointed to disk so long pipelines can resume cleanly.',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8135' },
        { key: 'CLI Entrypoint', value: 'adytum' },
        { key: 'Pipeline Stages', value: '22 Deterministic Gates' },
        { key: 'Contract Format', value: 'JSON Schema Draft 2020-12' },
        { key: 'Model Backends', value: 'Ollama / Hermes / OpenAI-Compatible' },
        { key: 'License & Privacy', value: 'Open Source • Zero Cloud Lock-In' },
      ]}
      quickstartLines={[
        '# Clone standalone Adytum workflow repository',
        'git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git',
        'cd adytum-alchemist-ai-workflow',
        '',
        '# Start local Adytum planning daemon on 127.0.0.1:8135',
        'python3 server.py --port 8135',
      ]}
      capabilitiesKicker="PIPELINE GUARANTEES"
      capabilitiesTitle="Reliable Orchestration on Local Models"
      capabilities={[
        {
          tag: 'CONTRACTS',
          title: 'Strict JSON Schema Validation',
          desc: 'Every stage input and output is validated against explicit type, enum, and structural constraints before downstream execution.',
        },
        {
          tag: 'CHECKPOINTS',
          title: 'Resumable Disk State',
          desc: 'Every completed step writes an immutable local checkpoint so interrupted multi-step runs resume without recomputing prior stages.',
        },
        {
          tag: 'BOUNDED REPAIR',
          title: 'Automated Schema Self-Correction',
          desc: 'Malformed model responses are caught immediately and retried with exact validator diagnostics under strict retry budgets.',
        },
        {
          tag: 'COMPOSABLE',
          title: 'Native Zoth Studio Integration',
          desc: 'Chains seamlessly with Neuro-Memory (:8094), Pantheon Swarm (:8141), and all 77 local CLI tools in the Zoth Studio arsenal.',
        },
      ]}
      funnelToolTitle="Adytum Workflow Engine"
      funnelToolTag="DETERMINISTIC PLANNING"
      funnelToolDesc="22-stage schema-validated local AI workflow orchestrator with disk checkpointing and bounded repair."
    />
  );
}
