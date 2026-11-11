import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function WebGenShowcasePage() {
  return (
    <LocalSystemDossier
      tone="sky"
      kicker="ZOTH WEBGEN FOUNDRY"
      badges={['LOCAL CLI COMPILER', '6 FRAMEWORK TARGETS', 'SCHEMA.ORG AEO']}
      title="Full-Stack Site Synthesis on"
      accentWord="Your Own Machine."
      subtitle="Zoth WebGen is a local code synthesizer and static/full-stack project generator. Clone the repository to scaffold, theme, and verify production-ready web applications directly on your filesystem—complete with Schema.org JSON-LD graphs, security headers, and multi-viewport layout checks."
      cloneCommand="git clone https://github.com/1nc0gn30/zoth-webgen.git && cd zoth-webgen"
      repoUrl="https://github.com/1nc0gn30/zoth-webgen"
      repoLabel="Get Zoth WebGen Repo"
      docsRoute="/webgen/docs"
      docsLabel="Compiler & CLI Documentation"
      overviewTitle="Deterministic Project Scaffolding Without SaaS Lock-In"
      overviewParagraphs={[
        'Browser-hosted AI site builders trap your code behind proprietary sandboxes and export bloated, unmaintainable markup. Zoth WebGen runs locally as a Python and Node CLI pipeline that writes clean, standard project trees directly into your git workspace.',
        'Every generated project includes structured metadata (`robots.txt`, `sitemap.xml`, OpenGraph tags, and Schema.org `@graph`), strict Content-Security and frame headers, and responsive CSS grid tokens verified across mobile, tablet, and desktop viewports.',
      ]}
      pipelineSteps={[
        {
          label: 'Specification & Theme Tokenization',
          detail: 'Reads a concise prompt or manifest and resolves typography, WCAG contrast pairs, and route topology.',
        },
        {
          label: 'Multi-Framework AST Emission',
          detail: 'Emits idiomatic React, Vue, Svelte, Solid, Astro, or zero-dependency semantic HTML/CSS bundles.',
        },
        {
          label: 'Local Guardrail Verification',
          detail: 'Validates HTML tag closure, AEO JSON-LD structure, and zero horizontal overflow before build completion.',
        },
      ]}
      specs={[
        { key: 'CLI Entrypoint', value: 'zoth-webgen' },
        { key: 'Dev Preview Port', value: '127.0.0.1:5173' },
        { key: 'Export Targets', value: 'React / Vue / Svelte / Solid / Astro / HTML' },
        { key: 'SEO / AEO Layer', value: 'Schema.org JSON-LD + Sitemap + Robots' },
        { key: 'Model Support', value: 'Ollama / Hermes / OpenAI-Compatible' },
        { key: 'Code Ownership', value: '100% Local MIT Output' },
      ]}
      quickstartLines={[
        '# Clone standalone compiler repository',
        'git clone https://github.com/1nc0gn30/zoth-webgen.git',
        'cd zoth-webgen',
        '',
        '# Inspect CLI flags & target frameworks',
        'python3 webgen.py --help',
      ]}
      capabilitiesKicker="COMPILER MODULES"
      capabilitiesTitle="Built for Clean Code Ownership"
      capabilities={[
        {
          tag: '6 TARGETS',
          title: 'Multi-Framework Code Emission',
          desc: 'Generate clean Vite + React, Vue, Svelte, Solid, Astro, or vanilla HTML/CSS repositories with zero proprietary runtime dependencies.',
        },
        {
          tag: 'AEO READY',
          title: 'Built-In Schema.org & Discovery',
          desc: 'Automatically synthesizes valid WebApplication + FAQPage JSON-LD graphs, canonical sitemaps, and crawler-friendly robots policies.',
        },
        {
          tag: 'CONTRAST SAFE',
          title: 'Dual-Theme Design Tokens',
          desc: 'Ships calibrated editorial light and obsidian dark palettes engineered to prevent low-contrast text and layout overflow.',
        },
        {
          tag: 'OFFLINE FIRST',
          title: 'Local LLM & Agent Compatible',
          desc: 'Pairs with local Ollama models, Hermes Agent, or Zoth Studio v2 without uploading proprietary product specs to cloud builders.',
        },
      ]}
      funnelToolTitle="Zoth WebGen Foundry"
      funnelToolTag="AUTONOMOUS WEB COMPILER"
      funnelToolDesc="Local 6-framework web application compiler with built-in Schema.org AEO generation and viewport guardrails."
    />
  );
}
