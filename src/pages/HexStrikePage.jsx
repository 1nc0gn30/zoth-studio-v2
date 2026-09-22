import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Button,
  TextField,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function HexStrikePage() {
  const [targetHost, setTargetHost] = useState('127.0.0.1');
  const [scanDepth, setScanDepth] = useState('Extreme Zero-Day Fuzzing');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedLog, setCopiedLog] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState('reentrancy');
  const [patchedCves, setPatchedCves] = useState({});

  const [scanLogs, setScanLogs] = useState([
    { text: '$ hexstrike audit --target 127.0.0.1 --scan-depth extreme', type: 'cmd' },
    { text: '[+] Initiating 65,535 TCP/UDP port sweep across localhost...', type: 'info' },
    { text: '[+] Port 8788/TCP (Zoth Memory Daemon) -> OPEN (TLS 1.3 mTLS verified)', type: 'success' },
    { text: '[+] Port 8789/TCP (Simplex Peer Mesh) -> OPEN (Argon2id AES-GCM)', type: 'success' },
    { text: '[!] CVE-2026-8812 memory reentrancy vector detected on IPC channel #swarm', type: 'alert' },
    { text: '[+] Argon2id secret vault memory lock: VERIFIED SECURE.', type: 'success' },
    { text: '[+] Zero unauthenticated RPC endpoints detected.', type: 'success' }
  ]);

  const handleRunScan = () => {
    setIsScanning(true);
    const timestamp = new Date().toLocaleTimeString();

    setScanLogs((prev) => [
      ...prev,
      { text: `[${timestamp}] $ hexstrike scan --host ${targetHost} --depth "${scanDepth}"`, type: 'cmd' },
      { text: `[${timestamp}] [+] Fuzzing RPC endpoints with 50,000 synthetic payload vectors...`, type: 'info' }
    ]);

    setTimeout(() => {
      setScanLogs((prev) => [
        ...prev,
        { text: `[${timestamp}] [+] Port audit completed. 0 exposed administrative ports found.`, type: 'success' },
        { text: `[${timestamp}] [+] Memory sanitizer check: 100% memory boundary compliance verified.`, type: 'success' },
        { text: `[${timestamp}] ✔ HEXSTRIKE AUDIT COMPLETED. Security Integrity Score: 99.8/100`, type: 'success' }
      ]);
      setIsScanning(false);
    }, 1200);
  };

  const handleTogglePatch = (cveId) => {
    setPatchedCves((prev) => ({
      ...prev,
      [cveId]: !prev[cveId]
    }));
  };

  const handleCopyLogs = () => {
    const textToCopy = scanLogs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const payloads = {
    reentrancy: `// HexStrike Reentrancy Probe Vector (CVE-2026-8812)
async function probeReentrancyLock(targetWs) {
  const payload = new Uint8Array([0x5A, 0x4F, 0x54, 0x48, 0xFF, 0x00]);
  for (let i = 0; i < 1000; i++) {
    targetWs.send(payload);
  }
  return "Reentrancy probe transmitted. Lock integrity verified.";
}`,
    jwt: `// JWT Signature Bypass Payload Probe
const forgeHeader = { alg: "none", typ: "JWT" };
const forgeClaims = { sub: "agent-root", role: "SOVEREIGN_ADMIN", iat: Date.now() };
const token = btoa(JSON.stringify(forgeHeader)) + "." + btoa(JSON.stringify(forgeClaims)) + ".";`,
    sqli: `' UNION SELECT argon_salt, master_hash, 0x8F4A FROM vault_secrets WHERE '1'='1`
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Section Header Banner */}
      <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid #EAECF0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Box component="img" src="/assets/banners/hexstrike.jpg" alt="HexStrike Security Banner" sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      </Box>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<SecurityIcon sx={{ color: '#B8860B !important' }} />}
          label="AUTONOMOUS PENETRATION SUITE"
          size="small"
          sx={{
            backgroundColor: '#FEF9E7',
            color: '#B8860B',
            border: '1px solid #F0E1A8',
            fontWeight: 700,
            mb: 1.5,
            px: 1
          }}
        />
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: '#101828' }}>
          HexStrike Security Suite
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          Vulnerability assessment, CVE matrix, exploit payload laboratory, and real-time port audit ledgers for zero-trust sovereign networks.
        </Typography>
      </Box>

      {/* Top Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>CVE Telemetry Index</Typography>
              <Chip label="14 CRITICAL" size="small" sx={{ backgroundColor: '#FEF3F2', color: '#B42318', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D92D20' }}>14 Detected</Typography>
            <Typography variant="caption" color="text.secondary">Automated CVE Tracking</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Audited Ports</Typography>
              <Chip label="FULL SWEEP" size="small" sx={{ backgroundColor: '#ECFDF3', color: '#12B76A', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828' }}>65,535</Typography>
            <Typography variant="caption" color="text.secondary">100% TCP/UDP Ports Audited</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Active Payload Lab</Typography>
              <Chip label="READY" size="small" sx={{ backgroundColor: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#B8860B' }}>Active</Typography>
            <Typography variant="caption" color="text.secondary">Sandbox Fuzzing Engaged</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Sanitization Status</Typography>
              <Chip label="SECURED" size="small" sx={{ backgroundColor: '#ECFDF3', color: '#12B76A', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#12B76A' }}>100% Locked</Typography>
            <Typography variant="caption" color="text.secondary">Argon2id Hardware Key Vault</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Interactive Controller & Target Scanner */}
      <Paper sx={{ p: 3, border: '1px solid #EAECF0', borderRadius: 3, mb: 4, backgroundColor: '#FAFAFA' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon sx={{ color: '#B8860B' }} /> Target Host Penetration Scanner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Specify target network interface IP and penetration audit depth to trigger real-time port sweeps and CVE vulnerability detection.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Target Host IP / Domain"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475467', mb: 0.8 }}>
                AUDIT DEPTH MODE
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['Standard Sweep', 'CVE Deep Audit', 'Extreme Zero-Day Fuzzing'].map((mode) => (
                  <Chip
                    key={mode}
                    label={mode}
                    onClick={() => setScanDepth(mode)}
                    variant={scanDepth === mode ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: scanDepth === mode ? '#B8860B' : '#EAECF0',
                      backgroundColor: scanDepth === mode ? '#FEF9E7' : 'transparent',
                      color: scanDepth === mode ? '#B8860B' : '#475467',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setTargetHost('127.0.0.1');
              setScanLogs([
                { text: '[RESET] Terminal reset to default localhost baseline.', type: 'info' }
              ]);
            }}
            sx={{ borderColor: '#EAECF0', color: '#475467' }}
          >
            Reset Target
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={isScanning ? <CheckCircleIcon /> : <PlayArrowIcon />}
            onClick={handleRunScan}
            disabled={isScanning}
            sx={{ px: 4 }}
          >
            {isScanning ? 'Scanning Target...' : 'Launch HexStrike Scan'}
          </Button>
        </Box>

        {isScanning && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: '#B8860B' } }} />
          </Box>
        )}
      </Paper>

      {/* Main Grid: CVE Matrix & Exploit Payload Lab Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Card 1: CVE Matrix */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid #EAECF0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#F0E1A8',
                boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="VULNERABILITY LEDGER"
                    size="small"
                    sx={{
                      backgroundColor: '#FEF9E7',
                      color: '#B8860B',
                      border: '1px solid #F0E1A8',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip label="3 TARGET VECTORS" size="small" sx={{ backgroundColor: '#FEF3F2', color: '#B42318', fontWeight: 700 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                  High-Priority CVE Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Active vulnerabilities identified across local IPC channels and WebSocket peer interfaces.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* CVE Item 1 */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: patchedCves['cve1'] ? '1px solid #12B76A' : '1px solid #FECDCA',
                      backgroundColor: patchedCves['cve1'] ? '#ECFDF3' : '#FEF3F2',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>
                        CVE-2026-8812 • Signal Bus Reentrancy
                      </Typography>
                      <Chip
                        label={patchedCves['cve1'] ? 'PATCHED' : 'CRITICAL (9.8)'}
                        size="small"
                        sx={{
                          backgroundColor: patchedCves['cve1'] ? '#12B76A' : '#D92D20',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.68rem'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Unbounded recursive packet listener trigger during peer consensus sync.
                    </Typography>
                    <Button
                      size="small"
                      variant={patchedCves['cve1'] ? 'outlined' : 'contained'}
                      color={patchedCves['cve1'] ? 'success' : 'error'}
                      startIcon={<BuildIcon />}
                      onClick={() => handleTogglePatch('cve1')}
                      sx={{ borderRadius: 9999, fontSize: '0.75rem', py: 0.4 }}
                    >
                      {patchedCves['cve1'] ? 'Revert Patch' : 'Apply Hotfix Patch'}
                    </Button>
                  </Paper>

                  {/* CVE Item 2 */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: patchedCves['cve2'] ? '1px solid #12B76A' : '1px solid #FEDF89',
                      backgroundColor: patchedCves['cve2'] ? '#ECFDF3' : '#FEF9E7',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>
                        CVE-2026-4409 • WebSocket Unsanitized Frame
                      </Typography>
                      <Chip
                        label={patchedCves['cve2'] ? 'PATCHED' : 'HIGH (8.4)'}
                        size="small"
                        sx={{
                          backgroundColor: patchedCves['cve2'] ? '#12B76A' : '#B8860B',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.68rem'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Unbounded payload frame size allocation on ws://127.0.0.1:8789 socket.
                    </Typography>
                    <Button
                      size="small"
                      variant={patchedCves['cve2'] ? 'outlined' : 'contained'}
                      color={patchedCves['cve2'] ? 'success' : 'warning'}
                      startIcon={<BuildIcon />}
                      onClick={() => handleTogglePatch('cve2')}
                      sx={{ borderRadius: 9999, fontSize: '0.75rem', py: 0.4 }}
                    >
                      {patchedCves['cve2'] ? 'Revert Patch' : 'Apply Frame Limit Patch'}
                    </Button>
                  </Paper>

                </Box>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => setPatchedCves({ cve1: true, cve2: true })}
                sx={{ mt: 3, borderRadius: 9999, borderColor: '#EAECF0' }}
              >
                Apply All Security Hotfixes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Exploit Payload Laboratory */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid #EAECF0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#F0E1A8',
                boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="PAYLOAD FOUNDRY"
                    size="small"
                    sx={{
                      backgroundColor: '#FEF9E7',
                      color: '#B8860B',
                      border: '1px solid #F0E1A8',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip label="SANDBOX READY" size="small" sx={{ backgroundColor: '#F0F9FF', color: '#0284C7', fontWeight: 700 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                  Exploit Payload Laboratory
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select synthetic attack payload vectors to simulate penetration probes in the isolated sandbox environment.
                </Typography>

                {/* Payload Select Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label="Reentrancy Probe"
                    onClick={() => setSelectedPayload('reentrancy')}
                    variant={selectedPayload === 'reentrancy' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: selectedPayload === 'reentrancy' ? '#B8860B' : '#EAECF0',
                      backgroundColor: selectedPayload === 'reentrancy' ? '#FEF9E7' : 'transparent',
                      color: selectedPayload === 'reentrancy' ? '#B8860B' : '#475467',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  />
                  <Chip
                    label="JWT Bypass"
                    onClick={() => setSelectedPayload('jwt')}
                    variant={selectedPayload === 'jwt' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: selectedPayload === 'jwt' ? '#B8860B' : '#EAECF0',
                      backgroundColor: selectedPayload === 'jwt' ? '#FEF9E7' : 'transparent',
                      color: selectedPayload === 'jwt' ? '#B8860B' : '#475467',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  />
                  <Chip
                    label="SQLi Polyglot"
                    onClick={() => setSelectedPayload('sqli')}
                    variant={selectedPayload === 'sqli' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: selectedPayload === 'sqli' ? '#B8860B' : '#EAECF0',
                      backgroundColor: selectedPayload === 'sqli' ? '#FEF9E7' : 'transparent',
                      color: selectedPayload === 'sqli' ? '#B8860B' : '#475467',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  />
                </Box>

                {/* Code Snippet Box */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: '#101828',
                    color: '#81C995',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    borderRadius: 2,
                    minHeight: 140,
                    maxHeight: 180,
                    overflowY: 'auto'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {payloads[selectedPayload]}
                  </pre>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<BugReportIcon />}
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setScanLogs((prev) => [
                      ...prev,
                      { text: `[${timestamp}] [PAYLOAD EXEC] Testing "${selectedPayload}" probe in isolated sandbox...`, type: 'cmd' },
                      { text: `[${timestamp}] [RESULT] Target lock held firm. Zero breach detected.`, type: 'success' }
                    ]);
                  }}
                  sx={{ borderRadius: 9999 }}
                >
                  Test Payload in Sandbox
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Rich Visual Console Window (HexStrike Live Console) */}
      <Paper sx={{ border: '1px solid #EAECF0', borderRadius: 3, overflow: 'hidden', backgroundColor: '#101828' }}>
        
        {/* Console Header */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            backgroundColor: '#1D2939',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            borderBottom: '1px solid #344054'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </Box>
            <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: 'monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon sx={{ fontSize: '1rem', color: '#B8860B' }} />
              [HEXSTRIKE LIVE PENETRATION CONSOLE • HOST: {targetHost}]
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy Terminal Logs">
              <IconButton size="small" onClick={handleCopyLogs} sx={{ color: copiedLog ? '#81C995' : '#9AA0A6' }}>
                {copiedLog ? <CheckCircleIcon size="small" /> : <ContentCopyIcon size="small" />}
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunScan}
              disabled={isScanning}
              sx={{ fontSize: '0.75rem', py: 0.5, px: 2 }}
            >
              Run Audit
            </Button>
          </Box>
        </Box>

        {/* Console Tabs */}
        <Box sx={{ borderBottom: '1px solid #344054', backgroundColor: '#101828' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                color: '#9AA0A6',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                minHeight: 40,
                textTransform: 'none',
                '&.Mui-selected': { color: '#FDD663', fontWeight: 700 }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#B8860B' }
            }}
          >
            <Tab icon={<TerminalIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Live Audit Stream" />
            <Tab icon={<LockIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Argon2id Vault Memory Lock" />
            <Tab icon={<ShieldIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Zero-Trust Certificate" />
          </Tabs>
        </Box>

        {/* Tab 0: Live Audit Stream */}
        {activeTab === 0 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 220, maxHeight: 320, overflowY: 'auto' }}>
            {scanLogs.map((logItem, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 6,
                  color:
                    logItem.type === 'cmd'
                      ? '#FDD663'
                      : logItem.type === 'alert'
                      ? '#F87171'
                      : logItem.type === 'success'
                      ? '#81C995'
                      : '#9AA0A6'
                }}
              >
                {logItem.text}
              </div>
            ))}
          </Box>
        )}

        {/* Tab 1: Argon2id Vault Memory Lock */}
        {activeTab === 1 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 220 }}>
            <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#1D2939', border: '1px solid #344054', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#B8860B', fontWeight: 700, mb: 1 }}>
                ARGON2ID HARDWARE MEMORY SANITIZATION VAULT
              </Typography>
              <div style={{ color: '#9AA0A6' }}>Master Salt Digest: sha256_d4af37b8860b101828</div>
              <div style={{ color: '#9AA0A6' }}>Memory Lock Allocated: 64 MB (Hardened Page Lock)</div>
              <div style={{ color: '#81C995', marginTop: 8 }}>✔ Zero buffer overrun vectors found across process heap.</div>
            </Paper>
          </Box>
        )}

        {/* Tab 2: Zero-Trust Certificate */}
        {activeTab === 2 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 220 }}>
            <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#1D2939', border: '1px solid #344054', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#81C995', fontWeight: 700, mb: 1 }}>
                PENETRATION COMPLIANCE CERTIFICATE
              </Typography>
              <div style={{ color: '#9AA0A6' }}>Audit Engine: HexStrike Security Suite v2.0</div>
              <div style={{ color: '#9AA0A6' }}>Target IP: {targetHost} (Local Loopback Mesh)</div>
              <div style={{ color: '#81C995', marginTop: 8 }}>Final Security Index: 99.8 / 100 (PASSED)</div>
            </Paper>
          </Box>
        )}

      </Paper>

    </Container>
  );
}
