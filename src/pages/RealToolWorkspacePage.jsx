import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import CodeIcon from '@mui/icons-material/Code';
import SpeedIcon from '@mui/icons-material/Speed';

import { microTools } from '../data/toolsData';
import { workstations } from '../data/workstations';
import { getToolDocumentation } from '../data/toolsDocumentation';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll } from '../components/MotionReveal';
import { useSovereignRuntime } from '../utils/sovereignRuntime';
import { useReality } from '../context/RealityContext';
import AgentComposerGodModeTool from '../components/tools/AgentComposerGodModeTool';
import AxPowerhouseGodModeTool from '../components/tools/AxPowerhouseGodModeTool';
import BrandAssetsForgeGodModeTool from '../components/tools/BrandAssetsForgeGodModeTool';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const WebGPUToolWorkstation = lazy(() => import('../components/tools/WebGPUToolWorkstation'));
const SovereignToolOutputWorkbench = lazy(() => import('../components/tools/SovereignToolOutputWorkbench'));
const ToolMotionShowcase = lazy(() => import('../components/tools/ToolMotionShowcase'));

const AdytumPlannerGodModeTool = lazy(() => import('../components/tools/AdytumPlannerGodModeTool'));
const AeoGraphEngineGodModeTool = lazy(() => import('../components/tools/AeoGraphEngineGodModeTool'));
const AgentBudgetSentinelGodModeTool = lazy(() => import('../components/tools/AgentBudgetSentinelGodModeTool'));
const AgentCapsuleJailGodModeTool = lazy(() => import('../components/tools/AgentCapsuleJailGodModeTool'));
const AgentEgressSentinelGodModeTool = lazy(() => import('../components/tools/AgentEgressSentinelGodModeTool'));
const AgentFlightRecorderGodModeTool = lazy(() => import('../components/tools/AgentFlightRecorderGodModeTool'));
const AgentGodsEyeGodModeTool = lazy(() => import('../components/tools/AgentGodsEyeGodModeTool'));
const AgentMockTwinGodModeTool = lazy(() => import('../components/tools/AgentMockTwinGodModeTool'));
const AgentPolicyAuditorGodModeTool = lazy(() => import('../components/tools/AgentPolicyAuditorGodModeTool'));
const AgentPromptFirewallGodModeTool = lazy(() => import('../components/tools/AgentPromptFirewallGodModeTool'));
const AgentVoiceCallGodModeTool = lazy(() => import('../components/tools/AgentVoiceCallGodModeTool'));
const AndersonSentinelGodModeTool = lazy(() => import('../components/tools/AndersonSentinelGodModeTool'));
const AsciiMotionGodModeTool = lazy(() => import('../components/tools/AsciiMotionGodModeTool'));
const AttackSurfaceSentinelGodModeTool = lazy(() => import('../components/tools/AttackSurfaceSentinelGodModeTool'));
const AudioCipherGodModeTool = lazy(() => import('../components/tools/AudioCipherGodModeTool'));
const AzothArchonGodModeTool = lazy(() => import('../components/tools/AzothArchonGodModeTool'));
const Badge3dCoinGodModeTool = lazy(() => import('../components/tools/Badge3dCoinGodModeTool'));
const CertPathRoadmapGodModeTool = lazy(() => import('../components/tools/CertPathRoadmapGodModeTool'));
const CivicProcurementGodModeTool = lazy(() => import('../components/tools/CivicProcurementGodModeTool'));
const CronRhythmGodModeTool = lazy(() => import('../components/tools/CronRhythmGodModeTool'));
const CwvSpeedEngineGodModeTool = lazy(() => import('../components/tools/CwvSpeedEngineGodModeTool'));
const CyberTurtleGodModeTool = lazy(() => import('../components/tools/CyberTurtleGodModeTool'));
const DatamoshGlitchGodModeTool = lazy(() => import('../components/tools/DatamoshGlitchGodModeTool'));
const DeepSearchGodModeTool = lazy(() => import('../components/tools/DeepSearchGodModeTool'));
const EnvGuardVaultGodModeTool = lazy(() => import('../components/tools/EnvGuardVaultGodModeTool'));
const GhidraMcpGodModeTool = lazy(() => import('../components/tools/GhidraMcpGodModeTool'));
const HexStrikeGodModeTool = lazy(() => import('../components/tools/HexStrikeGodModeTool'));
const JwtInspectorGodModeTool = lazy(() => import('../components/tools/JwtInspectorGodModeTool'));
const LikenessDeskGodModeTool = lazy(() => import('../components/tools/LikenessDeskGodModeTool'));
const McpLensGodModeTool = lazy(() => import('../components/tools/McpLensGodModeTool'));
const NeuroMemoryGodModeTool = lazy(() => import('../components/tools/NeuroMemoryGodModeTool'));
const Nexus3DGodModeTool = lazy(() => import('../components/tools/Nexus3DGodModeTool'));
const OmniPostSocialGodModeTool = lazy(() => import('../components/tools/OmniPostSocialGodModeTool'));
const PayloadEntropyGodModeTool = lazy(() => import('../components/tools/PayloadEntropyGodModeTool'));
const PixelCastGodModeTool = lazy(() => import('../components/tools/PixelCastGodModeTool'));
const AetherObservatoryGodModeTool = lazy(() => import('../components/tools/AetherObservatoryGodModeTool'));
const ChronicleVaultGodModeTool = lazy(() => import('../components/tools/ChronicleVaultGodModeTool'));
const PolyglotStudioGodModeTool = lazy(() => import('../components/tools/PolyglotStudioGodModeTool'));
const PromptMasterGodModeTool = lazy(() => import('../components/tools/PromptMasterGodModeTool'));
const PwaManifestBuilderGodModeTool = lazy(() => import('../components/tools/PwaManifestBuilderGodModeTool'));
const RealityShaderForgeGodModeTool = lazy(() => import('../components/tools/RealityShaderForgeGodModeTool'));
const RegexDroidGodModeTool = lazy(() => import('../components/tools/RegexDroidGodModeTool'));
const RobotsTxtAuditorGodModeTool = lazy(() => import('../components/tools/RobotsTxtAuditorGodModeTool'));
const SchemaIllustratorGodModeTool = lazy(() => import('../components/tools/SchemaIllustratorGodModeTool'));
const SovereignBridgeGodModeTool = lazy(() => import('../components/tools/SovereignBridgeGodModeTool'));
const SubSweepGodModeTool = lazy(() => import('../components/tools/SubSweepGodModeTool'));
const SwarmCivilizationGodModeTool = lazy(() => import('../components/tools/SwarmCivilizationGodModeTool'));
const UfoSacredGeometryGodModeTool = lazy(() => import('../components/tools/UfoSacredGeometryGodModeTool'));
const VectorSearchGodModeTool = lazy(() => import('../components/tools/VectorSearchGodModeTool'));
const VisionKinematicsGodModeTool = lazy(() => import('../components/tools/VisionKinematicsGodModeTool'));
const WcagContrastGuard = lazy(() => import('../components/tools/WcagContrastGuard'));
const WebMcpInspectorGodModeTool = lazy(() => import('../components/tools/WebMcpInspectorGodModeTool'));
const WebSecurityGuardGodModeTool = lazy(() => import('../components/tools/WebSecurityGuardGodModeTool'));
const YaraSigmaForgeGodModeTool = lazy(() => import('../components/tools/YaraSigmaForgeGodModeTool'));
const ZothBoltGodModeTool = lazy(() => import('../components/tools/ZothBoltGodModeTool'));
const ZothBotGodModeTool = lazy(() => import('../components/tools/ZothBotGodModeTool'));
const ZothBotOSGodModeTool = lazy(() => import('../components/tools/ZothBotOSGodModeTool'));
const ZothBountyGodModeTool = lazy(() => import('../components/tools/ZothBountyGodModeTool'));
const ZothComfyFoundryGodModeTool = lazy(() => import('../components/tools/ZothComfyFoundryGodModeTool'));
const ZothEgregoreGodModeTool = lazy(() => import('../components/tools/ZothEgregoreGodModeTool'));
const ZothFoundryGodModeTool = lazy(() => import('../components/tools/ZothFoundryGodModeTool'));
const ZothOSGodModeTool = lazy(() => import('../components/tools/ZothOSGodModeTool'));
const ZothOSLiteGodModeTool = lazy(() => import('../components/tools/ZothOSLiteGodModeTool'));
const ZothObsidianTrackerGodModeTool = lazy(() => import('../components/tools/ZothObsidianTrackerGodModeTool'));
const ZothOsintGodModeTool = lazy(() => import('../components/tools/ZothOsintGodModeTool'));
const ZothPillGodModeTool = lazy(() => import('../components/tools/ZothPillGodModeTool'));
const ZothRelayGodModeTool = lazy(() => import('../components/tools/ZothRelayGodModeTool'));
const ZothSceneFoundryGodModeTool = lazy(() => import('../components/tools/ZothSceneFoundryGodModeTool'));
const ZothSwarmMultiplexerGodModeTool = lazy(() => import('../components/tools/ZothSwarmMultiplexerGodModeTool'));
const ZothXConnectorGodModeTool = lazy(() => import('../components/tools/ZothXConnectorGodModeTool'));
const ProductHuntConnectorGodModeTool = lazy(() => import('../components/tools/ProductHuntConnectorGodModeTool'));
const CreatorPlaybooksGodModeTool = lazy(() => import('../components/tools/CreatorPlaybooksGodModeTool'));
const ZelaGlassesGuideGodModeTool = lazy(() => import('../components/tools/ZelaGlassesGuideGodModeTool'));
const ShodanSurfaceSentinelGodModeTool = lazy(() => import('../components/tools/ShodanSurfaceSentinelGodModeTool'));
const OsintScoutSkillGodModeTool = lazy(() => import('../components/tools/OsintScoutSkillGodModeTool'));
const EtsyConnectorGodModeTool = lazy(() => import('../components/tools/EtsyConnectorGodModeTool'));
const EtsyPodForgeGodModeTool = lazy(() => import('../components/tools/EtsyPodForgeGodModeTool'));
const ShopifyConnectorGodModeTool = lazy(() => import('../components/tools/ShopifyConnectorGodModeTool'));
const DigitalAssetForgeGodModeTool = lazy(() => import('../components/tools/DigitalAssetForgeGodModeTool'));
const PodMockupForgeGodModeTool = lazy(() => import('../components/tools/PodMockupForgeGodModeTool'));
const PrintifyConnectorGodModeTool = lazy(() => import('../components/tools/PrintifyConnectorGodModeTool'));
const GelatoConnectorGodModeTool = lazy(() => import('../components/tools/GelatoConnectorGodModeTool'));
const PodSmartRouterGodModeTool = lazy(() => import('../components/tools/PodSmartRouterGodModeTool'));
const PodMarginSentinelGodModeTool = lazy(() => import('../components/tools/PodMarginSentinelGodModeTool'));
const StorefrontCatalogGodModeTool = lazy(() => import('../components/tools/StorefrontCatalogGodModeTool'));
const ZothnetGodModeTool = lazy(() => import('../components/tools/ZothnetGodModeTool'));

const ENCLAVE_TOOL_COMPONENTS = {
  'zoth-os': ZothOSGodModeTool,
  'certpath-roadmap-studio': CertPathRoadmapGodModeTool,
  'certpath-roadmap': CertPathRoadmapGodModeTool,
  'badge3d-coin-generator': Badge3dCoinGodModeTool,
  'badge-3d': Badge3dCoinGodModeTool,
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
  'shodan-surface-sentinel': ShodanSurfaceSentinelGodModeTool,
  'shodan-sentinel': ShodanSurfaceSentinelGodModeTool,
  'adytum-alchemist-ai-workflow': AdytumPlannerGodModeTool,
  'adytum-alchemist': AdytumPlannerGodModeTool,
  'creatorplaybooks': CreatorPlaybooksGodModeTool,
  'azoth-archon-orchestrator': AzothArchonGodModeTool,
  'azoth-local-agent': AzothArchonGodModeTool,
  'sovereign-bridge-protocol': SovereignBridgeGodModeTool,
  'sovereign-agent-bridge': SovereignBridgeGodModeTool,
  'neuro-memory-service': NeuroMemoryGodModeTool,
  'neuro-memory-daemon': NeuroMemoryGodModeTool,
  'zoth-obsidian-tracker': ZothObsidianTrackerGodModeTool,
  'agent-egress-sentinel': AgentEgressSentinelGodModeTool,
  'agent-mock-twin': AgentMockTwinGodModeTool,
  'agent-prompt-firewall': AgentPromptFirewallGodModeTool,
  'wcag-contrast-guard': WcagContrastGuard,
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
  'zoth-x-connector': ZothXConnectorGodModeTool,
  'cron-rhythm-studio': CronRhythmGodModeTool,
  'printify-connector': PrintifyConnectorGodModeTool,
  'gelato-connector': GelatoConnectorGodModeTool,
  'etsy-connector': EtsyConnectorGodModeTool,
  'shopify-connector': ShopifyConnectorGodModeTool,
  'etsy-pod-forge': EtsyPodForgeGodModeTool,
  'pod-smart-router': PodSmartRouterGodModeTool,
  'digital-asset-forge': DigitalAssetForgeGodModeTool,
  'pod-mockup-forge': PodMockupForgeGodModeTool,
  'pod-margin-sentinel': PodMarginSentinelGodModeTool,
  'agent-voice-call': AgentVoiceCallGodModeTool,
  'mcp-lens': McpLensGodModeTool,
  'agent-budget-sentinel': AgentBudgetSentinelGodModeTool,
  'agent-gods-eye': AgentGodsEyeGodModeTool,
  'zoth-osint': ZothOsintGodModeTool,
  'osint-scout-skill': OsintScoutSkillGodModeTool,
  'zoth-webgen': ZothBoltGodModeTool,
  'zoth-swarm-multiplexer': ZothSwarmMultiplexerGodModeTool,
  'zoth-civilization': SwarmCivilizationGodModeTool,
  'likeness-desk': LikenessDeskGodModeTool,
  'likeness': LikenessDeskGodModeTool,
  'bolt.diy': ZothBoltGodModeTool,
  'bolt-diy': ZothBoltGodModeTool,
  'zoth-bolt': ZothBoltGodModeTool,
  'producthunt-connector': ProductHuntConnectorGodModeTool,
  'zoth-ph': ProductHuntConnectorGodModeTool,
  'zoth-relay': ZothRelayGodModeTool,
  'zela-glasses-guide': ZelaGlassesGuideGodModeTool,
  'zoth-bot': ZothBotGodModeTool,
  'zoth-bounty': ZothBountyGodModeTool,
  'zoth-scene-foundry': ZothSceneFoundryGodModeTool,
  'vision-gesture-control': VisionKinematicsGodModeTool,
  'datamosh-glitch-studio': DatamoshGlitchGodModeTool,
  'datamosh-studio': DatamoshGlitchGodModeTool,
  'nexus-3d-scene-studio': Nexus3DGodModeTool,
  'nexus-3d': Nexus3DGodModeTool,
  'nexus-3d-studio': Nexus3DGodModeTool,
  'ufo-sacred-geometry': UfoSacredGeometryGodModeTool,
  'ufo-geometry': UfoSacredGeometryGodModeTool,
  'cyber-turtle-studio': CyberTurtleGodModeTool,
  'og-canvas-forge': AsciiMotionGodModeTool,
  'zoth-ascii-magic': AsciiMotionGodModeTool,
  'webmcp-protocol-inspector': WebMcpInspectorGodModeTool,
  'yara-sigma-forge': YaraSigmaForgeGodModeTool,
  'reality-shader-forge': RealityShaderForgeGodModeTool,
  'anderson-security-sentinel': AndersonSentinelGodModeTool,
  'city-desk': CivicProcurementGodModeTool,
  'storefront-catalog': StorefrontCatalogGodModeTool,
  'pixel-cast': PixelCastGodModeTool,
  'aether-observatory': AetherObservatoryGodModeTool,
  'zoth-memory-vault': ChronicleVaultGodModeTool,
  'chronicle-vault': ChronicleVaultGodModeTool,
  'zoth-math-pillar': ZothPillGodModeTool,
  'zothos-lite': ZothOSLiteGodModeTool,
  'zothnet': ZothnetGodModeTool,
  'zoth-egregore': ZothEgregoreGodModeTool,
  'zoth-bot-os': ZothBotOSGodModeTool,
  'zoth-comfy-foundry': ZothComfyFoundryGodModeTool,

  // Studio Cockpit & Workstation aliases (from workstations.js)
  'cockpit': SwarmCivilizationGodModeTool,
  'ide': ZothBoltGodModeTool,
  'agent-composer': AgentComposerGodModeTool,
  'mission-control': SwarmCivilizationGodModeTool,
  'models': PromptMasterGodModeTool,
  'ax-powerhouse': AxPowerhouseGodModeTool,
  'cyberpunk-hud': AttackSurfaceSentinelGodModeTool,
  'chronicle': ChronicleVaultGodModeTool,
  'notes-reviewer': NeuroMemoryGodModeTool,
  'brand': BrandAssetsForgeGodModeTool,
  'vision-link': VisionKinematicsGodModeTool,
  'web3-hub': SovereignBridgeGodModeTool,
  'github-tool': PolyglotStudioGodModeTool,
  'netlify-ax': AeoGraphEngineGodModeTool,
  'webgen': ZothBoltGodModeTool,
  'omnipost': OmniPostSocialGodModeTool,
  'subsweep': SubSweepGodModeTool,
  'connectors': McpLensGodModeTool,
  'hexstrike': HexStrikeGodModeTool,
  'netrunner-memory': NeuroMemoryGodModeTool,
  'consensus': SwarmCivilizationGodModeTool,
  'bus-monitor': SovereignBridgeGodModeTool,
  'math-pillars': ZothPillGodModeTool,
};

const WORKSTATION_TOOL_ALIASES = {
  'adytum-alchemist': 'adytum-alchemist-ai-workflow',
  'adytum': 'adytum-alchemist-ai-workflow',
  'bolt.diy': 'zoth-bolt',
  'bolt-diy': 'zoth-bolt',
  'bolt': 'zoth-bolt',
  'zoth-webgen': 'zoth-bolt',
  'webgen': 'zoth-bolt',
  'omnipost': 'omnipost-social-engine',
  'subsweep': 'subsweep-lead-scanner',
  'hexstrike': 'hexstrike-arsenal',
  'netrunner-memory': 'neuro-memory-daemon',
  'bus-monitor': 'sovereign-agent-bridge',
};

const DEDICATED_SITES = {
  'zoth-os': { label: 'ZothOS Portal', url: 'https://zothos.nullai.tech' },
  'zothos-lite': { label: 'ZothOS-Lite Portal', url: 'https://zothos-lite.nullai.tech' },
  'zoth-civilization': { label: 'Zoth Civilization Site', url: 'https://zoth-civilization.netlify.app' },
  'zoth-egregore': { label: 'Zoth Egregore Model Site', url: 'https://zoth-egregore.netlify.app' },
  'zoth-swarm-multiplexer': { label: 'Zoth Egregore Model Site', url: 'https://zoth-egregore.netlify.app' },
  'creatorplaybooks': { label: 'CreatorPlaybooks Live', url: 'https://creatorplaybooks.netlify.app' },
};

export default function RealToolWorkspacePage() {
  const { toolId: paramToolId, workstationId } = useParams();
  const toolId = paramToolId || workstationId;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedPull, setCopiedPull] = useState(false);
  const [copiedRuntimePull, setCopiedRuntimePull] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [copiedTuiSpec, setCopiedTuiSpec] = useState(false);
  const [localViewMode, setLocalViewMode] = useState(
    toolId === 'zoth-swarm-multiplexer' ? 'enclave' : 'webapp',
  );
  const [localWebAppUp, setLocalWebAppUp] = useState(false);
  const [localProbeDone, setLocalProbeDone] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const { isLocal, hasWebGPU } = useSovereignRuntime();
  const { reality, params: realityParams } = useReality();

  const resolvedToolId = WORKSTATION_TOOL_ALIASES[toolId] || toolId;
  const catalogTool = microTools.find(
    (t) => t.id === resolvedToolId || t.repo === resolvedToolId || t.id === toolId,
  );
  const wsEntry = !catalogTool ? workstations.find((w) => w.id === toolId) : null;

  const tool =
    catalogTool ||
    (wsEntry
      ? {
          id: wsEntry.id,
          name: wsEntry.name,
          repo: 'zoth-studio-v2',
          category: wsEntry.band || 'Architecture',
          executionType: wsEntry.executionType || (wsEntry.id === 'agent-composer' ? 'hybrid' : 'browser'),
          github: 'https://github.com/NullAITech/zoth-studio-v2',
          liveUrl: `https://zoth.nullai.tech/workstations/${wsEntry.id}`,
          description:
            wsEntry.description ||
            'Local-first architecture module integrated inside the Zoth Studio v2 repository.',
          version: wsEntry.version || '2.3.0',
          pull: wsEntry.pullCommand || 'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        }
      : null);

  useEffect(() => {
    if (!isLocal || !tool?.localPort) {
      setLocalWebAppUp(false);
      setLocalProbeDone(false);
      return undefined;
    }
    let cancelled = false;
    setLocalProbeDone(false);
    setLocalWebAppUp(false);
    fetch('/api/studio/tool/wake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tool.id,
        repo: tool.repo,
        port: tool.localPort,
        probeOnly: tool.id === 'anderson-security-sentinel',
      }),
    })
      .then((r) => (r.ok ? r.json() : { up: false }))
      .then((data) => {
        if (!cancelled) {
          setLocalWebAppUp(Boolean(data?.up));
          setLocalProbeDone(true);
          if (data?.up) setIframeKey((k) => k + 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocalWebAppUp(false);
          setLocalProbeDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLocal, tool?.id, tool?.repo, tool?.localPort]);

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const subtleBg = isDark ? '#11141D' : '#F4F1EA';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const emeraldText = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5';
  const emeraldBorder = isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0';

  const brailleSignature = useMemo(() => {
    const seedStr = tool?.id || toolId || 'zoth';
    const densityBoost = (realityParams?.density || 50) / 100;
    const chars = [];
    for (let i = 0; i < 16; i += 1) {
      const code = seedStr.charCodeAt(i % seedStr.length) + i * 17;
      const mask = Math.min(
        255,
        Math.max(1, Math.round(((code % 255) * (0.65 + densityBoost * 0.55)) % 256)),
      );
      chars.push(String.fromCharCode(0x2800 + mask));
    }
    return chars.join('');
  }, [tool?.id, toolId, realityParams?.density]);

  if (!tool) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontFamily: display, color: primaryText, mb: 1.5 }}>
            Repository Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: secondaryText, mb: 3 }}>
            No local repository or architecture specification matched <code>{toolId}</code>.
          </Typography>
          <Button
            component={RouterLink}
            to="/arsenal"
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: isDark ? '#D4AF37' : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Browse All {microTools.length} Repositories
          </Button>
        </Paper>
      </Container>
    );
  }

  const docs = getToolDocumentation(tool);
  const repoUrl =
    ['wcag-contrast-guard', 'zothnet'].includes(tool.id) || !tool.github
      ? 'https://github.com/NullAITech/zoth-studio-v2'
      : tool.github;
  const studioRepoUrl = 'https://github.com/NullAITech/zoth-studio-v2';
  const cloneCommand = `git clone ${repoUrl.replace(/\.git$/, '')}.git`;
  const pullCommand = tool.pull || cloneCommand;
  const dedicatedSite = DEDICATED_SITES[tool.id];
  const execType = String(tool.executionType || tool.execution_type || 'browser').toLowerCase();
  const runtimePort = tool.localPort ?? tool.port ?? null;
  const isBrowserOnly = execType === 'browser' || execType === 'webgpu';
  const isHybrid = execType === 'hybrid';
  const isLocalCli = execType === 'local_cli';
  const isLocalDaemon = execType === 'local-daemon' || execType === 'local_daemon';
  const runtimeBanner = isLocalDaemon
    ? {
        tone: 'amber',
        badge: runtimePort ? `LOCAL DAEMON :${runtimePort}` : 'LOCAL DAEMON',
        text: tool.id === 'agent-capsule-jail'
          ? 'Requires local daemon (agent-capsule-jail serve) — optional offline JS worker preview in Studio'
          : `Requires local daemon${runtimePort ? ` (127.0.0.1:${runtimePort})` : ''} — Studio deck talks to it over loopback`,
      }
    : isBrowserOnly
    ? {
        tone: 'emerald',
        badge: execType === 'webgpu' ? 'WEBGPU / BROWSER' : 'IN-BROWSER',
        text: '✓ Runs 100% in your browser — no local install or backend required',
      }
    : isHybrid
    ? {
        tone: 'gold',
        badge: 'HYBRID',
        text: runtimePort
          ? `⚡ Browser Workbench + Optional Local Daemon (127.0.0.1:${runtimePort})`
          : '⚡ Browser Workbench + Optional Local Daemon',
      }
    : runtimePort
    ? {
        tone: 'amber',
        badge: `LOCAL DAEMON :${runtimePort}`,
        text: `⚙ Local ZothOS Daemon (127.0.0.1:${runtimePort}) — interactive preview below; install CLI or ZothOS for live local execution`,
      }
    : {
        tone: 'amber',
        badge: 'LOCAL CLI',
        text: '⌨ Local CLI Tool — configure & export commands below; runs locally via ZothOS / terminal',
      };
  const ActiveEnclaveComponent =
    ENCLAVE_TOOL_COMPONENTS[tool.id] ||
    ENCLAVE_TOOL_COMPONENTS[toolId] ||
    WebGPUToolWorkstation;
  const showLocalIframe = isLocal && tool.localPort && localViewMode === 'webapp' && localWebAppUp;

  const copyText = (text, setter) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  const handleCopyBrailleSpec = () => {
    const spec = [
      '┌── UNCOMMON WEB × ZOTH STUDIO TELEMETRY ──────────────────────────┐',
      `│ TOOL    : ${tool.name} (${tool.id})`,
      `│ ENGINE  : ${String(tool.executionType || 'browser').toUpperCase()} · 100% OPEN-ACCESS`,
      `│ BRAILLE : ${brailleSignature} (U+2800 2x4 Sub-Pixel Matrix)`,
      `│ BAYER   : ░▒▓█ ${reality?.name || 'Aurum Sovereign'} · Density ${realityParams?.density || 50}%`,
      `│ CLI     : ${pullCommand}`,
      '└──────────────────────────────────────────────────────────────────┘',
    ].join('\n');
    copyText(spec, setCopiedTuiSpec);
  };

  const handleExportUncommonSvg = () => {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = [
      'UNCOMMON WEB x ZOTH STUDIO TELEMETRY CARD',
      '--------------------------------------------------------------------',
      `TOOL ID     : ${tool.id}  [v${tool.version || '2.5.0'}]`,
      `NAME        : ${tool.name}`,
      `CATEGORY    : ${tool.category || 'Sovereign Arsenal'}`,
      `EXECUTION   : ${tool.executionType === 'local_cli' ? 'LOCAL CLI + IN-BROWSER WORKBENCH' : tool.executionType === 'local-daemon' ? `LOCAL DAEMON 127.0.0.1:${tool.localPort || ''} (REQUIRED FOR LIVE RUNS)` : '100% CLIENT-SIDE IN-BROWSER ENGINE'}`,
      `BRAILLE SIG : ${brailleSignature}  (Unicode U+2800 2x4 Sub-Pixel)`,
      `BAYER 8x8   : ░▒▓█▓▒░  REALITY=${reality?.id || 'aurum'} DENSITY=${realityParams?.density || 50}%`,
      `CLI / PULL  : ${pullCommand}`,
      '--------------------------------------------------------------------',
      'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
    ];
    const fontSize = 13;
    const lineHeight = 20;
    const width = 680;
    const height = lines.length * lineHeight + 44;
    const tspanNodes = lines
      .map(
        (line, i) =>
          `<text x="22" y="${30 + i * lineHeight}" fill="${i === 0 || i === 6 ? '#D4AF37' : '#EDEFF2'}" font-family="JetBrains Mono, monospace" font-size="${fontSize}px" xml:space="preserve">${esc(line)}</text>`,
      )
      .join('\n  ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" rx="12" fill="#08080C" stroke="#D4AF37" stroke-width="1.5"/>
  ${tspanNodes}
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}-uncommon-braille-card.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {wsEntry && (
            <Button
              component={RouterLink}
              to="/workstations"
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                minHeight: { xs: 44, sm: 34 },
                fontFamily: mono,
                fontSize: '0.76rem',
                fontWeight: 700,
                color: gold,
                textTransform: 'none',
                px: 1.25,
                '&:hover': { color: primaryText, bgcolor: 'transparent' },
              }}
            >
              Workstations
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/arsenal"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{
              minHeight: { xs: 44, sm: 34 },
              fontFamily: mono,
              fontSize: '0.76rem',
              fontWeight: 700,
              color: secondaryText,
              textTransform: 'none',
              px: 1.25,
              '&:hover': { color: primaryText, bgcolor: 'transparent' },
            }}
          >
            All {microTools.length} Repositories
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={tool.category}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FAF6EB',
              color: gold,
              border: `1px solid ${borderCol}`,
            }}
          />
          <Chip
            size="small"
            label={isBrowserOnly && hasWebGPU ? 'WEBGPU + IN-BROWSER' : '100% OPEN-ACCESS'}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.68rem',
              bgcolor: emeraldBg,
              color: emeraldText,
              border: `1px solid ${emeraldBorder}`,
            }}
          />
          <Chip
            size="small"
            label={runtimeBanner.badge}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.68rem',
              bgcolor: isBrowserOnly
                ? emeraldBg
                : isDark
                ? 'rgba(245, 158, 11, 0.14)'
                : '#FFFBEB',
              color: isBrowserOnly ? emeraldText : isDark ? '#FBBF24' : '#92400E',
              border: `1px solid ${
                isBrowserOnly
                  ? emeraldBorder
                  : isDark
                  ? 'rgba(245, 158, 11, 0.35)'
                  : '#FDE68A'
              }`,
            }}
          />
          {isLocal && runtimePort && localWebAppUp && (
            <Chip
              size="small"
              label={`LIVE LOCAL :${runtimePort}`}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: emeraldBg,
                color: emeraldText,
                border: `1px solid ${emeraldBorder}`,
              }}
            />
          )}
          <Chip
            size="small"
            label={`v${tool.version || '2.5.0'}`}
            sx={{
              fontFamily: mono,
              fontWeight: 600,
              fontSize: '0.7rem',
              bgcolor: subtleBg,
              color: secondaryText,
              border: `1px solid ${borderCol}`,
            }}
          />
        </Stack>
      </Box>

      {/* Hero Dossier Header */}
      <HeroReveal>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4.5 },
            mb: 4,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <GlowLine
            height={2}
            color={gold}
            glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(122,88,8,0.2)'}
          />

          <HeroItem>
            <Typography
              sx={{
                mt: 2.5,
                mb: 1,
                fontFamily: mono,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: gold,
              }}
            >
              LOCAL-FIRST WORKSTATION &amp; REPOSITORY SPECIFICATION · {tool.id}
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              component="h1"
              sx={{
                fontFamily: display,
                fontSize: { xs: '2rem', sm: '2.65rem', md: '3.1rem' },
                fontWeight: 400,
                lineHeight: 1.1,
                color: primaryText,
                mb: 1.75,
              }}
            >
              {tool.name}
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              sx={{
                fontSize: { xs: '0.98rem', md: '1.08rem' },
                lineHeight: 1.7,
                color: secondaryText,
                maxWidth: 860,
                mb: 2.5,
              }}
            >
              {tool.description}
            </Typography>
          </HeroItem>

          {/* Honest Runtime Verification Strip */}
          <HeroItem>
            <Box
              data-testid="runtime-verification-strip"
              sx={{
                mb: 2.5,
                px: 2,
                py: 1.35,
                borderRadius: 2,
                bgcolor:
                  runtimeBanner.tone === 'emerald'
                    ? emeraldBg
                    : isDark
                    ? 'rgba(245, 158, 11, 0.1)'
                    : '#FFFBEB',
                border: `1px solid ${
                  runtimeBanner.tone === 'emerald'
                    ? emeraldBorder
                    : isDark
                    ? 'rgba(245, 158, 11, 0.34)'
                    : '#FDE68A'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.25,
              }}
            >
              <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: { xs: '0.74rem', sm: '0.8rem' },
                    fontWeight: 700,
                    lineHeight: 1.5,
                    color:
                      runtimeBanner.tone === 'emerald'
                        ? emeraldText
                        : isDark
                        ? '#FCD34D'
                        : '#92400E',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {runtimeBanner.text}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                {isLocal && runtimePort && localWebAppUp && (
                  <Chip
                    size="small"
                    label={`● Local Daemon Reachable (:${runtimePort})`}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      bgcolor: emeraldBg,
                      color: emeraldText,
                      border: `1px solid ${emeraldBorder}`,
                    }}
                  />
                )}
                {(isLocalCli || isHybrid) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyText(pullCommand, setCopiedRuntimePull)}
                    startIcon={copiedRuntimePull ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'none',
                      color: primaryText,
                      borderColor: borderCol,
                      minHeight: { xs: 44, sm: 34 },
                    }}
                  >
                    {copiedRuntimePull ? 'Copied Quickstart' : 'Copy Install / CLI'}
                  </Button>
                )}
              </Box>
            </Box>
          </HeroItem>

          {/* Pull / CLI Command Strip + Git Clone Strip */}
          <HeroItem>
            <Stack spacing={1.25} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2,
                  bgcolor: '#0B0E14',
                  border: '1px solid rgba(245, 241, 230, 0.14)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    minWidth: 0,
                    flex: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  <TerminalIcon sx={{ color: '#D4AF37', fontSize: '1.1rem', flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: { xs: '0.76rem', sm: '0.84rem' },
                      color: '#F8FAFC',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pullCommand}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => copyText(pullCommand, setCopiedPull)}
                  startIcon={copiedPull ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    minHeight: { xs: 44, sm: 34 },
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    textTransform: 'none',
                    color: '#08080B',
                    bgcolor: '#D4AF37',
                    px: 1.6,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#E5C158' },
                  }}
                >
                  {copiedPull ? 'Copied CLI' : 'Copy CLI'}
                </Button>
              </Box>

              {!wsEntry && cloneCommand !== pullCommand && (
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    bgcolor: subtleBg,
                    border: `1px solid ${borderCol}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.25,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: { xs: '0.74rem', sm: '0.8rem' },
                      color: secondaryText,
                      whiteSpace: 'nowrap',
                      overflowX: 'auto',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {cloneCommand}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyText(cloneCommand, setCopiedClone)}
                    startIcon={copiedClone ? <CheckIcon /> : <ContentCopyIcon />}
                    sx={{
                      minHeight: { xs: 44, sm: 34 },
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      textTransform: 'none',
                      color: primaryText,
                      borderColor: borderCol,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copiedClone ? 'Copied Clone' : 'Copy Git Clone'}
                  </Button>
                </Box>
              )}
            </Stack>
          </HeroItem>

          {/* Primary Action Buttons */}
          <HeroItem>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                onClick={() => {
                  const target =
                    document.getElementById('local-webapp-workstation-deck') ||
                    document.getElementById('enclave-workstation-deck');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                startIcon={<SpeedIcon />}
                sx={{
                  minHeight: 44,
                  bgcolor: isDark ? '#D4AF37' : '#7A5808',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  fontWeight: 800,
                  px: 2.5,
                  py: 1.1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4306' },
                }}
              >
                Open Interactive Deck
              </Button>

              <Button
                variant="outlined"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{
                  minHeight: 44,
                  borderColor: isDark ? 'rgba(245,241,230,0.28)' : '#101828',
                  color: primaryText,
                  fontWeight: 700,
                  px: 2.5,
                  py: 1.1,
                  textTransform: 'none',
                  '&:hover': { borderColor: gold },
                }}
              >
                Get Tool Repository
              </Button>

              {repoUrl !== studioRepoUrl && (
                <Button
                  variant="outlined"
                  href={studioRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  sx={{
                    minHeight: 44,
                    borderColor: borderCol,
                    color: secondaryText,
                    fontWeight: 700,
                    px: 2.25,
                    py: 1.1,
                    textTransform: 'none',
                    '&:hover': { borderColor: gold, color: primaryText },
                  }}
                >
                  Get Zoth Studio Repo
                </Button>
              )}

              <Button
                component={RouterLink}
                to="/zoth-os"
                variant="outlined"
                sx={{
                  minHeight: 44,
                  borderColor: borderCol,
                  color: secondaryText,
                  fontWeight: 700,
                  px: 2.25,
                  py: 1.1,
                  textTransform: 'none',
                  '&:hover': { borderColor: gold, color: primaryText },
                }}
              >
                Run Pre-Installed on ZothOS →
              </Button>

              {dedicatedSite && (
                <Button
                  variant="outlined"
                  href={dedicatedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.95rem !important' }} />}
                  sx={{
                    borderColor: emeraldBorder,
                    color: emeraldText,
                    fontWeight: 700,
                    px: 2.25,
                    py: 1.1,
                    textTransform: 'none',
                  }}
                >
                  {dedicatedSite.label}
                </Button>
              )}
            </Stack>
          </HeroItem>

          {tool.id === 'zoth-swarm-multiplexer' && (
            <Box
              sx={{
                mt: 3,
                p: 2.25,
                borderRadius: 2,
                bgcolor: subtleBg,
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ maxWidth: 660 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: gold, mb: 0.4 }}>
                  COMPANION MODEL · ZOTH EGREGORE (BETA)
                </Typography>
                <Typography variant="body2" sx={{ color: primaryText, fontWeight: 600 }}>
                  DeepSeek-Flash fine-tuned agent model orchestrated via Nous Research Hermes &amp; local Zoth tools.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                href="https://github.com/1nc0gn30/zoth-egregore"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, color: primaryText, borderColor: borderCol }}
              >
                1nc0gn30/zoth-egregore
              </Button>
            </Box>
          )}
        </Paper>
      </HeroReveal>

      {/* LOCAL-ONLY Daemon Switcher & Live Web App Iframe when 127.0.0.1:<localPort> is active */}
      {isLocal && tool.localPort && (
        <Paper
          elevation={0}
          id="local-webapp-workstation-deck"
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1.5px solid ${emeraldBorder}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: showLocalIframe ? 2 : 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: emeraldBg, color: emeraldText, display: 'flex', flexShrink: 0 }}>
                <LaunchIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  variant="h6"
                  sx={{
                    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
                    fontWeight: 700,
                    color: primaryText,
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tool.name} · Localhost Daemon (127.0.0.1:{tool.localPort})
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: emeraldText, fontWeight: 700, display: 'block' }}>
                  {!localProbeDone
                    ? `PROBING 127.0.0.1:${tool.localPort} VIA STUDIO DAEMON POOL...`
                    : localWebAppUp
                    ? `LIVE ON 127.0.0.1:${tool.localPort} · SWITCH BETWEEN NATIVE DAEMON & STUDIO DECK`
                    : `DAEMON :${tool.localPort} OFFLINE — RUNNING IN-BROWSER STUDIO GOD-MODE DECK`}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {localWebAppUp && (
                <Button
                  size="small"
                  variant={localViewMode === 'webapp' ? 'contained' : 'outlined'}
                  onClick={() => setLocalViewMode('webapp')}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    bgcolor: localViewMode === 'webapp' ? emeraldText : 'transparent',
                    color: localViewMode === 'webapp' ? '#FFFFFF' : emeraldText,
                    borderColor: emeraldBorder,
                  }}
                >
                  Live Local App (:{tool.localPort})
                </Button>
              )}
              <Button
                size="small"
                variant={localViewMode === 'enclave' || !localWebAppUp ? 'contained' : 'outlined'}
                onClick={() => setLocalViewMode('enclave')}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  bgcolor: localViewMode === 'enclave' || !localWebAppUp ? gold : 'transparent',
                  color: localViewMode === 'enclave' || !localWebAppUp ? (isDark ? '#08080B' : '#FFFFFF') : gold,
                  borderColor: borderCol,
                }}
              >
                Studio God-Mode Deck
              </Button>
              {localWebAppUp && localViewMode === 'webapp' && (
                <IconButton
                  aria-label="Reload local web app iframe"
                  onClick={() => setIframeKey((k) => k + 1)}
                  sx={{ minWidth: 44, minHeight: 44, color: secondaryText, border: `1px solid ${borderCol}` }}
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <Button
                size="small"
                component="a"
                href={tool.localUrl || `http://127.0.0.1:${tool.localPort}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  borderColor: borderCol,
                  color: primaryText,
                }}
              >
                Open :{tool.localPort}
              </Button>
            </Stack>
          </Box>

          {showLocalIframe && (
            <Box
              sx={{
                width: '100%',
                height: { xs: 520, md: 720 },
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${emeraldBorder}`,
                bgcolor: isDark ? '#08080B' : '#FAF7F0',
              }}
            >
              <Box
                key={`${iframeKey}-${isDark ? 'dark' : 'light'}`}
                component="iframe"
                src={
                  tool.id === 'agent-budget-sentinel'
                    ? `${tool.localUrl || `http://127.0.0.1:${tool.localPort}`}?theme=${isDark ? 'dark' : 'light'}&embed=1`
                    : tool.id === 'badge3d-coin-generator' || tool.id === 'azoth-local-agent' || tool.id === 'audiocipher-stego-engine' || tool.id === 'anderson-security-sentinel' || tool.id === 'agent-capsule-jail' || tool.id === 'agent-egress-sentinel' || tool.id === 'agent-flight-recorder' || tool.id === 'agent-gods-eye' || tool.id === 'agent-mock-twin' || tool.id === 'agent-policy-auditor' || tool.id === 'agent-prompt-firewall' || tool.id === 'agent-voice-call'
                    ? `${tool.localUrl || `http://127.0.0.1:${tool.localPort}`}/?embed=1&theme=${isDark ? 'dark' : 'light'}`
                    : (tool.localUrl || `http://127.0.0.1:${tool.localPort}`)
                }
                title={`${tool.name} Local Sovereign Web Application (:${tool.localPort})`}
                sx={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  display: 'block',
                  bgcolor: isDark ? '#08080B' : '#FAF7F0',
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Interactive 100% Open-Access Enclave Workstation & Output Workbench */}
      {!showLocalIframe && (
        <Paper
          elevation={0}
          id="enclave-workstation-deck"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 4,
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1.5px solid ${borderCol}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: subtleBg, color: gold, display: 'flex' }}>
                <TerminalIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  component="h2"
                  variant="h6"
                  sx={{
                    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
                    fontWeight: 700,
                    color: primaryText,
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Interactive Enclave Workstation
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: isBrowserOnly ? emeraldText : gold, fontWeight: 700 }}>
                  {isBrowserOnly
                    ? '100% OPEN-ACCESS CLIENT ENGINE · RUNS DIRECTLY IN YOUR BROWSER'
                    : isHybrid
                    ? 'BROWSER WORKBENCH · CONNECTS TO LOCAL DAEMON WHEN RUNNING ON 127.0.0.1'
                    : isLocal && localWebAppUp
                    ? `LOCAL DAEMON REACHABLE ON 127.0.0.1:${runtimePort} · INTERACTIVE DECK ACTIVE`
                    : 'INTERACTIVE PREVIEW & CLI WORKBENCH · INSTALL CLI OR ZOTHOS FOR LOCAL EXECUTION'}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={
                isBrowserOnly
                  ? '100% IN-BROWSER ENGINE'
                  : isHybrid
                  ? 'HYBRID BROWSER + LOCAL'
                  : 'PREVIEW + LOCAL CLI'
              }
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: isBrowserOnly ? emeraldBg : isDark ? 'rgba(212,175,55,0.12)' : '#FAF6EB',
                color: isBrowserOnly ? emeraldText : gold,
                border: `1px solid ${isBrowserOnly ? emeraldBorder : borderCol}`,
              }}
            />
          </Box>

          {/* Uncommon Web Sub-Pixel U+2800 Braille & Vector Export Strip */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              px: 2,
              py: 1.2,
              mb: 3,
              borderRadius: 2,
              bgcolor: subtleBg,
              border: `1px solid ${borderCol}`,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ maxWidth: '100%' }}>
              <Chip
                label={`⣿ U+2800 ${brailleSignature}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  maxWidth: '100%',
                  bgcolor: cardBg,
                  color: gold,
                  border: `1px solid ${borderCol}`,
                }}
              />
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: secondaryText, fontWeight: 700 }}>
                ░▒▓█ BAYER 8×8 · REALITY: {(reality?.name || 'AURUM').toUpperCase()} ({realityParams?.density || 50}%)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
                onClick={handleCopyBrailleSpec}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  py: 0.3,
                  minHeight: { xs: 44, sm: 34 },
                  textTransform: 'none',
                  color: primaryText,
                  borderColor: borderCol,
                }}
              >
                {copiedTuiSpec ? 'Copied TUI Spec' : 'Copy TUI Braille Spec'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CodeIcon sx={{ fontSize: 14 }} />}
                onClick={handleExportUncommonSvg}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  py: 0.3,
                  minHeight: { xs: 44, sm: 34 },
                  textTransform: 'none',
                  color: gold,
                  borderColor: borderCol,
                }}
              >
                Export Vector .SVG Card
              </Button>
            </Stack>
          </Box>

          <Suspense
            fallback={
              <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={26} sx={{ color: gold }} />
              </Box>
            }
          >
            <ActiveEnclaveComponent tool={tool} />
          </Suspense>
          <Suspense fallback={null}>
            <Box sx={{ mt: 3 }}>
              <SovereignToolOutputWorkbench tool={tool} />
            </Box>
          </Suspense>
        </Paper>
      )}

      {/* 15s Kinetic Motion Showreel Stage */}
      <Box sx={{ mb: 4 }}>
        <Suspense fallback={null}>
          <ToolMotionShowcase
            tool={tool}
            onReplayRouteIntro={() => window.dispatchEvent(new CustomEvent('zoth:replay-intro'))}
          />
        </Suspense>
      </Box>

      {/* Architecture & Capabilities 2-Column Grid */}
      <RevealOnScroll preset="fadeUp">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                width: '100%',
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 1.5,
                }}
              >
                01 · WHY LOCAL-FIRST
              </Typography>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 1.25 }}>
                Purpose &amp; Operational Scope
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7, mb: 3 }}>
                {docs.whyUse}
              </Typography>

              <Divider sx={{ my: 2.5, borderColor: borderCol }} />

              <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
                Problem Solved
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7, mb: 3 }}>
                {docs.problemSolved}
              </Typography>

              <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
                Local Runtime Architecture
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7 }}>
                {docs.architecture}
              </Typography>
            </Paper>
          </Grid>

          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                width: '100%',
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 1.5,
                }}
              >
                02 · CAPABILITY SPECIFICATION
              </Typography>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 2 }}>
                What {tool.name} Does Locally
              </Typography>

              <Stack spacing={1.75}>
                {(docs.features || []).map((feat, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: subtleBg,
                      border: `1px solid ${borderCol}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: '1.1rem',
                        color: emeraldText,
                        mt: 0.25,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: primaryText, lineHeight: 1.6, fontWeight: 500 }}>
                      {feat}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </RevealOnScroll>

      {/* Local CLI Quickstart & MCP Agent Contract */}
      <RevealOnScroll preset="fadeUp">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: gold,
              mb: 1,
            }}
          >
            03 · LOCAL INSTALLATION &amp; AGENT CONTRACT
          </Typography>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 800, color: primaryText, mb: 0.75 }}>
            CLI Quickstart &amp; MCP Interface
          </Typography>
          <Typography variant="body2" sx={{ color: secondaryText, mb: 3, maxWidth: 760 }}>
            {isBrowserOnly
              ? 'Executes directly in your browser above, and can also be cloned to run natively on Linux, macOS, and ZothOS terminals. Autonomous agents invoke it via standardized MCP or JSON CLI flags.'
              : 'Configure and preview commands above inside Zoth Studio, then install the local repository or run pre-installed on ZothOS for live local CLI/daemon execution. Autonomous agents invoke it via standardized MCP or JSON CLI flags.'}
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: primaryText, mb: 1 }}>
                Terminal Quickstart
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: '#0B0E14',
                  border: '1px solid rgba(245,241,230,0.12)',
                  color: '#E2E8F0',
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  lineHeight: 1.75,
                  overflowX: 'auto',
                }}
              >
                {[...(docs.quickstart || [cloneCommand]), ...(docs.cliCommands?.length ? ['# CLI reference', ...docs.cliCommands] : [])].map((line, i) => (
                  <Box key={i} component="div">
                    {line.startsWith('#') ? (
                      <Box component="span" sx={{ color: '#94A3B8' }}>{line}</Box>
                    ) : (
                      <>
                        <Box component="span" sx={{ color: '#D4AF37', userSelect: 'none' }}>$ </Box>
                        <Box component="span">{line}</Box>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: primaryText }}>
                  MCP Tool{docs.aiAgentProtocol?.tools?.length > 1 ? 's' : ''}:{' '}
                  {docs.aiAgentProtocol?.tools?.length
                    ? docs.aiAgentProtocol.tools.map((x) => x.name).join(', ')
                    : docs.aiAgentProtocol?.mcpTool || `${tool.id.replace(/-/g, '_')}_execute`}
                </Typography>
                {docs.aiAgentProtocol?.cliExample && (
                  <IconButton
                    size="small"
                    aria-label="Copy CLI example"
                    onClick={() => copyText(docs.aiAgentProtocol.cliExample, setCopiedMcp)}
                    sx={{ minWidth: 44, minHeight: 44, color: secondaryText }}
                  >
                    {copiedMcp ? <CheckIcon sx={{ fontSize: '0.95rem', color: '#10B981' }} /> : <ContentCopyIcon sx={{ fontSize: '0.95rem' }} />}
                  </IconButton>
                )}
              </Box>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: '#0B0E14',
                  border: '1px solid rgba(245,241,230,0.12)',
                  color: '#6EE7B7',
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  lineHeight: 1.65,
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(
                  docs.aiAgentProtocol?.tools?.length
                    ? {
                        server: docs.aiAgentProtocol.server,
                        cli: docs.aiAgentProtocol.cliExample,
                        tools: docs.aiAgentProtocol.tools,
                      }
                    : {
                        mcpTool: docs.aiAgentProtocol?.mcpTool,
                        cli: docs.aiAgentProtocol?.cliExample,
                        inputSchema: docs.aiAgentProtocol?.inputSchema,
                      },
                  null,
                  2,
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </RevealOnScroll>

      {/* Unified Repository Funnel (100% Open Access; Coffee / Solana support bar lives once in Footer below) */}
      <SovereignFunnel
        toolTitle={`Option 1: ${tool.name}`}
        toolTag={wsEntry ? 'STUDIO WORKSTATION' : 'STANDALONE REPO'}
        toolDescription={
          wsEntry
            ? `Run ${tool.name} directly in-browser or clone zoth-studio-v2 to launch the local loopback workstation and test suite.`
            : `Clone ${tool.repo || tool.id} directly to run its local CLI binary, daemon, and test suite on your machine.`
        }
        toolRepo={repoUrl}
        toolCommand={cloneCommand}
        showSupportStrip={false}
      />
    </Container>
  );
}
