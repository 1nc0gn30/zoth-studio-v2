import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ComputerIcon from '@mui/icons-material/Computer';
import MemoryIcon from '@mui/icons-material/Memory';
import TerminalIcon from '@mui/icons-material/Terminal';
import DownloadIcon from '@mui/icons-material/Download';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const qemu = 'qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2';
const isoCmd = 'sudo dd if=zothos-1.0-amd64.iso of=/dev/sdX status=progress bs=4M conv=fdatasync';

export default function ZothOSPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const [copiedQemu, setCopiedQemu] = useState(false);
  const [copiedIso, setCopiedIso] = useState(false);
  const models = status?.services?.ollama?.models || [];

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* ZothOSPage signature: gold glow behind the header */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '100%', md: '860px' },
          height: { xs: 380, md: 480 },
          pointerEvents: 'none',
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.20) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(184,134,11,0.10) 0%, transparent 70%)',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Chip label="SOVEREIGN LOCAL OPERATING SYSTEM" size="small" sx={{ bgcolor: gold.wash, color: gold.soft, border: `1px solid ${isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8'}`, fontWeight: 800, mb: 1.5 }} />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
          Zoth OS: Sovereign <span className="text-gradient-gold">Agent Operating System</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Zoth OS is a custom Linux distribution engineered to run Zoth Studio, Ollama, all 25 micro-tools, and the local memory daemon out-of-the-box with zero setup hassle. Flashed to a USB drive or launched via QEMU/KVM, it guarantees <span className="text-highlight-gold">100% Zero-Telemetry Local Operation</span> on bare metal.
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ComputerIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Preinstalled AI Stack</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Ships with Node 20+, Python 3.12, PyTorch, vLLM, Ollama, and WebGPU drivers pre-compiled for NVIDIA & AMD GPUs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MemoryIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Direct Hardware Access</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Bypasses hypervisor virtualization overhead to unlock <span className="text-highlight-gold">PCIe GPU passthrough</span> and full metal RAM bandwidth.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TerminalIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Air-Gapped Privacy</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Network stack can be disabled hardware-wide while retaining full multi-agent synthesis and memory decay functionality.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Host Diagnostic Box — ZothOSPage signature: gold-tinted diagnostic boxes */}
      <Box sx={{ mb: 5 }}>
        <Typography className="section-kicker">Local Host Machine Diagnostics</Typography>
        <Paper sx={{ p: 3, border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`, borderRadius: 2, bgcolor: theme.palette.background.paper, boxShadow: isDark ? '0 0 0 1px rgba(212,175,55,0.12), 0 0 22px -6px rgba(212,175,55,0.25)' : '0 0 0 1px rgba(184,134,11,0.08), 0 0 16px -6px rgba(184,134,11,0.18)' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ color: gold.soft, fontWeight: 800, mb: 0.5 }}>
                Hardware Acceleration (/dev/kvm)
              </Typography>
              <Chip
                label={status?.kvm ? 'SUPPORTED (/dev/kvm PRESENT)' : 'NOT DETECTED'}
                size="small"
                sx={{
                  bgcolor: status?.kvm ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2'),
                  color: status?.kvm ? (isDark ? '#34D399' : '#027A48') : (isDark ? '#FB7185' : '#B42318'),
                  fontWeight: 800,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ color: gold.soft, fontWeight: 800, mb: 0.5 }}>
                Ollama Engine (127.0.0.1:11434)
              </Typography>
              <Chip
                label={status?.services?.ollama?.up ? `ONLINE (${models.length} MODELS ACTIVE)` : 'OFFLINE'}
                size="small"
                sx={{
                  bgcolor: status?.services?.ollama?.up ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2'),
                  color: status?.services?.ollama?.up ? (isDark ? '#34D399' : '#027A48') : (isDark ? '#FB7185' : '#B42318'),
                  fontWeight: 800,
                }}
              />
            </Grid>
          </Grid>

          {models.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 1 }}>
                ACTIVE LOCAL MODELS ON DISK:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {models.map((m) => (
                  <Chip key={m} label={m} size="small" sx={{ fontFamily: mono, fontSize: '0.75rem', bgcolor: gold.wash, color: gold.soft, fontWeight: 700 }} />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Command Launchers */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: isDark ? '#0B0B12' : '#0F172A', color: '#F8FAFC', borderRadius: 2, border: `1px solid ${isDark ? '#2A2A38' : '#1E293B'}`, height: '100%' }}>
            <Typography className="section-kicker" sx={{ color: '#F5E6AB' }}>QEMU / KVM Virtual Machine Launcher</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              Run Zoth OS inside a hardware-accelerated local sandbox:
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#020617', borderRadius: 1.5, fontFamily: mono, fontSize: '0.85rem', color: '#F5E6AB', mb: 2, wordBreak: 'break-all' }}>
              {qemu}
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(qemu);
                setCopiedQemu(true);
                setTimeout(() => setCopiedQemu(false), 1600);
              }}
            >
              {copiedQemu ? 'Copied to Clipboard' : 'Copy QEMU Command'}
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: isDark ? '#0B0B12' : '#0F172A', color: '#F8FAFC', borderRadius: 2, border: `1px solid ${isDark ? '#2A2A38' : '#1E293B'}`, height: '100%' }}>
            <Typography className="section-kicker" sx={{ color: '#F5E6AB' }}>Flash Bare Metal USB ISO</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              Flash the bootable ISO directly to a USB drive:
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#020617', borderRadius: 1.5, fontFamily: mono, fontSize: '0.85rem', color: '#F5E6AB', mb: 2, wordBreak: 'break-all' }}>
              {isoCmd}
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(isoCmd);
                setCopiedIso(true);
                setTimeout(() => setCopiedIso(false), 1600);
              }}
            >
              {copiedIso ? 'Copied to Clipboard' : 'Copy Flash Command'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
}
