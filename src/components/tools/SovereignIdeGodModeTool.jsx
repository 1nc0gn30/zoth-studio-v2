import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Alert,
  MenuItem,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  IDE_ENGINE_VERSION,
  SUPPORTED_IDE_LANGUAGES,
  IDE_STARTER_FILES,
  IDE_VULNERABLE_SAMPLE,
  IDE_HARDENED_SAMPLE,
  analyzeSourceStructure,
  lintSourceCode,
  computeUnifiedDiff,
  evaluatePureExpression,
  buildIdeExports,
  buildOfflineIdeSnapshot,
} from '../../utils/ideEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

const TABS = [
  { id: 'editor', label: '1. Editor & AST Outline', icon: CodeIcon },
  { id: 'linter', label: '2. Security & Hygiene Linter', icon: SecurityIcon },
  { id: 'diff', label: '3. Unified Diff & Patch', icon: CompareArrowsIcon },
  { id: 'workspace', label: '4. Loopback Workspace & Pure Evaluator', icon: TerminalIcon },
];

const EXPR_PRESETS = [
  { label: 'Bitwise + Clamp', expr: '(1 << 10) + clamp(145, 0, 100)' },
  { label: 'SHA-256 Digest', expr: 'sha256("zoth-ide-v2.3.0")' },
  { label: 'Base64 Encode', expr: 'base64Encode("zero-egress-ide")' },
  { label: 'Regex Slug Test', expr: 'regexTest("^[a-z0-9-]+$", "sovereign-ide")' },
];

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

export default function SovereignIdeGodModeTool() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const tk = useMemo(
    () =>
      isLight
        ? {
            bg: '#FAF8F3',
            card: '#FFFFFF',
            subtle: '#F5F0E4',
            codeBg: '#F5F0E4',
            text: '#141417',
            muted: '#3F4451',
            gold: '#7A5808',
            goldBg: '#FEF3C7',
            goldBorder: '#D97706',
            emerald: '#047857',
            emeraldBg: '#ECFDF5',
            emeraldBorder: '#6EE7B7',
            crimson: '#991B1B',
            crimsonBg: '#FEF2F2',
            crimsonBorder: '#FCA5A5',
            sapphire: '#0369A1',
            sapphireBg: '#F0F9FF',
            sapphireBorder: '#7DD3FC',
            amber: '#92400E',
            amberBg: '#FFFBEB',
            amberBorder: '#FCD34D',
            border: 'rgba(20, 20, 23, 0.14)',
            tabActiveBg: '#141417',
            tabActiveText: '#FAF8F3',
            disabledBg: '#E5E7EB',
            disabledText: '#4B5563',
            diffAddBg: '#ECFDF5',
            diffAddText: '#065F46',
            diffDelBg: '#FEF2F2',
            diffDelText: '#991B1B',
            diffHunkBg: '#F0F9FF',
            diffHunkText: '#0369A1',
          }
        : {
            bg: '#0B0B10',
            card: '#12121A',
            subtle: '#171722',
            codeBg: '#0E0F17',
            text: '#F8FAFC',
            muted: '#CBD5E1',
            gold: '#F5D061',
            goldBg: '#241E0E',
            goldBorder: '#8A6A16',
            emerald: '#6EE7B7',
            emeraldBg: '#0B241D',
            emeraldBorder: '#059669',
            crimson: '#FCA5A5',
            crimsonBg: '#2A1215',
            crimsonBorder: '#B91C1C',
            sapphire: '#7DD3FC',
            sapphireBg: '#0D2233',
            sapphireBorder: '#0284C7',
            amber: '#FCD34D',
            amberBg: '#261D0B',
            amberBorder: '#B45309',
            border: 'rgba(248, 250, 252, 0.14)',
            tabActiveBg: '#D4AF37',
            tabActiveText: '#0B0B10',
            disabledBg: '#1E2130',
            disabledText: '#CBD5E1',
            diffAddBg: '#0B241D',
            diffAddText: '#6EE7B7',
            diffDelBg: '#2A1215',
            diffDelText: '#FCA5A5',
            diffHunkBg: '#0D2233',
            diffHunkText: '#7DD3FC',
          },
    [isLight],
  );

  const [activeTab, setActiveTab] = useState('editor');
  const [buffers, setBuffers] = useState(() =>
    IDE_STARTER_FILES.map((f) => ({
      ...f,
      originalContent: f.content,
      source: 'starter',
    })),
  );
  const [activeBufferId, setActiveBufferId] = useState(IDE_STARTER_FILES[0].id);
  const [lintSampleOverride, setLintSampleOverride] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  // Loopback host workspace state
  const [workspaceData, setWorkspaceData] = useState(() => buildOfflineIdeSnapshot());
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('zoth-studio-v2');
  const [selectedFilePath, setSelectedFilePath] = useState('package.json');
  const [inspectStatus, setInspectStatus] = useState(null);
  const [inspectBusy, setInspectBusy] = useState(false);

  // Pure expression evaluator state
  const [exprInput, setExprInput] = useState('(1 << 10) + clamp(145, 0, 100)');
  const [exprHistory, setExprHistory] = useState(() => [
    evaluatePureExpression('(1 << 10) + clamp(145, 0, 100)'),
  ]);

  const activeBuffer = useMemo(
    () => buffers.find((b) => b.id === activeBufferId) || buffers[0],
    [buffers, activeBufferId],
  );

  const structure = useMemo(
    () => analyzeSourceStructure(activeBuffer.content, activeBuffer.language),
    [activeBuffer.content, activeBuffer.language],
  );

  const lintTarget = lintSampleOverride || activeBuffer;
  const lintReport = useMemo(
    () => lintSourceCode(lintTarget.content, lintTarget.language, lintTarget.filename),
    [lintTarget.content, lintTarget.language, lintTarget.filename],
  );

  const activeBufferLint = useMemo(
    () => lintSourceCode(activeBuffer.content, activeBuffer.language, activeBuffer.filename),
    [activeBuffer.content, activeBuffer.language, activeBuffer.filename],
  );

  const diffReport = useMemo(
    () => computeUnifiedDiff(activeBuffer.originalContent, activeBuffer.content, activeBuffer.filename),
    [activeBuffer.originalContent, activeBuffer.content, activeBuffer.filename],
  );

  const exportsBundle = useMemo(
    () =>
      buildIdeExports({
        filename: activeBuffer.filename,
        language: activeBuffer.language,
        structure,
        lint: activeBufferLint,
        diff: diffReport,
      }),
    [activeBuffer.filename, activeBuffer.language, structure, activeBufferLint, diffReport],
  );

  const probeWorkspace = useCallback(async (forceRefresh = false) => {
    setLoadingWorkspace(true);
    const res = await fetchStudioJson(`/api/studio/ide${forceRefresh ? '?refresh=1' : ''}`);
    if (res.ok && res.data) {
      setWorkspaceData(res.data);
      setWorkspaceNotice('');
      if (Array.isArray(res.data.repos) && res.data.repos.length > 0) {
        setSelectedRepo((prev) => {
          const match = res.data.repos.find((r) => r.slug === prev);
          const chosen = match || res.data.repos[0];
          if (chosen && Array.isArray(chosen.files) && chosen.files.length > 0) {
            setSelectedFilePath((prevFile) => (chosen.files.includes(prevFile) ? prevFile : chosen.files[0]));
          }
          return chosen ? chosen.slug : prev;
        });
      }
    } else {
      setWorkspaceData(buildOfflineIdeSnapshot());
      setWorkspaceNotice(res.reason || 'Loopback Studio API (:3000) unavailable — running in browser offline mode.');
    }
    setLoadingWorkspace(false);
  }, []);

  useEffect(() => {
    probeWorkspace(false);
  }, [probeWorkspace]);

  const currentRepoObj = useMemo(
    () => (workspaceData.repos || []).find((r) => r.slug === selectedRepo) || null,
    [workspaceData.repos, selectedRepo],
  );

  const handleUpdateBufferContent = (nextContent) => {
    setBuffers((prev) =>
      prev.map((b) => (b.id === activeBuffer.id ? { ...b, content: nextContent } : b)),
    );
  };

  const handleUpdateBufferLanguage = (nextLang) => {
    setBuffers((prev) =>
      prev.map((b) => (b.id === activeBuffer.id ? { ...b, language: nextLang } : b)),
    );
  };

  const handleResetBaseline = () => {
    setBuffers((prev) =>
      prev.map((b) => (b.id === activeBuffer.id ? { ...b, content: b.originalContent } : b)),
    );
  };

  const handleInjectSampleDiff = () => {
    const marker =
      activeBuffer.language === 'python' || activeBuffer.language === 'yaml'
        ? '# Guard: enforce 64 KB read cap and loopback Host allowlist'
        : '// Guard: enforce 64 KB read cap and loopback Host allowlist';
    if (!activeBuffer.content.includes(marker)) {
      handleUpdateBufferContent(`${marker}\n${activeBuffer.content}`);
    }
  };

  const handleInspectLocalFile = async () => {
    setInspectBusy(true);
    setInspectStatus(null);
    const res = await fetchStudioJson('/api/studio/ide/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: selectedRepo, filePath: selectedFilePath }),
    });
    if (res.ok && res.data?.ok) {
      const id = `local:${res.data.repo}/${res.data.filePath}`;
      const newBuf = {
        id,
        filename: `${res.data.repo}/${res.data.filePath}`,
        language: res.data.language || 'javascript',
        description: `Read-only loopback file (${res.data.byteLength} B${res.data.truncated ? ', truncated at 64 KB' : ''})`,
        content: res.data.content || '',
        originalContent: res.data.content || '',
        source: 'loopback',
      };
      setBuffers((prev) => {
        const exists = prev.some((b) => b.id === id);
        return exists ? prev.map((b) => (b.id === id ? newBuf : b)) : [...prev, newBuf];
      });
      setActiveBufferId(id);
      setLintSampleOverride(null);
      setInspectStatus({
        severity: 'success',
        message: `Loaded read-only ${newBuf.filename} (${res.data.structure?.lineCount || 0} lines · hygiene ${res.data.lint?.score ?? 100}/100 ${res.data.lint?.grade || 'A+'}). Switch to Tab 1 to edit or diff locally.`,
      });
    } else {
      setInspectStatus({
        severity: 'error',
        message: res.reason || 'Read-only inspection failed.',
      });
    }
    setInspectBusy(false);
  };

  const handleEvaluateExpression = (exprOverride) => {
    const target = typeof exprOverride === 'string' ? exprOverride : exprInput;
    if (typeof exprOverride === 'string') setExprInput(exprOverride);
    const result = evaluatePureExpression(target);
    setExprHistory((prev) => [result, ...prev].slice(0, 8));
  };

  const handleCopy = (id, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text));
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1800);
    }
  };

  const severityTone = (sev) => {
    if (sev === 'CRITICAL') return { color: tk.crimson, bg: tk.crimsonBg, border: tk.crimsonBorder };
    if (sev === 'HIGH') return { color: tk.amber, bg: tk.amberBg, border: tk.amberBorder };
    if (sev === 'MEDIUM') return { color: tk.gold, bg: tk.goldBg, border: tk.goldBorder };
    return { color: tk.sapphire, bg: tk.sapphireBg, border: tk.sapphireBorder };
  };

  const isLive = workspaceData.mode === 'LIVE_HOST_WORKSPACE';

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: tk.codeBg,
      color: tk.text,
      fontFamily: MONO,
      fontSize: '0.84rem',
      '& fieldset': { borderColor: tk.border },
      '&:hover fieldset': { borderColor: tk.gold },
      '&.Mui-focused fieldset': { borderColor: tk.gold },
    },
    '& .MuiInputLabel-root': {
      color: tk.muted,
      fontFamily: MONO,
      fontSize: '0.82rem',
      '&.Mui-focused': { color: tk.gold },
    },
    '& .MuiSelect-icon': { color: tk.text },
  };

  const actionBtnSx = {
    minHeight: 44,
    minWidth: 44,
    textTransform: 'none',
    fontFamily: MONO,
    fontSize: '0.78rem',
    fontWeight: 700,
    borderRadius: 1.5,
    px: 1.75,
    '&.Mui-disabled': {
      bgcolor: tk.disabledBg,
      color: tk.disabledText,
      borderColor: tk.border,
    },
  };

  return (
    <Box
      data-testid="sovereign-ide-workstation"
      sx={{
        bgcolor: tk.bg,
        color: tk.text,
        border: `1px solid ${tk.border}`,
        borderRadius: 2.5,
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {/* Header Bar */}
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
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.15rem', sm: '1.3rem' },
              fontWeight: 700,
              color: tk.text,
              lineHeight: 1.25,
            }}
          >
            Sovereign Operator IDE &amp; Code Foundry
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.76rem',
              color: tk.muted,
              mt: 0.4,
            }}
          >
            Zero-egress multi-file editor · AST symbol outline · static security linter · LCS diff · pure expression evaluator · v{IDE_ENGINE_VERSION}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            size="small"
            label={isLive ? 'LIVE_HOST_WORKSPACE (:3000)' : 'BROWSER_OFFLINE_FALLBACK'}
            sx={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: isLive ? tk.emeraldBg : tk.amberBg,
              color: isLive ? tk.emerald : tk.amber,
              border: `1px solid ${isLive ? tk.emeraldBorder : tk.amberBorder}`,
            }}
          />
          <Chip
            size="small"
            label="READ-ONLY HOST · ZERO EVAL"
            sx={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: tk.goldBg,
              color: tk.gold,
              border: `1px solid ${tk.goldBorder}`,
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => probeWorkspace(true)}
            disabled={loadingWorkspace}
            startIcon={<RefreshIcon />}
            sx={{
              ...actionBtnSx,
              color: tk.text,
              borderColor: tk.border,
              bgcolor: tk.card,
              '&:hover': { borderColor: tk.gold, bgcolor: tk.subtle },
            }}
          >
            {loadingWorkspace ? 'Probing...' : 'Refresh Host'}
          </Button>
        </Box>
      </Box>

      {/* Primary 4-Tab Bar */}
      <Box
        role="tablist"
        aria-label="Sovereign Operator IDE sections"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2.5,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={active}
              data-testid={`ide-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              startIcon={<Icon fontSize="small" />}
              sx={{
                ...actionBtnSx,
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                justifyContent: 'flex-start',
                bgcolor: active ? tk.tabActiveBg : tk.card,
                color: active ? tk.tabActiveText : tk.text,
                border: `1px solid ${active ? tk.tabActiveBg : tk.border}`,
                '&:hover': {
                  bgcolor: active ? tk.tabActiveBg : tk.subtle,
                  borderColor: tk.gold,
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* TAB 1: EDITOR & AST OUTLINE */}
      {activeTab === 'editor' && (
        <Box data-testid="ide-panel-editor">
          {/* Buffer Switcher */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {buffers.map((buf) => {
                const selected = buf.id === activeBuffer.id;
                const modified = buf.content !== buf.originalContent;
                return (
                  <Button
                    key={buf.id}
                    size="small"
                    onClick={() => {
                      setActiveBufferId(buf.id);
                      setLintSampleOverride(null);
                    }}
                    sx={{
                      ...actionBtnSx,
                      bgcolor: selected ? tk.goldBg : tk.card,
                      color: selected ? tk.gold : tk.text,
                      border: `1px solid ${selected ? tk.goldBorder : tk.border}`,
                      '&:hover': { bgcolor: tk.subtle, borderColor: tk.gold },
                    }}
                  >
                    {buf.filename}
                    {modified ? ' *' : ''}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <TextField
                select
                size="small"
                label="Language"
                value={activeBuffer.language}
                onChange={(e) => handleUpdateBufferLanguage(e.target.value)}
                inputProps={{ 'aria-label': 'Active buffer language' }}
                sx={{ ...inputSx, minWidth: 150, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
              >
                {SUPPORTED_IDE_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                size="small"
                onClick={handleResetBaseline}
                disabled={activeBuffer.content === activeBuffer.originalContent}
                startIcon={<RestartAltIcon />}
                sx={{
                  ...actionBtnSx,
                  color: tk.text,
                  borderColor: tk.border,
                  bgcolor: tk.card,
                  '&:hover': { borderColor: tk.gold, bgcolor: tk.subtle },
                }}
              >
                Reset Buffer
              </Button>
            </Box>
          </Box>

          {/* Real-Time Telemetry KPIs */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: 'Lines', value: `${structure.lineCount} (${structure.nonEmptyLines} active)` },
              { label: 'Tokens / Bytes', value: `${structure.tokenCount} tok · ${structure.byteLength} B` },
              { label: 'Cyclomatic', value: `${structure.cyclomaticComplexity} (${structure.complexityBand})` },
              {
                label: 'Brackets',
                value: structure.bracketBalance.balanced ? 'BALANCED' : `${structure.bracketBalance.issues.length} ISSUE(S)`,
                tone: structure.bracketBalance.balanced ? 'emerald' : 'crimson',
              },
              {
                label: 'Security Hygiene',
                value: `${activeBufferLint.score}/100 (${activeBufferLint.grade})`,
                tone: activeBufferLint.score >= 90 ? 'emerald' : activeBufferLint.score >= 70 ? 'amber' : 'crimson',
              },
              { label: 'SHA-256 Prefix', value: structure.sha256.slice(0, 12) },
            ].map((kpi) => (
              <Grid key={kpi.label} xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.75,
                    bgcolor: tk.card,
                    border: `1px solid ${tk.border}`,
                    height: '100%',
                  }}
                >
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted, textTransform: 'uppercase' }}>
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      mt: 0.4,
                      color:
                        kpi.tone === 'emerald'
                          ? tk.emerald
                          : kpi.tone === 'crimson'
                          ? tk.crimson
                          : kpi.tone === 'amber'
                          ? tk.amber
                          : tk.text,
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            {/* Editable Monospace Buffer */}
            <Grid xs={12} md={7}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: tk.card,
                  border: `1px solid ${tk.border}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
                  <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold }}>
                    CODE BUFFER · {activeBuffer.filename}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCopy('buffer', activeBuffer.content)}
                    startIcon={copiedId === 'buffer' ? <CheckIcon /> : <ContentCopyIcon />}
                    sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.subtle }}
                  >
                    {copiedId === 'buffer' ? 'Copied' : 'Copy Code'}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={14}
                  maxRows={22}
                  label={`Source editor (${activeBuffer.filename})`}
                  value={activeBuffer.content}
                  onChange={(e) => handleUpdateBufferContent(e.target.value)}
                  inputProps={{
                    'aria-label': `Source code editor for ${activeBuffer.filename}`,
                    spellCheck: false,
                  }}
                  sx={inputSx}
                />
              </Box>
            </Grid>

            {/* AST Symbol Outline */}
            <Grid xs={12} md={5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: tk.card,
                  border: `1px solid ${tk.border}`,
                  height: '100%',
                }}
              >
                <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.5 }}>
                  AST SYMBOL OUTLINE ({structure.symbols.length} SYMBOLS · {structure.imports.length} IMPORTS · {structure.exports.length} EXPORTS)
                </Typography>

                {structure.imports.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.muted, mb: 0.75 }}>
                      IMPORTS
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {structure.imports.map((imp, idx) => (
                        <Box
                          key={`${imp.source}-${idx}`}
                          sx={{
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1.25,
                            bgcolor: tk.subtle,
                            border: `1px solid ${tk.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1,
                            fontFamily: MONO,
                            fontSize: '0.76rem',
                          }}
                        >
                          <Box sx={{ overflowWrap: 'anywhere', color: tk.text }}>{imp.name} ← {imp.source}</Box>
                          <Box sx={{ color: tk.sapphire, fontWeight: 700, flexShrink: 0 }}>L{imp.line}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.muted, mb: 0.75 }}>
                  EXTRACTED SYMBOLS
                </Typography>
                {structure.symbols.length === 0 ? (
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.muted }}>
                    No top-level symbols detected in this buffer.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {structure.symbols.map((sym, idx) => (
                      <Box
                        key={`${sym.name}-${sym.line}-${idx}`}
                        sx={{
                          px: 1.25,
                          py: 0.9,
                          borderRadius: 1.25,
                          bgcolor: tk.subtle,
                          border: `1px solid ${tk.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={sym.kind}
                            sx={{
                              fontFamily: MONO,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: tk.goldBg,
                              color: tk.gold,
                              border: `1px solid ${tk.goldBorder}`,
                            }}
                          />
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 700, color: tk.text, overflowWrap: 'anywhere' }}>
                            {sym.name}
                          </Typography>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                            ({sym.detail})
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`L${sym.line}`}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: tk.sapphireBg,
                            color: tk.sapphire,
                            border: `1px solid ${tk.sapphireBorder}`,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {!structure.bracketBalance.balanced && (
                  <Alert severity="error" sx={{ mt: 2, fontFamily: MONO, fontSize: '0.76rem' }}>
                    {structure.bracketBalance.issues[0]?.message}
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 2: SECURITY & HYGIENE LINTER */}
      {activeTab === 'linter' && (
        <Box data-testid="ide-panel-linter">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
              <Chip
                label={`SCORE ${lintReport.score}/100 · GRADE ${lintReport.grade}`}
                sx={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  bgcolor: lintReport.score >= 90 ? tk.emeraldBg : lintReport.score >= 70 ? tk.amberBg : tk.crimsonBg,
                  color: lintReport.score >= 90 ? tk.emerald : lintReport.score >= 70 ? tk.amber : tk.crimson,
                  border: `1px solid ${lintReport.score >= 90 ? tk.emeraldBorder : lintReport.score >= 70 ? tk.amberBorder : tk.crimsonBorder}`,
                }}
              />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', color: tk.text }}>
                Target: <strong>{lintReport.filename}</strong> ({lintReport.language}) · {lintReport.summary.total} finding(s)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setLintSampleOverride(IDE_VULNERABLE_SAMPLE)}
                sx={{
                  ...actionBtnSx,
                  color: tk.crimson,
                  borderColor: tk.crimsonBorder,
                  bgcolor: tk.crimsonBg,
                  '&:hover': { bgcolor: tk.crimsonBg, borderColor: tk.crimson },
                }}
              >
                Load Vulnerable Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setLintSampleOverride(IDE_HARDENED_SAMPLE)}
                sx={{
                  ...actionBtnSx,
                  color: tk.emerald,
                  borderColor: tk.emeraldBorder,
                  bgcolor: tk.emeraldBg,
                  '&:hover': { bgcolor: tk.emeraldBg, borderColor: tk.emerald },
                }}
              >
                Load Hardened Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setLintSampleOverride(null)}
                disabled={!lintSampleOverride}
                sx={{
                  ...actionBtnSx,
                  color: tk.text,
                  borderColor: tk.border,
                  bgcolor: tk.card,
                }}
              >
                Audit Active Buffer
              </Button>
            </Box>
          </Box>

          {/* Severity Breakdown */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: 'CRITICAL', count: lintReport.summary.critical, tone: severityTone('CRITICAL') },
              { label: 'HIGH', count: lintReport.summary.high, tone: severityTone('HIGH') },
              { label: 'MEDIUM', count: lintReport.summary.medium, tone: severityTone('MEDIUM') },
              { label: 'INFO', count: lintReport.summary.info, tone: severityTone('INFO') },
            ].map((item) => (
              <Grid key={item.label} xs={6} sm={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.75,
                    bgcolor: item.tone.bg,
                    border: `1px solid ${item.tone.border}`,
                  }}
                >
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: item.tone.color }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '1.25rem', fontWeight: 700, color: item.tone.color }}>
                    {item.count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Findings List */}
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
            <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.5 }}>
              STATIC DIAGNOSTICS ({lintReport.findings.length})
            </Typography>
            {lintReport.findings.length === 0 ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: tk.emeraldBg,
                  border: `1px solid ${tk.emeraldBorder}`,
                  color: tk.emerald,
                  fontFamily: MONO,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                }}
              >
                PASS — Zero static security, zero-egress CDN, secret-key, path-leak, or bracket issues detected in {lintReport.filename}.
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {lintReport.findings.map((f, idx) => {
                  const tone = severityTone(f.severity);
                  return (
                    <Box
                      key={`${f.ruleId}-${f.line}-${idx}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: tk.subtle,
                        border: `1px solid ${tone.border}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
                        <Chip
                          size="small"
                          label={f.severity}
                          sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.7rem', bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}
                        />
                        <Chip
                          size="small"
                          label={f.ruleId}
                          sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.7rem', bgcolor: tk.card, color: tk.text, border: `1px solid ${tk.border}` }}
                        />
                        <Chip
                          size="small"
                          label={`Line ${f.line}`}
                          sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.7rem', bgcolor: tk.sapphireBg, color: tk.sapphire, border: `1px solid ${tk.sapphireBorder}` }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: tk.text, mb: 0.5 }}>
                        {f.message}
                      </Typography>
                      {f.excerpt && (
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            mb: 0.75,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: tk.codeBg,
                            border: `1px solid ${tk.border}`,
                            fontFamily: MONO,
                            fontSize: '0.76rem',
                            color: tk.text,
                            overflowX: 'auto',
                          }}
                        >
                          {f.excerpt}
                        </Box>
                      )}
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.muted }}>
                        Remediation: {f.hint}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* TAB 3: UNIFIED DIFF & PATCH */}
      {activeTab === 'diff' && (
        <Box data-testid="ide-panel-diff">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Chip
                size="small"
                label={`+${diffReport.stats.added} ADDED`}
                sx={{ fontFamily: MONO, fontWeight: 700, bgcolor: tk.emeraldBg, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}` }}
              />
              <Chip
                size="small"
                label={`-${diffReport.stats.removed} REMOVED`}
                sx={{ fontFamily: MONO, fontWeight: 700, bgcolor: tk.crimsonBg, color: tk.crimson, border: `1px solid ${tk.crimsonBorder}` }}
              />
              <Chip
                size="small"
                label={`${diffReport.stats.hunks} HUNK(S)`}
                sx={{ fontFamily: MONO, fontWeight: 700, bgcolor: tk.sapphireBg, color: tk.sapphire, border: `1px solid ${tk.sapphireBorder}` }}
              />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.muted }}>
                Receipt SHA-256: {exportsBundle.receiptSha256.slice(0, 16)}…
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleInjectSampleDiff}
                sx={{ ...actionBtnSx, color: tk.gold, borderColor: tk.goldBorder, bgcolor: tk.goldBg }}
              >
                Inject Sample Guard Edit
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetBaseline}
                disabled={!diffReport.hasChanges}
                sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.card }}
              >
                Reset to Baseline
              </Button>
            </Box>
          </Box>

          {/* Export Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(`${activeBuffer.filename.replace(/[^\w.-]+/g, '_')}.patch`, exportsBundle.patch, 'text/x-diff')}
              sx={{ ...actionBtnSx, bgcolor: tk.tabActiveBg, color: tk.tabActiveText, '&:hover': { bgcolor: tk.tabActiveBg } }}
            >
              Download .patch
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(`${activeBuffer.filename.replace(/[^\w.-]+/g, '_')}-review.md`, exportsBundle.markdown, 'text/markdown')}
              sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.card }}
            >
              Export Markdown
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(`${activeBuffer.filename.replace(/[^\w.-]+/g, '_')}-audit.json`, exportsBundle.json, 'application/json')}
              sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.card }}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(`${activeBuffer.filename.replace(/[^\w.-]+/g, '_')}-audit.csv`, exportsBundle.csv, 'text/csv')}
              sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.card }}
            >
              Export Formula-Safe CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={copiedId === 'patch' ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={() => handleCopy('patch', exportsBundle.patch)}
              sx={{ ...actionBtnSx, color: tk.text, borderColor: tk.border, bgcolor: tk.card }}
            >
              {copiedId === 'patch' ? 'Patch Copied' : 'Copy Patch'}
            </Button>
          </Box>

          {/* Unified Diff Viewport */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              overflowX: 'auto',
            }}
          >
            <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.25 }}>
              UNIFIED PATCH · {diffReport.filename}
            </Typography>
            {!diffReport.hasChanges && (
              <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', color: tk.muted, mb: 1.25 }}>
                Buffer matches its original baseline (0 line changes). Edit in Tab 1 or click &quot;Inject Sample Guard Edit&quot; to inspect LCS diff hunks.
              </Typography>
            )}
            <Box
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${tk.border}`,
                bgcolor: tk.codeBg,
                overflowX: 'auto',
              }}
            >
              {diffReport.lines.map((line, idx) => {
                const bg =
                  line.type === 'add'
                    ? tk.diffAddBg
                    : line.type === 'remove'
                    ? tk.diffDelBg
                    : line.type === 'hunk'
                    ? tk.diffHunkBg
                    : 'transparent';
                const color =
                  line.type === 'add'
                    ? tk.diffAddText
                    : line.type === 'remove'
                    ? tk.diffDelText
                    : line.type === 'hunk'
                    ? tk.diffHunkText
                    : line.type === 'header'
                    ? tk.gold
                    : tk.text;
                return (
                  <Box
                    key={`${idx}-${line.type}`}
                    sx={{
                      display: 'flex',
                      fontFamily: MONO,
                      fontSize: '0.78rem',
                      lineHeight: 1.6,
                      px: 1.25,
                      py: 0.2,
                      bgcolor: bg,
                      color,
                      whiteSpace: 'pre',
                    }}
                  >
                    <Box sx={{ width: 42, flexShrink: 0, color: tk.muted, userSelect: 'none' }}>
                      {line.oldLine ?? ''}
                    </Box>
                    <Box sx={{ width: 42, flexShrink: 0, color: tk.muted, userSelect: 'none' }}>
                      {line.newLine ?? ''}
                    </Box>
                    <Box sx={{ fontWeight: line.type === 'hunk' || line.type === 'header' ? 700 : 400 }}>
                      {line.text}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* TAB 4: LOOPBACK WORKSPACE & PURE EVALUATOR */}
      {activeTab === 'workspace' && (
        <Box data-testid="ide-panel-workspace">
          {workspaceNotice && (
            <Alert severity="info" sx={{ mb: 2, fontFamily: MONO, fontSize: '0.78rem' }}>
              {workspaceNotice}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Read-Only Local Workspace Inspector */}
            <Grid xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.25 }}>
                  READ-ONLY LOOPBACK FILE INSPECTOR (~/NullAITech/)
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mb: 1.5 }}>
                  Strict containment inside <code>~/NullAITech/&lt;repo&gt;</code> with <code>fs.realpathSync</code> symlink verification, 64 KB cap, and mandatory secret-file denylist (<code>.env*</code>, <code>*.pem</code>, <code>*.key</code>, <code>id_rsa*</code>, <code>*.db</code>).
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {isLive && (workspaceData.repos || []).length > 0 ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Local Repository (~/NullAITech/)"
                      value={selectedRepo}
                      onChange={(e) => {
                        const slug = e.target.value;
                        setSelectedRepo(slug);
                        const found = (workspaceData.repos || []).find((r) => r.slug === slug);
                        if (found?.files?.length) setSelectedFilePath(found.files[0]);
                      }}
                      inputProps={{ 'aria-label': 'Local repository selector' }}
                      sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                    >
                      {(workspaceData.repos || []).map((r) => (
                        <MenuItem key={r.slug} value={r.slug}>
                          {r.slug} ({r.files.length} safe files)
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      label="Repository Slug"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      inputProps={{ 'aria-label': 'Repository slug input' }}
                      sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                    />
                  )}

                  <TextField
                    fullWidth
                    size="small"
                    label="Relative File Path (read-only)"
                    value={selectedFilePath}
                    onChange={(e) => setSelectedFilePath(e.target.value)}
                    inputProps={{ 'aria-label': 'Relative file path input' }}
                    sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                  />

                  {currentRepoObj && currentRepoObj.files.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {currentRepoObj.files.slice(0, 8).map((f) => (
                        <Button
                          key={f}
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedFilePath(f)}
                          sx={{
                            ...actionBtnSx,
                            px: 1.25,
                            bgcolor: selectedFilePath === f ? tk.goldBg : tk.subtle,
                            color: selectedFilePath === f ? tk.gold : tk.text,
                            borderColor: selectedFilePath === f ? tk.goldBorder : tk.border,
                          }}
                        >
                          {f}
                        </Button>
                      ))}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleInspectLocalFile}
                    disabled={!isLive || inspectBusy}
                    startIcon={<FolderOpenIcon />}
                    sx={{
                      ...actionBtnSx,
                      bgcolor: tk.tabActiveBg,
                      color: tk.tabActiveText,
                      '&:hover': { bgcolor: tk.tabActiveBg },
                    }}
                  >
                    {inspectBusy ? 'Inspecting...' : 'Inspect Read-Only File via :3000'}
                  </Button>

                  {inspectStatus && (
                    <Alert severity={inspectStatus.severity} sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                      {inspectStatus.message}
                    </Alert>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Pure Expression Evaluator */}
            <Grid xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}`, height: '100%' }}>
                <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.25 }}>
                  SAFE PURE-EXPRESSION EVALUATOR (ZERO eval() / ZERO new Function())
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mb: 1.5 }}>
                  Deterministic recursive-descent AST evaluator supporting arithmetic, bitwise, boolean, Math, <code>sha256()</code>, <code>base64Encode()</code>, <code>jsonValid()</code>, and bounded <code>regexTest()</code>.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                  {EXPR_PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      size="small"
                      variant="outlined"
                      onClick={() => handleEvaluateExpression(p.expr)}
                      sx={{ ...actionBtnSx, px: 1.25, color: tk.text, borderColor: tk.border, bgcolor: tk.subtle }}
                    >
                      {p.label}
                    </Button>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pure Expression"
                    value={exprInput}
                    onChange={(e) => setExprInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEvaluateExpression();
                    }}
                    inputProps={{ 'aria-label': 'Pure expression evaluator input' }}
                    sx={{ ...inputSx, flex: '1 1 220px', '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleEvaluateExpression()}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      ...actionBtnSx,
                      bgcolor: tk.tabActiveBg,
                      color: tk.tabActiveText,
                      '&:hover': { bgcolor: tk.tabActiveBg },
                    }}
                  >
                    Evaluate
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {exprHistory.map((item, idx) => (
                    <Box
                      key={`${idx}-${item.expression}`}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: tk.subtle,
                        border: `1px solid ${item.ok ? tk.emeraldBorder : tk.crimsonBorder}`,
                        fontFamily: MONO,
                        fontSize: '0.78rem',
                      }}
                    >
                      <Box sx={{ color: tk.muted, overflowWrap: 'anywhere' }}>&gt; {item.expression}</Box>
                      {item.ok ? (
                        <Box sx={{ color: tk.emerald, fontWeight: 700, mt: 0.4, overflowWrap: 'anywhere' }}>
                          = {item.formatted} ({item.valueType} · {item.tokensCount} tokens)
                        </Box>
                      ) : (
                        <Box sx={{ color: tk.crimson, fontWeight: 700, mt: 0.4 }}>
                          ERROR: {item.error}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Host Developer Toolchain Matrix */}
            <Grid xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
                <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold, mb: 1.5 }}>
                  HOST DEVELOPER TOOLCHAIN MATRIX ({workspaceData.summary?.installedToolchains || 0} / {workspaceData.summary?.totalToolchains || 11} DETECTED)
                </Typography>
                <Grid container spacing={1.25}>
                  {(workspaceData.toolchains || []).map((tc) => (
                    <Grid key={tc.id} xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: tk.subtle,
                          border: `1px solid ${tc.installed ? tk.emeraldBorder : tk.border}`,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.text }}>
                            {tc.label} ({tc.id})
                          </Typography>
                          <Chip
                            size="small"
                            label={tc.installed ? 'INSTALLED' : isLive ? 'MISSING' : 'OFFLINE'}
                            sx={{
                              fontFamily: MONO,
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              bgcolor: tc.installed ? tk.emeraldBg : tk.card,
                              color: tc.installed ? tk.emerald : tk.muted,
                              border: `1px solid ${tc.installed ? tk.emeraldBorder : tk.border}`,
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, overflowWrap: 'anywhere' }}>
                          {tc.version || tc.purpose}
                        </Typography>
                        {tc.path && (
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.sapphire, mt: 0.35, overflowWrap: 'anywhere' }}>
                            {tc.path}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
