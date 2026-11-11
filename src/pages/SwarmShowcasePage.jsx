import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocalSystemDossier from '../components/LocalSystemDossier';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

export default function SwarmShowcasePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? '#0E1016' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A8A29E' : '#334155';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';
  const emerald = isDark ? '#34D399' : '#047857';
  const gold = isDark ? '#D4AF37' : '#7A5808';

  return (
    <LocalSystemDossier
      tone="emerald"
      kicker="PANTHEON SWARM MULTIPLEXER"
      badges={['LOCAL DAEMON :8141', '21-AGENT DAG', 'ZERO CLOUD TELEMETRY']}
      title="Multi-Agent Orchestration on"
      accentWord="Local Silicon."
      subtitle="Pantheon coordinates planner, implementer, verifier, and security specialist agents over loopback IPC. Instead of running fragile browser toy prompts, clone the multiplexer repository or Zoth Studio v2 to dispatch real multi-file builds, AST audits, and consensus checks on your own workstation."
      cloneCommand="git clone https://github.com/NullAITech/zoth-swarm-multiplexer.git && cd zoth-swarm-multiplexer"
      repoUrl="https://github.com/NullAITech/zoth-swarm-multiplexer"
      repoLabel="Get Swarm Multiplexer Repo"
      docsRoute="/swarm/docs"
      docsLabel="Swarm Protocol Specification"
      externalLinks={[
        { label: 'Zoth Egregore Site', href: 'https://zoth-egregore.netlify.app' },
        { label: 'Zoth Civilization', href: 'https://zoth-civilization.netlify.app' },
      ]}
      overviewTitle="Deterministic Task Routing & Verifier Gates"
      overviewParagraphs={[
        'Single-shot LLM calls degrade rapidly when modifying real repositories. Pantheon decomposes high-level engineering goals into a typed Directed Acyclic Graph (DAG), assigning isolated worktrees and scoped tool permissions to specialized local workers.',
        'Every patch produced by a worker node passes through an independent auditor stage—running static analysis, test suites, and secret scanners locally—before changes merge back into your working branch.',
      ]}
      pipelineSteps={[
        {
          label: 'Intent Decomposition',
          detail: 'Archon planner parses repository structure and emits a dependency-ordered execution graph.',
        },
        {
          label: 'Parallel Cadre Dispatch',
          detail: 'Up to 21 specialized local worker roles execute concurrently across Ollama, Hermes, or configured API bridges.',
        },
        {
          label: 'Deterministic Verification Gate',
          detail: 'Auditor nodes validate exit codes, diff invariants, and test suites prior to commit.',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8141' },
        { key: 'CLI Entrypoint', value: 'zoth-swarm' },
        { key: 'Runtime Backends', value: 'Hermes Agent / Ollama / OpenAI-Compatible' },
        { key: 'Memory Substrate', value: 'Neuro-Memory STDP (:8094)' },
        { key: 'Workspace Isolation', value: 'Git Worktree per Worker' },
        { key: 'Telemetry Policy', value: 'Zero External Egress' },
      ]}
      quickstartLines={[
        '# Clone standalone multiplexer & start local daemon',
        'git clone https://github.com/NullAITech/zoth-swarm-multiplexer.git',
        'cd zoth-swarm-multiplexer',
        'python3 server.py --port 8141',
        '',
        '# Or invoke directly on ZothOS',
        'zoth-swarm status --json',
      ]}
      capabilitiesKicker="SWARM ARCHITECTURE"
      capabilitiesTitle="Core Capabilities Installed Locally"
      capabilities={[
        {
          tag: 'DAG ROUTER',
          title: 'Role-Specialized Cadres',
          desc: 'Dedicated planner, systems coder, security auditor, and test verifier personas operate with strict tool boundaries rather than a monolithic prompt.',
        },
        {
          tag: 'ISOLATION',
          title: 'Git Worktree Sandboxing',
          desc: 'Parallel agents write to isolated git worktrees so concurrent experiments never corrupt your primary checkout.',
        },
        {
          tag: 'VERIFICATION',
          title: 'Automated Diff & Test Gates',
          desc: 'Outputs are gated by real shell exit codes, linter passes, and Gitleaks scans before synthesis completes.',
        },
        {
          tag: 'LOCAL-FIRST',
          title: 'Hermes & Local Model Native',
          desc: 'Designed to pair seamlessly with Nous Research Hermes Agent, DeepSeek-Flash, and local Ollama quantizations.',
        },
      ]}
      funnelToolTitle="Pantheon Swarm Multiplexer"
      funnelToolTag="SWARM ORCHESTRATION"
      funnelToolDesc="21-agent local task multiplexer with git worktree isolation and deterministic verification gates."
    >
      {/* Companion Ecosystem Dossier: Zoth Egregore & Zoth Civilization */}
      <Box>
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: emerald,
            mb: 0.75,
          }}
        >
          COMPANION SWARM PROPERTIES
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: { xs: '1.75rem', md: '2.15rem' },
            color: textPrimary,
            mb: 3,
            lineHeight: 1.15,
          }}
        >
          Connected Swarm Research & Agent Releases
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2.5,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.75, md: 3.5 },
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${hairline}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: gold,
                mb: 1,
              }}
            >
              AGENT ARCHITECTURE • BETA
            </Typography>
            <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.55rem', color: textPrimary, mb: 1 }}>
              Zoth Egregore (DeepSeek-Flash + Hermes)
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.68, color: textSecondary, mb: 2.5, flex: 1 }}>
              Our sovereign coding and systems agent built atop Nous Research Hermes Agent and DeepSeek-Flash, engineered to invoke all 77 local Zoth Studio CLI & MCP tools natively on ZothOS. Benchmarks, test harnesses, and HuggingFace weights are in active preparation.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <Button
                component="a"
                href="https://zoth-egregore.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  color: textPrimary,
                  borderColor: hairline,
                  '&:hover': { borderColor: gold, color: gold },
                }}
              >
                Visit Egregore Docs
              </Button>
              <Button
                component="a"
                href="https://github.com/1nc0gn30/zoth-egregore"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<GitHubIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  color: gold,
                  borderColor: hairline,
                  '&:hover': { borderColor: gold },
                }}
              >
                1nc0gn30/zoth-egregore
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.75, md: 3.5 },
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${hairline}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: emerald,
                mb: 1,
              }}
            >
              AUTONOMOUS SANCTUARY • LIVE SIMULATION
            </Typography>
            <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.55rem', color: textPrimary, mb: 1 }}>
              Zoth Civilization
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.68, color: textSecondary, mb: 2.5, flex: 1 }}>
              Persistent multi-agent society where autonomous personas debate, form consensus, craft artifacts, and record shared memories. Configurable with lightweight DeepSeek-Flash via Nous Research Hermes Agent or local loopback inference.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <Button
                component="a"
                href="https://zoth-civilization.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  color: textPrimary,
                  borderColor: hairline,
                  '&:hover': { borderColor: emerald, color: emerald },
                }}
              >
                Open Zoth Civilization
              </Button>
              <Button
                component="a"
                href="https://github.com/1nc0gn30/zoth-civilization"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<GitHubIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  color: emerald,
                  borderColor: hairline,
                  '&:hover': { borderColor: emerald },
                }}
              >
                1nc0gn30/zoth-civilization
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </LocalSystemDossier>
  );
}
