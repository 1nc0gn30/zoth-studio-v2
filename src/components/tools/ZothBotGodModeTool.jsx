import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadText,
  downloadJson,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_DARK = '#38BDF8';
const ACCENT_LIGHT = '#0369A1';

/** Exact ZothOS Security Rings from zoth-bot/server.py & lib/tools.js */
const SECURITY_RINGS = [
  {
    ring: 0,
    layer: 4,
    name: 'SOVEREIGN',
    authority: 'Root, Kernel & Amnesic Authority',
    maxToolClass: 'kernel',
    color: '#EF4444',
  },
  {
    ring: 1,
    layer: 3,
    name: 'SYSADMIN',
    authority: 'System Daemons & Package Control',
    maxToolClass: 'sysadmin',
    color: '#F59E0B',
  },
  {
    ring: 2,
    layer: 2,
    name: 'TOOLMASTER',
    authority: 'Agent Tools, GUI & MCP Runtime',
    maxToolClass: 'toolmaster',
    color: '#38BDF8',
  },
  {
    ring: 3,
    layer: 0,
    name: 'SPECTRE',
    authority: 'Sandboxed Read-Only Telemetry',
    maxToolClass: 'readonly',
    color: '#34D399',
  },
];

/** Exact provider registry from zoth-bot/lib/providers.js */
const PROVIDERS = [
  { id: 'nous', kind: 'cli', engine: 'hermes', label: 'Hermes · Nous', defaultModel: 'nousresearch/hermes-3-llama-3.1-70b', env: [], keyless: true },
  { id: 'grok', kind: 'cli', engine: 'grok', label: 'xAI Grok CLI', defaultModel: 'grok-4.7', env: ['XAI_API_KEY'], keyless: false },
  { id: 'copilot', kind: 'cli', engine: 'hermes', label: 'Hermes · Copilot', defaultModel: 'gpt-5', env: [], keyless: true },
  { id: 'ollama', kind: 'cli', engine: 'hermes', label: 'Hermes · Ollama', defaultModel: 'qwen2.5-coder:7b', env: [], keyless: true },
  { id: 'native', kind: 'cli', engine: 'ollama', label: 'Native Ollama Loop', defaultModel: 'zoth-model:latest', env: [], keyless: true },
  { id: 'xai', kind: 'sdk', engine: 'sdk', label: 'xAI API (Vercel SDK)', defaultModel: 'grok-4', env: ['XAI_API_KEY'], keyless: false },
  { id: 'openai', kind: 'sdk', engine: 'sdk', label: 'OpenAI API (Vercel SDK)', defaultModel: 'gpt-5', env: ['OPENAI_API_KEY'], keyless: false },
  { id: 'anthropic', kind: 'sdk', engine: 'sdk', label: 'Anthropic API (Vercel SDK)', defaultModel: 'claude-sonnet-4-5', env: ['ANTHROPIC_API_KEY'], keyless: false },
  { id: 'google', kind: 'sdk', engine: 'sdk', label: 'Google Gemini API (SDK)', defaultModel: 'gemini-2.5-flash', env: ['GEMINI_API_KEY'], keyless: false },
  { id: 'ollama-sdk', kind: 'sdk', engine: 'sdk', label: 'Ollama (AI SDK, local)', defaultModel: 'qwen2.5:1.5b', env: [], keyless: true },
];

/** Exact Desktop HUD slash commands from zoth-bot/README.md */
const SLASH_COMMANDS = [
  { cmd: '/status', argsHint: '', defaultArgs: '', minRing: 3, category: 'Telemetry', description: 'Probe watched daemon ports, active Security Ring, CPU load, and memory usage.' },
  { cmd: '/provider', argsHint: '[id] [model]', defaultArgs: 'nous nousresearch/hermes-3-llama-3.1-70b', minRing: 2, category: 'Routing', description: 'List or switch direct Vercel AI SDK or CLI neural harnesses.' },
  { cmd: '/ring', argsHint: '<0-3>', defaultArgs: '2', minRing: 1, category: 'Security', description: 'Switch active ZothOS Security Ring (0=Sovereign, 1=Sysadmin, 2=Toolmaster, 3=Spectre).' },
  { cmd: '/hermes', argsHint: '[model]', defaultArgs: 'nousresearch/hermes-3-llama-3.1-70b', minRing: 2, category: 'Routing', description: 'Switch active harness to Nous Research Hermes Agent (--format stream-json).' },
  { cmd: '/grok', argsHint: '[model]', defaultArgs: 'grok-4.7', minRing: 2, category: 'Routing', description: 'Switch active harness to xAI Grok CLI (--output-format streaming-json).' },
  { cmd: '/ollama', argsHint: '[model]', defaultArgs: 'qwen2.5:1.5b', minRing: 3, category: 'Routing', description: 'Switch active harness to local Ollama enclave on 127.0.0.1:11434.' },
  { cmd: '/mcp', argsHint: '[server] [enable|disable]', defaultArgs: 'filesystem enable', minRing: 2, category: 'MCP Hub', description: 'Inspect /etc/zothos/mcp-servers.json or toggle MCP servers via zoth-mcp.' },
  { cmd: '/screen', argsHint: '[pocket-label]', defaultArgs: 'hud-snapshot', minRing: 2, category: 'Workspace', description: 'Capture desktop screenshot into Pocket Workspace.' },
  { cmd: '/pocket', argsHint: '[path]', defaultArgs: 'workspace/', minRing: 3, category: 'Workspace', description: 'Open Pocket Workspace file explorer drawer.' },
  { cmd: '/goal', argsHint: '<text>', defaultArgs: 'Monitor loopback daemons and alert on port drop', minRing: 2, category: 'Memory', description: 'Add a persistent goal for the active teammate in SQLite store.' },
  { cmd: '/remember', argsHint: '<fact>', defaultArgs: 'Portal binds exclusively to Tailscale IP with 0600 token', minRing: 2, category: 'Memory', description: 'Append a durable memory entry to teammate memory.md.' },
  { cmd: '/key', argsHint: '<provider> <secret>', defaultArgs: 'xai <REDACTED_SAFE_STORAGE>', minRing: 1, category: 'Keyring', description: 'Encrypt and store provider API key via Electron safeStorage (KWallet/libsecret).' },
];

const CHANNELS = [
  { id: 'desktop-hud', label: 'Desktop HUD (488×800)', transport: 'electron-ipc', auth: 'local-session' },
  { id: 'compact-orb', label: 'Compact Orb (220×220)', transport: 'electron-ipc', auth: 'local-session' },
  { id: 'mobile-portal', label: 'Tailscale Mobile Portal (:9335)', transport: 'http-tailscale', auth: 'portal-token-0600' },
  { id: 'wear-os', label: 'Wear OS Companion', transport: 'watch-server-ws', auth: 'portal-token-0600' },
  { id: 'loopback-cli', label: 'ZothOS CLI / Loopback (:8146)', transport: 'http-loopback', auth: 'loopback-only' },
];

const LOCAL_TOOLS = [
  { id: 'host_status', label: 'host_status', kind: 'readonly', minRing: 3, defaultPolicy: 'allow' },
  { id: 'list_files', label: 'list_files', kind: 'readonly', minRing: 3, defaultPolicy: 'allow' },
  { id: 'read_file', label: 'read_file', kind: 'readonly', minRing: 3, defaultPolicy: 'allow' },
  { id: 'clipboard_read', label: 'clipboard_read', kind: 'toolmaster', minRing: 2, defaultPolicy: 'allow' },
  { id: 'screenshot', label: 'screenshot', kind: 'toolmaster', minRing: 2, defaultPolicy: 'approve' },
  { id: 'clipboard_write', label: 'clipboard_write', kind: 'toolmaster', minRing: 2, defaultPolicy: 'approve' },
  { id: 'write_file', label: 'write_file', kind: 'toolmaster', minRing: 2, defaultPolicy: 'approve' },
  { id: 'run_command', label: 'run_command', kind: 'sysadmin', minRing: 1, defaultPolicy: 'approve' },
];

const MCP_SERVERS = [
  { name: 'filesystem', ring: 2, description: 'Local workspace file read/write bridge', defaultEnabled: true },
  { name: 'memory', ring: 2, description: 'STDP & teammate memory graph store', defaultEnabled: true },
  { name: 'zoth-relay', ring: 1, description: 'Tailscale & mobile relay dispatcher', defaultEnabled: true },
  { name: 'ghidra-bridge', ring: 2, description: 'Headless binary reverse-engineering bridge', defaultEnabled: false },
  { name: 'shodan-sentinel', ring: 2, description: 'Surface telemetry & exposure audit', defaultEnabled: false },
];

const WATCHED_PORTS = [
  { name: 'Studio', host: '127.0.0.1', port: 3000 },
  { name: 'WebGen', host: '127.0.0.1', port: 5173 },
  { name: 'ZothBot', host: '127.0.0.1', port: 8146 },
  { name: 'Relay', host: '127.0.0.1', port: 8765 },
  { name: 'Vault', host: '127.0.0.1', port: 8787 },
  { name: 'Portal', host: '127.0.0.1', port: 9335 },
  { name: 'Civilization', host: '127.0.0.1', port: 9393 },
  { name: 'Ollama', host: '127.0.0.1', port: 11434 },
];

/** Exact modelFits logic from zoth-bot/lib/providers.js */
function modelFits(providerId, model) {
  const m = String(model || '').trim();
  if (!m) return false;
  switch (providerId) {
    case 'grok':
    case 'xai':
      return m.startsWith('grok');
    case 'nous':
      return m.includes('/');
    case 'openai':
      return /^(gpt|o\d|chatgpt)/.test(m);
    case 'anthropic':
      return m.startsWith('claude');
    case 'google':
      return m.startsWith('gemini');
    case 'copilot':
      return !m.includes('/');
    default:
      return !m.includes('/');
  }
}

/** Deterministic YAML serializer (no external dependency) */
function toYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (value === '' || /[:#[\]{}&*!|>'"%@`\n]/.test(value) || /^\s|\s$/.test(value)) {
      return JSON.stringify(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object') {
          const nested = toYaml(item, indent + 1);
          const lines = nested.split('\n');
          return `${pad}- ${lines[0].trimStart()}\n${lines.slice(1).join('\n')}`.trimEnd();
        }
        return `${pad}- ${toYaml(item, indent + 1)}`;
      })
      .join('\n');
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';
  return entries
    .map(([k, v]) => {
      if (v !== null && typeof v === 'object') {
        const isEmptyObj = !Array.isArray(v) && Object.keys(v).length === 0;
        const isEmptyArr = Array.isArray(v) && v.length === 0;
        if (isEmptyObj || isEmptyArr) return `${pad}${k}: ${isEmptyArr ? '[]' : '{}'}`;
        return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
      }
      return `${pad}${k}: ${toYaml(v, indent)}`;
    })
    .join('\n');
}

const INITIAL_TOOL_POLICIES = Object.fromEntries(
  LOCAL_TOOLS.map((t) => [t.id, t.defaultPolicy]),
);

const INITIAL_MCP_ENABLED = Object.fromEntries(
  MCP_SERVERS.map((s) => [s.name, s.defaultEnabled]),
);

const INITIAL_TRIGGERS = [
  { id: 'trg-1', hotkey: 'Ctrl+Shift+Space', command: '/status', channel: 'desktop-hud', enabled: true },
  { id: 'trg-2', hotkey: 'Super+Shift+Z', command: '/mcp', channel: 'desktop-hud', enabled: true },
];

export default function ZothBotGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  // 1. Command & Trigger Builder state
  const [selectedCmd, setSelectedCmd] = useState(SLASH_COMMANDS[0].cmd);
  const [cmdArgs, setCmdArgs] = useState(SLASH_COMMANDS[0].defaultArgs);
  const [activeChannel, setActiveChannel] = useState('desktop-hud');
  const [hotkeyBinding, setHotkeyBinding] = useState('Ctrl+Shift+Space');
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS);

  // 2. Routing, Security Ring & Channel Policy state
  const [activeRing, setActiveRing] = useState(2);
  const [providerId, setProviderId] = useState('nous');
  const [modelName, setModelName] = useState('nousresearch/hermes-3-llama-3.1-70b');
  const [windowMode, setWindowMode] = useState('expanded');
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [portalHost, setPortalHost] = useState('127.0.0.1');
  const [portalPort, setPortalPort] = useState('9335');
  const [portalAuthHeader, setPortalAuthHeader] = useState('x-zoth-token');
  const [wearEnabled, setWearEnabled] = useState(true);
  const [toolPolicies, setToolPolicies] = useState(INITIAL_TOOL_POLICIES);
  const [mcpEnabled, setMcpEnabled] = useState(INITIAL_MCP_ENABLED);

  // 3. Config export format toggle
  const [configFormat, setConfigFormat] = useState('json');

  const ringMeta = useMemo(
    () => SECURITY_RINGS.find((r) => r.ring === activeRing) || SECURITY_RINGS[2],
    [activeRing],
  );
  const providerMeta = useMemo(
    () => PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0],
    [providerId],
  );
  const cmdMeta = useMemo(
    () => SLASH_COMMANDS.find((c) => c.cmd === selectedCmd) || SLASH_COMMANDS[0],
    [selectedCmd],
  );
  const channelMeta = useMemo(
    () => CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0],
    [activeChannel],
  );

  const modelValid = useMemo(() => modelFits(providerId, modelName), [providerId, modelName]);

  const handleSelectCommand = (cmdObj) => {
    setSelectedCmd(cmdObj.cmd);
    setCmdArgs(cmdObj.defaultArgs);
  };

  const handleSelectProvider = (p) => {
    setProviderId(p.id);
    setModelName(p.defaultModel);
  };

  const cycleToolPolicy = (toolId) => {
    const order = ['allow', 'approve', 'deny'];
    setToolPolicies((prev) => {
      const idx = order.indexOf(prev[toolId] || 'approve');
      return { ...prev, [toolId]: order[(idx + 1) % order.length] };
    });
  };

  const fullCommandLine = useMemo(() => {
    const argsClean = cmdArgs.trim();
    if (selectedCmd === '/key' && argsClean) {
      const parts = argsClean.split(/\s+/);
      const masked = parts.length > 1 ? `${parts[0]} <SAFE_STORAGE_ENCRYPTED>` : parts[0];
      return `${selectedCmd} ${masked}`;
    }
    return argsClean ? `${selectedCmd} ${argsClean}` : selectedCmd;
  }, [selectedCmd, cmdArgs]);

  const handleAddTrigger = () => {
    const hk = hotkeyBinding.trim() || 'Ctrl+Shift+Space';
    setTriggers((prev) => [
      ...prev,
      {
        id: `trg-${Date.now()}`,
        hotkey: hk,
        command: fullCommandLine,
        channel: activeChannel,
        enabled: true,
      },
    ]);
  };

  const handleRemoveTrigger = (id) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetAll = () => {
    setSelectedCmd(SLASH_COMMANDS[0].cmd);
    setCmdArgs(SLASH_COMMANDS[0].defaultArgs);
    setActiveChannel('desktop-hud');
    setHotkeyBinding('Ctrl+Shift+Space');
    setTriggers(INITIAL_TRIGGERS);
    setActiveRing(2);
    setProviderId('nous');
    setModelName('nousresearch/hermes-3-llama-3.1-70b');
    setWindowMode('expanded');
    setAlwaysOnTop(true);
    setPortalEnabled(true);
    setPortalHost('127.0.0.1');
    setPortalPort('9335');
    setPortalAuthHeader('x-zoth-token');
    setWearEnabled(true);
    setToolPolicies(INITIAL_TOOL_POLICIES);
    setMcpEnabled(INITIAL_MCP_ENABLED);
  };

  // Deterministic Dry-Run Evaluation Engine
  const dryRun = useMemo(() => {
    const checks = [];
    let verdict = 'ALLOWED';

    // Ring authority check: lower ring number = higher privilege (0 is highest, 3 is lowest)
    const ringPermitted = activeRing <= cmdMeta.minRing;
    if (!ringPermitted) {
      verdict = 'DENIED_BY_RING';
      checks.push({
        severity: 'error',
        code: 'RING_INSUFFICIENT',
        detail: `${cmdMeta.cmd} requires Ring ${cmdMeta.minRing} or lower (higher privilege), but active ring is Ring ${activeRing} (${ringMeta.name}).`,
      });
    } else {
      checks.push({
        severity: 'ok',
        code: 'RING_AUTHORIZED',
        detail: `Ring ${activeRing} (${ringMeta.name}, layer ${ringMeta.layer}) satisfies minimum authority Ring ${cmdMeta.minRing}.`,
      });
    }

    // Channel availability check
    if (activeChannel === 'mobile-portal' && !portalEnabled) {
      verdict = 'DENIED_BY_CHANNEL';
      checks.push({
        severity: 'error',
        code: 'PORTAL_DISABLED',
        detail: `Mobile Edge Portal (:${portalPort}) is disabled in channel policy.`,
      });
    } else if (activeChannel === 'wear-os' && !wearEnabled) {
      verdict = 'DENIED_BY_CHANNEL';
      checks.push({
        severity: 'error',
        code: 'WEAR_DISABLED',
        detail: 'Wear OS companion bridge is disabled in channel policy.',
      });
    }

    // Provider model compatibility check
    if (!modelValid) {
      checks.push({
        severity: 'warning',
        code: 'MODEL_MISMATCH',
        detail: `Model "${modelName || '(empty)'}" does not match provider "${providerId}" validation rule in lib/providers.js.`,
      });
    }

    // SDK keyring warning
    if (!providerMeta.keyless) {
      checks.push({
        severity: 'info',
        code: 'KEYRING_REQUIRED',
        detail: `${providerMeta.label} expects ${providerMeta.env.join(' or ')} via OS keyring (safeStorage keys.enc.json).`,
      });
    }

    // Sensitive command approval check
    const approvalTools = LOCAL_TOOLS.filter(
      (t) => toolPolicies[t.id] === 'approve' && activeRing <= t.minRing,
    );
    const blockedTools = LOCAL_TOOLS.filter(
      (t) => toolPolicies[t.id] === 'deny' || activeRing > t.minRing,
    );
    const allowedTools = LOCAL_TOOLS.filter(
      (t) => toolPolicies[t.id] === 'allow' && activeRing <= t.minRing,
    );

    if (
      verdict === 'ALLOWED' &&
      ((selectedCmd === '/screen' && toolPolicies.screenshot === 'approve') ||
        selectedCmd === '/ring' ||
        selectedCmd === '/key')
    ) {
      verdict = 'APPROVAL_REQUIRED';
      checks.push({
        severity: 'warning',
        code: 'HUMAN_GATE',
        detail: `${selectedCmd} triggers an explicit confirmation prompt in main.js before mutating host state or keyring.`,
      });
    }

    // MCP ring violations
    const activeMcpServers = MCP_SERVERS.filter((s) => Boolean(mcpEnabled[s.name]));
    const ringBlockedMcp = activeMcpServers.filter((s) => activeRing > s.ring);
    ringBlockedMcp.forEach((s) => {
      checks.push({
        severity: 'warning',
        code: 'MCP_RING_CLAMPED',
        detail: `MCP server "${s.name}" requires Ring ${s.ring} but is clamped under Ring ${activeRing} (${ringMeta.name}).`,
      });
    });

    const parsedPort = Number.parseInt(portalPort, 10) || 9335;
    const simulatedPayload = {
      dry_run: true,
      verdict,
      dispatch: {
        command: fullCommandLine,
        command_base: selectedCmd,
        channel: {
          id: channelMeta.id,
          transport: channelMeta.transport,
          auth: channelMeta.auth,
          ...(activeChannel === 'mobile-portal'
            ? {
                endpoint: `http://${portalHost.trim() || '127.0.0.1'}:${parsedPort}/api/command`,
                headers: {
                  [portalAuthHeader]: '<REDACTED_0600_PORTAL_TOKEN>',
                  'content-type': 'application/json',
                },
              }
            : activeChannel === 'loopback-cli'
              ? { endpoint: 'http://127.0.0.1:8146/api/status' }
              : { ipc_channel: 'zoth-bot:hud-command' }),
        },
      },
      security_context: {
        active_ring: activeRing,
        ring_name: ringMeta.name,
        zoth_layer: ringMeta.layer,
        command_min_ring: cmdMeta.minRing,
        authorized: ringPermitted,
      },
      neural_router: {
        provider: providerMeta.id,
        kind: providerMeta.kind,
        engine: providerMeta.engine,
        model: modelName.trim() || providerMeta.defaultModel,
        model_fits_provider: modelValid,
        keyless: providerMeta.keyless,
      },
      effective_capabilities: {
        tools_allow: allowedTools.map((t) => t.id),
        tools_approval_gated: approvalTools.map((t) => t.id),
        tools_denied_or_clamped: blockedTools.map((t) => t.id),
        mcp_active: activeMcpServers.filter((s) => activeRing <= s.ring).map((s) => s.name),
        mcp_clamped: ringBlockedMcp.map((s) => s.name),
      },
    };

    return {
      verdict,
      checks,
      allowedTools,
      approvalTools,
      blockedTools,
      activeMcpServers,
      ringBlockedMcp,
      payloadJson: JSON.stringify(simulatedPayload, null, 2),
    };
  }, [
    activeRing,
    ringMeta,
    cmdMeta,
    activeChannel,
    channelMeta,
    portalEnabled,
    portalHost,
    portalPort,
    portalAuthHeader,
    wearEnabled,
    providerId,
    providerMeta,
    modelName,
    modelValid,
    toolPolicies,
    mcpEnabled,
    selectedCmd,
    fullCommandLine,
  ]);

  // Downloadable configuration object
  const botConfig = useMemo(() => {
    const parsedPort = Number.parseInt(portalPort, 10) || 9335;
    return {
      schema: 'zoth-bot.config/v1',
      version: '1.0.0',
      loopback_server: {
        host: '127.0.0.1',
        port: 8146,
        endpoints: ['/health', '/api/health', '/api/status', '/api/rings', '/api/mcp'],
      },
      desktop_stage: {
        compact: windowMode === 'compact',
        dimensions: windowMode === 'compact' ? { w: 220, h: 220 } : { w: 488, h: 800 },
        alwaysOnTop,
        summon_hotkeys: Array.from(new Set(triggers.map((t) => t.hotkey))),
      },
      security_ring: {
        active_ring: activeRing,
        ring_name: ringMeta.name,
        layer: ringMeta.layer,
      },
      neural_routing: {
        provider: providerMeta.id,
        kind: providerMeta.kind,
        engine: providerMeta.engine,
        model: modelName.trim() || providerMeta.defaultModel,
        ollama_base_url: 'http://127.0.0.1:11434',
        keyring_storage: 'electron-safeStorage (keys.enc.json)',
      },
      mobile_edge_portal: {
        enabled: portalEnabled,
        ZOTH_PORTAL_HOST: portalHost.trim() || '127.0.0.1',
        ZOTH_PORTAL_PORT: parsedPort,
        auth_header: portalAuthHeader,
        token_file_mode: '0600',
        wear_os_companion: wearEnabled,
      },
      tool_policies: toolPolicies,
      mcp_servers: Object.fromEntries(
        MCP_SERVERS.map((s) => [
          s.name,
          {
            enabled: Boolean(mcpEnabled[s.name]),
            ring_level: s.ring,
            effective_under_current_ring: Boolean(mcpEnabled[s.name]) && activeRing <= s.ring,
          },
        ]),
      ),
      triggers: triggers.map((t) => ({
        hotkey: t.hotkey,
        command: t.command,
        channel: t.channel,
        enabled: t.enabled,
      })),
      watched_services: WATCHED_PORTS,
    };
  }, [
    windowMode,
    alwaysOnTop,
    triggers,
    activeRing,
    ringMeta,
    providerMeta,
    modelName,
    portalEnabled,
    portalHost,
    portalPort,
    portalAuthHeader,
    wearEnabled,
    toolPolicies,
    mcpEnabled,
  ]);

  const configJsonText = useMemo(() => JSON.stringify(botConfig, null, 2), [botConfig]);
  const configYamlText = useMemo(() => toYaml(botConfig), [botConfig]);

  const cliSnippet = useMemo(() => {
    const parsedPort = Number.parseInt(portalPort, 10) || 9335;
    return [
      '# 1. Start Zoth Bot loopback telemetry server on http://127.0.0.1:8146',
      'cd ~/NullAITech/zoth-bot && python3 server.py --host 127.0.0.1 --port 8146',
      '',
      '# 2. Launch 3D WebGL Electron desktop companion (summon: Ctrl+Shift+Space / Super+Shift+Z)',
      `ZOTH_PORTAL_HOST=${portalHost.trim() || '127.0.0.1'} ZOTH_PORTAL_PORT=${parsedPort} npm start`,
      '',
      '# 3. Inspect ZothOS v3.4.0 CLI status, Security Rings, Harnesses & MCP registry',
      'zoth-bot --status',
      'zoth-bot --rings --json',
      'zoth-bot --mcp --json',
      'zoth-bot --harnesses',
      'zoth-bot-tui',
      '',
      '# 4. Probe loopback HTTP endpoints on :8146',
      'curl -s http://127.0.0.1:8146/health | jq .',
      'curl -s http://127.0.0.1:8146/api/status | jq .',
    ].join('\n');
  }, [portalHost, portalPort]);

  const verdictColor =
    dryRun.verdict === 'ALLOWED'
      ? SOV.emerald
      : dryRun.verdict === 'APPROVAL_REQUIRED'
        ? SOV.amber
        : SOV.crimson;
  const verdictTone =
    dryRun.verdict === 'ALLOWED'
      ? 'online'
      : dryRun.verdict === 'APPROVAL_REQUIRED'
        ? 'standby'
        : 'offline';

  const kpis = [
    {
      label: 'Security Ring',
      value: `Ring ${activeRing}`,
      unit: ringMeta.name,
      accent: ringMeta.color,
    },
    {
      label: 'Neural Route',
      value: providerMeta.id,
      unit: modelValid ? providerMeta.kind.toUpperCase() : 'MODEL MISMATCH',
      accent: modelValid ? ACCENT_DARK : SOV.amber,
    },
    {
      label: 'Dry-Run Verdict',
      value: dryRun.verdict === 'ALLOWED' ? 'PASS' : dryRun.verdict === 'APPROVAL_REQUIRED' ? 'GATE' : 'DENY',
      unit: selectedCmd,
      accent: verdictColor,
    },
    {
      label: 'Active MCP / Tools',
      value: `${dryRun.activeMcpServers.length - dryRun.ringBlockedMcp.length}/${MCP_SERVERS.length}`,
      unit: `${dryRun.allowedTools.length} allow · ${dryRun.approvalTools.length} gate`,
      accent: SOV.emerald,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={verdictTone}
        label={`${dryRun.verdict} · RING ${activeRing} (${ringMeta.name}) · ${providerMeta.label}`}
        accent={verdictColor}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'cfg' ? `Copied ${configFormat.toUpperCase()}` : `Copy ${configFormat.toUpperCase()} Config`,
      icon: copied === 'cfg' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(configFormat === 'json' ? configJsonText : configYamlText, 'cfg'),
      primary: true,
    },
    {
      label: 'Download .json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(botConfig, 'zoth-bot.config.json'),
    },
    {
      label: 'Download .yaml',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(configYamlText, 'zoth-bot.config.yaml', 'text/yaml;charset=utf-8'),
    },
    {
      label: copied === 'cli' ? 'Copied Daemon CLI' : 'Copy Daemon CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <TerminalIcon fontSize="small" />,
      onClick: () => copy(cliSnippet, 'cli'),
    },
    {
      label: 'Reset Defaults',
      icon: <RestartAltIcon fontSize="small" />,
      onClick: handleResetAll,
    },
    {
      label: 'zoth-bot on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/zoth-bot',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="DESKTOP HUD SLASH COMMANDS & SUMMON TRIGGERS"
        title="Command & Trigger Builder"
        subtitle="Select any native zoth-bot HUD slash command, choose the ingress channel, bind summon hotkeys, and inspect dry-run policy enforcement live."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
            {SLASH_COMMANDS.map((c) => {
              const active = selectedCmd === c.cmd;
              return (
                <Chip
                  key={c.cmd}
                  label={c.cmd}
                  clickable
                  onClick={() => handleSelectCommand(c)}
                  sx={{
                    minHeight: 36,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.primary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                  }}
                />
              );
            })}
          </Box>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.25,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.025)',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.4 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: accent }}>
                {cmdMeta.cmd} {cmdMeta.argsHint}
              </Typography>
              <Chip
                size="small"
                label={`MIN RING ${cmdMeta.minRing}`}
                sx={{
                  height: 22,
                  fontFamily: MONO,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: rgba(accent, 0.14),
                  color: accent,
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {cmdMeta.description}
            </Typography>
          </Box>

          <TextField
            size="small"
            fullWidth
            label={`Arguments for ${selectedCmd} ${cmdMeta.argsHint || '(optional)'}`}
            value={cmdArgs}
            onChange={(e) => setCmdArgs(e.target.value)}
            helperText={
              selectedCmd === '/key'
                ? 'Secrets are automatically redacted in exported JSON/YAML and stored via OS keyring safeStorage locally.'
                : `Resolved dispatch string: ${fullCommandLine}`
            }
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.7 }}>
              INGRESS CHANNEL
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
              {CHANNELS.map((ch) => {
                const active = activeChannel === ch.id;
                return (
                  <Chip
                    key={ch.id}
                    label={ch.label}
                    clickable
                    onClick={() => setActiveChannel(ch.id)}
                    sx={{
                      minHeight: 36,
                      fontFamily: MONO,
                      fontSize: '0.7rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.primary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Summon Hotkey Binding"
              value={hotkeyBinding}
              onChange={(e) => setHotkeyBinding(e.target.value)}
              sx={{ flex: '1 1 180px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleAddTrigger}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: accent,
                color: isDark ? '#07090F' : '#FFFFFF',
                '&:hover': { bgcolor: accent },
              }}
            >
              Bind Trigger
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
            {triggers.map((t) => (
              <Box
                key={t.id}
                sx={{
                  px: 1.15,
                  py: 0.75,
                  borderRadius: 1.25,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
                    {t.hotkey} → {t.command}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.65rem', color: 'text.secondary' }}>
                    Channel: {t.channel}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleRemoveTrigger(t.id)}
                  aria-label={`Remove trigger ${t.hotkey}`}
                  sx={{ minWidth: 36, minHeight: 36, p: 0.5, color: 'text.secondary' }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="SECURITY RINGS (0–3) · NEURAL ROUTER · CHANNEL POLICY"
        title="Routing, Ring Authority & MCP Policy Editor"
        subtitle="Configure active ZothOS Security Ring, CLI/SDK neural harness, per-tool approval gates, MCP servers, and Tailscale mobile portal policy."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              ACTIVE ZOTHOS SECURITY RING
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.85 }}>
              {SECURITY_RINGS.map((r) => {
                const active = activeRing === r.ring;
                const modeCol = resolveModeAccent(r.color, isDark);
                return (
                  <Box
                    key={r.ring}
                    onClick={() => setActiveRing(r.ring)}
                    sx={{
                      p: 1.1,
                      borderRadius: 1.25,
                      cursor: 'pointer',
                      border: `1px solid ${active ? modeCol : 'rgba(148,163,184,0.3)'}`,
                      bgcolor: active ? rgba(r.color, isDark ? 0.14 : 0.08) : 'transparent',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 800, color: active ? modeCol : 'text.primary' }}>
                        RING {r.ring} · {r.name}
                      </Typography>
                      <ShieldOutlinedIcon sx={{ fontSize: '0.95rem', color: modeCol }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                      {r.authority} (Layer {r.layer})
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              NEURAL HARNESS & VERCEL AI SDK ROUTER (lib/providers.js)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 1.25 }}>
              {PROVIDERS.map((p) => {
                const active = providerId === p.id;
                return (
                  <Chip
                    key={p.id}
                    label={`${p.id} (${p.kind.toUpperCase()})`}
                    clickable
                    onClick={() => handleSelectProvider(p)}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.7rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.primary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              size="small"
              fullWidth
              label={`Model Identifier (${providerMeta.label})`}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              error={!modelValid}
              helperText={
                modelValid
                  ? `Valid model string for ${providerMeta.id} · ${providerMeta.keyless ? 'Keyless local/CLI' : `Keyring env: ${providerMeta.env.join(', ')}`}`
                  : `Model does not pass lib/providers.js modelFits("${providerMeta.id}", model) check (default: ${providerMeta.defaultModel}).`
              }
              sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              LOCAL TOOL APPROVAL POLICY (CLICK TO CYCLE ALLOW → APPROVE → DENY)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
              {LOCAL_TOOLS.map((tool) => {
                const pol = toolPolicies[tool.id];
                const ringClamped = activeRing > tool.minRing;
                const col = ringClamped || pol === 'deny' ? SOV.crimson : pol === 'approve' ? SOV.amber : SOV.emerald;
                const modeCol = resolveModeAccent(col, isDark);
                return (
                  <Chip
                    key={tool.id}
                    clickable
                    onClick={() => cycleToolPolicy(tool.id)}
                    label={`${tool.label}: ${ringClamped ? `CLAMPED (R${tool.minRing})` : pol.toUpperCase()}`}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: rgba(col, isDark ? 0.14 : 0.08),
                      color: modeCol,
                      border: `1px solid ${rgba(modeCol, 0.45)}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              MCP SERVER REGISTRY (/etc/zothos/mcp-servers.json)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
              {MCP_SERVERS.map((srv) => {
                const on = Boolean(mcpEnabled[srv.name]);
                const clamped = on && activeRing > srv.ring;
                const col = clamped ? SOV.amber : on ? SOV.emerald : '#94A3B8';
                const modeCol = resolveModeAccent(col, isDark);
                return (
                  <Chip
                    key={srv.name}
                    clickable
                    onClick={() => setMcpEnabled((prev) => ({ ...prev, [srv.name]: !prev[srv.name] }))}
                    label={`${srv.name} · R${srv.ring} · ${on ? (clamped ? 'CLAMPED' : 'ON') : 'OFF'}`}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      fontWeight: on ? 700 : 500,
                      bgcolor: on ? rgba(col, isDark ? 0.14 : 0.08) : 'transparent',
                      color: on ? modeCol : 'text.secondary',
                      border: `1px solid ${on ? rgba(modeCol, 0.45) : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
              ELECTRON STAGE & TAILSCALE MOBILE EDGE PORTAL (:9335)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch size="small" checked={portalEnabled} onChange={(e) => setPortalEnabled(e.target.checked)} />}
                label={<Typography sx={{ fontFamily: MONO, fontSize: '0.73rem' }}>Mobile Portal (:9335)</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" checked={wearEnabled} onChange={(e) => setWearEnabled(e.target.checked)} />}
                label={<Typography sx={{ fontFamily: MONO, fontSize: '0.73rem' }}>Wear OS Bridge</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" checked={alwaysOnTop} onChange={(e) => setAlwaysOnTop(e.target.checked)} />}
                label={<Typography sx={{ fontFamily: MONO, fontSize: '0.73rem' }}>Always On Top</Typography>}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <TextField
                size="small"
                label="ZOTH_PORTAL_HOST"
                value={portalHost}
                onChange={(e) => setPortalHost(e.target.value)}
                sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
              />
              <TextField
                size="small"
                label="ZOTH_PORTAL_PORT"
                value={portalPort}
                onChange={(e) => setPortalPort(e.target.value)}
                sx={{ width: 140, '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
              />
              <Box sx={{ display: 'flex', gap: 0.65, alignItems: 'center' }}>
                {[
                  { id: 'expanded', label: 'HUD 488×800' },
                  { id: 'compact', label: 'Orb 220×220' },
                ].map((m) => (
                  <Chip
                    key={m.id}
                    size="small"
                    label={m.label}
                    clickable
                    onClick={() => setWindowMode(m.id)}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.69rem',
                      fontWeight: windowMode === m.id ? 700 : 500,
                      bgcolor: windowMode === m.id ? rgba(accent, 0.16) : 'transparent',
                      color: windowMode === m.id ? accent : 'text.secondary',
                      border: `1px solid ${windowMode === m.id ? accent : 'rgba(148,163,184,0.3)'}`,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="DETERMINISTIC CLIENT-SIDE SIMULATOR"
        title={`Dry-Run Payload & Policy Inspector (${dryRun.verdict})`}
        subtitle="Evaluates Security Ring authority, channel gating, model-fit rules, and effective tool/MCP capabilities before dispatching to local Electron IPC or :9335."
        accent={verdictColor}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.75 }}>
          {dryRun.checks.map((chk, idx) => {
            const col =
              chk.severity === 'error'
                ? SOV.crimson
                : chk.severity === 'warning'
                  ? SOV.amber
                  : chk.severity === 'ok'
                    ? SOV.emerald
                    : ACCENT_DARK;
            const modeCol = resolveModeAccent(col, isDark);
            const IconComp =
              chk.severity === 'error'
                ? ErrorOutlineIcon
                : chk.severity === 'warning'
                  ? WarningAmberIcon
                  : CheckCircleOutlineIcon;
            return (
              <Box
                key={`${chk.code}-${idx}`}
                sx={{
                  p: 1.1,
                  borderRadius: 1.25,
                  borderLeft: `3px solid ${modeCol}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <IconComp fontSize="small" sx={{ color: modeCol, mt: 0.1 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', fontWeight: 800, color: modeCol }}>
                    {chk.code}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {chk.detail}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <SovereignCodeBlock
          title="DRY-RUN DISPATCH PAYLOAD"
          badge={dryRun.verdict}
          code={dryRun.payloadJson}
          filename="zoth-bot-dry-run.json"
          accent={verdictColor}
          maxHeight={300}
        />
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="EXPORTABLE DAEMON & POLICY MANIFEST"
        title={configFormat === 'json' ? 'zoth-bot.config.json' : 'zoth-bot.config.yaml'}
        subtitle="Zero plaintext API keys — exports neural routing, Security Ring state, MCP flags, summon hotkeys, and Mobile Edge Portal bounds."
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.5 }}>
          {[
            { id: 'json', label: 'JSON Config (.json)' },
            { id: 'yaml', label: 'YAML Config (.yaml)' },
          ].map((tab) => {
            const active = configFormat === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setConfigFormat(tab.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={configFormat === 'json' ? 'zoth-bot.config.json' : 'zoth-bot.config.yaml'}
          badge={configFormat === 'json' ? 'JSON' : 'YAML'}
          code={configFormat === 'json' ? configJsonText : configYamlText}
          filename={configFormat === 'json' ? 'zoth-bot.config.json' : 'zoth-bot.config.yaml'}
          accent={ACCENT_DARK}
          maxHeight={300}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="LOCAL LOOPBACK DAEMON (:8146) · ZOTHOS CLI"
        title="Local Daemon & CLI Commands"
        subtitle="Exact commands for server.py (:8146), Electron 3D companion, Tailscale portal (:9335), and bin/zoth-bot"
        accent={ACCENT_DARK}
      >
        <SovereignCodeBlock
          title="ZOTH-BOT DAEMON & CLI REFERENCE"
          badge="BASH · :8146 / :9335"
          code={cliSnippet}
          filename="zoth-bot-daemon.sh"
          accent={ACCENT_DARK}
          maxHeight={240}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Disclosure · Client-Side Policy & Dry-Run Workbench"
          message="Command synthesis, Security Ring (0–3) authority simulation, lib/providers.js model validation, and JSON/YAML config exports run 100% locally in your browser with zero remote fetches. To run the 3D WebGL Electron companion, OS keyring safeStorage, or loopback telemetry server, start python3 server.py --port 8146 and npm start in ~/NullAITech/zoth-bot."
        />
      </Box>
      <SovereignWorkstationShell
        id="zoth-bot"
        category="SWARM & CORE · DESKTOP COMPANION"
        title="Zoth Bot Companion Workbench"
        subtitle="Interactive HUD slash-command & hotkey trigger builder, ZothOS Security Ring (0–3) & multi-harness neural router policy editor, deterministic dry-run payload inspector, and downloadable JSON/YAML config generator."
        version="1.0.0"
        variant="hex-lattice"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={6}
        rightCols={6}
      />
    </Box>
  );
}
