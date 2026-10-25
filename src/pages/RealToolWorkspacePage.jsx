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
import SpeedIcon from '@mui/icons-material/Speed';

import { microTools } from '../data/toolsData';
import ToolOfferLine from '../components/ToolOfferLine';
import { getToolDocumentation } from '../data/toolsDocumentation';
import SovereignFunnel from '../components/SovereignFunnel';
import AirGapToolLockout from '../components/AirGapToolLockout';
import WebMCPConsole from '../components/WebMCPConsole';
import WebGPUToolWorkstation from '../components/tools/WebGPUToolWorkstation';
import JwtInspectorGodModeTool from '../components/tools/JwtInspectorGodModeTool';
import PayloadEntropyGodModeTool from '../components/tools/PayloadEntropyGodModeTool';
import GhidraMcpGodModeTool from '../components/tools/GhidraMcpGodModeTool';
import RegexDroidGodModeTool from '../components/tools/RegexDroidGodModeTool';
import PolyglotStudioGodModeTool from '../components/tools/PolyglotStudioGodModeTool';
import RobotsTxtAuditorGodModeTool from '../components/tools/RobotsTxtAuditorGodModeTool';
import PwaManifestBuilderGodModeTool from '../components/tools/PwaManifestBuilderGodModeTool';
import SchemaIllustratorGodModeTool from '../components/tools/SchemaIllustratorGodModeTool';
import CertPathRoadmapGodModeTool from '../components/tools/CertPathRoadmapGodModeTool';
import Badge3dCoinGodModeTool from '../components/tools/Badge3dCoinGodModeTool';
import McpLensGodModeTool from '../components/tools/McpLensGodModeTool';
import CwvSpeedEngineGodModeTool from '../components/tools/CwvSpeedEngineGodModeTool';
import OmniPostSocialGodModeTool from '../components/tools/OmniPostSocialGodModeTool';
import DeepSearchGodModeTool from '../components/tools/DeepSearchGodModeTool';
import PromptMasterGodModeTool from '../components/tools/PromptMasterGodModeTool';
import VectorSearchGodModeTool from '../components/tools/VectorSearchGodModeTool';
import ZothOSGodModeTool from '../components/tools/ZothOSGodModeTool';
import AgentCapsuleJailGodModeTool from '../components/tools/AgentCapsuleJailGodModeTool';
import AgentGodsEyeGodModeTool from '../components/tools/AgentGodsEyeGodModeTool';
import AgentMockTwinGodModeTool from '../components/tools/AgentMockTwinGodModeTool';
import AgentPolicyAuditorGodModeTool from '../components/tools/AgentPolicyAuditorGodModeTool';
import AudioCipherGodModeTool from '../components/tools/AudioCipherGodModeTool';
import CronRhythmGodModeTool from '../components/tools/CronRhythmGodModeTool';
import EnvGuardVaultGodModeTool from '../components/tools/EnvGuardVaultGodModeTool';
import HexStrikeGodModeTool from '../components/tools/HexStrikeGodModeTool';
import SubSweepGodModeTool from '../components/tools/SubSweepGodModeTool';
import WebSecurityGuardGodModeTool from '../components/tools/WebSecurityGuardGodModeTool';
import AeoGraphEngineGodModeTool from '../components/tools/AeoGraphEngineGodModeTool';
import NeuroMemoryGodModeTool from '../components/tools/NeuroMemoryGodModeTool';
import SovereignBridgeGodModeTool from '../components/tools/SovereignBridgeGodModeTool';
import AgentEgressSentinelGodModeTool from '../components/tools/AgentEgressSentinelGodModeTool';
import AgentPromptFirewallGodModeTool from '../components/tools/AgentPromptFirewallGodModeTool';
import AgentFlightRecorderGodModeTool from '../components/tools/AgentFlightRecorderGodModeTool';
import AgentBudgetSentinelGodModeTool from '../components/tools/AgentBudgetSentinelGodModeTool';
import PodCommerceGodModeTool from '../components/tools/PodCommerceGodModeTool';
import AsciiMotionGodModeTool from '../components/tools/AsciiMotionGodModeTool';
import AdytumPlannerGodModeTool from '../components/tools/AdytumPlannerGodModeTool';
import AzothArchonGodModeTool from '../components/tools/AzothArchonGodModeTool';
import AgentVoiceCallGodModeTool from '../components/tools/AgentVoiceCallGodModeTool';
import ZothFoundryGodModeTool from '../components/tools/ZothFoundryGodModeTool';
import ZothBoltGodModeTool from '../components/tools/ZothBoltGodModeTool';
import WebMcpInspectorGodModeTool from '../components/tools/WebMcpInspectorGodModeTool';
import YaraSigmaForgeGodModeTool from '../components/tools/YaraSigmaForgeGodModeTool';
import RealityShaderForgeGodModeTool from '../components/tools/RealityShaderForgeGodModeTool';
import AttackSurfaceSentinelGodModeTool from '../components/tools/AttackSurfaceSentinelGodModeTool';
import VisionKinematicsGodModeTool from '../components/tools/VisionKinematicsGodModeTool';
import SwarmCivilizationGodModeTool from '../components/tools/SwarmCivilizationGodModeTool';
import CivicProcurementGodModeTool from '../components/tools/CivicProcurementGodModeTool';
import ToolMotionShowcase, { getCategoryMotionMeta } from '../components/tools/ToolMotionShowcase';
import {
  HeroReveal,
  HeroItem,
  GlowLine,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
} from '../components/MotionReveal';
import { useSovereignRuntime } from '../utils/sovereignRuntime';
import { useReality } from '../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const ENCLAVE_TOOL_COMPONENTS = {
  'zoth-os': ZothOSGodModeTool,
  'badge3d-coin-generator': Badge3dCoinGodModeTool,
  'badge3d-coin': Badge3dCoinGodModeTool,
  'certpath-roadmap-studio': CertPathRoadmapGodModeTool,
  'certpath-roadmap': CertPathRoadmapGodModeTool,
  'schema-illustrator-studio': SchemaIllustratorGodModeTool,
  'schema-illustrator': SchemaIllustratorGodModeTool,
  'robots-txt-auditor': RobotsTxtAuditorGodModeTool,
  'robots-txt': RobotsTxtAuditorGodModeTool,
  'pwa-manifest-builder': PwaManifestBuilderGodModeTool,
  'pwa-manifest': PwaManifestBuilderGodModeTool,
  'polyglot-framework-exporter': PolyglotStudioGodModeTool,
  'polyglot-studio': PolyglotStudioGodModeTool,
  'regex-droid-builder': RegexDroidGodModeTool,
  'regex-droid': RegexDroidGodModeTool,
  'jwt-inspector-guard': JwtInspectorGodModeTool,
  'jwt-inspector': JwtInspectorGodModeTool,
  'payload-entropy-studio': PayloadEntropyGodModeTool,
  'payload-entropy': PayloadEntropyGodModeTool,
  'ghidra-mcp-bridge': GhidraMcpGodModeTool,
  'ghidra-mcp': GhidraMcpGodModeTool,
  'shodan-surface-sentinel': AttackSurfaceSentinelGodModeTool,
  'shodan-sentinel': AttackSurfaceSentinelGodModeTool,
  'adytum-alchemist-ai-workflow': AdytumPlannerGodModeTool,
  'azoth-archon-orchestrator': AzothArchonGodModeTool,
  'azoth-local-agent': AzothArchonGodModeTool,
  'sovereign-bridge-protocol': SovereignBridgeGodModeTool,
  'sovereign-agent-bridge': SovereignBridgeGodModeTool,
  'neuro-memory-service': NeuroMemoryGodModeTool,
  'neuro-memory-daemon': NeuroMemoryGodModeTool,
  'agent-egress-sentinel': AgentEgressSentinelGodModeTool,
  'agent-mock-twin': AgentMockTwinGodModeTool,
  'agent-prompt-firewall': AgentPromptFirewallGodModeTool,
  'agent-flight-recorder': AgentFlightRecorderGodModeTool,
  'agent-capsule-jail': AgentCapsuleJailGodModeTool,
  'agent-policy-auditor': AgentPolicyAuditorGodModeTool,
  'vector-search-engine': VectorSearchGodModeTool,
  'deepsearch-research-agent': DeepSearchGodModeTool,
  'prompt-master-optimizer': PromptMasterGodModeTool,
  'promptmaster-studio': PromptMasterGodModeTool,
  'hexstrike-tactical-terminal': HexStrikeGodModeTool,
  'hexstrike-arsenal': HexStrikeGodModeTool,
  'envguard-secrets-vault': EnvGuardVaultGodModeTool,
  'web-security-guard': WebSecurityGuardGodModeTool,
  'audiocipher-stego-vault': AudioCipherGodModeTool,
  'audiocipher-stego-engine': AudioCipherGodModeTool,
  'aeo-graph-engine': AeoGraphEngineGodModeTool,
  'cwv-speed-engine': CwvSpeedEngineGodModeTool,
  'subsweep-lead-scanner': SubSweepGodModeTool,
  'omnipost-social-engine': OmniPostSocialGodModeTool,
  'cron-rhythm-studio': CronRhythmGodModeTool,
  'printify-connector': PodCommerceGodModeTool,
  'gelato-connector': PodCommerceGodModeTool,
  'etsy-connector': PodCommerceGodModeTool,
  'shopify-connector': PodCommerceGodModeTool,
  'etsy-pod-forge': PodCommerceGodModeTool,
  'pod-smart-router': PodCommerceGodModeTool,
  'digital-asset-forge': PodCommerceGodModeTool,
  'pod-mockup-forge': PodCommerceGodModeTool,
  'pod-margin-sentinel': PodCommerceGodModeTool,
  'agent-voice-call': AgentVoiceCallGodModeTool,
  'mcp-lens': McpLensGodModeTool,
  'agent-budget-sentinel': AgentBudgetSentinelGodModeTool,
  'agent-gods-eye': AgentGodsEyeGodModeTool,
  'zoth-webgen': ZothFoundryGodModeTool,
  'zoth-swarm-multiplexer': SwarmCivilizationGodModeTool,
  'zoth-civilization': SwarmCivilizationGodModeTool,
  'likeness-desk': VisionKinematicsGodModeTool,
  'bolt.diy': ZothBoltGodModeTool,
  'bolt-diy': ZothBoltGodModeTool,
  'zoth-bolt': ZothBoltGodModeTool,
  'producthunt-connector': CivicProcurementGodModeTool,
  'zoth-ph': CivicProcurementGodModeTool,
  'zoth-relay': SovereignBridgeGodModeTool,
  'zela-glasses-guide': VisionKinematicsGodModeTool,
  'zoth-bot': AzothArchonGodModeTool,
  'zoth-bounty': AttackSurfaceSentinelGodModeTool,
  'zoth-scene-foundry': AsciiMotionGodModeTool,

  'vision-gesture-control': VisionKinematicsGodModeTool,
  'datamosh-glitch-studio': AsciiMotionGodModeTool,
  'nexus-3d-scene-studio': AsciiMotionGodModeTool,
  'ufo-sacred-geometry': AsciiMotionGodModeTool,
  'cyber-turtle-studio': AsciiMotionGodModeTool,
  'og-canvas-forge': AsciiMotionGodModeTool,
  'zoth-ascii-magic': AsciiMotionGodModeTool,
  'webmcp-protocol-inspector': WebMcpInspectorGodModeTool,
  'yara-sigma-forge': YaraSigmaForgeGodModeTool,
  'reality-shader-forge': RealityShaderForgeGodModeTool,
  'anderson-security-sentinel': AttackSurfaceSentinelGodModeTool,
  'city-desk': CivicProcurementGodModeTool,
  'osint-scout-skill': SubSweepGodModeTool,
  'storefront-catalog': PodCommerceGodModeTool,
};

export default function RealToolWorkspacePage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [unlockedPreview, setUnlockedPreview] = useState(false);

  const { isLocal, hasWebGPU, evaluateTool } = useSovereignRuntime();
  const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
  const docs = getToolDocumentation(tool);
  const execEval = evaluateTool(tool);
  const canRunClientSide = execEval.canExecute;
  const EnclaveToolComponent = ENCLAVE_TOOL_COMPONENTS[tool?.id];
  // Tools with dedicated 60fps in-browser God-Mode workstations or WebGPU/WASM engines are immediately interactive!
  const isLocked = !isLocal && !canRunClientSide && !unlockedPreview && !EnclaveToolComponent;
  const { reality } = useReality();

  const gold = {
    accent: isDark ? reality.accent : reality.accentLightMode,
    soft: isDark ? reality.accentSoft : reality.accentLightMode,
    wash: isDark ? reality.accentWash : '#FEF9E7',
    border: isDark ? reality.accentBorder : 'rgba(184,134,11,0.3)',
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

      {/* If Public Web and Bare-Metal Tool without dedicated God-Mode Workstation: Display Hardware Enclave Lockout */}
      {!isLocal && !canRunClientSide && !EnclaveToolComponent && (
        <AirGapToolLockout
          tool={tool}
          isUnlocked={unlockedPreview}
          onUnlockPreview={() => setUnlockedPreview(true)}
          onReseal={() => setUnlockedPreview(false)}
        />
      )}

      {/* If Public Web and Client/God-Mode Tool: Display Active Client Compute HUD */}
      {!isLocal && (canRunClientSide || Boolean(EnclaveToolComponent)) && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 2.2,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#F0F9FF',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : '#BAE6FD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            boxShadow: isDark ? '0 0 24px -4px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: isDark ? 'rgba(56, 189, 248, 0.18)' : '#E0F2FE', color: 'var(--zs-sky)', display: 'flex' }}>
              <SpeedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.82rem', color: 'var(--zs-sky)' }}>
                  IN-BROWSER CLIENT EXECUTION UNLOCKED · ZERO DATA EGRESS
                </Typography>
                <Chip
                  label={hasWebGPU ? "WEBGPU HARDWARE ACCELERATED" : "WASM CPU FALLBACK"}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    bgcolor: isDark ? '#111827' : '#E0F2FE',
                    color: isDark ? '#7DD3FC' : '#0369A1',
                    height: 20,
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.76rem' }}>
                You are on the public website. This tool executes 100% client-side in your browser via {hasWebGPU ? 'WebGPU WGSL shaders' : 'WebAssembly CPU SIMD'}. No network data is transmitted.
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              const el = document.getElementById('enclave-workstation-deck') || document.getElementById('client-workstation-deck');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{
              fontFamily: mono,
              fontWeight: 850,
              fontSize: '0.74rem',
              bgcolor: isDark ? '#38BDF8' : '#0369A1',
              color: '#08080B',
              px: 2,
              '&:hover': { bgcolor: '#7DD3FC' },
            }}
          >
            Launch WebGPU Deck ⚡
          </Button>
        </Paper>
      )}

      {/* If Local Sovereign Node: Display Node Status */}
      {isLocal && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 0.8, borderRadius: '50%', bgcolor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#D1FAE5', color: 'var(--zs-emerald)', display: 'flex' }}>
              <SecurityIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: 'var(--zs-emerald)' }}>
                LOCAL SOVEREIGN NODE ACTIVE (127.0.0.1)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>
                Bare-metal hardware access, local daemons, and loopback Unix sockets available.
              </Typography>
            </Box>
          </Box>
          <Chip
            label="FULL PRIVILEGES"
            size="small"
            sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.66rem', bgcolor: isDark ? '#064E3B' : '#D1FAE5', color: 'var(--zs-mint)' }}
          />
        </Paper>
      )}

      {/* Main Tool Dossier Workspace — Blurred and Blocked when Remote and Not Unlocked */}
      <Box
        sx={{
          filter: isLocked ? 'blur(10px) grayscale(30%)' : 'none',
          pointerEvents: isLocked ? 'none' : 'auto',
          userSelect: isLocked ? 'none' : 'auto',
          transition: 'all 0.35s ease',
          opacity: isLocked ? 0.42 : 1,
          position: 'relative',
        }}
      >
      {/* Hero Dossier Header with Category-Coded GlowLine Seam & MotionReveal */}
      <HeroReveal>
        <Paper
          sx={{
            p: { xs: 3, md: 4.5 },
            mb: 4,
            borderRadius: 3,
            bgcolor: isDark ? '#08080B' : '#FFFFFF',
            border: `1px solid ${gold.border}`,
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6), 0 0 20px -4px rgba(212,175,55,0.2)' : '0 4px 16px rgba(184,134,11,0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HeroItem>
            <GlowLine
              height={3}
              color={getCategoryMotionMeta(tool.category).accent}
              glowColor={`${getCategoryMotionMeta(tool.category).accent}66`}
            />
          </HeroItem>
          <HeroItem>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Box sx={{ maxWidth: 920 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={tool.category}
                    size="small"
                    sx={{
                      bgcolor: `${getCategoryMotionMeta(tool.category).accent}20`,
                      color: getCategoryMotionMeta(tool.category).accent,
                      border: `1px solid ${getCategoryMotionMeta(tool.category).accent}55`,
                      fontWeight: 800,
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
                    label={tool.executionType === 'local_cli' ? 'LOCAL CLI & MCP DAEMON' : '100% IN-BROWSER CLIENT ENGINE'}
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
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    mb: 1.5,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.75rem', sm: '2.35rem', md: '2.85rem' },
                    lineHeight: 1.15,
                  }}
                >
                  {tool.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.65 }}>
                  {tool.description}
                </Typography>
                <ToolOfferLine tool={tool} isDark={isDark} />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', flexWrap: 'wrap' }}>
                {tool.localPort && (
                  <Button
                    component="a"
                    href={tool.localUrl || `http://127.0.0.1:${tool.localPort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      borderColor: isDark ? 'rgba(52,211,153,0.45)' : '#A7F3D0',
                      color: isDark ? '#34D399' : '#047857',
                      bgcolor: isDark ? 'rgba(52,211,153,0.08)' : '#ECFDF3',
                      '&:hover': { borderColor: '#34D399', bgcolor: isDark ? 'rgba(52,211,153,0.18)' : '#D1FAE5' },
                    }}
                  >
                    Local :{tool.localPort}
                  </Button>
                )}
                {tool.liveUrl && (
                  <Button
                    component="a"
                    href={tool.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      borderColor: gold.border,
                      color: gold.accent,
                      '&:hover': { borderColor: gold.accent, bgcolor: gold.wash },
                    }}
                  >
                    Web Mirror ↗
                  </Button>
                )}
                {tool.id === 'neuro-memory-daemon' && (
                  <Button
                    component={RouterLink}
                    to="/memory"
                    variant="outlined"
                    startIcon={<MemoryIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      borderColor: isDark ? 'rgba(192,132,252,0.45)' : '#E9D5FF',
                      color: isDark ? '#C084FC' : '#7E22CE',
                      bgcolor: isDark ? 'rgba(192,132,252,0.08)' : '#FAF5FF',
                      '&:hover': { borderColor: '#C084FC', bgcolor: isDark ? 'rgba(192,132,252,0.18)' : '#F3E8FF' },
                    }}
                  >
                    3D Cosmic Nebula
                  </Button>
                )}
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
                {canRunClientSide ? (
                  <Button
                    variant="contained"
                    onClick={() => {
                      const el = document.getElementById('enclave-workstation-deck') || document.getElementById('client-workstation-deck');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    startIcon={<SpeedIcon />}
                    sx={{
                      bgcolor: '#38BDF8',
                      color: '#08080B',
                      fontWeight: 800,
                      boxShadow: '0 4px 16px rgba(56,189,248,0.3)',
                      '&:hover': { bgcolor: '#7DD3FC' },
                    }}
                  >
                    Try In-Browser ⚡
                  </Button>
                ) : EnclaveToolComponent && (isLocal || unlockedPreview) ? (
                  <Button
                    variant="contained"
                    onClick={() => {
                      const el = document.getElementById('enclave-workstation-deck');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    startIcon={<TerminalIcon />}
                    sx={{
                      bgcolor: isLocal ? '#10B981' : gold.accent,
                      color: '#08080B',
                      fontWeight: 800,
                      boxShadow: isLocal ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(212,175,55,0.3)',
                      '&:hover': { bgcolor: isLocal ? '#34D399' : (isDark ? '#F5E6AB' : '#9A7008') },
                    }}
                  >
                    {isLocal ? 'Launch Enclave ⚡' : 'Inspect Simulator ⚡'}
                  </Button>
                ) : (
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
                    {isLocal ? 'Run in ZothOS' : 'Bare-Metal ZothOS'}
                  </Button>
                )}
              </Stack>
            </Box>
          </HeroItem>

          {/* Quick Pull Terminal Command Strip */}
          <HeroItem>
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
          </HeroItem>
        </Paper>
      </HeroReveal>

      {/* Interactive 15s Code-First Motion Edit & Kinetic Anchor Stage */}
      <Box sx={{ mb: 4 }}>
        <ToolMotionShowcase
          tool={tool}
          onReplayRouteIntro={() => window.dispatchEvent(new CustomEvent('zoth:replay-intro'))}
        />
      </Box>

      {/* Interactive In-Browser Workstation (Mounted when tool has WebGPU/WASM client engine and no dedicated Enclave component) */}
      {canRunClientSide && tool.id !== 'webmcp-protocol-inspector' && !EnclaveToolComponent && (
        <Box id="client-workstation-deck">
          <WebGPUToolWorkstation tool={tool} />
        </Box>
      )}

      {/* Sovereign Enclave Microtool Workstation (Mounted for all tools with a dedicated 60fps God-Mode component) */}
      {EnclaveToolComponent && (
        <Paper
          elevation={0}
          id="enclave-workstation-deck"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 5,
            borderRadius: 3,
            bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
            border: `1.5px solid ${isLocal ? 'rgba(34,197,94,0.35)' : gold.border}`,
            boxShadow: isDark
              ? '0 12px 32px rgba(0,0,0,0.6), 0 0 20px -4px rgba(212,175,55,0.2)'
              : '0 4px 20px rgba(212,175,55,0.12)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7', color: gold.accent, display: 'flex' }}>
                <TerminalIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                  Interactive Enclave Workstation
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: isLocal ? '#34D399' : gold.soft, fontWeight: 700 }}>
                  {isLocal ? 'LOCAL SOVEREIGN ENCLAVE · BARE-METAL HARNESS ACTIVE' : 'AIR-GAPPED SIMULATION HARNESS · ZERO EGRESS'}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: isLocal ? '#10B981' : gold.accent }} />}
              label={isLocal ? 'LIVE LOCAL EXECUTION' : 'ENCLAVE SIMULATION HARNESS'}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: isLocal ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : gold.wash,
                color: isLocal ? (isDark ? '#34D399' : '#047857') : gold.soft,
                border: `1px solid ${isLocal ? 'rgba(16,185,129,0.3)' : gold.border}`,
              }}
            />
          </Box>
          <EnclaveToolComponent tool={tool} />
        </Paper>
      )}

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
                <AutoFixHighIcon sx={{ color: 'var(--zs-green)', fontSize: 24 }} />
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
                  <IconButton aria-label="Copy to clipboard" size="small" onClick={() => handleCopy(mcpConfigSnippet, setCopiedMcp)} sx={{ color: gold.accent }}>
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
                <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: 'var(--zs-green)' }}>
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

      {/* SECTION 3.5: Interactive Enclave Sandbox (WebMCP Tool) */}
      {tool.id === 'webmcp-protocol-inspector' && (
        <Box sx={{ mb: 6 }}>
          <Typography className="section-kicker">Interactive Sovereign Enclave</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 3, color: theme.palette.text.primary }}>
            Live WebMCP Inspector &amp; Zoth OS Video Player
          </Typography>
          <WebMCPConsole />
        </Box>
      )}

      {/* SECTION 4: Sovereign Funnel */}
      <Box sx={{ mt: 6 }}>
        <SovereignFunnel
          title={`Deploy ${tool.name} in Your Sovereign Workspace`}
          subtitle={`Choose between pulling this standalone micro-tool repository, running it natively inside Zoth Studio, or booting ZothOS where all ${microTools.length} sovereign tools are pre-configured.`}
          toolTitle={tool.name}
          toolDescription={tool.description}
          toolRepo={tool.github}
          toolCommand={tool.pull || `git clone ${tool.github}.git`}
        />
      </Box>
      </Box>
    </Container>
  );
}
