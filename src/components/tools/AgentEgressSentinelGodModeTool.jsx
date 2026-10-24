import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldIcon from '@mui/icons-material/Shield';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const INITIAL_PACKETS = [
  {
    id: 'pkt-01',
    dest: '127.0.0.1:8094 (zoth-conductor)',
    proto: 'HTTP/LOOPBACK',
    bytes: 1420,
    verdict: 'ALLOWED',
    reason: 'RFC1918 / Loopback Sovereign Enclave Whitelist',
  },
  {
    id: 'pkt-02',
    dest: 'api.github.com:443',
    proto: 'TLS 1.3',
    bytes: 4096,
    verdict: 'ALLOWED',
    reason: 'Verified Git Repository Sync Allowlist',
  },
  {
    id: 'pkt-03',
    dest: 'telemetry.analytics-collector.io:443',
    proto: 'HTTPS/POST',
    bytes: 18432,
    verdict: 'BLOCKED',
    reason: 'Zero-Egress Policy: Unverified 3rd-Party Telemetry Sink',
  },
  {
    id: 'pkt-04',
    dest: '89a7f3c2.exfil-dns-tunnel.xyz:53',
    proto: 'UDP/DNS-TXT',
    bytes: 960,
    verdict: 'BLOCKED',
    reason: 'High Shannon Entropy (4.82 bits/byte) Base64 DNS Tunneling Signature',
  },
  {
    id: 'pkt-05',
    dest: '169.254.169.254:80',
    proto: 'HTTP/GET',
    bytes: 512,
    verdict: 'BLOCKED',
    reason: 'SSRF Cloud Metadata Instance Credential Probe',
  },
];

export default function AgentEgressSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [strictLoopbackOnly, setStrictLoopbackOnly] = useState(false);
  const [blockDnsTunneling, setBlockDnsTunneling] = useState(true);
  const [blockMetadataSsrf, setBlockMetadataSsrf] = useState(true);
  const [testHost, setTestHost] = useState('webhook.unknown-collector.net:443');
  const [testPayload, setTestPayload] = useState('{"agent_id":"subagent-04","env_dump":"REDACTED"}');
  const [packets, setPackets] = useState(INITIAL_PACKETS);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const shannonEntropy = useMemo(() => {
    const s = testPayload || '';
    if (!s.length) return 0;
    const freq = {};
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      freq[ch] = (freq[ch] || 0) + 1;
    }
    let ent = 0;
    const len = s.length;
    Object.values(freq).forEach((c) => {
      const p = c / len;
      ent -= p * Math.log2(p);
    });
    return Number(ent.toFixed(2));
  }, [testPayload]);

  const handleSimulatePacket = () => {
    const host = testHost.trim();
    if (!host) return;
    const isLoopback = host.startsWith('127.0.0.1') || host.startsWith('localhost');
    const isMetadata = host.includes('169.254.169.254') || host.includes('metadata.google');
    const isAllowedDomain =
      !strictLoopbackOnly &&
      (host.includes('github.com') || host.includes('nullai.tech') || host.includes('nealfrazier.tech'));

    let verdict = 'ALLOWED';
    let reason = 'Matched verified domain allowlist & payload entropy < 4.6 bits/byte';

    if (isMetadata && blockMetadataSsrf) {
      verdict = 'BLOCKED';
      reason = 'SSRF Metadata Endpoint Protection Rule #01';
    } else if (strictLoopbackOnly && !isLoopback) {
      verdict = 'BLOCKED';
      reason = 'Strict Air-Gap Mode: Non-loopback socket egress denied';
    } else if (blockDnsTunneling && shannonEntropy > 4.6) {
      verdict = 'BLOCKED';
      reason = `Payload Shannon Entropy (${shannonEntropy} bits/byte) exceeds exfiltration threshold`;
    } else if (!isLoopback && !isAllowedDomain) {
      verdict = 'BLOCKED';
      reason = 'Default-Deny Zero-Trust Egress Policy (Unlisted Destination)';
    }

    setPackets((prev) => [
      {
        id: `pkt-0${prev.length + 1}`,
        dest: host,
        proto: 'TLS 1.3 / INSPECTED',
        bytes: new TextEncoder().encode(testPayload).length,
        verdict,
        reason,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const nftablesPolicy = useMemo(
    () => `#!/usr/sbin/nft -f
# ZothOS Agent Egress Sentinel — Deterministic nftables Air-Gap Policy
table inet zoth_agent_egress {
  chain output {
    type filter hook output priority 0; policy drop;
    oifname "lo" accept comment "Allow 127.0.0.1 Sovereign Conductor Loopback"
    ct state established,related accept
    ${blockMetadataSsrf ? 'ip daddr 169.254.169.254 drop comment "Block Cloud Metadata SSRF"' : ''}
    ${blockDnsTunneling ? 'udp dport 53 length > 512 drop comment "Block Oversized DNS Exfiltration"' : ''}
    ${strictLoopbackOnly ? '# Strict Air-Gap Active: All external WAN egress dropped' : 'tcp dport 443 ip daddr { 140.82.112.0/20 } accept comment "Allow GitHub Sync"'}
    log prefix "[ZOTH-EGRESS-DROP] " flags all counter drop
  }
}`,
    [strictLoopbackOnly, blockDnsTunneling, blockMetadataSsrf]
  );

  // 60fps Egress Perimeter Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let angle = 0;

    const render = () => {
      angle = (angle + 0.032) % (Math.PI * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 190;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.min(w, h) * 0.42;

      // Concentric firewall rings
      [0.35, 0.68, 1.0].forEach((rFrac, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * rFrac, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 2 ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.22)';
        ctx.lineWidth = idx === 2 ? 1.8 : 1;
        ctx.stroke();
      });

      // Sweep beam
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(239,68,68,0.16)';
      ctx.fill();

      // Plot packet vectors
      packets.slice(0, 6).forEach((p, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        const blocked = p.verdict === 'BLOCKED';
        const dist = blocked ? maxR * 0.98 : maxR * 0.52;
        const px = cx + Math.cos(a) * dist;
        const py = cy + Math.sin(a) * dist;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = blocked ? 'rgba(239,68,68,0.5)' : 'rgba(52,211,153,0.5)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = blocked ? '#EF4444' : '#34D399';
        ctx.fill();
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [packets]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(nftablesPolicy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(12,10,14,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(239,68,68,0.35)' : 'rgba(220,38,38,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '0.95rem !important', color: '#EF4444 !important' }} />}
              label="AGENT EGRESS SENTINEL · ZERO-TRUST PERIMETER"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(239,68,68,0.14)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.35)',
              }}
            />
            <Chip
              label={`SHANNON ENTROPY: ${shannonEntropy} BITS/BYTE`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(56,189,248,0.14)',
                color: '#38BDF8',
                border: '1px solid rgba(56,189,248,0.35)',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400 }}>
            Autonomous Socket Interceptor &amp; <span style={{ color: '#EF4444' }}>Exfiltration Firewall</span>
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                border: '1px solid rgba(239,68,68,0.24)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#EF4444', mb: 1 }}>
                EGRESS INTERCEPTOR INVARIANTS
              </Typography>
              <Stack spacing={0.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={strictLoopbackOnly}
                      onChange={(e) => setStrictLoopbackOnly(e.target.checked)}
                      color="error"
                    />
                  }
                  label={<Typography sx={{ fontFamily: mono, fontSize: '0.74rem' }}>Strict 127.0.0.1 Loopback Air-Gap</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={blockDnsTunneling}
                      onChange={(e) => setBlockDnsTunneling(e.target.checked)}
                      color="error"
                    />
                  }
                  label={<Typography sx={{ fontFamily: mono, fontSize: '0.74rem' }}>Block High-Entropy DNS/Payload Exfiltration (&gt;4.6b)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={blockMetadataSsrf}
                      onChange={(e) => setBlockMetadataSsrf(e.target.checked)}
                      color="error"
                    />
                  }
                  label={<Typography sx={{ fontFamily: mono, fontSize: '0.74rem' }}>Block 169.254.169.254 Cloud Metadata SSRF</Typography>}
                />
              </Stack>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Simulated Outbound Socket Destination (Host:Port)"
              value={testHost}
              onChange={(e) => setTestHost(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Outbound Packet Payload (Inspected for Secret Leaks & Entropy)"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleSimulatePacket}
              sx={{
                bgcolor: '#EF4444',
                color: '#FFFFFF',
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: '#DC2626' },
              }}
            >
              Test Outbound Socket Frame Against Firewall
            </Button>

            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#05060A',
                border: '1px solid rgba(212,175,55,0.28)',
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 1.5, py: 0.75, bgcolor: 'rgba(212,175,55,0.08)' }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#F5E6AB', fontWeight: 700 }}>
                  COMPILED NFTABLES KERNEL FIREWALL POLICY
                </Typography>
                <Button
                  size="small"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37' }}
                >
                  {copied ? 'Copied' : 'Copy nftables'}
                </Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  color: '#E2E8F0',
                  overflowX: 'auto',
                }}
              >
                {nftablesPolicy}
              </Box>
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(239,68,68,0.3)',
                bgcolor: '#07060A',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(239,68,68,0.18)',
                  bgcolor: 'rgba(239,68,68,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#EF4444', fontWeight: 700 }}>
                  PERIMETER EGRESS RADAR (GREEN=LOOPBACK/ALLOW · RED=DROPPED)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                  60 FPS SWEEP
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 185, display: 'block' }} />
            </Box>

            <Stack spacing={1} sx={{ maxHeight: 310, overflowY: 'auto' }}>
              {packets.map((p) => {
                const blocked = p.verdict === 'BLOCKED';
                return (
                  <Box
                    key={p.id}
                    sx={{
                      p: 1.35,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                      borderLeft: `3px solid ${blocked ? '#EF4444' : '#34D399'}`,
                      border: `1px solid ${blocked ? 'rgba(239,68,68,0.28)' : 'rgba(52,211,153,0.28)'}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800 }}>
                        {p.dest}
                      </Typography>
                      <Chip
                        icon={
                          blocked ? (
                            <BlockIcon sx={{ fontSize: '0.85rem !important', color: '#EF4444 !important' }} />
                          ) : (
                            <CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#34D399 !important' }} />
                          )
                        }
                        label={p.verdict}
                        size="small"
                        sx={{
                          height: 20,
                          fontFamily: mono,
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          color: blocked ? '#EF4444' : '#34D399',
                          bgcolor: blocked ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)',
                        }}
                      />
                    </Stack>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {p.proto} · {p.bytes}B — {p.reason}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
