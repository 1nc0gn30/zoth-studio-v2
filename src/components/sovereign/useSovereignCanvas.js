/**
 * useSovereignCanvas — the single animation loop every sovereign scene uses.
 *
 * Why a shared hook instead of inline rAF (the shape 30 existing tool
 * components use):
 *   - ONE cancellation path, so a route change can never leave a loop writing
 *     to a detached canvas;
 *   - the loop is gated on IntersectionObserver + document.visibilityState, so
 *     52 tool pages no longer keep burning CPU when scrolled out of view or
 *     backgrounded (the mandate's thermal requirement);
 *   - every renderer call is inside try/catch and errors become React STATE,
 *     never a throw during render — that is what guarantees "zero white-page
 *     errors, zero React state crashes";
 *   - prefers-reduced-motion renders exactly one static frame;
 *   - devicePixelRatio is clamped to 2 and applied via setTransform once per
 *     resize, so the scenes stay resolution-independent and cheap on HiDPI.
 *
 * SSR-safe: all browser access happens inside useEffect.
 */

import { useEffect, useRef, useState } from 'react';
import { getRenderer, sceneAccent } from './renderers.js';
import { hashSeed, rng as makeRng, SOV } from './palette.js';

const DEFAULT_FPS = 30;

export function useSovereignCanvas({
  canvasRef,
  variant = 'braille-orbit',
  seed = 'zoth',
  fps = DEFAULT_FPS,
  intensity = 1,
  active = true,
  forceDots = false,
}) {
  const [state, setState] = useState({ status: 'idle', fps: 0, stats: null, glyphs: null, error: null });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!active) {
      setState((s) => (s.status === 'idle' ? s : { ...s, status: 'idle' }));
      return undefined;
    }
    const canvas = canvasRef && canvasRef.current;
    if (!canvas) return undefined;

    let ctx = null;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      ctx = null;
    }
    if (!ctx) {
      setState({ status: 'unsupported', fps: 0, stats: null, glyphs: null, error: null });
      return undefined;
    }

    const renderer = getRenderer(variant);
    const accent = sceneAccent(seed, variant);
    let alive = true;
    let raf = 0;
    let dims = { w: 0, h: 0, dpr: 1 };
    let last = 0;          // last painted timestamp
    let frames = 0;        // frames in the current measurement window
    let windowStart = 0;   // measurement window start
    let reportedFps = -1;
    let lastT = 0;         // previous paint time (seconds), for dt
    let visible = true;
    let started = false;

    const reduceMotion = (() => {
      try {
        return typeof window !== 'undefined'
          && typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {
        return false;
      }
    })();

    const measure = () => {
      const dpr = Math.min(2, Math.max(1, (typeof window !== 'undefined' && window.devicePixelRatio) || 1));
      const w = Math.max(0, Math.round(canvas.clientWidth || 0));
      const h = Math.max(0, Math.round(canvas.clientHeight || 0));
      if (w !== dims.w || h !== dims.h || dpr !== dims.dpr) {
        dims = { w, h, dpr };
        if (w > 0 && h > 0) {
          const pw = Math.round(w * dpr);
          const ph = Math.round(h * dpr);
          if (canvas.width !== pw) canvas.width = pw;
          if (canvas.height !== ph) canvas.height = ph;
          try {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          } catch (e) {
            /* jsdom / stub context */
          }
          // Scratch buffers keyed on size must be rebuilt after a resize.
          if (ctx.__sovCache) ctx.__sovCache.key = '';
        }
      }
      return dims;
    };

    const paint = (ts) => {
      const d = measure();
      if (d.w <= 0 || d.h <= 0) return null;
      const t = ts / 1000;
      const dt = lastT ? Math.min(0.25, Math.max(0.001, t - lastT)) : 1 / 60;
      lastT = t;
      try {
        const stats = renderer(ctx, {
          w: d.w,
          h: d.h,
          dpr: d.dpr,
          t,
          dt,
          reduced: reduceMotion,
          intensity,
          seed: hashSeed(seed),
          forceDots,
          rng: makeRng(`${seed}:${Math.floor(t * 2)}`),
        });
        return stats || null;
      } catch (e) {
        // A scene may never take the page down: stop the loop, surface state.
        if (alive) {
          setState({ status: 'error', fps: 0, stats: null, glyphs: null, error: String(e && e.message ? e.message : e) });
        }
        alive = false;
        return null;
      }
    };

    const frame = (ts) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const interval = 1000 / Math.max(1, fps);
      if (last && ts - last < interval) return;
      last = ts;
      const stats = paint(ts);
      if (stats) {
        stateRef.current.stats = stats;
        if (stats.glyphs !== undefined && stateRef.current.glyphs !== stats.glyphs) {
          setState((s) => ({ ...s, glyphs: stats.glyphs }));
        }
      }
      if (!windowStart) windowStart = ts;
      frames += 1;
      const elapsed = ts - windowStart;
      if (elapsed >= 1000) {
        const measured = Math.round((frames * 1000) / elapsed);
        frames = 0;
        windowStart = ts;
        if (measured !== reportedFps) {
          reportedFps = measured;
          setState((s) => ({ ...s, status: 'live', fps: measured }));
        } else if (stateRef.current.status !== 'live') {
          setState((s) => ({ ...s, status: 'live' }));
        }
        if (stateRef.current.status !== 'live') setState((s) => ({ ...s, status: 'live' }));
      }
    };

    // First paint synchronously so the band is never an empty black rectangle
    // (prerender/hydration parity: server markup has no canvas pixels at all).
    const kick = (ts) => {
      if (!alive || started) return;
      started = true;
      const stats = paint(typeof ts === 'number' ? ts : performance.now());
      stateRef.current.stats = stats;
      if (reduceMotion) {
        setState((s) => ({ ...s, status: 'static', fps: 0, stats, glyphs: stats ? stats.glyphs : null }));
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // First paint (synchronous) so the band is never an empty black rectangle.
    // `kick` also decides the reduced-motion case internally: one static frame.
    kick(performance.now());

    const onVisibility = () => {
      visible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    };
    onVisibility();

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      try {
        io = new IntersectionObserver((entries) => {
          const e = entries[0];
          visible = !!(e && e.isIntersecting) && (typeof document === 'undefined' || document.visibilityState !== 'hidden');
        }, { rootMargin: '120px' });
        io.observe(canvas);
      } catch (err) {
        io = null;
      }
    }

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      try {
        ro = new ResizeObserver(() => {
          measure();
          if (reduceMotion) paint(performance.now());
        });
        ro.observe(canvas);
      } catch (err) {
        ro = null;
      }
    }
    if (typeof window !== 'undefined') window.addEventListener('resize', measure);
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('resize', measure);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    };
    // Deliberately narrow: changing the scene rebuilds the loop, changing fps
    // does not (it is read once per effect via the closure above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, variant, seed, canvasRef, intensity, forceDots, fps]);

  return state;
}

/** Shared scene props so a tool page and its legend agree on colours. */
export const SOV_SCENE_FALLBACK = { bg: SOV.obsidian, line: 'rgba(212,175,55,0.28)' };

export default useSovereignCanvas;
