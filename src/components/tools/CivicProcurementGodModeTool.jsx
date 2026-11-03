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
  TextField,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import { useReality } from '../../context/RealityContext';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

const RFP_OPPORTUNITIES = [
  {
    id: 'hr-757-cyber',
    region: 'Hampton Roads (757) Municipal Enclave',
    solNumber: 'RFP-757-2026-CYBER-09',
    title: 'Zero-Trust Municipal Endpoint & Offline-Capable AI Document Triage',
    naics: '541512 (Computer Systems Design Services)',
    ceilingUsd: 185000,
    complianceRequired: ['NIST SP 800-171', 'CJIS Security Policy v5.9', 'Virginia VITA SEC530'],
    baseWinProb: 78,
  },
  {
    id: 'va-swam-micro',
    region: 'Commonwealth of Virginia eVA Quick-Quote',
    solNumber: 'QQ-EVA-2026-8841',
    title: 'Automated FOIA Redaction & Schema.org Municipal Portal Upgrade',
    naics: '541511 (Custom Computer Programming)',
    ceilingUsd: 48500,
    complianceRequired: ['Section 508 / WCAG 2.1 AA', 'SWaM Small Business Set-Aside', 'Zero Cloud Egress PII'],
    baseWinProb: 86,
  },
  {
    id: 'dod-sbir-phase1',
    region: 'DoD / Navy NSWC Dahlgren & Norfolk',
    solNumber: 'N261-042-SBIR',
    title: 'Tactical Disconnected Linux OS & Binary Decompilation MCP Bridge',
    naics: '541715 (R&D in Physical & Engineering Sciences)',
    ceilingUsd: 250000,
    complianceRequired: ['CMMC Level 2', 'DFARS 252.204-7012', 'SBOM CycloneDX Attestation'],
    baseWinProb: 74,
  },
];

export default function CivicProcurementGodModeTool({ tool }) {
  const { activeTheme } = useReality();
  const toolId = (tool?.id || '').toLowerCase();
  const isProductHuntMode = toolId.includes('producthunt') || toolId === 'zoth-ph';

  const [selectedRfpId, setSelectedRfpId] = useState(RFP_OPPORTUNITIES[0].id);
  const [engineeringHours, setEngineeringHours] = useState(420);
  const [hourlyRateUsd, setHourlyRateUsd] = useState(165);
  const [infraReserveUsd, setInfraReserveUsd] = useState(8500);
  const [activeTab, setActiveTab] = useState(isProductHuntMode ? 2 : 0);
  const [copied, setCopied] = useState(false);

  // Product Hunt Launch Kit State
  const [phProductName, setPhProductName] = useState('Zoth Studio v2.2 — Sovereign AI Arsenal');
  const [phTagline, setPhTagline] = useState('72 zero-egress developer tools & WebGPU workstations in browser');
  const [phTopics, setPhTopics] = useState('Developer Tools, Artificial Intelligence, Open Source, Privacy');
  const [phFirst4HrUpvotes, setPhFirst4HrUpvotes] = useState(185);

  const canvasRef = useRef(null);

  useEffect(() => {
    setActiveTab(isProductHuntMode ? 2 : 0);
  }, [isProductHuntMode]);

  const activeRfp = useMemo(
    () => RFP_OPPORTUNITIES.find((r) => r.id === selectedRfpId) || RFP_OPPORTUNITIES[0],
    [selectedRfpId]
  );

  const bidMath = useMemo(() => {
    const laborTotal = engineeringHours * hourlyRateUsd;
    const totalBid = laborTotal + infraReserveUsd;
    const ceiling = activeRfp.ceilingUsd;
    const underCeilingPct = Math.round(((ceiling - totalBid) / ceiling) * 100);
    const directCost = engineeringHours * 58 + infraReserveUsd * 0.5;
    const netMarginUsd = Math.max(0, totalBid - directCost);
    const netMarginPct = Math.round((netMarginUsd / Math.max(1, totalBid)) * 100);
    const pWin = Math.max(15, Math.min(96, activeRfp.baseWinProb + (underCeilingPct > 8 ? 8 : -12)));

    return {
      laborTotal,
      totalBid,
      ceiling,
      underCeilingPct,
      netMarginUsd,
      netMarginPct,
      pWin,
    };
  }, [engineeringHours, hourlyRateUsd, infraReserveUsd, activeRfp]);

  const phMetrics = useMemo(() => {
    const taglineLen = phTagline.trim().length;
    const projected24hUpvotes = Math.round(phFirst4HrUpvotes * 3.65);
    const projectedComments = Math.round(projected24hUpvotes * 0.28);
    const rankPrediction =
      projected24hUpvotes >= 650
        ? '#1 Product of the Day 🏆'
        : projected24hUpvotes >= 420
        ? 'Top #3 Product of the Day 🥈'
        : 'Top #5 Featured Launch 🚀';
    const taglineScore =
      taglineLen >= 35 && taglineLen <= 60 ? 96 : taglineLen > 60 ? Math.max(50, 96 - (taglineLen - 60) * 3) : 78;

    const launchKitMd = `# PRODUCT HUNT LAUNCH KIT — ${phProductName}
- **Tagline (${taglineLen}/60 chars, Score: ${taglineScore}/100)**: \`${phTagline}\`
- **Topics**: ${phTopics}
- **24h Velocity Forecast**: **${projected24hUpvotes} Upvotes** / **${projectedComments} Maker Replies** → **${rankPrediction}**

---

## 1. Maker's First Comment (Post at 12:01 AM PST)
Hey Product Hunt! 👋 I'm 1nc0gn30 (@1nc0gn30), founder of 1nc0gn30 • NullAI & the NullAI Platform.

Today we're thrilled to launch **${phProductName}** — ${phTagline}.

### ⚡ Why We Built It
Most AI and developer tools trap your data behind cloud paywalls or fake simulation wrappers. Every tool in ${phProductName} executes **100% client-side in your browser** (via WebCrypto, WebGPU WGSL shaders, and WebAssembly) or locally via our zero-egress CLI & MCP servers.

### 🔓 100% Open-Access (Zero Paywalls)
Every tool, export, and CLI package is completely unlocked by default. If you find it useful, you can support ongoing open-source R&D via our optional ☕ Buy Us a Coffee link.

Would love your feedback on which workstation you try first!`;

    return {
      taglineLen,
      taglineScore,
      projected24hUpvotes,
      projectedComments,
      rankPrediction,
      launchKitMd,
    };
  }, [phProductName, phTagline, phTopics, phFirst4HrUpvotes]);

  // 60fps Civic Procurement Radar / Product Hunt Velocity Telemetry Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#05070B';
      ctx.fillRect(0, 0, w, h);

      const barMaxW = w - 260;

      const rows =
        activeTab === 2
          ? [
              {
                label: 'FIRST 4H UPVOTE SURGE',
                val: `${phFirst4HrUpvotes} upvotes`,
                ratio: Math.min(1, phFirst4HrUpvotes / 300),
                color: '#38BDF8',
              },
              {
                label: '24H PROJECTED TOTAL',
                val: `${phMetrics.projected24hUpvotes} (${phMetrics.rankPrediction})`,
                ratio: Math.min(1, phMetrics.projected24hUpvotes / 800),
                color: activeTheme.primary,
              },
              {
                label: 'TAGLINE SCORE (≤60c)',
                val: `${phMetrics.taglineScore}/100 (${phMetrics.taglineLen} chars)`,
                ratio: phMetrics.taglineScore / 100,
                color: '#10B981',
              },
            ]
          : [
              {
                label: 'AGENCY CEILING',
                val: `$${bidMath.ceiling.toLocaleString()}`,
                ratio: bidMath.ceiling / Math.max(bidMath.ceiling, bidMath.totalBid, 1),
                color: '#64748B',
              },
              {
                label: 'PROPOSED BID',
                val: `$${bidMath.totalBid.toLocaleString()}`,
                ratio: bidMath.totalBid / Math.max(bidMath.ceiling, bidMath.totalBid, 1),
                color: activeTheme.primary,
              },
              {
                label: 'NET SOVEREIGN MARGIN',
                val: `$${bidMath.netMarginUsd.toLocaleString()} (${bidMath.netMarginPct}%)`,
                ratio: bidMath.netMarginUsd / Math.max(bidMath.ceiling, bidMath.totalBid, 1),
                color: '#10B981',
              },
            ];

      rows.forEach((r, idx) => {
        const y = 18 + idx * 24;
        ctx.fillStyle = '#94A3B8';
        ctx.font = `700 9.5px ${mono}`;
        ctx.fillText(r.label, 14, y + 11);

        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(165, y, barMaxW, 13);

        ctx.fillStyle = r.color;
        ctx.fillRect(165, y, Math.max(8, barMaxW * r.ratio), 13);

        ctx.fillStyle = '#F5F0E8';
        ctx.fillText(r.val, 175 + barMaxW, y + 11);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTheme, bidMath, activeTab, phFirst4HrUpvotes, phMetrics]);

  const capabilityStatementMd = useMemo(() => {
    return `# CAPABILITY STATEMENT — 1NC0GN30 • NULLAI / NullAI Platform
**Solicitation**: ${activeRfp.solNumber} — ${activeRfp.title}
**Region / Agency**: ${activeRfp.region}
**NAICS Code**: ${activeRfp.naics}
**Architecture**: ZothOS v3.4.0 Zero-Egress Sovereign Enclave (${activeTheme.name})

## 1. Executive Summary & Technical Differentiation
1nc0gn30 • NullAI (@1nc0gn30 • nullai.tech • nullai.tech) delivers offline-capable, zero-egress Linux & AI automation infrastructure engineered for municipal, defense, and enterprise enclaves. All LLM inference (Ollama 127.0.0.1:11434), YARA-X threat scanning, and FOIA document redaction execute 100% on-premises without external cloud telemetry.

## 2. Compliance & Security Matrix
${activeRfp.complianceRequired.map((c) => `- [x] **${c}** — Verified via ZothOS Ring-0 / Ring-2 enclave isolation & default-deny UFW posture.`).join('\n')}

## 3. Fixed-Price Cost Proposal Summary
- **Engineering & Integration (${engineeringHours} hrs @ $${hourlyRateUsd}/hr)**: $${bidMath.laborTotal.toLocaleString()}
- **Hardened Enclave Hardware / Support Reserve**: $${infraReserveUsd.toLocaleString()}
- **Total Firm-Fixed-Price (FFP) Proposal**: **$${bidMath.totalBid.toLocaleString()}** (${bidMath.underCeilingPct}% below agency ceiling of $${bidMath.ceiling.toLocaleString()})`;
  }, [activeRfp, activeTheme.name, engineeringHours, hourlyRateUsd, infraReserveUsd, bidMath]);

  const foiaRequestTemplate = useMemo(() => {
    return `SUBJECT: Virginia Freedom of Information Act (VFOIA § 2.2-3700) Request — ${activeRfp.solNumber}

Dear FOIA Officer / Procurement Records Custodian (${activeRfp.region}),

Pursuant to the Virginia Freedom of Information Act (Va. Code § 2.2-3700 et seq.), 1nc0gn30 • NullAI requests electronic copies of:
1. The current incumbent contract, statement of work (SOW), and pricing schedule associated with ${activeRfp.solNumber} (${activeRfp.title}).
2. Any evaluation scoring matrices or technical addendum records from the prior award cycle.

Please deliver responsive records electronically in PDF or CSV format.

Respectfully submitted,
1nc0gn30 • 1nc0gn30 • NullAI (nullai.tech / nullai.tech)`;
  }, [activeRfp]);

  const activeDoc =
    activeTab === 2 ? phMetrics.launchKitMd : activeTab === 0 ? capabilityStatementMd : foiaRequestTemplate;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard?.writeText(activeDoc)?.catch?.(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      activeTab === 2
        ? 'producthunt-launch-kit.md'
        : `${activeRfp.solNumber.toLowerCase()}-${activeTab === 0 ? 'capability-statement' : 'foia-request'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        borderRadius: activeTheme.borderRadius || '12px',
        bgcolor: 'rgba(9, 11, 17, 0.9)',
        border: `1px solid ${activeTheme.border}`,
        boxShadow: activeTheme.cardGlow,
      }}
    >
      <SovereignEyebrow accent="#10B981" right="Growth & SEO">
        {"city-desk"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"city-desk"}
        eyebrow={"Growth & SEO"}
        caption={"City Desk // Civic Procurement & 1,000 Multi-City Forge"}
        label={"City Desk — Zoth sovereign visualisation"}
      />
      {/* Sovereign Support & Tip Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="✦ 100% FREE & OPEN ACCESS"
            size="small"
            sx={{
              bgcolor: '#10B981',
              color: '#05070B',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.68rem',
            }}
          />
          <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: '#D4AF37' }}>
            Zero Paywalls · All 1,000 Landing Pages & GovTech Forges Unlocked
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#D4AF37',
              color: '#05070B',
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
              navigator.clipboard?.writeText(sol);
              alert('Solana Tip Address copied: ' + sol);
            }}
            sx={{
              borderColor: '#10B981',
              color: '#10B981',
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            Solana Tip ⚡
          </Button>
        </Stack>
      </Stack>
      {/* Header */}
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
              icon={
                isProductHuntMode ? (
                  <RocketLaunchIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />
                ) : (
                  <AccountBalanceIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />
                )
              }
              label={
                isProductHuntMode
                  ? 'PRODUCT HUNT CONNECTOR // LAUNCH VELOCITY & MAKER KIT'
                  : 'CITY DESK // MUNICIPAL RFP, eVA & FOIA BID WORKSTATION'
              }
              size="small"
              sx={{
                bgcolor: `${activeTheme.primary}18`,
                color: activeTheme.primary,
                border: `1px solid ${activeTheme.border}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              label={
                activeTab === 2
                  ? `${phMetrics.rankPrediction} (${phMetrics.projected24hUpvotes} EST. UPVOTES)`
                  : `P(WIN): ${bidMath.pWin}% • MARGIN: ${bidMath.netMarginPct}%`
              }
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                border: '1px solid rgba(16,185,129,0.35)',
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 800, color: '#F5F0E8' }}>
            {isProductHuntMode
              ? 'Product Hunt Launch Command, Tagline Scorer & Maker Kit Forge'
              : 'City Desk Civic Procurement & GovTech Proposal Forge'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.4 }}>
            {isProductHuntMode
              ? 'Optimize 60-character taglines, simulate 24h PST upvote velocity, and export your complete Maker Comment & Ship kit.'
              : 'Model Firm-Fixed-Price (FFP) GovTech bids, verify NIST 800-171 / VITA / CMMC compliance, and export Capability Statements & VFOIA requests.'}
          </Typography>
        </Box>

        {activeTab !== 2 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
            {RFP_OPPORTUNITIES.map((r) => (
              <Button
                key={r.id}
                size="small"
                variant={selectedRfpId === r.id ? 'contained' : 'outlined'}
                onClick={() => setSelectedRfpId(r.id)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.69rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: selectedRfpId === r.id ? activeTheme.primary : 'transparent',
                  color: selectedRfpId === r.id ? '#06080D' : activeTheme.primary,
                  borderColor: activeTheme.border,
                }}
              >
                {r.solNumber}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>

      {/* 60fps Bid vs Ceiling / Upvote Velocity Visualizer */}
      <Box
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#05070B',
          border: `1px solid ${activeTheme.border}`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={92}
          style={{ width: '100%', height: 92, display: 'block', borderRadius: 6 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        {/* Left Column: Controls */}
        <Grid xs={12} md={5}>
          {activeTab === 2 ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Product Launch Name"
                value={phProductName}
                onChange={(e) => setPhProductName(e.target.value)}
                InputLabelProps={{ sx: { color: '#94A3B8', fontFamily: mono, fontSize: '0.75rem' } }}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', color: '#F5F0E8', bgcolor: '#06080E', '& fieldset': { borderColor: 'rgba(255,255,255,0.22)' } } }}
              />
              <TextField
                fullWidth
                size="small"
                label={`60-Char Tagline (${phMetrics.taglineLen}/60 chars — Score: ${phMetrics.taglineScore}/100)`}
                value={phTagline}
                onChange={(e) => setPhTagline(e.target.value)}
                InputLabelProps={{ sx: { color: '#94A3B8', fontFamily: mono, fontSize: '0.75rem' } }}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.76rem', color: '#F5F0E8', bgcolor: '#06080E', '& fieldset': { borderColor: 'rgba(255,255,255,0.22)' } } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Launch Topics"
                value={phTopics}
                onChange={(e) => setPhTopics(e.target.value)}
                InputLabelProps={{ sx: { color: '#94A3B8', fontFamily: mono, fontSize: '0.75rem' } }}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.76rem', color: '#F5F0E8', bgcolor: '#06080E', '& fieldset': { borderColor: 'rgba(255,255,255,0.22)' } } }}
              />
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#06080E', border: '1px solid rgba(255,255,255,0.14)' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#CBD5E1', mb: 0.5 }}>
                  FIRST 4-HOUR PST UPVOTE VELOCITY ({phFirst4HrUpvotes} upvotes)
                </Typography>
                <Slider
                  min={40}
                  max={350}
                  step={5}
                  value={phFirst4HrUpvotes}
                  onChange={(_, v) => setPhFirst4HrUpvotes(v)}
                  sx={{ color: activeTheme.primary }}
                />
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#06080E',
                  border: `1px solid ${activeTheme.border}`,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: activeTheme.primary, fontWeight: 800 }}>
                  {activeRfp.solNumber} • {activeRfp.region}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.5, color: '#F5F0E8' }}>
                  {activeRfp.title}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', display: 'block', mt: 0.5 }}>
                  NAICS: {activeRfp.naics} • Ceiling: ${activeRfp.ceilingUsd.toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: 'wrap', useFlexGap: true }}>
                  {activeRfp.complianceRequired.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.64rem',
                        bgcolor: `${activeTheme.primary}18`,
                        color: activeTheme.primary,
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#06080E',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#CBD5E1', mb: 0.5 }}>
                  ENGINEERING HOURS ({engineeringHours} hrs)
                </Typography>
                <Slider
                  min={80}
                  max={1200}
                  step={20}
                  value={engineeringHours}
                  onChange={(_, v) => setEngineeringHours(v)}
                  sx={{ color: activeTheme.primary, mb: 1.5 }}
                />

                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#CBD5E1', mb: 0.5 }}>
                  BLENDED SOVEREIGN RATE ($${hourlyRateUsd}/hr)
                </Typography>
                <Slider
                  min={95}
                  max={275}
                  step={5}
                  value={hourlyRateUsd}
                  onChange={(_, v) => setHourlyRateUsd(v)}
                  sx={{ color: activeTheme.primary, mb: 1.5 }}
                />

                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#CBD5E1', mb: 0.5 }}>
                  ENCLAVE HARDWARE & SUPPORT RESERVE ($${infraReserveUsd.toLocaleString()})
                </Typography>
                <Slider
                  min={1000}
                  max={35000}
                  step={500}
                  value={infraReserveUsd}
                  onChange={(_, v) => setInfraReserveUsd(v)}
                  sx={{ color: activeTheme.primary }}
                />
              </Paper>
            </Stack>
          )}
        </Grid>

        {/* Right Column: Deliverable Output Generator */}
        <Grid xs={12} md={7}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.14)', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 38,
                color: '#CBD5E1',
                '& .MuiTab-root': {
                  minHeight: 38,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#94A3B8',
                  '&.Mui-selected': { color: activeTheme.primary },
                },
                '& .MuiTabs-indicator': { backgroundColor: activeTheme.primary },
              }}
            >
              <Tab icon={<DescriptionIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Capability Statement (.md)" />
              <Tab icon={<GavelIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="VFOIA Records Request" />
              <Tab icon={<RocketLaunchIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Product Hunt Launch Kit" />
            </Tabs>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#CBD5E1' }}>
              {activeTab === 2
                ? `Forecast: ${phMetrics.projected24hUpvotes} Upvotes · ${phMetrics.rankPrediction}`
                : `FFP Bid: $${bidMath.totalBid.toLocaleString()} • Net Margin: $${bidMath.netMarginUsd.toLocaleString()} (${bidMath.netMarginPct}%)`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopy}
                sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, borderColor: activeTheme.border }}
              >
                {copied ? 'Copied' : 'Copy Document'}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: activeTheme.primary, color: '#05070B', fontWeight: 800 }}
              >
                Export .md
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
              color: '#F5F0E8',
              border: `1px solid ${activeTheme.border}`,
              fontFamily: mono,
              fontSize: '0.73rem',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              maxHeight: 330,
            }}
          >
            {activeDoc}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
