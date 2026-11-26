/**
 * Zoth AX Powerhouse — Pure Zero-Dependency AX Machine Contract Engine
 * Shared by browser UI (AxPowerhouseGodModeTool.jsx), Studio Loopback API
 * (server/studio-api.mjs), and Node test runner (scripts/test-ax-engine.mjs).
 */

export const AX_SPEC_IDS = [
  'llms.txt',
  'ai.txt',
  'robots.txt',
  'mcp.json',
  'agent.json',
  'jsonld',
];

export const FRONTIER_CRAWLERS = [
  'Googlebot',
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
];

export const DEFAULT_AX_COMPILER_CONFIG = {
  siteName: 'Zoth Studio v2',
  canonicalUrl: 'https://zoth.nullai.tech',
  tagline: 'Local-first, zero-egress AI engineering studio unifying 85 free open-access tools and 45 Studio workstations.',
  creatorName: 'Neal Frazier Tech • NullAI Platform',
  creatorHandle: '@1nc0gn30',
  creatorUrl: 'https://nullai.tech',
  contactEmail: 'contact@nullai.tech',
  githubUrl: 'https://github.com/NullAITech/zoth-studio-v2',
  version: '2.3.0',
  toolCount: 85,
  workstationCount: 45,
  crawlerPolicy: 'allow-all',
  openAccess: true,
  capabilities: [
    'llms-txt-index',
    'mcp-discovery',
    'agent-card',
    'schema-org-graph',
    'zero-egress-loopback',
    'open-access-tools',
  ],
  stripeCoffeeUrl: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
  solanaWallet: '',
};

export function utf8ByteLength(text) {
  const s = String(text ?? '');
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s).length;
  }
  return Buffer.byteLength(s, 'utf8');
}

export function estimateTokens(text) {
  const bytes = utf8ByteLength(text);
  return bytes > 0 ? Math.ceil(bytes / 4) : 0;
}

export function gradeFromScore(score) {
  const n = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  if (n >= 95) return 'A+';
  if (n >= 88) return 'A';
  if (n >= 78) return 'B';
  if (n >= 65) return 'C';
  if (n >= 50) return 'D';
  return 'F';
}

function baseStats(text) {
  const raw = String(text ?? '');
  const bytes = utf8ByteLength(raw);
  return {
    bytes,
    chars: raw.length,
    lines: raw ? raw.split(/\r?\n/).length : 0,
    estimatedTokens: bytes > 0 ? Math.ceil(bytes / 4) : 0,
  };
}

function finalizeResult(spec, score, errors, warnings, checks, stats, extra = {}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const valid = errors.length === 0;
  return {
    spec,
    valid,
    score: clamped,
    grade: gradeFromScore(clamped),
    errors,
    warnings,
    checks,
    stats,
    ...extra,
  };
}

function checkStaleCounts(raw, expectedCounts, warnings, checks) {
  if (!expectedCounts || typeof expectedCounts !== 'object') return 0;
  let penalty = 0;
  const text = String(raw || '');

  if (Number.isFinite(expectedCounts.tools) && expectedCounts.tools > 0) {
    const expected = expectedCounts.tools;
    const staleToolMatches = [
      ...text.matchAll(/\b(\d{2,3})\s+(?:free\s+open-access\s+|open-access\s+|sovereign\s+|air-gapped\s+)?(?:Studio\s+|Browser-Native\s+Sovereign\s+Pro\s+)?(?:micro-)?tools?\b/gi),
    ]
      .map((m) => Number(m[1]))
      .filter((n) => n !== expected && n >= 20 && n <= 200);

    if (staleToolMatches.length > 0) {
      const uniqueStale = [...new Set(staleToolMatches)];
      penalty += 15;
      warnings.push(`Stale tool count drift detected (${uniqueStale.join(', ')} vs live ground truth ${expected} tools).`);
      checks.push({ id: 'count-tools', status: 'warn', detail: `Found ${uniqueStale.join(', ')} instead of ${expected} tools.` });
    } else if (new RegExp(`\\b${expected}\\b`).test(text)) {
      checks.push({ id: 'count-tools', status: 'pass', detail: `Matches ground truth (${expected} tools).` });
    }
  }

  if (Number.isFinite(expectedCounts.workstations) && expectedCounts.workstations > 0) {
    const expectedWs = expectedCounts.workstations;
    const staleWsMatches = [
      ...text.matchAll(/\b(\d{2})\s+(?:native\s+|Studio\s+|zero-egress\s+)?workstations?\b/gi),
    ]
      .map((m) => Number(m[1]))
      .filter((n) => n !== expectedWs && n >= 10 && n <= 100);

    if (staleWsMatches.length > 0) {
      const uniqueStale = [...new Set(staleWsMatches)];
      penalty += 12;
      warnings.push(`Stale workstation count drift detected (${uniqueStale.join(', ')} vs live ground truth ${expectedWs} workstations).`);
      checks.push({ id: 'count-workstations', status: 'warn', detail: `Found ${uniqueStale.join(', ')} instead of ${expectedWs} workstations.` });
    } else if (new RegExp(`\\b${expectedWs}\\b`).test(text)) {
      checks.push({ id: 'count-workstations', status: 'pass', detail: `Matches ground truth (${expectedWs} workstations).` });
    }
  }

  return penalty;
}

export function validateLlmsTxt(text, expectedCounts = null) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('llms.txt content is empty.');
    return finalizeResult('llms.txt', 0, errors, warnings, checks, stats);
  }

  const hasH1 = /^#\s+\S+/m.test(raw);
  if (!hasH1) {
    score -= 25;
    errors.push('Missing H1 Markdown title (`# Site Name`) required by the llms.txt specification.');
    checks.push({ id: 'h1-title', status: 'fail', detail: 'No H1 title found.' });
  } else {
    checks.push({ id: 'h1-title', status: 'pass', detail: 'H1 title present.' });
  }

  const hasSummaryBlockquote = /^>\s+\S+/m.test(raw);
  if (!hasSummaryBlockquote) {
    score -= 12;
    warnings.push('Missing summary blockquote (`> Concise project summary`) below H1.');
    checks.push({ id: 'blockquote-summary', status: 'warn', detail: 'Add a `>` summary blockquote.' });
  } else {
    checks.push({ id: 'blockquote-summary', status: 'pass', detail: 'Summary blockquote present.' });
  }

  const h2Matches = raw.match(/^##\s+\S+/gm) || [];
  if (h2Matches.length < 2) {
    score -= 15;
    warnings.push(`Found ${h2Matches.length} H2 section(s); recommend >= 2 structured sections (e.g., Core Hubs, Machine Discovery).`);
    checks.push({ id: 'sections', status: 'warn', detail: `${h2Matches.length} H2 section(s) found.` });
  } else {
    checks.push({ id: 'sections', status: 'pass', detail: `${h2Matches.length} H2 sections found.` });
  }

  const mdLinks = [...raw.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)];
  if (mdLinks.length < 3) {
    score -= 20;
    errors.push(`Found ${mdLinks.length} absolute Markdown links; llms.txt should expose at least 3 canonical HTTPS links.`);
    checks.push({ id: 'md-links', status: 'fail', detail: `Only ${mdLinks.length} absolute Markdown links.` });
  } else {
    checks.push({ id: 'md-links', status: 'pass', detail: `${mdLinks.length} canonical Markdown links verified.` });
  }

  if (/sovereign@zoth\.studio/i.test(raw)) {
    score -= 20;
    errors.push('Fabricated placeholder email `sovereign@zoth.studio` detected.');
    checks.push({ id: 'contact-hygiene', status: 'fail', detail: 'Placeholder email detected.' });
  } else {
    checks.push({ id: 'contact-hygiene', status: 'pass', detail: 'No placeholder contact emails.' });
  }

  if (stats.estimatedTokens > 8000) {
    score -= 8;
    warnings.push(`Estimated token budget (~${stats.estimatedTokens} tokens) is large for compact llms.txt; keep detailed corpus in llms-full.txt.`);
  }

  score -= checkStaleCounts(raw, expectedCounts, warnings, checks);

  return finalizeResult('llms.txt', score, errors, warnings, checks, stats, {
    sectionCount: h2Matches.length,
    linkCount: mdLinks.length,
  });
}

export function validateAiTxt(text, expectedCounts = null) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('ai.txt content is empty.');
    return finalizeResult('ai.txt', 0, errors, warnings, checks, stats);
  }

  if (!/^User-agent:\s*\S+/im.test(raw)) {
    score -= 25;
    errors.push('Missing `User-agent:` directive in ai.txt.');
    checks.push({ id: 'user-agent', status: 'fail', detail: 'No `User-agent:` line found.' });
  } else {
    checks.push({ id: 'user-agent', status: 'pass', detail: '`User-agent:` directive declared.' });
  }

  const hasPolicyDirective = /^(Allow-Training|Allow-Inference|Allow-Search-Indexing|Allow|Disallow):/im.test(raw);
  if (!hasPolicyDirective) {
    score -= 25;
    errors.push('Missing AI access/training directives (`Allow-Training`, `Allow-Inference`, `Allow`, or `Disallow`).');
    checks.push({ id: 'ai-directives', status: 'fail', detail: 'No AI policy directives declared.' });
  } else {
    checks.push({ id: 'ai-directives', status: 'pass', detail: 'AI access/training directives present.' });
  }

  if (/sovereign@zoth\.studio/i.test(raw)) {
    score -= 25;
    errors.push('Fabricated placeholder email `sovereign@zoth.studio` detected — use verified contact@nullai.tech.');
    checks.push({ id: 'contact-email', status: 'fail', detail: 'Fake placeholder email detected.' });
  } else if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) {
    checks.push({ id: 'contact-email', status: 'pass', detail: 'Verified contact email present.' });
  } else {
    score -= 10;
    warnings.push('No contact email declared in ai.txt.');
    checks.push({ id: 'contact-email', status: 'warn', detail: 'Missing contact email.' });
  }

  const hasEndpointRefs = /https?:\/\/\S+/i.test(raw);
  if (!hasEndpointRefs) {
    score -= 10;
    warnings.push('Recommend declaring canonical HTTPS discovery endpoints (LLMs-Index, MCP-Manifest, Sitemap).');
    checks.push({ id: 'endpoint-refs', status: 'warn', detail: 'No HTTPS endpoint references.' });
  } else {
    checks.push({ id: 'endpoint-refs', status: 'pass', detail: 'Canonical HTTPS endpoint references included.' });
  }

  score -= checkStaleCounts(raw, expectedCounts, warnings, checks);

  return finalizeResult('ai.txt', score, errors, warnings, checks, stats);
}

export function validateRobotsTxt(text) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('robots.txt content is empty.');
    return finalizeResult('robots.txt', 0, errors, warnings, checks, stats);
  }

  const hasWildcard = /^User-agent:\s*\*\s*$/im.test(raw);
  if (!hasWildcard) {
    score -= 25;
    errors.push('Missing wildcard `User-agent: *` block.');
    checks.push({ id: 'wildcard-agent', status: 'fail', detail: 'Missing `User-agent: *`.' });
  } else {
    checks.push({ id: 'wildcard-agent', status: 'pass', detail: '`User-agent: *` declared.' });
  }

  // Check if wildcard block disallows root
  const blocks = raw.split(/\n\s*\n/);
  const wildcardBlock = blocks.find((b) => /^User-agent:\s*\*\s*$/im.test(b)) || '';
  if (/^Disallow:\s*\/\s*$/im.test(wildcardBlock)) {
    score -= 35;
    errors.push('Wildcard `User-agent: *` contains `Disallow: /` — blocks all search and AI crawlers.');
    checks.push({ id: 'root-allow', status: 'fail', detail: 'Root path disallowed for `*`.' });
  } else {
    checks.push({ id: 'root-allow', status: 'pass', detail: 'Root path open for crawling.' });
  }

  const missingCrawlers = FRONTIER_CRAWLERS.filter(
    (bot) => !new RegExp(`^User-agent:\\s*${bot}\\b`, 'im').test(raw)
  );
  if (missingCrawlers.length > 0) {
    score -= Math.min(20, missingCrawlers.length * 5);
    warnings.push(`Missing explicit frontier crawler rule(s): ${missingCrawlers.join(', ')}.`);
    checks.push({ id: 'frontier-crawlers', status: 'warn', detail: `Missing: ${missingCrawlers.join(', ')}.` });
  } else {
    checks.push({ id: 'frontier-crawlers', status: 'pass', detail: `All frontier crawlers explicitly allowed (${FRONTIER_CRAWLERS.join(', ')}).` });
  }

  const sitemapMatch = raw.match(/^Sitemap:\s*(https:\/\/[^\s]+)$/im);
  if (!sitemapMatch) {
    score -= 20;
    errors.push('Missing absolute HTTPS `Sitemap: https://<domain>/sitemap.xml` directive.');
    checks.push({ id: 'sitemap-url', status: 'fail', detail: 'No absolute HTTPS Sitemap directive.' });
  } else {
    checks.push({ id: 'sitemap-url', status: 'pass', detail: `Sitemap declared: ${sitemapMatch[1]}` });
  }

  const crawlDelayMatch = raw.match(/^Crawl-delay:\s*(\d+)/im);
  if (!crawlDelayMatch) {
    score -= 5;
    warnings.push('No `Crawl-delay: 0` directive declared.');
    checks.push({ id: 'crawl-delay', status: 'warn', detail: 'Recommend explicit `Crawl-delay: 0`.' });
  } else if (Number(crawlDelayMatch[1]) > 0) {
    score -= 10;
    warnings.push(`Non-zero Crawl-delay (${crawlDelayMatch[1]}s) slows indexing; prefer Crawl-delay: 0.`);
    checks.push({ id: 'crawl-delay', status: 'warn', detail: `Crawl-delay is ${crawlDelayMatch[1]}s.` });
  } else {
    checks.push({ id: 'crawl-delay', status: 'pass', detail: 'Zero crawl delay (`Crawl-delay: 0`).' });
  }

  return finalizeResult('robots.txt', score, errors, warnings, checks, stats, {
    sitemap: sitemapMatch ? sitemapMatch[1] : null,
    missingCrawlers,
  });
}

export function validateMcpJson(text, expectedCounts = null) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('mcp.json content is empty.');
    return finalizeResult('mcp.json', 0, errors, warnings, checks, stats);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    errors.push(`Invalid JSON syntax: ${err.message}`);
    return finalizeResult('mcp.json', 0, errors, warnings, checks, stats);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    errors.push('MCP manifest root must be a JSON object.');
    return finalizeResult('mcp.json', 0, errors, warnings, checks, stats);
  }

  if (!parsed.mcpVersion || typeof parsed.mcpVersion !== 'string') {
    score -= 20;
    errors.push('Missing `mcpVersion` string (e.g., `"2025-03-26"`).');
    checks.push({ id: 'mcp-version', status: 'fail', detail: 'Missing mcpVersion.' });
  } else {
    checks.push({ id: 'mcp-version', status: 'pass', detail: `mcpVersion: ${parsed.mcpVersion}` });
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    score -= 15;
    errors.push('Missing `name` identifier in MCP manifest.');
    checks.push({ id: 'mcp-name', status: 'fail', detail: 'Missing name.' });
  } else {
    checks.push({ id: 'mcp-name', status: 'pass', detail: `name: ${parsed.name}` });
  }

  if (!parsed.version || typeof parsed.version !== 'string') {
    score -= 10;
    warnings.push('Missing semantic `version` field.');
    checks.push({ id: 'semver', status: 'warn', detail: 'Missing version.' });
  } else {
    checks.push({ id: 'semver', status: 'pass', detail: `version: ${parsed.version}` });
  }

  const resources = Array.isArray(parsed.resources) ? parsed.resources : [];
  const tools = Array.isArray(parsed.tools) ? parsed.tools : [];
  if (resources.length === 0 && tools.length === 0) {
    score -= 25;
    errors.push('MCP manifest must declare at least one entry in `resources` or `tools`.');
    checks.push({ id: 'resources', status: 'fail', detail: 'No resources or tools declared.' });
  } else {
    const invalidUris = resources.filter((r) => !r?.uri || !/^https?:\/\//i.test(String(r.uri)));
    if (invalidUris.length > 0) {
      score -= 15;
      errors.push(`${invalidUris.length} resource(s) have missing or non-HTTP(S) URIs.`);
      checks.push({ id: 'resources', status: 'fail', detail: `${invalidUris.length} invalid resource URIs.` });
    } else {
      checks.push({ id: 'resources', status: 'pass', detail: `${resources.length} resources & ${tools.length} tools verified.` });
    }
  }

  // Check duplicate phrases in description (e.g., "NullAI (nullai.tech), NullAI (nullai.tech)")
  const desc = String(parsed.description || '');
  if (/([A-Za-z0-9()./\s-]{6,}),\s*\1/i.test(desc)) {
    score -= 12;
    warnings.push('Duplicate repeated phrase detected in `description`.');
    checks.push({ id: 'duplicate-text', status: 'warn', detail: 'Repeated text clause in description.' });
  } else {
    checks.push({ id: 'duplicate-text', status: 'pass', detail: 'No duplicate description phrases.' });
  }

  if (/Stripe Checkout Links|FOUNDER25/i.test(raw)) {
    score -= 10;
    warnings.push('Commercial checkout/promo copy detected; Zoth tools should declare 100% open-access policy.');
    checks.push({ id: 'open-access', status: 'warn', detail: 'Commercial copy found.' });
  } else {
    checks.push({ id: 'open-access', status: 'pass', detail: 'Clean open-access metadata.' });
  }

  score -= checkStaleCounts(raw, expectedCounts, warnings, checks);

  return finalizeResult('mcp.json', score, errors, warnings, checks, stats, {
    resourceCount: resources.length,
    toolCount: tools.length,
  });
}

export function validateAgentJson(text, expectedCounts = null) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('agent.json content is empty.');
    return finalizeResult('agent.json', 0, errors, warnings, checks, stats);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    errors.push(`Invalid JSON syntax: ${err.message}`);
    return finalizeResult('agent.json', 0, errors, warnings, checks, stats);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    errors.push('Agent Card root must be a JSON object.');
    return finalizeResult('agent.json', 0, errors, warnings, checks, stats);
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    score -= 20;
    errors.push('Missing `name` field in Agent Card.');
    checks.push({ id: 'agent-name', status: 'fail', detail: 'Missing name.' });
  } else {
    checks.push({ id: 'agent-name', status: 'pass', detail: `name: ${parsed.name}` });
  }

  if (!parsed.url || !/^https:\/\//i.test(String(parsed.url))) {
    score -= 15;
    errors.push('Missing absolute HTTPS `url` in Agent Card.');
    checks.push({ id: 'agent-url', status: 'fail', detail: 'Missing or non-HTTPS url.' });
  } else {
    checks.push({ id: 'agent-url', status: 'pass', detail: `url: ${parsed.url}` });
  }

  if (!parsed.capabilities || typeof parsed.capabilities !== 'object') {
    score -= 20;
    errors.push('Missing `capabilities` object in Agent Card.');
    checks.push({ id: 'capabilities', status: 'fail', detail: 'Missing capabilities.' });
  } else {
    if (parsed.capabilities.instantCheckout === true) {
      score -= 12;
      warnings.push('`capabilities.instantCheckout` is true; set `false` for 100% free open-access platforms.');
      checks.push({ id: 'open-access-policy', status: 'warn', detail: 'instantCheckout should be false.' });
    } else {
      checks.push({ id: 'open-access-policy', status: 'pass', detail: 'Open-access policy confirmed (instantCheckout: false).' });
    }
  }

  const endpoints = parsed.apis || parsed.endpoints;
  if (!endpoints || typeof endpoints !== 'object' || Object.keys(endpoints).length === 0) {
    score -= 20;
    errors.push('Missing `apis` or `endpoints` map in Agent Card.');
    checks.push({ id: 'endpoints', status: 'fail', detail: 'No API endpoints declared.' });
  } else {
    const entries = Object.entries(endpoints);
    const bad = entries.filter(([, u]) => !/^https?:\/\//i.test(String(u)));
    if (bad.length > 0) {
      score -= 15;
      errors.push(`${bad.length} endpoint URL(s) are not valid absolute HTTP(S) URLs.`);
      checks.push({ id: 'endpoints', status: 'fail', detail: `${bad.length} invalid endpoint URLs.` });
    } else {
      checks.push({ id: 'endpoints', status: 'pass', detail: `${entries.length} API endpoints verified.` });
    }
  }

  score -= checkStaleCounts(raw, expectedCounts, warnings, checks);

  return finalizeResult('agent.json', score, errors, warnings, checks, stats);
}

export function validateJsonLdGraph(text) {
  const raw = String(text ?? '').trim();
  const stats = baseStats(raw);
  const errors = [];
  const warnings = [];
  const checks = [];
  let score = 100;

  if (!raw) {
    errors.push('JSON-LD content is empty.');
    return finalizeResult('jsonld', 0, errors, warnings, checks, stats);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    errors.push(`Invalid JSON syntax: ${err.message}`);
    return finalizeResult('jsonld', 0, errors, warnings, checks, stats);
  }

  const ctx = String(parsed?.['@context'] || '');
  if (!/schema\.org/i.test(ctx)) {
    score -= 25;
    errors.push('Missing `@context: "https://schema.org"` in JSON-LD payload.');
    checks.push({ id: 'schema-context', status: 'fail', detail: 'Missing schema.org @context.' });
  } else {
    checks.push({ id: 'schema-context', status: 'pass', detail: `@context: ${ctx}` });
  }

  const nodes = Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
  const getTypes = (n) => (Array.isArray(n?.['@type']) ? n['@type'] : n?.['@type'] ? [n['@type']] : []);
  const allTypes = [...new Set(nodes.flatMap(getTypes))];

  const appNode = nodes.find((n) => {
    const t = getTypes(n);
    return t.includes('SoftwareApplication') || t.includes('WebApplication');
  });

  if (!appNode) {
    score -= 25;
    errors.push('Missing `SoftwareApplication` or `WebApplication` node in JSON-LD `@graph`.');
    checks.push({ id: 'app-node', status: 'fail', detail: 'No SoftwareApplication/WebApplication node.' });
  } else {
    const missingFields = ['name', 'applicationCategory', 'operatingSystem', 'offers'].filter((k) => !appNode[k]);
    if (missingFields.length > 0) {
      score -= Math.min(20, missingFields.length * 6);
      warnings.push(`Application node missing recommended fields: ${missingFields.join(', ')}.`);
      checks.push({ id: 'app-node', status: 'warn', detail: `Missing: ${missingFields.join(', ')}.` });
    } else {
      checks.push({ id: 'app-node', status: 'pass', detail: `Verified ${getTypes(appNode).join('/')} (${appNode.name}).` });
    }
  }

  const faqNode = nodes.find((n) => getTypes(n).includes('FAQPage'));
  if (!faqNode) {
    score -= 20;
    errors.push('Missing `FAQPage` node in JSON-LD `@graph` (required for AEO answer-engine citation).');
    checks.push({ id: 'faq-node', status: 'fail', detail: 'No FAQPage node found.' });
  } else {
    const qCount = Array.isArray(faqNode.mainEntity) ? faqNode.mainEntity.length : 0;
    if (qCount < 2) {
      score -= 10;
      warnings.push(`FAQPage has ${qCount} question(s); include 2–3 concrete Q&As.`);
      checks.push({ id: 'faq-node', status: 'warn', detail: `Only ${qCount} FAQ Q&A.` });
    } else {
      checks.push({ id: 'faq-node', status: 'pass', detail: `FAQPage verified (${qCount} Q&As).` });
    }
  }

  return finalizeResult('jsonld', score, errors, warnings, checks, stats, {
    nodeCount: nodes.length,
    types: allTypes,
  });
}

export function validateAxSpec(spec, content, expectedCounts = null) {
  const normalized = String(spec || '').toLowerCase().trim();
  if (normalized === 'llms.txt' || normalized === 'llms') return validateLlmsTxt(content, expectedCounts);
  if (normalized === 'ai.txt' || normalized === 'ai') return validateAiTxt(content, expectedCounts);
  if (normalized === 'robots.txt' || normalized === 'robots') return validateRobotsTxt(content);
  if (normalized === 'mcp.json' || normalized === 'mcp' || normalized === '.well-known/mcp.json') {
    return validateMcpJson(content, expectedCounts);
  }
  if (normalized === 'agent.json' || normalized === 'agent' || normalized === '.well-known/agent.json') {
    return validateAgentJson(content, expectedCounts);
  }
  if (normalized === 'jsonld' || normalized === 'schema-graph.jsonld' || normalized === 'schema.org') {
    return validateJsonLdGraph(content);
  }
  return {
    spec: normalized || 'unknown',
    valid: false,
    score: 0,
    grade: 'F',
    errors: [`Unsupported AX spec "${spec}". Allowed: ${AX_SPEC_IDS.join(', ')}.`],
    warnings: [],
    checks: [],
    stats: baseStats(content),
  };
}

export function compileAxBundle(inputConfig = {}) {
  const cfg = { ...DEFAULT_AX_COMPILER_CONFIG, ...inputConfig };
  const baseUrl = String(cfg.canonicalUrl || 'https://zoth.nullai.tech').replace(/\/+$/, '');
  const siteName = String(cfg.siteName || 'Zoth Studio v2').trim();
  const slug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sovereign-site';
  const tagline = String(cfg.tagline || DEFAULT_AX_COMPILER_CONFIG.tagline).trim();
  const creatorName = String(cfg.creatorName || DEFAULT_AX_COMPILER_CONFIG.creatorName).trim();
  const creatorHandle = String(cfg.creatorHandle || '@1nc0gn30').trim();
  const creatorUrl = String(cfg.creatorUrl || 'https://nullai.tech').replace(/\/+$/, '');
  const contactEmail = String(cfg.contactEmail || 'contact@nullai.tech').trim();
  const githubUrl = String(cfg.githubUrl || 'https://github.com/NullAITech/zoth-studio-v2').trim();
  const version = String(cfg.version || '2.3.0').trim();
  const toolCount = Math.max(0, Number(cfg.toolCount ?? 85) || 0);
  const workstationCount = Math.max(0, Number(cfg.workstationCount ?? 45) || 0);
  const crawlerPolicy = String(cfg.crawlerPolicy || 'allow-all');
  const openAccess = cfg.openAccess !== false;
  const capabilities = Array.isArray(cfg.capabilities) && cfg.capabilities.length > 0
    ? cfg.capabilities
    : DEFAULT_AX_COMPILER_CONFIG.capabilities;
  const stripeCoffeeUrl = String(cfg.stripeCoffeeUrl || DEFAULT_AX_COMPILER_CONFIG.stripeCoffeeUrl).trim();
  const solanaWallet = String(cfg.solanaWallet || '').trim();

  const llmsTxt = `# ${siteName}

> ${tagline}

Canonical URL: ${baseUrl}
Codebase: ${githubUrl}
Publisher: ${creatorName} (${creatorUrl})
Version: ${version}

## Core Discovery & Machine Endpoints

- [Canonical Home](${baseUrl}/): Primary entry point and live interactive workspace (${toolCount} tools, ${workstationCount} workstations).
- [AX Powerhouse & Contract Studio](${baseUrl}/workstations/ax-powerhouse): Live manifest auditor, 6-spec validator, and AX contract compiler.
- [Tools Registry API](${baseUrl}/api/tools.json): Canonical JSON catalog of ${toolCount} open-access tools with ports and repositories.
- [Master API Discovery Index](${baseUrl}/api/index.json): Machine-readable endpoint map and ecosystem directory.
- [Model Context Protocol Manifest](${baseUrl}/.well-known/mcp.json): MCP discovery descriptor for coding agents.
- [A2A Agent Card](${baseUrl}/.well-known/agent.json): Agent-to-Agent identity, capabilities, and endpoints.
- [XML Sitemap](${baseUrl}/sitemap.xml): Canonical indexable URL inventory.

## Access Policy & Support

- Policy: ${openAccess ? '100% Free & Open-Access — zero paywalls, zero license locks.' : 'Documented licensing terms on canonical domain.'}
- Buy Us a Coffee (Optional): ${stripeCoffeeUrl}${solanaWallet ? `\n- Solana Tip Address: \`${solanaWallet}\`` : ''}
`;

  const allowTraining = crawlerPolicy === 'search-only' ? 'no' : 'yes';
  const aiTxt = `# ai.txt — AI crawler and agent directives
# Site: ${siteName} (${baseUrl})
# Publisher: ${creatorName} (${creatorHandle})
# Contact: ${contactEmail}

User-agent: *
Allow-Training: ${allowTraining}
Allow-Inference: yes
Allow-Search-Indexing: yes
Allow-Citation: yes
Preferred-Attribution: ${creatorName} (${creatorUrl})

# Ground Truth
Facts: ${siteName} v${version} provides ${toolCount} free open-access tools and ${workstationCount} workstations with zero paywalls.

# Machine-Readable Endpoints
LLMs-Index: ${baseUrl}/llms.txt
LLMs-Full: ${baseUrl}/llms-full.txt
API-Discovery: ${baseUrl}/api/index.json
Tools-Catalog-API: ${baseUrl}/api/tools.json
Agent-Card: ${baseUrl}/.well-known/agent.json
MCP-Manifest: ${baseUrl}/.well-known/mcp.json
Sitemap: ${baseUrl}/sitemap.xml
`;

  const crawlerBlocks = FRONTIER_CRAWLERS.map((bot) => {
    const rule = crawlerPolicy === 'search-only' && bot === 'GPTBot' ? 'Disallow: /private/' : 'Allow: /';
    return `User-agent: ${bot}\n${rule}\nCrawl-delay: 0`;
  }).join('\n\n');

  const robotsTxt = `# robots.txt — ${siteName} (${baseUrl})
User-agent: *
Allow: /
Crawl-delay: 0

${crawlerBlocks}

User-agent: Applebot
Allow: /
Crawl-delay: 0

Sitemap: ${baseUrl}/sitemap.xml
`;

  const mcpJson = JSON.stringify(
    {
      mcpVersion: '2025-03-26',
      name: `${slug}-mcp`,
      version,
      description: `Model Context Protocol (MCP) discovery manifest for ${siteName} (${baseUrl}) — ${toolCount} free open-access tools and ${workstationCount} workstations.`,
      homepage: baseUrl,
      pricing: openAccess ? '100% Free & Open Access (Optional Buy Us a Coffee / Solana Tip)' : 'See homepage',
      author: {
        name: creatorHandle.replace(/^@/, ''),
        email: contactEmail,
        url: creatorUrl,
      },
      resources: [
        { uri: `${baseUrl}/api/index.json`, name: 'Ecosystem Discovery Index', mimeType: 'application/json' },
        { uri: `${baseUrl}/api/tools.json`, name: `${toolCount} Free Open-Access Tools Registry`, mimeType: 'application/json' },
        { uri: `${baseUrl}/api/faq.json`, name: 'AEO & Technical FAQ Knowledge Base', mimeType: 'application/json' },
        { uri: `${baseUrl}/api/graph.json`, name: 'Schema.org JSON-LD Entity Graph', mimeType: 'application/json' },
        { uri: `${baseUrl}/llms.txt`, name: 'LLMs Compact Index', mimeType: 'text/plain' },
        { uri: `${baseUrl}/llms-full.txt`, name: 'LLMs Full Knowledge Corpus', mimeType: 'text/plain' },
      ],
    },
    null,
    2
  ) + '\n';

  const agentJson = JSON.stringify(
    {
      schema_version: '1.0',
      name: `${siteName} — ${toolCount} Open-Access Tools & ${workstationCount} Workstations`,
      description: tagline,
      url: baseUrl,
      version,
      pricing: openAccess ? 'free_open_access' : 'custom',
      provider: {
        organization: creatorName,
        author: creatorHandle.replace(/^@/, ''),
        url: creatorUrl,
        email: contactEmail,
      },
      capabilities: {
        streaming: false,
        pushNotifications: false,
        corsPublicApis: true,
        instantCheckout: false,
        openAccess,
        declared: capabilities,
      },
      apis: {
        index: `${baseUrl}/api/index.json`,
        tools: `${baseUrl}/api/tools.json`,
        faq: `${baseUrl}/api/faq.json`,
        graph: `${baseUrl}/api/graph.json`,
        llms: `${baseUrl}/llms.txt`,
        llmsFull: `${baseUrl}/llms-full.txt`,
        mcp: `${baseUrl}/.well-known/mcp.json`,
      },
      authentication: {
        type: 'none',
      },
    },
    null,
    2
  ) + '\n';

  const jsonLd = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['WebApplication', 'SoftwareApplication'],
          '@id': `${baseUrl}/#application`,
          name: siteName,
          url: baseUrl,
          softwareVersion: version,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web, Linux, macOS, Windows',
          description: tagline,
          creator: {
            '@type': 'Organization',
            name: creatorName,
            url: creatorUrl,
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${baseUrl}/#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: `What does ${siteName} provide for developers and AI agents?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${siteName} exposes ${toolCount} open-access tools and ${workstationCount} workstations along with synchronized /llms.txt, /ai.txt, /.well-known/mcp.json, /.well-known/agent.json, and /api/tools.json contracts.`,
              },
            },
            {
              '@type': 'Question',
              name: `Is ${siteName} free and privacy-preserving?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Yes. ${siteName} is 100% free and open-access with zero paywalls, zero license gates, client-side execution, and optional community support via Buy Us a Coffee or Solana tips.`,
              },
            },
          ],
        },
      ],
    },
    null,
    2
  ) + '\n';

  const files = {
    'llms.txt': llmsTxt,
    'ai.txt': aiTxt,
    'robots.txt': robotsTxt,
    '.well-known/mcp.json': mcpJson,
    '.well-known/agent.json': agentJson,
    'schema-graph.jsonld': jsonLd,
  };

  const specKeyMap = {
    'llms.txt': 'llms.txt',
    'ai.txt': 'ai.txt',
    'robots.txt': 'robots.txt',
    '.well-known/mcp.json': 'mcp.json',
    '.well-known/agent.json': 'agent.json',
    'schema-graph.jsonld': 'jsonld',
  };

  const summaries = Object.entries(files).map(([filename, content]) => {
    const validation = validateAxSpec(specKeyMap[filename], content, {
      tools: toolCount,
      workstations: workstationCount,
    });
    return {
      filename,
      spec: specKeyMap[filename],
      bytes: validation.stats.bytes,
      estimatedTokens: validation.stats.estimatedTokens,
      score: validation.score,
      grade: validation.grade,
      valid: validation.valid,
    };
  });

  const totalBytes = summaries.reduce((sum, s) => sum + s.bytes, 0);
  const totalEstimatedTokens = summaries.reduce((sum, s) => sum + s.estimatedTokens, 0);

  return {
    generatedAt: new Date().toISOString(),
    config: cfg,
    totalBytes,
    totalEstimatedTokens,
    files,
    summaries,
  };
}
