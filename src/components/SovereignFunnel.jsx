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
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_WALLET = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

export default function SovereignFunnel({
  title = 'Local Installation & Repository Access',
  subtitle = 'Every tool in the ecosystem is architected for local execution with zero outbound telemetry. Clone an isolated repository, pull the full Zoth Studio v2 monorepo, or boot ZothOS with everything pre-installed.',
  toolTitle,
  toolTag = 'STANDALONE REPO',
  toolDescription,
  toolRepo,
  toolCommand,
  studioRepo = 'https://github.com/NullAITech/zoth-studio-v2',
  osRepo = 'https://github.com/NullAITech/zoth-os',
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setSnackbarMsg(`Copied ${label || 'command'} to clipboard`);
      setSnackbarOpen(true);
    }
  };

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const goldHeading = isDark ? '#F5E6AB' : '#101828';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A3AAB8' : '#475467';
  const borderCol = isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(16, 24, 40, 0.12)';
  const cardBg = isDark ? '#0E1017' : '#FFFFFF';
  const codeBoxBg = isDark ? '#08090D' : '#F3F4F6';
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  const opt1Title = toolTitle || 'Option 1: Standalone Repository';
  const opt1Desc =
    toolDescription ||
    'Clone any individual tool repository directly to run its CLI binary, local daemon, or MCP server independently.';
  const opt1Repo = toolRepo || 'https://github.com/NullAITech/zoth-studio-v2';
  const opt1Cmd = toolCommand || `git clone ${opt1Repo.replace(/\.git$/, '')}.git`;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 8,
        p: { xs: 3, md: 4.5 },
        bgcolor: isDark ? '#0B0C11' : '#F4F1EA',
        border: `1px solid ${borderCol}`,
        borderRadius: 2.5,
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box sx={{ mb: 3.5 }}>
        <Chip
          label="LOCAL-FIRST DISTRIBUTION"
          size="small"
          sx={{
            mb: 1.5,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FAF6EB',
            color: gold,
            border: `1px solid ${borderCol}`,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Celtic Garamond", Georgia, serif',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '1.85rem' },
            color: textPrimary,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: textSecondary, maxWidth: 820, lineHeight: 1.65 }}>
          {subtitle}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Option 1: Standalone Tool */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading, fontSize: '0.98rem' }}>
                {opt1Title}
              </Typography>
              <Chip
                label={toolTag}
                size="small"
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? 'rgba(56,189,248,0.12)' : '#EFF6FF',
                  color: isDark ? '#38BDF8' : '#0369A1',
                  border: `1px solid ${isDark ? 'rgba(56,189,248,0.28)' : '#BFDBFE'}`,
                  fontWeight: 700,
                  fontSize: '0.64rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.6 }}>
              {opt1Desc}
            </Typography>

            <Box
              sx={{
                p: 1.1,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  color: isDark ? '#E2E8F0' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt1Cmd}
              </Typography>
              <IconButton
                aria-label="Copy clone command"
                size="small"
                onClick={() => handleCopy(opt1Cmd, opt1Title)}
                sx={{ color: gold, ml: 1, p: 0.5 }}
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
                bgcolor: isDark ? '#D4AF37' : '#101828',
                color: isDark ? '#08080B' : '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
              }}
            >
              Get Repository
            </Button>
          </Box>
        </Grid>

        {/* Option 2: Zoth Studio v2 */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading, fontSize: '0.98rem' }}>
                Option 2: Zoth Studio v2
              </Typography>
              <Chip
                label="FULL SUITE"
                size="small"
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? 'rgba(212,175,55,0.14)' : '#FAF6EB',
                  color: gold,
                  border: `1px solid ${borderCol}`,
                  fontWeight: 700,
                  fontSize: '0.64rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.6 }}>
              Clone the unified Zoth Studio v2 workspace orchestrating all 77 local tools, STDP neural memory (:8094), and Pantheon swarm (:9393).
            </Typography>

            <Box
              sx={{
                p: 1.1,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  color: isDark ? '#E2E8F0' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                git clone https://github.com/NullAITech/zoth-studio-v2.git
              </Typography>
              <IconButton
                aria-label="Copy Studio clone command"
                size="small"
                onClick={() => handleCopy('git clone https://github.com/NullAITech/zoth-studio-v2.git', 'Zoth Studio clone command')}
                sx={{ color: gold, ml: 1, p: 0.5 }}
              >
                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              href={studioRepo}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              startIcon={<GitHubIcon />}
              sx={{
                borderColor: isDark ? 'rgba(212,175,55,0.45)' : '#101828',
                color: textPrimary,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: gold,
                  bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(16,24,40,0.04)',
                },
              }}
            >
              Get Zoth Studio Repo
            </Button>
          </Box>
        </Grid>

        {/* Option 3: ZothOS */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldHeading, fontSize: '0.98rem' }}>
                Option 3: ZothOS v3.4
              </Typography>
              <Chip
                label="LIVE ISO"
                size="small"
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? 'rgba(16,185,129,0.14)' : '#ECFDF5',
                  color: isDark ? '#34D399' : '#047857',
                  border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0'}`,
                  fontWeight: 700,
                  fontSize: '0.64rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.85rem', lineHeight: 1.6 }}>
              Bootable Debian Live distribution with all 77 CLI binaries, local loopback daemons, and Ollama runtime pre-configured out of the box.
            </Typography>

            <Box
              sx={{
                p: 1.1,
                mb: 2,
                bgcolor: codeBoxBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  color: isDark ? '#E2E8F0' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                git clone https://github.com/NullAITech/zoth-os.git
              </Typography>
              <IconButton
                aria-label="Copy ZothOS repository"
                size="small"
                onClick={() => handleCopy('git clone https://github.com/NullAITech/zoth-os.git', 'ZothOS clone command')}
                sx={{ color: gold, ml: 1, p: 0.5 }}
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
                borderColor: isDark ? 'rgba(212,175,55,0.45)' : '#101828',
                color: textPrimary,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: gold,
                  bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(16,24,40,0.04)',
                },
              }}
            >
              Inspect ZothOS Repo
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Subtle Open-Access & Optional Support Strip */}
      <Box
        sx={{
          mt: 3,
          pt: 2.5,
          borderTop: `1px solid ${borderCol}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.8rem' }}>
          100% open-access repositories with zero paywalls or license gates. Optional community support:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            href={STRIPE_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'none',
              borderColor: borderCol,
              color: textPrimary,
              bgcolor: cardBg,
              '&:hover': { borderColor: gold },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopy(SOLANA_WALLET, 'Solana tip address')}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'none',
              borderColor: isDark ? 'rgba(52,211,153,0.35)' : '#A7F3D0',
              color: isDark ? '#34D399' : '#047857',
              bgcolor: isDark ? 'rgba(16,185,129,0.06)' : '#ECFDF5',
              '&:hover': {
                borderColor: isDark ? '#34D399' : '#059669',
                bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5',
              },
            }}
          >
            Solana Tip: GG2eQb…dXoK (Copy)
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2600}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#047857',
            color: '#FFFFFF',
            fontWeight: 700,
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
