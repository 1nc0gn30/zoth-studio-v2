/**
 * SovereignBand — the interactive canvas band every Zoth Studio tool page
 * carries at the top of its workspace.
 *
 * It renders one of the four primitives (braille-orbit / bayer-field /
 * scanline-grid / particle-orbit), chosen deterministically from the tool id
 * unless overridden, with:
 *   - a real <canvas> driven by useSovereignCanvas (cancelled on unmount,
 *     paused off-screen, one static frame under prefers-reduced-motion);
 *   - a CRT scanline + vignette overlay in CSS on top of the pixels;
 *   - a typographic chrome layer: mono eyebrow, display caption, mono meta
 *     strip and a live render readout (variant + measured fps + cell counts);
 *   - corner ticks and a hairline frame in the sovereign line colour.
 *
 * Crash containment: the canvas is decorative. If a scene fails, the hook
 * returns status 'error' and this component falls back to a pure-CSS static
 * backdrop — the tool itself keeps working and the page never white-screens.
 */

import React, { useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import { SOV, rgba, MONO, DISPLAY, pickVariant, VARIANT_META, hashSeed, bandAccent } from './palette.js';
import { useSovereignCanvas } from './useSovereignCanvas.js';

export const SCANLINE_CSS =
  'repeating-linear-gradient(to bottom, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)';

const GRID_CSS =
  `linear-gradient(${rgba(SOV.gold, 0.06)} 1px, transparent 1px) 0 0 / 100% 22px,`
  + `linear-gradient(90deg, ${rgba(SOV.gold, 0.06)} 1px, transparent 1px) 0 0 / 34px 100%`;

function CornerTick({ pos, color }) {
  const base = { position: 'absolute', width: 9, height: 9, pointerEvents: 'none', zIndex: 3 };
  const map = {
    tl: { top: 5, left: 5, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    tr: { top: 5, right: 5, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` },
    bl: { bottom: 5, left: 5, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    br: { bottom: 5, right: 5, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` },
  };
  return <Box aria-hidden sx={{ ...base, ...map[pos] }} />;
}

export default function SovereignBand({
  seed = 'zoth-studio',
  variant,
  eyebrow = 'LIVE RENDER',
  caption,
  height = { xs: 104, sm: 124, md: 148 },
  fps,
  meta,
  label,
  sx,
  children,
}) {
  const canvasRef = useRef(null);
  const resolvedVariant = useMemo(() => variant || pickVariant(seed), [variant, seed]);
  const meta_ = VARIANT_META[resolvedVariant] || VARIANT_META['braille-orbit'];
  const accent = useMemo(() => bandAccent(seed), [seed]);

  const state = useSovereignCanvas({
    canvasRef,
    variant: resolvedVariant,
    seed,
    fps: resolvedVariant === 'braille-orbit' ? 24 : 30,
  });

  const failed = state.status === 'error';
  const readout = failed
    ? 'STATIC FALLBACK'
    : `${meta_.label} · ${state.fps || '—'} FPS`;
  const cells = state.stats && state.stats.cells ? state.stats.cells : 0;
  const lit = state.stats && state.stats.lit ? state.stats.lit : 0;
  const metaItems = (meta || []).concat([
    meta_.glyph,
    meta_.prov,
    cells ? `${cells.toLocaleString('en-US')} CELLS` : null,
    lit ? `${(lit * 8).toLocaleString('en-US')} SUB-PX LIT` : null,
    state.glyphs === false ? 'DOT-FALLBACK' : state.glyphs === true ? 'GLYPH MODE' : null,
  ]).filter(Boolean);

  return (
    <Box
      sx={{
        position: 'relative',
        mb: { xs: 2, md: 2.5 },
        border: `1px solid ${rgba(SOV.gold, failed ? 0.18 : 0.28)}`,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: SOV.obsidian,
        backgroundImage: GRID_CSS,
        ...sx,
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        role="img"
        aria-label={label || `Zoth sovereign ${meta_.label.toLowerCase()} visualisation`}
        sx={{
          display: 'block',
          width: '100%',
          height,
          // A canvas that fails to build must never leave a white box.
          bgcolor: SOV.obsidian,
          imageRendering: resolvedVariant === 'bayer-field' ? 'pixelated' : 'auto',
        }}
      />

      {/* CSS CRT layer (composits over every variant) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: SCANLINE_CSS,
          opacity: 0.55,
          mixBlendMode: 'multiply',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(120% 130% at 50% 50%, rgba(5,6,11,0) 42%, ${rgba(SOV.obsidian, 0.72)} 100%)`,
        }}
      />

      <CornerTick pos="tl" color={rgba(accent, 0.8)} />
      <CornerTick pos="tr" color={rgba(accent, 0.8)} />
      <CornerTick pos="bl" color={rgba(accent, 0.8)} />
      <CornerTick pos="br" color={rgba(accent, 0.8)} />

      {/* Chrome — eyebrow + live readout */}
      <Box
        sx={{
          position: 'absolute',
          top: 9,
          left: 13,
          right: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: accent,
            textShadow: `0 0 12px ${rgba(accent, 0.45)}`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {eyebrow}
        </Box>
        <Box
          sx={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.12em',
            color: rgba(SOV.slate, 0.92),
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {readout}
        </Box>
      </Box>

      {(caption || children) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 9,
            left: 13,
            right: 13,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {caption && (
            <Box
              sx={{
                fontFamily: DISPLAY,
                fontSize: { xs: 13, md: 15 },
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: rgba(SOV.ink, 0.94),
              }}
            >
              {caption}
            </Box>
          )}
          {children}
        </Box>
      )}

      {/* Meta strip sits under the canvas, never over the art. */}
      {metaItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: { xs: 1, md: 1.5 },
            px: 1.5,
            py: 0.75,
            borderTop: `1px solid ${rgba(SOV.gold, 0.14)}`,
            bgcolor: rgba(SOV.obsidian2, 0.72),
          }}
        >
          {metaItems.map((item, i) => (
            <Box
              key={`${item}-${i}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: i === 0 ? rgba(SOV.gold, 0.92) : rgba(SOV.slate, 0.78),
              }}
            >
              {i > 0 && <Box aria-hidden component="span" sx={{ color: rgba(SOV.gold, 0.35) }}>•</Box>}
              <span>{item}</span>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
