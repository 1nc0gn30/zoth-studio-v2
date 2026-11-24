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
import PrintIcon from '@mui/icons-material/Print';
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import CodeIcon from '@mui/icons-material/Code';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = '#29B473';
const PREMIUM_DISCOUNT_RATE = 0.2;

const BLUEPRINTS = [
  {
    id: 'bc-3001',
    label: 'Bella+Canvas 3001',
    badge: 'BP #12',
    fullName: 'Bella+Canvas 3001 Unisex Jersey Short Sleeve Tee',
    blueprintId: 12,
    category: 'Apparel · DTG',
    defaultVariantId: 18102,
    defaultRetail: 28.0,
    defaultBuyerShip: 4.99,
    printAreaW: 12,
    printAreaH: 16,
    bleedInches: 0.25,
    recommendedPxW: 3600,
    recommendedPxH: 4800,
    defaultTitle: 'Minimalist Geometric Sun Unisex Cotton Tee — Bella+Canvas 3001',
    defaultDescription:
      'Air-combed 100% ring-spun cotton unisex tee printed with water-based DTG pigment inks.\n\n- Soft 4.2 oz/yd² retail fit (Bella+Canvas 3001)\n- Pre-shrunk fabric with side-seamed construction\n- Crisp 300 DPI front chest artwork with tear-away label',
    defaultTags: ['bella canvas 3001', 'minimalist tee', 'unisex cotton shirt', 'dtg graphic tee'],
    providers: [
      { id: 29, name: 'Monster Digital', hub: 'Miami, FL (US)', method: 'DTG', baseCost: 9.85, shipping: 4.75, prodMin: 1, prodMax: 2, rating: 9.7 },
      { id: 39, name: 'SwiftPOD', hub: 'San Jose, CA (US)', method: 'DTG', baseCost: 9.42, shipping: 4.75, prodMin: 2, prodMax: 4, rating: 9.4 },
      { id: 42, name: 'Printed Mint', hub: 'Phoenix, AZ (US)', method: 'DTG', baseCost: 11.45, shipping: 5.25, prodMin: 2, prodMax: 4, rating: 9.5 },
      { id: 2, name: 'Sensaria', hub: 'Salt Lake, UT (US)', method: 'DTG Partner', baseCost: 10.90, shipping: 5.10, prodMin: 2, prodMax: 5, rating: 9.2 },
    ],
  },
  {
    id: 'gildan-18500',
    label: 'Gildan 18500 Hoodie',
    badge: 'BP #77',
    fullName: 'Gildan 18500 Heavy Blend Hooded Sweatshirt',
    blueprintId: 77,
    category: 'Outerwear · DTG',
    defaultVariantId: 32919,
    defaultRetail: 48.0,
    defaultBuyerShip: 6.99,
    printAreaW: 12,
    printAreaH: 14,
    bleedInches: 0.25,
    recommendedPxW: 3600,
    recommendedPxH: 4200,
    defaultTitle: 'Heavy Blend Botanical Back-Print Hoodie — Gildan 18500',
    defaultDescription:
      'Cozy 8.0 oz/yd² 50/50 cotton-poly Heavy Blend fleece hoodie with spacious kangaroo pocket.\n\n- Double-lined hood with color-matched drawcord\n- Air-jet spun yarn for softer feel and reduced pilling\n- High-definition DTG print cured for 50+ wash cycles',
    defaultTags: ['gildan 18500', 'heavy blend hoodie', 'streetwear sweatshirt', 'unisex fleece'],
    providers: [
      { id: 29, name: 'Monster Digital', hub: 'Miami, FL (US)', method: 'DTG', baseCost: 21.12, shipping: 8.49, prodMin: 1, prodMax: 3, rating: 9.7 },
      { id: 39, name: 'SwiftPOD', hub: 'San Jose, CA (US)', method: 'DTG', baseCost: 19.86, shipping: 8.49, prodMin: 2, prodMax: 4, rating: 9.5 },
      { id: 42, name: 'Printed Mint', hub: 'Phoenix, AZ (US)', method: 'DTG', baseCost: 23.40, shipping: 8.95, prodMin: 2, prodMax: 5, rating: 9.4 },
      { id: 2, name: 'Sensaria', hub: 'Salt Lake, UT (US)', method: 'DTG Partner', baseCost: 22.35, shipping: 8.75, prodMin: 3, prodMax: 5, rating: 9.1 },
    ],
  },
  {
    id: 'ceramic-mug-11oz',
    label: '11oz Ceramic Mug',
    badge: 'BP #68',
    fullName: 'White Ceramic Mug 11oz (ORCA Coating)',
    blueprintId: 68,
    category: 'Drinkware · Sublimation',
    defaultVariantId: 33719,
    defaultRetail: 18.5,
    defaultBuyerShip: 5.49,
    printAreaW: 8.5,
    printAreaH: 3.5,
    bleedInches: 0.15,
    recommendedPxW: 2550,
    recommendedPxH: 1050,
    defaultTitle: 'Architectural Grid 11oz Glossy Ceramic Coffee Mug',
    defaultDescription:
      'Durable 11oz white ceramic mug with lead-free glossy ORCA sublimation coating.\n\n- Microwave and top-rack dishwasher safe\n- Full wrap-around vibrant 300 DPI sublimation print\n- Ships in crush-tested protective foam mailer',
    defaultTags: ['11oz ceramic mug', 'coffee mug gift', 'sublimation drinkware', 'studio mug'],
    providers: [
      { id: 29, name: 'Monster Digital', hub: 'Miami, FL (US)', method: 'Sublimation', baseCost: 5.45, shipping: 6.19, prodMin: 2, prodMax: 3, rating: 9.6 },
      { id: 39, name: 'SwiftPOD', hub: 'San Jose, CA (US)', method: 'Sublimation', baseCost: 5.20, shipping: 6.49, prodMin: 2, prodMax: 4, rating: 9.3 },
      { id: 42, name: 'Printed Mint', hub: 'Phoenix, AZ (US)', method: 'Sublimation', baseCost: 5.98, shipping: 5.89, prodMin: 1, prodMax: 3, rating: 9.8 },
      { id: 2, name: 'Sensaria', hub: 'Charlotte, NC (US)', method: 'Sublimation', baseCost: 5.65, shipping: 5.99, prodMin: 2, prodMax: 4, rating: 9.5 },
    ],
  },
  {
    id: 'matte-poster-18x24',
    label: 'Matte Poster 18×24',
    badge: 'BP #282',
    fullName: 'Matte Vertical Archival Poster 18×24 in',
    blueprintId: 282,
    category: 'Wall Art · Giclée',
    defaultVariantId: 43137,
    defaultRetail: 34.0,
    defaultBuyerShip: 0,
    printAreaW: 18,
    printAreaH: 24,
    bleedInches: 0.25,
    recommendedPxW: 5400,
    recommendedPxH: 7200,
    defaultTitle: 'Japandi Terracotta Arch Matte Vertical Poster 18×24',
    defaultDescription:
      'Museum-grade 175 gsm archival matte poster printed with fade-resistant pigment inks.\n\n- 18×24 inch standard gallery frame size\n- Zero-glare matte finish for bright living rooms\n- Shipped rolled in heavy-duty kraft mailing tube',
    defaultTags: ['matte poster 18x24', 'archival wall art', 'vertical print', 'gallery poster'],
    providers: [
      { id: 29, name: 'Monster Digital', hub: 'Miami, FL (US)', method: 'Giclée Partner', baseCost: 11.40, shipping: 6.20, prodMin: 2, prodMax: 4, rating: 9.2 },
      { id: 39, name: 'SwiftPOD', hub: 'San Jose, CA (US)', method: 'Giclée Partner', baseCost: 11.15, shipping: 6.40, prodMin: 2, prodMax: 4, rating: 9.1 },
      { id: 42, name: 'Printed Mint', hub: 'Phoenix, AZ (US)', method: 'Archival Inkjet', baseCost: 12.10, shipping: 5.95, prodMin: 2, prodMax: 4, rating: 9.4 },
      { id: 2, name: 'Sensaria', hub: 'Charlotte, NC (US)', method: 'Archival Giclée', baseCost: 9.76, shipping: 5.49, prodMin: 1, prodMax: 2, rating: 9.8 },
    ],
  },
  {
    id: 'sherpa-blanket',
    label: 'Sherpa Blanket',
    badge: 'BP #522',
    fullName: 'Sherpa Fleece Blanket 50×60 in',
    blueprintId: 522,
    category: 'Home Living · Sublimation',
    defaultVariantId: 68142,
    defaultRetail: 68.0,
    defaultBuyerShip: 0,
    printAreaW: 50,
    printAreaH: 60,
    bleedInches: 1.0,
    recommendedPxW: 7500,
    recommendedPxH: 9000,
    defaultTitle: 'Woven Horizon Luxury Sherpa Fleece Throw Blanket 50×60',
    defaultDescription:
      'Plush 100% polyester fleece front with ultra-soft sherpa backing for cold studio nights.\n\n- Generous 50×60 inch throw blanket footprint\n- Edge-to-edge dye sublimation print with rich color saturation\n- Machine wash cold, tumble dry low',
    defaultTags: ['sherpa blanket', 'fleece throw 50x60', 'cozy home decor', 'printed blanket'],
    providers: [
      { id: 29, name: 'Monster Digital', hub: 'Miami, FL (US)', method: 'Sublimation', baseCost: 27.60, shipping: 9.95, prodMin: 2, prodMax: 4, rating: 9.4 },
      { id: 39, name: 'SwiftPOD', hub: 'San Jose, CA (US)', method: 'Sublimation', baseCost: 26.80, shipping: 10.25, prodMin: 3, prodMax: 5, rating: 9.2 },
      { id: 42, name: 'Printed Mint', hub: 'Phoenix, AZ (US)', method: 'Dye Sub', baseCost: 25.45, shipping: 9.50, prodMin: 2, prodMax: 4, rating: 9.7 },
      { id: 2, name: 'Sensaria', hub: 'Charlotte, NC (US)', method: 'Dye Sub', baseCost: 24.90, shipping: 9.25, prodMin: 2, prodMax: 3, rating: 9.6 },
    ],
  },
];

const CHANNEL_FEES = [
  { id: 'direct', label: 'Direct / 0% Fee', pct: 0, flat: 0 },
  { id: 'shopify', label: 'Shopify (2.9%+$0.30)', pct: 0.029, flat: 0.3 },
  { id: 'etsy', label: 'Etsy (9.5%+$0.45)', pct: 0.095, flat: 0.45 },
];

export default function PrintifyConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  // Blueprint & Comparator state
  const [blueprintId, setBlueprintId] = useState(BLUEPRINTS[0].id);
  const [selectedProviderId, setSelectedProviderId] = useState(BLUEPRINTS[0].providers[0].id);
  const [printifyPremium, setPrintifyPremium] = useState(true);
  const [retailPrice, setRetailPrice] = useState(BLUEPRINTS[0].defaultRetail);
  const [buyerShipping, setBuyerShipping] = useState(BLUEPRINTS[0].defaultBuyerShip);
  const [channelFeeId, setChannelFeeId] = useState('shopify');

  // Artwork 300 DPI & Safe-Zone Auditor state
  const [pxW, setPxW] = useState(BLUEPRINTS[0].recommendedPxW);
  const [pxH, setPxH] = useState(BLUEPRINTS[0].recommendedPxH);
  const [printW, setPrintW] = useState(BLUEPRINTS[0].printAreaW);
  const [printH, setPrintH] = useState(BLUEPRINTS[0].printAreaH);

  // Printify Open API v1 Draft Payload state
  const [shopId, setShopId] = useState('14829041');
  const [productTitle, setProductTitle] = useState(BLUEPRINTS[0].defaultTitle);
  const [productDescription, setProductDescription] = useState(BLUEPRINTS[0].defaultDescription);
  const [artworkImageId, setArtworkImageId] = useState('66f4a812b9c01e4a2d9018ef');
  const [payloadTab, setPayloadTab] = useState('json');
  const [customJsonOverride, setCustomJsonOverride] = useState('');

  const activeBlueprint = useMemo(
    () => BLUEPRINTS.find((b) => b.id === blueprintId) || BLUEPRINTS[0],
    [blueprintId],
  );

  const activeChannelFee = useMemo(
    () => CHANNEL_FEES.find((c) => c.id === channelFeeId) || CHANNEL_FEES[0],
    [channelFeeId],
  );

  const handleSelectBlueprint = (bp) => {
    setBlueprintId(bp.id);
    setSelectedProviderId(bp.providers[0].id);
    setRetailPrice(bp.defaultRetail);
    setBuyerShipping(bp.defaultBuyerShip);
    setPxW(bp.recommendedPxW);
    setPxH(bp.recommendedPxH);
    setPrintW(bp.printAreaW);
    setPrintH(bp.printAreaH);
    setProductTitle(bp.defaultTitle);
    setProductDescription(bp.defaultDescription);
    setCustomJsonOverride('');
  };

  // Provider comparison math
  const comparison = useMemo(() => {
    const grossRev = Math.max(0, Number(retailPrice) || 0) + Math.max(0, Number(buyerShipping) || 0);
    const channelFee = grossRev > 0 ? grossRev * activeChannelFee.pct + activeChannelFee.flat : 0;

    const evaluated = activeBlueprint.providers.map((p) => {
      const effectiveBase = printifyPremium ? p.baseCost * (1 - PREMIUM_DISCOUNT_RATE) : p.baseCost;
      const premiumSavings = p.baseCost - effectiveBase;
      const landedCost = effectiveBase + p.shipping;
      const netProfit = grossRev - channelFee - landedCost;
      const netMarginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;
      const status = netMarginPct >= 30 ? 'PASS' : netMarginPct >= 15 ? 'WARN' : 'FAIL';
      return {
        ...p,
        effectiveBase,
        premiumSavings,
        landedCost,
        channelFee,
        netProfit,
        netMarginPct,
        status,
      };
    });

    const sortedByProfit = [...evaluated].sort((a, b) => b.netProfit - a.netProfit);
    const bestProfitProvider = sortedByProfit[0];
    const fastestProvider = [...evaluated].sort((a, b) => a.prodMax - b.prodMax || a.landedCost - b.landedCost)[0];
    const activeProvider = evaluated.find((p) => p.id === selectedProviderId) || bestProfitProvider;

    const rows = evaluated.map((p) => ({
      id: String(p.id),
      provider: p.id === bestProfitProvider.id ? `${p.name} ★` : p.name,
      hub: p.hub,
      baseCost: `$${p.effectiveBase.toFixed(2)}${printifyPremium ? ' (-20%)' : ''}`,
      shipping: `$${p.shipping.toFixed(2)}`,
      landed: `$${p.landedCost.toFixed(2)}`,
      prodDays: `${p.prodMin}–${p.prodMax}d`,
      netProfit: `${p.netProfit < 0 ? '-' : ''}$${Math.abs(p.netProfit).toFixed(2)}`,
      netMargin: `${p.netMarginPct.toFixed(1)}%`,
      status: p.status,
    }));

    return {
      grossRev,
      channelFee,
      evaluated,
      bestProfitProvider,
      fastestProvider,
      activeProvider,
      rows,
    };
  }, [activeBlueprint, retailPrice, buyerShipping, printifyPremium, activeChannelFee, selectedProviderId]);

  // Artwork 300 DPI & Safe-Zone Auditor math
  const dpiAudit = useMemo(() => {
    const wPx = Math.max(1, Number(pxW) || 1);
    const hPx = Math.max(1, Number(pxH) || 1);
    const wIn = Math.max(0.5, Number(printW) || 1);
    const hIn = Math.max(0.5, Number(printH) || 1);

    const dpiX = wPx / wIn;
    const dpiY = hPx / hIn;
    const effectiveDpi = Math.min(dpiX, dpiY);

    const artRatio = wPx / hPx;
    const printRatio = wIn / hIn;
    const distortionPct = Math.abs((artRatio - printRatio) / printRatio) * 100;
    const aspectOk = distortionPct <= 3.0;

    const maxCleanW = wPx / 300;
    const maxCleanH = hPx / 300;
    const req300W = Math.ceil(wIn * 300);
    const req300H = Math.ceil(hIn * 300);

    const bleed = activeBlueprint.bleedInches || 0.25;
    const safeWIn = Math.max(0.5, wIn - bleed * 2);
    const safeHIn = Math.max(0.5, hIn - bleed * 2);
    const safeWPx = Math.round(safeWIn * effectiveDpi);
    const safeHPx = Math.round(safeHIn * effectiveDpi);

    let verdict = 'REJECTED';
    let verdictTone = SOV.crimson;
    let verdictDetail = 'Below 150 DPI Printify minimum threshold — visible pixelation and rejected by print provider RIP.';
    if (effectiveDpi >= 300) {
      verdict = 'CRISP 300+ DPI';
      verdictTone = SOV.emerald;
      verdictDetail = 'Meets or exceeds 300 DPI studio archival threshold for sharp edges, fine linework, and halftones.';
    } else if (effectiveDpi >= 150) {
      verdict = 'SOFT (150–299)';
      verdictTone = SOV.amber;
      verdictDetail = 'Accepted by Printify RIP, but fine typography and small textures will soften. Upscale to 300 DPI if possible.';
    }

    return {
      dpiX,
      dpiY,
      effectiveDpi,
      artRatio,
      printRatio,
      distortionPct,
      aspectOk,
      maxCleanW,
      maxCleanH,
      req300W,
      req300H,
      bleed,
      safeWIn,
      safeHIn,
      safeWPx,
      safeHPx,
      verdict,
      verdictTone,
      verdictDetail,
    };
  }, [pxW, pxH, printW, printH, activeBlueprint]);

  // Generated Printify Open API v1 Draft Product Payload
  const generatedPayload = useMemo(() => {
    const priceCents = Math.max(100, Math.round((Number(retailPrice) || 0) * 100));
    const prov = comparison.activeProvider;
    const variantId = activeBlueprint.defaultVariantId;

    return {
      title: productTitle.trim() || activeBlueprint.defaultTitle,
      description: productDescription.trim() || activeBlueprint.defaultDescription,
      blueprint_id: activeBlueprint.blueprintId,
      print_provider_id: prov.id,
      tags: activeBlueprint.defaultTags,
      variants: [
        {
          id: variantId,
          price: priceCents,
          is_enabled: true,
        },
      ],
      print_areas: [
        {
          variant_ids: [variantId],
          placeholders: [
            {
              position: 'front',
              images: [
                {
                  id: artworkImageId.trim() || 'UPLOAD_IMAGE_ID',
                  x: 0.5,
                  y: 0.5,
                  scale: 1,
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
      metadata_audit: {
        provider_name: prov.name,
        printify_premium_applied: printifyPremium,
        effective_dpi: Number(dpiAudit.effectiveDpi.toFixed(1)),
        dpi_verdict: dpiAudit.verdict,
        estimated_landed_usd: Number(prov.landedCost.toFixed(2)),
        estimated_net_profit_usd: Number(prov.netProfit.toFixed(2)),
      },
    };
  }, [
    retailPrice,
    comparison.activeProvider,
    activeBlueprint,
    productTitle,
    productDescription,
    artworkImageId,
    printifyPremium,
    dpiAudit.effectiveDpi,
    dpiAudit.verdict,
  ]);

  const effectiveJsonString = useMemo(
    () => (customJsonOverride.trim() ? customJsonOverride : JSON.stringify(generatedPayload, null, 2)),
    [customJsonOverride, generatedPayload],
  );

  const jsonValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(effectiveJsonString);
      return { valid: true, parsed, error: '' };
    } catch (err) {
      return { valid: false, parsed: null, error: err?.message || 'Invalid JSON syntax' };
    }
  }, [effectiveJsonString]);

  const cleanShopId = (shopId || '14829041').replace(/[^0-9A-Za-z_-]/g, '');

  const curlCommand = useMemo(() => {
    const compactBody = jsonValidation.valid
      ? JSON.stringify(jsonValidation.parsed)
      : JSON.stringify(generatedPayload);
    return `curl -X POST "https://api.printify.com/v1/shops/${cleanShopId}/products.json" \\
  -H "Authorization: Bearer \${PRINTIFY_API_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '${compactBody.replace(/'/g, "'\\''")}'`;
  }, [cleanShopId, jsonValidation, generatedPayload]);

  const cliCommands = useMemo(
    () => `# Launch Printify Connector local daemon (port 8115, reads ~/.config/zothos/printify.env)
cd ~/NullAITech/printify-connector && python3 server.py --port 8115

# Verify Printify CLI & local API health
printify-connector status
curl -s http://127.0.0.1:8115/health

# Compare providers for Blueprint #${activeBlueprint.blueprintId} (${activeBlueprint.label})
printify-connector compare --blueprint ${activeBlueprint.blueprintId} --retail ${Number(retailPrice).toFixed(2)}${printifyPremium ? ' --premium' : ''}

# Audit artwork resolution (${pxW}x${pxH}px on ${printW}x${printH}in) & publish draft JSON
printify-connector dpi-audit --width ${pxW} --height ${pxH} --print-w ${printW} --print-h ${printH}
printify-connector draft --shop ${cleanShopId} --file printify-product.json`,
    [activeBlueprint, retailPrice, printifyPremium, pxW, pxH, printW, printH, cleanShopId],
  );

  const handleDownloadPayload = () => {
    if (jsonValidation.valid && jsonValidation.parsed) {
      downloadJson(jsonValidation.parsed, 'printify-product.json');
    } else {
      downloadText(effectiveJsonString, 'printify-product.json', 'application/json;charset=utf-8');
    }
  };

  const kpis = [
    {
      label: 'Best Net Profit',
      value: `${comparison.bestProfitProvider.netProfit < 0 ? '-' : ''}$${Math.abs(comparison.bestProfitProvider.netProfit).toFixed(2)}`,
      unit: `${comparison.bestProfitProvider.name} (${comparison.bestProfitProvider.netMarginPct.toFixed(1)}%)`,
      accent: comparison.bestProfitProvider.netProfit > 0 ? SOV.emerald : SOV.crimson,
    },
    {
      label: 'Selected Landed Cost',
      value: `$${comparison.activeProvider.landedCost.toFixed(2)}`,
      unit: printifyPremium ? `Premium -20% (-$${comparison.activeProvider.premiumSavings.toFixed(2)})` : 'Standard Pricing',
      accent: ACCENT_RAW,
    },
    {
      label: 'Effective Artwork DPI',
      value: `${Math.round(dpiAudit.effectiveDpi)}`,
      unit: dpiAudit.verdict,
      accent: dpiAudit.verdictTone,
    },
    {
      label: 'Fastest Production',
      value: `${comparison.fastestProvider.prodMin}–${comparison.fastestProvider.prodMax}d`,
      unit: comparison.fastestProvider.name,
      accent: SOV.cyber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={dpiAudit.effectiveDpi >= 150 && comparison.activeProvider.netProfit > 0 ? 'online' : 'standby'}
        label={`BP #${activeBlueprint.blueprintId} · ${comparison.activeProvider.name.toUpperCase()} · ${Math.round(dpiAudit.effectiveDpi)} DPI (${dpiAudit.verdict})`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download printify-product.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadPayload,
      primary: true,
    },
    {
      label: copied === 'curl' ? 'Copied Printify curl' : 'Copy Open API v1 curl',
      icon: copied === 'curl' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(curlCommand, 'curl'),
    },
    {
      label: copied === 'cli' ? 'Copied CLI Commands' : 'Copy :8115 CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(cliCommands, 'cli'),
    },
    {
      label: 'printify-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/printify-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="PRINTIFY CATALOG & MARGIN CONTROLS"
        title="Blueprint, Pricing & Premium Toggle"
        subtitle="Pick a real Printify blueprint, toggle Printify Premium (-20% production cost), and tune target retail pricing"
        accent={ACCENT_RAW}
        right={<PrintIcon sx={{ color: accent }} />}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={BLUEPRINTS}
            activeId={blueprintId}
            onSelect={handleSelectBlueprint}
            onReset={() => handleSelectBlueprint(BLUEPRINTS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label="Target Retail Price ($)"
            value={retailPrice}
            onChange={(e) => setRetailPrice(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 1, step: 0.5 }}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Buyer-Paid Shipping ($)"
            value={buyerShipping}
            onChange={(e) => setBuyerShipping(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              RETAIL PRICE SLIDER
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: accent }}>
              ${Number(retailPrice || 0).toFixed(2)} (+${Number(buyerShipping || 0).toFixed(2)} ship)
            </Typography>
          </Box>
          <Slider
            value={Math.min(140, Number(retailPrice) || 0)}
            min={10}
            max={140}
            step={0.5}
            onChange={(_, v) => setRetailPrice(Number(v))}
            aria-label="Target Retail Price"
            sx={{ color: accent }}
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
            <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', color: 'text.primary', fontWeight: 600 }}>
              Printify Premium Active (−20% base production cost; saves ${comparison.activeProvider.premiumSavings.toFixed(2)}/unit)
            </Typography>
          }
          sx={{ mb: 1.25 }}
        />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          SALES CHANNEL FEE SCHEDULE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {CHANNEL_FEES.map((cf) => {
            const active = cf.id === channelFeeId;
            return (
              <Chip
                key={cf.id}
                label={cf.label}
                clickable
                onClick={() => setChannelFeeId(cf.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          BIND PROVIDER TO OPEN API v1 PAYLOAD
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {comparison.evaluated.map((p) => {
            const active = p.id === comparison.activeProvider.id;
            return (
              <Chip
                key={p.id}
                label={`${p.name} (#${p.id}) · $${p.landedCost.toFixed(2)}`}
                clickable
                onClick={() => {
                  setSelectedProviderId(p.id);
                  setCustomJsonOverride('');
                }}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.18) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="ARTWORK 300 DPI & SAFE-ZONE AUDITOR"
        title="Print Resolution & Aspect Inspector"
        subtitle="Verify exact effective DPI (>=300 crisp, 150–299 soft, <150 rejected), aspect distortion, and max clean print size"
        accent={SOV.cyber}
        right={<PhotoSizeSelectLargeIcon sx={{ color: isDark ? SOV.cyber : '#0369A1' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label="Artwork Width (px)"
            value={pxW}
            onChange={(e) => setPxW(Math.max(1, Number(e.target.value)))}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Artwork Height (px)"
            value={pxH}
            onChange={(e) => setPxH(Math.max(1, Number(e.target.value)))}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Print Area W (in)"
            value={printW}
            onChange={(e) => setPrintW(Math.max(0.5, Number(e.target.value)))}
            inputProps={{ step: 0.5 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Print Area H (in)"
            value={printH}
            onChange={(e) => setPrintH(Math.max(0.5, Number(e.target.value)))}
            inputProps={{ step: 0.5 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {[
            { label: 'Sync Blueprint 300 DPI', w: activeBlueprint.recommendedPxW, h: activeBlueprint.recommendedPxH },
            { label: 'Test Soft 180 DPI', w: Math.round(printW * 180), h: Math.round(printH * 180) },
            { label: 'Test Reject 96 DPI', w: Math.round(printW * 96), h: Math.round(printH * 96) },
            { label: 'Test Aspect Mismatch', w: Math.round(printW * 300), h: Math.round(printH * 210) },
          ].map((preset) => (
            <Button
              key={preset.label}
              size="small"
              variant="outlined"
              onClick={() => {
                setPxW(preset.w);
                setPxH(preset.h);
              }}
              sx={{
                minHeight: 38,
                fontFamily: MONO,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'none',
                color: isDark ? SOV.cyber : '#0369A1',
                borderColor: rgba(SOV.cyber, 0.42),
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1.75 }}>
          <SovereignGauge
            value={Math.min(400, dpiAudit.effectiveDpi)}
            max={400}
            label="EFFECTIVE DPI"
            unit="dpi"
            status={dpiAudit.verdict}
            thresholds={{ warn: 300, danger: 150 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 210px', display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              {dpiAudit.effectiveDpi >= 300 ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: SOV.emerald, mt: 0.15, flexShrink: 0 }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: 18, color: dpiAudit.verdictTone, mt: 0.15, flexShrink: 0 }} />
              )}
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.45 }}>
                {dpiAudit.verdictDetail}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              {dpiAudit.aspectOk ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: SOV.emerald, mt: 0.15, flexShrink: 0 }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: 18, color: SOV.amber, mt: 0.15, flexShrink: 0 }} />
              )}
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.45 }}>
                {dpiAudit.aspectOk
                  ? `Aspect ratio aligned (${dpiAudit.distortionPct.toFixed(1)}% delta) — zero unintended crop.`
                  : `Aspect mismatch of ${dpiAudit.distortionPct.toFixed(1)}% (art ${dpiAudit.artRatio.toFixed(2)}:1 vs print ${dpiAudit.printRatio.toFixed(2)}:1) — artwork will clip or letterbox.`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <SovereignKeyValueGrid
          cols={2}
          accent={SOV.cyber}
          items={[
            {
              label: 'Horizontal / Vertical DPI',
              value: `${dpiAudit.dpiX.toFixed(0)} × ${dpiAudit.dpiY.toFixed(0)} DPI`,
              badge: dpiAudit.verdict,
            },
            {
              label: 'Max Clean 300 DPI Print',
              value: `${dpiAudit.maxCleanW.toFixed(2)}" × ${dpiAudit.maxCleanH.toFixed(2)}"`,
              badge: 'Archival Ceiling',
            },
            {
              label: 'Safe-Zone Inner Bounds',
              value: `${dpiAudit.safeWIn.toFixed(2)}" × ${dpiAudit.safeHIn.toFixed(2)}" (${dpiAudit.safeWPx}×${dpiAudit.safeHPx}px)`,
              badge: `${dpiAudit.bleed}" bleed`,
            },
            {
              label: 'Required 300 DPI Master',
              value: `${dpiAudit.req300W} × ${dpiAudit.req300H} px`,
              badge: `${printW}×${printH}"`,
            },
          ]}
        />
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow={`PRINTIFY PROVIDER MATRIX · BLUEPRINT #${activeBlueprint.blueprintId}`}
        title={`${activeBlueprint.fullName} — Provider Comparator`}
        filename={`printify-bp${activeBlueprint.blueprintId}-providers.csv`}
        accent={ACCENT_RAW}
        maxHeight={300}
        columns={[
          { key: 'provider', label: 'Print Provider' },
          { key: 'hub', label: 'Facility' },
          { key: 'baseCost', label: 'Base Cost', mono: true, align: 'right' },
          { key: 'shipping', label: 'US Ship', mono: true, align: 'right' },
          { key: 'landed', label: 'Landed', mono: true, align: 'right' },
          { key: 'prodDays', label: 'Prod SLA', mono: true, align: 'right' },
          { key: 'netProfit', label: 'Net Profit', mono: true, align: 'right' },
          { key: 'netMargin', label: 'Margin', mono: true, align: 'right' },
          { key: 'status', label: 'Health' },
        ]}
        rows={comparison.rows}
      />

      <SovereignCard
        index="03"
        eyebrow="PRINTIFY OPEN API v1 DRAFT EXPORTER"
        title={`POST /v1/shops/${cleanShopId}/products.json`}
        subtitle="Edit product metadata or live JSON payload directly, validate syntax, and export printify-product.json or curl / CLI commands"
        accent={ACCENT_RAW}
        right={<CodeIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            label="Printify Shop ID"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="Uploaded Artwork Image ID"
            value={artworkImageId}
            onChange={(e) => {
              setArtworkImageId(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '2 1 220px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
        </Box>

        <TextField
          size="small"
          fullWidth
          label="Product Title"
          value={productTitle}
          onChange={(e) => {
            setProductTitle(e.target.value);
            setCustomJsonOverride('');
          }}
          sx={{ mb: 1.25, '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
        />

        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Product Description"
          value={productDescription}
          onChange={(e) => {
            setProductDescription(e.target.value);
            setCustomJsonOverride('');
          }}
          sx={{ mb: 1.5, '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 } }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25, alignItems: 'center' }}>
          {[
            { id: 'json', label: 'Editable v1 JSON' },
            { id: 'curl', label: 'Open API v1 curl' },
            { id: 'cli', label: 'CLI & Daemon (:8115)' },
          ].map((tab) => {
            const active = payloadTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setPayloadTab(tab.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: isDark ? ACCENT_RAW : accent, color: isDark ? '#08080B' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.35)' }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}

          {customJsonOverride.trim() && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={() => setCustomJsonOverride('')}
              sx={{
                minHeight: 38,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: isDark ? SOV.amber : '#B45309',
                borderColor: rgba(SOV.amber, 0.45),
              }}
            >
              Reset Generated JSON
            </Button>
          )}
        </Box>

        {payloadTab === 'json' ? (
          <Box>
            <TextField
              multiline
              minRows={13}
              maxRows={18}
              fullWidth
              size="small"
              error={!jsonValidation.valid}
              helperText={
                jsonValidation.valid
                  ? `Valid Printify Open API v1 payload · Blueprint #${activeBlueprint.blueprintId} · Provider #${comparison.activeProvider.id} (${comparison.activeProvider.name})`
                  : `JSON Parse Error: ${jsonValidation.error}`
              }
              value={effectiveJsonString}
              onChange={(e) => setCustomJsonOverride(e.target.value)}
              sx={{
                mb: 1.25,
                '& textarea': {
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  lineHeight: 1.5,
                },
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleDownloadPayload}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: isDark ? ACCENT_RAW : accent,
                  color: isDark ? '#08080B' : '#FFFFFF',
                }}
              >
                Download printify-product.json
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied === 'json' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                onClick={() => copy(effectiveJsonString, 'json')}
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
                {copied === 'json' ? 'Copied JSON' : 'Copy JSON Payload'}
              </Button>
            </Box>
          </Box>
        ) : payloadTab === 'curl' ? (
          <SovereignCodeBlock
            title={`POST /v1/shops/${cleanShopId}/products.json`}
            badge="CURL"
            code={curlCommand}
            filename="printify-draft-curl.sh"
            accent={ACCENT_RAW}
            maxHeight={300}
          />
        ) : (
          <SovereignCodeBlock
            title="PRINTIFY-CONNECTOR LOCAL CLI & DAEMON (:8115)"
            badge="LOCAL :8115"
            code={cliCommands}
            filename="printify-connector-cli.sh"
            accent={SOV.gold}
            maxHeight={300}
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
          title="Runtime Scope · 100% Client-Side Printify Comparator, DPI Auditor & v1 Payload Studio"
          message="Blueprint provider comparisons, Printify Premium 20% margin math, 300 DPI safe-zone checks, and Open API v1 JSON synthesis execute deterministically in your browser with zero remote fetches. Live Printify shop publishing stays strictly on localhost via printify-connector (:8115) using credentials in ~/.config/zothos/."
        />
      </Box>
      <SovereignWorkstationShell
        id="printify-connector"
        category="COMMERCE & POD · PRINTIFY OPEN API v1 (:8115)"
        title="Printify Connector & 300 DPI Studio"
        subtitle="Compare Printify blueprints across Monster Digital, SwiftPOD, Printed Mint, and Sensaria with Printify Premium 20% economics, audit 300 DPI artwork safe-zones, and export Open API v1 draft payloads."
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
