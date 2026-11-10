import React, { useState, useEffect } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Stack,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BoltIcon from '@mui/icons-material/Bolt';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const BUILTIN_TEMPLATES = [
  { id: 'hermes-sprig', name: 'Sprig Organic Drops (Uncommon Web Braille Hero)' },
  { id: 'zoth-enclave', name: 'Sovereign AI Enclave (Dark Gold + Bayer Dither)' },
  { id: 'protocol-docs', name: 'Zero-Egress Protocol Spec (TUI / Monospace)' },
  { id: 'ivory-atelier', name: 'Editorial Alabaster Atelier (Light Mode Alchemist)' },
];

function buildClientSideHtml({ idea, templateId, accent }) {
  const safeTitle = (idea || 'Sovereign Web Launch').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const isLight = templateId === 'ivory-atelier';
  const bg = isLight ? '#FAF7F0' : '#08080C';
  const fg = isLight ? '#141413' : '#EDEFF2';
  const cardBg = isLight ? '#FFFFFF' : '#10121A';
  const border = isLight ? 'rgba(184,134,11,0.28)' : 'rgba(212,175,55,0.28)';
  const brailleStrip = '⠁⠃⠇⠏⠟⠿⡿⣿⢿⣻জিৎ :: ░▒▓█ UNCOMMON-WEB × ZOTH-FOUNDRY █▓▒░ :: ⣿⡿⠿⠟⠏⠇⠃⠁';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bg};
      color: ${fg};
      font-family: system-ui, -apple-system, sans-serif;
      padding: 28px;
      line-height: 1.55;
    }
    .braille-bar {
      font-family: ui-monospace, "JetBrains Mono", monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      color: ${accent};
      padding: 8px 12px;
      border: 1px solid ${border};
      border-radius: 8px;
      background: ${cardBg};
      margin-bottom: 24px;
      overflow: hidden;
      white-space: nowrap;
    }
    .hero {
      padding: 32px;
      border-radius: 16px;
      background: ${cardBg};
      border: 1px solid ${border};
      box-shadow: 0 18px 40px rgba(0,0,0,0.25);
    }
    .badge {
      display: inline-block;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      font-weight: 800;
      color: ${accent};
      border: 1px solid ${accent};
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 14px;
    }
    h1 {
      font-size: clamp(1.6rem, 3vw, 2.3rem);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p.lead {
      opacity: 0.82;
      max-width: 620px;
      margin-bottom: 22px;
    }
    .cta {
      display: inline-block;
      background: ${accent};
      color: #08080B;
      font-family: ui-monospace, monospace;
      font-weight: 800;
      font-size: 13px;
      padding: 11px 20px;
      border-radius: 8px;
      text-decoration: none;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-top: 20px;
    }
    .card {
      padding: 16px;
      border-radius: 12px;
      background: ${cardBg};
      border: 1px solid ${border};
    }
    .card h3 {
      font-size: 14px;
      color: ${accent};
      margin-bottom: 6px;
      font-family: ui-monospace, monospace;
    }
    .card p {
      font-size: 13px;
      opacity: 0.78;
    }
  </style>
</head>
<body>
  <div class="braille-bar">${brailleStrip}</div>
  <section class="hero">
    <span class="badge">TEMPLATE: ${(templateId || 'auto-matched').toUpperCase()} · ZERO-EGRESS BUILD</span>
    <h1>${safeTitle}</h1>
    <p class="lead">Synthesized in-browser with Uncommon Web Unicode Braille telemetry, Ordered Bayer dither surfaces, and responsive Bento architecture.</p>
    <a class="cta" href="#launch">Launch Interactive Experience →</a>
    <div class="grid">
      <div class="card">
        <h3>01 // SUB-PIXEL BRAILLE</h3>
        <p>Unicode U+2800 2×4 density matrix calibrated for 60fps telemetry headers.</p>
      </div>
      <div class="card">
        <h3>02 // AEO SCHEMA GRAPH</h3>
        <p>Pre-wired JSON-LD SoftwareApplication + FAQPage graph for instant citation.</p>
      </div>
      <div class="card">
        <h3>03 // EDGE DEPLOY READY</h3>
        <p>Single-file zero-dependency bundle ready for Netlify or local daemon :8092.</p>
      </div>
    </div>
  </section>
</body>
</html>`;
}

export default function ZothFoundryGodModeTool() {
  const [idea, setIdea] = useState('Sprig Neighborhood Pantry — 15-Minute Organic Drops');
  const [templateId, setTemplateId] = useState('hermes-sprig');
  const [accent, setAccent] = useState('#D4AF37');
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState(() => ({
    mode: 'client-synth',
    html: buildClientSideHtml({
      idea: 'Sprig Neighborhood Pantry — 15-Minute Organic Drops',
      templateId: 'hermes-sprig',
      accent: '#D4AF37',
    }),
  }));

  useEffect(() => {
    fetch('/api/studio/webgen/templates')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.templates) && d.templates.length > 0) {
          setTemplates(d.templates);
        }
      })
      .catch(() => {});
    runQuickBuild(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runQuickBuild(deployNow = false) {
    setLoading(true);
    const fallbackHtml = buildClientSideHtml({ idea, templateId, accent });
    try {
      const res = await fetch('/api/studio/webgen/oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          templateId: templateId || undefined,
          shader: 'braille',
          accent,
          deploy: Boolean(deployNow),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.html) {
          setResult({ ...data, mode: 'daemon-8092' });
          setLoading(false);
          return;
        }
      }
    } catch (_) {
      // Fall back to deterministic in-browser synthesis when daemon :8092 is offline
    }
    setResult({
      mode: 'client-synth',
      html: fallbackHtml,
    });
    setLoading(false);
  }

  const handleCopyHtml = () => {
    if (!result?.html) return;
    navigator.clipboard?.writeText(result.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadHtml = () => {
    if (!result?.html) return;
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(templateId || 'zoth-quicksite').toLowerCase()}-starter.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: '#0A0B10',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        color: '#F8FAFC',
      }}
    >
      <SovereignEyebrow accent="#D4AF37" right="Autonomous Web">
        {"zoth-webgen"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"zoth-webgen"}
        eyebrow={"Autonomous Web"}
        caption={"Zoth QuickSite Starter"}
        label={"Zoth QuickSite Starter — Zoth sovereign visualisation"}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label="✦ 100% FREE & OPEN ACCESS"
              size="small"
              sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid #10B981' }}
            />
            <Chip
              label="SIMPLE 3-STEP STATIC LAUNCHER (:8092 + CLIENT ENGINE)"
              size="small"
              sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
            />
            <Chip
              label="⣿ U+2800 BRAILLE HERO READY"
              size="small"
              sx={{ fontFamily: mono, fontSize: '0.64rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399' }}
            />
          </Stack>
          <Typography variant="h6" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400, color: '#F5E6AB' }}>
            Zoth QuickSite Starter Foundry
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
              textTransform: 'none',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
            sx={{
              borderColor: '#10B981',
              color: '#10B981',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
              textTransform: 'none',
              '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
            }}
          >
            ◎ Solana Tip
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyHtml}
            sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: 'rgba(212,175,55,0.4)', color: '#F5E6AB', textTransform: 'none' }}
          >
            {copied ? 'Copied HTML' : 'Copy HTML'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadHtml}
            sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: 'rgba(56,189,248,0.4)', color: '#38BDF8', textTransform: 'none' }}
          >
            Download .HTML
          </Button>
          <Button
            size="small"
            variant="contained"
            href="/tools/bolt.diy"
            startIcon={<BoltIcon />}
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.72rem', textTransform: 'none' }}
          >
            Switch to Zoth Bolt
          </Button>
          {isLocalRuntime() && (
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8092"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', textTransform: 'none' }}
          >
            Open :8092
          </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, bgcolor: '#10121B', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TextField
            size="small"
            label="1. Site Title / Short Idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#07080D', color: '#FFF', fontSize: '0.82rem' } }}
          />

          <FormControl size="small">
            <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.72rem' }}>2. Pick Starter Template</InputLabel>
            <Select
              value={templateId}
              label="2. Pick Starter Template"
              onChange={(e) => setTemplateId(e.target.value)}
              sx={{ bgcolor: '#07080D', color: '#FFF', fontFamily: mono, fontSize: '0.74rem' }}
            >
              <MenuItem value="">✨ Auto-Match Template</MenuItem>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id} sx={{ fontFamily: mono, fontSize: '0.74rem' }}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8' }}>3. Accent:</Typography>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              style={{ width: 44, height: 32, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#D4AF37' }}>{accent}</Typography>
          </Box>

          <Button
            variant="contained"
            disabled={loading}
            startIcon={<AutoAwesomeIcon />}
            onClick={() => runQuickBuild(false)}
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.75rem', textTransform: 'none' }}
          >
            Synthesize Live Starter Page
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            startIcon={<RocketLaunchIcon />}
            onClick={() => runQuickBuild(true)}
            sx={{ bgcolor: '#38BDF8', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.75rem', textTransform: 'none' }}
          >
            1-Click Deploy to Netlify
          </Button>

          {loading && <LinearProgress sx={{ bgcolor: 'rgba(212,175,55,0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#D4AF37' } }} />}

          {result?.deploy?.liveUrl && (
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)' }}>
              <a
                href={result.deploy.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: mono, fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}
              >
                ✅ Live: {result.deploy.liveUrl} ↗
              </a>
            </Box>
          )}
        </Box>

        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.25)', minHeight: 460, bgcolor: '#05060A' }}>
          <iframe
            title="QuickSite Starter Preview"
            srcDoc={result?.html || buildClientSideHtml({ idea, templateId, accent })}
            style={{ width: '100%', height: 460, border: 'none', background: '#08080B' }}
          />
        </Box>
      </Box>
    </Paper>
  );
}
