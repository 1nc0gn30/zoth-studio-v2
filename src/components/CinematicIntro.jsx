import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getAsciiBanner, isCelticWord } from '../data/asciiBanners';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const celtic = '"Celtic Garamond", Georgia, serif';

const PALETTES = {
  gold: {
    primary: '#D4AF37',
    secondary: '#F5E6AB',
    glow: 'rgba(212, 175, 55, 0.45)',
    bg: '#070709',
    particle: 'rgba(212, 175, 55, 0.65)',
    line: 'rgba(212, 175, 55, 0.18)',
    tag: 'SOVEREIGN HARDWARE ENCLAVE',
    badge: 'ORACLE RING-0',
  },
  emerald: {
    primary: '#34D399',
    secondary: '#A7F3D0',
    glow: 'rgba(52, 211, 153, 0.45)',
    bg: '#040B08',
    particle: 'rgba(52, 211, 153, 0.65)',
    line: 'rgba(52, 211, 153, 0.18)',
    tag: 'AIR-GAPPED SWARM MESH',
    badge: 'NEURAL CONDUIT',
  },
  crimson: {
    primary: '#EF4444',
    secondary: '#FECACA',
    glow: 'rgba(239, 68, 68, 0.45)',
    bg: '#0A0406',
    particle: 'rgba(239, 68, 68, 0.65)',
    line: 'rgba(239, 68, 68, 0.18)',
    tag: 'OFFENSIVE THREAT VECTOR',
    badge: 'CVE EXPLOIT MATRIX',
  },
  cyan: {
    primary: '#00F0FF',
    secondary: '#BAE6FD',
    glow: 'rgba(0, 240, 255, 0.45)',
    bg: '#03080C',
    particle: 'rgba(0, 240, 255, 0.65)',
    line: 'rgba(0, 240, 255, 0.18)',
    tag: 'DETERMINISTIC COMPILER',
    badge: 'BYZANTINE QUORUM',
  },
  purple: {
    primary: '#C084FC',
    secondary: '#E9D5FF',
    glow: 'rgba(192, 132, 252, 0.45)',
    bg: '#08040F',
    particle: 'rgba(192, 132, 252, 0.65)',
    line: 'rgba(192, 132, 252, 0.18)',
    tag: 'NEURAL SPATIAL MATRIX',
    badge: 'STDP SYNAPSE',
  },
};

/**
 * Native Web Audio synthesizer for zero-dependency cybernetic sound cues.
 * Plays high-tech shutter chirps on ASCII frames and deep sacred harmonics on Celtic frames.
 */
function playCyberBlip(isCeltic = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (isCeltic) {
      // Sacred resonant harmonic (110Hz -> 220Hz with soft tail)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Tactical mechanical camera shutter / laser blip (620Hz -> 310Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(310, now + 0.07);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Fail silently if browser audio autoplay policy prohibits it
  }
}

function AsciiTypewriterBanner({ word, palette, mono }) {
  const raw = getAsciiBanner(word);
  const lines = useMemo(() => (raw ? raw.split('\n') : [word]), [raw, word]);
  const [visibleLineCount, setVisibleLineCount] = useState(1);

  useEffect(() => {
    setVisibleLineCount(1);
    let current = 1;
    const interval = setInterval(() => {
      current++;
      setVisibleLineCount(current);
      if (current >= lines.length) {
        clearInterval(interval);
      }
    }, 36);
    return () => clearInterval(interval);
  }, [lines]);

  const displayedText = lines.slice(0, visibleLineCount).join('\n');
  const isComplete = visibleLineCount >= lines.length;

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        component="pre"
        sx={{
          fontFamily: mono,
          fontSize: {
            xs: 'clamp(0.30rem, 1.25vw, 0.54rem)',
            sm: 'clamp(0.52rem, 1.45vw, 0.84rem)',
            md: 'clamp(0.78rem, 1.7vw, 1.10rem)',
            lg: 'clamp(0.92rem, 1.9vw, 1.28rem)',
          },
          lineHeight: { xs: 1.06, sm: 1.10, md: 1.14 },
          fontWeight: 800,
          background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.secondary} 20%, #FFFFFF 48%, ${palette.secondary} 76%, ${palette.primary} 100%)`,
          backgroundSize: '250% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'asciiSnakeGlow 2.4s linear infinite',
          filter: `drop-shadow(0 0 10px ${palette.glow}) drop-shadow(0 0 24px ${palette.glow})`,
          margin: 0,
          whiteSpace: 'pre',
          overflow: 'visible',
          textAlign: 'center',
          userSelect: 'none',
          position: 'relative',
          display: 'inline-block',
          letterSpacing: '-0.02em',
        }}
      >
        {displayedText}
        {!isComplete && (
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              WebkitTextFillColor: palette.secondary,
              animation: 'asciiCursorBlink 0.4s infinite',
              verticalAlign: 'bottom',
              ml: 0.5,
              fontSize: '1em',
            }}
          >
            █
          </Box>
        )}
      </Box>

      {/* Laser Scanning Beam Sweep across the banner */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.primary} 50%, transparent 100%)`,
          boxShadow: `0 0 12px ${palette.primary}`,
          animation: 'asciiLaserSweep 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

/**
 * BRAG-Inspired High-Octane Cinematic Motion Video Intro.
 * Dual-Typography Engine:
 * - Precomputed glowing ASCII art typography for kinetic words.
 * - Grand Sovereign Celtic Garamond serif typography for ZOTH OS.
 * - Anamorphic 2.39:1 letterboxing, tactical HUD corner brackets, live telemetry, and Web Audio.
 */
export default function CinematicIntro({
  words = ['WELCOME', 'TO', 'ZOTH OS'],
  themeColor = 'gold',
  subtitle = null,
  durationPerWord = 780,
  onComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef(null);

  const palette = PALETTES[themeColor] || PALETTES.gold;
  const activeSubtitle = subtitle || palette.tag;

  const currentWord = words[currentIndex] || '';
  const currentIsCeltic = isCelticWord(currentWord);

  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 550);
  }, [isExiting, onComplete]);

  // Keyboard skip listener (ESC, Space, Enter)
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

  // Sound cue on frame advance
  useEffect(() => {
    if (isExiting) return;
    if (currentIndex < words.length) {
      playCyberBlip(isCelticWord(words[currentIndex]));
    }
  }, [currentIndex, words, isExiting]);

  // Step through frames with punchy cinematic pacing
  useEffect(() => {
    if (isExiting) return;
    if (currentIndex < words.length) {
      // Allow extra dwell time for the grand Celtic finale frame
      const dwell = isCelticWord(words[currentIndex])
        ? Math.max(durationPerWord + 280, 1050)
        : durationPerWord;
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, dwell);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        handleFinish();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, words, durationPerWord, isExiting, handleFinish]);

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

    const particleCount = Math.min(50, Math.floor(window.innerWidth / 28));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1,
      radius: Math.random() * 1.8 + 1,
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
      gradient.addColorStop(0, palette.glow.replace('0.45', '0.14'));
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

        // Connect nearby points with laser mesh lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = palette.line;
            ctx.lineWidth = (1 - dist / 125) * 1.1;
            ctx.stroke();
          }
        }
      }

      // Horizontal Scanline Sweep
      const sweepY = (Math.sin(t) * 0.5 + 0.5) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(canvas.width, sweepY);
      ctx.strokeStyle = palette.glow.replace('0.45', '0.2');
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
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
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

          {/* CRT Scanline Overlay Texture */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2,
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)',
              opacity: 0.6,
            }}
          />

          {/* 2.39:1 Cinematic Letterbox Bar - Top */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 4,
              width: '100%',
              height: { xs: 52, sm: 64, md: 76 },
              bgcolor: '#000000',
              borderBottom: `1px solid ${palette.primary}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.62rem', sm: '0.74rem' },
                color: palette.primary,
                letterSpacing: '0.14em',
                fontWeight: 750,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: palette.primary,
                  boxShadow: `0 0 10px ${palette.primary}`,
                  display: 'inline-block',
                  animation: 'pulse 1.6s infinite ease-in-out',
                }}
              />
              SYSTEM // {activeSubtitle}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: { xs: '0.58rem', sm: '0.7rem' },
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.12em',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                2.39:1 ANAMORPHIC // 60 FPS
              </Typography>
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: { xs: '0.62rem', sm: '0.74rem' },
                  color: palette.secondary,
                  letterSpacing: '0.14em',
                  fontWeight: 700,
                  bgcolor: `${palette.primary}15`,
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '3px',
                  border: `1px solid ${palette.primary}33`,
                }}
              >
                FRAME 00{Math.min(currentIndex + 1, words.length)} / 00{words.length}
              </Typography>
            </Box>
          </Box>

          {/* Center Stage: Kinetic Framed Typography Box */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 2, sm: 4 },
              my: 'auto',
              width: '100%',
              maxWidth: '1280px',
            }}
          >
            {/* Tactical BRAG Reticle Retaining Box */}
            <Box
              sx={{
                position: 'relative',
                px: { xs: 2, sm: 4, md: 6 },
                py: { xs: 3, sm: 5, md: 6 },
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Tactical Corner Brackets */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: { xs: 16, sm: 26 },
                  height: { xs: 16, sm: 26 },
                  borderTop: `2px solid ${palette.primary}`,
                  borderLeft: `2px solid ${palette.primary}`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: 16, sm: 26 },
                  height: { xs: 16, sm: 26 },
                  borderTop: `2px solid ${palette.primary}`,
                  borderRight: `2px solid ${palette.primary}`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: { xs: 16, sm: 26 },
                  height: { xs: 16, sm: 26 },
                  borderBottom: `2px solid ${palette.primary}`,
                  borderLeft: `2px solid ${palette.primary}`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: { xs: 16, sm: 26 },
                  height: { xs: 16, sm: 26 },
                  borderBottom: `2px solid ${palette.primary}`,
                  borderRight: `2px solid ${palette.primary}`,
                }}
              />

              {/* Animated Central Stage */}
              <AnimatePresence mode="wait">
                {currentIndex < words.length && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 12, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, y: -12, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    {currentIsCeltic ? (
                      /* ========================================================== */
                      /* ZOTH OS: Grand Sovereign Celtic Garamond Serif Typography   */
                      /* ========================================================== */
                      <Box sx={{ py: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: mono,
                            fontSize: { xs: '0.65rem', sm: '0.85rem' },
                            color: palette.secondary,
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            display: 'block',
                            mb: 1.5,
                            opacity: 0.9,
                          }}
                        >
                          ⟡ ⟐ SOVEREIGN IMPERIAL ARCHITECTURE ⟐ ⟡
                        </Typography>

                        <Typography
                          variant="h1"
                          sx={{
                            fontFamily: celtic,
                            fontSize: {
                              xs: '3.6rem',
                              sm: '5.8rem',
                              md: '7.8rem',
                              lg: '9.2rem',
                            },
                            fontWeight: 800,
                            letterSpacing: { xs: '0.04em', sm: '0.08em' },
                            background:
                              'linear-gradient(135deg, #FFFFFF 0%, #F6E29E 28%, #D4AF37 58%, #AA7C11 88%, #FFE57F 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter:
                              'drop-shadow(0 0 28px rgba(212, 175, 55, 0.75)) drop-shadow(0 0 70px rgba(212, 175, 55, 0.4))',
                            lineHeight: 1,
                            my: 0.5,
                            textTransform: 'uppercase',
                          }}
                        >
                          {currentWord}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: mono,
                            fontSize: { xs: '0.62rem', sm: '0.78rem' },
                            color: 'rgba(255, 255, 255, 0.7)',
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            display: 'block',
                            mt: 2,
                          }}
                        >
                          ᚱ ᛖ ᛁ ᚷ ᚾ // ZERO-EGRESS AIR-GAPPED HARDWARE MATRIX // ᚱ ᛖ ᛁ ᚷ ᚾ
                        </Typography>
                      </Box>
                    ) : (
                      /* ========================================================== */
                      /* GENERAL WORDS: Kinetic High-Impact ASCII Typography Banner  */
                      /* ========================================================== */
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: mono,
                            fontSize: { xs: '0.62rem', sm: '0.75rem' },
                            color: 'rgba(255, 255, 255, 0.5)',
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            mb: 1.5,
                          }}
                        >
                          [ KINETIC ASCII VECTOR FRAME 0{currentIndex + 1} ]
                        </Typography>

                        <style>{`
                          @keyframes asciiSnakeGlow {
                            0% { background-position: -250% 0; }
                            100% { background-position: 250% 0; }
                          }
                          @keyframes asciiLaserSweep {
                            0% { top: 0%; opacity: 0.2; }
                            50% { opacity: 0.9; }
                            100% { top: 100%; opacity: 0.2; }
                          }
                          @keyframes asciiCursorBlink {
                            0%, 49% { opacity: 1; }
                            50%, 100% { opacity: 0; }
                          }
                        `}</style>

                        <AsciiTypewriterBanner
                          word={currentWord}
                          palette={palette}
                          mono={mono}
                        />

                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: mono,
                            fontSize: { xs: '0.6rem', sm: '0.72rem' },
                            color: 'rgba(255, 255, 255, 0.55)',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            display: 'block',
                            mt: 2,
                          }}
                        >
                          ZOTH ARCHITECTURAL MATRIX // {palette.badge}
                        </Typography>
                      </Box>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Box>

          {/* 2.39:1 Cinematic Letterbox Bar - Bottom */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 4,
              width: '100%',
              height: { xs: 52, sm: 64, md: 76 },
              bgcolor: '#000000',
              borderTop: `1px solid ${palette.primary}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.58rem', sm: '0.7rem' },
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.12em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              ZERO CLOUD TELEMETRY · STRICT LOCAL AIR-GAP
            </Typography>

            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                color: palette.primary,
                letterSpacing: '0.14em',
                fontWeight: 750,
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              <span>[CLICK OR SPACE/ESC TO ENTER]</span>
              <span style={{ fontSize: '0.85rem' }}>❯❯</span>
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
