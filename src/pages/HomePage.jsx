import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Chip, Button, Paper } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import ShieldIcon from '@mui/icons-material/Shield';
import TerminalIcon from '@mui/icons-material/Terminal';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3.5 }}>
      {error && <Chip label="Status unavailable" size="small" sx={{ fontWeight: 700 }} />}
      {!status && !error && <Chip label="Checking local machine..." size="small" sx={{ fontWeight: 700 }} />}
      {services.map((service) => (
        <Chip
          key={service.name}
          label={`${({ 'Neuro memory daemon': 'Memory :8788', 'Sovereign agent bridge': 'Bridge :8789', 'Vault daemon': 'Vault :8787', Ollama: 'Models :11434' })[service.name] || service.name} ${service.up ? 'READY' : 'OFFLINE'}`}
          size="small"
          sx={{
            fontWeight: 750,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            bgcolor: service.up ? '#ECFDF3' : '#F2F4F7',
            color: service.up ? '#027A48' : '#667085',
            border: '1px solid',
            borderColor: service.up ? '#ABE5C6' : '#EAECF0',
          }}
        />
      ))}
    </Box>
  );
}

export default function HomePage() {
  const published = microTools.filter((tool) => tool.published);

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 7 } }}>
      
      {/* Enhanced Hero Section */}
      <Paper
        elevation={0}
        className="breathe-card"
        sx={{
          p: { xs: 3.5, md: 6 },
          mb: 8,
          borderRadius: 4,
          border: '1px solid #D4AF3744',
          bgcolor: '#FFFFFF',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF9E733 100%)',
          boxShadow: '0 12px 36px rgba(16,24,40,0.06)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(280px, 360px)' },
          gap: { xs: 4, md: 6 },
          alignItems: 'center',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
            <Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 28, width: 'auto' }} />
            <Typography sx={{ fontFamily: mono, letterSpacing: '0.22em', fontSize: '0.75rem', color: '#8A6A09', fontWeight: 800 }}>
              NULLAI TECH • LOCAL AI WORKSTATION ENGINE
            </Typography>
          </Box>
          
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.6rem', sm: '5.2rem', md: '6.2rem' },
              color: '#101828',
              fontWeight: 400,
              lineHeight: 0.95,
              mb: 1.5,
            }}
          >
            Zoth
            <Box component="span" className="text-gradient-gold" sx={{ display: 'block' }}>Studio v2</Box>
          </Typography>
          
          <Box sx={{ width: 140, height: 4.5, bgcolor: '#D4AF37', my: 3, borderRadius: 2 }} />
          
          <Typography sx={{ maxWidth: 560, fontSize: '1.25rem', lineHeight: 1.65, color: '#344054', fontWeight: 450 }}>
            An autonomous, <span className="text-highlight-gold">Zero-Telemetry Local AI Studio</span> built for mathematical rigor, sovereign multi-agent consensus, real-time memory persistence, and in-browser <span className="text-highlight-dark">WebGPU Compute</span>.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/adytum" variant="contained" color="primary" size="large" className="pulse-glow-btn" sx={{ px: 3.5, py: 1.2, fontWeight: 800 }}>
              Enter Adytum Rite
            </Button>
            <Button component={RouterLink} to="/tools" variant="outlined" color="primary" size="large" sx={{ px: 3, py: 1.2, fontWeight: 750 }}>
              Explore 25 Micro-Tools
            </Button>
            <Button component={RouterLink} to="/zoth-os" variant="text" sx={{ color: '#8A6A09', fontWeight: 800, px: 2 }}>
              Zoth OS ISO →
            </Button>
          </Box>
          
          <ServiceRow />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GoldenZLogo3D size={320} />
        </Box>
      </Paper>

      {/* Feature Highlights Banner */}
      <Box
        sx={{
          bgcolor: '#FEF9E7',
          border: '1px solid #F5E6AB',
          borderRadius: 3,
          p: 4,
          mb: 8,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
        }}
      >
        {[
          { icon: <ShieldIcon sx={{ color: '#B8860B', fontSize: 28 }} />, label: 'Zero-Cloud Telemetry', text: 'All LLM calls, embeddings, and memory retention stay 100% on your local metal.' },
          { icon: <SpeedIcon sx={{ color: '#B8860B', fontSize: 28 }} />, label: 'WebGPU WASM Engine', text: 'In-browser tensor matmul and neural inference running directly on client GPU.' },
          { icon: <MemoryIcon sx={{ color: '#B8860B', fontSize: 28 }} />, label: 'STDP Neuro Memory', text: 'Biological Spike-Timing-Dependent Plasticity daemon listening on 127.0.0.1:8788.' },
          { icon: <TerminalIcon sx={{ color: '#B8860B', fontSize: 28 }} />, label: 'Sovereign Agent Bridge', text: 'Decentralized peer-to-peer agent bus & consensus engine listening on 127.0.0.1:8789.' },
        ].map((item, idx) => (
          <Box key={idx} sx={{ borderRight: { md: idx < 3 ? '1px solid #F5E6AB' : 'none' }, pr: { md: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
              {item.icon}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#101828' }}>{item.label}</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.6 }}>
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Section 1: In-Browser WebGPU AI Tensor Engine Console */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Local Hardware Accelerator</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#101828', letterSpacing: '-0.02em' }}>
          WebGPU High-Performance <span className="text-gradient-gold">Tensor Matrix Console</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Execute mathematical matrix multiplication benchmarks directly inside your browser window. Uses native <span className="text-highlight-gold">WGSL compute shaders</span> with automatic fallback to <span className="text-highlight-dark">WASM SIMD 128-bit</span> execution.
        </Typography>
        <WebGPUAIConsole />
      </Box>

      {/* Section 2: Primary Workstation Navigation Grid */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Core Workstations</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#101828', letterSpacing: '-0.02em' }}>
          Studio Navigation &amp; <span className="text-gradient-gold">Specialized Workspaces</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Jump straight into sovereign planning, agent cadre inspection, vector memory search, and real-time IPC bridges.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' },
            gap: 3,
          }}
        >
          {[
            ['Adytum', '/adytum', 'A ritualistic planning workspace with multi-tier execution roadmap generators and prompt synthesis tools.'],
            ['Pantheon Roster', '/swarm', 'Explore 21 specialized autonomous agent roles organized by tactical cadres, skills, and model mappings.'],
            ['Tool Catalog', '/tools', `Browse ${published.length} open-source CLI & browser tools with instant WebGPU launchers and CLI copy snippets.`],
            ['Neuro Memory', '/memory', 'Query the STDP biological memory daemon running locally on port 8788 with vector decay search.'],
            ['Signal Bridge', '/bridges', 'Inspect real-time agent-to-agent communication, simplex channels, and WebSocket heartbeats on port 8789.'],
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
                p: 1,
                border: '1px solid #EAECF0',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#D4AF37',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(212, 175, 55, 0.2)'
                }
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography className="section-kicker" sx={{ mb: 0.8 }}>{title}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.2, color: '#101828' }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{copy}</Typography>
                </Box>
                <Box sx={{ mt: 2, color: '#B8860B', fontWeight: 800, fontSize: '0.88rem' }}>
                  Open Workspace →
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Section 3: Six Math Pillars Section */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Mathematical Foundations</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#101828', letterSpacing: '-0.02em' }}>
          The Six Mathematical <span className="text-gradient-gold">Pillars of Zoth</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Every local agent algorithm in Zoth Studio is derived from six foundational equations spanning <span className="text-highlight-gold">Matrix Multiplication</span>, <span className="text-highlight-gold">Bayesian Update</span>, <span className="text-highlight-gold">Softmax Entropy</span>, <span className="text-highlight-gold">Gradient Descent</span>, <span className="text-highlight-gold">Cosine Similarity</span>, and <span className="text-highlight-gold">Spike-Timing-Dependent Plasticity</span>.
        </Typography>
        <MathPillarsGrid variant="teaser" />
      </Box>

      {/* AI Models & Framework Partners Ticker */}
      <Box sx={{ mb: 8 }}>
        <CompanyTicker />
      </Box>

      {/* Section 4: Published Micro-Tools Catalog Spotlight */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography className="section-kicker">Local Tool Ecosystem</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Featured Micro-Tools</Typography>
          </Box>
          <Button component={RouterLink} to="/tools" variant="outlined" color="primary" sx={{ fontWeight: 750 }}>
            View All {microTools.length} Micro-Tools →
          </Button>
        </Box>
        <Grid container spacing={3}>
          {published.slice(0, 6).map((tool) => (
            <Grid key={tool.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #EAECF0', transition: 'all 0.25s ease', '&:hover': { borderColor: '#D4AF37', transform: 'translateY(-3px)' } }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={`v${tool.version}`} size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 750 }} />
                    {tool.executionType === 'webgpu' && (
                      <Chip label="⚡ WEBGPU" size="small" sx={{ bgcolor: '#0F172A', color: '#F5E6AB', fontWeight: 750, fontSize: '0.68rem', fontFamily: mono }} />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{tool.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tool.description}</Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 1.5, justifyContent: 'space-between', borderTop: '1px solid #EAECF0' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#8A6A09', fontWeight: 600 }}>{tool.repo}</Typography>
                  {tool.executionType === 'webgpu' ? (
                    <Button size="small" variant="contained" color="primary" component={RouterLink} to={`/tools/${tool.id}`} startIcon={<FlashOnIcon />}>
                      Open Tool
                    </Button>
                  ) : tool.localOnly ? (
                    <Chip label="LOCAL ONLY" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475467', fontWeight: 750, fontSize: '0.68rem', border: '1px solid #E2E8F0' }} />
                  ) : (
                    <Button size="small" variant="contained" color="primary" href={tool.github} target="_blank" rel="noopener noreferrer" startIcon={<GitHubIcon />}>
                      Repo
                                      </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
