import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_WALLET = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

/**
 * Quiet, high-contrast open-source support strip.
 */
export default function ToolOfferLine({ isDark }) {
  const [copiedSol, setCopiedSol] = useState(false);

  const borderCol = isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.14)';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textMuted = isDark ? '#9CA3AF' : '#475467';

  const handleCopySolana = (e) => {
    e.preventDefault();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(SOLANA_WALLET);
      setCopiedSol(true);
      setTimeout(() => setCopiedSol(false), 2200);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center', mt: 1.5 }}>
      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 600, color: textMuted }}>
        100% Open Source · Zero Paywalls
      </Typography>
      <Button
        size="small"
        component="a"
        href={STRIPE_COFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          fontFamily: mono,
          fontWeight: 700,
          fontSize: '0.7rem',
          color: textPrimary,
          border: `1px solid ${borderCol}`,
          textTransform: 'none',
          px: 1.1,
          py: 0.25,
          borderRadius: 1,
        }}
      >
        ☕ Buy Us a Coffee
      </Button>
      <Button
        size="small"
        onClick={handleCopySolana}
        sx={{
          fontFamily: mono,
          fontWeight: 700,
          fontSize: '0.7rem',
          color: isDark ? '#34D399' : '#047857',
          border: `1px solid ${isDark ? 'rgba(52,211,153,0.35)' : '#A7F3D0'}`,
          bgcolor: isDark ? 'rgba(16,185,129,0.06)' : '#ECFDF5',
          textTransform: 'none',
          px: 1.1,
          py: 0.25,
          borderRadius: 1,
        }}
      >
        {copiedSol ? 'Copied GG2e…dXoK' : 'Solana Tip: GG2e…dXoK'}
      </Button>
    </Box>
  );
}
