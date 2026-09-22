import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import TerminalIcon from '@mui/icons-material/Terminal';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MemoryIcon from '@mui/icons-material/Memory';
import ShieldIcon from '@mui/icons-material/Shield';
import StorageIcon from '@mui/icons-material/Storage';
import RouterIcon from '@mui/icons-material/Router';
import ComputerIcon from '@mui/icons-material/Computer';
import SpeedIcon from '@mui/icons-material/Speed';
import RefreshIcon from '@mui/icons-material/Refresh';
import CodeIcon from '@mui/icons-material/Code';
import LayersIcon from '@mui/icons-material/Layers';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';

export default function ZothOSPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [terminalTab, setTerminalTab] = useState(0);
  const [configTab, setConfigTab] = useState(0);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Terminal Streams
  const terminalLogs = [
    // Tab 0: Boot Stream
    `[    0.000000] Linux version 6.8.0-zoth-sovereign (gcc 13.2.0) #1 SMP PREEMPT_DYNAMIC 2026
[    0.004120] ZothOS: Initializing Hardware Enclave & Argon2id Security Layer
[    0.042100] ZothOS: Mounting Ephemeral Copy-On-Write VFS Root Overlay (/dev/ram0)
[    0.110480] ZothOS: Host System Passthrough KVM Acceleration Enabled (4 vCPUs, 8192MB RAM)
[    0.342100] zoth-memory-daemon: Loading STDP Vector Neural Index from /var/lib/zoth/memory.db
[    0.412990] zoth-memory-daemon: [OK] SQLite Engine listening on 127.0.0.1:8788
[    0.589120] zoth-signal-bridge: [OK] Simplex P2P E2EE Relay Bound on port 9001
[    0.812300] zoth-ollama-bridge: [OK] Ollama & Nous Hermes 3 Connectors Online
[    1.004210] ZOTH OS BOOT COMPLETE. Sovereign Agent Sandbox ready for execution.
zoth@sovereign-sandbox:~$ _`,

    // Tab 1: Memory Daemon RPC Logs
    `2026-09-21 22:58:01 [RPC] POST /v1/memory/store - Status 200 OK (3.4ms)
  payload: { entity: "agent-consensus-hash", vector_dim: 1536, text: "Dialectic verdict sealed" }
2026-09-21 22:58:02 [HNSW] Index recalculation completed across 14,208 embedded nodes.
2026-09-21 22:58:04 [RPC] POST /v1/memory/recall - Top K=5 nearest neighbors returned (similarity: 0.984)
2026-09-21 22:58:05 [VAULT] Argon2id Key Rotation Check - Status: 0 leaks, AES-256 Enclave Secure.
2026-09-21 22:58:06 [IPC] Heartbeat signal sent to Sovereign Signal Bridge (0% lost, 0.4ms ping).`,

    // Tab 2: VFS Overlay Matrix
    `Overlay filesystem status:
----------------------------------------------------------------------
MOUNT POINT           TYPE         SIZE     USED    AVAIL   USE%   STATUS
/                      tmpfs        8.0G     1.2G     6.8G    15%    CLEAN
/var/lib/zoth/vfs      overlay      32.0G    4.1G    27.9G    13%    ISOLATED
/mnt/sandbox-ram       ramfs        4.0G     256M     3.7G     6%    EPHEMERAL

* Host Filesystem Protection: STRICT READ-ONLY (Zero write mutation allowed)
* Auto-Purge on Exit: ENABLED (All agent temporary build artifacts scrubbed)`,

    // Tab 3: Swarm Network Bridge
    `Simplex P2P Mesh Topology:
[Node 01: Archon Core]    <--->  127.0.0.1:8788 (Memory Daemon)  [ACTIVE]
[Node 02: Consensus]      <--->  127.0.0.1:9001 (Signal Bridge)  [ACTIVE]
[Node 03: HexStrike Suite] <--->  127.0.0.1:9002 (Security TTY)   [ACTIVE]
[Node 04: WebGen Builder] <--->  127.0.0.1:9003 (Vite Runtime)   [ACTIVE]
----------------------------------------------------------------------
Encryption: AES-256-GCM + Simplex Signal Keys
Cloud Telemetry Traces Detected: 0`
  ];

  // Commands for configuration tab
  const configs = [
    {
      title: 'QEMU / KVM Direct CLI Launch',
      command: `qemu-system-x86_64 -enable-kvm \\
  -m 8192 -smp 4 -cpu host \\
  -drive file=zoth-agent-os.qcow2,if=virtio \\
  -netdev user,id=n1,hostfwd=tcp::8788-:8788,hostfwd=tcp::9001-:9001 \\
  -device virtio-net-pci,netdev=n1 \\
  -display nographic`
    },
    {
      title: 'Libvirt XML Hypervisor Spec',
      command: `<domain type='kvm'>
  <name>zoth-sovereign-sandbox</name>
  <memory unit='GiB'>8</memory>
  <vcpu placement='static'>4</vcpu>
  <os><type arch='x86_64'>hvm</type></os>
  <devices>
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/zoth-agent-os.qcow2'/>
      <target dev='vda' bus='virtio'/>
    </disk>
  </devices>
</domain>`
    },
    {
      title: 'Live USB Flash Command (dd)',
      command: `# Verify disk target before running!
sudo dd if=zoth-os-v2.4-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync`
    },
    {
      title: 'Docker / Podman Sandbox Fallback',
      command: `docker run -d --name zoth-os-sandbox \\
  --cap-add=SYS_PTRACE --security-opt seccomp=unconfined \\
  -p 8788:8788 -p 9001:9001 \\
  -v zoth-memory-data:/var/lib/zoth \\
  zothstudio/zoth-os:v2.4`
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      
      {/* Header / Hero Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="SOVEREIGN AGENT OS • V2.4 RELEASE"
            size="small"
            sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700 }}
          />
          <Chip
            icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#12B76A' }} />}
            label="ZERO CLOUD TELEMETRY"
            size="small"
            sx={{ bg: '#ECFDF3', color: '#027A48', border: '1px solid #ABE5C6', fontWeight: 700 }}
          />
          <Chip
            icon={<MemoryIcon sx={{ fontSize: '14px !important', color: '#0086C9' }} />}
            label="DAEMON ACTIVE (127.0.0.1:8788)"
            size="small"
            sx={{ bg: '#F0F9FF', color: '#026AA2', border: '1px solid #B9E6FE', fontWeight: 700 }}
          />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
          Zoth OS &amp; Virtual Machine Sandbox
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '900px', fontSize: '1.1rem', mb: 3 }}>
          Dedicated bootable Linux distribution and lightweight QEMU/KVM hypervisor environment engineered for unconstrained autonomous agent execution, local memory persistence, and zero-host mutation.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ px: 3, py: 1.2 }}
            onClick={() => handleCopy('https://github.com/1nc0gn30/zoth-studio-v2/releases/download/v2.4/zoth-os-v2.4-x86_64.iso', 'iso-link')}
          >
            {copiedIndex === 'iso-link' ? 'ISO Link Copied!' : 'Download Zoth OS ISO (.iso)'}
          </Button>

          <Button
            variant="outlined"
            sx={{ color: '#101828', borderColor: '#D0D5DD', px: 3, py: 1.2, '&:hover': { borderColor: '#B8860B', bg: '#FFFCF5' } }}
            startIcon={<TerminalIcon />}
            onClick={() => handleCopy('qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2 -net user,hostfwd=tcp::8788-:8788', 'hero-qemu')}
          >
            {copiedIndex === 'hero-qemu' ? 'Command Copied!' : 'Copy QEMU Launcher'}
          </Button>
        </Box>
      </Box>

      {/* Main Grid: Interactive Terminal Window + Architecture Summary */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        
        {/* Terminal Window (Left/Top) */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={3}
            sx={{
              bg: '#0D1117',
              color: '#C9D1D9',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid #30363D',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {/* Terminal Window Header Bar */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bg: '#161B22',
                borderBottom: '1px solid #30363D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#FF5F56' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#FFBD2E' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#27C93F' }} />
                <Typography variant="caption" sx={{ color: '#8B949E', ml: 1.5, fontFamily: 'monospace', fontWeight: 600 }}>
                  zoth-sovereign-hypervisor ~ tty1 (QEMU/KVM)
                </Typography>
              </Box>

              <Tooltip title="Copy Terminal Stream">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(terminalLogs[terminalTab], 'terminal-copy')}
                  sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                >
                  {copiedIndex === 'terminal-copy' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Terminal Stream Sub-Tabs */}
            <Box sx={{ borderBottom: '1px solid #21262D', bg: '#0D1117' }}>
              <Tabs
                value={terminalTab}
                onChange={(e, val) => setTerminalTab(val)}
                textColor="inherit"
                indicatorColor="primary"
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': {
                    minHeight: 40,
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    color: '#8B949E',
                    '&.Mui-selected': { color: '#FDD663', fontWeight: 700 }
                  }
                }}
              >
                <Tab label="1. Kernel Boot Output" />
                <Tab label="2. Memory RPC (:8788)" />
                <Tab label="3. VFS Isolation" />
                <Tab label="4. P2P Mesh Topology" />
              </Tabs>
            </Box>

            {/* Terminal Body */}
            <Box
              sx={{
                p: 3,
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                minHeight: 320,
                maxHeight: 420,
                overflowY: 'auto',
                bg: '#0B0F19',
                color: terminalTab === 0 ? '#81C995' : terminalTab === 1 ? '#79C0FF' : terminalTab === 2 ? '#D2A8FF' : '#FFA657',
                whiteSpace: 'pre-wrap'
              }}
            >
              {terminalLogs[terminalTab]}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Launch & Status Panel (Right) */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3.5, height: '100%', border: '1px solid #EAECF0', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeveloperBoardIcon sx={{ color: '#B8860B' }} />
                Hypervisor Health &amp; Runtime Specs
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Zoth OS runs inside lightweight KVM virtual machines with hypervisor-enforced memory encryption and isolated IPC message buses.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, bg: '#F8F9FA', borderRadius: 2, border: '1px solid #EAECF0' }}>
                  <Typography variant="caption" color="text.secondary" display="block">VCPU ALLOCATION</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828' }}>4 vCPUs (VirtIO)</Typography>
                </Box>
                <Box sx={{ p: 2, bg: '#F8F9FA', borderRadius: 2, border: '1px solid #EAECF0' }}>
                  <Typography variant="caption" color="text.secondary" display="block">RAM ALLOCATION</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828' }}>8,192 MB DDR5</Typography>
                </Box>
                <Box sx={{ p: 2, bg: '#F8F9FA', borderRadius: 2, border: '1px solid #EAECF0' }}>
                  <Typography variant="caption" color="text.secondary" display="block">MEMORY DAEMON</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#027A48' }}>127.0.0.1:8788</Typography>
                </Box>
                <Box sx={{ p: 2, bg: '#F8F9FA', borderRadius: 2, border: '1px solid #EAECF0' }}>
                  <Typography variant="caption" color="text.secondary" display="block">VFS STATE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#B8860B' }}>COW Overlay</Typography>
                </Box>
              </Box>
            </Box>

            <Paper sx={{ p: 2, bg: '#101828', borderRadius: 2, color: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#81C995', fontFamily: 'monospace', fontWeight: 700 }}>
                  ONE-TOUCH QUICK INITIALIZER
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy('npx zoth pull zoth-vos-sandbox && npx zoth-vos-sandbox start', 'quick-init')}
                  sx={{ color: '#8B949E', '&:hover': { color: '#FDD663' } }}
                >
                  {copiedIndex === 'quick-init' ? <CheckIcon fontSize="small" sx={{ color: '#81C995' }} /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#FDD663' }}>
                $ npx zoth pull zoth-vos-sandbox &amp;&amp; npx zoth-vos-sandbox start
              </Typography>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      {/* System Architecture Grid (6 Feature Cards) */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Zoth OS System Architecture
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Six core structural pillars supporting secure, high-throughput, autonomous AI agent execution.
        </Typography>

        <Grid container spacing={3}>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ComputerIcon sx={{ color: '#B8860B' }} />
                </Box>
                <Chip label="HARDWARE ISOLATION" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  QEMU / KVM Microvisor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete hardware-level virtualization using Linux KVM kernel modules. Agents run in an unprivileged ring with dedicated virtualized hardware.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <StorageIcon sx={{ color: '#0284C7' }} />
                </Box>
                <Chip label="EPHEMERAL VFS" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Zero-Host Mutation Overlay
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Copy-on-write RAM &amp; disk overlay guarantees the host machine's root filesystem is never modified, corrupted, or accessed by subagent commands.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <MemoryIcon sx={{ color: '#16A34A' }} />
                </Box>
                <Chip label="PORT 8788 DAEMON" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Local Memory &amp; HNSW Vector DB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pre-configured SQLite vector engine and STDP biomorphic memory daemon running on local port 8788 for ultra-fast multi-session context recall.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#FDF2FA', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ShieldIcon sx={{ color: '#C01048' }} />
                </Box>
                <Chip label="ARGON2ID VAULT" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Encrypted Hardware Enclave
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Local key derivation using Argon2id and AES-256-GCM payload encryption for safely injecting API credentials into isolated agent shells.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <RouterIcon sx={{ color: '#EA580C' }} />
                </Box>
                <Chip label="SIMPLEX P2P MESH" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Signal Bridge Inter-Process Protocol
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Point-to-point encrypted IPC sockets allowing 21+ swarm agents to coordinate, exchange AST code diffs, and reach consensus seamlessly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', border: '1px solid #EAECF0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bg: '#F4F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CodeIcon sx={{ color: '#7A5AF8' }} />
                </Box>
                <Chip label="UNCONSTRAINED TTY" size="small" sx={{ bg: '#F2F4F7', color: '#344054', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Native Terminal Execution Harness
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unrestricted bash/zsh command execution inside the VM container. Agents can install npm packages, compile C/Rust code, and spawn sub-processes safely.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>

      {/* Interactive Command Copy Blocks & Generator */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Launch &amp; Deployment Commands
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select your target environment to generate production-ready boot scripts and hypervisor commands.
        </Typography>

        <Paper sx={{ border: '1px solid #EAECF0', borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={configTab}
            onChange={(e, val) => setConfigTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              bg: '#F8F9FA',
              borderBottom: '1px solid #EAECF0',
              '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' }
            }}
          >
            {configs.map((cfg, idx) => (
              <Tab key={idx} label={cfg.title} />
            ))}
          </Tabs>

          <Box sx={{ p: 3, bg: '#101828', color: '#FDD663', fontFamily: 'monospace' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#81C995', fontWeight: 700 }}>
                # {configs[configTab].title}
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={copiedIndex === `cfg-${configTab}` ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={() => handleCopy(configs[configTab].command, `cfg-${configTab}`)}
              >
                {copiedIndex === `cfg-${configTab}` ? 'Copied to Clipboard!' : 'Copy Command'}
              </Button>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bg: '#0B0F19',
                color: '#81C995',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                border: '1px solid #1D2939'
              }}
            >
              <pre style={{ margin: 0 }}>{configs[configTab].command}</pre>
            </Paper>
          </Box>
        </Paper>
      </Box>

      {/* Hardware Requirements & Compatibility Matrix */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Hardware Requirements &amp; Matrix
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          System specifications for deploying Zoth OS hypervisor nodes across workstation setups.
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #EAECF0', borderRadius: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bg: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>RESOURCE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>MINIMUM SPEC</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>RECOMMENDED SPEC</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ENTERPRISE SWARM NODE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Virtual CPUs</TableCell>
                <TableCell>2 vCPUs (x86_64 / ARM64)</TableCell>
                <TableCell>4 vCPUs (KVM Hardware Accel)</TableCell>
                <TableCell>16+ vCPUs (Dedicated CPU Pinning)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>System RAM</TableCell>
                <TableCell>4,096 MB</TableCell>
                <TableCell>8,192 MB</TableCell>
                <TableCell>32,768 MB DDR5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Storage Overlay</TableCell>
                <TableCell>10 GB Ephemeral VFS</TableCell>
                <TableCell>32 GB Copy-on-Write NVMe</TableCell>
                <TableCell>128 GB High-IOPS RAM Disk</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Local Model Backends</TableCell>
                <TableCell>Ollama / CPU GGUF</TableCell>
                <TableCell>Nous Hermes 3 (8B) + GPU</TableCell>
                <TableCell>Antigravity Swarm + Dual RTX 4090</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Telemetry &amp; Audit</TableCell>
                <TableCell><Chip label="ZERO TELEMETRY" size="small" color="success" /></TableCell>
                <TableCell><Chip label="ZERO TELEMETRY" size="small" color="success" /></TableCell>
                <TableCell><Chip label="ZERO TELEMETRY" size="small" color="success" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Container>
  );
}
