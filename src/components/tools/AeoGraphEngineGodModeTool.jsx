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
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedIcon from '@mui/icons-material/Verified';
import HubIcon from '@mui/icons-material/Hub';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import SyncIcon from '@mui/icons-material/Sync';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const headingSans = '"Space Grotesk", "Inter", system-ui, -apple-system, sans-serif';

const PRESET_PROFILES = {
  saas: {
    label: 'Open-Access Developer Workbench',
    entityType: 'SoftwareApplication',
    name: 'AEO Graph Engine & Studio',
    url: 'https://aeo-graph-engine.netlify.app',
    category: 'DeveloperApplication',
    price: '0.00',
    email: 'architect@nullai.tech',
    creator: 'Neal Frazier Tech (@1nc0gn30)',
    sameAs: 'https://github.com/1nc0gn30/aeo-graph-engine, https://nullai.tech',
    description:
      'Zero-dependency Python and browser compiler for linked Schema.org JSON-LD @graph ontologies, llms.txt manifests, ai.txt policies, and 12 MCP tools.',
    faqs: [
      {
        q: 'How does AEO Graph Engine improve AI search citations?',
        a: 'By linking Organization, WebSite, SoftwareApplication, and FAQPage nodes via canonical @id URIs alongside llms.txt and explicit crawler directives.',
      },
      {
        q: 'Does the engine require external API keys or paywalls?',
        a: 'No. Every generator, validator, framework exporter, and local MCP server runs 100% open-access on local loopback with zero paywalls.',
      },
      {
        q: 'Which MCP tools are exposed by the Python server?',
        a: '12 stdio JSON-RPC 2.0 tools including aeo_scan_site, aeo_generate_bundle, aeo_validate, aeo_extract_knowledge_graph, and aeo_generate_claim_matrix.',
      },
    ],
  },
  os: {
    label: 'ZothOS Local AI Workstation',
    entityType: 'SoftwareApplication',
    name: 'ZothOS Sovereign Linux Workstation',
    url: 'https://zoth.nullai.tech',
    category: 'OperatingSystem',
    price: '0.00',
    email: 'architect@nullai.tech',
    creator: 'Neal Frazier Tech (@1nc0gn30)',
    sameAs: 'https://github.com/1nc0gn30/zoth-os, https://zoth.nullai.tech, https://nullai.tech',
    description:
      'Debian-based local workstation wired with loopback AI daemons, offline cryptographic tooling, and deterministic CLI/MCP utilities.',
    faqs: [
      {
        q: 'How are local ZothOS tool daemons isolated?',
        a: 'Services bind strictly to 127.0.0.1 loopback with validated loopback CORS and zero unsolicited cloud telemetry.',
      },
      {
        q: 'How do I launch AEO Graph Engine locally?',
        a: 'Run python3 server.py --port 8127 or aeo-graph-engine serve --port 8127 to expose both the browser Studio and REST APIs.',
      },
    ],
  },
  agency: {
    label: 'Neal Frazier Tech — Engineering Studio',
    entityType: 'ProfessionalService',
    name: 'Neal Frazier Tech',
    url: 'https://nealfrazier.tech',
    category: 'TechnologyConsulting',
    price: '0.00',
    email: 'architect@nullai.tech',
    creator: 'Neal Frazier (@1nc0gn30)',
    sameAs: 'https://github.com/1nc0gn30, https://nullai.tech, https://nealfrazier.tech',
    description:
      'High-speed web engineering, Core Web Vitals optimization, Schema.org knowledge graphs, and local-first AI tooling.',
    faqs: [
      {
        q: 'Do clients retain full repository and domain ownership?',
        a: 'Yes. Deployments ship with clean Schema.org JSON-LD, llms.txt manifests, and zero vendor lock-in.',
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
  const [outputTab, setOutputTab] = useState('jsonld');
  const [copied, setCopied] = useState(false);
  const [daemonStatus, setDaemonStatus] = useState({ reachable: false, version: null, syncedScore: null });
  const [autoDomain, setAutoDomain] = useState('');
  const [autoAgent, setAutoAgent] = useState('agy_bridge');
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoResult, setAutoResult] = useState(null);

  const canvasRef = useRef(null);

  // Theme-aware tokens (Editorial Ivory Light & Obsidian Noir Dark)
  const palette = useMemo(
    () => ({
      paperBg: isDark ? 'rgba(10,12,18,0.94)' : '#FFFFFF',
      cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#F8F5EE',
      codeBg: isDark ? '#07090F' : '#F4F1EA',
      codeHeaderBg: isDark ? 'rgba(212,175,55,0.09)' : 'rgba(138,97,0,0.08)',
      codeText: isDark ? '#E2E8F0' : '#1E293B',
      border: isDark ? 'rgba(56,189,248,0.28)' : 'rgba(3,105,161,0.24)',
      goldBorder: isDark ? 'rgba(212,175,55,0.32)' : 'rgba(138,97,0,0.28)',
      accentSky: isDark ? '#38BDF8' : '#0369A1',
      accentEmerald: isDark ? '#34D399' : '#047857',
      accentGold: isDark ? '#E2BE4C' : '#8A6100',
      canvasBg: isDark ? '#070A12' : '#FAF7F0',
      canvasNodeFill: isDark ? '#0E1320' : '#FFFFFF',
      canvasLabel: isDark ? '#EDEFF2' : '#141821',
      canvasEdge: isDark ? 'rgba(56,189,248,0.34)' : 'rgba(3,105,161,0.30)',
      progressTrack: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
    }),
    [isDark]
  );

  // Probe optional local :8127 daemon cleanly on mount
  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    fetch('http://127.0.0.1:8127/health', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && d.status === 'healthy') {
          setDaemonStatus((prev) => ({ ...prev, reachable: true, version: d.version || '2.1.0' }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

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
          q: 'How is structured data verified?',
          a: 'Via deterministic Schema.org @graph validation and JSON-LD syntax linting.',
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
    const cleanUrl = (profile.url || '').trim().replace(/\/$/, '') || 'https://example.com';
    const sameAsArr = (profile.sameAs || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const orgNode = {
      '@type': 'Organization',
      '@id': `${cleanUrl}/#organization`,
      name: (profile.creator || '').trim() || (profile.name || '').trim(),
      url: cleanUrl,
      ...(profile.email?.trim() ? { email: profile.email.trim() } : {}),
      ...(sameAsArr.length > 0 ? { sameAs: sameAsArr } : {}),
    };

    const primaryNode = {
      '@type': (profile.entityType || '').trim() || 'SoftwareApplication',
      '@id': `${cleanUrl}/#primary-entity`,
      name: (profile.name || '').trim(),
      url: cleanUrl,
      description: (profile.description || '').trim(),
      applicationCategory: (profile.category || '').trim() || 'DeveloperApplication',
      operatingSystem: 'Web, Linux, macOS, Windows',
      creator: { '@id': `${cleanUrl}/#organization` },
      offers: {
        '@type': 'Offer',
        price: (profile.price || '').trim() || '0.00',
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanUrl}/` },
          { '@type': 'ListItem', position: 2, name: (profile.name || 'App').trim(), item: cleanUrl },
        ],
      });
    }

    const validFaqs = (profile.faqs || []).filter((f) => f.q?.trim() && f.a?.trim());
    if (validFaqs.length > 0) {
      graphNodes.push({
        '@type': 'FAQPage',
        '@id': `${cleanUrl}/#faq`,
        mainEntity: validFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q.trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a.trim(),
          },
        })),
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };
  }, [profile, includeSpeakable, includeBreadcrumb]);

  const outputs = useMemo(() => {
    const cleanUrl = (profile.url || 'https://example.com').trim().replace(/\/$/, '');
    const name = (profile.name || 'Unnamed Entity').trim();
    const desc = (profile.description || '').trim();
    const validFaqs = (profile.faqs || []).filter((f) => f.q?.trim() && f.a?.trim());

    const jsonld = `<script type="application/ld+json">\n${JSON.stringify(compiledGraph, null, 2)}\n</script>`;

    const llms = [
      `# ${name}`,
      '',
      `> ${desc || 'Structured entity summary.'}`,
      '',
      `Official Website: ${cleanUrl}/`,
      '',
      '## Canonical Machine Endpoints',
      `- [Schema.org @graph](${cleanUrl}/schema-graph.json): Linked entity graph`,
      `- [AI Policy](${cleanUrl}/ai.txt): Citation and access manifest`,
      `- [Crawler Rules](${cleanUrl}/robots.txt): AI search crawler directives`,
      ...(validFaqs.length
        ? [
            '',
            '## Frequently Asked Questions',
            ...validFaqs.flatMap((f) => [`### Q: ${f.q.trim()}`, f.a.trim(), '']),
          ]
        : []),
    ].join('\n');

    const aiTxt = [
      `# ai.txt — Machine & AI Agent Access Manifest`,
      `User-Agent: *`,
      `Allow: /`,
      `Canonical-URL: ${cleanUrl}/`,
      `Publisher: ${(profile.creator || name).trim()}`,
      `Schema-Org-Graph: ${cleanUrl}/schema-graph.json`,
      `LLMs-Txt: ${cleanUrl}/llms.txt`,
      `Citation-Required: True`,
    ].join('\n');

    const robots = [
      `# robots.txt for ${name}`,
      `User-agent: *`,
      `Allow: /`,
      '',
      `User-agent: GPTBot`,
      `Allow: /`,
      '',
      `User-agent: OAI-SearchBot`,
      `Allow: /`,
      '',
      `User-agent: ClaudeBot`,
      `Allow: /`,
      '',
      `User-agent: PerplexityBot`,
      `Allow: /`,
      '',
      `User-agent: Applebot-Extended`,
      `Allow: /`,
      '',
      `Sitemap: ${cleanUrl}/sitemap.xml`,
    ].join('\n');

    return { jsonld, llms, aiTxt, robots };
  }, [profile, compiledGraph]);

  // Honest 0-100 validation score (no artificial 60/100 or 88% floor!)
  const readinessMetrics = useMemo(() => {
    const hasName = Boolean(profile.name?.trim());
    const hasValidUrl = /^https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test((profile.url || '').trim());
    const hasDesc = (profile.description || '').trim().length >= 30;
    const hasCreator = Boolean(profile.creator?.trim());
    const sameAsCount = (profile.sameAs || '').split(',').filter((x) => x.trim().startsWith('http')).length;
    const validFaqCount = (profile.faqs || []).filter((f) => f.q?.trim() && f.a?.trim()).length;

    let score = 0;
    if (hasName) score += 18;
    if (hasValidUrl) score += 18;
    if (hasDesc) score += 18;
    if (hasCreator) score += 10;
    score += Math.min(12, sameAsCount * 6);
    score += Math.min(14, validFaqCount * 7);
    if (includeSpeakable) score += 5;
    if (includeBreadcrumb) score += 5;

    const idLinks = compiledGraph['@graph'].length;
    const issues = [];
    if (!hasName) issues.push('Missing Entity Name');
    if (!hasValidUrl) issues.push('Canonical URL must be a valid https:// domain');
    if (!hasDesc) issues.push('Description under 30 chars');
    if (validFaqCount === 0) issues.push('Add at least 1 FAQPage Q&A pair');

    return {
      score: Math.min(100, score),
      issues,
      idLinks,
      crawlers: [
        { name: 'PerplexityBot', score: Math.min(100, Math.round(score * (validFaqCount > 0 ? 1 : 0.82))) },
        { name: 'Google AI Overviews', score },
        { name: 'GPTBot / Search', score: Math.min(100, Math.round(score * (hasValidUrl ? 1 : 0.75))) },
        { name: 'ClaudeBot', score: Math.min(100, Math.round(score * (hasDesc ? 1 : 0.8))) },
      ],
    };
  }, [profile, compiledGraph, includeSpeakable, includeBreadcrumb]);

  const validateOnLocalDaemon = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8127/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: compiledGraph }),
      });
      if (res.ok) {
        const data = await res.json();
        setDaemonStatus((prev) => ({ ...prev, reachable: true, syncedScore: data.score }));
      }
    } catch {}
  };

  const handleGenerateFromDomain = async () => {
    const target = autoDomain.trim();
    if (!target) {
      setAutoResult({ ok: false, message: 'Enter an existing public domain URL (e.g. https://example.com).' });
      return;
    }
    setAutoLoading(true);
    setAutoResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8127/api/agent/generate-from-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, provider: autoAgent, max_pages: 6 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAutoResult({ ok: false, message: data.error || `HTTP ${res.status}` });
        return;
      }
      const cfg = data.config || {};
      const cs = data.crawl_summary || {};
      const ag = data.agent_execution || {};
      setProfile((prev) => ({
        ...prev,
        name: cfg.site_name || prev.name,
        url: data.origin || (cfg.domain ? `https://${cfg.domain}` : prev.url),
        category: cfg.category || prev.category,
        entityType: cfg.category === 'LocalBusiness' ? 'LocalBusiness' : 'SoftwareApplication',
        creator: cfg.publisher_name || prev.creator,
        sameAs: Array.isArray(cfg.same_as) && cfg.same_as.length ? cfg.same_as.join(', ') : prev.sameAs,
        description: cfg.description || prev.description,
        faqs:
          Array.isArray(cfg.faqs) && cfg.faqs.length
            ? cfg.faqs.map((f) => ({ q: f.question || f.q || '', a: f.answer || f.a || '' }))
            : prev.faqs,
      }));
      setAutoResult({
        ok: true,
        message: `Scraped ${cs.pages_scraped || 0} page(s) (${cs.sitemap_detected ? 'sitemap found' : 'link crawl'}) · Agent: ${ag.used_provider || autoAgent} (${ag.mode || 'done'}). ${ag.notice || ''}`,
      });
    } catch (err) {
      setAutoResult({
        ok: false,
        message: `Local :8127 daemon required for live domain crawling (${err.message}). Start with: python3 server.py --port 8127`,
      });
    } finally {
      setAutoLoading(false);
    }
  };

  // Theme-Aware Entity Graph Canvas (respects prefers-reduced-motion)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let raf;
    let t = 0;

    const render = () => {
      if (!reducedMotion) t += 0.02;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 480;
      const h = canvas.clientHeight || 200;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const validFaqs = (profile.faqs || []).filter((f) => f.q?.trim() && f.a?.trim()).length;

      const nodes = [
        { label: '@id/#primary', x: cx, y: cy, r: 21, color: palette.accentSky },
        { label: '@id/#organization', x: cx - 132, y: cy - 46 + Math.sin(t) * 4, r: 15, color: palette.accentGold },
        ...(validFaqs > 0
          ? [{ label: `@id/#faq (${validFaqs})`, x: cx + 132, y: cy - 44 + Math.cos(t * 0.9) * 4, r: 15, color: palette.accentEmerald }]
          : []),
        ...(includeSpeakable
          ? [{ label: 'SpeakableSpec', x: cx - 114, y: cy + 54 + Math.cos(t * 1.1) * 3, r: 13, color: isDark ? '#C084FC' : '#7E22CE' }]
          : []),
        ...(includeBreadcrumb
          ? [{ label: '@id/#breadcrumb', x: cx + 118, y: cy + 54 + Math.sin(t * 1.2) * 3, r: 13, color: isDark ? '#F59E0B' : '#B45309' }]
          : []),
      ];

      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = palette.canvasEdge;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        if (!reducedMotion) {
          const p = (t * 0.45 + i * 0.25) % 1;
          ctx.beginPath();
          ctx.arc(cx + (n.x - cx) * p, cy + (n.y - cy) * p, 3, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = palette.canvasNodeFill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = n.color;
        ctx.stroke();

        ctx.fillStyle = palette.canvasLabel;
        ctx.font = '600 10.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 14);
      });

      ctx.restore();
      if (!reducedMotion) raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [profile.faqs, includeSpeakable, includeBreadcrumb, palette, isDark]);

  const activeCode = outputs[outputTab] || outputs.jsonld;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownload = () => {
    const fileMap = {
      jsonld: 'schema-graph.html',
      llms: 'llms.txt',
      aiTxt: 'ai.txt',
      robots: 'robots.txt',
    };
    const blob = new Blob([activeCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileMap[outputTab] || 'aeo-artifact.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: palette.paperBg,
        border: `1px solid ${palette.border}`,
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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 0.75 }}>
            <Chip
              icon={<HubIcon sx={{ fontSize: '0.95rem !important', color: `${palette.accentSky} !important` }} />}
              label="AEO GRAPH ENGINE v2.1.0 · WORKSTATION"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: isDark ? 'rgba(56,189,248,0.14)' : 'rgba(3,105,161,0.10)',
                color: palette.accentSky,
                border: `1px solid ${palette.border}`,
              }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '0.9rem !important', color: `${palette.accentEmerald} !important` }} />}
              label={`READINESS: ${readinessMetrics.score}/100`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: isDark ? 'rgba(52,211,153,0.14)' : 'rgba(4,120,87,0.10)',
                color: palette.accentEmerald,
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.35)' : 'rgba(4,120,87,0.3)'}`,
              }}
            />
            {daemonStatus.reachable && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={validateOnLocalDaemon}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  color: palette.accentEmerald,
                  borderColor: palette.accentEmerald,
                }}
              >
                {daemonStatus.syncedScore !== null
                  ? `:8127 Verified (${daemonStatus.syncedScore}/100)`
                  : `Validate on :8127 (v${daemonStatus.version})`}
              </Button>
            )}
          </Stack>
          <Typography
            variant="h5"
            sx={{
              fontFamily: headingSans,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: theme.palette.text.primary,
            }}
          >
            Deterministic Schema.org <span style={{ color: palette.accentSky }}>@graph</span> &amp; Manifest Compiler
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 270 } }}>
          <InputLabel id="aeo-preset-label" sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
            Entity Preset
          </InputLabel>
          <Select
            labelId="aeo-preset-label"
            id="aeo-preset-select"
            value={presetKey}
            label="Entity Preset"
            onChange={(e) => handlePresetChange(e.target.value)}
            sx={{ fontFamily: mono, fontSize: '0.8rem', minHeight: 44 }}
          >
            {Object.entries(PRESET_PROFILES).map(([k, v]) => (
              <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                {v.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <SovereignEyebrow accent={palette.accentGold} right="Autonomous Web">
        {'aeo-graph-engine'}
      </SovereignEyebrow>
      <SovereignBand
        seed="aeo-graph-engine"
        eyebrow="Autonomous Web"
        caption="AEO Graph Engine & Studio"
        label="AEO Graph Engine & Studio — entity graph visualisation"
      />

      {/* Generate For Me from Existing Domain Bar */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: palette.cardBg,
          border: `1px solid ${palette.border}`,
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: palette.accentSky, mb: 1 }}>
          GENERATE FOR ME · AUTO-CRAWL EXISTING DOMAIN &amp; AI AGENT SYNTHESIS
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="Existing Domain URL"
            placeholder="https://example.com"
            value={autoDomain}
            onChange={(e) => setAutoDomain(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateFromDomain();
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 215 } }}>
            <InputLabel id="aeo-auto-agent-label" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
              AI Agent
            </InputLabel>
            <Select
              labelId="aeo-auto-agent-label"
              value={autoAgent}
              label="AI Agent"
              onChange={(e) => setAutoAgent(e.target.value)}
              sx={{ fontFamily: mono, fontSize: '0.78rem', minHeight: 44 }}
            >
              <MenuItem value="agy_bridge">AGY Bridge (:18000)</MenuItem>
              <MenuItem value="agy_cli">AGY CLI</MenuItem>
              <MenuItem value="hermes_cli">Hermes Agent</MenuItem>
              <MenuItem value="ollama_local">Ollama Local</MenuItem>
              <MenuItem value="codex_cli">Codex CLI</MenuItem>
              <MenuItem value="claude_code">Claude Code CLI</MenuItem>
              <MenuItem value="heuristic">Crawl Only (No LLM)</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={autoLoading}
            onClick={handleGenerateFromDomain}
            sx={{
              minHeight: 44,
              minWidth: { xs: '100%', md: 195 },
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.75rem',
              bgcolor: palette.accentGold,
              color: isDark ? '#090B11' : '#FFFFFF',
              '&:hover': { bgcolor: palette.accentGold, filter: 'brightness(1.06)' },
            }}
          >
            {autoLoading ? 'Crawling...' : 'Generate For Me'}
          </Button>
        </Stack>
        {autoResult && (
          <Typography
            sx={{
              mt: 1,
              fontFamily: mono,
              fontSize: '0.72rem',
              color: autoResult.ok ? palette.accentEmerald : isDark ? '#FDA4AF' : '#9F1239',
            }}
          >
            {autoResult.message}
          </Typography>
        )}
      </Box>

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
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Schema @type"
                  value={profile.entityType}
                  onChange={(e) => updateField('entityType', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Category"
                  value={profile.category}
                  onChange={(e) => updateField('category', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Creator / Organization"
                  value={profile.creator}
                  onChange={(e) => updateField('creator', e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Email"
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

            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
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
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: palette.accentSky }}>
                  FAQPAGE ANSWER NODES ({profile.faqs?.length || 0})
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addFaq}
                  sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.accentSky, minHeight: 44 }}
                >
                  Add Q&amp;A Node
                </Button>
              </Stack>
              <Stack spacing={1.25} sx={{ maxHeight: 240, overflowY: 'auto', pr: 0.5 }}>
                {profile.faqs.map((faq, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: palette.cardBg,
                      border: `1px solid ${theme.palette.divider}`,
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
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Remove FAQ item ${idx + 1}`}
                        onClick={() => removeFaq(idx)}
                        sx={{ minWidth: 44, minHeight: 44 }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
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

        {/* Right Column: Theme-Aware Topology Canvas + Readiness + Multi-Artifact Output */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${palette.border}`,
                bgcolor: palette.canvasBg,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${palette.border}`,
                  bgcolor: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(3,105,161,0.06)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: palette.accentSky, fontWeight: 700 }}>
                  LIVE @ID ENTITY GRAPH TOPOLOGY ({readinessMetrics.idLinks} NODES)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: theme.palette.text.secondary }}>
                  {isDark ? 'OBSIDIAN' : 'EDITORIAL IVORY'}
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 195, display: 'block' }} />
            </Box>

            {/* Readiness Matrix */}
            <Grid container spacing={1}>
              {readinessMetrics.crawlers.map((c) => (
                <Grid xs={6} key={c.name}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: palette.cardBg,
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(4,120,87,0.22)'}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700 }}>
                        {c.name}
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.accentEmerald, fontWeight: 800 }}>
                        {c.score}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={c.score}
                      sx={{
                        height: 5,
                        borderRadius: 2,
                        bgcolor: palette.progressTrack,
                        '& .MuiLinearProgress-bar': { bgcolor: palette.accentEmerald },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {readinessMetrics.issues.length > 0 && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(251,113,133,0.12)' : 'rgba(190,18,60,0.08)',
                  border: `1px solid ${isDark ? 'rgba(251,113,133,0.35)' : 'rgba(190,18,60,0.25)'}`,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#FDA4AF' : '#9F1239' }}>
                  Validation Gaps: {readinessMetrics.issues.join(' · ')}
                </Typography>
              </Box>
            )}

            {/* Multi-Artifact Compiled Output (JSON-LD, llms.txt, ai.txt, robots.txt) */}
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: palette.codeBg,
                border: `1px solid ${palette.goldBorder}`,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  bgcolor: palette.codeHeaderBg,
                  borderBottom: `1px solid ${palette.goldBorder}`,
                }}
              >
                <Tabs
                  value={outputTab}
                  onChange={(_, v) => setOutputTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 44,
                      minWidth: 68,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 1.25,
                    },
                  }}
                >
                  <Tab value="jsonld" label="JSON-LD" />
                  <Tab value="llms" label="llms.txt" />
                  <Tab value="aiTxt" label="ai.txt" />
                  <Tab value="robots" label="robots.txt" />
                </Tabs>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={handleCopy}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.7rem',
                      color: copied ? palette.accentEmerald : palette.accentGold,
                      borderColor: copied ? palette.accentEmerald : palette.goldBorder,
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.7rem',
                      color: palette.accentSky,
                      borderColor: palette.border,
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  maxHeight: 240,
                  overflow: 'auto',
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  color: palette.codeText,
                  lineHeight: 1.55,
                }}
              >
                {activeCode}
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
