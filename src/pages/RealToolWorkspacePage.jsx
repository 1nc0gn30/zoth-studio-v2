import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import CodeIcon from '@mui/icons-material/Code';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { microTools } from '../data/toolsData';
import { getToolDocumentation } from '../data/toolsDocumentation';
import SovereignFunnel from '../components/SovereignFunnel';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function RealToolWorkspacePage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
  const docs = getToolDocumentation(tool);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.3)',
  };

  const handleCopy = (text, setCopiedFn) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedFn(true);
      setTimeout(() => setCopiedFn(false), 2000);
    }
  };

  if (!tool) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary }}>
          Tool Repository Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The requested tool identifier <code>"{toolId}"</code> does not exist in the active catalog.
        </Typography>
        <Button
          component={RouterLink}
          to="/tools"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800 }}
        >
          Return to Tool Nexus
        </Button>
      </Container>
    );
  }

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        [tool.id]: {
          command: tool.executionType === 'local_cli' ? 'python3' : 'npx',
          args: tool.executionType === 'local_cli' ? ['-m', `${tool.repo.replace(/-/g, '_')}.mcp`] : [tool.id, '--mcp'],
          env: {
            ZOTH_ZERO_EGRESS: 'true',
            ZOTH_LOCAL_INVARIANT: 'enforced',
          },
        },
      },
    },
    null,
    2
  );

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* Breadcrumb & Navigation */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          component={RouterLink}
          to="/tools"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: 'text.secondary',
            fontFamily: mono,
            fontSize: '0.82rem',
            fontWeight: 700,
            '&:hover': { color: gold.accent },
          }}
        >
          Back to Tool Catalog
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label="SOVEREIGN TOOL REPOSITORY"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontFamily: mono,
              fontWeight: 800,
              bgcolor: gold.wash,
              color: gold.soft,
              border: `1px solid ${gold.border}`,
            }}
          />
          <Chip
            label="ZERO-EGRESS INVARIANT"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontFamily: mono,
              fontWeight: 800,
              bgcolor: isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7',
              color: '#22C55E',
              border: `1px solid rgba(34,197,94,0.35)`,
            }}
          />
        </Box>
      </Box>

      {/* Hero Dossier Header */}
      <Paper
        sx={{
          p: { xs: 3, md: 4.5 },
          mb: 5,
          borderRadius: 3,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          border: `1px solid ${gold.border}`,
          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6), 0 0 20px -4px rgba(212,175,55,0.2)' : '0 4px 16px rgba(184,134,11,0.12)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Box sx={{ maxWidth: 760 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={tool.category}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                label={`v${tool.version || '1.0.0'}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  color: gold.accent,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                label={tool.executionType === 'local_cli' ? 'LOCAL CLI & MCP DAEMON' : 'STANDALONE WASM RUNTIME'}
                size="small"
                sx={{
                  fontFamily: mono,
                  bgcolor: gold.wash,
                  color: gold.soft,
                  border: `1px solid ${gold.border}`,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
              {tool.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.65 }}>
              {tool.description}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
            {tool.github && (
              <Button
                component="a"
                href={tool.github}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<GitHubIcon />}
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontWeight: 800,
                  borderColor: gold.border,
                  color: theme.palette.text.primary,
                  '&:hover': { borderColor: gold.accent, bgcolor: gold.wash },
                }}
              >
                GitHub Repository
              </Button>
            )}
            <Button
              component={RouterLink}
              to="/zoth-os"
              variant="contained"
              startIcon={<LaunchIcon />}
              sx={{
                bgcolor: gold.accent,
                color: '#08080B',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7008' },
              }}
            >
              Run in ZothOS
            </Button>
          </Stack>
        </Box>

        {/* Quick Pull Terminal Command Strip */}
        <Box
          sx={{
            mt: 3.5,
            p: 1.8,
            borderRadius: 2,
            bgcolor: isDark ? '#040406' : '#F8FAFC',
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <TerminalIcon sx={{ color: gold.accent, fontSize: 20 }} />
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: { xs: '0.78rem', sm: '0.88rem' },
                color: isDark ? '#E2E8F0' : '#1E293B',
                wordBreak: 'break-all',
              }}
            >
              {tool.pull || `git clone ${tool.github}.git`}
            </Typography>
          </Box>
          <Tooltip title={copiedCmd ? 'Copied command!' : 'Copy to clipboard'}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopy(tool.pull || `git clone ${tool.github}.git`, setCopiedCmd)}
              startIcon={copiedCmd ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                fontWeight: 700,
                borderColor: gold.border,
                color: gold.soft,
                whiteSpace: 'nowrap',
              }}
            >
              {copiedCmd ? 'Copied' : 'Copy Command'}
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* SECTION 1: Why Use This Tool & Problem Solved */}
      <Box sx={{ mb: 6 }}>
        <Typography className="section-kicker">Architectural Rationale & Sovereign Philosophy</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 3, color: theme.palette.text.primary }}>
          Why Sovereign Developers & AI Agents Need {tool.name}
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3.5,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SecurityIcon sx={{ color: gold.accent, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  The Sovereign Purpose (Why to Use It)
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                {docs.whyUse}
              </Typography>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3.5,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AutoFixHighIcon sx={{ color: '#22C55E', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Eliminated SaaS Pain Points & Telemetry Risks
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                {docs.problemSolved}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Core Capabilities List */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: gold.accent, fontFamily: mono, letterSpacing: '0.04em' }}>
            VERIFIED INVARIANT CAPABILITIES:
          </Typography>
          <Grid container spacing={1.5}>
            {docs.features.map((feature, idx) => (
              <Grid xs={12} sm={6} md={4} key={idx}>
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <CheckCircleIcon sx={{ color: gold.accent, fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, lineHeight: 1.4 }}>
                    {feature}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* SECTION 2: AI Agent & Local Model Integration Protocol */}
      <Box sx={{ mb: 6 }}>
        <Typography className="section-kicker">Machine-Readable Interface & Automation</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1.5, color: theme.palette.text.primary }}>
          Autonomous AI Agent & Local LLM Integration Protocol
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 840, lineHeight: 1.65 }}>
          This tool is engineered for seamless execution by autonomous agents (Hermes Agent, Claude Code, OpenCode, Codex, Ollama). It exports standard Model Context Protocol (MCP) tool endpoints and deterministic CLI arguments.
        </Typography>

        <Grid container spacing={3}>
          {/* MCP Server Integration Config */}
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon sx={{ color: gold.accent, fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    Model Context Protocol (MCP) Config
                  </Typography>
                </Box>
                <Tooltip title={copiedMcp ? 'Copied MCP config!' : 'Copy MCP JSON'}>
                  <IconButton size="small" onClick={() => handleCopy(mcpConfigSnippet, setCopiedMcp)} sx={{ color: gold.accent }}>
                    {copiedMcp ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                Paste into your <code>claude_desktop_config.json</code>, Cursor, or Cline MCP settings:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040406' : '#F1F5F9',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  color: isDark ? '#A7F3D0' : '#065F46',
                  overflowX: 'auto',
                  flexGrow: 1,
                }}
              >
                {mcpConfigSnippet}
              </Box>
            </Paper>
          </Grid>

          {/* CLI Invocation & Contracts */}
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TerminalIcon sx={{ color: gold.accent, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Autonomous Agent CLI Execution Example
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                How local models (via Ollama/vLLM) and cloud models trigger this tool deterministically:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040406' : '#F1F5F9',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  color: gold.accent,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
                $ {docs.aiAgentProtocol?.cliExample || `zoth run ${tool.id} --help`}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem', color: theme.palette.text.primary, mb: 0.5, fontFamily: mono }}>
                JSON-RPC TOOL ENDPOINT:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: gold.soft, mb: 1.5, fontSize: '0.82rem' }}>
                <code>{docs.aiAgentProtocol?.mcpTool || `${tool.id.replace(/-/g, '_')}_execute`}</code> — {docs.aiAgentProtocol?.description || 'Execute tool'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 700 }}>
                INPUT / OUTPUT CONTRACTS:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 1.5,
                  m: 0,
                  borderRadius: 1.5,
                  bgcolor: isDark ? '#040406' : '#F1F5F9',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  color: isDark ? '#94A3B8' : '#475467',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify({ inputSchema: docs.aiAgentProtocol?.inputSchema, outputSchema: docs.aiAgentProtocol?.outputSchema }, null, 2)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* SECTION 3: Technical Architecture & Verification */}
      <Box sx={{ mb: 6 }}>
        <Typography className="section-kicker">Runtime Architecture & Local Verification</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 3, color: theme.palette.text.primary }}>
          Technical Specifications & Local Quickstart
        </Typography>

        <Paper
          sx={{
            p: 3.5,
            borderRadius: 2.5,
            bgcolor: isDark ? '#08080B' : '#FFFFFF',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <MemoryIcon sx={{ color: gold.accent, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Runtime & Execution Architecture
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                {docs.architecture}
              </Typography>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>SOVEREIGN NETWORK POLICY:</Typography>
                <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: '#22C55E' }}>
                  100% Zero-Egress // No Outbound Cloud Requests
                </Typography>
              </Box>
            </Grid>

            <Grid xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TerminalIcon sx={{ color: gold.accent, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Local Verification & Test Suite
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Execute these commands in your local terminal to clone, install, and run automated unit tests:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040406' : '#F1F5F9',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  color: isDark ? '#E2E8F0' : '#1E293B',
                  lineHeight: 1.7,
                  overflowX: 'auto',
                }}
              >
                {docs.quickstart.map((cmd) => `$ ${cmd}`).join('\n')}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* SECTION 4: Sovereign Funnel */}
      <Box sx={{ mt: 6 }}>
        <SovereignFunnel
          title={`Deploy ${tool.name} in Your Sovereign Workspace`}
          subtitle="Choose between pulling this standalone micro-tool repository, running it natively inside Zoth Studio, or booting ZothOS where all 29 tools are pre-configured."
          toolTitle={tool.name}
          toolDescription={tool.description}
          toolRepo={tool.github}
          toolCommand={tool.pull || `git clone ${tool.github}.git`}
        />
      </Box>
    </Container>
  );
}
