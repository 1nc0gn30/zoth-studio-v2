import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function SovereignFunnel({
  title = "Sovereign Installation & Ecosystem Deployment",
  subtitle = "Run this capability locally with complete zero-telemetry sovereignty. Choose from standalone micro-modules, the unified Studio cockpit, or bare-metal Zoth OS.",
  toolTitle,
  toolTag = "STANDALONE",
  toolDescription,
  toolRepo,
  toolCommand,
  studioRepo = "https://github.com/NullAITech/zoth-studio-v2",
  osRepo = "https://github.com/NullAITech/zoth-os",
  sx = {}
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setSnackbarMsg(`Copied ${label || 'command'} to clipboard!`);
      setSnackbarOpen(true);
    }
  };

  const gold = isDark ? '#D4AF37' : '#8A6508';
  const goldHeading = isDark ? '#F5E6AB' : '#8A6A09';
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const borderCol = isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(184, 134, 11, 0.25)';
  const cardBg = isDark ? '#11131F' : '#FFFFFF';
  const codeBoxBg = isDark ? '#08080B' : '#F1F5F9';
  const mono = '"JetBrains Mono", "Fira Code", monospace';

  const hasSpecificTool = Boolean(toolTitle || toolRepo);
  const opt1Title = toolTitle || "Option 1: Autonomous Micro-Tool";
  const opt1Desc = toolDescription || "Pull isolated zero-egress single-purpose micro-engines without spinning up the entire studio workspace.";
  const opt1Repo = toolRepo || "https://github.com/NullAITech/zoth-studio-v2";
  const opt1Cmd = toolCommand || `git clone ${opt1Repo}.git`;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 8,
        p: { xs: 3, md: 4.5 },
        bgcolor: isDark ? 'rgba(15, 17, 26, 0.95)' : '#F8FAFC',
        border: `1px solid ${borderCol}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 12px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)'
          : '0 8px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        ...sx
      }}
    >
      <Box sx={{ mb: 3.5 }}>
        <Chip
          label="SOVEREIGN DEPLOYMENT FUNNEL"
          size="small"
          sx={{
            mb: 1.5,
            fontWeight: 800,
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
            color: isDark ? '#D4AF37' : '#8A6A09',
            border: `1px solid ${borderCol}`
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 850, color: textPrimary, mb: 1, letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: textSecondary, maxWidth: 840, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      </Box>

      {/* Founding Member Commercial License & Dual Checkout Bar */}
      <Box
        sx={{
          mb: 3.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(212, 175, 55, 0.08)' : '#FEF9E7',
          border: `1px solid ${gold}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 300px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip
              label="✦ FOUNDING LIFETIME DEAL • 75% OFF"
              size="small"
              sx={{
                height: 22,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.66rem',
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#DCFCE7',
                color: isDark ? '#34D399' : '#047857',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            />
            <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: gold }}>
              <span style={{ textDecoration: 'line-through', opacity: 0.65, marginRight: 6 }}>$79</span>
              $19 LIFETIME PRO PASS
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textPrimary, lineHeight: 1.3 }}>
            Unlock Commercial Pro Exports, Unblurred Manifests &amp; Priority Sovereign Updates
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#635BFF',
              color: '#FFFFFF',
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              px: 2,
              py: 0.9,
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            💳 Card / Apple Pay ($19)
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (typeof window !== 'undefined' && window.DePayWidgets && typeof window.DePayWidgets.Payment === 'function') {
                window.DePayWidgets.Payment({ integration: '428790dd-7ad1-407c-8ecf-c048c77a4cb8' });
              } else {
                window.open('https://depay.com/pay?integration=428790dd-7ad1-407c-8ecf-c048c77a4cb8&receiver=GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK&amount=19', '_blank');
              }
            }}
            sx={{
              bgcolor: gold,
              color: '#08080B',
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              px: 2,
              py: 0.9,
              '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7008' },
            }}
          >
            ⚡ Pay with SOL ($19)
          </Button>
          <Button
            variant="outlined"
            size="small"
            href="https://buy.stripe.com/eVq14m5k16hW4Le0xWfw40M"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: gold,
              color: goldHeading,
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'none',
              px: 1.8,
              py: 0.85,
            }}
          >
            👑 All-Access Bundle ($49)
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Option 1: Standalone Tool */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading }}>
                {opt1Title}
              </Typography>
              <Chip
                label={toolTag}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(56,189,248,0.15)' : '#E0F2FE',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  fontWeight: 800,
                  fontSize: '0.65rem'
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
              {opt1Desc}
            </Typography>

            <Box
              sx={{
                p: 1.2,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {opt1Cmd}
              </Typography>
              <IconButton aria-label="Copy command"
                size="small"
                onClick={() => handleCopy(opt1Cmd, opt1Title)}
                sx={{ color: gold, ml: 1, p: 0.5 }}
                title="Copy command"
              >
                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              href={opt1Repo}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              startIcon={<GitHubIcon />}
              sx={{
                bgcolor: gold,
                color: isDark ? '#08080B' : '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7008' }
              }}
            >
              Inspect Repository
            </Button>
          </Box>
        </Grid>

        {/* Option 2: Zoth Studio v2 Unified Cockpit */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading }}>
                Option 2: Zoth Studio v2
              </Typography>
              <Chip
                label="FULL SUITE"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(212,175,55,0.18)' : '#FEF9E7',
                  color: gold,
                  border: `1px solid ${gold}`,
                  fontWeight: 800,
                  fontSize: '0.65rem'
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
              The comprehensive sovereign AI developer studio featuring 29+ interactive tools, 3D memory worlds, local consensus engines, and offline templates.
            </Typography>

            <Box
              sx={{
                p: 1.2,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                git clone https://github.com/NullAITech/zoth-studio-v2.git
              </Typography>
              <IconButton aria-label="Copy command"
                size="small"
                onClick={() => handleCopy('git clone https://github.com/NullAITech/zoth-studio-v2.git', 'Studio v2 clone')}
                sx={{ color: gold, ml: 1, p: 0.5 }}
                title="Copy command"
              >
                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              href={studioRepo}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              startIcon={<GitHubIcon />}
              sx={{
                bgcolor: gold,
                color: isDark ? '#08080B' : '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7008' }
              }}
            >
              Open Studio v2 Repo
            </Button>
          </Box>
        </Grid>

        {/* Option 3: Sovereign Zoth OS */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading }}>
                Option 3: Sovereign Zoth OS
              </Typography>
              <Chip
                label="BARE-METAL OS"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF3',
                  color: isDark ? '#10B981' : '#047857',
                  fontWeight: 800,
                  fontSize: '0.65rem'
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
              Bare-metal air-gapped operating system kernel for autonomous agent swarms, zero-telemetry hardware enclave execution, and cryptographic seals.
            </Typography>

            <Box
              sx={{
                p: 1.2,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  color: isDark ? '#10B981' : '#047857',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                https://github.com/NullAITech/zoth-os
              </Typography>
              <IconButton aria-label="Copy link"
                size="small"
                onClick={() => handleCopy('https://github.com/NullAITech/zoth-os', 'Zoth OS link')}
                sx={{ color: gold, ml: 1, p: 0.5 }}
                title="Copy link"
              >
                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              href={osRepo}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              startIcon={<OpenInNewIcon />}
              sx={{
                borderColor: gold,
                color: gold,
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': {
                  borderColor: isDark ? '#F5E6AB' : '#9A7008',
                  bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9E7'
                }
              }}
            >
              Inspect Zoth OS Repo
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#10B981',
            color: '#FFFFFF',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
