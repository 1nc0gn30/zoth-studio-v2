import React from 'react';
import { Box, Chip, Unstable_Grid2 as Grid, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { legacyWorkstations } from '../data/zeroEgress';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function WorkstationMap({ embedded = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldText = isDark ? '#F5E6AB' : '#8A6A09';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const goldBorder = isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8';
  return (
    <Box id="sec-workstations" sx={{ scrollMarginTop: '88px' }}>
      {!embedded && (
        <>
          <Chip
            label="LEGACY STUDIO CROSSWALK"
            size="small"
            sx={{ bgcolor: goldSoft, color: goldText, border: `1px solid ${goldBorder}`, fontWeight: 700, mb: 1.5 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 750, mb: 1, letterSpacing: '-0.02em' }}>
            Workstations carried forward from core-app
          </Typography>
        </>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 760 }}>
        Each card is a page from <Box component="span" sx={{ fontFamily: mono, color: goldText }}>public/studio</Box>. The link is where that job lives in Zoth Studio.
      </Typography>
      <Grid container spacing={2}>
        {legacyWorkstations.map((station) => (
          <Grid xs={12} sm={6} md={4} key={station.file}>
            <Paper
              component={RouterLink}
              to={station.to}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                textDecoration: 'none',
                color: 'inherit',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: gold,
                  boxShadow: '0 10px 24px -10px rgba(212, 175, 55, 0.45)',
                },
              }}
            >
              <Typography variant="caption" sx={{ fontFamily: mono, color: goldText, fontWeight: 700 }}>
                {station.file}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, flexGrow: 1 }}>
                {station.job}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: gold }}>
                Open {station.to}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
