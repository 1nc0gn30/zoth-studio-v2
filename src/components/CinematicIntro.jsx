import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PALETTES = {
  gold: {
    primary: '#D4AF37',
    glow: 'rgba(212, 175, 55, 0.45)',
    bg: '#08080C',
    particle: 'rgba(212, 175, 55, 0.65)',
    line: 'rgba(212, 175, 55, 0.18)',
    tag: 'SOVEREIGN HARDWARE ENCLAVE',
  },
  emerald: {
    primary: '#34D399',
    glow: 'rgba(52, 211, 153, 0.45)',
    bg: '#050D0A',
    particle: 'rgba(52, 211, 153, 0.65)',
    line: 'rgba(52, 211, 153, 0.18)',
    tag: 'AIR-GAPPED SWARM MESH',
  },
  crimson: {
    primary: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.45)',
    bg: '#0D0507',
    particle: 'rgba(239, 68, 68, 0.65)',
    line: 'rgba(239, 68, 68, 0.18)',
    tag: 'OFFENSIVE THREAT VECTOR',
  },
  cyan: {
    primary: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.45)',
    bg: '#040B10',
    particle: 'rgba(0, 240, 255, 0.65)',
    line: 'rgba(0, 240, 255, 0.18)',
    tag: 'DETERMINISTIC COMPILER',
  },
  purple: {
    primary: '#C084FC',
    glow: 'rgba(192, 132, 252, 0.45)',
    bg: '#0A0612',
    particle: 'rgba(192, 132, 252, 0.65)',
    line: 'rgba(192, 132, 252, 0.18)',
    tag: 'NEURAL SPATIAL MATRIX',
  },
};

/**
 * High-Octane 60fps Motion Video & Canvas Cinematic Intro Overlay.
 * Runs as a fixed full-screen overlay above the fully hydrated page.
 * Never delays or unmounts the underlying page structure.
 */
export default function CinematicIntro({
  words = ['WELCOME', 'TO', 'ZOTH OS'],
  themeColor = 'gold',
  subtitle = null,
  durationPerWord = 750,
  onComplete,
}) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef(null);

  const palette = PALETTES[themeColor] || PALETTES.gold;
  const activeSubtitle = subtitle || palette.tag;

  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 550);
  }, [isExiting, onComplete]);

  // Keyboard skip listener (ESC or Space)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleFinish]);

  // Step through words with punchy cinematic timing
  useEffect(() => {
    if (isExiting) return;
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, durationPerWord);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        handleFinish();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, words.length, durationPerWord, isExiting, handleFinish]);

  // 60fps Ambient Motion Canvas (Cybernetic Particles + Dynamic Constellation Grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = Math.min(55, Math.floor(window.innerWidth / 25));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 2 + 1,
    }));

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial glowing iris center
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.65
      );
      gradient.addColorStop(0, palette.glow.replace('0.45', '0.12'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particle mesh
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = palette.particle;
        ctx.fill();

        // Connect nearby points with tactical laser lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = palette.line;
            ctx.lineWidth = (1 - dist / 130) * 1.2;
            ctx.stroke();
          }
        }
      }

      // Horizontal Scanline Sweep
      const sweepY = (Math.sin(t) * 0.5 + 0.5) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(canvas.width, sweepY);
      ctx.strokeStyle = palette.glow.replace('0.45', '0.22');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [palette]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: palette.bg,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={handleFinish}
        >
          {/* Background Motion Graphics Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 2.39:1 Cinematic Letterbox Bar - Top */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 3,
              width: '100%',
              height: { xs: 45, sm: 60, md: 75 },
              bgcolor: '#000000',
              borderBottom: `1px solid ${palette.primary}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 4 },
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.65rem', sm: '0.74rem' },
                color: palette.primary,
                letterSpacing: '0.15em',
                fontWeight: 750,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: palette.primary,
                  boxShadow: `0 0 8px ${palette.primary}`,
                  display: 'inline-block',
                }}
              />
              SYSTEM // {activeSubtitle}
            </Typography>
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.65rem', sm: '0.74rem' },
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              FRAME 00{Math.min(currentIndex + 1, words.length)} / 00{words.length}
            </Typography>
          </Box>

          {/* Center Stage: Kinetic Framed Typography */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
              my: 'auto',
            }}
          >
            <AnimatePresence mode="wait">
              {currentIndex < words.length && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.88, y: 15, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.12, y: -15, filter: 'blur(8px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: mono,
                      fontSize: { xs: '2.4rem', sm: '4.2rem', md: '5.8rem', lg: '7rem' },
                      fontWeight: 900,
                      color: palette.primary,
                      letterSpacing: { xs: '0.08em', sm: '0.14em' },
                      textTransform: 'uppercase',
                      textShadow: `0 0 25px ${palette.glow}, 0 0 60px ${palette.glow}`,
                      lineHeight: 1.1,
                      mb: 1.5,
                    }}
                  >
                    {words[currentIndex]}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: mono,
                      fontSize: { xs: '0.72rem', sm: '0.85rem' },
                      color: 'rgba(255, 255, 255, 0.65)',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      display: 'block',
                    }}
                  >
                    ZOTH ARCHITECTURAL MATRIX // RING-0 ISOLATION
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* 2.39:1 Cinematic Letterbox Bar - Bottom */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 3,
              width: '100%',
              height: { xs: 45, sm: 60, md: 75 },
              bgcolor: '#000000',
              borderTop: `1px solid ${palette.primary}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 4 },
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.1em',
              }}
            >
              ZERO CLOUD TELEMETRY · STRICT LOCAL ENCLAVE
            </Typography>

            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                color: palette.primary,
                letterSpacing: '0.12em',
                fontWeight: 700,
                opacity: 0.85,
              }}
            >
              [CLICK OR ESC TO ENTER]
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
