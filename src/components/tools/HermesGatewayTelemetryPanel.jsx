import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  buildOfflineHermesGatewaySnapshot,
  formatHermesTelemetryExports,
  parseOperatorDiagnosticText,
} from '../../utils/hermesGatewayEngine';

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
 * Dual-Theme (Editorial Ivory Light + Obsidian Gold Dark) Hermes Agent Gateway
 * Read-Only Live Observability Panel.
 *
 * Zero destructive actions (no restart button), zero literal home paths,
 * >= 44 px tap targets, WCAG AA >= 4.5:1 opaque badges/chips, 0 px overflow.
 */
export default function HermesGatewayTelemetryPanel({
  headingComponent = 'h3',
  subHeadingComponent = 'h4',
  compact = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B0B10',
        card: '#12121A',
        inset: '#171722',
        ink: '#F5F2EA',
        muted: '#B6B1A4',
        border: 'rgba(212, 175, 55, 0.28)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldChipBg: '#2A220B',
        goldChipBorder: '#9A781A',
        goldBtnBg: '#D4AF37',
        goldBtnInk: '#0B0B10',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        amber: '#FBBF24',
        amberBg: '#2B1F09',
        amberBorder: '#8A6312',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        neutralBg: '#1E1E2B',
        neutralInk: '#E4E0D4',
      };
    }
    return {
      bg: '#FAF8F3',
      card: '#FFFFFF',
      inset: '#F4EFE4',
      ink: '#141417',
      muted: '#4A463D',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#7A5B0C',
      goldChipBg: '#F6EED6',
      goldChipBorder: '#C7A95A',
      goldBtnBg: '#7A5B0C',
      goldBtnInk: '#FFFFFF',
      emerald: '#0B5E38',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      amber: '#7C4A03',
      amberBg: '#FDF2DC',
      amberBorder: '#DFB66A',
      sky: '#0E4F7A',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      neutralBg: '#EFEAE0',
      neutralInk: '#1E1C18',
    };
  }, [isDark]);

  const [snapshot, setSnapshot] = useState(() => buildOfflineHermesGatewaySnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [diagnosticInput, setDiagnosticInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const fetchGatewayStatus = useCallback(async (signal) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/studio/hermes/status', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && typeof data === 'object' && data.schemaVersion) {
        setSnapshot(data);
      } else {
        setSnapshot(buildOfflineHermesGatewaySnapshot());
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setSnapshot(buildOfflineHermesGatewaySnapshot());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGatewayStatus(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchGatewayStatus]);

  const exportsBundle = useMemo(() => formatHermesTelemetryExports(snapshot), [snapshot]);

  const handleCopy = (id, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? '' : prev)), 1800);
  };

  const handleAnalyzeDiagnostic = async () => {
    const trimmed = diagnosticInput.trim();
    if (!trimmed) {
      setAnalysisError('Paste output from `hermes-gateway status` or `systemctl --user show hermes-gateway.service` first.');
      return;
    }
    setAnalysisError('');
    if (snapshot.liveApiReachable) {
      try {
        const resp = await fetch('/api/studio/hermes/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ text: trimmed }),
        });
        if (resp.ok) {
          const parsed = await resp.json();
          setAnalysisResult(parsed);
          return;
        }
      } catch {
        // Fall through cleanly to local in-browser parser
      }
    }
    setAnalysisResult(parseOperatorDiagnosticText(trimmed));
  };

  const isLive = snapshot.mode === 'LIVE_LOOPBACK_TELEMETRY';
  const isActive = Boolean(snapshot.active);
  const statusChip = isActive
    ? { label: 'ACTIVE · READ-ONLY LIVE TELEMETRY', bg: tk.emeraldBg, color: tk.emerald, border: tk.emeraldBorder }
    : isLive
      ? { label: 'OFFLINE · SYSTEMD INACTIVE', bg: tk.amberBg, color: tk.amber, border: tk.amberBorder }
      : { label: 'BROWSER OFFLINE FALLBACK', bg: tk.amberBg, color: tk.amber, border: tk.amberBorder };

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <Paper
      elevation={0}
      data-testid="hermes-gateway-telemetry-panel"
      sx={{
        p: { xs: 1.75, sm: 2.25 },
        mb: compact ? 2 : 2.5,
        borderRadius: 2,
        bgcolor: tk.card,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={statusChip.label}
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.69rem',
                bgcolor: statusChip.bg,
                color: statusChip.color,
                border: `1px solid ${statusChip.border}`,
              }}
            />
            <Chip
              size="small"
              icon={<SecurityIcon sx={{ fontSize: '15px !important', color: `${tk.sky} !important` }} />}
              label="LOOPBACK-ONLY · ZERO SECRETS · NON-DESTRUCTIVE"
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.67rem',
                bgcolor: tk.skyBg,
                color: tk.sky,
                border: `1px solid ${tk.skyBorder}`,
              }}
            />
          </Stack>

          <Typography
            component={headingComponent}
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.1rem', sm: '1.28rem' },
              fontWeight: 700,
              color: tk.ink,
              lineHeight: 1.25,
              overflowWrap: 'anywhere',
            }}
          >
            Hermes Agent Gateway — Live Systemd &amp; Loopback Telemetry
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: '0.84rem',
              color: tk.muted,
              lineHeight: 1.5,
              overflowWrap: 'anywhere',
            }}
          >
            Read-only supervisor view of <code>{snapshot.unit}</code> ({snapshot.gateway?.version || 'version unprobed'}). Discovers ephemeral loopback port dynamically, redacts all host paths to <code>~/</code>, and surfaces reconciled operational advisories without touching the running daemon.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            onClick={() => fetchGatewayStatus()}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
            }}
          >
            {loading ? 'Refreshing…' : 'Refresh Gateway'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleCopy('cli-status', 'hermes-gateway status --json')}
            startIcon={copiedId === 'cli-status' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.ink,
              borderColor: tk.border,
              bgcolor: tk.inset,
              '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
            }}
          >
            {copiedId === 'cli-status' ? 'Copied CLI' : 'Copy CLI'}
          </Button>
        </Stack>
      </Box>

      {/* Core 4-Card Telemetry Grid */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[
          {
            label: 'SYSTEMD UNIT & PID',
            value: snapshot.systemd?.pid ? `PID ${snapshot.systemd.pid}` : (isLive ? 'INACTIVE' : 'UNPROBED'),
            sub: `${snapshot.systemd?.activeState || 'unknown'} (${snapshot.systemd?.subState || 'unknown'}) · ${snapshot.systemd?.tasks ?? '—'} tasks`,
            tone: isActive ? tk.emerald : tk.amber,
          },
          {
            label: 'DISCOVERED LOOPBACK',
            value: snapshot.listener?.port ? `127.0.0.1:${snapshot.listener.port}` : 'None discovered',
            sub: snapshot.socket?.exists
              ? `${snapshot.socket.path} present`
              : `${snapshot.socket?.path || '~/.hermes/gateway.sock'} absent`,
            tone: snapshot.listener?.port ? tk.sky : tk.muted,
          },
          {
            label: 'CGROUP RAM (CUR / PEAK)',
            value: snapshot.systemd?.memoryCurrentGib != null
              ? `${snapshot.systemd.memoryCurrentGib} / ${snapshot.systemd.memoryPeakGib ?? '—'} GiB`
              : '—',
            sub: `Target MemoryHigh 3 GiB / Max 4 GiB${snapshot.gateway?.gatewayRssMb ? ` · RSS ${snapshot.gateway.gatewayRssMb} MiB` : ''}`,
            tone: (snapshot.systemd?.memoryPeakGib ?? 0) >= 3 ? tk.amber : tk.ink,
          },
          {
            label: 'STATE DB & PROFILES',
            value: `${snapshot.gateway?.profileCount ?? 0} profiles`,
            sub: snapshot.storage?.stateDbGib != null
              ? `state.db ${snapshot.storage.stateDbGib} GiB (${snapshot.storage.bloated ? '>= 1 GiB advisory' : 'healthy'})`
              : 'state.db unprobed',
            tone: snapshot.storage?.bloated ? tk.amber : tk.gold,
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: tk.inset,
                border: `1px solid ${tk.borderSoft}`,
                height: '100%',
                minWidth: 0,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.07em' }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.96rem', fontWeight: 800, color: card.tone, mt: 0.4, overflowWrap: 'anywhere' }}>
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: tk.muted, mt: 0.35, overflowWrap: 'anywhere' }}>
                {card.sub}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Multiplexed Profiles Row */}
      <Box
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 1.5,
          bgcolor: tk.inset,
          border: `1px solid ${tk.borderSoft}`,
        }}
      >
        <Typography
          component={subHeadingComponent}
          sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 1, letterSpacing: '0.06em' }}
        >
          MULTIPLEXED GATEWAY PROFILES ({snapshot.gateway?.profileCount ?? 0})
        </Typography>
        {snapshot.gateway?.profiles?.length > 0 ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {snapshot.gateway.profiles.map((prof) => (
              <Chip
                key={prof}
                size="small"
                label={prof}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: tk.goldChipBg,
                  color: tk.gold,
                  border: `1px solid ${tk.goldChipBorder}`,
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: '0.78rem', color: tk.muted }}>
            No active profiles reported yet. Run <code>hermes-gateway list</code> locally or start Zoth Studio on <code>127.0.0.1:3000</code>.
          </Typography>
        )}
      </Box>

      {/* Reconciled Advisories & Upstream Security/UI Checklist */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: tk.inset,
              border: `1px solid ${tk.borderSoft}`,
              height: '100%',
            }}
          >
            <Typography
              component={subHeadingComponent}
              sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink, mb: 1, letterSpacing: '0.06em' }}
            >
              RECONCILED OPERATIONAL ADVISORIES ({snapshot.warnings?.length ?? 0})
            </Typography>
            <Stack spacing={1}>
              {(snapshot.warnings || []).map((w) => {
                const isWarn = w.severity === 'warning';
                return (
                  <Box
                    key={w.code}
                    sx={{
                      p: 1.15,
                      borderRadius: 1.25,
                      bgcolor: isWarn ? tk.amberBg : tk.card,
                      border: `1px solid ${isWarn ? tk.amberBorder : tk.borderSoft}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: isWarn ? tk.amber : tk.sky,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      [{String(w.severity || 'info').toUpperCase()}] {w.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.77rem', color: tk.ink, mt: 0.25, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                      {w.detail}
                    </Typography>
                  </Box>
                );
              })}
              {(!snapshot.warnings || snapshot.warnings.length === 0) && (
                <Typography sx={{ fontSize: '0.78rem', color: tk.emerald }}>
                  All runtime checks reconciled with zero active warnings.
                </Typography>
              )}
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: tk.inset,
              border: `1px solid ${tk.borderSoft}`,
              height: '100%',
            }}
          >
            <Typography
              component={subHeadingComponent}
              sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink, mb: 1, letterSpacing: '0.06em' }}
            >
              UPSTREAM CHECKLIST &amp; RUNBOOK
            </Typography>
            <Stack spacing={0.85} sx={{ mb: 1.25 }}>
              {(snapshot.upstreamAdvisories || []).map((adv) => (
                <Typography key={adv.id} sx={{ fontSize: '0.75rem', color: tk.muted, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                  <Box component="span" sx={{ fontFamily: MONO, fontWeight: 700, color: tk.ink }}>
                    {adv.id}:
                  </Box>{' '}
                  {adv.summary}
                </Typography>
              ))}
            </Stack>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.71rem', color: tk.gold, overflowWrap: 'anywhere' }}>
              Runbook (opt-in maintenance window): {snapshot.maintenanceRunbookPath}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Safe Export & Offline Diagnostic Analyzer Bar */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Button
          variant="outlined"
          onClick={() => downloadTextFile(`hermes-gateway-telemetry-${stamp}.json`, exportsBundle.json, 'application/json;charset=utf-8')}
          startIcon={<DownloadIcon />}
          sx={{
            minHeight: 44,
            fontFamily: MONO,
            fontSize: '0.73rem',
            fontWeight: 700,
            textTransform: 'none',
            color: tk.ink,
            borderColor: tk.border,
            bgcolor: tk.inset,
            '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
          }}
        >
          Export JSON
        </Button>
        <Button
          variant="outlined"
          onClick={() => downloadTextFile(`hermes-gateway-brief-${stamp}.md`, exportsBundle.markdown, 'text/markdown;charset=utf-8')}
          startIcon={<DownloadIcon />}
          sx={{
            minHeight: 44,
            fontFamily: MONO,
            fontSize: '0.73rem',
            fontWeight: 700,
            textTransform: 'none',
            color: tk.ink,
            borderColor: tk.border,
            bgcolor: tk.inset,
            '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
          }}
        >
          Export Markdown
        </Button>
        <Button
          variant="outlined"
          onClick={() => downloadTextFile(`hermes-gateway-telemetry-${stamp}.csv`, exportsBundle.csv, 'text/csv;charset=utf-8')}
          startIcon={<DownloadIcon />}
          sx={{
            minHeight: 44,
            fontFamily: MONO,
            fontSize: '0.73rem',
            fontWeight: 700,
            textTransform: 'none',
            color: tk.ink,
            borderColor: tk.border,
            bgcolor: tk.inset,
            '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
          }}
        >
          Export CSV
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowAnalyzer((prev) => !prev)}
          startIcon={<TerminalIcon />}
          endIcon={showAnalyzer ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            minHeight: 44,
            fontFamily: MONO,
            fontSize: '0.73rem',
            fontWeight: 700,
            textTransform: 'none',
            color: tk.gold,
            borderColor: tk.goldChipBorder,
            bgcolor: tk.goldChipBg,
            '&:hover': { borderColor: tk.gold },
          }}
        >
          Offline Diagnostic Parser
        </Button>
      </Stack>

      <Collapse in={showAnalyzer}>
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: tk.inset,
            border: `1px solid ${tk.borderSoft}`,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: tk.muted, mb: 1 }}>
            Paste output from <code>hermes gateway status</code> or <code>systemctl --user show hermes-gateway.service</code> to parse health, strip literal home paths/secrets, and synthesize opt-in maintenance commands.
          </Typography>
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            value={diagnosticInput}
            onChange={(e) => setDiagnosticInput(e.target.value)}
            placeholder={'ActiveState=active\nMainPID=1525\nMemoryCurrent=1537503232\nMemoryPeak=3868889088\nstate.db is large (2.2 GB)'}
            inputProps={{
              'aria-label': 'Hermes gateway diagnostic output input',
              style: { fontFamily: MONO, fontSize: '0.78rem', color: tk.ink },
            }}
            sx={{
              mb: 1.25,
              bgcolor: tk.card,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: tk.border },
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              onClick={handleAnalyzeDiagnostic}
              sx={{
                minHeight: 44,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: tk.goldBtnBg,
                color: tk.goldBtnInk,
              }}
            >
              Analyze Sanitized Output
            </Button>
            {analysisResult && (
              <Button
                variant="outlined"
                onClick={() => handleCopy('analysis-json', JSON.stringify(analysisResult, null, 2))}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: tk.ink,
                  borderColor: tk.border,
                }}
              >
                {copiedId === 'analysis-json' ? 'Copied Analysis' : 'Copy Analysis JSON'}
              </Button>
            )}
          </Stack>
          {analysisError && (
            <Alert severity="warning" sx={{ mt: 1.25, fontSize: '0.78rem' }}>
              {analysisError}
            </Alert>
          )}
          {analysisResult?.snapshot && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: 1.25,
                bgcolor: tk.card,
                border: `1px solid ${tk.borderSoft}`,
                fontFamily: MONO,
                fontSize: '0.74rem',
                color: tk.ink,
                overflowWrap: 'anywhere',
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.emerald, mb: 0.5 }}>
                Parsed: {analysisResult.snapshot.reconciledHealth} · PID {analysisResult.snapshot.systemd?.pid ?? 'n/a'} · Port {analysisResult.snapshot.listener?.port ?? 'n/a'} · {analysisResult.snapshot.warnings?.length ?? 0} advisory item(s)
              </Typography>
              {analysisResult.recommendedMaintenance?.length > 0 && (
                <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                  {analysisResult.recommendedMaintenance.join('\n')}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
