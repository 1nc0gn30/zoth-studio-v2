import React, { useState, useEffect, useRef, useMemo } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HubIcon from '@mui/icons-material/Hub';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import StorageIcon from '@mui/icons-material/Storage';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AndroidIcon from '@mui/icons-material/Android';
import CodeIcon from '@mui/icons-material/Code';

import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const BUILTIN_APPS = [
  { slug: 'welcome', name: 'ZothNet Portal', desc: 'Onboarding & interactive ping', icon: '⣿' },
  { slug: 'ghost-notes', name: 'Ghost Notes Vault', desc: '1-Bit amnesic scratchpad', icon: '☵' },
  { slug: 'mesh-board', name: 'Mesh Bulletin Board', desc: 'GossipSub #general forum', icon: '◈' },
  { slug: 'storefront', name: 'Sovereign Storefront', desc: 'Merchant bazaar & checkout', icon: '◈' },
  { slug: 'zoth-drive', name: 'ZothDrive Vault', desc: '1,280B CAS chunked vault', icon: '💾' },
  { slug: 'zoth-radio', name: 'ZothRadio Synth', desc: 'Procedural darknet audio', icon: '📻' },
  { slug: 'zoth-chat', name: 'ZothChat E2EE', desc: '3-Hop Sphinx burn messenger', icon: '💬' },
  { slug: 'zoth-wallet', name: 'ZothWallet & DAG', desc: 'Feeless Vaelor L1 lattice', icon: '◈' },
  { slug: 'names', name: 'ZNS Sovereign Names', desc: 'Decentralized .zoth domains', icon: '🏷️' },
  { slug: 'zoth-vault', name: 'ZothVault Vault', desc: 'Client-side AES-256 notebook', icon: '🔐' },
  { slug: 'zoth-pub', name: 'ZothPub Press', desc: 'Markdown sovereign press', icon: '¶' },
];

export default function ZothnetGodModeTool() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Vaelor state
  const [vaelorAccount, setVaelorAccount] = useState(null);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('10');
  const [txNotice, setTxNotice] = useState(null);

  // ZNS state
  const [znsDomain, setZnsDomain] = useState('store.zoth');
  const [znsResult, setZnsResult] = useState(null);

  // CAS Swarm state
  const [casInput, setCasInput] = useState('Hello sovereign CAS mesh swarm from Zoth Studio v2!');
  const [publishedCID, setPublishedCID] = useState(null);

  // Canvas ref for animated mesh
  const canvasRef = useRef(null);

  // Poll live status from local daemon
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:9900/api/status');
      if (res.ok) {
        const json = await res.json();
        setLiveStatus(json);
        setErrorMsg(null);
      } else {
        setErrorMsg('Daemon offline. Start with "zothnet run"');
      }
    } catch (_e) {
      setErrorMsg('Cannot reach ZothNet daemon on http://127.0.0.1:9900');
    }
  };

  const fetchVaelor = async () => {
    try {
      const res = await fetch('http://127.0.0.1:9900/api/ledger/account');
      if (res.ok) {
        const json = await res.json();
        setVaelorAccount(json);
      }
    } catch (_e) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchVaelor();
    const interval = setInterval(() => {
      fetchStatus();
      fetchVaelor();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFaucet = async () => {
    try {
      const res = await fetch('http://127.0.0.1:9900/api/ledger/faucet', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setTxNotice(`+50 VLR disbursed! Tx Hash: ${json.block_hash || 'confirmed'}`);
        fetchVaelor();
      }
    } catch (e) {
      setTxNotice('Faucet error: ' + e.message);
    }
  };

  const handleSendVLR = async () => {
    if (!sendTo || !sendAmount) return;
    try {
      const res = await fetch('http://127.0.0.1:9900/api/ledger/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendTo, amount: parseInt(sendAmount, 10) }),
      });
      const json = await res.json();
      if (res.ok) {
        setTxNotice(`Sent ${sendAmount} VLR successfully! Hash: ${json.block_hash}`);
        fetchVaelor();
      } else {
        setTxNotice(`Transfer failed: ${json.error || 'insufficient funds'}`);
      }
    } catch (e) {
      setTxNotice('Send error: ' + e.message);
    }
  };

  const handleZNSLookup = async () => {
    if (!znsDomain) return;
    try {
      const res = await fetch(`http://127.0.0.1:9900/api/names/resolve?domain=${encodeURIComponent(znsDomain)}`);
      const json = await res.json();
      setZnsResult(json);
    } catch (e) {
      setZnsResult({ error: e.message });
    }
  };

  const handleCASPublish = async () => {
    if (!casInput) return;
    try {
      const res = await fetch('http://127.0.0.1:9900/api/blocks/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'studio-snippet.txt', content: casInput }),
      });
      const json = await res.json();
      if (res.ok) {
        setPublishedCID(json.root_cid);
      }
    } catch (e) {
      alert('CAS Publish error: ' + e.message);
    }
  };

  // Animated P2P mesh canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const nodes = [
      { x: 50, y: 70, r: 5, label: 'Origin' },
      { x: 130, y: 35, r: 4, label: 'Guard' },
      { x: 220, y: 65, r: 4, label: 'Middle' },
      { x: 300, y: 40, r: 4, label: 'Exit' },
      { x: 370, y: 80, r: 5, label: 'Dest' },
      { x: 170, y: 110, r: 3, label: 'Peer A' },
      { x: 270, y: 120, r: 3, label: 'Peer B' },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 4], [1, 5], [2, 6],
    ];

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const n1 = nodes[i];
        const n2 = nodes[j];
        ctx.strokeStyle = dark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.25)';
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Draw packet pulse moving along primary circuit 0 -> 1 -> 2 -> 3 -> 4
      const circuit = [0, 1, 2, 3, 4];
      const circuitLen = circuit.length - 1;
      const progress = (t * 0.5) % circuitLen;
      const curSegment = Math.floor(progress);
      const segFraction = progress - curSegment;
      const fromNode = nodes[circuit[curSegment]];
      const toNode = nodes[circuit[curSegment + 1]];
      const px = fromNode.x + (toNode.x - fromNode.x) * segFraction;
      const py = fromNode.y + (toNode.y - fromNode.y) * segFraction;

      // Pulse glow
      ctx.fillStyle = '#00FFA3';
      ctx.shadowColor = '#00FFA3';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw nodes
      nodes.forEach((n, idx) => {
        ctx.fillStyle = idx === 0 || idx === 4 ? '#D4AF37' : (dark ? '#38BDF8' : '#0284C7');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : '#333';
        ctx.font = '9px monospace';
        ctx.fillText(n.label, n.x - 12, n.y - 8);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dark]);

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header Eyebrow */}
      <Box sx={{ mb: 3 }}>
        <SovereignEyebrow title="SOVEREIGN OVERLAY MESH & SPHINX MIXNET" tag="v1.2.0 • ZERO-DNS • 1,280B CONSTANT MTU" />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: mono, letterSpacing: '-0.02em' }}>
            ZothNet God-Mode Workstation
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchStatus}
              sx={{ borderColor: dark ? 'rgba(212,175,55,0.4)' : '#B8860B', color: dark ? '#D4AF37' : '#B8860B' }}
            >
              Refresh
            </Button>
            {isLocalRuntime() && (
            <Button
              variant="contained"
              size="small"
              startIcon={<OpenInNewIcon />}
              href="http://127.0.0.1:9900"
              target="_blank"
              sx={{ bgcolor: '#D4AF37 !important', color: '#050609 !important', fontWeight: 700 }}
            >
              Native Deck (:9900)
            </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Live Daemon Status Strip */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: liveStatus ? 'rgba(0, 255, 163, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          background: dark ? 'rgba(10, 15, 26, 0.7)' : '#FFFFFF',
          backdropFilter: 'blur(12px)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: liveStatus ? '#00FFA3' : '#EF4444',
                  boxShadow: liveStatus ? '0 0 10px #00FFA3' : 'none',
                }}
              />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, display: 'block' }}>
                  DAEMON STATUS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: mono }}>
                  {liveStatus ? `ONLINE (UDP :${liveStatus.listen_udp || 42069})` : 'DISCONNECTED'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, display: 'block' }}>
              STUN REFLEXIVE WAN ENDPOINT
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: mono, color: '#38BDF8' }}>
              {liveStatus?.public_endpoint || 'Probing STUN Cloudflare/Google...'}
            </Typography>
          </Grid>

          <Grid xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, display: 'block' }}>
              PEERS & TOPICS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: mono, color: '#D4AF37' }}>
              {liveStatus?.peer_count || 0} Connected • {liveStatus?.topics?.length || 5} Channels Active
            </Typography>
          </Grid>
        </Grid>

        {liveStatus && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                Node ID:
              </Typography>
              <Chip
                label={liveStatus.node_id || 'unknown'}
                size="small"
                onClick={() => handleCopy(liveStatus.node_id, 'nodeId')}
                icon={copiedKey === 'nodeId' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                sx={{ fontFamily: mono, fontSize: '0.72rem', maxWidth: '100%' }}
              />
              <Chip
                label={`Alias: ${liveStatus.alias || 'Sovereign'}`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Main Interactive Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Interactive Canvas & Braille Telemetry */}
        <Grid xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              border: '1px solid',
              borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              background: dark ? 'rgba(15, 20, 32, 0.6)' : '#FAF8F3',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, mb: 1 }}>
              🌐 SPHINX 3-HOP PACKET TOPOLOGY
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Origin peels ChaCha20-Poly1305 shells through blinded relays at fixed 1,280 bytes.
            </Typography>

            <Box sx={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas ref={canvasRef} width={420} height={150} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            </Box>

            <Box sx={{ p: 1.5, bgcolor: dark ? '#080C14' : '#F0ECE1', borderRadius: 1.5, border: '1px solid rgba(212,175,55,0.2)' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#D4AF37', display: 'block', mb: 0.5 }}>
                [ 2×4 SUB-PIXEL BRAILLE OSCILLOSCOPE ]
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: '#00FFA3', letterSpacing: '0.25em' }}>
                ⣿⣷⣯⣟⡿⢿⣻⣽⣾⣷⣯⣟⣿⣷⣯⣟
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mt: 0.5 }}>
                CONSTANT WIRE LENGTH: 1,280 BYTES ALWAYS (ZERO-DPI LEAK)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Multi-Engine Tabbed Control */}
        <Grid xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              background: dark ? 'rgba(15, 20, 32, 0.6)' : '#FAF8F3',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid',
                borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                '& .MuiTab-root': { fontFamily: mono, fontSize: '0.78rem', minHeight: 48 },
                '& .Mui-selected': { color: '#D4AF37 !important' },
                '& .MuiTabs-indicator': { backgroundColor: '#D4AF37' },
              }}
            >
              <Tab label="◈ Vaelor L1 DAG" icon={<AccountBalanceWalletIcon fontSize="small" />} iconPosition="start" />
              <Tab label="🏷️ ZNS Names" icon={<HubIcon fontSize="small" />} iconPosition="start" />
              <Tab label="💾 CAS Swarm" icon={<StorageIcon fontSize="small" />} iconPosition="start" />
              <Tab label="📦 11 ZothApps" icon={<CloudOffIcon fontSize="small" />} iconPosition="start" />
              <Tab label="💻 CLI & MCP" icon={<TerminalIcon fontSize="small" />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              {/* Tab 0: Vaelor L1 DAG */}
              {activeTab === 0 && (
                <Stack spacing={2}>
                  <Box sx={{ p: 2, bgcolor: dark ? '#0A0F1A' : '#FFFFFF', borderRadius: 1.5, border: '1px solid rgba(212,175,55,0.2)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                          VAELOR L1 BALANCE
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: '#00FFA3' }}>
                          {vaelorAccount ? `${vaelorAccount.balance} ◈ VLR` : 'Loading...'}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleFaucet}
                        sx={{ bgcolor: '#00FFA3 !important', color: '#050609 !important', fontWeight: 800, fontFamily: mono }}
                      >
                        +50 VLR Faucet
                      </Button>
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mt: 1 }}>
                      Frontier Block: {vaelorAccount?.frontier ? `${vaelorAccount.frontier.slice(0, 16)}...` : 'genesis'} • Finality: &lt;20ms
                    </Typography>
                  </Box>

                  {txNotice && (
                    <Alert severity="info" onClose={() => setTxNotice(null)} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                      {txNotice}
                    </Alert>
                  )}

                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    Feeless P2P Payment (0.00% Gas Forever)
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      size="small"
                      placeholder="Recipient zoth:<pubkey> or domain.zoth"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      fullWidth
                      sx={{ '& input': { fontFamily: mono, fontSize: '0.82rem' } }}
                    />
                    <TextField
                      size="small"
                      placeholder="Amount"
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      sx={{ width: 110, '& input': { fontFamily: mono, fontSize: '0.82rem' } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendVLR}
                      startIcon={<SendIcon />}
                      sx={{ bgcolor: '#D4AF37 !important', color: '#050609 !important', fontWeight: 700 }}
                    >
                      Send
                    </Button>
                  </Stack>
                </Stack>
              )}

              {/* Tab 1: ZNS Names */}
              {activeTab === 1 && (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Decentralized .zoth domain names resolve mathematically to cryptographic public keys with zero ICANN registrars.
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      size="small"
                      placeholder="e.g. store.zoth or wallet.zoth"
                      value={znsDomain}
                      onChange={(e) => setZnsDomain(e.target.value)}
                      fullWidth
                      sx={{ '& input': { fontFamily: mono, fontSize: '0.82rem' } }}
                    />
                    <Button variant="contained" onClick={handleZNSLookup} sx={{ bgcolor: '#38BDF8 !important', color: '#050609 !important', fontWeight: 700 }}>
                      Resolve
                    </Button>
                  </Stack>

                  {znsResult && (
                    <Box sx={{ p: 1.5, bgcolor: dark ? '#080C14' : '#FFFFFF', borderRadius: 1, border: '1px solid rgba(56,189,248,0.2)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', display: 'block' }}>
                        RESOLUTION RESULT
                      </Typography>
                      <pre style={{ margin: 0, fontFamily: mono, fontSize: '11px', overflowX: 'auto' }}>
                        {JSON.stringify(znsResult, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Stack>
              )}

              {/* Tab 2: CAS Swarm */}
              {activeTab === 2 && (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Files are chopped into 1,200B blocks, hashed with SHA-256, and distributed via parallel swarm workers (c=6).
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    size="small"
                    value={casInput}
                    onChange={(e) => setCasInput(e.target.value)}
                    placeholder="Enter payload to chunk into 1,200B blocks..."
                    sx={{ '& textarea': { fontFamily: mono, fontSize: '0.82rem' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCASPublish}
                    sx={{ bgcolor: '#D4AF37 !important', color: '#050609 !important', fontWeight: 700, alignSelf: 'flex-start' }}
                  >
                    Publish to CAS Swarm
                  </Button>

                  {publishedCID && (
                    <Box sx={{ p: 1.5, bgcolor: dark ? '#080C14' : '#FFFFFF', borderRadius: 1, border: '1px solid rgba(0,255,163,0.3)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#00FFA3', display: 'block' }}>
                        PUBLISHED MERKLE ROOT CID:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700 }}>
                        {publishedCID}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}

              {/* Tab 3: 11 Sovereign ZothApps */}
              {activeTab === 3 && (
                <Grid container spacing={1.5}>
                  {BUILTIN_APPS.map((app) => (
                    <Grid xs={12} sm={6} key={app.slug}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          bgcolor: dark ? 'rgba(8,12,20,0.5)' : '#FFFFFF',
                          borderRadius: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: mono }}>
                            {app.icon} {app.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {app.desc}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          href={`http://127.0.0.1:9900/apps/${app.slug}/`}
                          target="_blank"
                          sx={{ color: '#D4AF37' }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Tab 4: CLI & MCP Control */}
              {activeTab === 4 && (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Control ZothNet directly via the global CLI or connect AI agents using the native Model Context Protocol (MCP) server.
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: dark ? '#080C14' : '#1E1E1E', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#00FFA3', display: 'block', mb: 0.5 }}>
                      # Global CLI & JSON Telemetry
                    </Typography>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '11px', color: '#FFF' }}>
{`zothnet run --alias "Laptop-Main"
zothnet id --json
zothnet status --json`}
                    </pre>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: dark ? '#080C14' : '#1E1E1E', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', display: 'block', mb: 0.5 }}>
                      # Launch Native MCP JSON-RPC Server
                    </Typography>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '11px', color: '#FFF' }}>
{`zothnet mcp`}
                    </pre>
                  </Box>

                  <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AndroidIcon />}
                      href="https://zothnet.nullai.tech/downloads/zothnet-arm64.apk"
                      sx={{ borderColor: '#00FFA3', color: '#00FFA3' }}
                    >
                      Android APK (2.9 MB)
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CodeIcon />}
                      href="https://zothnet.nullai.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ borderColor: dark ? 'rgba(255,255,255,0.3)' : '#666', color: 'inherit' }}
                    >
                      zothnet.nullai.tech ↗
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sovereign Band (Attribution + Zero Paywalls + Tip Links) */}
      <Box sx={{ mt: 4 }}>
        <SovereignBand />
      </Box>
    </Box>
  );
}
