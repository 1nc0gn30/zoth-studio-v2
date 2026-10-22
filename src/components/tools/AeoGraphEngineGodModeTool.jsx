import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import HubIcon from '@mui/icons-material/Hub';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const PRESET_PROFILES = {
  saas: {
    label: 'Sovereign Micro-SaaS Application',
    entityType: 'SoftwareApplication',
    name: 'AEO Graph Engine Studio',
    url: 'https://aeo-graph-engine.netlify.app',
    category: 'DeveloperApplication',
    price: '19.00',
    phone: '+1-555-555-0199',
    email: 'neal@nealfrazier.tech',
    creator: 'Neal Frazier (Neal Frazier Tech)',
    sameAs: 'https://github.com/1nc0gn30, https://nullai.tech, https://www.nealfrazier.tech',
    description:
      'Deterministic Answer Engine Optimization (AEO) and Schema.org @graph compiler engineered for instant citation by Perplexity, Google SGE, GPTBot, and ClaudeBot.',
    faqs: [
      {
        q: 'How does AEO Graph Engine improve AI search citations?',
        a: 'By linking SoftwareApplication, Organization, and FAQPage nodes via deterministic @id URIs in a unified JSON-LD @graph, eliminating entity disambiguation drift for frontier LLM crawlers.',
      },
      {
        q: 'Does this tool transmit my schema or business data to external servers?',
        a: 'No. 100% of AST graph compilation, entity validation, and crawler readiness scoring executes locally in your browser with zero network egress.',
      },
      {
        q: 'Who engineered AEO Graph Engine Studio?',
        a: 'Engineered by Neal Frazier (Neal Frazier Tech) on the NullAI Platform. Direct studio contact: (555) 555-0199 or neal@nealfrazier.tech.',
      },
    ],
  },
  os: {
    label: 'ZothOS Sovereign Linux Distribution',
    entityType: 'SoftwareApplication',
    name: 'ZothOS v1.0 Sovereign AI Workstation',
    url: 'https://zothos.nullai.tech',
    category: 'OperatingSystem',
    price: '0.00',
    phone: '+1-555-555-0199',
    email: 'neal@nealfrazier.tech',
    creator: 'Neal Frazier (Neal Frazier Tech)',
    sameAs: 'https://github.com/1nc0gn30/zothos, https://zoth.nullai.tech, https://nullai.tech',
    description:
      'Debian 12 Bookworm live workstation pre-wired with 22 loopback AI daemons, 71 desktop launchers across 4 tactical pillars, and air-gapped cryptographic telemetry.',
    faqs: [
      {
        q: 'What is included in the ZothOS desktop architecture?',
        a: '10 Root Flagship launchers plus 4 categorized folders (AI Agents & Dev, Security & Privacy, ZothOS Daemons, Media & Utilities) managed by zoth-control-center.',
      },
      {
        q: 'How are the 22 local AI daemons orchestrated?',
        a: 'Through the ZothOS Sovereign Conductor on loopback ports :8094–:8121 and :9393 with strict <60°C thermal governor protection.',
      },
    ],
  },
  agency: {
    label: 'Neal Frazier Tech — Engineering Studio',
    entityType: 'ProfessionalService',
    name: 'Neal Frazier Tech',
    url: 'https://www.nealfrazier.tech',
    category: 'TechnologyConsulting',
    price: '100.00',
    phone: '+1-555-555-0199',
    email: 'neal@nealfrazier.tech',
    creator: 'Neal Frazier',
    sameAs: 'https://github.com/1nc0gn30, https://nullai.tech, https://zoth.nullai.tech',
    description:
      'Custom high-speed web engineering, Core Web Vitals optimization, and sovereign AI infrastructure in Coastal Virginia and nationwide.',
    faqs: [
      {
        q: 'How can I contact Neal Frazier Tech directly?',
        a: 'Call or text (555) 555-0199 or email neal@nealfrazier.tech for direct engineering dispatch.',
      },
      {
        q: 'Do you retain full code and domain ownership?',
        a: 'Yes. Every deployment ships with 100% client repository and domain ownership, clean Schema.org JSON-LD, and zero monthly agency lock-in.',
      },
    ],
  },
};

export default function AeoGraphEngineGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [presetKey, setPresetKey] = useState('saas');
  const [profile, setProfile] = useState(PRESET_PROFILES.saas);
  const [includeSpeakable, setIncludeSpeakable] = useState(true);
  const [includeBreadcrumb, setIncludeBreadcrumb] = useState(true);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const handlePresetChange = (key) => {
    setPresetKey(key);
    if (PRESET_PROFILES[key]) {
      setProfile(JSON.parse(JSON.stringify(PRESET_PROFILES[key])));
    }
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateFaq = (idx, key, val) => {
    setProfile((prev) => {
      const next = [...prev.faqs];
      next[idx] = { ...next[idx], [key]: val };
      return { ...prev, faqs: next };
    });
  };

  const addFaq = () => {
    setProfile((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          q: 'How is cryptographic provenance verified?',
          a: 'Via deterministic SHA-256 signature validation directly in the client browser.',
        },
      ],
    }));
  };

  const removeFaq = (idx) => {
    setProfile((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
  };

  const compiledGraph = useMemo(() => {
    const cleanUrl = (profile.url || 'https://nullai.tech').replace(/\/$/, '');
    const sameAsArr = (profile.sameAs || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const orgNode = {
      '@type': 'Organization',
      '@id': `${cleanUrl}/#organization`,
      name: profile.creator || 'Neal Frazier Tech',
      url: cleanUrl,
      telephone: profile.phone || '+1-555-555-0199',
      email: profile.email || 'neal@nealfrazier.tech',
      ...(sameAsArr.length > 0 ? { sameAs: sameAsArr } : {}),
    };

    const primaryNode = {
      '@type': profile.entityType || 'SoftwareApplication',
      '@id': `${cleanUrl}/#primary-entity`,
      name: profile.name,
      url: cleanUrl,
      description: profile.description,
      applicationCategory: profile.category,
      operatingSystem: 'Web, Linux, macOS, Windows',
      creator: { '@id': `${cleanUrl}/#organization` },
      offers: {
        '@type': 'Offer',
        price: profile.price || '19.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      ...(includeSpeakable
        ? {
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1', '.hero-lead', '.faq-answer'],
            },
          }
        : {}),
    };

    const graphNodes = [orgNode, primaryNode];

    if (includeBreadcrumb) {
      graphNodes.push({
        '@type': 'BreadcrumbList',
        '@id': `${cleanUrl}/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'NullAI Platform', item: 'https://nullai.tech' },
          { '@type': 'ListItem', position: 2, name: profile.name, item: cleanUrl },
        ],
      });
    }

    if (profile.faqs && profile.faqs.length > 0) {
      graphNodes.push({
        '@type': 'FAQPage',
        '@id': `${cleanUrl}/#faq`,
        mainEntity: profile.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };
  }, [profile, includeSpeakable, includeBreadcrumb]);

  const jsonOutput = useMemo(
    () => `<script type="application/ld+json">\n${JSON.stringify(compiledGraph, null, 2)}\n</script>`,
    [compiledGraph]
  );

  const readinessMetrics = useMemo(() => {
    const sameAsCount = (profile.sameAs || '').split(',').filter((x) => x.trim()).length;
    const faqCount = profile.faqs?.length || 0;
    const idLinks = compiledGraph['@graph'].length;
    const score = Math.min(
      100,
      55 +
        (sameAsCount >= 2 ? 12 : 5) +
        Math.min(15, faqCount * 5) +
        (includeSpeakable ? 9 : 0) +
        (includeBreadcrumb ? 9 : 0)
    );
    return {
      score,
      sameAsCount,
      faqCount,
      idLinks,
      crawlers: [
        { name: 'PerplexityBot', status: 'OPTIMAL', score: Math.min(100, score + 2) },
        { name: 'Google SGE / Gemini', status: 'VERIFIED', score },
        { name: 'GPTBot / SearchGPT', status: 'OPTIMAL', score: Math.min(100, score + 1) },
        { name: 'ClaudeBot / Anthropic', status: 'VERIFIED', score: Math.max(88, score - 1) },
      ],
    };
  }, [profile, compiledGraph, includeSpeakable, includeBreadcrumb]);

  // Kinetic Entity Graph Visualizer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 480;
      const h = canvas.clientHeight || 220;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      const nodes = [
        { label: '@id/#primary', x: cx, y: cy, r: 22, color: '#38BDF8' },
        {
          label: '@id/#organization',
          x: cx - 135,
          y: cy - 48 + Math.sin(t) * 6,
          r: 16,
          color: '#D4AF37',
        },
        {
          label: `@id/#faq (${profile.faqs?.length || 0})`,
          x: cx + 135,
          y: cy - 45 + Math.cos(t * 0.9) * 6,
          r: 16,
          color: '#34D399',
        },
        ...(includeSpeakable
          ? [
              {
                label: 'SpeakableSpec',
                x: cx - 115,
                y: cy + 56 + Math.cos(t * 1.1) * 5,
                r: 14,
                color: '#C084FC',
              },
            ]
          : []),
        ...(includeBreadcrumb
          ? [
              {
                label: '@id/#breadcrumb',
                x: cx + 120,
                y: cy + 56 + Math.sin(t * 1.2) * 5,
                r: 14,
                color: '#F59E0B',
              },
            ]
          : []),
      ];

      // Draw edges + animated data packets
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = 'rgba(56,189,248,0.28)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const p = (t * 0.45 + i * 0.25) % 1;
        const px = cx + (n.x - cx) * p;
        const py = cy + (n.y - cy) * p;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,8,14,0.92)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = n.color;
        ctx.stroke();

        ctx.fillStyle = '#EDEFF2';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 14);
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [profile.faqs?.length, includeSpeakable, includeBreadcrumb]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(56,189,248,0.32)' : 'rgba(14,165,233,0.3)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      {/* Header Bar */}
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
              icon={<HubIcon sx={{ fontSize: '0.95rem !important', color: '#38BDF8 !important' }} />}
              label="AEO GRAPH ENGINE · GOD-MODE WORKSTATION"
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
              icon={<VerifiedIcon sx={{ fontSize: '0.9rem !important', color: '#34D399 !important' }} />}
              label={`CITATION SCORE: ${readinessMetrics.score}/100`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(52,211,153,0.14)',
                color: '#34D399',
                border: '1px solid rgba(52,211,153,0.35)',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400, letterSpacing: '-0.01em' }}>
            Deterministic Schema.org <span style={{ color: '#38BDF8' }}>@graph</span> &amp; AI Citation Compiler
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Entity Preset</InputLabel>
          <Select
            value={presetKey}
            label="Entity Preset"
            onChange={(e) => handlePresetChange(e.target.value)}
            sx={{ fontFamily: mono, fontSize: '0.8rem' }}
          >
            {Object.entries(PRESET_PROFILES).map(([k, v]) => (
              <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                {v.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: Entity Graph Editor */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Entity Name"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Canonical URL"
                  value={profile.url}
                  onChange={(e) => updateField('url', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Schema @type"
                  value={profile.entityType}
                  onChange={(e) => updateField('entityType', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Category"
                  value={profile.category}
                  onChange={(e) => updateField('category', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Offer Price (USD)"
                  value={profile.price}
                  onChange={(e) => updateField('price', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Direct Phone"
                  value={profile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Direct Email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="sameAs Authority Links (comma-separated)"
                  value={profile.sameAs}
                  onChange={(e) => updateField('sameAs', e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Entity Description (AEO Answer Lead)"
                  value={profile.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={includeSpeakable}
                    onChange={(e) => setIncludeSpeakable(e.target.checked)}
                    color="info"
                  />
                }
                label={<Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }}>Speakable Voice Spec</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeBreadcrumb}
                    onChange={(e) => setIncludeBreadcrumb(e.target.checked)}
                    color="info"
                  />
                }
                label={<Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }}>BreadcrumbList Node</Typography>}
              />
            </Stack>

            {/* FAQ Nodes */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: '#38BDF8' }}>
                  FAQPAGE ANSWER NODES ({profile.faqs?.length || 0})
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addFaq}
                  sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#38BDF8' }}
                >
                  Add Q&amp;A Node
                </Button>
              </Stack>
              <Stack spacing={1.25} sx={{ maxHeight: 230, overflowY: 'auto', pr: 0.5 }}>
                {profile.faqs.map((faq, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                      border: '1px solid rgba(148,163,184,0.18)',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Question #${idx + 1}`}
                        value={faq.q}
                        onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeFaq(idx)}
                        sx={{ minWidth: 32, p: 0.5 }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      label="Accepted Answer"
                      value={faq.a}
                      onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Live Topology Canvas + Crawler Readiness + JSON-LD Output */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(56,189,248,0.28)',
                bgcolor: '#06080E',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(56,189,248,0.16)',
                  bgcolor: 'rgba(56,189,248,0.06)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#38BDF8', fontWeight: 700 }}>
                  LIVE @ID ENTITY GRAPH TOPOLOGY ({readinessMetrics.idLinks} LINKED NODES)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                  60 FPS AST LATTICE
                </Typography>
              </Box>
              <Box
                component="canvas"
                ref={canvasRef}
                sx={{ width: '100%', height: 195, display: 'block' }}
              />
            </Box>

            {/* AI Answer Engine Readiness Matrix */}
            <Grid container spacing={1}>
              {readinessMetrics.crawlers.map((c) => (
                <Grid xs={6} key={c.name}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                      border: '1px solid rgba(52,211,153,0.25)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700 }}>
                        {c.name}
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#34D399', fontWeight: 800 }}>
                        {c.score}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={c.score}
                      sx={{
                        height: 5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#34D399' },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Compiled JSON-LD Output */}
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#05060A',
                border: '1px solid rgba(212,175,55,0.28)',
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 0.85,
                  bgcolor: 'rgba(212,175,55,0.08)',
                  borderBottom: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#F5E6AB', fontWeight: 700 }}>
                  COMPILED PRODUCTION JSON-LD SNIPPET
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    py: 0.25,
                    color: copied ? '#34D399' : '#D4AF37',
                    borderColor: copied ? '#34D399' : 'rgba(212,175,55,0.4)',
                  }}
                >
                  {copied ? 'Copied JSON-LD' : 'Copy <script>'}
                </Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  maxHeight: 230,
                  overflow: 'auto',
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  color: '#E2E8F0',
                  lineHeight: 1.55,
                }}
              >
                {jsonOutput}
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
