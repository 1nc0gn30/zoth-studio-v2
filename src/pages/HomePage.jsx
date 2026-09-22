import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Chip, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link as RouterLink } from 'react-router-dom';
import GoldenZLogo3D from '../components/GoldenZLogo3D';
import MathPillarsGrid from '../components/MathPillarsGrid';
import CompanyTicker from '../components/CompanyTicker';
import WebGPUAIConsole from '../components/WebGPUAIConsole';
import { microTools } from '../data/toolsData';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

function ServiceRow() {
  const { status, error } = useStudioStatus();
  const services = status ? Object.values(status.services) : [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
      {error && <Chip label="Status unavailable" size="small" />}
      {!status && !error && <Chip label="Checking this machine" size="small" />}
      {services.map((service) => (
        <Chip
          key={service.name}
          label={`${({ 'Neuro memory daemon': 'Memory', 'Sovereign agent bridge': 'Bridge', 'Vault daemon': 'Vault', Ollama: 'Models' })[service.name] || service.name} ${service.up ? 'ready' : 'offline'}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: service.up ? '#ECFDF3' : '#F2F4F7',
            color: service.up ? '#027A48' : '#667085',
          }}
        />
      ))}
    </Box>
  );
}

export default function HomePage() {
  const published = microTools.filter((tool) => tool.published);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(240px, 340px)' },
          gap: { xs: 2, md: 4 },
          alignItems: 'center',
          mb: 5,
          pb: 4,
          borderBottom: '1px solid #EAECF0',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 26, width: 'auto' }} />
            <Typography sx={{ fontFamily: mono, letterSpacing: '0.22em', fontSize: '0.72rem', color: '#8A6A09' }}>
              NULLAI
            </Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4.2rem', sm: '5.6rem', md: '6.6rem' },
              color: '#101828',
            }}
          >
            Zoth
            <Box component="span" sx={{ display: 'block', color: '#B8860B' }}>Studio</Box>
          </Typography>
          <Box sx={{ width: 112, height: 4, bgcolor: '#D4AF37', my: 2.5 }} />
          <Typography sx={{ maxWidth: 520, fontSize: '1.2rem', lineHeight: 1.55, color: '#344054' }}>
            Plan the work, keep what you learn, and stay on this machine.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.25, mt: 3, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/adytum" variant="contained" color="primary">Open Adytum</Button>
            <Button component={RouterLink} to="/tools" variant="outlined" color="primary">Browse tools</Button>
          </Box>
          <ServiceRow />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
          <GoldenZLogo3D size={300} />
        </Box>
      </Box>

      {/* In-Browser WebGPU AI Tensor Engine Console */}
      <WebGPUAIConsole />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' },
          gap: 2.5,
          mb: 7,
        }}
      >
        {[
          ['Adytum', '/adytum', 'A planning rite before the build starts.'],
          ['Roster', '/swarm', 'The twenty-one roles in the studio.'],
          ['Tools', '/tools', `${published.length} tools you can open from here.`],
          ['Memory', '/memory', 'What the studio keeps between sessions.'],
          ['Bridge', '/bridges', 'How the local services talk to each other.'],
        ].map(([title, to, copy], index) => (
          <Card
            key={title}
            component={RouterLink}
            to={to}
            sx={{
              gridColumn: { md: index < 3 ? 'span 2' : 'span 3' },
              height: '100%',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
            }}
          >
              <CardContent>
                <Typography variant="overline" sx={{ color: '#B8860B', fontWeight: 750, letterSpacing: '0.12em' }}>{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{copy}</Typography>
              </CardContent>
            </Card>
        ))}
      </Box>

      <Box sx={{ mb: 7 }}>
        <Typography variant="overline" sx={{ color: '#B8860B', fontWeight: 750, letterSpacing: '0.12em' }}>
          Reference formulas
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Six math pillars</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 680 }}>
          The six formulas behind the studio.
        </Typography>
        <MathPillarsGrid variant="teaser" />
      </Box>

      {/* AI Models & Framework Partners Ticker */}
      <CompanyTicker />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Published tools</Typography>
        <Button component={RouterLink} to="/tools" variant="outlined" color="primary">Open the catalog</Button>
      </Box>
      <Grid container spacing={2.5}>
        {published.slice(0, 6).map((tool) => (
          <Grid key={tool.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Chip label={`v${tool.version}`} size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 700, mb: 1.2 }} />
                <Typography variant="h6" sx={{ fontWeight: 750, mb: 1 }}>{tool.name}</Typography>
                <Typography variant="body2" color="text.secondary">{tool.description}</Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#8A6A09' }}>{tool.repo}</Typography>
                <Button size="small" variant="contained" color="primary" href={tool.github} target="_blank" rel="noopener noreferrer" startIcon={<GitHubIcon />}>
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
