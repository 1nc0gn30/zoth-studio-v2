import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Stack,
  Alert,
  Tabs,
  Tab,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  CONSENSUS_SCHEMA_VERSION,
  VALIDATOR_ROSTER,
  STARTER_PRESETS,
  computeBftBounds,
  evaluateDeterministicRound,
  verifyConsensusReceipt,
  buildConsensusJsonExport,
  buildConsensusMarkdownExport,
  buildConsensusCsvExport,
} from '../../utils/consensusEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Celtic Garamond", Georgia, "Times New Roman", serif';

async function fetchLocalConsensusModels(timeoutMs = 3000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/studio/consensus/models', {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, reason: 'Static deployment (non-JSON response)' };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Local Studio API (:3000) unreachable',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runLoopbackConsensusApi(payload, timeoutMs = 20000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/studio/consensus/run', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, error: 'Live loopback execution requires Zoth Studio running locally on 127.0.0.1:3000.' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error:
        err?.name === 'AbortError'
          ? 'Loopback consensus request timed out.'
          : 'Local Studio API (:3000) unreachable in static/offline browser mode.',
    };
  } finally {
    clearTimeout(timer);
  }
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConsensusArenaGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast WCAG 2.1 AA/AAA dual-theme tokens (0 dark slabs in Light Mode)
  const tk = useMemo(
    () => ({
      bg: isDark ? '#090B11' : '#F8F6F0',
      card: isDark ? '#0E121B' : '#FFFFFF',
      inset: isDark ? '#121723' : '#F2EFE6',
      codeBg: isDark ? '#06080D' : '#F4F1EA',
      codeInk: isDark ? '#E2E8F0' : '#101828',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.16)',
      ink: isDark ? '#F5F1E6' : '#101828',
      muted: isDark ? '#CBD5E1' : '#334155',
      gold: isDark ? '#D4AF37' : '#7A5808',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF7E0',
      goldBorder: isDark ? 'rgba(212, 175, 55, 0.42)' : '#B8860B',
      goldBtnBg: isDark ? '#D4AF37' : '#7A5808',
      goldBtnInk: isDark ? '#08080B' : '#FFFFFF',
      emerald: isDark ? '#34D399' : '#065F46',
      emeraldSoft: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      emeraldBorder: isDark ? 'rgba(52, 211, 153, 0.38)' : '#059669',
      sky: isDark ? '#38BDF8' : '#0369A1',
      skySoft: isDark ? 'rgba(56, 189, 248, 0.14)' : '#F0F9FF',
      skyBorder: isDark ? 'rgba(56, 189, 248, 0.36)' : '#0284C7',
      amber: isDark ? '#FBBF24' : '#92400E',
      amberSoft: isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFFBEB',
      amberBorder: isDark ? 'rgba(251, 191, 36, 0.38)' : '#D97706',
      crimson: isDark ? '#FB7185' : '#B91C1C',
      crimsonSoft: isDark ? 'rgba(251, 113, 133, 0.14)' : '#FEF2F2',
      crimsonBorder: isDark ? 'rgba(251, 113, 133, 0.4)' : '#DC2626',
      diffAddBg: isDark ? 'rgba(52, 211, 153, 0.12)' : '#ECFDF5',
      diffRemBg: isDark ? 'rgba(251, 113, 133, 0.12)' : '#FEF2F2',
    }),
    [isDark]
  );

  const aliveRef = useRef(true);
  const [activeTab, setActiveTab] = useState(0);
  const [proposalText, setProposalText] = useState(STARTER_PRESETS[0].proposal);
  const [activePresetId, setActivePresetId] = useState(STARTER_PRESETS[0].id);
  const [nodeCount, setNodeCount] = useState(5);
  const [faultyCount, setFaultyCount] = useState(1);
  const [injectedFaultIds, setInjectedFaultIds] = useState([]);
  const [execMode, setExecMode] = useState('in-browser-deterministic');

  // Local model discovery state
  const [modelsLoading, setModelsLoading] = useState(true);
  const [localModelsInfo, setLocalModelsInfo] = useState({
    liveApiReachable: false,
    checkedAt: null,
    providers: [
      { id: 'agy-hermes', name: 'AGY-Hermes Proxy (:18000)', online: false, latencyMs: null, models: [] },
      { id: 'ollama', name: 'Ollama Local (:11434)', online: false, latencyMs: null, models: [] },
    ],
    totalModels: 0,
    note: 'Probing local :18000 and :11434 loopback model gateways...',
  });
  const [selectedLocalModels, setSelectedLocalModels] = useState([]);

  // Active consensus round result (initialized deterministically with zero fake data)
  const [roundResult, setRoundResult] = useState(() =>
    evaluateDeterministicRound({
      proposalText: STARTER_PRESETS[0].proposal,
      nodeCount: 5,
      faultyCount: 1,
    })
  );
  const [runningRound, setRunningRound] = useState(false);
  const [runError, setRunError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const refreshModels = useCallback(async () => {
    setModelsLoading(true);
    const res = await fetchLocalConsensusModels(3000);
    if (!aliveRef.current) return;
    if (res.ok && res.data) {
      const providers = Array.isArray(res.data.providers) ? res.data.providers : [];
      const flat = [];
      for (const p of providers) {
        for (const m of p.models || []) {
          flat.push({ provider: p.id, model: m });
        }
      }
      setLocalModelsInfo({
        liveApiReachable: true,
        checkedAt: res.data.checkedAt || new Date().toISOString(),
        providers,
        totalModels: flat.length,
        note:
          flat.length > 0
            ? `Loopback Studio API online · ${flat.length} local model(s) discovered across :18000 / :11434.`
            : 'Loopback Studio API online · 0 models currently loaded on :18000 / :11434 (deterministic in-browser BFT ready).',
      });
      setSelectedLocalModels((prev) => (prev.length > 0 ? prev : flat.slice(0, 3)));
    } else {
      setLocalModelsInfo((prev) => ({
        ...prev,
        liveApiReachable: false,
        checkedAt: new Date().toISOString(),
        note: `Static / offline browser mode (${res.reason}). Deterministic in-browser BFT arbiter and SHA-256 Merkle sealing remain 100% functional.`,
      }));
    }
    setModelsLoading(false);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refreshModels();
    return () => {
      aliveRef.current = false;
    };
  }, [refreshModels]);

  const previewBounds = useMemo(
    () => computeBftBounds(nodeCount, Math.max(faultyCount, injectedFaultIds.length)),
    [nodeCount, faultyCount, injectedFaultIds.length]
  );

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setProposalText(preset.proposal);
    setRunError('');
    setVerificationResult(null);
    if (execMode === 'in-browser-deterministic') {
      setRoundResult(
        evaluateDeterministicRound({
          proposalText: preset.proposal,
          nodeCount,
          faultyCount,
          injectedFaultIds,
        })
      );
    }
  };

  const handleToggleFaultValidator = (validatorId) => {
    setInjectedFaultIds((prev) => {
      const exists = prev.includes(validatorId);
      const next = exists ? prev.filter((id) => id !== validatorId) : [...prev, validatorId];
      const nextResult = evaluateDeterministicRound({
        proposalText,
        nodeCount,
        faultyCount: next.length,
        injectedFaultIds: next,
      });
      setFaultyCount(next.length);
      setRoundResult(nextResult);
      setVerificationResult(null);
      return next;
    });
  };

  const handleRunRound = async () => {
    setRunError('');
    setVerificationResult(null);
    if (!proposalText.trim()) {
      setRunError('Enter a technical proposal, claim, or unified diff before running a quorum round.');
      return;
    }

    if (execMode === 'in-browser-deterministic') {
      const next = evaluateDeterministicRound({
        proposalText,
        nodeCount,
        faultyCount,
        injectedFaultIds,
      });
      setRoundResult(next);
      return;
    }

    if (selectedLocalModels.length === 0) {
      setRunError('Select at least 1 local model in Tab 4 (or switch to Deterministic In-Browser BFT mode).');
      return;
    }

    setRunningRound(true);
    const res = await runLoopbackConsensusApi({
      proposal: proposalText,
      mode: 'loopback-models',
      nodeCount,
      faultyCount,
      models: selectedLocalModels.slice(0, 4),
    });
    if (!aliveRef.current) return;
    setRunningRound(false);

    if (!res.ok || !res.data) {
      setRunError(res.error || 'Loopback consensus execution failed.');
      return;
    }
    setRoundResult(res.data);
  };

  const handleVerifyReceipt = () => {
    const check = verifyConsensusReceipt(roundResult.receipt, proposalText, roundResult.votes);
    setVerificationResult(check);
  };

  const handleCopy = (content, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1800);
    }
  };

  const jsonExport = useMemo(() => buildConsensusJsonExport(roundResult), [roundResult]);
  const markdownExport = useMemo(() => buildConsensusMarkdownExport(roundResult), [roundResult]);
  const csvExport = useMemo(() => buildConsensusCsvExport(roundResult), [roundResult]);

  const verdictStyle = useMemo(() => {
    const v = roundResult?.tally?.verdict;
    const d = roundResult?.tally?.decision;
    if (v === 'FAULT_THRESHOLD_EXCEEDED') {
      return { bg: tk.crimsonSoft, border: tk.crimsonBorder, color: tk.crimson, label: 'FAULT THRESHOLD EXCEEDED · HALTED' };
    }
    if (v === 'QUORUM_REACHED' && d === 'APPROVE') {
      return { bg: tk.emeraldSoft, border: tk.emeraldBorder, color: tk.emerald, label: 'QUORUM REACHED · APPROVE' };
    }
    if (v === 'QUORUM_REACHED' && d === 'REJECT') {
      return { bg: tk.crimsonSoft, border: tk.crimsonBorder, color: tk.crimson, label: 'QUORUM REACHED · REJECT' };
    }
    return { bg: tk.amberSoft, border: tk.amberBorder, color: tk.amber, label: 'BYZANTINE SPLIT · NO QUORUM' };
  }, [roundResult, tk]);

  const voteChipStyle = (vote) => {
    if (vote === 'APPROVE') return { bgcolor: tk.emeraldSoft, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}` };
    if (vote === 'REJECT') return { bgcolor: tk.crimsonSoft, color: tk.crimson, border: `1px solid ${tk.crimsonBorder}` };
    if (vote === 'FAULTY') return { bgcolor: tk.crimsonSoft, color: tk.crimson, border: `1px solid ${tk.crimsonBorder}` };
    return { bgcolor: tk.amberSoft, color: tk.amber, border: `1px solid ${tk.amberBorder}` };
  };

  const toggleModelSelection = (provider, model) => {
    setSelectedLocalModels((prev) => {
      const exists = prev.some((m) => m.provider === provider && m.model === model);
      if (exists) return prev.filter((m) => !(m.provider === provider && m.model === model));
      if (prev.length >= 4) return [...prev.slice(1), { provider, model }];
      return [...prev, { provider, model }];
    });
  };

  return (
    <Paper
      data-testid="consensus-arena-workstation"
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
      }}
    >
      {/* Top Status & KPI Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.75 }}>
            <Chip
              size="small"
              label={`BFT ENGINE v${CONSENSUS_SCHEMA_VERSION}`}
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: tk.goldSoft,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
              }}
            />
            <Chip
              size="small"
              label={localModelsInfo.liveApiReachable ? `LOOPBACK MODELS: ${localModelsInfo.totalModels}` : 'OFFLINE DETERMINISTIC BFT'}
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: localModelsInfo.liveApiReachable ? tk.emeraldSoft : tk.skySoft,
                color: localModelsInfo.liveApiReachable ? tk.emerald : tk.sky,
                border: `1px solid ${localModelsInfo.liveApiReachable ? tk.emeraldBorder : tk.skyBorder}`,
              }}
            />
            <Chip
              size="small"
              label={`N=${roundResult.tally.bounds.totalNodes} · f=${roundResult.tally.bounds.faultyNodes} (max ${roundResult.tally.bounds.fMax}) · Q=${roundResult.tally.bounds.quorumRequired}`}
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.68rem',
                bgcolor: tk.inset,
                color: tk.ink,
                border: `1px solid ${tk.border}`,
              }}
            />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.45rem', md: '1.75rem' },
              fontWeight: 600,
              color: tk.ink,
              lineHeight: 1.15,
            }}
          >
            Byzantine Consensus Battle Arena &amp; Quorum Arbiter
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refreshModels}
            disabled={modelsLoading}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'none',
              color: tk.ink,
              borderColor: tk.border,
              bgcolor: tk.card,
              '&.Mui-disabled': { color: tk.muted, borderColor: tk.border, bgcolor: tk.inset },
            }}
          >
            {modelsLoading ? 'Probing…' : 'Probe Local Models'}
          </Button>
          <Button
            variant="contained"
            size="small"
            disableElevation
            startIcon={<PlayArrowIcon />}
            onClick={handleRunRound}
            disabled={runningRound}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              px: 2,
              '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
              '&.Mui-disabled': { bgcolor: tk.goldBtnBg, color: tk.goldBtnInk, opacity: 0.85 },
            }}
          >
            {runningRound ? 'Running Quorum…' : 'Run Quorum Round'}
          </Button>
        </Box>
      </Stack>

      {/* Primary Verdict Banner */}
      <Box
        data-testid="consensus-verdict-banner"
        sx={{
          p: { xs: 1.75, md: 2 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: verdictStyle.bg,
          border: `1px solid ${verdictStyle.border}`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: verdictStyle.color, letterSpacing: '0.06em' }}>
              {verdictStyle.label}
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: tk.ink, mt: 0.35, fontWeight: 500 }}>
              {roundResult.tally.summary}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip size="small" label={`APPROVE ${roundResult.tally.counts.APPROVE}`} sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.7rem', bgcolor: tk.card, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}` }} />
            <Chip size="small" label={`REJECT ${roundResult.tally.counts.REJECT}`} sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.7rem', bgcolor: tk.card, color: tk.crimson, border: `1px solid ${tk.crimsonBorder}` }} />
            <Chip size="small" label={`ABSTAIN ${roundResult.tally.counts.ABSTAIN}`} sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.7rem', bgcolor: tk.card, color: tk.amber, border: `1px solid ${tk.amberBorder}` }} />
            <Chip size="small" label={`FAULTY ${roundResult.tally.counts.FAULTY}`} sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.7rem', bgcolor: tk.card, color: tk.crimson, border: `1px solid ${tk.crimsonBorder}` }} />
          </Box>
        </Stack>
      </Box>

      {runError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            bgcolor: tk.crimsonSoft,
            color: tk.crimson,
            border: `1px solid ${tk.crimsonBorder}`,
            '& .MuiAlert-icon': { color: tk.crimson },
          }}
        >
          {runError}
        </Alert>
      )}

      {/* 4 Clean Tabs (concise labels so all 4 fit cleanly without clipping on Desktop) */}
      <Box sx={{ borderBottom: `1px solid ${tk.border}`, mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Consensus Battle Arena views"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': { backgroundColor: tk.gold, height: 3 },
            '& .MuiTab-root': {
              minHeight: 44,
              fontFamily: MONO,
              fontSize: { xs: '0.7rem', sm: '0.71rem', md: '0.74rem' },
              fontWeight: 700,
              textTransform: 'none',
              color: tk.muted,
              px: { xs: 1.15, sm: 1.25, md: 2 },
              '&.Mui-selected': { color: tk.ink },
            },
          }}
        >
          <Tab icon={<GavelIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="1. Quorum Arena" />
          <Tab icon={<CompareArrowsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="2. Vote Matrix & Diff" />
          <Tab icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="3. SHA-256 & Merkle" />
          <Tab icon={<CloudDoneIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="4. Exports & Models" />
        </Tabs>
      </Box>

      {/* ===================================================================== */}
      {/* TAB 0: QUORUM BATTLE ARENA                                            */}
      {/* ===================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} lg={5}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 1.25 }}>
                PROPOSAL / UNIFIED DIFF INPUT
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
                {STARTER_PRESETS.map((preset) => {
                  const selected = activePresetId === preset.id;
                  return (
                    <Button
                      key={preset.id}
                      size="small"
                      variant={selected ? 'contained' : 'outlined'}
                      disableElevation
                      onClick={() => handleSelectPreset(preset)}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: selected ? tk.goldBtnBg : tk.inset,
                        color: selected ? tk.goldBtnInk : tk.ink,
                        borderColor: selected ? tk.goldBtnBg : tk.border,
                        '&:hover': { bgcolor: selected ? tk.goldBtnBg : tk.goldSoft },
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={9}
                maxRows={14}
                label="Candidate Patch, Diff, or Technical Claim"
                value={proposalText}
                onChange={(e) => {
                  setProposalText(e.target.value);
                  setActivePresetId('custom');
                }}
                inputProps={{ 'aria-label': 'Candidate patch, diff, or technical claim' }}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-root': {
                    fontFamily: MONO,
                    fontSize: '0.76rem',
                    bgcolor: tk.codeBg,
                    color: tk.codeInk,
                  },
                  '& .MuiInputLabel-root': { color: tk.muted },
                }}
              />

              {/* Controls: N Validators, f Faults, Execution Mode */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="bft-nodes-label" sx={{ color: tk.muted }}>
                      Validators (N)
                    </InputLabel>
                    <Select
                      labelId="bft-nodes-label"
                      value={nodeCount}
                      onChange={(e) => {
                        const nextN = Number(e.target.value);
                        setNodeCount(nextN);
                        const clampedF = Math.min(faultyCount, nextN);
                        setFaultyCount(clampedF);
                        setInjectedFaultIds((prev) => prev.filter((id) => VALIDATOR_ROSTER.slice(0, nextN).some((v) => v.id === id)));
                      }}
                      input={<OutlinedInput label="Validators (N)" inputProps={{ 'aria-label': 'Validator pool count N' }} />}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.78rem',
                        bgcolor: tk.card,
                        color: tk.ink,
                        '& .MuiSelect-select': {
                          minHeight: '44px !important',
                          lineHeight: '44px',
                          py: 0,
                          pr: '32px !important',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                        },
                      }}
                    >
                      {[4, 5, 6, 7].map((n) => (
                        <MenuItem key={n} value={n}>
                          N = {n} (f_max = {Math.floor((n - 1) / 3)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="bft-faults-label" sx={{ color: tk.muted }}>
                      Byzantine Faults (f)
                    </InputLabel>
                    <Select
                      labelId="bft-faults-label"
                      value={faultyCount}
                      onChange={(e) => {
                        const nextF = Number(e.target.value);
                        setFaultyCount(nextF);
                        setInjectedFaultIds([]);
                      }}
                      input={<OutlinedInput label="Byzantine Faults (f)" inputProps={{ 'aria-label': 'Byzantine faulty validator count f' }} />}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.78rem',
                        bgcolor: tk.card,
                        color: tk.ink,
                        '& .MuiSelect-select': {
                          minHeight: '44px !important',
                          lineHeight: '44px',
                          py: 0,
                          pr: '32px !important',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                        },
                      }}
                    >
                      {Array.from({ length: Math.min(4, nodeCount) + 1 }, (_, f) => (
                        <MenuItem key={f} value={f}>
                          f = {f} {f <= Math.floor((nodeCount - 1) / 3) ? '(Safe)' : '(Unsafe > f_max)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="bft-mode-label" sx={{ color: tk.muted }}>
                      Execution Mode
                    </InputLabel>
                    <Select
                      labelId="bft-mode-label"
                      value={execMode}
                      onChange={(e) => setExecMode(e.target.value)}
                      input={<OutlinedInput label="Execution Mode" inputProps={{ 'aria-label': 'Consensus execution mode' }} />}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.78rem',
                        bgcolor: tk.card,
                        color: tk.ink,
                        '& .MuiSelect-select': {
                          minHeight: '44px !important',
                          lineHeight: '44px',
                          py: 0,
                          pr: '32px !important',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                        },
                      }}
                    >
                      <MenuItem value="in-browser-deterministic">Deterministic In-Browser BFT</MenuItem>
                      <MenuItem value="loopback-models">
                        Live Loopback Models ({localModelsInfo.totalModels})
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.border}`, mb: 2 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: previewBounds.byzantineSafe ? tk.emerald : tk.crimson }}>
                  BFT INVARIANT: {previewBounds.formula}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: tk.muted, mt: 0.4 }}>
                  {previewBounds.byzantineSafe
                    ? `Classical PBFT safety holds: up to f_max=${previewBounds.fMax} equivocating validators tolerated; supermajority quorum Q=${previewBounds.quorumRequired}/${previewBounds.totalNodes}.`
                    : `Safety violated: f=${previewBounds.faultyNodes} exceeds f_max=${previewBounds.fMax}. Quorum halts to prevent split-brain ratification.`}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                disableElevation
                startIcon={<PlayArrowIcon />}
                onClick={handleRunRound}
                disabled={runningRound}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  bgcolor: tk.goldBtnBg,
                  color: tk.goldBtnInk,
                  '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
                }}
              >
                {runningRound
                  ? 'Executing Quorum Round…'
                  : execMode === 'loopback-models'
                  ? `Dispatch Live Round (${selectedLocalModels.length} Loopback Model${selectedLocalModels.length === 1 ? '' : 's'})`
                  : `Run Deterministic BFT Round (N=${nodeCount}, f=${faultyCount})`}
              </Button>
            </Paper>
          </Grid>

          {/* Right: Per-Validator Quorum Cards */}
          <Grid xs={12} lg={7}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.75 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                  VALIDATOR VOTES &amp; DOMAIN RATIONALE ({roundResult.votes.length} NODES)
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.muted }}>
                  Mode: {roundResult.mode} · Agreement: {roundResult.tally.agreementPct}%
                </Typography>
              </Stack>

              <Grid container spacing={1.5}>
                {roundResult.votes.map((v) => {
                  const isInjected = v.vote === 'FAULTY';
                  return (
                    <Grid xs={12} sm={6} key={v.validatorId}>
                      <Box
                        sx={{
                          p: 1.6,
                          height: '100%',
                          borderRadius: 1.75,
                          bgcolor: tk.inset,
                          border: `1px solid ${isInjected ? tk.crimsonBorder : tk.border}`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: tk.ink }}>
                                {v.name}
                              </Typography>
                              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                                {v.role} · {v.source}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={v.vote}
                              sx={{
                                fontFamily: MONO,
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                ...voteChipStyle(v.vote),
                              }}
                            />
                          </Stack>

                          <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.55, color: tk.ink }}>
                            {v.rationale}
                          </Typography>
                        </Box>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.75, borderTop: `1px solid ${tk.border}` }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.gold }}>
                            SCORE: {v.score}/100 · {v.latencyMs ?? 1}ms
                          </Typography>
                          {roundResult.mode === 'in-browser-deterministic' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<BugReportIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleToggleFaultValidator(v.validatorId)}
                              sx={{
                                minHeight: 44,
                                fontFamily: MONO,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                color: isInjected ? tk.emerald : tk.crimson,
                                borderColor: isInjected ? tk.emeraldBorder : tk.crimsonBorder,
                                px: 1.25,
                              }}
                            >
                              {isInjected ? 'Heal Node' : 'Inject Fault'}
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: VOTE MATRIX & DIFF ARBITER                                     */}
      {/* ===================================================================== */}
      {activeTab === 1 && (
        <Stack spacing={2.5}>
          {/* Per-Criterion Vote Breakdown Table */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.gold }}>
                PER-CRITERION VOTE MATRIX &amp; BYZANTINE FAULT BOUNDARY
              </Typography>
              <Chip
                size="small"
                icon={<ShieldIcon sx={{ fontSize: '0.9rem !important', color: `${roundResult.tally.safetyIntact ? tk.emerald : tk.crimson} !important` }} />}
                label={
                  roundResult.tally.safetyIntact
                    ? `SAFETY INTACT (f=${roundResult.tally.bounds.faultyNodes} <= f_max=${roundResult.tally.bounds.fMax})`
                    : `SAFETY BREACHED (f=${roundResult.tally.bounds.faultyNodes} > f_max=${roundResult.tally.bounds.fMax})`
                }
                sx={{
                  fontFamily: MONO,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  bgcolor: roundResult.tally.safetyIntact ? tk.emeraldSoft : tk.crimsonSoft,
                  color: roundResult.tally.safetyIntact ? tk.emerald : tk.crimson,
                  border: `1px solid ${roundResult.tally.safetyIntact ? tk.emeraldBorder : tk.crimsonBorder}`,
                }}
              />
            </Stack>

            <TableContainer sx={{ border: `1px solid ${tk.border}`, borderRadius: 1.5 }}>
              <Table size="small" aria-label="Validator vote matrix">
                <TableHead>
                  <TableRow sx={{ bgcolor: tk.inset }}>
                    {['Validator', 'Vote', 'Overall', 'Security', 'Perf', 'Arch', 'Compat', 'Policy'].map((col) => (
                      <TableCell key={col} sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, borderColor: tk.border }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roundResult.votes.map((v) => (
                    <TableRow key={v.validatorId}>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink, borderColor: tk.border }}>
                        {v.name}
                      </TableCell>
                      <TableCell sx={{ borderColor: tk.border }}>
                        <Chip size="small" label={v.vote} sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 800, ...voteChipStyle(v.vote) }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink, borderColor: tk.border }}>
                        {v.score}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, borderColor: tk.border }}>
                        {v.criteria?.security ?? '—'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, borderColor: tk.border }}>
                        {v.criteria?.performance ?? '—'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, borderColor: tk.border }}>
                        {v.criteria?.architecture ?? '—'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, borderColor: tk.border }}>
                        {v.criteria?.compatibility ?? '—'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, borderColor: tk.border }}>
                        {v.criteria?.policy ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Unified Diff Hunk Analyzer & Detected Rubric Findings */}
          <Grid container spacing={2.5}>
            <Grid xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                    LINE-BY-LINE UNIFIED DIFF ARBITER
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip size="small" label={`+${roundResult.diffAnalysis.addedLines}`} sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, bgcolor: tk.emeraldSoft, color: tk.emerald }} />
                    <Chip size="small" label={`-${roundResult.diffAnalysis.removedLines}`} sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, bgcolor: tk.crimsonSoft, color: tk.crimson }} />
                    <Chip size="small" label={`${roundResult.diffAnalysis.hunkCount} Hunk(s)`} sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, bgcolor: tk.inset, color: tk.ink }} />
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: tk.codeBg,
                    border: `1px solid ${tk.border}`,
                    maxHeight: 360,
                    overflow: 'auto',
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    lineHeight: 1.6,
                  }}
                >
                  {(roundResult.diffAnalysis.lineBreakdown || []).map((row) => (
                    <Box
                      key={row.lineNo}
                      sx={{
                        display: 'flex',
                        gap: 1.25,
                        px: 1,
                        py: 0.15,
                        borderRadius: 0.5,
                        bgcolor:
                          row.findingIds.length > 0
                            ? tk.crimsonSoft
                            : row.kind === 'add'
                            ? tk.diffAddBg
                            : row.kind === 'remove'
                            ? tk.diffRemBg
                            : 'transparent',
                      }}
                    >
                      <Box component="span" sx={{ minWidth: 28, color: tk.muted, userSelect: 'none', textAlign: 'right' }}>
                        {row.lineNo}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          color:
                            row.findingIds.length > 0
                              ? tk.crimson
                              : row.kind === 'add'
                              ? tk.emerald
                              : row.kind === 'remove'
                              ? tk.crimson
                              : row.kind === 'hunk'
                              ? tk.sky
                              : tk.codeInk,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          flex: 1,
                        }}
                      >
                        {row.text || ' '}
                      </Box>
                      {row.findingIds.length > 0 && (
                        <Box component="span" sx={{ color: tk.crimson, fontWeight: 800, flexShrink: 0 }}>
                          [{row.findingIds.join(', ')}]
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 1.25 }}>
                  RUBRIC FINDINGS ({roundResult.diffAnalysis.findings.length}) &amp; VERIFIED SIGNALS ({roundResult.diffAnalysis.positives.length})
                </Typography>

                <Stack spacing={1.25}>
                  {roundResult.diffAnalysis.findings.length === 0 ? (
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.emeraldSoft, border: `1px solid ${tk.emeraldBorder}` }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.emerald }}>
                        0 STATIC RISK FINDINGS DETECTED
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: tk.ink, mt: 0.25 }}>
                        No eval/XSS sinks, wildcard 0.0.0.0 binds, SELECT *, weak hashes, or path leaks found on added lines.
                      </Typography>
                    </Box>
                  ) : (
                    roundResult.diffAnalysis.findings.map((f, idx) => (
                      <Box key={`${f.id}-${idx}`} sx={{ p: 1.35, borderRadius: 1.5, bgcolor: tk.crimsonSoft, border: `1px solid ${tk.crimsonBorder}` }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.crimson }}>
                            {f.id} · {f.severity} · Line {f.lineNo}
                          </Typography>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.crimson }}>
                            -{f.penalty} pts
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.8rem', color: tk.ink, mt: 0.25 }}>{f.title}</Typography>
                      </Box>
                    ))
                  )}

                  {roundResult.diffAnalysis.positives.map((p) => (
                    <Box key={p.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: tk.emeraldSoft, border: `1px solid ${tk.emeraldBorder}` }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.emerald }}>
                        +{p.bonus} · {p.id}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: tk.ink }}>{p.title}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SHA-256 RECEIPT & MERKLE PROOF                                 */}
      {/* ===================================================================== */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                CRYPTOGRAPHIC SHA-256 VERDICT RECEIPT &amp; MERKLE PROOF
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mt: 0.25 }}>
                {roundResult.receipt.algorithm} · {roundResult.receipt.leafCount} canonical sorted validator leaves · tree depth {roundResult.receipt.merkleDepth}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              disableElevation
              startIcon={<VerifiedUserIcon />}
              onClick={handleVerifyReceipt}
              sx={{
                minHeight: 44,
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.74rem',
                textTransform: 'none',
                bgcolor: tk.goldBtnBg,
                color: tk.goldBtnInk,
                px: 2,
              }}
            >
              Verify SHA-256 Integrity
            </Button>
          </Stack>

          {verificationResult && (
            <Box
              data-testid="receipt-verification-banner"
              sx={{
                p: 1.75,
                mb: 2,
                borderRadius: 1.5,
                bgcolor: verificationResult.valid ? tk.emeraldSoft : tk.crimsonSoft,
                border: `1px solid ${verificationResult.valid ? tk.emeraldBorder : tk.crimsonBorder}`,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: verificationResult.valid ? tk.emerald : tk.crimson, mb: 0.75 }}>
                {verificationResult.valid ? 'VERIFIED: ALL 4 CRYPTOGRAPHIC SHA-256 CHECKS PASSED' : 'VERIFICATION FAILED: PAYLOAD TAMPERED OR MODIFIED SINCE SEAL'}
              </Typography>
              <Grid container spacing={1}>
                {verificationResult.checks.map((c) => (
                  <Grid xs={12} sm={6} key={c.name}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.ink }}>
                      [{c.ok ? 'PASS' : 'FAIL'}] {c.name}: {c.detail}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: 'PROPOSAL SHA-256 DIGEST', value: roundResult.receipt.proposalHash },
              { label: 'BINARY SHA-256 MERKLE ROOT', value: roundResult.receipt.merkleRoot },
              { label: 'CANONICAL RECEIPT ENVELOPE HASH', value: roundResult.receipt.receiptHash },
            ].map((item) => (
              <Grid xs={12} key={item.label}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.codeBg, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: tk.gold, mb: 0.4 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.codeInk, wordBreak: 'break-all' }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 1 }}>
            CANONICAL SORTED VALIDATOR LEAF HASHES ({roundResult.receipt.leaves.length})
          </Typography>
          <TableContainer sx={{ border: `1px solid ${tk.border}`, borderRadius: 1.5 }}>
            <Table size="small" aria-label="Merkle leaf hashes">
              <TableHead>
                <TableRow sx={{ bgcolor: tk.inset }}>
                  <TableCell sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, borderColor: tk.border }}>Leaf #</TableCell>
                  <TableCell sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, borderColor: tk.border }}>Validator ID</TableCell>
                  <TableCell sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, borderColor: tk.border }}>Vote</TableCell>
                  <TableCell sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, borderColor: tk.border }}>SHA-256 Leaf Digest</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roundResult.receipt.leaves.map((leaf, i) => (
                  <TableRow key={leaf.validatorId}>
                    <TableCell sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, borderColor: tk.border }}>{i}</TableCell>
                    <TableCell sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink, borderColor: tk.border }}>{leaf.validatorId}</TableCell>
                    <TableCell sx={{ borderColor: tk.border }}>
                      <Chip size="small" label={leaf.vote} sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 800, ...voteChipStyle(leaf.vote) }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.codeInk, wordBreak: 'break-all', borderColor: tk.border }}>
                      {leaf.leafHash}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: AUDIT EXPORT & LOCAL LOOPBACK MODELS                           */}
      {/* ===================================================================== */}
      {activeTab === 3 && (
        <Grid container spacing={2.5}>
          {/* Live Local Model Inventory (:18000 & :11434) */}
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                  LOOPBACK MODEL INVENTORY (:18000 / :11434)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refreshModels}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: tk.ink, borderColor: tk.border }}
                >
                  Refresh
                </Button>
              </Stack>

              <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mb: 1.75 }}>
                {localModelsInfo.note}
              </Typography>

              <Stack spacing={1.5}>
                {localModelsInfo.providers.map((prov) => (
                  <Box key={prov.id} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.ink }}>
                        {prov.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={prov.online ? `ONLINE · ${prov.latencyMs ?? 1}ms · ${(prov.models || []).length} models` : 'OFFLINE'}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          bgcolor: prov.online ? tk.emeraldSoft : tk.amberSoft,
                          color: prov.online ? tk.emerald : tk.amber,
                          border: `1px solid ${prov.online ? tk.emeraldBorder : tk.amberBorder}`,
                        }}
                      />
                    </Stack>

                    {prov.models && prov.models.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, maxHeight: 190, overflowY: 'auto' }}>
                        {prov.models.slice(0, 12).map((modelId) => {
                          const checked = selectedLocalModels.some((m) => m.provider === prov.id && m.model === modelId);
                          return (
                            <FormControlLabel
                              key={`${prov.id}:${modelId}`}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  onChange={() => toggleModelSelection(prov.id, modelId)}
                                  inputProps={{ 'aria-label': `Select ${prov.id} model ${modelId}` }}
                                  sx={{ minWidth: 44, minHeight: 44, color: tk.gold, '&.Mui-checked': { color: tk.gold } }}
                                />
                              }
                              label={
                                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink }}>
                                  {modelId}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                        No active models reported on this loopback port.
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Sanitized Verdict Receipt Exports (JSON / Markdown / CSV) */}
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 0.75 }}>
                SANITIZED QUORUM VERDICT EXPORTS (0 HOME-PATH LEAKS)
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mb: 1.75 }}>
                All JSON, Markdown, and CSV exports redact host home paths to <code>~/</code> and neutralize spreadsheet formula injection (<code>= + - @ \t \r</code>).
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedKey === 'json' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => handleCopy(jsonExport, 'json')}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: tk.ink, borderColor: tk.border }}
                >
                  {copiedKey === 'json' ? 'Copied JSON' : 'Copy JSON'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadTextFile('consensus-quorum-receipt.json', jsonExport, 'application/json')}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: tk.emerald, borderColor: tk.emeraldBorder }}
                >
                  Download .JSON
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedKey === 'md' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => handleCopy(markdownExport, 'md')}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: tk.ink, borderColor: tk.border }}
                >
                  {copiedKey === 'md' ? 'Copied MD' : 'Copy Markdown'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadTextFile('consensus-quorum-receipt.md', markdownExport, 'text/markdown')}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: tk.gold, borderColor: tk.goldBorder }}
                >
                  Download .MD
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadTextFile('consensus-quorum-votes.csv', csvExport, 'text/csv')}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: tk.sky, borderColor: tk.skyBorder }}
                >
                  Download .CSV
                </Button>
              </Box>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: tk.codeBg,
                  color: tk.codeInk,
                  border: `1px solid ${tk.border}`,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  lineHeight: 1.55,
                  maxHeight: 320,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {markdownExport}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
