import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TimelineIcon from '@mui/icons-material/Timeline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  SovereignCard,
  SovereignKpiStrip,
  SovereignStatusPill,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  rgba,
} from '../sovereign';
import {
  CHRONICLE_SCHEMA_VERSION,
  CHRONICLE_QUICK_QUERIES,
  STUDIO_RELEASE_MILESTONES,
  SAMPLE_BROWSER_TRANSCRIPT_JSONL,
  SAMPLE_BROWSER_TRANSCRIPT_MD,
  formatChronicleDate,
  sanitizeChronicleText,
  parseTranscriptInput,
  searchTranscriptTurns,
  buildChronicleMarkdownBrief,
  buildChronicleCsvExport,
} from '../../utils/chronicleEngine';

const PURPLE_DARK = '#C084FC';
const PURPLE_LIGHT = '#6D28D9';
const GOLD_DARK = '#D4AF37';
const GOLD_LIGHT = '#7A5808';
const SERIF = '"Celtic Garamond", Georgia, "Times New Roman", serif';

async function safeProxyGet(url, timeoutMs = 3500) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { online: false, reason: `Studio proxy HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { online: false, reason: 'Static browser deployment — hybrid offline mode active' };
    return await res.json();
  } catch (err) {
    return {
      online: false,
      reason: err.name === 'AbortError' ? 'Studio proxy probe timed out — browser hybrid mode active' : 'Studio proxy unreachable — browser hybrid mode active',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function safeProxyPost(url, payload, timeoutMs = 4500) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { online: false, reason: `Studio proxy HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { online: false, reason: 'Static browser deployment — hybrid offline mode active' };
    return await res.json();
  } catch (err) {
    return {
      online: false,
      reason: err.name === 'AbortError' ? 'Recall request timed out' : 'Studio proxy unreachable',
    };
  } finally {
    clearTimeout(timer);
  }
}

export default function ChronicleHubGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? PURPLE_DARK : PURPLE_LIGHT;
  const gold = isDark ? GOLD_DARK : GOLD_LIGHT;
  const amber = isDark ? '#F59E0B' : '#B45309';
  const crimson = isDark ? '#F87171' : '#B91C1C';
  const emerald = isDark ? '#34D399' : '#047857';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const subtleBg = isDark ? '#11141D' : '#F7F4EC';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.13)';

  const { copied: copiedCli, copy: copyCli } = useCopy();
  const fileInputRef = useRef(null);
  const alive = useRef(true);

  const [activeTab, setActiveTab] = useState(0);
  const [connStatus, setConnStatus] = useState('connecting'); // connecting | live | offline
  const [statusReason, setStatusReason] = useState('');
  const [liveStats, setLiveStats] = useState(null);
  const [livePatterns, setLivePatterns] = useState([]);
  const [unfinishedLoops, setUnfinishedLoops] = useState([]);
  const [parkedIdeas, setParkedIdeas] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  // Tab 1: Recall state
  const [recallQuery, setRecallQuery] = useState('zoth-studio-v2');
  const [recallResult, setRecallResult] = useState(null);
  const [recallBusy, setRecallBusy] = useState(false);

  // Tab 2: Archive search state
  const [searchQuery, setSearchQuery] = useState('chronicle');
  const [searchHits, setSearchHits] = useState([]);
  const [searchTotal, setSearchTotal] = useState(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchSource, setSearchSource] = useState('hybrid');

  // Tab 3: Browser Transcript Analyzer (100% offline)
  const [transcriptInput, setTranscriptInput] = useState(SAMPLE_BROWSER_TRANSCRIPT_JSONL);
  const [transcriptFilterQuery, setTranscriptFilterQuery] = useState('');
  const [transcriptRoleFilter, setTranscriptRoleFilter] = useState('all');

  // Tab 4: Engineering Horizon track filter
  const [milestoneTrack, setMilestoneTrack] = useState('All');

  const parsedTranscript = useMemo(() => parseTranscriptInput(transcriptInput), [transcriptInput]);
  const filteredTurns = useMemo(
    () => searchTranscriptTurns(parsedTranscript.turns, transcriptFilterQuery, transcriptRoleFilter),
    [parsedTranscript.turns, transcriptFilterQuery, transcriptRoleFilter]
  );

  const buildLocalRecallFallback = useCallback(
    (q) => {
      const matches = searchTranscriptTurns(parsedTranscript.turns, q, 'all');
      const sourceList = matches.length > 0 ? matches : parsedTranscript.turns;
      return {
        online: false,
        query: sanitizeChronicleText(q),
        related_memories: sourceList.slice(0, 6).map((t) => ({
          id: t.id,
          title: t.text.length > 140 ? `${t.text.slice(0, 137).replace(/\s+\S*$/, '')}…` : t.text,
          date: t.date,
          source: `browser:${t.source}`,
          messageCount: 1,
          frictionScore: t.hasError ? 25 : t.hasCorrection ? 15 : 0,
          snippet: t.text,
        })),
        alerts:
          parsedTranscript.metrics.frictionCount > 0
            ? [
                {
                  id: 'local-friction-alert',
                  title: `Browser Transcript Markers (${parsedTranscript.metrics.frictionCount} detected)`,
                  detail: `${parsedTranscript.metrics.errorCount} error(s) and ${parsedTranscript.metrics.correctionCount} correction(s) parsed locally in browser memory.`,
                  severity: 'warning',
                },
              ]
            : [],
        breakage_warnings: [],
      };
    },
    [parsedTranscript]
  );

  const runRecall = useCallback(
    async (q, forceLiveCheck = false) => {
      const trimmed = (q || '').trim() || 'zoth-studio-v2';
      setRecallBusy(true);
      if (connStatus === 'live' || forceLiveCheck) {
        const res = await safeProxyPost('/api/studio/chronicle/recall', { query: trimmed });
        if (!alive.current) return;
        if (res.online) {
          setRecallResult(res);
          setRecallBusy(false);
          return;
        }
      }
      if (!alive.current) return;
      setRecallResult(buildLocalRecallFallback(trimmed));
      setRecallBusy(false);
    },
    [connStatus, buildLocalRecallFallback]
  );

  const runArchiveSearch = useCallback(
    async (q, forceLiveCheck = false) => {
      const trimmed = (q || '').trim();
      setSearchBusy(true);
      if (connStatus === 'live' || forceLiveCheck) {
        const res = await safeProxyGet(`/api/studio/chronicle/search?q=${encodeURIComponent(trimmed)}&limit=12`);
        if (!alive.current) return;
        if (res.online) {
          setSearchHits(Array.isArray(res.conversations) ? res.conversations : []);
          setSearchTotal(typeof res.total === 'number' ? res.total : 0);
          setSearchSource('live-fts5');
          setSearchBusy(false);
          return;
        }
      }
      if (!alive.current) return;
      const localMatches = searchTranscriptTurns(parsedTranscript.turns, trimmed, 'all').map((t) => ({
        id: t.id,
        title: t.text.slice(0, 140),
        source: `browser:${t.role}`,
        date: t.date,
        messageCount: 1,
        frictionScore: t.hasError ? 20 : t.hasCorrection ? 12 : 0,
        snippet: t.text,
      }));
      setSearchHits(localMatches);
      setSearchTotal(localMatches.length);
      setSearchSource('browser-local');
      setSearchBusy(false);
    },
    [connStatus, parsedTranscript.turns]
  );

  const refresh = useCallback(async () => {
    const summary = await safeProxyGet('/api/studio/chronicle/summary');
    if (!alive.current) return;
    if (summary.online) {
      setLiveStats(summary.stats || null);
      setLivePatterns(Array.isArray(summary.patterns) ? summary.patterns : []);
      setUnfinishedLoops(Array.isArray(summary.unfinishedLoops) ? summary.unfinishedLoops : []);
      setParkedIdeas(Array.isArray(summary.parkedIdeas) ? summary.parkedIdeas : []);
      setConnStatus('live');
      setStatusReason('');
      setLastSync(new Date());
      runRecall('zoth-studio-v2', true);
      runArchiveSearch('chronicle', true);
    } else {
      setLiveStats(null);
      setLivePatterns([]);
      setUnfinishedLoops([]);
      setParkedIdeas([]);
      setConnStatus('offline');
      setStatusReason(summary.reason || 'Chronicle Vault daemon (:8161) not reachable — browser hybrid analyzer active');
      setLastSync(new Date());
      setRecallResult(buildLocalRecallFallback('zoth-studio-v2'));
      const localHits = searchTranscriptTurns(parsedTranscript.turns, 'chronicle', 'all').map((t) => ({
        id: t.id,
        title: t.text.slice(0, 140),
        source: `browser:${t.role}`,
        date: t.date,
        messageCount: 1,
        frictionScore: t.hasError ? 20 : t.hasCorrection ? 12 : 0,
        snippet: t.text,
      }));
      setSearchHits(localHits);
      setSearchTotal(localHits.length);
      setSearchSource('browser-local');
    }
  }, [runRecall, runArchiveSearch, buildLocalRecallFallback, parsedTranscript.turns]);

  useEffect(() => {
    alive.current = true;
    refresh();
    return () => { alive.current = false; };
  }, [refresh]);

  const handleUploadTranscript = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTranscriptInput(reader.result.slice(0, 250000));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportJson = () => {
    downloadJson(`chronicle-hub-snapshot-${new Date().toISOString().slice(0, 10)}.json`, {
      schemaVersion: CHRONICLE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      mode: connStatus === 'live' ? 'live-proxy' : 'browser-hybrid',
      stats: liveStats || parsedTranscript.metrics,
      recall: recallResult,
      patterns: livePatterns.slice(0, 12),
      unfinishedLoops: unfinishedLoops.slice(0, 10),
      parkedIdeas: parkedIdeas.slice(0, 10),
      browserTranscript: parsedTranscript,
      releaseChronicle: STUDIO_RELEASE_MILESTONES,
    });
  };

  const handleExportMarkdown = () => {
    const md = buildChronicleMarkdownBrief({
      mode: connStatus === 'live' ? 'live-proxy + browser-hybrid' : 'browser-hybrid (100% offline)',
      stats: liveStats,
      recallQuery,
      recallResult,
      patterns: livePatterns,
      parsedTranscript,
      milestones: STUDIO_RELEASE_MILESTONES,
    });
    downloadText(`chronicle-hub-brief-${new Date().toISOString().slice(0, 10)}.md`, md);
  };

  const handleExportCsv = () => {
    const rows =
      connStatus === 'live' && recallResult?.related_memories?.length > 0
        ? recallResult.related_memories.map((m) => ({
            id: m.id,
            date: m.date,
            source: m.source,
            role: 'thread',
            title: m.title,
            summary: m.snippet || m.outcomeStatus || '',
            frictionScore: m.frictionScore ?? 0,
          }))
        : filteredTurns.map((t) => ({
            id: t.id,
            date: t.date,
            source: t.source,
            role: t.role,
            title: (t.tags || []).slice(0, 3).join(' · ') || 'session-turn',
            summary: t.text,
            frictionScore: t.hasError ? 25 : t.hasCorrection ? 15 : 0,
          }));
    const csv = buildChronicleCsvExport(rows);
    downloadText(`chronicle-hub-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // Balanced 6-tile KPI strip (3x2 on desktop via cols={4}, 2x3 on tablet) — ZERO orphan row!
  const kpiItems =
    connStatus === 'live' && liveStats
      ? [
          { label: 'Conversations', value: liveStats.conversations != null ? liveStats.conversations.toLocaleString() : '0', accent },
          { label: 'Messages', value: liveStats.messages != null ? liveStats.messages.toLocaleString() : '0', accent: gold },
          { label: 'Avg Friction', value: liveStats.avgFriction != null ? String(liveStats.avgFriction) : '0', accent: amber },
          { label: 'Unfinished Loops', value: liveStats.unfinishedLoops != null ? String(liveStats.unfinishedLoops) : '0', accent: crimson },
          { label: 'Parked Ideas', value: liveStats.parkedIdeas != null ? String(liveStats.parkedIdeas) : '0', accent: emerald },
          { label: 'Active Patterns', value: String(liveStats.activePatterns ?? livePatterns.length), accent },
        ]
      : [
          { label: 'Loaded Turns', value: String(parsedTranscript.metrics.turnCount), unit: parsedTranscript.format.toUpperCase(), accent },
          { label: 'Topics Indexed', value: String(parsedTranscript.metrics.topTopics.length), accent: gold },
          { label: 'Friction Score', value: String(parsedTranscript.metrics.frictionScore), accent: amber },
          { label: 'Error Markers', value: String(parsedTranscript.metrics.errorCount), accent: crimson },
          { label: 'Corrections', value: String(parsedTranscript.metrics.correctionCount), accent: emerald },
          { label: 'Release Milestones', value: String(STUDIO_RELEASE_MILESTONES.length), unit: 'v2.0–2.3', accent },
        ];

  const tracks = ['All', 'Platform', 'Security', 'Memory & Continuity', 'AX & Discovery', 'Workstations'];
  const visibleMilestones =
    milestoneTrack === 'All'
      ? STUDIO_RELEASE_MILESTONES
      : STUDIO_RELEASE_MILESTONES.filter((m) => m.track === milestoneTrack);

  return (
    <Box data-testid="chronicle-hub-workstation" sx={{ width: '100%', minWidth: 0 }}>
      {/* Unified Workstation Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.25,
          borderRadius: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderCol}`,
          borderTop: `3px solid ${accent}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
              <Typography
                component="span"
                sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase' }}
              >
                CHRONICLE HUB · v{CHRONICLE_SCHEMA_VERSION}
              </Typography>
              <Chip
                label="HYBRID ENGINE"
                size="small"
                sx={{
                  height: 22,
                  fontFamily: MONO,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: gold,
                  bgcolor: rgba(gold, isDark ? 0.14 : 0.08),
                  border: `1px solid ${rgba(gold, 0.35)}`,
                }}
              />
            </Box>
            <Typography
              component="h2"
              sx={{ fontFamily: SERIF, fontWeight: 400, fontSize: { xs: '1.45rem', sm: '1.8rem' }, lineHeight: 1.18, color: primaryText }}
            >
              Zoth Chronicle Hub &amp; Engineering Horizon
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.65, color: secondaryText, maxWidth: '76ch', lineHeight: 1.6 }}>
              Same-origin loopback continuity proxy (<code>/api/studio/chronicle/*</code> → <code>:8161</code>), 100% offline browser JSONL/Markdown transcript analyzer, friction pattern radar, and verified Studio release chronicle.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.75 }}>
            <SovereignStatusPill
              status={connStatus === 'live' ? 'online' : connStatus === 'offline' ? 'warning' : 'syncing'}
              label={
                connStatus === 'live'
                  ? 'LIVE :8161 PROXY'
                  : connStatus === 'offline'
                    ? 'DAEMON OFFLINE · BROWSER HYBRID ACTIVE'
                    : 'PROBING STUDIO PROXY'
              }
            />
            {lastSync && (
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: secondaryText }}>
                updated {lastSync.toLocaleTimeString()} · zero host-path leakage
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action Strip (All >= 44px touch targets, 100% enabled offline & online) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={refresh}
            sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', color: accent, borderColor: rgba(accent, 0.45) }}
          >
            Sync Proxy
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportJson}
            sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', color: primaryText, borderColor: borderCol }}
          >
            Export JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportMarkdown}
            sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', color: primaryText, borderColor: borderCol }}
          >
            Export Markdown Brief
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportCsv}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: isDark ? GOLD_DARK : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#E8C55A' : '#1E293B' },
            }}
          >
            Export CSV (Sanitized)
          </Button>
        </Box>
      </Box>

      {/* Balanced 6-Tile KPI Strip (3x2 on desktop, 2x3 on tablet) */}
      <SovereignKpiStrip items={kpiItems} cols={4} />

      {/* 4-Tab Navigation Bar (44px+ touch targets, scrollable on mobile) */}
      <Box
        sx={{
          mb: 2.25,
          borderRadius: 1.75,
          bgcolor: cardBg,
          border: `1px solid ${borderCol}`,
          px: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Chronicle Hub Workstation Tabs"
          sx={{
            '& .MuiTabs-indicator': { bgcolor: accent, height: 3 },
            '& .MuiTab-root': {
              minHeight: 48,
              fontFamily: MONO,
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: secondaryText,
              '&.Mui-selected': { color: accent },
            },
          }}
        >
          <Tab icon={<PsychologyIcon fontSize="small" />} iconPosition="start" label="Live Continuity & Recall" />
          <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label="FTS5 Archive Search" />
          <Tab icon={<DescriptionIcon fontSize="small" />} iconPosition="start" label="Browser Transcript Analyzer" />
          <Tab icon={<TimelineIcon fontSize="small" />} iconPosition="start" label="Engineering Horizon" />
        </Tabs>
      </Box>

      {/* TAB 0: LIVE CONTINUITY & RECALL + PATTERN RADAR */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SovereignCard
                index="01"
                eyebrow={connStatus === 'live' ? 'SAME-ORIGIN PROXY :8161' : 'BROWSER HYBRID RECALL'}
                title="Continuity Recall & Alerts"
                subtitle={
                  connStatus === 'live'
                    ? 'Query past Hermes + AGY threads, breakage warnings, and habit alerts with host-path redaction.'
                    : `${(statusReason || 'Daemon offline').replace(/\.?$/, '.')} Running instant client-side recall over your loaded browser transcript.`
                }
                accent={accent}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'stretch' }}>
                  <TextField
                    id="chronicle-hub-recall-input"
                    label="Recall Topic or Repository"
                    size="small"
                    fullWidth
                    value={recallQuery}
                    onChange={(e) => setRecallQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') runRecall(recallQuery); }}
                    placeholder="e.g. zoth-studio-v2, hermes, zoth-os"
                    inputProps={{ 'aria-label': 'Recall Topic or Repository' }}
                    sx={{
                      flex: '1 1 200px',
                      '& .MuiInputBase-root': { minHeight: 44 },
                      '& input': { fontFamily: MONO, fontSize: 13, minHeight: 44, boxSizing: 'border-box', py: 1.25 },
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon fontSize="small" />}
                    disabled={recallBusy}
                    onClick={() => runRecall(recallQuery)}
                    sx={{
                      minHeight: 44,
                      px: 2.25,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      bgcolor: isDark ? PURPLE_DARK : PURPLE_LIGHT,
                      color: isDark ? '#08080B' : '#FFFFFF',
                      '&:hover': { bgcolor: isDark ? '#D8B4FE' : '#5B21B6' },
                      '&.Mui-disabled': {
                        bgcolor: isDark ? '#4C1D95' : '#4C1D95',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    Recall
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
                  {CHRONICLE_QUICK_QUERIES.map((q) => (
                    <Button
                      key={q}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setRecallQuery(q);
                        runRecall(q);
                      }}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: recallQuery === q ? rgba(accent, 0.14) : 'transparent',
                        borderColor: rgba(accent, recallQuery === q ? 0.65 : 0.3),
                        color: recallQuery === q ? accent : primaryText,
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </Box>

                {recallBusy && <LinearProgress sx={{ mb: 1.5 }} />}

                {recallResult && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {(recallResult.alerts || recallResult.repetition_alerts || []).slice(0, 2).map((a, idx) => (
                      <Box
                        key={a.id || `alert-${idx}`}
                        sx={{
                          p: 1.35,
                          borderRadius: 1.25,
                          border: `1px solid ${rgba(amber, 0.42)}`,
                          bgcolor: rgba(amber, isDark ? 0.1 : 0.07),
                        }}
                      >
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: amber }}>
                          {a.title}
                        </Typography>
                        {a.detail && (
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', mt: 0.35, color: primaryText }}>
                            {a.detail}
                          </Typography>
                        )}
                      </Box>
                    ))}

                    {(recallResult.breakage_warnings || []).slice(0, 2).map((w, idx) => (
                      <Box
                        key={w.id || `warn-${idx}`}
                        sx={{
                          p: 1.35,
                          borderRadius: 1.25,
                          border: `1px solid ${rgba(crimson, 0.42)}`,
                          bgcolor: rgba(crimson, isDark ? 0.1 : 0.07),
                        }}
                      >
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: crimson, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WarningAmberIcon sx={{ fontSize: 15 }} /> {w.title}
                        </Typography>
                        {w.detail && (
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', mt: 0.35, color: primaryText }}>
                            {w.detail}
                          </Typography>
                        )}
                      </Box>
                    ))}

                    <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.1em', color: secondaryText, textTransform: 'uppercase', mt: 0.25 }}>
                      Related Memories ({(recallResult.related_memories || []).length})
                    </Typography>

                    {(recallResult.related_memories || []).slice(0, 5).map((m, idx) => (
                      <Box
                        key={m.id || idx}
                        sx={{ p: 1.25, borderRadius: 1.25, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}
                      >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
                          <Chip
                            label={m.source || 'vault'}
                            size="small"
                            sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, height: 22 }}
                          />
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: secondaryText }}>
                            {formatChronicleDate(m)} · f:{m.frictionScore ?? 0}
                            {m.messageCount ? ` · ${m.messageCount} msgs` : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: primaryText, wordBreak: 'break-word' }}>
                          {sanitizeChronicleText(m.title)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </SovereignCard>

              <SovereignCard
                index="02"
                eyebrow="CLI & PROXY ENDPOINTS"
                title="ZothOS CLI & Studio Proxy"
                subtitle="Same-origin loopback proxy routes and zoth-memory-vault commands."
                accent={gold}
              >
                <SovereignCodeBlock
                  title="CHRONICLE CLI & LOOPBACK API"
                  accent={gold}
                  code={`zoth open chronicle
zoth-memory-vault serve --port 8161
zoth-memory-vault sync-recent
zoth-memory-vault recall "zoth-studio-v2"
zoth-memory-vault patterns --json
curl -s http://127.0.0.1:3000/api/studio/chronicle/summary`}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
                  <Button
                    variant="outlined"
                    startIcon={copiedCli ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    onClick={() => copyCli('zoth-memory-vault recall "zoth-studio-v2"')}
                    sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', color: gold, borderColor: rgba(gold, 0.45) }}
                  >
                    {copiedCli ? 'Copied Recall CLI' : 'Copy Recall CLI'}
                  </Button>
                </Box>
              </SovereignCard>
            </Box>
          </Grid>

          <Grid xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SovereignCard
                index="03"
                eyebrow="BEHAVIOR INTELLIGENCE"
                title="Friction & Pattern Radar"
                subtitle="Recurring failure modes, polarity signals, and recommended workflow shifts."
                accent={accent}
              >
                {livePatterns.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {livePatterns.slice(0, 6).map((p, idx) => {
                      const polCol = p.polarity === 'remove' ? crimson : p.polarity === 'keep' ? emerald : accent;
                      return (
                        <Box
                          key={p.id || idx}
                          sx={{ p: 1.5, borderRadius: 1.25, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: primaryText }}>
                              {p.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              <Chip label={`${p.count}x`} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, height: 22 }} />
                              <Chip
                                label={String(p.polarity || 'neutral').toUpperCase()}
                                size="small"
                                sx={{
                                  fontFamily: MONO,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  height: 22,
                                  color: polCol,
                                  bgcolor: rgba(polCol, isDark ? 0.14 : 0.08),
                                  border: `1px solid ${rgba(polCol, 0.35)}`,
                                }}
                              />
                              <Chip label={p.category || 'behavior'} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', height: 22 }} />
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.84rem', mt: 0.65, color: secondaryText, lineHeight: 1.55 }}>
                            {p.summary}
                          </Typography>
                          {p.suggestedShift && (
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.65, color: accent, fontWeight: 600 }}>
                              Shift: {p.suggestedShift}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography variant="body2" sx={{ color: secondaryText }}>
                      Live <code>:8161</code> daemon is offline — showing real-time markers extracted from the active Browser Transcript Analyzer ({parsedTranscript.metrics.turnCount} turns).
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label={`Errors: ${parsedTranscript.metrics.errorCount}`} sx={{ fontFamily: MONO, fontWeight: 700, color: crimson, border: `1px solid ${rgba(crimson, 0.4)}` }} />
                      <Chip label={`Corrections: ${parsedTranscript.metrics.correctionCount}`} sx={{ fontFamily: MONO, fontWeight: 700, color: amber, border: `1px solid ${rgba(amber, 0.4)}` }} />
                      <Chip label={`Stalls: ${parsedTranscript.metrics.stallCount}`} sx={{ fontFamily: MONO, fontWeight: 700, color: accent, border: `1px solid ${rgba(accent, 0.4)}` }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveTab(2)}
                        sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', color: accent, borderColor: rgba(accent, 0.45) }}
                      >
                        Open Browser Transcript Analyzer
                      </Button>
                    </Box>
                  </Box>
                )}
              </SovereignCard>

              <SovereignCard
                index="04"
                eyebrow="SANITIZED CONTINUITY QUEUE"
                title="Unfinished Loops & Parked Ideas"
                subtitle="Open engineering threads and captured ideas with host home paths redacted to ~/."
                accent={gold}
              >
                {unfinishedLoops.length > 0 || parkedIdeas.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[...unfinishedLoops.slice(0, 3), ...parkedIdeas.slice(0, 3)].map((item) => {
                      const isUnfinished = item.itemType === 'unfinished';
                      const badgeCol = isUnfinished ? crimson : emerald;
                      return (
                        <Box key={item.id} sx={{ p: 1.25, borderRadius: 1.25, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
                            <Chip
                              label={isUnfinished ? 'UNFINISHED' : 'PARKED IDEA'}
                              size="small"
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                height: 22,
                                color: badgeCol,
                                bgcolor: rgba(badgeCol, isDark ? 0.14 : 0.08),
                                border: `1px solid ${rgba(badgeCol, 0.35)}`,
                              }}
                            />
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: secondaryText }}>
                              {item.category} · {item.date}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 700, color: primaryText }}>
                            {item.title}
                          </Typography>
                          {item.summary && (
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.35, color: secondaryText, wordBreak: 'break-word' }}>
                              {item.summary.slice(0, 220)}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: secondaryText }}>
                    No live continuity loops loaded from <code>:8161</code>. Switch to the Browser Transcript Analyzer tab to inspect local <code>.jsonl</code>, <code>.json</code>, or <code>.md</code> session logs offline.
                  </Typography>
                )}
              </SovereignCard>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: FTS5 ARCHIVE SEARCH (LIVE PROXY + OFFLINE FALLBACK) */}
      {activeTab === 1 && (
        <SovereignCard
          index="02"
          eyebrow={searchSource === 'live-fts5' ? 'LIVE SQLITE FTS5 (:8161 PROXY)' : 'LOCAL BROWSER FULL-TEXT INDEX'}
          title="FTS5 Conversation Archive Search"
          subtitle="Search consolidated Hermes + AGY threads via /api/studio/chronicle/search, with automatic offline fallback to loaded browser transcripts."
          accent={accent}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'stretch' }}>
            <TextField
              id="chronicle-archive-search-input"
              label="Archive Search Query"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runArchiveSearch(searchQuery); }}
              placeholder="Search conversations (e.g. chronicle, screenshot, proxy, systemd)"
              inputProps={{ 'aria-label': 'Archive Search Query' }}
              sx={{
                flex: '1 1 240px',
                '& .MuiInputBase-root': { minHeight: 44 },
                '& input': { fontFamily: MONO, fontSize: 13, minHeight: 44, boxSizing: 'border-box', py: 1.25 },
              }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon fontSize="small" />}
              disabled={searchBusy}
              onClick={() => runArchiveSearch(searchQuery)}
              sx={{
                minHeight: 44,
                px: 2.5,
                fontFamily: MONO,
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: isDark ? PURPLE_DARK : PURPLE_LIGHT,
                color: isDark ? '#08080B' : '#FFFFFF',
                '&:hover': { bgcolor: isDark ? '#D8B4FE' : '#5B21B6' },
              }}
            >
              Search Archive
            </Button>
          </Box>

          {searchBusy && <LinearProgress sx={{ mb: 1.5 }} />}

          <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: secondaryText, mb: 1.5 }}>
            {searchTotal != null ? `${searchTotal.toLocaleString()} matching record(s)` : 'Run a query above'} · engine: {searchSource}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {searchHits.map((c, idx) => (
              <Box key={c.id || idx} sx={{ p: 1.35, borderRadius: 1.25, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
                  <Chip label={c.source || 'log'} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, height: 22 }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: secondaryText }}>
                    {formatChronicleDate(c)} · {c.messageCount ?? 0} msgs · f:{c.frictionScore ?? 0}
                  </Typography>
                  {c.outcomeStatus && (
                    <Chip label={c.outcomeStatus} size="small" sx={{ fontFamily: MONO, fontSize: '0.66rem', height: 22, color: emerald }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.88rem', fontWeight: 700, color: primaryText, wordBreak: 'break-word' }}>
                  {sanitizeChronicleText(c.title || c.id)}
                </Typography>
                {c.snippet && c.snippet !== c.title && (
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.35, color: secondaryText, wordBreak: 'break-word' }}>
                    {sanitizeChronicleText(c.snippet).slice(0, 220)}
                  </Typography>
                )}
              </Box>
            ))}
            {searchHits.length === 0 && (
              <Typography variant="body2" sx={{ color: secondaryText }}>
                No matching conversations for &ldquo;{sanitizeChronicleText(searchQuery)}&rdquo;.
              </Typography>
            )}
          </Box>
        </SovereignCard>
      )}

      {/* TAB 2: 100% OFFLINE BROWSER TRANSCRIPT ANALYZER */}
      {activeTab === 2 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={5}>
            <SovereignCard
              index="03"
              eyebrow="100% CLIENT-SIDE PARSER"
              title="Import or Paste Session Log"
              subtitle="Supports .jsonl, .json, and .md transcripts. Runs entirely in browser memory with zero network calls."
              accent={accent}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon fontSize="small" />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ minHeight: 44, px: 1.75, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: accent, borderColor: rgba(accent, 0.45) }}
                >
                  Upload .jsonl / .md / .json
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jsonl,.json,.md,.txt"
                  aria-label="Upload session transcript file"
                  onChange={handleUploadTranscript}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setTranscriptInput(SAMPLE_BROWSER_TRANSCRIPT_JSONL)}
                  sx={{ minHeight: 44, px: 1.5, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: primaryText, borderColor: borderCol }}
                >
                  Sample JSONL
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setTranscriptInput(SAMPLE_BROWSER_TRANSCRIPT_MD)}
                  sx={{ minHeight: 44, px: 1.5, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: primaryText, borderColor: borderCol }}
                >
                  Sample Markdown
                </Button>
              </Box>

              <TextField
                id="chronicle-transcript-editor"
                label="Session Transcript Input (.jsonl / .json / .md)"
                multiline
                minRows={10}
                maxRows={16}
                fullWidth
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                inputProps={{ 'aria-label': 'Session Transcript Input' }}
                sx={{
                  '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.55 },
                }}
              />

              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                <Chip label={`Format: ${parsedTranscript.format.toUpperCase()}`} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700 }} />
                <Chip label={`Range: ${parsedTranscript.metrics.dateStart} → ${parsedTranscript.metrics.dateEnd}`} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem' }} />
                <Chip label={`Friction: ${parsedTranscript.metrics.frictionScore}`} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', color: amber }} />
              </Box>
            </SovereignCard>
          </Grid>

          <Grid xs={12} md={7}>
            <SovereignCard
              index="04"
              eyebrow="EXTRACTED TELEMETRY & FILTER"
              title={`Parsed Session Turns (${filteredTurns.length}/${parsedTranscript.metrics.turnCount})`}
              subtitle="Instant client-side full-text filtering, topic frequency extraction, and error/correction markers."
              accent={gold}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <TextField
                  id="chronicle-transcript-filter"
                  label="Filter Parsed Turns"
                  size="small"
                  fullWidth
                  value={transcriptFilterQuery}
                  onChange={(e) => setTranscriptFilterQuery(e.target.value)}
                  placeholder="Filter by keyword, error, or topic..."
                  inputProps={{ 'aria-label': 'Filter Parsed Turns' }}
                  sx={{
                    flex: '1 1 200px',
                    '& .MuiInputBase-root': { minHeight: 44 },
                    '& input': { fontFamily: MONO, fontSize: 13, minHeight: 44, boxSizing: 'border-box', py: 1.25 },
                  }}
                />
                {['all', 'user', 'assistant', 'tool'].map((role) => (
                  <Button
                    key={role}
                    variant="outlined"
                    onClick={() => setTranscriptRoleFilter(role)}
                    sx={{
                      minHeight: 44,
                      px: 1.5,
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      bgcolor: transcriptRoleFilter === role ? rgba(gold, 0.14) : 'transparent',
                      borderColor: rgba(gold, transcriptRoleFilter === role ? 0.65 : 0.3),
                      color: transcriptRoleFilter === role ? gold : primaryText,
                    }}
                  >
                    {role}
                  </Button>
                ))}
              </Box>

              {parsedTranscript.metrics.topTopics.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                  {parsedTranscript.metrics.topTopics.slice(0, 8).map((t) => (
                    <Chip
                      key={t.tag}
                      label={`#${t.tag} (${t.count})`}
                      size="small"
                      sx={{ fontFamily: MONO, fontSize: '0.68rem', color: accent, bgcolor: rgba(accent, 0.08), border: `1px solid ${rgba(accent, 0.3)}` }}
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 460, overflowY: 'auto', pr: 0.5 }}>
                {filteredTurns.map((turn) => (
                  <Box key={turn.id} sx={{ p: 1.35, borderRadius: 1.25, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
                      <Chip label={turn.role.toUpperCase()} size="small" sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, height: 22 }} />
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: secondaryText }}>
                        #{turn.index} · {turn.date}
                      </Typography>
                      {turn.hasError && (
                        <Chip label="ERROR" size="small" sx={{ fontFamily: MONO, fontSize: '0.64rem', height: 20, fontWeight: 700, color: crimson, border: `1px solid ${rgba(crimson, 0.4)}` }} />
                      )}
                      {turn.hasCorrection && (
                        <Chip label="CORRECTION" size="small" sx={{ fontFamily: MONO, fontSize: '0.64rem', height: 20, fontWeight: 700, color: amber, border: `1px solid ${rgba(amber, 0.4)}` }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.84rem', color: primaryText, lineHeight: 1.55, wordBreak: 'break-word' }}>
                      {turn.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SovereignCard>
          </Grid>
        </Grid>
      )}

      {/* TAB 3: GROUNDED ENGINEERING HORIZON & RELEASE CHRONICLE */}
      {activeTab === 3 && (
        <SovereignCard
          index="05"
          eyebrow="VERIFIED REPOSITORY CHRONICLE"
          title="Zoth Studio Engineering Horizon (v2.0 → v2.3.0)"
          subtitle="Grounded in verified repository milestones (85 tools, 45 workstations, Whiteboard Audits #001–#023) with zero fabricated hashes."
          accent={gold}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tracks.map((track) => (
              <Button
                key={track}
                variant="outlined"
                onClick={() => setMilestoneTrack(track)}
                sx={{
                  minHeight: 44,
                  px: 1.75,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: milestoneTrack === track ? rgba(gold, 0.14) : 'transparent',
                  borderColor: rgba(gold, milestoneTrack === track ? 0.65 : 0.3),
                  color: milestoneTrack === track ? gold : primaryText,
                }}
              >
                {track}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {visibleMilestones.map((ms) => (
              <Box
                key={ms.id}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  bgcolor: subtleBg,
                  border: `1px solid ${borderCol}`,
                  borderLeft: `3px solid ${emerald}`,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.6 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    <Chip label={ms.version} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: gold, border: `1px solid ${rgba(gold, 0.4)}` }} />
                    <Chip label={ms.track} size="small" sx={{ fontFamily: MONO, fontSize: '0.68rem' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: primaryText }}>
                      {ms.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${ms.status} · ${ms.date}`}
                    size="small"
                    sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: emerald, bgcolor: rgba(emerald, 0.1), border: `1px solid ${rgba(emerald, 0.35)}` }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6, mb: 0.75 }}>
                  {ms.summary}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: accent }}>
                  Evidence: {ms.evidence}
                </Typography>
              </Box>
            ))}
          </Box>
        </SovereignCard>
      )}

      <Divider sx={{ my: 2.5, opacity: 0.25 }} />
    </Box>
  );
}
