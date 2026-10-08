import { Box, Chip, Button, Typography } from '@mui/material';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/**
 * Price and live-app link for a catalog tool that already has a public checkout.
 * Renders nothing when the tool has no price and no live URL.
 */
export default function ToolOfferLine({ tool, isDark }) {
  if (!tool?.priceUsd && !tool?.liveUrl) return null;
  const color = isDark ? '#F5E6AB' : '#B8860B';
  const wash = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const border = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.35)';

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1.2 }}>
      {tool.priceUsd && (
        <Chip
          label={`$${tool.priceUsd}`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            letterSpacing: '0.04em',
            bgcolor: wash,
            color,
            border: `1px solid ${border}`,
            height: 24,
          }}
        />
      )}
      {tool.liveUrl && (
        <Button
          size="small"
          href={tool.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontFamily: mono,
            fontWeight: 750,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            color,
            textTransform: 'none',
            minWidth: 0,
            px: 0.6,
            py: 0.2,
          }}
        >
          Live app
        </Button>
      )}
      {tool.priceNote && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', lineHeight: 1.4 }}>
          {tool.priceNote}
        </Typography>
      )}
    </Box>
  );
}
