import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Slider,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
  TextField,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PaletteIcon from '@mui/icons-material/Palette';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import { useReality, REALITY_ORDER } from '../../context/RealityContext';
import { ZothBotCharacterCanvas, RealityThemeIcon } from '../RealityZothBotHUD';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

function hexToRgbTuple(hex) {
  const clean = (hex || '#D4AF37').replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16) || 0xd4af37;
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}

export default function RealityShaderForgeGodModeTool() {
  const { realityId, setRealityId, activeTheme, themes } = useReality();

  const [themeName, setThemeName] = useState(activeTheme.name);
  const [primaryHex, setPrimaryHex] = useState(activeTheme.primary);
  const [secondaryHex, setSecondaryHex] = useState(activeTheme.secondary);
  const [bgVoidHex, setBgVoidHex] = useState(activeTheme.bgVoid);
  const [particleSpeed, setParticleSpeed] = useState(1.2);
  const [nodeDensity, setNodeDensity] = useState(28);
  const [cornerRadius, setCornerRadius] = useState(parseInt(activeTheme.borderRadius, 10) || 12);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const shaderCanvasRef = useRef(null);

  // Sync local sliders when global reality changes
  useEffect(() => {
    setThemeName(activeTheme.name);
    setPrimaryHex(activeTheme.primary);
    setSecondaryHex(activeTheme.secondary);
    setBgVoidHex(activeTheme.bgVoid);
    setCornerRadius(parseInt(activeTheme.borderRadius, 10) || 12);
  }, [activeTheme]);

  // 60fps Custom Shader Preview Canvas
  useEffect(() => {
    const canvas = shaderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const pts = Array.from({ length: nodeDensity }, (_, i) => ({
      x: ((i * 97) % 520) + 20,
      y: ((i * 53) % 190) + 15,
      vx: ((i % 2 === 0 ? 1 : -1) * (0.4 + (i % 5) * 0.15)),
      vy: ((i % 3 === 0 ? 1 : -1) * (0.3 + (i % 4) * 0.12)),
    }));

    const render = () => {
      t += 0.02 * particleSpeed;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = bgVoidHex || '#050608';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = `${primaryHex}1A`;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Update & connect nodes
      pts.forEach((p, idx) => {
        p.x += p.vx * particleSpeed;
        p.y += p.vy * particleSpeed;
        if (p.x < 12 || p.x > w - 12) p.vx *= -1;
        if (p.y < 12 || p.y > h - 12) p.vy *= -1;

        for (let j = idx + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            ctx.strokeStyle = `${ idx % 2 === 0 ? primaryHex : secondaryHex }44`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = idx % 3 === 0 ? secondaryHex : primaryHex;
        ctx.beginPath();
        ctx.arc(p.x, p.y, idx % 4 === 0 ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center sacred ring / hypercube overlay
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(t * 0.4);
      ctx.strokeStyle = `${primaryHex}88`;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-34, -34, 68, 68);
      ctx.rotate(-t * 0.8);
      ctx.strokeStyle = `${secondaryHex}88`;
      ctx.strokeRect(-22, -22, 44, 44);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [primaryHex, secondaryHex, bgVoidHex, particleSpeed, nodeDensity]);

  const kdeColorsFile = useMemo(() => {
    const slug = themeName.replace(/[^a-zA-Z0-9]/g, '');
    return `[ColorEffects:Disabled]
Color=56,56,56
ColorAmount=0
ColorEffect=0
ContrastAmount=0.65
ContrastEffect=1
IntensityAmount=0.1
IntensityEffect=2

[Colors:Button]
BackgroundAlternate=14,18,26
BackgroundNormal=10,12,18
DecorationFocus=${hexToRgbTuple(primaryHex)}
DecorationHover=${hexToRgbTuple(secondaryHex)}
ForegroundActive=${hexToRgbTuple(primaryHex)}
ForegroundInactive=138,148,166
ForegroundLink=${hexToRgbTuple(primaryHex)}
ForegroundNormal=245,240,232

[Colors:Window]
BackgroundAlternate=8,10,15
BackgroundNormal=${hexToRgbTuple(bgVoidHex)}
DecorationFocus=${hexToRgbTuple(primaryHex)}
DecorationHover=${hexToRgbTuple(secondaryHex)}
ForegroundActive=${hexToRgbTuple(primaryHex)}
ForegroundInactive=148,163,184
ForegroundNormal=245,240,232

[General]
ColorScheme=Zoth${slug}
Name=ZothOS ${themeName}
shadeSortColumn=true

[WM]
activeBackground=${hexToRgbTuple(bgVoidHex)}
activeBlend=${hexToRgbTuple(primaryHex)}
activeForeground=245,240,232
inactiveBackground=8,10,15
inactiveForeground=120,130,145`;
  }, [themeName, primaryHex, secondaryHex, bgVoidHex]);

  const alacrittyToml = useMemo(() => {
    return `# ZothOS v3.2 Alacritty Reality Profile — ${themeName}
# Companion Zoth Bot: ${activeTheme.botName} (${activeTheme.botTitle})

[window]
opacity = 0.94
padding = { x = 14, y = 12 }
decorations = "Full"

[font]
size = 11.5
normal = { family = "JetBrains Mono", style = "Regular" }
bold = { family = "JetBrains Mono", style = "Bold" }

[colors.primary]
background = "${bgVoidHex}"
foreground = "#F5F0E8"

[colors.cursor]
text = "${bgVoidHex}"
cursor = "${primaryHex}"

[colors.normal]
black   = "${bgVoidHex}"
red     = "#F43F5E"
green   = "#10B981"
yellow  = "${primaryHex}"
blue    = "#38BDF8"
magenta = "${secondaryHex}"
cyan    = "#00F0FF"
white   = "#F5F0E8"`;
  }, [themeName, activeTheme.botName, activeTheme.botTitle, bgVoidHex, primaryHex, secondaryHex]);

  const cssVariablesExport = useMemo(() => {
    return `:root[data-zoth-reality="${realityId}"] {
  --zoth-reality-id: "${realityId}";
  --zoth-reality-name: "${themeName}";
  --zoth-reality-primary: ${primaryHex};
  --zoth-reality-secondary: ${secondaryHex};
  --zoth-reality-void: ${bgVoidHex};
  --zoth-reality-radius: ${cornerRadius}px;
  --zoth-reality-particle-speed: ${particleSpeed};
  --zoth-reality-node-density: ${nodeDensity};
  --zoth-bot-companion: "${activeTheme.botName}";
}`;
  }, [realityId, themeName, primaryHex, secondaryHex, bgVoidHex, cornerRadius, particleSpeed, nodeDensity, activeTheme.botName]);

  const activeExportText = activeTab === 0 ? kdeColorsFile : activeTab === 1 ? alacrittyToml : cssVariablesExport;
  const activeExportExt = activeTab === 0 ? 'colors' : activeTab === 1 ? 'toml' : 'css';

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeExportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeExportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-${realityId}-theme.${activeExportExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 5,
        borderRadius: `${cornerRadius}px`,
        bgcolor: 'rgba(9, 11, 17, 0.9)',
        border: `1px solid ${primaryHex}55`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 36px ${primaryHex}22`,
      }}
    >
      {/* Top Header & Live 5-Reality Selector */}
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
              icon={<AutoAwesomeIcon sx={{ fontSize: '0.95rem !important', color: `${primaryHex} !important` }} />}
              label="REALITY SHADER & ZOTHOS THEME SYNTHESIZER"
              size="small"
              sx={{
                bgcolor: `${primaryHex}18`,
                color: primaryHex,
                border: `1px solid ${primaryHex}55`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              label={`COMPANION BOT: ${activeTheme.botName}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.06)',
                color: '#F5F0E8',
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 800 }}>
            Zoth Reality Shader & Desktop Theme Forge
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
            Switch between the 5 Zoth Realities, tune 60fps shader physics and Zoth Bot avatars, and export KDE Plasma <code>.colors</code>, Alacritty <code>.toml</code>, and CSS tokens.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
          {REALITY_ORDER.map((id) => {
            const t = themes[id];
            const isSel = id === realityId;
            return (
              <Button
                key={id}
                size="small"
                variant={isSel ? 'contained' : 'outlined'}
                onClick={() => setRealityId(id)}
                startIcon={<RealityThemeIcon realityId={id} size={14} color={isSel ? '#06080D' : t.primary} />}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: isSel ? t.primary : 'transparent',
                  color: isSel ? '#06080D' : t.primary,
                  borderColor: t.border,
                }}
              >
                {t.shortLabel}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Left Column: Live 60fps Shader & Zoth Bot Preview + Parameter Dials */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: `${cornerRadius}px`,
                bgcolor: bgVoidHex,
                border: `1px solid ${primaryHex}55`,
                position: 'relative',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: primaryHex, fontWeight: 800 }}>
                  LIVE 60FPS SHADER & ZOTH BOT PREVIEW // {themeName.toUpperCase()}
                </Typography>
                <Chip
                  label={`${nodeDensity} NODES • ${particleSpeed.toFixed(1)}x`}
                  size="small"
                  sx={{ height: 20, fontFamily: mono, fontSize: '0.64rem', bgcolor: `${primaryHex}22`, color: primaryHex }}
                />
              </Stack>

              <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${primaryHex}33` }}>
                <canvas
                  ref={shaderCanvasRef}
                  width={560}
                  height={210}
                  style={{ width: '100%', height: 210, display: 'block' }}
                />
                {/* Overlay Zoth Bot Companion Card inside the live shader preview */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(6, 8, 14, 0.88)',
                    border: `1px solid ${primaryHex}66`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <ZothBotCharacterCanvas realityId={realityId} size={46} />
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: primaryHex }}>
                      {activeTheme.botName}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: 'text.secondary' }}>
                      {activeTheme.botTitle}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Color & Physics Controls */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary', mb: 0.5 }}>
                    PRIMARY ACCENT HEX
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={primaryHex}
                    onChange={(e) => setPrimaryHex(e.target.value)}
                    sx={{ '& input': { fontFamily: mono, fontSize: '0.75rem', color: primaryHex } }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary', mb: 0.5 }}>
                    SECONDARY ACCENT HEX
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={secondaryHex}
                    onChange={(e) => setSecondaryHex(e.target.value)}
                    sx={{ '& input': { fontFamily: mono, fontSize: '0.75rem', color: secondaryHex } }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary', mb: 0.5 }}>
                    VOID CANVAS HEX
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={bgVoidHex}
                    onChange={(e) => setBgVoidHex(e.target.value)}
                    sx={{ '& input': { fontFamily: mono, fontSize: '0.75rem' } }}
                  />
                </Grid>

                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    SHADER VELOCITY ({particleSpeed.toFixed(1)}x)
                  </Typography>
                  <Slider
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={particleSpeed}
                    onChange={(_, v) => setParticleSpeed(v)}
                    sx={{ color: primaryHex }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    CONSTELLATION NODES ({nodeDensity})
                  </Typography>
                  <Slider
                    min={10}
                    max={56}
                    step={2}
                    value={nodeDensity}
                    onChange={(_, v) => setNodeDensity(v)}
                    sx={{ color: primaryHex }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    CHROME RADIUS ({cornerRadius}px)
                  </Typography>
                  <Slider
                    min={2}
                    max={24}
                    step={2}
                    value={cornerRadius}
                    onChange={(_, v) => setCornerRadius(v)}
                    sx={{ color: primaryHex }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Compiled ZothOS & Studio Theme Artifacts */}
        <Grid xs={12} md={6}>
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
              <Tab icon={<PaletteIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="KDE Plasma (.colors)" />
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Alacritty (.toml)" />
              <Tab icon={<CodeIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Studio Reality (.css)" />
            </Tabs>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
              Compiled Artifact (`zoth-{realityId}-theme.{activeExportExt}`)
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopy}
                sx={{ fontFamily: mono, fontSize: '0.7rem', color: primaryHex, borderColor: `${primaryHex}55` }}
              >
                {copied ? 'Copied' : 'Copy Config'}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: primaryHex, color: '#05070B', fontWeight: 800 }}
              >
                Export .{activeExportExt}
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
              border: `1px solid ${primaryHex}44`,
              fontFamily: mono,
              fontSize: '0.73rem',
              overflowX: 'auto',
              maxHeight: 350,
            }}
          >
            {activeExportText}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
