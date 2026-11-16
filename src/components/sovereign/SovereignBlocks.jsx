/**
 * SovereignBlocks — higher-order application & website layout blocks for @zoth/ui v3.0.
 *
 * Exports (8):
 *   SovereignHeroSection   SovereignFeatureGrid    SovereignDiffViewer
 *   SovereignTimeline      SovereignStepWizard     SovereignFilterBar
 *   SovereignStatComparison SovereignTerminalLog
 *
 * Strictly SSR-safe (zero module-scope window/document) and dual-theme ready.
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Slider,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SOV, rgba, MONO, DISPLAY } from './palette.js';
import { SovereignCard, resolveModeAccent } from './SovereignPrimitives.jsx';
import { useCopy } from './hooks.js';

const SERIF = '"Celtic Garamond", Georgia, "Times New Roman", serif';

function buildActionProps(action) {
  if (!action) return {};
  if (action.href) {
    const isExternal = /^https?:\/\//i.test(action.href);
    return {
      component: 'a',
      href: action.href,
      ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    };
  }
  return { type: 'button', onClick: action.onClick };
}

function computeLineDiff(beforeText = '', afterText = '') {
  const a = String(beforeText).split('\n');
  const b = String(afterText).split('\n');
  const rows = [];

  if (a.length * b.length > 90000) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i += 1) {
      if (i < a.length && i < b.length && a[i] === b[i]) {
        rows.push({ type: 'same', leftNo: i + 1, rightNo: i + 1, text: a[i] });
      } else {
        if (i < a.length) rows.push({ type: 'del', leftNo: i + 1, rightNo: null, text: a[i] });
        if (i < b.length) rows.push({ type: 'add', leftNo: null, rightNo: i + 1, text: b[i] });
      }
    }
    return rows;
  }

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      rows.push({ type: 'same', leftNo: i + 1, rightNo: j + 1, text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'del', leftNo: i + 1, rightNo: null, text: a[i] });
      i += 1;
    } else {
      rows.push({ type: 'add', leftNo: null, rightNo: j + 1, text: b[j] });
      j += 1;
    }
  }
  while (i < m) {
    rows.push({ type: 'del', leftNo: i + 1, rightNo: null, text: a[i] });
    i += 1;
  }
  while (j < n) {
    rows.push({ type: 'add', leftNo: null, rightNo: j + 1, text: b[j] });
    j += 1;
  }
  return rows;
}

const STATUS_MAP = {
  pass: { label: 'PASS', hex: SOV.emerald },
  ok: { label: 'OK', hex: SOV.emerald },
  success: { label: 'SUCCESS', hex: SOV.emerald },
  warn: { label: 'WARN', hex: SOV.amber },
  warning: { label: 'WARN', hex: SOV.amber },
  fail: { label: 'FAIL', hex: SOV.crimson },
  error: { label: 'ERROR', hex: SOV.crimson },
  info: { label: 'INFO', hex: SOV.cyber },
};

/**
 * SovereignHeroSection — Landing / Product hero band with mono eyebrow, highlighted
 * Celtic Garamond headline, dual 44px CTA buttons, and bottom trust bar.
 */
export function SovereignHeroSection({
  eyebrow,
  badge,
  title,
  highlight,
  subtitle,
  primaryAction,
  secondaryAction,
  trustItems = [],
  accent = SOV.gold,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2.5,
        p: { xs: 2.5, md: 3.5 },
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.3) : 'rgba(16, 24, 40, 0.14)'}`,
        backgroundImage: isDark
          ? `radial-gradient(circle at 88% 14%, ${rgba(accent, 0.14)} 0%, transparent 52%)`
          : `radial-gradient(circle at 88% 14%, ${rgba(accent, 0.08)} 0%, transparent 55%)`,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
        {eyebrow && (
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: modeAccent,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        {badge && (
          <Chip
            size="small"
            label={badge}
            sx={{
              fontFamily: MONO,
              fontSize: '0.64rem',
              fontWeight: 700,
              bgcolor: isDark ? rgba(accent, 0.14) : rgba(modeAccent, 0.08),
              color: modeAccent,
              border: `1px solid ${rgba(modeAccent, 0.35)}`,
            }}
          />
        )}
      </Box>

      {(title || highlight) && (
        <Typography
          component="h2"
          sx={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: { xs: '1.65rem', sm: '2.1rem', md: '2.45rem' },
            lineHeight: 1.15,
            color: isDark ? '#F5F1E6' : '#101828',
            mb: 1.25,
          }}
        >
          {title}
          {highlight && (
            <Box component="span" sx={{ color: modeAccent, ml: title ? 1 : 0 }}>
              {highlight}
            </Box>
          )}
        </Typography>
      )}

      {subtitle && (
        <Typography
          sx={{
            color: isDark ? SOV.slate : '#475467',
            fontSize: { xs: '0.92rem', md: '1rem' },
            lineHeight: 1.65,
            maxWidth: '68ch',
            mb: primaryAction || secondaryAction || trustItems.length ? 2.25 : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {(primaryAction || secondaryAction) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: trustItems.length ? 2.5 : 0 }}>
          {primaryAction && (
            <Button
              variant="contained"
              {...buildActionProps(primaryAction)}
              sx={{
                minHeight: 44,
                px: 2.5,
                fontFamily: MONO,
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: modeAccent,
                color: isDark ? '#05060B' : '#FFFFFF',
                '&:hover': { bgcolor: modeAccent, opacity: 0.92 },
              }}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              {...buildActionProps(secondaryAction)}
              sx={{
                minHeight: 44,
                px: 2.25,
                fontFamily: MONO,
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                color: modeAccent,
                borderColor: rgba(modeAccent, 0.45),
                '&:hover': { borderColor: modeAccent, bgcolor: rgba(modeAccent, 0.08) },
              }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}

      {trustItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            pt: 1.75,
            borderTop: `1px solid ${isDark ? rgba(SOV.slate, 0.16) : 'rgba(16, 24, 40, 0.09)'}`,
          }}
        >
          {trustItems.map((item, idx) => {
            const label = typeof item === 'string' ? item : item.label;
            const value = typeof item === 'string' ? null : item.value;
            return (
              <Box
                key={`${label}-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark ? '#070910' : '#F7F4EC',
                  border: `1px solid ${isDark ? rgba(accent, 0.18) : 'rgba(16, 24, 40, 0.08)'}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isDark ? SOV.slate : '#475467',
                  }}
                >
                  {label}
                </Typography>
                {value && (
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: modeAccent,
                    }}
                  >
                    {value}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/**
 * SovereignFeatureGrid — Responsive Bento grid of capability/architecture cards.
 */
export function SovereignFeatureGrid({ items = [], cols = 3, accent = SOV.gold, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const mdSpan = Math.max(3, Math.floor(12 / Math.max(1, cols)));

  return (
    <Grid container spacing={2} sx={sx}>
      {items.map((item, idx) => {
        const idxLabel = item.index || String(idx + 1).padStart(2, '0');
        return (
          <Grid key={`${item.title}-${idx}`} xs={12} sm={6} md={mdSpan}>
            <SovereignCard
              index={idxLabel}
              eyebrow={item.tag}
              title={item.title}
              badge={item.metric}
              accent={item.accent || accent}
              variant="subtle"
              sx={{ height: '100%' }}
            >
              {item.icon && (
                <Typography sx={{ fontSize: '1.25rem', mb: 0.75 }} aria-hidden>
                  {item.icon}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? SOV.slate : '#475467',
                  lineHeight: 1.6,
                  fontSize: '0.86rem',
                }}
              >
                {item.desc}
              </Typography>
              {item.footer && (
                <Typography
                  sx={{
                    mt: 1.25,
                    fontFamily: MONO,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: modeAccent,
                  }}
                >
                  {item.footer}
                </Typography>
              )}
            </SovereignCard>
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * SovereignDiffViewer — Client-side LCS line-by-line comparison pane with Split/Unified
 * toggle, +/- line and byte delta counters, and 1-click transformed output copy.
 */
export function SovereignDiffViewer({
  title = 'ARTIFACT DIFF INSPECTOR',
  beforeLabel = 'ORIGINAL',
  afterLabel = 'TRANSFORMED',
  beforeText = '',
  afterText = '',
  viewMode: initialMode = 'split',
  accent = SOV.emerald,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [mode, setMode] = useState(initialMode);
  const { copied, copy } = useCopy();

  const diffRows = useMemo(() => computeLineDiff(beforeText, afterText), [beforeText, afterText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffRows.forEach((r) => {
      if (r.type === 'add') added += 1;
      else if (r.type === 'del') removed += 1;
    });
    const beforeBytes = new TextEncoder().encode(String(beforeText)).length;
    const afterBytes = new TextEncoder().encode(String(afterText)).length;
    return { added, removed, byteDelta: afterBytes - beforeBytes };
  }, [diffRows, beforeText, afterText]);

  const handleCopyAfter = () => copy(String(afterText));

  const addBg = isDark ? 'rgba(52,211,153,0.12)' : 'rgba(4,120,87,0.10)';
  const delBg = isDark ? 'rgba(239,68,68,0.13)' : 'rgba(185,28,28,0.09)';
  const addCol = isDark ? SOV.emerald : '#047857';
  const delCol = isDark ? SOV.crimson : '#B91C1C';

  const leftRows = useMemo(() => diffRows.filter((r) => r.type !== 'add'), [diffRows]);
  const rightRows = useMemo(() => diffRows.filter((r) => r.type !== 'del'), [diffRows]);

  const renderLineRow = (row, side, key) => {
    const num = side === 'left' ? row.leftNo : side === 'right' ? row.rightNo : row.rightNo ?? row.leftNo;
    const prefix = row.type === 'add' ? '+' : row.type === 'del' ? '-' : ' ';
    const bg = row.type === 'add' ? addBg : row.type === 'del' ? delBg : 'transparent';
    const col = row.type === 'add' ? addCol : row.type === 'del' ? delCol : isDark ? SOV.ink : '#101828';
    return (
      <Box
        key={key}
        sx={{
          display: 'flex',
          gap: 1.25,
          px: 1.25,
          py: 0.3,
          bgcolor: bg,
          fontFamily: MONO,
          fontSize: '0.75rem',
          lineHeight: 1.55,
          color: col,
          whiteSpace: 'pre',
        }}
      >
        <Box
          component="span"
          sx={{
            minWidth: 26,
            textAlign: 'right',
            color: isDark ? SOV.slateDim : '#667085',
            userSelect: 'none',
          }}
        >
          {num ?? ''}
        </Box>
        <Box component="span" sx={{ fontWeight: row.type === 'same' ? 400 : 700, userSelect: 'none' }}>
          {prefix}
        </Box>
        <Box component="span">{row.text || ' '}</Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.28) : 'rgba(16, 24, 40, 0.12)'}`,
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${isDark ? rgba(accent, 0.18) : 'rgba(16, 24, 40, 0.08)'}`,
          bgcolor: isDark ? '#070910' : '#F7F4EC',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: modeAccent,
            }}
          >
            {title}
          </Typography>
          <Chip
            size="small"
            label={`+${stats.added} / -${stats.removed}`}
            sx={{
              fontFamily: MONO,
              fontSize: '0.66rem',
              fontWeight: 700,
              bgcolor: isDark ? rgba(accent, 0.14) : rgba(modeAccent, 0.09),
              color: modeAccent,
            }}
          />
          <Chip
            size="small"
            label={`${stats.byteDelta >= 0 ? '+' : ''}${stats.byteDelta} B`}
            sx={{
              fontFamily: MONO,
              fontSize: '0.66rem',
              fontWeight: 700,
              bgcolor: 'transparent',
              border: `1px solid ${isDark ? rgba(SOV.slate, 0.3) : 'rgba(16,24,40,0.16)'}`,
              color: isDark ? SOV.slate : '#475467',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['split', 'unified'].map((v) => {
            const active = mode === v;
            return (
              <Button
                key={v}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setMode(v)}
                sx={{
                  minHeight: 44,
                  px: 1.5,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  ...(active
                    ? { bgcolor: modeAccent, color: isDark ? '#05060B' : '#FFFFFF' }
                    : { color: modeAccent, borderColor: rgba(modeAccent, 0.4) }),
                }}
              >
                {v}
              </Button>
            );
          })}
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopyAfter}
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'none',
              color: modeAccent,
              borderColor: rgba(modeAccent, 0.4),
            }}
          >
            {copied ? 'Copied' : 'Copy Transformed'}
          </Button>
        </Box>
      </Box>

      {mode === 'split' ? (
        <Grid container>
          <Grid
            xs={12}
            md={6}
            sx={{
              borderRight: { md: `1px solid ${isDark ? rgba(SOV.slate, 0.16) : 'rgba(16, 24, 40, 0.08)'}` },
              borderBottom: { xs: `1px solid ${isDark ? rgba(SOV.slate, 0.16) : 'rgba(16, 24, 40, 0.08)'}`, md: 'none' },
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.65,
                fontFamily: MONO,
                fontSize: '0.66rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: isDark ? SOV.slate : '#475467',
                borderBottom: `1px solid ${isDark ? rgba(SOV.slate, 0.12) : 'rgba(16, 24, 40, 0.06)'}`,
              }}
            >
              {beforeLabel}
            </Box>
            <Box sx={{ maxHeight: 260, overflow: 'auto', py: 0.75 }}>
              {leftRows.map((row, idx) => renderLineRow(row, 'left', `l-${idx}`))}
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box
              sx={{
                px: 1.5,
                py: 0.65,
                fontFamily: MONO,
                fontSize: '0.66rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: modeAccent,
                borderBottom: `1px solid ${isDark ? rgba(SOV.slate, 0.12) : 'rgba(16, 24, 40, 0.06)'}`,
              }}
            >
              {afterLabel}
            </Box>
            <Box sx={{ maxHeight: 260, overflow: 'auto', py: 0.75 }}>
              {rightRows.map((row, idx) => renderLineRow(row, 'right', `r-${idx}`))}
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ maxHeight: 300, overflow: 'auto', py: 0.75 }}>
          {diffRows.map((row, idx) => renderLineRow(row, 'unified', `u-${idx}`))}
        </Box>
      )}
    </Box>
  );
}

/**
 * SovereignTimeline — Chronological step/audit timeline with semantic dots and hairlines.
 */
export function SovereignTimeline({ title = 'EXECUTION & AUDIT TIMELINE', items = [], accent = SOV.cyber, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16, 24, 40, 0.12)'}`,
        borderRadius: 2,
        p: 2,
        ...sx,
      }}
    >
      {title && (
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: modeAccent,
            mb: 1.75,
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ position: 'relative', pl: 2.5 }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 7,
            top: 8,
            bottom: 8,
            width: '1px',
            bgcolor: isDark ? rgba(SOV.slate, 0.24) : 'rgba(16, 24, 40, 0.14)',
          }}
        />
        {items.map((item, idx) => {
          const meta = STATUS_MAP[String(item.status || 'info').toLowerCase()] || STATUS_MAP.info;
          const dotColor = resolveModeAccent(meta.hex, isDark);
          return (
            <Box
              key={`${item.title}-${idx}`}
              sx={{
                position: 'relative',
                pb: idx === items.length - 1 ? 0 : 1.75,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: 6,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  boxShadow: isDark ? `0 0 8px ${rgba(meta.hex, 0.65)}` : 'none',
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.35 }}>
                {item.time && (
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      color: isDark ? SOV.slate : '#667085',
                    }}
                  >
                    {item.time}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: isDark ? '#F5F1E6' : '#101828',
                  }}
                >
                  {item.title}
                </Typography>
                <Chip
                  size="small"
                  label={meta.label}
                  sx={{
                    height: 20,
                    fontFamily: MONO,
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    bgcolor: rgba(meta.hex, isDark ? 0.16 : 0.1),
                    color: dotColor,
                  }}
                />
                {item.duration && (
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.66rem',
                      color: isDark ? SOV.slate : '#667085',
                    }}
                  >
                    {item.duration}
                  </Typography>
                )}
              </Box>
              {item.detail && (
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: item.mono ? MONO : 'inherit',
                    fontSize: item.mono ? '0.76rem' : '0.84rem',
                    color: isDark ? SOV.slate : '#475467',
                    lineHeight: 1.55,
                  }}
                >
                  {item.detail}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * SovereignStepWizard — Controlled/uncontrolled multi-step workflow guide with 44px
 * step selectors, progress indicator, and Previous/Next controls.
 */
export function SovereignStepWizard({ steps = [], activeStep, onStepChange, accent = SOV.gold, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [internalStep, setInternalStep] = useState(0);

  const count = steps.length;
  const rawIdx = activeStep !== undefined ? activeStep : internalStep;
  const safeIdx = count > 0 ? Math.max(0, Math.min(count - 1, rawIdx)) : 0;
  const setStep = (idx) => {
    const clamped = Math.max(0, Math.min(count - 1, idx));
    if (onStepChange) onStepChange(clamped);
    if (activeStep === undefined) setInternalStep(clamped);
  };

  if (count === 0) return null;
  const current = steps[safeIdx];
  const progress = Math.round(((safeIdx + 1) / count) * 100);

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16, 24, 40, 0.12)'}`,
        borderRadius: 2,
        p: 2,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        {steps.map((step, idx) => {
          const active = idx === safeIdx;
          return (
            <Button
              key={step.id || idx}
              size="small"
              variant={active ? 'contained' : 'outlined'}
              onClick={() => setStep(idx)}
              sx={{
                minHeight: 44,
                px: 1.5,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                ...(active
                  ? { bgcolor: modeAccent, color: isDark ? '#05060B' : '#FFFFFF' }
                  : { color: modeAccent, borderColor: rgba(modeAccent, 0.35) }),
              }}
            >
              {String(idx + 1).padStart(2, '0')} · {step.label}
            </Button>
          );
        })}
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label="Wizard progress"
        sx={{
          height: 4,
          borderRadius: 99,
          mb: 2,
          bgcolor: isDark ? rgba(SOV.slate, 0.16) : 'rgba(16, 24, 40, 0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: modeAccent },
        }}
      />

      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: isDark ? '#070910' : '#F7F4EC',
          border: `1px solid ${isDark ? rgba(accent, 0.18) : 'rgba(16, 24, 40, 0.08)'}`,
          mb: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
          <Typography
            sx={{
              fontFamily: SERIF,
              fontSize: '1.15rem',
              color: isDark ? '#F5F1E6' : '#101828',
            }}
          >
            {current.label}
          </Typography>
          {current.badge && (
            <Chip
              size="small"
              label={current.badge}
              sx={{
                fontFamily: MONO,
                fontSize: '0.64rem',
                fontWeight: 700,
                bgcolor: isDark ? rgba(accent, 0.14) : rgba(modeAccent, 0.08),
                color: modeAccent,
              }}
            />
          )}
        </Box>
        {current.summary && (
          <Typography
            variant="body2"
            sx={{ color: isDark ? SOV.slate : '#475467', lineHeight: 1.6, mb: current.content ? 1.25 : 0 }}
          >
            {current.summary}
          </Typography>
        )}
        {current.content}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: isDark ? SOV.slate : '#475467' }}>
          STEP {safeIdx + 1} OF {count}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={safeIdx === 0}
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => setStep(safeIdx - 1)}
            sx={{ minHeight: 44, px: 1.5, fontFamily: MONO, fontSize: '0.72rem', textTransform: 'none' }}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={safeIdx === count - 1}
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => setStep(safeIdx + 1)}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: modeAccent,
              color: isDark ? '#05060B' : '#FFFFFF',
            }}
          >
            Next Step
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * SovereignFilterBar — Search box + wrapping 44px category filters + optional sort & count.
 */
export function SovereignFilterBar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Filter items...',
  categories = [],
  activeCategory = 'ALL',
  onCategoryChange,
  sortOptions = [],
  activeSort = '',
  onSortChange,
  totalCount,
  filteredCount,
  onReset,
  accent = SOV.gold,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: isDark ? '#070910' : '#F7F4EC',
        border: `1px solid ${isDark ? rgba(accent, 0.22) : 'rgba(16, 24, 40, 0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
        {onSearchChange && (
          <TextField
            size="small"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            sx={{ flex: '1 1 220px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              style: { minHeight: 44, fontSize: '0.84rem' },
            }}
          />
        )}

        {sortOptions.length > 0 && onSortChange && (
          <TextField
            select
            size="small"
            label="Sort"
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            sx={{ minWidth: 160 }}
            InputProps={{ style: { minHeight: 44, fontSize: '0.82rem' } }}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {typeof totalCount === 'number' && (
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: modeAccent,
              px: 1,
            }}
          >
            SHOWING {typeof filteredCount === 'number' ? filteredCount : totalCount} OF {totalCount}
          </Typography>
        )}

        {onReset && (
          <Button
            size="small"
            variant="outlined"
            onClick={onReset}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.7rem',
              textTransform: 'none',
            }}
          >
            Reset
          </Button>
        )}
      </Box>

      {categories.length > 0 && onCategoryChange && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => {
            const val = typeof cat === 'string' ? cat : cat.value;
            const label = typeof cat === 'string' ? cat : cat.label;
            const active = activeCategory === val;
            return (
              <Button
                key={val}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => onCategoryChange(val)}
                sx={{
                  minHeight: 44,
                  px: 1.5,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: modeAccent, color: isDark ? '#05060B' : '#FFFFFF' }
                    : { color: modeAccent, borderColor: rgba(modeAccent, 0.35) }),
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/**
 * SovereignStatComparison — Before/after benchmark progress bars with automatic delta %.
 */
export function SovereignStatComparison({ title = 'BENCHMARK COMPARISON', items = [], accent = SOV.emerald, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16, 24, 40, 0.12)'}`,
        borderRadius: 2,
        p: 2,
        ...sx,
      }}
    >
      {title && (
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: modeAccent,
            mb: 1.75,
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {items.map((item, idx) => {
          const baseVal = Number(item.baseline) || 0;
          const curVal = Number(item.current) || 0;
          const max = Number(item.max) || Math.max(baseVal, curVal, 1);
          const basePct = Math.min(100, Math.max(2, (baseVal / max) * 100));
          const curPct = Math.min(100, Math.max(2, (curVal / max) * 100));
          const betterLower = item.better !== 'higher';
          const delta =
            baseVal > 0
              ? Math.round(((betterLower ? baseVal - curVal : curVal - baseVal) / baseVal) * 100)
              : 0;
          const improved = delta >= 0;

          return (
            <Box key={`${item.label}-${idx}`}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.65 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.86rem', color: isDark ? '#F5F1E6' : '#101828' }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      fontVariantNumeric: 'tabular-nums',
                      color: isDark ? SOV.slate : '#667085',
                    }}
                  >
                    {baseVal}
                    {item.unit || ''} →{' '}
                    <Box component="span" sx={{ color: modeAccent, fontWeight: 700 }}>
                      {curVal}
                      {item.unit || ''}
                    </Box>
                  </Typography>
                  <Chip
                    size="small"
                    label={`${improved ? '+' : ''}${delta}% ${improved ? 'GAIN' : 'DELTA'}`}
                    sx={{
                      height: 20,
                      fontFamily: MONO,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: rgba(improved ? SOV.emerald : SOV.amber, isDark ? 0.16 : 0.1),
                      color: resolveModeAccent(improved ? SOV.emerald : SOV.amber, isDark),
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: isDark ? '#0B0F1A' : '#ECE7DC',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${basePct}%`,
                      height: '100%',
                      bgcolor: isDark ? rgba(SOV.slate, 0.45) : '#98A2B3',
                      borderRadius: 99,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    height: 7,
                    borderRadius: 99,
                    bgcolor: isDark ? '#0B0F1A' : '#ECE7DC',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${curPct}%`,
                      height: '100%',
                      bgcolor: modeAccent,
                      borderRadius: 99,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * SovereignTerminalLog — Filterable monospaced log viewer with severity badges and Copy/Clear.
 */
export function SovereignTerminalLog({
  title = 'LIVE TELEMETRY STREAM',
  logs = [],
  onClear,
  maxHeight = 260,
  accent = SOV.cyber,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [level, setLevel] = useState('ALL');
  const { copied, copy } = useCopy();

  const visibleLogs = useMemo(() => {
    if (level === 'ALL') return logs;
    return logs.filter((entry) => String(entry.level || 'INFO').toUpperCase() === level);
  }, [logs, level]);

  const handleCopyLogs = () => {
    const text = visibleLogs
      .map((l) => `[${l.ts || '--:--:--'}] [${String(l.level || 'INFO').toUpperCase()}]${l.source ? ` [${l.source}]` : ''} ${l.message || ''}`)
      .join('\n');
    return copy(text);
  };

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16, 24, 40, 0.12)'}`,
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${isDark ? rgba(accent, 0.18) : 'rgba(16, 24, 40, 0.08)'}`,
          bgcolor: isDark ? '#070910' : '#F7F4EC',
        }}
      >
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: modeAccent,
          }}
        >
          {title} ({visibleLogs.length})
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {['ALL', 'INFO', 'WARN', 'ERROR'].map((lv) => {
            const active = level === lv;
            return (
              <Button
                key={lv}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setLevel(lv)}
                sx={{
                  minHeight: 44,
                  px: 1.25,
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  ...(active
                    ? { bgcolor: modeAccent, color: isDark ? '#05060B' : '#FFFFFF' }
                    : { color: modeAccent, borderColor: rgba(modeAccent, 0.35) }),
                }}
              >
                {lv}
              </Button>
            );
          })}
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopyLogs}
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            sx={{ minHeight: 44, px: 1.25, fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {onClear && (
            <Button
              size="small"
              variant="outlined"
              onClick={onClear}
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              sx={{ minHeight: 44, px: 1.25, fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none' }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ maxHeight, overflow: 'auto', p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {visibleLogs.length === 0 ? (
          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: isDark ? SOV.slate : '#667085', p: 1 }}>
            No log entries match filter [{level}].
          </Typography>
        ) : (
          visibleLogs.map((entry, idx) => {
            const lv = String(entry.level || 'INFO').toUpperCase();
            const meta = STATUS_MAP[lv.toLowerCase()] || STATUS_MAP.info;
            const lvColor = resolveModeAccent(meta.hex, isDark);
            return (
              <Box
                key={`${entry.ts}-${idx}`}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark ? '#070910' : '#FAF8F3',
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                }}
              >
                <Box component="span" sx={{ color: isDark ? SOV.slateDim : '#667085', fontSize: '0.68rem' }}>
                  {entry.ts || '--:--:--'}
                </Box>
                <Box component="span" sx={{ color: lvColor, fontWeight: 700, minWidth: 46, fontSize: '0.68rem' }}>
                  [{lv}]
                </Box>
                {entry.source && (
                  <Box component="span" sx={{ color: isDark ? SOV.gold : '#7A5808', fontSize: '0.7rem' }}>
                    {entry.source}
                  </Box>
                )}
                <Box component="span" sx={{ color: isDark ? SOV.ink : '#101828', flex: '1 1 200px', wordBreak: 'break-word' }}>
                  {entry.message}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

/**
 * SovereignPromptBox — unified AI prompt, agent orchestration & directive dispatch deck.
 * Includes model selector, temperature controls, system prompt drawer,
 * character/token estimator, keyboard submission (Ctrl+Enter / Cmd+Enter), and loading states.
 */
export function SovereignPromptBox({
  value,
  onChange,
  onSubmit,
  onClear,
  loading = false,
  placeholder = 'Enter system instruction, agent workflow directive, or query...',
  models = [
    { id: 'local-ollama', label: 'Ollama Local (Hermes 3 / Qwen 2.5)', badge: ':11434' },
    { id: 'zoth-archon', label: 'Zoth Archon (Enclave Agent)', badge: 'Sovereign' },
    { id: 'claude-3-7', label: 'Claude 3.7 Sonnet (Anthropic)', badge: 'Cloud' },
  ],
  selectedModel,
  onModelChange,
  systemPrompt,
  onSystemPromptChange,
  temperature = 0.7,
  onTemperatureChange,
  accent = SOV.gold,
  submitLabel = 'Execute Directive',
  minRows = 3,
  maxRows = 8,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [showConfig, setShowConfig] = useState(false);

  const charCount = (value || '').length;
  const tokenEstimate = Math.round(charCount / 4);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!loading && onSubmit && value && value.trim()) {
        onSubmit(value);
      }
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && onChange) {
          onChange(value ? `${value}\n${text}` : text);
        }
      }
    } catch (_) {}
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.12)'}`,
        bgcolor: isDark ? '#08080C' : '#FAF8F3',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      {/* Top Header / Model Strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            select
            size="small"
            value={selectedModel || (models[0] && models[0].id) || ''}
            onChange={(e) => onModelChange && onModelChange(e.target.value)}
            sx={{
              minWidth: 200,
              '& .MuiInputBase-root': {
                height: 34,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
              },
            }}
          >
            {models.map((m) => (
              <MenuItem key={m.id} value={m.id} sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                  <span>{m.label}</span>
                  {m.badge && (
                    <Chip
                      size="small"
                      label={m.badge}
                      sx={{ height: 20, fontSize: '0.62rem', fontFamily: MONO, fontWeight: 700 }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowConfig(!showConfig)}
            startIcon={<TuneIcon sx={{ fontSize: 15 }} />}
            sx={{
              minHeight: 34,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: showConfig ? modeAccent : (isDark ? SOV.slate : '#64748B'),
            }}
          >
            {showConfig ? 'Hide Params' : 'Tuning'}
          </Button>

          {onClear && value && (
            <Button
              size="small"
              onClick={onClear}
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.7rem',
                color: SOV.crimson,
                textTransform: 'none',
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Collapsible Tuning Panel */}
      {showConfig && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(16,24,40,0.015)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: isDark ? SOV.cream : '#101828' }}>
                  TEMPERATURE: {temperature}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: isDark ? SOV.slate : '#64748B' }}>
                  {temperature < 0.3 ? 'Deterministic' : temperature > 0.8 ? 'Creative' : 'Balanced'}
                </Typography>
              </Box>
              <Slider
                size="small"
                min={0}
                max={1.5}
                step={0.05}
                value={temperature}
                onChange={(_, v) => onTemperatureChange && onTemperatureChange(v)}
                sx={{ color: modeAccent }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="System Directive / Enclave Persona"
                placeholder="You are an autonomous sovereign engineer..."
                value={systemPrompt || ''}
                onChange={(e) => onSystemPromptChange && onSystemPromptChange(e.target.value)}
                InputProps={{
                  sx: {
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Textarea Input Body */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={minRows}
          maxRows={maxRows}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontFamily: MONO,
              fontSize: '0.86rem',
              lineHeight: 1.6,
              color: isDark ? SOV.cream : '#101828',
            },
          }}
        />
      </Box>

      {/* Footer Dispatch Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(16,24,40,0.015)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: isDark ? SOV.slate : '#64748B' }}>
            {charCount} chars · ~{tokenEstimate} tokens
          </Typography>
          <Button
            size="small"
            onClick={handlePasteClipboard}
            sx={{ minHeight: 28, px: 0.75, fontFamily: MONO, fontSize: '0.68rem', color: isDark ? SOV.slate : '#64748B', textTransform: 'none' }}
          >
            Paste Clipboard
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontFamily: MONO,
              fontSize: '0.68rem',
              color: isDark ? SOV.slateDim : '#94A3B8',
            }}
          >
            Press ⌘↵ or Ctrl+↵ to run
          </Typography>

          <Button
            variant="contained"
            disabled={loading || !value || !value.trim()}
            onClick={() => onSubmit && onSubmit(value)}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
            sx={{
              minHeight: 44,
              px: 2.5,
              fontFamily: MONO,
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: isDark ? modeAccent : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
              boxShadow: `0 0 16px ${rgba(modeAccent, 0.25)}`,
              '&:hover': {
                bgcolor: isDark ? '#F5F1E6' : '#1E293B',
                color: isDark ? '#08080B' : '#FFFFFF',
              },
            }}
          >
            {loading ? 'Synthesizing...' : submitLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
