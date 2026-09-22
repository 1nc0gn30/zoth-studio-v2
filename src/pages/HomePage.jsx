import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Chip, Button, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import HubIcon from '@mui/icons-material/Hub';
import MemoryIcon from '@mui/icons-material/Memory';
import ShieldIcon from '@mui/icons-material/Shield';
import EcosystemCanvas from '../components/EcosystemCanvas';
import GoldenZLogo3D from '../components/GoldenZLogo3D';
import { microTools } from '../data/toolsData';
import { Link as RouterLink } from 'react-router-dom';

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyInit = () => {
    navigator.clipboard.writeText('npx zoth-studio init');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const featuredTools = microTools.slice(0, 6);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <GoldenZLogo3D size={64} />
        </Box>
        <Chip
          icon={<TerminalIcon sx={{ color: '#B8860B !important' }} />}
          label="SOVEREIGN AGENT OS & 28 MICRO-REPO ECOSYSTEM"
          size="small"
          sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, mb: 2.5, px: 1.5, py: 0.5 }}
        />
        
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#101828', letterSpacing: '-0.03em', mb: 2 }}>
          Zoth Studio <span style={{ color: '#B8860B' }}>v2.0</span>
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 780, mx: 'auto', mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
          Run 21 autonomous Pantheon agents locally with 28 specialized micro-tool repositories. Zero-telemetry, E2EE Signal Bridge, Argon2id secrets vault, and biomorphic STDP vector memory.
        </Typography>

        {/* Interactive CLI Quick-Start Box */}
        <Paper
          elevation={0}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
            bg: '#101828',
            color: '#FEF9E7',
            borderRadius: 2,
            border: '1px solid #1E293B',
            fontFamily: 'monospace',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}
        >
          <Typography variant="body1" sx={{ color: '#B8860B', fontWeight: 700, fontFamily: 'inherit' }}>
            $ npx zoth-studio init
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyInit}
            sx={{ px: 2, py: 0.5, textTransform: 'none' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Paper>
      </Box>

      {/* Interactive Golden Architecture Canvas */}
      <EcosystemCanvas />

      {/* Key Feature Pillars */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
            <CardContent>
              <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bg: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <HubIcon sx={{ color: '#B8860B' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>21 Pantheon Swarm</Typography>
              <Typography variant="body2" color="text.secondary">
                Dispatch parallel subagents across IPC task channels with automated Socratic consensus debate arenas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
            <CardContent>
              <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bg: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <MemoryIcon sx={{ color: '#B8860B' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Biomorphic Memory</Typography>
              <Typography variant="body2" color="text.secondary">
                STDP synapse decay engine &amp; HNSW local vector search daemon at <code>127.0.0.1:8788</code>.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
            <CardContent>
              <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bg: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <ShieldIcon sx={{ color: '#B8860B' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Argon2id Vault</Typography>
              <Typography variant="body2" color="text.secondary">
                Zero-cloud hardware secrets encryption, E2EE WebSocket Signal Bridge, and leak prevention.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Featured Micro-Repositories Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Featured Micro-Tools</Typography>
        <Button component={RouterLink} to="/tools" variant="outlined" color="primary">
          View All 28 Tools &rarr;
        </Button>
      </Box>

      <Grid container spacing={3}>
        {featuredTools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #EAECF0' }}>
              <CardContent>
                <Chip label={tool.category} size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 600, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{tool.name}</Typography>
                <Typography variant="body2" color="text.secondary">{tool.description}</Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between', borderTop: '1px solid #EAECF0' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#B8860B', fontWeight: 700 }}>
                  {tool.pull}
                </Typography>
                <Button size="small" variant="contained" color="primary" href={tool.github} target="_blank" startIcon={<GitHubIcon />}>
                  Repo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Container>
  );
}
