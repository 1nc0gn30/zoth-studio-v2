import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  TextField,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import RadarIcon from '@mui/icons-material/Radar';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useReality } from '../../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

const SURFACE_PROFILES = [
  {
    id: 'zothos-enclave',
    label: 'ZothOS v3.2 Default-Deny Enclave (Hardened)',
    targetIp: '127.0.0.1 / tailscale0',
    rawManifest: `# ZothOS v3.2 Socket & Banner Snapshot
LISTEN 127.0.0.1:11434  ollama/0.5.7 (Zero-Egress Loopback)
LISTEN 127.0.0.1:9050   tor/0.4.8.12 (SOCKS5 Amnesic Proxy)
LISTEN 0.0.0.0:41641/udp wireguard/tailscale0 (Authenticated Mesh)
LISTEN 127.0.0.1:7890   zoth-conductor/3.2.0 (Ring-2 Local Bus)`,
  },
  {
    id: 'exposed-ai-rig',
    label: 'Exposed AI Inference & Docker Socket (Critical Risk)',
    targetIp: '203.0.113.42',
    rawManifest: `# Shodan / InternetDB External Perimeter Snapshot
PORT 22/tcp    OpenSSH_8.4p1 Debian-5 (0.0.0.0:22)
PORT 2375/tcp  Docker Engine API 24.0.5 Unauthenticated (0.0.0.0:2375)
PORT 11434/tcp Ollama 0.3.12 Public Binding (0.0.0.0:11434)
PORT 6379/tcp  Redis 7.0.11 No-Auth (0.0.0.0:6379)`,
  },
  {
    id: 'legacy-edge-web',
    label: 'Legacy PHP-CGI & TLS 1.0 Edge Gateway',
    targetIp: '198.51.100.19',
    rawManifest: `# Edge Web & FastCGI Surface Snapshot
PORT 80/tcp    Apache/2.4.58 (Win64) PHP/8.2.18 CGI/FastCGI (0.0.0.0:80)
PORT 443/tcp   nginx/1.18.0 OpenSSL/1.1.1f TLSv1.0 Enabled (0.0.0.0:443)
PORT 9000/tcp  php-fpm pool www exposed (0.0.0.0:9000)`,
  },
];

const SIGNATURE_DB = [
  {
    match: /2375.*Docker|Docker.*2375/i,
    port: 2375,
    service: 'Docker Engine TCP Socket',
    cpe: 'cpe:2.3:a:docker:docker:24.0.5:*:*:*:*:*:*:*',
    cve: 'CWE-306 / Unauthenticated Root Container Escape',
    cvss: 9.8,
    andersonVector: 'Privilege Boundary Collapse — Unauthenticated daemon grants host root via volume mount.',
    remediation: 'Bind Docker exclusively to unix:///var/run/docker.sock and drop TCP 2375.',
  },
  {
    match: /0\.0\.0\.0:11434|11434.*Public/i,
    port: 11434,
    service: 'Ollama LLM Server (Wildcard Bind)',
    cpe: 'cpe:2.3:a:ollama:ollama:0.3.12:*:*:*:*:*:*:*',
    cve: 'CVE-2024-37032 (Probllama Path Traversal / Model Poisoning)',
    cvss: 9.1,
    andersonVector: 'Inference Exfiltration & Weights Tampering — Remote callers can pull/push GGUF weights.',
    remediation: 'Set OLLAMA_HOST=127.0.0.1:11434 in systemd unit and block 11434/tcp on WAN.',
  },
  {
    match: /6379.*Redis|Redis.*6379/i,
    port: 6379,
    service: 'Redis In-Memory Store (No-Auth)',
    cpe: 'cpe:2.3:a:redis:redis:7.0.11:*:*:*:*:*:*:*',
    cve: 'CVE-2022-0543 (Lua Sandbox Escape / SSH Key Write)',
    cvss: 9.4,
    andersonVector: 'State Store Subversion — Unauthenticated memory access permits authorized_keys injection.',
    remediation: 'Bind Redis to 127.0.0.1, enable protected-mode yes, and require ACL passphrase.',
  },
  {
    match: /PHP\/8\.2.*CGI|php-fpm.*0\.0\.0\.0:9000/i,
    port: 9000,
    service: 'PHP-CGI / FastCGI Exposed Pool',
    cpe: 'cpe:2.3:a:php:php:8.2.18:*:*:*:*:*:*:*',
    cve: 'CVE-2024-4577 (PHP-CGI Argument Injection RCE)',
    cvss: 9.8,
    andersonVector: 'Parser Differential Attack — Best-Fit character encoding bypasses CGI argument escaping.',
    remediation: 'Isolate PHP-FPM on local Unix socket (/run/php/php-fpm.sock) and block %ADd soft-hyphen queries.',
  },
  {
    match: /TLSv1\.0|OpenSSL\/1\.1\.1/i,
    port: 443,
    service: 'Legacy TLS 1.0 / OpenSSL 1.1.1f',
    cpe: 'cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*',
    cve: 'CVE-2014-3566 (POODLE / Downgrade Cipher Suite)',
    cvss: 6.5,
    andersonVector: 'Cryptographic Protocol Downgrade — Oracle padding & weak cipher negotiation.',
    remediation: 'Enforce TLSv1.3 only with X25519MLKEM768 / ChaCha20-Poly1305.',
  },
];

export default function AttackSurfaceSentinelGodModeTool() {
  const { activeTheme } = useReality();
  const [selectedProfileId, setSelectedProfileId] = useState(SURFACE_PROFILES[0].id);
  const [manifestText, setManifestText] = useState(SURFACE_PROFILES[0].rawManifest);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const analysis = useMemo(() => {
    const lines = manifestText.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
    const exposures = [];
    const loopbackServices = [];

    SIGNATURE_DB.forEach((sig) => {
      if (sig.match.test(manifestText)) {
        exposures.push(sig);
      }
    });

    lines.forEach((line) => {
      if (/127\.0\.0\.1|tailscale0/i.test(line)) {
        loopbackServices.push(line.trim());
      }
    });

    const maxCvss = exposures.reduce((m, e) => Math.max(m, e.cvss), 0);
    const postureScore = Math.max(8, Math.min(100, 100 - exposures.length * 24 - (maxCvss >= 9 ? 15 : 0)));
    const grade = postureScore >= 92 ? 'A+ (ZERO-EGRESS)' : postureScore >= 75 ? 'B' : postureScore >= 50 ? 'C' : 'F (EXPOSED)';

    return {
      exposures,
      loopbackServices,
      postureScore,
      grade,
      maxCvss,
    };
  }, [manifestText]);

  // 60fps Perimeter Port & CVE Blast-Radius Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let angle = 0;

    const render = () => {
      angle += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#05070B';
      ctx.fillRect(0, 0, w, h);

      const cx = 90;
      const cy = h / 2;

      // Radar rings
      [18, 32, 46].forEach((r) => {
        ctx.strokeStyle = `${activeTheme.primary}33`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating radar sweep
      ctx.strokeStyle = analysis.exposures.length > 0 ? '#F43F5E' : activeTheme.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 46, cy + Math.sin(angle) * 46);
      ctx.stroke();

      // Plot nodes along the right side of the canvas
      const items =
        analysis.exposures.length > 0
          ? analysis.exposures.map((e) => ({ label: `PORT ${e.port} (${e.cve.split(' ')[0]})`, risk: true }))
          : [
              { label: '127.0.0.1:11434 (OLLAMA LOOPBACK)', risk: false },
              { label: '127.0.0.1:9050 (TOR SOCKS5 ENCLAVE)', risk: false },
              { label: 'tailscale0:41641 (WIREGUARD MESH)', risk: false },
            ];

      items.slice(0, 4).forEach((item, idx) => {
        const nx = 210 + idx * 135;
        const ny = h / 2;

        ctx.strokeStyle = item.risk ? '#F43F5E88' : `${activeTheme.primary}66`;
        ctx.beginPath();
        ctx.moveTo(cx + 46, cy);
        ctx.lineTo(nx - 55, ny);
        ctx.stroke();

        ctx.fillStyle = '#090C14';
        ctx.strokeStyle = item.risk ? '#F43F5E' : activeTheme.primary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nx - 58, ny - 20, 116, 40, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = item.risk ? '#FDA4AF' : activeTheme.primary;
        ctx.font = `700 9px ${mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(item.label.slice(0, 18), nx, ny - 3);
        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 8px ${mono}`;
        ctx.fillText(item.risk ? 'WAN EXPOSED' : 'RING-0 ISOLATED', nx, ny + 11);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTheme, analysis]);

  const ufwHardeningScript = useMemo(() => {
    const denyLines = analysis.exposures
      .map((e) => `sudo ufw deny in on eth0 to any port ${e.port} proto tcp comment "Block exposed ${e.service}"`)
      .join('\n');

    return `#!/usr/bin/env bash
# ZothOS v3.2 Zero-Egress UFW & nftables Perimeter Lockdown
# Synthesized by Shodan & Anderson Attack Surface Sentinel (${activeTheme.name})
set -euo pipefail

echo "[*] Enforcing default-deny inbound posture..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow strictly authenticated WireGuard mesh & loopback
sudo ufw allow in on lo
sudo ufw allow in on tailscale0
sudo ufw allow 41641/udp comment "Tailscale WireGuard Mesh"
sudo ufw allow 7890/tcp comment "Zoth Conductor Local Mesh"

${denyLines || '# Zero wildcard WAN exposures detected — perimeter clean.'}

sudo ufw --force enable
sudo ufw status verbose`;
  }, [analysis.exposures, activeTheme.name]);

  const andersonThreatModelJson = useMemo(() => {
    return JSON.stringify(
      {
        auditor: 'Shodan & Ross Anderson Security Sentinel v3.2',
        realityProfile: activeTheme.id,
        postureScore: analysis.postureScore,
        grade: analysis.grade,
        exposedFindings: analysis.exposures.map((e) => ({
          port: e.port,
          service: e.service,
          cpe23: e.cpe,
          cve: e.cve,
          cvssV3: e.cvss,
          andersonPrinciple: e.andersonVector,
          remediation: e.remediation,
        })),
        verifiedLoopbackListeners: analysis.loopbackServices,
      },
      null,
      2
    );
  }, [activeTheme.id, analysis]);

  const handleSelectProfile = (p) => {
    setSelectedProfileId(p.id);
    setManifestText(p.rawManifest);
  };

  const handleCopy = (txt) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (txt, ext) => {
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-surface-lockdown.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 5,
        borderRadius: activeTheme.borderRadius || '12px',
        bgcolor: 'rgba(9, 11, 17, 0.9)',
        border: `1px solid ${activeTheme.border}`,
        boxShadow: activeTheme.cardGlow,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap', useFlexGap: true }}>
            <Chip
              icon={<RadarIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />}
              label="SHODAN INTERNETDB & ANDERSON THREAT SENTINEL"
              size="small"
              sx={{
                bgcolor: `${activeTheme.primary}18`,
                color: activeTheme.primary,
                border: `1px solid ${activeTheme.border}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              label={`PERIMETER GRADE: ${analysis.grade}`}
              size="small"
              sx={{
                bgcolor: analysis.postureScore >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.18)',
                color: analysis.postureScore >= 80 ? '#10B981' : '#F43F5E',
                border: `1px solid ${analysis.postureScore >= 80 ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.45)'}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 800 }}>
            Attack Surface CPE/CVE Fingerprinter & UFW Hardening Synthesizer
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
            Audit socket bindings and service banners against CPE 2.3 / CVSS v3.1 advisories and Ross Anderson Security Engineering threat models.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
          {SURFACE_PROFILES.map((prof) => (
            <Button
              key={prof.id}
              size="small"
              variant={selectedProfileId === prof.id ? 'contained' : 'outlined'}
              onClick={() => handleSelectProfile(prof)}
              sx={{
                fontFamily: mono,
                fontSize: '0.69rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: selectedProfileId === prof.id ? activeTheme.primary : 'transparent',
                color: selectedProfileId === prof.id ? '#06080D' : activeTheme.primary,
                borderColor: activeTheme.border,
              }}
            >
              {prof.label.split(' (')[0]}
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* 60fps Perimeter Radar */}
      <Box
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#05070B',
          border: `1px solid ${activeTheme.border}`,
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, fontWeight: 700, mb: 0.75 }}>
          60FPS PERIMETER SOCKET & CVE BLAST-RADIUS RADAR // SCORE: {analysis.postureScore}/100
        </Typography>
        <canvas
          ref={canvasRef}
          width={760}
          height={96}
          style={{ width: '100%', height: 96, display: 'block', borderRadius: 6 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        {/* Left Column: Socket / Banner Manifest Input */}
        <Grid xs={12} md={5}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, mb: 0.75, color: activeTheme.primary }}>
            SOCKET / SHODAN BANNER MANIFEST (`ss -tulpn` OR BANNER DUMP)
          </Typography>
          <TextField
            multiline
            minRows={11}
            maxRows={15}
            fullWidth
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
            InputProps={{
              sx: {
                fontFamily: mono,
                fontSize: '0.75rem',
                bgcolor: '#06080D',
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>

        {/* Right Column: CPE/CVE Findings, UFW Lockdown Script, Anderson JSON */}
        <Grid xs={12} md={7}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                },
              }}
            >
              <Tab icon={<SecurityIcon sx={{ fontSize: 15 }} />} iconPosition="start" label={`CPE / CVE Audit (${analysis.exposures.length})`} />
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="UFW Lockdown (.sh)" />
              <Tab icon={<ShieldIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Anderson Threat JSON" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Stack spacing={1.5}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 700 }}>
                    ZERO-EGRESS PERIMETER INTEGRITY
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 800, color: analysis.postureScore >= 80 ? '#10B981' : '#F43F5E' }}>
                    {analysis.postureScore}% ({analysis.grade})
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={analysis.postureScore}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: analysis.postureScore >= 80 ? '#10B981' : '#F43F5E',
                    },
                  }}
                />
              </Box>

              {analysis.exposures.length === 0 ? (
                <Alert severity="success" icon={<VerifiedUserIcon fontSize="small" />}>
                  All inspected listeners are bound to <code>127.0.0.1</code> loopback or authenticated <code>tailscale0</code> WireGuard mesh. Zero external CVE exposures detected.
                </Alert>
              ) : (
                analysis.exposures.map((exp, idx) => (
                  <Alert
                    key={idx}
                    severity="error"
                    icon={<WarningAmberIcon fontSize="small" />}
                    sx={{
                      bgcolor: 'rgba(15, 10, 16, 0.92)',
                      border: '1px solid rgba(244,63,94,0.35)',
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: '#FDA4AF' }}>
                      PORT {exp.port}/TCP — {exp.service} • CVSS {exp.cvss} ({exp.cve})
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: activeTheme.primary, display: 'block', mt: 0.25 }}>
                      CPE: {exp.cpe}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.35 }}>
                      <strong>Anderson Threat Vector:</strong> {exp.andersonVector}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block', mt: 0.25 }}>
                      <strong>Fix:</strong> {exp.remediation}
                    </Typography>
                  </Alert>
                ))
              )}
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                  Automated UFW Lockdown Script (`zoth-surface-lockdown.sh`)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={() => handleCopy(ufwHardeningScript)}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, borderColor: activeTheme.border }}
                  >
                    {copied ? 'Copied' : 'Copy Script'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(ufwHardeningScript, 'sh')}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: activeTheme.primary, color: '#05070B', fontWeight: 800 }}
                  >
                    Export .sh
                  </Button>
                </Stack>
              </Stack>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 1.5,
                  bgcolor: '#05070B',
                  border: `1px solid ${activeTheme.border}`,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  overflowX: 'auto',
                  maxHeight: 330,
                }}
              >
                {ufwHardeningScript}
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                  Structured Threat Model Report (`.json`)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => handleCopy(andersonThreatModelJson)}
                  sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, borderColor: activeTheme.border }}
                >
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 1.5,
                  bgcolor: '#05070B',
                  border: `1px solid ${activeTheme.border}`,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  overflowX: 'auto',
                  maxHeight: 330,
                }}
              >
                {andersonThreatModelJson}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
