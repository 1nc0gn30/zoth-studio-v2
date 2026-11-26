/**
 * Zoth Chronicle Hub Engine (v2.3.0)
 *
 * Pure, SSR-safe, zero-dependency module mirrored byte-identically between
 * `src/utils/chronicleEngine.js` (browser) and `server/chronicle-engine.mjs` (Studio API).
 *
 * Responsibilities:
 *  - Safe timestamp formatting across ISO strings, Unix epoch floats (seconds/ms), numeric strings, and nulls
 *  - Complete `:8161` Chronicle Vault schema normalization (overview, continuity, patterns, recall, conversations)
 *  - Host-path (`file:///home/<user>/`, `/home/<user>/`, `/Users/<user>/`) & control-character sanitization
 *  - Real offline/in-browser JSONL, JSON, and Markdown transcript parser, full-text search, and friction analyzer
 *  - Verified Zoth Studio v2.0 -> v2.3.0 Engineering Horizon & Release Chronicle milestones
 *  - Sanitized JSON, Markdown Brief, and CSV (formula-injection neutralized) export builders
 */

export const CHRONICLE_SCHEMA_VERSION = '2.3.0';

export const CHRONICLE_QUICK_QUERIES = Object.freeze([
  'zoth-studio-v2',
  'hermes',
  'zoth-os',
  'screenshot',
]);

export const STUDIO_RELEASE_MILESTONES = Object.freeze([
  {
    id: 'REL-2.0',
    version: 'v2.0.0',
    track: 'Platform',
    status: 'Shipped',
    progress: 100,
    date: '2026-09-15',
    title: 'Zero-Egress Sovereign Studio Core & Loopback Enclave',
    summary: 'Established strict 127.0.0.1 loopback server architecture, OWASP zero-egress invariants, self-hosted WOFF2 typography, and dual-theme MUI 5 shell.',
    evidence: 'public/assets/OWASP_ZERO_EGRESS_AUDIT.md · server/serve.mjs',
  },
  {
    id: 'REL-2.1',
    version: 'v2.1.0',
    track: 'AX & Discovery',
    status: 'Shipped',
    progress: 100,
    date: '2026-10-18',
    title: 'Prerendered Static Route Engine & Machine-Readable AX Graph',
    summary: 'Automated static HTML prerendering, synchronized sitemap.xml, Schema.org JSON-LD @graph, /llms.txt, /llms-full.txt, and /.well-known/mcp.json + agent.json.',
    evidence: 'scripts/prerender.mjs · src/config/site.js · zeroDriftScore: 100 (A+)',
  },
  {
    id: 'REL-2.2',
    version: 'v2.2.0',
    track: 'Workstations',
    status: 'Shipped',
    progress: 100,
    date: '2026-11-25',
    title: '85-Tool Sovereign Arsenal & 45-Workstation Registry Parity',
    summary: 'Unified 85 open-access developer tools (0 port collisions) and 45 Studio workstations with automated Playwright hydration testing and ground-truth registry checks.',
    evidence: 'scripts/registry-check.py · scripts/test-arsenal.mjs · scripts/test-ground-truth.mjs',
  },
  {
    id: 'REL-2.3-AX',
    version: 'v2.3.0',
    track: 'AX & Discovery',
    status: 'Shipped',
    progress: 100,
    date: '2026-11-26',
    title: 'Whiteboard Audits #001–#022: AX Powerhouse, Brand Kit & Bus Monitor NOC',
    summary: 'Remediated and verified 22 consecutive tools and Studio workstations (#001 Adytum through #022 CertPath) with pure shared JS/ESM engines and >= 9.5/10 5-level scores.',
    evidence: 'docs/whiteboard-audits/INDEX.md · #017 ax-powerhouse · #020 brand · #021 bus-monitor',
  },
  {
    id: 'REL-2.3-SEC',
    version: 'v2.3.0',
    track: 'Security',
    status: 'Shipped',
    progress: 100,
    date: '2026-11-26',
    title: 'Hardened Loopback DNS-Rebinding & Cross-Origin Middleware',
    summary: 'Enforced strict isLocalHost() on all GET/HEAD /api/studio/* endpoints and isLocalRequest() Origin checks on POST writes, returning 403 on untrusted hosts or cross-origin calls.',
    evidence: 'server/studio-api.mjs · scripts/test-serve.mjs',
  },
  {
    id: 'REL-2.3-CHR',
    version: 'v2.3.0',
    track: 'Memory & Continuity',
    status: 'Shipped',
    progress: 100,
    date: '2026-11-26',
    title: 'Chronicle Hub v2.3.0: Same-Origin Continuity Proxy & Browser Transcript Analyzer',
    summary: 'Eliminated live timestamp crash and schema drift via shared chronicleEngine.js, added hardened /api/studio/chronicle/{summary,recall,search} proxy with host-path redaction, and shipped a 100% offline JSONL/Markdown session log analyzer.',
    evidence: 'src/utils/chronicleEngine.js · server/chronicle-engine.mjs · docs/whiteboard-audits/023-chronicle.md',
  },
]);

export const SAMPLE_BROWSER_TRANSCRIPT_JSONL = [
  JSON.stringify({
    timestamp: '2026-11-26T09:12:04-05:00',
    role: 'user',
    source: 'agy',
    topic: 'zoth-studio-v2',
    content: 'Audit /workstations/chronicle in Light and Dark mode, verify zero DNS-rebinding leaks, and confirm all exports work offline.',
  }),
  JSON.stringify({
    timestamp: '2026-11-26T09:12:18-05:00',
    role: 'assistant',
    source: 'agy',
    topic: 'chronicle',
    content: 'Batched discovery across ~/NullAITech/zoth-studio-v2/server/studio-api.mjs and src/components/tools/ChronicleVaultGodModeTool.jsx.',
  }),
  JSON.stringify({
    timestamp: '2026-11-26T09:13:02-05:00',
    role: 'tool',
    source: 'agy',
    topic: 'bug',
    error: true,
    content: 'TypeError: (e.started_at || "").slice is not a function on Unix float started_at=1795708232.0 from :8161/api/continuity/recall',
  }),
  JSON.stringify({
    timestamp: '2026-11-26T09:14:25-05:00',
    role: 'assistant',
    source: 'agy',
    topic: 'fix',
    content: 'Replaced raw .slice() with formatChronicleTimestamp() supporting ISO strings, epoch seconds/ms, and numeric strings. Added /api/studio/chronicle/* same-origin proxy with host-path sanitization.',
  }),
  JSON.stringify({
    timestamp: '2026-11-26T09:15:10-05:00',
    role: 'user',
    source: 'hermes',
    topic: 'accessibility',
    correction: true,
    content: 'Wait — also fix the Light Mode eyebrow contrast (2.64:1) and ensure mobile quick-query chips meet the 44px minimum tap target.',
  }),
  JSON.stringify({
    timestamp: '2026-11-26T09:16:40-05:00',
    role: 'assistant',
    source: 'hermes',
    topic: 'verification',
    content: 'Verified npm test pass, 0 console errors online and offline, 0 contrast violations, 0 mobile tap targets under 44px, and 0 secret leaks.',
  }),
].join('\n');

export const SAMPLE_BROWSER_TRANSCRIPT_MD = [
  '# Zoth Studio Engineering Session Log — 2026-11-26',
  '',
  '## [2026-11-26] User: Launch Whiteboard Remediation #023',
  'Verify /workstations/chronicle and /tools/chronicle prerendering, FAQPage JSON-LD, and same-origin proxy endpoints.',
  '',
  '## [2026-11-26] Tool: Smoke Probe Output',
  'GET /api/studio/chronicle/summary -> 200 OK (sanitized stats, 0 literal home paths). Host: evil.example.invalid -> 403 Forbidden.',
  '',
  '## [2026-11-26] Assistant: Verification Summary',
  'All 5 audit levels cleared >= 9.0/10 with offline JSONL/Markdown transcript analysis and CSV formula-injection neutralization.',
].join('\n');

const HOME_PATH_PATTERNS = [
  /file:\/\/\/home\/[a-zA-Z0-9._-]+\//g,
  /file:\/\/\/Users\/[a-zA-Z0-9._-]+\//g,
  /\/home\/[a-zA-Z0-9._-]+\//g,
  /\/Users\/[a-zA-Z0-9._-]+\//g,
  /[A-Za-z]:\\Users\\[a-zA-Z0-9._-]+\\/g,
];

const SECRET_SNIPPET_PATTERNS = [
  /\b(sk-[a-zA-Z0-9_-]{20,})\b/g,
  /\b(ghp_[a-zA-Z0-9]{20,})\b/g,
  /\b(gho_[a-zA-Z0-9]{20,})\b/g,
  /\b(xox[baprs]-[a-zA-Z0-9-]{16,})\b/g,
];

/**
 * Strips non-printable control characters, replaces host home directory paths
 * (including file:// URIs) with `~/`, and redacts accidental credential shapes.
 */
export function sanitizeChronicleText(input) {
  if (input == null) return '';
  let text = typeof input === 'string' ? input : String(input);
  // Remove NUL and ASCII control chars except \t (0x09), \n (0x0A), \r (0x0D)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  for (const rx of HOME_PATH_PATTERNS) {
    text = text.replace(rx, '~/');
  }
  // Also catch bare trailing /home/<user> or /Users/<user> at end of path/string
  text = text.replace(/(?:file:\/\/)?\/(?:home|Users)\/[a-zA-Z0-9._-]+(?=$|[\s)"'\]}>,:;])/g, '~');
  for (const rx of SECRET_SNIPPET_PATTERNS) {
    text = text.replace(rx, '[REDACTED_SECRET]');
  }
  return text.trim();
}

/**
 * Safely formats any timestamp representation into `YYYY-MM-DD` (or `'—'`).
 * Never calls `.slice()` on numbers, objects, or missing values.
 */
export function formatChronicleTimestamp(raw) {
  if (raw == null || raw === '') return '—';

  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? '—' : raw.toISOString().slice(0, 10);
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw <= 0) return '—';
    const ms = raw < 1e12 ? raw * 1000 : raw;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 10);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return '—';

    // Direct ISO prefix YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    // Pure numeric string (Unix epoch seconds or milliseconds)
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num) && num > 0) {
        const ms = num < 1e12 ? num * 1000 : num;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 10);
      }
      return '—';
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString().slice(0, 10);
    }
  }

  return '—';
}

/**
 * Resolves the best date field on a Chronicle record (`started_iso`, `timestamp_iso`,
 * `date`, `started_at`, `timestamp`, `created_at`) without throwing.
 */
export function formatChronicleDate(item) {
  if (item == null) return '—';
  if (typeof item !== 'object') return formatChronicleTimestamp(item);
  const candidates = [
    item.started_iso,
    item.timestamp_iso,
    item.iso_date,
    item.date,
    item.started_at,
    item.timestamp,
    item.created_at,
    item.ended_at,
  ];
  for (const val of candidates) {
    const formatted = formatChronicleTimestamp(val);
    if (formatted !== '—') return formatted;
  }
  return '—';
}

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Normalizes `:8161/api/patterns` payloads so Pattern Radar cards always have
 * polarity, category, summary/subtitle/what_happens, and suggestedShift.
 */
export function normalizePatterns(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.patterns) ? raw.patterns : [];
  return list
    .filter((p) => p && typeof p === 'object')
    .map((p, idx) => {
      const id = sanitizeChronicleText(p.id || p.pattern_key || p.name || `pattern-${idx + 1}`);
      const title = sanitizeChronicleText(p.title || p.name || p.pattern_key || 'Untitled Pattern');
      const count = toSafeNumber(p.occurrences ?? p.count, 0);
      const affectedSessions =
        p.affected_sessions != null && Number.isFinite(Number(p.affected_sessions))
          ? Number(p.affected_sessions)
          : null;
      const polarity = sanitizeChronicleText(p.polarity || p.severity || 'neutral').toLowerCase() || 'neutral';
      const category = sanitizeChronicleText(p.category || 'behavior') || 'behavior';
      const summary = sanitizeChronicleText(
        p.subtitle || p.what_happens || p.summary || p.description || p.why_it_matters || ''
      );
      const whatHappens = sanitizeChronicleText(p.what_happens || '');
      const whyItMatters = sanitizeChronicleText(p.why_it_matters || '');
      const suggestedShift = sanitizeChronicleText(p.suggested_shift || p.recommendation || '');

      return {
        id,
        title,
        count,
        occurrences: count,
        affectedSessions,
        polarity,
        category,
        summary: summary || suggestedShift || 'Observed across local session history.',
        whatHappens,
        whyItMatters,
        suggestedShift,
      };
    });
}

/**
 * Normalizes `:8161/api/continuity/overview` items and separates unfinished loops
 * from parked innovation ideas with full host-path sanitization.
 */
export function normalizeContinuityItems(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  const items = list
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => {
      const itemType = sanitizeChronicleText(item.item_type || item.type || 'loop').toLowerCase() || 'loop';
      return {
        id: String(item.id ?? `loop-${idx + 1}`),
        itemType,
        conversationId: sanitizeChronicleText(item.conversation_id || ''),
        source: sanitizeChronicleText(item.family || item.source || 'vault'),
        category: sanitizeChronicleText(item.category || item.project || 'general'),
        project: sanitizeChronicleText(item.project || 'general'),
        title: sanitizeChronicleText(item.title || item.conversation_id || `Continuity Item #${idx + 1}`),
        summary: sanitizeChronicleText(item.snippet || item.summary || item.detail || item.title || ''),
        severity: sanitizeChronicleText(item.severity || 'medium').toLowerCase(),
        status: sanitizeChronicleText(item.status || 'open').toLowerCase(),
        date: formatChronicleDate(item),
      };
    });

  const unfinishedLoops = items.filter((i) => i.itemType === 'unfinished' || i.itemType === 'loop');
  const parkedIdeas = items.filter((i) => i.itemType === 'innovation' || i.itemType === 'idea' || i.itemType === 'parked');

  return { items, unfinishedLoops, parkedIdeas };
}

/**
 * Normalizes `:8161/api/overview` + `:8161/api/continuity/overview` + patterns into
 * a balanced 6-KPI telemetry object.
 */
export function normalizeOverviewStats(overview, continuity, patternsInput) {
  const totals = overview?.totals && typeof overview.totals === 'object' ? overview.totals : {};
  const counts = continuity?.counts && typeof continuity.counts === 'object' ? continuity.counts : {};
  const normalizedPatterns = normalizePatterns(patternsInput);
  const byFamily = Array.isArray(overview?.by_family)
    ? overview.by_family.map((f) => ({
        family: sanitizeChronicleText(f.family || 'unknown'),
        conversations: toSafeNumber(f.conversations, 0),
        messages: toSafeNumber(f.messages, 0),
        avgFriction: toSafeNumber(f.avg_friction, 0),
        corrections: toSafeNumber(f.corrections, 0),
        toolErrors: toSafeNumber(f.tool_errors, 0),
      }))
    : [];

  return {
    conversations: totals.conversations != null ? toSafeNumber(totals.conversations, 0) : null,
    messages: totals.messages != null ? toSafeNumber(totals.messages, 0) : null,
    avgFriction: totals.avg_friction != null ? toSafeNumber(totals.avg_friction, 0) : null,
    unfinishedLoops: counts.unfinished_open != null ? toSafeNumber(counts.unfinished_open, 0) : null,
    parkedIdeas: counts.innovation_open != null ? toSafeNumber(counts.innovation_open, 0) : null,
    activePatterns: normalizedPatterns.length,
    corrections: totals.corrections != null ? toSafeNumber(totals.corrections, 0) : null,
    toolErrors: totals.tool_errors != null ? toSafeNumber(totals.tool_errors, 0) : null,
    byFamily,
  };
}

/**
 * Normalizes `:8161/api/continuity/recall` responses cleanly across all field variants.
 */
export function normalizeRecallResponse(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};

  const rawMemories = Array.isArray(src.related_memories) ? src.related_memories : [];
  const related_memories = rawMemories
    .filter((m) => m && typeof m === 'object')
    .map((m, idx) => {
      const id = sanitizeChronicleText(m.id ?? m.conversation_id ?? `mem-${idx + 1}`);
      return {
        id,
        title: sanitizeChronicleText(m.title || id || 'Untitled Thread'),
        date: formatChronicleDate(m),
        source: sanitizeChronicleText(m.family || m.source || 'vault') || 'vault',
        profile: sanitizeChronicleText(m.profile || ''),
        messageCount: toSafeNumber(m.total_messages ?? m.message_count ?? m.messageCount, 0),
        frictionScore: toSafeNumber(m.friction_score ?? m.frictionScore, 0),
        outcomeStatus: sanitizeChronicleText(m.outcome_status || m.outcomeStatus || ''),
        snippet: sanitizeChronicleText(m.preview || m.snippet || ''),
      };
    });

  const rawAlerts = Array.isArray(src.repetition_alerts)
    ? src.repetition_alerts
    : Array.isArray(src.alerts)
      ? src.alerts
      : [];
  const alerts = rawAlerts.map((a, idx) => {
    if (typeof a === 'string') {
      return {
        id: `alert-${idx + 1}`,
        title: 'Recurring Pattern Alert',
        detail: sanitizeChronicleText(a),
        severity: 'warning',
      };
    }
    return {
      id: sanitizeChronicleText(a?.id || `alert-${idx + 1}`),
      title: sanitizeChronicleText(a?.title || a?.label || 'Recurring Pattern Alert'),
      detail: sanitizeChronicleText(a?.detail || a?.message || a?.summary || ''),
      severity: sanitizeChronicleText(a?.severity || 'warning').toLowerCase() || 'warning',
    };
  });

  const rawWarnings = Array.isArray(src.breakage_warnings) ? src.breakage_warnings : [];
  const breakage_warnings = rawWarnings.map((w, idx) => {
    if (typeof w === 'string') {
      return {
        id: `warn-${idx + 1}`,
        title: 'Breakage Warning',
        detail: sanitizeChronicleText(w),
        date: '—',
        severity: 'high',
      };
    }
    return {
      id: sanitizeChronicleText(w?.id || `warn-${idx + 1}`),
      title: sanitizeChronicleText(w?.title || 'Breakage Risk'),
      detail: sanitizeChronicleText(w?.snippet || w?.detail || w?.message || ''),
      date: formatChronicleDate(w),
      severity: sanitizeChronicleText(w?.severity || 'high').toLowerCase() || 'high',
    };
  });

  const normalizeShortLoop = (list, fallbackPrefix) =>
    (Array.isArray(list) ? list : [])
      .filter((x) => x && typeof x === 'object')
      .map((x, idx) => ({
        id: String(x.id ?? `${fallbackPrefix}-${idx + 1}`),
        title: sanitizeChronicleText(x.title || x.conversation_id || `${fallbackPrefix} #${idx + 1}`),
        date: formatChronicleDate(x),
        summary: sanitizeChronicleText(x.snippet || x.summary || x.detail || ''),
        category: sanitizeChronicleText(x.category || x.project || 'general'),
      }));

  return {
    query: sanitizeChronicleText(src.query || ''),
    entities: Array.isArray(src.entities) ? src.entities.map((e) => sanitizeChronicleText(e)).filter(Boolean) : [],
    keywords: Array.isArray(src.keywords) ? src.keywords.map((k) => sanitizeChronicleText(k)).filter(Boolean) : [],
    related_memories,
    alerts,
    repetition_alerts: alerts,
    breakage_warnings,
    unfinished_loops: normalizeShortLoop(src.unfinished_loops || src.unfinishedLoops, 'unfinished'),
    parked_ideas: normalizeShortLoop(src.parked_ideas || src.parkedIdeas || src.innovation_ideas, 'idea'),
  };
}

/**
 * Normalizes `:8161/api/conversations` search responses cleanly.
 */
export function normalizeConversations(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.conversations)
      ? raw.conversations
      : Array.isArray(raw?.items)
        ? raw.items
        : [];
  const conversations = list
    .filter((c) => c && typeof c === 'object')
    .map((c, idx) => {
      const id = sanitizeChronicleText(c.id ?? c.conversation_id ?? `conv-${idx + 1}`);
      return {
        id,
        title: sanitizeChronicleText(c.title || id || 'Untitled Conversation'),
        source: sanitizeChronicleText(c.family || c.source || 'log') || 'log',
        profile: sanitizeChronicleText(c.profile || ''),
        date: formatChronicleDate(c),
        messageCount: toSafeNumber(c.total_messages ?? c.message_count ?? c.messageCount, 0),
        frictionScore: toSafeNumber(c.friction_score ?? c.frictionScore, 0),
        outcomeStatus: sanitizeChronicleText(c.outcome_status || ''),
        snippet: sanitizeChronicleText(c.preview || c.snippet || ''),
      };
    });

  const total =
    raw && typeof raw === 'object' && Number.isFinite(Number(raw.total))
      ? Number(raw.total)
      : conversations.length;

  return { total, conversations };
}

const TOPIC_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'have', 'were',
  'your', 'also', 'when', 'only', 'over', 'some', 'more', 'than', 'then', 'them',
  'they', 'been', 'will', 'what', 'each', 'make', 'all', 'not', 'are', 'but',
  'use', 'via', 'can', 'our', 'out', 'has', 'was', 'its', 'you', 'now', 'run',
  'log', 'logs', 'user', 'assistant', 'tool', 'system',
]);

function extractTagsFromText(text, explicitTopic = '') {
  const tags = new Set();
  if (explicitTopic) {
    tags.add(sanitizeChronicleText(explicitTopic).toLowerCase());
  }
  const clean = sanitizeChronicleText(text).toLowerCase();
  const tokens = clean.match(/[a-z][a-z0-9_-]{3,28}/g) || [];
  for (const tok of tokens) {
    if (!TOPIC_STOP_WORDS.has(tok) && !/^\d+$/.test(tok)) {
      tags.add(tok);
      if (tags.size >= 8) break;
    }
  }
  return [...tags];
}

function classifyFrictionSignals(turnText, rawObj = null) {
  const lower = String(turnText || '').toLowerCase();
  const hasError = Boolean(
    rawObj?.error ||
      rawObj?.is_error ||
      /\b(typeerror|referenceerror|syntaxerror|err_failed|exception|traceback|crash|500|403|404|failed)\b/i.test(lower)
  );
  const hasCorrection = Boolean(
    rawObj?.correction ||
      /\b(wait\s*[—-]|actually[, ]|correction|don't|do not|wrong|instead of|fix the)\b/i.test(lower)
  );
  const hasStall = Boolean(
    rawObj?.stall ||
      /\b(stalling|over-probing|timeout|timed out|retrying|looping)\b/i.test(lower)
  );
  return { hasError, hasCorrection, hasStall };
}

function normalizeTurnRecord(rawObj, idx) {
  const roleRaw = sanitizeChronicleText(rawObj?.role || rawObj?.speaker || rawObj?.type || 'note').toLowerCase();
  const role = ['user', 'assistant', 'tool', 'system'].includes(roleRaw) ? roleRaw : 'note';
  const text = sanitizeChronicleText(
    rawObj?.content ?? rawObj?.text ?? rawObj?.message ?? rawObj?.snippet ?? rawObj?.preview ?? rawObj?.title ?? ''
  );
  const date = formatChronicleDate(rawObj);
  const source = sanitizeChronicleText(rawObj?.source || rawObj?.family || 'local');
  const tags = extractTagsFromText(text, rawObj?.topic || rawObj?.category || '');
  const signals = classifyFrictionSignals(text, rawObj);

  return {
    id: sanitizeChronicleText(rawObj?.id || `turn-${idx + 1}`),
    index: idx + 1,
    role,
    source,
    date,
    text,
    tags,
    ...signals,
  };
}

/**
 * 100% client-side analyzer for `.jsonl`, `.json`, and `.md` session transcripts.
 * Extracts turns, date range, topic frequencies, friction/error/correction counts,
 * and a deterministic friction score.
 */
export function parseTranscriptInput(rawText) {
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  if (!text) {
    return {
      format: 'empty',
      turns: [],
      metrics: {
        turnCount: 0,
        dateStart: '—',
        dateEnd: '—',
        roleCounts: { user: 0, assistant: 0, tool: 0, system: 0, note: 0 },
        errorCount: 0,
        correctionCount: 0,
        stallCount: 0,
        frictionCount: 0,
        frictionScore: 0,
        topTopics: [],
      },
    };
  }

  let format = 'markdown';
  let turns = [];

  // 1. Try single JSON document (array or object with turns/messages/conversations)
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.turns)
          ? parsed.turns
          : Array.isArray(parsed?.messages)
            ? parsed.messages
            : Array.isArray(parsed?.conversations)
              ? parsed.conversations
              : Array.isArray(parsed?.related_memories)
                ? parsed.related_memories
                : [parsed];
      format = 'json';
      turns = arr
        .filter((item) => item && typeof item === 'object')
        .map((item, idx) => normalizeTurnRecord(item, idx))
        .filter((t) => t.text.length > 0);
    } catch {
      // Fall through to JSONL
    }
  }

  // 2. Try JSONL (newline-delimited JSON objects)
  if (turns.length === 0) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedObjects = [];
    let jsonlHits = 0;
    for (const line of lines) {
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const obj = JSON.parse(line);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            parsedObjects.push(obj);
            jsonlHits += 1;
          }
        } catch {
          // ignore malformed line
        }
      }
    }
    if (jsonlHits > 0 && jsonlHits >= Math.ceil(lines.length * 0.5)) {
      format = 'jsonl';
      turns = parsedObjects
        .map((obj, idx) => normalizeTurnRecord(obj, idx))
        .filter((t) => t.text.length > 0);
    }
  }

  // 3. Fallback: Markdown / plain text session log parser
  if (turns.length === 0) {
    format = 'markdown';
    const blocks = [];
    const lines = text.split(/\r?\n/);
    let current = null;

    const flush = () => {
      if (current && current.lines.length > 0) {
        blocks.push(current);
      }
      current = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const headingMatch = line.match(/^#{1,4}\s+(?:\[(\d{4}-\d{2}-\d{2})[^\]]*\]\s*)?(?:(User|Assistant|Tool|System)\s*[:—-]\s*)?(.*)$/i);
      const speakerMatch = line.match(/^(?:\[(\d{4}-\d{2}-\d{2})[^\]]*\]\s*)?(User|Assistant|Tool|System)\s*:\s*(.*)$/i);

      if (headingMatch) {
        flush();
        current = {
          date: headingMatch[1] || '',
          role: (headingMatch[2] || 'note').toLowerCase(),
          lines: [headingMatch[3]].filter(Boolean),
        };
      } else if (speakerMatch) {
        flush();
        current = {
          date: speakerMatch[1] || '',
          role: speakerMatch[2].toLowerCase(),
          lines: [speakerMatch[3]].filter(Boolean),
        };
      } else {
        if (!current) {
          const inlineDate = line.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
          current = { date: inlineDate, role: 'note', lines: [] };
        }
        current.lines.push(line.replace(/^[-*]\s+/, ''));
      }
    }
    flush();

    turns = blocks.map((b, idx) =>
      normalizeTurnRecord(
        {
          id: `md-${idx + 1}`,
          role: b.role,
          date: b.date || b.lines.join(' ').match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '',
          content: b.lines.join(' '),
          source: 'markdown',
        },
        idx
      )
    ).filter((t) => t.text.length > 0);
  }

  const roleCounts = { user: 0, assistant: 0, tool: 0, system: 0, note: 0 };
  const topicCounts = new Map();
  const validDates = [];
  let errorCount = 0;
  let correctionCount = 0;
  let stallCount = 0;

  for (const t of turns) {
    roleCounts[t.role] = (roleCounts[t.role] || 0) + 1;
    if (t.date && t.date !== '—') validDates.push(t.date);
    if (t.hasError) errorCount += 1;
    if (t.hasCorrection) correctionCount += 1;
    if (t.hasStall) stallCount += 1;
    for (const tag of t.tags) {
      topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
    }
  }

  validDates.sort();
  const frictionCount = errorCount + correctionCount + stallCount;
  const frictionScore =
    turns.length > 0
      ? Math.min(100, Math.round(((errorCount * 14 + correctionCount * 10 + stallCount * 12) / turns.length) * 10) / 10)
      : 0;

  const topTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    format,
    turns,
    metrics: {
      turnCount: turns.length,
      dateStart: validDates[0] || '—',
      dateEnd: validDates[validDates.length - 1] || '—',
      roleCounts,
      errorCount,
      correctionCount,
      stallCount,
      frictionCount,
      frictionScore,
      topTopics,
    },
  };
}

/**
 * Full-text multi-term search + role filter across client-side parsed turns.
 */
export function searchTranscriptTurns(turns, query = '', roleFilter = 'all') {
  const list = Array.isArray(turns) ? turns : [];
  const normalizedRole = String(roleFilter || 'all').toLowerCase();
  const terms = sanitizeChronicleText(query)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return list.filter((turn) => {
    if (normalizedRole !== 'all' && turn.role !== normalizedRole) return false;
    if (terms.length === 0) return true;
    const haystack = `${turn.role} ${turn.source} ${turn.date} ${turn.text} ${(turn.tags || []).join(' ')}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Neutralizes spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`)
 * and applies RFC-4180 CSV cell escaping.
 */
export function neutralizeCsvCell(value) {
  let str = sanitizeChronicleText(value == null ? '' : String(value));
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a sanitized CSV export from an array of plain objects or normalized rows.
 */
export function buildChronicleCsvExport(rows, columns = ['id', 'date', 'source', 'role', 'title', 'summary', 'frictionScore']) {
  const list = Array.isArray(rows) ? rows : [];
  const header = columns.map((c) => neutralizeCsvCell(c)).join(',');
  const body = list.map((row) =>
    columns.map((col) => neutralizeCsvCell(row?.[col] ?? '')).join(',')
  );
  return [header, ...body].join('\n');
}

/**
 * Builds a sanitized Markdown brief covering either live `:8161` continuity
 * or offline client-side transcript analysis + release chronicle.
 */
export function buildChronicleMarkdownBrief({
  mode = 'hybrid',
  stats = null,
  recallQuery = '',
  recallResult = null,
  patterns = [],
  parsedTranscript = null,
  milestones = STUDIO_RELEASE_MILESTONES,
} = {}) {
  const lines = [
    '# Zoth Chronicle Hub — Engineering & Continuity Brief',
    `Schema Version: v${CHRONICLE_SCHEMA_VERSION} | Mode: ${sanitizeChronicleText(mode)}`,
    `Exported: ${new Date().toISOString()}`,
    '',
  ];

  if (stats) {
    lines.push('## Live Continuity Vault Telemetry');
    lines.push(
      `- Conversations: ${stats.conversations ?? '—'} | Messages: ${stats.messages ?? '—'} | Avg Friction: ${stats.avgFriction ?? '—'}`
    );
    lines.push(
      `- Unfinished Loops: ${stats.unfinishedLoops ?? '—'} | Parked Ideas: ${stats.parkedIdeas ?? '—'} | Active Patterns: ${stats.activePatterns ?? patterns.length}`
    );
    lines.push('');
  }

  if (recallResult && Array.isArray(recallResult.related_memories) && recallResult.related_memories.length > 0) {
    lines.push(`## Recall Query: ${sanitizeChronicleText(recallQuery || recallResult.query || 'chronicle')}`);
    for (const m of recallResult.related_memories.slice(0, 8)) {
      lines.push(
        `- [${sanitizeChronicleText(m.source || 'vault')}] ${formatChronicleDate(m)} (f:${m.frictionScore ?? 0}, ${m.messageCount ?? 0} msgs) ${sanitizeChronicleText(m.title)}`
      );
    }
    lines.push('');
  }

  if (Array.isArray(patterns) && patterns.length > 0) {
    lines.push('## Friction & Pattern Radar');
    for (const p of patterns.slice(0, 6)) {
      lines.push(`- **${sanitizeChronicleText(p.title)}** (${p.count ?? 0}x, ${p.polarity || 'neutral'}) — ${sanitizeChronicleText(p.summary)}`);
      if (p.suggestedShift) {
        lines.push(`  - Shift: ${sanitizeChronicleText(p.suggestedShift)}`);
      }
    }
    lines.push('');
  }

  if (parsedTranscript && parsedTranscript.turns && parsedTranscript.turns.length > 0) {
    const m = parsedTranscript.metrics;
    lines.push('## Browser Transcript Analysis (100% Offline)');
    lines.push(
      `- Format: ${parsedTranscript.format} | Turns: ${m.turnCount} | Date Range: ${m.dateStart} -> ${m.dateEnd} | Friction Score: ${m.frictionScore}`
    );
    lines.push(`- Markers: ${m.errorCount} errors · ${m.correctionCount} corrections · ${m.stallCount} stalls`);
    for (const t of parsedTranscript.turns.slice(0, 8)) {
      lines.push(`- [${t.date}] **${t.role}**: ${sanitizeChronicleText(t.text).slice(0, 180)}`);
    }
    lines.push('');
  }

  if (Array.isArray(milestones) && milestones.length > 0) {
    lines.push('## Zoth Studio Engineering Horizon');
    for (const ms of milestones.slice(0, 6)) {
      lines.push(`- **${ms.version}** (${ms.track}, ${ms.status}) — ${ms.title} (${ms.date})`);
    }
    lines.push('');
  }

  return sanitizeChronicleText(lines.join('\n')) + '\n';
}
