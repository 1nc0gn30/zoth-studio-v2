/**
 * Route → motion-edit intro map.
 *
 * Every route in App.jsx resolves to exactly one rendered clip in /public/intros
 * (`<clip>-desktop.{webm,mp4}` + `<clip>-mobile.{webm,mp4}`). Docs sub-routes and
 * dynamic detail routes reuse their parent product's cut so the visual identity
 * of a product stays consistent across its showcase and its docs.
 *
 * `accent` drives the handoff seam + HUD chrome colour for that route.
 */

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
  { match: /^\/$/, clip: 'home', label: 'Studio', accent: 'gold' },
  { match: /^\/arsenal\/?$/, clip: 'arsenal', label: 'Arsenal', accent: 'gold' },
  { match: /^\/adytum\/docs\/?$/, clip: 'adytum', label: 'Adytum · Docs', accent: 'gold' },
  { match: /^\/adytum\/?$/, clip: 'adytum', label: 'Adytum', accent: 'gold' },
  { match: /^\/swarm\/docs\/?$/, clip: 'swarm', label: 'Swarm · Docs', accent: 'emerald' },
  { match: /^\/swarm\/?$/, clip: 'swarm', label: 'Swarm', accent: 'emerald' },
  { match: /^\/bridges\/?$/, clip: 'bridges', label: 'Bridges', accent: 'gold' },
  { match: /^\/tools\/[^/]+\/?$/, clip: 'tools', label: 'Tool Workspace', accent: 'gold', dynamic: 'toolId' },
  { match: /^\/tools\/?$/, clip: 'tools', label: 'Tools', accent: 'gold' },
  { match: /^\/workstations(\/.*)?$/, clip: 'workstations', label: 'Workstations', accent: 'gold' },
  { match: /^\/memory\/docs\/?$/, clip: 'memory', label: 'Memory · Docs', accent: 'purple' },
  { match: /^\/memory\/?$/, clip: 'memory', label: 'Memory', accent: 'purple' },
  { match: /^\/consensus\/?$/, clip: 'consensus', label: 'Consensus', accent: 'cyan' },
  { match: /^\/webgen\/docs\/?$/, clip: 'webgen', label: 'WebGen · Docs', accent: 'sky' },
  { match: /^\/webgen\/?$/, clip: 'webgen', label: 'WebGen', accent: 'sky' },
  { match: /^\/hexstrike\/docs\/?$/, clip: 'hexstrike', label: 'HexStrike · Docs', accent: 'crimson' },
  { match: /^\/hexstrike\/?$/, clip: 'hexstrike', label: 'HexStrike', accent: 'crimson' },
  { match: /^\/zoth-os\/docs\/?$/, clip: 'zoth-os', label: 'ZothOS · Docs', accent: 'gold' },
  { match: /^\/zoth-os\/?$/, clip: 'zoth-os', label: 'ZothOS', accent: 'gold' },
  { match: /^\/docs\/math\/[^/]+\/?$/, clip: 'docs-math', label: 'Math Pillar', accent: 'gold', dynamic: 'pillarId' },
  { match: /^\/docs\/math\/?$/, clip: 'docs-math', label: 'Math Pillars', accent: 'gold' },
  { match: /^\/docs\/?$/, clip: 'docs', label: 'Docs', accent: 'gold' },
  { match: /^\/faqs\/?$/, clip: 'faqs', label: 'FAQs', accent: 'gold' },
  { match: /^\/gallery\/?$/, clip: 'home', label: 'Gallery', accent: 'gold' },
  { match: /^\/ax\/docs\/?$/, clip: 'ax', label: 'AX · Docs', accent: 'cyan' },
  { match: /^\/ax\/?$/, clip: 'ax', label: 'AX', accent: 'cyan' },
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

/** Resolve the intro config for a pathname. Returns null for unknown routes. */
export function resolveRouteIntro(pathname) {
  const path = pathname || '/';
  const idx = ROUTES.findIndex((r) => r.match.test(path));
  if (idx === -1) return null;
  const route = ROUTES[idx];
  let label = route.label;
  if (route.dynamic) {
    const slug = path.replace(/\/$/, '').split('/').pop();
    if (slug) label = `${route.label} · ${prettifySlug(slug)}`;
  }
  return {
    key: path.replace(/\/$/, '') || '/',
    clip: route.clip,
    label,
    index: String(INTRO_CLIPS.indexOf(route.clip) + 1).padStart(2, '0'),
    total: String(INTRO_CLIPS.length).padStart(2, '0'),
    accent: ACCENTS[route.accent] || ACCENTS.gold,
    handoffLead: EARLY_HANDOFF_CLIPS.has(route.clip) ? EARLY_HANDOFF_LEAD_S : DEFAULT_HANDOFF_LEAD_S,
  };
}

export function clipSources(clip, cut) {
  return [
    { src: `/intros/${clip}-${cut}.webm`, type: 'video/webm' },
    { src: `/intros/${clip}-${cut}.mp4`, type: 'video/mp4' },
  ];
}
