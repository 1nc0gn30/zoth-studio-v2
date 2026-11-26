import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  TextField,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
  Alert,
  LinearProgress,
  MenuItem,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import BuildIcon from '@mui/icons-material/Build';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RadarIcon from '@mui/icons-material/Radar';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';

import {
  AX_SPEC_IDS,
  DEFAULT_AX_COMPILER_CONFIG,
  validateAxSpec,
  compileAxBundle,
  estimateTokens,
  utf8ByteLength,
  gradeFromScore,
} from '../../utils/axContractEngine';
import {
  SovereignBand,
  SovereignEyebrow,
  STRIPE_COFFEE_URL,
  SOLANA_TIP_ADDRESS,
  useCopy,
  downloadText,
  downloadJson,
} from '../sovereign';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const STORAGE_KEY = 'zoth-ax-powerhouse-compiler-v2';

const LIVE_STUDIO_ENDPOINTS = [
  { path: '/llms.txt', spec: 'llms.txt', label: 'Compact LLM Index' },
  { path: '/llms-full.txt', spec: 'llms.txt', label: 'Full LLM Corpus' },
  { path: '/ai.txt', spec: 'ai.txt', label: 'AI Crawler Directives' },
  { path: '/.well-known/mcp.json', spec: 'mcp.json', label: 'MCP Discovery Manifest' },
  { path: '/.well-known/agent.json', spec: 'agent.json', label: 'A2A Agent Card' },
  { path: '/.well-known/ai-plugin.json', spec: null, label: 'AI Plugin Descriptor' },
  { path: '/robots.txt', spec: 'robots.txt', label: 'Crawler Policy' },
  { path: '/sitemap.xml', spec: null, label: 'XML Route Sitemap' },
  { path: '/api/tools.json', spec: null, label: '85-Tool Registry API' },
  { path: '/api/index.json', spec: null, label: 'Master Discovery Index' },
];

const SPEC_LABELS = {
  'llms.txt': 'llms.txt (Markdown)',
  'ai.txt': 'ai.txt (AI Directives)',
  'robots.txt': 'robots.txt (Crawlers)',
  'mcp.json': '.well-known/mcp.json',
  'agent.json': '.well-known/agent.json',
  jsonld: 'Schema.org JSON-LD @graph',
};

const SPEC_TO_LIVE_PATH = {
  'llms.txt': '/llms.txt',
  'ai.txt': '/ai.txt',
  'robots.txt': '/robots.txt',
  'mcp.json': '/.well-known/mcp.json',
  'agent.json': '/.well-known/agent.json',
  jsonld: '/api/graph.json',
};

const BROKEN_SAMPLES = {
  'llms.txt': `Zoth Studio\n\nSome text mentioning 80 tools and 43 workstations with sovereign@zoth.studio and no links.`,
  'ai.txt': `# Incomplete ai.txt\nAgent-Contact: sovereign@zoth.studio\nFacts: 80 tools and 43 workstations.`,
  'robots.txt': `User-agent: *\nDisallow: /\nCrawl-delay: 10`,
  'mcp.json': JSON.stringify(
    {
      name: 'broken-mcp',
      description: 'NullAI (nullai.tech), NullAI (nullai.tech) with 44 tools and Stripe Checkout Links',
      resources: [],
    },
    null,
    2
  ),
  'agent.json': JSON.stringify(
    {
      name: 'Stale Agent',
      url: 'http://insecure.example',
      capabilities: { instantCheckout: true },
      apis: {},
    },
    null,
    2
  ),
  jsonld: JSON.stringify(
    {
      '@context': 'https://example.invalid',
      '@graph': [{ '@type': 'WebPage', name: 'Missing Application & FAQPage' }],
    },
    null,
    2
  ),
};

const STUDIO_COMPILER_DEFAULTS = {
  ...DEFAULT_AX_COMPILER_CONFIG,
  stripeCoffeeUrl: STRIPE_COFFEE_URL,
  solanaWallet: SOLANA_TIP_ADDRESS,
};

function loadSavedCompilerConfig() {
  if (typeof window === 'undefined') return STUDIO_COMPILER_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return STUDIO_COMPILER_DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...STUDIO_COMPILER_DEFAULTS, ...parsed };
  } catch {
    return STUDIO_COMPILER_DEFAULTS;
  }
}

export default function AxPowerhouseGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Strict Dual-Theme Tokens (Editorial Ivory Light vs Obsidian Dark)
  const surfaceBg = isDark ? '#0D1017' : '#FFFFFF';
  const subtleBg = isDark ? '#121621' : '#F5F1E8';
  const codeBg = isDark ? '#090B10' : '#F3EFE6';
  const ink = isDark ? '#F5F1E6' : '#181613';
  const inkMuted = isDark ? '#A3AAB8' : '#475467';
  const accent = isDark ? '#22D3EE' : '#0E7490';
  const gold = isDark ? '#D4AF37' : '#8C6A2E';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(52, 211, 153, 0.12)' : '#ECFDF5';
  const emeraldBorder = isDark ? 'rgba(52, 211, 153, 0.35)' : '#A7F3D0';
  const amber = isDark ? '#FBBF24' : '#92400E';
  const amberBg = isDark ? 'rgba(251, 191, 36, 0.12)' : '#FFFBEB';
  const crimson = isDark ? '#F87171' : '#BE123C';
  const crimsonBg = isDark ? 'rgba(248, 113, 113, 0.12)' : '#FFF1F2';
  const hairline = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(24, 22, 19, 0.12)';
  const accentBg = isDark ? 'rgba(34, 211, 238, 0.12)' : 'rgba(14, 116, 144, 0.08)';
  const accentBorder = isDark ? 'rgba(34, 211, 238, 0.34)' : 'rgba(14, 116, 144, 0.30)';

  const [activeTab, setActiveTab] = useState(0);

  // Tab 0: Live Studio AX Endpoint Auditor state
  const [auditLoading, setAuditLoading] = useState(true);
  const [serverAudit, setServerAudit] = useState(null);
  const [liveProbes, setLiveProbes] = useState([]);
  const [inspectedEndpoint, setInspectedEndpoint] = useState(null);
  const [lastAuditedAt, setLastAuditedAt] = useState('');

  // Tab 1: Multi-Spec Validator state
  const defaultBundle = useMemo(() => compileAxBundle(STUDIO_COMPILER_DEFAULTS), []);
  const [validatorSpec, setValidatorSpec] = useState('llms.txt');
  const [validatorInput, setValidatorInput] = useState(defaultBundle.files['llms.txt']);
  const [serverValidation, setServerValidation] = useState(null);
  const [serverValidateLoading, setServerValidateLoading] = useState(false);
  const [serverValidateError, setServerValidateError] = useState('');

  // Tab 2: AX Contract Compiler state (persisted to localStorage)
  const [compilerConfig, setCompilerConfig] = useState(loadSavedCompilerConfig);
  const [selectedBundleFile, setSelectedBundleFile] = useState('llms.txt');
  const [catalogSyncStatus, setCatalogSyncStatus] = useState('');

  const { copied: copiedRaw, copy: copyRaw } = useCopy(1800);
  const { copied: copiedVal, copy: copyVal } = useCopy(1800);
  const { copied: copiedFile, copy: copyFile } = useCopy(1800);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compilerConfig));
    } catch {}
  }, [compilerConfig]);

  const groundTruthCounts = useMemo(
    () => ({
      tools: serverAudit?.groundTruth?.tools || 85,
      workstations: serverAudit?.groundTruth?.workstations || 44,
    }),
    [serverAudit]
  );

  // Real live HTTP probes across Studio AX endpoints + /api/studio/ax/audit
  const runLiveAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const [auditRes, ...probeResults] = await Promise.all([
        fetch('/api/studio/ax/audit', { headers: { Accept: 'application/json' } })
          .then(async (r) => (r.ok ? r.json() : null))
          .catch(() => null),
        ...LIVE_STUDIO_ENDPOINTS.map(async (ep) => {
          const t0 = performance.now();
          try {
            const res = await fetch(ep.path, { cache: 'no-store' });
            const text = await res.text();
            const latencyMs = Math.max(1, Math.round(performance.now() - t0));
            const bytes = utf8ByteLength(text);
            const estimatedTokens = estimateTokens(text);
            const mimeType = res.headers.get('content-type') || 'unknown';
            const clientValidation = ep.spec
              ? validateAxSpec(ep.spec, text, { tools: 85, workstations: 44 })
              : null;
            return {
              ...ep,
              status: res.status,
              ok: res.ok,
              mimeType,
              bytes,
              estimatedTokens,
              latencyMs,
              content: text,
              clientValidation,
            };
          } catch (err) {
            return {
              ...ep,
              status: 0,
              ok: false,
              mimeType: 'error',
              bytes: 0,
              estimatedTokens: 0,
              latencyMs: Math.max(1, Math.round(performance.now() - t0)),
              content: '',
              error: err.message,
              clientValidation: null,
            };
          }
        }),
      ]);

      setServerAudit(auditRes);
      setLiveProbes(probeResults);
      setLastAuditedAt(new Date().toLocaleTimeString());
      setInspectedEndpoint((prev) => {
        if (prev) {
          const updated = probeResults.find((p) => p.path === prev.path);
          return updated || probeResults[0] || null;
        }
        return probeResults[0] || null;
      });
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    runLiveAudit();
  }, [runLiveAudit]);

  const mergedAuditRows = useMemo(() => {
    const serverByPath = new Map(
      (serverAudit?.manifests || []).map((m) => [m.path, m])
    );
    return liveProbes.map((probe) => {
      const srv = serverByPath.get(probe.path);
      const score = srv?.score ?? probe.clientValidation?.score ?? (probe.ok ? 100 : 0);
      const grade = srv?.grade ?? probe.clientValidation?.grade ?? gradeFromScore(score);
      const errors = srv?.errors ?? probe.clientValidation?.errors ?? (probe.ok ? [] : [probe.error || `HTTP ${probe.status}`]);
      const warnings = srv?.warnings ?? probe.clientValidation?.warnings ?? [];
      return {
        ...probe,
        score,
        grade,
        errors,
        warnings,
        sha256Prefix: srv?.sha256Prefix || null,
        source: srv?.source || 'http',
      };
    });
  }, [liveProbes, serverAudit]);

  const auditorKpis = useMemo(() => {
    const online = mergedAuditRows.filter((r) => r.status === 200).length;
    const total = mergedAuditRows.length || LIVE_STUDIO_ENDPOINTS.length;
    const totalTokens = mergedAuditRows.reduce((acc, r) => acc + r.estimatedTokens, 0);
    const avgScore = serverAudit?.zeroDriftScore ?? Math.round(
      mergedAuditRows.reduce((acc, r) => acc + r.score, 0) / Math.max(1, mergedAuditRows.length)
    );
    const driftCount = serverAudit?.driftCount ?? mergedAuditRows.reduce((acc, r) => acc + r.errors.length + r.warnings.length, 0);
    return {
      online,
      total,
      totalTokens,
      avgScore,
      grade: gradeFromScore(avgScore),
      driftCount,
    };
  }, [mergedAuditRows, serverAudit]);

  // Tab 1 live client-side validation
  const clientValidation = useMemo(
    () => validateAxSpec(validatorSpec, validatorInput, groundTruthCounts),
    [validatorSpec, validatorInput, groundTruthCounts]
  );

  const handleSelectValidatorSpec = (nextSpec) => {
    setValidatorSpec(nextSpec);
    setServerValidation(null);
    setServerValidateError('');
    const liveMatch = liveProbes.find((p) => p.path === SPEC_TO_LIVE_PATH[nextSpec] && p.ok && p.content);
    if (liveMatch) {
      setValidatorInput(liveMatch.content);
      return;
    }
    const fileKey = nextSpec === 'mcp.json'
      ? '.well-known/mcp.json'
      : nextSpec === 'agent.json'
      ? '.well-known/agent.json'
      : nextSpec === 'jsonld'
      ? 'schema-graph.jsonld'
      : nextSpec;
    setValidatorInput(defaultBundle.files[fileKey] || '');
  };

  const handleLoadIntoValidator = (row) => {
    const targetSpec = row.spec || (row.path.includes('graph') ? 'jsonld' : 'llms.txt');
    setValidatorSpec(targetSpec);
    setValidatorInput(row.content || '');
    setServerValidation(null);
    setServerValidateError('');
    setActiveTab(1);
  };

  const handleLoadLiveManifestForSpec = async () => {
    const path = SPEC_TO_LIVE_PATH[validatorSpec];
    if (!path) return;
    setServerValidation(null);
    setServerValidateError('');
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        setValidatorInput(text);
        return;
      }
    } catch {}
    setServerValidateError(`Could not fetch live ${path}.`);
  };

  const handleVerifyServerSide = async () => {
    setServerValidateLoading(true);
    setServerValidateError('');
    try {
      const res = await fetch('/api/studio/ax/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: validatorSpec,
          content: validatorInput,
          expectedCounts: groundTruthCounts,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerValidation(null);
        setServerValidateError(data.error || `Loopback API returned HTTP ${res.status}`);
      } else {
        setServerValidation(data);
      }
    } catch (err) {
      setServerValidation(null);
      setServerValidateError(`Loopback API unavailable (${err.message}) — client-side validation remains active.`);
    } finally {
      setServerValidateLoading(false);
    }
  };

  // Tab 2 compiled 6-file bundle
  const compiledBundle = useMemo(
    () => compileAxBundle(compilerConfig),
    [compilerConfig]
  );

  const handleSyncFromLiveCatalog = async () => {
    setCatalogSyncStatus('Syncing from /api/tools.json & /api/index.json...');
    try {
      const [toolsRes, indexRes] = await Promise.all([
        fetch('/api/tools.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/index.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      ]);
      const liveToolCount = toolsRes?.tools?.length || toolsRes?.tool_count || 85;
      const liveWsCount = indexRes?.counts?.workstations || serverAudit?.groundTruth?.workstations || 44;
      setCompilerConfig((prev) => ({
        ...prev,
        siteName: 'Zoth Studio v2',
        canonicalUrl: indexRes?.baseUrl || 'https://zoth.nullai.tech',
        version: indexRes?.schemaVersion || '2.3.0',
        toolCount: liveToolCount,
        workstationCount: liveWsCount,
        creatorName: indexRes?.publisher?.name || prev.creatorName,
        contactEmail: indexRes?.publisher?.email || prev.contactEmail,
        tagline: `Local-first, zero-egress AI engineering studio unifying ${liveToolCount} free open-access tools and ${liveWsCount} Studio workstations.`,
      }));
      setCatalogSyncStatus(`Synced live ground truth: ${liveToolCount} tools · ${liveWsCount} workstations.`);
    } catch (err) {
      setCatalogSyncStatus(`Sync failed: ${err.message}`);
    }
  };

  const activeBundleContent = compiledBundle.files[selectedBundleFile] || '';
  const activeBundleSummary = compiledBundle.summaries.find((s) => s.filename === selectedBundleFile);

  const scoreTone = (score) =>
    score >= 90
      ? { fg: emerald, bg: emeraldBg, bd: emeraldBorder }
      : score >= 70
      ? { fg: amber, bg: amberBg, bd: isDark ? 'rgba(251,191,36,0.35)' : '#FDE68A' }
      : { fg: crimson, bg: crimsonBg, bd: isDark ? 'rgba(248,113,113,0.38)' : '#FECDD3' };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: isDark ? '#090B10' : '#FFFFFF',
      color: ink,
      fontFamily: mono,
      fontSize: '0.8rem',
      '& fieldset': { borderColor: hairline },
      '&:hover fieldset': { borderColor: accent },
      '&.Mui-focused fieldset': { borderColor: accent },
    },
    '& .MuiInputLabel-root': {
      color: inkMuted,
      fontFamily: mono,
      fontSize: '0.78rem',
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
  };

  return (
    <Paper
      elevation={0}
      data-testid="ax-powerhouse-workstation"
      sx={{
        p: { xs: 2, sm: 3, md: 3.5 },
        borderRadius: 2.5,
        bgcolor: surfaceBg,
        color: ink,
        border: `1px solid ${hairline}`,
      }}
    >
      {/* Workstation Identity Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip
              size="small"
              label="AX CONTRACT STUDIO · v2.3.0"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: accentBg,
                color: accent,
                border: `1px solid ${accentBorder}`,
              }}
            />
            <Chip
              size="small"
              label={`${auditorKpis.online}/${auditorKpis.total} LIVE ENDPOINTS`}
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: emeraldBg,
                color: emerald,
                border: `1px solid ${emeraldBorder}`,
              }}
            />
            <Chip
              size="small"
              label={`ZERO-DRIFT: ${auditorKpis.avgScore}/100 (${auditorKpis.grade})`}
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: scoreTone(auditorKpis.avgScore).bg,
                color: scoreTone(auditorKpis.avgScore).fg,
                border: `1px solid ${scoreTone(auditorKpis.avgScore).bd}`,
              }}
            />
          </Box>

          <Typography
            component="h3"
            sx={{
              fontFamily: display,
              fontSize: { xs: '1.55rem', md: '1.9rem' },
              fontWeight: 400,
              lineHeight: 1.15,
              color: ink,
              mb: 0.5,
            }}
          >
            Zoth AX Powerhouse &amp; Machine Contract Compiler
          </Typography>
          <Typography variant="body2" sx={{ color: inkMuted, lineHeight: 1.6, maxWidth: 780 }}>
            Audit live Agent Experience (AX) manifests over HTTP, validate all 6 discovery specs against ground truth ({groundTruthCounts.tools} tools · {groundTruthCounts.workstations} workstations), and compile synchronized 6-file open-access contract bundles.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={runLiveAudit}
          disabled={auditLoading}
          startIcon={auditLoading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshIcon />}
          sx={{
            minHeight: 44,
            minWidth: 44,
            px: 2,
            fontFamily: mono,
            fontSize: '0.76rem',
            fontWeight: 700,
            textTransform: 'none',
            color: accent,
            borderColor: accentBorder,
            bgcolor: accentBg,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            '&:hover': { borderColor: accent },
          }}
        >
          {auditLoading ? 'Probing Live...' : 'Re-Probe Live Studio'}
        </Button>
      </Box>

      <SovereignEyebrow accent={gold} right="AX Protocol Suite">
        ax-powerhouse
      </SovereignEyebrow>
      <SovereignBand
        seed="ax-powerhouse"
        eyebrow="Build · AX Contract Ontology"
        caption="Live Manifest Auditor · 6-Spec Validator · Bundle Compiler"
        label="Zoth AX Powerhouse — Live Manifest Matrix"
      />

      {/* Primary 3-Tab Navigation (all >= 44px height) */}
      <Box sx={{ borderBottom: `1px solid ${hairline}`, mt: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="AX Powerhouse Workspace Modes"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': { bgcolor: accent, height: 3 },
            '& .MuiTab-root': {
              minHeight: 48,
              minWidth: 44,
              px: { xs: 1.5, sm: 2.25 },
              fontFamily: mono,
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: inkMuted,
              '&.Mui-selected': { color: accent },
            },
          }}
        >
          <Tab
            icon={<RadarIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={`1. Live Endpoint Auditor (${auditorKpis.online}/${auditorKpis.total})`}
          />
          <Tab
            icon={<FactCheckIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={`2. 6-Spec Contract Validator (${clientValidation.grade})`}
          />
          <Tab
            icon={<BuildIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="3. AX Bundle Compiler (6 Files)"
          />
        </Tabs>
      </Box>

      {/* ====================================================================
          TAB 0: LIVE STUDIO AX ENDPOINT AUDITOR
         ==================================================================== */}
      {activeTab === 0 && (
        <Box data-testid="ax-tab-auditor">
          {/* KPI Summary Strip */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                label: 'LIVE ENDPOINTS',
                value: `${auditorKpis.online} / ${auditorKpis.total}`,
                sub: lastAuditedAt ? `Probed at ${lastAuditedAt}` : 'Probing HTTP endpoints...',
                toneColor: auditorKpis.online === auditorKpis.total ? emerald : amber,
              },
              {
                label: 'ZERO-DRIFT SCORE',
                value: `${auditorKpis.avgScore} / 100 (${auditorKpis.grade})`,
                sub: `${auditorKpis.driftCount} drift / schema issue(s)`,
                toneColor: scoreTone(auditorKpis.avgScore).fg,
              },
              {
                label: 'GROUND TRUTH',
                value: `${groundTruthCounts.tools} Tools · ${groundTruthCounts.workstations} WS`,
                sub: serverAudit ? 'Verified via /api/studio/ax/audit' : 'Browser HTTP probe active',
                toneColor: gold,
              },
              {
                label: 'TOTAL CONTEXT WEIGHT',
                value: `~${auditorKpis.totalTokens.toLocaleString()} tok`,
                sub: `${mergedAuditRows.reduce((s, r) => s + r.bytes, 0).toLocaleString()} UTF-8 bytes`,
                toneColor: accent,
              },
            ].map((kpi) => (
              <Grid key={kpi.label} xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: subtleBg,
                    border: `1px solid ${hairline}`,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: inkMuted, letterSpacing: '0.08em' }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '1.15rem', fontWeight: 800, color: kpi.toneColor, my: 0.4 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: inkMuted, fontFamily: mono, fontSize: '0.68rem' }}>
                    {kpi.sub}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Endpoint Cards Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {mergedAuditRows.map((row) => {
              const tone = scoreTone(row.score);
              const isSelected = inspectedEndpoint?.path === row.path;
              return (
                <Grid key={row.path} xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: isSelected ? accentBg : subtleBg,
                      border: `1px solid ${isSelected ? accent : hairline}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: accent }}>
                          {row.path}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={row.status === 200 ? `200 OK · ${row.latencyMs}ms` : `HTTP ${row.status || 'ERR'}`}
                            sx={{
                              fontFamily: mono,
                              fontWeight: 700,
                              fontSize: '0.66rem',
                              bgcolor: row.status === 200 ? emeraldBg : crimsonBg,
                              color: row.status === 200 ? emerald : crimson,
                            }}
                          />
                          <Chip
                            size="small"
                            label={`${row.grade} (${row.score})`}
                            sx={{
                              fontFamily: mono,
                              fontWeight: 800,
                              fontSize: '0.66rem',
                              bgcolor: tone.bg,
                              color: tone.fg,
                              border: `1px solid ${tone.bd}`,
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: ink, mb: 0.5 }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: inkMuted }}>
                        {row.mimeType.split(';')[0]} · {row.bytes.toLocaleString()} B · ~{row.estimatedTokens.toLocaleString()} tokens
                        {row.sha256Prefix ? ` · sha256:${row.sha256Prefix.slice(0, 8)}` : ''}
                      </Typography>

                      {(row.errors.length > 0 || row.warnings.length > 0) && (
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: row.errors.length ? crimson : amber, mt: 0.75 }}>
                          {row.errors[0] || row.warnings[0]}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setInspectedEndpoint(row)}
                        sx={{
                          minHeight: 44,
                          minWidth: 44,
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: isSelected ? accent : surfaceBg,
                          color: isSelected ? (isDark ? '#08080B' : '#FFFFFF') : ink,
                          borderColor: hairline,
                        }}
                      >
                        Inspect Raw
                      </Button>
                      {row.spec && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FactCheckIcon sx={{ fontSize: 15 }} />}
                          onClick={() => handleLoadIntoValidator(row)}
                          sx={{
                            minHeight: 44,
                            minWidth: 44,
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: gold,
                            borderColor: hairline,
                            bgcolor: surfaceBg,
                          }}
                        >
                          Validate Spec
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Mirror Parity Strip (from /api/studio/ax/audit) */}
          {serverAudit?.mirrorParity && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: subtleBg,
                border: `1px solid ${hairline}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: gold, mb: 1.25 }}>
                WELL-KNOWN MIRROR PARITY (SHA-256 VERIFIED)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                {serverAudit.mirrorParity.map((m) => (
                  <Chip
                    key={m.mirrorPath}
                    size="small"
                    icon={m.identical ? <VerifiedIcon sx={{ fontSize: '15px !important', color: `${emerald} !important` }} /> : <WarningAmberIcon sx={{ fontSize: '15px !important', color: `${crimson} !important` }} />}
                    label={`${m.rootPath} === ${m.mirrorPath} (${m.identical ? 'IDENTICAL' : 'DRIFT'})`}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: m.identical ? emeraldBg : crimsonBg,
                      color: m.identical ? emerald : crimson,
                      border: `1px solid ${m.identical ? emeraldBorder : hairline}`,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Raw Manifest Inspector */}
          {inspectedEndpoint && (
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 2,
                bgcolor: subtleBg,
                border: `1px solid ${hairline}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: accent }}>
                    RAW LIVE PAYLOAD · {inspectedEndpoint.path}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: inkMuted }}>
                    HTTP {inspectedEndpoint.status} · {inspectedEndpoint.bytes.toLocaleString()} bytes · ~{inspectedEndpoint.estimatedTokens.toLocaleString()} estimated tokens
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copiedRaw ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={() => copyRaw(inspectedEndpoint.content || '')}
                    sx={{
                      minHeight: 44,
                      minWidth: 44,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: ink,
                      borderColor: hairline,
                      bgcolor: surfaceBg,
                    }}
                  >
                    {copiedRaw ? 'Copied' : 'Copy Raw'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={inspectedEndpoint.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      minHeight: 44,
                      minWidth: 44,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: accent,
                      borderColor: accentBorder,
                      bgcolor: surfaceBg,
                    }}
                  >
                    Open Direct URL ↗
                  </Button>
                </Box>
              </Box>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: codeBg,
                  color: ink,
                  border: `1px solid ${hairline}`,
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  lineHeight: 1.6,
                  maxHeight: 340,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {(inspectedEndpoint.content || '').slice(0, 14000)}
                {(inspectedEndpoint.content || '').length > 14000 ? '\n\n… [truncated preview — click Open Direct URL for full payload]' : ''}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ====================================================================
          TAB 1: MULTI-SPEC AX CONTRACT VALIDATOR & LINTER
         ==================================================================== */}
      {activeTab === 1 && (
        <Box data-testid="ax-tab-validator">
          {/* Spec Picker & Quick Presets */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
            {AX_SPEC_IDS.map((specId) => {
              const selected = validatorSpec === specId;
              return (
                <Button
                  key={specId}
                  size="small"
                  variant={selected ? 'contained' : 'outlined'}
                  onClick={() => handleSelectValidatorSpec(specId)}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    px: 1.75,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: selected ? accent : surfaceBg,
                    color: selected ? (isDark ? '#08080B' : '#FFFFFF') : ink,
                    borderColor: selected ? accent : hairline,
                  }}
                >
                  {SPEC_LABELS[specId]}
                </Button>
              );
            })}
          </Box>

          <Grid container spacing={3}>
            {/* Left: Editor & Actions */}
            <Grid xs={12} md={7}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleLoadLiveManifestForSpec}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: accent,
                    borderColor: accentBorder,
                  }}
                >
                  Load Live Studio Copy
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const key = validatorSpec === 'mcp.json'
                      ? '.well-known/mcp.json'
                      : validatorSpec === 'agent.json'
                      ? '.well-known/agent.json'
                      : validatorSpec === 'jsonld'
                      ? 'schema-graph.jsonld'
                      : validatorSpec;
                    setValidatorInput(compileAxBundle(compilerConfig).files[key] || '');
                    setServerValidation(null);
                  }}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: emerald,
                    borderColor: emeraldBorder,
                  }}
                >
                  Load Clean Sample
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setValidatorInput(BROKEN_SAMPLES[validatorSpec] || '');
                    setServerValidation(null);
                  }}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: crimson,
                    borderColor: isDark ? 'rgba(248,113,113,0.4)' : '#FECDD3',
                  }}
                >
                  Load Drift / Failure Test
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleVerifyServerSide}
                  disabled={serverValidateLoading}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: gold,
                    color: isDark ? '#08080B' : '#FFFFFF',
                    '&:hover': { bgcolor: isDark ? '#E5C158' : '#6B4F1F' },
                  }}
                >
                  {serverValidateLoading ? 'Verifying API...' : 'Verify via Loopback API'}
                </Button>
              </Box>

              <TextField
                id="ax-validator-editor"
                label={`AX Contract Payload (${SPEC_LABELS[validatorSpec]})`}
                multiline
                minRows={13}
                maxRows={20}
                fullWidth
                value={validatorInput}
                onChange={(e) => {
                  setValidatorInput(e.target.value);
                  setServerValidation(null);
                }}
                inputProps={{
                  'aria-label': `AX Contract Payload for ${SPEC_LABELS[validatorSpec]}`,
                  spellCheck: false,
                }}
                sx={inputSx}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedVal ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyVal(validatorInput)}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: ink,
                    borderColor: hairline,
                  }}
                >
                  {copiedVal ? 'Copied Payload' : 'Copy Payload'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    downloadJson(`${validatorSpec.replace(/[^a-z0-9]/gi, '-')}-audit-report.json`, {
                      spec: validatorSpec,
                      clientValidation,
                      serverValidation,
                    })
                  }
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: accent,
                    borderColor: accentBorder,
                  }}
                >
                  Export Audit Report (.json)
                </Button>
              </Box>
            </Grid>

            {/* Right: Live Score Gauge & Diagnostics */}
            <Grid xs={12} md={5}>
              <Stack spacing={2}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: 2,
                    bgcolor: subtleBg,
                    border: `1px solid ${hairline}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: ink }}>
                      CONTRACT COMPLIANCE SCORE
                    </Typography>
                    <Chip
                      size="small"
                      data-testid="ax-validator-grade"
                      label={`${clientValidation.grade} · ${clientValidation.score}/100`}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        bgcolor: scoreTone(clientValidation.score).bg,
                        color: scoreTone(clientValidation.score).fg,
                        border: `1px solid ${scoreTone(clientValidation.score).bd}`,
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={clientValidation.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,22,19,0.08)',
                      mb: 1.5,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: scoreTone(clientValidation.score).fg,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontFamily: mono, fontSize: '0.72rem', color: inkMuted }}>
                    <span>{clientValidation.stats.bytes.toLocaleString()} bytes</span>
                    <span>{clientValidation.stats.lines} lines</span>
                    <span>~{clientValidation.stats.estimatedTokens.toLocaleString()} tokens</span>
                  </Box>
                </Paper>

                {serverValidation && (
                  <Alert
                    severity={serverValidation.valid ? 'success' : 'error'}
                    sx={{
                      bgcolor: serverValidation.valid ? emeraldBg : crimsonBg,
                      color: ink,
                      border: `1px solid ${serverValidation.valid ? emeraldBorder : hairline}`,
                      '& .MuiAlert-icon': { color: serverValidation.valid ? emerald : crimson },
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: ink }}>
                      LOOPBACK API VERIFIED (`POST /api/studio/ax/validate`)
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: inkMuted, display: 'block' }}>
                      Server Score: {serverValidation.score}/100 ({serverValidation.grade}) · Errors: {serverValidation.errors.length} · Warnings: {serverValidation.warnings.length}
                    </Typography>
                  </Alert>
                )}

                {serverValidateError && (
                  <Alert
                    severity="warning"
                    sx={{
                      bgcolor: amberBg,
                      color: ink,
                      border: `1px solid ${hairline}`,
                      '& .MuiAlert-icon': { color: amber },
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: ink }}>
                      {serverValidateError}
                    </Typography>
                  </Alert>
                )}

                {clientValidation.errors.map((err, i) => (
                  <Alert
                    key={`err-${i}`}
                    severity="error"
                    icon={<ErrorOutlineIcon fontSize="small" />}
                    sx={{
                      bgcolor: crimsonBg,
                      color: ink,
                      border: `1px solid ${isDark ? 'rgba(248,113,113,0.35)' : '#FECDD3'}`,
                      '& .MuiAlert-icon': { color: crimson },
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: ink }}>
                      {err}
                    </Typography>
                  </Alert>
                ))}

                {clientValidation.warnings.map((warn, i) => (
                  <Alert
                    key={`warn-${i}`}
                    severity="warning"
                    icon={<WarningAmberIcon fontSize="small" />}
                    sx={{
                      bgcolor: amberBg,
                      color: ink,
                      border: `1px solid ${isDark ? 'rgba(251,191,36,0.35)' : '#FDE68A'}`,
                      '& .MuiAlert-icon': { color: amber },
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: ink }}>
                      {warn}
                    </Typography>
                  </Alert>
                ))}

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: subtleBg,
                    border: `1px solid ${hairline}`,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: gold, mb: 1.25 }}>
                    RULE CHECKLIST ({clientValidation.checks.length})
                  </Typography>
                  <Stack spacing={1}>
                    {clientValidation.checks.map((chk) => (
                      <Box
                        key={`${chk.id}-${chk.detail}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1,
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: surfaceBg,
                          border: `1px solid ${hairline}`,
                        }}
                      >
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: ink }}>
                          {chk.detail}
                        </Typography>
                        <Chip
                          size="small"
                          label={chk.status.toUpperCase()}
                          sx={{
                            fontFamily: mono,
                            fontWeight: 800,
                            fontSize: '0.64rem',
                            flexShrink: 0,
                            bgcolor: chk.status === 'pass' ? emeraldBg : chk.status === 'warn' ? amberBg : crimsonBg,
                            color: chk.status === 'pass' ? emerald : chk.status === 'warn' ? amber : crimson,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ====================================================================
          TAB 2: AX CONTRACT COMPILER & BUNDLE EXPORTER
         ==================================================================== */}
      {activeTab === 2 && (
        <Box data-testid="ax-tab-compiler">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: gold }}>
                SYNCHRONIZED 6-FILE AX BUNDLE SYNTHESIZER
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: inkMuted }}>
                Total Bundle: {compiledBundle.totalBytes.toLocaleString()} bytes · ~{compiledBundle.totalEstimatedTokens.toLocaleString()} tokens · Auto-saved locally
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSyncFromLiveCatalog}
                sx={{
                  minHeight: 44,
                  minWidth: 44,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: accent,
                  borderColor: accentBorder,
                  bgcolor: accentBg,
                }}
              >
                Sync from Live Zoth Studio Catalog
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  downloadJson(
                    `${(compilerConfig.siteName || 'ax-bundle').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ax-bundle.json`,
                    compiledBundle
                  )
                }
                sx={{
                  minHeight: 44,
                  minWidth: 44,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: gold,
                  color: isDark ? '#08080B' : '#FFFFFF',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#6B4F1F' },
                }}
              >
                Download 6-File Bundle (.json)
              </Button>
            </Box>
          </Box>

          {catalogSyncStatus && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: accentBg,
                color: ink,
                border: `1px solid ${accentBorder}`,
                '& .MuiAlert-icon': { color: accent },
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: ink }}>
                {catalogSyncStatus}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left: Structured Contract Inputs */}
            <Grid xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: subtleBg,
                  border: `1px solid ${hairline}`,
                }}
              >
                <Stack spacing={1.75}>
                  <TextField
                    id="ax-compiler-site-name"
                    label="Site / Product Name"
                    size="small"
                    fullWidth
                    value={compilerConfig.siteName}
                    onChange={(e) => setCompilerConfig((c) => ({ ...c, siteName: e.target.value }))}
                    inputProps={{ 'aria-label': 'Site or Product Name' }}
                    sx={inputSx}
                  />
                  <TextField
                    id="ax-compiler-url"
                    label="Canonical HTTPS URL"
                    size="small"
                    fullWidth
                    value={compilerConfig.canonicalUrl}
                    onChange={(e) => setCompilerConfig((c) => ({ ...c, canonicalUrl: e.target.value }))}
                    inputProps={{ 'aria-label': 'Canonical HTTPS URL' }}
                    sx={inputSx}
                  />
                  <TextField
                    id="ax-compiler-tagline"
                    label="Summary / Tagline"
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    value={compilerConfig.tagline}
                    onChange={(e) => setCompilerConfig((c) => ({ ...c, tagline: e.target.value }))}
                    inputProps={{ 'aria-label': 'Summary or Tagline' }}
                    sx={inputSx}
                  />
                  <Grid container spacing={1.5}>
                    <Grid xs={6}>
                      <TextField
                        id="ax-compiler-tools"
                        label="Tool Count"
                        type="number"
                        size="small"
                        fullWidth
                        value={compilerConfig.toolCount}
                        onChange={(e) => setCompilerConfig((c) => ({ ...c, toolCount: Number(e.target.value) || 0 }))}
                        inputProps={{ 'aria-label': 'Tool Count', min: 0 }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        id="ax-compiler-ws"
                        label="Workstation Count"
                        type="number"
                        size="small"
                        fullWidth
                        value={compilerConfig.workstationCount}
                        onChange={(e) => setCompilerConfig((c) => ({ ...c, workstationCount: Number(e.target.value) || 0 }))}
                        inputProps={{ 'aria-label': 'Workstation Count', min: 0 }}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1.5}>
                    <Grid xs={6}>
                      <TextField
                        id="ax-compiler-version"
                        label="Semver Version"
                        size="small"
                        fullWidth
                        value={compilerConfig.version}
                        onChange={(e) => setCompilerConfig((c) => ({ ...c, version: e.target.value }))}
                        inputProps={{ 'aria-label': 'Semver Version' }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        id="ax-compiler-policy"
                        select
                        label="AI Crawler Policy"
                        size="small"
                        fullWidth
                        value={compilerConfig.crawlerPolicy}
                        onChange={(e) => setCompilerConfig((c) => ({ ...c, crawlerPolicy: e.target.value }))}
                        inputProps={{ 'aria-label': 'AI Crawler Policy' }}
                        sx={inputSx}
                      >
                        <MenuItem value="allow-all">Allow All Crawlers + Training</MenuItem>
                        <MenuItem value="search-only">Search &amp; Citation Only</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <TextField
                    id="ax-compiler-creator"
                    label="Creator / Organization"
                    size="small"
                    fullWidth
                    value={compilerConfig.creatorName}
                    onChange={(e) => setCompilerConfig((c) => ({ ...c, creatorName: e.target.value }))}
                    inputProps={{ 'aria-label': 'Creator or Organization' }}
                    sx={inputSx}
                  />
                  <TextField
                    id="ax-compiler-email"
                    label="Contact Email"
                    size="small"
                    fullWidth
                    value={compilerConfig.contactEmail}
                    onChange={(e) => setCompilerConfig((c) => ({ ...c, contactEmail: e.target.value }))}
                    inputProps={{ 'aria-label': 'Contact Email' }}
                    sx={inputSx}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* Right: Live Compiled File Switcher & Preview */}
            <Grid xs={12} md={7}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {compiledBundle.summaries.map((item) => {
                  const selected = selectedBundleFile === item.filename;
                  return (
                    <Button
                      key={item.filename}
                      size="small"
                      variant={selected ? 'contained' : 'outlined'}
                      onClick={() => setSelectedBundleFile(item.filename)}
                      sx={{
                        minHeight: 44,
                        minWidth: 44,
                        px: 1.5,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: selected ? accent : surfaceBg,
                        color: selected ? (isDark ? '#08080B' : '#FFFFFF') : ink,
                        borderColor: selected ? accent : hairline,
                      }}
                    >
                      {item.filename} ({item.grade})
                    </Button>
                  );
                })}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: subtleBg,
                  border: `1px solid ${hairline}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: accent }}>
                      {selectedBundleFile}
                    </Typography>
                    {activeBundleSummary && (
                      <Typography variant="caption" sx={{ fontFamily: mono, color: inkMuted }}>
                        {activeBundleSummary.bytes.toLocaleString()} bytes · ~{activeBundleSummary.estimatedTokens.toLocaleString()} tokens · Grade {activeBundleSummary.grade} ({activeBundleSummary.score}/100)
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={copiedFile ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={() => copyFile(activeBundleContent)}
                      sx={{
                        minHeight: 44,
                        minWidth: 44,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: ink,
                        borderColor: hairline,
                        bgcolor: surfaceBg,
                      }}
                    >
                      {copiedFile ? 'Copied' : 'Copy File'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CodeIcon />}
                      onClick={() => {
                        const baseName = selectedBundleFile.split('/').pop();
                        downloadText(baseName, activeBundleContent);
                      }}
                      sx={{
                        minHeight: 44,
                        minWidth: 44,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: gold,
                        borderColor: hairline,
                        bgcolor: surfaceBg,
                      }}
                    >
                      Download File
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: hairline, mb: 1.5 }} />

                <Box
                  component="pre"
                  data-testid="ax-compiler-preview"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: codeBg,
                    color: ink,
                    border: `1px solid ${hairline}`,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    lineHeight: 1.62,
                    maxHeight: 420,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {activeBundleContent}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
}
