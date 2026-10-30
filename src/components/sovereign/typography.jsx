/**
 * Sovereign typographic hierarchy.
 *
 * The tool components had a flat hierarchy: every heading was an h5 at the same
 * weight and colour, with body text at 0.875rem and no rhythm between them
 * (measured across the 52 files in src/components/tools/). These are the four
 * tiers, in the order they must appear on a page:
 *
 *   eyebrow   mono, 10-11px, 0.2em tracking, uppercase  — machine provenance
 *   title     display, 20-30px, -0.02em, weight 600     — the tool's name
 *   lede      body, 15-16px, slate, <=68ch measure      — one sentence of why
 *   meta      mono, 10-11px, dim                        — ids / counts / facts
 *
 * Every value comes from the sovereign palette so a tool page cannot drift.
 */

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SOV, rgba, MONO, DISPLAY } from './palette.js';

export const eyebrowSx = (accent = SOV.gold) => ({
  fontFamily: MONO,
  fontSize: { xs: 10, md: 11 },
  lineHeight: 1.4,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: accent,
});

export const titleBaseSx = {
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
};

export const titleSx = {
  ...titleBaseSx,
  fontFamily: DISPLAY,
  color: SOV.ink,
};

export const ledeSx = {
  color: rgba(SOV.slate, 0.92),
  fontSize: { xs: '0.9rem', md: '0.975rem' },
  lineHeight: 1.62,
  maxWidth: '68ch',
};

export const metaSx = {
  fontFamily: MONO,
  fontSize: { xs: 10, md: 11 },
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: rgba(SOV.slateDim, 0.95),
};

/** Hairline rule with a gold leading segment — separates hierarchy tiers. */
export function SovereignRule({ accent = SOV.gold, sx }) {
  return (
    <Box
      aria-hidden
      sx={{
        height: '1px',
        width: '100%',
        background: `linear-gradient(90deg, ${rgba(accent, 0.85)} 0%, ${rgba(accent, 0.35)} 12%, ${rgba(SOV.gold, 0.10)} 45%, rgba(0,0,0,0) 100%)`,
        ...sx,
      }}
    />
  );
}

/** Tier 1 + 2: numbered section heading used inside a tool workspace. */
export function SovereignSectionHead({ index, title, right, accent = SOV.gold, sx }) {
  return (
    <Box sx={{ mb: 1.5, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, minWidth: 0 }}>
          {index != null && <Box sx={{ ...eyebrowSx(accent), flexShrink: 0 }}>{index}</Box>}
          <Typography component="h3" sx={{ ...titleSx, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
            {title}
          </Typography>
        </Box>
        {right}
      </Box>
      <SovereignRule accent={accent} sx={{ mt: 1 }} />
    </Box>
  );
}

/** Tier 1: machine-provenance eyebrow that opens every tool page. */
export function SovereignEyebrow({ children, accent = SOV.gold, right, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        mb: { xs: 0.75, md: 1 },
        minWidth: 0,
        ...sx,
      }}
    >
      <Box
        component="p"
        sx={{
          ...eyebrowSx(accent),
          m: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: `0 0 14px ${rgba(accent, 0.35)}`,
        }}
      >
        {children}
      </Box>
      {right != null && <Box sx={{ ...metaSx, flexShrink: 0 }}>{right}</Box>}
    </Box>
  );
}

/** Tier 3: lede paragraph, measure-capped for readability. */
export function SovereignLede({ children, sx }) {
  return (
    <Typography sx={{ ...ledeSx, mb: { xs: 1.5, md: 2 }, ...sx }}>
      {children}
    </Typography>
  );
}

/** Tier 4: mono meta strip with sovereign separators. */
export function SovereignMeta({ items = [], sx }) {
  const list = items.filter(Boolean);
  if (!list.length) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1, md: 1.5 }, ...sx }}>
      {list.map((item, i) => (
        <Box key={`${item}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, ...metaSx }}>
          {i > 0 && <Box aria-hidden component="span" sx={{ color: rgba(SOV.gold, 0.4) }}>•</Box>}
          <span>{item}</span>
        </Box>
      ))}
    </Box>
  );
}
