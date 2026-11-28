import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  buildOfflineKonsoleRelaySnapshot,
  KONSOLE_RELAY_CLI_PRESETS,
} from '../../utils/konsoleRelayEngine';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";

/**
 * Dual-Theme (Editorial Ivory Light + Obsidian Gold Dark) Konsole Relay
 * (:8797 / konsole-relay.service) Strictly Read-Only Telemetry Card.
 *
 * Zero destructive actions (no restart button, no POST /send), zero token reads,
 * zero literal home paths, >= 44 px tap targets, WCAG AA >= 4.5:1 contrast.
 */
export default function KonsoleRelayTelemetryPanel({
  headingComponent = 'h3',
  subHeadingComponent = 'h4',
  compact = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
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
      };
    }
    return {
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
    };
  }, [isDark]);

  const [snapshot, setSnapshot] = useState(() => buildOfflineKonsoleRelaySnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [showRunbook, setShowRunbook] = useState(false);

  const fetchStatus = useCallback(async (signal, refresh = false) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/studio/konsole-relay${refresh ? '?refresh=1' : ''}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && typeof data === 'object' && data.schemaVersion) {
        setSnapshot(data);
      } else {
        setSnapshot(buildOfflineKonsoleRelaySnapshot());
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setSnapshot(buildOfflineKonsoleRelaySnapshot());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctl = new AbortController();
    fetchStatus(ctl.signal, false);
    return () => ctl.abort();
  }, [fetchStatus]);

  const handleCopy = useCallback(async (id, text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? '' : prev)), 1800);
    } catch {}
  }, []);

  const isLive = snapshot.mode === 'loopback-live';
  const active = Boolean(snapshot.active);
  const bindText = snapshot.listener?.host
    ? `${snapshot.listener.host}:${snapshot.listener.port}`
    : `127.0.0.1:${snapshot.port || 8797} (unprobed)`;
  const ramText = snapshot.systemd?.memoryCurrentMb != null
    ? `${snapshot.systemd.memoryCurrentMb} MiB (peak ${snapshot.systemd.memoryPeakMb ?? '—'} MiB)`
    : '—';
  const permSummary = `${snapshot.permissions?.confDir?.mode || '—'} / ${snapshot.permissions?.tokenFile?.mode || '—'} / ${snapshot.permissions?.auditFile?.mode || '—'}`;
  const posture = snapshot.posture || { score: 0, grade: '—', advisories: [] };
  const presets = Array.isArray(snapshot.cliPresets) && snapshot.cliPresets.length > 0
    ? snapshot.cliPresets
    : KONSOLE_RELAY_CLI_PRESETS;
  const steps = snapshot.maintenanceChecklist?.steps || [];

  return (
    <Paper
      elevation={0}
      data-testid="konsole-relay-telemetry-panel"
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: compact ? 0 : 2.5,
        borderRadius: 2,
        bgcolor: tk.card,
        border: `1px solid ${tk.border}`,
        minWidth: 0,
      }}
    >
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.75,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            <TerminalIcon sx={{ fontSize: 20, color: tk.gold }} />
            <Typography
              component={headingComponent}
              sx={{
                fontFamily: DISPLAY,
                fontSize: { xs: '1rem', sm: '1.12rem' },
                fontWeight: 800,
                color: tk.ink,
                letterSpacing: '-0.01em',
              }}
            >
              Konsole Relay · KDE D-Bus Daemon (:8797)
            </Typography>
            <Chip
              size="small"
              label={active ? `ACTIVE · PID ${snapshot.systemd?.pid ?? '—'}` : (isLive ? 'INACTIVE' : 'OFFLINE FALLBACK')}
              sx={{
                fontFamily: MONO,
                fontSize: '0.68rem',
                fontWeight: 800,
                bgcolor: active ? tk.emeraldBg : tk.amberBg,
                color: active ? tk.emerald : tk.amber,
                border: `1px solid ${active ? tk.emeraldBorder : tk.amberBorder}`,
              }}
            />
            <Chip
              size="small"
              label={snapshot.listener?.loopbackOnly ? 'LOOPBACK-ONLY 127.0.0.1' : 'UNPROBED'}
              sx={{
                fontFamily: MONO,
                fontSize: '0.67rem',
                fontWeight: 700,
                bgcolor: tk.skyBg,
                color: tk.sky,
                border: `1px solid ${tk.skyBorder}`,
              }}
            />
            <Chip
              size="small"
              icon={<SecurityIcon sx={{ fontSize: 14, color: `${tk.emerald} !important` }} />}
              label={snapshot.backupExcluded ? 'CLOUD BACKUP EXCLUDED' : 'BACKUP LEAK RISK'}
              sx={{
                fontFamily: MONO,
                fontSize: '0.67rem',
                fontWeight: 700,
                bgcolor: snapshot.backupExcluded ? tk.emeraldBg : tk.amberBg,
                color: snapshot.backupExcluded ? tk.emerald : tk.amber,
                border: `1px solid ${snapshot.backupExcluded ? tk.emeraldBorder : tk.amberBorder}`,
              }}
            />
          </Stack>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: tk.muted }}>
            Read-only systemd + /health + stat-only posture for {snapshot.unit || 'konsole-relay.service'} · zero token reads · zero POST /send
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            onClick={() => handleCopy('kr-status', 'konsole-relay status --json')}
            startIcon={copiedId === 'kr-status' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.ink,
              borderColor: tk.border,
              bgcolor: tk.inset,
              '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
            }}
          >
            {copiedId === 'kr-status' ? 'Copied CLI' : 'Copy Status CLI'}
          </Button>
          <Button
            variant="contained"
            onClick={() => fetchStatus(undefined, true)}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              '&:hover': { opacity: 0.92, bgcolor: tk.goldBtnBg },
            }}
          >
            {loading ? 'Probing...' : 'Refresh Relay'}
          </Button>
        </Stack>
      </Box>

      {/* 4-Column Metric Strip */}
      <Grid container spacing={1.25} sx={{ mb: 1.75 }}>
        {[
          { label: 'LOOPBACK BIND', value: bindText, tone: snapshot.listener?.loopbackOnly ? tk.sky : tk.muted },
          { label: 'KONSOLE SESSIONS', value: snapshot.konsoleSessions != null ? `${snapshot.konsoleSessions} live D-Bus` : '—', tone: tk.emerald },
          { label: 'CGROUP RAM', value: ramText, tone: tk.ink },
          { label: 'MODES (CONF / TOK / LOG)', value: `${permSummary} · Posture ${posture.score}/100 (${posture.grade})`, tone: posture.score >= 80 ? tk.emerald : tk.amber },
        ].map((m) => (
          <Grid item xs={12} sm={6} lg={3} key={m.label}>
            <Box sx={{ p: 1.25, height: '100%', borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.65rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.07em' }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 800, color: m.tone, mt: 0.35, overflowWrap: 'anywhere' }}>
                {m.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Safe Read-Only CLI Presets & Optional Maintenance-Window Runbook */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {presets.slice(0, 3).map((p) => (
            <Button
              key={p.id}
              size="small"
              variant="outlined"
              onClick={() => handleCopy(`kr-${p.id}`, p.command)}
              startIcon={copiedId === `kr-${p.id}` ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
              sx={{
                minHeight: 44,
                px: 1.25,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: tk.ink,
                borderColor: tk.borderSoft,
                bgcolor: tk.inset,
                '&:hover': { borderColor: tk.gold, bgcolor: tk.goldChipBg },
              }}
            >
              {copiedId === `kr-${p.id}` ? `Copied ${p.id}` : p.command}
            </Button>
          ))}
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => setShowRunbook((v) => !v)}
          endIcon={showRunbook ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            minHeight: 44,
            px: 1.25,
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            color: tk.gold,
          }}
        >
          {showRunbook ? 'Hide Maintenance Runbook' : `Maintenance Cutover Runbook (${steps.length} steps)`}
        </Button>
      </Box>

      {(posture.advisories || []).length > 0 && (
        <Stack spacing={0.75} sx={{ mt: 1.25 }}>
          {posture.advisories.map((adv) => {
            const isWarn = adv.severity === 'warning';
            return (
              <Box
                key={adv.code}
                sx={{
                  p: 1.15,
                  borderRadius: 1.25,
                  bgcolor: isWarn ? tk.amberBg : tk.inset,
                  border: `1px solid ${isWarn ? tk.amberBorder : tk.borderSoft}`,
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: isWarn ? tk.amber : tk.sky }}>
                  [{String(adv.severity || 'info').toUpperCase()}] {adv.title}
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: tk.ink, mt: 0.25, lineHeight: 1.45 }}>
                  {adv.detail}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}

      <Collapse in={showRunbook}>
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
          <Typography
            component={subHeadingComponent}
            sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink, mb: 1 }}
          >
            OPT-IN MAINTENANCE WINDOW CUTOVER, TOKEN ROTATION &amp; CLOUD PURGE
          </Typography>
          <Stack spacing={0.85}>
            {steps.map((s) => (
              <Box
                key={s.step}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: tk.card,
                  border: `1px solid ${tk.borderSoft}`,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted }}>
                    {s.step}. {s.title}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink, overflowWrap: 'anywhere' }}>
                    {s.command}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleCopy(`step-${s.step}`, s.command)}
                  sx={{
                    minHeight: 44,
                    px: 1.25,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.ink,
                    borderColor: tk.border,
                  }}
                >
                  {copiedId === `step-${s.step}` ? 'Copied' : 'Copy'}
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
