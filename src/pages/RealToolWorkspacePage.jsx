import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { microTools } from '../data/toolsData';
import { workstations } from '../data/workstations';
import { getToolDocumentation } from '../data/toolsDocumentation';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const WORKSTATION_TOOL_ALIASES = {
  'adytum-alchemist': 'adytum-alchemist-ai-workflow',
  'adytum': 'adytum-alchemist-ai-workflow',
  'bolt.diy': 'zoth-bolt',
  'bolt-diy': 'zoth-bolt',
  'bolt': 'zoth-bolt',
  'webgen': 'zoth-webgen',
  'omnipost': 'omnipost-social-engine',
  'subsweep': 'subsweep-lead-scanner',
  'hexstrike': 'hexstrike-arsenal',
  'netrunner-memory': 'neuro-memory-daemon',
  'bus-monitor': 'sovereign-agent-bridge',
};

const DEDICATED_SITES = {
  'zoth-os': { label: 'ZothOS Portal', url: 'https://zothos.nullai.tech' },
  'zothos-lite': { label: 'ZothOS-Lite Portal', url: 'https://zothos-lite.nullai.tech' },
  'zoth-civilization': { label: 'Zoth Civilization Site', url: 'https://zoth-civilization.netlify.app' },
  'zoth-swarm-multiplexer': { label: 'Zoth Egregore Model Site', url: 'https://zoth-egregore.netlify.app' },
};

export default function RealToolWorkspacePage() {
  const { toolId } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const resolvedToolId = WORKSTATION_TOOL_ALIASES[toolId] || toolId;
  const catalogTool = microTools.find(
    (t) => t.id === resolvedToolId || t.repo === resolvedToolId || t.id === toolId,
  );
  const wsEntry = !catalogTool ? workstations.find((w) => w.id === toolId) : null;

  const tool =
    catalogTool ||
    (wsEntry
      ? {
          id: wsEntry.id,
          name: wsEntry.name,
          repo: 'zoth-studio-v2',
          category: wsEntry.band || 'Architecture',
          executionType: 'local_cli',
          github: 'https://github.com/NullAITech/zoth-studio-v2',
          description:
            wsEntry.description ||
            'Local-first architecture module integrated inside the Zoth Studio v2 repository.',
          version: '3.3.0',
          pull: wsEntry.pullCommand || 'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        }
      : null);

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const subtleBg = isDark ? '#11141D' : '#F4F1EA';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';

  if (!tool) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontFamily: display, color: primaryText, mb: 1.5 }}>
            Repository Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: secondaryText, mb: 3 }}>
            No local repository or architecture specification matched <code>{toolId}</code>.
          </Typography>
          <Button
            component={RouterLink}
            to="/arsenal"
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: isDark ? '#D4AF37' : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Browse All 77 Repositories
          </Button>
        </Paper>
      </Container>
    );
  }

  const docs = getToolDocumentation(tool);
  const repoUrl =
    ['anderson-security-sentinel', 'wcag-contrast-guard', 'zothnet'].includes(tool.id) || !tool.github
      ? 'https://github.com/NullAITech/zoth-studio-v2'
      : tool.github;
  const studioRepoUrl = 'https://github.com/NullAITech/zoth-studio-v2';
  const cloneCommand = `git clone ${repoUrl.replace(/\.git$/, '')}.git`;
  const dedicatedSite = DEDICATED_SITES[tool.id];

  const copyText = (text, setter) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          component={RouterLink}
          to="/arsenal"
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
          sx={{
            fontFamily: mono,
            fontSize: '0.76rem',
            fontWeight: 700,
            color: secondaryText,
            textTransform: 'none',
            px: 1,
            '&:hover': { color: primaryText, bgcolor: 'transparent' },
          }}
        >
          All 77 Repositories
        </Button>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={tool.category}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FAF6EB',
              color: gold,
              border: `1px solid ${borderCol}`,
            }}
          />
          {tool.localPort && (
            <Chip
              size="small"
              label={`LOCAL DAEMON :${tool.localPort}`}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                color: isDark ? '#34D399' : '#047857',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
              }}
            />
          )}
          <Chip
            size="small"
            label={`v${tool.version || '2.5.0'}`}
            sx={{
              fontFamily: mono,
              fontWeight: 600,
              fontSize: '0.7rem',
              bgcolor: subtleBg,
              color: secondaryText,
              border: `1px solid ${borderCol}`,
            }}
          />
        </Stack>
      </Box>

      {/* Hero Dossier Header */}
      <HeroReveal>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <GlowLine
            height={2}
            color={gold}
            glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(122,88,8,0.2)'}
          />

          <HeroItem>
            <Typography
              sx={{
                mt: 2.5,
                mb: 1,
                fontFamily: mono,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: gold,
              }}
            >
              LOCAL-FIRST REPOSITORY SPECIFICATION · {tool.id}
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              component="h1"
              sx={{
                fontFamily: display,
                fontSize: { xs: '2rem', sm: '2.65rem', md: '3.2rem' },
                fontWeight: 400,
                lineHeight: 1.1,
                color: primaryText,
                mb: 2,
              }}
            >
              {tool.name}
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
                color: secondaryText,
                maxWidth: 820,
                mb: 3.5,
              }}
            >
              {tool.description}
            </Typography>
          </HeroItem>

          {/* Local Execution Notice + Git Clone Bar */}
          <HeroItem>
            <Box
              sx={{
                p: 2,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                <TerminalIcon sx={{ color: '#D4AF37', fontSize: '1.15rem', flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                    color: '#F8FAFC',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {cloneCommand}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => copyText(cloneCommand, setCopiedClone)}
                startIcon={copiedClone ? <CheckIcon /> : <ContentCopyIcon />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  color: '#08080B',
                  bgcolor: '#D4AF37',
                  px: 1.75,
                  '&:hover': { bgcolor: '#E5C158' },
                }}
              >
                {copiedClone ? 'Copied' : 'Copy Clone'}
              </Button>
            </Box>
          </HeroItem>

          {/* Primary Repository & OS Action Buttons */}
          <HeroItem>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{
                  bgcolor: isDark ? '#D4AF37' : '#101828',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  fontWeight: 700,
                  px: 2.75,
                  py: 1.15,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                }}
              >
                Get Tool Repository
              </Button>

              <Button
                variant="outlined"
                href={studioRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{
                  borderColor: isDark ? 'rgba(245,241,230,0.28)' : '#101828',
                  color: primaryText,
                  fontWeight: 700,
                  px: 2.5,
                  py: 1.15,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: gold,
                    bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(16,24,40,0.04)',
                  },
                }}
              >
                Get Zoth Studio Repo
              </Button>

              <Button
                component={RouterLink}
                to="/zoth-os"
                variant="outlined"
                sx={{
                  borderColor: borderCol,
                  color: secondaryText,
                  fontWeight: 700,
                  px: 2.25,
                  py: 1.15,
                  textTransform: 'none',
                  '&:hover': { borderColor: gold, color: primaryText },
                }}
              >
                Run Pre-Installed on ZothOS →
              </Button>

              {dedicatedSite && (
                <Button
                  variant="outlined"
                  href={dedicatedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.95rem !important' }} />}
                  sx={{
                    borderColor: isDark ? 'rgba(52,211,153,0.4)' : '#059669',
                    color: isDark ? '#34D399' : '#047857',
                    fontWeight: 700,
                    px: 2.25,
                    py: 1.15,
                    textTransform: 'none',
                  }}
                >
                  {dedicatedSite.label}
                </Button>
              )}
            </Stack>
          </HeroItem>

          {tool.id === 'zoth-swarm-multiplexer' && (
            <Box
              sx={{
                mt: 3,
                p: 2.25,
                borderRadius: 2,
                bgcolor: subtleBg,
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ maxWidth: 660 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: gold, mb: 0.4 }}>
                  COMPANION MODEL · ZOTH EGREGORE (BETA)
                </Typography>
                <Typography variant="body2" sx={{ color: primaryText, fontWeight: 600 }}>
                  DeepSeek-Flash fine-tuned agent model orchestrated via Nous Research Hermes &amp; local Zoth tools.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  href="https://github.com/1nc0gn30/zoth-egregore"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, color: primaryText, borderColor: borderCol }}
                >
                  1nc0gn30/zoth-egregore
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      </HeroReveal>

      {/* Architecture & Capabilities 2-Column Grid */}
      <RevealOnScroll preset="fadeUp">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                width: '100%',
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 1.5,
                }}
              >
                01 · WHY LOCAL-FIRST
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 1.25 }}>
                Purpose &amp; Operational Scope
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7, mb: 3 }}>
                {docs.whyUse}
              </Typography>

              <Divider sx={{ my: 2.5, borderColor: borderCol }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
                Problem Solved
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7, mb: 3 }}>
                {docs.problemSolved}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
                Local Runtime Architecture
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7 }}>
                {docs.architecture}
              </Typography>
            </Paper>
          </Grid>

          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                width: '100%',
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 1.5,
                }}
              >
                02 · CAPABILITY SPECIFICATION
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 2 }}>
                What {tool.name} Does Locally
              </Typography>

              <Stack spacing={1.75}>
                {(docs.features || []).map((feat, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: subtleBg,
                      border: `1px solid ${borderCol}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: '1.1rem',
                        color: isDark ? '#34D399' : '#047857',
                        mt: 0.25,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: primaryText, lineHeight: 1.6, fontWeight: 500 }}>
                      {feat}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </RevealOnScroll>

      {/* Local CLI Quickstart & MCP Agent Contract */}
      <RevealOnScroll preset="fadeUp">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: gold,
              mb: 1,
            }}
          >
            03 · LOCAL INSTALLATION &amp; AGENT CONTRACT
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
            CLI Quickstart &amp; MCP Interface
          </Typography>
          <Typography variant="body2" sx={{ color: secondaryText, mb: 3, maxWidth: 760 }}>
            Designed to run directly on Linux, macOS, or ZothOS terminals without browser sandbox limits. Autonomous agents invoke it via standardized MCP or JSON CLI flags.
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: primaryText, mb: 1 }}>
                Terminal Quickstart
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: '#0B0E14',
                  border: '1px solid rgba(245,241,230,0.12)',
                  color: '#E2E8F0',
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  lineHeight: 1.75,
                  overflowX: 'auto',
                }}
              >
                {(docs.quickstart || [cloneCommand]).map((line, i) => (
                  <Box key={i} component="div">
                    {line.startsWith('#') ? (
                      <Box component="span" sx={{ color: '#94A3B8' }}>{line}</Box>
                    ) : (
                      <>
                        <Box component="span" sx={{ color: '#D4AF37', userSelect: 'none' }}>$ </Box>
                        <Box component="span">{line}</Box>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: primaryText }}>
                  MCP Tool: {docs.aiAgentProtocol?.mcpTool || `${tool.id.replace(/-/g, '_')}_execute`}
                </Typography>
                {docs.aiAgentProtocol?.cliExample && (
                  <IconButton
                    size="small"
                    aria-label="Copy CLI example"
                    onClick={() => copyText(docs.aiAgentProtocol.cliExample, setCopiedMcp)}
                    sx={{ color: secondaryText }}
                  >
                    {copiedMcp ? <CheckIcon sx={{ fontSize: '0.95rem', color: '#10B981' }} /> : <ContentCopyIcon sx={{ fontSize: '0.95rem' }} />}
                  </IconButton>
                )}
              </Box>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: '#0B0E14',
                  border: '1px solid rgba(245,241,230,0.12)',
                  color: '#6EE7B7',
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  lineHeight: 1.65,
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(
                  {
                    mcpTool: docs.aiAgentProtocol?.mcpTool,
                    cli: docs.aiAgentProtocol?.cliExample,
                    inputSchema: docs.aiAgentProtocol?.inputSchema,
                  },
                  null,
                  2,
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </RevealOnScroll>

      {/* Unified Repository Funnel */}
      <SovereignFunnel
        toolTitle={`Option 1: ${tool.name}`}
        toolTag="STANDALONE REPO"
        toolDescription={`Clone ${tool.repo || tool.id} directly to run its local CLI binary, daemon, and test suite on your machine.`}
        toolRepo={repoUrl}
        toolCommand={cloneCommand}
      />
    </Container>
  );
}
