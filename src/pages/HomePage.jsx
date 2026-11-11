import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import GoldenZLogo3D from '../components/GoldenZLogo3D';
import MathPillarsGrid from '../components/MathPillarsGrid';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll } from '../components/MotionReveal';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const FLAGSHIP_SYSTEMS = [
  {
    kicker: 'LIVE LINUX ISO · v3.4.0 & LITE v1.2',
    title: 'ZothOS & ZothOS-Lite',
    summary:
      'Bootable Debian Live operating system pre-configured with all 77 CLI binaries, local loopback daemons, Ollama inference runtime, and Tor network isolation.',
    route: '/zoth-os',
    repo: 'https://github.com/NullAITech/zoth-os',
    externalUrl: 'https://zothos.nullai.tech',
    externalLabel: 'zothos.nullai.tech',
  },
  {
    kicker: 'MULTI-AGENT ORCHESTRATOR · :8141',
    title: 'Pantheon Swarm & Egregore',
    summary:
      '21-cadre local agent multiplexer paired with Zoth Egregore — a DeepSeek-Flash agent model orchestrated via Nous Research Hermes and native Zoth tools.',
    route: '/swarm',
    repo: 'https://github.com/NullAITech/zoth-swarm-multiplexer',
    externalUrl: 'https://zoth-egregore.netlify.app',
    externalLabel: 'zoth-egregore.netlify.app',
  },
  {
    kicker: 'SYNAPTIC GRAPH DAEMON · :8094',
    title: 'Neuro-Memory Service',
    summary:
      'Persistent Spike-Timing-Dependent Plasticity (STDP) vector and graph memory daemon bound strictly to localhost for long-horizon agent recall.',
    route: '/memory',
    repo: 'https://github.com/NullAITech/neuro-memory-daemon',
  },
  {
    kicker: 'CODE SYNTHESIS ENGINE · :5173',
    title: 'Zoth Bolt WebGen',
    summary:
      'Local full-stack AST synthesizer and multi-model compilation pipeline that builds, tests, and verifies complete applications on your own machine.',
    route: '/webgen',
    repo: 'https://github.com/NullAITech/zoth-webgen',
  },
  {
    kicker: 'SECURITY AUDIT SUITE · :8138',
    title: 'HexStrike AI',
    summary:
      'Local reconnaissance, YARA/Sigma rule synthesis, CVE surface auditing, and binary inspection designed for defensive and red-team engineers.',
    route: '/hexstrike',
    repo: 'https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal',
  },
  {
    kicker: 'DETERMINISTIC PLANNING · :8135',
    title: 'Adytum Chamber',
    summary:
      'Structured 22-stage architectural specification engine that validates requirements, invariants, and test matrices before code generation begins.',
    route: '/adytum',
    repo: 'https://github.com/NullAITech/adytum-alchemist-ai-workflow',
  },
];

const FEATURED_TOOL_IDS = [
  'envguard-secrets-vault',
  'agent-egress-sentinel',
  'agent-prompt-firewall',
  'ghidra-mcp-bridge',
  'mcp-lens',
  'pixel-cast',
];

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [copiedHero, setCopiedHero] = useState(false);

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const subtleBg = isDark ? '#11141D' : '#F3EFE6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';

  const studioCloneCmd = 'git clone https://github.com/NullAITech/zoth-studio-v2.git';

  const featuredTools = useMemo(
    () =>
      FEATURED_TOOL_IDS.map((id) => microTools.find((t) => t.id === id)).filter(Boolean),
    [],
  );

  const handleCopyHero = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(studioCloneCmd);
      setCopiedHero(true);
      setTimeout(() => setCopiedHero(false), 2000);
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 } }}>
        {/* 1. Editorial Hero */}
        <HeroReveal>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ mb: { xs: 7, md: 10 } }}>
            <Grid xs={12} md={7}>
              <GlowLine
                height={2}
                color={gold}
                glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(122,88,8,0.2)'}
              />

              <HeroItem>
                <Typography
                  sx={{
                    mt: 2.5,
                    mb: 1.5,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: gold,
                  }}
                >
                  LOCAL-FIRST AI ENGINEERING SUITE · {microTools.length} REPOSITORIES
                </Typography>
              </HeroItem>

              <HeroItem>
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: display,
                    fontSize: { xs: '2.35rem', sm: '3.15rem', md: '3.75rem' },
                    fontWeight: 400,
                    lineHeight: 1.06,
                    letterSpacing: '-0.01em',
                    color: primaryText,
                    mb: 2.25,
                  }}
                >
                  Sovereign AI Systems, Built for Local Hardware.
                </Typography>
              </HeroItem>

              <HeroItem>
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: 1.72,
                    color: secondaryText,
                    maxWidth: 620,
                    mb: 3.5,
                  }}
                >
                  Zoth Studio documents and unifies {microTools.length} standalone CLI utilities, loopback daemons, and multi-agent protocols engineered to run directly on your machine. Inspect any tool&apos;s specification, clone individual repositories, or pull the complete Zoth Studio v2 monorepo.
                </Typography>
              </HeroItem>

              {/* Terminal Clone Box */}
              <HeroItem>
                <Box
                  sx={{
                    p: 1.5,
                    px: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#0B0E14',
                    border: '1px solid rgba(245, 241, 230, 0.14)',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                    <TerminalIcon sx={{ color: '#D4AF37', fontSize: '1.1rem', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: { xs: '0.76rem', sm: '0.84rem' },
                        color: '#F8FAFC',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {studioCloneCmd}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={handleCopyHero}
                    startIcon={copiedHero ? <CheckIcon /> : <ContentCopyIcon />}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      bgcolor: '#D4AF37',
                      color: '#08080B',
                      px: 1.6,
                      '&:hover': { bgcolor: '#E5C158' },
                    }}
                  >
                    {copiedHero ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
              </HeroItem>

              {/* Primary CTAs */}
              <HeroItem>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/arsenal"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: isDark ? '#D4AF37' : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 3,
                      py: 1.25,
                      textTransform: 'none',
                      '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                    }}
                  >
                    Explore All {microTools.length} Repositories
                  </Button>

                  <Button
                    variant="outlined"
                    href="https://github.com/NullAITech/zoth-studio-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                    sx={{
                      borderColor: isDark ? 'rgba(245,241,230,0.3)' : '#101828',
                      color: primaryText,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2.75,
                      py: 1.25,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: gold,
                        bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(16,24,40,0.04)',
                      },
                    }}
                  >
                    Get Zoth Studio Repo
                  </Button>
                </Stack>
              </HeroItem>
            </Grid>

            {/* Right Architectural Summary Plate */}
            <Grid xs={12} md={5}>
              <HeroItem>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2.5,
                    bgcolor: cardBg,
                    border: `1px solid ${borderCol}`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      pb: 3,
                      mb: 3,
                      borderBottom: `1px solid ${borderCol}`,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: subtleBg,
                        border: `1px solid ${borderCol}`,
                        display: 'flex',
                      }}
                    >
                      <GoldenZLogo3D size={52} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', color: gold }}>
                        ARCHITECTURE INVARIANTS
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: display, fontWeight: 600, color: primaryText }}>
                        Why Local Execution Wins
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2.25}>
                    {[
                      [
                        `${microTools.length} Standalone Git Repos`,
                        'Pull only the exact CLI binary, security auditor, or MCP server you need.',
                      ],
                      [
                        'Native Loopback Daemons',
                        'Direct access to local filesystems, sockets, ADB, Docker, and GPU runtimes.',
                      ],
                      [
                        'Zero Cloud Telemetry',
                        'Source code, secrets, and prompts remain strictly on 127.0.0.1.',
                      ],
                      [
                        'Pre-Installed on ZothOS',
                        'Boot the live ISO to run every daemon and CLI tool with zero manual setup.',
                      ],
                    ].map(([heading, copy]) => (
                      <Box key={heading}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: primaryText, mb: 0.25 }}>
                          {heading}
                        </Typography>
                        <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.84rem', lineHeight: 1.55 }}>
                          {copy}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </HeroItem>
            </Grid>
          </Grid>
        </HeroReveal>

        {/* 2. Flagship Systems */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 7, md: 10 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', color: gold, mb: 0.75 }}>
                  01 · CORE INFRASTRUCTURE
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Six Flagship Systems
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/workstations"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none' }}
              >
                All 43 Architecture Dossiers
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {FLAGSHIP_SYSTEMS.map((sys) => (
                <Grid xs={12} md={6} key={sys.title} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 2.5,
                      bgcolor: cardBg,
                      border: `1px solid ${borderCol}`,
                      transition: 'border-color 0.2s ease',
                      '&:hover': { borderColor: gold },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: gold, mb: 1 }}>
                        {sys.kicker}
                      </Typography>
                      <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 600, color: primaryText, mb: 1.25 }}>
                        {sys.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.65 }}>
                        {sys.summary}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        px: 3,
                        pb: 2.5,
                        pt: 1.25,
                        borderTop: `1px solid ${borderCol}`,
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to={sys.route}
                          sx={{
                            bgcolor: isDark ? '#D4AF37' : '#101828',
                            color: isDark ? '#08080B' : '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            textTransform: 'none',
                            px: 1.75,
                          }}
                        >
                          Architecture
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          href={sys.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<GitHubIcon sx={{ fontSize: '0.9rem !important' }} />}
                          sx={{
                            borderColor: borderCol,
                            color: primaryText,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                          }}
                        >
                          Repo
                        </Button>
                      </Stack>

                      {sys.externalUrl && (
                        <Button
                          size="small"
                          href={sys.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: gold,
                            textTransform: 'none',
                          }}
                        >
                          {sys.externalLabel}
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* 3. Featured Standalone Repositories */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 7, md: 10 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', color: gold, mb: 0.75 }}>
                  02 · STANDALONE PACKAGES
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Selected Tool Repositories
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/tools"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none' }}
              >
                Search All {microTools.length} Tools
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {featuredTools.map((tool) => (
                <Grid xs={12} sm={6} md={4} key={tool.id} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 2.5,
                      bgcolor: cardBg,
                      border: `1px solid ${borderCol}`,
                      '&:hover': { borderColor: gold },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: gold, textTransform: 'uppercase', mb: 1 }}>
                        {tool.category} {tool.localPort ? `· :${tool.localPort}` : ''}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', color: primaryText, mb: 1 }}>
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.84rem', lineHeight: 1.6 }}>
                        {tool.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2.5, pb: 2.25, pt: 1, borderTop: `1px solid ${borderCol}`, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/tools/${tool.id}`}
                        sx={{ fontWeight: 700, color: primaryText, textTransform: 'none' }}
                      >
                        View Specs →
                      </Button>
                      <Button
                        size="small"
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon sx={{ fontSize: '0.88rem !important' }} />}
                        sx={{ fontWeight: 700, color: secondaryText, textTransform: 'none' }}
                      >
                        GitHub
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </RevealOnScroll>

        <Divider sx={{ mb: { xs: 6, md: 8 }, borderColor: borderCol }} />

        {/* 4. Mathematical Foundations */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', color: gold, mb: 0.75 }}>
                  03 · FORMAL FOUNDATIONS
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Six Mathematical Pillars
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/docs/math"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none' }}
              >
                Full Proofs &amp; Derivations
              </Button>
            </Box>
            <MathPillarsGrid variant="teaser" />
          </Box>
        </RevealOnScroll>

        {/* 5. Local Installation Deck */}
        <SovereignFunnel />
      </Container>
    </Box>
  );
}
