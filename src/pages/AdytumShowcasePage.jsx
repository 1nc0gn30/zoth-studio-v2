import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function AdytumShowcasePage() {
  return (
    <LocalSystemDossier
      tone="gold"
      kicker="ADYTUM PLANNER · v2.4.0"
      badges={['LOCAL DAEMON :8135', '22 MAJOR ARCANA', '15-RULE SPEC GATEKEEPER']}
      title="22-Key Hermetic AI"
      accentWord="Workbench."
      subtitle="Adytum Planner unifies a 22-Key BOTA contemplation and offline AI-Chemistry study workbench on 127.0.0.1:8135, a 3D Arcana and negation-aware 15-rule architectural spec gatekeeper in Zoth Studio, and a deterministic local CLI (adytum)."
      toolRoute="/tools/adytum-alchemist-ai-workflow"
      toolLabel="Open Adytum Planner in Zoth Studio"
      cloneCommand="git clone https://github.com/1nc0gn30/adytum-alchemist-ai-workflow.git && cd adytum-alchemist-ai-workflow"
      repoUrl="https://github.com/1nc0gn30/adytum-alchemist-ai-workflow"
      repoLabel="Get Adytum Planner Repo"
      docsRoute="/adytum/docs"
      docsLabel="CLI & API Reference"
      overviewTitle="Three Synchronized Local Surfaces"
      overviewParagraphs={[
        'Adytum Planner maps all 22 Major Arcana keys (Key 0 The Fool through Key 21 The World) to concrete engineering invariants—covering single-pointed scope, local state hygiene, sandbox isolation, verification tests, and zero-deception release gates.',
        'Run the standalone BOTA & offline AI-Chemistry workbench on http://127.0.0.1:8135 with optional local Ollama guidance, audit PRDs interactively in the Zoth Studio God-Mode Deck, or invoke adytum validate and adytum harden directly from your terminal.',
      ]}
      pipelineSteps={[
        {
          label: 'Standalone Workbench (127.0.0.1:8135)',
          detail: 'Explore all 22 HD Tarot keys, Hebrew/gematria correspondences, bundled offline AI-Chemistry lessons, canonical BOTA study excerpts, and the pausable 5-minute contemplation timer.',
        },
        {
          label: 'Studio God-Mode Deck & 3D Dioramas',
          detail: 'Inspect the interactive Tree of Life lattice, 3D .glb Arcana dioramas, LTX-Video loops, and live negation-aware 15-rule architectural spec validator with Markdown/JSON export.',
        },
        {
          label: 'Deterministic CLI & Loopback API',
          detail: 'Run adytum list, adytum key <0-21>, adytum invariants, adytum validate, and adytum harden in shell scripts, or POST /api/validate against 127.0.0.1:8135.',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8135 (server.py)' },
        { key: 'CLI Entrypoints', value: 'adytum · adytum-alchemist-ai-workflow' },
        { key: 'Major Arcana Deck', value: '22 Canonical Keys (0–21)' },
        { key: 'Spec Validator', value: '15 Negation-Aware Hermetic Rules' },
        { key: 'HTTP Endpoints', value: 'GET /health, /api/keys · POST /api/validate, /api/harden' },
        { key: 'Model Backends', value: '100% Offline + Local Ollama (:11434) / OpenAI' },
      ]}
      quickstartLines={[
        '# Clone standalone Adytum Planner repository',
        'git clone https://github.com/1nc0gn30/adytum-alchemist-ai-workflow.git',
        'cd adytum-alchemist-ai-workflow',
        '',
        '# Run loopback daemon on 127.0.0.1:8135 and test CLI',
        'adytum list',
        'adytum validate "Local-first architecture with deterministic tests and boundaries." --json',
      ]}
      capabilitiesKicker="VERIFIED CAPABILITIES"
      capabilitiesTitle="Honest Local-First Planning & Contemplation"
      capabilities={[
        {
          tag: 'OFFLINE DECK',
          title: '22 Bundled AI-Chemistry Lessons',
          desc: 'Every Key (0–21) ships with HD card artwork, canonical BOTA study text, Hermetic engineering directives, and Socratic questions—zero API key required.',
        },
        {
          tag: 'GATEKEEPER',
          title: 'Negation-Aware 15-Rule Spec Audit',
          desc: 'Catches missing invariants and negated claims ("with no tests") via both the browser workbench, POST /api/validate, and adytum validate.',
        },
        {
          tag: 'HARDENED LOOPBACK',
          title: 'Strict Origin & Path Containment',
          desc: 'server.py enforces loopback-only CORS (with OPTIONS preflight), realpath traversal rejection, and automatic API-key redaction on session JSON exports.',
        },
        {
          tag: 'OPEN ACCESS',
          title: 'Zero Paywalls & Full CLI Parity',
          desc: '100% free and unlocked across :8135, Zoth Studio, and ZothOS CLI with byte-identical binaries across host and ISO chroot.',
        },
      ]}
      funnelToolTitle="Adytum Planner — 22-Key Hermetic AI Workbench"
      funnelToolTag="PLANNING · v2.4.0"
      funnelToolDesc="22-Key BOTA contemplation deck, offline AI-Chemistry curriculum, 3D Studio Arcana viewer, and negation-aware 15-rule spec gatekeeper."
    />
  );
}
