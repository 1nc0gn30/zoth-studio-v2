import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SovereignFunnel from './SovereignFunnel';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

const PALETTES = {
  gold: { dark: '#D4AF37', light: '#7A5808', washDark: 'rgba(212,175,55,0.08)', washLight: 'rgba(122,88,8,0.06)', borderDark: 'rgba(212,175,55,0.28)', borderLight: 'rgba(122,88,8,0.24)' },
  emerald: { dark: '#34D399', light: '#047857', washDark: 'rgba(52,211,153,0.08)', washLight: 'rgba(4,120,87,0.06)', borderDark: 'rgba(52,211,153,0.28)', borderLight: 'rgba(4,120,87,0.24)' },
  crimson: { dark: '#F87171', light: '#B91C1C', washDark: 'rgba(248,113,113,0.08)', washLight: 'rgba(185,28,28,0.06)', borderDark: 'rgba(248,113,113,0.28)', borderLight: 'rgba(185,28,28,0.24)' },
  cyan: { dark: '#22D3EE', light: '#0E7490', washDark: 'rgba(34,211,238,0.08)', washLight: 'rgba(14,116,144,0.06)', borderDark: 'rgba(34,211,238,0.28)', borderLight: 'rgba(14,116,144,0.24)' },
  purple: { dark: '#C084FC', light: '#6D28D9', washDark: 'rgba(192,132,252,0.08)', washLight: 'rgba(109,40,217,0.06)', borderDark: 'rgba(192,132,252,0.28)', borderLight: 'rgba(109,40,217,0.24)' },
  sky: { dark: '#38BDF8', light: '#0369A1', washDark: 'rgba(56,189,248,0.08)', washLight: 'rgba(3,105,161,0.06)', borderDark: 'rgba(56,189,248,0.28)', borderLight: 'rgba(3,105,161,0.24)' },
};

export default function TechnicalReferencePage({
  tone = 'gold',
  parentRoute,
  parentLabel,
  kicker,
  title,
  summary,
  repoUrl,
  repoLabel = 'Clone Standalone Repo',
  cloneCommand,
  installSteps = [],
  cliCommands = [],
  contractTitle = 'MCP & Local Daemon Contract',
  contractLanguage = 'json',
  contractCode = '',
  architectureNotes = [],
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [copiedKey, setCopiedKey] = useState('');

  const pal = PALETTES[tone] || PALETTES.gold;
  const accent = isDark ? pal.dark : pal.light;
  const accentWash = isDark ? pal.washDark : pal.washLight;
  const accentBorder = isDark ? pal.borderDark : pal.borderLight;

  const pageBg = isDark ? '#08080B' : '#FAF8F3';
  const cardBg = isDark ? '#0E1016' : '#FFFFFF';
  const codeBg = isDark ? '#06070A' : '#F3EFE6';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A8A29E' : '#334155';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(''), 2200);
    }
  };

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: '100vh', color: textPrimary }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
          {parentRoute && (
            <Button
              component={RouterLink}
              to={parentRoute}
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'none',
                color: accent,
                px: 1.25,
                py: 0.4,
                borderRadius: 1,
                bgcolor: accentWash,
                border: `1px solid ${accentBorder}`,
              }}
            >
              {parentLabel || 'System Overview'}
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/docs"
            size="small"
            sx={{
              fontFamily: mono,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              color: textSecondary,
              '&:hover': { color: textPrimary },
            }}
          >
            All Documentation
          </Button>
        </Box>

        {/* Specification Header */}
        <Box sx={{ pb: 4, mb: 5, borderBottom: `1px solid ${hairline}` }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: accent,
              mb: 1.25,
            }}
          >
            {kicker}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: { xs: '2.2rem', sm: '2.9rem', md: '3.4rem' },
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: textPrimary,
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.98rem', md: '1.08rem' },
              lineHeight: 1.7,
              color: textSecondary,
              maxWidth: 780,
              mb: 3,
            }}
          >
            {summary}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {repoUrl && (
              <Button
                component="a"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                disableElevation
                startIcon={<GitHubIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: isDark ? accent : '#101828',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1.1,
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: isDark ? '#F5F1E6' : '#1E293B',
                    color: isDark ? '#08080B' : '#FFFFFF',
                  },
                }}
              >
                {repoLabel}
              </Button>
            )}
            <Button
              component="a"
              href="https://github.com/NullAITech/zoth-studio-v2"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<GitHubIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: hairline,
                color: textPrimary,
                bgcolor: cardBg,
                fontFamily: mono,
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 2.25,
                py: 1.1,
                borderRadius: 1.5,
                '&:hover': { borderColor: accent, color: accent },
              }}
            >
              Get Zoth Studio Repo
            </Button>
          </Box>
        </Box>

        {/* Section 1: Local Installation & Boot */}
        {installSteps.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 4,
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${hairline}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', color: accent }}>
                  01 // LOCAL INSTALLATION
                </Typography>
                <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.6rem', color: textPrimary }}>
                  Clone & Run on Your Machine
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleCopy(installSteps.filter((l) => !l.startsWith('#')).join('\n'), 'Install steps')}
                startIcon={copiedKey === 'Install steps' ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: textPrimary,
                  borderColor: hairline,
                  '&:hover': { borderColor: accent, color: accent },
                }}
              >
                {copiedKey === 'Install steps' ? 'Copied' : 'Copy'}
              </Button>
            </Box>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2.25,
                borderRadius: 2,
                bgcolor: codeBg,
                border: `1px solid ${hairline}`,
                fontFamily: mono,
                fontSize: '0.82rem',
                lineHeight: 1.7,
                color: textPrimary,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {installSteps.join('\n')}
            </Box>
          </Paper>
        )}

        {/* Section 2: CLI & Endpoint Reference Table */}
        {cliCommands.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', color: accent, mb: 0.5 }}>
              02 // CLI & DAEMON INTERFACE
            </Typography>
            <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.65rem', color: textPrimary, mb: 2 }}>
              Command & Endpoint Reference
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${hairline}`,
                overflowX: 'auto',
              }}
            >
              <Table sx={{ minWidth: 580 }}>
                <TableHead sx={{ bgcolor: accentWash }}>
                  <TableRow>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.76rem', color: accent }}>
                      Command / Route
                    </TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.76rem', color: textPrimary }}>
                      Description
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cliCommands.map((row) => (
                    <TableRow key={row.cmd} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 600, fontSize: '0.8rem', color: textPrimary, width: '42%' }}>
                        {row.cmd}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.88rem', lineHeight: 1.6, color: textSecondary }}>
                        {row.desc}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Section 3: JSON / MCP Contract & Architecture Notes */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
            gap: 3,
            mb: 6,
            alignItems: 'start',
          }}
        >
          {contractCode && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${hairline}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
                <Box>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', color: accent }}>
                    03 // {contractLanguage.toUpperCase()} SPECIFICATION
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: textPrimary }}>
                    {contractTitle}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleCopy(contractCode, 'Contract')}
                  sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: accent }}
                >
                  {copiedKey === 'Contract' ? 'Copied' : 'Copy'}
                </Button>
              </Box>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: codeBg,
                  border: `1px solid ${hairline}`,
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  lineHeight: 1.65,
                  color: textPrimary,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {contractCode}
              </Box>
            </Paper>
          )}

          {architectureNotes.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${hairline}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', color: accent, mb: 0.5 }}>
                04 // OPERATIONAL INVARIANTS
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: textPrimary, mb: 2 }}>
                Security & Local Execution Notes
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {architectureNotes.map((note) => (
                  <Box key={note.heading} sx={{ pl: 2, borderLeft: `2px solid ${accentBorder}` }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: textPrimary, mb: 0.4 }}>
                      {note.heading}
                    </Typography>
                    <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.6, color: textSecondary }}>
                      {note.body}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        <SovereignFunnel
          toolTitle={title}
          toolTag="TECHNICAL SPECIFICATION"
          toolDescription={summary}
          toolRepo={repoUrl || 'https://github.com/NullAITech/zoth-studio-v2'}
          toolCommand={cloneCommand || 'git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2'}
          studioRepo="https://github.com/NullAITech/zoth-studio-v2"
          osRepo="https://github.com/NullAITech/zoth-os"
        />
      </Container>

      <Snackbar
        open={Boolean(copiedKey)}
        autoHideDuration={2200}
        onClose={() => setCopiedKey('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ fontFamily: mono, fontWeight: 700 }}>
          Copied {copiedKey} to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
