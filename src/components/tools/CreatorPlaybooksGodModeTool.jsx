import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Checkbox,
  LinearProgress,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadText,
  downloadJson,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';
import { CREATOR_PLAYBOOKS_DATASET } from '../../data/creatorPlaybooksData';

const ACCENT_DARK = '#F59E0B';
const ACCENT_LIGHT = '#9A6F0B';

const STORAGE_BOOKMARKS = 'zoth_creatorplaybooks_bookmarks_v1';
const STORAGE_CHECKS = 'zoth_creatorplaybooks_checks_v1';
const STORAGE_SPRINT = 'zoth_creatorplaybooks_sprint_v1';

const CATEGORY_TABS = [
  { id: 'all', label: 'All (35)' },
  { id: 'netlify-shippers', label: 'Netlify' },
  { id: 'indie-hackers', label: 'Indie hackers' },
  { id: 'big-players', label: 'Larger accounts' },
];

const HORIZONS = [
  { days: 7, label: '7-Day Sprint', phases: ['Days 1–2 · Scope & Study', 'Days 3–5 · Build & Publish', 'Days 6–7 · Review & Distribute'] },
  { days: 14, label: '14-Day Sprint', phases: ['Days 1–4 · Research & Hook Bank', 'Days 5–10 · Daily Ship Cadence', 'Days 11–14 · Synthesis & Retro'] },
  { days: 30, label: '30-Day Sprint', phases: ['Week 1 · Playbook Selection', 'Weeks 2–3 · Repeatable Distribution', 'Week 4 · Owned Hub & Metrics'] },
];

const MENTAL_MODELS = [
  { id: 'owned-hub', label: 'Owned Hub First', note: 'Publish canonical notes on your own domain; treat feeds as trailers.' },
  { id: 'volume-speed', label: 'Volume + Speed', note: 'Test hooks and angles quickly in public to find demand signals.' },
  { id: 'proof-of-work', label: 'Proof of Work', note: 'Show real shipped artifacts, benchmarks, and changelogs over advice.' },
  { id: 'local-first', label: 'Local-First Utility', note: 'Bundle datasets and core tools client-side with zero tracking.' },
  { id: 'source-cited', label: 'Source-Cited Claims', note: 'Attach dates and direct URLs to every public milestone.' },
];

const DEFAULT_SPRINT = {
  goal: 'Apply Maya’s Volume + Speed and Owned Distribution plays over 14 days',
  horizonDays: 14,
  weeklyHours: 8,
  selectedModels: ['owned-hub', 'volume-speed', 'proof-of-work'],
  tasks: [
    { id: 'seed-1', title: 'Audit 3 mentor playbooks and extract 5 concrete hooks', minutes: 45, phase: 'Days 1–4 · Research & Hook Bank', source: 'Maya (@buildwithmaya)', done: false },
    { id: 'seed-2', title: 'Ship one public build update with screenshot + source link', minutes: 60, phase: 'Days 5–10 · Daily Ship Cadence', source: 'KP (@thisiskp_)', done: false },
    { id: 'seed-3', title: 'Publish canonical recap on owned site & export Markdown log', minutes: 40, phase: 'Days 11–14 · Synthesis & Retro', source: 'CreatorPlaybooks', done: false },
  ],
};

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function slugify(str) {
  return String(str || 'playbook-sprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'playbook-sprint';
}

export default function CreatorPlaybooksGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const creators = CREATOR_PLAYBOOKS_DATASET.creators;
  const datasetStats = CREATOR_PLAYBOOKS_DATASET.stats;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [activeCreatorId, setActiveCreatorId] = useState(creators[0]?.id || 'maya');
  const [bookmarks, setBookmarks] = useState(() => readStorage(STORAGE_BOOKMARKS, ['maya', 'kp']));
  const [checkedPlays, setCheckedPlays] = useState(() => readStorage(STORAGE_CHECKS, {}));
  const [sprint, setSprint] = useState(() => readStorage(STORAGE_SPRINT, DEFAULT_SPRINT));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState('35');
  const [exportFormat, setExportFormat] = useState('md');
  const [liveBridge, setLiveBridge] = useState({ checked: false, online: false, version: CREATOR_PLAYBOOKS_DATASET.version });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks)); } catch { /* ignore */ }
  }, [bookmarks]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_CHECKS, JSON.stringify(checkedPlays)); } catch { /* ignore */ }
  }, [checkedPlays]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_SPRINT, JSON.stringify(sprint)); } catch { /* ignore */ }
  }, [sprint]);

  // Safe same-origin loopback status check via Studio API (avoids browser ERR_CONNECTION_REFUSED when :5185 is idle)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 900);
    fetch('/api/studio/status', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const entry = data?.tools?.creatorplaybooks || data?.daemons?.creatorplaybooks || null;
        setLiveBridge({
          checked: true,
          online: Boolean(entry?.online || entry?.up),
          version: CREATOR_PLAYBOOKS_DATASET.version,
        });
      })
      .catch(() => {
        if (!cancelled) setLiveBridge((prev) => ({ ...prev, checked: true, online: false }));
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const filteredCreators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return creators.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (bookmarkedOnly && !bookmarks.includes(c.id)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.plays.some((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      );
    });
  }, [creators, searchQuery, selectedCategory, bookmarkedOnly, bookmarks]);

  const activeCreator = useMemo(
    () => creators.find((c) => c.id === activeCreatorId) || filteredCreators[0] || creators[0],
    [creators, activeCreatorId, filteredCreators]
  );

  const totalPlays = datasetStats.plays;
  const completedPlays = useMemo(
    () => creators.reduce((sum, c) => sum + c.plays.filter((p) => Boolean(checkedPlays[p.id])).length, 0),
    [creators, checkedPlays]
  );

  const toggleBookmark = (id) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const togglePlayCheck = (playId) => {
    setCheckedPlays((prev) => ({ ...prev, [playId]: !prev[playId] }));
  };

  const currentHorizon = HORIZONS.find((h) => h.days === sprint.horizonDays) || HORIZONS[1];

  const handleSetHorizon = (days) => {
    setSprint((prev) => ({ ...prev, horizonDays: days }));
  };

  const handleToggleModel = (modelId) => {
    setSprint((prev) => {
      const exists = prev.selectedModels.includes(modelId);
      return {
        ...prev,
        selectedModels: exists
          ? prev.selectedModels.filter((m) => m !== modelId)
          : [...prev.selectedModels, modelId],
      };
    });
  };

  const handleImportCreatorPlaysToSprint = (creator) => {
    const phase = currentHorizon.phases[1] || currentHorizon.phases[0];
    setSprint((prev) => {
      const existingTitles = new Set(prev.tasks.map((t) => t.title));
      const added = creator.plays
        .filter((p) => !existingTitles.has(`${p.title} (${creator.name})`))
        .map((p) => ({
          id: `pb-${p.id}-${Date.now()}`,
          title: `${p.title} (${creator.name})`,
          minutes: p.frequency === 'Daily' ? 30 : 45,
          phase,
          source: `${creator.name} (${creator.handle})`,
          done: false,
        }));
      return { ...prev, tasks: [...prev.tasks, ...added] };
    });
  };

  const handleAddCustomTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const mins = Math.max(5, Math.min(480, Number.parseInt(newTaskMinutes, 10) || 30));
    setSprint((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: `custom-${Date.now()}`,
          title,
          minutes: mins,
          phase: currentHorizon.phases[0],
          source: 'Custom Step',
          done: false,
        },
      ],
    }));
    setNewTaskTitle('');
  };

  const handleToggleSprintTask = (taskId) => {
    setSprint((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }));
  };

  const handleRemoveSprintTask = (taskId) => {
    setSprint((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const sprintMetrics = useMemo(() => {
    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter((t) => t.done).length;
    const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    const totalMinutes = sprint.tasks.reduce((sum, t) => sum + (Number(t.minutes) || 0), 0);
    const remainingMinutes = sprint.tasks.filter((t) => !t.done).reduce((sum, t) => sum + (Number(t.minutes) || 0), 0);
    const dailyMinutesNeeded = Math.max(1, Math.round(remainingMinutes / Math.max(1, sprint.horizonDays)));
    return { totalTasks, doneTasks, pct, totalMinutes, remainingMinutes, dailyMinutesNeeded };
  }, [sprint]);

  const sprintPlanObject = useMemo(() => ({
    schema: 'creatorplaybooks.sprint/v1.1',
    version: CREATOR_PLAYBOOKS_DATASET.version,
    datasetStats,
    activeMentor: { id: activeCreator.id, name: activeCreator.name, handle: activeCreator.handle },
    goal: sprint.goal,
    horizonDays: sprint.horizonDays,
    weeklyHours: sprint.weeklyHours,
    models: MENTAL_MODELS.filter((m) => sprint.selectedModels.includes(m.id)),
    metrics: sprintMetrics,
    tasks: sprint.tasks,
  }), [activeCreator, datasetStats, sprint, sprintMetrics]);

  const sprintMarkdown = useMemo(() => {
    const models = MENTAL_MODELS.filter((m) => sprint.selectedModels.includes(m.id));
    const lines = [
      `# CreatorPlaybooks Sprint Plan (${sprint.horizonDays}-Day Horizon)`,
      '',
      `**Goal:** ${sprint.goal.trim() || 'Define concrete sprint goal'}`,
      `**Active Mentor:** ${activeCreator.name} (${activeCreator.handle}) · **Progress:** ${sprintMetrics.doneTasks}/${sprintMetrics.totalTasks} (${sprintMetrics.pct}%)`,
      `**Effort Estimate:** ${sprintMetrics.totalMinutes} min total (${sprintMetrics.remainingMinutes} min remaining · ~${sprintMetrics.dailyMinutesNeeded} min/day)`,
      '',
      '## Governing Mental Models',
      ...(models.length ? models.map((m) => `- **${m.label}**: ${m.note}`) : ['- _Select a mental model._']),
      '',
      '## Action Checklist',
      ...sprint.tasks.map((item) => `- [${item.done ? 'x' : ' '}] ${item.title} _(${item.minutes}m · ${item.source})_`),
      '',
      '---',
      '*Generated locally with CreatorPlaybooks v1.1.0 (35 mentors · 115 plays · 20 cities) — Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.*',
    ];
    return lines.join('\n');
  }, [activeCreator, sprint, sprintMetrics]);

  const sprintJsonText = useMemo(() => JSON.stringify(sprintPlanObject, null, 2), [sprintPlanObject]);

  const cliReference = useMemo(() => [
    '# 1. Start hardened zero-dependency loopback server on http://127.0.0.1:5185',
    'creatorplaybooks serve',
    'creatorplaybooks desktop',
    '',
    '# 2. Launch interactive Unicode U+2800 Braille terminal TUI (or single snapshot)',
    'creatorplaybooks-tui',
    `creatorplaybooks-tui --search "${activeCreator.id}" --once`,
    `creatorplaybooks-tui --search "${activeCreator.id}" --json`,
    '',
    '# 3. Inspect CLI status & live loopback JSON API',
    'creatorplaybooks --status',
    'creatorplaybooks --json',
    `curl -s "http://127.0.0.1:5185/api/creator?id=${activeCreator.id}&expand=all"`,
    `curl -s "http://127.0.0.1:5185/api/export?creator=${activeCreator.id}&format=md"`,
    '',
    '# 4. Real Hermes Agent plugin tools (github.com/1nc0gn30/hermes-creatorplaybooks)',
    '#   - creatorplaybooks_mentors',
    '#   - creatorplaybooks_mentor',
    '#   - creatorplaybooks_playbook',
    '#   - creatorplaybooks_ideas',
    '#   - creatorplaybooks_goal_plan',
  ].join('\n'), [activeCreator.id]);

  const activeCheckedCount = activeCreator.plays.filter((p) => Boolean(checkedPlays[p.id])).length;
  const activePct = Math.round((activeCheckedCount / Math.max(1, activeCreator.plays.length)) * 100);
  const exportSlug = slugify(sprint.goal || 'playbook-sprint');

  const kpis = [
    {
      label: 'Curated Mentors',
      value: `${filteredCreators.length}/${datasetStats.creators}`,
      unit: `${datasetStats.places} cities · ${bookmarks.length} saved`,
      accent: ACCENT_DARK,
    },
    {
      label: 'Repeatable Plays',
      value: `${completedPlays}/${totalPlays}`,
      unit: `${Math.round((completedPlays / Math.max(1, totalPlays)) * 100)}% applied`,
      accent: SOV.emerald,
    },
    {
      label: 'Sprint Completion',
      value: `${sprintMetrics.pct}%`,
      unit: `${sprintMetrics.doneTasks}/${sprintMetrics.totalTasks} tasks`,
      accent: SOV.cyber,
    },
    {
      label: 'Sprint Pace',
      value: `${sprintMetrics.dailyMinutesNeeded}m`,
      unit: `per day (${sprint.horizonDays}d)`,
      accent: SOV.gold,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status="online"
        label={
          liveBridge.online
            ? `35 MENTORS · 115 PLAYS · :5185 LOOPBACK v${liveBridge.version} ONLINE`
            : '35 MENTORS · 115 PLAYS · 20 CITIES · 100% OFFLINE CLIENT ENGINE'
        }
        accent={ACCENT_DARK}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'sprint-md' ? 'Copied Sprint Markdown' : 'Copy Sprint Markdown',
      icon: copied === 'sprint-md' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(sprintMarkdown, 'sprint-md'),
      primary: true,
    },
    {
      label: 'Download playbook-sprint.md',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(sprintMarkdown, 'playbook-sprint.md', 'text/markdown;charset=utf-8'),
    },
    {
      label: 'Export JSON Plan',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(sprintPlanObject, `${exportSlug}.json`),
    },
    {
      label: copied === 'cli' ? 'Copied CLI Commands' : 'Copy CLI & TUI Cmds',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <TerminalIcon fontSize="small" />,
      onClick: () => copy(cliReference, 'cli'),
    },
    {
      label: 'GitHub Repo',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/creatorplaybooks',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="CANONICAL 35-MENTOR DATASET · ZERO TELEMETRY"
        title="Curated Creators & Playbooks Explorer"
        subtitle="Synced directly from shared/creators.json (35 mentors, 115 repeatable plays, 20 cities). Search, bookmark, and check off plays offline."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label="Search 35 mentors by name, handle, tag, or play"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', fontFamily: MONO, fontSize: '0.8rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  clickable
                  onClick={() => setSelectedCategory(cat.id)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    fontWeight: active ? 700 : 600,
                    bgcolor: active ? (isDark ? rgba(ACCENT_DARK, 0.2) : '#FEF7E0') : 'transparent',
                    color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'text.primary',
                    '& .MuiChip-label': { color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'inherit' },
                    border: `1px solid ${active ? accent : isDark ? 'rgba(148,163,184,0.35)' : 'rgba(16,24,40,0.25)'}`,
                  }}
                />
              );
            })}
            <Chip
              icon={bookmarkedOnly ? <BookmarkIcon sx={{ fontSize: '1rem !important' }} /> : <BookmarkBorderIcon sx={{ fontSize: '1rem !important' }} />}
              label={`Saved (${bookmarks.length})`}
              clickable
              onClick={() => setBookmarkedOnly((v) => !v)}
              sx={{
                minHeight: 44,
                fontFamily: MONO,
                fontSize: '0.73rem',
                fontWeight: bookmarkedOnly ? 700 : 600,
                bgcolor: bookmarkedOnly ? (isDark ? rgba(SOV.gold, 0.22) : '#FEF7E0') : 'transparent',
                color: bookmarkedOnly ? (isDark ? '#FDE68A' : '#7A5808') : 'text.primary',
                '& .MuiChip-label': { color: bookmarkedOnly ? (isDark ? '#FDE68A' : '#7A5808') : 'inherit' },
                border: `1px solid ${bookmarkedOnly ? accent : isDark ? 'rgba(148,163,184,0.35)' : 'rgba(16,24,40,0.25)'}`,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 460, overflowY: 'auto', pr: 0.5 }}>
            {filteredCreators.length === 0 ? (
              <Box sx={{ p: 2, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: 'text.secondary' }}>
                  No mentors match &ldquo;{searchQuery}&rdquo;.
                </Typography>
              </Box>
            ) : (
              filteredCreators.map((c) => {
                const isSelected = activeCreator.id === c.id;
                const isSaved = bookmarks.includes(c.id);
                const doneCount = c.plays.filter((p) => Boolean(checkedPlays[p.id])).length;
                const pct = Math.round((doneCount / Math.max(1, c.plays.length)) * 100);
                return (
                  <Box
                    key={c.id}
                    onClick={() => setActiveCreatorId(c.id)}
                    sx={{
                      p: 1.35,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,24,40,0.14)'}`,
                      bgcolor: isSelected
                        ? isDark
                          ? rgba(ACCENT_DARK, 0.12)
                          : '#FEF7E0'
                        : isDark
                          ? 'rgba(255,255,255,0.02)'
                          : '#FFFFFF',
                      transition: 'border-color 140ms ease, background-color 140ms ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.35 }}>
                          <Chip
                            size="small"
                            label={c.category.toUpperCase()}
                            sx={{
                              height: 22,
                              fontFamily: MONO,
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              bgcolor: isDark ? rgba(ACCENT_DARK, 0.16) : '#F3EFE6',
                              color: isDark ? '#FDE68A' : '#7A5808',
                            }}
                          />
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
                            {c.followersStr} · {doneCount}/{c.plays.length} plays
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.3, color: 'text.primary' }}>
                          {c.emoji} {c.name}{' '}
                          <Box component="span" sx={{ fontFamily: MONO, fontSize: '0.76rem', color: 'text.secondary', fontWeight: 500 }}>
                            {c.handle}
                          </Box>
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25, lineHeight: 1.4 }}>
                          {(c.currentFocus || c.bio).split('\n')[0].slice(0, 120)}
                        </Typography>
                      </Box>
                      <Tooltip title={isSaved ? 'Remove bookmark' : 'Bookmark locally'}>
                        <IconButton
                          aria-label={isSaved ? `Remove bookmark for ${c.name}` : `Bookmark ${c.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(c.id);
                          }}
                          sx={{ minWidth: 44, minHeight: 44, color: isSaved ? accent : 'text.secondary' }}
                        >
                          {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        mt: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.09)',
                        '& .MuiLinearProgress-bar': { bgcolor: pct === 100 ? (isDark ? SOV.emerald : '#047857') : accent },
                      }}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow={`${activeCreator.category.toUpperCase()} · ${activeCreator.handle.toUpperCase()} · ${activeCreator.followersStr}`}
        title={`${activeCreator.emoji} ${activeCreator.name} — Verified Playbook`}
        subtitle={activeCreator.currentFocus || activeCreator.bio}
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700, color: accent }}>
            REPEATABLE PLAYS ({activeCheckedCount}/{activeCreator.plays.length} · {activePct}%)
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlaylistAddIcon fontSize="small" />}
            onClick={() => handleImportCreatorPlaysToSprint(activeCreator)}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.73rem',
              fontWeight: 700,
              textTransform: 'none',
              color: accent,
              borderColor: accent,
            }}
          >
            Add Plays to Sprint
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, mb: 2 }}>
          {activeCreator.plays.map((play) => {
            const done = Boolean(checkedPlays[play.id]);
            return (
              <Box
                key={play.id}
                onClick={() => togglePlayCheck(play.id)}
                sx={{
                  p: 1.15,
                  borderRadius: 1.25,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  border: '1px solid',
                  borderColor: done ? (isDark ? 'rgba(52,211,153,0.45)' : '#047857') : 'divider',
                  bgcolor: done
                    ? isDark ? 'rgba(52,211,153,0.06)' : 'rgba(4,120,87,0.06)'
                    : 'transparent',
                }}
              >
                <Checkbox
                  checked={done}
                  sx={{ p: 0.75, minWidth: 44, minHeight: 44, mt: -0.5 }}
                  inputProps={{ 'aria-label': `Mark ${play.title} completed` }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      lineHeight: 1.35,
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {play.emoji} {play.title} ({play.frequency})
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.35, lineHeight: 1.45 }}>
                    {play.description}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: accent, mt: 0.4 }}>
                    Action: {play.action}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {activeCreator.hooks.length > 0 && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: accent, mb: 0.75 }}>
              SWIPE FILE HOOKS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65, mb: 1.5 }}>
              {activeCreator.hooks.slice(0, 4).map((hook, idx) => (
                <Typography key={idx} variant="body2" sx={{ fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.45 }}>
                  • &ldquo;{hook}&rdquo;
                </Typography>
              ))}
            </Box>
          </>
        )}

        {activeCreator.sources.length > 0 && (
          <>
            <Divider sx={{ mb: 1.25 }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.6 }}>
              VERIFIED SOURCES (CHECKED {CREATOR_PLAYBOOKS_DATASET.checkedDate})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeCreator.sources.map((src, idx) => (
                <Link
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    color: isDark ? '#38BDF8' : '#0369A1',
                  }}
                >
                  {src.label} <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
              ))}
            </Box>
          </>
        )}
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="GOAL-TO-PLAYBOOK EXECUTION ENGINE"
        title="Interactive Sprint Planner (7 / 14 / 30 Days)"
        subtitle="Scope one concrete goal, pick governing mental models, import plays from any of the 35 mentors, and export Markdown or JSON."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label="Concrete Sprint Goal"
            value={sprint.goal}
            onChange={(e) => setSprint((prev) => ({ ...prev, goal: e.target.value }))}
            sx={{ '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', fontFamily: MONO, fontSize: '0.8rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {HORIZONS.map((h) => {
                const active = sprint.horizonDays === h.days;
                return (
                  <Chip
                    key={h.days}
                    label={h.label}
                    clickable
                    onClick={() => handleSetHorizon(h.days)}
                    sx={{
                      minHeight: 44,
                      fontFamily: MONO,
                      fontSize: '0.73rem',
                      fontWeight: active ? 700 : 600,
                      bgcolor: active ? (isDark ? rgba(ACCENT_DARK, 0.2) : '#FEF7E0') : 'transparent',
                      color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'text.primary',
                      '& .MuiChip-label': { color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'inherit' },
                      border: `1px solid ${active ? accent : isDark ? 'rgba(148,163,184,0.35)' : 'rgba(16,24,40,0.25)'}`,
                    }}
                  />
                );
              })}
            </Box>

            <TextField
              size="small"
              type="number"
              label="Focus hrs/wk"
              value={sprint.weeklyHours}
              onChange={(e) =>
                setSprint((prev) => ({
                  ...prev,
                  weeklyHours: Math.max(1, Math.min(80, Number.parseInt(e.target.value, 10) || 1)),
                }))
              }
              sx={{ width: 124, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', fontFamily: MONO, fontSize: '0.8rem' } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              APPLICABLE MENTAL MODELS ({sprint.selectedModels.length} SELECTED)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {MENTAL_MODELS.map((m) => {
                const selected = sprint.selectedModels.includes(m.id);
                const modelColor = resolveModeAccent(SOV.cyber, isDark);
                return (
                  <Tooltip key={m.id} title={m.note}>
                    <Chip
                      label={m.label}
                      clickable
                      onClick={() => handleToggleModel(m.id)}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: selected ? 700 : 600,
                        bgcolor: selected ? (isDark ? rgba(SOV.cyber, 0.2) : '#E0F2FE') : 'transparent',
                        color: selected ? (isDark ? '#BAE6FD' : '#0369A1') : 'text.primary',
                        '& .MuiChip-label': { color: selected ? (isDark ? '#BAE6FD' : '#0369A1') : 'inherit' },
                        border: `1px solid ${selected ? modelColor : isDark ? 'rgba(148,163,184,0.35)' : 'rgba(16,24,40,0.25)'}`,
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Add Milestone / Action Item"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomTask(); }}
              sx={{ flex: '1 1 220px', '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              type="number"
              label="Min"
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(e.target.value)}
              sx={{ width: 84, '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleAddCustomTask}
              sx={{
                minHeight: 44,
                px: 2,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: accent,
                color: isDark ? '#0B0D14' : '#FFFFFF',
                '&:hover': { bgcolor: accent },
              }}
            >
              Add Step
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {sprint.tasks.length === 0 ? (
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: 'text.secondary' }}>
                No sprint tasks yet. Add a step above or click &ldquo;Add Plays to Sprint&rdquo; on any mentor.
              </Typography>
            ) : (
              sprint.tasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 1,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: task.done ? (isDark ? 'rgba(52,211,153,0.45)' : '#047857') : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <Checkbox
                    checked={task.done}
                    onChange={() => handleToggleSprintTask(task.id)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                    inputProps={{ 'aria-label': `Toggle ${task.title}` }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        lineHeight: 1.35,
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {task.phase} · {task.minutes}m · {task.source}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={`Remove ${task.title}`}
                    onClick={() => handleRemoveSprintTask(task.id)}
                    sx={{ minWidth: 44, minHeight: 44, color: 'text.secondary' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={() => setSprint(DEFAULT_SPRINT)}
              sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.73rem', textTransform: 'none', color: 'text.secondary' }}
            >
              Reset Default Sprint
            </Button>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="LIVE EXPORT PREVIEW"
        title={exportFormat === 'md' ? 'Markdown Sprint Playbook (playbook-sprint.md)' : `Structured JSON Plan (${exportSlug}.json)`}
        subtitle="Ready for repository docs, Obsidian vaults, or Hermes creatorplaybooks_goal_plan prompts"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.5 }}>
          {[
            { id: 'md', label: 'Markdown (.md)' },
            { id: 'json', label: 'Structured JSON (.json)' },
          ].map((tabItem) => {
            const active = exportFormat === tabItem.id;
            return (
              <Chip
                key={tabItem.id}
                label={tabItem.label}
                clickable
                onClick={() => setExportFormat(tabItem.id)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: active ? 700 : 600,
                  bgcolor: active ? (isDark ? rgba(ACCENT_DARK, 0.2) : '#FEF7E0') : 'transparent',
                  color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'text.primary',
                  '& .MuiChip-label': { color: active ? (isDark ? '#FDE68A' : '#7A5808') : 'inherit' },
                  border: `1px solid ${active ? accent : isDark ? 'rgba(148,163,184,0.35)' : 'rgba(16,24,40,0.25)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={exportFormat === 'md' ? 'playbook-sprint.md' : `${exportSlug}.json`}
          badge={exportFormat === 'md' ? `${sprint.horizonDays}D MARKDOWN` : 'JSON SCHEMA v1.1'}
          code={exportFormat === 'md' ? sprintMarkdown : sprintJsonText}
          filename={exportFormat === 'md' ? 'playbook-sprint.md' : `${exportSlug}.json`}
          accent={ACCENT_DARK}
          maxHeight={300}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="LOCAL SERVER (:5185) · U+2800 BRAILLE TUI · HERMES PLUGIN"
        title="Verified CLI, Braille TUI & Hermes Tool Reference"
        subtitle="Run server.mjs on 127.0.0.1:5185, launch creatorplaybooks-tui, or invoke the 5 read-only Hermes plugin tools"
        accent={ACCENT_DARK}
      >
        <SovereignCodeBlock
          title="CREATORPLAYBOOKS CLI, TUI & HERMES REFERENCE"
          badge="BASH · LOCAL :5185"
          code={cliReference}
          filename="creatorplaybooks-cli.sh"
          accent={ACCENT_DARK}
          maxHeight={260}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box data-testid="creatorplaybooks-godmode-workstation" sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Disclosure · 35 Curated Mentors Offline + Optional :5185 Loopback Bridge"
          message="All 35 curated mentors, 115 repeatable plays, 20 cities, localStorage bookmarks, sprint planning, and Markdown/JSON exports run 100% client-side with zero tracking. Start the hardened zero-dependency loopback server with creatorplaybooks serve or browse in terminal with creatorplaybooks-tui."
        />
      </Box>
      <SovereignWorkstationShell
        id="creatorplaybooks"
        category="EDUCATION & GROWTH · PLAYBOOKS"
        title="CreatorPlaybooks Operator Workbench"
        subtitle="Canonical 35-mentor directory (115 plays · 20 cities), interactive 7/14/30-day sprint planner with Markdown/JSON export, and verified ZothOS CLI/Braille TUI + Hermes plugin reference."
        version="1.1.0"
        variant="bayer-field"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={6}
        rightCols={6}
      />
    </Box>
  );
}
