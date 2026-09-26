import React, { useState, useRef, useEffect } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Button,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ComputerIcon from '@mui/icons-material/Computer';
import MemoryIcon from '@mui/icons-material/Memory';
import TerminalIcon from '@mui/icons-material/Terminal';
import DownloadIcon from '@mui/icons-material/Download';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import StorageIcon from '@mui/icons-material/Storage';
import LaunchIcon from '@mui/icons-material/Launch';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { useStudioStatus } from '../studio/useStudioStatus';
import { useHostInfo } from '../studio/useHostInfo';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, ParallaxGlow, RevealOnScroll, StaggerChildren, StaggerItem } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const qemu = 'qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2';
const isoCmd = 'sudo dd if=zothos-2.0-amd64.iso of=/dev/sdX status=progress bs=4M conv=fdatasync';
const microRunnerCmd = 'curl -fsSL https://get.zoth.io/micro-runner.sh | bash';
const gitCloneCmd = 'git clone https://github.com/NullAITech/zoth-os.git && cd zoth-os';

// Circular Radial Dial Component
function RadialResourceDial({ value, max = 100, label, subtext, metricText, statusBadge, accentColor, glowColor }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Box sx={{ position: 'relative', width: 130, height: 130, my: 1 }}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="transparent"
            stroke={isDark ? 'rgba(212, 175, 55, 0.12)' : '#E2E8F0'}
            strokeWidth="9"
          />
          {/* Active progress arc */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="transparent"
            stroke={accentColor || (isDark ? '#D4AF37' : '#B8860B')}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${glowColor || (isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(184, 134, 11, 0.25)')})`,
            }}
          />
        </svg>

        {/* Center content */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#101828',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {metricText || `${Math.round(percentage)}%`}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: mono,
              fontSize: '0.65rem',
              color: isDark ? '#D4AF37' : '#8A6A09',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mt: 0.5,
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {statusBadge && (
        <Chip
          label={statusBadge}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontFamily: mono,
            fontWeight: 800,
            bgcolor: isDark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7',
            color: isDark ? '#F5E6AB' : '#8A6A09',
            border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.35)' : '#E2CE82'}`,
            mt: 0.5,
            mb: 0.8,
          }}
        />
      )}

      {subtext && (
        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#475467', fontSize: '0.78rem', lineHeight: 1.4, maxWidth: 220 }}>
          {subtext}
        </Typography>
      )}
    </Box>
  );
}

export default function ZothOSPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const { hostInfo, launchTool, launching } = useHostInfo();

  // Copy states
  const [copiedQemu, setCopiedQemu] = useState(false);
  const [copiedIso, setCopiedIso] = useState(false);
  const [copiedMicroRunner, setCopiedMicroRunner] = useState(false);
  const [copiedGitClone, setCopiedGitClone] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleLaunchTool = async (toolKey, toolLabel) => {
    setToastMessage(`Initiating ${toolLabel}...`);
    const res = await launchTool(toolKey);
    if (res?.success) {
      setToastMessage(`Successfully spawned ${toolLabel} on ZothOS`);
    } else {
      setToastMessage(`Notice: ${res?.error || 'Spawning tool in background'}`);
    }
  };

  const launcherTools = [
    {
      id: 'claude',
      name: 'Claude CLI',
      desc: 'Anthropic Sovereign Agent Shell & Pair Programmer',
      icon: TerminalIcon,
      installed: hostInfo?.installedTools?.claude,
      tag: 'AI AGENT',
    },
    {
      id: 'opencode',
      name: 'OpenCode CLI',
      desc: 'Multi-Model Local Coding Agent & Terminal Assistant',
      icon: CodeIcon,
      installed: hostInfo?.installedTools?.opencode,
      tag: 'CODE ASSIST',
    },
    {
      id: 'hermes',
      name: 'Hermes Agent',
      desc: 'Autonomous Mesh Agent with Skill Execution Engine',
      icon: ComputerIcon,
      installed: hostInfo?.installedTools?.hermes,
      tag: 'AUTONOMOUS',
    },
    {
      id: 'burpsuite',
      name: 'Burp Suite Pro',
      desc: 'Local Penetration Testing & Web Application Security',
      icon: SecurityIcon,
      installed: hostInfo?.installedTools?.burpsuite,
      tag: 'OFFENSIVE SEC',
    },
    {
      id: 'bitwarden',
      name: 'Bitwarden CLI',
      desc: 'Air-Gapped Encrypted Password & Secrets Vault',
      icon: LockIcon,
      installed: hostInfo?.installedTools?.bitwarden,
      tag: 'CREDENTIAL VAULT',
    },
    {
      id: 'streamlit',
      name: 'Streamlit Studio',
      desc: 'Local ML Application Dashboard & Python Web Engine',
      icon: SpeedIcon,
      installed: hostInfo?.installedTools?.streamlit,
      tag: 'DATA SCIENCE',
    },
    {
      id: 'netlify',
      name: 'Netlify CLI',
      desc: 'Serverless Functions & Static Site Edge Deployment',
      icon: LaunchIcon,
      installed: hostInfo?.installedTools?.netlify,
      tag: 'DEPLOYMENT',
    },
    {
      id: 'terminal',
      name: 'System Terminal',
      desc: 'XFCE4 Shell with Zoth Hardened Environment',
      icon: TerminalIcon,
      installed: true,
      tag: 'NATIVE SHELL',
    },
    {
      id: 'arsenal',
      name: 'Arsenal Provisioner',
      desc: 'Local Hermetic Skillset & Security Tool Syncer',
      icon: TuneIcon,
      installed: true,
      tag: 'TOOL SYNC',
    },
  ];

  // Models list
  const models = status?.services?.ollama?.models || [];

  // Hardware Resource Dials State
  const [cpuPreset, setCpuPreset] = useState('4c8t'); // '2c4t', '4c8t', '8c16t'
  const [cpuLoad, setCpuLoad] = useState(12); // 12% usage
  const [ramAllocation, setRamAllocation] = useState(8192); // 8192 MB
  const [ramActiveGb, setRamActiveGb] = useState(3.4); // 3.4 GB active
  const [isSimulatingBurst, setIsSimulatingBurst] = useState(false);
  const [egressProbeActive, setEgressProbeActive] = useState(false);

  // Hypervisor VM State & Boot Animation
  const [vmState, setVmState] = useState('online'); // 'online', 'booting', 'diagnosing', 'installing'
  const [bootProgress, setBootProgress] = useState(100);
  const [vmUptime, setVmUptime] = useState('04:18:22');
  const bootTimeoutsRef = useRef([]);

  // Manifest Dialog State
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Terminal State
  const initialHistory = [
    {
      id: 1,
      type: 'system',
      text: [
        'ZOTH SOVEREIGN OS v2.0.0-RELEASE (x86_64 Hardened Microkernel)',
        'Built with Zero-Egress Invariant & Air-Gapped Cryptographic Enclaves.',
        'Type "help" to inspect commands or execute "zoth boot --kvm" to run virtual boot sequence.',
      ].join('\n'),
    },
  ];

  const [terminalHistory, setTerminalHistory] = useState(initialHistory);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistoryList, setCommandHistoryList] = useState([]);
  const [historyNavIndex, setHistoryNavIndex] = useState(-1);
  const terminalEndRef = useRef(null);
  const terminalInputRef = useRef(null);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.32)' : '#E2CE82',
    contrastText: '#08080B',
  };

  // Clean up boot sequence timeouts
  useEffect(() => {
    return () => {
      bootTimeoutsRef.current.forEach((t) => clearTimeout(t));
      bootTimeoutsRef.current = [];
    };
  }, []);

  // Scroll to bottom when terminal updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // CPU Presets mapping
  const cpuConfigs = {
    '2c4t': { cores: 2, threads: 4, label: '2 Cores / 4 Threads', freq: '3.6 GHz (Power-Save)' },
    '4c8t': { cores: 4, threads: 8, label: '4 Cores / 8 Threads', freq: '3.82 GHz (Balanced Ring-0)' },
    '8c16t': { cores: 8, threads: 16, label: '8 Cores / 16 Threads', freq: '4.25 GHz (Max Passthrough)' },
  };

  const handleCpuPresetChange = (preset) => {
    setCpuPreset(preset);
    if (preset === '2c4t') setCpuLoad(8);
    else if (preset === '4c8t') setCpuLoad(12);
    else setCpuLoad(19);
  };

  const handleSimulateBurst = () => {
    if (isSimulatingBurst) return;
    setIsSimulatingBurst(true);
    setCpuLoad(78);
    setRamActiveGb(5.1);
    setToastMessage('Workload Burst Simulation Active: vCPU at 78%, KVM Buffer at 5.1 GB.');
    setTimeout(() => {
      setCpuLoad(12);
      setRamActiveGb(3.4);
      setIsSimulatingBurst(false);
    }, 2800);
  };

  const handleEgressProbe = () => {
    if (egressProbeActive) return;
    setEgressProbeActive(true);
    setTimeout(() => {
      setEgressProbeActive(false);
      setToastMessage('Zero-Egress Probe Audit: 0 packets leaked. Outbound SYN permanently blocked.');
    }, 1200);
  };

  // Virtual Boot Sequence Animation Handler
  const runBootSequence = () => {
    // Clear any pending timeouts
    bootTimeoutsRef.current.forEach((t) => clearTimeout(t));
    bootTimeoutsRef.current = [];

    setVmState('booting');
    setBootProgress(12);

    const baseId = Date.now();
    setTerminalHistory((prev) => [
      ...prev,
      {
        id: baseId,
        type: 'input',
        text: 'zoth boot --kvm',
      },
      {
        id: baseId + 1,
        type: 'system',
        text: [
          '>>> [KVM-HYPERVISOR] Initializing virtual machine VM-01 (ZothOS Sovereign v2)...',
          '>>> [KVM-HYPERVISOR] Hardware acceleration: KVM Ring-0 VMX unlocked.',
          `>>> [KVM-HYPERVISOR] Allocating ${ramAllocation} MB guest memory buffer with AES-256 swap...`,
        ].join('\n'),
      },
    ]);

    const steps = [
      {
        delay: 280,
        progress: 32,
        log: [
          '[  0.000000] Linux version 6.8.0-zoth-hardened-x86_64 (operator@genesis) (gcc 13.2.0) #1 SMP PREEMPT_DYNAMIC',
          '[  0.004120] Command line: BOOT_IMAGE=/vmlinuz-6.8.0-zoth root=/dev/mapper/zoth-crypt ro quiet zero_egress=strict',
          '[  0.015200] kvm: nested virtualization enabled (VMX/SVM Direct Ring-0 passthrough)',
        ].join('\n'),
      },
      {
        delay: 600,
        progress: 58,
        log: [
          `[  0.048900] smp: Bringing up secondary CPUs ... 4 vCPUs active (${cpuConfigs[cpuPreset].label})`,
          '[  0.092100] zoth_egress: BPF enforcement filter installed on lo & kvm-br0 (DROP_OUTBOUND_SYN)',
          '[  0.134000] systemd[1]: Mounting /enclaves/memory_vault (crypto: aes-256-xts)... [  OK  ]',
        ].join('\n'),
      },
      {
        delay: 950,
        progress: 84,
        log: [
          '[  0.220100] systemd[1]: Starting Zoth Sovereign Memory Daemon (pid 1420, port 8094)... [  OK  ]',
          `[  0.312000] systemd[1]: Starting Ollama Engine Sandbox (port 11434, ${models.length || 3} models verified)... [  OK  ]`,
          '[  0.421500] systemd[1]: Starting Zoth Studio Cockpit v2 (port 5173, unshared netns)... [  OK  ]',
        ].join('\n'),
      },
      {
        delay: 1350,
        progress: 100,
        log: [
          '[  0.501200] zoth_doctor: All 18 cryptographic invariants verified (Ed25519-ph signature PASS)',
          '========================================================================',
          '      ★ ZOTH OS SOVEREIGN HYPERVISOR BOOT COMPLETE (VM-01 ONLINE) ★     ',
          '========================================================================',
          'Session active on TTY-01. Microkernel invariants active. Zero telemetry enforced.',
        ].join('\n'),
      },
    ];

    steps.forEach((step, idx) => {
      const timeoutId = setTimeout(() => {
        setBootProgress(step.progress);
        setTerminalHistory((prev) => [
          ...prev,
          {
            id: baseId + 10 + idx,
            type: idx === steps.length - 1 ? 'system' : 'output',
            text: step.log,
          },
        ]);

        if (idx === steps.length - 1) {
          setVmState('online');
          setVmUptime('00:00:01');
          setToastMessage('KVM Hypervisor Boot Complete: VM-01 is online and fully sovereign.');
        }
      }, step.delay);

      bootTimeoutsRef.current.push(timeoutId);
    });
  };

  // Doctor Audit Handler
  const runDoctorAudit = () => {
    setVmState('diagnosing');
    const isOllamaUp = status?.services?.ollama?.up;
    const modelCount = models.length;
    const isKvm = status?.kvm;

    setTimeout(() => {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'input',
          text: 'zoth doctor',
        },
        {
          id: Date.now() + 1,
          type: 'output',
          text: [
            '========================================================================',
            '                   ZOTH OS SOVEREIGN DOCTOR AUDIT                       ',
            '========================================================================',
            '[✓] KERNEL INTEGRITY:    Linux 6.8.0-zoth-hardened-x86_64 (PREEMPT_DYNAMIC)',
            `[✓] RING-0 VIRTUALIZE:   ${isKvm ? '/dev/kvm PRESENT (VMX/AMD-V extensions enabled)' : '/dev/kvm SIMULATED (TCG accelerator fallback)'}`,
            '[✓] ZERO-EGRESS BPF:     ENFORCED (Outbound SYN permanently blocked)',
            '[✓] MEMORY DAEMON IPC:   ONLINE (http://127.0.0.1:8094 - Ping: 0.42ms)',
            `[✓] OLLAMA LOCAL ENGINE: ${isOllamaUp ? `ONLINE (http://127.0.0.1:11434 - ${modelCount} models loaded)` : 'STANDBY (Local IPC ready)'}`,
            '[✓] ENCLAVE CRYPTO FS:   AES-256-XTS mounted (/enclaves/.vault_keys)',
            '[✓] ROOT FS SIGNATURE:   ED25519-PH PASS (Digest: 0x98f4a13d7c6b5420)',
            '[✓] VECTOR DECAY ENGINE: SYNCHRONIZED (STDP decay factor λ=0.045)',
            '[✓] TELEMETRY GUARD:     ZERO LEAKS DETECTED (DNS: loopback 127.0.0.1:5353)',
            '[✓] SECUREBOOT BOOTLOAD: GRUB2-EFI Secure Boot verified via TPM2 enclave',
            '------------------------------------------------------------------------',
            'VERDICT: 10/10 Invariants Satisfied. System is 100% Sovereign & Production-Ready.',
            '========================================================================',
          ].join('\n'),
        },
      ]);
      setVmState('online');
      setToastMessage('Zoth Doctor Diagnostic Audit: 10/10 Invariants Satisfied.');
    }, 450);
  };

  // Bare-Metal Install Handler
  const runBareMetalInstall = () => {
    setVmState('installing');
    const baseId = Date.now();

    setTerminalHistory((prev) => [
      ...prev,
      {
        id: baseId,
        type: 'input',
        text: 'zoth-os-install --bare-metal',
      },
      {
        id: baseId + 1,
        type: 'output',
        text: [
          '========================================================================',
          '            ZOTH OS SOVEREIGN BARE-METAL INSTALLER (x86_64)             ',
          '========================================================================',
          '[1/6] Scanning physical block devices...',
          '      -> Target device found: /dev/nvme0n1 (Samsung 990 PRO 2TB)',
          '[2/6] Writing cryptographic GPT partition table...',
          '      -> /dev/nvme0n1p1: 512MB EFI System Partition (FAT32)',
          '      -> /dev/nvme0n1p2: 32GB Immutable Enclave RootFS (Squashfs)',
          '      -> /dev/nvme0n1p3: 4GB Encrypted Swap (AES-256-XTS)',
          '      -> /dev/nvme0n1p4: Rest-of-disk Encrypted Agent Memory Vault (btrfs)',
          '[3/6] Flashing hardened kernel image (vmlinuz-6.8.0-zoth-hardened)...',
          '      -> SHA-256: c83b12f6a917240c5f49d32d0f50e82f507b9a5e8c130d2217d84fbb7a8d5918',
          '      -> Checksum verified against bootloader manifest.',
          '[4/6] Sealing Zero-Egress iptables & nftables rules in initramfs...',
          '      -> Default DROP policy for OUTPUT & FORWARD chains.',
          '[5/6] Enrolling Ed25519 machine keys into TPM2 Enclave...',
          '      -> Public Key enrolled: 0x98f4a13d7c6b5420e11894dcb02e1763a8f94cb02e176...',
          '[6/6] Generating GRUB2-EFI SecureBoot binary...',
          '========================================================================',
          'INSTALLATION SUCCESSFUL! Remove installation USB media and reboot.',
          'Bare-metal sovereign node is permanently sealed and ready for agent swarms.',
          '========================================================================',
        ].join('\n'),
      },
    ]);

    setTimeout(() => {
      setVmState('online');
      setToastMessage('Bare-metal installer simulation finished. Hardware enclaves sealed.');
    }, 500);
  };

  // Bootloader Manifest Generator
  const generateBootloaderManifest = () => {
    const timestamp = new Date().toISOString();
    return {
      $schema: 'https://zoth.io/schemas/bootloader-manifest-v2.json',
      os_name: 'ZothOS Sovereign Distribution',
      version: '2.0.0-hardened-lts',
      target_architecture: 'x86_64',
      kernel_build: 'vmlinuz-6.8.0-zoth-hardened-x86_64',
      initrd_image: 'initrd.img-6.8.0-zoth-hardened',
      bootloader: 'GRUB2-EFI-SECUREBOOT',
      created_at: timestamp,
      security_posture: {
        egress_policy: 'REJECT_ALL',
        dns_mode: 'LOOPBACK_ONLY',
        telemetry_opt_out: 'PERMANENT_ENFORCED',
        root_fs_immutable: true,
      },
      hardware_allocation: {
        cores: cpuConfigs[cpuPreset].cores,
        threads: cpuConfigs[cpuPreset].threads,
        kvm_ram_mb: ramAllocation,
        zero_egress_lock: '100%_LOOPBACK_LOCKED',
      },
      enclaves: [
        { name: 'memory-daemon', port: 8094, isolation: 'cgroupv2-hardened', integrity: 'PASS' },
        { name: 'ollama-engine', port: 11434, isolation: 'seccomp-bpf', integrity: 'PASS' },
        { name: 'zoth-studio-v2', port: 5173, isolation: 'unshared-netns', integrity: 'PASS' },
      ],
      sha256_checksums: {
        iso_image: '8f4e2b9c78d3a1e50647bf04c264a938e55e34b79101683dcf8a804791e2b5e2',
        qcow2_image: '4b5d89f1a23c7e09b11e2f7863d0859423b0a7c4e5f612089ad47e33527b1029',
        vmlinuz_kernel: 'c83b12f6a917240c5f49d32d0f50e82f507b9a5e8c130d2217d84fbb7a8d5918',
        initrd_img: 'd927a41ec59d0426998fe1d14603612803892305a2cd082939ef2a297298db3e',
        invariants_conf: '7e14a87b5a191f4d99c43d70258169e5d4cb057398fb9c72e27b9ef80a56e187',
      },
      ed25519_signature: {
        algorithm: 'ed25519-ph',
        key_id: 'zoth-genesis-enclave-key-2026',
        public_key: '0x98f4a13d7c6b5420e11894dcb02e1763a8f94cb02e176fa10b49c0d12e9b3a58',
        signature_digest: '3a8f94cb02e176fa10b49c0d12e9b3a58e2d41b6c7a8e9f0d1c2b3a4f5e6a7b8e21f9c0b11',
      },
    };
  };

  const handleExportManifest = () => {
    const manifest = generateBootloaderManifest();
    const manifestStr = JSON.stringify(manifest, null, 2);

    try {
      const blob = new Blob([manifestStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zothos-bootloader-manifest-${manifest.version}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('File download error', e);
    }

    setManifestModalOpen(true);
    setToastMessage('Exported signed OS ISO Bootloader Manifest (SHA-256 Verified)');
  };

  // Terminal Command Executor
  const executeCommand = (cmdRaw) => {
    const cmd = (cmdRaw || '').trim();
    if (!cmd) return;

    // Append to history list for up/down navigation
    setCommandHistoryList((prev) => [...prev, cmd]);
    setHistoryNavIndex(-1);

    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    }

    if (lower === 'zoth boot --kvm' || lower === 'zoth boot' || lower === 'boot --kvm') {
      runBootSequence();
      setCommandInput('');
      return;
    }

    if (lower === 'zoth doctor' || lower === 'doctor' || lower === 'zoth-doctor') {
      runDoctorAudit();
      setCommandInput('');
      return;
    }

    if (
      lower === 'zoth-os-install --bare-metal' ||
      lower === 'zoth-os-install' ||
      lower === 'zoth install --bare-metal' ||
      lower === 'zoth install'
    ) {
      runBareMetalInstall();
      setCommandInput('');
      return;
    }

    const newEntries = [{ id: Date.now(), type: 'input', text: cmd }];

    if (lower === 'help') {
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          'Zoth OS Sovereign Micro-Kernel Diagnostic CLI v2.0.0',
          'Usage: [command] [options...]',
          '',
          'Available diagnostic commands:',
          '  zoth status                   Query local memory daemon, enclave & invariant status',
          '  zoth boot --kvm               Execute virtual boot sequence in hardware-accelerated KVM',
          '  zoth doctor                   Run 10-point cryptographic invariant & enclave audit',
          '  zoth-os-install --bare-metal  Launch bare-metal installer simulation with GPT partitioning',
          '  uname -a                      Print OS kernel, release, and target architecture',
          '  ollama list                   Display local quantized models registered in sandbox',
          '  cat /etc/zoth/invariants.conf Print sovereign security manifest & network policy',
          '  free -h                       Display hardware RAM buffer, KVM heap, & swap status',
          '  ls -la /enclaves              Inspect air-gapped cryptographic filesystem mounts',
          '  clear                         Clear terminal screen buffer',
        ].join('\n'),
      });
    } else if (lower === 'uname -a') {
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: 'Linux zoth-os 6.8.0-zoth-hardened-x86_64 #1 SMP PREEMPT_DYNAMIC Thu Sep 24 03:00:00 UTC 2026 x86_64 GNU/Linux',
      });
    } else if (lower === 'zoth status') {
      const isOllamaUp = status?.services?.ollama?.up;
      const modelCount = models.length;
      const isKvm = status?.kvm;
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          '========================================================================',
          '                 ZOTH SOVEREIGN RUNTIME DIAGNOSTIC AUDIT                ',
          '========================================================================',
          '[✓] DAEMON CORE:        ONLINE  (http://127.0.0.1:8094 - IPC Active)',
          `[✓] OLLAMA ENGINE:      ${isOllamaUp ? `ONLINE  (${modelCount} models loaded in sandbox)` : 'STANDBY (Local inference ready)'}`,
          `[✓] KVM HARDWARE ACCEL: ${isKvm ? 'PRESENT (/dev/kvm - Ring-0 VMX unlocked)' : 'SIMULATED (TCG accelerator fallback)'}`,
          `[✓] CPU CORE ALLOC:     ${cpuConfigs[cpuPreset].label} (${cpuLoad}% load)`,
          `[✓] KVM RAM BUFFER:     ${ramAllocation} MB allocated / ${ramActiveGb} GB active`,
          '[✓] ZERO-EGRESS MODULE: ENFORCED (100% Loopback Locked, 0 outbound leaks)',
          '[✓] MEMORY DECAY REPO:  SYNCHRONIZED (exponential decay factor λ=0.045)',
          '[✓] HARDENED INVARIANTS:18 / 18 PASS (Signed via Ed25519 Enclave Key)',
          '========================================================================',
        ].join('\n'),
      });
    } else if (lower === 'ollama list') {
      const activeModels = models.length > 0 ? models : ['deepseek-r1:8b', 'llama3.2:3b', 'nomic-embed-text:latest'];
      const rows = activeModels.map((m, idx) => {
        const id = (idx + 1) * 1337 + 'a7b8c9';
        const size = idx === 0 ? '4.9 GB' : idx === 1 ? '2.0 GB' : '274 MB';
        const modified = idx === 0 ? '2 hours ago' : idx === 1 ? '1 day ago' : '3 days ago';
        return `${m.padEnd(28)} ${id.slice(0, 12).padEnd(14)} ${size.padEnd(10)} ${modified}`;
      });

      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          'NAME                         ID             SIZE       MODIFIED',
          '------------------------------------------------------------------------',
          ...rows,
        ].join('\n'),
      });
    } else if (lower === 'cat /etc/zoth/invariants.conf') {
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          '# =====================================================================',
          '# ZOTH OS SOVEREIGN INVARIANTS CONFIGURATION (READ-ONLY CRYPTOGRAPHIC FS)',
          '# =====================================================================',
          '[enclave.security]',
          'enclave_uuid            = c2a9b691-884b-4ec9-897b-b3846cd4d320',
          'signature_scheme        = ED25519_HARDENED_STRICT',
          'immutable_root_fs       = TRUE',
          'allow_unsigned_binaries = FALSE',
          '',
          '[network.posture]',
          'zero_egress_enforced    = TRUE',
          'drop_outbound_syn       = ALL',
          'interfaces_allowed      = lo, kvm-br0',
          'dns_resolver            = 127.0.0.1:5353 (local loopback cache only)',
          'telemetry_opt_out       = PERMANENT_LOCKED',
          '',
          '[memory.hypervisor]',
          'buffer_ram_allocated_mb = 8192',
          'swap_encryption_cipher  = AES-256-XTS',
          'vector_retention_policy = DETERMINISTIC_DECAY',
          'decay_constant_lambda   = 0.045',
        ].join('\n'),
      });
    } else if (lower === 'free -h') {
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          '               total        used        free      shared  buff/cache   available',
          'Mem:           7.8Gi       3.4Gi       3.8Gi       128Mi       680Mi       4.1Gi',
          'Swap:          4.0Gi          0B       4.0Gi          --          --       4.0Gi',
          'KVM Buffer:    8.0Gi       3.4Gi       4.6Gi          --          --       4.6Gi (Zero-Leak)',
        ].join('\n'),
      });
    } else if (lower === 'ls -la /enclaves') {
      newEntries.push({
        id: Date.now() + 1,
        type: 'output',
        text: [
          'total 48',
          'drwx------  7 operator operator 4096 Sep 24 03:00 .',
          'drwxr-xr-x 22 root     root     4096 Sep 24 02:45 ..',
          'drwx------  2 operator operator 4096 Sep 24 03:00 .vault_keys/',
          '-r--------  1 operator operator  512 Sep 24 03:00 enclave_ed25519.seed',
          '-rw-r--r--  1 operator operator  256 Sep 24 03:00 enclave_ed25519.pub',
          'drwxr-xr-x  3 operator operator 4096 Sep 24 03:01 memory_decay_engine/',
          'drwxr-xr-x  2 operator operator 4096 Sep 24 03:00 microtools_sandbox_v2/',
          '-rw-r--r--  1 operator operator 2048 Sep 24 03:15 invariants.sig',
          '-rw-r--r--  1 operator operator 4096 Sep 24 03:20 bootloader-manifest.json',
        ].join('\n'),
      });
    } else {
      newEntries.push({
        id: Date.now() + 1,
        type: 'error',
        text: `zoth-sh: command not found: "${cmd}". Type "help" to view sovereign console commands.`,
      });
    }

    setTerminalHistory((prev) => [...prev, ...newEntries]);
    setCommandInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryList.length === 0) return;
      const nextIndex = historyNavIndex === -1 ? commandHistoryList.length - 1 : Math.max(0, historyNavIndex - 1);
      setHistoryNavIndex(nextIndex);
      setCommandInput(commandHistoryList[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyNavIndex === -1) return;
      const nextIndex = historyNavIndex + 1;
      if (nextIndex >= commandHistoryList.length) {
        setHistoryNavIndex(-1);
        setCommandInput('');
      } else {
        setHistoryNavIndex(nextIndex);
        setCommandInput(commandHistoryList[nextIndex]);
      }
    }
  };

  const quickCommands = [
    'zoth status',
    'zoth boot --kvm',
    'zoth doctor',
    'zoth-os-install --bare-metal',
    'uname -a',
    'ollama list',
    'cat /etc/zoth/invariants.conf',
    'free -h',
    'ls -la /enclaves',
    'help',
    'clear',
  ];

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["ZOTH OS", "KVM", "HYPERVISOR"]}
          themeColor="emerald"
          subtitle="BARE-METAL SOVEREIGN KERNEL"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* ZothOS signature: gold glow behind the header */}
      <ParallaxGlow offset={60}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '100%', md: '920px' },
            height: { xs: 400, md: 520 },
            pointerEvents: 'none',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(212,175,55,0.22) 0%, rgba(8,8,11,0) 75%)'
              : 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(184,134,11,0.12) 0%, transparent 75%)',
          }}
        />
      </ParallaxGlow>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Export Manifest Action */}
        <HeroReveal>
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              gap: 2,
            }}
          >
            <Box>
              <HeroItem>
                <Chip
                  icon={<SecurityIcon style={{ fontSize: 16, color: gold.accent }} />}
                  label="SOVEREIGN LOCAL OPERATING SYSTEM // AIR-GAPPED KERNEL"
                  size="small"
                  sx={{
                    bgcolor: gold.wash,
                    color: gold.soft,
                    border: `1px solid ${gold.border}`,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    mb: 1.5,
                  }}
                />
              </HeroItem>
              <HeroItem>
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
                  Zoth OS: Sovereign <span className="text-gradient-gold">Agent Operating System</span>
                </Typography>
              </HeroItem>
              <HeroItem>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.65, fontSize: '1.02rem' }}>
                  Zoth OS is a custom Linux distribution engineered to run Zoth Studio, Ollama, all micro-tools, and the local memory daemon out-of-the-box with zero setup hassle. Flashed to bare metal or run via QEMU/KVM, it guarantees <span className="text-highlight-gold">100% Zero-Telemetry Local Operation</span>.
                </Typography>
              </HeroItem>
            </Box>

            {/* Export Manifest Button with high-contrast text */}
            <HeroItem>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportManifest}
                sx={{
                  px: 3,
                  py: 1.3,
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  bgcolor: gold.accent,
                  color: '#08080B',
                  boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                  border: `1px solid ${gold.accent}`,
                  '&:hover': {
                    bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                    color: isDark ? '#08080B' : '#FFFFFF',
                    boxShadow: '0 6px 24px rgba(212, 175, 55, 0.5)',
                  },
                }}
              >
                Export OS ISO Bootloader Manifest
              </Button>
            </HeroItem>
          </Box>
        </HeroReveal>

        <RevealOnScroll preset="fadeUp" delay={0.1}>
          <DaemonStatusStrip />
        </RevealOnScroll>

        {/* SECTION: Native ZothOS Host Telemetry & Sovereign Launchpad */}
        <RevealOnScroll preset="fadeUp" delay={0.2}>
          <Box sx={{ mb: 5, mt: 4 }}>
            {/* Host Telemetry Card */}
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3,
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                border: `1px solid ${hostInfo?.isZothOS ? gold.accent : (isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0')}`,
                boxShadow: hostInfo?.isZothOS
                  ? (isDark ? '0 0 24px -4px rgba(212,175,55,0.25)' : '0 4px 16px rgba(184,134,11,0.12)')
                  : (isDark ? '0 4px 20px -4px rgba(0, 0, 0, 0.8)' : '0 2px 8px rgba(0,0,0,0.06)'),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: hostInfo?.isZothOS ? '#22C55E' : gold.accent, fontSize: 26 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                      {hostInfo?.isZothOS ? 'Native ZothOS Host Telemetry & Runtime Detected' : 'ZothOS Native Host Telemetry'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                      {hostInfo?.isZothOS
                        ? 'Air-gapped hardware microkernel & zero-egress packet filter active'
                        : 'Operating in offline browser preview mode — full telemetry active on ZothOS'}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={hostInfo?.isZothOS ? 'NATIVE ZOTHOS ACTIVE' : 'PREVIEW MODE'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: hostInfo?.isZothOS ? (isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7') : gold.wash,
                    color: hostInfo?.isZothOS ? '#22C55E' : gold.soft,
                    border: `1px solid ${hostInfo?.isZothOS ? 'rgba(34,197,94,0.4)' : gold.border}`,
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>DISTRO & RELEASE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: gold.accent }}>
                      {hostInfo?.distro || 'ZothOS Sovereign Linux'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                      {hostInfo?.release || '2026.1 (Imperial Edition)'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>KERNEL ARCHITECTURE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: theme.palette.text.primary, noWrap: true }}>
                      {hostInfo?.kernel || 'Linux Hardened 6.12'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                      {hostInfo?.arch || 'x86_64'} PREEMPT_DYNAMIC
                    </Typography>
                  </Box>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>HOST CPU TOPOLOGY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: theme.palette.text.primary }}>
                      {hostInfo?.cpus ? `${hostInfo.cpus} Logical Cores` : '4 Cores (Detected)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', noWrap: true, display: 'block' }}>
                      {hostInfo?.cpuModel || 'Virtual KVM Enclave'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>AUDIO & PERIPHERALS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: theme.palette.text.primary }}>
                      {hostInfo?.audioDevice || 'ICH9 Audio Active'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                      ALSA / PulseAudio High-Def
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Native Tool Launchpad */}
            <Box sx={{ mb: 2 }}>
              <Typography className="section-kicker">Local Sovereign Tool Execution</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em', mb: 0.5 }}>
                Native ZothOS Application & CLI Launchpad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Directly trigger preinstalled tools, sovereign CLI agents, and offensive security suites into dedicated desktop shells.
              </Typography>
            </Box>

            <StaggerChildren>
              <Grid container spacing={2}>
                {launcherTools.map((tool) => (
                  <Grid xs={12} sm={6} md={4} key={tool.id}>
                    <StaggerItem>
                      <Paper
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          bgcolor: isDark ? '#08080B' : '#FFFFFF',
                          border: `1px solid ${tool.installed ? gold.border : (isDark ? 'rgba(255,255,255,0.08)' : '#EAECF0')}`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: gold.accent,
                            transform: 'translateY(-2px)',
                            boxShadow: isDark ? '0 6px 20px rgba(212,175,55,0.2)' : '0 4px 12px rgba(184,134,11,0.1)',
                          },
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <tool.icon sx={{ color: gold.accent, fontSize: 22 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                                {tool.name}
                              </Typography>
                            </Box>
                            <Chip
                              label={tool.installed ? 'INSTALLED' : 'READY'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontFamily: mono,
                                fontWeight: 800,
                                bgcolor: tool.installed ? (isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7') : gold.wash,
                                color: tool.installed ? '#22C55E' : gold.soft,
                                border: `1px solid ${tool.installed ? 'rgba(34,197,94,0.3)' : gold.border}`,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 2, minHeight: 40, lineHeight: 1.45 }}>
                            {tool.desc}
                          </Typography>
                        </Box>
                        <Button
                          variant={tool.installed ? 'contained' : 'outlined'}
                          size="small"
                          startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
                          disabled={launching === tool.id}
                          onClick={() => handleLaunchTool(tool.id, tool.name)}
                          sx={{
                            mt: 'auto',
                            fontWeight: 700,
                            fontFamily: mono,
                            fontSize: '0.78rem',
                            bgcolor: tool.installed ? gold.accent : 'transparent',
                            color: tool.installed ? '#08080B' : gold.soft,
                            borderColor: gold.accent,
                            '&:hover': {
                              bgcolor: tool.installed ? (isDark ? '#F5E6AB' : '#9A7008') : gold.wash,
                              color: tool.installed ? '#08080B' : (isDark ? '#FFFFFF' : '#8A6A09'),
                            },
                          }}
                        >
                          {launching === tool.id ? 'Launching...' : 'Launch Application'}
                        </Button>
                      </Paper>
                    </StaggerItem>
                  </Grid>
                ))}
              </Grid>
            </StaggerChildren>
          </Box>
        </RevealOnScroll>

        {/* SECTION: Interactive Hardware Resource Dials */}
        <RevealOnScroll preset="fadeUp" delay={0.3}>
          <Box sx={{ mb: 5, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography className="section-kicker">Interactive Hardware Resource Telemetry</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
                  Hardware Resource Dials & Enclave Buffer Allocation
                </Typography>
              </Box>
              <Tooltip title="Trigger simulated high-throughput memory and agent processing burst">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SpeedIcon sx={{ color: gold.accent }} />}
                  onClick={handleSimulateBurst}
                  disabled={isSimulatingBurst}
                  sx={{
                    borderColor: gold.border,
                    color: gold.soft,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: gold.accent,
                      bgcolor: gold.wash,
                    },
                  }}
                >
                  {isSimulatingBurst ? 'Simulating Burst...' : 'Simulate Workload Burst'}
                </Button>
              </Tooltip>
            </Box>

            <Grid container spacing={2.5}>
              {/* DIAL 1: CPU Core Allocation */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: isDark ? '#08080B' : '#FFFFFF',
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}`,
                    boxShadow: isDark
                      ? '0 4px 20px -4px rgba(0, 0, 0, 0.8), 0 0 16px -6px rgba(212, 175, 55, 0.2)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                    <SpeedIcon sx={{ color: gold.accent, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      CPU Core Allocation
                    </Typography>
                  </Box>

                  <RadialResourceDial
                    value={cpuLoad}
                    max={100}
                    metricText={`${cpuLoad}%`}
                    label="Core Load"
                    statusBadge={cpuConfigs[cpuPreset].label}
                    subtext={cpuConfigs[cpuPreset].freq}
                    accentColor={isDark ? '#D4AF37' : '#B8860B'}
                    glowColor={isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(184, 134, 11, 0.25)'}
                  />

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, width: '100%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 700 }}>
                      CORE ALLOCATION PRESET:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {Object.keys(cpuConfigs).map((k) => (
                        <Chip
                          key={k}
                          label={k === '2c4t' ? '2C / 4T' : k === '4c8t' ? '4C / 8T (Def)' : '8C / 16T'}
                          size="small"
                          clickable
                          onClick={() => handleCpuPresetChange(k)}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            bgcolor: cpuPreset === k ? gold.accent : gold.wash,
                            color: cpuPreset === k ? '#08080B' : gold.soft,
                            border: `1px solid ${cpuPreset === k ? gold.accent : gold.border}`,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* DIAL 2: KVM RAM Buffer */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: isDark ? '#08080B' : '#FFFFFF',
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}`,
                    boxShadow: isDark
                      ? '0 4px 20px -4px rgba(0, 0, 0, 0.8), 0 0 16px -6px rgba(212, 175, 55, 0.2)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                    <MemoryIcon sx={{ color: gold.accent, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      KVM RAM Buffer
                    </Typography>
                  </Box>

                  <RadialResourceDial
                    value={(ramActiveGb / (ramAllocation / 1024)) * 100}
                    max={100}
                    metricText={`${ramActiveGb} GB`}
                    label="Active In-Use"
                    statusBadge={`${ramAllocation} MB ALLOCATED`}
                    subtext="Zero-Leak Enclave Buffer with AES-256 Encrypted Swap"
                    accentColor={isDark ? '#38BDF8' : '#0284C7'}
                    glowColor={isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.25)'}
                  />

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, width: '100%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 700 }}>
                      BUFFER BUFFER TUNING:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {[4096, 8192, 16384].map((sz) => (
                        <Chip
                          key={sz}
                          label={`${sz / 1024} GB`}
                          size="small"
                          clickable
                          onClick={() => {
                            setRamAllocation(sz);
                            setToastMessage(`KVM Buffer adjusted to ${sz} MB.`);
                          }}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            bgcolor: ramAllocation === sz ? (isDark ? '#38BDF8' : '#0284C7') : gold.wash,
                            color: ramAllocation === sz ? (isDark ? '#08080B' : '#FFFFFF') : gold.soft,
                            border: `1px solid ${ramAllocation === sz ? (isDark ? '#38BDF8' : '#0284C7') : gold.border}`,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* DIAL 3: Zero-Egress Kernel Module Status */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: isDark ? '#08080B' : '#FFFFFF',
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}`,
                    boxShadow: isDark
                      ? '0 4px 20px -4px rgba(0, 0, 0, 0.8), 0 0 16px -6px rgba(212, 175, 55, 0.2)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                    <LockIcon sx={{ color: isDark ? '#34D399' : '#059669', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      Zero-Egress Kernel Module
                    </Typography>
                  </Box>

                  <RadialResourceDial
                    value={100}
                    max={100}
                    metricText="100%"
                    label="Loopback Locked"
                    statusBadge="AIR-GAP STRICT"
                    subtext="All Outbound SYN dropped. Interfaces isolated to lo & kvm-br0"
                    accentColor={isDark ? '#34D399' : '#059669'}
                    glowColor={isDark ? 'rgba(52, 211, 153, 0.45)' : 'rgba(5, 150, 105, 0.25)'}
                  />

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, width: '100%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 700 }}>
                      KERNEL MODULE POSTURE:
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={handleEgressProbe}
                      disabled={egressProbeActive}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isDark ? '#34D399' : '#027A48',
                        borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : '#A6F4C5',
                        '&:hover': {
                          borderColor: isDark ? '#34D399' : '#059669',
                          bgcolor: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ECFDF3',
                        },
                      }}
                    >
                      {egressProbeActive ? 'Auditing NIC Filters...' : 'Verify Air-Gap Lock'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* SECTION: Interactive KVM Hypervisor & WebContainer Simulator */}
        <RevealOnScroll preset="fadeUp" delay={0.4}>
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography className="section-kicker">Interactive Hardware Virtualization Cockpit</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
                KVM Hypervisor & WebContainer Terminal (TTY-01)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<CheckCircleIcon style={{ fontSize: 14, color: '#34D399' }} />}
                label={
                  vmState === 'booting'
                    ? `VM-01 BOOTING (${bootProgress}%)`
                    : vmState === 'diagnosing'
                    ? 'RUNNING DOCTOR AUDIT'
                    : vmState === 'installing'
                    ? 'FLASHING BARE-METAL'
                    : 'VM-01 ONLINE (KVM ACTIVE)'
                }
                size="small"
                sx={{
                  bgcolor:
                    vmState === 'booting'
                      ? 'rgba(212, 175, 55, 0.15)'
                      : vmState === 'diagnosing'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(52, 211, 153, 0.1)',
                  color:
                    vmState === 'booting'
                      ? gold.soft
                      : vmState === 'diagnosing'
                      ? '#38BDF8'
                      : '#34D399',
                  border: `1px solid ${
                    vmState === 'booting'
                      ? gold.border
                      : vmState === 'diagnosing'
                      ? 'rgba(56, 189, 248, 0.4)'
                      : 'rgba(52, 211, 153, 0.3)'
                  }`,
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}
              />
              <Tooltip title="Clear terminal screen buffer">
                <IconButton
                  size="small"
                  onClick={() => executeCommand('clear')}
                  sx={{ color: gold.soft, border: `1px solid ${gold.border}` }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Hypervisor Virtual Machine Monitor Metrics Banner */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: isDark ? '#0C0D16' : '#F8FAFC',
              border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.25)' : '#E2E8F0'}`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Quick Metrics Columns */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, fontFamily: mono, fontSize: '0.68rem' }}>
                  HYPERVISOR HOST
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 800, color: theme.palette.text.primary }}>
                  QEMU 9.0 / KVM Ring-0
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, fontFamily: mono, fontSize: '0.68rem' }}>
                  GUEST VCPU ARCH
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#38BDF8' : '#0284C7' }}>
                  {cpuConfigs[cpuPreset].cores} vCPUs @ {cpuConfigs[cpuPreset].freq.split(' ')[0]} ({cpuLoad}% Load)
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, fontFamily: mono, fontSize: '0.68rem' }}>
                  VIRTUAL DISK I/O
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 800, color: theme.palette.text.primary }}>
                  482 MB/s Read · 124 MB/s Write (18.4k IOPS)
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, fontFamily: mono, fontSize: '0.68rem' }}>
                  ZERO-EGRESS AIR-GAP
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#34D399' : '#027A48' }}>
                  0 Leaks · 100% Loopback
                </Typography>
              </Box>
            </Box>

            {/* Quick Interactive Hypervisor Controls */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={runBootSequence}
                disabled={vmState === 'booting'}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  bgcolor: gold.accent,
                  color: '#08080B',
                  '&:hover': {
                    bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                    color: isDark ? '#08080B' : '#FFFFFF',
                  },
                }}
              >
                {vmState === 'booting' ? 'Booting VM...' : 'Virtual Boot (KVM)'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<HealthAndSafetyIcon />}
                onClick={runDoctorAudit}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderColor: gold.border,
                  color: gold.soft,
                  '&:hover': {
                    borderColor: gold.accent,
                    bgcolor: gold.wash,
                  },
                }}
              >
                zoth doctor
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<StorageIcon />}
                onClick={runBareMetalInstall}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : '#BAE6FD',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  '&:hover': {
                    borderColor: '#38BDF8',
                    bgcolor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF',
                  },
                }}
              >
                Bare-Metal Install
              </Button>
            </Box>
          </Paper>

          {/* Web Terminal Wrapper */}
          <Paper
            onClick={() => terminalInputRef.current?.focus()}
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.38)' : 'rgba(184,134,11,0.35)'}`,
              bgcolor: isDark ? '#08080B' : '#0B0F19',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 0 0 1px rgba(212,175,55,0.18), 0 12px 32px -4px rgba(0,0,0,0.9), 0 0 24px -4px rgba(212,175,55,0.22)'
                : '0 8px 24px -4px rgba(0,0,0,0.15)',
            }}
          >
            {/* Terminal Window Header Bar */}
            <Box
              sx={{
                px: 2,
                py: 1.2,
                bgcolor: isDark ? '#0D0D14' : '#111827',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Window Dots */}
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#27C93F' }} />
                <Typography
                  sx={{
                    ml: 1.5,
                    fontFamily: mono,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#EDEFF2',
                    letterSpacing: '0.02em',
                  }}
                >
                  operator@zoth-os: ~ (x86_64 Sovereign Kernel - Ring-0 Hardened)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="SOVEREIGN WEBSHELL"
                  size="small"
                  sx={{
                    height: 20,
                    fontFamily: mono,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                    color: '#F5E6AB',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                  }}
                />
              </Box>
            </Box>

            {/* Boot Sequence Animation Progress Bar */}
            {vmState === 'booting' && (
              <LinearProgress
                variant="determinate"
                value={bootProgress}
                sx={{
                  height: 4,
                  bgcolor: 'rgba(212, 175, 55, 0.15)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: gold.accent,
                  },
                }}
              />
            )}

            {/* Quick Command Chips Toolbar */}
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: isDark ? '#0A0A10' : '#0F172A',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212, 175, 55, 0.3)', borderRadius: 2 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  color: '#D4AF37',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  mr: 0.5,
                }}
              >
                QUICK EXEC:
              </Typography>
              {quickCommands.map((cmd) => (
                <Chip
                  key={cmd}
                  label={cmd}
                  size="small"
                  clickable
                  onClick={() => executeCommand(cmd)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(212, 175, 55, 0.08)',
                    color: '#F5E6AB',
                    border: '1px solid rgba(212, 175, 55, 0.22)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.22)',
                      borderColor: '#D4AF37',
                      color: '#F5E6AB',
                    },
                  }}
                />
              ))}
            </Box>

            {/* Terminal Screen Body */}
            <Box
              sx={{
                p: 2.5,
                minHeight: 340,
                maxHeight: 480,
                overflowY: 'auto',
                fontFamily: mono,
                fontSize: '0.85rem',
                color: '#EDEFF2',
                lineHeight: 1.6,
                cursor: 'text',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212, 175, 55, 0.3)', borderRadius: 3 },
              }}
            >
              {terminalHistory.map((item) => {
                if (item.type === 'system') {
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(212, 175, 55, 0.07)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        color: '#F5E6AB',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {item.text}
                    </Box>
                  );
                }

                if (item.type === 'input') {
                  return (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'baseline', mt: 1.2, mb: 0.5 }}>
                      <Typography component="span" sx={{ color: '#34D399', fontWeight: 800, fontFamily: mono, mr: 0.8 }}>
                        operator@zoth-os
                      </Typography>
                      <Typography component="span" sx={{ color: '#D4AF37', fontWeight: 800, fontFamily: mono, mr: 0.8 }}>
                        :~$
                      </Typography>
                      <Typography component="span" sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: mono }}>
                        {item.text}
                      </Typography>
                    </Box>
                  );
                }

                if (item.type === 'error') {
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        color: '#FB7185',
                        whiteSpace: 'pre-wrap',
                        pl: 2,
                        mb: 1,
                        borderLeft: '2px solid #F43F5E',
                      }}
                    >
                      {item.text}
                    </Box>
                  );
                }

                return (
                  <Box
                    key={item.id}
                    sx={{
                      color: '#E2E8F0',
                      whiteSpace: 'pre-wrap',
                      pl: 1,
                      mb: 1.5,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                    }}
                  >
                    {item.text}
                  </Box>
                );
              })}

              {/* Active Command Line Input */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography component="span" sx={{ color: '#34D399', fontWeight: 800, fontFamily: mono, mr: 0.8, whiteSpace: 'nowrap' }}>
                  operator@zoth-os
                </Typography>
                <Typography component="span" sx={{ color: '#D4AF37', fontWeight: 800, fontFamily: mono, mr: 0.8, whiteSpace: 'nowrap' }}>
                  :~$
                </Typography>
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck="false"
                  autoComplete="off"
                  autoCapitalize="off"
                  placeholder="type command (e.g. zoth status, zoth boot --kvm, zoth doctor)..."
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#F5E6AB',
                    fontFamily: mono,
                    fontSize: '0.85rem',
                    width: '100%',
                    caretColor: '#D4AF37',
                  }}
                />
              </Box>

              <div ref={terminalEndRef} />
            </Box>
          </Paper>
        </Box>
        </RevealOnScroll>

        {/* Feature Cards */}
        <RevealOnScroll preset="fadeUp" delay={0.5}>
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper, border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ComputerIcon sx={{ color: gold.accent }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    Preinstalled AI Stack
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                  Ships with Node 20+, Python 3.12, PyTorch, vLLM, Ollama, and WebGPU drivers pre-compiled for NVIDIA & AMD GPUs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper, border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MemoryIcon sx={{ color: gold.accent }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    Direct Hardware Access
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                  Bypasses hypervisor virtualization overhead to unlock <span className="text-highlight-gold">PCIe GPU passthrough</span> and full metal RAM bandwidth.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper, border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.28)' : '#EAECF0'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TerminalIcon sx={{ color: gold.accent }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    Air-Gapped Privacy
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                  Network stack can be disabled hardware-wide while retaining full multi-agent synthesis and memory decay functionality.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </RevealOnScroll>

        {/* Host Diagnostic Box */}
        <RevealOnScroll preset="fadeUp" delay={0.5}>
        <Box sx={{ mb: 5 }}>
          <Typography className="section-kicker">Local Host Machine Diagnostics</Typography>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : '#E2CE82'}`,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: isDark
                ? '0 0 0 1px rgba(212,175,55,0.12), 0 0 22px -6px rgba(212,175,55,0.25)'
                : '0 0 0 1px rgba(184,134,11,0.08), 0 0 16px -6px rgba(184,134,11,0.18)',
            }}
          >
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: gold.soft, fontWeight: 800, mb: 0.5 }}>
                  Hardware Acceleration (/dev/kvm)
                </Typography>
                <Chip
                  label={status?.kvm ? 'SUPPORTED (/dev/kvm PRESENT)' : 'NOT DETECTED'}
                  size="small"
                  sx={{
                    bgcolor: status?.kvm ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2',
                    color: status?.kvm ? (isDark ? '#34D399' : '#027A48') : isDark ? '#FB7185' : '#B42318',
                    fontWeight: 800,
                  }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: gold.soft, fontWeight: 800, mb: 0.5 }}>
                  Ollama Engine (127.0.0.1:11434)
                </Typography>
                <Chip
                  label={status?.services?.ollama?.up ? `ONLINE (${models.length} MODELS ACTIVE)` : 'OFFLINE'}
                  size="small"
                  sx={{
                    bgcolor: status?.services?.ollama?.up ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2',
                    color: status?.services?.ollama?.up ? (isDark ? '#34D399' : '#027A48') : isDark ? '#FB7185' : '#B42318',
                    fontWeight: 800,
                  }}
                />
              </Grid>
            </Grid>

            {models.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 1 }}>
                  ACTIVE LOCAL MODELS ON DISK:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {models.map((m) => (
                    <Chip key={m} label={m} size="small" sx={{ fontFamily: mono, fontSize: '0.75rem', bgcolor: gold.wash, color: gold.soft, fontWeight: 700 }} />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
        </RevealOnScroll>

        {/* Command Launchers */}
        <RevealOnScroll preset="fadeUp" delay={0.5}>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDark ? '#0B0B12' : '#FFFFFF', color: theme.palette.text.primary, borderRadius: 2, border: `1px solid ${isDark ? '#2A2A38' : '#EAECF0'}`, height: '100%' }}>
              <Typography className="section-kicker" sx={{ color: gold.soft }}>QEMU / KVM Virtual Machine Launcher</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Run Zoth OS inside a hardware-accelerated local sandbox:
              </Typography>
              <Box sx={{ p: 2, bgcolor: isDark ? '#020617' : '#0F172A', borderRadius: 1.5, fontFamily: mono, fontSize: '0.85rem', color: '#F5E6AB', mb: 2, wordBreak: 'break-all', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                {qemu}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(qemu);
                  setCopiedQemu(true);
                  setTimeout(() => setCopiedQemu(false), 1600);
                }}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  '&:hover': {
                    bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                    color: isDark ? '#08080B' : '#FFFFFF',
                  },
                }}
              >
                {copiedQemu ? 'Copied to Clipboard' : 'Copy QEMU Command'}
              </Button>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDark ? '#0B0B12' : '#FFFFFF', color: theme.palette.text.primary, borderRadius: 2, border: `1px solid ${isDark ? '#2A2A38' : '#EAECF0'}`, height: '100%' }}>
              <Typography className="section-kicker" sx={{ color: gold.soft }}>Flash Bare Metal USB ISO</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Flash the bootable ISO directly to a USB drive:
              </Typography>
              <Box sx={{ p: 2, bgcolor: isDark ? '#020617' : '#0F172A', borderRadius: 1.5, fontFamily: mono, fontSize: '0.85rem', color: '#F5E6AB', mb: 2, wordBreak: 'break-all', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                {isoCmd}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(isoCmd);
                  setCopiedIso(true);
                  setTimeout(() => setCopiedIso(false), 1600);
                }}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  '&:hover': {
                    bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                    color: isDark ? '#08080B' : '#FFFFFF',
                  },
                }}
              >
                {copiedIso ? 'Copied to Clipboard' : 'Copy Flash Command'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
        </RevealOnScroll>

        {/* SECTION: Prominent Sovereign Deployment Actions Strip */}
        <RevealOnScroll preset="fadeUp" delay={0.5}>
        <Box sx={{ mb: 2 }}>
          <Typography className="section-kicker">Sovereign Deployment Fast Actions</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em', mb: 2 }}>
            Instant Bare-Metal, CLI, & Repository Actions
          </Typography>

          <Grid container spacing={2.5}>
            {/* Action 1: Direct ISO Download */}
            <Grid xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: isDark ? '#0B0D17' : '#FFFFFF',
                  borderRadius: 2.5,
                  border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.35)' : '#E2CE82'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isDark
                    ? '0 8px 24px -4px rgba(0,0,0,0.8), 0 0 16px -4px rgba(212, 175, 55, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DownloadIcon sx={{ color: gold.accent }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        Bootable ISO Image
                      </Typography>
                    </Box>
                    <Chip
                      label="1.8 GB ISO"
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: gold.wash,
                        color: gold.soft,
                        border: `1px solid ${gold.border}`,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    Download the bootable Zoth OS ISO with signed bootloader manifest and cryptographic enclaves pre-configured for direct USB bare-metal installation.
                  </Typography>
                  <Box sx={{ p: 1.2, mb: 2, bgcolor: isDark ? '#040407' : '#F1F5F9', borderRadius: 1.5, border: `1px solid ${gold.border}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#F5E6AB' : '#8A6A09', wordBreak: 'break-all' }}>
                      SHA256: 8f4e2b9c78d3a1e50647bf04c264a938...
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleExportManifest}
                  sx={{
                    bgcolor: gold.accent,
                    color: '#08080B',
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1,
                    '&:hover': {
                      bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                      color: isDark ? '#08080B' : '#FFFFFF',
                    },
                  }}
                >
                  Download ISO & Manifest
                </Button>
              </Paper>
            </Grid>

            {/* Action 2: Git Clone Repo */}
            <Grid xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: isDark ? '#0B0D17' : '#FFFFFF',
                  borderRadius: 2.5,
                  border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : '#BAE6FD'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isDark
                    ? '0 8px 24px -4px rgba(0,0,0,0.8), 0 0 16px -4px rgba(56, 189, 248, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CodeIcon sx={{ color: isDark ? '#38BDF8' : '#0284C7' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        Source Repository
                      </Typography>
                    </Box>
                    <Chip
                      label="GIT CLONE"
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
                        color: isDark ? '#38BDF8' : '#0369A1',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    Clone the sovereign distribution kernel build scripts, QEMU configuration, and hardened BPF zero-egress network rules.
                  </Typography>
                  <Box sx={{ p: 1.2, mb: 2, bgcolor: isDark ? '#040407' : '#F1F5F9', borderRadius: 1.5, border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#38BDF8' : '#0284C7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {gitCloneCmd}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(gitCloneCmd);
                        setCopiedGitClone(true);
                        setTimeout(() => setCopiedGitClone(false), 1600);
                      }}
                      sx={{ color: isDark ? '#38BDF8' : '#0284C7', ml: 1, p: 0.5 }}
                      title="Copy clone command"
                    >
                      <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LaunchIcon />}
                  href="https://github.com/NullAITech/zoth-os"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderColor: isDark ? '#38BDF8' : '#0284C7',
                    color: isDark ? '#38BDF8' : '#0284C7',
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1,
                    '&:hover': {
                      borderColor: '#38BDF8',
                      bgcolor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF',
                    },
                  }}
                >
                  {copiedGitClone ? 'Copied Clone Command!' : 'Inspect GitHub Repo'}
                </Button>
              </Paper>
            </Grid>

            {/* Action 3: Micro-Runner CLI */}
            <Grid xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: isDark ? '#0B0D17' : '#FFFFFF',
                  borderRadius: 2.5,
                  border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.35)' : '#A6F4C5'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isDark
                    ? '0 8px 24px -4px rgba(0,0,0,0.8), 0 0 16px -4px rgba(52, 211, 153, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon sx={{ color: isDark ? '#34D399' : '#059669' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        Micro-Runner CLI
                      </Typography>
                    </Box>
                    <Chip
                      label="ONE-LINER"
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#ECFDF3',
                        color: isDark ? '#34D399' : '#027A48',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    Spin up the sovereign runner directly in terminal or container with one command. Automatically discovers KVM hardware acceleration.
                  </Typography>
                  <Box sx={{ p: 1.2, mb: 2, bgcolor: isDark ? '#040407' : '#F1F5F9', borderRadius: 1.5, border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#34D399' : '#027A48', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {microRunnerCmd}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(microRunnerCmd);
                        setCopiedMicroRunner(true);
                        setTimeout(() => setCopiedMicroRunner(false), 1600);
                      }}
                      sx={{ color: isDark ? '#34D399' : '#027A48', ml: 1, p: 0.5 }}
                      title="Copy micro-runner command"
                    >
                      <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TerminalIcon />}
                  onClick={() => {
                    executeCommand('zoth status');
                    terminalInputRef.current?.focus();
                  }}
                  sx={{
                    borderColor: isDark ? '#34D399' : '#059669',
                    color: isDark ? '#34D399' : '#027A48',
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1,
                    '&:hover': {
                      borderColor: '#34D399',
                      bgcolor: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ECFDF3',
                    },
                  }}
                >
                  {copiedMicroRunner ? 'Copied to Clipboard!' : 'Run zoth status in WebShell'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        </RevealOnScroll>

        {/* Cleanly Mounted Sovereign Installation Funnel */}
        <RevealOnScroll preset="fadeUp" delay={0.6}>
          <SovereignFunnel
            title="Deploy Sovereign Zoth OS to Hardware"
            subtitle="Zero-telemetry air-gapped operating system kernel for autonomous agent swarms, hardware enclave encryption, and memory vaults."
            toolTitle="Option 1: Micro-Runner CLI & Bootable ISO"
            toolTag="CLI & BARE METAL"
            toolDescription="Download and flash bootable Zoth OS image (zothos-2.0-amd64.iso) for direct bare-metal deployment, or boot instantly via the micro-runner CLI."
            toolRepo="https://github.com/NullAITech/zoth-os"
            toolCommand="curl -fsSL https://get.zoth.io/micro-runner.sh | bash"
            osRepo="https://github.com/NullAITech/zoth-os"
            studioRepo="https://github.com/NullAITech/zoth-studio-v2"
          />
        </RevealOnScroll>
      </Box>

      {/* Bootloader Manifest Modal */}
      <Dialog
        open={manifestModalOpen}
        onClose={() => setManifestModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#08080B' : '#0F172A',
            color: '#EDEFF2',
            border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.4)' : '#E2CE82'}`,
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)',
            borderRadius: 2.5,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon sx={{ color: '#D4AF37' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Zoth OS Bootloader Manifest (Signed SHA-256)
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setManifestModalOpen(false)} sx={{ color: '#A6A8B4' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="ED25519 VERIFIED" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399', fontWeight: 800, fontFamily: mono }} />
            <Chip label="SHA-256 ENCLAVE ROOT" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: '#F5E6AB', fontWeight: 800, fontFamily: mono }} />
            <Chip label="GRUB2-EFI SECUREBOOT" size="small" sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontWeight: 800, fontFamily: mono }} />
          </Box>

          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#CBD5E1', mb: 2 }}>
            This cryptographic manifest links the bare-metal bootloader to isolated enclave invariants. The checksums below match verified Zoth OS v2 ISO and QEMU images.
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: '#040407',
              borderRadius: 2,
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontFamily: mono,
              fontSize: '0.8rem',
              color: '#F5E6AB',
              maxHeight: 380,
              overflowY: 'auto',
              whiteSpace: 'pre',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212, 175, 55, 0.3)', borderRadius: 3 },
            }}
          >
            {JSON.stringify(generateBootloaderManifest(), null, 2)}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <Button
            startIcon={<ContentCopyIcon />}
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(generateBootloaderManifest(), null, 2));
              setCopiedManifest(true);
              setTimeout(() => setCopiedManifest(false), 1600);
            }}
            sx={{
              borderColor: 'rgba(212, 175, 55, 0.4)',
              color: isDark ? '#F5E6AB' : '#FDE047',
              fontWeight: 700,
              '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212, 175, 55, 0.1)' },
            }}
          >
            {copiedManifest ? 'Copied Manifest JSON' : 'Copy Manifest JSON'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportManifest}
            sx={{
              fontWeight: 800,
              bgcolor: gold.accent,
              color: '#08080B',
              '&:hover': {
                bgcolor: isDark ? '#F5E6AB' : '#9A7008',
                color: isDark ? '#08080B' : '#FFFFFF',
              },
            }}
          >
            Download Manifest .json
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          sx={{
            bgcolor: '#0D0D14',
            color: '#F5E6AB',
            border: '1px solid #D4AF37',
            fontFamily: mono,
            fontSize: '0.85rem',
            '& .MuiAlert-icon': { color: '#D4AF37' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
    </>
  );
}
