import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tabs, Tab, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import RefreshIcon from '@mui/icons-material/Refresh';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:8106';

const CAPABILITIES = [
  { value: 'FS_READ', label: 'FS_READ (Filesystem Read)' },
  { value: 'FS_WRITE', label: 'FS_WRITE (Filesystem Write)' },
  { value: 'NET_EGRESS', label: 'NET_EGRESS (Outbound Network)' },
  { value: 'SHELL_EXEC', label: 'SHELL_EXEC (Subprocess Command)' },
  { value: 'TOKEN_BUDGET', label: 'TOKEN_BUDGET (USD Spend Cap)' },
];

// Ephemeral in-memory CSPRNG key for offline preview only (never hardcoded)
function generateEphemeralKeyHex() {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signHmacSha256(payloadStr, secretKeyStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKeyStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payloadStr));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Offline client-side parity ruleset (used only when :8106 is offline)
function auditManifestOffline(rawText) {
  const findings = [];
  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch (_e) {
    parsed = { prompt: rawText };
  }
  const text = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);
  const lower = text.toLowerCase();

  if (/sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|BEGIN (?:RSA )?PRIVATE KEY/i.test(text)) {
    findings.push({
      rule_id: 'SEC-001-HARDCODED-SECRET',
      severity: 'CRITICAL',
      description: 'Detected hardcoded credential inside agent manifest or prompt.',
      remediation: 'Extract credentials to external vault or ephemeral environment leases.',
    });
  }

  const tools = (parsed && Array.isArray(parsed.tools)) ? parsed.tools : [];
  tools.forEach((t) => {
    if (!t || typeof t !== 'object') return;
    const tName = String(t.name || '').toLowerCase();
    const schema = JSON.stringify(t.parameters || {}).toLowerCase();
    if (/(?:bash|sh|shell|exec|terminal|command|subprocess)/i.test(tName) && !/(?:sandbox|capsule|timeout|quota|container)/.test(schema)) {
      findings.push({
        rule_id: 'EXEC-002-UNSANDBOXED-SHELL',
        severity: 'HIGH',
        description: `Tool '${t.name}' provides shell execution without sandbox or quota boundaries.`,
        remediation: 'Wrap subprocess in Agent Capsule Jail (:8105) or apply strict limits.',
      });
    }
    if (/(?:write|file|save|modify|purge|delete)/i.test(tName) && !tName.startsWith('read_') && !/(?:allowed_dir|root|workspace|jail|sandbox)/.test(schema)) {
      findings.push({
        rule_id: 'FS-003-UNCONSTRAINED-WRITE',
        severity: 'MEDIUM',
        description: `Tool '${t.name}' allows arbitrary file writes without workspace root constraints.`,
        remediation: 'Enforce strict working directory path prefix validation.',
      });
    }
  });

  if (/\b(?:rm\s+-rf|del\s+\/f|mkfs|drop\s+database|file_system_purge|sudo)\b/i.test(text)) {
    findings.push({
      rule_id: 'DEST-004-IRREVERSIBLE-ACTION',
      severity: 'CRITICAL',
      description: 'Detected destructive or privileged command without approval gate.',
      remediation: 'Require explicit lease authorization or human confirmation.',
    });
  }
  if (/(?:fetch|curl|http_request|urllib|requests)/i.test(lower) && !/(?:domain_whitelist|allowlist)/.test(lower)) {
    findings.push({
      rule_id: 'NET-005-UNFILTERED-EGRESS',
      severity: 'LOW',
      description: 'Outbound network tool present without domain allowlist.',
      remediation: 'Route outbound requests through Agent Egress Sentinel (:8095).',
    });
  }
  if (/ignore\s+(?:all\s+)?previous\s+instructions|bypass\s+policy|override\s+permissions/i.test(text)) {
    findings.push({
      rule_id: 'INJ-007-PROMPT-INJECTION',
      severity: 'CRITICAL',
      description: 'Detected prompt-injection or policy-evasion directive.',
      remediation: 'Isolate system directives from untrusted input.',
    });
  }

  const weights = { CRITICAL: 35, HIGH: 20, MEDIUM: 10, LOW: 5 };
  const deduction = findings.reduce((acc, f) => acc + (weights[f.severity] || 5), 0);
  const score = Math.max(0, 100 - deduction);
  const hasCritical = findings.some((f) => f.severity === 'CRITICAL');
  const hasHigh = findings.some((f) => f.severity === 'HIGH');
  const risk = (hasCritical || score < 25) ? 'CRITICAL' : (hasHigh || score < 50) ? 'HIGH' : score < 75 ? 'MEDIUM' : score < 90 ? 'LOW' : 'SAFE';

  return {
    manifest_name: (parsed && parsed.name) || 'custom_manifest',
    security_score: score,
    risk_level: risk,
    total_findings: findings.length,
    findings,
    compliance_frameworks: {
      NIST_AI_RMF: score >= 80 ? 'COMPLIANT' : 'NON_COMPLIANT',
      OWASP_LLM_TOP_10: (hasCritical || hasHigh) ? 'ACTION_REQUIRED' : 'PASS',
      ZOTH_ZERO_EGRESS_INVARIANT: score >= 85 ? 'VERIFIED' : 'QUARANTINED',
    },
  };
}

export function AgentPolicyAuditorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast Dual-Theme Tokens (>= 4.5:1 in both Dark and Editorial Ivory Light)
  const emerald = isDark ? '#10B981' : '#047857';
  const emeraldSoft = isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(4, 120, 87, 0.11)';
  const gold = isDark ? '#D4AF37' : '#8C6A2E';
  const goldSoft = isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(140, 106, 46, 0.11)';
  const crimson = isDark ? '#F43F5E' : '#BE123C';
  const crimsonSoft = isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(190, 18, 60, 0.10)';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const cyanSoft = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(3, 105, 161, 0.10)';
  const panelInsetBg = isDark ? '#0B0D14' : '#F3EFE6';
  const cardBg = isDark ? '#10121A' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(24, 22, 19, 0.15)';
  const textPrimary = isDark ? '#F8FAFC' : '#181613';
  const textSecondary = isDark ? '#94A3B8' : '#4A463F';

  const ephemeralKeyRef = useRef(null);
  if (!ephemeralKeyRef.current) {
    ephemeralKeyRef.current = generateEphemeralKeyHex();
  }

  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonVersion, setDaemonVersion] = useState('2.6.0');
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Tab 0: Manifest Auditor
  const [manifestText, setManifestText] = useState(`{
  "name": "pantheon_enterprise_worker",
  "version": "2.6.0",
  "tools": [
    {
      "name": "bash_terminal",
      "description": "Executes shell commands on host operating system",
      "parameters": {
        "type": "object",
        "properties": {
          "command": { "type": "string", "description": "Shell command to execute" }
        },
        "required": ["command"]
      }
    },
    {
      "name": "write_file",
      "description": "Writes code files to disk",
      "parameters": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "content": { "type": "string" }
        }
      }
    },
    {
      "name": "http_fetch",
      "description": "Fetches remote URL payloads",
      "parameters": {
        "type": "object",
        "properties": {
          "url": { "type": "string" }
        }
      }
    }
  ]
}`);
  const [auditReport, setAuditReport] = useState(null);
  const [auditing, setAuditing] = useState(false);

  // Tab 1: Capability Leaser
  const [leases, setLeases] = useState([]);
  const [agentId, setAgentId] = useState('pantheon_archon_01');
  const [capability, setCapability] = useState('FS_WRITE');
  const [targetScope, setTargetScope] = useState('/tmp/work/*');
  const [ttlSeconds, setTtlSeconds] = useState(300);
  const [maxBudgetUsd, setMaxBudgetUsd] = useState(1.0);

  // Tab 2: Action / Token Verifier
  const [verifyLeaseId, setVerifyLeaseId] = useState('');
  const [verifyCap, setVerifyCap] = useState('FS_WRITE');
  const [verifyTarget, setVerifyTarget] = useState('/tmp/work/output.txt');
  const [verifyCost, setVerifyCost] = useState(0.25);
  const [verifyResult, setVerifyResult] = useState(null);

  const notify = useCallback((severity, text) => {
    setStatusMessage({ severity, text });
  }, []);

  const syncLiveLeases = useCallback(async () => {
    try {
      const healthRes = await fetch(`${DAEMON_BASE}/health`);
      if (!healthRes.ok) {
        setDaemonOnline(false);
        return false;
      }
      const h = await healthRes.json();
      setDaemonOnline(true);
      if (h.version) setDaemonVersion(h.version);

      const leasesRes = await fetch(`${DAEMON_BASE}/api/leases`);
      if (leasesRes.ok) {
        const data = await leasesRes.json();
        const mapped = (data.leases || []).map((l) => ({
          leaseId: l.lease_id,
          agentId: l.agent_id,
          capability: l.capability,
          targetScope: l.target,
          budget: Number(l.max_budget_usd || 0),
          usedBudget: Number(l.used_budget_usd || 0),
          remainingSec: Math.max(0, Math.floor(Number(l.ttl_seconds || 0))),
          signature: l.signature || '',
          live: true,
        }));
        setLeases(mapped);
        if (mapped.length > 0 && !verifyLeaseId) {
          setVerifyLeaseId(mapped[0].leaseId);
          setVerifyCap(mapped[0].capability);
        }
      }
      return true;
    } catch (_e) {
      setDaemonOnline(false);
      return false;
    }
  }, [verifyLeaseId]);

  useEffect(() => {
    syncLiveLeases().then((online) => {
      handleRunAudit(online);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLeases((prev) =>
        prev
          .map((l) => ({ ...l, remainingSec: Math.max(0, l.remainingSec - 1) }))
          .filter((l) => l.remainingSec > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        notify('success', `Copied ${label} to clipboard.`);
      }).catch(() => {
        notify('info', `${label} ready to copy.`);
      });
    }
  };

  const handleRunAudit = async (forceLive) => {
    setAuditing(true);
    const useLive = typeof forceLive === 'boolean' ? forceLive : daemonOnline;
    try {
      if (useLive) {
        let manifestPayload = manifestText;
        let name = 'studio_manifest';
        try {
          const parsed = JSON.parse(manifestText);
          manifestPayload = parsed;
          if (parsed && typeof parsed.name === 'string') name = parsed.name;
        } catch (_e) {
          manifestPayload = manifestText;
        }
        const res = await fetch(`${DAEMON_BASE}/api/audit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manifest: manifestPayload, name }),
        });
        if (res.ok) {
          const report = await res.json();
          setAuditReport({ ...report, source: 'live-daemon' });
          setAuditing(false);
          return;
        }
      }
      const offlineReport = auditManifestOffline(manifestText);
      setAuditReport({ ...offlineReport, source: 'offline-preview' });
    } catch (_err) {
      const offlineReport = auditManifestOffline(manifestText);
      setAuditReport({ ...offlineReport, source: 'offline-preview' });
    }
    setAuditing(false);
  };

  const handleGrantLease = async () => {
    if (daemonOnline) {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/leases/grant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: agentId.trim(),
            capability,
            target: targetScope.trim(),
            duration_sec: Number(ttlSeconds),
            budget_usd: Number(maxBudgetUsd),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.lease) {
          notify('error', `Broker rejected lease (${res.status}): ${data.error || 'Invalid input'}`);
          return;
        }
        setVerifyLeaseId(data.lease.lease_id);
        setVerifyCap(data.lease.capability);
        notify('success', `Granted live lease ${data.lease.lease_id} on :8106.`);
        await syncLiveLeases();
        return;
      } catch (err) {
        notify('error', `Failed to reach :8106: ${err.message}`);
        setDaemonOnline(false);
        return;
      }
    }

    // Clearly labeled offline preview using ephemeral WebCrypto CSPRNG key
    const issuedAt = Date.now();
    const expiresAt = issuedAt + Number(ttlSeconds) * 1000;
    const nonce = generateEphemeralKeyHex().slice(0, 12);
    const payload = {
      iss: 'offline-preview-ephemeral',
      lease_id: `lease_${nonce}`,
      agent_id: agentId.trim(),
      capability,
      target: targetScope.trim(),
      max_budget_usd: Number(maxBudgetUsd),
      iat: issuedAt,
      exp: expiresAt,
    };
    const sig = await signHmacSha256(JSON.stringify(payload), ephemeralKeyRef.current);
    const previewLease = {
      leaseId: payload.lease_id,
      agentId: payload.agent_id,
      capability: payload.capability,
      targetScope: payload.target,
      budget: payload.max_budget_usd,
      usedBudget: 0,
      remainingSec: Number(ttlSeconds),
      signature: sig,
      live: false,
    };
    setLeases((prev) => [previewLease, ...prev]);
    setVerifyLeaseId(previewLease.leaseId);
    setVerifyCap(previewLease.capability);
    notify('info', `Offline preview lease ${previewLease.leaseId} signed with ephemeral WebCrypto key.`);
  };

  const handleRevokeLease = async (leaseId) => {
    if (daemonOnline) {
      try {
        await fetch(`${DAEMON_BASE}/api/leases/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lease_id: leaseId }),
        });
        notify('success', `Revoked lease ${leaseId} on :8106.`);
        await syncLiveLeases();
        return;
      } catch (err) {
        notify('error', `Revoke failed: ${err.message}`);
      }
    }
    setLeases((prev) => prev.filter((l) => l.leaseId !== leaseId));
  };

  const handleKillSwitchAll = async () => {
    if (daemonOnline) {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/leases/revoke_all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ all_agents: true }),
        });
        const data = await res.json();
        notify('warning', `Global kill-switch revoked ${data.revoked_count || 0} active lease(s) on :8106.`);
        await syncLiveLeases();
        return;
      } catch (err) {
        notify('error', `Kill-switch failed: ${err.message}`);
      }
    }
    setLeases([]);
    notify('warning', 'Cleared all offline preview leases.');
  };

  const handleVerifyAction = async () => {
    if (!verifyLeaseId.trim()) {
      notify('error', 'Enter or select a Lease ID first.');
      return;
    }
    if (daemonOnline) {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/leases/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lease_id: verifyLeaseId.trim(),
            capability: verifyCap,
            target: verifyTarget.trim(),
            cost_usd: Number(verifyCost),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setVerifyResult({ allowed: false, reason: data.error || `HTTP ${res.status}`, source: 'live-daemon' });
          return;
        }
        setVerifyResult({ ...data, source: 'live-daemon' });
        await syncLiveLeases();
        return;
      } catch (err) {
        setVerifyResult({ allowed: false, reason: `Daemon error: ${err.message}`, source: 'live-daemon' });
        return;
      }
    }

    const found = leases.find((l) => l.leaseId === verifyLeaseId.trim());
    if (!found) {
      setVerifyResult({ allowed: false, reason: 'Offline preview: lease not found.', source: 'offline-preview' });
      return;
    }
    const capMatch = found.capability === verifyCap;
    const noTraversal = !verifyTarget.includes('..');
    const ok = capMatch && noTraversal;
    setVerifyResult({
      allowed: ok,
      reason: ok ? 'Offline preview: capability and path checks passed (start :8106 for SQLite enforcement).' : 'Offline preview: capability mismatch or traversal blocked.',
      source: 'offline-preview',
    });
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Live Connection & Action Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          bgcolor: cardBg,
          border: `1px solid ${daemonOnline ? emerald : gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.1,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textPrimary }}>
                Agent Policy Auditor v{daemonVersion}
              </Typography>
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ color: `${daemonOnline ? emerald : gold} !important` }} />}
                label={daemonOnline ? 'LIVE DAEMON :8106 CONNECTED' : 'OFFLINE IN-BROWSER PREVIEW'}
                sx={{
                  bgcolor: daemonOnline ? emeraldSoft : goldSoft,
                  color: daemonOnline ? emerald : gold,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.3 }}>
              {daemonOnline
                ? 'Directly bridged to 127.0.0.1:8106 SQLite WAL broker, HMAC-SHA256 verifier, and OWASP LLM manifest auditor.'
                : 'Local daemon (:8106) is stopped. Using ephemeral WebCrypto preview — run `agent-policy-auditor serve` for live persistence.'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={syncLiveLeases}
            sx={{
              minHeight: 40,
              borderColor: cyan,
              color: cyan,
              fontWeight: 700,
              fontFamily: mono,
            }}
          >
            Sync :8106
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BoltIcon />}
            onClick={handleKillSwitchAll}
            sx={{
              minHeight: 40,
              borderColor: crimson,
              color: crimson,
              fontWeight: 700,
              fontFamily: mono,
            }}
          >
            Kill-Switch All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleCopy('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', 'Solana Tip Address')}
            sx={{
              minHeight: 40,
              borderColor: gold,
              color: gold,
              fontWeight: 700,
              fontFamily: mono,
            }}
          >
            ◎ Copy Solana Tip
          </Button>
        </Stack>
      </Paper>

      {statusMessage && (
        <Alert
          severity={statusMessage.severity}
          onClose={() => setStatusMessage(null)}
          sx={{ mb: 2, fontFamily: mono, fontSize: '0.78rem' }}
        >
          {statusMessage.text}
        </Alert>
      )}

      {/* Main Workspace Tabs */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          bgcolor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2.5,
            borderBottom: `1px solid ${cardBorder}`,
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.78rem',
              minHeight: 44,
              color: textSecondary,
            },
            '& .Mui-selected': {
              color: `${gold} !important`,
            },
          }}
        >
          <Tab icon={<RuleIcon />} iconPosition="start" label="MANIFEST AUDITOR" />
          <Tab icon={<KeyIcon />} iconPosition="start" label={`HMAC CAPABILITY LEASER (${leases.length})`} />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="LIVE ACTION VERIFIER" />
        </Tabs>

        {/* TAB 0: MANIFEST SECURITY AUDITOR */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid xs={12} lg={6}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1 }}>
                MCP / AGENT TOOL MANIFEST (JSON)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={13}
                value={manifestText}
                onChange={(e) => setManifestText(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleRunAudit()}
                disabled={auditing}
                startIcon={<SecurityIcon />}
                sx={{
                  minHeight: 44,
                  bgcolor: cyan,
                  color: isDark ? '#041019' : '#FFFFFF',
                  fontWeight: 800,
                  fontFamily: mono,
                  '&:hover': { bgcolor: isDark ? '#0EA5E9' : '#075985' },
                }}
              >
                {daemonOnline ? 'RUN LIVE :8106 MANIFEST AUDIT' : 'RUN OFFLINE STATIC MANIFEST AUDIT'}
              </Button>
            </Grid>

            <Grid xs={12} lg={6}>
              {auditReport ? (
                <Stack spacing={2}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: panelInsetBg, border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary }}>
                          SECURITY COMPLIANCE SCORE ({auditReport.source === 'live-daemon' ? 'LIVE :8106' : 'OFFLINE'})
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: mono,
                            fontWeight: 800,
                            color: auditReport.security_score >= 80 ? emerald : auditReport.security_score >= 50 ? gold : crimson,
                          }}
                        >
                          {auditReport.security_score}/100
                        </Typography>
                      </Box>
                      <Chip
                        label={auditReport.risk_level}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          bgcolor: auditReport.risk_level === 'CRITICAL' ? crimsonSoft : auditReport.risk_level === 'HIGH' ? goldSoft : emeraldSoft,
                          color: auditReport.risk_level === 'CRITICAL' ? crimson : auditReport.risk_level === 'HIGH' ? gold : emerald,
                        }}
                      />
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block' }}>
                      NIST AI RMF: <strong>{auditReport.compliance_frameworks?.NIST_AI_RMF}</strong> • OWASP LLM:{' '}
                      <strong>{auditReport.compliance_frameworks?.OWASP_LLM_TOP_10}</strong>
                    </Typography>
                  </Paper>

                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: textSecondary }}>
                    FINDINGS ({(auditReport.findings || []).length}):
                  </Typography>

                  <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                    {(auditReport.findings || []).length === 0 ? (
                      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: panelInsetBg, border: `1px solid ${cardBorder}` }}>
                        <Typography variant="body2" sx={{ fontFamily: mono, color: emerald, fontWeight: 700 }}>
                          ✓ 0 vulnerabilities identified. Manifest passes OWASP LLM &amp; NIST AI RMF static checks.
                        </Typography>
                      </Paper>
                    ) : (
                      (auditReport.findings || []).map((f, idx) => (
                        <Paper
                          key={idx}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            mb: 1.5,
                            bgcolor: cardBg,
                            border: `1px solid ${f.severity === 'CRITICAL' ? crimson : gold}`,
                            borderRadius: 1.5,
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: f.severity === 'CRITICAL' ? crimson : gold }}>
                              [{f.severity}] {f.rule_id}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: textPrimary, display: 'block' }}>
                            {f.description}
                          </Typography>
                          {f.remediation && (
                            <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, display: 'block', mt: 0.5 }}>
                              Remediation: {f.remediation}
                            </Typography>
                          )}
                        </Paper>
                      ))
                    )}
                  </Box>
                </Stack>
              ) : null}
            </Grid>
          </Grid>
        )}

        {/* TAB 1: HMAC CAPABILITY LEASER */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: panelInsetBg, border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 2 }}>
                  ISSUE CRYPTOGRAPHIC CAPABILITY LEASE
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    size="small"
                    label="Agent Identifier"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                  />

                  <FormControl size="small">
                    <InputLabel>Capability Primitive</InputLabel>
                    <Select
                      value={capability}
                      label="Capability Primitive"
                      onChange={(e) => setCapability(e.target.value)}
                      sx={{ fontFamily: mono, fontSize: '0.8rem' }}
                    >
                      {CAPABILITIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    label="Scope / Target Pattern"
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                  />

                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <TextField
                        size="small"
                        type="number"
                        label="TTL (Seconds)"
                        value={ttlSeconds}
                        onChange={(e) => setTtlSeconds(Number(e.target.value))}
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        size="small"
                        type="number"
                        label="Budget ($USD)"
                        value={maxBudgetUsd}
                        onChange={(e) => setMaxBudgetUsd(Number(e.target.value))}
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    onClick={handleGrantLease}
                    startIcon={<KeyIcon />}
                    sx={{
                      minHeight: 44,
                      bgcolor: gold,
                      color: isDark ? '#08080B' : '#FFFFFF',
                      fontWeight: 800,
                      fontFamily: mono,
                      '&:hover': { bgcolor: isDark ? '#C59B27' : '#6F511E' },
                    }}
                  >
                    {daemonOnline ? 'GRANT LIVE :8106 LEASE' : 'GRANT OFFLINE PREVIEW LEASE'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid xs={12} md={7}>
              <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: panelInsetBg, color: textPrimary }}>Lease ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: panelInsetBg, color: textPrimary }}>Agent / Cap</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: panelInsetBg, color: textPrimary }}>TTL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontFamily: mono, bgcolor: panelInsetBg, color: textPrimary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: textSecondary, fontFamily: mono }}>
                          No active capability leases. Issue a lease on the left.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leases.map((l) => (
                        <TableRow key={l.leaseId} hover>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: gold, fontWeight: 700 }}>
                            {l.leaseId}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: textPrimary }}>
                              {l.agentId}
                            </Typography>
                            <Chip label={l.capability} size="small" sx={{ fontFamily: mono, fontSize: '0.66rem', height: 20, bgcolor: cyanSoft, color: cyan, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: emerald, fontWeight: 800 }}>
                            {l.remainingSec}s
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              aria-label={`Copy lease ${l.leaseId}`}
                              onClick={() => handleCopy(l.leaseId, l.leaseId)}
                              sx={{ color: gold, minWidth: 36, minHeight: 36 }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={`Revoke lease ${l.leaseId}`}
                              onClick={() => handleRevokeLease(l.leaseId)}
                              sx={{ color: crimson, minWidth: 36, minHeight: 36 }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}

        {/* TAB 2: LIVE ACTION VERIFIER */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1.5 }}>
                VERIFY AGENT ACTION (HMAC + PATH NORM + QUOTA)
              </Typography>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label="Lease ID"
                  value={verifyLeaseId}
                  onChange={(e) => setVerifyLeaseId(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
                <FormControl size="small">
                  <InputLabel>Action Capability</InputLabel>
                  <Select
                    value={verifyCap}
                    label="Action Capability"
                    onChange={(e) => setVerifyCap(e.target.value)}
                    sx={{ fontFamily: mono, fontSize: '0.8rem' }}
                  >
                    {CAPABILITIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>{c.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Candidate Target (e.g. /tmp/work/file.txt)"
                  value={verifyTarget}
                  onChange={(e) => setVerifyTarget(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Action Cost ($USD)"
                  value={verifyCost}
                  onChange={(e) => setVerifyCost(Number(e.target.value))}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyAction}
                  startIcon={<VerifiedUserIcon />}
                  sx={{
                    minHeight: 44,
                    bgcolor: emerald,
                    color: isDark ? '#04130D' : '#FFFFFF',
                    fontWeight: 800,
                    fontFamily: mono,
                    '&:hover': { bgcolor: isDark ? '#059669' : '#065F46' },
                  }}
                >
                  VERIFY ACTION AGAINST POLICY BROKER
                </Button>
              </Stack>
            </Grid>

            <Grid xs={12} md={6}>
              {verifyResult ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: panelInsetBg,
                    border: `1.5px solid ${verifyResult.allowed ? emerald : crimson}`,
                    borderRadius: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      label={verifyResult.allowed ? 'ALLOW — AUTHORIZED' : 'DENY — BLOCKED'}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: verifyResult.allowed ? emeraldSoft : crimsonSoft,
                        color: verifyResult.allowed ? emerald : crimson,
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ fontFamily: mono, color: textPrimary, mb: 1 }}>
                    {verifyResult.reason}
                  </Typography>
                  {typeof verifyResult.max_budget_usd === 'number' && (
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block' }}>
                      Budget: used ${Number(verifyResult.used_budget_usd).toFixed(4)} / cap ${Number(verifyResult.max_budget_usd).toFixed(4)} (remaining ${Number(verifyResult.remaining_budget_usd).toFixed(4)})
                    </Typography>
                  )}
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ p: 5, textAlign: 'center', bgcolor: panelInsetBg, border: `1px dashed ${cardBorder}` }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, color: textSecondary }}>
                    Grant a lease in Tab 2, then verify allowed paths, traversal blocks, and budget quotas here.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Sovereign Visual Band positioned cleanly outside forms */}
      <Box sx={{ mt: 3 }}>
        <SovereignEyebrow accent={emerald} right="Security & Enclave">
          agent-policy-auditor
        </SovereignEyebrow>
        <SovereignBand
          seed="agent-policy-auditor"
          eyebrow="Security & Enclave"
          caption="Agent Policy Auditor v2.6.0 — Local Daemon :8106 & Stdio MCP"
          label="Agent Policy Auditor — Zoth sovereign visualisation"
        />
      </Box>
    </Box>
  );
}

export default AgentPolicyAuditorGodModeTool;
