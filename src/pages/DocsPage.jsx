import React, { useState, useMemo } from 'react';
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

export default function DocsPage() {
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

  const categories = ['All', 'Swarm & Core', 'Security & Recon', 'Autonomous Web', 'Media & 3D', 'Automation'];

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

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const terminalAuditLogs = [
    // Tab 0: Doctor Audit
    `$ zoth doctor --verbose
[SYSTEM DIAGNOSTIC & HEALTH AUDIT - ZOTH STUDIO V2.4]
✔ Node.js Runtime: v20.11.0 (LTS x86_64)
✔ Vite React Orchestrator: v5.2.8 (Build Pipeline OK)
✔ Zoth OS Hypervisor (KVM): Enabled (/dev/kvm accessible)
✔ Local Memory Daemon: ONLINE (127.0.0.1:8788 - HNSW Vector Index Loaded)
✔ Signal Bridge Relay: ONLINE (127.0.0.1:9001 - Simplex E2EE Mesh Active)
✔ Argon2id Secrets Enclave: LOCKED & VALIDATED (0 leaks)
✔ Decoupled Micro-Repos: 28/28 verified in local registry.
----------------------------------------------------------------------
DIAGNOSTIC VERDICT: 100% HEALTHY. ALL SYSTEMS GO.`,

    // Tab 1: IPC Sockets
    `$ zoth status --sockets
ACTIVE IPC SOCKET MATRIX:
* socket://127.0.0.1:8788 -> Memory Daemon (JSON-RPC 2.0 over TCP)
* socket://127.0.0.1:9001 -> Signal Bridge (Simplex WebSocket Relay)
* socket://127.0.0.1:9002 -> HexStrike Recon Channel (Encrypted TTY)
* socket://127.0.0.1:9003 -> WebGen Preview Socket (Hot Reload HMR)
----------------------------------------------------------------------
All sockets operating with zero cloud fallback or external telemetry leakage.`,

    // Tab 2: Model Connectors
    `$ zoth models --list
CONNECTED MODEL BACKENDS:
1. Google Antigravity CLI  (Local Socket / System Pipe)   - PREFERRED
2. Nous Hermes 3 8B GGUF   (Ollama @ 127.0.0.1:11434)     - ONLINE
3. xAI Grok Dialectic      (Signal Bridge Channel 4)       - ONLINE
4. llama.cpp Local Server  (127.0.0.1:8080 / CUDA)        - READY`
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      
      {/* Header / Hero Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="DOCUMENTATION & TECHNICAL MANUAL"
            size="small"
            sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700 }}
          />
          <Chip
            icon={<HubIcon sx={{ fontSize: '14px !important', color: '#101828' }} />}
            label="28 DECOUPLED MICRO-REPOS"
            size="small"
            sx={{ bg: '#F2F4F7', color: '#344054', border: '1px solid #D0D5DD', fontWeight: 700 }}
          />
          <Chip
            icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#12B76A' }} />}
            label="ZERO CLOUD TELEMETRY"
            size="small"
            sx={{ bg: '#ECFDF3', color: '#027A48', border: '1px solid #ABE5C6', fontWeight: 700 }}
          />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
          Zoth Studio v2 Architecture Docs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '900px', fontSize: '1.1rem', mb: 3 }}>
          Complete technical reference for local initialization, 28 micro-repo architecture, 21-agent swarms, Simplex E2EE Signal Bridge, Argon2id hardware vaults, and Zoth OS hypervisors.
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
                  <SearchIcon sx={{ color: '#667085' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 9999, bg: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }
            }}
            size="medium"
          />
        </Box>
      </Box>

      {/* Responsive Split Layout */}
      <Grid container spacing={4}>
        
        {/* Left Column: Sticky Table of Contents & Quick Command Block */}
        <Grid item xs={12} md={4} lg={3}>
          <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
            <Paper sx={{ p: 3, border: '1px solid #EAECF0', borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#B8860B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon fontSize="small" />
                Table of Contents
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { id: 'sec-1', title: '1. Sovereign Architecture Overview' },
                  { id: 'sec-2', title: '2. Decoupled 28 Micro-Repo Directory' },
                  { id: 'sec-3', title: '3. 21 Pantheon Agent Swarm Protocol' },
                  { id: 'sec-4', title: '4. Signal Bridge & Simplex E2EE' },
                  { id: 'sec-5', title: '5. Argon2id Hardware Vault Specs' },
                  { id: 'sec-6', title: '6. Zoth OS Hypervisor VM Setup' },
                  { id: 'sec-7', title: '7. CLI Command Cheat Sheet & Audit' }
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
                      color: activeSection === item.id ? '#B8860B' : '#475467',
                      bg: activeSection === item.id ? '#FEF9E7' : 'transparent',
                      '&:hover': { bg: '#F8F9FA' }
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </Paper>

            {/* Quick Install Widget */}
            <Paper sx={{ p: 2.5, bg: '#101828', color: '#FDD663', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#81C995', fontWeight: 700, fontFamily: 'monospace' }}>
                  QUICK INSTALL COMMAND
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy('npx zoth-studio init', 'quick-install')}
                  sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                >
                  {copiedIndex === 'quick-install' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                $ npx zoth-studio init
              </Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Documentation Sections */}
        <Grid item xs={12} md={8} lg={9}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            
            {/* SECTION 1: Sovereign Architecture Overview */}
            <Paper id="sec-1" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="CORE ARCHITECTURE" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  1. Sovereign Architecture Overview
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Zoth Studio v2 is a local-first, zero-cloud-telemetry AI agent platform built for extreme sovereignty and high-performance workstation workflows. It decouples monolithic web workstation monoliths into <strong>28 standalone micro-repositories</strong> while maintaining a unified Vite React Material-UI orchestration hub.
              </Typography>

              {/* Visual Architecture Diagram Card */}
              <Paper sx={{ p: 3, bg: '#0B0F19', color: '#FFFFFF', borderRadius: 3, my: 3, border: '1px solid #1D2939' }}>
                <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: 'monospace', mb: 2, fontWeight: 700 }}>
                  [SYSTEM TOPOLOGY DIAGRAM]
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, textAlign: 'center' }}>
                  <Paper sx={{ p: 2, bg: '#101828', border: '1px solid #30363D', color: '#79C0FF' }}>
                    <CodeIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Orchestrator UI</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>Vite React + MUI v5 Interface</Typography>
                  </Paper>

                  <Paper sx={{ p: 2, bg: '#101828', border: '1px solid #30363D', color: '#81C995' }}>
                    <HubIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Simplex Signal Bridge</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>E2EE IPC Relay (Port 9001)</Typography>
                  </Paper>

                  <Paper sx={{ p: 2, bg: '#101828', border: '1px solid #30363D', color: '#D2A8FF' }}>
                    <MemoryIcon sx={{ mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Local Memory Daemon</Typography>
                    <Typography variant="caption" sx={{ color: '#8B949E' }}>HNSW Vector Storage (Port 8788)</Typography>
                  </Paper>
                </Box>
              </Paper>

              <Grid container spacing={2}>
                {[
                  { title: 'Zero Cloud Telemetry', desc: 'All model inferences, memory stores, and AST diffs remain 100% local on your hardware.' },
                  { title: '28 Micro-Repo Decoupling', desc: 'Pull only the specific tools you need (e.g. zoth-consensus, hexstrike, zoth-webgen).' },
                  { title: 'Argon2id Hardware Enclave', desc: 'Cryptographically derived key storage for local credentials and model access tokens.' },
                  { title: 'Zoth OS Sandbox Isolation', desc: 'Virtual machine hypervisor sandbox preventing arbitrary agent execution from host mutation.' }
                ].map((pillar, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ p: 2, border: '1px solid #EAECF0', borderRadius: 2, bg: '#F8F9FA' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#101828' }}>
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

            {/* SECTION 2: Decoupled 28 Micro-Repo Directory */}
            <Paper id="sec-2" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box>
                  <Chip label="MICRO-REPO INDEX" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    2. Decoupled 28 Micro-Repo Directory ({filteredTools.length})
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
                        bg: selectedCategory === cat ? '#B8860B' : '#F2F4F7',
                        color: selectedCategory === cat ? '#FFFFFF' : '#344054',
                        '&:hover': { bg: selectedCategory === cat ? '#856404' : '#E4E7EC' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Each component in Zoth Studio v2 operates as an independent micro-repo. Pull any repository on demand via <code>npx zoth pull &lt;repo-name&gt;</code>.
              </Typography>

              {/* Grid of Micro Tools */}
              <Grid container spacing={2.5}>
                {filteredTools.map((tool) => (
                  <Grid item xs={12} sm={6} key={tool.id}>
                    <Card sx={{ height: '100%', border: '1px solid #EAECF0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#101828' }}>
                            {tool.name}
                          </Typography>
                          <Chip label={`v${tool.version}`} size="small" sx={{ bg: '#F0F9FF', color: '#026AA2', fontWeight: 700, fontSize: '0.75rem' }} />
                        </Box>

                        <Typography variant="caption" sx={{ color: '#B8860B', fontWeight: 700, display: 'block', mb: 1 }}>
                          {tool.category} • {tool.repo}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.86rem' }}>
                          {tool.description}
                        </Typography>

                        <Paper sx={{ p: 1.5, bg: '#101828', color: '#FDD663', fontFamily: 'monospace', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Paper id="sec-3" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="SWARM PROTOCOL" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
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
                  { stage: 'Stage 1', title: 'Parallel Proposals', desc: 'Antigravity, Grok, and Hermes generate competing implementation proposals.' },
                  { stage: 'Stage 2', title: 'AST Diff Inspection', desc: 'Deep syntax tree diffing detects breaking changes, type mismatches, and edge cases.' },
                  { stage: 'Stage 3', title: 'Socratic Debate', desc: 'Cross-agent arguments refine code logic and enforce performance benchmarks.' },
                  { stage: 'Stage 4', title: 'SHA-256 Consensus', desc: '3/3 unanimity seals the code payload into local git history with zero telemetry.' }
                ].map((stg, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Paper sx={{ p: 2, bg: '#F8F9FA', border: '1px solid #EAECF0', textAlign: 'center', height: '100%' }}>
                      <Chip label={stg.stage} size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{stg.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{stg.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SECTION 4: Signal Bridge & Simplex E2EE */}
            <Paper id="sec-4" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="E2EE NETWORKING" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  4. Signal Bridge &amp; Simplex E2EE Protocol
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                The Sovereign Agent Signal Bridge provides end-to-end encrypted (E2EE) inter-process communication (IPC) for local agent swarms. Operating over loopback WebSockets without cloud relays, messages are secured using Noise Protocol framework double ratchets.
              </Typography>

              <Paper sx={{ p: 2.5, bg: '#101828', color: '#FDD663', fontFamily: 'monospace', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#81C995' }}># SIGNAL BRIDGE INITIALIZATION</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy('npx zoth pull sovereign-agent-bridge && npx sovereign-agent-bridge --port 9001', 'signal-bridge-cmd')}
                    sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                  >
                    {copiedIndex === 'signal-bridge-cmd' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Box>
                <div>$ npx zoth pull sovereign-agent-bridge</div>
                <div>$ npx sovereign-agent-bridge --port 9001 --e2ee-strict</div>
              </Paper>
            </Paper>

            {/* SECTION 5: Argon2id Hardware Vault Specs */}
            <Paper id="sec-5" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="HARDWARE VAULT" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  5. Argon2id Hardware Vault Specs
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Local secret storage uses Argon2id key derivation combined with AES-256-GCM authenticated payload encryption. Credentials and API tokens are decrypted in-memory only during tool invocation and wiped immediately after.
              </Typography>

              <Paper sx={{ p: 2.5, bg: '#0B0F19', color: '#81C995', fontFamily: 'monospace', borderRadius: 2, border: '1px solid #1D2939' }}>
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
            <Paper id="sec-6" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="VIRTUAL MACHINE" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  6. Zoth OS VM Setup &amp; USB Booting
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Zoth OS can be booted from a physical USB drive for full hardware isolation or run inside QEMU/KVM virtual machine instances.
              </Typography>

              <Accordion sx={{ border: '1px solid #EAECF0', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>QEMU / KVM Hypervisor Quick Start</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Run <code>qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2</code> to launch the sandbox with 4 vCPUs and 8GB RAM.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ border: '1px solid #EAECF0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
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
            <Paper id="sec-7" sx={{ p: 4, border: '1px solid #EAECF0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label="TERMINAL AUDIT" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  7. CLI Command Cheat Sheet &amp; Health Audit
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                Interactive diagnostic terminal preview window simulating the <code>zoth doctor</code> CLI system health check.
              </Typography>

              {/* Terminal Window */}
              <Paper sx={{ bg: '#0D1117', color: '#C9D1D9', borderRadius: 3, overflow: 'hidden', border: '1px solid #30363D' }}>
                <Box sx={{ px: 2.5, py: 1.5, bg: '#161B22', borderBottom: '1px solid #30363D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#FF5F56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#FFBD2E' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#27C93F' }} />
                    <Typography variant="caption" sx={{ color: '#8B949E', ml: 1.5, fontFamily: 'monospace' }}>
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
                    bg: '#0D1117',
                    borderBottom: '1px solid #21262D',
                    '& .MuiTab-root': { minHeight: 38, textTransform: 'none', fontSize: '0.8rem', fontFamily: 'monospace', color: '#8B949E' }
                  }}
                >
                  <Tab label="1. Health Audit (zoth doctor)" />
                  <Tab label="2. IPC Socket Matrix" />
                  <Tab label="3. Local Model Connectors" />
                </Tabs>

                <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, bg: '#0B0F19', color: '#81C995', whiteSpace: 'pre-wrap' }}>
                  {terminalAuditLogs[terminalTab]}
                </Box>
              </Paper>
            </Paper>

          </Box>
        </Grid>
      </Grid>

    </Container>
  );
}
