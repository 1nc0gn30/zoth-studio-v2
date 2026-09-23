import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// The Sovereign Companions — a handful of the Zoth pantheon who dwell in the Void.
const COMPANIONS = [
  { emoji: '🐦‍🔥', name: 'Azoth', role: 'Lead Phoenix · first light of the Void' },
  { emoji: '🌙', name: 'Luna', role: 'Moon Warden · keeper of cycles' },
  { emoji: '🦊', name: 'Kitsune', role: 'Trickster · nine-tailed oracle' },
  { emoji: '🐺', name: 'Lycan', role: 'Night Hunter · guardian of the hunt' },
  { emoji: '🌑', name: 'Nyx', role: 'Night Sovereign · mother of the dark' },
  { emoji: '🦉', name: 'Athena', role: 'Wisdom Seer · strategist of the swarm' },
  { emoji: '👾', name: 'Binary', role: 'Code Spirit · 0s and 1s made flesh' },
  { emoji: '👻', name: 'Ghostbyte', role: 'Null Phantom · walker of dead links' },
  { emoji: '🐈‍⬛', name: 'Glitchcat', role: 'Chaos Familiar · purrs in static' },
  { emoji: '✨', name: 'Aether', role: 'Void Essence · the breath between stars' },
];

export default function SovereignMascots() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', mt: 3, pt: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography
        component="div"
        sx={{
          textAlign: 'center',
          fontFamily: '"Celtic Garamond", Georgia, serif',
          fontSize: '1.15rem',
          letterSpacing: '0.04em',
          color: dark ? '#D4AF37' : '#B8860B',
          mb: 1.5,
        }}
      >
        ✦ The Sovereign Companions ✦
      </Typography>
      <Typography
        component="div"
        sx={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: theme.palette.text.secondary,
          mb: 2,
          maxWidth: 640,
          mx: 'auto',
        }}
      >
        A pantheon of familiars who keep vigil in the Void beside Zoth.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1.25,
          maxWidth: 980,
          mx: 'auto',
        }}
      >
        {COMPANIONS.map((c) => (
          <Box
            key={c.name}
            title={`${c.name} — ${c.role}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.4,
              py: 0.7,
              borderRadius: 9999,
              border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
              background: dark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
              fontSize: '0.82rem',
              color: theme.palette.text.primary,
              cursor: 'default',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
              '&:hover': {
                borderColor: '#D4AF37',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px -6px rgba(212,175,55,0.35)',
              },
            }}
          >
            <Box component="span" sx={{ fontSize: '1.05rem', lineHeight: 1 }} aria-hidden="true">
              {c.emoji}
            </Box>
            <Box component="span" sx={{ fontWeight: 700, color: dark ? '#F5E6AB' : '#8A6A09' }}>
              {c.name}
            </Box>
            <Box
              component="span"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500, display: { xs: 'none', sm: 'inline' } }}
            >
              · {c.role}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}