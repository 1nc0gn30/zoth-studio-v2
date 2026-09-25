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
  legalName: 'NullAI Tech',
  url: 'https://zoth.nullai.tech',
  tagline: 'Zero-Egress Sovereign Agent Development Studio & Pantheon Matrix',
  description: 'Zoth Studio v2 is an air-gapped, zero-egress development environment for autonomous AI agents, featuring biomorphic STDP memory, Lucy Netrunner Oracle, Byzantine consensus triangulation, and 37 sovereign workstations.',
  author: 'NullAI Tech',
  twitterHandle: '@NullAITech',
  githubUrl: 'https://github.com/NullAITech/zoth-studio-v2',
  themeColor: '#08080B',
  accentColor: '#D4AF37',
  ogImage: 'https://zoth.nullai.tech/brand/ghostbyte-dark.png',
  keywords: [
    'sovereign AI agents',
    'zero-egress development studio',
    'biomorphic STDP memory',
    'Lucy Netrunner Oracle',
    'Byzantine consensus triangulation',
    'local LLM orchestration',
    'Ollama model foundry',
    'autonomous agent DAG composer',
    'air-gapped AI workspace',
    'React MUI studio v2',
    'Zoth Studio'
  ],
  routes: {
    '/': {
      title: 'Zoth Studio // Sovereign Agent Development Studio & Pantheon Matrix',
      description: 'Zero-egress development studio for autonomous AI agent pantheons, local model orchestration, and hardware-secured sovereign intelligence.',
      keywords: 'Zoth Studio, sovereign AI, agent pantheon, zero egress studio, air-gapped agent development',
      type: 'website',
    },
    '/adytum': {
      title: 'Adytum Sanctum // Sovereign Key Management & Zero-Egress Secrets',
      description: 'Hardware-anchored secret management and cryptographic key derivation via Argon2id and XChaCha20-Poly1305 in local enclaves.',
      keywords: 'Adytum, cryptographic keys, zero-egress secrets, hardware vault, Argon2id',
      type: 'article',
    },
    '/swarm': {
      title: '21 Swarm Pantheon // Autonomous Agent Command & IPC Topology',
      description: 'Coordinate the 21-agent sovereign pantheon with real-time bus telemetry, role routing, and decentralized multi-agent consensus.',
      keywords: 'agent swarm, 21 pantheon, multi-agent coordination, IPC topology, autonomous agents',
      type: 'article',
    },
    '/bridges': {
      title: 'Sovereign Bridges // E2EE Signal Mesh & Loopback Bus Monitor',
      description: 'End-to-end encrypted inter-agent communication, WebSocket packet pinger, and loopback mesh channels with zero external leakage.',
      keywords: 'signal bridge, sovereign communications, E2EE mesh, inter-agent bus, zero-leakage',
      type: 'article',
    },
    '/tools': {
      title: 'Sovereign Tool Nexus // 25 Air-Gapped Micro-Tools & Workstations',
      description: 'Explore 25 standalone, schema-validated developer tools for JWT security, payload entropy analysis, polyglot transpilation, and 3D modeling.',
      keywords: 'developer tools, JWT inspector, payload entropy, polyglot transpiler, air-gapped tools',
      type: 'article',
    },
    '/workstations': {
      title: 'Workstations // 37 Studio Environments & Interactive Consoles',
      description: 'Full directory of 37 native studio workstations: DAG Pipeline Composer, Cyberpunk HUD, Code IDE, Brand Sigils, and AI Model Foundry.',
      keywords: 'studio workstations, DAG composer, cyberpunk HUD, operator IDE, model foundry',
      type: 'article',
    },
    '/templates': {
      title: 'Templates // Open-Source Agent & Web Applications Library',
      description: 'Curated repository of open-source templates, Astro scaffolds, and Vite fullstack starters with inspectable file architectures.',
      keywords: 'web templates, open-source starters, Astro templates, Vite templates, developer scaffolds',
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
      title: 'Zoth OS // KVM Hypervisor Sandbox & WebContainer Runtime',
      description: 'Hardware-isolated Linux KVM virtualization, thin QEMU disk management, and edge dispatch inside sovereign enclaves.',
      keywords: 'Zoth OS, KVM sandbox, QEMU virtualization, WebContainer, air-gapped OS',
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
      description: 'Structured entity profile, service catalog, and API schema endpoints optimized for autonomous AI search and agent engines.',
      keywords: 'Agent Experience, AX profile, machine-readable schema, LLM search optimization, AI agent directory',
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
        description: `${tool.description} Schema-validated air-gapped utility running inside Zoth Studio v2.`,
        keywords: `${tool.name}, ${(tool.tags || [tool.category, tool.executionType]).filter(Boolean).join(', ')}, Zoth Studio tool, zero-egress developer utility`,
        type: 'article'
      };
    }
  }

  // Dynamic Workstation Route: /workstations/:workstationId
  if (path.startsWith('/workstations/')) {
    const stationId = path.replace('/workstations/', '');
    const station = workstations.find((w) => w.id === stationId);
    if (station) {
      return {
        title: `${station.name} // Zoth Studio Workstation`,
        description: `Sovereign interactive workstation for ${station.name} (${station.band}). Decoupled and rendered directly in Zoth Studio v2.`,
        keywords: `${station.name}, ${station.band}, Zoth workstation, air-gapped console`,
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

  // Add all workstations
  workstations.forEach((station) => {
    routes[`/workstations/${station.id}`] = getRouteMeta(`/workstations/${station.id}`);
  });

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

  const graph = [
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
      'url': siteConfig.url,
      'logo': {
        '@type': 'ImageObject',
        'url': siteConfig.ogImage
      },
      'sameAs': [
        siteConfig.githubUrl,
        'https://twitter.com/NullAITech'
      ]
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.url}/#application`,
      'name': siteConfig.name,
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Linux, macOS, Windows',
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
  if (path === '/faqs') {
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
      '@type': 'SecurityService',
      '@id': `${fullUrl}#security-service`,
      'name': 'Adytum Sanctum Key Derivation & Enclave Vault',
      'description': routeMeta.description,
      'provider': { '@id': `${siteConfig.url}/#organization` }
    });
  } else if (path === '/zoth-os') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#os-application`,
      'name': 'Zoth OS Sovereign KVM Virtual Machine',
      'applicationCategory': 'OperatingSystem',
      'operatingSystem': 'Linux',
      'description': routeMeta.description,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
  } else if (path === '/ax') {
    graph.push({
      '@type': 'AboutPage',
      '@id': `${fullUrl}#about-page`,
      'name': 'Zoth Studio Agent Experience (AX) Entity Profile',
      'description': routeMeta.description,
      'publisher': { '@id': `${siteConfig.url}/#organization` }
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
  } else if (path.startsWith('/tools/')) {
    const toolId = path.replace('/tools/', '');
    const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
    if (tool) {
      graph.push({
        '@type': 'SoftwareApplication',
        '@id': `${fullUrl}#tool-software`,
        'name': tool.name,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Linux, macOS, Windows',
        'description': tool.description,
        'softwareVersion': tool.version,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      });
    }
  } else if (path.startsWith('/workstations/')) {
    const stationId = path.replace('/workstations/', '');
    const station = workstations.find((w) => w.id === stationId);
    if (station) {
      graph.push({
        '@type': 'SoftwareApplication',
        '@id': `${fullUrl}#workstation-software`,
        'name': station.name,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Linux, macOS, Windows',
        'description': `Sovereign interactive workstation for ${station.name} (${station.band}). Decoupled and rendered natively in Zoth Studio v2.`,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      });
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
