import React, { useEffect, useState, useMemo } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box,
  Container,
  Typography,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import TerminalIcon from '@mui/icons-material/Terminal';
import HubIcon from '@mui/icons-material/Hub';
import MemoryIcon from '@mui/icons-material/Memory';
import ShieldIcon from '@mui/icons-material/Shield';
import GavelIcon from '@mui/icons-material/Gavel';
import LayersIcon from '@mui/icons-material/Layers';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import LockIcon from '@mui/icons-material/Lock';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';

import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';
import { microTools } from '../data/toolsData';
import MathPillarsGrid from '../components/MathPillarsGrid';
import ZeroEgressPanel from '../components/ZeroEgressPanel';
import WorkstationMap from '../components/WorkstationMap';
import SovereignFunnel from '../components/SovereignFunnel';

/**
 * Reusable CodeSnippet component with pristine gold-on-void aesthetic
 * and interactive copy button with animated confirmation feedback.
 */
function CodeSnippet({ title, code, language = 'bash' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      sx={{
        bgcolor: '#08080B',
        borderRadius: 2.5,
        border: '1px solid rgba(212,175,55,0.22)',
        borderLeft: '4px solid #D4AF37',
        overflow: 'hidden',
        my: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 0.9,
          bgcolor: 'rgba(212,175,55,0.06)',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D4AF37' }} />
          <Typography
            variant="caption"
            sx={{
              color: '#F5E6AB',
              fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          >
            {title || language.toUpperCase()}
          </Typography>
        </Box>
        <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy snippet'}>
          <Button
            size="small"
            onClick={handleCopy}
            startIcon={
              copied ? (
                <CheckIcon sx={{ fontSize: '14px !important', color: '#34D399' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: '14px !important' }} />
              )
            }
            sx={{
              py: 0.25,
              px: 1.2,
              minHeight: 26,
              fontSize: '0.72rem',
              color: copied ? '#34D399' : '#D4AF37',
              borderColor: copied ? 'rgba(52,211,153,0.4)' : 'rgba(212,175,55,0.3)',
              bgcolor: copied ? 'rgba(52,211,153,0.1)' : 'rgba(212,175,55,0.08)',
              border: '1px solid',
              borderRadius: 1.5,
              fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(212,175,55,0.2)',
                borderColor: '#D4AF37'
              }
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
          fontSize: '0.84rem',
          lineHeight: 1.6,
          color: '#E6EDF3',
          overflowX: 'auto',
          whiteSpace: 'pre'
        }}
      >
        <code>{code}</code>
      </Box>
    </Paper>
  );
}

export default function DocsPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#715507';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const voidDark = '#08080B';
  const surface = dark ? '#0E1017' : '#FFFFFF';
  const textPrimary = dark ? '#F3F4F6' : '#101828';
  const textSecondary = dark ? '#9CA3AF' : '#475467';
  const divider = dark ? 'rgba(212,175,55,0.15)' : '#EAECF0';

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('sec-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedToolCategory, setSelectedToolCategory] = useState('All');
  const [terminalTab, setTerminalTab] = useState(0);

  const topicFilters = [
    { label: 'All Topics', icon: <LayersIcon fontSize="small" /> },
    { label: 'Invariants', icon: <ShieldIcon fontSize="small" /> },
    { label: 'Memory & STDP', icon: <MemoryIcon fontSize="small" /> },
    { label: 'Consensus Math', icon: <GavelIcon fontSize="small" /> },
    { label: 'Enclaves & Netlify', icon: <CloudDoneIcon fontSize="small" /> }
  ];

  const toolCategories = [
    'All',
    'Planning',
    'Swarm & Core',
    'AI & Knowledge',
    'Security & Recon',
    'Security & Steganography',
    'Autonomous Web',
    'Media & 3D',
    'Automation'
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Documentation sections tagged by topic categories
  const docSections = useMemo(
    () => [
      {
        id: 'sec-1',
        title: '1. Sovereign Architecture Overview',
        topics: ['Invariants', 'Enclaves & Netlify'],
        kicker: 'CORE ARCHITECTURE'
      },
      {
        id: 'sec-2',
        title: '2. Decoupled 24 Micro-Repo Directory',
        topics: ['Invariants'],
        kicker: 'MICRO-REPO INDEX'
      },
      {
        id: 'sec-3',
        title: '3. 21 Pantheon Agent Swarm Protocol',
        topics: ['Consensus Math'],
        kicker: 'SWARM PROTOCOL'
      },
      {
        id: 'sec-4',
        title: '4. Signal Bridge & Simplex E2EE',
        topics: ['Invariants', 'Enclaves & Netlify'],
        kicker: 'E2EE NETWORKING'
      },
      {
        id: 'sec-5',
        title: '5. Argon2id Hardware Vault & Adytum',
        topics: ['Enclaves & Netlify', 'Invariants'],
        kicker: 'HARDWARE SANCTUM'
      },
      {
        id: 'sec-memory',
        title: '6. Lucy Oracle & STDP Synaptic Memory',
        topics: ['Memory & STDP'],
        kicker: 'NEURAL STRATUM'
      },
      {
        id: 'sec-consensus',
        title: '7. 3-Agent Byzantine Consensus Arena',
        topics: ['Consensus Math'],
        kicker: 'BYZANTINE VERIFICATION'
      },
      {
        id: 'sec-netlify',
        title: '8. Netlify Edge & 83 Prerendered Routes',
        topics: ['Enclaves & Netlify', 'Invariants'],
        kicker: 'EDGE & AEO DISCOVERY'
      },
      {
        id: 'sec-6',
        title: '9. Zoth OS Hypervisor VM Setup',
        topics: ['Enclaves & Netlify'],
        kicker: 'VIRTUAL MACHINE'
      },
      {
        id: 'sec-7',
        title: '10. CLI Command Cheat Sheet & Health',
        topics: ['Invariants', 'Enclaves & Netlify'],
        kicker: 'TERMINAL AUDIT'
      },
      {
        id: 'sec-math',
        title: '11. Six Math Pillars Technical Reference',
        topics: ['Consensus Math', 'Memory & STDP'],
        kicker: 'MATH ACADEMY'
      },
      {
        id: 'sec-egress',
        title: '12. Zero-Egress Enclave & Entropy Gating',
        topics: ['Invariants'],
        kicker: 'SECURITY BOUNDARY'
      },
      {
        id: 'sec-workstations',
        title: '13. Sovereign Workstation Map (37 Total)',
        topics: ['Enclaves & Netlify'],
        kicker: 'WORKSTATION TOPOLOGY'
      }
    ],
    []
  );

  const visibleSections = useMemo(() => {
    if (selectedTopic === 'All Topics') return docSections;
    return docSections.filter((sec) => sec.topics.includes(selectedTopic));
  }, [selectedTopic, docSections]);

  const visibleSectionIds = useMemo(
    () => new Set(visibleSections.map((s) => s.id)),
    [visibleSections]
  );

  const filteredTools = useMemo(() => {
    return microTools.filter((t) => {
      const matchesCat =
        selectedToolCategory === 'All' || t.category === selectedToolCategory;
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.repo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedToolCategory]);

  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Sticky rail follows the reader
  useEffect(() => {
    const ids = visibleSections.map((s) => s.id);
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === 'undefined')
      return undefined;
    const seen = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          seen.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        );
        const top = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
        if (top && top[1] > 0) setActiveSection(top[0]);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.6] }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visibleSections]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const terminalAuditLogs = [
    `npm run zoth -- doctor

Probes 127.0.0.1:8788 (memory), :8789 (bridge), :8787 (vault), and :11434 (Ollama).
Zero Cloud Telemetry Guaranteed. 100% loopback enclave binding.
Prints whether each published tool is checked out. Run directly in the repo.`,

    `npm run zoth -- up

Starts neuro-memory-daemon on 127.0.0.1:8788 and sovereign-agent-bridge on 127.0.0.1:8789.
Argon2id vault binary daemon listening on 127.0.0.1:8787.
Shannon entropy gatekeeper active on all inter-process channels.`,

    `npm run zoth -- pull --all

Clones all 25 catalog entries that are published into ./tools.
Runs local invariant verification before staging tools.`
  ];

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["ZOTH", "DOCUMENTATION", "SPECS"]}
          themeColor="gold"
          subtitle="SYSTEM TOPOLOGY & ZERO EGRESS"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Box sx={{ bgcolor: dark ? voidDark : '#FAFBFD', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* Header / Hero Section */}
        <HeroReveal>
          <Box sx={{ mb: 4 }}>
            <HeroItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label="DOCUMENTATION & TECHNICAL SPECIFICATION"
                  size="small"
                  sx={{
                    bgcolor: goldBg,
                    color: goldLight,
                    border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
                    fontWeight: 750,
                    letterSpacing: '0.05em'
                  }}
                />
                <Chip
                  icon={<HubIcon sx={{ fontSize: '14px !important', color: `${textSecondary} !important` }} />}
                  label="37 WORKSTATIONS & 25 TOOLS"
                  size="small"
                  sx={{
                    bgcolor: dark ? '#14141E' : '#F2F4F7',
                    color: textSecondary,
                    border: `1px solid ${divider}`,
                    fontWeight: 700
                  }}
                />
                <Chip
                  icon={<CloudDoneIcon sx={{ fontSize: '14px !important', color: `${dark ? '#38BDF8' : '#0284C7'} !important` }} />}
                  label="NETLIFY 83 PRERENDERED ROUTES"
                  size="small"
                  sx={{
                    bgcolor: dark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
                    color: dark ? '#38BDF8' : '#0284C7',
                    border: `1px solid ${dark ? 'rgba(56,189,248,0.3)' : '#BAE6FD'}`,
                    fontWeight: 700
                  }}
                />
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: '14px !important', color: `${dark ? '#34D399' : '#027A48'} !important` }} />}
                  label="ZERO-EGRESS INVARIANTS"
                  size="small"
                  sx={{
                    bgcolor: dark ? 'rgba(52,211,153,0.14)' : '#ECFDF5',
                    color: dark ? '#34D399' : '#027A48',
                    border: `1px solid ${dark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
                    fontWeight: 700
                  }}
                />
              </Box>
            </HeroItem>

            <HeroItem>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1.5,
                  color: textPrimary,
                  letterSpacing: '-0.02em'
                }}
              >
                Zoth Studio Technical Documentation
              </Typography>
            </HeroItem>
            
            <HeroItem>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: '950px',
                  fontSize: '1.1rem',
                  color: textSecondary,
                  lineHeight: 1.7,
                  mb: 3
                }}
              >
                Comprehensive architectural blueprint for Zoth Studio v2: air-gapped agent orchestration,
                biomorphic STDP synaptic memory, Lucy Netrunner Oracle, 3-agent Byzantine consensus,
                Adytum Hardware Sanctum, and production Netlify deployment with 83 prerendered static routes.
              </Typography>
            </HeroItem>

            {/* Topic Category Filter Chips Bar */}
            <HeroItem>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: dark ? '#0E1017' : '#FFFFFF',
                  border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.25)'}`,
                  boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(16,24,40,0.06)',
                  mb: 3
                }}
              >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon sx={{ color: gold, fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: gold,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.85rem'
                  }}
                >
                  FILTER TOPIC:
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {topicFilters.map((tf) => {
                  const isSelected = selectedTopic === tf.label;
                  return (
                    <Chip
                      key={tf.label}
                      icon={React.cloneElement(tf.icon, {
                        sx: {
                          color: isSelected ? `${dark ? voidDark : '#101828'} !important` : `${dark ? gold : '#715507'} !important`,
                          fontSize: '16px !important'
                        }
                      })}
                      label={tf.label}
                      clickable
                      onClick={() => setSelectedTopic(tf.label)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        transition: 'all 0.2s ease',
                        bgcolor: isSelected ? gold : dark ? 'rgba(212,175,55,0.08)' : '#F2F4F7',
                        color: isSelected ? (dark ? voidDark : '#101828') : textPrimary,
                        border: `1px solid ${isSelected ? gold : dark ? 'rgba(212,175,55,0.25)' : '#EAECF0'}`,
                        '&:hover': {
                          bgcolor: isSelected ? (dark ? '#E5C048' : '#9A7209') : dark ? 'rgba(212,175,55,0.2)' : '#E4E7EC',
                          borderColor: gold
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {selectedTopic !== 'All Topics' && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: `1px dashed ${divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Showing <strong>{visibleSections.length}</strong> sections matching topic:{' '}
                  <Box component="span" sx={{ color: gold, fontWeight: 700 }}>{selectedTopic}</Box>
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedTopic('All Topics')}
                  sx={{
                    fontSize: '0.72rem',
                    color: gold,
                    p: 0,
                    minWidth: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Reset to All Topics
                </Button>
              </Box>
            )}
            </Paper>
            </HeroItem>

          {/* Search Bar */}
          <HeroItem>
            <Box sx={{ maxWidth: '650px' }}>
              <TextField
                fullWidth
                placeholder="Search documentation, micro-tools, invariants, consensus math..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: gold }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 9999,
                    bgcolor: dark ? '#0E1017' : '#FFFFFF',
                    color: textPrimary,
                    border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : '#D0D5DD'}`,
                    '&:hover': { borderColor: gold },
                    '&.Mui-focused': { borderColor: gold }
                  }
                }}
                size="medium"
              />
            </Box>
          </HeroItem>
          </Box>
        </HeroReveal>

        {/* Responsive Split Layout */}
        <RevealOnScroll preset="fadeUp" delay={0.4}>
          <Grid container spacing={4}>
          {/* Left Column: Sticky Table of Contents & Quick Command Block */}
          <Grid xs={12} md={4} lg={3}>
            <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
              <Paper
                sx={{
                  p: 3,
                  border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : '#EAECF0'}`,
                  borderRadius: 3,
                  mb: 3,
                  borderLeft: `4px solid ${gold}`,
                  bgcolor: surface,
                  boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(16,24,40,0.06)'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: gold,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <MenuBookIcon fontSize="small" />
                  Table of Contents
                </Typography>
                <Divider sx={{ mb: 2, borderColor: divider }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {visibleSections.map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 0.7,
                        px: 1.5,
                        borderRadius: 2,
                        fontSize: '0.82rem',
                        fontWeight: activeSection === item.id ? 700 : 500,
                        color: activeSection === item.id ? gold : textSecondary,
                        bgcolor: activeSection === item.id ? goldBg : 'transparent',
                        border:
                          activeSection === item.id
                            ? `1px solid ${dark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)'}`
                            : '1px solid transparent',
                        '&:hover': {
                          bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#F8F9FA',
                          color: gold
                        }
                      }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </Box>
              </Paper>

              {/* Quick Install Widget with Interactive Copy */}
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: '#08080B',
                  color: '#F5E6AB',
                  borderRadius: 3,
                  border: `1px solid ${dark ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.2)'}`,
                  borderLeft: `4px solid ${gold}`
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#34D399',
                      fontWeight: 700,
                      fontFamily: '"JetBrains Mono", monospace'
                    }}
                  >
                    QUICK INITIALIZATION
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy('npm run zoth -- init', 'quick-install')}
                    sx={{ color: '#D4AF37', '&:hover': { color: '#FFFFFF' } }}
                  >
                    {copiedIndex === 'quick-install' ? (
                      <CheckIcon fontSize="small" sx={{ color: '#34D399' }} />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#E6EDF3',
                    fontSize: '0.85rem'
                  }}
                >
                  $ npm run zoth -- init
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column: Documentation Sections */}
          <Grid xs={12} md={8} lg={9}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                '& [id^="sec-"]': { scrollMarginTop: '88px' }
              }}
            >
              {/* SECTION 1: Sovereign Architecture Overview */}
              {visibleSectionIds.has('sec-1') && (
                <Paper
                  id="sec-1"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="CORE ARCHITECTURE"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      1. Sovereign Architecture Overview &amp; Topology
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Zoth Studio v2 is the air-gapped operator desk for sovereign AI agent development.
                    Integrating 37 dedicated workstations, 25 in-browser micro-tools, Lucy Oracle STDP
                    synaptic memory, 3-agent Byzantine consensus, and the Adytum Hardware Sanctum,
                    all execution runs strictly on physical hardware via local loopback enclaves (
                    <code>127.0.0.1</code>).
                  </Typography>

                  {/* Visual Topology Diagram */}
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: dark ? '#08080B' : '#F8FAFC',
                      color: dark ? '#FFFFFF' : '#101828',
                      borderRadius: 3,
                      my: 3,
                      border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : '#EAECF0'}`,
                      borderLeft: `4px solid ${gold}`,
                      boxShadow: dark ? 'none' : '0 1px 3px rgba(16,24,40,0.05)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: gold,
                        fontFamily: '"JetBrains Mono", monospace',
                        mb: 2,
                        fontWeight: 700
                      }}
                    >
                      [SYSTEM TOPOLOGY: 5 ARCHITECTURAL PILLARS]
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2,
                        textAlign: 'center'
                      }}
                    >
                      {[
                        { icon: <CodeIcon sx={{ mb: 0.5, color: dark ? '#79C0FF' : '#0969DA' }} />, title: '37 Workstations', desc: 'DAG Composer, IDE & Foundry' },
                        { icon: <MemoryIcon sx={{ mb: 0.5, color: dark ? '#00F0FF' : '#0891B2' }} />, title: 'Lucy Netrunner Oracle', desc: 'STDP Synaptic Plasticity (:8788)' },
                        { icon: <GavelIcon sx={{ mb: 0.5, color: dark ? '#C084FC' : '#7C3AED' }} />, title: '3-Agent Byzantine', desc: 'Triadic AST Socratic Debate' },
                        { icon: <ShieldIcon sx={{ mb: 0.5, color: dark ? '#34D399' : '#059669' }} />, title: 'Zero-Egress Invariants', desc: 'Shannon Entropy & Loopback' },
                        { icon: <LockIcon sx={{ mb: 0.5, color: dark ? '#F59E0B' : '#D97706' }} />, title: 'Adytum Sanctum', desc: '22 Keys & 5-Min Incubation' },
                        { icon: <CloudDoneIcon sx={{ mb: 0.5, color: dark ? '#38BDF8' : '#0284C7' }} />, title: 'Netlify Edge AEO', desc: '83 Prerendered Static Routes' },
                      ].map((item, i) => (
                        <Paper
                          key={i}
                          sx={{
                            p: 2,
                            bgcolor: dark ? '#0E1017' : '#FFFFFF',
                            border: `1px solid ${dark ? 'rgba(212,175,55,0.2)' : '#EAECF0'}`,
                            boxShadow: dark ? 'none' : '0 1px 2px rgba(16,24,40,0.05)',
                          }}
                        >
                          {item.icon}
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary }}>
                            {item.desc}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Paper>

                  <CodeSnippet
                    title="SYSTEM INITIALIZATION SEQUENCE"
                    code={`# Check local daemons and enclave port health (:8788, :8789, :8787, :11434)
npm run zoth -- doctor

# Launch local backend daemons
npm run zoth -- up

# Start Vite React Operator Desk
npm run dev`}
                  />
                </Paper>
              )}

              {/* SECTION 2: Decoupled 24 Micro-Repo Directory */}
              {visibleSectionIds.has('sec-2') && (
                <Paper
                  id="sec-2"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                      mb: 2
                    }}
                  >
                    <Box>
                      <Chip
                        label="MICRO-REPO INDEX"
                        size="small"
                        sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700, mb: 1 }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                        2. Decoupled 24 Micro-Repo Directory ({filteredTools.length})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {toolCategories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          clickable
                          onClick={() => setSelectedToolCategory(cat)}
                          sx={{
                            fontWeight: 600,
                            bgcolor:
                              selectedToolCategory === cat
                                ? gold
                                : dark
                                ? 'rgba(212,175,55,0.08)'
                                : '#F2F4F7',
                            color: selectedToolCategory === cat ? (dark ? voidDark : '#101828') : textSecondary,
                            border: `1px solid ${
                              selectedToolCategory === cat ? gold : dark ? 'rgba(212,175,55,0.2)' : '#EAECF0'
                            }`,
                            '&:hover': {
                              bgcolor: selectedToolCategory === cat ? (dark ? '#E5C048' : '#9A7209') : dark ? 'rgba(212,175,55,0.2)' : '#E4E7EC'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Published micro-tools clone cleanly with <code>npm run zoth -- pull &lt;repo-name&gt;</code>.
                    Each micro-tool operates air-gapped with zero telemetry.
                  </Typography>

                  {/* Grid of Micro Tools */}
                  <Grid container spacing={2.5}>
                    {filteredTools.map((tool) => (
                      <Grid xs={12} sm={6} key={tool.id}>
                        <Card
                          sx={{
                            height: '100%',
                            border: `1px solid ${dark ? 'rgba(212,175,55,0.2)' : '#EAECF0'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            bgcolor: surface,
                            boxShadow: dark ? 'none' : '0 1px 3px rgba(16,24,40,0.05)',
                            '&:hover': { borderColor: gold }
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary }}
                              >
                                {tool.name}
                              </Typography>
                              <Chip
                                label={`v${tool.version}`}
                                size="small"
                                sx={{
                                  bgcolor: dark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
                                  color: dark ? '#38BDF8' : '#0284C7',
                                  fontWeight: 700,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{ color: gold, fontWeight: 700, display: 'block', mb: 1 }}
                            >
                              {tool.category} • {tool.repo}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2, fontSize: '0.86rem' }}
                            >
                              {tool.description}
                            </Typography>

                            <Paper
                              sx={{
                                p: 1.2,
                                bgcolor: '#08080B',
                                color: '#F5E6AB',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '0.78rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: '3px solid #D4AF37'
                              }}
                            >
                              <span>$ {tool.pull}</span>
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(tool.pull, tool.id)}
                                sx={{ color: '#D4AF37', p: 0.5, '&:hover': { color: '#FFFFFF' } }}
                              >
                                {copiedIndex === tool.id ? (
                                  <CheckIcon fontSize="small" sx={{ color: '#34D399' }} />
                                ) : (
                                  <ContentCopyIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Paper>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              {/* SECTION 3: 21 Pantheon Agent Swarm Protocol */}
              {visibleSectionIds.has('sec-3') && (
                <Paper
                  id="sec-3"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="SWARM PROTOCOL"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      3. 21 Pantheon Agent Swarm Protocol
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    The Pantheon Swarm protocol coordinates up to 21 specialized autonomous AI agents
                    using a <strong>4-Stage Dialectic Synthesis Matrix</strong>. Agents debate, propose
                    AST code diffs, verify security boundaries, and seal verdicts cryptographically.
                  </Typography>

                  <Grid container spacing={2} sx={{ my: 2 }}>
                    {[
                      {
                        stage: 'Stage 1',
                        title: 'Parallel Proposals',
                        desc: 'Nexus, Vigil, and Mercury generate competing implementation proposals.'
                      },
                      {
                        stage: 'Stage 2',
                        title: 'AST Diff Inspection',
                        desc: 'Deep syntax tree diffing detects breaking changes, type mismatches, and edge cases.'
                      },
                      {
                        stage: 'Stage 3',
                        title: 'Socratic Debate',
                        desc: 'Cross-agent arguments refine code logic and enforce performance benchmarks.'
                      },
                      {
                        stage: 'Stage 4',
                        title: 'SHA-256 Consensus',
                        desc: '3/3 unanimity seals the code payload into local git history with zero telemetry.'
                      }
                    ].map((stg, idx) => (
                      <Grid xs={12} sm={6} md={3} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: dark ? '#0E1017' : '#F8F9FA',
                            border: `1px solid ${dark ? 'rgba(212,175,55,0.2)' : '#EAECF0'}`,
                            textAlign: 'center',
                            height: '100%'
                          }}
                        >
                          <Chip
                            label={stg.stage}
                            size="small"
                            sx={{
                              mb: 1,
                              fontWeight: 700,
                              bgcolor: goldBg,
                              color: goldLight,
                              border: `1px solid ${dark ? 'rgba(212,175,55,0.3)' : '#F0E1A8'}`
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: textPrimary }}>
                            {stg.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stg.desc}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <CodeSnippet
                    title="SWARM TASK DISPATCH EXAMPLE"
                    code={`import { PantheonDispatcher } from 'zoth-pantheon';

const dispatcher = new PantheonDispatcher({
  busAddress: 'ws://127.0.0.1:8789',
  consensusThreshold: 3 // Requires 3/3 Byzantine verification
});

const task = await dispatcher.broadcastTask({
  type: 'AST_MUTATION_PROPOSAL',
  target: 'src/components/ConsensusEngine.jsx',
  invariants: ['ZERO_EGRESS', 'SHANNON_ENTROPY_PASS']
});`}
                  />
                </Paper>
              )}

              {/* SECTION 4: Signal Bridge & Simplex E2EE */}
              {visibleSectionIds.has('sec-4') && (
                <Paper
                  id="sec-4"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="E2EE NETWORKING"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      4. Signal Bridge &amp; Simplex E2EE Protocol
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    The Sovereign Agent Signal Bridge provides end-to-end encrypted (E2EE) inter-process
                    communication (IPC) for local agent swarms. Operating over loopback WebSockets without
                    cloud relays, messages are secured using Noise Protocol framework double ratchets.
                  </Typography>

                  <CodeSnippet
                    title="SIGNAL BRIDGE INITIALIZATION COMMANDS"
                    code={`# Clone signal bridge daemon
npm run zoth -- pull sovereign-agent-bridge

# Start IPC bridge on loopback port 127.0.0.1:8789
npm run zoth -- up`}
                  />
                </Paper>
              )}

              {/* SECTION 5: Argon2id Hardware Vault Specs & Adytum */}
              {visibleSectionIds.has('sec-5') && (
                <Paper
                  id="sec-5"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="HARDWARE SANCTUM"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      5. Argon2id Hardware Vault &amp; Adytum Sanctum
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Local secret storage uses Argon2id key derivation combined with XChaCha20-Poly1305
                    and AES-256-GCM authenticated payload encryption. Master keys in the Adytum Hardware
                    Sanctum require a 5-minute incubation period before cryptographic sealing.
                  </Typography>

                  <CodeSnippet
                    title="ARGON2ID VAULT SEAL CODE"
                    language="javascript"
                    code={`// Local Hardware Vault Initialization Code
import { EnvGuardVault } from 'envguard-secrets-vault';

const vault = new EnvGuardVault({
  memoryCost: 65536, // 64 MB RAM hardness
  timeCost: 3,        // 3 iterations
  parallelism: 4      // 4 threads
});

// Seal secret into encrypted local file with Argon2id derived key
const encryptedKey = await vault.sealSecret("SOVEREIGN_PASSPHRASE", "local-sanctum-key");
console.log("Vault Encrypted Seal:", encryptedKey);`}
                  />
                </Paper>
              )}

              {/* SECTION 6: Lucy Netrunner Oracle & STDP Synaptic Memory */}
              {visibleSectionIds.has('sec-memory') && (
                <Paper
                  id="sec-memory"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="NEURAL STRATUM"
                      size="small"
                      sx={{ bgcolor: 'rgba(0,240,255,0.12)', color: '#00F0FF', fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      6. Lucy Oracle &amp; Biomorphic STDP Synaptic Memory
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Governed by <strong>Spike-Timing-Dependent Plasticity (STDP)</strong>, the Lucy Netrunner
                    Oracle (Codec 141.12 // Deep Net Breach) continuously potentiates verified decisions
                    and decays transient noise across the Whitespace Cyberspace 3D constellation.
                  </Typography>

                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: '#08080B',
                      border: '1px solid rgba(0,240,255,0.25)',
                      borderRadius: 2,
                      my: 2
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#00F0FF', fontFamily: '"JetBrains Mono", monospace', mb: 1, fontWeight: 700 }}
                    >
                      STDP SYNAPTIC UPDATE LAW:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#E6EDF3', lineHeight: 1.6 }}
                    >
                      Δw = A+ * exp(-Δt / τ+) for Δt &gt; 0 (Long-Term Potentiation: Reinforce verified memory)
                      <br />
                      Δw = -A- * exp(Δt / τ-) for Δt &lt; 0 (Long-Term Depression: Decay stale vectors)
                    </Typography>
                  </Paper>

                  <CodeSnippet
                    title="STDP SYNAPTIC RECALL RPC"
                    code={`# Query local Neuro Memory Daemon via loopback
curl -X POST http://127.0.0.1:8788/v1/memory/recall \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Byzantine consensus AST verification delta", "top_k": 5}'`}
                  />
                </Paper>
              )}

              {/* SECTION 7: 3-Agent Byzantine Consensus Arena */}
              {visibleSectionIds.has('sec-consensus') && (
                <Paper
                  id="sec-consensus"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="BYZANTINE VERIFICATION"
                      size="small"
                      sx={{ bgcolor: 'rgba(192,132,252,0.14)', color: '#C084FC', fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      7. 3-Agent Byzantine Consensus Arena
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Prior to committing any code mutation or staging git commits, Zoth Studio executes a
                    Triadic Socratic Debate. The <strong>Proposer</strong> generates the AST diff, the{' '}
                    <strong>Evaluator</strong> computes Shannon entropy and type constraints, and the{' '}
                    <strong>Arbiter</strong> signs the SHA-256 seal upon unanimous 3/3 agreement.
                  </Typography>

                  <CodeSnippet
                    title="BYZANTINE TRIADIC CONSENSUS VERIFICATION"
                    language="javascript"
                    code={`import { ByzantineArena } from 'zoth-consensus';

const arena = new ByzantineArena({
  proposer: 'Nexus-Prime',
  evaluator: 'Vigil-Guard',
  arbiter: 'Aegis-Arbiter'
});

const verdict = await arena.evaluateASTDiff({
  file: 'src/pages/ConsensusPage.jsx',
  astDiff: targetAstDelta,
  maxShannonEntropy: 7.2
});

console.log("Byzantine Consensus Verdict:", verdict.sealed ? "UNANIMOUS APPROVAL" : "REJECTED");`}
                  />
                </Paper>
              )}

              {/* SECTION 8: Netlify Edge Deployment & 83 Prerendered Routes */}
              {visibleSectionIds.has('sec-netlify') && (
                <Paper
                  id="sec-netlify"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="EDGE & AEO DISCOVERY"
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.12)', color: '#38BDF8', fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      8. Netlify Edge Deployment &amp; 83 Prerendered Routes
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Production deployment compiles with <code>npm run build</code>, running Vite and the
                    static prerender engine (<code>scripts/prerender.mjs</code>). This emits 83 distinct
                    static HTML routes into <code>dist/</code>, complete with Schema.org JSON-LD graphs and
                    machine-readable endpoints for AI answer engines.
                  </Typography>

                  <Grid container spacing={2} sx={{ my: 2 }}>
                    {[
                      { ep: '/llms.txt', desc: 'Compact plain-text summary (< 5 KB) for LLM agents' },
                      { ep: '/llms-full.txt', desc: 'Complete architecture manual and knowledge graph' },
                      { ep: '/ai.txt', desc: 'AI crawler discovery and grounding policy manifest' },
                      { ep: '/sitemap.xml', desc: 'XML sitemap covering all 83 static routes' }
                    ].map((item, idx) => (
                      <Grid xs={12} sm={6} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: dark ? '#08080B' : '#F0F9FF',
                            border: `1px solid ${dark ? 'rgba(56,189,248,0.25)' : '#BAE6FD'}`,
                            borderRadius: 2,
                            boxShadow: dark ? 'none' : '0 1px 2px rgba(16,24,40,0.04)',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: dark ? '#38BDF8' : '#0284C7', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}
                          >
                            {item.ep}
                          </Typography>
                          <Typography variant="caption" sx={{ color: dark ? '#94A3B8' : '#334155' }}>
                            {item.desc}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <CodeSnippet
                    title="PRODUCTION BUILD COMMAND"
                    code={`# Install dependencies cleanly
npm ci

# Build Vite application and automatically prerender 83 static routes
npm run build

# Preview production build locally on http://127.0.0.1:4173
npm run preview`}
                  />
                </Paper>
              )}

              {/* SECTION 9: Zoth OS VM Setup */}
              {visibleSectionIds.has('sec-6') && (
                <Paper
                  id="sec-6"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="VIRTUAL MACHINE"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      9. Zoth OS VM Setup &amp; USB Booting
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Zoth OS can be booted from a physical USB drive for full hardware isolation or run
                    inside QEMU/KVM virtual machine instances with direct KVM acceleration.
                  </Typography>

                  <CodeSnippet
                    title="QEMU / KVM HYPERVISOR LAUNCH COMMAND"
                    code={`qemu-system-x86_64 \\
  -enable-kvm \\
  -m 8192 \\
  -smp 4 \\
  -drive file=zoth-agent-os.qcow2,if=virtio \\
  -net nic,model=virtio -net user,hostfwd=tcp:127.0.0.1:3000-:3000`}
                  />
                </Paper>
              )}

              {/* SECTION 10: Interactive CLI Command Cheat Sheet & Audit */}
              {visibleSectionIds.has('sec-7') && (
                <Paper
                  id="sec-7"
                  sx={{
                    p: 4,
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="TERMINAL AUDIT"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary }}>
                      10. CLI Command Cheat Sheet &amp; Health Audit
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Interactive diagnostic terminal preview window simulating the <code>zoth doctor</code>{' '}
                    CLI system health check.
                  </Typography>

                  {/* Terminal Window */}
                  <Paper
                    sx={{
                      bgcolor: '#08080B',
                      color: '#C9D1D9',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid rgba(212,175,55,0.25)',
                      borderLeft: `4px solid ${gold}`
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        bgcolor: '#11131B',
                        borderBottom: '1px solid rgba(212,175,55,0.15)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8B949E',
                            ml: 1.5,
                            fontFamily: '"JetBrains Mono", monospace'
                          }}
                        >
                          zoth-cli ~ doctor audit preview
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleCopy(terminalAuditLogs[terminalTab], 'audit-terminal-copy')}
                        sx={{ color: gold, '&:hover': { color: '#FFFFFF' } }}
                      >
                        {copiedIndex === 'audit-terminal-copy' ? (
                          <CheckIcon fontSize="small" sx={{ color: '#34D399' }} />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>

                    <Tabs
                      value={terminalTab}
                      onChange={(e, val) => setTerminalTab(val)}
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                      textColor="inherit"
                      indicatorColor="primary"
                      sx={{
                        minHeight: 38,
                        bgcolor: '#0D1117',
                        borderBottom: '1px solid #21262D',
                        '& .MuiTab-root': {
                          minHeight: 38,
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          fontFamily: '"JetBrains Mono", monospace',
                          color: '#8B949E'
                        }
                      }}
                    >
                      <Tab label="1. Health Audit (zoth doctor)" />
                      <Tab label="2. IPC Socket Matrix" />
                      <Tab label="3. Local Model Connectors" />
                    </Tabs>

                    <Box
                      sx={{
                        p: 3,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        bgcolor: '#08080B',
                        color: '#34D399',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {terminalAuditLogs[terminalTab]}
                    </Box>
                  </Paper>
                </Paper>
              )}

              {/* SECTION 11: Six Math Pillars Technical Reference */}
              {visibleSectionIds.has('sec-math') && (
                <Paper
                  id="sec-math"
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Chip
                    label="MATH ACADEMY & DEDICATED DOC PAGES"
                    size="small"
                    sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700, mb: 1.5 }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 750, mb: 1, color: textPrimary }}>
                    11. Six Math Pillars Technical Reference
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
                    Six foundational mathematics pillars: Linear Algebra, Multivariable Calculus, Shannon
                    Probability, Hessian Curvature, Lyapunov Phase Dynamics, and Neuromorphic STDP.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {[
                      { id: 'linear', name: 'Pillar I: Linear Algebra' },
                      { id: 'calculus', name: 'Pillar II: Calculus' },
                      { id: 'probability', name: 'Pillar III: Probability' },
                      { id: 'hessian', name: 'Pillar IV: Hessian' },
                      { id: 'lyapunov', name: 'Pillar V: Lyapunov' },
                      { id: 'stdp', name: 'Pillar VI: STDP' }
                    ].map((p) => (
                      <Chip
                        key={p.id}
                        label={p.name}
                        clickable
                        component="a"
                        href={`/docs/math/${p.id}`}
                        sx={{
                          fontWeight: 700,
                          bgcolor: goldBg,
                          color: goldLight,
                          border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
                          '&:hover': { bgcolor: gold, color: dark ? voidDark : '#101828' }
                        }}
                      />
                    ))}
                  </Box>
                  <MathPillarsGrid />
                </Paper>
              )}

              {/* SECTION 12: Zero-Egress Enclave & Shannon Entropy Gating */}
              {visibleSectionIds.has('sec-egress') && (
                <Paper
                  id="sec-egress"
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="SECURITY INVARIANTS"
                      size="small"
                      sx={{ bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399', fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 750, color: textPrimary }}>
                      12. Zero-Egress Enclave &amp; Shannon Entropy Gating
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    All runtime processes enforce strict OWASP Zero-Egress Invariants. The Shannon
                    entropy gatekeeper computes <code>H(X) = -sum(P(x) * log2(P(x)))</code> on inbound and
                    outbound buffers, rejecting payloads exceeding 7.2 bits/byte to block obfuscated shells.
                  </Typography>

                  <ZeroEgressPanel embedded />
                </Paper>
              )}

              {/* SECTION 13: Sovereign Workstation Map */}
              {visibleSectionIds.has('sec-workstations') && (
                <Paper
                  id="sec-workstations"
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    border: `1px solid rgba(212,175,55,0.25)`,
                    borderRadius: 3,
                    bgcolor: surface
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip
                      label="WORKSTATION TOPOLOGY"
                      size="small"
                      sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 700 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 750, color: textPrimary }}>
                      13. Sovereign Workstation Map (37 Total)
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Comprehensive interactive index of all 37 sovereign workstations across agent
                    coordination, neural memory, Byzantine consensus, code development, and hardware
                    sanctum domains.
                  </Typography>

                  <WorkstationMap embedded />
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
        </RevealOnScroll>

        {/* Sovereign Installation Funnel */}
        <RevealOnScroll preset="fadeUp">
          <SovereignFunnel
            title="Install Zoth Studio v2 &amp; Sovereign Zoth OS"
            subtitle="Full documentation and deployment pipeline for zero-telemetry development, local loopback enclaves, 37 workstations, and bare-metal OS hypervisors."
            toolTitle="Option 1: Zero-Egress CLI Suite"
            toolTag="DOCS &amp; RUNTIME"
            toolDescription="Download the air-gapped documentation suite, offline CLI diagnostic toolbench, and local IPC verification harness."
            toolRepo="https://github.com/NullAITech/zoth-studio-v2"
            toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2 && npm install"
            sx={{ mt: 6 }}
          />
        </RevealOnScroll>
      </Container>
    </Box>
    </>
  );
}
