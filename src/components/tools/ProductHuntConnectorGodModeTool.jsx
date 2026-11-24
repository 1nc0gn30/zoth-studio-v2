import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Checkbox,
  LinearProgress,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
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
  downloadText,
  MONO,
  DISPLAY,
  rgba,
} from '../sovereign';

const ACCENT_DARK = '#DA552F';
const ACCENT_LIGHT = '#B43B18';

const NAME_LIMIT = 40;
const TAGLINE_LIMIT = 60;
const DESC_LIMIT = 260;
const MAX_TOPICS = 3;

const TOPIC_CATALOG = [
  'Developer Tools',
  'Open Source',
  'Artificial Intelligence',
  'Productivity',
  'Linux',
  'Privacy',
  'Security',
  'APIs',
  'Command Line',
  'Design Tools',
  'SaaS',
  'Tech',
];

const CHECKLIST_ITEMS = [
  {
    id: 'gallery-1270x760',
    label: 'Gallery images exported at 1270×760 px',
    detail: '3–5 crisp PNG/JPG product screenshots (<3 MB each, readable captions, zero clutter)',
    weight: 6,
  },
  {
    id: 'thumb-240x240',
    label: 'Thumbnail icon exported at 240×240 px',
    detail: 'High-contrast square emblem or subtle GIF that stays legible at 48px feed size',
    weight: 6,
  },
  {
    id: 'demo-video',
    label: '30–60s walkthrough video or interactive demo URL',
    detail: 'Show the real interface working in the first 5 seconds with no long logo bumper',
    weight: 5,
  },
  {
    id: 'maker-comment',
    label: 'First Maker Comment ready to post at T+0 min',
    detail: 'Covers origin story, concrete mechanics, pricing/open-access model, and specific feedback ask',
    weight: 6,
  },
  {
    id: 'schedule-pt',
    label: 'Launch scheduled for 12:01 AM PT (00:01 Pacific)',
    detail: 'Maximizes the full 24-hour Product Hunt daily leaderboard window',
    weight: 6,
  },
  {
    id: 'makers-linked',
    label: 'All makers linked + OG 1200×630 & live site verified',
    detail: 'Confirm HTTPS, zero console errors, working sign-up/download links, and active maker replies',
    weight: 6,
  },
];

const WEAK_FILLER_WORDS = [
  'revolutionary',
  'world-class',
  'cutting-edge',
  'seamless',
  'next-gen',
  'game-changing',
  'ultimate',
  'best-in-class',
  'synergy',
  'disruptive',
];

function analyzeTagline(raw) {
  const text = String(raw || '').trim();
  const len = text.length;
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const lower = text.toLowerCase();
  const flaggedWords = WEAK_FILLER_WORDS.filter((w) => lower.includes(w));
  const endsWithPeriod = /\.$/.test(text);
  const hasExclamation = /!/.test(text);
  const hasAllCapsShout = /\b[A-Z]{4,}\b/.test(text.replace(/\b(CLI|API|OS|AI|SDK|IDE|GPU|MCP|SQL|SSH|PDF|SVG|JSON|HTML|CSS|PWA|APK)\b/g, ''));

  const checks = [
    {
      ok: len >= 20 && len <= TAGLINE_LIMIT,
      text:
        len === 0
          ? 'Enter a tagline (target 25–58 characters)'
          : len > TAGLINE_LIMIT
          ? `Over limit by ${len - TAGLINE_LIMIT} chars (max ${TAGLINE_LIMIT})`
          : len < 20
          ? 'Too brief — add concrete utility or audience'
          : `Concise length (${len}/${TAGLINE_LIMIT} chars)`,
    },
    {
      ok: flaggedWords.length === 0,
      text:
        flaggedWords.length > 0
          ? `Remove hype words: ${flaggedWords.join(', ')}`
          : 'Zero filler/hype adjectives detected',
    },
    {
      ok: !endsWithPeriod && !hasExclamation,
      text:
        endsWithPeriod || hasExclamation
          ? 'Drop trailing periods or exclamation marks for cleaner feed typography'
          : 'Clean punctuation (no trailing period or "!")',
    },
    {
      ok: words.length >= 4 && words.length <= 10 && !hasAllCapsShout,
      text: hasAllCapsShout
        ? 'Avoid ALL-CAPS shouting outside technical acronyms'
        : words.length < 4
        ? 'Aim for 4–10 crisp words describing what it does'
        : words.length > 10
        ? `Dense (${words.length} words) — tighten to <= 10 words`
        : `Punchy word cadence (${words.length} words)`,
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  return {
    len,
    words: words.length,
    passed,
    total: checks.length,
    checks,
    status: passed === checks.length ? 'sharp' : passed >= 2 ? 'fair' : 'weak',
  };
}

function slugify(str) {
  return (
    String(str || 'product-hunt-launch')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'product-hunt-launch'
  );
}

export default function ProductHuntConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const [productName, setProductName] = useState('ZothOS Studio');
  const [tagline, setTagline] = useState('Local-first Linux workstation and 80-tool AI dev suite');
  const [description, setDescription] = useState(
    'ZothOS packages local AI harnesses, CLI automation connectors, security triage tools, and a browser-accessible studio into one open-access workspace. Zero paywalls, local credential storage, and deterministic builds.',
  );
  const [websiteUrl, setWebsiteUrl] = useState('https://zoth.nullai.tech');
  const [githubUrl, setGithubUrl] = useState('https://github.com/1nc0gn30/zoth-studio-v2');
  const [topics, setTopics] = useState(['Developer Tools', 'Open Source', 'Linux']);
  const [makerComment, setMakerComment] = useState(
    `Hey Product Hunt — I built ZothOS Studio after getting tired of juggling fragmented browser tabs, paywalled dev utilities, and cloud-only agent wrappers.

What it does:
- Ships 80+ browser and local CLI utilities in one unified studio
- Keeps API tokens and workflow manifests on your own machine (chmod 600)
- Runs 100% free and open-access with zero feature locks

How it works under the hood:
- React + MUI v5 dual-theme studio paired with zero-dependency local Python/Node daemons
- Every connector exposes both a live web workbench and a scriptable CLI

I'd love honest feedback on the onboarding flow and which local connector you'd want built next.`,
  );

  const [checkedIds, setCheckedIds] = useState({
    'gallery-1270x760': true,
    'thumb-240x240': true,
    'demo-video': false,
    'maker-comment': true,
    'schedule-pt': false,
    'makers-linked': true,
  });

  const taglineAnalysis = useMemo(() => analyzeTagline(tagline), [tagline]);

  const toggleTopic = (topic) => {
    setTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      if (prev.length >= MAX_TOPICS) return prev;
      return [...prev, topic];
    });
  };

  const toggleChecklist = (id) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const readiness = useMemo(() => {
    let score = 0;
    const breakdown = [];

    // 1. Product Name (10 pts)
    const nameTrim = productName.trim();
    const nameOk = nameTrim.length >= 2 && nameTrim.length <= NAME_LIMIT;
    const namePts = nameOk ? 10 : nameTrim.length > 0 ? 4 : 0;
    score += namePts;
    breakdown.push({ label: 'Name (<=40)', pts: namePts, max: 10, ok: nameOk });

    // 2. Tagline length + punchiness (15 pts)
    const tagPts =
      tagline.trim().length > TAGLINE_LIMIT
        ? 0
        : Math.round((taglineAnalysis.passed / taglineAnalysis.total) * 15);
    score += tagPts;
    breakdown.push({
      label: 'Tagline (<=60)',
      pts: tagPts,
      max: 15,
      ok: taglineAnalysis.passed === taglineAnalysis.total,
    });

    // 3. Description (15 pts)
    const descLen = description.trim().length;
    const descOk = descLen >= 80 && descLen <= DESC_LIMIT;
    const descPts = descOk ? 15 : descLen > 0 && descLen <= DESC_LIMIT ? 8 : 0;
    score += descPts;
    breakdown.push({ label: 'Description (<=260)', pts: descPts, max: 15, ok: descOk });

    // 4. Topics 1..3 (10 pts)
    const topicsPts = topics.length === 3 ? 10 : topics.length === 2 ? 7 : topics.length === 1 ? 4 : 0;
    score += topicsPts;
    breakdown.push({ label: 'Topics (up to 3)', pts: topicsPts, max: 10, ok: topics.length >= 2 });

    // 5. Maker Comment (15 pts)
    const commentLen = makerComment.trim().length;
    const commentOk = commentLen >= 160;
    const commentPts = commentOk ? 15 : commentLen >= 60 ? 8 : commentLen > 0 ? 3 : 0;
    score += commentPts;
    breakdown.push({ label: 'Maker Comment', pts: commentPts, max: 15, ok: commentOk });

    // 6. Launch-Day Checklist (35 pts total)
    const checklistPts = CHECKLIST_ITEMS.reduce(
      (sum, item) => sum + (checkedIds[item.id] ? item.weight : 0),
      0,
    );
    const completedChecklist = CHECKLIST_ITEMS.filter((i) => checkedIds[i.id]).length;
    score += checklistPts;
    breakdown.push({
      label: `Checklist (${completedChecklist}/${CHECKLIST_ITEMS.length})`,
      pts: checklistPts,
      max: 35,
      ok: completedChecklist === CHECKLIST_ITEMS.length,
    });

    const capped = Math.min(100, score);
    const tier =
      capped >= 90
        ? 'LAUNCH READY'
        : capped >= 70
        ? 'ALMOST READY'
        : capped >= 45
        ? 'IN PROGRESS'
        : 'DRAFT';

    return {
      score: capped,
      tier,
      completedChecklist,
      breakdown,
    };
  }, [productName, tagline, taglineAnalysis, description, topics, makerComment, checkedIds]);

  const launchKitJson = useMemo(
    () => ({
      schema: 'zoth.producthunt.launch_kit.v1',
      readiness_score: readiness.score,
      readiness_status: readiness.tier,
      product: {
        name: productName.trim(),
        name_chars: productName.length,
        tagline: tagline.trim(),
        tagline_chars: tagline.length,
        tagline_punchiness: `${taglineAnalysis.passed}/${taglineAnalysis.total}`,
        description: description.trim(),
        description_chars: description.length,
        website_url: websiteUrl.trim(),
        github_url: githubUrl.trim(),
        topics,
      },
      first_maker_comment: makerComment.trim(),
      assets_spec: {
        gallery_px: '1270x760',
        thumbnail_px: '240x240',
        launch_window_pt: '00:01 PT',
      },
      checklist: CHECKLIST_ITEMS.map((item) => ({
        id: item.id,
        label: item.label,
        done: Boolean(checkedIds[item.id]),
      })),
      cli_companion: {
        local_port: 8139,
        commands: ['zoth-ph status', 'python3 server.py --port 8139'],
      },
    }),
    [
      readiness,
      productName,
      tagline,
      taglineAnalysis,
      description,
      websiteUrl,
      githubUrl,
      topics,
      makerComment,
      checkedIds,
    ],
  );

  const launchKitMarkdown = useMemo(() => {
    const checklistMd = CHECKLIST_ITEMS.map(
      (item) => `- [${checkedIds[item.id] ? 'x' : ' '}] **${item.label}** — ${item.detail}`,
    ).join('\n');

    return `# Product Hunt Launch Kit — ${productName.trim() || 'Untitled Product'}

- **Readiness Score:** ${readiness.score}/100 (${readiness.tier})
- **Name (${productName.length}/${NAME_LIMIT}):** ${productName.trim()}
- **Tagline (${tagline.length}/${TAGLINE_LIMIT}):** ${tagline.trim()}
- **Topics (${topics.length}/${MAX_TOPICS}):** ${topics.join(', ') || 'None selected'}
- **Website:** ${websiteUrl.trim() || 'TBD'}
- **GitHub:** ${githubUrl.trim() || 'TBD'}

## Description (${description.length}/${DESC_LIMIT} chars)

${description.trim()}

## First Maker Comment

${makerComment.trim()}

## Launch-Day Checklist (${readiness.completedChecklist}/${CHECKLIST_ITEMS.length})

${checklistMd}
`;
  }, [
    productName,
    tagline,
    description,
    websiteUrl,
    githubUrl,
    topics,
    makerComment,
    checkedIds,
    readiness,
  ]);

  const kitJsonString = useMemo(() => JSON.stringify(launchKitJson, null, 2), [launchKitJson]);

  const handleDownloadJson = () => {
    downloadJson(launchKitJson, `${slugify(productName)}-ph-launch-kit.json`);
  };

  const handleDownloadMd = () => {
    downloadText(
      launchKitMarkdown,
      `${slugify(productName)}-ph-launch-kit.md`,
      'text/markdown;charset=utf-8',
    );
  };

  const nameOver = productName.length > NAME_LIMIT;
  const tagOver = tagline.length > TAGLINE_LIMIT;
  const descOver = description.length > DESC_LIMIT;

  const kpis = [
    {
      label: 'Readiness',
      value: `${readiness.score}%`,
      unit: readiness.tier,
      accent: readiness.score >= 85 ? '#34D399' : readiness.score >= 60 ? '#F59E0B' : '#EF4444',
    },
    {
      label: 'Tagline',
      value: `${tagline.length}/${TAGLINE_LIMIT}`,
      unit: `punchiness ${taglineAnalysis.passed}/${taglineAnalysis.total}`,
      accent: tagOver ? '#EF4444' : '#DA552F',
    },
    {
      label: 'Topics',
      value: `${topics.length}/${MAX_TOPICS}`,
      unit: topics[0] || 'Select topics',
      accent: '#D4AF37',
    },
    {
      label: 'Checklist',
      value: `${readiness.completedChecklist}/${CHECKLIST_ITEMS.length}`,
      unit: '12:01 AM PT prep',
      accent: '#38BDF8',
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={readiness.score >= 85 ? 'online' : 'standby'}
        label={`LAUNCH KIT READINESS · ${readiness.score}/100 (${readiness.tier})`}
        accent={accent}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'comment' ? 'Copied Maker Comment' : 'Copy Maker Comment',
      icon: copied === 'comment' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(makerComment, 'comment'),
      primary: true,
    },
    {
      label: 'Download Kit JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadJson,
    },
    {
      label: 'Download Kit Markdown',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadMd,
    },
    {
      label: 'producthunt-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/producthunt-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="LISTING METADATA & CHARACTER LIMITS"
        title="Product Hunt Launch Kit Builder"
        subtitle="Enforces official Product Hunt limits: 40-char name, 60-char tagline, 260-char description, max 3 topics"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {/* Product Name */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                PRODUCT NAME
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: nameOver ? '#EF4444' : 'text.secondary',
                }}
              >
                {productName.length} / {NAME_LIMIT}
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              error={nameOver}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. ZothOS Studio"
              sx={{ '& input': { fontFamily: MONO, fontSize: '0.84rem' } }}
            />
          </Box>

          {/* Tagline + live punchiness */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                TAGLINE (60-CHAR LIMIT + PUNCHINESS CHECK)
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: tagOver ? '#EF4444' : tagline.length >= 20 ? '#34D399' : '#F59E0B',
                }}
              >
                {tagline.length} / {TAGLINE_LIMIT}
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              error={tagOver}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Concise one-line description of what your product does"
              sx={{ '& input': { fontFamily: MONO, fontSize: '0.82rem' } }}
            />
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (tagline.length / TAGLINE_LIMIT) * 100)}
              sx={{
                mt: 0.75,
                height: 5,
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: tagOver ? '#EF4444' : tagline.length >= 52 ? '#F59E0B' : '#34D399',
                },
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, mt: 1 }}>
              {taglineAnalysis.checks.map((chk, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                  {chk.ok ? (
                    <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#34D399', flexShrink: 0 }} />
                  ) : (
                    <WarningAmberIcon sx={{ fontSize: 15, color: '#F59E0B', flexShrink: 0 }} />
                  )}
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: chk.ok ? 'text.secondary' : 'text.primary' }}>
                    {chk.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Description */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                DESCRIPTION (260-CHAR LIMIT)
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: descOver ? '#EF4444' : 'text.secondary',
                }}
              >
                {description.length} / {DESC_LIMIT}
              </Typography>
            </Box>
            <TextField
              multiline
              minRows={3}
              fullWidth
              error={descOver}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.79rem', lineHeight: 1.55 } }}
            />
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (description.length / DESC_LIMIT) * 100)}
              sx={{
                mt: 0.75,
                height: 5,
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: descOver ? '#EF4444' : description.length >= 230 ? '#F59E0B' : '#34D399',
                },
              }}
            />
          </Box>

          {/* URLs */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Product URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              sx={{ flex: '1 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              label="GitHub / Repo URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              sx={{ flex: '1 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>

          {/* Topics selector (up to 3) */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                TOPICS (SELECT UP TO {MAX_TOPICS})
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: accent, fontWeight: 700 }}>
                {topics.length} / {MAX_TOPICS} SELECTED
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85 }}>
              {TOPIC_CATALOG.map((topic) => {
                const active = topics.includes(topic);
                const disabled = !active && topics.length >= MAX_TOPICS;
                return (
                  <Chip
                    key={topic}
                    label={topic}
                    clickable={!disabled}
                    disabled={disabled}
                    onClick={() => toggleTopic(topic)}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.primary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="LAUNCH-DAY EXECUTION CHECKLIST"
        title="Assets & 12:01 AM PT Readiness"
        subtitle="Track mandatory Product Hunt asset dimensions (1270×760 gallery, 240×240 thumbnail) and timing"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
          {CHECKLIST_ITEMS.map((item) => {
            const done = Boolean(checkedIds[item.id]);
            return (
              <Box
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                sx={{
                  p: 1.15,
                  borderRadius: 1.25,
                  border: '1px solid',
                  borderColor: done ? rgba('#34D399', 0.45) : 'divider',
                  bgcolor: done
                    ? isDark
                      ? 'rgba(52,211,153,0.06)'
                      : 'rgba(16,185,129,0.06)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  size="small"
                  checked={done}
                  onChange={() => toggleChecklist(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ p: 0.25, mt: 0.1 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.45 }}>
                    {item.detail}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE READINESS SCORE & FEED PREVIEW"
        title="Launch Readiness Gauge"
        subtitle="Deterministic 100-point score computed from field limits, tagline quality, maker comment, and checklist"
        accent={accent}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <SovereignGauge
            value={readiness.score}
            max={100}
            label="READINESS"
            unit="%"
            status={readiness.tier}
            thresholds={{ warn: 70, danger: 45 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 220px', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {readiness.breakdown.map((b) => (
              <Chip
                key={b.label}
                size="small"
                label={`${b.label}: ${b.pts}/${b.max}`}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: b.ok ? rgba('#34D399', 0.14) : rgba('#F59E0B', 0.14),
                  color: isDark ? (b.ok ? '#34D399' : '#F59E0B') : '#101828',
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Live Product Hunt feed row preview */}
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
          FEED CARD PREVIEW (240×240 THUMB + LISTING COPY)
        </Typography>
        <Box
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? '#0B0C12' : '#FAF9F6',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: '1 1 240px' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                flexShrink: 0,
                bgcolor: rgba(accent, 0.16),
                border: `1.5px solid ${accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: DISPLAY,
                fontSize: '1.25rem',
                color: accent,
              }}
            >
              {(productName.trim()[0] || 'P').toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.25 }}>
                {productName.trim() || 'Product Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.25 }}>
                {tagline.trim() || 'Add your concise 60-character tagline...'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                {topics.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    size="small"
                    sx={{ height: 20, fontFamily: MONO, fontSize: '0.64rem' }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.9,
              borderRadius: 1.25,
              border: `1px solid ${rgba(accent, 0.5)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 58,
            }}
          >
            <ArrowDropUpIcon sx={{ color: accent, fontSize: 22, my: -0.5 }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
              UPVOTE
            </Typography>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="T+0 MINUTE LAUNCH COMMENT"
        title="First Maker Comment Editor"
        subtitle="Post immediately at 12:01 AM PT to anchor context, tech details, and invite technical questions"
        accent={accent}
      >
        <TextField
          multiline
          minRows={8}
          fullWidth
          value={makerComment}
          onChange={(e) => setMakerComment(e.target.value)}
          sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.6 } }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1.25 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
            {makerComment.trim() ? makerComment.trim().split(/\s+/).length : 0} words · {makerComment.length} chars
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={copied === 'inline-comment' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              onClick={() => copy(makerComment, 'inline-comment')}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                bgcolor: accent,
                color: '#FFFFFF',
              }}
            >
              {copied === 'inline-comment' ? 'Copied Comment' : 'Copy Maker Comment'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleDownloadMd}
              sx={{ minHeight: 40, fontFamily: MONO, fontSize: '0.74rem', textTransform: 'none' }}
            >
              Export Markdown
            </Button>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="EXPORTABLE LAUNCH KIT JSON & LOCAL CLI (:8139)"
        title="Launch Kit Manifest & zoth-ph Companion"
        subtitle="Download JSON for automation or inspect live listing diffs with local zoth-ph"
        accent={accent}
      >
        <SovereignCodeBlock
          title={`${slugify(productName)}-ph-launch-kit.json`}
          badge="JSON"
          code={kitJsonString}
          filename={`${slugify(productName)}-ph-launch-kit.json`}
          maxHeight={260}
        />
        <Box sx={{ mt: 1.5 }}>
          <SovereignCodeBlock
            title="ZOTH-PH LOCAL CLI (:8139)"
            badge="LOCAL TOKEN"
            code={`# Check live listing status & URL diff against ~/.config/zothos/producthunt.secret.json\nzoth-ph status\n\n# Run loopback dashboard on http://127.0.0.1:8139\ncd ~/NullAITech/producthunt-connector && python3 server.py --port 8139`}
            filename="zoth-ph-commands.sh"
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
          title="Browser Launch Kit Builder + Local zoth-ph Cockpit (:8139)"
          message="Draft and validate your Product Hunt copy, tagline punchiness, First Maker Comment, and 12:01 AM PT checklist directly in the browser. API tokens stay strictly local inside ~/.config/zothos/producthunt.secret.json when using zoth-ph."
        />
      </Box>
      <SovereignWorkstationShell
        id="producthunt-connector"
        category="COMMERCE & LAUNCH · ZOTH-PH"
        title="Product Hunt Launch Kit Builder"
        subtitle="Character-enforced Product Hunt listing builder, deterministic tagline punchiness check, First Maker Comment editor, 12:01 AM PT checklist, and JSON/Markdown launch kit exporter."
        version="1.1.0"
        variant="bayer-field"
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
