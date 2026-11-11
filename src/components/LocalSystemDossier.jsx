import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TerminalIcon from '@mui/icons-material/Terminal';
import SovereignFunnel from './SovereignFunnel';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

const PALETTES = {
  gold: {
    dark: '#D4AF37',
    light: '#7A5808',
    washDark: 'rgba(212, 175, 55, 0.10)',
    washLight: 'rgba(122, 88, 8, 0.07)',
    borderDark: 'rgba(212, 175, 55, 0.28)',
    borderLight: 'rgba(122, 88, 8, 0.24)',
  },
  emerald: {
    dark: '#34D399',
    light: '#047857',
    washDark: 'rgba(52, 211, 153, 0.10)',
    washLight: 'rgba(4, 120, 87, 0.07)',
    borderDark: 'rgba(52, 211, 153, 0.28)',
    borderLight: 'rgba(4, 120, 87, 0.24)',
  },
  crimson: {
    dark: '#F87171',
    light: '#B91C1C',
    washDark: 'rgba(248, 113, 113, 0.10)',
    washLight: 'rgba(185, 28, 28, 0.07)',
    borderDark: 'rgba(248, 113, 113, 0.28)',
    borderLight: 'rgba(185, 28, 28, 0.24)',
  },
  cyan: {
    dark: '#22D3EE',
    light: '#0E7490',
    washDark: 'rgba(34, 211, 238, 0.10)',
    washLight: 'rgba(14, 116, 144, 0.07)',
    borderDark: 'rgba(34, 211, 238, 0.28)',
    borderLight: 'rgba(14, 116, 144, 0.24)',
  },
  purple: {
    dark: '#C084FC',
    light: '#6D28D9',
    washDark: 'rgba(192, 132, 252, 0.10)',
    washLight: 'rgba(109, 40, 217, 0.07)',
    borderDark: 'rgba(192, 132, 252, 0.28)',
    borderLight: 'rgba(109, 40, 217, 0.24)',
  },
  sky: {
    dark: '#38BDF8',
    light: '#0369A1',
    washDark: 'rgba(56, 189, 248, 0.10)',
    washLight: 'rgba(3, 105, 161, 0.07)',
    borderDark: 'rgba(56, 189, 248, 0.28)',
    borderLight: 'rgba(3, 105, 161, 0.24)',
  },
};

export default function LocalSystemDossier({
  tone = 'gold',
  kicker,
  badges = [],
  title,
  accentWord,
  subtitle,
  cloneCommand,
  repoUrl,
  repoLabel = 'Get Standalone Repo',
  docsRoute,
  docsLabel = 'Read Technical Docs',
  externalLinks = [],
  overviewTitle = 'Architectural Rationale & Execution Model',
  overviewParagraphs = [],
  pipelineSteps = [],
  specs = [],
  quickstartLines = [],
  capabilitiesKicker = 'LOCAL CAPABILITIES',
  capabilitiesTitle = 'What Runs on Your Hardware',
  capabilities = [],
  funnelToolTitle,
  funnelToolTag = 'LOCAL SYSTEM',
  funnelToolDesc,
  children,
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
  const textMuted = isDark ? '#78716C' : '#475569';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2200);
    }
  };

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: '100vh', color: textPrimary }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        {/* 1. Editorial Header Dossier */}
        <Box
          sx={{
            pb: { xs: 4, md: 5 },
            mb: { xs: 4, md: 6 },
            borderBottom: `1px solid ${hairline}`,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: accent,
                px: 1.25,
                py: 0.45,
                borderRadius: 1,
                bgcolor: accentWash,
                border: `1px solid ${accentBorder}`,
              }}
            >
              {kicker}
            </Typography>
            {badges.map((b) => (
              <Typography
                key={b}
                component="span"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: textSecondary,
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(16,24,40,0.04)',
                  border: `1px solid ${hairline}`,
                }}
              >
                {b}
              </Typography>
            ))}
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: { xs: '2.35rem', sm: '3.2rem', md: '3.85rem' },
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              color: textPrimary,
              maxWidth: 880,
              mb: 2,
            }}
          >
            {title}{' '}
            {accentWord ? (
              <Box component="span" sx={{ color: accent, fontStyle: 'italic' }}>
                {accentWord}
              </Box>
            ) : null}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.12rem' },
              lineHeight: 1.68,
              color: textSecondary,
              maxWidth: 760,
              mb: 3.5,
            }}
          >
            {subtitle}
          </Typography>

          {/* Copyable Clone Strip */}
          {cloneCommand && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                mb: 3,
                borderRadius: 2,
                bgcolor: codeBg,
                border: `1px solid ${hairline}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <TerminalIcon sx={{ fontSize: 18, color: accent, flexShrink: 0 }} />
                <Typography
                  component="code"
                  sx={{
                    fontFamily: mono,
                    fontSize: { xs: '0.78rem', sm: '0.84rem' },
                    fontWeight: 600,
                    color: textPrimary,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {cloneCommand}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleCopy(cloneCommand, 'Clone command')}
                startIcon={copiedKey === 'Clone command' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: textPrimary,
                  borderColor: hairline,
                  bgcolor: cardBg,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  '&:hover': { borderColor: accent, color: accent },
                }}
              >
                {copiedKey === 'Clone command' ? 'Copied' : 'Copy Clone'}
              </Button>
            </Paper>
          )}

          {/* Action Row — Local Repository & Spec First */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
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
                  py: 1.15,
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
                borderColor: accentBorder,
                color: accent,
                bgcolor: accentWash,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 2.25,
                py: 1.1,
                borderRadius: 1.5,
                '&:hover': { borderColor: accent, bgcolor: accentWash },
              }}
            >
              Get Zoth Studio Repo
            </Button>

            {docsRoute && (
              <Button
                component={RouterLink}
                to={docsRoute}
                variant="outlined"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
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
                {docsLabel}
              </Button>
            )}

            {externalLinks.map((ext) => (
              <Button
                key={ext.href}
                component="a"
                href={ext.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderColor: hairline,
                  color: textSecondary,
                  bgcolor: 'transparent',
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  px: 2,
                  py: 1.1,
                  borderRadius: 1.5,
                  '&:hover': { borderColor: accent, color: textPrimary },
                }}
              >
                {ext.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* 2. Two-Column Architecture & Runtime Specification */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.15fr) minmax(0, 0.85fr)' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 5, md: 7 },
            alignItems: 'start',
          }}
        >
          {/* Left: Architectural Rationale & Pipeline */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.75, md: 3.5 },
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${hairline}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
                mb: 1,
              }}
            >
              SYSTEM ARCHITECTURE
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '1.55rem', md: '1.85rem' },
                color: textPrimary,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              {overviewTitle}
            </Typography>

            {overviewParagraphs.map((para, i) => (
              <Typography
                key={i}
                sx={{
                  fontSize: '0.96rem',
                  lineHeight: 1.72,
                  color: textSecondary,
                  mb: i === overviewParagraphs.length - 1 && pipelineSteps.length === 0 ? 0 : 2,
                }}
              >
                {para}
              </Typography>
            ))}

            {pipelineSteps.length > 0 && (
              <Box
                sx={{
                  mt: 2.5,
                  pt: 2.5,
                  borderTop: `1px solid ${hairline}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {pipelineSteps.map((step, idx) => (
                  <Box
                    key={step.label}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '32px minmax(0, 1fr)',
                      gap: 1.5,
                      alignItems: 'baseline',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: accent,
                      }}
                    >
                      0{idx + 1}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: textPrimary }}>
                        {step.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.55, color: textSecondary }}>
                        {step.detail}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Right: Runtime Spec Sheet + CLI Quickstart */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
            {specs.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2.5,
                  bgcolor: cardBg,
                  border: `1px solid ${hairline}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: accent,
                    mb: 1.75,
                  }}
                >
                  LOCAL RUNTIME INVARIANTS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {specs.map((s, idx) => (
                    <Box
                      key={s.key}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 2,
                        py: 1.1,
                        borderBottom: idx < specs.length - 1 ? `1px solid ${hairline}` : 'none',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.75rem',
                          color: textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {s.key}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: textPrimary,
                          textAlign: 'right',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {s.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {quickstartLines.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.25, md: 2.75 },
                  borderRadius: 2.5,
                  bgcolor: codeBg,
                  border: `1px solid ${hairline}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: accent,
                    }}
                  >
                    LOCAL TERMINAL QUICKSTART
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleCopy(quickstartLines.filter((l) => !l.startsWith('#')).join('\n'), 'Quickstart')}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: textSecondary,
                      minWidth: 'auto',
                      px: 1,
                      py: 0.25,
                      '&:hover': { color: accent },
                    }}
                  >
                    {copiedKey === 'Quickstart' ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    lineHeight: 1.65,
                    color: textPrimary,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {quickstartLines.join('\n')}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>

        {/* 3. Core Capabilities Grid */}
        {capabilities.length > 0 && (
          <Box sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: accent,
                mb: 0.75,
              }}
            >
              {capabilitiesKicker}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '1.8rem', md: '2.25rem' },
                color: textPrimary,
                mb: 3,
                lineHeight: 1.15,
              }}
            >
              {capabilitiesTitle}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: capabilities.length >= 6 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              {capabilities.map((cap, idx) => (
                <Paper
                  key={cap.title}
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2.5,
                    bgcolor: cardBg,
                    border: `1px solid ${hairline}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s ease',
                    '&:hover': { borderColor: accentBorder },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: '0.08em',
                      }}
                    >
                      MODULE 0{idx + 1}
                    </Typography>
                    {cap.tag && (
                      <Typography
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.66rem',
                          fontWeight: 600,
                          color: textMuted,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {cap.tag}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.02rem',
                      color: textPrimary,
                      mb: 1,
                    }}
                  >
                    {cap.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      lineHeight: 1.65,
                      color: textSecondary,
                      flex: 1,
                    }}
                  >
                    {cap.desc}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* 4. Bespoke Per-System Section (Tables / Ecosystem Companions) */}
        {children && <Box sx={{ mb: { xs: 5, md: 7 } }}>{children}</Box>}

        {/* 5. Local Repository & ZothOS Acquisition Funnel */}
        <SovereignFunnel
          toolTitle={funnelToolTitle || `${title} ${accentWord || ''}`.trim()}
          toolTag={funnelToolTag}
          toolDescription={funnelToolDesc || subtitle}
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
