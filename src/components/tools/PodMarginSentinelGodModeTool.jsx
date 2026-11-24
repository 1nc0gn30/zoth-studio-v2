import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Slider,
  Switch,
  FormControlLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TuneIcon from '@mui/icons-material/Tune';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  SovereignPresetBar,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  downloadText,
  toCsv,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.emerald;
const DANGER_MARGIN_PCT = 15;
const SHOPIFY_BASIC_MONTHLY = 39;
const SHOPIFY_GROW_MONTHLY = 105;

const PRODUCT_PRESETS = [
  {
    id: 'cc-1717-tee',
    label: 'Comfort Colors 1717 Tee',
    badge: 'Apparel',
    retailPrice: 34.99,
    buyerShipping: 4.99,
    podBaseCost: 12.65,
    podShipCost: 4.75,
    packagingCost: 0.5,
    monthlyOrders: 120,
    tiktokAffiliatePct: 10,
    targetMarginPct: 35,
    cvrPct: 2.5,
  },
  {
    id: 'japandi-poster-18x24',
    label: 'Museum Poster 18×24',
    badge: 'Wall Art',
    retailPrice: 44.0,
    buyerShipping: 0,
    podBaseCost: 11.4,
    podShipCost: 5.4,
    packagingCost: 0.75,
    monthlyOrders: 160,
    tiktokAffiliatePct: 12,
    targetMarginPct: 40,
    cvrPct: 3.0,
  },
  {
    id: 'heavy-hoodie-18500',
    label: 'Heavy Blend Hoodie',
    badge: 'High Ticket',
    retailPrice: 54.99,
    buyerShipping: 5.95,
    podBaseCost: 21.4,
    podShipCost: 8.49,
    packagingCost: 0.65,
    monthlyOrders: 85,
    tiktokAffiliatePct: 10,
    targetMarginPct: 30,
    cvrPct: 2.2,
  },
  {
    id: 'ceramic-mug-15oz',
    label: 'Ceramic Mug 15oz',
    badge: 'Tight Margin',
    retailPrice: 21.99,
    buyerShipping: 0,
    podBaseCost: 6.45,
    podShipCost: 5.99,
    packagingCost: 0.45,
    monthlyOrders: 100,
    tiktokAffiliatePct: 15,
    targetMarginPct: 25,
    cvrPct: 3.2,
  },
];

const COUPON_TIERS = [10, 15, 20, 25];

function fmtUsd(val) {
  const n = Number(val) || 0;
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`;
}

function solveChannelEconomics({
  id,
  name,
  feeFormula,
  pctRate,
  flatFee,
  amortizedPlanFee = 0,
  grossRevenue,
  retailPrice,
  buyerShipping,
  totalCogs,
  monthlyOrders,
  targetMarginPct,
  cvrPct,
}) {
  const totalFlat = flatFee + amortizedPlanFee;
  const pctFeeDollars = grossRevenue * pctRate;
  const totalFees = pctFeeDollars + totalFlat;
  const netProfit = grossRevenue - totalFees - totalCogs;
  const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const monthlyNetProfit = netProfit * monthlyOrders;

  // Break-even gross: G * (1 - pctRate) = totalCogs + totalFlat
  const denomBreakEven = 1 - pctRate;
  const breakEvenGross = denomBreakEven > 0 ? (totalCogs + totalFlat) / denomBreakEven : null;
  const breakEvenRetail = breakEvenGross != null ? Math.max(0, breakEvenGross - buyerShipping) : null;

  // Target net margin m: G * (1 - pctRate - m) = totalCogs + totalFlat
  const m = targetMarginPct / 100;
  const denomTarget = 1 - pctRate - m;
  const targetGross = denomTarget > 0.01 ? (totalCogs + totalFlat) / denomTarget : null;
  const targetRetail = targetGross != null ? Math.max(0, targetGross - buyerShipping) : null;
  const retailGapToTarget = targetRetail != null ? targetRetail - retailPrice : null;

  // Paid acquisition ceilings
  const maxCpa = Math.max(0, netProfit);
  const breakEvenRoas = netProfit > 0 && grossRevenue > 0 ? grossRevenue / netProfit : null;
  const maxCpc = maxCpa * (Math.max(0.1, cvrPct) / 100);

  let health = 'HEALTHY';
  if (netProfit <= 0) health = 'LOSS';
  else if (netMarginPct < DANGER_MARGIN_PCT) health = 'DANGER';
  else if (netMarginPct < targetMarginPct) health = 'WATCH';

  return {
    id,
    name,
    feeFormula,
    pctRate,
    flatFee,
    amortizedPlanFee,
    totalFlat,
    pctFeeDollars,
    totalFees,
    netProfit,
    netMarginPct,
    monthlyNetProfit,
    breakEvenGross,
    breakEvenRetail,
    targetGross,
    targetRetail,
    retailGapToTarget,
    maxCpa,
    breakEvenRoas,
    maxCpc,
    health,
    isDanger: netMarginPct < DANGER_MARGIN_PCT,
  };
}

export default function PodMarginSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [activePresetId, setActivePresetId] = useState(PRODUCT_PRESETS[0].id);
  const [retailPrice, setRetailPrice] = useState(PRODUCT_PRESETS[0].retailPrice);
  const [buyerShipping, setBuyerShipping] = useState(PRODUCT_PRESETS[0].buyerShipping);
  const [podBaseCost, setPodBaseCost] = useState(PRODUCT_PRESETS[0].podBaseCost);
  const [podShipCost, setPodShipCost] = useState(PRODUCT_PRESETS[0].podShipCost);
  const [packagingCost, setPackagingCost] = useState(PRODUCT_PRESETS[0].packagingCost);
  const [monthlyOrders, setMonthlyOrders] = useState(PRODUCT_PRESETS[0].monthlyOrders);
  const [tiktokAffiliatePct, setTiktokAffiliatePct] = useState(PRODUCT_PRESETS[0].tiktokAffiliatePct);
  const [targetMarginPct, setTargetMarginPct] = useState(PRODUCT_PRESETS[0].targetMarginPct);
  const [cvrPct, setCvrPct] = useState(PRODUCT_PRESETS[0].cvrPct);

  const loadPreset = (p) => {
    setActivePresetId(p.id);
    setRetailPrice(p.retailPrice);
    setBuyerShipping(p.buyerShipping);
    setPodBaseCost(p.podBaseCost);
    setPodShipCost(p.podShipCost);
    setPackagingCost(p.packagingCost);
    setMonthlyOrders(p.monthlyOrders);
    setTiktokAffiliatePct(p.tiktokAffiliatePct);
    setTargetMarginPct(p.targetMarginPct);
    setCvrPct(p.cvrPct);
  };

  const simulation = useMemo(() => {
    const safeRetail = Math.max(0, Number(retailPrice) || 0);
    const safeBuyerShip = Math.max(0, Number(buyerShipping) || 0);
    const safeBase = Math.max(0, Number(podBaseCost) || 0);
    const safePodShip = Math.max(0, Number(podShipCost) || 0);
    const safePkg = Math.max(0, Number(packagingCost) || 0);
    const safeOrders = Math.max(1, Math.round(Number(monthlyOrders) || 1));
    const safeAffiliate = Math.min(40, Math.max(0, Number(tiktokAffiliatePct) || 0));
    const safeTarget = Math.min(60, Math.max(15, Number(targetMarginPct) || 15));
    const safeCvr = Math.min(15, Math.max(0.2, Number(cvrPct) || 2.5));

    const grossRevenue = safeRetail + safeBuyerShip;
    const totalCogs = safeBase + safePodShip + safePkg;
    const basicAmortized = SHOPIFY_BASIC_MONTHLY / safeOrders;
    const growAmortized = SHOPIFY_GROW_MONTHLY / safeOrders;

    const channelSpecs = [
      {
        id: 'etsy-organic',
        name: 'Etsy Organic',
        feeFormula: '$0.20 + 6.5% txn + 3.0%+$0.25 pay',
        pctRate: 0.095,
        flatFee: 0.45,
        amortizedPlanFee: 0,
      },
      {
        id: 'etsy-offsite-15',
        name: 'Etsy + 15% Offsite Ads',
        feeFormula: '$0.20 + 6.5% + 3%+$0.25 + 15% ads',
        pctRate: 0.245,
        flatFee: 0.45,
        amortizedPlanFee: 0,
      },
      {
        id: 'shopify-basic',
        name: 'Shopify Basic ($39/mo)',
        feeFormula: `2.9% + $0.30 + $${basicAmortized.toFixed(2)}/ord`,
        pctRate: 0.029,
        flatFee: 0.3,
        amortizedPlanFee: basicAmortized,
      },
      {
        id: 'shopify-grow',
        name: 'Shopify Grow ($105/mo)',
        feeFormula: `2.7% + $0.30 + $${growAmortized.toFixed(2)}/ord`,
        pctRate: 0.027,
        flatFee: 0.3,
        amortizedPlanFee: growAmortized,
      },
      {
        id: 'tiktok-shop',
        name: `TikTok Shop (${safeAffiliate}% Affil.)`,
        feeFormula: `6.0% referral + ${safeAffiliate}% creator`,
        pctRate: 0.06 + safeAffiliate / 100,
        flatFee: 0,
        amortizedPlanFee: 0,
      },
    ];

    const channels = channelSpecs.map((spec) =>
      solveChannelEconomics({
        ...spec,
        grossRevenue,
        retailPrice: safeRetail,
        buyerShipping: safeBuyerShip,
        totalCogs,
        monthlyOrders: safeOrders,
        targetMarginPct: safeTarget,
        cvrPct: safeCvr,
      }),
    );

    const bestChannel = channels.reduce(
      (best, ch) => (ch.netProfit > best.netProfit ? ch : best),
      channels[0],
    );
    const worstChannel = channels.reduce(
      (worst, ch) => (ch.netProfit < worst.netProfit ? ch : worst),
      channels[0],
    );
    const dangerChannels = channels.filter((c) => c.isDanger);
    const avgMarginPct =
      channels.reduce((sum, c) => sum + c.netMarginPct, 0) / channels.length;

    // Coupon stress test on Etsy Organic & Shopify Basic
    const couponStress = COUPON_TIERS.map((pctOff) => {
      const discountedRetail = safeRetail * (1 - pctOff / 100);
      const discountedGross = discountedRetail + safeBuyerShip;
      const etsyFees = discountedGross * 0.095 + 0.45;
      const etsyNet = discountedGross - etsyFees - totalCogs;
      const etsyMargin = discountedGross > 0 ? (etsyNet / discountedGross) * 100 : 0;

      const shopFees = discountedGross * 0.029 + 0.3 + basicAmortized;
      const shopNet = discountedGross - shopFees - totalCogs;
      const shopMargin = discountedGross > 0 ? (shopNet / discountedGross) * 100 : 0;

      return {
        pctOff,
        discountedRetail,
        etsyNet,
        etsyMargin,
        shopNet,
        shopMargin,
        etsySafe: etsyMargin >= DANGER_MARGIN_PCT,
        shopSafe: shopMargin >= DANGER_MARGIN_PCT,
      };
    });

    // Shopify Grow vs Basic crossover volume: 39 + 0.029G*N = 105 + 0.027G*N => 0.002*G*N = 66
    const growCrossoverOrders = grossRevenue > 0 ? Math.ceil(66 / (0.002 * grossRevenue)) : null;

    return {
      grossRevenue,
      totalCogs,
      safeOrders,
      safeAffiliate,
      safeTarget,
      safeCvr,
      channels,
      bestChannel,
      worstChannel,
      dangerChannels,
      avgMarginPct,
      couponStress,
      growCrossoverOrders,
    };
  }, [
    retailPrice,
    buyerShipping,
    podBaseCost,
    podShipCost,
    packagingCost,
    monthlyOrders,
    tiktokAffiliatePct,
    targetMarginPct,
    cvrPct,
  ]);

  const csvRows = useMemo(
    () =>
      simulation.channels.map((ch) => ({
        channel: ch.name,
        fee_formula: ch.feeFormula,
        gross_revenue_usd: simulation.grossRevenue.toFixed(2),
        pod_cogs_usd: simulation.totalCogs.toFixed(2),
        total_fees_usd: ch.totalFees.toFixed(2),
        net_profit_usd: ch.netProfit.toFixed(2),
        net_margin_pct: ch.netMarginPct.toFixed(2),
        monthly_profit_usd: ch.monthlyNetProfit.toFixed(2),
        breakeven_retail_usd: ch.breakEvenRetail != null ? ch.breakEvenRetail.toFixed(2) : 'N/A',
        target_margin_pct: simulation.safeTarget,
        target_retail_usd: ch.targetRetail != null ? ch.targetRetail.toFixed(2) : 'INFEASIBLE',
        breakeven_roas: ch.breakEvenRoas != null ? `${ch.breakEvenRoas.toFixed(2)}x` : 'N/A',
        max_cpa_usd: ch.maxCpa.toFixed(2),
        max_cpc_usd: ch.maxCpc.toFixed(2),
        health: ch.health,
      })),
    [simulation],
  );

  const csvText = useMemo(() => toCsv(csvRows), [csvRows]);

  const auditJson = useMemo(
    () => ({
      tool: 'pod-margin-sentinel',
      version: '2.5.0',
      feeScheduleYear: 2026,
      inputs: {
        retailPrice: Number(retailPrice) || 0,
        buyerShipping: Number(buyerShipping) || 0,
        grossRevenue: Number(simulation.grossRevenue.toFixed(2)),
        podBaseCost: Number(podBaseCost) || 0,
        podShipCost: Number(podShipCost) || 0,
        packagingCost: Number(packagingCost) || 0,
        totalCogs: Number(simulation.totalCogs.toFixed(2)),
        monthlyOrders: simulation.safeOrders,
        tiktokAffiliatePct: simulation.safeAffiliate,
        targetMarginPct: simulation.safeTarget,
        conversionRatePct: simulation.safeCvr,
      },
      summary: {
        bestChannel: simulation.bestChannel.name,
        bestNetMarginPct: Number(simulation.bestChannel.netMarginPct.toFixed(2)),
        worstChannel: simulation.worstChannel.name,
        worstNetMarginPct: Number(simulation.worstChannel.netMarginPct.toFixed(2)),
        dangerAlertCount: simulation.dangerChannels.length,
        shopifyGrowCrossoverOrdersPerMonth: simulation.growCrossoverOrders,
      },
      channels: csvRows,
      couponStressTest: simulation.couponStress.map((c) => ({
        discountPct: c.pctOff,
        discountedRetailUsd: Number(c.discountedRetail.toFixed(2)),
        etsyOrganicNetUsd: Number(c.etsyNet.toFixed(2)),
        etsyOrganicMarginPct: Number(c.etsyMargin.toFixed(2)),
        shopifyBasicNetUsd: Number(c.shopNet.toFixed(2)),
        shopifyBasicMarginPct: Number(c.shopMargin.toFixed(2)),
      })),
    }),
    [retailPrice, buyerShipping, podBaseCost, podShipCost, packagingCost, simulation, csvRows],
  );

  const kpis = [
    {
      label: 'Best Channel Margin',
      value: `${simulation.bestChannel.netMarginPct.toFixed(1)}%`,
      unit: simulation.bestChannel.name.split(' ')[0],
      status: `${fmtUsd(simulation.bestChannel.netProfit)}/ord`,
      accent: SOV.emerald,
    },
    {
      label: 'Monthly Net (Best)',
      value: fmtUsd(simulation.bestChannel.monthlyNetProfit),
      unit: `${simulation.safeOrders}/mo`,
      status: simulation.bestChannel.name,
      accent: SOV.gold,
    },
    {
      label: 'Etsy 15% Ads Margin',
      value: `${simulation.channels[1].netMarginPct.toFixed(1)}%`,
      unit: fmtUsd(simulation.channels[1].netProfit),
      status: simulation.channels[1].isDanger ? 'BELOW 15% FLOOR' : 'MARGIN SAFE',
      accent: simulation.channels[1].isDanger ? SOV.crimson : SOV.cyber,
    },
    {
      label: 'Margin Danger Alerts',
      value: `${simulation.dangerChannels.length} / 5`,
      unit: `<${DANGER_MARGIN_PCT}%`,
      status: simulation.dangerChannels.length === 0 ? 'ALL CHANNELS SAFE' : 'ACTION NEEDED',
      accent: simulation.dangerChannels.length === 0 ? SOV.emerald : SOV.crimson,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
      <SovereignStatusPill
        label="2026 FEE ENGINE"
        status="LIVE"
        accent={SOV.emerald}
        pulse
      />
      <SovereignStatusPill
        label="TARGET FLOOR"
        status={`${simulation.safeTarget}% NET`}
        accent={SOV.gold}
      />
      <SovereignStatusPill
        label="DAEMON"
        status="127.0.0.1:8120"
        accent={SOV.cyber}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download pod-margin-matrix.csv',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(csvText, 'pod-margin-matrix.csv', 'text/csv;charset=utf-8'),
      primary: true,
    },
    {
      label: 'Download pod-margin-audit.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(auditJson, 'pod-margin-audit.json'),
    },
    {
      label: copied === 'json' ? 'Copied Audit JSON' : 'Copy Audit JSON',
      icon: copied === 'json' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(JSON.stringify(auditJson, null, 2), 'json'),
    },
    {
      label: 'pod-margin-sentinel on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/pod-margin-sentinel',
    },
  ];

  const healthColor = (health) => {
    if (health === 'LOSS' || health === 'DANGER') return SOV.crimson;
    if (health === 'WATCH') return SOV.amber;
    return SOV.emerald;
  };

  const cliSnippet = `# Start local POD Margin Sentinel workstation & REST API (port 8120)
cd ~/NullAITech/pod-margin-sentinel && python3 server.py --port 8120

# Check daemon health & wholesale benchmarks
pod-margin-sentinel status
pod-margin-sentinel --json

# Run exact CLI multi-channel compare with current parameters
pod-margin-sentinel compare \\
  --retail ${Number(retailPrice || 0).toFixed(2)} \\
  --wholesale ${Number(podBaseCost || 0).toFixed(2)} \\
  --shipping ${Number(podShipCost || 0).toFixed(2)}

# Solve break-even & ${simulation.safeTarget}% target margin price
pod-margin-sentinel breakeven \\
  --wholesale ${Number(podBaseCost || 0).toFixed(2)} \\
  --shipping ${Number(podShipCost || 0).toFixed(2)} \\
  --target-margin ${simulation.safeTarget}.0

# Launch MCP stdio server for agent tool integration
pod-margin-sentinel mcp`;

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="UNIFIED PRODUCT & FULFILLMENT INPUTS"
        title="COGS, Pricing & Volume Parameters"
        subtitle="Edit once to recalculate 2026 fee waterfalls across Etsy Organic, Etsy 15% Offsite Ads, Shopify Basic/Grow, and TikTok Shop"
        accent={ACCENT_RAW}
        right={<TuneIcon sx={{ color: accent }} />}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={PRODUCT_PRESETS}
            activeId={activePresetId}
            onSelect={loadPreset}
            onReset={() => loadPreset(PRODUCT_PRESETS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.75 }}>
          <TextField
            size="small"
            type="number"
            label="Retail Price ($)"
            value={retailPrice}
            onChange={(e) => setRetailPrice(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Buyer Shipping ($)"
            value={buyerShipping}
            onChange={(e) => setBuyerShipping(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="POD Base Cost ($)"
            value={podBaseCost}
            onChange={(e) => setPodBaseCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Fulfillment Ship ($)"
            value={podShipCost}
            onChange={(e) => setPodShipCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Packaging / Misc ($)"
            value={packagingCost}
            onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.1 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Monthly Orders"
            value={monthlyOrders}
            onChange={(e) => setMonthlyOrders(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            inputProps={{ min: 1, step: 10 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <FormControlLabel
          sx={{ mb: 1.5 }}
          control={
            <Switch
              checked={Number(buyerShipping) === 0}
              onChange={(e) => setBuyerShipping(e.target.checked ? 0 : 4.99)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Free Shipping Guarantee ($0 buyer shipping; fulfillment absorbed in margin)
            </Typography>
          }
        />

        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              RETAIL PRICE TUNER
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: accent }}>
              {fmtUsd(retailPrice)} (Gross: {fmtUsd(simulation.grossRevenue)})
            </Typography>
          </Box>
          <Slider
            value={Math.min(150, Math.max(5, Number(retailPrice) || 5))}
            min={5}
            max={150}
            step={0.5}
            onChange={(_, v) => setRetailPrice(Number(v))}
            aria-label="Retail Price"
            sx={{ color: accent }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              TIKTOK CREATOR AFFILIATE COMMISSION
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: resolveModeAccent(SOV.cyber, isDark) }}>
              {simulation.safeAffiliate}% (+ 6% Referral = {(6 + simulation.safeAffiliate).toFixed(0)}%)
            </Typography>
          </Box>
          <Slider
            value={simulation.safeAffiliate}
            min={0}
            max={30}
            step={1}
            onChange={(_, v) => setTiktokAffiliatePct(Number(v))}
            aria-label="TikTok Creator Affiliate Percent"
            sx={{ color: resolveModeAccent(SOV.cyber, isDark) }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <SovereignKeyValueGrid
          cols={2}
          accent={ACCENT_RAW}
          items={[
            { label: 'Gross Revenue', value: fmtUsd(simulation.grossRevenue), badge: 'Item+Ship' },
            { label: 'Total POD COGS', value: fmtUsd(simulation.totalCogs), badge: 'Landed' },
            {
              label: 'Shopify Basic Amort.',
              value: `${fmtUsd(SHOPIFY_BASIC_MONTHLY / simulation.safeOrders)}/ord`,
              badge: '$39/mo',
            },
            {
              label: 'Shopify Grow Crossover',
              value: simulation.growCrossoverOrders ? `${simulation.growCrossoverOrders} ord/mo` : 'N/A',
              badge: 'vs Basic',
            },
          ]}
        />
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="REVERSE SOLVER & ACQUISITION CONTROLS"
        title="Target Margin & Paid Ad Ceilings"
        subtitle="Configure target net margin (15%–60%) and store conversion rate to solve required retail price, ROAS, CPA, and CPC"
        accent={SOV.gold}
        right={<CalculateIcon sx={{ color: resolveModeAccent(SOV.gold, isDark) }} />}
      >
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              TARGET NET MARGIN FLOOR (15% – 60%)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: resolveModeAccent(SOV.gold, isDark) }}>
              {simulation.safeTarget}% NET
            </Typography>
          </Box>
          <Slider
            value={simulation.safeTarget}
            min={15}
            max={60}
            step={1}
            onChange={(_, v) => setTargetMarginPct(Number(v))}
            aria-label="Target Net Margin Percent"
            sx={{ color: resolveModeAccent(SOV.gold, isDark) }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
            {[20, 30, 35, 40, 50].map((m) => {
              const active = simulation.safeTarget === m;
              return (
                <Chip
                  key={m}
                  label={`${m}% Target`}
                  clickable
                  onClick={() => setTargetMarginPct(m)}
                  sx={{
                    minHeight: 34,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(SOV.gold, 0.16) : 'transparent',
                    color: active ? resolveModeAccent(SOV.gold, isDark) : 'text.primary',
                    border: `1px solid ${active ? resolveModeAccent(SOV.gold, isDark) : 'rgba(148,163,184,0.32)'}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              STORE CONVERSION RATE (CVR FOR MAX CPC)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: resolveModeAccent(SOV.cyber, isDark) }}>
              {simulation.safeCvr.toFixed(1)}% CVR
            </Typography>
          </Box>
          <Slider
            value={simulation.safeCvr}
            min={0.5}
            max={10}
            step={0.1}
            onChange={(_, v) => setCvrPct(Number(v))}
            aria-label="Store Conversion Rate"
            sx={{ color: resolveModeAccent(SOV.cyber, isDark) }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          PROMO COUPON STRESS TEST (ETSY ORGANIC VS SHOPIFY BASIC)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
          {simulation.couponStress.map((row) => (
            <Box
              key={row.pctOff}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 1.25,
                py: 0.85,
                borderRadius: 1.5,
                bgcolor: isDark ? '#080A11' : '#F8F5EE',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.09)'}`,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700 }}>
                {row.pctOff}% OFF → {fmtUsd(row.discountedRetail)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Etsy: ${row.etsyMargin.toFixed(1)}%`}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    bgcolor: rgba(row.etsySafe ? SOV.emerald : SOV.crimson, 0.14),
                    color: resolveModeAccent(row.etsySafe ? SOV.emerald : SOV.crimson, isDark),
                  }}
                />
                <Chip
                  size="small"
                  label={`Shopify: ${row.shopMargin.toFixed(1)}%`}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    bgcolor: rgba(row.shopSafe ? SOV.emerald : SOV.crimson, 0.14),
                    color: resolveModeAccent(row.shopSafe ? SOV.emerald : SOV.crimson, isDark),
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {simulation.dangerChannels.length > 0 && (
        <SovereignAlertBanner
          severity="error"
          title={`Margin Danger Alert · ${simulation.dangerChannels.length} Channel(s) Below ${DANGER_MARGIN_PCT}% Net Margin`}
          message={`At ${fmtUsd(retailPrice)} retail (${fmtUsd(simulation.totalCogs)} COGS), ${simulation.dangerChannels
            .map((c) => `${c.name} (${c.netMarginPct.toFixed(1)}%)`)
            .join(', ')} fall below the ${DANGER_MARGIN_PCT}% safety floor. Raise retail price using the Reverse Solver below or reduce fulfillment cost.`}
        />
      )}

      <SovereignCard
        index="03"
        eyebrow="5-CHANNEL 2026 FEE & PROFIT MATRIX"
        title="Side-by-Side Channel Economics"
        subtitle="Exact fee deduction, net profit per order, net margin %, and projected monthly net profit across all 5 sales rails"
        accent={ACCENT_RAW}
        right={<TrendingUpIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <SovereignGauge
            value={Math.max(0, Math.min(100, Number(simulation.avgMarginPct.toFixed(1))))}
            max={100}
            label="AVG MARGIN"
            unit="%"
            status={simulation.dangerChannels.length > 0 ? `${simulation.dangerChannels.length} DANGER` : 'ALL SAFE'}
            thresholds={{ warn: 25, danger: 15 }}
            invertThresholds
            size={136}
          />
          <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {simulation.channels.map((ch) => {
              const col = healthColor(ch.health);
              const modeCol = resolveModeAccent(col, isDark);
              const pctWidth = Math.max(0, Math.min(100, ch.netMarginPct));
              const isBest = ch.id === simulation.bestChannel.id;
              return (
                <Box key={ch.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.35 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.name}
                      </Typography>
                      {isBest && (
                        <Chip
                          size="small"
                          label="TOP"
                          sx={{
                            height: 18,
                            fontFamily: MONO,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            bgcolor: rgba(SOV.emerald, 0.16),
                            color: resolveModeAccent(SOV.emerald, isDark),
                          }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: modeCol, whiteSpace: 'nowrap' }}>
                      {fmtUsd(ch.netProfit)} · {ch.netMarginPct.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pctWidth}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: modeCol },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(16,24,40,0.1)'}`,
            overflowX: 'auto',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Channel', 'Fee Model', 'Total Fees', 'Net / Ord', 'Margin', 'Monthly Net', 'Status'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i >= 2 && i <= 5 ? 'right' : 'left'}
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      bgcolor: isDark ? '#0B0F1A' : '#F6F3EC',
                      color: accent,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {simulation.channels.map((ch) => {
                const col = healthColor(ch.health);
                const modeCol = resolveModeAccent(col, isDark);
                return (
                  <TableRow
                    key={ch.id}
                    hover
                    sx={{
                      bgcolor: ch.isDanger
                        ? isDark
                          ? rgba(SOV.crimson, 0.06)
                          : rgba(SOV.crimson, 0.04)
                        : 'transparent',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {ch.name}
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {ch.feeFormula}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                      {fmtUsd(ch.totalFees)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: modeCol }}>
                      {fmtUsd(ch.netProfit)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: modeCol }}>
                      {ch.netMarginPct.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 600 }}>
                      {fmtUsd(ch.monthlyNetProfit)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={
                          ch.isDanger ? (
                            <WarningAmberIcon sx={{ fontSize: '13px !important', color: `${modeCol} !important` }} />
                          ) : (
                            <CheckCircleOutlineIcon sx={{ fontSize: '13px !important', color: `${modeCol} !important` }} />
                          )
                        }
                        label={ch.health === 'DANGER' ? `<${DANGER_MARGIN_PCT}%` : ch.health}
                        sx={{
                          height: 22,
                          fontFamily: MONO,
                          fontSize: '0.63rem',
                          fontWeight: 800,
                          bgcolor: rgba(col, isDark ? 0.14 : 0.1),
                          color: modeCol,
                          border: `1px solid ${rgba(modeCol, 0.35)}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow={`BREAK-EVEN & ${simulation.safeTarget}% TARGET-MARGIN REVERSE SOLVER`}
        title="Required Retail Price, ROAS & Ad Ceilings"
        subtitle={`Exact retail price required per channel for 0% break-even and ${simulation.safeTarget}% net margin, plus max CPA & CPC at ${simulation.safeCvr.toFixed(1)}% CVR`}
        accent={SOV.gold}
      >
        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(16,24,40,0.1)'}`,
            overflowX: 'auto',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  'Channel',
                  'Break-Even Retail',
                  `Target (${simulation.safeTarget}%) Retail`,
                  'Price Delta',
                  'Break-Even ROAS',
                  'Max CPA',
                  `Max CPC (${simulation.safeCvr.toFixed(1)}%)`,
                ].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 0 ? 'left' : 'right'}
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      bgcolor: isDark ? '#0B0F1A' : '#F6F3EC',
                      color: resolveModeAccent(SOV.gold, isDark),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {simulation.channels.map((ch) => {
                const needsRaise = ch.retailGapToTarget != null && ch.retailGapToTarget > 0.01;
                const deltaColor = resolveModeAccent(
                  ch.targetRetail == null ? SOV.crimson : needsRaise ? SOV.amber : SOV.emerald,
                  isDark,
                );
                return (
                  <TableRow key={ch.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {ch.name}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                      {ch.breakEvenRetail != null ? fmtUsd(ch.breakEvenRetail) : 'N/A'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800 }}>
                      {ch.targetRetail != null ? fmtUsd(ch.targetRetail) : 'Infeasible'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: deltaColor, whiteSpace: 'nowrap' }}>
                      {ch.targetRetail == null
                        ? 'Fee+Target >= 100%'
                        : needsRaise
                          ? `+${fmtUsd(ch.retailGapToTarget)}`
                          : 'Target Met'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                      {ch.breakEvenRoas != null ? `${ch.breakEvenRoas.toFixed(2)}×` : 'Loss'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700 }}>
                      {fmtUsd(ch.maxCpa)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                      {fmtUsd(ch.maxCpc)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() => downloadText(csvText, 'pod-margin-matrix.csv', 'text/csv;charset=utf-8')}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: accent,
              borderColor: rgba(accent, 0.45),
            }}
          >
            Export pod-margin-matrix.csv
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() => downloadJson(auditJson, 'pod-margin-audit.json')}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: resolveModeAccent(SOV.gold, isDark),
              borderColor: rgba(resolveModeAccent(SOV.gold, isDark), 0.45),
            }}
          >
            Export pod-margin-audit.json
          </Button>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="LOCAL LOOPBACK DAEMON & MCP STDIO (:8120)"
        title="POD Margin Sentinel CLI & Export Reference"
        subtitle="Mirror this exact simulation against the local zero-dependency Python daemon or register the 5-tool MCP server"
        accent={SOV.cyber}
      >
        <SovereignCodeBlock
          title="pod-margin-sentinel-cli.sh"
          badge="CLI :8120"
          code={cliSnippet}
          filename="pod-margin-sentinel-cli.sh"
          accent={SOV.cyber}
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
          title="Runtime Scope · 100% Client-Side 2026 Multi-Channel Fee & Reverse Margin Solver"
          message="All 5-channel fee waterfalls (Etsy Organic, Etsy 15% Offsite Ads, Shopify Basic/Grow, TikTok Shop), break-even ROAS/CPA/CPC reverse calculations, and CSV/JSON exports execute deterministically in your browser with zero remote network requests. Optional loopback HTTP API & MCP stdio execution runs locally via pod-margin-sentinel (:8120)."
        />
      </Box>
      <SovereignWorkstationShell
        id="pod-margin-sentinel"
        category="COMMERCE & MCP · FEE & MARGIN ENGINE (:8120)"
        title="POD Margin Sentinel & 2026 Multi-Channel Profit Solver"
        subtitle="Compare unit economics side-by-side across Etsy Organic, Etsy 15% Offsite Ads, Shopify Basic, Shopify Grow, and TikTok Shop — with reverse target-margin pricing, break-even ROAS, and CSV/JSON audit export."
        version="2.5.0"
        variant="bayer-field"
        accent={ACCENT_RAW}
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
