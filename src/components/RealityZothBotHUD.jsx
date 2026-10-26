import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Unstable_Grid2 as Grid,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useReality, REALITY_THEMES, REALITY_ORDER } from '../context/RealityContext';
import GoldenZLogo3D from './GoldenZLogo3D';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/**
 * Custom SVG Emblem Icon for each of the 5 Reality Switch Themes
 */
export function RealityThemeIcon({ mode = 'gold', size = 20 }) {
  const cfg = REALITY_THEMES[mode] || REALITY_THEMES.gold;
  const c = cfg.accent;

  if (mode === 'matrix') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="3" width="19" height="18" rx="2" stroke={c} strokeWidth="1.8" />
        <path d="M6.5 9L9.5 12L6.5 15M11.5 15H16.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="6.5" r="1.2" fill={c} />
      </svg>
    );
  }
  if (mode === 'ghost') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2.5L21 12L12 21.5L3 12L12 2.5Z" stroke={c} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.6" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="1.3" fill={c} />
      </svg>
    );
  }
  if (mode === 'cyan') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="11" height="11" stroke={c} strokeWidth="1.6" />
        <rect x="9.5" y="9.5" width="11" height="11" stroke={c} strokeWidth="1.6" />
        <path d="M3.5 3.5L9.5 9.5M14.5 3.5L20.5 9.5M3.5 14.5L9.5 20.5M14.5 14.5L20.5 20.5" stroke={c} strokeWidth="1.3" />
      </svg>
    );
  }
  if (mode === 'incognito') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.8" fill={c} />
        <rect x="13" y="3" width="8" height="8" rx="1.8" fill={c} fillOpacity="0.75" />
        <rect x="3" y="13" width="8" height="8" rx="1.8" fill={c} fillOpacity="0.75" />
        <rect x="13" y="13" width="8" height="8" rx="1.8" fill={c} fillOpacity="0.55" />
      </svg>
    );
  }
  // Default Gold Master: Alchemical Sun-Crown Sigil
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="1.7" />
      <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" fill={c} />
    </svg>
  );
}

/**
 * 60fps Animated Zoth Bot Character Canvas — Renders 5 completely distinct character models
 * with live cursor eye-tracking:
 *  - gold: AURUM-IX (Crowned 24K Alchemical Archon Orb with Solar Halo & Cyclops Eye)
 *  - matrix: CIPHER-0x9D (Cyber-Hooded Phosphor Terminal Droid with Dual Pixel Eyes & Antennae)
 *  - ghost: SPECTER-V (Crimson Cloaked Stealth Wraith with Angular Cowl & Predator Visor)
 *  - cyan: KITSUNE-Q9 (Quantum Cyber-Fox Mecha with Twin Ears & 9 Orbiting Tensor Tails)
 *  - incognito: CORTEX-PRO (Sleek Fluent Rounded-Square Executive Assistant Drone)
 */
export function ZothBotCharacterCanvas({ mode = 'gold', size = 84 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    let rafId;
    let t = 0;
    const look = { x: 0, y: 0 };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const dx = (e.clientX - cx) / Math.max(120, window.innerWidth * 0.35);
      const dy = (e.clientY - cy) / Math.max(120, window.innerHeight * 0.35);
      look.x = Math.max(-1, Math.min(1, dx));
      look.y = Math.max(-1, Math.min(1, dy));
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const render = () => {
      t += 0.035;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size * 0.5;
      const bob = Math.sin(t * 1.4) * (size * 0.032);
      const cy = size * 0.52 + bob;
      const r = size * 0.32;
      const ex = look.x * (r * 0.22);
      const ey = look.y * (r * 0.18);

      if (mode === 'matrix') {
        // CIPHER-0x9D: Hooded Phosphor Terminal Droid
        ctx.strokeStyle = '#00FF9D';
        ctx.fillStyle = '#041409';
        ctx.lineWidth = 2;

        // Dual antennae
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.55, cy - r * 0.85);
        ctx.lineTo(cx - r * 0.75, cy - r * 1.25);
        ctx.moveTo(cx + r * 0.55, cy - r * 0.85);
        ctx.lineTo(cx + r * 0.75, cy - r * 1.25);
        ctx.stroke();

        // Hexagonal droid head
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy - r * 0.85);
        ctx.lineTo(cx + r * 0.65, cy - r * 0.85);
        ctx.lineTo(cx + r * 0.95, cy - r * 0.1);
        ctx.lineTo(cx + r * 0.7, cy + r * 0.85);
        ctx.lineTo(cx - r * 0.7, cy + r * 0.85);
        ctx.lineTo(cx - r * 0.95, cy - r * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Visor CRT screen
        ctx.fillStyle = '#020804';
        ctx.fillRect(cx - r * 0.62, cy - r * 0.38, r * 1.24, r * 0.62);
        ctx.strokeRect(cx - r * 0.62, cy - r * 0.38, r * 1.24, r * 0.62);

        // Dual square pixel eyes
        ctx.fillStyle = '#00FF9D';
        ctx.shadowColor = '#00FF9D';
        ctx.shadowBlur = 8;
        const eyeSz = Math.max(4, r * 0.24);
        ctx.fillRect(cx - r * 0.38 + ex - eyeSz * 0.5, cy - r * 0.1 + ey - eyeSz * 0.5, eyeSz, eyeSz);
        ctx.fillRect(cx + r * 0.38 + ex - eyeSz * 0.5, cy - r * 0.1 + ey - eyeSz * 0.5, eyeSz, eyeSz);
        ctx.shadowBlur = 0;

        // Mouth waveform
        ctx.beginPath();
        for (let i = -3; i <= 3; i++) {
          const mx = cx + i * (r * 0.15);
          const my = cy + r * 0.5 + Math.sin(t * 4 + i) * 2.5;
          if (i === -3) ctx.moveTo(mx, my);
          else ctx.lineTo(mx, my);
        }
        ctx.stroke();
      } else if (mode === 'ghost') {
        // SPECTER-V: Crimson Cloaked Stealth Wraith
        ctx.fillStyle = '#18050C';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;

        // Outer stealth radar ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-t * 0.6);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Pointed wraith hood silhouette
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 1.18);
        ctx.lineTo(cx + r * 0.95, cy - r * 0.1);
        ctx.lineTo(cx + r * 0.68, cy + r * 0.95);
        ctx.lineTo(cx, cy + r * 0.72);
        ctx.lineTo(cx - r * 0.68, cy + r * 0.95);
        ctx.lineTo(cx - r * 0.95, cy - r * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Predatory V-Visor + tracking crimson core
        ctx.fillStyle = '#F43F5E';
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.52 + ex * 0.6, cy - r * 0.18 + ey * 0.6);
        ctx.lineTo(cx + ex * 0.6, cy + r * 0.08 + ey * 0.6);
        ctx.lineTo(cx + r * 0.52 + ex * 0.6, cy - r * 0.18 + ey * 0.6);
        ctx.lineTo(cx + ex * 0.6, cy + r * 0.28 + ey * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (mode === 'cyan') {
        // KITSUNE-Q9: Quantum Cyber-Fox Mecha with Twin Ears & Tensor Orbitals
        // 5 orbiting tensor tail nodes behind head
        for (let i = 0; i < 5; i++) {
          const ang = -Math.PI * 0.85 + (i / 4) * Math.PI * 0.7 + Math.sin(t * 2 + i) * 0.08;
          const tx = cx + Math.cos(ang) * r * 1.22;
          const ty = cy + Math.sin(ang) * r * 1.12;
          ctx.beginPath();
          ctx.arc(tx, ty, 3, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#00F0FF' : '#C084FC';
          ctx.fill();
        }

        ctx.fillStyle = '#061527';
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;

        // Fox Mecha Head + Twin Pointed Ears
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.35, cy - r * 0.65);
        ctx.lineTo(cx - r * 0.82, cy - r * 1.25); // Left ear tip
        ctx.lineTo(cx - r * 0.85, cy - r * 0.1);
        ctx.lineTo(cx, cy + r * 0.92); // Chin
        ctx.lineTo(cx + r * 0.85, cy - r * 0.1);
        ctx.lineTo(cx + r * 0.82, cy - r * 1.25); // Right ear tip
        ctx.lineTo(cx + r * 0.35, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing slanted cyber-fox eyes
        ctx.fillStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.34 + ex, cy - r * 0.05 + ey, r * 0.18, r * 0.09, 0.28, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.34 + ex, cy - r * 0.05 + ey, r * 0.18, r * 0.09, -0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (mode === 'incognito') {
        // CORTEX-PRO: Sleek Fluent Rounded-Square Executive Drone
        ctx.fillStyle = '#111A2B';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(cx - r * 0.85, cy - r * 0.75, r * 1.7, r * 1.5, r * 0.38);
        ctx.fill();
        ctx.stroke();

        // Inner glass visor
        ctx.fillStyle = '#0B111B';
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.62, cy - r * 0.42, r * 1.24, r * 0.72, r * 0.22);
        ctx.fill();

        // Friendly pill eyes tracking cursor
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.38 + ex, cy - r * 0.22 + ey, r * 0.2, r * 0.34, 4);
        ctx.roundRect(cx + r * 0.18 + ex, cy - r * 0.22 + ey, r * 0.2, r * 0.34, 4);
        ctx.fill();
      } else {
        // AURUM-IX (GOLD MASTER): Crowned 24K Sovereign Archon Bot
        // Sacred Orbital Halo
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.45);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.22, r * 0.48, -0.25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 3-Point Solar Crown above head
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.52, cy - r * 0.78);
        ctx.lineTo(cx - r * 0.38, cy - r * 1.18);
        ctx.lineTo(cx - r * 0.12, cy - r * 0.88);
        ctx.lineTo(cx, cy - r * 1.3);
        ctx.lineTo(cx + r * 0.12, cy - r * 0.88);
        ctx.lineTo(cx + r * 0.38, cy - r * 1.18);
        ctx.lineTo(cx + r * 0.52, cy - r * 0.78);
        ctx.closePath();
        ctx.fill();

        // Armored Archon Sphere Chassis
        ctx.fillStyle = '#0F1018';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // All-Seeing Golden Eye Tracking Visor
        ctx.beginPath();
        ctx.ellipse(cx + ex * 0.5, cy + ey * 0.5, r * 0.52, r * 0.28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#F5E6AB';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + ex, cy + ey, r * 0.19, 0, Math.PI * 2);
        ctx.fillStyle = '#FFE57F';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, [mode, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px`, display: 'block', flexShrink: 0 }}
    />
  );
}

/**
 * Full Interactive 5-Reality Matrix & Zoth Bot Showcase Section (for /zoth-os and /tools/zoth-os)
 */
export function RealityMatrixShowcaseSection() {
  const { realityId, reality, setReality } = useReality();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ my: 5 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: reality.cardRadius,
          bgcolor: isDark ? reality.cardBgDark : '#FFFFFF',
          border: `1px solid ${reality.accentBorder}`,
          boxShadow: isDark ? `0 20px 60px rgba(0,0,0,0.75), 0 0 28px ${reality.accentWash}` : '0 8px 30px rgba(0,0,0,0.06)',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Top Active Zoth Bot & Reality Status Header */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pb: 2.5,
            mb: 3,
            borderBottom: `1px solid ${reality.accentBorder}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                p: 1,
                borderRadius: reality.cardRadius,
                bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#0B0E17',
                border: `1px solid ${reality.accent}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ZothBotCharacterCanvas mode={realityId} size={68} />
              <GoldenZLogo3D size={48} realityOverride={realityId} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                <Chip
                  icon={<RealityThemeIcon mode={realityId} size={14} />}
                  label={`ACTIVE REALITY: ${reality.name.toUpperCase()}`}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    bgcolor: reality.accentWash,
                    color: isDark ? reality.accentSoft : reality.accentLightMode,
                    border: `1px solid ${reality.accentBorder}`,
                  }}
                />
                <Chip
                  label={`ZOTH BOT: ${reality.bot.name} (${reality.bot.title})`}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    color: theme.palette.text.primary,
                  }}
                />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                5-Reality Switcher — Interactive Backgrounds, Logos, Icons & Zoth Bot Familiars
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.78rem', mt: 0.4 }}>
                💬 <strong>{reality.bot.name}:</strong> &ldquo;{reality.bot.greeting}&rdquo;
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 5 Reality Theme Cards */}
        <Grid container spacing={2}>
          {REALITY_ORDER.map((modeKey) => {
            const item = REALITY_THEMES[modeKey];
            const isSelected = realityId === modeKey;
            return (
              <Grid xs={12} sm={6} md={2.4} key={modeKey}>
                <Paper
                  onClick={() => setReality(modeKey)}
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: item.cardRadius,
                    bgcolor: isSelected
                      ? isDark
                        ? item.accentWash
                        : '#F8FAFC'
                      : isDark
                      ? 'rgba(255,255,255,0.02)'
                      : '#FFFFFF',
                    border: isSelected ? `2px solid ${item.accent}` : '1px solid rgba(148,163,184,0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: item.accent,
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <RealityThemeIcon mode={modeKey} size={20} />
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 18,
                          fontFamily: mono,
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          bgcolor: item.accentWash,
                          color: isDark ? item.accent : item.accentLightMode,
                        }}
                      />
                    </Stack>

                    {/* Side-by-side preview of this Reality's Zoth Bot + 3D Logo */}
                    <Box
                      sx={{
                        my: 1,
                        py: 1,
                        px: 1.2,
                        borderRadius: item.cardRadius,
                        bgcolor: '#06080E',
                        border: `1px solid ${item.accentBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                      }}
                    >
                      <ZothBotCharacterCanvas mode={modeKey} size={56} />
                      <GoldenZLogo3D size={42} interactive={false} realityOverride={modeKey} />
                    </Box>

                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: theme.palette.text.primary }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: isDark ? item.accent : item.accentLightMode, fontWeight: 700, mb: 0.5 }}>
                      🤖 {item.bot.name} • {item.logoTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                      {item.tagline}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReality(modeKey);
                    }}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      borderRadius: item.cardRadius,
                      bgcolor: isSelected ? item.accent : 'transparent',
                      color: isSelected ? '#050609' : isDark ? item.accentSoft : item.accentLightMode,
                      borderColor: item.accent,
                      '&:hover': {
                        bgcolor: item.accent,
                        color: '#050609',
                      },
                    }}
                  >
                    {isSelected ? '✓ Reality Engaged' : `Switch → ${item.shortName}`}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}

/**
 * Floating Docked Zoth Bot Character & Quick Reality Switcher HUD (Bottom-Right)
 */
export default function RealityZothBotHUD() {
  const { realityId, reality, setReality } = useReality();
  const [expanded, setExpanded] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % (reality.bot.quotes?.length || 1));
    }, 6500);
    return () => clearInterval(timer);
  }, [reality]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 14, md: 20 },
        right: { xs: 14, md: 20 },
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {expanded && (
        <Paper
          elevation={12}
          sx={{
            width: { xs: 300, sm: 340 },
            p: 2,
            borderRadius: reality.cardRadius,
            bgcolor: isDark ? '#0B0D16' : '#FFFFFF',
            border: `1.5px solid ${reality.accent}`,
            boxShadow: `0 18px 48px rgba(0,0,0,0.8), 0 0 24px ${reality.accentWash}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <RealityThemeIcon mode={realityId} size={18} />
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: reality.accent }}>
                {reality.bot.name} // {reality.shortName.toUpperCase()}
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setExpanded(false)} aria-label="Close Reality Switcher">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          <Box
            sx={{
              p: 1.2,
              mb: 1.5,
              borderRadius: reality.cardRadius,
              bgcolor: '#05070C',
              border: `1px solid ${reality.accentBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ZothBotCharacterCanvas mode={realityId} size={60} />
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#F8FAFC' }}>
                {reality.bot.title}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8', mt: 0.3, lineHeight: 1.35 }}>
                &ldquo;{reality.bot.quotes?.[quoteIdx] || reality.bot.greeting}&rdquo;
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary', mb: 0.8 }}>
            TRANSMUTE REALITY LAYER (SHIFT+R):
          </Typography>
          <Stack spacing={0.7}>
            {REALITY_ORDER.map((mKey) => {
              const rItem = REALITY_THEMES[mKey];
              const active = mKey === realityId;
              return (
                <Button
                  key={mKey}
                  fullWidth
                  size="small"
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => setReality(mKey)}
                  sx={{
                    justifyContent: 'space-between',
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: rItem.cardRadius,
                    py: 0.6,
                    bgcolor: active ? rItem.accent : 'transparent',
                    color: active ? '#050609' : isDark ? '#E2E8F0' : '#101828',
                    borderColor: active ? rItem.accent : 'rgba(148,163,184,0.28)',
                    '&:hover': {
                      borderColor: rItem.accent,
                      bgcolor: active ? rItem.accent : rItem.accentWash,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RealityThemeIcon mode={mKey} size={15} />
                    <span>{rItem.name}</span>
                  </Box>
                  <span>{rItem.bot.name}</span>
                </Button>
              );
            })}
          </Stack>
        </Paper>
      )}

      <Tooltip title={`${reality.bot.name} (${reality.name}) — Click to Switch Reality (Shift+R)`} placement="left">
        <Paper
          onClick={() => setExpanded((e) => !e)}
          elevation={8}
          sx={{
            px: 1.4,
            py: 0.7,
            cursor: 'pointer',
            borderRadius: reality.cardRadius,
            bgcolor: isDark ? 'rgba(9, 11, 18, 0.94)' : '#0B0E17',
            border: `1.5px solid ${reality.accent}`,
            boxShadow: `0 10px 28px rgba(0,0,0,0.65), 0 0 16px ${reality.accentWash}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.04)',
            },
          }}
        >
          <ZothBotCharacterCanvas mode={realityId} size={40} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, color: reality.accent, lineHeight: 1.1 }}>
              {reality.bot.name}
            </Typography>
            <Typography sx={{ fontFamily: mono, fontSize: '0.58rem', color: '#CBD5E1' }}>
              {reality.shortName} • Shift+R
            </Typography>
          </Box>
        </Paper>
      </Tooltip>
    </Box>
  );
}
