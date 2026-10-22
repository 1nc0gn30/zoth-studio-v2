import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Link as RouterLink } from 'react-router-dom';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PILLARS = [
  {
    id: '01-AI-Agents-and-Dev',
    count: 16,
    title: 'AI Agents & Developer Workspaces',
    apps: ['Hermes Agent (GPT-4o)', 'Grok CLI', 'Ollama 1.5B Local', 'Aider', 'Cline', 'OpenCode', 'OpenAI Codex', 'Google Antigravity', 'Bolt.DIY / WebGen', 'Zoth Workspaces'],
  },
  {
    id: '02-Security-and-Privacy',
    count: 19,
    title: 'Offensive Security & Stealth Vaults',
    apps: ['HexStrike AI (28 Tools)', 'GhidraMCP Bridge', 'Shodan Sentinel', 'Burp Suite', 'Caido', 'Ghostmode Tor', 'Amnesic RAM Mode', 'Undercover Win11', 'NetKill Panic', 'VeraCrypt / Bitwarden'],
  },
  {
    id: '03-ZothOS-Daemons',
    count: 17,
    title: 'Loopback Enclave Daemons (:8094–:8121)',
    apps: ['Neuro-Memory :8094', 'Egress Sentinel :8095', 'Mock Twin :8097', 'Prompt Firewall :8098', 'Flight Recorder :8104', 'Capsule Jail :8105', 'Policy Auditor :8106', 'MCP Lens :8109', 'Budget Sentinel :8110', 'Gods Eye :8112'],
  },
  {
    id: '04-Media-and-Utilities',
    count: 19,
    title: 'Media, Knowledge & System Utilities',
    apps: ['Zoth Civilization :9393', 'Obsidian Canon', 'Yazi File Navigator', 'Desktop Pet HUD', 'Reality Switcher', 'Matrix Rain', 'Hermetic Audio', 'Maya Studio', 'Six Math Pillars', 'Solana Web3 Vault'],
  },
];

const RINGS = [
  { ring: 'Ring 0 · Kernel & Loopback Core', policy: 'ALWAYS ON (127.0.0.1)', desc: 'Neuro-Memory (:8094), Egress Sentinel (:8095), Prompt Firewall (:8098), Thermal Guard (<60°C).' },
  { ring: 'Ring 1 · Read-Only Recon & AST', policy: 'AUTO-LEASED', desc: 'Shodan InternetDB, MCP Lens (:8109), CWV Speed Engine, AEO Graph, Passive DoH OSINT.' },
  { ring: 'Ring 2 · Sandboxed Workspace Write', policy: 'HMAC CAPABILITY TOKEN', desc: 'Hermes Agent, Grok CLI, Ollama 1.5B, GhidraMCP decompiler, Capsule Jail (:8105).' },
  { ring: 'Ring 3 · Offensive & Network Egress', policy: 'DEFAULT OFF · EXPLICIT UNLOCK', desc: 'HexStrike active exploit payloads, Nmap/Wireshark MCP, Tor Ghostmode routing.' },
];

export default function ZothOSGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tab, setTab] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const cliCmd = 'zoth-control-center --status && zoth-agent-conductor thermals && zoth-agent-conductor status';

  const handleCopy = () => {
    navigator.clipboard?.writeText(cliCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
          border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.4)' : '#F5E6AB'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label="ZOTHOS v3.2.0 · DEBIAN 13 + KDE PLASMA 6.3"
            size="small"
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 900, fontFamily: mono }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            10 Root Flagships · 4 Consolidated Pillars (81 Apps) · 22 Loopback Daemons · 152 Default-Off MCP Servers
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/zoth-os"
          size="small"
          variant="contained"
          startIcon={<RocketLaunchIcon />}
          sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.74rem' }}
        >
          Full ZothOS Showcase →
        </Button>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 38 }}>
        <Tab label="4-Pillar Desktop Hub (81 Apps)" sx={{ fontWeight: 800, fontSize: '0.8rem', minHeight: 38 }} />
        <Tab label="4-Tier MCP Security Rings" sx={{ fontWeight: 800, fontSize: '0.8rem', minHeight: 38 }} />
        <Tab label="Control Center CLI & QEMU" sx={{ fontWeight: 800, fontSize: '0.8rem', minHeight: 38 }} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={5}>
            <Stack spacing={1.2}>
              {PILLARS.map((p, idx) => (
                <Paper
                  key={p.id}
                  onClick={() => setSelectedPillar(idx)}
                  sx={{
                    p: 1.75,
                    cursor: 'pointer',
                    borderRadius: 2,
                    bgcolor: selectedPillar === idx ? (isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7') : (isDark ? '#08080C' : '#FFFFFF'),
                    border: `1.5px solid ${selectedPillar === idx ? '#D4AF37' : theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                    <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.78rem', color: '#D4AF37' }}>
                      ~/Desktop/{p.id}
                    </Typography>
                    <Chip label={`${p.count} Apps`} size="small" sx={{ height: 18, fontSize: '0.64rem', fontFamily: mono, fontWeight: 800 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{p.title}</Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>
          <Grid xs={12} md={7}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                {PILLARS[selectedPillar].title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mb: 2 }}>
                VERIFIED .DESKTOP LAUNCHERS IN /etc/skel/Desktop/{PILLARS[selectedPillar].id}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PILLARS[selectedPillar].apps.map((app) => (
                  <Chip
                    key={app}
                    icon={<TerminalIcon sx={{ fontSize: '14px !important', color: '#34D399 !important' }} />}
                    label={app}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          {RINGS.map((r) => (
            <Grid xs={12} sm={6} key={r.ring}>
              <Paper sx={{ p: 2.2, height: '100%', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D4AF37' }}>{r.ring}</Typography>
                  <Chip label={r.policy} size="small" sx={{ height: 18, fontSize: '0.62rem', fontFamily: mono, fontWeight: 800 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem' }}>{r.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: '#050508', color: '#E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#34D399' }}>
              ZOTH-CONTROL-CENTER &amp; SOVEREIGN CONDUCTOR TELEMETRY
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={copiedCmd ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopy}
              sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#D4AF37', borderColor: '#D4AF3766' }}
            >
              {copiedCmd ? 'Copied!' : 'Copy CLI'}
            </Button>
          </Box>
          <Box component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.76rem', color: '#A7F3D0', overflowX: 'auto', lineHeight: 1.65 }}>
{`$ zoth-control-center --status
⚡ ZOTHOS SOVEREIGN CONTROL CENTER v2.0 · UNIFIED DESKTOP & DAEMON HUB
  CPU Threads: 8  |  KVM: AVAILABLE  |  Thermals: 48.0°C (COOL <60°C)
  [0] 00-Root-Flagships        (10 apps) — 10 Core Flagship Desktop Apps
  [1] 01-AI-Agents-and-Dev     (16 apps) — Frontier Coding Agents, AI Stacks & Web Builders
  [2] 02-Security-and-Privacy  (19 apps) — HexStrike AI, Kali/Parrot Suite, Ghostmode & Vaults
  [3] 03-ZothOS-Daemons        (17 apps) — 22 Loopback Enclave Daemons & Telemetry Conductor
  [4] 04-Media-and-Utilities   (19 apps) — Obsidian Canon, Yazi, Desktop Pet, Audio/Video & Tools`}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
