import React, { useState, useMemo, useEffect } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length === 8) c = c.substring(0, 6);
  const n = parseInt(c, 16);
  if (isNaN(n)) return { r: 56, g: 189, b: 248 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relLum(r, g, b) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function calcRatio(fgRgb, bgRgb) {
  const l1 = relLum(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = relLum(bgRgb.r, bgRgb.g, bgRgb.b);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

function calcApca(fgRgb, bgRgb) {
  const toY = (c) => 0.2126729 * Math.pow(c.r / 255, 2.4) + 0.7151522 * Math.pow(c.g / 255, 2.4) + 0.072175 * Math.pow(c.b / 255, 2.4);
  let yTxt = Math.max(0.001, toY(fgRgb));
  let yBg = Math.max(0.001, toY(bgRgb));
  let lc;
  if (yBg >= yTxt) {
    const yTxtC = yTxt > 0.022 ? yTxt : yTxt + Math.pow(0.022 - yTxt, 1.414);
    const sapc = (Math.pow(yBg, 0.56) - Math.pow(yTxtC, 0.57)) * 1.14;
    lc = sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  } else {
    const yTxtC = yTxt > 0.022 ? yTxt : yTxt + Math.pow(0.022 - yTxt, 1.414);
    const sapc = (Math.pow(yBg, 0.65) - Math.pow(yTxtC, 0.62)) * 1.14;
    lc = sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
  }
  return Math.round(lc * 10) / 10;
}

export default function WcagContrastGuard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [fgColor, setFgColor] = useState('#38BDF8');
  const [bgColor, setBgColor] = useState('#090A0F');
  const [copiedKey, setCopiedKey] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const fgRgb = useMemo(() => hexToRgb(fgColor), [fgColor]);
  const bgRgb = useMemo(() => hexToRgb(bgColor), [bgColor]);
  const ratio = useMemo(() => calcRatio(fgRgb, bgRgb), [fgRgb, bgRgb]);
  const apcaLc = useMemo(() => calcApca(fgRgb, bgRgb), [fgRgb, bgRgb]);

  const passesAaNormal = ratio >= 4.5;
  const passesAaaNormal = ratio >= 7.0;
  const passesAaLarge = ratio >= 3.0;

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard?.writeText(text)?.catch?.(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSwap = () => {
    const tmp = fgColor;
    setFgColor(bgColor);
    setBgColor(tmp);
  };

  const handleRemediate = () => {
    // Increase contrast toward 4.5:1
    const lBg = relLum(bgRgb.r, bgRgb.g, bgRgb.b);
    if (lBg < 0.5) {
      setFgColor('#FFFFFF');
    } else {
      setFgColor('#090A0F');
    }
  };

  const jsonTelemetry = useMemo(() => {
    return {
      foreground: fgColor,
      background: bgColor,
      wcag_ratio: parseFloat(ratio.toFixed(2)),
      passes_aa_normal: passesAaNormal,
      passes_aaa_normal: passesAaaNormal,
      passes_aa_large: passesAaLarge,
      apca_lc: apcaLc,
      engine: 'WCAG 2.2 SC 1.4.3 & APCA 0.98G',
    };
  }, [fgColor, bgColor, ratio, passesAaNormal, passesAaaNormal, passesAaLarge, apcaLc]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(12,10,16,0.94)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(56,189,248,0.35)' : 'rgba(2,132,199,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      {/* Header & Actions */}
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
              icon={<VisibilityIcon sx={{ fontSize: '0.95rem !important', color: '#38BDF8 !important' }} />}
              label="WCAG & APCA CONTRAST GUARD · SOVEREIGN A11Y ENGINE"
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
            <Chip
              icon={
                passesAaNormal ? (
                  <CheckCircleIcon sx={{ fontSize: '0.95rem !important', color: '#34D399 !important' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: '0.95rem !important', color: '#EF4444 !important' }} />
                )
              }
              label={passesAaaNormal ? 'WCAG AAA PASS' : passesAaNormal ? 'WCAG AA PASS' : 'WCAG AA FAIL'}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: passesAaNormal ? 'rgba(52,211,153,0.14)' : 'rgba(239,68,68,0.14)',
                color: passesAaNormal ? '#34D399' : '#EF4444',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400 }}>
            Universal Contrast & <span style={{ color: '#38BDF8' }}>Perceptual Accessibility</span> Studio
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noreferrer"
            sx={{
              bgcolor: '#D4AF37',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
              '&:hover': { bgcolor: '#B8860B' }
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopy('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', 'solTip')}
            sx={{
              borderColor: '#38BDF8',
              color: '#38BDF8',
              fontWeight: 700,
              fontSize: '0.72rem',
              fontFamily: mono
            }}
          >
            {copiedKey === 'solTip' ? 'COPIED SOL!' : '◎ TIP SOL'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopy(JSON.stringify(jsonTelemetry, null, 2), 'wcagJson')}
            sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#38BDF8', borderColor: 'rgba(56,189,248,0.4)' }}
          >
            {copiedKey === 'wcagJson' ? 'COPIED JSON' : 'Export JSON'}
          </Button>
          {isLocalRuntime() && (
          <Button
            size="small"
            variant="contained"
            component="a"
            href="http://127.0.0.1:8150"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: '#38BDF8', color: '#000', fontWeight: 800 }}
          >
            Launch Standalone (:8150)
          </Button>
          )}
        </Stack>
      </Stack>

      <SovereignEyebrow accent="#38BDF8" right="Accessibility & Visual Systems">
        {"wcag-contrast-guard"}
      </SovereignEyebrow>

      {/* Interactive Quick Contrast Workbench */}
      <Grid container spacing={2.5} sx={{ mt: 1, mb: 3 }}>
        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8' }}>
              COLOR PAIR INPUTS
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1,
                  bgcolor: fgColor,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              />
              <TextField
                size="small"
                label="Foreground (Text)"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                inputProps={{ style: { fontFamily: mono, fontSize: '0.85rem' } }}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1,
                  bgcolor: bgColor,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              />
              <TextField
                size="small"
                label="Background"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                inputProps={{ style: { fontFamily: mono, fontSize: '0.85rem' } }}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                onClick={handleSwap}
                sx={{ fontFamily: mono, fontSize: '0.72rem', flex: 1 }}
              >
                Swap
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={handleRemediate}
                sx={{ fontFamily: mono, fontSize: '0.72rem', flex: 1, borderColor: '#34D399', color: '#34D399' }}
              >
                Auto-Fix
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8' }}>
              WCAG 2.2 RATIO & APCA SCORE
            </Typography>
            <Typography sx={{ fontFamily: mono, fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {ratio.toFixed(2)} : 1
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Normal AA: ${passesAaNormal ? 'PASS (≥4.5)' : 'FAIL'}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  color: passesAaNormal ? '#34D399' : '#EF4444',
                  bgcolor: passesAaNormal ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                }}
              />
              <Chip
                label={`Large AA: ${passesAaLarge ? 'PASS (≥3.0)' : 'FAIL'}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  color: passesAaLarge ? '#34D399' : '#EF4444',
                  bgcolor: passesAaLarge ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                }}
              />
              <Chip
                label={`APCA: Lc ${apcaLc}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  color: '#38BDF8',
                  bgcolor: 'rgba(56,189,248,0.1)',
                }}
              />
            </Stack>
          </Box>
        </Grid>

        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: bgColor,
              color: fgColor,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>
              The quick brown fox
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', lineHeight: 1.5, opacity: 0.9 }}>
              Accessible typography guarantees mathematical clarity across mobile displays and high-contrast ambient modes.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Embedded Live Sovereign Workstation (:8150) */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: 'text.secondary' }}>
            EMBEDDED WORKSTATION · HTTP://127.0.0.1:8150
          </Typography>
          <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#34D399' }}>
            ● LIVE EMBED
          </Typography>
        </Stack>
        <Box
          sx={{
            width: '100%',
            height: '780px',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(56,189,248,0.2)' : 'rgba(0,0,0,0.1)'}`,
            bgcolor: isDark ? '#090A0F' : '#F8FAFC',
          }}
        >
          <iframe
            src="http://127.0.0.1:8150"
            title="WCAG Contrast Guard Studio Workstation"
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setIframeLoaded(true)}
          />
        </Box>
      </Box>
    </Paper>
  );
}
