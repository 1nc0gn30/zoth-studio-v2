import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  DEFAULT_REPO_NETLIFY_TOML,
  DEFAULT_SIMULATOR_PATHS,
  NETLIFY_AX_PRESETS,
  NETLIFY_AX_SCHEMA_VERSION,
  auditNetlifyConfig,
  buildOfflineNetlifyAxSnapshot,
  formatNetlifyAxExports,
  parseHeadersFile,
  parseNetlifyToml,
  parseRedirectsFile,
  simulateNetlifyRequest,
  synthesizeHardenedConfigs,
  synthesizeNetlifyCliPlaybook,
} from '../../utils/netlifyAxEngine';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Zoth Netlify AX & Serverless Edge Console (v2.4.0)
 * Pure-MUI Dual-Theme Workstation (Editorial Ivory Light + Obsidian Gold Dark).
 *
 * Unifies strictly read-only loopback repo inspection (GET /api/studio/netlify-ax),
 * deterministic netlify.toml / _redirects / _headers parsing & 14-point guardrail auditing,
 * Edge & Serverless request router simulation, copy-only safe Netlify CLI playbooks
 * (zero credential reads, zero live remote mutations), and formula-safe exports.
 */
export default function NetlifyAxConsoleGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B0D12',
        card: '#12151E',
        inset: '#171B26',
        ink: '#F5F2EA',
        muted: '#B4BAC6',
        border: 'rgba(212, 175, 55, 0.28)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldBg: '#2A220B',
        goldBorder: '#9A781A',
        goldBtnBg: '#D4AF37',
        goldBtnInk: '#0B0D12',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        amber: '#FBBF24',
        amberBg: '#2B1F09',
        amberBorder: '#8A6312',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        red: '#FCA5A5',
        redBg: '#301417',
        redBorder: '#8F2B34',
        codeBg: '#0E1118',
      };
    }
    return {
      bg: '#FAF8F3',
      card: '#FFFFFF',
      inset: '#F4EFE4',
      ink: '#101828',
      muted: '#475467',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#6E4D00',
      goldBg: '#F6EED6',
      goldBorder: '#C7A95A',
      goldBtnBg: '#6E4D00',
      goldBtnInk: '#FFFFFF',
      emerald: '#0A5834',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      amber: '#7A4700',
      amberBg: '#FDF2DC',
      amberBorder: '#DFB66A',
      sky: '#0C4A73',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      red: '#991B1B',
      redBg: '#FEF2F2',
      redBorder: '#F3B4B4',
      codeBg: '#F4EFE4',
    };
  }, [isDark]);

  const [activeTab, setActiveTab] = useState(0);
  const [snapshot, setSnapshot] = useState(() => buildOfflineNetlifyAxSnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Tab 0: Editable config & preset switcher
  const [presetId, setPresetId] = useState('repo-production');
  const [tomlText, setTomlText] = useState(DEFAULT_REPO_NETLIFY_TOML);
  const [redirectsText, setRedirectsText] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [serverAuditReceipt, setServerAuditReceipt] = useState(null);
  const [serverAuditError, setServerAuditError] = useState('');

  // Tab 1: Request Router Simulator
  const [probePath, setProbePath] = useState('/api/edge/telemetry');

  // Tab 3: Copy-only CLI & Hardened Template Customizer
  const [cliSiteName, setCliSiteName] = useState('zoth-studio-v2');
  const [cliEnvKey, setCliEnvKey] = useState('NODE_VERSION');
  const [cliEnvValue, setCliEnvValue] = useState('20');
  const [templateDomain, setTemplateDomain] = useState('zoth.nullai.tech');
  const [templatePublishDir, setTemplatePublishDir] = useState('dist');

  const fetchLiveInspector = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh ? '/api/studio/netlify-ax?refresh=1' : '/api/studio/netlify-ax';
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && data.ok && data.config) {
        setSnapshot(data);
        setPresetId('repo-production');
        setTomlText(data.config.toml || DEFAULT_REPO_NETLIFY_TOML);
        setRedirectsText(data.config.redirects || '');
        setHeadersText(data.config.headers || '');
      }
    } catch {
      setSnapshot((prev) => (prev.mode === 'LIVE_LOOPBACK' ? prev : buildOfflineNetlifyAxSnapshot()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveInspector(false);
  }, [fetchLiveInspector]);

  const applyPreset = useCallback(
    (id) => {
      setPresetId(id);
      setServerAuditReceipt(null);
      setServerAuditError('');
      if (id === 'repo-production' && snapshot?.config?.toml) {
        setTomlText(snapshot.config.toml);
        setRedirectsText(snapshot.config.redirects || '');
        setHeadersText(snapshot.config.headers || '');
        return;
      }
      const preset = NETLIFY_AX_PRESETS.find((p) => p.id === id);
      if (preset) {
        setTomlText(preset.toml);
        setRedirectsText(preset.redirects || '');
        setHeadersText(preset.headers || '');
      }
    },
    [snapshot],
  );

  const liveAudit = useMemo(() => {
    return auditNetlifyConfig({
      toml: tomlText,
      redirects: redirectsText,
      headers: headersText,
      repoContext:
        presetId === 'repo-production'
          ? { discoveryFiles: snapshot.discoveryFiles, distSummary: snapshot.distSummary }
          : null,
    });
  }, [tomlText, redirectsText, headersText, presetId, snapshot.discoveryFiles, snapshot.distSummary]);

  const parsedToml = useMemo(() => parseNetlifyToml(tomlText), [tomlText]);
  const parsedRedirects = useMemo(() => parseRedirectsFile(redirectsText), [redirectsText]);
  const parsedHeaders = useMemo(() => parseHeadersFile(headersText), [headersText]);

  const simulation = useMemo(() => {
    return simulateNetlifyRequest({
      path: probePath,
      parsedToml,
      parsedRedirects,
      parsedHeaders,
      edgeFunctionsManifest: snapshot.edgeFunctions,
      serverlessManifest: snapshot.serverlessFunctions,
    });
  }, [probePath, parsedToml, parsedRedirects, parsedHeaders, snapshot.edgeFunctions, snapshot.serverlessFunctions]);

  const cliPlaybook = useMemo(() => {
    return synthesizeNetlifyCliPlaybook({
      siteName: cliSiteName,
      envKey: cliEnvKey,
      envValue: cliEnvValue,
      functionName: snapshot.serverlessFunctions?.[0]?.name || 'studio-api',
    });
  }, [cliSiteName, cliEnvKey, cliEnvValue, snapshot.serverlessFunctions]);

  const hardenedConfigs = useMemo(() => {
    return synthesizeHardenedConfigs({
      publishDir: templatePublishDir,
      buildCommand: 'npm run build',
      nodeVersion: cliEnvValue || '20',
      domain: templateDomain,
    });
  }, [templatePublishDir, cliEnvValue, templateDomain]);

  const exportsBundle = useMemo(() => {
    return formatNetlifyAxExports({
      snapshot,
      audit: liveAudit,
      simulation,
      tomlText,
    });
  }, [snapshot, liveAudit, simulation, tomlText]);

  const handleServerAuditVerify = useCallback(async () => {
    setServerAuditError('');
    try {
      const resp = await fetch('/api/studio/netlify-ax/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toml: tomlText,
          redirects: redirectsText,
          headers: headersText,
          probePath,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        setServerAuditError(data?.error || `HTTP ${resp.status}`);
        return;
      }
      setServerAuditReceipt({
        score: data.audit?.summary?.score ?? 0,
        grade: data.audit?.summary?.grade || 'N/A',
        receiptSha256: data.audit?.receiptSha256 || '',
        simResolution: data.simulation?.resolutionType || '',
      });
    } catch {
      setServerAuditError('Loopback :3000 POST /api/studio/netlify-ax/audit unreachable (browser engine remains active).');
    }
  }, [tomlText, redirectsText, headersText, probePath]);

  const handleCopy = useCallback(async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((curr) => (curr === id ? '' : curr)), 1800);
  }, []);

  const statusTone = useCallback(
    (status) => {
      if (status === 'PASS') return { fg: tk.emerald, bg: tk.emeraldBg, border: tk.emeraldBorder };
      if (status === 'WARN') return { fg: tk.amber, bg: tk.amberBg, border: tk.amberBorder };
      return { fg: tk.red, bg: tk.redBg, border: tk.redBorder };
    },
    [tk],
  );

  const isLive = snapshot.mode === 'LIVE_LOOPBACK';
  const summary = liveAudit.summary;

  return (
    <Box
      sx={{
        bgcolor: tk.bg,
        color: tk.ink,
        borderRadius: 2.5,
        border: `1px solid ${tk.border}`,
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {/* Top Status & Refresh Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: `1px solid ${tk.borderSoft}`,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Chip
              size="small"
              icon={<CloudQueueIcon sx={{ color: `${isLive ? tk.emerald : tk.amber} !important`, fontSize: 16 }} />}
              label={isLive ? 'LIVE_LOOPBACK · READ-ONLY REPO INSPECTOR' : 'BROWSER_OFFLINE_FALLBACK · CURATED SNAPSHOT'}
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isLive ? tk.emeraldBg : tk.amberBg,
                color: isLive ? tk.emerald : tk.amber,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.amberBorder}`,
                height: 28,
              }}
            />
            <Chip
              size="small"
              label={`SCHEMA v${NETLIFY_AX_SCHEMA_VERSION}`}
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: tk.goldBg,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
                height: 28,
              }}
            />
            <Chip
              size="small"
              label={
                snapshot.netlifyCli?.installed && snapshot.netlifyCli?.version
                  ? `CLI ${snapshot.netlifyCli.version.split(' ')[0]}`
                  : 'CLI COPY-ONLY'
              }
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: tk.skyBg,
                color: tk.sky,
                border: `1px solid ${tk.skyBorder}`,
                height: 28,
              }}
            />
          </Box>
          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              color: tk.ink,
              lineHeight: 1.25,
            }}
          >
            Zoth Netlify AX &amp; Serverless Edge Console
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: tk.muted, mt: 0.35 }}>
            Deterministic <code>netlify.toml</code> / <code>_redirects</code> / <code>_headers</code> linter, Edge &amp; Serverless request router simulator, 14-point pre-deploy guardrail auditor, and copy-only safe CLI playbooks. Zero credential reads and zero live remote deploys.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            disabled={loading}
            onClick={() => fetchLiveInspector(true)}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
            }}
          >
            {loading ? 'Inspecting...' : 'Refresh Inspector'}
          </Button>
        </Box>
      </Box>

      {/* Honest Offline Banner when static */}
      {!isLive && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor: tk.amberBg,
            color: tk.amber,
            border: `1px solid ${tk.amberBorder}`,
            '& .MuiAlert-icon': { color: tk.amber },
          }}
        >
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tk.ink }}>
            {snapshot.offlineNotice}
          </Typography>
        </Alert>
      )}

      {/* KPI Strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          {
            label: 'GUARDRAIL SCORE (14-PT)',
            value: `${summary.score} / 100 (${summary.grade})`,
            sub: `${summary.passCount} PASS · ${summary.warnCount} WARN · ${summary.failCount} FAIL`,
            accent: summary.failCount > 0 ? tk.red : summary.warnCount > 0 ? tk.amber : tk.emerald,
          },
          {
            label: 'REDIRECT GRAPH SAFETY',
            value: liveAudit.redirectAnalysis.clean ? '0 Loops / Shadows' : `${liveAudit.redirectAnalysis.cycles.length + liveAudit.redirectAnalysis.selfRedirects.length} Loops`,
            sub: `${summary.redirectCount} rules · ${liveAudit.redirectAnalysis.shadowedRules.length} shadowed · SPA ${liveAudit.redirectAnalysis.hasSpaFallback ? 'OK' : 'Missing'}`,
            accent: liveAudit.redirectAnalysis.clean ? tk.emerald : tk.red,
          },
          {
            label: 'EDGE & SERVERLESS MANIFEST',
            value: `${snapshot.edgeFunctions?.length ?? 0} Edge · ${snapshot.serverlessFunctions?.length ?? 0} Fn`,
            sub: `${summary.edgeFunctionRouteCount} [[edge_functions]] · ${summary.headerBlockCount} [[headers]] blocks`,
            accent: tk.sky,
          },
          {
            label: 'STATIC DIST & SECURITY',
            value: `${snapshot.distSummary?.htmlRouteCount ?? 0} HTML routes`,
            sub: `${snapshot.distSummary?.fileCount ?? 0} files (${snapshot.distSummary?.totalMiB ?? 0} MiB) · ${summary.secretFindingsCount} secret hits`,
            accent: summary.secretFindingsCount > 0 ? tk.red : tk.gold,
          },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.label}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                height: '100%',
                bgcolor: tk.card,
                border: `1px solid ${tk.borderSoft}`,
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.06em' }}>
                {kpi.label}
              </Typography>
              <Typography sx={{ fontFamily: DISPLAY, fontSize: '1.3rem', fontWeight: 700, color: kpi.accent, mt: 0.4 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.muted, mt: 0.35 }}>
                {kpi.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 4 Clean Non-Clipping Tabs (>= 44px Tap Targets, Wrapping Safely on All Viewports) */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: tk.card,
          border: `1px solid ${tk.borderSoft}`,
          borderRadius: 2,
          mb: 2.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Netlify AX Console sections"
          sx={{
            px: 1,
            borderBottom: `1px solid ${tk.borderSoft}`,
            '& .MuiTabs-flexContainer': {
              flexWrap: 'wrap',
              gap: 0.5,
            },
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 48,
              px: 1.75,
              my: 0.5,
              borderRadius: 1.5,
              fontFamily: MONO,
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.muted,
              border: '1px solid transparent',
              '&.Mui-selected': {
                color: tk.gold,
                bgcolor: tk.goldBg,
                borderColor: tk.goldBorder,
              },
            },
          }}
        >
          <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Config & Guardrails (${summary.score})`} />
          <Tab icon={<AltRouteIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Redirects & Simulator (${summary.redirectCount})`} />
          <Tab icon={<CloudQueueIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Edge & Serverless" />
          <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="CLI & Exports" />
        </Tabs>

        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          {/* TAB 0: CONFIG & 14-POINT GUARDRAILS */}
          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {NETLIFY_AX_PRESETS.map((preset) => {
                    const active = presetId === preset.id;
                    return (
                      <Button
                        key={preset.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => applyPreset(preset.id)}
                        sx={{
                          minHeight: 44,
                          px: 1.75,
                          fontFamily: MONO,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: active ? tk.goldBtnBg : 'transparent',
                          color: active ? tk.goldBtnInk : tk.ink,
                          borderColor: active ? tk.goldBtnBg : tk.border,
                          '&:hover': {
                            bgcolor: active ? tk.goldBtnBg : tk.inset,
                            borderColor: tk.gold,
                          },
                        }}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </Box>

                {isLive && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleServerAuditVerify}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: tk.emerald,
                      borderColor: tk.emeraldBorder,
                      bgcolor: tk.emeraldBg,
                      '&:hover': { bgcolor: tk.emeraldBg, opacity: 0.9 },
                    }}
                  >
                    Verify via :3000 Audit API
                  </Button>
                )}
              </Box>

              {serverAuditReceipt && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    bgcolor: tk.emeraldBg,
                    color: tk.emerald,
                    border: `1px solid ${tk.emeraldBorder}`,
                    '& .MuiAlert-icon': { color: tk.emerald },
                  }}
                >
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.ink }}>
                    POST /api/studio/netlify-ax/audit verified · Score {serverAuditReceipt.score}/100 ({serverAuditReceipt.grade}) · Route {serverAuditReceipt.simResolution} · SHA-256: {serverAuditReceipt.receiptSha256.slice(0, 16)}…
                  </Typography>
                </Alert>
              )}
              {serverAuditError && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    bgcolor: tk.amberBg,
                    color: tk.amber,
                    border: `1px solid ${tk.amberBorder}`,
                    '& .MuiAlert-icon': { color: tk.amber },
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem', color: tk.ink }}>{serverAuditError}</Typography>
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={2}>
                    <TextField
                      id="netlify-ax-toml-editor"
                      label="netlify.toml Configuration (Live Linter)"
                      multiline
                      minRows={14}
                      maxRows={22}
                      fullWidth
                      value={tomlText}
                      onChange={(e) => {
                        setPresetId('custom');
                        setTomlText(e.target.value);
                      }}
                      inputProps={{ 'aria-label': 'netlify.toml configuration editor', spellCheck: false }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: MONO,
                          fontSize: '0.78rem',
                          lineHeight: 1.55,
                          bgcolor: tk.codeBg,
                          color: tk.ink,
                        },
                        '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                      }}
                    />

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          id="netlify-ax-redirects-editor"
                          label="Optional _redirects File Rules"
                          placeholder="/old-path /new-path 301"
                          multiline
                          minRows={4}
                          maxRows={8}
                          fullWidth
                          value={redirectsText}
                          onChange={(e) => {
                            setPresetId('custom');
                            setRedirectsText(e.target.value);
                          }}
                          inputProps={{ 'aria-label': 'Optional _redirects file rules', spellCheck: false }}
                          sx={{
                            '& .MuiInputBase-root': {
                              fontFamily: MONO,
                              fontSize: '0.76rem',
                              bgcolor: tk.codeBg,
                              color: tk.ink,
                            },
                            '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          id="netlify-ax-headers-editor"
                          label="Optional _headers File Rules"
                          placeholder="/*\n  X-Frame-Options: SAMEORIGIN"
                          multiline
                          minRows={4}
                          maxRows={8}
                          fullWidth
                          value={headersText}
                          onChange={(e) => {
                            setPresetId('custom');
                            setHeadersText(e.target.value);
                          }}
                          inputProps={{ 'aria-label': 'Optional _headers file rules', spellCheck: false }}
                          sx={{
                            '& .MuiInputBase-root': {
                              fontFamily: MONO,
                              fontSize: '0.76rem',
                              bgcolor: tk.codeBg,
                              color: tk.ink,
                            },
                            '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Typography
                    component="h4"
                    sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}
                  >
                    14-Point Pre-Deployment Production Guardrails
                  </Typography>
                  <Stack spacing={1.1}>
                    {liveAudit.checks.map((chk) => {
                      const st = statusTone(chk.status);
                      return (
                        <Paper
                          key={chk.id}
                          elevation={0}
                          sx={{
                            p: 1.4,
                            bgcolor: tk.inset,
                            border: `1px solid ${chk.status === 'FAIL' ? tk.redBorder : tk.borderSoft}`,
                            borderRadius: 1.75,
                          }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.ink }}>
                              {chk.name}
                            </Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Chip
                                size="small"
                                label={chk.category.toUpperCase()}
                                sx={{
                                  fontFamily: MONO,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: tk.card,
                                  color: tk.muted,
                                  border: `1px solid ${tk.borderSoft}`,
                                  height: 22,
                                }}
                              />
                              <Chip
                                size="small"
                                label={chk.status}
                                sx={{
                                  fontFamily: MONO,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  bgcolor: st.bg,
                                  color: st.fg,
                                  border: `1px solid ${st.border}`,
                                  height: 22,
                                }}
                              />
                            </Stack>
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', color: tk.muted, lineHeight: 1.45 }}>
                            {chk.message}
                          </Typography>
                          {chk.fixPatch && (
                            <Box
                              component="pre"
                              sx={{
                                mt: 0.75,
                                mb: 0,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: tk.codeBg,
                                border: `1px solid ${tk.borderSoft}`,
                                fontFamily: MONO,
                                fontSize: '0.72rem',
                                color: tk.gold,
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {chk.fixPatch}
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 1: REDIRECTS & EDGE ROUTER SIMULATOR */}
          {activeTab === 1 && (
            <Box>
              <Typography
                component="h4"
                sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.02rem', color: tk.ink, mb: 1.25 }}
              >
                Edge &amp; Serverless Request Router Simulator
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
                {DEFAULT_SIMULATOR_PATHS.map((p) => {
                  const active = probePath === p;
                  return (
                    <Button
                      key={p}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setProbePath(p)}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? tk.goldBtnBg : 'transparent',
                        color: active ? tk.goldBtnInk : tk.ink,
                        borderColor: active ? tk.goldBtnBg : tk.border,
                        '&:hover': { bgcolor: active ? tk.goldBtnBg : tk.inset },
                      }}
                    >
                      {p}
                    </Button>
                  );
                })}
              </Box>

              <TextField
                id="netlify-ax-probe-path"
                label="Custom Request Path to Simulate"
                value={probePath}
                onChange={(e) => setProbePath(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ 'aria-label': 'Custom request path to simulate' }}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.inset, color: tk.ink },
                  '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                }}
              />

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.gold, mb: 1 }}>
                      ROUTING DECISION TRACE
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>Resolution Classification</Typography>
                        <Chip
                          size="small"
                          label={simulation.resolutionType}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            bgcolor: simulation.cycleDetected ? tk.redBg : tk.emeraldBg,
                            color: simulation.cycleDetected ? tk.red : tk.emerald,
                            border: `1px solid ${simulation.cycleDetected ? tk.redBorder : tk.emeraldBorder}`,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>Final HTTP Status</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700, color: tk.ink }}>
                          HTTP {simulation.finalStatus}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>Final Target</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700, color: tk.gold }}>
                          {simulation.finalTarget}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>Matched Edge Function(s)</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 700, color: tk.sky }}>
                          {simulation.matchedEdgeFunctions.length > 0
                            ? simulation.matchedEdgeFunctions.map((e) => `${e.function} (${e.pattern})`).join(', ')
                            : 'None'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>Serverless Function Target</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 700, color: tk.ink }}>
                          {simulation.matchedServerlessFunction
                            ? `${simulation.matchedServerlessFunction.name} (${simulation.matchedServerlessFunction.runtime})`
                            : 'None'}
                        </Typography>
                      </Box>
                      {simulation.redirectChain.length > 0 && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${tk.borderSoft}` }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.muted, mb: 0.75 }}>
                            REDIRECT / REWRITE HOPS ({simulation.redirectChain.length})
                          </Typography>
                          {simulation.redirectChain.map((step) => (
                            <Typography key={`${step.hop}-${step.from}`} sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink, mb: 0.4 }}>
                              #{step.hop}: {step.from} → {step.resolvedTarget} [{step.status}{step.force ? '!' : ''}] ({step.source})
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.gold, mb: 1 }}>
                      MERGED RESPONSE HEADERS ({Object.keys(simulation.effectiveHeaders || {}).length})
                    </Typography>
                    {Object.keys(simulation.effectiveHeaders || {}).length === 0 ? (
                      <Typography sx={{ fontSize: '0.82rem', color: tk.muted }}>
                        No [[headers]] or _headers rules matched {simulation.requestPath}.
                      </Typography>
                    ) : (
                      <Stack spacing={0.75}>
                        {Object.entries(simulation.effectiveHeaders).map(([k, info]) => (
                          <Box key={k} sx={{ p: 0.9, borderRadius: 1, bgcolor: tk.codeBg, border: `1px solid ${tk.borderSoft}` }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700, color: tk.gold }}>
                              {k} <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.66rem', color: tk.muted }}>({info.fromBlock})</Typography>
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.ink, wordBreak: 'break-word' }}>
                              {info.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Redirect Graph Diagnostic Summary */}
              <Typography
                component="h4"
                sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.98rem', color: tk.ink, mb: 1 }}
              >
                Parsed Redirect Rules &amp; Cycle / Shadow Diagnostics ({liveAudit.parsed.redirects.length})
              </Typography>
              <Stack spacing={1}>
                {liveAudit.parsed.redirects.map((rule, idx) => {
                  const isShadowed = liveAudit.redirectAnalysis.shadowedRules.some((s) => s.index === idx);
                  const isSelf = liveAudit.redirectAnalysis.selfRedirects.some((s) => s.index === idx);
                  const isBadStatus = liveAudit.redirectAnalysis.invalidStatuses.some((s) => s.index === idx);
                  const flagged = isShadowed || isSelf || isBadStatus;
                  return (
                    <Paper
                      key={`${rule.source}-${rule.line}-${idx}`}
                      elevation={0}
                      sx={{
                        p: 1.25,
                        bgcolor: tk.inset,
                        border: `1px solid ${flagged ? tk.redBorder : tk.borderSoft}`,
                        borderRadius: 1.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.ink }}>
                        <strong>{rule.from}</strong> → <strong>{rule.to}</strong> ({rule.status}{rule.force ? '!' : ''}) · {rule.source}:{rule.line}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          isSelf
                            ? 'SELF-LOOP'
                            : isShadowed
                            ? 'SHADOWED BY /*'
                            : isBadStatus
                            ? 'INVALID STATUS'
                            : 'REACHABLE'
                        }
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: flagged ? tk.redBg : tk.emeraldBg,
                          color: flagged ? tk.red : tk.emerald,
                          border: `1px solid ${flagged ? tk.redBorder : tk.emeraldBorder}`,
                          height: 24,
                        }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* TAB 2: EDGE & SERVERLESS MANIFESTS + DISCOVERY SURFACE */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={6}>
                  <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                    Netlify Edge Functions (Deno)
                  </Typography>
                  <Stack spacing={1.25}>
                    {(snapshot.edgeFunctions || []).map((ef) => (
                      <Paper key={ef.name} elevation={0} sx={{ p: 1.75, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.6 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold }}>
                            {ef.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={ef.runtime}
                            sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, bgcolor: tk.skyBg, color: tk.sky, border: `1px solid ${tk.skyBorder}`, height: 24 }}
                          />
                        </Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, mb: 0.6 }}>
                          {ef.file} · {ef.sizeBytes} B · COOP/COEP: {ef.emitsCoopCoep ? 'Verified' : 'Standard'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: tk.ink, mb: 1 }}>
                          {ef.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {(ef.paths || []).map((p) => (
                            <Button
                              key={p}
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setProbePath(p);
                                setActiveTab(1);
                              }}
                              sx={{
                                minHeight: 44,
                                px: 1.25,
                                fontFamily: MONO,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                color: tk.ink,
                                borderColor: tk.border,
                              }}
                            >
                              Simulate {p}
                            </Button>
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                    Netlify Serverless Functions (Node 20 / esbuild)
                  </Typography>
                  <Stack spacing={1.25}>
                    {(snapshot.serverlessFunctions || []).map((fn) => (
                      <Paper key={fn.name} elevation={0} sx={{ p: 1.75, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.6 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: tk.gold }}>
                            {fn.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={fn.runtime}
                            sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, bgcolor: tk.emeraldBg, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}`, height: 24 }}
                          />
                        </Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, mb: 0.6 }}>
                          {fn.file} · {fn.sizeBytes} B · Proxy: {fn.proxiedFrom || fn.routePrefix}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: tk.ink, mb: 1 }}>
                          {fn.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                          {(fn.endpoints || []).map((ep) => (
                            <Chip
                              key={ep}
                              size="small"
                              label={ep}
                              sx={{ fontFamily: MONO, fontSize: '0.68rem', bgcolor: tk.card, color: tk.ink, border: `1px solid ${tk.borderSoft}`, height: 24 }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Grid>
              </Grid>

              {/* AEO / SEO Discovery Files & Security Boundary */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.96rem', color: tk.ink, mb: 1.25 }}>
                      AEO / SEO Discovery Manifests (public/)
                    </Typography>
                    <Stack spacing={0.85}>
                      {Object.entries(snapshot.discoveryFiles || {}).map(([name, meta]) => (
                        <Box
                          key={name}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1.25,
                            bgcolor: tk.card,
                            border: `1px solid ${tk.borderSoft}`,
                          }}
                        >
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.ink }}>
                            /{name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                              {meta.sizeBytes ? `${meta.sizeBytes.toLocaleString()} B` : '—'}
                            </Typography>
                            <Chip
                              size="small"
                              label={meta.present ? 'PRESENT' : 'MISSING'}
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                bgcolor: meta.present ? tk.emeraldBg : tk.redBg,
                                color: meta.present ? tk.emerald : tk.red,
                                border: `1px solid ${meta.present ? tk.emeraldBorder : tk.redBorder}`,
                                height: 22,
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.96rem', color: tk.ink, mb: 1.25 }}>
                      Read-Only Security Boundary
                    </Typography>
                    <Stack spacing={0.85}>
                      {[
                        'Zero reads of ~/.config/netlify/config.json',
                        'Zero reads of .env* files or NETLIFY_AUTH_TOKEN',
                        'Zero live remote deploys or Netlify API mutations',
                        'Strict loopback Host & Origin 403 enforcement on :3000',
                        'Safe netlify --version check via execFile (<= 1200ms)',
                      ].map((item) => (
                        <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: tk.emerald }} />
                          <Typography sx={{ fontSize: '0.8rem', color: tk.ink }}>{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: COPY-ONLY SAFE CLI, TEMPLATES & EXPORTS */}
          {activeTab === 3 && (
            <Box>
              <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                Safe Copy-Only Netlify CLI Playbook (Zero Auto-Deploy)
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    id="netlify-ax-cli-site"
                    label="Site / Repo Slug"
                    size="small"
                    fullWidth
                    value={cliSiteName}
                    onChange={(e) => setCliSiteName(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.inset, color: tk.ink },
                      '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    id="netlify-ax-cli-env-key"
                    label="Env Var Key"
                    size="small"
                    fullWidth
                    value={cliEnvKey}
                    onChange={(e) => setCliEnvKey(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.inset, color: tk.ink },
                      '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    id="netlify-ax-cli-env-val"
                    label="Env Var Value"
                    size="small"
                    fullWidth
                    value={cliEnvValue}
                    onChange={(e) => setCliEnvValue(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.inset, color: tk.ink },
                      '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {cliPlaybook.commands.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.6 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: tk.ink }}>
                          {item.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={item.safety}
                          sx={{ fontFamily: MONO, fontSize: '0.64rem', fontWeight: 700, bgcolor: tk.card, color: tk.gold, border: `1px solid ${tk.border}`, height: 22 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          p: 1,
                          borderRadius: 1.25,
                          bgcolor: tk.codeBg,
                          border: `1px solid ${tk.borderSoft}`,
                        }}
                      >
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.ink, overflowWrap: 'anywhere' }}>
                          $ {item.command}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={copiedId === item.id ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                          onClick={() => handleCopy(item.id, item.command)}
                          sx={{
                            minHeight: 44,
                            minWidth: 92,
                            fontFamily: MONO,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: tk.gold,
                            borderColor: tk.goldBorder,
                            bgcolor: tk.goldBg,
                            '&:hover': { bgcolor: tk.goldBg, borderColor: tk.gold },
                          }}
                        >
                          {copiedId === item.id ? 'Copied' : 'Copy'}
                        </Button>
                      </Box>
                      <Typography sx={{ fontSize: '0.76rem', color: tk.muted, mt: 0.6 }}>
                        {item.note}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Hardened Config Synthesizer & Formula-Safe Exports */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1 }}>
                  Hardened Config Templates &amp; SHA-256 Verified Exports
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 1.75 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="netlify-ax-template-domain"
                      label="Canonical Domain for Template"
                      size="small"
                      fullWidth
                      value={templateDomain}
                      onChange={(e) => setTemplateDomain(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.card, color: tk.ink },
                        '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="netlify-ax-template-publish"
                      select
                      label="Publish Directory"
                      size="small"
                      fullWidth
                      value={templatePublishDir}
                      onChange={(e) => setTemplatePublishDir(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, bgcolor: tk.card, color: tk.ink },
                        '& .MuiInputLabel-root': { color: tk.muted, fontWeight: 600 },
                      }}
                    >
                      <MenuItem value="dist">dist (Vite / React / Astro)</MenuItem>
                      <MenuItem value="build">build (Create React / Svelte)</MenuItem>
                      <MenuItem value="public">public (Static Site Foundry)</MenuItem>
                      <MenuItem value="out">out (Static Export)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, mb: 1.5, wordBreak: 'break-all' }}>
                  Audit Receipt SHA-256: <strong style={{ color: tk.gold }}>{exportsBundle.receiptSha256}</strong>
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('netlify-ax-audit.json', exportsBundle.json, 'application/json')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', bgcolor: tk.goldBtnBg, color: tk.goldBtnInk }}
                  >
                    Export Audit JSON
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('netlify-ax-audit.md', exportsBundle.markdown, 'text/markdown')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: tk.ink, borderColor: tk.border }}
                  >
                    Export Markdown Dossier
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('netlify-ax-guardrails.csv', exportsBundle.csv, 'text/csv')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: tk.ink, borderColor: tk.border }}
                  >
                    Export Formula-Safe CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('netlify.hardened.toml', hardenedConfigs.toml, 'text/plain')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: tk.emerald, borderColor: tk.emeraldBorder, bgcolor: tk.emeraldBg }}
                  >
                    Download Hardened netlify.toml
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={copiedId === 'hardened-toml' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                    onClick={() => handleCopy('hardened-toml', hardenedConfigs.toml)}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: tk.gold, borderColor: tk.goldBorder, bgcolor: tk.goldBg }}
                  >
                    {copiedId === 'hardened-toml' ? 'Copied Template' : 'Copy Hardened TOML'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
