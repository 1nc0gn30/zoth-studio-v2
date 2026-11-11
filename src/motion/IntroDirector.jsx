/**
 * IntroDirector — crisp two-door editorial aperture intros with dual-theme contrast.
 *
 * Every primary route opens with two architectural shutter panels meeting at a
 * horizontal 50% center seam:
 *   · Upper Shutter: route index strip + framed 60fps Sub-Pixel Braille/Bayer emblem.
 *   · Lower Shutter: high-contrast runtime kicker + serif display title + Enter ESC pill.
 *
 * Because the Braille plate lives strictly in the Upper Shutter (above 50%) and
 * all title typography lives strictly in the Lower Shutter (below 50%), the center
 * seam never crosses a single character on any viewport, and handoff parts both
 * shutters cleanly upward and downward without slicing text.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import { IntroGateContext, useIntroPhase } from './IntroGate';
import { resolveRouteIntro } from './routeIntros';
import { AsciiBrailleIntroStage, useGlyphScramble } from './AsciiBrailleDitherEngine';

const SEEN_KEY = 'zoth-intros-seen-v3';
const NARROW_QUERY = '(max-width: 640px)';
const EASE_APERTURE = [0.76, 0, 0.24, 1];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

function readSeen() {
  try {
    return new Set(JSON.parse(window.sessionStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function markSeen(key) {
  try {
    const seen = readSeen();
    seen.add(key);
    window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* storage unavailable */
  }
}

function isAutomated() {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  return /bot|crawl|spider|slurp|headless|lighthouse|prerender/i.test(navigator.userAgent || '');
}

function decideMode(intro, reduced, search) {
  if (!intro || typeof window === 'undefined') return 'none';
  const params = new URLSearchParams(search || '');
  const flag = params.get('intro');
  if (flag === '0') return 'none';
  if (flag === '1') return 'full';
  if (flag === 'wipe' || flag === 'ascii' || flag === 'braille') return 'wipe';
  if (reduced || isAutomated()) return 'none';

  const groupKey = intro.seenGroupKey || intro.key;
  const seen = readSeen();
  if (seen.has(groupKey)) {
    if (groupKey === 'tools-detail' || groupKey === 'docs-math-detail') return 'none';
    return 'wipe';
  }
  return 'full';
}

function makeRun(intro, reduced, search, pathname) {
  const mode = decideMode(intro, reduced, search);
  return {
    key: intro ? intro.key : pathname,
    intro,
    mode,
    phase: mode === 'none' ? 'idle' : 'intro',
  };
}

export function IntroDirector({ children }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const intro = useMemo(() => resolveRouteIntro(location.pathname), [location.pathname]);
  const routeKey = intro ? intro.key : location.pathname;

  const [run, setRun] = useState(() => makeRun(intro, reduced, location.search, location.pathname));
  const [replayNonce, setReplayNonce] = useState(0);

  useLayoutEffect(() => {
    if (run.key !== routeKey) {
      setRun(makeRun(intro, reduced, location.search, location.pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    const onReplay = (e) => {
      if (!intro) return;
      const requestedMode = e?.detail?.mode || 'full';
      setReplayNonce((n) => n + 1);
      setRun({
        key: intro.key,
        intro,
        mode: requestedMode,
        phase: 'intro',
      });
    };
    window.addEventListener('zoth:replay-intro', onReplay);
    return () => window.removeEventListener('zoth:replay-intro', onReplay);
  }, [intro]);

  const current = run.key === routeKey ? run : makeRun(intro, reduced, location.search, location.pathname);

  const handleHandoff = useCallback((key) => {
    setRun((r) => (r.key === key && r.phase === 'intro' ? { ...r, phase: 'handoff' } : r));
  }, []);

  const handleDone = useCallback((key) => {
    setRun((r) => (r.key === key ? { ...r, phase: 'idle' } : r));
  }, []);

  const gate = useMemo(() => ({ phase: current.phase, routeKey: current.key }), [current.phase, current.key]);
  const showOverlay = current.mode !== 'none' && current.phase !== 'idle';

  return (
    <IntroGateContext.Provider value={gate}>
      {children}
      {showOverlay && (
        <IntroOverlay
          key={`${current.key}-${replayNonce}`}
          intro={current.intro}
          mode={current.mode}
          onHandoff={() => handleHandoff(current.key)}
          onDone={() => handleDone(current.key)}
        />
      )}
    </IntroGateContext.Provider>
  );
}

export function PageStage({ children }) {
  const phase = useIntroPhase();
  const reduced = useReducedMotion();
  const location = useLocation();
  const key = resolveRouteIntro(location.pathname)?.key || location.pathname;
  const released = phase !== 'intro';

  if (reduced) {
    return <div className="page-stage">{children}</div>;
  }

  return (
    <motion.div
      key={key}
      className="page-stage"
      initial={phase === 'idle' ? false : { opacity: 0, y: 12 }}
      animate={
        released
          ? {
              opacity: 1,
              y: 0,
              transitionEnd: { transform: 'none' },
            }
          : { opacity: 0, y: 12 }
      }
      transition={{ duration: 0.44, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

function IntroOverlay({ intro, mode, onHandoff, onDone }) {
  const narrow = useMediaQuery(NARROW_QUERY, { noSsr: true });
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const surfaceBg = dark ? '#08080B' : '#FAF8F3';
  const plateBg = dark ? '#0E1017' : '#F2EDE2';
  const primaryInk = dark ? '#F5F1E6' : '#101828';
  const mutedInk = dark ? '#9CA3AF' : '#475467';
  const accentInk = dark ? (intro.accent || '#D4AF37') : (intro.accentLight || '#7A5808');
  const hairline = dark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const emblemBorder = dark ? `${accentInk}45` : `${accentInk}38`;

  const started = useRef(false);
  const [handing, setHanding] = useState(false);

  const compact = mode === 'wipe';
  const splitDuration = compact ? 0.34 : 0.44;
  const scrambledLabel = useGlyphScramble(intro.label, compact ? 160 : 220, !handing);

  const beginHandoff = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setHanding(true);
    onHandoff();
    window.setTimeout(onDone, Math.round(splitDuration * 1000) + 40);
  }, [onHandoff, onDone, splitDuration]);

  useEffect(() => {
    markSeen(intro.seenGroupKey || intro.key);
    const holdMs = compact ? 260 : 680;
    const timer = window.setTimeout(beginHandoff, holdMs);
    return () => window.clearTimeout(timer);
  }, [compact, intro.key, intro.seenGroupKey, beginHandoff]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        beginHandoff();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beginHandoff]);

  useEffect(() => {
    if (handing) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [handing]);

  const insetPad = narrow ? 12 : 20;

  return (
    <div
      role="dialog"
      aria-label={`${intro.label} introduction`}
      onClick={beginHandoff}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        pointerEvents: handing ? 'none' : 'auto',
        cursor: handing ? 'default' : 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* ── UPPER SHUTTER (0% -> 50%): Top Index Strip + Framed Braille Plate ── */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: handing ? '-103%' : '0%' }}
        transition={{ duration: splitDuration, ease: EASE_APERTURE }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: surfaceBg,
          color: primaryInk,
          borderBottom: `1px solid ${accentInk}88`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: compact ? 16 : 24,
          paddingLeft: 24,
          paddingRight: 24,
          overflow: 'hidden',
        }}
      >
        {/* Architectural top inset frame */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: insetPad,
            left: insetPad,
            right: insetPad,
            bottom: 0,
            borderTop: `1px solid ${hairline}`,
            borderLeft: `1px solid ${hairline}`,
            borderRight: `1px solid ${hairline}`,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            pointerEvents: 'none',
          }}
        />

        {/* Single-line top index strip */}
        <div
          style={{
            position: 'absolute',
            top: narrow ? 24 : 34,
            left: narrow ? 24 : 38,
            right: narrow ? 24 : 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            pointerEvents: 'none',
            fontFamily: mono,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: mutedInk,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: accentInk,
                flexShrink: 0,
              }}
            />
            <span style={{ color: accentInk, fontWeight: 700, flexShrink: 0 }}>
              {intro.index} / {intro.total}
            </span>
            <span style={{ opacity: 0.4, flexShrink: 0 }}>·</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ZOTH STUDIO
            </span>
          </div>

          {!narrow && (
            <span style={{ color: mutedInk, whiteSpace: 'nowrap', flexShrink: 0, opacity: 0.85 }}>
              {intro.brailleBadge || 'ASTROLABE · SDF'}
            </span>
          )}
        </div>

        {/* Framed Sub-Pixel Braille + Bayer 8x8 Emblem — strictly above center seam */}
        <div
          style={{
            position: 'relative',
            width: compact ? 'min(236px, 72vw)' : 'min(304px, 78vw)',
            height: compact ? 72 : 106,
            borderRadius: 6,
            border: `1px solid ${emblemBorder}`,
            background: plateBg,
            overflow: 'hidden',
            boxShadow: dark
              ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
              : 'inset 0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          <AsciiBrailleIntroStage intro={intro} dark={dark} handing={handing} compact={compact} />
        </div>
      </motion.div>

      {/* ── LOWER SHUTTER (50% -> 100%): Kicker + Serif Title + Hairline + Skip ── */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: handing ? '103%' : '0%' }}
        transition={{ duration: splitDuration, ease: EASE_APERTURE }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: surfaceBg,
          color: primaryInk,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: compact ? 16 : 24,
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Architectural bottom inset frame */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: insetPad,
            right: insetPad,
            bottom: insetPad,
            borderBottom: `1px solid ${hairline}`,
            borderLeft: `1px solid ${hairline}`,
            borderRight: `1px solid ${hairline}`,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            pointerEvents: 'none',
          }}
        />

        {/* High-contrast category / runtime kicker */}
        <div
          style={{
            fontFamily: mono,
            fontSize: narrow ? 10 : 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: accentInk,
            marginBottom: 10,
            maxWidth: 'min(560px, 86vw)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {intro.kicker}
        </div>

        {/* Primary Display Serif Title (> 15:1 contrast in both Light and Dark modes) */}
        <div
          style={{
            fontFamily: display,
            fontSize: compact ? 'clamp(1.7rem, 3.6vw, 2.65rem)' : 'clamp(1.9rem, 4.4vw, 3.25rem)',
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            color: primaryInk,
            maxWidth: 'min(760px, 88vw)',
          }}
        >
          {scrambledLabel}
        </div>

        {/* Expanding architectural hairline rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
          style={{
            width: 'min(136px, 36vw)',
            height: 1.5,
            marginTop: 16,
            transformOrigin: '50% 50%',
            background: accentInk,
            opacity: 0.78,
          }}
        />

        {/* Clean dual-theme Skip control */}
        {!compact && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              beginHandoff();
            }}
            aria-label="Skip introduction"
            style={{
              pointerEvents: 'auto',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: narrow ? 24 : 32,
              minHeight: 38,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${hairline}`,
              background: plateBg,
              color: primaryInk,
              fontFamily: mono,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <span>Enter</span>
            <span style={{ color: mutedInk, fontSize: 9.5 }}>ESC</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default IntroDirector;
