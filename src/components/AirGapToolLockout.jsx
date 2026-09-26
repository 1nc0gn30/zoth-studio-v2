import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ComputerIcon from '@mui/icons-material/Computer';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/**
 * Detects whether Zoth Studio is running in a local sovereign runtime (localhost / 127.0.0.1 / desktop)
 * or in a remote public cloud environment (Netlify, custom domain, remote web server).
 *
 * Supports URL overrides for auditing & testing:
 * - ?remote=1 or ?mock_remote=true forces the remote lockout UI
 * - ?local=1 or ?mock_local=true forces local execution mode
 */
export function isLocalRuntime() {
  if (typeof window === 'undefined') return true; // Prerendering pass
  const search = window.location.search || '';
  if (search.includes('mock_remote=true') || search.includes('remote=1')) {
    return false;
  }
  if (search.includes('mock_local=true') || search.includes('local=1')) {
    return true;
  }
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test') ||
    window.location.protocol === 'file:'
  );
}

/**
 * Creative Sovereign Air-Gap Hardware Enclave Lockout Overlay.
 * Blurs and blocks remote browser users from executing or exposing bare-metal tools,
 * while funneling them to the official repositories in the Arsenal and Zoth OS bare-metal hypervisor.
 */
export default function AirGapToolLockout({
  tool,
  isUnlocked = false,
  onUnlockPreview,
  onReseal,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [copiedClone, setCopiedClone] = useState(false);

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'remote-cloud';
  const cloneCmd = tool?.pull || (tool?.github ? `git clone ${tool.github}.git` : `git clone https://github.com/NullAITech/${tool?.repo || tool?.id}.git`);

  const handleCopyClone = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cloneCmd);
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2200);
    }
  };

  // If the user has explicitly unlocked preview mode, render a persistent sticky warning HUD at the top
  if (isUnlocked) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: isDark ? '0 0 24px -4px rgba(239, 68, 68, 0.25)' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 260 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: '50%',
              bgcolor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
              display: 'flex',
              color: '#EF4444',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.78rem', color: '#EF4444' }}>
                READ-ONLY SPECIFICATION PREVIEW
              </Typography>
              <Chip
                label="LIVE EXECUTION BLOCKED"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: isDark ? '#1F2937' : '#E5E7EB',
                  color: isDark ? '#FCA5A5' : '#991B1B',
                  height: 20,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>
              Remote cloud host detected (<code>{hostname}</code>). Live hardware execution and IPC sockets are sealed.
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to="/zoth-os"
            size="small"
            variant="contained"
            sx={{
              fontFamily: mono,
              fontSize: '0.75rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#08080B',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Boot Zoth OS
          </Button>
          <Button
            component={RouterLink}
            to="/arsenal"
            size="small"
            variant="outlined"
            sx={{
              fontFamily: mono,
              fontSize: '0.75rem',
              fontWeight: 800,
              borderColor: isDark ? 'rgba(212,175,55,0.4)' : '#D4AF37',
              color: isDark ? '#F5E6AB' : '#8A6A09',
            }}
          >
            All Repos
          </Button>
          {onReseal && (
            <Button
              size="small"
              variant="text"
              onClick={onReseal}
              startIcon={<VisibilityOffIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.74rem',
                color: 'text.secondary',
                fontWeight: 700,
              }}
            >
              Re-Seal Enclave
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  // Full Air-Gap Enclave Lockout Modal / Overlay
  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 20,
        my: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 3.5,
          bgcolor: isDark ? '#08090E' : '#FFFFFF',
          border: '2px solid',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#F87171',
          boxShadow: isDark
            ? '0 0 50px -8px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 16px 40px -8px rgba(220, 38, 38, 0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Top Scanning Laser Glow */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #EF4444 50%, transparent 100%)',
            boxShadow: '0 0 14px #EF4444',
          }}
        />

        {/* Header Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '0.9rem !important', color: '#EF4444' }} />}
              label="AIR-GAP HARDWARE ENCLAVE // SEALED"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.74rem',
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                color: isDark ? '#FCA5A5' : '#B91C1C',
                border: '1px solid rgba(239, 68, 68, 0.35)',
              }}
            />
            <Chip
              icon={<CloudOffIcon sx={{ fontSize: '0.85rem !important', color: '#F59E0B' }} />}
              label="ZERO-EGRESS INVARIANT"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
                color: isDark ? '#FCD34D' : '#B45309',
                border: '1px solid rgba(245, 158, 11, 0.35)',
              }}
            />
          </Box>

          <Chip
            label={`REMOTE HOST: ${hostname.toUpperCase()}`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.7rem',
              bgcolor: isDark ? '#11131A' : '#F1F5F9',
              color: isDark ? '#94A3B8' : '#475467',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
            }}
          />
        </Box>

        {/* Lockout Headline & Explanation */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.14)' : '#FEE2E2',
                border: '1.5px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                boxShadow: isDark ? '0 0 20px -4px rgba(239, 68, 68, 0.4)' : 'none',
              }}
            >
              <LockIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: '-0.02em', color: theme.palette.text.primary, lineHeight: 1.15 }}>
                Local Hardware Runtime <span style={{ color: '#EF4444' }}>Required</span>
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: goldSoftColor(isDark), fontWeight: 700 }}>
                {tool ? `${tool.name} (${tool.id})` : 'Sovereign Developer Tool'}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840, lineHeight: 1.7, fontSize: '1rem', mt: 2 }}>
            You are browsing Zoth Studio via a public remote web domain (<code>{hostname}</code>).
            By foundational security architecture, Zoth sovereign tools operate with <strong>100% Zero-Egress</strong>: they execute exclusively against local bare-metal CPU/GPU registers, memory page-locking (<code>mlock</code>), and Unix IPC loopback sockets (<code>127.0.0.1</code>).
            Executing or exposing raw tool processes across an untrusted cloud connection is strictly blocked to prevent telemetry leakage and maintain cryptographic isolation.
          </Typography>
        </Box>

        {/* Funnel Selection Grid: Zoth OS vs Git Micro-Repo */}
        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: isDark ? '#D4AF37' : '#B8860B', mb: 2, letterSpacing: '0.06em' }}>
          CHOOSE YOUR SOVEREIGN DEPLOYMENT PATH:
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Funnel Option 1: Zoth OS */}
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#05060A' : '#F8FAFC',
                border: '1.5px solid',
                borderColor: isDark ? 'rgba(212, 175, 55, 0.35)' : '#E2CE82',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: '#D4AF37',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                  <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: isDark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7', display: 'flex', color: '#D4AF37' }}>
                    <ComputerIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Chip
                    label="RECOMMENDED ARCHITECTURE"
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: isDark ? 'rgba(212, 175, 55, 0.18)' : '#FEF9E7',
                      color: isDark ? '#F5E6AB' : '#8A6A09',
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Option 1: Deploy Bare-Metal Zoth OS
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                  Boot into the sealed Zoth OS KVM hypervisor or flash the Linux ISO image. All 25 sovereign tools, 21-agent swarm multiplexers, and hardware enclave daemons come pre-configured with memory page-locking and zero outbound networking.
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/zoth-os"
                variant="contained"
                size="large"
                startIcon={<LaunchIcon />}
                sx={{
                  bgcolor: '#D4AF37',
                  color: '#08080B',
                  fontWeight: 850,
                  fontFamily: mono,
                  fontSize: '0.85rem',
                  py: 1.2,
                  boxShadow: '0 0 16px -2px rgba(212, 175, 55, 0.4)',
                  '&:hover': {
                    bgcolor: '#F5E6AB',
                  },
                }}
              >
                Go to Zoth OS Downloads & Scripts
              </Button>
            </Paper>
          </Grid>

          {/* Funnel Option 2: Clone Micro-Repo & Browse Arsenal */}
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                bgcolor: isDark ? '#05060A' : '#F8FAFC',
                border: '1.5px solid',
                borderColor: isDark ? 'rgba(52, 211, 153, 0.35)' : '#A7F3D0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: '#34D399',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                  <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#ECFDF3', display: 'flex', color: '#34D399' }}>
                    <TerminalIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Chip
                    label="STANDALONE MICRO-REPO"
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: isDark ? 'rgba(52, 211, 153, 0.18)' : '#ECFDF3',
                      color: isDark ? '#A7F3D0' : '#065F46',
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Option 2: Clone Repo & Run Locally
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
                  Clone this micro-repository directly to your local computer and run it with native CLI commands, or connect it as a local MCP server for Claude, Cursor, and Ollama.
                </Typography>

                {/* Clone Command Box */}
                <Box
                  sx={{
                    p: 1.2,
                    mb: 2,
                    borderRadius: 1.5,
                    bgcolor: isDark ? '#030407' : '#F1F5F9',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.76rem',
                      color: isDark ? '#CBD5E1' : '#1E293B',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    $ {cloneCmd}
                  </Typography>
                  <Tooltip title={copiedClone ? 'Copied clone command!' : 'Copy clone command'}>
                    <Button
                      size="small"
                      onClick={handleCopyClone}
                      sx={{
                        minWidth: 0,
                        px: 1,
                        py: 0.4,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        color: copiedClone ? '#34D399' : (isDark ? '#F5E6AB' : '#8A6A09'),
                      }}
                    >
                      {copiedClone ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/arsenal"
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<ArrowForwardIcon />}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : '#059669',
                    color: isDark ? '#34D399' : '#065F46',
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#34D399',
                      bgcolor: isDark ? 'rgba(52, 211, 153, 0.08)' : '#ECFDF3',
                    },
                  }}
                >
                  Browse Arsenal Repos
                </Button>
                {tool?.github && (
                  <Button
                    component="a"
                    href={tool.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    size="large"
                    startIcon={<GitHubIcon />}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 750,
                      fontSize: '0.82rem',
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    GitHub
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Escape Hatch: Preview Docs (Read-Only) */}
        {onUnlockPreview && (
          <Box
            sx={{
              pt: 2.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem' }}>
              Just auditing the specifications, MCP JSON schema, and interface contracts?
            </Typography>
            <Button
              variant="text"
              onClick={onUnlockPreview}
              startIcon={<VisibilityIcon sx={{ fontSize: '0.95rem !important' }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.78rem',
                fontWeight: 750,
                color: isDark ? '#9CA3AF' : '#475467',
                '&:hover': {
                  color: isDark ? '#F5E6AB' : '#8A6A09',
                },
              }}
            >
              Acknowledge Invariant & Preview Documentation (Read-Only)
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function goldSoftColor(isDark) {
  return isDark ? '#F5E6AB' : '#8A6A09';
}
