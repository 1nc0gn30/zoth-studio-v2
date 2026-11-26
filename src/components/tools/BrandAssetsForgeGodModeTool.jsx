import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Slider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import CollectionsIcon from '@mui/icons-material/Collections';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContrastIcon from '@mui/icons-material/Contrast';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PaletteIcon from '@mui/icons-material/Palette';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import {
  BRAND_SEAL_TEMPLATES,
  BRAND_TOKENS,
  contrastRatio,
  evaluateTokenMatrix,
  exportBrandAttributionSnippets,
  exportCssVariables,
  exportTailwindConfig,
  exportTokensJson,
  generateSealSvg,
  rasterizeSvgToPngDataUrl,
  sanitizeHex,
  wcagBadge,
} from '../../utils/brandAssetEngine';
import { downloadJson, downloadText, useCopy } from '../sovereign/hooks';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const SANS = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export default function BrandAssetsForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Active workstation tab (0: Seal Forge, 1: Official Assets, 2: Tokens & WCAG, 3: Export Bundle)
  const [activeTab, setActiveTab] = useState(0);

  // Seal Forge state
  const [templateId, setTemplateId] = useState(BRAND_SEAL_TEMPLATES[0].id);
  const [sealTitle, setSealTitle] = useState(BRAND_SEAL_TEMPLATES[0].defaultTitle);
  const [sealSubtitle, setSealSubtitle] = useState(BRAND_SEAL_TEMPLATES[0].defaultSubtitle);
  const [primaryHexInput, setPrimaryHexInput] = useState('#D4AF37');
  const [secondaryHexInput, setSecondaryHexInput] = useState('#38BDF8');
  const [bgHexInput, setBgHexInput] = useState('#08080B');
  const [rings, setRings] = useState(3);
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [stageMode, setStageMode] = useState('dark'); // 'dark' | 'light' | 'transparent'
  const [exportingPng, setExportingPng] = useState(false);

  // WCAG Custom Pair Checker state
  const [wcagFgInput, setWcagFgInput] = useState(isDark ? '#D4AF37' : '#7A5808');
  const [wcagBgInput, setWcagBgInput] = useState(isDark ? '#08080B' : '#FAF8F3');

  // Export Bundle sub-format state
  const [exportFormat, setExportFormat] = useState('css'); // 'css' | 'json' | 'tailwind' | 'attribution'

  // Clipboard & toast feedback
  const { copy } = useCopy(2000);
  const [toastMsg, setToastMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  // Dual-Theme Editorial Ivory / Obsidian Gold palette tokens (WCAG AA >= 4.5:1)
  const surfaceBg = isDark ? '#0B0B12' : '#FFFFFF';
  const subtleBg = isDark ? '#08080B' : '#FAF8F3';
  const elevatedBg = isDark ? '#10131C' : '#F3EFE6';
  const borderCol = isDark ? 'rgba(212, 175, 55, 0.28)' : '#E6E1D6';
  const strongBorder = isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(122, 88, 8, 0.35)';
  const primaryInk = isDark ? '#EDEFF2' : '#101828';
  const secondaryInk = isDark ? '#98A2B3' : '#475467';
  const goldInk = isDark ? '#D4AF37' : '#7A5808';
  const cyanInk = isDark ? '#38BDF8' : '#0369A1';
  const emeraldInk = isDark ? '#34D399' : '#047857';
  const crimsonInk = isDark ? '#F43F5E' : '#B42318';

  const activeTemplate = useMemo(
    () => BRAND_SEAL_TEMPLATES.find((t) => t.id === templateId) || BRAND_SEAL_TEMPLATES[0],
    [templateId]
  );

  const safePrimaryHex = useMemo(() => sanitizeHex(primaryHexInput, '#D4AF37'), [primaryHexInput]);
  const safeSecondaryHex = useMemo(() => sanitizeHex(secondaryHexInput, '#38BDF8'), [secondaryHexInput]);
  const effectiveBgHex = useMemo(() => {
    if (stageMode === 'light') return '#FAF8F3';
    if (stageMode === 'dark') return sanitizeHex(bgHexInput, '#08080B');
    return sanitizeHex(bgHexInput, '#08080B');
  }, [stageMode, bgHexInput]);

  const sealSvg = useMemo(
    () =>
      generateSealSvg({
        templateId,
        title: sealTitle,
        subtitle: sealSubtitle,
        primaryHex: safePrimaryHex,
        secondaryHex: safeSecondaryHex,
        bgHex: effectiveBgHex,
        rings,
        strokeWidth,
        size: 512,
        transparentBg: stageMode === 'transparent',
      }),
    [templateId, sealTitle, sealSubtitle, safePrimaryHex, safeSecondaryHex, effectiveBgHex, rings, strokeWidth, stageMode]
  );

  const sealContrast = useMemo(() => {
    const refBg = stageMode === 'light' ? '#FAF8F3' : effectiveBgHex;
    const primaryRatio = contrastRatio(safePrimaryHex, refBg);
    const secondaryRatio = contrastRatio(safeSecondaryHex, refBg);
    return {
      primaryRatio,
      primaryBadge: wcagBadge(primaryRatio),
      secondaryRatio,
      secondaryBadge: wcagBadge(secondaryRatio),
    };
  }, [safePrimaryHex, safeSecondaryHex, effectiveBgHex, stageMode]);

  const tokenMatrix = useMemo(() => evaluateTokenMatrix(BRAND_TOKENS), []);

  const customWcag = useMemo(() => {
    const fg = sanitizeHex(wcagFgInput, isDark ? '#D4AF37' : '#7A5808');
    const bg = sanitizeHex(wcagBgInput, isDark ? '#08080B' : '#FAF8F3');
    const ratio = contrastRatio(fg, bg);
    return { fg, bg, ratio, badge: wcagBadge(ratio) };
  }, [wcagFgInput, wcagBgInput, isDark]);

  const cssExport = useMemo(() => exportCssVariables(BRAND_TOKENS), []);
  const jsonExport = useMemo(() => exportTokensJson(BRAND_TOKENS), []);
  const tailwindExport = useMemo(() => exportTailwindConfig(BRAND_TOKENS), []);
  const attributionSnippets = useMemo(() => exportBrandAttributionSnippets(), []);

  const activeBundleText = useMemo(() => {
    if (exportFormat === 'json') return jsonExport;
    if (exportFormat === 'tailwind') return tailwindExport;
    if (exportFormat === 'attribution') {
      return [
        '# Plain Text Attribution',
        attributionSnippets.plainText,
        '',
        '# Markdown Footer',
        attributionSnippets.markdownFooter,
        '',
        '# HTML Footer',
        attributionSnippets.htmlFooter,
        '',
        '# Standalone SVG Attribution Badge',
        attributionSnippets.svgBadge,
      ].join('\n');
    }
    return cssExport;
  }, [exportFormat, cssExport, jsonExport, tailwindExport, attributionSnippets]);

  const triggerCopy = async (text, key, label) => {
    await copy(text);
    setCopiedKey(key);
    setToastMsg(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const handleSelectTemplate = (tpl) => {
    setTemplateId(tpl.id);
    setSealTitle(tpl.defaultTitle);
    setSealSubtitle(tpl.defaultSubtitle);
    setPrimaryHexInput(tpl.defaultPrimary);
    setSecondaryHexInput(tpl.defaultSecondary);
  };

  const handleDownloadSvg = () => {
    downloadText(sealSvg, `zoth-${templateId}-seal.svg`, 'image/svg+xml;charset=utf-8');
    setToastMsg(`Downloaded zoth-${templateId}-seal.svg`);
  };

  const handleExportPng = async () => {
    setExportingPng(true);
    try {
      const hiResSvg = generateSealSvg({
        templateId,
        title: sealTitle,
        subtitle: sealSubtitle,
        primaryHex: safePrimaryHex,
        secondaryHex: safeSecondaryHex,
        bgHex: effectiveBgHex,
        rings,
        strokeWidth,
        size: 1024,
        transparentBg: stageMode === 'transparent',
      });
      const dataUrl = await rasterizeSvgToPngDataUrl(hiResSvg, 1024);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `zoth-${templateId}-seal-1024px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMsg(`Exported 1024×1024 PNG: zoth-${templateId}-seal-1024px.png`);
    } catch (err) {
      setToastMsg(`PNG export error: ${err.message}`);
    } finally {
      setExportingPng(false);
    }
  };

  const handleDownloadBundle = () => {
    if (exportFormat === 'json') {
      downloadJson(JSON.parse(jsonExport), 'zoth-brand-tokens.json');
      setToastMsg('Downloaded zoth-brand-tokens.json');
      return;
    }
    if (exportFormat === 'tailwind') {
      downloadText(tailwindExport, 'zoth-tailwind-preset.js', 'text/javascript;charset=utf-8');
      setToastMsg('Downloaded zoth-tailwind-preset.js');
      return;
    }
    if (exportFormat === 'attribution') {
      downloadText(attributionSnippets.svgBadge, 'zoth-attribution-badge.svg', 'image/svg+xml;charset=utf-8');
      setToastMsg('Downloaded zoth-attribution-badge.svg');
      return;
    }
    downloadText(cssExport, 'zoth-brand-tokens.css', 'text/css;charset=utf-8');
    setToastMsg('Downloaded zoth-brand-tokens.css');
  };

  const chipStyle = (color, bgLight, bgDark) => ({
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: '0.68rem',
    letterSpacing: '0.04em',
    color,
    bgcolor: isDark ? bgDark : bgLight,
    border: `1px solid ${isDark ? `${color}55` : `${color}44`}`,
    maxWidth: '100%',
    height: 'auto',
    py: 0.4,
    '& .MuiChip-label': {
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      color: `${color} !important`,
    },
  });

  return (
    <Paper
      elevation={0}
      data-testid="brand-assets-forge"
      sx={{
        p: { xs: 2, sm: 3, md: 3.5 },
        borderRadius: 2.5,
        bgcolor: surfaceBg,
        color: primaryInk,
        border: `1px solid ${borderCol}`,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header Strip */}
      <SovereignEyebrow accent={goldInk} right="Studio Brand Kit · v2.3.0">
        brand-assets-alchemical-seals
      </SovereignEyebrow>
      <SovereignBand
        seed="brand-assets-alchemical-seals"
        eyebrow="Brand Assets & Alchemical Seals"
        caption="6 Parametric SVG Seals · Dual-Theme Design Tokens · WCAG 2.1 Auditor"
        label="Zoth Studio Brand Assets and Alchemical Seals visualiser"
      />

      <Box sx={{ mt: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '0.9rem !important', color: `${goldInk} !important` }} />}
            label="PARAMETRIC SVG SEAL FORGE"
            size="small"
            className={isDark ? 'zs-ondark' : ''}
            sx={chipStyle(goldInk, '#FEF9E7', 'rgba(212,175,55,0.12)')}
          />
          <Chip
            label="DUAL-THEME IVORY + OBSIDIAN"
            size="small"
            className={isDark ? 'zs-ondark' : ''}
            sx={chipStyle(cyanInk, '#E0F2FE', 'rgba(56,189,248,0.12)')}
          />
          <Chip
            label="100% CLIENT-SIDE · ZERO EGRESS"
            size="small"
            className={isDark ? 'zs-ondark' : ''}
            sx={chipStyle(emeraldInk, '#ECFDF5', 'rgba(16,185,129,0.14)')}
          />
        </Box>

        <Typography
          component="h3"
          variant="h4"
          sx={{
            fontFamily: DISPLAY,
            fontWeight: 400,
            color: primaryInk,
            mb: 0.75,
            overflowWrap: 'anywhere',
          }}
        >
          Alchemical Seals, Official Emblems &amp; Dual-Theme Token Workbench
        </Typography>
        <Typography variant="body2" sx={{ color: secondaryInk, maxWidth: 820, lineHeight: 1.65 }}>
          Generate XML-escaped vector seals and 1024px PNG badges, inspect and download official Light and Dark
          GhostByte emblems, verify Editorial Ivory and Obsidian Gold WCAG 2.1 contrast ratios, and export synchronized
          CSS, W3C JSON, Tailwind, and attribution bundles directly in your browser.
        </Typography>
      </Box>

      {/* Primary 4-Section Navigation Tabs */}
      <Box sx={{ borderBottom: `1px solid ${borderCol}`, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Brand Assets Kit sections"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              px: { xs: 1.5, sm: 2.25 },
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: secondaryInk,
              '&.Mui-selected': {
                color: goldInk,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: goldInk,
              height: 3,
            },
          }}
        >
          <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="1. Seal & Sigil Forge" />
          <Tab icon={<CollectionsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="2. Studio Asset Gallery" />
          <Tab icon={<ContrastIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="3. Tokens, Type & WCAG" />
          <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="4. Export Bundle" />
        </Tabs>
      </Box>

      {/* ===================================================================== */}
      {/* TAB 0: ALCHEMICAL SEAL & SIGIL FORGE                                  */}
      {/* ===================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Pane: Controls */}
          <Grid xs={12} lg={6}>
            <Stack spacing={2.25}>
              <Box>
                <Typography
                  component="h4"
                  variant="subtitle2"
                  sx={{ fontFamily: MONO, fontWeight: 800, color: goldInk, mb: 1, letterSpacing: '0.06em' }}
                >
                  SEAL TEMPLATE (6 PARAMETRIC GEOMETRIES)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {BRAND_SEAL_TEMPLATES.map((tpl) => {
                    const selected = tpl.id === templateId;
                    return (
                      <Button
                        key={tpl.id}
                        size="small"
                        variant={selected ? 'contained' : 'outlined'}
                        onClick={() => handleSelectTemplate(tpl)}
                        sx={{
                          minHeight: 44,
                          px: 1.6,
                          fontFamily: MONO,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: selected ? (isDark ? '#D4AF37' : '#101828') : 'transparent',
                          color: selected ? (isDark ? '#08080B' : '#FFFFFF') : primaryInk,
                          borderColor: selected ? (isDark ? '#D4AF37' : '#101828') : strongBorder,
                          '&:hover': {
                            bgcolor: selected ? (isDark ? '#E5C158' : '#1E293B') : elevatedBg,
                            borderColor: goldInk,
                          },
                        }}
                      >
                        {tpl.name}
                      </Button>
                    );
                  })}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: secondaryInk, lineHeight: 1.5 }}>
                  {activeTemplate.description}
                </Typography>
              </Box>

              {/* Text Inscriptions */}
              <Grid container spacing={1.5}>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="brand-seal-title"
                    fullWidth
                    label="Seal Title (Top Arc)"
                    value={sealTitle}
                    onChange={(e) => setSealTitle(e.target.value)}
                    inputProps={{ maxLength: 36, 'aria-label': 'Seal Title' }}
                    sx={{
                      '& .MuiInputBase-root': { minHeight: 48, fontFamily: MONO, fontSize: '0.82rem', bgcolor: subtleBg },
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    id="brand-seal-motto"
                    fullWidth
                    label="Seal Motto (Lower Inscription)"
                    value={sealSubtitle}
                    onChange={(e) => setSealSubtitle(e.target.value)}
                    inputProps={{ maxLength: 48, 'aria-label': 'Seal Motto' }}
                    sx={{
                      '& .MuiInputBase-root': { minHeight: 48, fontFamily: MONO, fontSize: '0.82rem', bgcolor: subtleBg },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Hex Color Controls */}
              <Grid container spacing={1.5}>
                {[
                  { id: 'brand-primary-hex', label: 'Primary Hex', val: primaryHexInput, safe: safePrimaryHex, set: setPrimaryHexInput },
                  { id: 'brand-secondary-hex', label: 'Secondary Hex', val: secondaryHexInput, safe: safeSecondaryHex, set: setSecondaryHexInput },
                  { id: 'brand-backdrop-hex', label: 'Backdrop Hex', val: bgHexInput, safe: sanitizeHex(bgHexInput, '#08080B'), set: setBgHexInput },
                ].map((field) => (
                  <Grid xs={12} sm={4} key={field.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="input"
                        type="color"
                        aria-label={`${field.label} swatch picker`}
                        value={field.safe}
                        onChange={(e) => field.set(e.target.value.toUpperCase())}
                        sx={{
                          width: 44,
                          height: 44,
                          p: 0.4,
                          borderRadius: 1.5,
                          border: `1px solid ${strongBorder}`,
                          bgcolor: subtleBg,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <TextField
                        id={field.id}
                        fullWidth
                        label={field.label}
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        inputProps={{ maxLength: 16, 'aria-label': field.label }}
                        sx={{
                          '& .MuiInputBase-root': { minHeight: 48, fontFamily: MONO, fontSize: '0.78rem', bgcolor: subtleBg },
                          '& .MuiInputBase-input': { minHeight: 44, boxSizing: 'border-box', py: 1.25 },
                        }}
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              {/* Sliders (44px accessible touch container) */}
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                    <Typography
                      id="brand-rings-slider-label"
                      sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: primaryInk, mb: 0.5 }}
                    >
                      Ring Density: {rings} Concentric Rings
                    </Typography>
                    <Slider
                      aria-labelledby="brand-rings-slider-label"
                      value={rings}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      onChange={(_, v) => setRings(Number(v))}
                      sx={{
                        color: goldInk,
                        minHeight: 44,
                        py: 2.5,
                        boxSizing: 'border-box',
                        '& .MuiSlider-thumb': { width: 24, height: 24 },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                    <Typography
                      id="brand-stroke-slider-label"
                      sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: primaryInk, mb: 0.5 }}
                    >
                      Stroke Weight: {strokeWidth.toFixed(1)} px
                    </Typography>
                    <Slider
                      aria-labelledby="brand-stroke-slider-label"
                      value={strokeWidth}
                      min={1}
                      max={5}
                      step={0.5}
                      onChange={(_, v) => setStrokeWidth(Number(v))}
                      sx={{
                        color: goldInk,
                        minHeight: 44,
                        py: 2.5,
                        boxSizing: 'border-box',
                        '& .MuiSlider-thumb': { width: 24, height: 24 },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Preview Stage Mode & Contrast Readout */}
              <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderCol}` }}>
                <Typography
                  component="h4"
                  sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: goldInk, mb: 1 }}
                >
                  STAGE BACKDROP &amp; LIVE CONTRAST AUDIT
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {[
                    { id: 'dark', label: 'Obsidian Stage' },
                    { id: 'light', label: 'Editorial Ivory Stage' },
                    { id: 'transparent', label: 'Transparent Alpha' },
                  ].map((opt) => (
                    <Button
                      key={opt.id}
                      size="small"
                      variant={stageMode === opt.id ? 'contained' : 'outlined'}
                      onClick={() => setStageMode(opt.id)}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: stageMode === opt.id ? (isDark ? '#D4AF37' : '#101828') : 'transparent',
                        color: stageMode === opt.id ? (isDark ? '#08080B' : '#FFFFFF') : primaryInk,
                        borderColor: strongBorder,
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    size="small"
                    className={isDark ? 'zs-ondark' : ''}
                    label={`Primary vs Stage: ${sealContrast.primaryRatio}:1 (${sealContrast.primaryBadge.level})`}
                    sx={chipStyle(
                      sealContrast.primaryBadge.passAA ? emeraldInk : crimsonInk,
                      sealContrast.primaryBadge.passAA ? '#ECFDF5' : '#FEF2F2',
                      sealContrast.primaryBadge.passAA ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)'
                    )}
                  />
                  <Chip
                    size="small"
                    className={isDark ? 'zs-ondark' : ''}
                    label={`Secondary vs Stage: ${sealContrast.secondaryRatio}:1 (${sealContrast.secondaryBadge.level})`}
                    sx={chipStyle(
                      sealContrast.secondaryBadge.passLarge ? cyanInk : crimsonInk,
                      sealContrast.secondaryBadge.passLarge ? '#E0F2FE' : '#FEF2F2',
                      sealContrast.secondaryBadge.passLarge ? 'rgba(56,189,248,0.14)' : 'rgba(244,63,94,0.14)'
                    )}
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Right Pane: Live Vector Seal Preview & Export Actions */}
          <Grid xs={12} lg={6}>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                bgcolor: subtleBg,
                border: `1px solid ${strongBorder}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: goldInk }}>
                  LIVE VECTOR SEAL PREVIEW (512×512 VIEWBOX)
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: secondaryInk }}>
                  {sealSvg.length.toLocaleString()} bytes · XML-escaped
                </Typography>
              </Box>

              {/* Inline SVG Stage (rendered via safe data URI img + inspectable source — zero innerHTML injection) */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${borderCol}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 280, sm: 360 },
                  bgcolor:
                    stageMode === 'transparent'
                      ? isDark
                        ? '#131722'
                        : '#EAE6DC'
                      : stageMode === 'light'
                        ? '#FAF8F3'
                        : effectiveBgHex,
                  backgroundImage:
                    stageMode === 'transparent'
                      ? 'repeating-conic-gradient(rgba(128,128,128,0.16) 0% 25%, transparent 0% 50%)'
                      : 'none',
                  backgroundSize: '20px 20px',
                }}
              >
                <Box
                  component="img"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sealSvg)}`}
                  alt={`${sealTitle || activeTemplate.name} live vector seal preview`}
                  data-testid="brand-seal-preview-img"
                  sx={{
                    width: '100%',
                    maxWidth: 340,
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    display: 'block',
                  }}
                />
              </Box>

              {/* Export Buttons (44px+ tap targets) */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadSvg}
                  sx={{
                    minHeight: 44,
                    flex: '1 1 150px',
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    bgcolor: isDark ? '#D4AF37' : '#101828',
                    color: isDark ? '#08080B' : '#FFFFFF',
                    '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                  }}
                >
                  Download .SVG
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  disabled={exportingPng}
                  onClick={handleExportPng}
                  sx={{
                    minHeight: 44,
                    flex: '1 1 160px',
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: goldInk,
                    borderColor: strongBorder,
                    '&:hover': { borderColor: goldInk, bgcolor: elevatedBg },
                  }}
                >
                  {exportingPng ? 'Rasterizing…' : 'Export 1024px .PNG'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={copiedKey === 'svg-code' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => triggerCopy(sealSvg, 'svg-code', 'SVG markup')}
                  sx={{
                    minHeight: 44,
                    flex: '1 1 140px',
                    fontFamily: MONO,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: cyanInk,
                    borderColor: isDark ? 'rgba(56,189,248,0.45)' : 'rgba(3,105,161,0.4)',
                  }}
                >
                  {copiedKey === 'svg-code' ? 'Copied SVG' : 'Copy SVG Code'}
                </Button>
              </Box>

              {/* Sanitized SVG Source Preview */}
              <Box
                component="pre"
                data-testid="brand-seal-svg-source"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: isDark ? '#05060A' : '#101828',
                  color: '#E2E8F0',
                  border: `1px solid ${borderCol}`,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  lineHeight: 1.55,
                  maxHeight: 170,
                  overflow: 'auto',
                }}
              >
                {sealSvg}
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: OFFICIAL STUDIO ASSET GALLERY                                  */}
      {/* ===================================================================== */}
      {activeTab === 1 && (
        <Box>
          <Typography component="h4" variant="h6" sx={{ fontFamily: DISPLAY, color: primaryInk, mb: 0.75 }}>
            Official Zoth Studio Emblems, Mascots &amp; OpenGraph Media
          </Typography>
          <Typography variant="body2" sx={{ color: secondaryInk, mb: 2.5, maxWidth: 780 }}>
            Every asset below is served directly from this repository in its verified native encoding (PNG RGBA or JFIF
            JPEG) with zero external CDN dependencies.
          </Typography>

          <Grid container spacing={2.5}>
            {BRAND_TOKENS.officialAssets.map((asset) => {
              const stageBg = asset.themeVariant === 'light' ? '#FAF8F3' : '#08080B';
              return (
                <Grid xs={12} sm={6} md={4} key={asset.id}>
                  <Box
                    sx={{
                      p: 2.25,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: subtleBg,
                      border: `1px solid ${borderCol}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        height: 176,
                        borderRadius: 1.5,
                        bgcolor: stageBg,
                        border: `1px solid ${borderCol}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={asset.path}
                        alt={asset.alt}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 1,
                        }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography component="h4" sx={{ fontWeight: 750, fontSize: '0.96rem', color: primaryInk, mb: 0.5 }}>
                        {asset.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                        <Chip
                          size="small"
                          label={asset.format}
                          className={isDark ? 'zs-ondark' : ''}
                          sx={chipStyle(goldInk, '#FEF9E7', 'rgba(212,175,55,0.12)')}
                        />
                        <Chip
                          size="small"
                          label={asset.dimensions}
                          className={isDark ? 'zs-ondark' : ''}
                          sx={chipStyle(cyanInk, '#E0F2FE', 'rgba(56,189,248,0.12)')}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: secondaryInk, lineHeight: 1.55 }}>
                        {asset.usage}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        component="a"
                        href={asset.path}
                        download
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{
                          minHeight: 44,
                          flex: '1 1 120px',
                          fontFamily: MONO,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: isDark ? '#D4AF37' : '#101828',
                          color: isDark ? '#08080B' : '#FFFFFF',
                          '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={copiedKey === asset.id ? <CheckIcon /> : <ContentCopyIcon />}
                        onClick={() => triggerCopy(asset.path, asset.id, asset.path)}
                        sx={{
                          minHeight: 44,
                          fontFamily: MONO,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: primaryInk,
                          borderColor: strongBorder,
                        }}
                      >
                        {copiedKey === asset.id ? 'Copied' : 'Path'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DUAL-THEME TOKENS, TYPOGRAPHY & WCAG 2.1 MATRIX                */}
      {/* ===================================================================== */}
      {activeTab === 2 && (
        <Stack spacing={3.5}>
          {/* Dual-Theme Token Swatches */}
          <Grid container spacing={2.5}>
            {[
              { title: 'Editorial Ivory Light Tokens', list: BRAND_TOKENS.light, modeTag: 'LIGHT DEFAULT' },
              { title: 'Obsidian Gold Dark Tokens', list: BRAND_TOKENS.dark, modeTag: 'DARK MODE' },
            ].map((group) => (
              <Grid xs={12} md={6} key={group.title}>
                <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderCol}`, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontSize: '1.2rem', color: primaryInk }}>
                      {group.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={group.modeTag}
                      className={isDark ? 'zs-ondark' : ''}
                      sx={chipStyle(goldInk, '#FEF9E7', 'rgba(212,175,55,0.12)')}
                    />
                  </Box>
                  <Stack spacing={1}>
                    {group.list.map((token) => {
                      const key = `${group.modeTag}-${token.key}`;
                      return (
                        <Button
                          key={key}
                          fullWidth
                          variant="outlined"
                          onClick={() => triggerCopy(token.hex, key, `${token.name} (${token.hex})`)}
                          aria-label={`Copy ${token.name} hex ${token.hex}`}
                          sx={{
                            minHeight: 52,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1.5,
                            justifyContent: 'space-between',
                            textAlign: 'left',
                            textTransform: 'none',
                            bgcolor: surfaceBg,
                            borderColor: borderCol,
                            color: primaryInk,
                            '&:hover': { borderColor: goldInk, bgcolor: elevatedBg },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <Box
                              aria-hidden="true"
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1,
                                bgcolor: token.hex,
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.28)' : 'rgba(16,24,40,0.22)'}`,
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: primaryInk, lineHeight: 1.25 }}>
                                {token.name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: secondaryInk, overflowWrap: 'anywhere' }}>
                                {token.role}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            component="span"
                            sx={{
                              fontFamily: MONO,
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              color: copiedKey === key ? emeraldInk : goldInk,
                              ml: 1,
                              flexShrink: 0,
                            }}
                          >
                            {copiedKey === key ? 'Copied' : token.hex}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ borderColor: borderCol }} />

          {/* Typography Specimens */}
          <Box>
            <Typography component="h4" variant="h6" sx={{ fontFamily: DISPLAY, color: primaryInk, mb: 1.5 }}>
              Self-Hosted Typography Specimens (Zero-Egress WOFF2)
            </Typography>
            <Grid container spacing={2}>
              {BRAND_TOKENS.typography.map((font) => (
                <Grid xs={12} md={4} key={font.cssVar}>
                  <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${borderCol}`, height: '100%' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: goldInk, mb: 0.5 }}>
                      {font.role.toUpperCase()}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: font.family,
                        fontSize: font.cssVar.includes('display') ? '1.55rem' : font.cssVar.includes('mono') ? '0.96rem' : '1.1rem',
                        color: primaryInk,
                        lineHeight: 1.3,
                        my: 1.25,
                      }}
                    >
                      {font.specimen}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: cyanInk, mb: 0.5 }}>
                      {font.cssVar} · {font.weights}
                    </Typography>
                    <Typography variant="caption" sx={{ color: secondaryInk, display: 'block', lineHeight: 1.55 }}>
                      {font.usage}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ borderColor: borderCol }} />

          {/* Live WCAG 2.1 Contrast Checker + Full Matrix */}
          <Box>
            <Typography component="h4" variant="h6" sx={{ fontFamily: DISPLAY, color: primaryInk, mb: 1.5 }}>
              Live WCAG 2.1 Contrast Checker &amp; Dual-Theme Compliance Matrix
            </Typography>

            <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: subtleBg, border: `1px solid ${strongBorder}`, mb: 2.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid xs={12} sm={4}>
                  <TextField
                    id="wcag-fg-hex"
                    fullWidth
                    label="Foreground Hex"
                    value={wcagFgInput}
                    onChange={(e) => setWcagFgInput(e.target.value)}
                    inputProps={{ 'aria-label': 'WCAG Foreground Hex' }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 48, fontFamily: MONO, bgcolor: surfaceBg } }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    id="wcag-bg-hex"
                    fullWidth
                    label="Background Hex"
                    value={wcagBgInput}
                    onChange={(e) => setWcagBgInput(e.target.value)}
                    inputProps={{ 'aria-label': 'WCAG Background Hex' }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 48, fontFamily: MONO, bgcolor: surfaceBg } }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => {
                      setWcagFgInput(customWcag.bg);
                      setWcagBgInput(customWcag.fg);
                    }}
                    sx={{ minHeight: 48, fontFamily: MONO, fontWeight: 700, color: primaryInk, borderColor: strongBorder }}
                  >
                    Swap FG / BG
                  </Button>
                </Grid>
                <Grid xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: customWcag.bg,
                      color: customWcag.fg,
                      border: `1px solid ${borderCol}`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Typography sx={{ fontFamily: SANS, fontWeight: 700, fontSize: '1rem', color: customWcag.fg }}>
                      Specimen Preview: {customWcag.fg} on {customWcag.bg}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontWeight: 800, fontSize: '0.88rem', color: customWcag.fg }}>
                      {customWcag.ratio}:1 · {customWcag.badge.label}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={1.5}>
              {tokenMatrix.map((row) => (
                <Grid xs={12} sm={6} lg={4} key={`${row.theme}-${row.label}`}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: subtleBg,
                      border: `1px solid ${borderCol}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: primaryInk }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: secondaryInk }}>
                        {row.fgHex} on {row.bgHex}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      className={isDark ? 'zs-ondark' : ''}
                      label={`${row.ratio}:1 ${row.level}`}
                      sx={chipStyle(
                        row.passAA ? emeraldInk : crimsonInk,
                        row.passAA ? '#ECFDF5' : '#FEF2F2',
                        row.passAA ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)'
                      )}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PRODUCTION EXPORT BUNDLE                                       */}
      {/* ===================================================================== */}
      {activeTab === 3 && (
        <Stack spacing={2.25}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { id: 'css', label: 'CSS Variables (.css)' },
                { id: 'json', label: 'W3C Design Tokens (.json)' },
                { id: 'tailwind', label: 'Tailwind Config (.js)' },
                { id: 'attribution', label: 'Attribution Snippets' },
              ].map((fmt) => (
                <Button
                  key={fmt.id}
                  size="small"
                  variant={exportFormat === fmt.id ? 'contained' : 'outlined'}
                  onClick={() => setExportFormat(fmt.id)}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: exportFormat === fmt.id ? (isDark ? '#D4AF37' : '#101828') : 'transparent',
                    color: exportFormat === fmt.id ? (isDark ? '#08080B' : '#FFFFFF') : primaryInk,
                    borderColor: strongBorder,
                  }}
                >
                  {fmt.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={copiedKey === 'bundle' ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={() => triggerCopy(activeBundleText, 'bundle', `${exportFormat.toUpperCase()} bundle`)}
                sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: goldInk, borderColor: strongBorder }}
              >
                {copiedKey === 'bundle' ? 'Copied' : 'Copy Bundle'}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadBundle}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  bgcolor: isDark ? '#D4AF37' : '#101828',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                }}
              >
                Download Artifact
              </Button>
            </Box>
          </Box>

          <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: secondaryInk }}>
            Compiled Brand Artifact — {exportFormat.toUpperCase()} · Synced to Zoth Studio v2.3.0
          </Typography>

          <Box
            component="pre"
            data-testid="brand-export-bundle-pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? '#05060A' : '#101828',
              color: '#E2E8F0',
              border: `1px solid ${borderCol}`,
              fontFamily: MONO,
              fontSize: '0.75rem',
              lineHeight: 1.6,
              maxHeight: 420,
              overflow: 'auto',
            }}
          >
            {activeBundleText}
          </Box>
        </Stack>
      )}

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={2200}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMsg('')}
          severity="success"
          sx={{ bgcolor: '#047857', color: '#FFFFFF', fontWeight: 700 }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
