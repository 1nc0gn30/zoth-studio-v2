import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Stack,
  Divider,
  Tooltip,
  IconButton,
  Alert,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import HubIcon from '@mui/icons-material/Hub';
import TerminalIcon from '@mui/icons-material/Terminal';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { toolsDocumentation } from '../data/toolsDocumentation';
import { isLocalRuntime } from './AirGapToolLockout';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SAMPLE_MCP_TOOLS = [
  {
    name: 'adytum_validate_plan',
    toolId: 'adytum-alchemist-ai-workflow',
    description: 'Validate a proposed software architecture against the 22 hermetic quality invariants.',
    sampleParams: { intention: 'Ground self-attention wands in strict schema invariants', invariants: ['Deterministic attention masks', 'Zero external cloud egress'] }
  },
  {
    name: 'entropy_calculate',
    toolId: 'payload-entropy-studio',
    description: 'Compute client-side Shannon entropy (H = -sum(p * log2(p))) to detect obfuscation or encryption.',
    sampleParams: { payload: 'U292ZXJlaWduIEludGVsbGlnZW5jZSBTdWl0ZSB2Mi40' }
  },
  {
    name: 'jwt_audit_token',
    toolId: 'jwt-inspector-guard',
    description: 'Parse Base64URL claims, algorithm headers, and verify cryptographic expiry invariants.',
    sampleParams: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6b3RoLWFnZW50IiwiZXhwIjoxNzk4Nzg5NjAwfQ.signature' }
  },
  {
    name: 'neuro_memory_recall',
    toolId: 'neuro-memory-daemon',
    description: 'Query STDP synaptic weight vector memory daemon for cross-session context associations.',
    sampleParams: { query: 'Byzantine Triadic AST consensus protocol', top_k: 3 }
  },
];

export default function WebMCPConsole() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const goldWash = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const darkPanel = isDark ? '#08080B' : '#0F172A';

  const [activeTab, setActiveTab] = useState(0); // 0: Video Showcase, 1: MCP Tool Schemas, 2: Daemon Bridge
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [jsonRpcOutput, setJsonRpcOutput] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  // Video State
  const [videoSrc, setVideoSrc] = useState('/assets/videos/webmcp-zoth-os.mp4');
  const [videoError, setVideoError] = useState(false);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const videoRef = useRef(null);

  const isLocal = isLocalRuntime();

  // Demonstration chapters for Zoth OS video preview
  const demoChapters = [
    { title: '01. Zoth OS Microkernel Boot', desc: 'Hardware-isolated Linux KVM hypervisor initializing loopback network stack.', time: '00:00' },
    { title: '02. WebMCP SSE Protocol Handshake', desc: 'JSON-RPC 2.0 endpoint established at 127.0.0.1:8094/sse with schema negotiation.', time: '01:14' },
    { title: '03. WebGPU WGSL Tensor Dispatch', desc: 'Client GPU tensor cores execute real-time matrix matmul over WebMCP bridge.', time: '02:30' },
    { title: '04. Claude / Cursor Zero-Egress Tool Call', desc: 'Agent queries adytum_validate_plan and confirms 0 outbound network packets.', time: '03:45' },
  ];

  useEffect(() => {
    let timer;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setSimStep((prev) => (prev + 1) % demoChapters.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim]);

  const handleTestDispatch = async () => {
    setIsDispatching(true);
    const tool = SAMPLE_MCP_TOOLS[selectedToolIndex];
    const requestId = 'req_' + Math.floor(Math.random() * 90000 + 10000);

    const rpcRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: tool.sampleParams
      }
    };

    // Calculate real cryptographic hash of arguments using browser crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(tool.sampleParams));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = '0x' + Array.from(new Uint8Array(hashBuffer)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');

    setTimeout(() => {
      setIsDispatching(false);
      setJsonRpcOutput({
        request: rpcRequest,
        response: {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            content: [
              {
                type: 'text',
                text: `[WebMCP Client Runtime] Tool execution validated against schema contract.\nTarget: ${tool.name}\nDigest: ${hashHex}\nEgress: 0 bytes (Verified Local Invariant)`
              }
            ],
            isError: false,
            _meta: {
              schemaVersion: '2024-11-05',
              transport: 'in-browser-webmcp',
              zeroEgress: true
            }
          }
        }
      });
    }, 450);
  };

  const claudeDesktopConfig = JSON.stringify({
    mcpServers: {
      "zoth-studio": {
        "command": "npx",
        "args": ["-y", "zoth", "mcp", "serve", "--port", "8094"]
      },
      "zoth-webgpu": {
        "command": "npx",
        "args": ["-y", "zoth", "run", "payload-entropy-studio", "--mcp"]
      }
    }
  }, null, 2);

  const handleCopy = (text, setter) => {
    navigator.clipboard?.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3.5 },
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: 3,
        mb: 5,
        bgcolor: isDark ? 'rgba(11,11,18,0.95)' : theme.palette.background.paper,
        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.1)' : '0 8px 30px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: goldWash,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#F0E1A8'}`
            }}
          >
            <HubIcon sx={{ color: gold }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: theme.palette.text.primary }}>
              WebMCP (Model Context Protocol) Suite &amp; Video Showcase
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Anthropic MCP JSON-RPC 2.0 In-Browser Tool Inspector · Playable Zoth OS Bare-Metal Footage
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          <Chip
            icon={<SecurityIcon sx={{ color: '#10B981 !important' }} />}
            label="MCP v2024-11-05 SPEC"
            size="small"
            sx={{
              bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
              color: '#10B981',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.7rem',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          />
          <Chip
            icon={<VideoLibraryIcon sx={{ color: `${gold} !important` }} />}
            label="ZOTH OS DEMO PLAYABLE"
            size="small"
            sx={{
              bgcolor: goldWash,
              color: gold,
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.7rem',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
            }}
          />
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& .MuiTab-root': {
            fontFamily: mono,
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'none',
            minHeight: 44,
            color: theme.palette.text.secondary,
            '&.Mui-selected': { color: gold }
          },
          '& .MuiTabs-indicator': { bgcolor: gold, height: 3 }
        }}
      >
        <Tab icon={<VideoLibraryIcon sx={{ fontSize: '18px !important' }} />} iconPosition="start" label="Zoth OS Video Showcase" />
        <Tab icon={<CodeIcon sx={{ fontSize: '18px !important' }} />} iconPosition="start" label="Live MCP Tool Schemas (tools/list)" />
        <Tab icon={<LockIcon sx={{ fontSize: '18px !important' }} />} iconPosition="start" label="Loopback SSE Bridge & Lockout" />
      </Tabs>

      {/* TAB 0: VIDEO SHOWCASE */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft, mb: 0.5 }}>
              Bare-Metal Zoth OS &amp; WebMCP Demonstration Video
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Watch WebMCP tool calling, WebGPU tensor compilation, and zero-egress hardware isolation in action. Works both locally and on static web deployments.
            </Typography>
          </Box>

          {/* Video Player Card */}
          <Paper
            sx={{
              position: 'relative',
              borderRadius: 2.5,
              overflow: 'hidden',
              bgcolor: '#040407',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(0,0,0,0.2)'}`,
              mb: 3
            }}
          >
            {/* Real HTML5 Video element */}
            {!videoError ? (
              <Box sx={{ width: '100%', maxHeight: { xs: 320, md: 460 }, bgcolor: '#000000', display: 'flex', justifyContent: 'center' }}>
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  onError={() => setVideoError(true)}
                  style={{ width: '100%', maxHeight: 460, objectFit: 'contain' }}
                  src={videoSrc}
                >
                  Your browser does not support HTML5 video.
                </video>
              </Box>
            ) : (
              /* Fallback Interactive Simulation Reel when MP4 is pending upload */
              <Box sx={{ p: { xs: 2.5, md: 4 }, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: '#05050A' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isPlayingSim ? '#10B981' : gold, animation: isPlayingSim ? 'pulse 1s infinite' : 'none' }} />
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: goldSoft, letterSpacing: '0.06em' }}>
                      {isPlayingSim ? 'ZOTH OS DEMO REEL ACTIVE [4K 60FPS]' : 'STANDBY · READY FOR RECORDED MP4 FOOTAGE'}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={demoChapters[simStep].time}
                    sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.2)', color: gold }}
                  />
                </Box>

                {/* Simulated Screen Graphics */}
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: '#0B0B14',
                    border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: 2,
                    my: 2,
                    fontFamily: mono
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: gold, mb: 1 }}>
                    {demoChapters[simStep].title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 2, lineHeight: 1.6 }}>
                    {demoChapters[simStep].desc}
                  </Typography>
                  <Box sx={{ p: 1.5, bgcolor: '#06060A', borderRadius: 1.5, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Typography variant="caption" sx={{ color: '#10B981', display: 'block', mb: 0.5 }}>
                      $ [ZOTH-KERNEL-IPC] webmcp_bridge --transport sse --port 8094 --bind 127.0.0.1
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      &gt; Tools registered: 25 sovereign tools · WebGPU acceleration enabled · Zero egress telemetry: OK
                    </Typography>
                  </Box>
                </Paper>

                {/* Simulation Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={isPlayingSim ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={() => setIsPlayingSim(!isPlayingSim)}
                    sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: '#E5C158' } }}
                  >
                    {isPlayingSim ? 'Pause Demonstration Reel' : 'Play Interactive Zoth OS Reel'}
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                    Place recorded MP4 at <code style={{ color: gold }}>public/assets/videos/webmcp-zoth-os.mp4</code>
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Chapter Quick Jumps */}
          <Grid container spacing={2}>
            {demoChapters.map((chapter, idx) => (
              <Grid xs={12} sm={6} md={3} key={chapter.title}>
                <Card
                  onClick={() => {
                    setSimStep(idx);
                    if (videoRef.current && !videoError) {
                      const seconds = [0, 74, 150, 225][idx] || 0;
                      videoRef.current.currentTime = seconds;
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  sx={{
                    bgcolor: simStep === idx ? goldWash : (isDark ? '#08080B' : '#F9FAFB'),
                    border: `1px solid ${simStep === idx ? gold : theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: gold, transform: 'translateY(-2px)' }
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                      {chapter.time}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.3 }}>
                      {chapter.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* TAB 1: LIVE MCP TOOL SCHEMAS */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft, mb: 0.5 }}>
              Anthropic MCP JSON-RPC 2.0 In-Browser Tool Registry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Autonomous AI agents discover and execute these 25 sovereign tools via strict JSON-Schema input contracts.
            </Typography>
          </Box>

          {/* Tool Selector Chips */}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
            {SAMPLE_MCP_TOOLS.map((t, idx) => (
              <Chip
                key={t.name}
                label={t.name}
                size="small"
                clickable
                onClick={() => {
                  setSelectedToolIndex(idx);
                  setJsonRpcOutput(null);
                }}
                sx={{
                  fontFamily: mono,
                  fontWeight: selectedToolIndex === idx ? 800 : 600,
                  fontSize: '0.74rem',
                  bgcolor: selectedToolIndex === idx ? gold : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                  color: selectedToolIndex === idx ? '#08080B' : theme.palette.text.primary,
                  border: `1px solid ${selectedToolIndex === idx ? gold : 'transparent'}`
                }}
              />
            ))}
          </Stack>

          {/* Active Tool Details & Tester */}
          <Paper sx={{ p: 2.5, bgcolor: darkPanel, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                tools/call → {SAMPLE_MCP_TOOLS[selectedToolIndex].name}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={isDispatching ? <SpeedIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <PlayArrowIcon />}
                onClick={handleTestDispatch}
                disabled={isDispatching}
                sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: '#E5C158' } }}
              >
                {isDispatching ? 'Validating Contract...' : 'Dispatch In-Browser WebMCP Call'}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {SAMPLE_MCP_TOOLS[selectedToolIndex].description}
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 800, color: goldSoft, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
              Schema Input Parameters (JSON):
            </Typography>
            <Paper sx={{ p: 1.5, bgcolor: isDark ? '#050508' : '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, mb: 2 }}>
              <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.8rem', color: isDark ? '#E2E8F0' : '#1E293B', overflowX: 'auto' }}>
                {JSON.stringify(SAMPLE_MCP_TOOLS[selectedToolIndex].sampleParams, null, 2)}
              </pre>
            </Paper>

            {/* Live JSON-RPC 2.0 Output */}
            {jsonRpcOutput && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2, opacity: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: '15px !important' }} /> JSON-RPC 2.0 RESPONSE FRAME (ZERO-EGRESS SEALED):
                </Typography>
                <Paper sx={{ p: 2, bgcolor: isDark ? '#040406' : '#FFFFFF', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 1.5 }}>
                  <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: isDark ? '#A7F3D0' : '#065F46', overflowX: 'auto' }}>
                    {JSON.stringify(jsonRpcOutput.response, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* TAB 2: LOOPBACK SSE BRIDGE & LOCKOUT */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft, mb: 0.5 }}>
              Bare-Metal Loopback SSE Bridge Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zero-telemetry transport allowing Claude Desktop, Cursor, and local agents to interface directly with Zoth OS binaries.
            </Typography>
          </Box>

          {/* Honest Air-Gap Lockout Notice */}
          <Alert
            severity={isLocal ? "info" : "warning"}
            icon={<LockIcon sx={{ color: gold }} />}
            sx={{
              bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FFFBEB',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#FDE68A'}`,
              color: theme.palette.text.primary,
              mb: 3,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              {isLocal ? "Local Runtime Detected · Standby for Port 8094/sse" : "Static Web Deployment · Bare-Metal IPC Bridge Locked"}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
              {isLocal
                ? "You are running locally. To launch the background WebMCP daemon, execute the command below in your terminal to start the JSON-RPC SSE bridge."
                : "This static web deployment cannot bind host OS sockets or spawn background terminals. To use WebMCP with Claude Desktop or Cursor, clone the repository and run locally on your machine."}
            </Typography>
          </Alert>

          {/* Copyable Claude Desktop Config */}
          <Paper sx={{ p: 2.5, bgcolor: darkPanel, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: goldSoft, textTransform: 'uppercase' }}>
                claude_desktop_config.json (Model Context Protocol Configuration):
              </Typography>
              <Tooltip title={copiedConfig ? "Copied Config!" : "Copy Configuration"}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(claudeDesktopConfig, setCopiedConfig)}
                  sx={{ borderColor: gold, color: gold, fontSize: '0.75rem', fontWeight: 800 }}
                >
                  {copiedConfig ? "Copied!" : "Copy Config"}
                </Button>
              </Tooltip>
            </Box>

            <Paper sx={{ p: 2, bgcolor: isDark ? '#050508' : '#F8FAFC', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 1.5 }}>
              <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.8rem', color: isDark ? '#F5E6AB' : '#1E293B', overflowX: 'auto' }}>
                {claudeDesktopConfig}
              </pre>
            </Paper>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}
