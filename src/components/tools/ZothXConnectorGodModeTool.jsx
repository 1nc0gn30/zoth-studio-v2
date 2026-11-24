import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  LinearProgress,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  useCopy,
  downloadJson,
  MONO,
  rgba,
} from '../sovereign';

const ACCENT_DARK = '#38BDF8';
const ACCENT_LIGHT = '#0369A1';

const X_LIMIT = 280;
const TCO_URL_LENGTH = 23;

// Matches http(s):// URLs cleanly for X t.co 23-char length accounting
const URL_REGEX = /https?:\/\/[^\s<>()]+/gi;

function measureXText(text) {
  const raw = String(text || '');
  const urls = raw.match(URL_REGEX) || [];
  let weighted = 0;

  // Replace every matched URL with a 23-char placeholder before counting characters
  const normalized = raw.replace(URL_REGEX, () => 'X'.repeat(TCO_URL_LENGTH));

  // Approximate X weighted length: ASCII/Latin = 1, emoji/CJK/supplementary code points = 2
  for (const ch of normalized) {
    const cp = ch.codePointAt(0);
    if (
      cp > 0xffff ||
      (cp >= 0x1100 && cp <= 0x11ff) ||
      (cp >= 0x2e80 && cp <= 0x9fff) ||
      (cp >= 0xac00 && cp <= 0xd7af) ||
      (cp >= 0xf900 && cp <= 0xfaff)
    ) {
      weighted += 2;
    } else {
      weighted += 1;
    }
  }

  return {
    rawLength: raw.length,
    weightedLength: weighted,
    urlCount: urls.length,
    urls,
  };
}

function splitLongText(text, maxLen) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (measureXText(trimmed).weightedLength <= maxLen) return [trimmed];

  // Sentence-aware tokenization (keeps punctuation attached)
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let current = '';

  const flushCurrent = () => {
    if (current.trim()) {
      chunks.push(current.trim());
      current = '';
    }
  };

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (measureXText(candidate).weightedLength <= maxLen) {
      current = candidate;
      continue;
    }

    if (current) {
      flushCurrent();
    }

    if (measureXText(sentence).weightedLength <= maxLen) {
      current = sentence;
      continue;
    }

    // Sentence alone exceeds maxLen -> split cleanly by words
    const words = sentence.split(/\s+/);
    let wordBuf = '';
    for (const word of words) {
      const nextBuf = wordBuf ? `${wordBuf} ${word}` : word;
      if (measureXText(nextBuf).weightedLength <= maxLen) {
        wordBuf = nextBuf;
      } else {
        if (wordBuf) {
          chunks.push(wordBuf);
          wordBuf = '';
        }
        // Single token longer than maxLen (unless it's a URL which counts as 23)
        if (measureXText(word).weightedLength <= maxLen) {
          wordBuf = word;
        } else {
          let sliceBuf = '';
          for (const ch of word) {
            if (measureXText(sliceBuf + ch).weightedLength > maxLen) {
              chunks.push(sliceBuf);
              sliceBuf = ch;
            } else {
              sliceBuf += ch;
            }
          }
          wordBuf = sliceBuf;
        }
      }
    }
    if (wordBuf) {
      current = wordBuf;
    }
  }

  flushCurrent();
  return chunks;
}

function buildThreadPosts(rawInput, { addNumbering, numberingStyle, splitParagraphs }) {
  const clean = String(rawInput || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  // Explicit manual breaks `---` always split; blank lines split when splitParagraphs is true
  const rawBlocks = splitParagraphs
    ? clean.split(/\n\s*(?:---\s*\n|\n)+/).map((b) => b.trim()).filter(Boolean)
    : clean.split(/\n\s*---\s*\n/).map((b) => b.trim()).filter(Boolean);

  // Two-pass split so numbering suffix/prefix bytes are accurately reserved (even across 9 -> 10 posts)
  const runSplit = (reserveBytes) => {
    const effectiveLimit = Math.max(40, X_LIMIT - reserveBytes);
    const out = [];
    for (const block of rawBlocks) {
      const pieces = splitLongText(block, effectiveLimit);
      out.push(...pieces);
    }
    return out;
  };

  let bodies = runSplit(0);
  if (addNumbering) {
    // First estimate with conservative suffix length based on initial count
    const estReserve = ` ${bodies.length}/${bodies.length}`.length + 1;
    bodies = runSplit(estReserve);
    // Re-check if count crossed a digit boundary (e.g., 9 -> 10)
    const exactReserve = ` ${bodies.length}/${bodies.length}`.length;
    if (exactReserve > estReserve) {
      bodies = runSplit(exactReserve);
    }
  }

  const total = bodies.length;
  return bodies.map((body, idx) => {
    const tag = `${idx + 1}/${total}`;
    const text =
      addNumbering && total > 1
        ? numberingStyle === 'prefix'
          ? `${tag} ${body}`
          : `${body} ${tag}`
        : body;
    const stats = measureXText(text);
    return {
      index: idx + 1,
      total,
      text,
      ...stats,
      overLimit: stats.weightedLength > X_LIMIT,
    };
  });
}

function analyzeHook(firstPost) {
  if (!firstPost || !firstPost.text.trim()) {
    return { score: 0, signals: [{ ok: false, text: 'Write an opening post to analyze hook strength' }] };
  }
  const text = firstPost.text.trim();
  const firstLine = text.split('\n')[0].trim();
  const hasNumberOrMetric = /\b\d+(?:\.\d+)?[%xXkKmM+]*\b/.test(firstLine);
  const hasExternalUrl = firstPost.urlCount > 0;
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];
  const foldReadable = firstLine.length >= 25 && firstLine.length <= 140;
  const hasClearOpening = !/^(hey everyone|hi guys|just wanted to share|thread:?)$/i.test(firstLine);

  const signals = [
    {
      ok: foldReadable,
      text:
        firstLine.length > 140
          ? `Opening line is ${firstLine.length} chars — break into a tighter punch line (<=140 chars)`
          : firstLine.length < 25
          ? 'Opening line is very short — add concrete payoff'
          : `Clean above-the-fold opening line (${firstLine.length} chars)`,
    },
    {
      ok: hasNumberOrMetric,
      text: hasNumberOrMetric
        ? 'Includes concrete number/metric in opening line'
        : 'Add a concrete metric, count, or timeframe to anchor the hook',
    },
    {
      ok: !hasExternalUrl,
      text: hasExternalUrl
        ? 'External URL detected in post #1 — move links to the final reply to protect feed distribution'
        : 'No external URL in post #1 (link-safe hook)',
    },
    {
      ok: hashtags.length <= 2,
      text:
        hashtags.length > 2
          ? `${hashtags.length} hashtags detected — keep to 0–2 max`
          : `Hashtag hygiene clean (${hashtags.length} used)`,
    },
    {
      ok: hasClearOpening,
      text: hasClearOpening
        ? 'Direct lead-in without generic filler opener'
        : 'Replace generic opener ("Hey everyone / Thread:") with the core takeaway',
    },
  ];

  const score = Math.round((signals.filter((s) => s.ok).length / signals.length) * 100);
  return { score, firstLine, signals };
}

function shellQuote(str) {
  return `'${String(str || '').replace(/'/g, `'\\''`)}'`;
}

const DEFAULT_THREAD_DRAFT = `We shipped 80+ local-first developer utilities inside ZothOS Studio v2 without a single paywall or cloud lock-in.

Here is the exact architecture behind running real browser workbenches alongside local CLI daemons (and keeping every OAuth token in chmod 600 storage on your own disk).

1. Every tool starts from one shared dual-theme design kit (Obsidian dark + Alabaster ivory light) with zero external SaaS dependencies for client-side parsing, crypto, CVSS math, and payload synthesis.

2. Local connectors expose loopback HTTP endpoints (127.0.0.1) plus scriptable CLI flags with --dry-run enabled by default so agents never fire live network writes by accident.

Explore the full open-access studio and source repos at https://zoth.nullai.tech/tools and https://github.com/1nc0gn30/zoth-x-connector`;

export default function ZothXConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const [draft, setDraft] = useState(DEFAULT_THREAD_DRAFT);
  const [addNumbering, setAddNumbering] = useState(true);
  const [numberingStyle, setNumberingStyle] = useState('suffix');
  const [splitParagraphs, setSplitParagraphs] = useState(true);
  const [replySettings, setReplySettings] = useState('everyone');
  const [accountHandle, setAccountHandle] = useState('1nc0gn30');
  const [delaySeconds, setDelaySeconds] = useState('4');
  const [dryRun, setDryRun] = useState(true);

  const posts = useMemo(
    () => buildThreadPosts(draft, { addNumbering, numberingStyle, splitParagraphs }),
    [draft, addNumbering, numberingStyle, splitParagraphs],
  );

  const hookReport = useMemo(() => analyzeHook(posts[0]), [posts]);

  const totalUrls = useMemo(
    () => posts.reduce((sum, p) => sum + p.urlCount, 0),
    [posts],
  );
  const maxWeighted = useMemo(
    () => posts.reduce((m, p) => Math.max(m, p.weightedLength), 0),
    [posts],
  );
  const overflowCount = useMemo(
    () => posts.filter((p) => p.overLimit).length,
    [posts],
  );

  // Real X API v2 POST /2/tweets payload sequence with reply chaining
  const apiPayloads = useMemo(() => {
    return posts.map((post, idx) => {
      const body = { text: post.text };
      if (replySettings !== 'everyone' && idx === 0) {
        body.reply_settings = replySettings;
      }
      if (idx > 0) {
        body.reply = {
          in_reply_to_tweet_id: `<tweet_id_from_post_${idx}>`,
        };
      }
      return {
        step: idx + 1,
        method: 'POST',
        endpoint: 'https://api.twitter.com/2/tweets',
        weighted_chars: post.weightedLength,
        tco_urls: post.urlCount,
        body,
      };
    });
  }, [posts, replySettings]);

  const apiPayloadJson = useMemo(
    () =>
      JSON.stringify(
        {
          connector: 'zoth-x-connector',
          api_version: 'v2',
          mode: dryRun ? 'dry-run' : 'live',
          account: accountHandle.trim() || '1nc0gn30',
          post_count: apiPayloads.length,
          delay_seconds: Math.max(0, parseInt(delaySeconds, 10) || 0),
          requests: apiPayloads,
        },
        null,
        2,
      ),
    [apiPayloads, dryRun, accountHandle, delaySeconds],
  );

  const cliCommand = useMemo(() => {
    const cleanAccount = (accountHandle.trim() || '1nc0gn30').replace(/^@+/, '');
    const delayNum = Math.max(0, parseInt(delaySeconds, 10) || 4);
    const lines = [
      `# Save payload JSON locally as ./x-thread-payload.json, then run:`,
      `zoth-x-connector thread \\`,
      `  --account ${shellQuote(cleanAccount)} \\`,
      `  --input ./x-thread-payload.json \\`,
      `  --delay ${delayNum} \\`,
      dryRun
        ? `  --dry-run   # Default safe mode: validates OAuth vault & payloads without posting`
        : `  --live      # Explicitly publishes chained POST /2/tweets via local Zoth Vault OAuth`,
    ];
    return lines.join('\n');
  }, [accountHandle, delaySeconds, dryRun]);

  const plainThreadText = useMemo(
    () => posts.map((p) => p.text).join('\n\n---\n\n'),
    [posts],
  );

  const handleDownloadPayload = () => {
    downloadJson(JSON.parse(apiPayloadJson), 'zoth-x-thread-v2-payload.json');
  };

  const kpis = [
    {
      label: 'Thread Posts',
      value: String(posts.length),
      unit: overflowCount === 0 ? 'all <= 280 chars' : `${overflowCount} over limit`,
      accent: overflowCount === 0 ? '#34D399' : '#EF4444',
    },
    {
      label: 'Peak Post Length',
      value: `${maxWeighted}/${X_LIMIT}`,
      unit: `${totalUrls} t.co URL${totalUrls === 1 ? '' : 's'} (23c)`,
      accent: maxWeighted > 275 ? '#EF4444' : maxWeighted > 240 ? '#F59E0B' : '#38BDF8',
    },
    {
      label: 'Hook Score',
      value: `${hookReport.score}%`,
      unit: 'post #1 analyzer',
      accent: hookReport.score >= 80 ? '#34D399' : '#D4AF37',
    },
    {
      label: 'CLI Mode',
      value: dryRun ? 'DRY-RUN' : 'LIVE FLAG',
      unit: `@${(accountHandle.trim() || '1nc0gn30').replace(/^@+/, '')}`,
      accent: dryRun ? '#34D399' : '#F59E0B',
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={dryRun ? 'online' : 'standby'}
        label={
          dryRun
            ? 'DRY-RUN DEFAULT · X API v2 PAYLOAD SYNTHESIZER (NO NETWORK POSTS)'
            : 'LIVE CLI FLAG PREVIEW · CREDENTIALS STAY LOCAL IN ZOTH VAULT'
        }
        accent={accent}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'cli' ? 'Copied Dry-Run CLI' : dryRun ? 'Copy Dry-Run CLI' : 'Copy CLI Command',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(cliCommand, 'cli'),
      primary: true,
    },
    {
      label: copied === 'thread' ? 'Copied Thread Text' : 'Copy Full Thread',
      icon: copied === 'thread' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(plainThreadText, 'thread'),
    },
    {
      label: 'Download API v2 JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadPayload,
    },
    {
      label: 'zoth-x-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/zoth-x-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="AUTO-SPLITTER · T.CO 23-CHAR ACCOUNTING"
        title="X / Twitter Thread Composer"
        subtitle="Write multi-paragraph copy; use blank lines or --- for explicit breaks. Long blocks split automatically on sentence boundaries <= 280 weighted chars."
        accent={accent}
      >
        <TextField
          label="Multi-Paragraph Thread Draft"
          multiline
          minRows={10}
          fullWidth
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your thread here. Blank lines or --- create new posts; long paragraphs auto-split at 280 chars..."
          sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.6 } }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={addNumbering}
                onChange={(e) => setAddNumbering(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem' }}>
                Append 1/N thread numbering (reserved before splitting)
              </Typography>
            }
          />
          {addNumbering && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, pl: 1, mb: 0.5 }}>
              {[
                { id: 'suffix', label: 'Suffix (… 1/N)' },
                { id: 'prefix', label: 'Prefix (1/N …)' },
              ].map((style) => {
                const active = numberingStyle === style.id;
                return (
                  <Chip
                    key={style.id}
                    label={style.label}
                    size="small"
                    clickable
                    onClick={() => setNumberingStyle(style.id)}
                    sx={{
                      minHeight: 32,
                      fontFamily: MONO,
                      fontSize: '0.71rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.primary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                );
              })}
            </Box>
          )}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={splitParagraphs}
                onChange={(e) => setSplitParagraphs(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem' }}>
                Split on blank lines (turn off to pack paragraphs tightly up to 280)
              </Typography>
            }
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="POST #1 DISTRIBUTION DIAGNOSTICS"
        title="Hook-Line Analyzer"
        subtitle="Deterministic audit of your opening tweet's above-the-fold length, specificity, link safety, and hashtag count"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <SovereignGauge
            value={hookReport.score}
            max={100}
            label="HOOK"
            unit="%"
            status={hookReport.score >= 80 ? 'STRONG' : hookReport.score >= 60 ? 'SOLID' : 'TUNE'}
            thresholds={{ warn: 75, danger: 45 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary', mb: 0.4 }}>
              DETECTED OPENING LINE
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 }}>
              “{hookReport.firstLine || '—'}”
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
          {hookReport.signals.map((sig, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              {sig.ok ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#34D399', mt: 0.15, flexShrink: 0 }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B', mt: 0.15, flexShrink: 0 }} />
              )}
              <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: sig.ok ? 'text.secondary' : 'text.primary', lineHeight: 1.45 }}>
                {sig.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE SPLIT PREVIEW & CHAR BARS"
        title={`Generated Thread (${posts.length} Post${posts.length === 1 ? '' : 's'})`}
        subtitle="Progress bars track X-weighted character length with every http(s) URL normalized to 23 chars (t.co)"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {posts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
              Start typing in the Thread Composer to generate split posts.
            </Typography>
          ) : (
            posts.map((post) => {
              const barColor =
                post.weightedLength > X_LIMIT || post.weightedLength > 275
                  ? '#EF4444'
                  : post.weightedLength > 240
                  ? '#F59E0B'
                  : '#34D399';
              const pct = Math.min(100, (post.weightedLength / X_LIMIT) * 100);
              const copyKey = `post-${post.index}`;
              return (
                <Box
                  key={post.index}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: post.overLimit ? '#EF4444' : 'divider',
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 0.75, mb: 0.85 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
                      <Chip
                        size="small"
                        label={`POST ${post.index}/${post.total}`}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.67rem',
                          fontWeight: 700,
                          bgcolor: rgba(accent, 0.14),
                          color: accent,
                        }}
                      />
                      {post.urlCount > 0 && (
                        <Chip
                          size="small"
                          label={`${post.urlCount} URL · t.co 23c`}
                          sx={{ fontFamily: MONO, fontSize: '0.64rem' }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: barColor,
                        }}
                      >
                        {post.weightedLength} / {X_LIMIT}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={
                          copied === copyKey ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />
                        }
                        onClick={() => copy(post.text, copyKey)}
                        sx={{ minHeight: 32, fontFamily: MONO, fontSize: '0.7rem', textTransform: 'none' }}
                      >
                        {copied === copyKey ? 'Copied' : 'Copy'}
                      </Button>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '0.86rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      mb: 1,
                    }}
                  >
                    {post.text}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: barColor },
                    }}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="X API v2 REQUEST CHAIN & DRY-RUN CLI"
        title="POST /2/tweets Payload & Local Runner"
        subtitle="Generates chained reply.in_reply_to_tweet_id JSON payloads and dry-run zoth-x-connector CLI commands"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center', mb: 1.75 }}>
          <TextField
            size="small"
            label="Account Handle"
            value={accountHandle}
            onChange={(e) => setAccountHandle(e.target.value)}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="Reply Delay (s)"
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            sx={{ width: 125, '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700 }}>
                --dry-run (safe default)
              </Typography>
            }
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary', mb: 0.75 }}>
          REPLY SETTINGS (POST #1)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.75 }}>
          {[
            { id: 'everyone', label: 'Everyone' },
            { id: 'following', label: 'Following' },
            { id: 'mentionedUsers', label: 'Mentioned Only' },
          ].map((opt) => {
            const active = replySettings === opt.id;
            return (
              <Chip
                key={opt.id}
                label={opt.label}
                size="small"
                clickable
                onClick={() => setReplySettings(opt.id)}
                sx={{
                  minHeight: 32,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title="ZOTH-X-CONNECTOR CLI COMMAND"
          badge={dryRun ? 'DRY-RUN' : 'LIVE FLAG'}
          code={cliCommand}
          filename="run-x-thread.sh"
        />

        <Box sx={{ mt: 1.75 }}>
          <SovereignCodeBlock
            title="X API v2 POST /2/tweets PAYLOAD SEQUENCE"
            badge={`${apiPayloads.length} REQUESTS`}
            code={apiPayloadJson}
            filename="zoth-x-thread-v2-payload.json"
            maxHeight={310}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Dry-Run by Default — Local OAuth Execution Only"
          message="This browser studio splits threads, applies 23-char t.co URL accounting, analyzes your opening hook, and builds X API v2 POST /2/tweets JSON payloads locally. Publishing happens only via your local zoth-x-connector daemon (:8152) with Zoth Vault OAuth credentials."
        />
      </Box>
      <SovereignWorkstationShell
        id="zoth-x-connector"
        category="SWARM & SOCIAL · X API v2"
        title="Zoth X Connector"
        subtitle="Sentence-aware 280-char thread auto-splitter with t.co 23-char URL accounting, opening hook-line analyzer, chained X API v2 JSON payload preview, and dry-run CLI generator."
        version="1.0.0"
        variant="braille-orbit"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
