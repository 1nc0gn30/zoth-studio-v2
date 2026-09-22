import React, { useState } from 'react';
import { Box, Chip, Grid, Paper, Typography, Button, Stack } from '@mui/material';
import { mathPillars, mathTiers } from '../data/mathPillars';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarsGrid({ variant = 'full' }) {
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
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          {mathTiers.map((name) => (
            <Chip
              key={name}
              label={name}
              clickable
              onClick={() => setTier(name)}
              sx={{
                fontWeight: 700,
                bgcolor: tier === name ? '#B8860B' : '#F2F4F7',
                color: tier === name ? '#FFFFFF' : '#344054',
                border: '1px solid',
                borderColor: tier === name ? '#D4AF37' : '#EAECF0',
                '&:hover': { borderColor: '#D4AF37' },
              }}
            />
          ))}
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', pl: 0.5 }}>
            Same six pillars as the legacy academy. The tier only changes how the formula is written.
          </Typography>
        </Stack>
      )}

      <Grid container spacing={2.5}>
        {mathPillars.map((pillar) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pillar.id}>
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                border: '1px solid #EAECF0',
                borderTop: `4px solid ${pillar.accent}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={`Pillar ${pillar.numeral}`}
                  size="small"
                  sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 700, border: '1px solid #F0E1A8' }}
                />
                {!teaser && (
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" onClick={() => copyFormula(pillar)} sx={{ minWidth: 0, px: 1.2 }}>
                      {copiedId === pillar.id ? 'Copied' : 'Proof'}
                    </Button>
                    <Button size="small" onClick={() => speakPillar(pillar)} sx={{ minWidth: 0, px: 1.2 }}>
                      {speakingId === pillar.id ? 'Stop' : 'Listen'}
                    </Button>
                  </Stack>
                )}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>
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
                  bgcolor: '#101828',
                  color: '#F5E6AB',
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  border: '1px solid #1D2939',
                  '&:hover': {
                    borderColor: '#D4AF37',
                    boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.18)',
                  },
                }}
              >
                {pillar.tiers[teaser ? 'Intermediate' : tier]}
              </Box>

            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
