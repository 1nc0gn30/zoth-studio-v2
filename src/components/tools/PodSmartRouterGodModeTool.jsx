import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  SovereignPresetBar,
  SovereignDataTable,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.gold;

const SKU_CATALOG = [
  {
    id: 'unisex-tee',
    label: 'Unisex Tee',
    badge: 'BC3001',
    defaultRetail: 30.0,
    vendors: {
      printify: { unit: 9.85, usShip: 4.75, addlShip: 2.09, intlShip: 10.9, slaBase: 2, reliability: 95 },
      gelato: { unit: 11.4, usShip: 4.95, addlShip: 1.95, intlShip: 5.4, slaBase: 2, reliability: 97 },
      printful: { unit: 12.95, usShip: 4.69, addlShip: 2.2, intlShip: 8.99, slaBase: 3, reliability: 96 },
    },
  },
  {
    id: 'heavy-hoodie',
    label: 'Heavy Hoodie',
    badge: '18500',
    defaultRetail: 54.0,
    vendors: {
      printify: { unit: 20.4, usShip: 8.49, addlShip: 2.95, intlShip: 16.5, slaBase: 2, reliability: 95 },
      gelato: { unit: 23.1, usShip: 7.9, addlShip: 2.6, intlShip: 8.4, slaBase: 2, reliability: 96 },
      printful: { unit: 25.5, usShip: 7.99, addlShip: 2.75, intlShip: 12.95, slaBase: 3, reliability: 97 },
    },
  },
  {
    id: 'matte-poster',
    label: 'Matte Poster 18×24',
    badge: 'Wall Art',
    defaultRetail: 36.0,
    vendors: {
      printify: { unit: 10.2, usShip: 5.49, addlShip: 1.4, intlShip: 14.2, slaBase: 2, reliability: 94 },
      gelato: { unit: 10.6, usShip: 5.2, addlShip: 1.1, intlShip: 5.5, slaBase: 1, reliability: 98 },
      printful: { unit: 12.4, usShip: 5.99, addlShip: 1.5, intlShip: 11.5, slaBase: 3, reliability: 95 },
    },
  },
  {
    id: 'framed-poster',
    label: 'Framed Print 18×24',
    badge: 'Oak Frame',
    defaultRetail: 62.0,
    vendors: {
      printify: { unit: 22.9, usShip: 9.8, addlShip: 4.2, intlShip: 24.5, slaBase: 3, reliability: 93 },
      gelato: { unit: 21.8, usShip: 7.4, addlShip: 2.8, intlShip: 7.9, slaBase: 2, reliability: 98 },
      printful: { unit: 27.5, usShip: 10.49, addlShip: 4.5, intlShip: 18.5, slaBase: 4, reliability: 95 },
    },
  },
  {
    id: 'ceramic-mug',
    label: '11oz Ceramic Mug',
    badge: 'Drinkware',
    defaultRetail: 20.0,
    vendors: {
      printify: { unit: 5.45, usShip: 5.99, addlShip: 2.4, intlShip: 13.5, slaBase: 2, reliability: 95 },
      gelato: { unit: 6.1, usShip: 5.6, addlShip: 2.1, intlShip: 5.8, slaBase: 2, reliability: 97 },
      printful: { unit: 6.95, usShip: 6.49, addlShip: 2.5, intlShip: 10.9, slaBase: 3, reliability: 96 },
    },
  },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', dutyPct: 0, brokerage: 0, printifyLocal: true, gelatoLocal: true, printfulLocal: true },
  { code: 'DE', name: 'Germany', dutyPct: 0.08, brokerage: 11.5, printifyLocal: false, gelatoLocal: true, printfulLocal: true },
  { code: 'GB', name: 'United Kingdom', dutyPct: 0.09, brokerage: 12.0, printifyLocal: true, gelatoLocal: true, printfulLocal: true },
  { code: 'FR', name: 'France', dutyPct: 0.08, brokerage: 11.5, printifyLocal: false, gelatoLocal: true, printfulLocal: true },
  { code: 'CA', name: 'Canada', dutyPct: 0.07, brokerage: 9.5, printifyLocal: true, gelatoLocal: true, printfulLocal: true },
  { code: 'AU', name: 'Australia', dutyPct: 0.1, brokerage: 13.0, printifyLocal: false, gelatoLocal: true, printfulLocal: true },
  { code: 'JP', name: 'Japan', dutyPct: 0.08, brokerage: 10.0, printifyLocal: false, gelatoLocal: true, printfulLocal: true },
  { code: 'SE', name: 'Sweden', dutyPct: 0.08, brokerage: 12.0, printifyLocal: false, gelatoLocal: true, printfulLocal: false },
  { code: 'BR', name: 'Brazil', dutyPct: 0.2, brokerage: 15.0, printifyLocal: false, gelatoLocal: true, printfulLocal: false },
  { code: 'SG', name: 'Singapore', dutyPct: 0.09, brokerage: 10.5, printifyLocal: false, gelatoLocal: true, printfulLocal: false },
];

const OBJECTIVES = [
  { id: 'lowest-cost', label: 'Lowest Landed Cost', weights: { cost: 0.6, speed: 0.15, tariff: 0.15, reliability: 0.1 } },
  { id: 'fastest', label: 'Fastest Delivery', weights: { cost: 0.15, speed: 0.6, tariff: 0.15, reliability: 0.1 } },
  { id: 'zero-tariff', label: 'Zero-Tariff Domestic', weights: { cost: 0.2, speed: 0.2, tariff: 0.5, reliability: 0.1 } },
  { id: 'balanced', label: 'Balanced Score', weights: { cost: 0.35, speed: 0.3, tariff: 0.2, reliability: 0.15 } },
];

const SCENARIO_PRESETS = [
  {
    id: 'us-apparel',
    label: 'US Tee Rush',
    badge: 'Printify Win',
    skuId: 'unisex-tee',
    country: 'US',
    qty: 3,
    retailPrice: 30,
    buyerShip: 4.99,
    printifyPremium: true,
    objective: 'lowest-cost',
  },
  {
    id: 'eu-framed-art',
    label: 'Germany Framed Art',
    badge: 'Gelato Win',
    skuId: 'framed-poster',
    country: 'DE',
    qty: 1,
    retailPrice: 64,
    buyerShip: 0,
    printifyPremium: true,
    objective: 'zero-tariff',
  },
  {
    id: 'au-poster-pack',
    label: 'Australia Wall Print',
    badge: 'APAC Local',
    skuId: 'matte-poster',
    country: 'AU',
    qty: 2,
    retailPrice: 38,
    buyerShip: 4.5,
    printifyPremium: false,
    objective: 'fastest',
  },
  {
    id: 'uk-hoodie-balanced',
    label: 'UK Heavy Hoodie',
    badge: 'Balanced',
    skuId: 'heavy-hoodie',
    country: 'GB',
    qty: 2,
    retailPrice: 56,
    buyerShip: 5.95,
    printifyPremium: true,
    objective: 'balanced',
  },
];

const VENDOR_META = [
  { id: 'printify', label: 'Printify (:8115)', endpoint: 'http://127.0.0.1:8115/api/draft', accent: '#29B473' },
  { id: 'gelato', label: 'Gelato (:8116)', endpoint: 'http://127.0.0.1:8116/api/orders', accent: SOV.cyber },
  { id: 'printful', label: 'Printful (v2 API)', endpoint: 'https://api.printful.com/v2/orders', accent: SOV.amber },
];

export default function PodSmartRouterGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  // Order configurator state
  const [activePresetId, setActivePresetId] = useState(SCENARIO_PRESETS[0].id);
  const [skuId, setSkuId] = useState(SCENARIO_PRESETS[0].skuId);
  const [countryCode, setCountryCode] = useState(SCENARIO_PRESETS[0].country);
  const [quantity, setQuantity] = useState(SCENARIO_PRESETS[0].qty);
  const [retailPrice, setRetailPrice] = useState(SCENARIO_PRESETS[0].retailPrice);
  const [buyerShipping, setBuyerShipping] = useState(SCENARIO_PRESETS[0].buyerShip);
  const [printifyPremium, setPrintifyPremium] = useState(SCENARIO_PRESETS[0].printifyPremium);
  const [objectiveId, setObjectiveId] = useState(SCENARIO_PRESETS[0].objective);

  // Routing Policy Engine rules
  const [fallbackThreshold, setFallbackThreshold] = useState(65);
  const [maxTransitDays, setMaxTransitDays] = useState(7);
  const [domesticOnlyCountries, setDomesticOnlyCountries] = useState(['DE', 'FR', 'GB', 'AU', 'JP', 'BR']);
  const [autoFailoverSla, setAutoFailoverSla] = useState(true);
  const [exportTab, setExportTab] = useState('policy');

  const activeSku = useMemo(
    () => SKU_CATALOG.find((s) => s.id === skuId) || SKU_CATALOG[0],
    [skuId],
  );

  const activeCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  const activeObjective = useMemo(
    () => OBJECTIVES.find((o) => o.id === objectiveId) || OBJECTIVES[3],
    [objectiveId],
  );

  const loadPreset = (preset) => {
    setActivePresetId(preset.id);
    setSkuId(preset.skuId);
    setCountryCode(preset.country);
    setQuantity(preset.qty);
    setRetailPrice(preset.retailPrice);
    setBuyerShipping(preset.buyerShip);
    setPrintifyPremium(preset.printifyPremium);
    setObjectiveId(preset.objective);
  };

  const toggleDomesticCountry = (code) => {
    setDomesticOnlyCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // Deterministic Weighted Multi-Vendor Scoring Matrix
  const evaluation = useMemo(() => {
    const qty = Math.max(1, Number(quantity) || 1);
    const grossRev = Math.max(0, Number(retailPrice) || 0) * qty + Math.max(0, Number(buyerShipping) || 0);
    const declaredGoodsUsd = Math.max(0, Number(retailPrice) || 0) * qty;
    const enforceDomestic = domesticOnlyCountries.includes(activeCountry.code);

    const rawVendors = VENDOR_META.map((vm) => {
      const cfg = activeSku.vendors[vm.id];
      const isDomestic =
        vm.id === 'printify'
          ? activeCountry.printifyLocal
          : vm.id === 'gelato'
          ? activeCountry.gelatoLocal
          : activeCountry.printfulLocal;

      const unitPrice = vm.id === 'printify' && printifyPremium ? cfg.unit * 0.8 : cfg.unit;
      const productionTotal = unitPrice * qty;

      const baseShip = isDomestic ? cfg.usShip : cfg.intlShip;
      const shippingTotal = baseShip + (qty - 1) * cfg.addlShip;

      const customsDuty = isDomestic ? 0 : declaredGoodsUsd * activeCountry.dutyPct + activeCountry.brokerage;
      const landedCost = productionTotal + shippingTotal + customsDuty;

      const transitDays = isDomestic
        ? cfg.slaBase + (activeCountry.code === 'US' ? 2 : 2)
        : cfg.slaBase + (activeCountry.code === 'AU' || activeCountry.code === 'BR' ? 11 : 8);

      const netProfit = grossRev - landedCost;
      const netMarginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;

      const breachesMaxTransit = transitDays > maxTransitDays;
      const breachesDomesticPolicy = enforceDomestic && !isDomestic;

      return {
        ...vm,
        isDomestic,
        hubLabel: isDomestic ? `${activeCountry.code} Local Hub` : 'US Cross-Border',
        unitPrice,
        productionTotal,
        shippingTotal,
        customsDuty,
        landedCost,
        transitDays,
        reliability: cfg.reliability,
        netProfit,
        netMarginPct,
        breachesMaxTransit,
        breachesDomesticPolicy,
      };
    });

    const minLanded = Math.min(...rawVendors.map((v) => v.landedCost));
    const maxLanded = Math.max(...rawVendors.map((v) => v.landedCost));
    const minDays = Math.min(...rawVendors.map((v) => v.transitDays));
    const maxDays = Math.max(...rawVendors.map((v) => v.transitDays));
    const w = activeObjective.weights;

    const scored = rawVendors.map((v) => {
      // Normalized 0..100 sub-scores
      const costScore =
        maxLanded > minLanded
          ? 100 - ((v.landedCost - minLanded) / (maxLanded - minLanded)) * 60
          : 100;
      const speedScore =
        maxDays > minDays
          ? 100 - ((v.transitDays - minDays) / (maxDays - minDays)) * 65
          : 100;
      const tariffScore = v.isDomestic ? 100 : Math.max(15, 60 - activeCountry.dutyPct * 200);
      const reliabilityScore = v.reliability;

      let weighted =
        costScore * w.cost +
        speedScore * w.speed +
        tariffScore * w.tariff +
        reliabilityScore * w.reliability;

      // Apply policy guardrails
      if (v.breachesDomesticPolicy) weighted -= 22;
      if (autoFailoverSla && v.breachesMaxTransit) weighted -= 14;

      const finalScore = Math.max(0, Math.min(100, Number(weighted.toFixed(1))));
      return {
        ...v,
        costScore: Number(costScore.toFixed(1)),
        speedScore: Number(speedScore.toFixed(1)),
        tariffScore: Number(tariffScore.toFixed(1)),
        finalScore,
      };
    });

    const ranked = [...scored].sort((a, b) => b.finalScore - a.finalScore || a.landedCost - b.landedCost);
    const winner = ranked[0];
    const runnerUp = ranked[1];
    const tertiary = ranked[2];

    const savingsVsRunnerUp = runnerUp.landedCost - winner.landedCost;
    const daysDeltaVsRunnerUp = runnerUp.transitDays - winner.transitDays;
    const scoreGap = winner.finalScore - runnerUp.finalScore;

    const decisionReasons = [];
    if (savingsVsRunnerUp > 0.05) {
      decisionReasons.push(`saves $${savingsVsRunnerUp.toFixed(2)} in landed cost vs ${runnerUp.label}`);
    } else if (savingsVsRunnerUp < -0.05) {
      decisionReasons.push(`costs $${Math.abs(savingsVsRunnerUp).toFixed(2)} more than ${runnerUp.label} but wins on ${activeObjective.label}`);
    }
    if (daysDeltaVsRunnerUp > 0) {
      decisionReasons.push(`delivers ${daysDeltaVsRunnerUp} day(s) faster (${winner.transitDays}d SLA)`);
    }
    if (winner.isDomestic) {
      decisionReasons.push(`fulfills domestically in ${activeCountry.name} with $0 import tariff`);
    }
    if (winner.id === 'printify' && printifyPremium) {
      decisionReasons.push('Printify Premium −20% production discount active');
    }

    const decisionSummary = `${winner.label} selected (${winner.finalScore}/100) for ${qty}× ${activeSku.label} → ${activeCountry.name}: ${decisionReasons.join('; ')}.`;

    const tableRows = ranked.map((v, idx) => {
      const marginDelta = v.netProfit - runnerUp.netProfit;
      const role = idx === 0 ? 'PASS · WINNER' : v.finalScore >= fallbackThreshold ? `WARN · FALLBACK #${idx}` : 'FAIL · BELOW THRESH';
      return {
        id: v.id,
        vendor: idx === 0 ? `${v.label} ★` : v.label,
        hub: v.hubLabel,
        unitShip: `$${v.productionTotal.toFixed(2)} + $${v.shippingTotal.toFixed(2)}`,
        duty: v.customsDuty > 0 ? `$${v.customsDuty.toFixed(2)}` : '$0.00',
        landed: `$${v.landedCost.toFixed(2)}`,
        sla: `${v.transitDays}d`,
        netProfit: `${v.netProfit < 0 ? '-' : ''}$${Math.abs(v.netProfit).toFixed(2)} (${v.netMarginPct.toFixed(0)}%)`,
        marginDelta: idx === 0 ? `${savingsVsRunnerUp >= 0 ? '+' : '-'}$${Math.abs(savingsVsRunnerUp).toFixed(2)} vs #2` : `${marginDelta >= 0 ? '+' : '-'}$${Math.abs(marginDelta).toFixed(2)}`,
        score: `${v.finalScore}/100`,
        status: role,
      };
    });

    return {
      qty,
      grossRev,
      ranked,
      winner,
      runnerUp,
      tertiary,
      savingsVsRunnerUp,
      daysDeltaVsRunnerUp,
      scoreGap,
      decisionSummary,
      tableRows,
    };
  }, [
    quantity,
    retailPrice,
    buyerShipping,
    domesticOnlyCountries,
    activeCountry,
    activeSku,
    printifyPremium,
    maxTransitDays,
    activeObjective,
    autoFailoverSla,
    fallbackThreshold,
  ]);

  // Exportable Routing Policy Engine JSON
  const routingPolicyJson = useMemo(
    () => ({
      schema: 'zoth.pod.routing_policy.v2',
      engine: 'pod-smart-router',
      port: 8117,
      objective: activeObjective.id,
      weights: activeObjective.weights,
      rules: {
        fallback_score_threshold: fallbackThreshold,
        max_transit_days: maxTransitDays,
        auto_failover_on_sla_breach: autoFailoverSla,
        printify_premium_enabled: printifyPremium,
        domestic_only_countries: domesticOnlyCountries,
      },
      vendors: {
        printify: { local_bridge: 'http://127.0.0.1:8115', premium_discount_pct: printifyPremium ? 20 : 0 },
        gelato: { local_bridge: 'http://127.0.0.1:8116', local_countries_count: 32 },
        printful: { api_base: 'https://api.printful.com/v2', fallback_enabled: true },
      },
      active_evaluation: {
        sku: activeSku.id,
        destination_country: activeCountry.code,
        quantity: evaluation.qty,
        winner: evaluation.winner.id,
        winner_score: evaluation.winner.finalScore,
        winner_landed_usd: Number(evaluation.winner.landedCost.toFixed(2)),
        fallback_chain: evaluation.ranked.map((v) => ({
          vendor: v.id,
          score: v.finalScore,
          landed_usd: Number(v.landedCost.toFixed(2)),
          transit_days: v.transitDays,
          domestic: v.isDomestic,
        })),
      },
    }),
    [
      activeObjective,
      fallbackThreshold,
      maxTransitDays,
      autoFailoverSla,
      printifyPremium,
      domesticOnlyCountries,
      activeSku,
      activeCountry,
      evaluation,
    ],
  );

  const dispatchCurl = useMemo(() => {
    const body = {
      sku: activeSku.id,
      destination_country: activeCountry.code,
      quantity: evaluation.qty,
      retail_unit_usd: Number(retailPrice),
      buyer_shipping_usd: Number(buyerShipping),
      objective: activeObjective.id,
      printify_premium: printifyPremium,
      policy: {
        fallback_score_threshold: fallbackThreshold,
        max_transit_days: maxTransitDays,
        domestic_only_countries: domesticOnlyCountries,
      },
    };
    return `# Dispatch routing decision to local POD Smart Router daemon (:8117)
curl -X POST "http://127.0.0.1:8117/api/route" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body)}'

# Start local pod-smart-router + companion connectors (:8115 / :8116 / :8117)
cd ~/NullAITech/pod-smart-router && python3 server.py --port 8117
pod-smart-router route --sku ${activeSku.id} --country ${activeCountry.code} --qty ${evaluation.qty} --objective ${activeObjective.id}`;
  }, [
    activeSku,
    activeCountry,
    evaluation.qty,
    retailPrice,
    buyerShipping,
    activeObjective,
    printifyPremium,
    fallbackThreshold,
    maxTransitDays,
    domesticOnlyCountries,
  ]);

  const kpis = [
    {
      label: 'Winning Vendor',
      value: evaluation.winner.id.toUpperCase(),
      unit: `${evaluation.winner.finalScore}/100 · ${evaluation.winner.hubLabel}`,
      accent: evaluation.winner.accent,
    },
    {
      label: 'Winner Landed Cost',
      value: `$${evaluation.winner.landedCost.toFixed(2)}`,
      unit:
        evaluation.savingsVsRunnerUp >= 0
          ? `Saves $${evaluation.savingsVsRunnerUp.toFixed(2)} vs #2`
          : `+$${Math.abs(evaluation.savingsVsRunnerUp).toFixed(2)} vs #2`,
      accent: SOV.emerald,
    },
    {
      label: 'Winner Net Profit',
      value: `${evaluation.winner.netProfit < 0 ? '-' : ''}$${Math.abs(evaluation.winner.netProfit).toFixed(2)}`,
      unit: `${evaluation.winner.netMarginPct.toFixed(1)}% net margin`,
      accent: evaluation.winner.netProfit > 0 ? SOV.gold : SOV.crimson,
    },
    {
      label: 'SLA Transit',
      value: `${evaluation.winner.transitDays} days`,
      unit: evaluation.winner.isDomestic ? 'Zero-Tariff Domestic' : 'Cross-Border',
      accent: SOV.cyber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={evaluation.winner.finalScore >= fallbackThreshold ? 'online' : 'standby'}
        label={`ROUTE → ${evaluation.winner.label.toUpperCase()} (${evaluation.winner.finalScore}/100) · FALLBACK: ${evaluation.runnerUp.id.toUpperCase()} → ${evaluation.tertiary.id.toUpperCase()}`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download routing-policy.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(routingPolicyJson, 'routing-policy.json'),
      primary: true,
    },
    {
      label: copied === 'curl' ? 'Copied :8117 Dispatch curl' : 'Copy :8117 Dispatch curl',
      icon: copied === 'curl' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(dispatchCurl, 'curl'),
    },
    {
      label: copied === 'policy' ? 'Copied Policy JSON' : 'Copy Policy JSON',
      icon: copied === 'policy' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(JSON.stringify(routingPolicyJson, null, 2), 'policy'),
    },
    {
      label: 'pod-smart-router on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/pod-smart-router',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="INCOMING ORDER SIMULATOR"
        title="SKU, Destination & Priority Objective"
        subtitle="Configure an incoming order to dynamically route across Printify (:8115), Gelato (:8116), and Printful"
        accent={ACCENT_RAW}
        right={<AccountTreeIcon sx={{ color: accent }} />}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={SCENARIO_PRESETS}
            activeId={activePresetId}
            onSelect={loadPreset}
            onReset={() => loadPreset(SCENARIO_PRESETS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          SKU TYPE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {SKU_CATALOG.map((sku) => {
            const active = sku.id === skuId;
            return (
              <Chip
                key={sku.id}
                label={`${sku.label} · ${sku.badge}`}
                clickable
                onClick={() => {
                  setSkuId(sku.id);
                  setRetailPrice(sku.defaultRetail);
                }}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.69rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          BUYER DESTINATION COUNTRY
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 1.75 }}>
          {COUNTRIES.map((c) => {
            const active = c.code === countryCode;
            return (
              <Chip
                key={c.code}
                label={`${c.code} · ${c.name}`}
                clickable
                onClick={() => setCountryCode(c.code)}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.cyber, 0.18) : 'transparent',
                  color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.primary',
                  border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          ROUTING PRIORITY OBJECTIVE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {OBJECTIVES.map((obj) => {
            const active = obj.id === objectiveId;
            return (
              <Chip
                key={obj.id}
                label={obj.label}
                clickable
                onClick={() => setObjectiveId(obj.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.18) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.35)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.25 }}>
          <TextField
            size="small"
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
            inputProps={{ min: 1, max: 50 }}
            sx={{ flex: '1 1 90px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Unit Retail ($)"
            value={retailPrice}
            onChange={(e) => setRetailPrice(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: 0.5, min: 0 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Buyer Shipping ($)"
            value={buyerShipping}
            onChange={(e) => setBuyerShipping(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: 0.5, min: 0 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={printifyPremium}
              onChange={(e) => setPrintifyPremium(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.primary' }}>
              Printify Premium Active (−20% Printify production base cost)
            </Typography>
          }
        />
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="ROUTING POLICY ENGINE RULES"
        title="Guardrails & Domestic-Only Enforcement"
        subtitle="Configure fallback score thresholds, SLA transit caps, and zero-tariff domestic country locks"
        accent={SOV.emerald}
        right={<TuneIcon sx={{ color: isDark ? SOV.emerald : '#047857' }} />}
      >
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              FALLBACK SCORE THRESHOLD
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: accent }}>
              {fallbackThreshold} / 100 pts
            </Typography>
          </Box>
          <Slider
            value={fallbackThreshold}
            min={35}
            max={90}
            step={1}
            onChange={(_, v) => setFallbackThreshold(Number(v))}
            aria-label="Fallback Score Threshold"
            sx={{ color: accent }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              MAX ACCEPTABLE TRANSIT SLA
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: isDark ? SOV.cyber : '#0369A1' }}>
              {maxTransitDays} days
            </Typography>
          </Box>
          <Slider
            value={maxTransitDays}
            min={3}
            max={16}
            step={1}
            onChange={(_, v) => setMaxTransitDays(Number(v))}
            aria-label="Max Acceptable Transit Days"
            sx={{ color: isDark ? SOV.cyber : '#0369A1' }}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={autoFailoverSla}
              onChange={(e) => setAutoFailoverSla(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Penalize & auto-failover providers exceeding {maxTransitDays}-day SLA ceiling
            </Typography>
          }
          sx={{ mb: 1.25 }}
        />

        <Divider sx={{ my: 1.25 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          DOMESTIC-ONLY ENFORCED COUNTRIES ({domesticOnlyCountries.length} ACTIVE)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
          {COUNTRIES.filter((c) => c.code !== 'US').map((c) => {
            const locked = domesticOnlyCountries.includes(c.code);
            return (
              <Chip
                key={c.code}
                label={locked ? `${c.code} · Domestic Only` : `${c.code} · Any`}
                clickable
                onClick={() => toggleDomesticCountry(c.code)}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.67rem',
                  fontWeight: locked ? 700 : 500,
                  bgcolor: locked ? rgba(SOV.emerald, 0.16) : 'transparent',
                  color: locked ? (isDark ? SOV.emerald : '#047857') : 'text.secondary',
                  border: `1px solid ${locked ? SOV.emerald : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="DETERMINISTIC DECISION AUDIT & FALLBACK CHAIN"
        title={`Winner: ${evaluation.winner.label}`}
        subtitle={evaluation.decisionSummary}
        accent={evaluation.winner.accent}
        right={<VerifiedIcon sx={{ color: resolveModeAccent(evaluation.winner.accent, isDark) }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1.75 }}>
          <SovereignGauge
            value={evaluation.winner.finalScore}
            max={100}
            label="WINNER SCORE"
            unit="/100"
            status={evaluation.winner.id.toUpperCase()}
            thresholds={{ warn: fallbackThreshold, danger: 45 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            {evaluation.ranked.map((v, idx) => (
              <Box
                key={v.id}
                sx={{
                  p: 1.1,
                  borderRadius: 1.5,
                  border: `1px solid ${idx === 0 ? resolveModeAccent(v.accent, isDark) : 'rgba(148,163,184,0.28)'}`,
                  bgcolor:
                    idx === 0
                      ? rgba(v.accent, isDark ? 0.12 : 0.08)
                      : isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(16,24,40,0.02)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 800 }}>
                    {idx === 0 ? 'PRIMARY' : `FALLBACK #${idx}`} · {v.label}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 800, color: resolveModeAccent(v.accent, isDark) }}>
                    {v.finalScore}/100 · ${v.landedCost.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.4, alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', color: 'text.secondary' }}>
                    Cost {v.costScore} · Speed {v.speedScore} ({v.transitDays}d) · Tariff {v.tariffScore}
                  </Typography>
                  {v.breachesDomesticPolicy && (
                    <Chip
                      size="small"
                      icon={<WarningAmberIcon sx={{ fontSize: '13px !important', color: `${SOV.amber} !important` }} />}
                      label="Cross-Border Penalty"
                      sx={{ height: 20, fontFamily: MONO, fontSize: '0.62rem' }}
                    />
                  )}
                  {!v.breachesDomesticPolicy && !v.breachesMaxTransit && (
                    <Chip
                      size="small"
                      icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important', color: `${SOV.emerald} !important` }} />}
                      label="Policy Compliant"
                      sx={{ height: 20, fontFamily: MONO, fontSize: '0.62rem' }}
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <SovereignKeyValueGrid
          cols={3}
          accent={ACCENT_RAW}
          items={[
            {
              label: 'Objective Weights',
              value: `C:${Math.round(activeObjective.weights.cost * 100)}% S:${Math.round(activeObjective.weights.speed * 100)}% T:${Math.round(activeObjective.weights.tariff * 100)}%`,
              badge: activeObjective.label,
            },
            {
              label: 'Score Margin vs #2',
              value: `+${evaluation.scoreGap.toFixed(1)} pts`,
              badge: evaluation.runnerUp.id.toUpperCase(),
            },
            {
              label: 'Order Gross Revenue',
              value: `$${evaluation.grossRev.toFixed(2)}`,
              badge: `${evaluation.qty}× ${activeSku.badge}`,
            },
          ]}
        />
      </SovereignCard>

      <SovereignDataTable
        eyebrow="WEIGHTED MULTI-VENDOR SCORING MATRIX"
        title={`Printify (:8115) vs Gelato (:8116) vs Printful — ${activeSku.label} → ${activeCountry.name}`}
        filename={`pod-router-${activeSku.id}-${activeCountry.code.toLowerCase()}.csv`}
        accent={ACCENT_RAW}
        maxHeight={260}
        columns={[
          { key: 'vendor', label: 'Vendor' },
          { key: 'hub', label: 'Fulfillment' },
          { key: 'unitShip', label: 'Prod + Ship', mono: true, align: 'right' },
          { key: 'duty', label: 'Est. Duty', mono: true, align: 'right' },
          { key: 'landed', label: 'Landed', mono: true, align: 'right' },
          { key: 'sla', label: 'SLA', mono: true, align: 'right' },
          { key: 'netProfit', label: 'Net Profit', mono: true, align: 'right' },
          { key: 'marginDelta', label: 'Delta', mono: true, align: 'right' },
          { key: 'score', label: 'Score', mono: true, align: 'right' },
          { key: 'status', label: 'Decision' },
        ]}
        rows={evaluation.tableRows}
      />

      <SovereignCard
        index="04"
        eyebrow="ROUTING POLICY ENGINE EXPORT (:8117)"
        title="routing-policy.json & Local Dispatch Snippet"
        subtitle="Download your deterministic routing ruleset or dispatch live evaluations to the local :8117 pod-smart-router daemon"
        accent={SOV.cyber}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          {[
            { id: 'policy', label: 'routing-policy.json' },
            { id: 'dispatch', label: 'Local :8117 Dispatch curl & CLI' },
          ].map((tab) => {
            const active = exportTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setExportTab(tab.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: isDark ? SOV.cyber : '#0369A1', color: isDark ? '#08080B' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.35)' }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {exportTab === 'policy' ? (
          <SovereignCodeBlock
            title="routing-policy.json"
            badge="JSON"
            code={JSON.stringify(routingPolicyJson, null, 2)}
            filename="routing-policy.json"
            accent={ACCENT_RAW}
            maxHeight={280}
          />
        ) : (
          <SovereignCodeBlock
            title="POD-SMART-ROUTER LOCAL DISPATCH (:8117)"
            badge="LOCAL :8117"
            code={dispatchCurl}
            filename="pod-smart-router-dispatch.sh"
            accent={SOV.cyber}
            maxHeight={280}
          />
        )}
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · 100% Client-Side Multi-Vendor POD Scoring & Routing Policy Engine"
          message="Weighted scoring across Printify (:8115), Gelato (:8116), and Printful, customs duty modeling, fallback chain resolution, and routing-policy.json generation run 100% client-side with zero outbound API calls. Live automated dispatch stays strictly on localhost via pod-smart-router (:8117)."
        />
      </Box>
      <SovereignWorkstationShell
        id="pod-smart-router"
        category="COMMERCE & POD · SMART ORDER ROUTER (:8117)"
        title="POD Smart Router & Multi-Vendor Policy Engine"
        subtitle="Deterministically score Printify (:8115), Gelato (:8116), and Printful on landed cost, SLA transit days, and zero-tariff domestic fulfillment — then export your automated routing policy."
        version="2.5.0"
        variant="hex-lattice"
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
