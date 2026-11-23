import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  rgba,
} from '../sovereign';

/**
 * Chronicle Vault (zoth-memory-vault) — God-Mode workstation (Layer B).
 *
 * Live loopback client for chronicle-vault.service on http://127.0.0.1:8161.
 * Every KPI, continuity recall, pattern signal, and FTS5 conversation hit comes
 * directly from the local SQLite-backed daemon with zero canned data.
 */
const BASE = 'http://127.0.0.1:8161';
const PURPLE_DARK = '#C084FC';
const PURPLE_LIGHT = '#6D28D9';
const QUICK_QUERIES = ['zoth-studio-v2', 'hermes', 'zoth-os', 'screenshot'];

async function apiGet(path, timeoutMs = 4000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function apiPost(path, payload, timeoutMs = 5000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export default function ChronicleVaultGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? PURPLE_DARK : PURPLE_LIGHT;
  const { copied, copy } = useCopy();

  const [connStatus, setConnStatus] = useState('connecting');
  const [err, setErr] = useState(null);
  const [overview, setOverview] = useState(null);
  const [continuity, setContinuity] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [recallQuery, setRecallQuery] = useState('zoth-studio-v2');
  const [recallResult, setRecallResult] = useState(null);
  const [recallBusy, setRecallBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHits, setSearchHits] = useState([]);
  const [searchTotal, setSearchTotal] = useState(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const alive = useRef(true);

  const runRecall = useCallback(async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed) return;
    setRecallBusy(true);
    try {
      const res = await apiPost('/api/continuity/recall', { query: trimmed });
      if (!alive.current) return;
      setRecallResult(res);
    } catch (e) {
      if (!alive.current) return;
      setErr(e.name === 'AbortError' ? 'recall request timed out' : e.message);
    } finally {
      if (alive.current) setRecallBusy(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [ov, co, pat] = await Promise.all([
        apiGet('/api/overview'),
        apiGet('/api/continuity/overview'),
        apiGet('/api/patterns'),
      ]);
      if (!alive.current) return;
      setOverview(ov);
      setContinuity(co);
      setPatterns(Array.isArray(pat.patterns) ? pat.patterns : []);
      setConnStatus('live');
      setErr(null);
      setLastSync(new Date());
      runRecall('zoth-studio-v2');
    } catch (e) {
      if (!alive.current) return;
      setConnStatus('offline');
      setErr(e.name === 'AbortError' ? 'request timed out' : e.message);
    }
  }, [runRecall]);

  useEffect(() => {
    alive.current = true;
    refresh();
    return () => { alive.current = false; };
  }, [refresh]);

  const runSearch = useCallback(async (q) => {
    const trimmed = (q || '').trim();
    setSearchBusy(true);
    try {
      const res = await apiGet(`/api/conversations?q=${encodeURIComponent(trimmed)}&limit=6`);
      if (!alive.current) return;
      setSearchHits(Array.isArray(res.conversations) ? res.conversations : (Array.isArray(res.items) ? res.items : []));
      setSearchTotal(typeof res.total === 'number' ? res.total : null);
    } catch (e) {
      if (!alive.current) return;
      setErr(e.message);
    } finally {
      if (alive.current) setSearchBusy(false);
    }
  }, []);

  const handleExportJson = () => {
    downloadJson(
      `chronicle-vault-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
      { exported_at: new Date().toISOString(), base: BASE, overview, continuity, recallResult, top_patterns: patterns.slice(0, 12) }
    );
  };

  const handleExportBrief = () => {
    const lines = [
      '# Chronicle Vault Continuity Snapshot',
      `Exported: ${new Date().toISOString()}`,
      `Conversations: ${overview?.totals?.conversations ?? '—'} | Messages: ${overview?.totals?.messages ?? '—'} | Avg Friction: ${overview?.totals?.avg_friction ?? '—'}`,
      `Unfinished Open: ${continuity?.counts?.unfinished_open ?? '—'} | Innovation Ideas: ${continuity?.counts?.innovation_open ?? '—'}`,
      '',
      `## Recall Query: ${recallQuery}`,
      ...(recallResult?.related_memories || []).slice(0, 6).map(
        (m) => `- [${m.family || 'vault'}] ${m.started_at || ''} (f:${m.friction_score ?? 0}) ${m.title || m.conversation_id}`
      ),
    ];
    downloadText(`chronicle-vault-brief-${new Date().toISOString().slice(0, 10)}.md`, lines.join('\n'));
  };

  const totals = overview?.totals || {};
  const counts = continuity?.counts || {};
  const kpis = [
    { label: 'Conversations', value: totals.conversations != null ? totals.conversations.toLocaleString() : '—', accent },
    { label: 'Messages', value: totals.messages != null ? totals.messages.toLocaleString() : '—' },
    { label: 'Avg Friction', value: totals.avg_friction != null ? `${totals.avg_friction}` : '—', accent: '#F59E0B' },
    { label: 'Unfinished Loops', value: counts.unfinished_open != null ? String(counts.unfinished_open) : '—', accent: '#F87171' },
    { label: 'Parked Ideas', value: counts.innovation_open != null ? String(counts.innovation_open) : '—', accent: '#34D399' },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={connStatus === 'live' ? 'ok' : connStatus === 'offline' ? 'error' : 'info'}
        label={connStatus === 'live' ? 'LIVE :8161' : connStatus === 'offline' ? 'DAEMON OFFLINE' : 'CONNECTING'}
      />
      {lastSync && (
        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
          synced {lastSync.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );

  const actions = [
    { label: 'Refresh', icon: <RefreshIcon fontSize="small" />, onClick: refresh, variant: 'outlined' },
    { label: 'Export JSON', icon: <DownloadIcon fontSize="small" />, onClick: handleExportJson, variant: 'outlined', disabled: !overview },
    { label: 'Export Brief', icon: <DownloadIcon fontSize="small" />, onClick: handleExportBrief, variant: 'outlined', disabled: !overview },
    {
      label: 'Open :8161 Workstation',
      icon: <OpenInNewIcon fontSize="small" />,
      href: BASE,
      target: '_blank',
      rel: 'noopener noreferrer',
      variant: 'contained',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard title="LIVE CONTINUITY RECALL" subtitle="Auto-connect past Hermes + AGY threads, breakage warnings, and habit alerts">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            value={recallQuery}
            onChange={(e) => setRecallQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runRecall(recallQuery); }}
            placeholder="Repo, topic, or subsystem (e.g. zoth-studio-v2)"
            sx={{ flex: '1 1 200px', '& input': { fontFamily: MONO, fontSize: 13 } }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AutoAwesomeIcon fontSize="small" />}
            disabled={connStatus !== 'live' || recallBusy}
            onClick={() => runRecall(recallQuery)}
            sx={{ fontFamily: MONO, fontSize: 11, textTransform: 'uppercase' }}
          >
            Recall
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {QUICK_QUERIES.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              clickable
              onClick={() => { setRecallQuery(q); runRecall(q); }}
              sx={{
                fontFamily: MONO,
                fontSize: 11,
                bgcolor: recallQuery === q ? rgba(accent, 0.16) : 'transparent',
                border: `1px solid ${rgba(accent, recallQuery === q ? 0.5 : 0.22)}`,
                color: recallQuery === q ? accent : 'text.secondary',
              }}
            />
          ))}
        </Box>

        {recallBusy && <LinearProgress sx={{ mb: 1.5 }} />}

        {recallResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {(recallResult.repetition_alerts || []).slice(0, 2).map((a, idx) => (
              <Box
                key={`rep-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>
                  {a.label || 'REPETITION ALERT'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.25 }}>
                  {a.detail || a.message || String(a)}
                </Typography>
              </Box>
            ))}

            {(recallResult.breakage_warnings || []).slice(0, 2).map((w, idx) => (
              <Box
                key={`brk-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: '1px solid rgba(248, 113, 113, 0.35)',
                  bgcolor: 'rgba(248, 113, 113, 0.08)',
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#F87171', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningAmberIcon sx={{ fontSize: 14 }} /> BREAKAGE RISK
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.25 }}>
                  {w.title || w.snippet || String(w)}
                </Typography>
              </Box>
            ))}

            <Typography sx={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.2, opacity: 0.65, textTransform: 'uppercase' }}>
              Related Past Memories ({(recallResult.related_memories || []).length})
            </Typography>
            {(recallResult.related_memories || []).slice(0, 5).map((m, idx) => (
              <Box
                key={m.conversation_id || idx}
                sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.25 }}>
                  <Chip label={m.family || 'vault'} size="small" sx={{ fontFamily: MONO, fontSize: 10, height: 20 }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: 10.5, color: 'text.secondary' }}>
                    {(m.started_at || '').slice(0, 10)} · f:{m.friction_score ?? 0}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: 12.5, fontWeight: 500, wordBreak: 'break-word' }}>
                  {m.title || m.conversation_id}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {connStatus === 'live' ? 'Run a recall query to inspect connected Hermes + AGY threads.' : 'Start chronicle-vault.service to query live continuity.'}
          </Typography>
        )}
      </SovereignCard>

      <SovereignCard title="ZOTHOS CLI & MCP QUICKSTART" subtitle="Loopback-only SQLite FTS5 & MCP stdio server">
        <SovereignCodeBlock
          language="bash"
          code={`zoth-memory-vault serve --port 8161
zoth-memory-vault sync-recent
zoth-memory-vault recall "zoth-studio-v2"
zoth-memory-vault patterns --json
zoth-memory-vault mcp`}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy('zoth-memory-vault recall "zoth-studio-v2"')}
            sx={{ fontFamily: MONO, fontSize: 11 }}
          >
            {copied ? 'Copied CLI' : 'Copy Recall CLI'}
          </Button>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard title="FRICTION & PATTERN RADAR" subtitle="Live recurring failure modes and agent hygiene signals">
        {patterns.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {connStatus === 'live' ? 'No friction patterns recorded yet.' : 'Daemon offline — start chronicle-vault.service on :8161.'}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {patterns.slice(0, 6).map((p, idx) => (
              <Box
                key={p.id || p.pattern_key || idx}
                sx={{ p: 1.25, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                    {p.title || p.name || p.pattern_key}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {p.occurrences != null && (
                      <Chip label={`${p.occurrences}x`} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 20 }} />
                    )}
                    {p.severity && (
                      <Chip label={String(p.severity).toUpperCase()} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 20, color: accent }} />
                    )}
                  </Box>
                </Box>
                {(p.summary || p.description || p.recommendation) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.2, mt: 0.5 }}>
                    {p.summary || p.description || p.recommendation}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </SovereignCard>

      <SovereignCard title="FTS5 ARCHIVE SEARCH" subtitle="Full-text search across consolidated Hermes + AGY histories">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
          <TextField
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch(searchQuery); }}
            placeholder="Search conversations (e.g. screenshot, proxy, systemd)"
            sx={{ flex: '1 1 200px', '& input': { fontFamily: MONO, fontSize: 13 } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<SearchIcon fontSize="small" />}
            disabled={connStatus !== 'live' || searchBusy}
            onClick={() => runSearch(searchQuery)}
            sx={{ fontFamily: MONO, fontSize: 11 }}
          >
            Search
          </Button>
        </Box>
        {searchBusy && <LinearProgress sx={{ mb: 1 }} />}
        {searchTotal !== null && (
          <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary', mb: 1 }}>
            {searchTotal.toLocaleString()} matching conversations
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {searchHits.slice(0, 5).map((c, idx) => (
            <Box key={c.id || idx} sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                <Chip label={c.family || 'log'} size="small" sx={{ fontFamily: MONO, fontSize: 10, height: 20 }} />
                <Typography sx={{ fontFamily: MONO, fontSize: 10.5, color: 'text.secondary' }}>
                  {(c.started_at || '').slice(0, 10)} · {c.message_count ?? '?'} msgs
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.35, wordBreak: 'break-word' }}>
                {c.title || c.id}
              </Typography>
            </Box>
          ))}
        </Box>
      </SovereignCard>

      {continuity?.items?.length > 0 && (
        <SovereignCard title="OPEN CONTINUITY LOOPS" subtitle="Unfinished threads & parked innovation ideas">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {continuity.items.slice(0, 4).map((item) => (
              <Box key={item.id} sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                  <Chip
                    label={item.item_type || 'loop'}
                    size="small"
                    sx={{ fontFamily: MONO, fontSize: 10, height: 20, color: item.item_type === 'unfinished' ? '#F87171' : '#34D399' }}
                  />
                  <Typography sx={{ fontFamily: MONO, fontSize: 10.5, color: 'text.secondary' }}>
                    {item.category || item.project}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: 12.2, mt: 0.35, wordBreak: 'break-word' }}>
                  {item.snippet || item.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </SovereignCard>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {connStatus === 'offline' && (
        <Box sx={{ mb: 2 }}>
          <SovereignAlertBanner
            severity="warning"
            title="Chronicle Vault daemon unreachable on 127.0.0.1:8161"
            message={`Error: ${err || 'connection refused'}. Start it with: systemctl --user start chronicle-vault.service (or zoth-memory-vault serve --port 8161).`}
          />
        </Box>
      )}
      <SovereignWorkstationShell
        id="zoth-memory-vault"
        category="MEMORY & BRAIN"
        title="Chronicle Vault"
        subtitle="Contained Hermes + AGY conversation consolidation, friction/pattern intelligence, live continuity recall, and personal prompt playbook workstation."
        version="1.0.0"
        accent={PURPLE_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
      <Divider sx={{ my: 2, opacity: 0.25 }} />
    </Box>
  );
}
