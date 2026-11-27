import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Alert,
  Switch,
  FormControlLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import {
  GITHUB_OPS_VERSION,
  SAMPLE_COMMIT_LOG,
  SAMPLE_WORKFLOW_HARDENED,
  SAMPLE_WORKFLOW_VULNERABLE,
  auditRepository,
  parseConventionalCommits,
  lintWorkflowYaml,
  evaluateSigningConfig,
  buildOfflineGitSnapshot,
  exportGitHubOpsJson,
  exportGitHubOpsMarkdown,
  exportGitHubOpsCsv,
} from '../../utils/githubOpsEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

const DEFAULT_OFFLINE_REMOTES = [
  'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (fetch)',
  'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (push)',
  'personal\thttps://github.com/1nc0gn30/zoth-studio-v2.git (fetch)',
  'personal\thttps://github.com/1nc0gn30/zoth-studio-v2.git (push)',
].join('\n');

const DEFAULT_OFFLINE_STATUS = [
  '# branch.oid 89cec2c691e9',
  '# branch.head main',
  '# branch.upstream origin/main',
  '# branch.ab +0 -0',
].join('\n');

async function fetchStudioJson(endpoint, options = {}, timeoutMs = 6000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      ...options,
      signal: ctl.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, status: res.status, reason: 'Static deployment (non-JSON response)' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, status: res.status, reason: data?.error || `HTTP ${res.status}`, data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Loopback Studio API (:3000) unavailable',
    };
  } finally {
    clearTimeout(timer);
  }
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([String(content)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TABS = [
  { id: 'fleet', label: '1. Dual-Org Fleet', icon: AccountTreeIcon },
  { id: 'commits', label: '2. Release & PR Pipeline', icon: AssignmentTurnedInIcon },
  { id: 'ci', label: '3. Actions CI-Gate', icon: SecurityIcon },
  { id: 'signing', label: '4. Signing & Dual-Push', icon: VpnKeyIcon },
];

export default function GitHubOpsGodModeTool() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const tk = useMemo(
    () =>
      isLight
        ? {
            bg: '#FAF8F3',
            card: '#FFFFFF',
            subtle: '#F3EFE6',
            codeBg: '#F3EFE6',
            text: '#0F172A',
            muted: '#334155',
            gold: '#92400E',
            goldBg: '#FEF3C7',
            onGold: '#FFFFFF',
            sky: '#0369A1',
            skyBg: '#F0F9FF',
            emerald: '#047857',
            emeraldBg: '#ECFDF5',
            crimson: '#B91C1C',
            crimsonBg: '#FEF2F2',
            border: 'rgba(15, 23, 42, 0.14)',
            strongBorder: 'rgba(146, 64, 14, 0.42)',
          }
        : {
            bg: '#08080B',
            card: '#11141D',
            subtle: '#0B0E15',
            codeBg: '#0B0E15',
            text: '#F5F1E6',
            muted: '#C5CBD8',
            gold: '#D4AF37',
            goldBg: '#241E0E',
            onGold: '#08080B',
            sky: '#7DD3FC',
            skyBg: '#0D2233',
            emerald: '#6EE7B7',
            emeraldBg: '#0B241D',
            crimson: '#FCA5A5',
            crimsonBg: '#2A1215',
            border: 'rgba(245, 241, 230, 0.14)',
            strongBorder: 'rgba(212, 175, 55, 0.42)',
          },
    [isLight]
  );

  const [activeTab, setActiveTab] = useState('fleet');
  const [copiedKey, setCopiedKey] = useState('');

  // Tab 1: Fleet & Offline Repo Auditor
  const [snapshot, setSnapshot] = useState(() =>
    buildOfflineGitSnapshot('Probing loopback Studio API (127.0.0.1:3000/api/studio/github)...')
  );
  const [probing, setProbing] = useState(false);
  const [fleetQuery, setFleetQuery] = useState('');
  const [fleetFilter, setFleetFilter] = useState('all');
  const [selectedRepoSlug, setSelectedRepoSlug] = useState('zoth-studio-v2');
  const [deepAudit, setDeepAudit] = useState(null);
  const [deepAuditing, setDeepAuditing] = useState(false);
  const [offlineRepoName, setOfflineRepoName] = useState('zoth-studio-v2');
  const [offlineRemoteText, setOfflineRemoteText] = useState(DEFAULT_OFFLINE_REMOTES);
  const [offlineStatusText, setOfflineStatusText] = useState(DEFAULT_OFFLINE_STATUS);

  // Tab 2: Conventional Commits & Release PR Pipeline
  const [commitRepoName, setCommitRepoName] = useState('zoth-studio-v2');
  const [currentVersion, setCurrentVersion] = useState('2.3.0');
  const [commitLogText, setCommitLogText] = useState(SAMPLE_COMMIT_LOG);

  // Tab 3: GitHub Actions CI-Gate Linter
  const [workflowYaml, setWorkflowYaml] = useState(SAMPLE_WORKFLOW_HARDENED);
  const [workflowLabel, setWorkflowLabel] = useState('Hardened Zoth CI Sample');

  // Tab 4: Commit Signing & Dual-Push Playbook
  const [sigFormat, setSigFormat] = useState('ssh');
  const [sigCommitOn, setSigCommitOn] = useState(true);
  const [sigTagOn, setSigTagOn] = useState(true);
  const [sigName, setSigName] = useState('Neal Frazier');
  const [sigEmail, setSigEmail] = useState('contact@nullai.tech');
  const [sigKey, setSigKey] = useState('~/.ssh/id_ed25519.pub');
  const [sigAllowedFile, setSigAllowedFile] = useState('~/.ssh/allowed_signers');
  const [sigRepoSlug, setSigRepoSlug] = useState('zoth-studio-v2');

  const copyValue = useCallback((key, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text || '')).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? '' : prev)), 1800);
  }, []);

  const probeFleet = useCallback(async () => {
    setProbing(true);
    const res = await fetchStudioJson('/api/studio/github?limit=30');
    if (res.ok && res.data?.repos) {
      setSnapshot(res.data);
      if (res.data.signing) {
        if (
          res.data.signing.commitGpgSign &&
          (res.data.signing.gpgFormat === 'openpgp' || res.data.signing.gpgFormat === 'ssh')
        ) {
          setSigFormat(res.data.signing.gpgFormat);
        }
        setSigCommitOn(Boolean(res.data.signing.commitGpgSign));
        setSigTagOn(Boolean(res.data.signing.tagGpgSign));
        if (res.data.signing.signingKeyMasked) {
          setSigKey(res.data.signing.signingKeyMasked);
        }
      }
      const preferred =
        res.data.repos.find((r) => r.repo === 'zoth-studio-v2') ||
        res.data.repos.find((r) => r.repo === 'zoth-os') ||
        res.data.repos[0];
      if (preferred) {
        setSelectedRepoSlug(preferred.repo);
      }
    } else {
      setSnapshot(
        buildOfflineGitSnapshot(
          res.reason || 'Loopback Studio API (:3000) unavailable — offline browser analyzers active'
        )
      );
    }
    setProbing(false);
  }, []);

  useEffect(() => {
    probeFleet();
  }, [probeFleet]);

  const handleInspectRepo = useCallback(
    async (slug) => {
      setSelectedRepoSlug(slug);
      setSigRepoSlug(slug);
      setCommitRepoName(slug);
      if (snapshot.mode !== 'LIVE_HOST_GIT') {
        setDeepAudit(null);
        return;
      }
      setDeepAuditing(true);
      const res = await fetchStudioJson('/api/studio/github/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: slug }),
      });
      if (res.ok && res.data?.repoAudit) {
        setDeepAudit(res.data);
        if (res.data.logText && res.data.logText.trim()) {
          setCommitLogText(res.data.logText.trim());
        }
      } else {
        setDeepAudit(null);
      }
      setDeepAuditing(false);
    },
    [snapshot.mode]
  );

  const filteredRepos = useMemo(() => {
    const q = fleetQuery.trim().toLowerCase();
    return (snapshot.repos || []).filter((r) => {
      if (q && !r.repo.toLowerCase().includes(q) && !(r.status?.branch || '').toLowerCase().includes(q)) {
        return false;
      }
      if (fleetFilter === 'dual-org') return Boolean(r.remotes?.dualOrgReady);
      if (fleetFilter === 'missing-mirror') return !r.remotes?.dualOrgReady;
      if (fleetFilter === 'dirty') return !r.status?.clean;
      return true;
    });
  }, [snapshot.repos, fleetQuery, fleetFilter]);

  const activeFleetRepo = useMemo(() => {
    if (deepAudit?.repoAudit && deepAudit.repoAudit.repo === selectedRepoSlug) {
      return deepAudit.repoAudit;
    }
    return (
      (snapshot.repos || []).find((r) => r.repo === selectedRepoSlug) ||
      (snapshot.repos || [])[0] ||
      null
    );
  }, [deepAudit, snapshot.repos, selectedRepoSlug]);

  const offlineRepoAudit = useMemo(
    () =>
      auditRepository({
        repo: offlineRepoName || 'custom-repo',
        remoteText: offlineRemoteText,
        statusText: offlineStatusText,
      }),
    [offlineRepoName, offlineRemoteText, offlineStatusText]
  );

  const commitReport = useMemo(
    () =>
      parseConventionalCommits(commitLogText, {
        currentVersion,
        repoName: commitRepoName || 'zoth-studio-v2',
      }),
    [commitLogText, currentVersion, commitRepoName]
  );

  const workflowReport = useMemo(() => lintWorkflowYaml(workflowYaml), [workflowYaml]);

  const signingReport = useMemo(
    () =>
      evaluateSigningConfig({
        commitGpgSign: sigCommitOn,
        tagGpgSign: sigTagOn,
        gpgFormat: sigFormat,
        signingKey: sigKey,
        allowedSignersFile: sigAllowedFile,
        userName: sigName,
        userEmail: sigEmail,
        repoSlug: sigRepoSlug,
      }),
    [sigCommitOn, sigTagOn, sigFormat, sigKey, sigAllowedFile, sigName, sigEmail, sigRepoSlug]
  );

  const severityPalette = (sev) => {
    if (sev === 'critical' || sev === 'high') {
      return { color: tk.crimson, bg: tk.crimsonBg };
    }
    if (sev === 'medium') {
      return { color: tk.gold, bg: tk.goldBg };
    }
    if (sev === 'pass') {
      return { color: tk.emerald, bg: tk.emeraldBg };
    }
    return { color: tk.sky, bg: tk.skyBg };
  };

  const handleExport = (format, download = false) => {
    const bundle = {
      snapshot,
      repoAudit: activeFleetRepo || offlineRepoAudit,
      commitReport,
      workflowReport,
      signingReport,
    };
    if (format === 'json') {
      const text = exportGitHubOpsJson(bundle);
      if (download) downloadBlob('zoth-github-ops-report.json', text, 'application/json');
      else copyValue('export-json', text);
    } else if (format === 'md') {
      const text = exportGitHubOpsMarkdown(bundle);
      if (download) downloadBlob('zoth-github-ops-report.md', text, 'text/markdown');
      else copyValue('export-md', text);
    } else {
      const text = exportGitHubOpsCsv({ repos: snapshot.repos || [] });
      if (download) downloadBlob('zoth-github-ops-fleet.csv', text, 'text/csv');
      else copyValue('export-csv', text);
    }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      fontFamily: MONO,
      fontSize: '0.84rem',
      bgcolor: tk.card,
      color: tk.text,
      minHeight: 44,
    },
    '& .MuiInputBase-input': {
      minHeight: 44,
      boxSizing: 'border-box',
      py: '10px',
    },
    '& .MuiInputLabel-root': {
      color: tk.muted,
      fontFamily: MONO,
      fontSize: '0.78rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: tk.gold,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: tk.border,
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: tk.strongBorder,
    },
  };

  return (
    <Box
      data-testid="github-ops-workstation"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.text,
      }}
    >
      {/* Header & Runtime Mode Strip */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2.5,
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: tk.gold,
              mb: 0.5,
            }}
          >
            ZOTH GITHUB OPS &amp; DUAL-ORG AUDITOR · v{GITHUB_OPS_VERSION}
          </Typography>
          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.2rem', sm: '1.45rem' },
              fontWeight: 700,
              lineHeight: 1.25,
              color: tk.text,
            }}
          >
            Dual-Org Repo Fleet, Conventional Releases &amp; CI-Gate Enclave
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            label={
              snapshot.mode === 'LIVE_HOST_GIT'
                ? `LIVE HOST :3000 · ${snapshot.summary?.totalReposDiscovered || 0} REPOS`
                : 'OFFLINE BROWSER ANALYZERS'
            }
            sx={{
              minHeight: 36,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: snapshot.mode === 'LIVE_HOST_GIT' ? tk.emeraldBg : tk.goldBg,
              color: snapshot.mode === 'LIVE_HOST_GIT' ? tk.emerald : tk.gold,
              border: `1px solid ${snapshot.mode === 'LIVE_HOST_GIT' ? tk.emerald : tk.strongBorder}`,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={probeFleet}
            disabled={probing}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.gold,
              borderColor: tk.strongBorder,
              bgcolor: tk.card,
              px: 1.75,
              '&:hover': { borderColor: tk.gold, bgcolor: tk.goldBg },
              '&.Mui-disabled': {
                color: tk.muted,
                borderColor: tk.border,
                bgcolor: tk.subtle,
                opacity: 1,
              },
            }}
          >
            {probing ? 'Probing…' : 'Probe Loopback :3000'}
          </Button>
        </Box>
      </Box>

      {/* Honest Offline / Zero-Token Notice */}
      <Alert
        severity={snapshot.mode === 'LIVE_HOST_GIT' ? 'success' : 'info'}
        sx={{
          mb: 2.5,
          borderRadius: 2,
          bgcolor: snapshot.mode === 'LIVE_HOST_GIT' ? tk.emeraldBg : tk.skyBg,
          color: tk.text,
          border: `1px solid ${snapshot.mode === 'LIVE_HOST_GIT' ? tk.emerald : tk.sky}`,
          '& .MuiAlert-icon': {
            color: snapshot.mode === 'LIVE_HOST_GIT' ? tk.emerald : tk.sky,
          },
        }}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.text, lineHeight: 1.55 }}>
          {snapshot.mode === 'LIVE_HOST_GIT'
            ? `Connected to read-only loopback /api/studio/github (${snapshot.summary?.scannedRepos} scanned of ${snapshot.summary?.totalReposDiscovered} local repos under ~/NullAITech/). Zero token files (GH_TOKEN, ~/.config/gh/hosts.yml, ~/.git-credentials, ~/.ssh/id_*) are ever read; all paths redacted to ~/.`
            : `${snapshot.reason || 'Loopback Studio API (:3000) not detected.'} Showing representative offline fleet samples — all pasted git status/remote audits, Conventional Commit release notes, GitHub Actions CI linting, and SSH/GPG signing generators run 100% client-side in your browser.`}
        </Typography>
      </Alert>

      {/* 4-Tab Navigation Bar (>= 44px mobile tap targets) */}
      <Box
        role="tablist"
        aria-label="GitHub Ops Workstation Tabs"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2.5,
        }}
      >
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              startIcon={<IconComp sx={{ fontSize: '1rem' }} />}
              sx={{
                minHeight: 44,
                px: 1.75,
                py: 1,
                borderRadius: 1.75,
                fontFamily: MONO,
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: active ? tk.gold : tk.card,
                color: active ? tk.onGold : tk.text,
                border: `1px solid ${active ? tk.gold : tk.border}`,
                '&:hover': {
                  bgcolor: active ? tk.gold : tk.subtle,
                  borderColor: tk.strongBorder,
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* ================================================================== */}
      {/* TAB 1: DUAL-ORG REPO FLEET INSPECTOR & OFFLINE PASTE ANALYZER      */}
      {/* ================================================================== */}
      {activeTab === 'fleet' && (
        <Box>
          {/* KPI Strip */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {[
              {
                label: 'SCANNED REPOS',
                value: `${snapshot.summary?.scannedRepos ?? 0} / ${snapshot.summary?.totalReposDiscovered ?? 0}`,
                tone: tk.sky,
                bg: tk.skyBg,
              },
              {
                label: 'DUAL-ORG READY',
                value: `${snapshot.summary?.dualOrgCount ?? 0} (NullAITech + 1nc0gn30)`,
                tone: tk.emerald,
                bg: tk.emeraldBg,
              },
              {
                label: 'CLEAN / DIRTY TREES',
                value: `${snapshot.summary?.cleanRepoCount ?? 0} clean · ${snapshot.summary?.dirtyRepoCount ?? 0} dirty`,
                tone: (snapshot.summary?.dirtyRepoCount ?? 0) > 0 ? tk.gold : tk.emerald,
                bg: (snapshot.summary?.dirtyRepoCount ?? 0) > 0 ? tk.goldBg : tk.emeraldBg,
              },
              {
                label: 'AVG HYGIENE SCORE',
                value: `${snapshot.summary?.averageHygieneScore ?? 100} / 100`,
                tone: tk.gold,
                bg: tk.goldBg,
              },
            ].map((kpi) => (
              <Grid key={kpi.label} xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    bgcolor: tk.card,
                    border: `1px solid ${tk.border}`,
                    height: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: tk.muted,
                      mb: 0.5,
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: kpi.tone,
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Search + Filter Controls */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              alignItems: 'center',
              mb: 2,
            }}
          >
            <TextField
              id="github-fleet-search"
              label="Filter repositories by slug or branch"
              value={fleetQuery}
              onChange={(e) => setFleetQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.75, fontSize: '1rem', color: tk.muted }} />,
              }}
              sx={{ ...inputSx, flex: '1 1 240px' }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'dual-org', label: 'Dual-Org Ready' },
                { id: 'missing-mirror', label: 'Missing Mirror' },
                { id: 'dirty', label: 'Dirty Tree' },
              ].map((f) => {
                const active = fleetFilter === f.id;
                return (
                  <Button
                    key={f.id}
                    onClick={() => setFleetFilter(f.id)}
                    sx={{
                      minHeight: 44,
                      px: 1.5,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      bgcolor: active ? tk.goldBg : tk.card,
                      color: active ? tk.gold : tk.text,
                      border: `1px solid ${active ? tk.strongBorder : tk.border}`,
                    }}
                  >
                    {f.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Fleet Cards + Inspector Split */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} lg={7}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: tk.card,
                  border: `1px solid ${tk.border}`,
                }}
              >
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                    mb: 1.5,
                  }}
                >
                  LOCAL REPOSITORY FLEET ({filteredRepos.length} MATCHED)
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 1.25,
                    maxHeight: 460,
                    overflowY: 'auto',
                    pr: 0.5,
                    alignContent: 'start',
                  }}
                >
                  {filteredRepos.length === 0 ? (
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', color: tk.muted, py: 2 }}>
                      No repositories match the current search and filter criteria.
                    </Typography>
                  ) : (
                    filteredRepos.map((repo) => {
                      const selected = repo.repo === selectedRepoSlug;
                      return (
                        <Box
                          key={repo.repo}
                          component="button"
                          type="button"
                          onClick={() => handleInspectRepo(repo.repo)}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            flexShrink: 0,
                            textAlign: 'left',
                            minHeight: 56,
                            p: 1.5,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            bgcolor: selected ? tk.goldBg : tk.subtle,
                            border: `1px solid ${selected ? tk.strongBorder : tk.border}`,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            color: tk.text,
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: '1 1 180px' }}>
                            <Typography
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: tk.text,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {repo.repo}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.72rem',
                                color: tk.muted,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              branch: {repo.status?.branch || 'unknown'} ·{' '}
                              {repo.remotes?.owners?.length ? repo.remotes.owners.join(' + ') : 'no github remotes'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                            <Chip
                              size="small"
                              label={repo.remotes?.dualOrgReady ? 'DUAL-ORG' : 'SINGLE/NONE'}
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: repo.remotes?.dualOrgReady ? tk.emeraldBg : tk.crimsonBg,
                                color: repo.remotes?.dualOrgReady ? tk.emerald : tk.crimson,
                                border: `1px solid ${repo.remotes?.dualOrgReady ? tk.emerald : tk.crimson}`,
                              }}
                            />
                            <Chip
                              size="small"
                              label={repo.status?.clean ? 'CLEAN' : `${repo.status?.dirtyCount} DIRTY`}
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: repo.status?.clean ? tk.skyBg : tk.goldBg,
                                color: repo.status?.clean ? tk.sky : tk.gold,
                                border: `1px solid ${repo.status?.clean ? tk.sky : tk.strongBorder}`,
                              }}
                            />
                            <Chip
                              size="small"
                              label={`${repo.score}/100`}
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: tk.card,
                                color: tk.text,
                                border: `1px solid ${tk.border}`,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Selected Repo Detail Drawer */}
            <Grid xs={12} lg={5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: tk.card,
                  border: `1px solid ${tk.border}`,
                  height: '100%',
                }}
              >
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                    mb: 1,
                  }}
                >
                  SELECTED REPOSITORY AUDIT {deepAuditing ? '· SCANNING…' : ''}
                </Typography>

                {activeFleetRepo ? (
                  <Box>
                    <Typography sx={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700, color: tk.text, mb: 0.5 }}>
                      {activeFleetRepo.repo} ({activeFleetRepo.score}/100 · {activeFleetRepo.grade})
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.muted, mb: 1.5 }}>
                      Branch: {activeFleetRepo.status?.branch} · Ahead +{activeFleetRepo.status?.ahead ?? 0} / Behind -
                      {activeFleetRepo.status?.behind ?? 0}
                    </Typography>

                    {activeFleetRepo.lastCommit?.subject && (
                      <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: tk.subtle, border: `1px solid ${tk.border}`, mb: 1.5 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                          LAST COMMIT ({activeFleetRepo.lastCommit.hash} · {activeFleetRepo.lastCommit.date})
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.text, mt: 0.25, overflowWrap: 'anywhere' }}>
                          {activeFleetRepo.lastCommit.subject}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(activeFleetRepo.findings || []).map((f, idx) => {
                        const pal = severityPalette(f.severity);
                        return (
                          <Box
                            key={`${f.code}-${idx}`}
                            sx={{
                              p: 1.25,
                              borderRadius: 1.5,
                              bgcolor: pal.bg,
                              border: `1px solid ${pal.color}`,
                            }}
                          >
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: pal.color }}>
                              [{f.severity.toUpperCase()}] {f.title}
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.text, mt: 0.35 }}>
                              {f.detail}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ) : (
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', color: tk.muted }}>
                    Select a repository from the fleet list to inspect remotes, dirty status, and findings.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Offline Paste git remote -v + git status Analyzer */}
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Typography
              component="h4"
              sx={{
                fontFamily: MONO,
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: tk.gold,
                mb: 1.25,
              }}
            >
              OFFLINE BROWSER REPO ANALYZER (PASTE GIT REMOTE -V &amp; GIT STATUS --PORCELAIN=V2 --BRANCH)
            </Typography>

            <Grid container spacing={1.5}>
              <Grid xs={12} md={4}>
                <TextField
                  id="offline-repo-slug"
                  label="Repository Slug"
                  value={offlineRepoName}
                  onChange={(e) => setOfflineRepoName(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ ...inputSx, mb: 1.5 }}
                />
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.subtle, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.gold }}>
                    OFFLINE AUDIT RESULT: {offlineRepoAudit.score}/100 ({offlineRepoAudit.grade})
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.text, mt: 0.5 }}>
                    Dual-Org: {offlineRepoAudit.remotes.dualOrgReady ? 'PASS (NullAITech + 1nc0gn30)' : 'INCOMPLETE'}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: tk.text }}>
                    Working Tree: {offlineRepoAudit.status.clean ? 'CLEAN' : `${offlineRepoAudit.status.dirtyCount} dirty`} ·
                    Cred Leaks: {offlineRepoAudit.remotes.embeddedCredLeaks}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  id="offline-git-remote"
                  label="git remote -v output"
                  value={offlineRemoteText}
                  onChange={(e) => setOfflineRemoteText(e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  id="offline-git-status"
                  label="git status --porcelain=v2 --branch output"
                  value={offlineStatusText}
                  onChange={(e) => setOfflineStatusText(e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* ================================================================== */}
      {/* TAB 2: CONVENTIONAL COMMITS & RELEASE PR PIPELINE                  */}
      {/* ================================================================== */}
      {activeTab === 'commits' && (
        <Grid container spacing={2}>
          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography
                component="h4"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tk.gold,
                  mb: 1.5,
                }}
              >
                COMMIT LOG INPUT (GIT LOG --ONELINE)
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                <Grid xs={12} sm={7}>
                  <TextField
                    id="commit-repo-name"
                    label="Repository Name"
                    value={commitRepoName}
                    onChange={(e) => setCommitRepoName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={5}>
                  <TextField
                    id="commit-current-version"
                    label="Current Semver"
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <TextField
                id="commit-log-textarea"
                label="Paste git log --oneline commits"
                value={commitLogText}
                onChange={(e) => setCommitLogText(e.target.value)}
                multiline
                minRows={9}
                fullWidth
                sx={{ ...inputSx, mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setCommitLogText(SAMPLE_COMMIT_LOG)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.gold,
                    borderColor: tk.strongBorder,
                  }}
                >
                  Load ZothOS Release Sample
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setCommitLogText(
                      [
                        'a1b2c3d feat(api)!: enforce strict loopback host allowlist on all studio routes',
                        'b2c3d4e fix(ui): eliminate dark slab inside Editorial Ivory Light Mode',
                        'WIP quick patch without conventional type',
                      ].join('\n')
                    )
                  }
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.sky,
                    borderColor: tk.sky,
                  }}
                >
                  Load Breaking + Non-Conforming Sample
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                  }}
                >
                  SEMVER BUMP &amp; RELEASE NOTES MARKDOWN
                </Typography>
                <Chip
                  label={`${commitReport.bump} -> v${commitReport.nextVersion} (${commitReport.compliancePct}% valid)`}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: commitReport.nonConformingCount > 0 ? tk.goldBg : tk.emeraldBg,
                    color: commitReport.nonConformingCount > 0 ? tk.gold : tk.emerald,
                    border: `1px solid ${commitReport.nonConformingCount > 0 ? tk.strongBorder : tk.emerald}`,
                  }}
                />
              </Box>

              {commitReport.nonConforming.length > 0 && (
                <Box sx={{ p: 1.25, mb: 1.5, borderRadius: 1.5, bgcolor: tk.crimsonBg, border: `1px solid ${tk.crimson}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.crimson }}>
                    {commitReport.nonConforming.length} Non-Conforming Commit(s) Flagged:
                  </Typography>
                  {commitReport.nonConforming.map((n) => (
                    <Typography key={n.line} sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.text, mt: 0.35 }}>
                      Line {n.line}: {n.raw} — {n.reason}
                    </Typography>
                  ))}
                </Box>
              )}

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.75,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.text,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.76rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  maxHeight: 340,
                  overflowY: 'auto',
                }}
              >
                {commitReport.releaseNotesMarkdown}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={copiedKey === 'release-md' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyValue('release-md', commitReport.releaseNotesMarkdown)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: tk.gold,
                    color: tk.onGold,
                    '&:hover': { bgcolor: tk.gold },
                  }}
                >
                  {copiedKey === 'release-md' ? 'Copied Markdown' : 'Copy Release Notes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    downloadBlob(
                      `${commitReport.repoName}-v${commitReport.nextVersion}-release.md`,
                      commitReport.releaseNotesMarkdown,
                      'text/markdown'
                    )
                  }
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.text,
                    borderColor: tk.border,
                  }}
                >
                  Download .md
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ================================================================== */}
      {/* TAB 3: GITHUB ACTIONS CI-GATE & SECURITY LINTER                    */}
      {/* ================================================================== */}
      {activeTab === 'ci' && (
        <Grid container spacing={2}>
          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography
                component="h4"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tk.gold,
                  mb: 1.25,
                }}
              >
                WORKFLOW YAML EDITOR ({workflowLabel})
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setWorkflowYaml(SAMPLE_WORKFLOW_HARDENED);
                    setWorkflowLabel('Hardened Zoth CI Sample');
                  }}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.emerald,
                    borderColor: tk.emerald,
                  }}
                >
                  Load Hardened CI Sample
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setWorkflowYaml(SAMPLE_WORKFLOW_VULNERABLE);
                    setWorkflowLabel('Vulnerable PR-Target Sample');
                  }}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.crimson,
                    borderColor: tk.crimson,
                  }}
                >
                  Load Vulnerable Sample
                </Button>
              </Box>

              <TextField
                id="workflow-yaml-editor"
                label="Paste .github/workflows/*.yml"
                value={workflowYaml}
                onChange={(e) => {
                  setWorkflowYaml(e.target.value);
                  setWorkflowLabel('Custom Pasted Workflow');
                }}
                multiline
                minRows={13}
                fullWidth
                sx={inputSx}
              />
            </Box>
          </Grid>

          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                  }}
                >
                  CI-GATE SECURITY AUDIT
                </Typography>
                <Chip
                  label={`SCORE: ${workflowReport.score}/100 (${workflowReport.grade})`}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    bgcolor: workflowReport.score >= 85 ? tk.emeraldBg : tk.crimsonBg,
                    color: workflowReport.score >= 85 ? tk.emerald : tk.crimson,
                    border: `1px solid ${workflowReport.score >= 85 ? tk.emerald : tk.crimson}`,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Chip
                  size="small"
                  label={`Pinned SHAs: ${workflowReport.pinnedShaCount}/${workflowReport.actionsCount}`}
                  sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, bgcolor: tk.subtle, color: tk.text, border: `1px solid ${tk.border}` }}
                />
                <Chip
                  size="small"
                  label={`permissions: ${workflowReport.hasPermissionsBlock ? 'DECLARED' : 'MISSING'}`}
                  sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, bgcolor: tk.subtle, color: tk.text, border: `1px solid ${tk.border}` }}
                />
                <Chip
                  size="small"
                  label={`concurrency: ${workflowReport.hasConcurrency ? 'ON' : 'MISSING'}`}
                  sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, bgcolor: tk.subtle, color: tk.text, border: `1px solid ${tk.border}` }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 360, overflowY: 'auto' }}>
                {workflowReport.findings.map((f, idx) => {
                  const pal = severityPalette(f.severity);
                  return (
                    <Box
                      key={`${f.code}-${idx}`}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: pal.bg,
                        border: `1px solid ${pal.color}`,
                      }}
                    >
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: pal.color }}>
                        [{f.severity.toUpperCase()}] {f.title}
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.text, mt: 0.35 }}>
                        {f.detail}
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.71rem', color: tk.muted, mt: 0.35 }}>
                        Fix: {f.remediation}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ================================================================== */}
      {/* TAB 4: COMMIT SIGNING & DUAL-PUSH PLAYBOOK                         */}
      {/* ================================================================== */}
      {activeTab === 'signing' && (
        <Grid container spacing={2}>
          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, mb: 2 }}>
              <Typography
                component="h4"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tk.gold,
                  mb: 1.25,
                }}
              >
                HOST GIT / GH / GPG / SSH TOOLCHAIN STATUS
              </Typography>

              <Grid container spacing={1}>
                {(snapshot.toolchains || []).map((tc) => (
                  <Grid key={tc.id} xs={12} sm={6}>
                    <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: tk.subtle, border: `1px solid ${tk.border}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700, color: tk.text }}>
                          {tc.label} ({tc.category})
                        </Typography>
                        <Chip
                          size="small"
                          label={tc.installed ? 'READY' : 'OFFLINE'}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: tc.installed ? tk.emeraldBg : tk.goldBg,
                            color: tc.installed ? tk.emerald : tk.gold,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, overflowWrap: 'anywhere' }}>
                        {tc.version || 'Not detected'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography
                component="h4"
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tk.gold,
                  mb: 1.25,
                }}
              >
                SIGNING &amp; DUAL-ORG PARAMETERS (ZERO PRIVATE KEYS)
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {['ssh', 'openpgp'].map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => setSigFormat(fmt)}
                    sx={{
                      minHeight: 44,
                      px: 2,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      bgcolor: sigFormat === fmt ? tk.gold : tk.subtle,
                      color: sigFormat === fmt ? tk.onGold : tk.text,
                      border: `1px solid ${sigFormat === fmt ? tk.gold : tk.border}`,
                    }}
                  >
                    {fmt === 'ssh' ? 'SSH Signing (Recommended)' : 'OpenPGP / GPG Signing'}
                  </Button>
                ))}
              </Box>

              <Grid container spacing={1.5}>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="signing-user-name"
                    label="Git user.name"
                    value={sigName}
                    onChange={(e) => setSigName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="signing-user-email"
                    label="Git user.email"
                    value={sigEmail}
                    onChange={(e) => setSigEmail(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="signing-public-key"
                    label="Public Key Path or Key ID"
                    value={sigKey}
                    onChange={(e) => setSigKey(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="signing-repo-slug"
                    label="Target Dual-Org Repo Slug"
                    value={sigRepoSlug}
                    onChange={(e) => setSigRepoSlug(e.target.value)}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
                {sigFormat === 'ssh' && (
                  <Grid xs={12}>
                    <TextField
                      id="signing-allowed-signers"
                      label="gpg.ssh.allowedSignersFile"
                      value={sigAllowedFile}
                      onChange={(e) => setSigAllowedFile(e.target.value)}
                      fullWidth
                      size="small"
                      sx={inputSx}
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
                <FormControlLabel
                  control={<Switch checked={sigCommitOn} onChange={(e) => setSigCommitOn(e.target.checked)} />}
                  label={<Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>commit.gpgsign = true</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={sigTagOn} onChange={(e) => setSigTagOn(e.target.checked)} />}
                  label={<Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.text }}>tag.gpgsign = true</Typography>}
                />
              </Box>
            </Box>
          </Grid>

          <Grid xs={12} lg={6}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                  }}
                >
                  GENERATED ~/.gitconfig SIGNING BLOCK ({signingReport.score}/100)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={copiedKey === 'gitconfig' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyValue('gitconfig', signingReport.gitconfigSnippet)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.gold,
                    borderColor: tk.strongBorder,
                  }}
                >
                  {copiedKey === 'gitconfig' ? 'Copied' : 'Copy .gitconfig'}
                </Button>
              </Box>

              {signingReport.privateKeyDetected && (
                <Alert severity="error" sx={{ mb: 1.5, bgcolor: tk.crimsonBg, color: tk.text, border: `1px solid ${tk.crimson}` }}>
                  Private key material detected and stripped. Supply only a public key path (~/.ssh/id_ed25519.pub) or GPG key ID.
                </Alert>
              )}

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.75,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.text,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.76rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {signingReport.gitconfigSnippet}
              </Box>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  component="h4"
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tk.gold,
                  }}
                >
                  DUAL-ORG REMOTE &amp; PUSH PLAYBOOK (NullAITech + 1nc0gn30)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={copiedKey === 'dual-push' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyValue('dual-push', signingReport.dualPushCommands)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.sky,
                    borderColor: tk.sky,
                  }}
                >
                  {copiedKey === 'dual-push' ? 'Copied' : 'Copy Commands'}
                </Button>
              </Box>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.75,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.text,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.75rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {signingReport.dualPushCommands}
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Sanitized Multi-Format Export Strip */}
      <Box
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop: `1px solid ${tk.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.25,
        }}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted }}>
          SANITIZED EXPORTS (~/ REDACTED · FORMULA-SAFE CSV)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { id: 'json', label: 'Copy JSON', dl: false },
            { id: 'json', label: 'Download JSON', dl: true },
            { id: 'md', label: 'Download Markdown', dl: true },
            { id: 'csv', label: 'Download CSV', dl: true },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant="outlined"
              startIcon={
                !btn.dl && copiedKey === `export-${btn.id}` ? (
                  <CheckIcon />
                ) : btn.dl ? (
                  <DownloadIcon />
                ) : (
                  <ContentCopyIcon />
                )
              }
              onClick={() => handleExport(btn.id, btn.dl)}
              sx={{
                minHeight: 44,
                px: 1.5,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                color: tk.text,
                borderColor: tk.border,
                bgcolor: tk.card,
                '&:hover': { borderColor: tk.strongBorder, bgcolor: tk.subtle },
              }}
            >
              {!btn.dl && copiedKey === `export-${btn.id}` ? 'Copied JSON' : btn.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
