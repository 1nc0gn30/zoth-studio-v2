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

const ACCENT_DARK = '#F59E0B';
const ACCENT_LIGHT = '#B45309';

const STORAGE_BOOKMARKS = 'zoth_creatorplaybooks_bookmarks_v1';
const STORAGE_CHECKS = 'zoth_creatorplaybooks_checks_v1';
const STORAGE_SPRINT = 'zoth_creatorplaybooks_sprint_v1';

const CATEGORIES = ['All', 'Engineering', 'Founder', 'Product', 'Growth', 'Community'];

const PLAYBOOKS = [
  {
    id: 'owned-hub-trailer',
    title: 'Owned Hub + Social Trailer Loop',
    category: 'Growth',
    cadence: 'Weekly',
    operator: 'Indie Founder / Media Operator',
    mentalModel: 'Owned Page First, Feed Second',
    summary:
      'Publish the full essay, benchmark, or episode on a URL you control first, then treat social posts strictly as concise trailers linking back to that canonical page.',
    antiPatterns: [
      'Publishing your best breakdown solely inside an ephemeral feed thread with no canonical URL.',
      'Teasing an upcoming interview or launch instead of linking a completed artifact.',
    ],
    checklist: [
      { id: 'oht-1', text: 'Create a single canonical page with a stable URL for this week’s deliverable.', minutes: 45, deliverable: 'Published URL on owned domain' },
      { id: 'oht-2', text: 'Write one concrete experiment log: channel tried, action taken, and measured outcome.', minutes: 35, deliverable: '3-row experiment entry' },
      { id: 'oht-3', text: 'Draft two feed trailers pointing directly to the canonical URL without clickbait.', minutes: 20, deliverable: '2 trailer posts + UTM/link check' },
      { id: 'oht-4', text: 'Index the page in your archive table so new visitors can browse past experiments.', minutes: 15, deliverable: 'Updated archive index' },
    ],
  },
  {
    id: 'search-log-roadmap',
    title: 'Empty-Search-Log Demand Roadmap',
    category: 'Product',
    cadence: 'Bi-Weekly',
    operator: 'Design-Systems & Library Maintainer',
    mentalModel: 'Observed Pull Over Speculative Push',
    summary:
      'Capture zero-result queries from your docs, icon pack, or CLI help logs and convert recurring real-user misses directly into your next release changelog.',
    antiPatterns: [
      'Shipping features based on guesses while ignoring actual zero-result search queries.',
      'Rounding or inflating item counts instead of reporting exact repository totals.',
    ],
    checklist: [
      { id: 'slr-1', text: 'Log local or docs search queries that returned zero matches over the past 14 days.', minutes: 25, deliverable: 'Raw empty-query list' },
      { id: 'slr-2', text: 'Cluster synonyms and misspellings to surface the top 5 unmet requests.', minutes: 20, deliverable: 'Ranked 5-item backlog' },
      { id: 'slr-3', text: 'Ship the top requested additions with exact counts and install/upgrade command.', minutes: 90, deliverable: 'Tagged release + diff' },
      { id: 'slr-4', text: 'Publish a dated changelog entry naming the exact additions and how owners fetch them.', minutes: 25, deliverable: 'Public changelog note' },
    ],
  },
  {
    id: 'local-first-zero-telemetry',
    title: 'Local-First Zero-Telemetry Architecture',
    category: 'Engineering',
    cadence: 'Per-Release',
    operator: 'Systems & CLI Architect',
    mentalModel: 'Client-Side Determinism',
    summary:
      'Bundle reference data and core transforms directly in the client or loopback daemon so every utility works offline on localhost with zero tracking scripts.',
    antiPatterns: [
      'Gating core search or export behind third-party SaaS APIs that break offline.',
      'Shipping fake setTimeout placeholders instead of deterministic client-side parsing.',
    ],
    checklist: [
      { id: 'lfz-1', text: 'Verify zero external analytics beacons, cookies, or blocking third-party CDN calls.', minutes: 20, deliverable: 'Network tab audit (0 trackers)' },
      { id: 'lfz-2', text: 'Persist user state (bookmarks, filters, drafts) exclusively in localStorage or SQLite.', minutes: 35, deliverable: 'Local state persistence layer' },
      { id: 'lfz-3', text: 'Provide one-click Markdown and JSON export so users own every output file.', minutes: 30, deliverable: 'Verified .md / .json downloads' },
      { id: 'lfz-4', text: 'Document loopback port, health check, and CLI subcommands in README.md.', minutes: 25, deliverable: 'Updated README & --help parity' },
    ],
  },
  {
    id: 'one-hour-builder-workshop',
    title: 'One-Hour Prompted Builder Workshop',
    category: 'Community',
    cadence: 'Monthly',
    operator: 'Developer Relations / Community Lead',
    mentalModel: 'Spotlight Builders, Not Hosts',
    summary:
      'Run a tightly scoped 60-minute build room with one concrete prompt, one starter URL, and a public recap where 80% of sentences credit participants and what they shipped.',
    antiPatterns: [
      'Announcing a community event without a concrete build prompt or deliverable link.',
      'Writing a recap centered on the organizer rather than naming participant projects.',
    ],
    checklist: [
      { id: 'obw-1', text: 'Publish the exact 60-minute prompt, starter repo URL, and start timestamp.', minutes: 30, deliverable: 'Workshop brief + repo link' },
      { id: 'obw-2', text: 'Reserve the final 15 minutes strictly for live 90-second shipped demos.', minutes: 15, deliverable: 'Timed demo roster' },
      { id: 'obw-3', text: 'Collect working demo URLs and verify every link opens before publishing.', minutes: 25, deliverable: 'Verified link list' },
      { id: 'obw-4', text: 'Write a recap crediting at least three builders and one concrete detail per build.', minutes: 40, deliverable: 'Published community recap' },
    ],
  },
  {
    id: 'bio-offer-alignment',
    title: 'Single-Priority Bio & Offer Alignment',
    category: 'Founder',
    cadence: 'Monthly',
    operator: 'Multi-Product Solo Founder',
    mentalModel: 'One Headline Link, Archived Side Projects',
    summary:
      'Keep older side projects live and documented, but order your profile bio, README, and homepage so line one always points to your current flagship offer.',
    antiPatterns: [
      'Listing five equal-weight links so a first-time visitor cannot tell what you build today.',
      'Letting your GitHub profile, personal site, and X bio describe different current roles.',
    ],
    checklist: [
      { id: 'boa-1', text: 'Audit your homepage, GitHub bio, and X bio side by side for conflicting headlines.', minutes: 15, deliverable: '3-surface audit note' },
      { id: 'boa-2', text: 'Move your primary active product or repository to line one everywhere.', minutes: 20, deliverable: 'Aligned bio & nav links' },
      { id: 'boa-3', text: 'Place older side projects into a clean "Archive / Earlier Builds" section.', minutes: 25, deliverable: 'Structured archive block' },
      { id: 'boa-4', text: 'Test with a cold reader: can they repeat your flagship offer in one sentence?', minutes: 15, deliverable: 'One-sentence clarity check' },
    ],
  },
  {
    id: 'first-customer-forensics',
    title: 'First-Ten-Customer Channel Forensics',
    category: 'Founder',
    cadence: 'Quarterly',
    operator: 'Early-Stage Product Founder',
    mentalModel: 'Trace Repeatable Acquisition Before Scaling',
    summary:
      'Interview users who actually adopted or paid for a tool about the exact trigger event, search phrase, or referral that led them to try it this week.',
    antiPatterns: [
      'Copying another founder’s acquisition channel without checking if your buyer hangs out there.',
      'Asking hypothetical "would you use this" questions instead of auditing real behavior.',
    ],
    checklist: [
      { id: 'fcf-1', text: 'Contact 5 recent active users and ask what broke right before they searched for your tool.', minutes: 40, deliverable: '5 trigger-event notes' },
      { id: 'fcf-2', text: 'Record the exact channel, page, or CLI command that converted each user.', minutes: 25, deliverable: 'Channel attribution table' },
      { id: 'fcf-3', text: 'Pick the single highest-signal channel and run 4 consecutive weekly reps.', minutes: 60, deliverable: '4-week channel schedule' },
      { id: 'fcf-4', text: 'Document one failed channel hypothesis so you stop repeating low-yield outreach.', minutes: 20, deliverable: 'Anti-channel log entry' },
    ],
  },
  {
    id: 'vertical-slice-shipping',
    title: '48-Hour End-to-End Vertical Slice',
    category: 'Engineering',
    cadence: 'Per-Feature',
    operator: 'Staff Full-Stack Engineer',
    mentalModel: 'Working Thin Slice Beats Polished Mockups',
    summary:
      'Cut every milestone to a single runnable path—input, real logic, output export, and verification command—before adding secondary tabs or visual polish.',
    antiPatterns: [
      'Spending four days on auth, billing, or landing copy before the core utility works.',
      'Declaring a feature complete without running a build check and visual inspection.',
    ],
    checklist: [
      { id: 'vss-1', text: 'Define the single core input -> transformation -> downloadable output loop.', minutes: 20, deliverable: '1-paragraph slice spec' },
      { id: 'vss-2', text: 'Implement deterministic logic with unit-testable pure functions.', minutes: 75, deliverable: 'Pure core module' },
      { id: 'vss-3', text: 'Wire the interactive UI controls and verify zero console errors across viewports.', minutes: 50, deliverable: 'Verified UI build' },
      { id: 'vss-4', text: 'Ship the slice with a real example dataset preloaded so visitors test it immediately.', minutes: 25, deliverable: 'Preloaded interactive default' },
    ],
  },
  {
    id: 'benchmark-spec-reading-list',
    title: 'Primary-Source Reading & Verification Protocol',
    category: 'Product',
    cadence: 'Weekly',
    operator: 'Technical Researcher / Curator',
    mentalModel: 'Cite Primary Docs Over Commentary',
    summary:
      'Distinguish primary source facts (dated posts, specs, changelogs, git commits) from personal interpretation or practice suggestions in every playbook note.',
    antiPatterns: [
      'Blending unverified hearsay with primary documentation inside the same checklist.',
      'Keeping dead links or undated claims in an engineering reference handbook.',
    ],
    checklist: [
      { id: 'bsr-1', text: 'Tag every playbook step as either [SOURCE] (primary doc) or [PRACTICE] (suggested drill).', minutes: 20, deliverable: 'Tagged reading notes' },
      { id: 'bsr-2', text: 'Attach exact dates and canonical URLs to every metric or release claim.', minutes: 25, deliverable: 'Dated citation block' },
      { id: 'bsr-3', text: 'Prune stale advice that no longer matches the current API or CLI flags.', minutes: 30, deliverable: 'Cleaned reference list' },
    ],
  },
];

const MENTAL_MODELS = [
  { id: 'owned-hub', label: 'Owned Hub Over Feed', note: 'Publish long-form work on your own domain; use feeds as trailers.' },
  { id: 'search-pull', label: 'Search-Log Pull', note: 'Convert empty searches and support questions directly into roadmap items.' },
  { id: 'vertical-slice', label: 'Vertical Slice First', note: 'Ship one working end-to-end utility before adding breadth.' },
  { id: 'source-vs-practice', label: 'Source vs. Practice Split', note: 'Separate verified primary facts from experimental drills.' },
  { id: 'local-determinism', label: 'Local-First Determinism', note: 'Ensure core tools run offline with zero tracking and clean export.' },
  { id: 'spotlight-builders', label: 'Spotlight Builders', note: 'Center community recaps on participant demos and working URLs.' },
  { id: 'single-priority', label: 'Single-Priority Surface', note: 'Put one flagship link at line one across bio, docs, and nav.' },
  { id: 'small-batch', label: 'Small Batch Cadence', note: 'Prefer dated weekly diffs with exact counts over silent multi-month rewrites.' },
];

const HORIZONS = [
  { days: 7, label: '7-Day Sprint', phases: ['Day 1–2 · Scope', 'Day 3–5 · Build', 'Day 6–7 · Ship & Measure'] },
  { days: 14, label: '14-Day Sprint', phases: ['Week 1 · Prototype & Validate', 'Week 2 · Harden & Distribute'] },
  { days: 30, label: '30-Day Sprint', phases: ['Days 1–7 · Foundation', 'Days 8–20 · Iteration', 'Days 21–30 · Distribution & Review'] },
];

const DEFAULT_SPRINT = {
  goal: 'Ship v1.0 open-access developer utility with verified docs and first 25 real users',
  horizonDays: 14,
  weeklyHours: 8,
  selectedModels: ['owned-hub', 'vertical-slice', 'local-determinism'],
  tasks: [
    {
      id: 'sp-1',
      phase: 'Week 1 · Prototype & Validate',
      title: 'Define the single core client-side input -> output vertical slice',
      minutes: 45,
      done: true,
      source: '48-Hour End-to-End Vertical Slice',
    },
    {
      id: 'sp-2',
      phase: 'Week 1 · Prototype & Validate',
      title: 'Publish canonical landing/docs page on owned domain with working demo',
      minutes: 90,
      done: false,
      source: 'Owned Hub + Social Trailer Loop',
    },
    {
      id: 'sp-3',
      phase: 'Week 2 · Harden & Distribute',
      title: 'Verify zero console errors, offline persistence, and .md/.json export',
      minutes: 60,
      done: false,
      source: 'Local-First Zero-Telemetry Architecture',
    },
    {
      id: 'sp-4',
      phase: 'Week 2 · Harden & Distribute',
      title: 'Publish dated changelog + 2 concise trailer posts linking to canonical URL',
      minutes: 40,
      done: false,
      source: 'Owned Hub + Social Trailer Loop',
    },
  ],
};

function readStorageJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function slugify(str) {
  return (
    String(str || 'playbook-sprint')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 44) || 'playbook-sprint'
  );
}

export default function CreatorPlaybooksGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  // Explorer state (zero-tracking localStorage persistence)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState(() =>
    readStorageJson(STORAGE_BOOKMARKS, ['owned-hub-trailer', 'local-first-zero-telemetry']),
  );
  const [checkedSteps, setCheckedSteps] = useState(() =>
    readStorageJson(STORAGE_CHECKS, { 'oht-1': true, 'lfz-1': true }),
  );
  const [activePlaybookId, setActivePlaybookId] = useState(PLAYBOOKS[0].id);

  // Sprint Planner state
  const [sprint, setSprint] = useState(() => readStorageJson(STORAGE_SPRINT, DEFAULT_SPRINT));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState('45');
  const [newTaskPhase, setNewTaskPhase] = useState('');
  const [exportFormat, setExportFormat] = useState('md');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      /* ignore storage quota errors */
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_CHECKS, JSON.stringify(checkedSteps));
    } catch {
      /* ignore storage quota errors */
    }
  }, [checkedSteps]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_SPRINT, JSON.stringify(sprint));
    } catch {
      /* ignore storage quota errors */
    }
  }, [sprint]);

  const currentHorizon = useMemo(
    () => HORIZONS.find((h) => h.days === sprint.horizonDays) || HORIZONS[1],
    [sprint.horizonDays],
  );

  const filteredPlaybooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PLAYBOOKS.filter((pb) => {
      if (selectedCategory !== 'All' && pb.category !== selectedCategory) return false;
      if (bookmarkedOnly && !bookmarks.includes(pb.id)) return false;
      if (!q) return true;
      const hay = [
        pb.title,
        pb.category,
        pb.operator,
        pb.mentalModel,
        pb.summary,
        ...pb.antiPatterns,
        ...pb.checklist.map((c) => `${c.text} ${c.deliverable}`),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, selectedCategory, bookmarkedOnly, bookmarks]);

  const activePlaybook = useMemo(
    () =>
      filteredPlaybooks.find((p) => p.id === activePlaybookId) ||
      PLAYBOOKS.find((p) => p.id === activePlaybookId) ||
      PLAYBOOKS[0],
    [filteredPlaybooks, activePlaybookId],
  );

  const toggleBookmark = (id) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleChecklistStep = (stepId) => {
    setCheckedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const totalChecklistSteps = useMemo(
    () => PLAYBOOKS.reduce((acc, pb) => acc + pb.checklist.length, 0),
    [],
  );
  const completedChecklistSteps = useMemo(
    () =>
      PLAYBOOKS.reduce(
        (acc, pb) => acc + pb.checklist.filter((step) => Boolean(checkedSteps[step.id])).length,
        0,
      ),
    [checkedSteps],
  );

  // Sprint handlers
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

  const handleSetHorizon = (days) => {
    const h = HORIZONS.find((item) => item.days === days) || HORIZONS[1];
    setSprint((prev) => ({
      ...prev,
      horizonDays: days,
      tasks: prev.tasks.map((t, idx) => ({
        ...t,
        phase: h.phases[Math.min(Math.floor((idx / Math.max(prev.tasks.length, 1)) * h.phases.length), h.phases.length - 1)],
      })),
    }));
    setNewTaskPhase(h.phases[0]);
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

  const handleAddCustomTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const mins = Math.max(5, Math.min(480, Number.parseInt(newTaskMinutes, 10) || 45));
    const phase = newTaskPhase || currentHorizon.phases[0];
    setSprint((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: `custom-${Date.now()}`,
          phase,
          title,
          minutes: mins,
          done: false,
          source: 'Custom Action',
        },
      ],
    }));
    setNewTaskTitle('');
  };

  const handleImportPlaybookToSprint = (pb) => {
    const phases = currentHorizon.phases;
    setSprint((prev) => {
      const existingTitles = new Set(prev.tasks.map((t) => t.title.toLowerCase()));
      const additions = pb.checklist
        .filter((step) => !existingTitles.has(step.text.toLowerCase()))
        .map((step, idx) => ({
          id: `pb-${pb.id}-${step.id}`,
          phase: phases[Math.min(Math.floor((idx / pb.checklist.length) * phases.length), phases.length - 1)],
          title: step.text,
          minutes: step.minutes,
          done: Boolean(checkedSteps[step.id]),
          source: pb.title,
        }));
      if (additions.length === 0) return prev;
      return { ...prev, tasks: [...prev.tasks, ...additions] };
    });
  };

  const sprintMetrics = useMemo(() => {
    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter((t) => t.done).length;
    const totalMinutes = sprint.tasks.reduce((sum, t) => sum + (Number(t.minutes) || 0), 0);
    const remainingMinutes = sprint.tasks
      .filter((t) => !t.done)
      .reduce((sum, t) => sum + (Number(t.minutes) || 0), 0);
    const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    const dailyMinutesNeeded = Math.ceil(remainingMinutes / Math.max(1, sprint.horizonDays));
    return { totalTasks, doneTasks, totalMinutes, remainingMinutes, pct, dailyMinutesNeeded };
  }, [sprint]);

  const sprintPlanObject = useMemo(() => {
    const models = MENTAL_MODELS.filter((m) => sprint.selectedModels.includes(m.id));
    return {
      schema: 'creatorplaybooks.sprint/v1',
      generated_at: new Date().toISOString().slice(0, 10),
      goal: sprint.goal.trim() || 'Untitled Operator Sprint',
      horizon_days: sprint.horizonDays,
      weekly_focus_hours: sprint.weeklyHours,
      completion_pct: sprintMetrics.pct,
      total_estimated_minutes: sprintMetrics.totalMinutes,
      remaining_minutes: sprintMetrics.remainingMinutes,
      mental_models: models.map((m) => ({ id: m.id, name: m.label, principle: m.note })),
      milestones: sprint.tasks.map((t, index) => ({
        order: index + 1,
        phase: t.phase,
        title: t.title,
        estimated_minutes: t.minutes,
        completed: t.done,
        source_playbook: t.source,
      })),
    };
  }, [sprint, sprintMetrics]);

  const sprintMarkdown = useMemo(() => {
    const models = MENTAL_MODELS.filter((m) => sprint.selectedModels.includes(m.id));
    const grouped = currentHorizon.phases.map((phase) => ({
      phase,
      items: sprint.tasks.filter((t) => t.phase === phase),
    }));
    const otherItems = sprint.tasks.filter((t) => !currentHorizon.phases.includes(t.phase));
    if (otherItems.length > 0) {
      grouped.push({ phase: 'Additional Actions', items: otherItems });
    }

    const lines = [
      `# Playbook Sprint Plan (${sprint.horizonDays}-Day Horizon)`,
      '',
      `**Goal:** ${sprint.goal.trim() || 'Define concrete sprint goal'}`,
      `**Horizon:** ${sprint.horizonDays} days · **Budget:** ${sprint.weeklyHours}h/week · **Progress:** ${sprintMetrics.doneTasks}/${sprintMetrics.totalTasks} (${sprintMetrics.pct}%)`,
      `**Effort Estimate:** ${sprintMetrics.totalMinutes} min total (${sprintMetrics.remainingMinutes} min remaining · ~${sprintMetrics.dailyMinutesNeeded} min/day)`,
      '',
      '## Applicable Mental Models',
      ...(models.length > 0
        ? models.map((m) => `- **${m.label}**: ${m.note}`)
        : ['- _Select at least one mental model to anchor scope decisions._']),
      '',
      '## Milestones & Action Checklist',
    ];

    grouped.forEach((group) => {
      if (group.items.length === 0) return;
      lines.push('', `### ${group.phase}`);
      group.items.forEach((item) => {
        lines.push(
          `- [${item.done ? 'x' : ' '}] ${item.title} _(${item.minutes}m · ${item.source})_`,
        );
      });
    });

    lines.push(
      '',
      '---',
      '*Generated locally with CreatorPlaybooks (:5185) — zero tracking, client-side export.*',
    );
    return lines.join('\n');
  }, [sprint, sprintMetrics, currentHorizon]);

  const sprintJsonText = useMemo(() => JSON.stringify(sprintPlanObject, null, 2), [sprintPlanObject]);

  const cliReference = useMemo(() => {
    const goalSafe = (sprint.goal || 'Launch developer playbook sprint').replace(/"/g, '\\"');
    return [
      '# 1. Launch standalone CreatorPlaybooks desktop workstation on http://127.0.0.1:5185',
      'creatorplaybooks desktop',
      '',
      '# 2. Open 60fps Unicode U+2800 Braille terminal TUI',
      'creatorplaybooks-tui',
      '',
      '# 3. Dispatch goal or playbook query via Hermes Agent plugin',
      `hermes-creatorplaybooks --horizon ${sprint.horizonDays} --goal "${goalSafe}"`,
      '',
      '# 4. Inspect local daemon telemetry & serve directly on :5185',
      'creatorplaybooks --status',
      'creatorplaybooks --json',
      'creatorplaybooks serve',
    ].join('\n');
  }, [sprint.goal, sprint.horizonDays]);

  const activePbChecked = activePlaybook.checklist.filter((c) => Boolean(checkedSteps[c.id])).length;
  const activePbPct = Math.round((activePbChecked / Math.max(1, activePlaybook.checklist.length)) * 100);
  const exportSlug = slugify(sprint.goal || 'playbook-sprint');

  const kpis = [
    {
      label: 'Playbook Library',
      value: `${filteredPlaybooks.length}/${PLAYBOOKS.length}`,
      unit: `${bookmarks.length} bookmarked`,
      accent: ACCENT_DARK,
    },
    {
      label: 'Checklist Progress',
      value: `${completedChecklistSteps}/${totalChecklistSteps}`,
      unit: `${Math.round((completedChecklistSteps / Math.max(1, totalChecklistSteps)) * 100)}% done`,
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
        label={`ZERO-TRACKING LOCAL STORAGE · :5185 STANDALONE READY · ${sprint.horizonDays}D SPRINT`}
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
      label: copied === 'cli' ? 'Copied CLI Commands' : 'Copy CLI & Hermes Cmds',
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
        eyebrow="CLIENT-SIDE DIRECTORY · ZERO TELEMETRY"
        title="Operator Playbooks & Mental Models Explorer"
        subtitle="Filter concrete engineering, founder, product, growth, and community playbooks. Bookmarks and reading checklists save only to your browser localStorage."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label="Search playbooks, mental models, deliverables, or anti-patterns"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    minHeight: 36,
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
            <Chip
              icon={bookmarkedOnly ? <BookmarkIcon sx={{ fontSize: '0.95rem !important' }} /> : <BookmarkBorderIcon sx={{ fontSize: '0.95rem !important' }} />}
              label={`Saved (${bookmarks.length})`}
              clickable
              onClick={() => setBookmarkedOnly((v) => !v)}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.71rem',
                fontWeight: bookmarkedOnly ? 700 : 500,
                bgcolor: bookmarkedOnly ? rgba(SOV.gold, 0.18) : 'transparent',
                color: bookmarkedOnly ? resolveModeAccent(SOV.gold, isDark) : 'text.secondary',
                border: `1px solid ${bookmarkedOnly ? resolveModeAccent(SOV.gold, isDark) : 'rgba(148,163,184,0.3)'}`,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredPlaybooks.length === 0 ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: 'text.secondary' }}>
                  No playbooks match "{searchQuery}" under {selectedCategory}.
                </Typography>
              </Box>
            ) : (
              filteredPlaybooks.map((pb) => {
                const isSelected = activePlaybook.id === pb.id;
                const isSaved = bookmarks.includes(pb.id);
                const doneCount = pb.checklist.filter((s) => Boolean(checkedSteps[s.id])).length;
                const pct = Math.round((doneCount / pb.checklist.length) * 100);
                return (
                  <Box
                    key={pb.id}
                    onClick={() => setActivePlaybookId(pb.id)}
                    sx={{
                      p: 1.35,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? accent : isDark ? 'rgba(255,255,255,0.09)' : 'rgba(16,24,40,0.12)'}`,
                      bgcolor: isSelected
                        ? isDark
                          ? rgba(ACCENT_DARK, 0.1)
                          : rgba(ACCENT_LIGHT, 0.06)
                        : isDark
                          ? 'rgba(255,255,255,0.015)'
                          : 'rgba(255,255,255,0.65)',
                      transition: 'border-color 140ms ease, background-color 140ms ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
                          <Chip
                            size="small"
                            label={pb.category.toUpperCase()}
                            sx={{
                              height: 22,
                              fontFamily: MONO,
                              fontSize: '0.63rem',
                              fontWeight: 700,
                              bgcolor: rgba(accent, 0.14),
                              color: accent,
                            }}
                          />
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: 'text.secondary' }}>
                            {pb.cadence} · {doneCount}/{pb.checklist.length} done
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3 }}>
                          {pb.title}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: accent, mt: 0.25 }}>
                          Model: {pb.mentalModel}
                        </Typography>
                      </Box>
                      <Tooltip title={isSaved ? 'Remove bookmark' : 'Bookmark locally'}>
                        <IconButton
                          size="small"
                          aria-label={isSaved ? `Remove bookmark for ${pb.title}` : `Bookmark ${pb.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(pb.id);
                          }}
                          sx={{ minWidth: 38, minHeight: 38, color: isSaved ? accent : 'text.secondary' }}
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
                        bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(16,24,40,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: pct === 100 ? SOV.emerald : accent },
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
        eyebrow={`${activePlaybook.category.toUpperCase()} · ${activePlaybook.operator.toUpperCase()}`}
        title={activePlaybook.title}
        subtitle={activePlaybook.summary}
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: accent }}>
            READING & EXECUTION CHECKLIST ({activePbChecked}/{activePlaybook.checklist.length} · {activePbPct}%)
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlaylistAddIcon fontSize="small" />}
            onClick={() => handleImportPlaybookToSprint(activePlaybook)}
            sx={{
              minHeight: 38,
              fontFamily: MONO,
              fontSize: '0.71rem',
              fontWeight: 700,
              textTransform: 'none',
              color: accent,
              borderColor: rgba(accent, 0.45),
            }}
          >
            Add Steps to Sprint
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
          {activePlaybook.checklist.map((step) => {
            const done = Boolean(checkedSteps[step.id]);
            return (
              <Box
                key={step.id}
                onClick={() => toggleChecklistStep(step.id)}
                sx={{
                  p: 1,
                  borderRadius: 1.25,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  border: '1px solid',
                  borderColor: done ? rgba(resolveModeAccent(SOV.emerald, isDark), 0.45) : 'divider',
                  bgcolor: done
                    ? isDark
                      ? 'rgba(52,211,153,0.06)'
                      : 'rgba(4,120,87,0.05)'
                    : 'transparent',
                }}
              >
                <Checkbox
                  checked={done}
                  size="small"
                  sx={{ p: 0.5, mt: -0.25 }}
                  inputProps={{ 'aria-label': step.text }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {step.text}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', color: 'text.secondary', mt: 0.25 }}>
                    Deliverable: {step.deliverable} · ~{step.minutes} min
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mb: 1.5 }} />
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: resolveModeAccent(SOV.crimson, isDark), mb: 0.75 }}>
          COMMON FAILURE MODES TO AVOID
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {activePlaybook.antiPatterns.map((mistake, idx) => (
            <Typography key={idx} variant="body2" sx={{ fontSize: '0.79rem', color: 'text.secondary', lineHeight: 1.45 }}>
              • {mistake}
            </Typography>
          ))}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="GOAL-TO-PLAYBOOK EXECUTION ENGINE"
        title="Interactive Sprint Planner (7 / 14 / 30 Days)"
        subtitle="Scope one concrete goal, pick the governing mental models, check off milestones, and export a structured Markdown or JSON sprint plan."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label="Concrete Sprint Goal"
            value={sprint.goal}
            onChange={(e) => setSprint((prev) => ({ ...prev, goal: e.target.value }))}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
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
                      minHeight: 36,
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
              sx={{ width: 120, '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              APPLICABLE MENTAL MODELS ({sprint.selectedModels.length} SELECTED)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
              {MENTAL_MODELS.map((m) => {
                const selected = sprint.selectedModels.includes(m.id);
                return (
                  <Tooltip key={m.id} title={m.note}>
                    <Chip
                      size="small"
                      label={m.label}
                      clickable
                      onClick={() => handleToggleModel(m.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.69rem',
                        fontWeight: selected ? 700 : 500,
                        bgcolor: selected ? rgba(SOV.cyber, isDark ? 0.18 : 0.1) : 'transparent',
                        color: selected ? resolveModeAccent(SOV.cyber, isDark) : 'text.secondary',
                        border: `1px solid ${selected ? resolveModeAccent(SOV.cyber, isDark) : 'rgba(148,163,184,0.3)'}`,
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustomTask();
              }}
              sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
            <TextField
              size="small"
              type="number"
              label="Min"
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(e.target.value)}
              sx={{ width: 78, '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleAddCustomTask}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontSize: '0.73rem',
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
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'text.secondary' }}>
                No sprint tasks yet. Add a custom action above or click "Add Steps to Sprint" on any playbook.
              </Typography>
            ) : (
              sprint.tasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 1,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: task.done ? rgba(resolveModeAccent(SOV.emerald, isDark), 0.4) : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={task.done}
                    onChange={() => handleToggleSprintTask(task.id)}
                    inputProps={{ 'aria-label': `Toggle ${task.title}` }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.81rem',
                        lineHeight: 1.35,
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: 'text.secondary' }}>
                      {task.phase} · {task.minutes}m · {task.source}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label={`Remove ${task.title}`}
                    onClick={() => handleRemoveSprintTask(task.id)}
                    sx={{ minWidth: 36, minHeight: 36, color: 'text.secondary' }}
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
              sx={{ fontFamily: MONO, fontSize: '0.7rem', textTransform: 'none', color: 'text.secondary' }}
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
        subtitle="Ready to drop into a repository README, Obsidian vault, or Hermes Agent goal prompt"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.5 }}>
          {[
            { id: 'md', label: 'Markdown (.md)' },
            { id: 'json', label: 'Structured JSON (.json)' },
          ].map((tab) => {
            const active = exportFormat === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setExportFormat(tab.id)}
                sx={{
                  minHeight: 36,
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

        <SovereignCodeBlock
          title={exportFormat === 'md' ? 'playbook-sprint.md' : `${exportSlug}.json`}
          badge={exportFormat === 'md' ? `${sprint.horizonDays}D MARKDOWN` : 'JSON SCHEMA v1'}
          code={exportFormat === 'md' ? sprintMarkdown : sprintJsonText}
          filename={exportFormat === 'md' ? 'playbook-sprint.md' : `${exportSlug}.json`}
          accent={ACCENT_DARK}
          maxHeight={300}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="LOCAL WORKSTATION (:5185) · TUI · HERMES PLUGIN"
        title="Local CLI & Hermes Plugin Reference"
        subtitle="Run CreatorPlaybooks locally on 127.0.0.1:5185, launch the Braille TUI, or dispatch sprints via Hermes"
        accent={ACCENT_DARK}
      >
        <SovereignCodeBlock
          title="CREATORPLAYBOOKS CLI & HERMES DISPATCH"
          badge="BASH · LOCAL :5185"
          code={cliReference}
          filename="creatorplaybooks-cli.sh"
          accent={ACCENT_DARK}
          maxHeight={230}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Disclosure · 100% Client-Side Explorer & Sprint Planner"
          message="Playbook search, localStorage bookmarks, checklist progress, and Markdown/JSON sprint exports execute strictly in your browser with zero tracking or remote telemetry. For the full local Vite app, TUI, or Hermes plugin, run creatorplaybooks desktop on http://127.0.0.1:5185."
        />
      </Box>
      <SovereignWorkstationShell
        id="creatorplaybooks"
        category="EDUCATION & GROWTH · PLAYBOOKS"
        title="CreatorPlaybooks Operator Workbench"
        subtitle="Zero-tracking client-side operator playbooks & mental models directory, interactive 7/14/30-day sprint planner with Markdown/JSON export, and ZothOS CLI/Hermes command reference."
        version="1.0.0"
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
