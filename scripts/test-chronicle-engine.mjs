import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHRONICLE_SCHEMA_VERSION,
  STUDIO_RELEASE_MILESTONES,
  SAMPLE_BROWSER_TRANSCRIPT_JSONL,
  SAMPLE_BROWSER_TRANSCRIPT_MD,
  sanitizeChronicleText,
  formatChronicleTimestamp,
  formatChronicleDate,
  normalizeOverviewStats,
  normalizePatterns,
  normalizeContinuityItems,
  normalizeRecallResponse,
  normalizeConversations,
  parseTranscriptInput,
  searchTranscriptTurns,
  neutralizeCsvCell,
  buildChronicleCsvExport,
  buildChronicleMarkdownBrief,
} from '../src/utils/chronicleEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const FAKE_HOME = '/home/operator/';
const FAKE_FILE_HOME = 'file:///home/operator/';

test('chronicleEngine.js and server/chronicle-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/chronicleEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/chronicle-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server Chronicle engines must stay byte-identical');
  assert.equal(CHRONICLE_SCHEMA_VERSION, '2.3.0');
});

test('formatChronicleTimestamp & formatChronicleDate handle float Unix epochs, ms epochs, ISO strings, numeric strings, and nullish safely', () => {
  // Exact float epoch from live :8161 that caused the P0 started_at.slice crash
  assert.doesNotThrow(() => formatChronicleTimestamp(1795708232.0));
  assert.match(formatChronicleTimestamp(1795708232.0), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(formatChronicleTimestamp(1795708232000), formatChronicleTimestamp(1795708232.0));
  assert.equal(formatChronicleTimestamp('1795708232.0'), formatChronicleTimestamp(1795708232.0));
  assert.equal(formatChronicleTimestamp('2026-11-26T10:50:32-05:00'), '2026-11-26');
  assert.equal(formatChronicleTimestamp('2026-11-26'), '2026-11-26');
  assert.equal(formatChronicleTimestamp(null), '—');
  assert.equal(formatChronicleTimestamp(undefined), '—');
  assert.equal(formatChronicleTimestamp(''), '—');
  assert.equal(formatChronicleTimestamp(NaN), '—');
  assert.equal(formatChronicleTimestamp({}), '—');

  // Prefers started_iso over numeric started_at, falls back cleanly when started_iso absent
  assert.equal(
    formatChronicleDate({ started_at: 1795708232.0, started_iso: '2026-11-26T10:50:32-05:00' }),
    '2026-11-26'
  );
  assert.match(formatChronicleDate({ started_at: 1795708232.0 }), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(formatChronicleDate(null), '—');
});

test('sanitizeChronicleText redacts host home paths (including file:// URIs), control chars, and secret shapes', () => {
  const synthToken = ['sk', '-', 'a'.repeat(28)].join('');
  const dirty = `See [repo](${FAKE_FILE_HOME}NullAITech/zoth-studio-v2) and /home/alice/secrets.txt and /Users/bob/app\x00\x07 token ${synthToken}`;
  const clean = sanitizeChronicleText(dirty);
  assert.ok(!clean.includes(FAKE_HOME), 'Must redact /home/operator/');
  assert.ok(!clean.includes('file:///home/'), 'Must redact file:///home/');
  assert.ok(!clean.includes('/home/alice/'), 'Must redact /home/alice/');
  assert.ok(!clean.includes('/Users/bob/'), 'Must redact /Users/bob/');
  assert.ok(!clean.includes('\x00'), 'Must strip NUL bytes');
  assert.ok(!clean.includes(synthToken), 'Must redact API keys');
  assert.ok(clean.includes('~/NullAITech/zoth-studio-v2'));
  assert.ok(clean.includes('[REDACTED_SECRET]'));
});

test('normalizeRecallResponse maps all live :8161 schema fields without crashing', () => {
  const livePayload = {
    query: 'zoth-studio-v2',
    entities: ['zoth-studio-v2'],
    keywords: ['zoth-studio-v2'],
    repetition_alerts: [
      { title: 'Recurring Topic Detected (6+ related past threads)', detail: `Check ${FAKE_HOME}NullAITech/zoth-studio-v2` },
    ],
    breakage_warnings: [
      { id: 8134, title: 'Stalled Thread', snippet: `See ${FAKE_FILE_HOME}NullAITech/zoth-hermes-swarm`, timestamp: 1793651803.0 },
    ],
    related_memories: [
      {
        id: 'agy:5984a790',
        family: 'agy',
        profile: 'agy-cli',
        title: 'Whiteboard Remediation #022',
        total_messages: 167,
        friction_score: 0.0,
        started_at: 1795708232.0,
        started_iso: '2026-11-26T10:50:32-05:00',
        preview: `Audit ${FAKE_HOME}NullAITech/zoth-studio-v2`,
      },
    ],
  };

  const norm = normalizeRecallResponse(livePayload);
  assert.equal(norm.related_memories.length, 1);
  assert.equal(norm.related_memories[0].id, 'agy:5984a790');
  assert.equal(norm.related_memories[0].date, '2026-11-26');
  assert.equal(norm.related_memories[0].messageCount, 167);
  assert.ok(!norm.related_memories[0].snippet.includes(FAKE_HOME));
  assert.equal(norm.alerts[0].title, 'Recurring Topic Detected (6+ related past threads)');
  assert.ok(!norm.alerts[0].detail.includes(FAKE_HOME));
  assert.ok(!norm.breakage_warnings[0].detail.includes(FAKE_HOME));
});

test('normalizePatterns preserves polarity, category, summary (subtitle/what_happens), and suggestedShift', () => {
  const norm = normalizePatterns({
    patterns: [
      {
        id: 'agent_stalling_probe_chains',
        category: 'agent',
        polarity: 'remove',
        title: 'Stalling / Over-Probing Chains',
        subtitle: 'Long chains of 5+ consecutive read/inspect tool calls without taking action.',
        what_happens: 'Agents run repetitive read-only checks.',
        suggested_shift: 'Batch initial discovery into 1-2 parallel turns.',
        occurrences: 3073,
        affected_sessions: 207,
      },
    ],
  });
  assert.equal(norm.length, 1);
  assert.equal(norm[0].count, 3073);
  assert.equal(norm[0].polarity, 'remove');
  assert.equal(norm[0].category, 'agent');
  assert.ok(norm[0].summary.includes('5+ consecutive'));
  assert.ok(norm[0].suggestedShift.includes('1-2 parallel turns'));
});

test('normalizeConversations & normalizeContinuityItems & normalizeOverviewStats work on live :8161 shapes', () => {
  const convs = normalizeConversations({
    total: 1334,
    conversations: [
      {
        id: 'agy:123',
        family: 'agy',
        title: `Session at ${FAKE_HOME}NullAITech`,
        started_at: 1795708232.0,
        started_iso: '2026-11-26T10:50:32-05:00',
        total_messages: 167,
        friction_score: 2.5,
      },
    ],
  });
  assert.equal(convs.total, 1334);
  assert.equal(convs.conversations[0].date, '2026-11-26');
  assert.equal(convs.conversations[0].messageCount, 167);
  assert.ok(!convs.conversations[0].title.includes(FAKE_HOME));

  const cont = normalizeContinuityItems({
    counts: { unfinished_open: 3, innovation_open: 7 },
    items: [
      { id: 1, item_type: 'unfinished', title: 'Loop 1', snippet: `Path ${FAKE_FILE_HOME}work`, timestamp: 1793651803.0 },
      { id: 2, item_type: 'innovation', title: 'Idea 1', snippet: 'Build offline parser', timestamp_iso: '2026-11-25T08:00:00Z' },
    ],
  });
  assert.equal(cont.unfinishedLoops.length, 1);
  assert.equal(cont.parkedIdeas.length, 1);
  assert.ok(!cont.unfinishedLoops[0].summary.includes(FAKE_HOME));

  const stats = normalizeOverviewStats(
    { totals: { conversations: 1334, messages: 225312, avg_friction: 7.2 } },
    { counts: { unfinished_open: 3, innovation_open: 7 } },
    [{ id: 'p1', title: 'Pattern 1' }]
  );
  assert.equal(stats.conversations, 1334);
  assert.equal(stats.activePatterns, 1);
});

test('parseTranscriptInput & searchTranscriptTurns parse JSONL, JSON, and Markdown offline', () => {
  const jsonl = parseTranscriptInput(SAMPLE_BROWSER_TRANSCRIPT_JSONL);
  assert.equal(jsonl.format, 'jsonl');
  assert.equal(jsonl.metrics.turnCount, 6);
  assert.equal(jsonl.metrics.errorCount, 1);
  assert.equal(jsonl.metrics.correctionCount, 1);
  assert.ok(jsonl.metrics.topTopics.length > 0);

  const filtered = searchTranscriptTurns(jsonl.turns, 'TypeError', 'tool');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].role, 'tool');

  const md = parseTranscriptInput(SAMPLE_BROWSER_TRANSCRIPT_MD);
  assert.equal(md.format, 'markdown');
  assert.ok(md.metrics.turnCount >= 3);

  const jsonArr = parseTranscriptInput(JSON.stringify([{ role: 'user', timestamp: 1795708232.0, content: `Hello from ${FAKE_HOME}test` }]));
  assert.equal(jsonArr.format, 'json');
  assert.equal(jsonArr.turns.length, 1);
  assert.ok(!jsonArr.turns[0].text.includes(FAKE_HOME));
});

test('CSV export neutralizes formula injection and Markdown brief + release milestones have zero fabricated hashes or home paths', () => {
  assert.equal(neutralizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"` );
  assert.equal(neutralizeCsvCell('+1+1'), "'+1+1");
  assert.equal(neutralizeCsvCell('-10'), "'-10");
  assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), "'@SUM(A1:A2)");

  const csv = buildChronicleCsvExport([
    { id: '1', date: '2026-11-26', source: 'agy', role: 'user', title: '=HYPERLINK("http://evil")', summary: `Check ${FAKE_HOME}repo`, frictionScore: 0 },
  ]);
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(!csv.includes(FAKE_HOME));

  const brief = buildChronicleMarkdownBrief({
    mode: 'browser-hybrid',
    parsedTranscript: parseTranscriptInput(SAMPLE_BROWSER_TRANSCRIPT_JSONL),
    milestones: STUDIO_RELEASE_MILESTONES,
  });
  assert.ok(brief.includes('Zoth Chronicle Hub'));
  assert.ok(!brief.includes('e3b0c44298'));
  assert.ok(!brief.includes(FAKE_HOME));
  assert.ok(STUDIO_RELEASE_MILESTONES.length >= 5);
});
