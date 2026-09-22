import React from 'react';
import { Box, Container, Typography, Chip, Paper, Button } from '@mui/material';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function HexStrikePage() {
  const tool = microTools.find((entry) => entry.id === 'hexstrike-arsenal');

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Chip label="NO SCANNER IS BOUND" size="small" sx={{ bgcolor: '#FEF3F2', color: '#B42318', fontWeight: 700, mb: 1.5 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
        HexStrike
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {tool?.description} Version recorded in the local checkout: {tool?.version}. This page used to show a fake CVE matrix and a made-up score. Those are gone.
      </Typography>
      <Paper sx={{ p: 2.5, border: '1px solid #EAECF0' }}>
        <Typography sx={{ fontFamily: mono, color: '#8A6A09', mb: 1 }}>hexstrike-arsenal</Typography>
        <Typography variant="body2" color="text.secondary">
          That name is not a published repository. The CLI will refuse to clone it. There is no scan button here because there is no scan to run.
        </Typography>
        <Button sx={{ mt: 2 }} variant="outlined" color="primary" component="a" href="/tools">
          Open the tool catalog
        </Button>
      </Paper>
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Related published tools: jwt-inspector-guard, payload-entropy-studio, envguard-secrets-vault. Pull any of them with <Box component="span" sx={{ fontFamily: mono, color: '#8A6A09' }}>npm run zoth -- pull &lt;repo&gt;</Box>.
        </Typography>
      </Box>
    </Container>
  );
}
