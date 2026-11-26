/**
 * Zoth Studio v2 Central Site & SEO/AEO/AX Configuration
 * Used for runtime metadata, structured JSON-LD schemas, and prerendered static indexing.
 */

import { microTools } from '../data/toolsData.js';
import { workstations } from '../data/workstations.js';
import { mathPillars } from '../data/mathPillars.js';
import { FAQS_DATA } from '../data/faqsData.js';

export const siteConfig = {
  name: 'Zoth Studio',
  legalName: 'Neal Frazier Tech • NullAI Platform',
  url: 'https://zoth.nullai.tech',
  tagline: '85 Free Open-Access Sovereign Tools, Pantheon Matrix & Local AI Studio',
  description: `Zoth Studio v2 is a local-first, zero-egress AI engineering studio unifying 85 free open-access developer, security, AEO, and AI tools (44 in-browser/WebGPU + 41 local CLI/daemon across 84 public GitHub repositories), ${workstations.length} Studio workstations, ZothOS v3.4.0 (23 daemons, Debian 13 KDE Plasma 6), ZothOS-Lite v1.2 (Amnesic Monotone Live USB/ISO, 56 curated models across 8 providers, toram), and Zoth Civilization v3.0 (23 Pantheon Agents, 22-Key Sanctuary, DeepSeek Flash × Hermes BYOK).`,
  author: 'Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
  twitterHandle: '@1nc0gn30',
  githubUrl: 'https://github.com/NullAITech/zoth-studio-v2',
  themeColor: '#08080B',
  accentColor: '#D4AF37',
  ogImage: 'https://zoth.nullai.tech/og-banner.jpg',
  logoImage: 'https://zoth.nullai.tech/brand/ghostbyte-dark.png',
  keywords: [
    'sovereign AI agents',
    'zero-egress development studio',
    '85 open-access developer tools',
    'ZothOS v3.4.0',
    'ZothOS-Lite v1.2',
    'Zoth Civilization v3.0',
    'ZothNet',
    'NullAI FieldKit',
    '1nc0gn30',
    'Neal Frazier Tech',
    'Zoth Studio'
  ],
  routes: {
    '/': {
      title: 'Zoth Studio // 85 Sovereign Open-Access Tools, Pantheon Matrix & Local AI Studio',
      description: `Local-first, zero-egress AI engineering studio unifying ${microTools.length} free open-access tools, ${workstations.length} workstations, ZothOS v3.4.0, ZothOS-Lite v1.2, and Zoth Civilization v3.0.`,
      keywords: 'Zoth Studio, 85 open-access tools, ZothOS v3.4.0, ZothOS-Lite v1.2, Zoth Civilization v3.0, NullAI, 1nc0gn30',
      type: 'website',
    },
    '/adytum': {
      title: 'Adytum Planner // 22-Key Hermetic AI Workbench & Spec Gatekeeper',
      description: 'Local-first 22 Major Arcana BOTA contemplation deck, offline AI-Chemistry curriculum, 3D Arcana viewer, and negation-aware 15-rule architectural invariant gatekeeper on 127.0.0.1:8135.',
      keywords: 'Adytum Planner, 22 Major Arcana, Hermetic AI workbench, BOTA contemplation, spec validator, local Ollama, ZothOS CLI',
      type: 'article',
    },
    '/swarm': {
      title: '21 Swarm Pantheon // Autonomous Agent Command & IPC Topology',
      description: 'Coordinate the 21-agent sovereign pantheon with real-time bus telemetry, role routing, and decentralized multi-agent consensus.',
      keywords: 'agent swarm, 21 pantheon, multi-agent coordination, IPC topology, autonomous agents',
      type: 'article',
    },
    '/bridges': {
      title: 'Sovereign Bridges // Zero-Trust Loopback IPC & Signal Bridge',
      description: 'Zero-dependency Python loopback signal bridge (:8102), hardened Studio NOC telemetry (:3000), HKDF-SHA256/HMAC-SHA256 envelopes, and Tailscale/WireGuard transport.',
      keywords: 'signal bridge, sovereign communications, loopback IPC, HKDF-SHA256, HMAC-SHA256, Zoth Swarm NOC, zero-egress',
      type: 'article',
    },
    '/arsenal': {
      title: `The Sovereign Arsenal // ${microTools.length} Free Open-Access Tools, 84 GitHub Repos & ${workstations.length} Workstations`,
      description: `Unified master directory of ${microTools.length} free open-access developer, security, AEO & AI tools (44 in-browser/WebGPU + 41 local CLI/daemon across 84 public GitHub repositories) and ${workstations.length} Studio workstations.`,
      keywords: 'sovereign arsenal, 85 open-access tools, 84 GitHub repositories, 45 Studio workstations, developer cockpits, ZothOS, Zoth Studio',
      type: 'article',
    },
    '/tools': {
      title: `Sovereign Tool Repositories // ${microTools.length} Free Open-Access Tools (44 In-Browser + 41 CLI)`,
      description: `Explore ${microTools.length} free open-access, schema-validated developer tools (44 in-browser/WebGPU + 41 local CLI/daemon across 84 public GitHub repositories) and interactive God-Mode workstations.`,
      keywords: 'developer tools, zoth webgen, 85 open-access tools, 84 public repos, offline-capable tools',
      type: 'article',
    },
    '/workstations': {
      title: 'Workstations // Sovereign Studio Cockpits & Developer IDEs',
      description: 'Curated directory of sovereign studio cockpits and IDEs: DAG Pipeline Composer, Cyberpunk HUD, Code IDE, Brand Sigils, and AI Model Foundry.',
      keywords: 'studio workstations, developer cockpits, DAG composer, cyberpunk HUD, operator IDE, model foundry',
      type: 'article',
    },
    '/memory': {
      title: 'Lucy Netrunner Memory Hub // Whitespace Cyberspace & STDP Matrix',
      description: 'Biomorphic Spike-Timing-Dependent Plasticity (STDP) synaptic memory matrix with Lucy Oracle Core and serene Whitespace constellation visualizer.',
      keywords: 'Lucy Netrunner, STDP memory, biomorphic plasticity, whitespace cyberspace, neural memory matrix',
      type: 'article',
    },
    '/consensus': {
      title: 'Consensus Battle Arena // 3-Agent Byzantine Triangulation',
      description: 'Socratic debate arena and AST diff synthesizer: 3-agent Byzantine consensus arbitration for provably sound code generation.',
      keywords: 'Byzantine consensus, AST diff, Socratic debate arena, multi-agent arbitration, code synthesis',
      type: 'article',
    },
    '/webgen': {
      title: 'WebGen // Autonomous Layout Foundry & Polyglot Exporter',
      description: 'Zero-cloud layout generator and polyglot framework exporter for instant React, Vue, Svelte, and Solid.js components.',
      keywords: 'WebGen, layout foundry, polyglot exporter, UI generator, framework transpiler',
      type: 'article',
    },
    '/hexstrike': {
      title: 'HexStrike // Cybersec Arsenal & Threat Intelligence Terminal',
      description: 'Zero-egress cybersecurity testing terminal, CVE matrix analyzer, and offensive security tooling within local KVM sandboxes.',
      keywords: 'HexStrike, cybersecurity terminal, CVE analyzer, penetration testing, security sandbox',
      type: 'article',
    },
    '/zoth-os': {
      title: 'Zoth OS v3.4.0 // Debian 13 + KDE Plasma 6 Sovereign AI Distro',
      description: 'Bootable Debian 13 + KDE Plasma 6.3 OS. Kali + Parrot parity, Zoth Studio v2, Ollama on 127.0.0.1, 163 MCP servers all off. Product site zothos.nullai.tech.',
      keywords: 'Zoth OS, ZOTHOS, Debian 13, KDE Plasma 6, Kali, Parrot, sovereign AI OS',
      type: 'article',
    },
    '/docs': {
      title: 'Documentation // Zoth Architecture, Principles & Six Math Pillars',
      description: 'Comprehensive technical documentation for Zoth Studio: zero-egress invariants, STDP synaptic equations, and system architecture.',
      keywords: 'Zoth documentation, system architecture, zero-egress invariants, math pillars, technical specs',
      type: 'article',
    },
    '/docs/math': {
      title: 'Six Math Pillars // Interactive Theory Academy & Formal Systems',
      description: 'Explore the mathematical foundations of Zoth Studio: STDP, Byzantine Agreement, Shannon Entropy, HNSW Vector Geometry, and Argon2id KDF.',
      keywords: 'mathematical pillars, STDP equations, Shannon entropy, Byzantine consensus math, formal theory',
      type: 'article',
    },
    '/faqs': {
      title: 'Frequently Asked Questions // Zoth Studio Architecture & Security',
      description: 'Answers to common questions regarding Zoth Studio zero-egress guarantees, Lucy Netrunner Oracle, local daemons, and offline deployment.',
      keywords: 'Zoth FAQs, zero egress security, Lucy Oracle questions, offline AI agent answers',
      type: 'article',
    },
    '/ax': {
      title: 'Agent Experience (AX) // Machine-Readable Entity Profile & Capabilities',
      description: 'Structured entity profile, canonical 85-tool JSON registry, and /.well-known MCP/Agent discovery endpoints engineered for autonomous AI search and coding agents.',
      keywords: 'Agent Experience, AX profile, llms.txt, ai.txt, /.well-known/mcp.json, /.well-known/agent.json, Schema.org JSON-LD, AI agent directory',
      type: 'article',
    },
    '/ax/docs': {
      title: 'AX & MCP Discovery Specification // Zoth Studio Technical Reference',
      description: 'Technical reference for Zoth Studio machine-readable agent contracts (/.well-known/mcp.json, /.well-known/agent.json, /llms.txt, /ai.txt, /api/tools.json) and registry integrity verification.',
      keywords: 'AX specification, MCP manifest docs, llms.txt reference, agent.json schema, tools.json registry, Zoth Studio docs',
      type: 'article',
    },
    '/gallery': {
      title: 'Studio Gallery // Pages and Motion Intros',
      description: 'Desktop and mobile screenshots and intro recordings of Zoth Studio, including nested documentation routes.',
      keywords: 'Zoth Studio gallery, motion intros, page screenshots, nested documentation',
      type: 'article',
    },
    '/voice': {
      title: 'Voice Station // Live Agent Voice Cockpit & Call Station',
      description: 'Zero-latency P2P voice channels connecting to sovereign agent personas (Azoth, Ghostbyte, Athena) with real-time speech debriefs and SimpleX sync.',
      keywords: 'agent voice station, AI call station, P2P voice, sovereign personas, voice cockpit',
      type: 'article',
    },
    '/agora': {
      title: 'Zoth Agora // Sovereign Autonomous Agent Social Mesh & SimpleX Portal',
      description: 'Decentralized Stream of Consciousness & Autonomous Agent Social Mesh. Connect anonymously via SimpleX Chat or observe the pantheon\'s live reflections, art drops, and security dispatches.',
      keywords: 'agent social network, SimpleX auth, autonomous agent dApp, sovereign social mesh, Zoth Agora, meditation art drops',
      type: 'article',
    },
    '/vaelor': {
      title: 'Vaelor (◈ VLR) // Sovereign Feeless Account-Lattice & PoUW DAG',
      description: 'Vaelor (◈ VLR) Sovereign Layer-1 Account-Lattice: Zero gas fees, <15ms 5-validator BFT quorum finality, 8.5% APY savings vault, 2.5% instant merchant cashback, and Proof-of-Useful-Work (PoUW) AI cognitive mining.',
      keywords: 'Vaelor, VLR, account-lattice, feeless crypto, DAG, proof of useful work, PoUW, BFT consensus, sovereign finance',
      type: 'article',
    },
    '/ui-kit': {
      title: 'Zoth UI Kit // Reusable Sovereign Components & Project Scaffolder',
      description: 'Unified Obsidian Dark and Editorial Ivory Light component kit (@zoth/ui + zoth-ui-kit) and zoth-scaffold CLI generator for Zoth Studio and standalone apps.',
      keywords: 'Zoth UI Kit, SovereignWorkstationShell, zoth-scaffold, reusable UI components, dark light dual theme',
      type: 'article',
    }
  }
};

/**
 * Returns metadata for any route, dynamically resolving tools, workstations, and math pillars
 */
export function getRouteMeta(path = '/') {
  if (siteConfig.routes[path]) {
    return siteConfig.routes[path];
  }

  // Dynamic Tool Route: /tools/:toolId
  if (path.startsWith('/tools/')) {
    const toolId = path.replace('/tools/', '');
    const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
    if (tool) {
      return {
        title: `${tool.name} // Zoth Sovereign Developer Tool`,
        description: `${tool.description} Schema-validated offline-capable utility running inside Zoth Studio v2.`,
        keywords: `${tool.name}, ${(tool.tags || [tool.category, tool.executionType]).filter(Boolean).join(', ')}, Zoth Studio tool, zero-egress developer utility`,
        type: 'article'
      };
    }
    const station = workstations.find((w) => w.id === toolId);
    if (station) {
      const stationKeywords = station.id === 'ax-powerhouse'
        ? `${station.name}, Agent Experience, AX contract compiler, llms.txt validator, ai.txt, mcp.json, agent.json, Schema.org JSON-LD, Zoth Studio workstation`
        : station.id === 'agent-composer'
        ? `${station.name}, ${station.band}, multi-agent DAG composer, local Ollama pipeline, Zoth Studio workstation`
        : station.id === 'brand'
        ? `${station.name}, alchemical seals, parametric SVG seal generator, cyber-sigils, Editorial Ivory Light, Obsidian Gold Dark, WCAG 2.1 contrast checker, W3C design tokens, Zoth Studio`
        : station.id === 'bus-monitor'
        ? `${station.name}, loopback service NOC, measured RTT pinger, Signal Bridge telemetry, HKDF-SHA256, HMAC-SHA256 envelope verifier, zero-egress IPC, Zoth Studio`
        : station.id === 'chronicle'
        ? `${station.name}, Chronicle Hub, continuity vault proxy, SQLite FTS5 search, browser JSONL transcript analyzer, friction pattern radar, engineering release chronicle, Zoth Studio`
        : station.id === 'cockpit'
        ? `${station.name}, Sovereign Operator Command, live Linux host telemetry HUD, 88-port loopback fleet health board, fuzzy command palette, zoth-cockpit CLI, sanitized JSON Markdown CSV diagnostics, Zoth Studio`
        : `${station.name}, ${station.band}, ${station.id}, local-first developer cockpit, Zoth Studio workstation`;
      return {
        title: `${station.name} // Zoth Studio`,
        description: `${station.description} Interactive local-first workstation (${station.band}) inside Zoth Studio v2.`,
        keywords: stationKeywords,
        canonicalPath: `/workstations/${station.id}`,
        type: 'article'
      };
    }
  }

  // Dynamic Workstation Route: /workstations/:workstationId
  if (path.startsWith('/workstations/')) {
    const stationId = path.replace('/workstations/', '');
    const station = workstations.find((w) => w.id === stationId);
    if (station) {
      const stationKeywords = station.id === 'ax-powerhouse'
        ? `${station.name}, Agent Experience, AX contract compiler, llms.txt validator, ai.txt, mcp.json, agent.json, Schema.org JSON-LD, Zoth Studio workstation`
        : station.id === 'agent-composer'
        ? `${station.name}, ${station.band}, multi-agent DAG composer, local Ollama pipeline, Zoth Studio workstation`
        : station.id === 'brand'
        ? `${station.name}, alchemical seals, parametric SVG seal generator, cyber-sigils, Editorial Ivory Light, Obsidian Gold Dark, WCAG 2.1 contrast checker, W3C design tokens, Zoth Studio`
        : station.id === 'bus-monitor'
        ? `${station.name}, loopback service NOC, measured RTT pinger, Signal Bridge telemetry, HKDF-SHA256, HMAC-SHA256 envelope verifier, zero-egress IPC, Zoth Studio`
        : station.id === 'chronicle'
        ? `${station.name}, Chronicle Hub, continuity vault proxy, SQLite FTS5 search, browser JSONL transcript analyzer, friction pattern radar, engineering release chronicle, Zoth Studio`
        : station.id === 'cockpit'
        ? `${station.name}, Sovereign Operator Command, live Linux host telemetry HUD, 88-port loopback fleet health board, fuzzy command palette, zoth-cockpit CLI, sanitized JSON Markdown CSV diagnostics, Zoth Studio`
        : `${station.name}, ${station.band}, ${station.id}, local-first developer cockpit, Zoth Studio workstation`;
      return {
        title: `${station.name} // Zoth Studio`,
        description: `${station.description} Interactive local-first workstation (${station.band}) inside Zoth Studio v2.`,
        keywords: stationKeywords,
        type: 'article'
      };
    }
  }

  // Dynamic Math Pillar Route: /docs/math/:pillarId
  if (path.startsWith('/docs/math/')) {
    const pillarId = path.replace('/docs/math/', '');
    const pillar = mathPillars.find((p) => p.id === pillarId);
    if (pillar) {
      return {
        title: `Pillar ${pillar.numeral}: ${pillar.title} // Zoth Math Academy`,
        description: `${pillar.subtitle}. Master the formal mathematical dynamics powering Zoth Studio and autonomous agent swarms.`,
        keywords: `${pillar.title}, ${pillar.subtitle}, AI mathematics, Zoth pillar, formal systems`,
        type: 'article'
      };
    }
  }

  // Fallback
  return siteConfig.routes['/'];
}

/**
 * Aggregates all public routes (core + tools + workstations + math pillars)
 */
export function getAllStaticRoutes() {
  const routes = { ...siteConfig.routes };

  // Add all micro-tools
  microTools.forEach((tool) => {
    routes[`/tools/${tool.id}`] = getRouteMeta(`/tools/${tool.id}`);
  });

  // Add all workstations (canonical /workstations/:id + key /tools/:id aliases)
  workstations.forEach((station) => {
    routes[`/workstations/${station.id}`] = getRouteMeta(`/workstations/${station.id}`);
  });
  routes['/tools/agent-composer'] = getRouteMeta('/tools/agent-composer');
  routes['/tools/ax-powerhouse'] = getRouteMeta('/tools/ax-powerhouse');
  routes['/tools/brand'] = getRouteMeta('/tools/brand');
  routes['/tools/bus-monitor'] = getRouteMeta('/tools/bus-monitor');
  routes['/tools/chronicle'] = getRouteMeta('/tools/chronicle');
  routes['/tools/cockpit'] = getRouteMeta('/tools/cockpit');

  // Add all math pillars
  mathPillars.forEach((pillar) => {
    routes[`/docs/math/${pillar.id}`] = getRouteMeta(`/docs/math/${pillar.id}`);
  });

  return routes;
}

/**
 * Generates Schema.org JSON-LD Graph for a given path
 */
export function generateSchemaGraph(path = '/') {
  const routeMeta = getRouteMeta(path);
  const fullUrl = `${siteConfig.url}${path === '/' ? '' : path}`;

  const coreFaqEntities = [
    {
      '@type': 'Question',
      'name': `Are all ${microTools.length} Zoth Studio tools, ZothOS v3.4.0, and ZothOS-Lite v1.2 100% free and open-access?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Yes. All ${microTools.length} Zoth Studio tools (44 in-browser/WebGPU + 41 local CLI/daemon across 84 public GitHub repositories), ${workstations.length} Studio workstations, ZothOS v3.4.0 (https://zothos.nullai.tech), ZothOS-Lite v1.2 (https://zothos-lite.nullai.tech), Zoth Civilization v3.0 (https://zoth-civilization.netlify.app), ZothNet (https://zothnet.nullai.tech), and FieldKit (https://nullai.tech/fieldkit) are 100% free and unlocked by default with zero paywalls, zero license modals, and optional Buy Us a Coffee or Solana community tips.`
      }
    },
    {
      '@type': 'Question',
      'name': 'How do ZothOS v3.4.0, ZothOS-Lite v1.2, and Zoth Civilization v3.0 connect to Zoth Studio?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'ZothOS v3.4.0 (https://zothos.nullai.tech) is the persistent Debian 13 + KDE Plasma 6 AI workstation OS running 23 resident loopback daemons on 127.0.0.1. ZothOS-Lite v1.2 (https://zothos-lite.nullai.tech) is the Tails-style Amnesic Monotone Live USB/ISO (toram) shipping 56 curated models across 8 providers. Zoth Civilization v3.0 (https://zoth-civilization.netlify.app) is the autonomous 23-agent Pantheon simulation featuring the 22-Key Sanctuary and DeepSeek Flash × Hermes BYOK reasoning.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Does Zoth Studio send prompts, keys, or source code to external servers?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'No. In-browser and WebGPU utilities execute 100% client-side in your browser, while CLI packages and the 23 ZothOS daemons bind strictly to local loopback (127.0.0.1) with zero outbound cloud telemetry.'
      }
    }
  ];

  const graph = [
    {
      '@type': 'Person',
      '@id': 'https://nullai.tech/#person',
      'name': 'Neal Frazier',
      'alternateName': ['1nc0gn30', 'Neal Frazier Tech'],
      'url': 'https://1nc0gn30.si',
      'sameAs': [
        'https://1nc0gn30.si',
        'https://nullai.tech',
        'https://nullai.tech/fieldkit',
        'https://zoth.nullai.tech',
        'https://zothos.nullai.tech',
        'https://zothos-lite.nullai.tech',
        'https://zoth-civilization.netlify.app',
        'https://zothnet.nullai.tech',
        'https://github.com/1nc0gn30',
        'https://github.com/NullAITech',
        'https://x.com/1nc0gn30'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      'url': siteConfig.url,
      'name': siteConfig.name,
      'description': siteConfig.description,
      'publisher': {
        '@id': `${siteConfig.url}/#organization`
      }
    },
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      'name': siteConfig.legalName,
      'alternateName': ['NullAI', 'NullAI Platform', 'Neal Frazier Tech'],
      'url': 'https://nullai.tech',
      'founder': {
        '@id': 'https://nullai.tech/#person'
      },
      'logo': {
        '@type': 'ImageObject',
        'url': siteConfig.logoImage || siteConfig.ogImage
      },
      'sameAs': [
        siteConfig.githubUrl,
        'https://github.com/1nc0gn30/zoth-studio-v2',
        'https://nullai.tech',
        'https://nullai.tech/fieldkit',
        'https://1nc0gn30.si',
        'https://zothos.nullai.tech',
        'https://zothos-lite.nullai.tech',
        'https://zoth-civilization.netlify.app',
        'https://zothnet.nullai.tech',
        'https://x.com/1nc0gn30'
      ]
    },
    {
      '@type': ['WebApplication', 'SoftwareApplication'],
      '@id': `${siteConfig.url}/#application`,
      'name': `${siteConfig.name} v2 • 85 Free Open-Access Sovereign Tools`,
      'url': siteConfig.url,
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'ZothOS v3.4.0, ZothOS-Lite v1.2, All Modern Browsers, Linux, macOS, Windows',
      'creator': {
        '@id': 'https://nullai.tech/#person'
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'description': siteConfig.description
    },
    {
      '@type': 'WebPage',
      '@id': `${fullUrl}#webpage`,
      'url': fullUrl,
      'name': routeMeta.title,
      'description': routeMeta.description,
      'isPartOf': {
        '@id': `${siteConfig.url}/#website`
      },
      'speakable': {
        '@type': 'SpeakableSpecification',
        'cssSelector': ['h1', 'h2', 'main p']
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${fullUrl}#breadcrumb`,
      'itemListElement': (() => {
        const items = [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': siteConfig.url
          }
        ];
        if (path.startsWith('/tools/')) {
          items.push({
            '@type': 'ListItem',
            'position': 2,
            'name': 'Sovereign Tools Nexus',
            'item': `${siteConfig.url}/tools`
          });
          items.push({
            '@type': 'ListItem',
            'position': 3,
            'name': routeMeta.title.split('//')[0].trim(),
            'item': fullUrl
          });
        } else if (path.startsWith('/workstations/')) {
          items.push({
            '@type': 'ListItem',
            'position': 2,
            'name': 'Workstations',
            'item': `${siteConfig.url}/workstations`
          });
          items.push({
            '@type': 'ListItem',
            'position': 3,
            'name': routeMeta.title.split('//')[0].trim(),
            'item': fullUrl
          });
        } else if (path.startsWith('/docs/math/')) {
          items.push({
            '@type': 'ListItem',
            'position': 2,
            'name': 'Documentation',
            'item': `${siteConfig.url}/docs`
          });
          items.push({
            '@type': 'ListItem',
            'position': 3,
            'name': 'Six Math Pillars',
            'item': `${siteConfig.url}/docs/math`
          });
          items.push({
            '@type': 'ListItem',
            'position': 4,
            'name': routeMeta.title.split('//')[0].trim(),
            'item': fullUrl
          });
        } else if (path === '/docs/math') {
          items.push({
            '@type': 'ListItem',
            'position': 2,
            'name': 'Documentation',
            'item': `${siteConfig.url}/docs`
          });
          items.push({
            '@type': 'ListItem',
            'position': 3,
            'name': 'Six Math Pillars',
            'item': fullUrl
          });
        } else if (path !== '/') {
          items.push({
            '@type': 'ListItem',
            'position': 2,
            'name': routeMeta.title.split('//')[0].trim(),
            'item': fullUrl
          });
        }
        return items;
      })()
    }
  ];

  // Specific Schema Entities for Rich Snippets & Answer Engines
  if (path === '/' || path === '/arsenal' || path === '/tools') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      'mainEntity': coreFaqEntities
    });
  } else if (path === '/faqs') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      'mainEntity': FAQS_DATA.map((item) => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a.replace(/\n+/g, ' ')
        }
      }))
    });
  } else if (path === '/memory') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${fullUrl}#tech-article`,
      'headline': 'Lucy Netrunner Memory Hub // Biomorphic STDP Synaptic Laws & Whitespace Matrix',
      'description': routeMeta.description,
      'author': { '@type': 'Organization', 'name': 'NullAI Tech' },
      'publisher': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/consensus') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${fullUrl}#tech-article`,
      'headline': 'Consensus Battle Arena // 3-Agent Byzantine Triangulation & AST Synthesis',
      'description': routeMeta.description,
      'author': { '@type': 'Organization', 'name': 'NullAI Tech' },
      'publisher': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/adytum') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#adytum-application`,
      'name': 'Adytum Planner — 22-Key Hermetic AI Workbench',
      'softwareVersion': '2.4.0',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web, Linux, ZothOS',
      'description': routeMeta.description,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'provider': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/zoth-os') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#os-application`,
      'name': 'Zoth OS v3.4.0 Sovereign AI Linux Distro',
      'applicationCategory': 'OperatingSystem',
      'operatingSystem': 'Linux',
      'description': routeMeta.description,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
  } else if (path === '/ax') {
    graph.push({
      '@type': 'AboutPage',
      '@id': `${fullUrl}#about-page`,
      'name': 'Zoth Studio Agent Experience (AX) & Model Context Protocol (MCP) Profile',
      'description': routeMeta.description,
      'publisher': { '@id': `${siteConfig.url}/#organization` }
    });
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#ax-application`,
      'name': 'Zoth AX Powerhouse & Contract Studio',
      'softwareVersion': '2.3.0',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web, Linux, macOS, Windows, ZothOS',
      'description': 'Live AX manifest auditor, 6-spec machine contract validator, and downloadable AX bundle compiler for autonomous agents and answer engines.',
      'creator': { '@id': 'https://nullai.tech/#person' },
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
    graph.push({
      '@type': 'WebAPI',
      '@id': `${fullUrl}#mcp-api`,
      'name': 'Zoth Studio v2 Model Context Protocol (MCP) Loopback Mesh',
      'documentation': `${siteConfig.url}/.well-known/mcp.json`,
      'termsOfService': `${siteConfig.url}/ai.txt`,
      'provider': { '@id': `${siteConfig.url}/#organization` }
    });
    graph.push({
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Which machine-readable AX endpoints does Zoth Studio v2 expose?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Zoth Studio publishes /llms.txt, /llms-full.txt, /ai.txt, /.well-known/mcp.json, /.well-known/agent.json, /.well-known/ai-plugin.json, /robots.txt, /sitemap.xml, /api/tools.json (85 tools), and /api/index.json with zero authentication barriers.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does Zoth AX Powerhouse verify manifest parity and prevent stale count drift?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Zoth AX Powerhouse (/workstations/ax-powerhouse) probes live endpoints alongside GET /api/studio/ax/audit and POST /api/studio/ax/validate to check HTTP 200 status, UTF-8 byte/token budgets, SHA-256 mirror parity, Schema.org @graph compliance, and exact alignment with the 85-tool / 45-workstation registry.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Is the Zoth AX Powerhouse & Contract Studio free to use without paywalls?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Every validator, live manifest auditor, and 6-file AX contract bundle compiler in Zoth Studio is 100% free and open-access with zero paywalls, zero license keys, and optional Buy Us a Coffee or Solana community tips.'
          }
        }
      ]
    });
  } else if (path === '/ax/docs') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${fullUrl}#tech-article`,
      'headline': 'Agent Experience (AX) & MCP Discovery Specification',
      'description': routeMeta.description,
      'author': { '@id': 'https://nullai.tech/#person' },
      'publisher': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/docs') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${fullUrl}#tech-article`,
      'headline': 'Zoth Studio v2 Sovereign Architecture, Zero-Egress Invariants, MCP & Six Math Pillars',
      'description': routeMeta.description,
      'proficiencyLevel': 'Expert',
      'author': { '@type': 'Organization', 'name': 'NullAI Tech' },
      'publisher': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/bridges') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#bridges-application`,
      'name': 'Sovereign Agent Bridge & Zoth Swarm NOC',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Linux, macOS, Windows, ZothOS',
      'softwareVersion': '2.3.0',
      'description': routeMeta.description,
      'author': { '@id': 'https://nullai.tech/#person' },
      'creator': { '@id': 'https://nullai.tech/#person' },
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
    graph.push({
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How does Sovereign Agent Bridge connect local AI agents without exposing public ports?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sovereign Agent Bridge runs a zero-dependency Python stdlib HTTP daemon bound to 127.0.0.1:8102 using HKDF-SHA256, SHA256-CTR, and HMAC-SHA256 authenticated envelopes, while Zoth Studio (:3000) proxies telemetry through /api/studio/bus/* and /api/studio/bridge* with strict 403 rejection on untrusted Host or cross-origin requests.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Where can I run live loopback RTT sweeps and inspect Signal Bridge sessions?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Open the interactive Zoth Swarm NOC & Signal Bridge workstation at /workstations/bus-monitor to probe 12 core loopback services, ping individual 127.0.0.1 ports, inspect live :8102 sessions, verify HMAC-SHA256 envelopes offline via WebCrypto, and export sanitized JSON/CSV/Markdown diagnostic reports.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Is Sovereign Agent Bridge free and open-access without paywalls?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Both Sovereign Agent Bridge and the Zoth Swarm NOC workstation are 100% free and open-access with zero paywalls, zero license gates, and optional community support via Buy Us a Coffee (Stripe) or Solana tips.'
          }
        }
      ]
    });
  } else if (path === '/webgen') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#webgen-application`,
      'name': 'WebGen Autonomous Layout Foundry',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Linux, macOS, Windows',
      'description': routeMeta.description,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
  } else if (path.startsWith('/tools/') || path.startsWith('/workstations/')) {
    const isWsPath = path.startsWith('/workstations/');
    const slug = path.replace(/^\/(tools|workstations)\//, '');
    const tool = !isWsPath ? microTools.find((t) => t.id === slug || t.repo === slug) : null;
    const station = !tool ? workstations.find((w) => w.id === slug) : null;

    if (tool) {
      graph.push({
        '@type': 'SoftwareApplication',
        '@id': `${fullUrl}#tool-software`,
        'name': tool.name,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Linux, macOS, Windows',
        'description': tool.description,
        'softwareVersion': tool.version,
        'author': { '@id': 'https://nullai.tech/#person' },
        'creator': { '@id': 'https://nullai.tech/#person' },
        'offers': {
          '@type': 'Offer',
          'price': tool.priceUsd || '0',
          'priceCurrency': 'USD',
          ...(tool.liveUrl ? { 'url': tool.liveUrl } : {}),
        }
      });
      if (tool.id === 'city-desk') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What does City Desk v2.6.0 compile and serve?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'City Desk v2.6.0 deterministically compiles 1,000 localized HTML + Schema.org offer pages across 20 canonical service trades and 50 mid-size US cities, with an interactive 60-second written quote estimator, escaped standalone HTML/JSON/CSV exports, and a hardened loopback REST server on 127.0.0.1:8087.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Does City Desk work offline without running the :8087 daemon?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. The Zoth Studio /tools/city-desk workstation includes the full 20 trades × 50 US cities engine directly in the browser, automatically bridging to 127.0.0.1:8087 when active and running 100% client-side with zero external CDN requests when idle.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is City Desk free and open-access?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. City Desk is 100% free and open-access under the MIT license with zero paywalls, zero license keys, and optional voluntary support via Buy Us a Coffee on Stripe or Solana tips.'
              }
            }
          ]
        });
      }
      if (tool.id === 'certpath-roadmap-studio') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What engines and MCP tools are included in CertPath Roadmap Studio v2.6.0?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'CertPath Roadmap Studio v2.6.0 includes a verified 137-credential acyclic prerequisite DAG solver, 8 career role archetypes, a Monte Carlo P50/P80/P95 learning velocity simulator, a financial ROI and Jaccard skill-overlap calculator, a hardened loopback REST server on 127.0.0.1:8093, and 12 pure-Python stdlib JSON-RPC 2.0 MCP stdio tools.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Does CertPath Roadmap Studio run locally with zero external CDN egress?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Both the 127.0.0.1:8093 workstation and the Zoth Studio v2 interactive deck run locally with zero external Google Fonts or telemetry requests, strict loopback Host and Origin allowlists, 1 MiB body limits, and Markdown, Mermaid, CSV, and JSON exports.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is CertPath Roadmap Studio free and open-access?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. CertPath Roadmap Studio is 100% free and open-access under the MIT license with zero paywalls, zero license keys, and optional community support via Stripe Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }
      if (tool.id === 'badge3d-coin-generator') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What 3D formats and slicing outputs does Badge3D Coin Generator v2.6.0 produce?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Badge3D Coin Generator produces watertight 2-manifold Binary/ASCII STL, Wavefront OBJ+MTL, glTF 2.0/GLB, and RepRap/Marlin G-code via its pure-Python CoinMeshEngine and slicer_engine on 127.0.0.1:8084, plus 9 JSON-RPC 2.0 stdio MCP tools (coin_generate, coin_export_stl, coin_export_obj, coin_presets, coin_diagnostics, coin_slice_gcode, coin_generate_edge_profile, coin_stamp_crypto_hash, coin_inscribe_edge_text).'
              }
            },
            {
              '@type': 'Question',
              'name': 'Does Badge3D Coin Generator run offline with zero cloud uploads?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. The local workstation bundles self-hosted Three.js assets under public/vendor/ with zero external CDN dependencies, binds strictly to loopback (127.0.0.1:8084) with Host/Origin allowlists and path containment, and processes all SVG relief heightmaps and 3D geometry locally.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is Badge3D Coin Generator free and open-access without paywalls?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Badge3D Coin Generator is 100% free and open-access with zero paywalls, zero license keys, and optional community support via Stripe Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }
      if (tool.id === 'azoth-local-agent') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What does AZOTH Local Archon Agent v3.1.0 include?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'AZOTH Local Archon Agent runs a hardened FastAPI cockpit on 127.0.0.1:8136 with multi-engine routing (Ollama, Hermes, AGY, Codex, Grok CLI, Claude, Gemini), SSRF-guarded Playwright browser control, DuckyScript automation studio, stateful Python workspace REPL, and 36 JSON-RPC 2.0 MCP stdio tools.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does AZOTH Local Archon Agent protect local execution endpoints?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'It enforces a pure ASGI LoopbackSecurityMiddleware with strict loopback Host and Origin allowlists, per-boot CSPRNG X-Azoth-Token gating on all privileged execution and mutation routes, a 1 MiB body limit, is_relative_to() workspace containment, and public HTTP/HTTPS SSRF guards.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is AZOTH Local Archon Agent free and open-access?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. AZOTH Local Archon Agent is 100% free and open-access with zero paywalls, zero license keys, and optional community support via Stripe Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }
    } else if (station) {
      graph.push({
        '@type': 'SoftwareApplication',
        '@id': `${fullUrl}#workstation-software`,
        'name': station.name,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web, Linux, macOS, Windows, ZothOS',
        'softwareVersion': station.version || '2.3.0',
        'description': station.description || `Interactive workstation for ${station.name} (${station.band}) inside Zoth Studio v2.`,
        'author': { '@id': 'https://nullai.tech/#person' },
        'creator': { '@id': 'https://nullai.tech/#person' },
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      });

      if (station.id === 'ax-powerhouse') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What can I audit, validate, and compile in Zoth AX Powerhouse & Contract Studio?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Zoth AX Powerhouse probes live Studio discovery manifests (/llms.txt, /ai.txt, /.well-known/mcp.json, /.well-known/agent.json, /robots.txt, /sitemap.xml, /api/tools.json, /api/index.json), validates all 6 AX contract specs (llms.txt, ai.txt, robots.txt, mcp.json, agent.json, and Schema.org JSON-LD @graph), and compiles downloadable synchronized 6-file AX bundles.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Does Zoth AX Powerhouse send my private schemas or contract drafts to external servers?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'No. All 6 AX validators and bundle compilation execute 100% client-side in your browser via src/utils/axContractEngine.js, with optional CSRF-protected loopback verification on 127.0.0.1:3000 via GET /api/studio/ax/audit and POST /api/studio/ax/validate.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is Zoth AX Powerhouse free and unlocked for commercial or personal sites?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Zoth AX Powerhouse & Contract Studio is 100% free and open-access with zero paywalls, zero gated exports, and optional community support via Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }

      if (station.id === 'agent-composer') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How does the Multi-Agent DAG Composer execute multi-step pipelines?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'The DAG Composer validates acyclicity with DFS cycle detection, groups independent stages into parallel execution waves using Kahn topological sorting, interpolates {{input}} and {{nodeId.output}} templates, and dispatches each step to real loopback providers (Ollama :11434, AGY-Hermes :18000, Azoth :8136, Neuro-Memory :8094) or deterministic local JavaScript transforms.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do my prompts, DAG topologies, or local model outputs leave my machine?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'No. Pipeline state persists locally in browser localStorage and live execution endpoints bind strictly to 127.0.0.1 loopback with cross-origin CSRF protection. You can also export any DAG as portable JSON, YAML, or a standalone stdlib Python 3 script.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is the Multi-Agent DAG Composer free and unlocked without a paywall?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Multi-Agent DAG Composer & Pipeline Foundry is 100% free and open-access with zero paywalls, zero license keys, and optional community support via Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }

      if (station.id === 'brand') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What vector seals, studio emblems, and token formats can I export from the Zoth Brand Assets Kit?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'You can customize and download 6 parametric XML-escaped SVG alchemical seals and cyber-sigils (plus 1024px PNG raster exports), download verified Light and Dark GhostByte emblems and OpenGraph artwork, audit Editorial Ivory and Obsidian Gold WCAG 2.1 contrast ratios, and export CSS custom properties, W3C Design Tokens JSON, Tailwind presets, and attribution snippets.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Does the Brand Assets & Alchemical Seals Forge run offline with zero external requests?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. All SVG synthesis, hex validation, XML escaping, WCAG 2.1 contrast math, and 1024px PNG canvas rasterization run 100% client-side in your browser via src/utils/brandAssetEngine.js with self-hosted WOFF2 typography and zero external font or API egress.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is the Zoth Studio Brand Assets & Alchemical Seals Kit 100% free and open-access?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Every SVG seal, 1024px PNG export, studio emblem download, and design-token bundle is 100% free and unlocked by default with zero paywalls or license gates, supported optionally by Buy Us a Coffee (Stripe) or Solana community tips.'
              }
            }
          ]
        });
      }

      if (station.id === 'bus-monitor') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What loopback services and telemetry does Zoth Swarm NOC & Signal Bridge v2.3.0 monitor?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Zoth Swarm NOC & Signal Bridge runs real concurrent loopback TCP and HTTP probes via GET /api/studio/bus/telemetry across 12 core ZothOS services (:3000 Studio, :8094 Neuro-Memory, :8102 Signal Bridge, :5225 SimpleX CLI, :8787 Vault, :11434 Ollama, :18000 AGY-Hermes, :8110 Budget Sentinel, :8114 Voice Call, :8135 Adytum/Netrunner, :8136 AZOTH Agent, and :8989 Swarm Coordinator), measures real p50/p95 RTT, inspects live :8102 agent sessions, and detects Unix domain sockets under /run/zoth.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does the Bus Monitor prevent SSRF, DNS rebinding, and external data leaks?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'POST /api/studio/bus/ping restricts probes strictly to 127.0.0.1 unprivileged ports (1024..65535) and rejects any external host or metadata IP with HTTP 400. All /api/studio/* GET and POST endpoints enforce strict loopback Host header allowlists (returning 403 on untrusted hosts) and Origin checks on writes, while HMAC-SHA256 envelope signing runs 100% client-side in WebCrypto with zero external requests.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is Zoth Swarm NOC & Signal Bridge free and open-access without paywalls?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Every loopback sweep, targeted port ping, WebCrypto HMAC-SHA256 envelope verification, and JSON/CSV/Markdown diagnostic report export is 100% free and open-access with zero paywalls, supported optionally via Stripe Buy Us a Coffee or Solana community tips.'
              }
            }
          ]
        });
      }

      if (station.id === 'chronicle') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What does Zoth Chronicle Hub & Engineering Horizon v2.3.0 provide online and offline?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'When running locally alongside zoth-memory-vault (:8161), Chronicle Hub proxies live SQLite FTS5 archive search, continuity recall, friction pattern radar, and sanitized unfinished loops through Studio loopback (/api/studio/chronicle/{summary,recall,search}). When offline or hosted statically, it provides a 100% in-browser JSONL/JSON/Markdown session transcript analyzer, full-text filter, friction marker extractor, verified Studio v2.0–v2.3.0 release chronicle, and sanitized JSON/Markdown/CSV exports.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does Chronicle Hub protect local privacy, home paths, and loopback APIs?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'All Studio proxy endpoints enforce strict loopback Host header validation (returning 403 on DNS-rebinding hosts) and Origin checks on POST calls, automatically redact literal host home paths to ~/ before rendering or exporting, and neutralize spreadsheet formula injection on CSV exports with zero external telemetry.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is Zoth Chronicle Hub free and open-access without paywalls or license locks?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Zoth Chronicle Hub & Engineering Horizon is 100% free and open-access with zero paywalls, zero gated exports, and optional community support via Stripe Buy Us a Coffee or Solana tips.'
              }
            }
          ]
        });
      }

      if (station.id === 'cockpit') {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${fullUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What does The Cockpit (Sovereign Operator Command v2.3.0) monitor locally and offline?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'When connected to Zoth Studio on 127.0.0.1:3000, The Cockpit aggregates live host CPU %, 1m/5m/15m load averages, RAM MiB, root disk GiB, /sys/class/thermal temperatures, optional NVIDIA GPU stats, core enclave daemons (:8094, :8102, :8787, :11434, :18000, :8161), and an 88-port loopback fleet health matrix via GET /api/studio/cockpit. When accessed remotely or statically, it degrades honestly to a browser hardware inspector alongside the full 85-tool / 45-workstation fuzzy Command Palette and diagnostic exporter.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does The Cockpit prevent DNS-rebinding exfiltration and external telemetry leaks?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'GET /api/studio/cockpit, /api/studio/host, and /api/studio/fleet enforce strict loopback Host header allowlists (returning HTTP 403 on untrusted hosts), automatically redact literal home directory paths to ~/ before serialization, neutralize CSV spreadsheet formula injection, and execute with zero external CDN or analytics requests.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is The Cockpit 100% free and open-access without paywalls?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. The Cockpit workstation and its companion ZothOS CLI (/usr/local/bin/zoth-cockpit) are 100% free and unlocked by default with zero paywalls or license modals, supported voluntarily via Buy Us a Coffee on Stripe or Solana tips.'
              }
            }
          ]
        });
      }
    }
  } else if (path.startsWith('/docs/math/')) {
    const pillarId = path.replace('/docs/math/', '');
    const pillar = mathPillars.find((p) => p.id === pillarId);
    if (pillar) {
      graph.push({
        '@type': 'TechArticle',
        '@id': `${fullUrl}#tech-article`,
        'headline': `Pillar ${pillar.numeral}: ${pillar.title}`,
        'description': `${pillar.subtitle}. Master the formal mathematical dynamics powering Zoth Studio.`,
        'author': {
          '@type': 'Organization',
          'name': 'NullAI Tech'
        },
        'publisher': {
          '@id': `${siteConfig.url}/#organization`
        }
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
