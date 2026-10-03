import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { useReducedMotion } from 'framer-motion';

const NARROW_QUERY = '(max-width: 899.95px)';

/**
 * Full-viewport rendered intro. Wide viewports play the desktop cut;
 * narrow viewports play the mobile cut. Click, Enter, Space, or Escape skips.
 */
export default function MotionIntro({ page, onComplete }) {
  const narrow = useMediaQuery(NARROW_QUERY, { noSsr: true });
  const reduced = useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const done = useRef(false);
  const cut = narrow ? 'mobile' : 'desktop';

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setExiting(true);
    window.setTimeout(() => {
      if (onComplete) onComplete();
    }, 420);
  }, [onComplete]);

  useEffect(() => {
    if (reduced) finish();
  }, [reduced, finish]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Skip introduction"
      onClick={finish}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        margin: 0,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <video
        key={cut}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          background: '#000',
          pointerEvents: 'none',
        }}
      >
        <source src={`/intros/${page}-${cut}.webm`} type="video/webm" />
        <source src={`/intros/${page}-${cut}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}
