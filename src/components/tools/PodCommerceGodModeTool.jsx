import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import BrushIcon from '@mui/icons-material/Brush';
import { useReality } from '../../context/RealityContext';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx, ledeSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const BRAILLE_RAMP = ['⠀', '⡀', '⡄', '⡆', '⡇', '⣇', '⣧', '⣷', '⣿'];

const PROVIDERS = [
  {
    id: 'gelato-eu',
    name: 'Gelato Local Hub (32-Country Mesh)',
    baseCost: 11.4,
    shipCost: 3.9,
    transitDays: 2,
    customsRisk: 'ZERO (Local Print)',
    color: '#34D399',
  },
  {
    id: 'printify-choice',
    name: 'Printify Choice US/UK Network',
    baseCost: 9.8,
    shipCost: 4.8,
    transitDays: 4,
    customsRisk: 'LOW',
    color: '#38BDF8',
  },
  {
    id: 'direct-atelier',
    name: 'Sovereign Direct Fine-Art Atelier',
    baseCost: 13.5,
    shipCost: 4.2,
    transitDays: 3,
    customsRisk: 'ZERO',
    color: '#D4AF37',
  },
];

const DEFAULT_TAGS = [
  'cyberpunk shirt',
  'sacred geometry tee',
  'coder gift shirt',
  'heavyweight tshirt',
  'unisex streetwear',
  'alchemical gold art',
  'developer apparel',
  'minimalist graphic',
  'techwear aesthetic',
  'dark academia tee',
  'esoteric clothing',
  'linux hacker shirt',
  'cotton comfort tee',
].join(', ');

export default function PodCommerceGodModeTool({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { reality } = useReality();
  const toolId = tool?.id || 'pod-smart-router';

  const initialTab = useMemo(() => {
    if (['etsy-connector', 'shopify-connector', 'etsy-pod-forge', 'storefront-catalog'].includes(toolId)) return 1;
    if (['pod-mockup-forge', 'digital-asset-forge'].includes(toolId)) return 2;
    return 0;
  }, [toolId]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [retailPrice, setRetailPrice] = useState(25);
  const [shippingCharged, setShippingCharged] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [channel, setChannel] = useState(toolId.includes('shopify') ? 'shopify' : 'etsy');
  const [printifyPremium, setPrintifyPremium] = useState(true);
  const [copied, setCopied] = useState(false);

  // Tab 1: Etsy 13-Tag SEO & Shopify GraphQL Transpiler State
  const [listingTitle, setListingTitle] = useState(
    'Cyberpunk Sacred Geometry Heavyweight Tee | Alchemical Gold Unisex Streetwear Shirt | Developer Gift'
  );
  const [tagsInput, setTagsInput] = useState(DEFAULT_TAGS);
  const [skuCode, setSkuCode] = useState('ZOTH-MERKABA-BLK-XL');

  // Tab 2: 300-DPI Print & Mockup Forge State
  const [garmentType, setGarmentType] = useState('bella-3001-tee');
  const [garmentColor, setGarmentColor] = useState('#090A0F');
  const [graphicMotif, setGraphicMotif] = useState('merkaba-gold');

  const canvasRef = useRef(null);
  const mockupCanvasRef = useRef(null);

  useEffect(() => {
    setActiveTab(initialTab);
    if (toolId.includes('shopify')) setChannel('shopify');
    else if (toolId.includes('etsy')) setChannel('etsy');
  }, [toolId, initialTab]);

  const quotes = useMemo(() => {
    const grossRev = (retailPrice + shippingCharged) * quantity;
    const platformFee =
      channel === 'shopify'
        ? grossRev * 0.029 + 0.3
        : grossRev * 0.065 + grossRev * 0.03 + 0.25 + 0.2 * quantity;

    return PROVIDERS.map((p) => {
      const unitPodCost =
        p.id === 'printify-choice' && printifyPremium ? p.baseCost * 0.8 : p.baseCost;
      const outboundShippingCost = p.shipCost + (quantity - 1) * 1.5;
      const fulfillment = unitPodCost * quantity + outboundShippingCost;
      const totalCosts = fulfillment + platformFee;
      const netProfit = grossRev - totalCosts;
      const marginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;
      return {
        ...p,
        unitPodCost: Number(unitPodCost.toFixed(2)),
        outboundShippingCost: Number(outboundShippingCost.toFixed(2)),
        grossRev: Number(grossRev.toFixed(2)),
        platformFee: Number(platformFee.toFixed(2)),
        fulfillment: Number(fulfillment.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        marginPct: Number(marginPct.toFixed(1)),
      };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [retailPrice, shippingCharged, quantity, channel, printifyPremium]);

  const winner = quotes[0];

  const seoAudit = useMemo(() => {
    const rawTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const validTags = rawTags.filter((t) => t.length <= 20);
    const overlongTags = rawTags.filter((t) => t.length > 20);
    const multiWordTags = rawTags.filter((t) => t.includes(' '));
    const titleLen = listingTitle.trim().length;
    const titleOptimal = titleLen >= 70 && titleLen <= 140;

    let score = 0;
    score += Math.min(40, Math.round((validTags.length / 13) * 40));
    score += Math.min(25, Math.round((multiWordTags.length / Math.max(1, rawTags.length)) * 25));
    score += titleOptimal ? 25 : titleLen > 0 && titleLen <= 140 ? 15 : 5;
    score += overlongTags.length === 0 ? 10 : Math.max(0, 10 - overlongTags.length * 5);

    const shopifyGraphqlPayload = {
      mutation: 'productCreate(input: ProductInput!)',
      variables: {
        input: {
          title: listingTitle.trim(),
          vendor: '1nc0gn30 • NullAI • Sovereign Atelier',
          productType: 'Print-on-Demand Apparel',
          tags: validTags,
          variants: [
            {
              sku: skuCode,
              price: retailPrice.toFixed(2),
              inventoryPolicy: 'CONTINUE',
              requiresShipping: true,
            },
          ],
        },
      },
    };

    return {
      rawTags,
      validTags,
      overlongTags,
      multiWordTags,
      titleLen,
      titleOptimal,
      score: Math.min(100, score),
      grade: score >= 90 ? 'A+ (ALGORITHMIC PEAK)' : score >= 75 ? 'B (COMPETITIVE)' : 'C (NEEDS TAG OPTIMIZATION)',
      shopifyGraphqlPayload,
    };
  }, [listingTitle, tagsInput, skuCode, retailPrice]);

  const brailleCurve = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const p = 15 + i * 3;
      const rev = (p + shippingCharged) * quantity;
      const fee = channel === 'shopify' ? rev * 0.029 + 0.3 : rev * 0.095 + 0.25 + 0.2 * quantity;
      const net = rev - fee - winner.fulfillment;
      const m = Math.max(0, Math.min(1, net / Math.max(1, rev) / 0.75));
      return BRAILLE_RAMP[Math.round(m * (BRAILLE_RAMP.length - 1))];
    }).join('');
  }, [shippingCharged, quantity, channel, winner.fulfillment]);

  const dispatchPayload = useMemo(
    () =>
      JSON.stringify(
        {
          routed_by: toolId,
          selected_provider: winner.id,
          channel,
          sku: skuCode,
          quantity,
          printify_premium_20pct: printifyPremium,
          seo_audit: {
            score: seoAudit.score,
            grade: seoAudit.grade,
            tag_count: `${seoAudit.validTags.length}/13`,
            title_chars: `${seoAudit.titleLen}/140`,
          },
          margin_telemetry: {
            gross_revenue_usd: winner.grossRev,
            pod_unit_cost_usd: winner.unitPodCost,
            outbound_shipping_cost_usd: winner.outboundShippingCost,
            fulfillment_cost_usd: winner.fulfillment,
            platform_fee_usd: winner.platformFee,
            net_profit_usd: winner.netProfit,
            net_margin_pct: `${winner.marginPct}%`,
          },
          shopify_graphql_transpiled: seoAudit.shopifyGraphqlPayload.variables,
          operator: '1nc0gn30 (@1nc0gn30)',
        },
        null,
        2
      ),
    [toolId, winner, channel, skuCode, quantity, printifyPremium, seoAudit]
  );

  // Tab 0 Canvas: 60fps Fulfillment Arbitrage Waterfall
  useEffect(() => {
    if (activeTab !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 175;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const leftX = 56;
      const rightX = w - 66;
      const cy = h * 0.5;

      quotes.forEach((q, idx) => {
        const y = 38 + idx * 48;
        ctx.beginPath();
        ctx.moveTo(leftX, cy);
        ctx.bezierCurveTo(w * 0.4, cy, w * 0.55, y, rightX, y);
        ctx.strokeStyle = idx === 0 ? q.color : 'rgba(148,163,184,0.25)';
        ctx.lineWidth = idx === 0 ? 2.5 : 1.2;
        ctx.stroke();

        const p = (t * 0.65 + idx * 0.3) % 1;
        const px = leftX + (rightX - leftX) * p;
        const py = cy + (y - cy) * p;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = q.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rightX, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#07090F';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = q.color;
        ctx.stroke();
        ctx.fillStyle = '#EDEFF2';
        ctx.font = '700 8.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(q.marginPct)}%`, rightX, y + 3);
      });

      ctx.beginPath();
      ctx.arc(leftX, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52,211,153,0.18)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34D399';
      ctx.stroke();
      ctx.fillStyle = '#EDEFF2';
      ctx.font = '800 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ORDER', leftX, cy + 3);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [quotes, activeTab]);

  // Tab 2 Canvas: Interactive 300-DPI Print & Apparel Mockup Renderer
  useEffect(() => {
    if (activeTab !== 2) return;
    const canvas = mockupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#05060A';
      ctx.fillRect(0, 0, w, h);

      // Draw studio lighting grid
      ctx.strokeStyle = 'rgba(212,175,55,0.08)';
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const cx = w * 0.5;
      const cy = h * 0.52;

      // Draw garment silhouette or poster frame
      ctx.save();
      ctx.fillStyle = garmentColor;
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.8;

      if (garmentType === 'museum-poster') {
        ctx.fillRect(cx - 85, cy - 110, 170, 220);
        ctx.strokeRect(cx - 85, cy - 110, 170, 220);
      } else {
        // Heavyweight Tee Silhouette
        ctx.beginPath();
        ctx.moveTo(cx - 42, cy - 105);
        ctx.lineTo(cx + 42, cy - 105);
        ctx.lineTo(cx + 115, cy - 55);
        ctx.lineTo(cx + 92, cy - 15);
        ctx.lineTo(cx + 68, cy - 32);
        ctx.lineTo(cx + 68, cy + 108);
        ctx.lineTo(cx - 68, cy + 108);
        ctx.lineTo(cx - 68, cy - 32);
        ctx.lineTo(cx - 92, cy - 15);
        ctx.lineTo(cx - 115, cy - 55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw 300-DPI Print Safe Zone Bounding Box
      ctx.strokeStyle = 'rgba(56,189,248,0.45)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cx - 48, cy - 58, 96, 116);
      ctx.setLineDash([]);

      // Draw Sacred Geometry / Braille Chest Graphic
      const strokeCol = graphicMotif === 'matrix-emerald' ? '#00FF9D' : graphicMotif === 'cyber-cyan' ? '#38BDF8' : '#D4AF37';
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.6;
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        ctx.arc(cx, cy - 6, ring * 13, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Rotating star polygon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + t;
        const px = cx + Math.cos(ang) * 36;
        const py = cy - 6 + Math.sin(ang) * 36;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = strokeCol;
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⣿ ZOTH ATELIER 300-DPI ⣿', cx, cy + 46);
      ctx.restore();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [activeTab, garmentType, garmentColor, graphicMotif]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(dispatchPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([dispatchPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}-${winner.id}-${channel}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMockupPng = () => {
    const canvas = mockupCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skuCode.toLowerCase()}-300dpi-mockup.png`;
    a.click();
  };

  const accent = reality?.accent || '#D4AF37';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 2,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <SovereignEyebrow accent="#34D399" right={tool?.category || "Commerce & POD"}>
        {toolId}
      </SovereignEyebrow>
      <SovereignBand
        seed={toolId}
        eyebrow={tool?.category || "Commerce & POD"}
        caption={tool?.name || "Etsy POD Forge"}
        label={`${tool?.name || "Etsy POD Forge"} — Zoth sovereign visualisation`}
      />

      {/* Sovereign Support & Access Bar */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FFFDF0',
          border: '1px solid rgba(212,175,55,0.3)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label="✦ 100% FREE & OPEN ACCESS"
            sx={{
              bgcolor: 'rgba(52,211,153,0.15)',
              color: '#34D399',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
            Autonomous 300 DPI Canvas Generator & Etsy POD Architecture
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noreferrer"
            sx={{
              bgcolor: '#D4AF37',
              color: '#000',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#B8860B' }
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard?.writeText('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK')?.catch?.(() => {});
                alert('Solana Tip Address copied to clipboard: GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK');
              }
            }}
            sx={{ borderColor: '#38BDF8', color: '#38BDF8', fontWeight: 700, fontFamily: mono }}
          >
            ◎ Solana Tip
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
        <Chip
          icon={<LocalShippingIcon sx={{ fontSize: '0.95rem !important', color: '#34D399 !important' }} />}
          label={`${(tool?.name || 'POD COMMERCE SENTINEL').toUpperCase()} · WORKSTATION`}
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
        <Chip
          icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: `${accent} !important` }} />}
          label={`NET MARGIN: ${winner.marginPct}% ($${winner.netProfit})`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(212,175,55,0.14)',
            color: isDark ? '#F5E6AB' : '#92400E',
          }}
        />
        <Chip
          label={`SEO RANK: ${seoAudit.score}/100 (${seoAudit.validTags.length}/13 TAGS)`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(192,132,252,0.14)',
            color: '#C084FC',
            border: '1px solid rgba(192,132,252,0.35)',
          }}
        />
        <Chip
          label={`BRAILLE CURVE: ${brailleCurve}`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.68rem',
            bgcolor: isDark ? 'rgba(56,189,248,0.1)' : '#F0F9FF',
            color: isDark ? '#38BDF8' : '#0369A1',
            border: '1px solid rgba(56,189,248,0.3)',
          }}
        />
      </Stack>

      <Typography variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400, mb: 2 }}>
        {tool?.name || 'Autonomous Printify × Gelato × Shopify × Etsy'} —{' '}
        <span style={{ color: '#34D399' }}>Margin, SEO & 300-DPI Asset Forge</span>
      </Typography>

      {/* Mode Switcher Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
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
              fontWeight: 800,
              textTransform: 'none',
            },
          }}
        >
          <Tab icon={<LocalShippingIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="1. Fulfillment & Margin Router" />
          <Tab icon={<ManageSearchIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="2. Etsy 13-Tag SEO & Shopify Transpiler" />
          <Tab icon={<BrushIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="3. 300-DPI Print & Mockup Forge" />
        </Tabs>
      </Box>

      {/* TAB 0: Fulfillment & Margin Router */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={5}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Storefront Channel</InputLabel>
                <Select
                  value={channel}
                  label="Storefront Channel"
                  onChange={(e) => setChannel(e.target.value)}
                  sx={{ fontFamily: mono, fontSize: '0.8rem' }}
                >
                  <MenuItem value="etsy" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    Etsy Marketplace (6.5% Tx + 3%+$0.25 Proc + $0.20 Listing)
                  </MenuItem>
                  <MenuItem value="shopify" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    Shopify Direct (2.9% + $0.30 Stripe)
                  </MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography sx={{ ...ledeSx, fontFamily: mono, fontSize: '0.72rem' }}>
                  Unit Retail Price: ${retailPrice} USD
                </Typography>
                <Slider min={15} max={95} step={1} value={retailPrice} onChange={(_, v) => setRetailPrice(v)} sx={{ color: '#34D399' }} />
              </Box>

              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                  Shipping Charged to Buyer: ${shippingCharged} USD
                </Typography>
                <Slider min={0} max={20} step={1} value={shippingCharged} onChange={(_, v) => setShippingCharged(v)} sx={{ color: accent }} />
              </Box>

              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                  Order Quantity: {quantity} units
                </Typography>
                <Slider min={1} max={15} step={1} value={quantity} onChange={(_, v) => setQuantity(v)} sx={{ color: '#38BDF8' }} />
              </Box>

              <Button
                size="small"
                variant={printifyPremium ? 'contained' : 'outlined'}
                onClick={() => setPrintifyPremium(!printifyPremium)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  bgcolor: printifyPremium ? '#38BDF8' : 'transparent',
                  color: printifyPremium ? '#08080B' : '#38BDF8',
                  borderColor: '#38BDF8',
                  '&:hover': { bgcolor: printifyPremium ? '#7DD3FC' : 'rgba(56,189,248,0.1)' },
                }}
              >
                {printifyPremium ? '★ Printify Premium (-20% Base Cost) ACTIVE' : 'Enable Printify Premium (-20% Base Cost)'}
              </Button>

              <Box
                sx={{
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: '1px solid rgba(52,211,153,0.3)',
                  bgcolor: '#06080C',
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderBottom: '1px solid rgba(52,211,153,0.18)',
                    bgcolor: 'rgba(52,211,153,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#34D399', fontWeight: 700 }}>
                    FULFILLMENT ARBITRAGE ROUTER
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                    60 FPS WATERFALL
                  </Typography>
                </Box>
                <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 165, display: 'block' }} />
              </Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={7}>
            <Stack spacing={1.5}>
              {quotes.map((q, idx) => (
                <Box
                  key={q.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                    border: `1px solid ${idx === 0 ? 'rgba(52,211,153,0.45)' : 'rgba(148,163,184,0.18)'}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: q.color }}>
                      {idx === 0 ? '★ WINNER: ' : ''}{q.name}
                    </Typography>
                    <Chip
                      label={`+$${q.netProfit} Net (${q.marginPct}%)`}
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: mono,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: q.color,
                        bgcolor: 'rgba(0,0,0,0.35)',
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary', mb: 0.75 }}>
                    Gross: ${q.grossRev} · POD: ${(q.unitPodCost * quantity).toFixed(2)} · Outbound Ship: ${q.outboundShippingCost} · Fee: ${q.platformFee} · Transit: {q.transitDays}d ({q.customsRisk})
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(5, Math.min(100, q.marginPct))}
                    sx={{
                      height: 5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: q.color },
                    }}
                  />
                </Box>
              ))}

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
                  sx={{ px: 1.5, py: 0.65, bgcolor: 'rgba(212,175,55,0.08)' }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#F5E6AB', fontWeight: 700 }}>
                    SIGNED FULFILLMENT & SHOPIFY/ETSY DISPATCH PAYLOAD
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={handleCopy}
                      sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37' }}
                    >
                      {copied ? 'Copied' : 'Copy JSON'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadJson}
                      sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#34D399' }}
                    >
                      Export .json
                    </Button>
                  </Stack>
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.25,
                    maxHeight: 165,
                    overflow: 'auto',
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    color: '#E2E8F0',
                  }}
                >
                  {dispatchPayload}
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: Etsy 13-Tag SEO Auditor & Shopify GraphQL Transpiler */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label={`Listing Title (${seoAudit.titleLen}/140 chars — ${seoAudit.titleOptimal ? 'OPTIMAL' : 'ADJUST LENGTH'})`}
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.76rem' } }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                label={`13 Search Tags (${seoAudit.validTags.length}/13 valid ≤20 chars, ${seoAudit.multiWordTags.length} long-tail)`}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.74rem' } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Variant SKU Identifier"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.76rem' } }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {seoAudit.rawTags.map((t, idx) => {
                  const tooLong = t.length > 20;
                  return (
                    <Chip
                      key={idx}
                      label={`${idx + 1}. ${t} (${t.length}c)`}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        bgcolor: tooLong ? 'rgba(244,63,94,0.16)' : 'rgba(52,211,153,0.12)',
                        color: tooLong ? '#F43F5E' : '#34D399',
                        border: `1px solid ${tooLong ? 'rgba(244,63,94,0.4)' : 'rgba(52,211,153,0.3)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Stack>
          </Grid>
          <Grid xs={12} md={6}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(192,132,252,0.08)' : '#FAF5FF',
                  border: '1px solid rgba(192,132,252,0.35)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: '#C084FC' }}>
                    ALGORITHMIC RANKING VERDICT: {seoAudit.grade}
                  </Typography>
                  <Chip
                    label={`${seoAudit.score}/100`}
                    size="small"
                    sx={{ fontFamily: mono, fontWeight: 800, bgcolor: '#C084FC', color: '#08080B' }}
                  />
                </Stack>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary' }}>
                  • Valid Tags (≤20 chars): {seoAudit.validTags.length}/13 · Multi-Word Long-Tail: {seoAudit.multiWordTags.length}/13
                  <br />• Overlong Tags (&gt;20 chars): {seoAudit.overlongTags.length === 0 ? '0 (PASS)' : seoAudit.overlongTags.join(', ')}
                </Typography>
              </Box>

              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: '#05060A',
                  border: '1px solid rgba(56,189,248,0.3)',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 1.5, py: 0.65, bgcolor: 'rgba(56,189,248,0.1)' }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#38BDF8', fontWeight: 700 }}>
                    TRANSPILED SHOPIFY GRAPHQL MUTATION PAYLOAD
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadJson}
                    sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#38BDF8' }}
                  >
                    Download .json
                  </Button>
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    maxHeight: 195,
                    overflow: 'auto',
                    fontFamily: mono,
                    fontSize: '0.69rem',
                    color: '#E2E8F0',
                  }}
                >
                  {JSON.stringify(seoAudit.shopifyGraphqlPayload, null, 2)}
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: 300-DPI Print & Mockup Asset Forge */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={5}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Garment / Print Substrate</InputLabel>
                <Select
                  value={garmentType}
                  label="Garment / Print Substrate"
                  onChange={(e) => setGarmentType(e.target.value)}
                  sx={{ fontFamily: mono, fontSize: '0.8rem' }}
                >
                  <MenuItem value="bella-3001-tee" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    Bella+Canvas 3001 Heavyweight Tee (4500×5400px @ 300 DPI)
                  </MenuItem>
                  <MenuItem value="museum-poster" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    Archival Museum Giclée Poster (2400×3000px @ 300 DPI)
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Sacred / Uncommon Motif</InputLabel>
                <Select
                  value={graphicMotif}
                  label="Sacred / Uncommon Motif"
                  onChange={(e) => setGraphicMotif(e.target.value)}
                  sx={{ fontFamily: mono, fontSize: '0.8rem' }}
                >
                  <MenuItem value="merkaba-gold" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    24K Alchemical Merkaba + U+2800 Braille Ring
                  </MenuItem>
                  <MenuItem value="matrix-emerald" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    P39 Phosphor Matrix Emerald Geometry
                  </MenuItem>
                  <MenuItem value="cyber-cyan" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    Quantum Cyan Hypercube Lattice
                  </MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                  Substrate Color:
                </Typography>
                <input
                  type="color"
                  value={garmentColor}
                  onChange={(e) => setGarmentColor(e.target.value)}
                  style={{ width: 44, height: 30, border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>{garmentColor}</Typography>
              </Stack>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadMockupPng}
                sx={{
                  bgcolor: '#D4AF37',
                  color: '#08080B',
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                }}
              >
                Download Rendered Mockup (.PNG)
              </Button>
            </Stack>
          </Grid>
          <Grid xs={12} md={7}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.35)',
                bgcolor: '#05060A',
                p: 1,
                textAlign: 'center',
              }}
            >
              <canvas
                ref={mockupCanvasRef}
                width={520}
                height={260}
                style={{ width: '100%', height: 260, display: 'block', borderRadius: 8 }}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
