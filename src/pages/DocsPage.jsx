import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
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

import { microTools } from '../data/toolsData';
import MathPillarsGrid from '../components/MathPillarsGrid';
import ZeroEgressPanel from '../components/ZeroEgressPanel';
import WorkstationMap from '../components/WorkstationMap';

export default function DocsPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('sec-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [terminalTab, setTerminalTab] = useState(0);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const categories = ['All', 'Planning', 'Swarm & Core', 'AI & Knowledge', 'Security & Recon', 'Security & Steganography', 'Autonomous Web', 'Media & 3D', 'Automation'];

  const filteredTools = useMemo(() => {
    return microTools.filter((t) => {
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.repo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
Prints whether each published tool is checked out.
This panel does not invent the result. Run the command in the repo.`,

    `npm run zoth -- up

Starts neuro-memory-daemon on 127.0.0.1:8788 and sovereign-agent-bridge on 127.0.0.1:8789
when those repos are in ./tools or next to this studio.
The vault binary is not in this repo. If it is already listening, doctor will say so.`,

    `npm run zoth -- pull --all

Clones every catalog entry that is actually published.
azoth-local-agent and hexstrike-arsenal are not published. The CLI refuses those.`
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      
      {/* Header / Hero Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="DOCUMENTATION & TECHNICAL MANUAL"
            size="small"
            sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`, fontWeight: 700 }}
          />
          <Chip
            icon={<HubIcon sx={{ fontSize: '14px !important', color: textPrimary }} />}
            label="24 DECOUPLED MICRO-REPOS"
            size="small"
            sx={{ bgcolor: dark ? '#1A1A24' : '#F2F4F7', color: textSecondary, border: `1px solid ${divider}`, fontWeight: 700 }}
          />
          <Chip
            icon={<ShieldIcon sx={{ fontSize: '14px !important', color: dark ? '#34D399' : '#12B76A' }} />}
            label="ZERO CLOUD TELEMETRY"
            size="small"
            sx={{ bgcolor: dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3', color: dark ? '#34D399' : '#027A48', border: `1px solid ${dark ? 'rgba(52,211,153,0.4)' : '#ABE5C6'}`, fontWeight: 700 }}
          />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
          Zoth Studio v2 Architecture Docs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '900px', fontSize: '1.1rem', mb: 3 }}>
          Complete technical reference for local initialization, 24 micro-repo architecture, 21-agent swarms, Simplex E2EE Signal Bridge, Argon2id hardware vaults, and Zoth OS hypervisors.
        </Typography>

        {/* Global Search Bar */}
        <Box sx={{ maxWidth: '600px' }}>
          <TextField
            fullWidth
            placeholder="Search documentation, micro-repos, architecture guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: textSecondary }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 9999, bgcolor: surface, boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.35)' : '0 1px 3px rgba(16,24,40,0.05)' }
            }}
            size="medium"
          />
        </Box>
      </Box>

      {/* Responsive Split Layout */}
      <Grid container spacing={4}>
        
        {/* Left Column: Sticky Table of Contents & Quick Command Block */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
            <Paper sx={{ p: 3, border: `1px solid ${divider}`, borderRadius: 3, mb: 3, borderLeft: `4px solid ${gold}`, bgcolor: surface }}>
              <Typography variant="h6" sx={{ mb: 2, color: gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon fontSize="small" />
                Table of Contents
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { id: 'sec-1', title: '1. Sovereign Architecture Overview' },
                  { id: 'sec-2', title: '2. Decoupled 24 Micro-Repo Directory' },
                  { id: 'sec-3', title: '3. 21 Pantheon Agent Swarm Protocol' },
                  { id: 'sec-4', title: '4. Signal Bridge & Simplex E2EE' },
                  { id: 'sec-5', title: '5. Argon2id Hardware Vault Specs' },
                  { id: 'sec-6', title: '6. Zoth OS Hypervisor VM Setup' },
                  { id: 'sec-7', title: '7. CLI Command Cheat Sheet & Audit' },
                  { id: 'sec-math', title: '8. Six Math Pillars' },
                  { id: 'sec-egress', title: '9. Zero-Egress Enclave' },
                  { id: 'sec-workstations', title: '10. Legacy Workstation Map' }
                ].map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      py: 0.8,
                      px: 1.5,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      fontWeight: activeSection === item.id ? 700 : 500,
                      color: activeSection === item.id ? gold : textSecondary,
                      bgcolor: activeSection === item.id ? goldBg : 'transparent',
                      '&:hover': { bgcolor: dark ? '#1A1A24' : '#F8F9FA' }
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </Paper>

            {/* Quick Install Widget */}
            <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#FDD663', borderRadius: 3, borderLeft: `4px solid ${gold}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#81C995', fontWeight: 700, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace' }}>
                  QUICK INSTALL COMMAND
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy('npm run zoth -- init', 'quick-install')}
                  sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                >
                  {copiedIndex === 'quick-install' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace' }}>
                $ npm run zoth -- init
              </Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Documentation Sections */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, '& [id^="sec-"]': { scrollMarginTop: '88px' } }}>
            
            {/* SECTION 1: Sovereign Architecture Overview */}
            <Paper id="sec-1" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="CORE ARCHITECTURE" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  1. Sovereign Architecture Overview
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Zoth Studio v2 is the operator desk for NullAI. The catalog lists the published tools, plus two names that are not published. The CLI clones the published ones and starts the memory daemon and the signal bridge.
              </Typography>

              {/* Visual Architecture Diagram Card */}
              <Paper sx={{ p: 3, bgcolor: '#0B0F19', color: '#FFFFFF', borderRadius: 3, my: 3, border: '1px solid #1D2939', borderLeft: `4px solid ${gold}` }}>
                <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', mb: 2, fontWeight: 700 }}>
                  [SYSTEM TOPOLOGY DIAGRAM]
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, textAlign: 'center' }}>
                  <Paper sx={{ p: 2, bgcolor: '#101828', border: '1px solid #30363D', color: '#79C0FF' }}>
                    <CodeIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Orchestrator UI</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>Vite React + MUI v5 Interface</Typography>
                  </Paper>

                  <Paper sx={{ p: 2, bgcolor: '#101828', border: '1px solid #30363D', color: '#81C995' }}>
                    <HubIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Simplex Signal Bridge</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>Signal bridge on 127.0.0.1:8789</Typography>
                  </Paper>

                  <Paper sx={{ p: 2, bgcolor: '#101828', border: '1px solid #30363D', color: '#D2A8FF' }}>
                    <MemoryIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Local Memory Daemon</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>HNSW Vector Storage (Port 8788)</Typography>
                  </Paper>
                </Box>
              </Paper>

              <Grid container spacing={2}>
                {[
                  { title: 'Zero Cloud Telemetry', desc: 'All model inferences, memory stores, and AST diffs remain 100% local on your hardware.' },
                  { title: '24 Micro-Repo Decoupling', desc: 'Pull only the specific tools you need (e.g. zoth-consensus, hexstrike, zoth-webgen).' },
                  { title: 'Argon2id Hardware Enclave', desc: 'Cryptographically derived key storage for local credentials and model access tokens.' },
                  { title: 'Zoth OS Sandbox Isolation', desc: 'Virtual machine hypervisor sandbox preventing arbitrary agent execution from host mutation.' }
                ].map((pillar, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Box sx={{ p: 2, border: `1px solid ${divider}`, borderRadius: 2, bgcolor: dark ? '#14141D' : '#F8F9FA' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: textPrimary }}>
                        ✔ {pillar.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pillar.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SECTION 2: Decoupled 24 Micro-Repo Directory */}
            <Paper id="sec-2" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box>
                  <Chip label="MICRO-REPO INDEX" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    2. Decoupled 24 Micro-Repo Directory ({filteredTools.length})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      size="small"
                      clickable
                      onClick={() => setSelectedCategory(cat)}
                      sx={{
                        fontWeight: 600,
                        bgcolor: selectedCategory === cat ? gold : (dark ? '#1A1A24' : '#F2F4F7'),
                        color: selectedCategory === cat ? '#FFFFFF' : textSecondary,
                        '&:hover': { bgcolor: selectedCategory === cat ? (dark ? '#B8860B' : '#856404') : (dark ? '#22222E' : '#E4E7EC') }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Published tools clone with <code>npm run zoth -- pull &lt;repo-name&gt;</code>. Two catalog names have no GitHub repository, and the CLI will say so.
              </Typography>

              {/* Grid of Micro Tools */}
              <Grid container spacing={2.5}>
                {filteredTools.map((tool) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={tool.id}>
                    <Card sx={{ height: '100%', border: `1px solid ${divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: surface }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary }}>
                            {tool.name}
                          </Typography>
                          <Chip label={`v${tool.version}`} size="small" sx={{ bgcolor: dark ? 'rgba(56,189,248,0.16)' : '#F0F9FF', color: dark ? '#38BDF8' : '#026AA2', fontWeight: 700, fontSize: '0.75rem' }} />
                        </Box>

                        <Typography variant="caption" sx={{ color: gold, fontWeight: 700, display: 'block', mb: 1 }}>
                          {tool.category} • {tool.repo}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.86rem' }}>
                          {tool.description}
                        </Typography>

                        <Paper sx={{ p: 1.5, bgcolor: '#101828', color: '#FDD663', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${gold}` }}>
                          <span>$ {tool.pull}</span>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(tool.pull, tool.id)}
                            sx={{ color: '#8B949E', p: 0.5, '&:hover': { color: '#FDD663' } }}
                          >
                            {copiedIndex === tool.id ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                          </IconButton>
                        </Paper>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SECTION 3: 21 Pantheon Agent Swarm Protocol */}
            <Paper id="sec-3" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="SWARM PROTOCOL" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  3. 21 Pantheon Agent Swarm Protocol
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                The Pantheon Swarm protocol orchestrates up to 21 specialized autonomous AI agents using a <strong>4-Stage Dialectic Synthesis Matrix</strong>. Agents debate, propose AST code diffs, verify security boundaries, and seal verdicts cryptographically.
              </Typography>

              {/* 4-Stage Dialectic Flow Card */}
              <Grid container spacing={2} sx={{ my: 2 }}>
                {[
                  { stage: 'Stage 1', title: 'Parallel Proposals', desc: 'Nexus, Vigil, and Mercury generate competing implementation proposals.' },
                  { stage: 'Stage 2', title: 'AST Diff Inspection', desc: 'Deep syntax tree diffing detects breaking changes, type mismatches, and edge cases.' },
                  { stage: 'Stage 3', title: 'Socratic Debate', desc: 'Cross-agent arguments refine code logic and enforce performance benchmarks.' },
                  { stage: 'Stage 4', title: 'SHA-256 Consensus', desc: '3/3 unanimity seals the code payload into local git history with zero telemetry.' }
                ].map((stg, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Paper sx={{ p: 2, bgcolor: dark ? '#14141D' : '#F8F9FA', border: `1px solid ${divider}`, textAlign: 'center', height: '100%' }}>
                      <Chip label={stg.stage} size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{stg.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{stg.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SECTION 4: Signal Bridge & Simplex E2EE */}
            <Paper id="sec-4" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="E2EE NETWORKING" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  4. Signal Bridge &amp; Simplex E2EE Protocol
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                The Sovereign Agent Signal Bridge provides end-to-end encrypted (E2EE) inter-process communication (IPC) for local agent swarms. Operating over loopback WebSockets without cloud relays, messages are secured using Noise Protocol framework double ratchets.
              </Typography>

              <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#FDD663', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', borderRadius: 2, borderLeft: `4px solid ${gold}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#81C995' }}># SIGNAL BRIDGE INITIALIZATION</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy('npm run zoth -- pull sovereign-agent-bridge && npm run zoth -- up', 'signal-bridge-cmd')}
                    sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                  >
                    {copiedIndex === 'signal-bridge-cmd' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Box>
                <div>$ npm run zoth -- pull sovereign-agent-bridge</div>
                <div>$ npm run zoth -- up</div>
              </Paper>
            </Paper>

            {/* SECTION 5: Argon2id Hardware Vault Specs */}
            <Paper id="sec-5" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="HARDWARE VAULT" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  5. Argon2id Hardware Vault Specs
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Local secret storage uses Argon2id key derivation combined with AES-256-GCM authenticated payload encryption. Credentials and API tokens are decrypted in-memory only during tool invocation and wiped immediately after.
              </Typography>

              <Paper sx={{ p: 2.5, bgcolor: '#0B0F19', color: '#81C995', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', borderRadius: 2, border: '1px solid #1D2939', borderLeft: `4px solid ${gold}` }}>
                <pre style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{`// Local Hardware Vault Initialization Code
import { EnvGuardVault } from 'envguard-secrets-vault';

const vault = new EnvGuardVault({
  memoryCost: 65536, // 64 MB RAM hardness
  timeCost: 3,        // 3 iterations
  parallelism: 4
});

const encryptedKey = await vault.sealSecret("OPENAI_API_KEY", "sk-local-key-here");
console.log("Vault Encrypted Seal:", encryptedKey);`}</pre>
              </Paper>
            </Paper>

            {/* SECTION 6: Zoth OS VM Setup */}
            <Paper id="sec-6" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="VIRTUAL MACHINE" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  6. Zoth OS VM Setup &amp; USB Booting
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Zoth OS can be booted from a physical USB drive for full hardware isolation or run inside QEMU/KVM virtual machine instances.
              </Typography>

              <Accordion sx={{ border: `1px solid ${divider}`, borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' }, bgcolor: surface }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>QEMU / KVM Hypervisor Quick Start</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Run <code>qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2</code> to launch the sandbox with 4 vCPUs and 8GB RAM.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ border: `1px solid ${divider}`, borderRadius: '8px !important', '&:before': { display: 'none' }, bgcolor: surface }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Local Memory Daemon API RPC Reference</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Query the SQLite vector store via HTTP POST to <code>http://127.0.0.1:8788/v1/memory/recall</code> with payload <code>&#123; "query": "consensus verdict" &#125;</code>.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Paper>

            {/* SECTION 7: Interactive CLI Command Cheat Sheet & Audit */}
            <Paper id="sec-7" sx={{ p: 4, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="TERMINAL AUDIT" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  7. CLI Command Cheat Sheet &amp; Health Audit
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Interactive diagnostic terminal preview window simulating the <code>zoth doctor</code> CLI system health check.
              </Typography>

              {/* Terminal Window */}
              <Paper sx={{ bgcolor: '#0D1117', color: '#C9D1D9', borderRadius: 3, overflow: 'hidden', border: '1px solid #30363D', borderLeft: `4px solid ${gold}` }}>
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#161B22', borderBottom: '1px solid #30363D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                    <Typography variant="caption" sx={{ color: '#8B949E', ml: 1.5, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace' }}>
                      zoth-cli ~ doctor audit preview
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleCopy(terminalAuditLogs[terminalTab], 'audit-terminal-copy')}
                    sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                  >
                    {copiedIndex === 'audit-terminal-copy' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Box>

                <Tabs
                  value={terminalTab}
                  onChange={(e, val) => setTerminalTab(val)}
                  textColor="inherit"
                  indicatorColor="primary"
                  sx={{
                    minHeight: 38,
                    bgcolor: '#0D1117',
                    borderBottom: '1px solid #21262D',
                    '& .MuiTab-root': { minHeight: 38, textTransform: 'none', fontSize: '0.8rem', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', color: '#8B949E' }
                  }}
                >
                  <Tab label="1. Health Audit (zoth doctor)" />
                  <Tab label="2. IPC Socket Matrix" />
                  <Tab label="3. Local Model Connectors" />
                </Tabs>

                <Box sx={{ p: 3, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontSize: '0.85rem', lineHeight: 1.6, bgcolor: '#0B0F19', color: '#81C995', whiteSpace: 'pre-wrap' }}>
                  {terminalAuditLogs[terminalTab]}
                </Box>
              </Paper>
            </Paper>

            <Paper id="sec-math" sx={{ p: { xs: 2.5, md: 4 }, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Chip label="MATH ACADEMY & DEDICATED DOC PAGES" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 700, mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 750, mb: 1 }}>
                8. Six Math Pillars Technical Reference
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
                Six engineering math pillars: Linear Algebra, Multivariable Calculus, Shannon Probability, Hessian Curvature, Lyapunov Phase Dynamics, and Neuromorphic STDP. Click any pillar to access its dedicated derivation page and interactive simulator.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {[
                  { id: 'linear', name: 'Pillar I: Linear Algebra' },
                  { id: 'calculus', name: 'Pillar II: Calculus' },
                  { id: 'probability', name: 'Pillar III: Probability' },
                  { id: 'hessian', name: 'Pillar IV: Hessian' },
                  { id: 'lyapunov', name: 'Pillar V: Lyapunov' },
                  { id: 'stdp', name: 'Pillar VI: STDP' },
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
                      '&:hover': { bgcolor: gold, color: '#FFFFFF' }
                    }}
                  />
                ))}
              </Box>
              <MathPillarsGrid />
            </Paper>

            <Paper id="sec-egress" sx={{ p: { xs: 2.5, md: 4 }, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Typography variant="h5" sx={{ fontWeight: 750, mb: 2 }}>
                9. Zero-Egress Enclave
              </Typography>
              <ZeroEgressPanel embedded />
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 4 }, border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
              <Typography variant="h5" sx={{ fontWeight: 750, mb: 2 }}>
                10. Legacy Workstation Map
              </Typography>
              <WorkstationMap embedded />
            </Paper>

          </Box>
        </Grid>
      </Grid>

    </Container>
  );
}
