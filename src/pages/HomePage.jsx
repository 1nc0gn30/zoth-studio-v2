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
  Chip,
  Divider,
  Dialog,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LaunchIcon from '@mui/icons-material/Launch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';

import GoldenZLogo3D from '../components/GoldenZLogo3D';
import MathPillarsGrid from '../components/MathPillarsGrid';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll } from '../components/MotionReveal';
import { SovereignCard, useCopy } from '../components/sovereign';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const QUICKSTART_MODES = [
  {
    id: 'npx',
    label: 'CLI Launcher',
    cmd: 'npx @nullaitech/zoth studio',
    hint: 'Installs & launches Zoth Studio v2 on http://127.0.0.1:3000',
  },
  {
    id: 'clone',
    label: 'Clone Monorepo',
    cmd: 'git clone https://github.com/NullAITech/zoth-studio-v2.git',
    hint: 'Full React 19 + Loopback Studio API + 43 Workstations',
  },
  {
    id: 'list',
    label: 'List 79 Repos',
    cmd: 'npx @nullaitech/zoth list',
    hint: 'Inspect all 79 public GitHub tool repos & pull individually',
  },
];

const ECOSYSTEM_BRIDGES = [
  {
    kicker: 'DEBIAN 13 KDE PLASMA 6 · 23 DAEMONS',
    title: 'ZothOS v3.4.0',
    domain: 'zothos.nullai.tech',
    externalUrl: 'https://zothos.nullai.tech',
    studioRoute: '/zoth-os',
    studioLabel: 'OS Dossier',
    summary:
      'Persistent sovereign AI Linux workstation shipping 23 resident loopback daemons on 127.0.0.1, all 80 Zoth tools pre-installed, and local Ollama inference.',
  },
  {
    kicker: 'AMNESIC MONOTONE LIVE USB/ISO · TORAM',
    title: 'ZothOS-Lite v1.2',
    domain: 'zothos-lite.nullai.tech',
    externalUrl: 'https://zothos-lite.nullai.tech',
    studioRoute: '/tools/zothos-lite',
    studioLabel: 'Lite Specs',
    summary:
      'Tails-style RAM-resident Live USB/ISO (toram) in crisp monotone e-ink styling, pre-configured with 56 curated models across 8 providers and zero disk persistence.',
  },
  {
    kicker: '23 PANTHEON AGENTS · 22-KEY SANCTUARY',
    title: 'Zoth Civilization v3.0',
    domain: 'zoth-civilization.netlify.app',
    externalUrl: 'https://zoth-civilization.netlify.app',
    studioRoute: '/swarm',
    studioLabel: 'Swarm Hub',
    summary:
      'Autonomous 23-agent Pantheon society simulation featuring Imperator Quests, the 22-Key Sanctuary, and lightweight BYOK reasoning via DeepSeek Flash × Hermes.',
  },
  {
    kicker: 'ZERO-CLOUD ENCRYPTED MESH',
    title: 'ZothNet',
    domain: 'zothnet.nullai.tech',
    externalUrl: 'https://zothnet.nullai.tech',
    studioRoute: '/tools/zothnet',
    studioLabel: 'Mesh Tool',
    summary:
      'End-to-end encrypted peer-to-peer mesh overlay and sovereign relay connecting local agent enclaves without centralized cloud brokers or metadata leakage.',
  },
  {
    kicker: 'RESEARCH LAB & TACTICAL UTILITIES',
    title: 'NullAI & FieldKit',
    domain: 'nullai.tech/fieldkit',
    externalUrl: 'https://nullai.tech/fieldkit',
    secondaryExternalUrl: 'https://nullai.tech',
    secondaryExternalLabel: 'nullai.tech',
    founderUrl: 'https://1nc0gn30.si',
    founderLabel: '1nc0gn30.si',
    summary:
      'NullAI independent AI systems lab (nullai.tech), FieldKit tactical operator utilities (nullai.tech/fieldkit), and architecture dispatches by 1nc0gn30 (1nc0gn30.si).',
  },
  {
    kicker: `${microTools.length} FREE TOOLS · 79 PUBLIC REPOS`,
    title: 'Sovereign Arsenal & UI Kit',
    domain: 'zoth.nullai.tech/arsenal',
    studioRoute: '/arsenal',
    studioLabel: 'Open Arsenal',
    secondaryRoute: '/ui-kit',
    secondaryLabel: '@zoth/ui Kit',
    summary:
      '56 in-browser/WebGPU utilities and 24 local CLI/daemon packages across 79 public GitHub repositories, paired with 43 Studio workstations — 100% unlocked.',
  },
];

const FLAGSHIP_SYSTEMS = [
  {
    kicker: 'LIVE LINUX ISO · v3.4.0 & LITE v1.2',
    title: 'ZothOS & ZothOS-Lite',
    summary:
      'Bootable Debian 13 + KDE Plasma 6 workstation OS (23 daemons) paired with the amnesic toram ZothOS-Lite v1.2 Live USB/ISO (56 curated models across 8 providers).',
    route: '/zoth-os',
    toolRoute: '/tools/zoth-os',
    repo: 'https://github.com/NullAITech/zoth-os',
    externalUrl: 'https://zothos.nullai.tech',
    externalLabel: 'zothos.nullai.tech',
  },
  {
    kicker: 'MULTI-AGENT ORCHESTRATOR · :9393 / :8141',
    title: 'Pantheon Swarm & Civilization v3.0',
    summary:
      'Local agent multiplexer and Zoth Civilization v3.0 (23 Pantheon Agents, 22-Key Sanctuary) powered by DeepSeek Flash × Nous Research Hermes BYOK tool routing.',
    route: '/swarm',
    toolRoute: '/tools/zoth-swarm-multiplexer',
    repo: 'https://github.com/NullAITech/zoth-swarm-multiplexer',
    externalUrl: 'https://zoth-civilization.netlify.app',
    externalLabel: 'Civilization v3.0',
  },
  {
    kicker: 'SYNAPTIC GRAPH DAEMON · :8094',
    title: 'Neuro-Memory Service',
    summary:
      'Persistent Spike-Timing-Dependent Plasticity (STDP) vector and graph memory daemon bound strictly to localhost for decay-aware long-horizon agent recall.',
    route: '/memory',
    toolRoute: '/tools/neuro-memory-daemon',
    repo: 'https://github.com/NullAITech/neuro-memory-daemon',
  },
  {
    kicker: 'CODE SYNTHESIS ENGINE · :5173',
    title: 'Zoth Bolt WebGen',
    summary:
      'Local full-stack AST synthesizer and multi-model compilation pipeline that builds, tests, and exports complete applications directly on your own machine.',
    route: '/tools/zoth-bolt',
    toolRoute: '/tools/zoth-bolt',
    repo: 'https://github.com/1nc0gn30/bolt.diy',
  },
  {
    kicker: 'SECURITY AUDIT SUITE · :8888',
    title: 'HexStrike AI',
    summary:
      'Local reconnaissance, YARA/Sigma rule synthesis, CVE surface auditing, and binary inspection designed for defensive and red-team security engineers.',
    route: '/hexstrike',
    toolRoute: '/tools/hexstrike-arsenal',
    repo: 'https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal',
  },
  {
    kicker: 'DETERMINISTIC PLANNING · :8135',
    title: 'Adytum 22-Key Chamber',
    summary:
      'Structured 22-stage architectural specification engine that validates requirements, invariants, and test matrices before autonomous code generation begins.',
    route: '/adytum',
    toolRoute: '/tools/adytum-alchemist-ai-workflow',
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
  const [qsIndex, setQsIndex] = useState(0);
  const [reelOpen, setReelOpen] = useState(false);
  const { copied, copy } = useCopy(2000);

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const goldLine = isDark ? '#D4AF37' : '#B8860B';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const subtleBg = isDark ? '#11141D' : '#F3EFE6';
  const codeBoxBg = isDark ? '#0B0E15' : '#F3EFE6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const specularBorder = isDark ? 'rgba(212, 175, 55, 0.28)' : 'rgba(184, 134, 11, 0.32)';

  const activeQuickstart = QUICKSTART_MODES[qsIndex] || QUICKSTART_MODES[0];

  const featuredTools = useMemo(
    () => FEATURED_TOOL_IDS.map((id) => microTools.find((t) => t.id === id)).filter(Boolean),
    [],
  );

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4.5, md: 7.5 } }}>
        {/* 1. Editorial Hero */}
        <HeroReveal>
          <Grid container spacing={{ xs: 4, md: 5.5 }} alignItems="center" sx={{ mb: { xs: 7, md: 10 } }}>
            <Grid xs={12} md={7}>
              <GlowLine
                height={2}
                color={goldLine}
                glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.22)'}
              />

              <HeroItem>
                <Typography
                  sx={{
                    mt: 2.5,
                    mb: 1.5,
                    fontFamily: mono,
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: gold,
                  }}
                >
                  SOVEREIGN AI ENGINEERING SUITE · {microTools.length} FREE OPEN-ACCESS TOOLS
                </Typography>
              </HeroItem>

              <HeroItem>
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: display,
                    fontSize: { xs: '2.3rem', sm: '3.15rem', md: '3.75rem' },
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
                    fontSize: { xs: '0.98rem', md: '1.08rem' },
                    lineHeight: 1.7,
                    color: secondaryText,
                    maxWidth: '58ch',
                    mb: 3,
                  }}
                >
                  Zoth Studio unifies <strong>{microTools.length} free open-access tools</strong> (56 in-browser/WebGPU + 24 CLI/daemon across{' '}
                  <strong>79 public GitHub repositories</strong>) with <strong>43 Studio workstations</strong> — engineered to execute on{' '}
                  <Box component="code" sx={{ fontFamily: mono, fontSize: '0.9em', color: gold }}>
                    127.0.0.1
                  </Box>{' '}
                  with zero cloud telemetry and zero paywalls.
                </Typography>
              </HeroItem>

              {/* Dual-Theme Interactive Quickstart Switcher */}
              <HeroItem>
                <Box
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: codeBoxBg,
                    border: `1px solid ${specularBorder}`,
                    boxShadow: isDark
                      ? '0 10px 30px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(212, 175, 55, 0.14)'
                      : '0 6px 20px rgba(16, 24, 40, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.85,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.75,
                      borderBottom: `1px solid ${borderCol}`,
                      bgcolor: isDark ? 'rgba(212, 175, 55, 0.06)' : 'rgba(184, 134, 11, 0.07)',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {QUICKSTART_MODES.map((m, idx) => {
                        const active = idx === qsIndex;
                        return (
                          <Chip
                            key={m.id}
                            label={m.label}
                            size="small"
                            clickable
                            onClick={() => setQsIndex(idx)}
                            sx={{
                              height: 26,
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: active
                                ? isDark
                                  ? '#D4AF37'
                                  : '#101828'
                                : isDark
                                  ? 'rgba(255,255,255,0.04)'
                                  : '#FFFFFF',
                              color: active ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                              border: `1px solid ${active ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
                              '&:hover': {
                                bgcolor: active
                                  ? isDark
                                    ? '#E5C158'
                                    : '#1E293B'
                                  : isDark
                                    ? 'rgba(255,255,255,0.08)'
                                    : '#FAF8F3',
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.66rem',
                        color: secondaryText,
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {activeQuickstart.hint}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      px: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                      <TerminalIcon sx={{ color: goldLine, fontSize: '1.1rem', flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: { xs: '0.76rem', sm: '0.84rem' },
                          fontWeight: 600,
                          color: primaryText,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {activeQuickstart.cmd}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => copy(activeQuickstart.cmd)}
                      startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                      sx={{
                        minHeight: { xs: 44, sm: 36 },
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'none',
                        bgcolor: isDark ? '#D4AF37' : '#101828',
                        color: isDark ? '#08080B' : '#FFFFFF',
                        px: 1.8,
                        flexShrink: 0,
                        '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </Box>
                </Box>
              </HeroItem>

              {/* Primary CTAs */}
              <HeroItem>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  <Button
                    component={RouterLink}
                    to="/arsenal"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      minHeight: 44,
                      bgcolor: isDark ? '#D4AF37' : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      whiteSpace: 'nowrap',
                      px: 2.35,
                      textTransform: 'none',
                      '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                    }}
                  >
                    Explore {microTools.length} Tools
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => setReelOpen(true)}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      minHeight: 44,
                      borderColor: specularBorder,
                      bgcolor: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(184,134,11,0.06)',
                      color: primaryText,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      px: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: goldLine,
                        bgcolor: isDark ? 'rgba(212,175,55,0.14)' : 'rgba(184,134,11,0.12)',
                      },
                    }}
                  >
                    Launch Reel
                  </Button>

                  <Button
                    variant="outlined"
                    href="https://github.com/NullAITech/zoth-studio-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                    sx={{
                      minHeight: 44,
                      borderColor: borderCol,
                      color: primaryText,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      px: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: goldLine,
                        bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(16,24,40,0.04)',
                      },
                    }}
                  >
                    GitHub Repo
                  </Button>
                </Box>
              </HeroItem>
            </Grid>

            {/* Right Architectural Summary Plate */}
            <Grid xs={12} md={5}>
              <HeroItem>
                <SovereignCard
                  ticks
                  sx={{
                    p: { xs: 2.75, sm: 3.5 },
                    borderRadius: 2.5,
                    bgcolor: cardBg,
                    border: `1px solid ${specularBorder}`,
                    borderTop: `2px solid ${goldLine}`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      pb: 2.5,
                      mb: 2.5,
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
                        flexShrink: 0,
                      }}
                    >
                      <GoldenZLogo3D size={50} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          color: gold,
                        }}
                      >
                        GROUND-TRUTH INVARIANTS
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: display, fontWeight: 400, fontSize: '1.35rem', color: primaryText }}
                      >
                        Why Local Execution Wins
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      [
                        `${microTools.length} Free Open-Access Tools`,
                        '56 in-browser/WebGPU utilities + 24 CLI/daemon packages across 79 public GitHub repositories.',
                      ],
                      [
                        'ZothOS v3.4.0 & Lite v1.2',
                        '23 resident Debian 13 KDE Plasma 6 daemons plus amnesic toram Live USB with 56 models across 8 providers.',
                      ],
                      [
                        'Zoth Civilization v3.0',
                        'Autonomous 23 Pantheon Agents, 22-Key Sanctuary, and DeepSeek Flash × Hermes BYOK reasoning.',
                      ],
                      [
                        'Zero Cloud Telemetry',
                        '100% unlocked with zero paywalls. Prompts, source ASTs, and keys stay strictly on 127.0.0.1.',
                      ],
                    ].map(([heading, desc]) => (
                      <Box key={heading}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: primaryText, mb: 0.25 }}>
                          {heading}
                        </Typography>
                        <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.83rem', lineHeight: 1.55 }}>
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SovereignCard>
              </HeroItem>
            </Grid>
          </Grid>
        </HeroReveal>

        {/* 2. Sovereign Ecosystem Matrix (NullAI, ZothOS, ZothOS-Lite, Civilization, ZothNet, FieldKit) */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 7, md: 10 } }}>
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: gold,
                    mb: 0.75,
                  }}
                >
                  01 · SOVEREIGN ECOSYSTEM MATRIX
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Connected NullAI &amp; Zoth Properties
                </Typography>
              </Box>
              <Button
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: '0.95rem !important' }} />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
              >
                NullAI Platform Hub
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {ECOSYSTEM_BRIDGES.map((item) => (
                <Grid xs={12} sm={6} md={4} key={item.title} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 2.5,
                      bgcolor: cardBg,
                      border: `1px solid ${borderCol}`,
                      borderTop: `2px solid ${specularBorder}`,
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                        borderColor: goldLine,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.75 }}>
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          color: gold,
                          mb: 1,
                        }}
                      >
                        {item.kicker}
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: display,
                          fontWeight: 400,
                          fontSize: '1.35rem',
                          color: primaryText,
                          mb: 1,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.62 }}>
                        {item.summary}
                      </Typography>
                    </CardContent>

                    <CardActions
                      sx={{
                        px: 2.75,
                        pb: 2.25,
                        pt: 1.25,
                        borderTop: `1px solid ${borderCol}`,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, alignItems: 'center' }}>
                        {item.studioRoute && (
                          <Button
                            size="small"
                            variant="contained"
                            component={RouterLink}
                            to={item.studioRoute}
                            sx={{
                              minHeight: { xs: 44, sm: 34 },
                              bgcolor: isDark ? '#D4AF37' : '#101828',
                              color: isDark ? '#08080B' : '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              textTransform: 'none',
                              px: 1.5,
                              '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                            }}
                          >
                            {item.studioLabel}
                          </Button>
                        )}
                        {item.secondaryRoute && (
                          <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={item.secondaryRoute}
                            sx={{
                              minHeight: { xs: 44, sm: 34 },
                              borderColor: borderCol,
                              color: primaryText,
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              textTransform: 'none',
                              px: 1.4,
                              '&:hover': { borderColor: goldLine, color: gold },
                            }}
                          >
                            {item.secondaryLabel}
                          </Button>
                        )}
                        {item.secondaryExternalUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={item.secondaryExternalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              minHeight: { xs: 44, sm: 34 },
                              borderColor: borderCol,
                              color: primaryText,
                              fontFamily: mono,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              textTransform: 'none',
                              px: 1.2,
                              '&:hover': { borderColor: goldLine, color: gold },
                            }}
                          >
                            {item.secondaryExternalLabel}
                          </Button>
                        )}
                        {item.founderUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={item.founderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              minHeight: { xs: 44, sm: 34 },
                              borderColor: borderCol,
                              color: primaryText,
                              fontFamily: mono,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              textTransform: 'none',
                              px: 1.2,
                              '&:hover': { borderColor: goldLine, color: gold },
                            }}
                          >
                            {item.founderLabel}
                          </Button>
                        )}
                      </Box>

                      {item.externalUrl && (
                        <Button
                          size="small"
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '0.82rem !important' }} />}
                          sx={{
                            minHeight: { xs: 44, sm: 34 },
                            fontFamily: mono,
                            fontSize: '0.71rem',
                            fontWeight: 700,
                            color: gold,
                            textTransform: 'none',
                          }}
                        >
                          {item.domain}
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* 3. Flagship Studio Subsystems */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 7, md: 10 } }}>
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: gold,
                    mb: 0.75,
                  }}
                >
                  02 · STUDIO ARCHITECTURE
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Six Core Studio Engines
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/workstations"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
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
                      '&:hover': { borderColor: goldLine },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          color: gold,
                          mb: 1,
                        }}
                      >
                        {sys.kicker}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontFamily: display, fontWeight: 400, fontSize: '1.45rem', color: primaryText, mb: 1.25 }}
                      >
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        {sys.toolRoute && (
                          <Button
                            size="small"
                            variant="contained"
                            component={RouterLink}
                            to={sys.toolRoute}
                            startIcon={<LaunchIcon sx={{ fontSize: '0.85rem !important' }} />}
                            sx={{
                              minHeight: { xs: 44, sm: 34 },
                              bgcolor: isDark ? '#D4AF37' : '#101828',
                              color: isDark ? '#08080B' : '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              textTransform: 'none',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: isDark ? '#E5C158' : '#1E293B',
                              },
                            }}
                          >
                            Studio Tool
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          component={RouterLink}
                          to={sys.route}
                          sx={{
                            minHeight: { xs: 44, sm: 34 },
                            borderColor: borderCol,
                            color: primaryText,
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            textTransform: 'none',
                            px: 1.5,
                            '&:hover': {
                              borderColor: goldLine,
                              color: gold,
                            },
                          }}
                        >
                          Dossier
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          href={sys.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<GitHubIcon sx={{ fontSize: '0.9rem !important' }} />}
                          sx={{
                            minHeight: { xs: 44, sm: 34 },
                            borderColor: borderCol,
                            color: primaryText,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: goldLine,
                              color: gold,
                            },
                          }}
                        >
                          Repo
                        </Button>
                      </Box>

                      {sys.externalUrl && (
                        <Button
                          size="small"
                          href={sys.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
                          sx={{
                            minHeight: { xs: 44, sm: 34 },
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

        {/* 4. Featured Standalone Repositories */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 7, md: 10 } }}>
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: gold,
                    mb: 0.75,
                  }}
                >
                  03 · STANDALONE PACKAGES
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Selected Open-Access Tools
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/tools"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
              >
                Search All 80+ Tool Specs
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
                      transition: 'border-color 0.2s ease',
                      '&:hover': { borderColor: goldLine },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: gold,
                          textTransform: 'uppercase',
                          mb: 1,
                        }}
                      >
                        {tool.category} {tool.localPort ? `· :${tool.localPort}` : ''}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', color: primaryText, mb: 1 }}>
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.84rem', lineHeight: 1.6 }}>
                        {tool.description}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        px: 2.5,
                        pb: 2.25,
                        pt: 1,
                        borderTop: `1px solid ${borderCol}`,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/tools/${tool.id}`}
                        sx={{ fontWeight: 700, color: primaryText, textTransform: 'none', minHeight: { xs: 44, sm: 34 } }}
                      >
                        Open Tool →
                      </Button>
                      <Button
                        size="small"
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon sx={{ fontSize: '0.88rem !important' }} />}
                        sx={{ fontWeight: 700, color: secondaryText, textTransform: 'none', minHeight: { xs: 44, sm: 34 } }}
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

        {/* 5. Mathematical Foundations */}
        <RevealOnScroll preset="fadeUp">
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Box
              sx={{
                mb: 3.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: gold,
                    mb: 0.75,
                  }}
                >
                  04 · FORMAL FOUNDATIONS
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: display, fontWeight: 400, color: primaryText }}>
                  Six Mathematical Pillars
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/docs/math"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: gold, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
              >
                Full Proofs &amp; Derivations
              </Button>
            </Box>
            <MathPillarsGrid variant="teaser" />
          </Box>
        </RevealOnScroll>

        {/* 6. Local Installation & Open-Access Support Deck */}
        <SovereignFunnel />
      </Container>

      {/* Deterministic Motion Showreel Modal */}
      <Dialog
        open={reelOpen}
        onClose={() => setReelOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: '#08080B',
            border: '1px solid rgba(212, 175, 55, 0.38)',
            borderRadius: 2.5,
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(245, 241, 230, 0.12)',
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', color: '#D4AF37' }}>
              SOVEREIGN APERTURE CHOREOGRAPHY · 60FPS
            </Typography>
            <Typography sx={{ fontFamily: display, fontSize: '1.15rem', color: '#F5F1E6' }}>
              Zoth Studio v2 — Deterministic Launch Cut
            </Typography>
          </Box>
          <IconButton
            aria-label="Close launch reel"
            onClick={() => setReelOpen(false)}
            sx={{ color: '#F5F1E6', minWidth: 44, minHeight: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ bgcolor: '#050507', position: 'relative' }}>
          <Box
            component="video"
            controls
            autoPlay
            playsInline
            poster="/og-banner.jpg"
            sx={{ width: '100%', display: 'block', maxHeight: '72vh' }}
          >
            <source src="/intros/home-desktop.webm" type="video/webm" />
            <source src="/intros/home-desktop.mp4" type="video/mp4" />
          </Box>
        </Box>
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderTop: '1px solid rgba(245, 241, 230, 0.12)',
          }}
        >
          <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#A3AAB8' }}>
            {microTools.length} Free Open-Access Tools (56 WebGPU + 24 CLI) · 79 Public GitHub Repos · 43 Workstations
          </Typography>
          <Button
            size="small"
            component={RouterLink}
            to="/gallery"
            onClick={() => setReelOpen(false)}
            sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37', textTransform: 'none' }}
          >
            All Studio Reels →
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
