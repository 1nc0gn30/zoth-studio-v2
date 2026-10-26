import { Box, Chip, Button, Typography } from '@mui/material';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/**
 * Price and live-app link for a catalog tool that already has a public checkout.
 * Renders nothing when the tool has no price and no live URL.
 */
export default function ToolOfferLine({ tool, isDark }) {
  if (!tool?.liveUrl) return null;
  const color = isDark ? '#F5E6AB' : '#8A6508';
  const wash = isDark ? 'rgba(61,255,168,0.12)' : '#ECFDF5';
  const border = isDark ? 'rgba(61,255,168,0.38)' : 'rgba(16,185,129,0.35)';

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1.2 }}>
      <Chip
        label="✦ 100% Free & Open"
        size="small"
        sx={{
          fontFamily: mono,
          fontWeight: 800,
          letterSpacing: '0.04em',
          bgcolor: wash,
          color: isDark ? '#3dffa8' : '#047857',
          border: `1px solid ${border}`,
          height: 24,
        }}
      />
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
          Live app ↗
        </Button>
      )}
    </Box>
  );
}
