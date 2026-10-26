/**
 * Route → motion-edit intro map.
 *
 * Every route in App.jsx resolves to a rendered clip in /public/intros
 * (`<clip>-desktop.{webm,mp4}` + `<clip>-mobile.{webm,mp4}`). Docs sub-routes and
 * dynamic detail routes reuse their parent product's cut or category-matched cut
 * so the visual identity stays consistent across showcases, docs, and all 62 tools.
 *
 * `accent` drives the handoff seam + HUD chrome colour for that route.
 */
import { microTools } from '../data/toolsData';

export const ACCENTS = {
  gold: '#D4AF37',
  emerald: '#34D399',
  crimson: '#EF4444',
  cyan: '#00F0FF',
  purple: '#C084FC',
  sky: '#38BDF8',
};

// Ordered: first match wins. `match` is tested against location.pathname.
const ROUTES = [
  { match: /^\/$/, clip: 'home', label: 'Zoth Studio', kicker: 'Sovereign AI Workstation', accent: 'gold' },
  { match: /^\/arsenal\/?$/, clip: 'arsenal', label: 'The Sovereign Arsenal', kicker: 'Local AI Micro-Tools', accent: 'gold' },
  { match: /^\/adytum\/docs\/?$/, clip: 'adytum', label: 'Adytum · Docs', kicker: 'Autonomous Loop Architecture', accent: 'gold' },
  { match: /^\/adytum\/?$/, clip: 'adytum', label: 'Adytum Chamber', kicker: 'Autonomous Loop Engine', accent: 'gold' },
  { match: /^\/swarm\/docs\/?$/, clip: 'swarm', label: 'Swarm · Docs', kicker: 'Multi-Agent Protocol', accent: 'emerald' },
  { match: /^\/swarm\/?$/, clip: 'swarm', label: 'Pantheon Swarm', kicker: 'Multi-Agent Orchestration', accent: 'emerald' },
  { match: /^\/agora\/?$/, clip: 'consensus', label: 'The Agora', kicker: 'Autonomous Agent Forum', accent: 'gold' },
  { match: /^\/voice\/?$/, clip: 'bridges', label: 'Voice Station', kicker: 'Neural Speech & Audio', accent: 'gold' },
  { match: /^\/bridges\/?$/, clip: 'bridges', label: 'Command Bridges', kicker: 'Cross-Node Telemetry', accent: 'gold' },
  { match: /^\/tools\/[^/]+\/?$/, clip: 'tools', label: 'Tool Workspace', kicker: 'In-Browser Compute', accent: 'gold', dynamic: 'toolId' },
  { match: /^\/tools\/?$/, clip: 'tools', label: 'Sovereign Tools', kicker: 'In-Browser Compute', accent: 'gold' },
  { match: /^\/workstations(\/.*)?$/, clip: 'workstations', label: 'Workstations', kicker: 'Dedicated AI Decks', accent: 'gold' },
  { match: /^\/memory\/docs\/?$/, clip: 'memory', label: 'Memory · Docs', kicker: 'Synaptic Graph Specification', accent: 'purple' },
  { match: /^\/memory\/?$/, clip: 'memory', label: 'Neuro Memory', kicker: 'Persistent Synaptic Graph', accent: 'purple' },
  { match: /^\/consensus\/?$/, clip: 'consensus', label: 'Byzantine Consensus', kicker: 'Multi-Model Verification', accent: 'cyan' },
  { match: /^\/webgen\/docs\/?$/, clip: 'webgen', label: 'Zoth Bolt · Docs', kicker: 'Zoth Bolt Engine Reference', accent: 'sky' },
  { match: /^\/webgen\/?$/, clip: 'webgen', label: 'Zoth Bolt', kicker: 'Full-Stack AI & Motion Architect', accent: 'sky' },
  { match: /^\/hexstrike\/docs\/?$/, clip: 'hexstrike', label: 'HexStrike · Docs', kicker: 'Offensive Security Manual', accent: 'crimson' },
  { match: /^\/hexstrike\/?$/, clip: 'hexstrike', label: 'HexStrike AI', kicker: 'Offensive Security Suite', accent: 'crimson' },
  { match: /^\/zoth-os\/docs\/?$/, clip: 'zoth-os', label: 'ZothOS · Docs', kicker: 'System & ISO Architecture', accent: 'gold' },
  { match: /^\/zoth-os\/?$/, clip: 'zoth-os', label: 'ZothOS Linux', kicker: 'Bootable Sovereign AI Distro', accent: 'gold' },
  { match: /^\/docs\/math\/[^/]+\/?$/, clip: 'docs-math', label: 'Math Pillar', kicker: 'Formal Mathematical Proof', accent: 'gold', dynamic: 'pillarId' },
  { match: /^\/docs\/math\/?$/, clip: 'docs-math', label: 'Six Math Pillars', kicker: 'Formal Foundations', accent: 'gold' },
  { match: /^\/docs\/?$/, clip: 'docs', label: 'Documentation', kicker: 'System Specifications', accent: 'gold' },
  { match: /^\/faqs\/?$/, clip: 'faqs', label: 'Studio FAQs', kicker: 'Architecture & Licensing', accent: 'gold' },
  { match: /^\/gallery\/?$/, clip: 'home', label: 'Studio Gallery', kicker: 'Visual Artifacts & Reels', accent: 'gold' },
  { match: /^\/ax\/docs\/?$/, clip: 'ax', label: 'AX · Docs', kicker: 'Agent Experience Standard', accent: 'cyan' },
  { match: /^\/ax\/?$/, clip: 'ax', label: 'AX Protocol', kicker: 'Agent Experience Standard', accent: 'cyan' },
];

// These cuts currently end on a mislabelled title card ("The Sovereign Arsenal"
// copy-pasted from the arsenal render). Until they are re-rendered we hand off
// at the start of the white ramp so the wrong card is never shown.
const EARLY_HANDOFF_CLIPS = new Set(['bridges', 'consensus', 'workstations']);
const DEFAULT_HANDOFF_LEAD_S = 0.62;
const EARLY_HANDOFF_LEAD_S = 1.55;

export const INTRO_CLIPS = Array.from(new Set(ROUTES.map((r) => r.clip)));

function prettifySlug(slug) {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveToolCategoryStyle(tool) {
  if (!tool) return { clip: 'tools', accentKey: 'gold' };
  if (tool.id === 'zoth-os') return { clip: 'zoth-os', accentKey: 'gold' };
  const cat = (tool.category || '').toLowerCase();
  if (cat.includes('security') || cat.includes('recon') || cat.includes('opsec') || cat.includes('enclave')) {
    return { clip: 'hexstrike', accentKey: 'crimson' };
  }
  if (cat.includes('memory') || cat.includes('brain')) {
    return { clip: 'memory', accentKey: 'purple' };
  }
  if (cat.includes('swarm') || cat.includes('core')) {
    return { clip: 'swarm', accentKey: 'emerald' };
  }
  if (cat.includes('web') || cat.includes('growth') || cat.includes('seo')) {
    return { clip: 'webgen', accentKey: 'sky' };
  }
  if (cat.includes('ai') || cat.includes('knowledge')) {
    return { clip: 'consensus', accentKey: 'cyan' };
  }
  if (cat.includes('planning')) {
    return { clip: 'adytum', accentKey: 'gold' };
  }
  if (cat.includes('voice') || cat.includes('commerce') || cat.includes('pod') || cat.includes('mcp')) {
    return { clip: 'bridges', accentKey: 'emerald' };
  }
  return { clip: 'tools', accentKey: 'gold' };
}

/** Resolve the intro config for a pathname. Returns null for unknown routes. */
export function resolveRouteIntro(pathname) {
  const path = pathname || '/';
  const idx = ROUTES.findIndex((r) => r.match.test(path));
  if (idx === -1) return null;
  const route = ROUTES[idx];
  let label = route.label;
  let kicker = route.kicker || 'Sovereign AI Workstation';
  let clip = route.clip;
  let accentKey = route.accent;

  if (route.dynamic === 'toolId') {
    const slug = path.replace(/\/$/, '').split('/').pop();
    const matchedTool = microTools.find((t) => t.id === slug || t.repo === slug);
    if (matchedTool) {
      label = matchedTool.name;
      const portTag = matchedTool.localPort ? ` · :${matchedTool.localPort}` : '';
      kicker = `${matchedTool.category} · v${matchedTool.version || '2.5.0'}${portTag}`;
      const style = resolveToolCategoryStyle(matchedTool);
      clip = style.clip;
      accentKey = style.accentKey;
    } else if (slug) {
      label = `${route.label} · ${prettifySlug(slug)}`;
    }
  } else if (route.dynamic) {
    const slug = path.replace(/\/$/, '').split('/').pop();
    if (slug) label = `${route.label} · ${prettifySlug(slug)}`;
  }

  return {
    key: path.replace(/\/$/, '') || '/',
    clip,
    label,
    kicker,
    index: String(Math.max(1, INTRO_CLIPS.indexOf(clip) + 1)).padStart(2, '0'),
    total: String(INTRO_CLIPS.length).padStart(2, '0'),
    accent: ACCENTS[accentKey] || ACCENTS.gold,
    handoffLead: EARLY_HANDOFF_CLIPS.has(clip) ? EARLY_HANDOFF_LEAD_S : DEFAULT_HANDOFF_LEAD_S,
  };
}

export function clipSources(clip, cut) {
  return [
    { src: `/intros/${clip}-${cut}.webm`, type: 'video/webm' },
    { src: `/intros/${clip}-${cut}.mp4`, type: 'video/mp4' },
  ];
}
