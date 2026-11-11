import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function WebGenPage() {
  return (
    <TechnicalReferencePage
      tone="sky"
      parentRoute="/webgen"
      parentLabel="WebGen Overview"
      kicker="ZOTH WEBGEN SPECIFICATION // LOCAL COMPILER"
      title="Zoth WebGen CLI & Compiler Reference"
      summary="Documentation for cloning 1nc0gn30/zoth-webgen to synthesize React, Vue, Svelte, Solid, Astro, and static HTML codebases locally with Schema.org AEO and multi-viewport verification."
      repoUrl="https://github.com/1nc0gn30/zoth-webgen"
      repoLabel="Clone Zoth WebGen"
      cloneCommand="git clone https://github.com/1nc0gn30/zoth-webgen.git && cd zoth-webgen"
      installSteps={[
        '# 1. Clone the standalone Zoth WebGen compiler',
        'git clone https://github.com/1nc0gn30/zoth-webgen.git',
        'cd zoth-webgen',
        '',
        '# 2. Inspect CLI flags and framework targets',
        'python3 webgen.py --help',
        '',
        '# 3. Generate a local React or static HTML project',
        'python3 webgen.py --framework react --out ./my-app --prompt "Developer documentation portal"',
      ]}
      cliCommands={[
        { cmd: 'python3 webgen.py --framework <target>', desc: 'Emit project scaffolding for react, vue, svelte, solid, astro, or html.' },
        { cmd: 'python3 webgen.py --theme <preset>', desc: 'Apply contrast-verified editorial light or obsidian dark design tokens.' },
        { cmd: 'python3 webgen.py --verify <dir>', desc: 'Validate HTML tag closure, Schema.org JSON-LD @graph, robots.txt, and sitemap.xml.' },
        { cmd: 'npm run dev -- --port 5173', desc: 'Preview generated Vite projects locally on loopback 127.0.0.1:5173.' },
      ]}
      contractTitle="Generated AEO & Security Baseline"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          outputs: [
            'public/robots.txt',
            'public/sitemap.xml',
            'netlify.toml (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN)',
            'index.html (Schema.org @graph: WebApplication + FAQPage)',
          ],
          contrastInvariant: 'WCAG AAA >= 7:1 across Light (#FAF8F3) and Dark (#08080B)',
          overflowInvariant: 'scrollWidth <= clientWidth at 390px, 820px, 1440px',
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Zero Proprietary Runtime',
          body: 'Generated projects use standard Vite, ES modules, and clean CSS—no locked vendor SDKs or cloud dependencies.',
        },
        {
          heading: 'Local Model & Agent Loop',
          body: 'Works directly with local Ollama models, Hermes Agent, Claude Code, or OpenCode on your filesystem.',
        },
        {
          heading: 'Automated Guardrail Checks',
          body: 'Every build verifies zero unclosed tags, descriptive alt attributes, and canonical OpenGraph metadata.',
        },
      ]}
    />
  );
}
