import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import CasinoIcon from '@mui/icons-material/Casino';
import GitHubIcon from '@mui/icons-material/GitHub';
import KeyIcon from '@mui/icons-material/Key';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  MONO,
  rgba,
} from '../sovereign';

const ACCENT_DARK = '#D4AF37';
const ACCENT_LIGHT = '#9A6F00';

const COMFY_PRESETS = [
  {
    id: 'hero-specimen',
    label: 'Hero Specimen',
    file: 'hero-specimen.json',
    width: 1440,
    height: 810,
    aspectLabel: '16:9 Widescreen',
    model: 'FLUX.2 Pro',
    credits: '~6.3–12.7 credits',
    usd: '~$0.03–$0.06',
    defaultOut: './public/assets/hero-specimen.png',
    defaultPrompt:
      'Sculptural obsidian and brushed antique gold prism, controlled studio rim light, deep #08080B matte background, crisp architectural shadow',
    purpose: 'Art-directed 3D obsidian/gold/glass hero artwork for landing pages and product decks.',
    guide: 'widescreen',
  },
  {
    id: 'product-packshot',
    label: 'Product Packshot',
    file: 'product-packshot.json',
    width: 1024,
    height: 1024,
    aspectLabel: '1:1 Studio Square',
    model: 'FLUX.2 Pro',
    credits: '~6.3 credits',
    usd: '~$0.03',
    defaultOut: './public/assets/products/sku-01.png',
    defaultPrompt:
      'Locked-lighting commercial studio packshot, matte anodized hardware chassis centered on neutral alabaster sweep, crisp softbox specular highlight',
    purpose: 'Consistent multi-SKU catalog packshots for Hatch, Hush, and print-on-demand storefronts.',
    guide: 'square',
  },
  {
    id: 'brand-relight',
    label: 'Brand Relight',
    file: 'brand-relight.json',
    width: 1024,
    height: 1024,
    aspectLabel: 'Source Dimensions',
    model: 'FLUX.1 Kontext Pro',
    credits: '~8.4 credits',
    usd: '~$0.04',
    defaultOut: './public/assets/relight-out.png',
    defaultPrompt:
      'Preserve subject geometry exactly; relight with warm bronze studio key light and dark obsidian backdrop with subtle ambient rim glow',
    purpose: 'Image-to-image relighting and palette alignment using an existing reference image.',
    guide: 'relight',
    needsInputImage: true,
  },
  {
    id: 'hero-loop',
    label: 'Hero Loop (1080p)',
    file: 'hero-loop.json',
    width: 1920,
    height: 1080,
    aspectLabel: '16:9 1080p Video',
    model: 'Partner Video Node',
    credits: '~30–90 credits',
    usd: '~$0.14–$0.43',
    defaultOut: './public/intros/hero-loop.mp4',
    defaultPrompt:
      'Slow orbital camera drift around dark obsidian monolith with subtle warm gold hairline reflection, smooth ambient loop, high contrast minimal frame',
    purpose: 'Subtle 1080p looping background video asset for hero headers and route transitions.',
    guide: 'widescreen',
  },
  {
    id: 'ui-texture-tile',
    label: 'UI Texture Tile',
    file: 'ui-texture-tile.json',
    width: 1024,
    height: 1024,
    aspectLabel: '1:1 Tileable Surface',
    model: 'FLUX.2 Pro',
    credits: '~6.3 credits',
    usd: '~$0.03',
    defaultOut: './public/assets/textures/obsidian-grain.png',
    defaultPrompt:
      'Tileable dark obsidian micro-grain stone and fine woven paper texture, uniform lighting, zero vignette, subtle tactile relief for CSS backgrounds',
    purpose: 'Tileable dark obsidian or warm alabaster surface textures for CSS background layers.',
    guide: 'tile',
  },
  {
    id: 'og-social-card',
    label: 'OG Social Card',
    file: 'og-social-card.json',
    width: 1200,
    height: 630,
    aspectLabel: '1.91:1 OpenGraph',
    model: 'FLUX.2 Pro',
    credits: '~6.3 credits',
    usd: '~$0.03',
    defaultOut: './public/og-image.png',
    defaultPrompt:
      'Editorial dark obsidian social banner, golden geometric emblem positioned right of center, clean negative space on left for typography overlay',
    purpose: '1200×630 OpenGraph and Twitter Card hero banners for production web deployments.',
    guide: 'og',
  },
  {
    id: 'mobile-app-icon',
    label: 'Mobile App Icon',
    file: 'mobile-app-icon.json',
    width: 1024,
    height: 1024,
    aspectLabel: '1:1 Squircle-Safe',
    model: 'FLUX.2 Pro',
    credits: '~6.3 credits',
    usd: '~$0.03',
    defaultOut: './public/icons/app-icon-1024.png',
    defaultPrompt:
      'Centered obsidian and brushed gold geometric monolith icon emblem on deep charcoal field, generous safe padding for iOS/Android squircle crop',
    purpose: 'Squircle-safe icon artwork for Zoth Bot OS, Android APKs, and installable PWAs.',
    guide: 'squircle',
  },
  {
    id: 'isometric-diorama',
    label: 'Isometric Diorama',
    file: 'isometric-diorama.json',
    width: 1344,
    height: 768,
    aspectLabel: '7:4 Isometric',
    model: 'FLUX.2 Pro',
    credits: '~6.3–9.5 credits',
    usd: '~$0.03–$0.05',
    defaultOut: './public/assets/isometric-diorama.png',
    defaultPrompt:
      'Architectural isometric 3D diorama of a dark obsidian compute station with warm gold copper conduits and glass server racks on clean matte base',
    purpose: 'Isometric 3D architectural specimens for Zoth Civilization and Zoth Studio v2 cards.',
    guide: 'widescreen',
  },
];

function shellQuote(str) {
  return `"${String(str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export default function ZothComfyFoundryGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const [presetId, setPresetId] = useState(COMFY_PRESETS[0].id);
  const [prompt, setPrompt] = useState(COMFY_PRESETS[0].defaultPrompt);
  const [width, setWidth] = useState(String(COMFY_PRESETS[0].width));
  const [height, setHeight] = useState(String(COMFY_PRESETS[0].height));
  const [seed, setSeed] = useState('42');
  const [outPath, setOutPath] = useState(COMFY_PRESETS[0].defaultOut);
  const [inputImage, setInputImage] = useState('./source-photo.png');
  const [dryRun, setDryRun] = useState(true);

  const activePreset = useMemo(
    () => COMFY_PRESETS.find((p) => p.id === presetId) || COMFY_PRESETS[0],
    [presetId],
  );

  const handleSelectPreset = (preset) => {
    setPresetId(preset.id);
    setPrompt(preset.defaultPrompt);
    setWidth(String(preset.width));
    setHeight(String(preset.height));
    setOutPath(preset.defaultOut);
  };

  const numW = Math.max(256, Math.min(4096, parseInt(width, 10) || activePreset.width));
  const numH = Math.max(256, Math.min(4096, parseInt(height, 10) || activePreset.height));
  const numSeed = parseInt(seed, 10) || 42;
  const aspectRatio = numW / numH;

  const renderCommand = useMemo(() => {
    const parts = [
      `zoth-comfy render ${activePreset.id}`,
      `--prompt ${shellQuote(prompt.trim() || activePreset.defaultPrompt)}`,
      `--width ${numW}`,
      `--height ${numH}`,
      `--seed ${numSeed}`,
    ];
    if (activePreset.needsInputImage && inputImage.trim()) {
      parts.push(`--input-image ${shellQuote(inputImage.trim())}`);
    }
    if (outPath.trim()) {
      parts.push(`--out ${shellQuote(outPath.trim())}`);
    }
    if (dryRun) {
      parts.push('--dry-run');
    }
    return parts.join(' \\\n  ');
  }, [activePreset, prompt, numW, numH, numSeed, inputImage, outPath, dryRun]);

  const authSetupSnippet = `# 1. Get a Comfy Cloud API key at https://platform.comfy.org/profile/api-keys
zoth-comfy auth "<YOUR_COMFY_API_KEY>"   # Saved locally to ~/.config/zoth/comfy.env (chmod 600)
zoth-comfy verify --json                 # Confirm key reachability without echoing secrets
zoth-comfy presets                       # List all 8 built-in workflow presets`;

  const workflowManifest = useMemo(
    () => ({
      foundry_version: '1.2.0',
      comfy_cloud_endpoint: 'https://cloud.comfy.org',
      requires_local_vram: false,
      auth_env_file: '~/.config/zoth/comfy.env',
      default_workflow: activePreset.id,
      workflow_template: `workflows/${activePreset.file}`,
      partner_model: activePreset.model,
      estimated_cost: `${activePreset.credits} (${activePreset.usd})`,
      dry_run: dryRun,
      items: [
        {
          filename: outPath.trim() || activePreset.defaultOut,
          workflow: activePreset.id,
          prompt: prompt.trim() || activePreset.defaultPrompt,
          width: numW,
          height: numH,
          seed: numSeed,
          ...(activePreset.needsInputImage ? { input_image: inputImage.trim() || './source-photo.png' } : {}),
        },
      ],
    }),
    [activePreset, dryRun, outPath, prompt, numW, numH, numSeed, inputImage],
  );

  const manifestJsonString = useMemo(() => JSON.stringify(workflowManifest, null, 2), [workflowManifest]);

  const handleDownloadManifest = () => {
    downloadJson(`zoth-comfy-${activePreset.id}-manifest.json`, workflowManifest);
  };

  const kpis = [
    { label: 'Presets', value: '8', unit: 'built-in workflows', accent: '#D4AF37' },
    { label: 'Target Frame', value: `${numW}×${numH}`, unit: activePreset.aspectLabel, accent: '#38BDF8' },
    { label: 'Cloud Node', value: activePreset.model, unit: activePreset.credits, accent: '#34D399' },
    { label: 'Local VRAM', value: '0 GB', unit: 'Comfy Cloud API key', accent: '#C084FC' },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status="standby"
        label="LOCAL CLI CONFIGURATOR · COMFY CLOUD API KEY REQUIRED"
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'cli' ? 'Copied CLI Command' : 'Copy zoth-comfy CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(renderCommand, 'cli'),
      primary: true,
    },
    {
      label: 'Download Manifest JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadManifest,
    },
    {
      label: 'Randomize Seed',
      icon: <CasinoIcon fontSize="small" />,
      onClick: () => setSeed(String(Math.floor(Math.random() * 999999) + 1)),
    },
    {
      label: 'Get zoth-comfy on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/zoth-comfy-foundry',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="8 BUILT-IN WORKFLOW PRESETS"
        title="Select Foundry Preset"
        subtitle="Each preset maps to an API-format workflow JSON in zoth-comfy-foundry/workflows/"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {COMFY_PRESETS.map((preset) => {
            const active = preset.id === activePreset.id;
            return (
              <Chip
                key={preset.id}
                label={preset.id}
                clickable
                onClick={() => handleSelectPreset(preset)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {activePreset.label}
            </Typography>
            <Chip
              size="small"
              label={`${activePreset.model} · ${activePreset.credits}`}
              sx={{
                fontFamily: MONO,
                fontSize: '0.66rem',
                bgcolor: rgba(accent, 0.12),
                color: accent,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
            {activePreset.purpose}
          </Typography>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="PROMPT & RENDER PARAMETERS"
        title="Configure Workflow Inputs"
        subtitle="Edits update the CLI command, frame preview, and batch manifest in real time"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <TextField
            label="Render Prompt"
            multiline
            minRows={3}
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.55 } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Width (px)"
              value={width}
              onChange={(e) => setWidth(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: 13 } }}
            />
            <TextField
              size="small"
              label="Height (px)"
              value={height}
              onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: 13 } }}
            />
            <TextField
              size="small"
              label="Seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: 13 } }}
            />
          </Box>

          {activePreset.needsInputImage && (
            <TextField
              size="small"
              label="Source Input Image (--input-image)"
              fullWidth
              value={inputImage}
              onChange={(e) => setInputImage(e.target.value)}
              sx={{ '& input': { fontFamily: MONO, fontSize: 13 } }}
            />
          )}

          <TextField
            size="small"
            label="Output File Path (--out)"
            fullWidth
            value={outPath}
            onChange={(e) => setOutPath(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: 13 } }}
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem' }}>
                Enable --dry-run (resolve workflow JSON locally without spending Comfy Cloud credits)
              </Typography>
            }
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="PROPORTIONAL RESOLUTION & SAFE-AREA PREVIEW"
        title={`${numW} × ${numH} px · ${activePreset.aspectLabel}`}
        subtitle={`Template: workflows/${activePreset.file} · Est. cost: ${activePreset.credits} (${activePreset.usd})`}
        accent={accent}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? '#07080D' : '#F4F1EA',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 220,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: aspectRatio >= 1.5 ? 420 : aspectRatio >= 1 ? 260 : 210,
              aspectRatio: `${numW} / ${numH}`,
              maxHeight: 230,
              position: 'relative',
              borderRadius: activePreset.guide === 'squircle' ? '22%' : 1.5,
              border: `2px solid ${accent}`,
              bgcolor: '#0B0C12',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 1.5,
              boxShadow: `0 12px 32px ${rgba('#000000', 0.35)}`,
            }}
          >
            {/* Subtle safe-area guide frame */}
            <Box
              sx={{
                position: 'absolute',
                inset: activePreset.guide === 'og' ? '12% 8%' : activePreset.guide === 'squircle' ? '14%' : '8%',
                border: `1px dashed ${rgba('#D4AF37', 0.42)}`,
                borderRadius: activePreset.guide === 'squircle' ? '18%' : 1,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, color: '#D4AF37' }}>
                {activePreset.id.toUpperCase()}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.64rem', color: '#94A3B8' }}>
                {numW}×{numH} · seed {numSeed}
              </Typography>
            </Box>

            <Typography
              sx={{
                position: 'relative',
                zIndex: 1,
                fontFamily: MONO,
                fontSize: '0.68rem',
                color: '#E2E8F0',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                my: 1,
                px: 1,
              }}
            >
              “{prompt.trim() || activePreset.defaultPrompt}”
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.62rem', color: '#34D399' }}>
                {activePreset.model}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.62rem', color: '#CBD5E1' }}>
                {dryRun ? 'DRY-RUN MODE' : activePreset.credits}
              </Typography>
            </Box>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="LIVE CLI COMMAND & AUTH SETUP"
        title="Run Locally via zoth-comfy"
        subtitle="Zero local GPU VRAM needed — executes on Comfy Cloud with your own API key"
        accent={accent}
      >
        <SovereignCodeBlock
          title="RENDER COMMAND"
          badge={dryRun ? 'DRY-RUN' : 'COMFY CLOUD'}
          code={renderCommand}
          filename={`render-${activePreset.id}.sh`}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={copied === 'render' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy(renderCommand, 'render')}
            sx={{
              minHeight: 40,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: accent,
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            {copied === 'render' ? 'Copied Render CLI' : 'Copy Render Command'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={copied === 'auth' ? <CheckIcon fontSize="small" /> : <KeyIcon fontSize="small" />}
            onClick={() => copy('zoth-comfy auth "<YOUR_COMFY_API_KEY>" && zoth-comfy verify --json', 'auth')}
            sx={{ minHeight: 40, fontFamily: MONO, fontSize: '0.74rem', textTransform: 'none' }}
          >
            {copied === 'auth' ? 'Copied Auth CLI' : 'Copy Auth Setup CLI'}
          </Button>
        </Box>

        <SovereignCodeBlock
          title="ONE-TIME API KEY SETUP (LOCAL ONLY)"
          badge="CHMOD 600"
          code={authSetupSnippet}
          filename="zoth-comfy-setup.sh"
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="WORKFLOW JSON MANIFEST"
        title="Downloadable Batch / Single Manifest"
        subtitle="Compatible with zoth-comfy batch <manifest.json> --dry-run"
        accent={accent}
      >
        <SovereignCodeBlock
          title={`zoth-comfy-${activePreset.id}-manifest.json`}
          badge="JSON"
          code={manifestJsonString}
          filename={`zoth-comfy-${activePreset.id}-manifest.json`}
          maxHeight={260}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="User-Supplied Comfy Cloud API Key Required (Zero Local VRAM)"
          message="This browser workbench configures presets, aspect ratios, CLI flags, and downloadable workflow JSON manifests locally. Actual image/video rendering runs via the local zoth-comfy Python CLI against https://cloud.comfy.org using your own key (zoth-comfy auth <KEY>, stored locally at chmod 600 ~/.config/zoth/comfy.env). No API key is ever sent through this webpage."
        />
      </Box>
      <SovereignWorkstationShell
        id="zoth-comfy-foundry"
        category="MEDIA & 3D · LOCAL CLI"
        title="Zoth Comfy Cloud Foundry"
        subtitle="Zero-dependency Python CLI & 8-preset workflow configurator connecting Zoth projects to Comfy Cloud Partner Nodes (FLUX.2 Pro, FLUX.1 Kontext Pro, Partner Video Loops) with zero local GPU VRAM required."
        version="1.2.0"
        variant="bayer-field"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
