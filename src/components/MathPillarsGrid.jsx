import React, { useState } from 'react';
import { Box, Chip, Unstable_Grid2 as Grid, Paper, Typography, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { mathPillars, mathTiers } from '../data/mathPillars';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarsGrid({ variant = 'full' }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#7A5600';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const goldText = isDark ? '#F5E6AB' : '#7A5600';
  const goldBorder = isDark ? 'rgba(212,175,55,0.42)' : '#8A6508';
  const [tier, setTier] = useState('Intermediate');
  const [speakingId, setSpeakingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const teaser = variant === 'teaser';

  const copyFormula = async (pillar) => {
    const text = `${pillar.title} (${tier})\n${pillar.tiers[tier]}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(pillar.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  const speakPillar = (pillar) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingId === pillar.id) {
      setSpeakingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${pillar.title}. ${pillar.subtitle}. ${pillar.tiers[tier]}`);
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(pillar.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Box>
      {!teaser && (
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {mathTiers.map((name) => (
            <Chip
              key={name}
              className={tier === name && !isDark ? 'zs-ondark' : undefined}
              label={name}
              clickable
              onClick={() => setTier(name)}
              sx={{
                minHeight: 44,
                px: 1,
                fontWeight: 700,
                bgcolor: tier === name ? (isDark ? '#D4AF37' : '#7A5600') : theme.palette.background.paper,
                color: tier === name ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                '& .MuiChip-label': {
                  color: tier === name ? (isDark ? '#08080B !important' : '#FFFFFF !important') : theme.palette.text.primary,
                },
                border: '1px solid',
                borderColor: tier === name ? gold : theme.palette.divider,
                '&:hover': {
                  borderColor: gold,
                  bgcolor: tier === name ? (isDark ? '#E5C158' : '#5E4200') : goldSoft,
                },
              }}
            />
          ))}
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', pl: 0.5 }}>
            Same six mathematical pillars across all tiers. The tier adjusts notation depth.
          </Typography>
        </Stack>
      )}

      <Grid container spacing={2.5}>
        {mathPillars.map((pillar) => (
          <Grid xs={12} sm={6} lg={4} key={pillar.id}>
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderTop: `4px solid ${pillar.accent}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`Pillar ${pillar.numeral}`}
                  size="small"
                  sx={{ bgcolor: goldSoft, color: goldText, fontWeight: 700, border: `1px solid ${goldBorder}` }}
                />
                {!teaser && (
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      onClick={() => copyFormula(pillar)}
                      sx={{ minWidth: 44, minHeight: 44, px: 1.25, fontWeight: 700, textTransform: 'none' }}
                    >
                      {copiedId === pillar.id ? 'Copied' : 'Proof'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => speakPillar(pillar)}
                      sx={{ minWidth: 44, minHeight: 44, px: 1.25, fontWeight: 700, textTransform: 'none' }}
                    >
                      {speakingId === pillar.id ? 'Stop' : 'Listen'}
                    </Button>
                  </Stack>
                )}
              </Box>
              <Typography component="h3" variant="h6" sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>
                {pillar.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pillar.subtitle}
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: isDark ? '#101828' : '#F4F1EA',
                  color: isDark ? '#F5E6AB' : '#101828',
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  border: `1px solid ${isDark ? '#2A2A38' : '#8A6508'}`,
                  '&:hover': {
                    borderColor: gold,
                    boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.18)',
                  },
                }}
              >
                {pillar.tiers[teaser ? 'Intermediate' : tier]}
              </Box>

              <Button
                component={RouterLink}
                to={`/docs/math/${pillar.id}`}
                variant="outlined"
                color="primary"
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                sx={{
                  mt: 'auto',
                  minHeight: 44,
                  px: 2,
                  alignSelf: 'flex-start',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Read Math Doc
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
