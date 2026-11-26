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
import {
  CHRONICLE_QUICK_QUERIES,
  CHRONICLE_SCHEMA_VERSION,
  formatChronicleDate,
  sanitizeChronicleText,
  buildChronicleMarkdownBrief,
} from '../../utils/chronicleEngine';

/**
 * Chronicle Vault (zoth-memory-vault) — God-Mode workstation (Layer B).
 *
 * Routes all reads through Studio's hardened same-origin loopback proxy
 * `/api/studio/chronicle/{summary,recall,search}` (zero direct :8161 browser fetches,
 * zero host-path leaks, zero offline ERR_FAILED console spam, and safe timestamp formatting).
 */
const STANDALONE_URL = 'http://127.0.0.1:8161';
const PURPLE_DARK = '#C084FC';
const PURPLE_LIGHT = '#6D28D9';

async function proxyGet(path, timeoutMs = 4000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { online: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { online: false, reason: 'Studio proxy unavailable' };
    return await res.json();
  } catch (e) {
    return { online: false, reason: e.name === 'AbortError' ? 'request timed out' : 'proxy unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

async function proxyPost(path, payload, timeoutMs = 5000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { online: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { online: false, reason: 'Studio proxy unavailable' };
    return await res.json();
  } catch (e) {
    return { online: false, reason: e.name === 'AbortError' ? 'recall timed out' : 'proxy unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

export default function ChronicleVaultGodModeTool({ showSupportBar = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? PURPLE_DARK : PURPLE_LIGHT;
  const amber = isDark ? '#F59E0B' : '#B45309';
  const crimson = isDark ? '#F87171' : '#B91C1C';
  const emerald = isDark ? '#34D399' : '#047857';
  const { copied, copy } = useCopy();

  const [connStatus, setConnStatus] = useState('connecting');
  const [statusReason, setStatusReason] = useState('');
  const [stats, setStats] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [continuityItems, setContinuityItems] = useState([]);
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
    const res = await proxyPost('/api/studio/chronicle/recall', { query: trimmed });
    if (!alive.current) return;
    if (res.online) {
      setRecallResult(res);
    } else {
      setRecallResult(null);
      if (res.reason) setStatusReason(res.reason);
    }
    setRecallBusy(false);
  }, []);

  const refresh = useCallback(async () => {
    const summary = await proxyGet('/api/studio/chronicle/summary');
    if (!alive.current) return;
    if (summary.online) {
      setStats(summary.stats || null);
      setPatterns(Array.isArray(summary.patterns) ? summary.patterns : []);
      setContinuityItems(Array.isArray(summary.continuityItems) ? summary.continuityItems : []);
      setConnStatus('live');
      setStatusReason('');
      setLastSync(new Date());
      runRecall('zoth-studio-v2');
    } else {
      setConnStatus('offline');
      setStatusReason(summary.reason || 'Chronicle Vault daemon (:8161) offline');
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
    const res = await proxyGet(`/api/studio/chronicle/search?q=${encodeURIComponent(trimmed)}&limit=8`);
    if (!alive.current) return;
    if (res.online) {
      setSearchHits(Array.isArray(res.conversations) ? res.conversations : []);
      setSearchTotal(typeof res.total === 'number' ? res.total : 0);
    }
    setSearchBusy(false);
  }, []);

  const handleExportJson = () => {
    downloadJson(
      `chronicle-vault-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
      {
        schemaVersion: CHRONICLE_SCHEMA_VERSION,
        exported_at: new Date().toISOString(),
        online: connStatus === 'live',
        stats,
        recallResult,
        top_patterns: patterns.slice(0, 12),
        continuity_items: continuityItems.slice(0, 12),
      }
    );
  };

  const handleExportBrief = () => {
    const md = buildChronicleMarkdownBrief({
      mode: connStatus === 'live' ? 'live-proxy' : 'offline',
      stats,
      recallQuery,
      recallResult,
      patterns,
    });
    downloadText(`chronicle-vault-brief-${new Date().toISOString().slice(0, 10)}.md`, md);
  };

  const kpis = [
    { label: 'Conversations', value: stats?.conversations != null ? stats.conversations.toLocaleString() : '—', accent },
    { label: 'Messages', value: stats?.messages != null ? stats.messages.toLocaleString() : '—', accent },
    { label: 'Avg Friction', value: stats?.avgFriction != null ? String(stats.avgFriction) : '—', accent: amber },
    { label: 'Unfinished Loops', value: stats?.unfinishedLoops != null ? String(stats.unfinishedLoops) : '—', accent: crimson },
    { label: 'Parked Ideas', value: stats?.parkedIdeas != null ? String(stats.parkedIdeas) : '—', accent: emerald },
    { label: 'Active Patterns', value: stats?.activePatterns != null ? String(stats.activePatterns) : String(patterns.length), accent },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={connStatus === 'live' ? 'online' : connStatus === 'offline' ? 'warning' : 'syncing'}
        label={connStatus === 'live' ? 'LIVE :8161 PROXY' : connStatus === 'offline' ? 'DAEMON OFFLINE' : 'CONNECTING'}
      />
      {lastSync && (
        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
          synced {lastSync.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );

  const actions = [
    { label: 'Refresh', icon: <RefreshIcon fontSize="small" />, onClick: refresh, accent },
    { label: 'Export JSON', icon: <DownloadIcon fontSize="small" />, onClick: handleExportJson, accent },
    { label: 'Export Brief', icon: <DownloadIcon fontSize="small" />, onClick: handleExportBrief, accent },
    {
      label: 'Open :8161 Workstation',
      icon: <OpenInNewIcon fontSize="small" />,
      href: STANDALONE_URL,
      target: '_blank',
      rel: 'noopener noreferrer',
      primary: true,
      accent,
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        title="LIVE CONTINUITY RECALL"
        subtitle="Auto-connect past Hermes + AGY threads, breakage warnings, and habit alerts"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'stretch' }}>
          <TextField
            id="vault-recall-query"
            label="Continuity Recall Query"
            size="small"
            fullWidth
            value={recallQuery}
            onChange={(e) => setRecallQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runRecall(recallQuery); }}
            placeholder="Repo, topic, or subsystem (e.g. zoth-studio-v2)"
            inputProps={{ 'aria-label': 'Continuity Recall Query' }}
            sx={{
              flex: '1 1 200px',
              '& .MuiInputBase-root': { minHeight: 44 },
              '& input': { fontFamily: MONO, fontSize: 13, minHeight: 44, boxSizing: 'border-box', py: 1.25 },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon fontSize="small" />}
            disabled={connStatus !== 'live' || recallBusy}
            onClick={() => runRecall(recallQuery)}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              bgcolor: isDark ? PURPLE_DARK : PURPLE_LIGHT,
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            Recall
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          {CHRONICLE_QUICK_QUERIES.map((q) => (
            <Button
              key={q}
              size="small"
              variant="outlined"
              onClick={() => { setRecallQuery(q); runRecall(q); }}
              sx={{
                minHeight: 44,
                px: 1.5,
                fontFamily: MONO,
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: recallQuery === q ? rgba(accent, 0.14) : 'transparent',
                borderColor: rgba(accent, recallQuery === q ? 0.65 : 0.3),
                color: recallQuery === q ? accent : 'text.primary',
              }}
            >
              {q}
            </Button>
          ))}
        </Box>

        {recallBusy && <LinearProgress sx={{ mb: 1.5 }} />}

        {recallResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {(recallResult.alerts || recallResult.repetition_alerts || []).slice(0, 2).map((a, idx) => (
              <Box
                key={a.id || `rep-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: `1px solid ${rgba(amber, 0.4)}`,
                  bgcolor: rgba(amber, 0.08),
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: amber }}>
                  {a.title || 'Recurring Pattern Alert'}
                </Typography>
                {a.detail && (
                  <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.25 }}>
                    {a.detail}
                  </Typography>
                )}
              </Box>
            ))}

            {(recallResult.breakage_warnings || []).slice(0, 2).map((w, idx) => (
              <Box
                key={w.id || `brk-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: `1px solid ${rgba(crimson, 0.4)}`,
                  bgcolor: rgba(crimson, 0.08),
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: crimson, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningAmberIcon sx={{ fontSize: 15 }} /> {w.title || 'BREAKAGE RISK'}
                </Typography>
                {w.detail && (
                  <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.25 }}>
                    {w.detail}
                  </Typography>
                )}
              </Box>
            ))}

            <Typography sx={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.1, color: 'text.secondary', textTransform: 'uppercase' }}>
              Related Past Memories ({(recallResult.related_memories || []).length})
            </Typography>
            {(recallResult.related_memories || []).slice(0, 5).map((m, idx) => (
              <Box
                key={m.id || idx}
                sx={{ p: 1.25, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.35 }}>
                  <Chip label={m.source || 'vault'} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 22 }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                    {formatChronicleDate(m)} · f:{m.frictionScore ?? 0}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: 12.5, fontWeight: 600, wordBreak: 'break-word' }}>
                  {sanitizeChronicleText(m.title || m.id)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {connStatus === 'live' ? 'Run a recall query to inspect connected Hermes + AGY threads.' : 'Start chronicle-vault.service on :8161 to query live continuity.'}
          </Typography>
        )}
      </SovereignCard>

      <SovereignCard title="ZOTHOS CLI & MCP QUICKSTART" subtitle="Loopback-only SQLite FTS5 & MCP stdio server" accent={accent}>
        <SovereignCodeBlock
          title="CHRONICLE VAULT CLI"
          accent={accent}
          code={`zoth-memory-vault serve --port 8161
zoth-memory-vault sync-recent
zoth-memory-vault recall "zoth-studio-v2"
zoth-memory-vault patterns --json
zoth-memory-vault mcp`}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
          <Button
            variant="outlined"
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy('zoth-memory-vault recall "zoth-studio-v2"')}
            sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: accent, borderColor: rgba(accent, 0.45) }}
          >
            {copied ? 'Copied CLI' : 'Copy Recall CLI'}
          </Button>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard title="FRICTION & PATTERN RADAR" subtitle="Live recurring failure modes and agent hygiene signals" accent={accent}>
        {patterns.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {connStatus === 'live' ? 'No friction patterns recorded yet.' : 'Daemon offline — start chronicle-vault.service on :8161.'}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {patterns.slice(0, 6).map((p, idx) => (
              <Box
                key={p.id || idx}
                sx={{ p: 1.35, borderRadius: 1.25, border: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                    {p.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip label={`${p.count ?? 0}x`} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 22 }} />
                    <Chip
                      label={String(p.polarity || 'neutral').toUpperCase()}
                      size="small"
                      sx={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        height: 22,
                        fontWeight: 700,
                        color: p.polarity === 'remove' ? crimson : p.polarity === 'keep' ? emerald : accent,
                        border: `1px solid ${rgba(p.polarity === 'remove' ? crimson : p.polarity === 'keep' ? emerald : accent, 0.35)}`,
                        bgcolor: rgba(p.polarity === 'remove' ? crimson : p.polarity === 'keep' ? emerald : accent, 0.08),
                      }}
                    />
                    <Chip label={p.category || 'behavior'} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 22 }} />
                  </Box>
                </Box>
                {p.summary && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, mt: 0.65, lineHeight: 1.55 }}>
                    {p.summary}
                  </Typography>
                )}
                {p.suggestedShift && (
                  <Typography variant="body2" sx={{ fontSize: 12, mt: 0.65, color: accent, fontWeight: 600 }}>
                    Shift: {p.suggestedShift}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </SovereignCard>

      <SovereignCard title="FTS5 ARCHIVE SEARCH" subtitle="Full-text search across consolidated Hermes + AGY histories" accent={accent}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.25, alignItems: 'stretch' }}>
          <TextField
            id="vault-fts5-search"
            label="FTS5 Archive Search"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch(searchQuery); }}
            placeholder="Search conversations (e.g. screenshot, proxy, systemd)"
            inputProps={{ 'aria-label': 'FTS5 Archive Search' }}
            sx={{
              flex: '1 1 200px',
              '& .MuiInputBase-root': { minHeight: 44 },
              '& input': { fontFamily: MONO, fontSize: 13, minHeight: 44, boxSizing: 'border-box', py: 1.25 },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon fontSize="small" />}
            disabled={connStatus !== 'live' || searchBusy}
            onClick={() => runSearch(searchQuery)}
            sx={{ minHeight: 44, px: 2, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: accent, borderColor: rgba(accent, 0.45) }}
          >
            Search
          </Button>
        </Box>
        {searchBusy && <LinearProgress sx={{ mb: 1 }} />}
        {searchTotal !== null && (
          <Typography sx={{ fontFamily: MONO, fontSize: 11.5, color: 'text.secondary', mb: 1 }}>
            {searchTotal.toLocaleString()} matching conversations
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {searchHits.slice(0, 6).map((c, idx) => (
            <Box key={c.id || idx} sx={{ p: 1.15, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                <Chip label={c.source || 'log'} size="small" sx={{ fontFamily: MONO, fontSize: 10.5, height: 22 }} />
                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                  {formatChronicleDate(c)} · {c.messageCount ?? 0} msgs
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.35, fontWeight: 600, wordBreak: 'break-word' }}>
                {sanitizeChronicleText(c.title || c.id)}
              </Typography>
            </Box>
          ))}
        </Box>
      </SovereignCard>

      {continuityItems.length > 0 && (
        <SovereignCard title="OPEN CONTINUITY LOOPS" subtitle="Sanitized unfinished threads & parked innovation ideas" accent={accent}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {continuityItems.slice(0, 4).map((item) => (
              <Box key={item.id} sx={{ p: 1.15, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                  <Chip
                    label={item.itemType}
                    size="small"
                    sx={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      height: 22,
                      fontWeight: 700,
                      color: item.itemType === 'unfinished' ? crimson : emerald,
                      border: `1px solid ${rgba(item.itemType === 'unfinished' ? crimson : emerald, 0.35)}`,
                    }}
                  />
                  <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                    {item.category} · {item.date}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.4, wordBreak: 'break-word' }}>
                  {item.summary || item.title}
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
            title="Chronicle Vault daemon (:8161) unreachable via Studio proxy"
            message={`${statusReason || 'Daemon offline.'} Start it locally with: systemctl --user start chronicle-vault.service (or zoth-memory-vault serve --port 8161).`}
          />
        </Box>
      )}
      <SovereignWorkstationShell
        id="zoth-memory-vault"
        category="MEMORY & CONTINUITY"
        title="Chronicle Vault"
        subtitle="Loopback SQLite FTS5 conversation consolidation, friction/pattern radar, and live continuity recall proxied through Studio :3000."
        version={CHRONICLE_SCHEMA_VERSION}
        accent={accent}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
        showSupportBar={showSupportBar}
      />
      <Divider sx={{ my: 2, opacity: 0.25 }} />
    </Box>
  );
}
