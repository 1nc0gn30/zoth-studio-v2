import React from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { pantheonAgents } from '../data/pantheon';

// The 21 Sovereign Companions — real mascot images from the Zoth pantheon,
// rendered as a golden badge ring in the footer.
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
        ✦ The 21 Sovereign Companions ✦
      </Typography>
      <Typography
        component="div"
        sx={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: theme.palette.text.secondary,
          mb: 2,
          maxWidth: 680,
          mx: 'auto',
        }}
      >
        The pantheon of familiars who keep vigil in the Void beside Zoth.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          maxWidth: 1040,
          mx: 'auto',
        }}
      >
        {pantheonAgents.map((agent) => (
          <Box
            key={agent.id}
            title={`${agent.id} — ${agent.role}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
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
            <Avatar
              src={agent.img}
              alt={agent.id}
              sx={{
                width: 30,
                height: 30,
                border: `1px solid ${dark ? 'rgba(212,175,55,0.55)' : '#D4AF37'}`,
                bgcolor: dark ? '#0B0B12' : '#FFFFFF',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}