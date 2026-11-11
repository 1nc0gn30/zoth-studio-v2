import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalSystemDossier from '../components/LocalSystemDossier';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

const COMPARISON_ROWS = [
  {
    feature: 'Offensive & Defensive Security Suite',
    zoth: 'Kali + Parrot parity + HexStrike CLI',
    kali: '150+ Tools',
    parrot: '150+ Tools',
    ubuntu: 'Manual install',
  },
  {
    feature: 'Local AI Coding Agents & Daemons',
    zoth: 'Ollama (127.0.0.1), Hermes, Egregore, 163 MCP catalog (off by default)',
    kali: 'None',
    parrot: 'None',
    ubuntu: 'None',
  },
  {
    feature: 'Pre-Installed Local Tool Arsenal',
    zoth: 'Zoth Studio v2 (77-tool local CLI & daemon suite)',
    kali: 'None',
    parrot: 'None',
    ubuntu: 'None',
  },
  {
    feature: 'Self-Healing System Diagnostics',
    zoth: 'zoth-heal automated resilience daemon',
    kali: 'None',
    parrot: 'None',
    ubuntu: 'None',
  },
  {
    feature: 'Hardware Credential Vault',
    zoth: 'zoth-vault (Argon2id + AES-256) + Pass',
    kali: 'Standard keyring',
    parrot: 'Standard keyring',
    ubuntu: 'Standard keyring',
  },
  {
    feature: 'Amnesic & Tor Ghostmode Edition',
    zoth: 'zoth ghost + ZothOS-Lite v1.2 RAM-only edition',
    kali: 'Manual setup',
    parrot: 'AnonSurf',
    ubuntu: 'None',
  },
];

export default function ZothOSShowcasePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? '#0E1016' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A8A29E' : '#334155';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';
  const gold = isDark ? '#D4AF37' : '#7A5808';
  const goldWash = isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(122, 88, 8, 0.06)';

  return (
    <LocalSystemDossier
      tone="gold"
      kicker="ZOTH OS v3.4.0 & ZOTHOS-LITE v1.2"
      badges={['DEBIAN 13 TRIXIE', 'KDE PLASMA 6', '77 TOOLS PRE-INSTALLED']}
      title="The Sovereign AI & Security"
      accentWord="Linux Distribution."
      subtitle="Most Zoth Studio tools execute against real Linux sockets, local SQLite graphs, and loopback inference daemons—not browser sandboxes. ZothOS v3.4.0 ships the entire 77-tool Zoth Studio arsenal, Kali and Parrot security parity, Ollama on 127.0.0.1, and deterministic KDE Plasma 6 workspaces ready on first boot."
      cloneCommand="git clone https://github.com/NullAITech/zoth-os.git && cd zoth-os"
      repoUrl="https://github.com/NullAITech/zoth-os"
      repoLabel="Get ZothOS Build Repo"
      docsRoute="/zoth-os/docs"
      docsLabel="OS Architecture & ISO Docs"
      externalLinks={[
        { label: 'zothos.nullai.tech', href: 'https://zothos.nullai.tech' },
        { label: 'zothos-lite.nullai.tech', href: 'https://zothos-lite.nullai.tech' },
      ]}
      overviewTitle="Two Purpose-Built Editions: Workstation & Amnesic Lite"
      overviewParagraphs={[
        'ZothOS v3.4.0 is our full Debian 13 (Trixie) + KDE Plasma 6 workstation distribution engineered by NullAI. It combines offensive and defensive security tooling with local-first AI runtimes—binding Ollama strictly to 127.0.0.1, starting UFW in default-deny mode, and keeping all 163 cataloged MCP servers disabled until explicitly enabled by the operator.',
        'For air-gapped or RAM-only boot workflows, ZothOS-Lite v1.2 (1nc0gn30/zothos-lite) provides a monochrome, Tails-inspired amnesic live environment with zero persistent disk writes.',
      ]}
      pipelineSteps={[
        {
          label: 'Deterministic Live-Build Pipeline',
          detail: 'Reproducible SquashFS & chroot hooks configure KDE Plasma 6 folders, Xcursor themes, and /usr/local/bin tool wrappers.',
        },
        {
          label: 'Loopback-First Daemon Topology',
          detail: 'Zoth Studio (:3000), Neuro-Memory (:8094), Pantheon Swarm (:8141), and Ollama (:11434) bind strictly to localhost.',
        },
        {
          label: 'Self-Healing & Ghostmode Controls',
          detail: 'zoth-heal monitors system health while zoth ghost routes traffic through Tor or enforces RAM-only execution.',
        },
      ]}
      specs={[
        { key: 'Base System', value: 'Debian 13 (Trixie) x86_64' },
        { key: 'Desktop Shell', value: 'KDE Plasma 6 (4 Deterministic Folders)' },
        { key: 'Lite Edition', value: 'ZothOS-Lite v1.2 (Amnesic Monotone)' },
        { key: 'Firewall Posture', value: 'UFW Default-Deny + Loopback Only' },
        { key: 'Preloaded Arsenal', value: 'All 77 Zoth Studio CLI & Daemon Tools' },
        { key: 'MCP Catalog', value: '163 Servers Indexed (All Off by Default)' },
      ]}
      quickstartLines={[
        '# Clone the ZothOS ISO live-build repository',
        'git clone https://github.com/NullAITech/zoth-os.git',
        'cd zoth-os',
        '',
        '# Or clone the lightweight amnesic ZothOS-Lite edition',
        'git clone https://github.com/1nc0gn30/zothos-lite.git',
      ]}
      capabilitiesKicker="OPERATING SYSTEM PILLARS"
      capabilitiesTitle="What Ships Out of the Box on ZothOS"
      capabilities={[
        {
          tag: 'SECURITY PARITY',
          title: 'Kali & Parrot Tooling Built In',
          desc: 'Pre-configured Nmap, Wireshark, Metasploit, Recon-ng, Burp/Caido workflows, and HexStrike CLI with zero post-install dependency hunting.',
        },
        {
          tag: 'LOCAL AI CORE',
          title: 'Loopback LLM & Agent Stack',
          desc: 'Ships with Ollama bound to 127.0.0.1, Nous Research Hermes Agent integration, Zoth Egregore support, and Neuro-Memory (:8094).',
        },
        {
          tag: 'PRIVACY & VAULT',
          title: 'Ghostmode Tor & Argon2id Vault',
          desc: 'System-wide Tor routing via zoth ghost alongside zoth-vault (Argon2id + AES-256) for zero-leak local credential storage.',
        },
        {
          tag: 'RESILIENCE',
          title: 'zoth-heal Autonomous Diagnostics',
          desc: 'Continuous local health checks across display, audio, network, package state, and loopback services with one-command recovery.',
        },
        {
          tag: 'AMNESIC LITE',
          title: 'ZothOS-Lite v1.2 Companion ISO',
          desc: 'Dedicated monochrome, RAM-only toram boot profile for ephemeral research sessions that leave zero trace on host storage.',
        },
        {
          tag: 'DESKTOP HYGIENE',
          title: 'Deterministic Plasma 6 Workspaces',
          desc: 'Four clean desktop folders, eight named virtual desktops, and multi-size SWCursor-safe Xcursor themes verified across bare metal and KVM.',
        },
      ]}
      funnelToolTitle="ZothOS v3.4.0 & ZothOS-Lite v1.2"
      funnelToolTag="SOVEREIGN LINUX OS"
      funnelToolDesc="Debian 13 + KDE Plasma 6 operating system pre-loaded with all 77 Zoth Studio tools, local LLM runtimes, and security parity."
    >
      {/* Clean Distribution Comparison Matrix */}
      <Box>
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: gold,
            mb: 0.75,
          }}
        >
          DISTRIBUTION MATRIX
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
          How ZothOS Compares to Standard Linux Distros
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${hairline}`,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 640 }}>
            <TableHead sx={{ bgcolor: goldWash }}>
              <TableRow>
                <TableCell sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.78rem', color: textPrimary }}>
                  Capability
                </TableCell>
                <TableCell sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.78rem', color: gold }}>
                  ZothOS v3.4.0
                </TableCell>
                <TableCell sx={{ fontFamily: mono, fontWeight: 600, fontSize: '0.78rem', color: textSecondary }}>
                  Kali Linux
                </TableCell>
                <TableCell sx={{ fontFamily: mono, fontWeight: 600, fontSize: '0.78rem', color: textSecondary }}>
                  Parrot OS
                </TableCell>
                <TableCell sx={{ fontFamily: mono, fontWeight: 600, fontSize: '0.78rem', color: textSecondary }}>
                  Ubuntu
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.feature} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.86rem', color: textPrimary }}>
                    {row.feature}
                  </TableCell>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.8rem', color: gold }}>
                    {row.zoth}
                  </TableCell>
                  <TableCell sx={{ fontFamily: mono, fontSize: '0.8rem', color: textSecondary }}>
                    {row.kali}
                  </TableCell>
                  <TableCell sx={{ fontFamily: mono, fontSize: '0.8rem', color: textSecondary }}>
                    {row.parrot}
                  </TableCell>
                  <TableCell sx={{ fontFamily: mono, fontSize: '0.8rem', color: textSecondary }}>
                    {row.ubuntu}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalSystemDossier>
  );
}
