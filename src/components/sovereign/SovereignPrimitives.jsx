/**
 * SovereignPrimitives — standardized UI building blocks for Zoth Studio v2.
 *
 * Dual-theme (Dark Obsidian #08080B / Light Editorial Ivory #FAF8F3) and SSR-safe:
 * zero window/document access at module scope so static prerendering succeeds.
 */

import React, { useState } from 'react';
import { Box, Button, Chip, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import CoffeeIcon from '@mui/icons-material/LocalCafe';
import { SOV, rgba, MONO, DISPLAY } from './palette.js';
import { SovereignRule, eyebrowSx, metaSx } from './typography.jsx';
import { useCopy, downloadText } from './hooks.js';

export const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
export const SOLANA_TIP_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

const SERIF = '"Celtic Garamond", Georgia, "Times New Roman", serif';

/** Returns high-contrast ink/accent colors tuned for dark or light mode. */
export function resolveModeAccent(accent, isDark) {
  if (!accent || accent.toLowerCase() === SOV.gold.toLowerCase()) {
    return isDark ? SOV.gold : '#7A5808';
  }
  if (!isDark) {
    const low = accent.toLowerCase();
    if (low === SOV.emerald.toLowerCase()) return '#047857';
    if (low === SOV.cyber.toLowerCase()) return '#0369A1';
    if (low === SOV.crimson.toLowerCase()) return '#B91C1C';
    if (low === SOV.amber.toLowerCase()) return '#B45309';
    if (low === '#c084fc') return '#6D28D9';
  }
  return accent;
}

function CardTick({ pos, color }) {
  const map = {
    tl: { top: 6, left: 6, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    tr: { top: 6, right: 6, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` },
    bl: { bottom: 6, left: 6, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    br: { bottom: 6, right: 6, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` },
  };
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        width: 8,
        height: 8,
        pointerEvents: 'none',
        ...map[pos],
      }}
    />
  );
}

/**
 * SovereignCard — standardized dual-theme Bento container with corner ticks,
 * mono eyebrow/index, display title, hairline rule, and slot actions.
 */
export function SovereignCard({
  index,
  eyebrow,
  title,
  subtitle,
  badge,
  right,
  accent = SOV.gold,
  ticks = true,
  variant = 'default',
  sx,
  bodySx,
  children,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  const bg =
    variant === 'subtle'
      ? isDark
        ? '#080A11'
        : '#F7F4EC'
      : isDark
        ? SOV.obsidian2
        : '#FFFFFF';
  const borderCol = isDark ? rgba(accent, 0.24) : 'rgba(16, 24, 40, 0.12)';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? SOV.slate : '#475467';
  const hasHeader = Boolean(index != null || eyebrow || title || subtitle || badge || right);

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: bg,
        border: `1px solid ${borderCol}`,
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        boxShadow: isDark
          ? `0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 ${rgba(accent, 0.08)}`
          : '0 4px 18px rgba(16, 24, 40, 0.05)',
        minWidth: 0,
        ...sx,
      }}
    >
      {ticks && (
        <>
          <CardTick pos="tl" color={rgba(modeAccent, isDark ? 0.65 : 0.45)} />
          <CardTick pos="tr" color={rgba(modeAccent, isDark ? 0.65 : 0.45)} />
          <CardTick pos="bl" color={rgba(modeAccent, isDark ? 0.65 : 0.45)} />
          <CardTick pos="br" color={rgba(modeAccent, isDark ? 0.65 : 0.45)} />
        </>
      )}

      {hasHeader && (
        <Box sx={{ mb: 1.75 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.25,
            }}
          >
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              {(index != null || eyebrow || badge) && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    mb: title ? 0.5 : 0,
                  }}
                >
                  {index != null && (
                    <Box
                      component="span"
                      sx={{
                        ...eyebrowSx(modeAccent),
                        fontWeight: 800,
                      }}
                    >
                      {index}
                    </Box>
                  )}
                  {eyebrow && (
                    <Box
                      component="span"
                      sx={{
                        ...eyebrowSx(modeAccent),
                        fontWeight: 700,
                      }}
                    >
                      {eyebrow}
                    </Box>
                  )}
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: MONO,
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        bgcolor: isDark ? rgba(accent, 0.14) : rgba(modeAccent, 0.08),
                        color: modeAccent,
                        border: `1px solid ${rgba(modeAccent, 0.35)}`,
                      }}
                    />
                  )}
                </Box>
              )}

              {title && (
                <Typography
                  component="h3"
                  sx={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: { xs: '1.15rem', sm: '1.28rem' },
                    lineHeight: 1.2,
                    color: textPrimary,
                  }}
                >
                  {title}
                </Typography>
              )}

              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.45,
                    color: textSecondary,
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {right && <Box sx={{ flexShrink: 0 }}>{right}</Box>}
          </Box>

          <SovereignRule accent={modeAccent} sx={{ mt: 1.25 }} />
        </Box>
      )}

      <Box sx={{ minWidth: 0, ...bodySx }}>{children}</Box>
    </Box>
  );
}

/**
 * SovereignKpiStrip — responsive 2–4 column metric strip for live telemetry.
 * items = [{ label, value, unit, status, accent }]
 */
export function SovereignKpiStrip({ items = [], cols, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!items || items.length === 0) return null;

  const mdSpan =
    cols ||
    (items.length === 1 ? 12 : items.length === 2 ? 6 : items.length === 3 ? 4 : 3);

  return (
    <Grid container spacing={1.75} sx={{ mb: 2.25, ...sx }}>
      {items.map((item, idx) => {
        const rawAccent = item.accent || SOV.gold;
        const accent = resolveModeAccent(rawAccent, isDark);
        return (
          <Grid key={`${item.label}-${idx}`} xs={12} sm={6} md={mdSpan}>
            <Box
              sx={{
                height: '100%',
                bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
                border: `1px solid ${isDark ? rgba(rawAccent, 0.25) : 'rgba(16,24,40,0.12)'}`,
                borderTop: `2px solid ${accent}`,
                borderRadius: 1.75,
                p: 1.75,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    ...metaSx,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isDark ? SOV.slate : '#475467',
                  }}
                >
                  {item.label}
                </Typography>
                {item.status && (
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      height: 19,
                      fontFamily: MONO,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: isDark ? rgba(rawAccent, 0.15) : rgba(accent, 0.08),
                      color: accent,
                      border: `1px solid ${rgba(accent, 0.35)}`,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: { xs: '1.35rem', sm: '1.55rem' },
                    lineHeight: 1.1,
                    color: isDark ? '#F5F1E6' : '#101828',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item.value}
                </Typography>
                {item.unit && (
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      color: accent,
                      fontWeight: 700,
                    }}
                  >
                    {item.unit}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * SovereignCodeBlock — terminal/code panel with 1-click Copy and File Download.
 */
export function SovereignCodeBlock({
  title = 'OUTPUT SPECIFICATION',
  badge,
  code = '',
  filename = 'zoth-artifact.txt',
  accent = SOV.gold,
  maxHeight = 320,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { copied, copy } = useCopy(1800);
  const modeAccent = resolveModeAccent(accent, isDark);

  const handleCopy = () => copy(code);

  const handleDownload = () => downloadText(code, filename);

  return (
    <Box
      sx={{
        borderRadius: 1.75,
        overflow: 'hidden',
        border: `1px solid ${isDark ? rgba(accent, 0.28) : 'rgba(16,24,40,0.14)'}`,
        bgcolor: isDark ? '#06080E' : '#F6F3EC',
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.85,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: isDark ? rgba(accent, 0.08) : 'rgba(16,24,40,0.04)',
          borderBottom: `1px solid ${isDark ? rgba(accent, 0.18) : 'rgba(16,24,40,0.1)'}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: modeAccent,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Typography>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                height: 20,
                fontFamily: MONO,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                color: isDark ? '#EDEFF2' : '#101828',
              }}
            />
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: copied ? (isDark ? SOV.emerald : '#047857') : modeAccent,
              borderColor: copied ? (isDark ? SOV.emerald : '#047857') : rgba(modeAccent, 0.45),
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleDownload}
            startIcon={<DownloadIcon fontSize="small" />}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: isDark ? '#EDEFF2' : '#101828',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(16,24,40,0.22)',
            }}
          >
            Download
          </Button>
        </Stack>
      </Box>

      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.75,
          maxHeight,
          overflowX: 'auto',
          overflowY: 'auto',
          fontFamily: MONO,
          fontSize: '0.76rem',
          lineHeight: 1.6,
          color: isDark ? '#E2E8F0' : '#101828',
          whiteSpace: 'pre',
        }}
      >
        {code}
      </Box>
    </Box>
  );
}

/**
 * SovereignSupportBar — open-access status strip with Stripe Coffee & Solana Tip.
 */
export function SovereignSupportBar({
  label = '✦ 100% FREE & OPEN ACCESS · ZERO PAYWALLS',
  compact = false,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { copied: solCopied, copy: copySol } = useCopy(2000);

  const handleCopySol = () => copySol(SOLANA_TIP_ADDRESS);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
        px: compact ? 1.5 : 2,
        py: compact ? 0.85 : 1.1,
        mb: 2,
        borderRadius: 1.75,
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(122,88,8,0.2)'}`,
        background: isDark
          ? 'linear-gradient(90deg, rgba(16,185,129,0.09) 0%, rgba(212,175,55,0.12) 100%)'
          : 'linear-gradient(90deg, rgba(4,120,87,0.06) 0%, rgba(212,175,55,0.1) 100%)',
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontFamily: MONO,
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: isDark ? SOV.emerald : '#047857',
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Button
          size="small"
          variant="contained"
          href={STRIPE_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<CoffeeIcon fontSize="small" />}
          sx={{
            minHeight: 44,
            px: 1.75,
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'none',
            bgcolor: isDark ? SOV.gold : '#101828',
            color: isDark ? '#08080B' : '#FFFFFF',
            '&:hover': {
              bgcolor: isDark ? '#E8C55A' : '#1E293B',
            },
          }}
        >
          Buy Us a Coffee
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={handleCopySol}
          sx={{
            minHeight: 44,
            px: 1.75,
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            color: isDark ? '#14F195' : '#047857',
            borderColor: isDark ? 'rgba(20,241,149,0.45)' : 'rgba(4,120,87,0.35)',
            bgcolor: isDark ? 'rgba(20,241,149,0.08)' : 'rgba(4,120,87,0.05)',
          }}
        >
          {solCopied ? '✓ Copied GG2e...dXoK' : '◎ Solana Tip (GG2e...dXoK)'}
        </Button>
      </Box>
    </Box>
  );
}

/**
 * SovereignActionBar — consistent 44px touch-target action strip with status chip.
 * actions = [{ label, onClick, href, primary, disabled, icon, accent }]
 */
export function SovereignActionBar({ actions = [], status, statusAccent = SOV.emerald, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if ((!actions || actions.length === 0) && !status) return null;

  const badgeCol = resolveModeAccent(statusAccent, isDark);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
        mb: 2.25,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {actions.map((act, idx) => {
          const btnAccent = resolveModeAccent(act.accent || SOV.gold, isDark);
          const linkProps = act.href
            ? { href: act.href, target: act.target || '_blank', rel: 'noopener noreferrer' }
            : {};
          return (
            <Button
              key={`${act.label}-${idx}`}
              variant={act.primary ? 'contained' : 'outlined'}
              disabled={act.disabled}
              onClick={act.onClick}
              startIcon={act.icon || null}
              {...linkProps}
              sx={{
                minHeight: 44,
                px: 2,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                ...(act.primary
                  ? {
                      bgcolor: isDark ? (act.accent || SOV.gold) : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      '&:hover': { bgcolor: isDark ? '#E8C55A' : '#1E293B' },
                    }
                  : {
                      color: btnAccent,
                      borderColor: rgba(btnAccent, 0.45),
                      '&:hover': {
                        borderColor: btnAccent,
                        bgcolor: rgba(btnAccent, 0.08),
                      },
                    }),
              }}
            >
              {act.label}
            </Button>
          );
        })}
      </Box>

      {status && (
        <Chip
          label={status}
          size="small"
          sx={{
            height: 28,
            px: 0.75,
            fontFamily: MONO,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: isDark ? rgba(statusAccent, 0.14) : rgba(badgeCol, 0.08),
            color: badgeCol,
            border: `1px solid ${rgba(badgeCol, 0.35)}`,
          }}
        />
      )}
    </Box>
  );
}

/**
 * SovereignStatusPill — live daemon, port & network telemetry pill.
 * Features animated pulse beacon, port tag, and latency readout.
 */
export function SovereignStatusPill({
  status = 'online',
  label,
  port,
  pingMs,
  compact = false,
  accent,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const statusColorMap = {
    online: SOV.emerald,
    ok: SOV.emerald,
    live: SOV.emerald,
    offline: SOV.amber,
    warning: SOV.amber,
    warn: SOV.amber,
    standby: SOV.amber,
    degraded: SOV.amber,
    error: SOV.crimson,
    critical: SOV.crimson,
    syncing: SOV.cyber,
    info: SOV.cyber,
  };

  const baseCol = accent || statusColorMap[status] || SOV.amber;
  const col = resolveModeAccent(baseCol, isDark);
  const displayLabel = label || status.toUpperCase();
  const isStaticDot = status === 'offline' || status === 'error' || status === 'critical';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 0.75 : 1,
        px: compact ? 1 : 1.25,
        py: compact ? 0.25 : 0.5,
        minHeight: compact ? 26 : 34,
        borderRadius: 999,
        border: `1px solid ${rgba(col, isDark ? 0.35 : 0.28)}`,
        bgcolor: isDark ? rgba(col, 0.08) : rgba(col, 0.06),
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          width: compact ? 6 : 8,
          height: compact ? 6 : 8,
          borderRadius: '50%',
          bgcolor: col,
          boxShadow: `0 0 8px ${col}`,
          animation: isStaticDot ? 'none' : 'sovereignPillPulse 2s ease-in-out infinite',
          '@keyframes sovereignPillPulse': {
            '0%': { transform: 'scale(0.95)', opacity: 0.7 },
            '50%': { transform: 'scale(1.2)', opacity: 1 },
            '100%': { transform: 'scale(0.95)', opacity: 0.7 },
          },
        }}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: MONO,
          fontSize: compact ? '0.68rem' : '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: col,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {displayLabel}
      </Typography>
      {port != null && (
        <Typography
          component="span"
          sx={{
            fontFamily: MONO,
            fontSize: '0.66rem',
            fontWeight: 600,
            color: isDark ? SOV.slate : '#64748B',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            px: 0.6,
            py: 0.15,
            borderRadius: 0.75,
            lineHeight: 1,
          }}
        >
          :{port}
        </Typography>
      )}
      {pingMs != null && (
        <Typography
          component="span"
          sx={{
            fontFamily: MONO,
            fontSize: '0.66rem',
            fontWeight: 600,
            color: isDark ? SOV.slate : '#64748B',
            lineHeight: 1,
          }}
        >
          {pingMs}ms
        </Typography>
      )}
    </Box>
  );
}
