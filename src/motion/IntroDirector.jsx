/**
 * IntroDirector — route-level motion-edit intros with a cinematic handoff.
 *
 * One director owns every route's intro so the experience is identical across
 * the site and pages no longer manage their own overlay state.
 *
 *   ┌─────────────── full (first visit to a clip this session) ──────────────┐
 *   │ rendered clip plays  →  last 0.7s: "Aperture Seam" handoff begins      │
 *   │   · accent seam flares across the centre                               │
 *   │   · overlay splits open from the seam (mask), clip keeps playing       │
 *   │   · page is released and staggers in *through* the opening             │
 *   └────────────────────────────────────────────────────────────────────────┘
 *   ┌─────────────── wipe (repeat visit) ─────────────────────────────────────┐
 *   │ 0.4s title card (index + route label) → same aperture handoff          │
 *   └────────────────────────────────────────────────────────────────────────┘
 *   none → reduced motion, automation/bots, or `?intro=0`.
 *
 * `?intro=1` forces the full clip (handy for reviewing edits).
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import { IntroGateContext, useIntroPhase } from './IntroGate';
import { resolveRouteIntro, clipSources } from './routeIntros';

const SEEN_KEY = 'zoth-intros-seen-v2';
// Every rendered cut ends on a light "title card" that settles ~1s before the
// end; we hand off once it has been readable for a beat.
const HANDOFF_LEAD_S = 0.62;
// All cuts share one structure (measured with ffmpeg signalstats): the scene
// ramps to the white title card between ~1.55s and ~1.30s before the end.
// In dark mode we mask that ramp with the page colour, swap the clip to an
// inverted (dark) grade while hidden, then reveal a native-looking dark card.
const CARD_RAMP_START_S = 1.9;
const CARD_RAMP_FULL_S = 1.52;
const CARD_SWAP_S = 1.32;
const CARD_REVEAL_END_S = 1.05;
const DARK_CARD_FILTER = 'invert(1) hue-rotate(180deg) saturate(1.15)';
const STALL_TIMEOUT_MS = 2600;
const HARD_CAP_MS = 15000;
const NARROW_QUERY = '(max-width: 899.95px)';
const EASE_APERTURE = [0.76, 0, 0.24, 1];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

/* ── session memory ─────────────────────────────────────────────────────── */
function readSeen() {
  try {
    return new Set(JSON.parse(window.sessionStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}
function markSeen(clip) {
  try {
    const seen = readSeen();
    seen.add(clip);
    window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* storage unavailable — intros simply replay */
  }
}

function isAutomated() {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  return /bot|crawl|spider|slurp|headless|lighthouse|prerender/i.test(navigator.userAgent || '');
}

function decideMode(intro, reduced, search) {
  if (!intro || typeof window === 'undefined') return 'none';
  const flag = new URLSearchParams(search || '').get('intro');
  if (flag === '0') return 'none';
  if (flag === '1') return 'full';
  if (reduced || isAutomated()) return 'none';
  return readSeen().has(intro.clip) ? 'wipe' : 'full';
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

/* ── provider ───────────────────────────────────────────────────────────── */
export function IntroDirector({ children }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const intro = useMemo(() => resolveRouteIntro(location.pathname), [location.pathname]);
  const routeKey = intro ? intro.key : location.pathname;

  const [run, setRun] = useState(() => makeRun(intro, reduced, location.search, location.pathname));

  // Route changed → arm a new run before paint so the new page never flashes.
  useLayoutEffect(() => {
    if (run.key !== routeKey) setRun(makeRun(intro, reduced, location.search, location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  // Same render as a route change, before the layout effect lands: preview the run.
  const current = run.key === routeKey ? run : makeRun(intro, reduced, location.search, location.pathname);

  const handleHandoff = useCallback((key) => {
    setRun((r) => (r.key === key && r.phase === 'intro' ? { ...r, phase: 'handoff' } : r));
  }, []);
  const handleDone = useCallback((key) => {
    setRun((r) => (r.key === key ? { ...r, phase: 'idle' } : r));
  }, []);

  usePrefetchOnIntent();

  // The very first intro is revealed by the HTML preloader; every later one
  // closes in over the outgoing page so navigation never hard-cuts.
  const firstKey = useRef(run.key);
  const enter = current.key !== firstKey.current;

  const gate = useMemo(() => ({ phase: current.phase, routeKey: current.key }), [current.phase, current.key]);
  const showOverlay = current.mode !== 'none' && current.phase !== 'idle';

  return (
    <IntroGateContext.Provider value={gate}>
      {children}
      {showOverlay && (
        <IntroOverlay
          key={current.key}
          intro={current.intro}
          mode={current.mode}
          enter={enter}
          onHandoff={() => handleHandoff(current.key)}
          onDone={() => handleDone(current.key)}
        />
      )}
    </IntroGateContext.Provider>
  );
}

/* ── page stage: holds the page until handoff, then lands it ────────────── */
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
      initial={phase === 'idle' ? false : { opacity: 0, y: 22, scale: 0.988, filter: 'blur(6px)' }}
      animate={
        released
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              // Clear transform/filter afterwards so position:fixed descendants
              // (HUDs, modals, floating pets) are not trapped in this layer.
              transitionEnd: { transform: 'none', filter: 'none' },
            }
          : { opacity: 0, y: 22, scale: 0.988, filter: 'blur(6px)' }
      }
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: phase === 'handoff' ? 0.1 : 0 }}
      style={{ transformOrigin: '50% 35vh' }}
    >
      {children}
    </motion.div>
  );
}

/* ── overlay ────────────────────────────────────────────────────────────── */
function IntroOverlay({ intro, mode, enter, onHandoff, onDone }) {
  const narrow = useMediaQuery(NARROW_QUERY, { noSsr: true });
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const pageBg = theme.palette.background.default;
  const cut = narrow ? 'mobile' : 'desktop';
  const videoRef = useRef(null);
  const started = useRef(false);
  const [handing, setHanding] = useState(false);

  const open = useMotionValue(enter ? 1 : 0); // 0 = closed, 1 = aperture fully open
  const seam = useMotionValue(0); // seam flare scaleX
  const progress = useMotionValue(0); // clip playback progress

  const gap = useTransform(open, (v) => v * 50);
  const mask = useTransform(gap, (h) =>
    h <= 0.01
      ? 'none'
      : `linear-gradient(to bottom, #000 0%, #000 calc(50% - ${h}% - 2px), transparent calc(50% - ${h}% + 2px), transparent calc(50% + ${h}% - 2px), #000 calc(50% + ${h}% + 2px), #000 100%)`,
  );
  const topEdge = useTransform(gap, (h) => `calc(50% - ${h}%)`);
  const bottomEdge = useTransform(gap, (h) => `calc(50% + ${h}%)`);
  const edgeOpacity = useTransform(open, [0, 0.8, 1], [1, 0.9, 0]);
  const videoScale = useTransform(open, [0, 1], [1, 1.05]);
  // Wash the clip's closing title card into the live page background so the
  // halves that slide away are the page's own colour (no white→dark flash).
  const cardWash = useMotionValue(0); // dark-mode title-card masking
  const washOpacity = useTransform([open, cardWash], ([o, c]) => Math.max(Math.min(1, o / 0.42), c));
  const leakOpacity = useTransform(open, [0, 0.25, 1], [0, dark ? 0.28 : 0.14, 0]);
  const leakScaleY = useTransform(open, [0, 1], [0.2, 2.4]);

  const beginHandoff = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setHanding(true);
    onHandoff();
    if (mode === 'full') animate(seam, 1, { duration: 0.28, ease: EASE_OUT_EXPO });
    animate(open, 1, {
      duration: mode === 'wipe' ? 0.66 : 0.95,
      delay: mode === 'wipe' ? 0 : 0.18,
      ease: EASE_APERTURE,
      onComplete: onDone,
    });
  }, [mode, onHandoff, onDone, open, seam]);

  // Enter: shutters close in from the edges onto the seam.
  useEffect(() => {
    if (!enter) return;
    animate(open, 0, { duration: 0.28, ease: [0.65, 0, 0.35, 1] });
    if (mode === 'full') animate(seam, [0, 1, 0], { duration: 0.6, times: [0, 0.45, 1], ease: 'easeInOut' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wipe: draw the seam + title card, then open.
  useEffect(() => {
    if (mode !== 'wipe') return undefined;
    animate(seam, 1, { duration: 0.34, delay: enter ? 0.08 : 0, ease: EASE_OUT_EXPO });
    const t = window.setTimeout(beginHandoff, enter ? 560 : 420);
    return () => window.clearTimeout(t);
  }, [mode, enter, seam, beginHandoff]);

  // Full: remember the clip, watch playback, hand off just before the end.
  useEffect(() => {
    if (mode !== 'full') return undefined;
    markSeen(intro.clip);
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        const remaining = v.duration - v.currentTime;
        progress.set(Math.min(1, v.currentTime / v.duration));
        if (dark) {
          let c = 0;
          if (remaining <= CARD_RAMP_START_S && remaining > CARD_SWAP_S) {
            c = (CARD_RAMP_START_S - remaining) / (CARD_RAMP_START_S - CARD_RAMP_FULL_S);
          } else if (remaining <= CARD_SWAP_S && remaining > CARD_REVEAL_END_S) {
            c = (remaining - CARD_REVEAL_END_S) / (CARD_SWAP_S - CARD_REVEAL_END_S);
          }
          cardWash.set(Math.max(0, Math.min(1, c)));
          const wantDark = remaining <= CARD_SWAP_S;
          if (wantDark !== (v.dataset.grade === 'dark')) {
            v.dataset.grade = wantDark ? 'dark' : '';
            v.style.filter = wantDark ? DARK_CARD_FILTER : '';
          }
        }
        if (remaining <= (intro.handoffLead || HANDOFF_LEAD_S)) beginHandoff();
      }
      if (!started.current) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    const stall = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2 || v.paused) beginHandoff();
    }, STALL_TIMEOUT_MS);
    const cap = window.setTimeout(beginHandoff, HARD_CAP_MS);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(stall);
      window.clearTimeout(cap);
    };
  }, [mode, dark, intro.clip, intro.handoffLead, progress, cardWash, beginHandoff]);

  // Autoplay can be refused (power saver, iOS low-power) — never trap the user.
  useEffect(() => {
    if (mode !== 'full') return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => beginHandoff());
  }, [mode, cut, beginHandoff]);

  // Skip keys.
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

  // Lock scroll only while the page is fully covered.
  useEffect(() => {
    if (handing) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [handing]);

  const accent = intro.accent;

  return (
    <>
      {/* Masked layer: splits open from the seam during handoff */}
      <motion.div
        role="dialog"
        aria-label={`${intro.label} introduction`}
        onClick={beginHandoff}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99990,
          background: mode === 'wipe' || dark ? pageBg : '#000',
          overflow: 'hidden',
          cursor: handing ? 'default' : 'pointer',
          pointerEvents: handing ? 'none' : 'auto',
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {mode === 'full' ? (
          <motion.video
            key={cut}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={beginHandoff}
            onError={beginHandoff}
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: 'transparent',
              pointerEvents: 'none',
              scale: videoScale,
            }}
          >
            {clipSources(intro.clip, cut).map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </motion.video>
        ) : (
          <TitleCard intro={intro} handing={handing} dark={dark} text={theme.palette.text.primary} />
        )}

        {mode === 'full' && (
          <motion.div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, background: pageBg, opacity: washOpacity, pointerEvents: 'none' }}
          />
        )}

        {/* subtle vignette keeps the skip control legible over bright frames */}
        {mode === 'full' && <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 120% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)',
          }}
        />}

        {mode === 'full' && <IntroHud intro={intro} progress={progress} handing={handing} onSkip={beginHandoff} />}
      </motion.div>

      {/* Light leak — brief accent bloom through the opening */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: '50%',
          height: '40vh',
          marginTop: '-20vh',
          zIndex: 99991,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accent}, transparent 70%)`,
          mixBlendMode: 'screen',
          opacity: leakOpacity,
          scaleY: leakScaleY,
        }}
      />

      {/* Seam edges — ride the aperture as it opens */}
      {[topEdge, bottomEdge].map((top, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top,
            height: 1.5,
            marginTop: -0.75,
            zIndex: 99992,
            pointerEvents: 'none',
            transformOrigin: '50% 50%',
            scaleX: seam,
            opacity: edgeOpacity,
            background: `linear-gradient(90deg, transparent 0%, ${accent} 22%, ${dark ? '#FFF6D8' : accent} 50%, ${accent} 78%, transparent 100%)`,
            boxShadow: dark ? `0 0 8px ${accent}cc, 0 0 28px ${accent}40` : `0 0 6px ${accent}99`,
          }}
        />
      ))}
    </>
  );
}

function TitleCard({ intro, handing, dark, text }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 8 }}
      animate={handing ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
      transition={{ duration: handing ? 0.22 : 0.34, delay: handing ? 0 : 0.16, ease: EASE_OUT_EXPO }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'calc(50% + 18px)',
        textAlign: 'center',
        padding: '0 24px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.28em',
          color: dark ? intro.accent : text,
          opacity: dark ? 1 : 0.6,
          marginBottom: 10,
        }}
      >
        {intro.index} / {intro.total}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 'clamp(1.9rem, 4.5vw, 3.4rem)',
          lineHeight: 1.05,
          color: text,
          letterSpacing: '0.01em',
        }}
      >
        {intro.label}
      </div>
    </motion.div>
  );
}

// The rendered cuts carry their own HUD (frame counter, progress), so ours is
// a single centred skip control with a playback ring — nothing that competes.
function IntroHud({ intro, progress, handing, onSkip }) {
  const RING = 2 * Math.PI * 15;
  const dash = useTransform(progress, (p) => RING * (1 - p));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: handing ? 0 : 1 }}
      transition={{ duration: handing ? 0.2 : 0.6, delay: handing ? 0 : 0.35 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        aria-label="Skip introduction"
        style={{
          pointerEvents: 'auto',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'max(20px, env(safe-area-inset-bottom))',
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px 6px 8px',
          borderRadius: 999,
          border: '1px solid rgba(245,241,230,0.18)',
          background: 'rgba(8,8,11,0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#F5F1E6',
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <circle cx="17" cy="17" r="15" fill="none" stroke="rgba(245,241,230,0.16)" strokeWidth="2" />
          <motion.circle
            cx="17"
            cy="17"
            r="15"
            fill="none"
            stroke={intro.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING}
            style={{ strokeDashoffset: dash, rotate: -90, transformOrigin: '50% 50%' }}
          />
          <path d="M14 12 L21 17 L14 22 Z" fill="#F5F1E6" />
        </svg>
        Skip intro
      </button>

    </motion.div>
  );
}

/* ── prefetch the next clip when the user shows intent on a nav link ───── */
function usePrefetchOnIntent() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const done = new Set();
    const probe = document.createElement('video');
    const ext = probe.canPlayType && probe.canPlayType('video/webm') ? 'webm' : 'mp4';
    const onIntent = (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href^="/"]') : null;
      if (!a) return;
      const intro = resolveRouteIntro(new URL(a.href, window.location.origin).pathname);
      if (!intro || done.has(intro.clip) || readSeen().has(intro.clip)) return;
      done.add(intro.clip);
      const cut = window.matchMedia(NARROW_QUERY).matches ? 'mobile' : 'desktop';
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = `/intros/${intro.clip}-${cut}.${ext}`;
      document.head.appendChild(link);
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    document.addEventListener('touchstart', onIntent, { passive: true });
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
      document.removeEventListener('touchstart', onIntent);
    };
  }, []);
}

export default IntroDirector;
