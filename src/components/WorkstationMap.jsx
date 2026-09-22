import React from 'react';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { legacyWorkstations } from '../data/zeroEgress';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function WorkstationMap({ embedded = false }) {
  return (
    <Box id="sec-workstations" sx={{ scrollMarginTop: '88px' }}>
      {!embedded && (
        <>
          <Chip
            label="LEGACY STUDIO CROSSWALK"
            size="small"
            sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', border: '1px solid #F0E1A8', fontWeight: 700, mb: 1.5 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 750, mb: 1, letterSpacing: '-0.02em' }}>
            Workstations carried forward from core-app
          </Typography>
        </>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 760 }}>
        Each card is a page from <Box component="span" sx={{ fontFamily: mono, color: '#8A6A09' }}>public/studio</Box>. The link is where that job lives in v2.
      </Typography>
      <Grid container spacing={2}>
        {legacyWorkstations.map((station) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={station.file}>
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
                border: '1px solid #EAECF0',
                '&:hover': {
                  borderColor: '#D4AF37',
                  boxShadow: '0 10px 24px -10px rgba(212, 175, 55, 0.45)',
                },
              }}
            >
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#8A6A09', fontWeight: 700 }}>
                {station.file}
              </Typography>
              <Typography variant="body2" sx={{ color: '#344054', flexGrow: 1 }}>
                {station.job}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#B8860B' }}>
                Open {station.to}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
