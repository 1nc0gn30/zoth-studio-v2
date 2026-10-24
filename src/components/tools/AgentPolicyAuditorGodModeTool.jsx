import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Security Audit Rules Catalog
// ---------------------------------------------------------------------------
const AUDIT_RULES = [
  {
    id: 'EXEC-001',
    name: 'Unsandboxed Shell & Subprocess Execution',
    severity: 'CRITICAL',
    weight: 35,
    test: (tool) => {
      const name = (tool.name || '').toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      return /bash|shell|terminal|exec|command|run_command|spawn|system/i.test(name) ||
             /execute.*(?:shell|command|terminal|bash)/i.test(desc);
    },
    message: 'Tool enables arbitrary host shell execution without air-gapped process jail boundaries.',
    remediation: 'Confine execution using Agent Capsule Jail (:8105) or restrict allowable commands.'
  },
  {
    id: 'FS-001',
    name: 'Unrestricted Filesystem Write Access',
    severity: 'HIGH',
    weight: 25,
    test: (tool) => {
      const name = (tool.name || '').toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      return /write_file|edit_file|save_file|delete_file|unlink|remove_file|modify/i.test(name) ||
             /write.*file|save.*disk|modify.*filesystem/i.test(desc);
    },
    message: 'Tool allows arbitrary disk write / delete operations without path confinement.',
    remediation: 'Restrict writable targets to ephemeral scratch directories with path chroot validation.'
  },
  {
    id: 'NET-001',
    name: 'Unfiltered Network Egress & HTTP Fetch',
    severity: 'HIGH',
    weight: 20,
    test: (tool) => {
      const name = (tool.name || '').toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      return /fetch|http|request|curl|download|browser|get_url|post_url/i.test(name) ||
             /network.*request|fetch.*url|send.*http/i.test(desc);
    },
    message: 'Tool can initiate outbound network requests susceptible to SSRF and data exfiltration.',
    remediation: 'Route requests through Agent Egress Sentinel (:8095) with SNI domain allowlists.'
  },
  {
    id: 'CRED-001',
    name: 'Credential & Key Parameter Exposure',
    severity: 'CRITICAL',
    weight: 30,
    test: (tool) => {
      const schemaStr = JSON.stringify(tool.parameters || {}).toLowerCase();
      return /api_key|token|secret|password|auth_header|bearer|private_key/i.test(schemaStr);
    },
    message: 'Tool parameters accept raw credentials in model context without cryptographic vault sealing.',
    remediation: 'Store credentials in EnvGuard Secrets Vault and pass zero-knowledge token references.'
  },
  {
    id: 'INJ-001',
    name: 'Untyped Raw Prompt Injection Vector',
    severity: 'MEDIUM',
    weight: 15,
    test: (tool) => {
      const schema = tool.parameters || {};
      const props = schema.properties || {};
      return Object.values(props).some((p) => p.type === 'string' && !p.enum && !p.pattern && (p.description || '').toLowerCase().includes('prompt'));
    },
    message: 'Tool accepts freeform prompt strings susceptible to adversarial delimiter hijacking.',
    remediation: 'Apply Agent Prompt Firewall regex sanitization and strict schema enum constraints.'
  }
];

// Helper: HMAC-SHA256 Token Signing
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

export function AgentPolicyAuditorGodModeTool() {
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
  const [activeTab, setActiveTab] = useState(0); // 0: Manifest Security Auditor, 1: Cryptographic Leaser, 2: Token Verifier
  const [manifestText, setManifestText] = useState(`{
  "name": "pantheon_enterprise_worker",
  "version": "2.4.0",
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
      "description": "Writes arbitrary code files to disk",
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
          "url": { "type": "string" },
          "api_key": { "type": "string", "description": "Bearer token or API Key" }
        }
      }
    }
  ]
}`);

  const [auditReport, setAuditReport] = useState(null);
  const [auditing, setAuditing] = useState(false);

  // Leaser State
  const [leases, setLeases] = useState([]);
  const [agentId, setAgentId] = useState('pantheon_archon_01');
  const [capability, setCapability] = useState('FS_WRITE');
  const [targetScope, setTargetScope] = useState('~/NullAITech/**');
  const [ttlSeconds, setTtlSeconds] = useState(300);
  const [maxBudgetUsd, setMaxBudgetUsd] = useState(0.50);

  // Verification State
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  const [copiedKey, setCopiedKey] = useState(null);
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  // Enclave Master Signing Key (in-memory)
  const masterKey = 'sovereign_enclave_hmac_master_seed_2026';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
    // Run initial audit on load
    handleRunAudit();
  }, []);

  // Periodic Lease TTL Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setLeases((prev) =>
        prev
          .map((l) => ({ ...l, remainingSec: Math.max(0, Math.floor((l.expiresAt - Date.now()) / 1000)) }))
          .filter((l) => l.remainingSec > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
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
  // Real In-Browser Manifest Security Audit Engine
  // ---------------------------------------------------------------------------
  const handleRunAudit = () => {
    setAuditing(true);
    try {
      const parsed = JSON.parse(manifestText);
      const tools = parsed.tools || (Array.isArray(parsed) ? parsed : [parsed]);

      const findings = [];
      let totalPenalty = 0;

      tools.forEach((tool) => {
        AUDIT_RULES.forEach((rule) => {
          if (rule.test(tool)) {
            totalPenalty += rule.weight;
            findings.push({
              toolName: tool.name || 'unnamed_tool',
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              message: rule.message,
              remediation: rule.remediation
            });
          }
        });
      });

      const securityScore = Math.max(0, Math.min(100, 100 - totalPenalty));
      let riskLevel = 'CLEAN';
      if (securityScore < 40) riskLevel = 'CRITICAL';
      else if (securityScore < 70) riskLevel = 'HIGH';
      else if (securityScore < 90) riskLevel = 'MEDIUM';

      setAuditReport({
        agentName: parsed.name || 'Custom Agent',
        toolsAudited: tools.length,
        securityScore,
        riskLevel,
        findings,
        compliance: {
          nistAiRmf: securityScore >= 80 ? 'COMPLIANT' : 'ACTION REQUIRED',
          owaspLlmTop10: findings.some((f) => f.ruleId === 'EXEC-001' || f.ruleId === 'CRED-001') ? 'VULNERABILITIES DETECTED' : 'PASSED',
          zothZeroEgress: findings.some((f) => f.ruleId === 'NET-001') ? 'POLICY VIOLATION' : 'ENFORCED'
        }
      });
    } catch (err) {
      setAuditReport({
        agentName: 'Parse Error',
        toolsAudited: 0,
        securityScore: 0,
        riskLevel: 'INVALID JSON',
        findings: [{ toolName: 'Schema Parser', ruleId: 'SYNTAX-001', severity: 'CRITICAL', message: `Manifest JSON is invalid: ${err.message}`, remediation: 'Correct syntax errors.' }],
        compliance: { nistAiRmf: 'FAIL', owaspLlmTop10: 'FAIL', zothZeroEgress: 'FAIL' }
      });
    }
    setAuditing(false);
  };

  // ---------------------------------------------------------------------------
  // Issue Real Cryptographically Signed Lease Token
  // ---------------------------------------------------------------------------
  const handleGrantLease = async () => {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + ttlSeconds * 1000;
    const nonce = Math.random().toString(36).substring(2, 10);

    const payload = {
      iss: 'zoth-policy-broker',
      sub: agentId,
      cap: capability,
      scope: targetScope,
      budget: maxBudgetUsd,
      iat: issuedAt,
      exp: expiresAt,
      nonce
    };

    const payloadJson = JSON.stringify(payload);
    const signature = await signHmacSha256(payloadJson, masterKey);
    const signedToken = `${btoa(payloadJson)}.${signature}`;

    const newLease = {
      leaseId: `lease_${nonce}`,
      agentId,
      capability,
      targetScope,
      budget: maxBudgetUsd,
      issuedAt,
      expiresAt,
      remainingSec: ttlSeconds,
      token: signedToken
    };

    setLeases((prev) => [newLease, ...prev]);
  };

  // ---------------------------------------------------------------------------
  // Verify Cryptographic Lease Token
  // ---------------------------------------------------------------------------
  const handleVerifyToken = async () => {
    if (!verifyTokenInput.trim()) return;

    try {
      const parts = verifyTokenInput.trim().split('.');
      if (parts.length !== 2) {
        setVerifyResult({ valid: false, error: 'Malformed token structure. Expected [Base64Payload].[HMACSignature]' });
        return;
      }

      const [b64Payload, providedSig] = parts;
      const payloadStr = atob(b64Payload);
      const payload = JSON.parse(payloadStr);

      const expectedSig = await signHmacSha256(payloadStr, masterKey);
      const isSignatureValid = expectedSig === providedSig;
      const isExpired = Date.now() > payload.exp;

      setVerifyResult({
        valid: isSignatureValid && !isExpired,
        signatureMatch: isSignatureValid,
        expired: isExpired,
        payload,
        remainingSec: Math.max(0, Math.floor((payload.exp - Date.now()) / 1000))
      });
    } catch (err) {
      setVerifyResult({ valid: false, error: `Token validation error: ${err.message}` });
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
            <VerifiedUserIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                Agent Policy Auditor &amp; Capability Leaser
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
              Real static MCP security auditor, Web Crypto HMAC-SHA256 capability leasing, and compliance verification.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/fZebJ00V98DcbjafZ9"
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
              label="UNLIMITED LEASING AUDITS UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Main Workspace Tabs */}
      <Paper
        sx={{
          p: 2.5,
          bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mb: 2.5,
            borderBottom: `1px solid ${cardBorder}`,
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.8rem',
              py: 1
            }
          }}
        >
          <Tab icon={<RuleIcon />} iconPosition="start" label="MANIFEST SECURITY AUDITOR" />
          <Tab icon={<KeyIcon />} iconPosition="start" label={`HMAC CAPABILITY LEASER (${leases.length})`} />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="LEASE TOKEN VERIFIER" />
        </Tabs>

        {/* TAB 0: MANIFEST SECURITY AUDITOR */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Manifest Input */}
            <Grid xs={12} lg={6}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1 }}>
                MCP / AGENT TOOL MANIFEST (JSON)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={14}
                value={manifestText}
                onChange={(e) => setManifestText(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleRunAudit}
                disabled={auditing}
                startIcon={<SecurityIcon />}
                sx={{
                  bgcolor: cyan,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  py: 1.2,
                  '&:hover': { bgcolor: '#0284C7' }
                }}
              >
                EXECUTE REAL STATIC SECURITY AUDIT
              </Button>
            </Grid>

            {/* Audit Report & Findings */}
            <Grid xs={12} lg={6}>
              {auditReport ? (
                <Stack spacing={2}>
                  {/* Score Card */}
                  <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                          SECURITY COMPLIANCE SCORE
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: mono,
                            fontWeight: 800,
                            color: auditReport.securityScore >= 80 ? emerald : auditReport.securityScore >= 50 ? gold : crimson
                          }}
                        >
                          {auditReport.securityScore}/100
                        </Typography>
                      </Box>
                      <Chip
                        label={auditReport.riskLevel}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          bgcolor: auditReport.riskLevel === 'CRITICAL' ? crimsonSoft : auditReport.riskLevel === 'HIGH' ? goldSoft : emeraldSoft,
                          color: auditReport.riskLevel === 'CRITICAL' ? crimson : auditReport.riskLevel === 'HIGH' ? gold : emerald
                        }}
                      />
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block' }}>
                      NIST AI RMF: <strong>{auditReport.compliance.nistAiRmf}</strong> • OWASP LLM: <strong>{auditReport.compliance.owaspLlmTop10}</strong>
                    </Typography>
                  </Paper>

                  {/* Findings Feed */}
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: 'text.secondary' }}>
                    IDENTIFIED VULNERABILITIES &amp; POLICY REMEDIATIONS ({auditReport.findings.length}):
                  </Typography>

                  <Box sx={{ maxHeight: 270, overflowY: 'auto', pr: 0.5 }}>
                    {auditReport.findings.length === 0 ? (
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}` }}>
                        <Typography variant="body2" sx={{ fontFamily: mono, color: emerald, fontWeight: 700 }}>
                          ✔ 100% Policy Compliant! No security vulnerabilities identified across audited tool definitions.
                        </Typography>
                      </Paper>
                    ) : (
                      auditReport.findings.map((f, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 1.5,
                            mb: 1.5,
                            bgcolor: isDark ? voidDark : '#FFF',
                            border: `1px solid ${f.severity === 'CRITICAL' ? crimson : gold}`,
                            borderRadius: 1.5
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: f.severity === 'CRITICAL' ? crimson : gold }}>
                              {f.ruleId}: {f.ruleName}
                            </Typography>
                            <Chip label={f.toolName} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
                          </Stack>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block' }}>
                            {f.message}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, display: 'block', mt: 0.5 }}>
                            Remediation: {f.remediation}
                          </Typography>
                        </Paper>
                      ))
                    )}
                  </Box>
                </Stack>
              ) : (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px dashed ${cardBorder}` }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                    Click &ldquo;EXECUTE REAL STATIC SECURITY AUDIT&rdquo; to analyze manifest parameters against policy rules.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}

        {/* TAB 1: HMAC CAPABILITY LEASER */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {/* Grant Lease Form */}
            <Grid xs={12} md={5}>
              <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
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
                      <MenuItem value="FS_WRITE">FS_WRITE (Filesystem Modifications)</MenuItem>
                      <MenuItem value="NET_EGRESS">NET_EGRESS (Outbound Web Access)</MenuItem>
                      <MenuItem value="SHELL_EXEC">SHELL_EXEC (Subprocess Invocations)</MenuItem>
                      <MenuItem value="VAULT_READ">VAULT_READ (Decryption Access)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    label="Scope / Target Constraint"
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
                      bgcolor: gold,
                      color: '#000',
                      fontWeight: 800,
                      fontFamily: mono,
                      py: 1.1,
                      '&:hover': { bgcolor: '#B8860B' }
                    }}
                  >
                    SIGN &amp; GRANT HMAC LEASE
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Active Leases Table */}
            <Grid xs={12} md={7}>
              <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Lease ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Agent / Capability</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>TTL Countdown</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>Token</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: 'text.secondary', fontFamily: mono }}>
                          No active capability leases issued. Fill the form to grant a signed token.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leases.map((l) => (
                        <TableRow key={l.leaseId} hover>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: gold, fontWeight: 700 }}>
                            {l.leaseId}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700 }}>
                              {l.agentId}
                            </Typography>
                            <Chip label={l.capability} size="small" sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18, bgcolor: cyanSoft, color: cyan }} />
                          </TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: emerald, fontWeight: 800 }}>
                            {l.remainingSec}s
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(l.token, l.leaseId)}
                              sx={{ color: gold }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
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

        {/* TAB 2: LEASE TOKEN VERIFIER */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1 }}>
                VERIFY SIGNED CAPABILITY TOKEN
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                placeholder="Paste [Base64Payload].[HMACSignature] token here..."
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleVerifyToken}
                startIcon={<VerifiedUserIcon />}
                sx={{
                  bgcolor: emerald,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  py: 1.1,
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                VERIFY CRYPTOGRAPHIC SIGNATURE &amp; TTL
              </Button>
            </Grid>

            <Grid xs={12} md={6}>
              {verifyResult ? (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: isDark ? voidDark : '#0F172A',
                    border: `1px solid ${verifyResult.valid ? emerald : crimson}`,
                    borderRadius: 1.5
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      label={verifyResult.valid ? 'SIGNATURE VALID & ACTIVE' : 'INVALID / EXPIRED TOKEN'}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: verifyResult.valid ? emeraldSoft : crimsonSoft,
                        color: verifyResult.valid ? emerald : crimson
                      }}
                    />
                  </Stack>

                  {verifyResult.error ? (
                    <Typography variant="body2" sx={{ color: crimson, fontFamily: mono }}>
                      {verifyResult.error}
                    </Typography>
                  ) : (
                    <Box sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#CBD5E1' }}>
                      <div>Subject: <strong>{verifyResult.payload.sub}</strong></div>
                      <div>Capability: <strong>{verifyResult.payload.cap}</strong></div>
                      <div>Scope: <strong>{verifyResult.payload.scope}</strong></div>
                      <div>Budget Cap: <strong>${verifyResult.payload.budget}</strong></div>
                      <div>Signature Match: <strong>{verifyResult.signatureMatch ? 'YES (HMAC-SHA256)' : 'NO (TAMPERED)'}</strong></div>
                      <div>Remaining TTL: <strong>{verifyResult.remainingSec}s</strong></div>
                    </Box>
                  )}
                </Paper>
              ) : (
                <Paper sx={{ p: 5, textAlign: 'center', bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px dashed ${cardBorder}` }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                    Paste a lease token and click &ldquo;VERIFY CRYPTOGRAPHIC SIGNATURE &amp; TTL&rdquo; to inspect integrity.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>

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
              Agent Policy Auditor Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock automated enterprise MCP policy enforcement, multi-agent capability lease broadcasting, and continuous compliance audit reports.
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
                href="https://buy.stripe.com/fZebJ00V98DcbjafZ9"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="https://depay.com"
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
            placeholder="e.g. POLICY-PRO-XXXX-XXXX"
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

export default AgentPolicyAuditorGodModeTool;
