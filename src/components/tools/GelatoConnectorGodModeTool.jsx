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
import PublicIcon from '@mui/icons-material/Public';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
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

const ACCENT_RAW = SOV.cyber;

const CURRENCIES = [
  { code: 'USD', symbol: '$', defaultFxToUsd: 1.0, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', defaultFxToUsd: 1.08, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', defaultFxToUsd: 1.27, label: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', defaultFxToUsd: 0.73, label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', defaultFxToUsd: 0.65, label: 'AUD (A$)' },
];

const DESTINATIONS = [
  {
    code: 'DE',
    name: 'Germany',
    region: 'EU',
    currency: 'EUR',
    hub: 'Frankfurt / Berlin DE Hub',
    localDays: [2, 4],
    usCrossBorderDays: [10, 16],
    localKm: 280,
    usKm: 7250,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 19,
    localShipUsd: 5.4,
    usCrossBorderShipUsd: 18.9,
    sampleCity: 'Berlin',
    samplePostCode: '10115',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    region: 'UK',
    currency: 'GBP',
    hub: 'Midlands / London UK Hub',
    localDays: [2, 3],
    usCrossBorderDays: [9, 14],
    localKm: 210,
    usKm: 6350,
    dutyPct: 0.09,
    brokerageUsd: 12.0,
    vatPct: 20,
    localShipUsd: 5.2,
    usCrossBorderShipUsd: 17.5,
    sampleCity: 'London',
    samplePostCode: 'EC1A 1BB',
  },
  {
    code: 'US',
    name: 'United States',
    region: 'NA',
    currency: 'USD',
    hub: 'Dallas / Charlotte US Hub',
    localDays: [2, 4],
    usCrossBorderDays: [3, 5],
    localKm: 490,
    usKm: 1850,
    dutyPct: 0.0,
    brokerageUsd: 0.0,
    vatPct: 0,
    localShipUsd: 5.49,
    usCrossBorderShipUsd: 7.25,
    sampleCity: 'Austin',
    samplePostCode: '78701',
  },
  {
    code: 'FR',
    name: 'France',
    region: 'EU',
    currency: 'EUR',
    hub: 'Lyon / Paris FR Hub',
    localDays: [2, 4],
    usCrossBorderDays: [10, 15],
    localKm: 320,
    usKm: 6700,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 20,
    localShipUsd: 5.6,
    usCrossBorderShipUsd: 18.9,
    sampleCity: 'Paris',
    samplePostCode: '75001',
  },
  {
    code: 'CA',
    name: 'Canada',
    region: 'NA',
    currency: 'CAD',
    hub: 'Toronto / Vancouver CA Hub',
    localDays: [2, 4],
    usCrossBorderDays: [8, 13],
    localKm: 390,
    usKm: 2450,
    dutyPct: 0.07,
    brokerageUsd: 9.5,
    vatPct: 5,
    localShipUsd: 6.1,
    usCrossBorderShipUsd: 14.5,
    sampleCity: 'Toronto',
    samplePostCode: 'M5V 2T6',
  },
  {
    code: 'AU',
    name: 'Australia',
    region: 'APAC',
    currency: 'AUD',
    hub: 'Sydney / Melbourne AU Hub',
    localDays: [2, 4],
    usCrossBorderDays: [12, 20],
    localKm: 410,
    usKm: 15100,
    dutyPct: 0.1,
    brokerageUsd: 13.0,
    vatPct: 10,
    localShipUsd: 6.4,
    usCrossBorderShipUsd: 24.5,
    sampleCity: 'Sydney',
    samplePostCode: '2000',
  },
  {
    code: 'JP',
    name: 'Japan',
    region: 'APAC',
    currency: 'USD',
    hub: 'Tokyo / Osaka JP Hub',
    localDays: [2, 3],
    usCrossBorderDays: [10, 16],
    localKm: 240,
    usKm: 10850,
    dutyPct: 0.08,
    brokerageUsd: 10.0,
    vatPct: 10,
    localShipUsd: 5.8,
    usCrossBorderShipUsd: 22.0,
    sampleCity: 'Tokyo',
    samplePostCode: '100-0001',
  },
  {
    code: 'SE',
    name: 'Sweden',
    region: 'Nordics',
    currency: 'EUR',
    hub: 'Stockholm / Malmö SE Hub',
    localDays: [2, 3],
    usCrossBorderDays: [10, 16],
    localKm: 260,
    usKm: 7400,
    dutyPct: 0.08,
    brokerageUsd: 12.0,
    vatPct: 25,
    localShipUsd: 5.5,
    usCrossBorderShipUsd: 19.5,
    sampleCity: 'Stockholm',
    samplePostCode: '111 22',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    region: 'EU',
    currency: 'EUR',
    hub: 'Amsterdam / Eindhoven NL Hub',
    localDays: [2, 3],
    usCrossBorderDays: [9, 15],
    localKm: 165,
    usKm: 6650,
    dutyPct: 0.08,
    brokerageUsd: 11.0,
    vatPct: 21,
    localShipUsd: 5.1,
    usCrossBorderShipUsd: 18.4,
    sampleCity: 'Amsterdam',
    samplePostCode: '1012 JS',
  },
  {
    code: 'ES',
    name: 'Spain',
    region: 'EU',
    currency: 'EUR',
    hub: 'Madrid / Barcelona ES Hub',
    localDays: [2, 4],
    usCrossBorderDays: [11, 17],
    localKm: 340,
    usKm: 6450,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 21,
    localShipUsd: 5.7,
    usCrossBorderShipUsd: 19.2,
    sampleCity: 'Madrid',
    samplePostCode: '28013',
  },
  {
    code: 'BR',
    name: 'Brazil',
    region: 'LATAM',
    currency: 'USD',
    hub: 'São Paulo BR Hub',
    localDays: [3, 5],
    usCrossBorderDays: [14, 24],
    localKm: 430,
    usKm: 7750,
    dutyPct: 0.2,
    brokerageUsd: 15.0,
    vatPct: 17,
    localShipUsd: 6.9,
    usCrossBorderShipUsd: 26.5,
    sampleCity: 'São Paulo',
    samplePostCode: '01310-100',
  },
  {
    code: 'SG',
    name: 'Singapore',
    region: 'APAC',
    currency: 'USD',
    hub: 'Singapore SG Hub',
    localDays: [2, 3],
    usCrossBorderDays: [11, 18],
    localKm: 45,
    usKm: 15300,
    dutyPct: 0.09,
    brokerageUsd: 10.5,
    vatPct: 9,
    localShipUsd: 4.9,
    usCrossBorderShipUsd: 23.0,
    sampleCity: 'Singapore',
    samplePostCode: '018956',
  },
];

const GELATO_PRODUCTS = [
  {
    id: 'framed-poster',
    label: 'Framed Poster',
    badge: '18×24 Oak',
    fullName: 'Framed Museum Poster 18×24 in (Solid Oak + Acrylic)',
    productUid: 'framed_poster_mounted_premium_18x24-inch_wood_oak_200gsm-uncoated_4-0',
    baseProdUsd: 21.8,
    defaultRetailUsd: 56.0,
    weightKg: 1.65,
  },
  {
    id: 'fine-art-print',
    label: 'Fine Art Print',
    badge: '200gsm Matte',
    fullName: 'Fine Art Archival Matte Print 18×24 in (200 gsm FSC)',
    productUid: 'flat_18x24-inch_200gsm-uncoated_4-0',
    baseProdUsd: 10.9,
    defaultRetailUsd: 34.0,
    weightKg: 0.35,
  },
  {
    id: 'heavyweight-tee',
    label: 'Heavyweight Tee',
    badge: '240gsm Cotton',
    fullName: 'Heavyweight Organic Cotton Unisex Tee (240 gsm)',
    productUid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavyweight_gsi_l_gco_black_gpr_4-0',
    baseProdUsd: 13.4,
    defaultRetailUsd: 36.0,
    weightKg: 0.32,
  },
  {
    id: 'photo-book',
    label: 'Photo Book',
    badge: '8×8 Hardcover',
    fullName: 'Hardcover Layflat Photo Book 8×8 in (30 Pages, 170gsm)',
    productUid: 'photobook_hardcover_8x8-inch_170gsm-silk_30p_4-4',
    baseProdUsd: 18.2,
    defaultRetailUsd: 49.0,
    weightKg: 0.72,
  },
  {
    id: 'ceramic-mug',
    label: 'Ceramic Mug',
    badge: '11oz White',
    fullName: 'Glossy Ceramic Mug 11oz (Dishwasher Safe)',
    productUid: 'mug_product_msz_11-oz_mmat_ceramic-white_cl_4-0',
    baseProdUsd: 6.1,
    defaultRetailUsd: 20.0,
    weightKg: 0.45,
  },
];

export default function GelatoConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  // Fulfillment Router state
  const [countryCode, setCountryCode] = useState('DE');
  const [productId, setProductId] = useState(GELATO_PRODUCTS[0].id);
  const [quantity, setQuantity] = useState(1);

  // Multi-Currency Margin Engine state
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [fxRates, setFxRates] = useState({
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.27,
    CAD: 0.73,
    AUD: 0.65,
  });
  const [vatIncluded, setVatIncluded] = useState(true);
  const [vatPct, setVatPct] = useState(19);
  const [retailLocal, setRetailLocal] = useState(52.0);
  const [buyerShipLocal, setBuyerShipLocal] = useState(0);
  const [channelFeePct, setChannelFeePct] = useState(2.9);

  // Gelato Order API v4 Payload state
  const [orderRefId, setOrderRefId] = useState('ZOTH-ORD-2026-8116');
  const [customerRefId, setCustomerRefId] = useState('CUST-EU-0491');
  const [orderType, setOrderType] = useState('draft');
  const [artworkUrl, setArtworkUrl] = useState('https://assets.example.com/prints/japandi-arch-300dpi.pdf');
  const [recipientName, setRecipientName] = useState('Clara Lindqvist');
  const [addressLine1, setAddressLine1] = useState('Torstrasse 114');
  const [city, setCity] = useState('Berlin');
  const [postCode, setPostCode] = useState('10115');
  const [recipientEmail, setRecipientEmail] = useState('orders@example.com');
  const [payloadTab, setPayloadTab] = useState('json');
  const [customJsonOverride, setCustomJsonOverride] = useState('');

  const activeCountry = useMemo(
    () => DESTINATIONS.find((d) => d.code === countryCode) || DESTINATIONS[0],
    [countryCode],
  );

  const activeProduct = useMemo(
    () => GELATO_PRODUCTS.find((p) => p.id === productId) || GELATO_PRODUCTS[0],
    [productId],
  );

  const activeCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0],
    [currencyCode],
  );

  const fxToUsd = Math.max(0.05, Number(fxRates[currencyCode]) || activeCurrency.defaultFxToUsd);

  const handleSelectCountry = (dest) => {
    setCountryCode(dest.code);
    setVatPct(dest.vatPct);
    setCity(dest.sampleCity);
    setPostCode(dest.samplePostCode);
    const nextCurr = CURRENCIES.find((c) => c.code === dest.currency) || CURRENCIES[0];
    setCurrencyCode(nextCurr.code);
    const rate = fxRates[nextCurr.code] || nextCurr.defaultFxToUsd;
    setRetailLocal(Number((activeProduct.defaultRetailUsd / rate).toFixed(2)));
    setCustomJsonOverride('');
  };

  const handleSelectProduct = (prod) => {
    setProductId(prod.id);
    setRetailLocal(Number((prod.defaultRetailUsd / fxToUsd).toFixed(2)));
    setCustomJsonOverride('');
  };

  const handleSelectCurrency = (curr) => {
    const prevRate = fxToUsd;
    const nextRate = Math.max(0.05, Number(fxRates[curr.code]) || curr.defaultFxToUsd);
    const currentUsd = retailLocal * prevRate;
    setCurrencyCode(curr.code);
    setRetailLocal(Number((currentUsd / nextRate).toFixed(2)));
    setCustomJsonOverride('');
  };

  // Fulfillment Routing, Customs & Carbon math
  const routing = useMemo(() => {
    const qty = Math.max(1, Number(quantity) || 1);
    const prodUsd = activeProduct.baseProdUsd * qty;
    const localShipUsd = activeCountry.localShipUsd + (qty - 1) * 1.85;
    const crossShipUsd = activeCountry.usCrossBorderShipUsd + (qty - 1) * 4.25;

    const declaredValUsd = Math.max(0, Number(retailLocal) || 0) * fxToUsd * qty;
    const avoidedDutyUsd = declaredValUsd * activeCountry.dutyPct;
    const avoidedBrokerageUsd = activeCountry.brokerageUsd;
    const totalTariffSavingsUsd = avoidedDutyUsd + avoidedBrokerageUsd;
    const totalLandedSavingsUsd = Math.max(0, crossShipUsd - localShipUsd) + totalTariffSavingsUsd;

    const localAvgDays = (activeCountry.localDays[0] + activeCountry.localDays[1]) / 2;
    const crossAvgDays = (activeCountry.usCrossBorderDays[0] + activeCountry.usCrossBorderDays[1]) / 2;
    const daysSaved = Math.max(0, crossAvgDays - localAvgDays);

    // Freight emission model: air cargo cross-border (~0.52 kg CO2e/ton-km) vs ground domestic (~0.09 kg CO2e/ton-km)
    const parcelTonnes = (activeProduct.weightKg * qty) / 1000;
    const localCo2Kg = Math.max(0.08, parcelTonnes * activeCountry.localKm * 0.09 + 0.14);
    const crossCo2Kg = Math.max(0.45, parcelTonnes * activeCountry.usKm * 0.52 + 0.35);
    const co2SavedKg = Math.max(0, crossCo2Kg - localCo2Kg);
    const co2ReductionPct = crossCo2Kg > 0 ? (co2SavedKg / crossCo2Kg) * 100 : 0;
    const kmSaved = Math.max(0, activeCountry.usKm - activeCountry.localKm);

    const comparisonRows = [
      {
        id: 'gelato-local',
        route: `Gelato Local (${activeCountry.hub})`,
        transit: `${activeCountry.localDays[0]}–${activeCountry.localDays[1]} days`,
        shipping: `$${localShipUsd.toFixed(2)}`,
        customs: '$0.00 (Domestic)',
        distance: `${activeCountry.localKm.toLocaleString()} km`,
        co2: `${localCo2Kg.toFixed(2)} kg CO₂e`,
        status: 'PASS',
      },
      {
        id: 'us-cross-border',
        route: 'US Cross-Border Air Export',
        transit: `${activeCountry.usCrossBorderDays[0]}–${activeCountry.usCrossBorderDays[1]} days`,
        shipping: `$${crossShipUsd.toFixed(2)}`,
        customs: `$${totalTariffSavingsUsd.toFixed(2)} (Duty+Fee)`,
        distance: `${activeCountry.usKm.toLocaleString()} km`,
        co2: `${crossCo2Kg.toFixed(2)} kg CO₂e`,
        status: activeCountry.code === 'US' ? 'WARN' : 'FAIL',
      },
    ];

    return {
      qty,
      prodUsd,
      localShipUsd,
      crossShipUsd,
      avoidedDutyUsd,
      avoidedBrokerageUsd,
      totalTariffSavingsUsd,
      totalLandedSavingsUsd,
      daysSaved,
      localCo2Kg,
      crossCo2Kg,
      co2SavedKg,
      co2ReductionPct,
      kmSaved,
      comparisonRows,
    };
  }, [activeCountry, activeProduct, quantity, retailLocal, fxToUsd]);

  // Multi-Currency Margin Engine math
  const economics = useMemo(() => {
    const qty = routing.qty;
    const grossLocal = (Math.max(0, Number(retailLocal) || 0) * qty) + Math.max(0, Number(buyerShipLocal) || 0);
    const vatRate = Math.max(0, Number(vatPct) || 0) / 100;

    // If VAT is included in buyer price, back out tax component; otherwise buyer pays tax on top
    const vatLocal = vatIncluded && vatRate > 0 ? grossLocal - grossLocal / (1 + vatRate) : 0;
    const netRevExVatLocal = grossLocal - vatLocal;

    const prodLocal = routing.prodUsd / fxToUsd;
    const shipLocal = routing.localShipUsd / fxToUsd;
    const totalCogsLocal = prodLocal + shipLocal;

    const feeRate = Math.max(0, Number(channelFeePct) || 0) / 100;
    const channelFeeLocal = grossLocal * feeRate;

    const netProfitLocal = netRevExVatLocal - channelFeeLocal - totalCogsLocal;
    const netProfitUsd = netProfitLocal * fxToUsd;
    const netMarginPct = netRevExVatLocal > 0 ? (netProfitLocal / netRevExVatLocal) * 100 : 0;

    const keepFactor = vatIncluded ? 1 / (1 + vatRate) - feeRate : 1 - feeRate;
    const breakEvenLocal = keepFactor > 0 ? totalCogsLocal / keepFactor : 0;

    return {
      grossLocal,
      grossUsd: grossLocal * fxToUsd,
      vatLocal,
      vatUsd: vatLocal * fxToUsd,
      netRevExVatLocal,
      prodLocal,
      shipLocal,
      totalCogsLocal,
      totalCogsUsd: totalCogsLocal * fxToUsd,
      channelFeeLocal,
      netProfitLocal,
      netProfitUsd,
      netMarginPct,
      breakEvenLocal,
    };
  }, [routing, retailLocal, buyerShipLocal, vatPct, vatIncluded, fxToUsd, channelFeePct]);

  // Gelato Order API v4 Payload
  const generatedOrderPayload = useMemo(() => {
    const nameParts = String(recipientName || 'Alex Operator').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Alex';
    const lastName = nameParts.slice(1).join(' ') || 'Operator';

    return {
      orderType,
      orderReferenceId: orderRefId.trim() || 'ZOTH-ORD-2026-8116',
      customerReferenceId: customerRefId.trim() || 'CUST-001',
      currency: currencyCode,
      items: [
        {
          itemReferenceId: `ITEM-${activeProduct.id.toUpperCase()}-1`,
          productUid: activeProduct.productUid,
          files: [
            {
              type: 'default',
              url: artworkUrl.trim() || 'https://assets.example.com/300dpi-print.pdf',
            },
          ],
          quantity: routing.qty,
        },
      ],
      shipmentMethodUid: 'standard',
      shippingAddress: {
        firstName,
        lastName,
        addressLine1: addressLine1.trim() || '123 Studio Way',
        city: city.trim() || activeCountry.sampleCity,
        postCode: postCode.trim() || activeCountry.samplePostCode,
        country: activeCountry.code,
        email: recipientEmail.trim() || 'orders@example.com',
      },
      metadata: {
        resolvedLocalHub: activeCountry.hub,
        estimatedTransitDays: `${activeCountry.localDays[0]}-${activeCountry.localDays[1]}`,
        carbonReductionPct: Number(routing.co2ReductionPct.toFixed(1)),
      },
    };
  }, [
    orderType,
    orderRefId,
    customerRefId,
    currencyCode,
    activeProduct,
    artworkUrl,
    routing.qty,
    routing.co2ReductionPct,
    recipientName,
    addressLine1,
    city,
    postCode,
    activeCountry,
    recipientEmail,
  ]);

  const effectiveJsonString = useMemo(
    () => (customJsonOverride.trim() ? customJsonOverride : JSON.stringify(generatedOrderPayload, null, 2)),
    [customJsonOverride, generatedOrderPayload],
  );

  const jsonValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(effectiveJsonString);
      return { valid: true, parsed, error: '' };
    } catch (err) {
      return { valid: false, parsed: null, error: err?.message || 'Invalid JSON syntax' };
    }
  }, [effectiveJsonString]);

  const curlSnippet = useMemo(() => {
    const compact = jsonValidation.valid
      ? JSON.stringify(jsonValidation.parsed)
      : JSON.stringify(generatedOrderPayload);
    return `curl -X POST "https://order.gelatoapis.com/v4/orders" \\
  -H "X-API-KEY: \${GELATO_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '${compact.replace(/'/g, "'\\''")}'`;
  }, [jsonValidation, generatedOrderPayload]);

  const cliSnippet = useMemo(
    () => `# Launch Gelato Connector local daemon (port 8116, reads ~/.config/zothos/gelato.env)
cd ~/NullAITech/gelato-connector && python3 server.py --port 8116

# Verify local daemon health & 32-country fulfillment catalog
gelato-connector status
curl -s http://127.0.0.1:8116/health

# Resolve optimal local production hub for ${activeCountry.name} (${activeCountry.code})
gelato-connector route --country ${activeCountry.code} --product "${activeProduct.id}" --currency ${currencyCode}

# Submit Gelato Order API v4 payload (draft or live order)
gelato-connector order --file gelato-order.json --mode ${orderType}`,
    [activeCountry, activeProduct, currencyCode, orderType],
  );

  const handleDownloadOrder = () => {
    if (jsonValidation.valid && jsonValidation.parsed) {
      downloadJson(jsonValidation.parsed, 'gelato-order.json');
    } else {
      downloadText(effectiveJsonString, 'gelato-order.json', 'application/json;charset=utf-8');
    }
  };

  const kpis = [
    {
      label: 'Resolved Local Hub',
      value: activeCountry.code,
      unit: `${activeCountry.localDays[0]}–${activeCountry.localDays[1]}d (${routing.daysSaved.toFixed(0)}d faster)`,
      accent: SOV.cyber,
    },
    {
      label: 'Net Profit (Local / USD)',
      value: `${economics.netProfitLocal < 0 ? '-' : ''}${activeCurrency.symbol}${Math.abs(economics.netProfitLocal).toFixed(2)}`,
      unit: `$${economics.netProfitUsd.toFixed(2)} USD (${economics.netMarginPct.toFixed(1)}%)`,
      accent: economics.netProfitLocal > 0 ? SOV.emerald : SOV.crimson,
    },
    {
      label: 'Tariff + Ship Saved',
      value: `$${routing.totalLandedSavingsUsd.toFixed(2)}`,
      unit: `$${routing.totalTariffSavingsUsd.toFixed(2)} duty/brokerage avoided`,
      accent: SOV.gold,
    },
    {
      label: 'Carbon Cut (CO₂e)',
      value: `${routing.co2ReductionPct.toFixed(0)}%`,
      unit: `−${routing.kmSaved.toLocaleString()} km freight`,
      accent: SOV.emerald,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={economics.netProfitLocal > 0 ? 'online' : 'standby'}
        label={`${activeCountry.hub.toUpperCase()} · ${currencyCode} (1=${fxToUsd.toFixed(2)} USD) · −${routing.co2ReductionPct.toFixed(0)}% CO₂e`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download gelato-order.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadOrder,
      primary: true,
    },
    {
      label: copied === 'curl' ? 'Copied Order v4 curl' : 'Copy Order API v4 curl',
      icon: copied === 'curl' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(curlSnippet, 'curl'),
    },
    {
      label: copied === 'cli' ? 'Copied CLI Commands' : 'Copy :8116 CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(cliSnippet, 'cli'),
    },
    {
      label: 'gelato-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/gelato-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="32-COUNTRY LOCAL FULFILLMENT ROUTER"
        title="Destination Country & Product Selector"
        subtitle="Select buyer destination and product SKU to deterministically resolve the nearest Gelato hub, tariff avoidance, and carbon reduction"
        accent={ACCENT_RAW}
        right={<PublicIcon sx={{ color: accent }} />}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          PRODUCT TYPE (GELATO CATALOG UID)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={GELATO_PRODUCTS}
            activeId={productId}
            onSelect={handleSelectProduct}
            onReset={() => handleSelectProduct(GELATO_PRODUCTS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          BUYER DESTINATION COUNTRY (32-COUNTRY LOCAL NETWORK)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mb: 2 }}>
          {DESTINATIONS.map((dest) => {
            const active = dest.code === countryCode;
            return (
              <Chip
                key={dest.code}
                label={`${dest.code} · ${dest.name}`}
                clickable
                onClick={() => handleSelectCountry(dest)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.69rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.18) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              ORDER QUANTITY
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: accent }}>
              {quantity} unit{quantity > 1 ? 's' : ''} · {(activeProduct.weightKg * quantity).toFixed(2)} kg
            </Typography>
          </Box>
          <Slider
            value={quantity}
            min={1}
            max={25}
            step={1}
            onChange={(_, v) => setQuantity(Number(v))}
            aria-label="Order Quantity"
            sx={{ color: accent }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.75 }}>
          <SovereignGauge
            value={routing.co2ReductionPct}
            max={100}
            label="CO₂e REDUCTION"
            unit="%"
            status={routing.co2ReductionPct >= 65 ? 'LOCAL GREEN' : 'DOMESTIC'}
            thresholds={{ warn: 55, danger: 25 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 200px' }}>
            <SovereignKeyValueGrid
              cols={1}
              accent={SOV.emerald}
              items={[
                { label: 'Nearest Gelato Hub', value: activeCountry.hub, badge: activeCountry.region },
                {
                  label: 'Transit Time Saved',
                  value: `${routing.daysSaved.toFixed(0)} days faster vs US export`,
                  badge: `${activeCountry.localDays[0]}–${activeCountry.localDays[1]}d`,
                },
                {
                  label: 'Customs / Duty Avoided',
                  value: `$${routing.totalTariffSavingsUsd.toFixed(2)} (${(activeCountry.dutyPct * 100).toFixed(0)}% + $${activeCountry.brokerageUsd.toFixed(2)} fee)`,
                  badge: activeCountry.code === 'US' ? 'Domestic' : 'Zero Tariff',
                },
              ]}
            />
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="MULTI-CURRENCY MARGIN ENGINE"
        title="USD · EUR · GBP · CAD · AUD Economics"
        subtitle="Editable transparent FX rates, VAT/GST handling toggle, and dual local + USD profit breakdown"
        accent={SOV.gold}
        right={<CurrencyExchangeIcon sx={{ color: isDark ? SOV.gold : '#B8860B' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {CURRENCIES.map((c) => {
            const active = c.code === currencyCode;
            return (
              <Chip
                key={c.code}
                label={c.label}
                clickable
                onClick={() => handleSelectCurrency(c)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.gold, 0.18) : 'transparent',
                  color: active ? (isDark ? SOV.gold : '#B8860B') : 'text.primary',
                  border: `1px solid ${active ? SOV.gold : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label={`Retail Price (${activeCurrency.symbol} / unit)`}
            value={retailLocal}
            onChange={(e) => setRetailLocal(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: 0.5, min: 0 }}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label={`Buyer Shipping (${activeCurrency.symbol})`}
            value={buyerShipLocal}
            onChange={(e) => setBuyerShipLocal(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: 0.5, min: 0 }}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label={`FX Rate (1 ${currencyCode} → USD)`}
            value={fxToUsd}
            onChange={(e) =>
              setFxRates((prev) => ({
                ...prev,
                [currencyCode]: Math.max(0.05, Number(e.target.value)),
              }))
            }
            inputProps={{ step: 0.01, min: 0.05 }}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="VAT / GST Rate (%)"
            value={vatPct}
            onChange={(e) => setVatPct(Math.max(0, Math.min(35, Number(e.target.value))))}
            inputProps={{ step: 1, min: 0, max: 35 }}
            sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Payment Fee (%)"
            value={channelFeePct}
            onChange={(e) => setChannelFeePct(Math.max(0, Math.min(25, Number(e.target.value))))}
            inputProps={{ step: 0.1, min: 0, max: 25 }}
            sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={vatIncluded}
              onChange={(e) => setVatIncluded(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              VAT/GST Included in Retail Price (standard EU/UK/AU storefront display; deducts {activeCurrency.symbol}{economics.vatLocal.toFixed(2)} tax)
            </Typography>
          }
          sx={{ mb: 1.5 }}
        />

        <SovereignKeyValueGrid
          cols={2}
          accent={SOV.gold}
          items={[
            {
              label: `Gross Revenue (${currencyCode})`,
              value: `${activeCurrency.symbol}${economics.grossLocal.toFixed(2)} ($${economics.grossUsd.toFixed(2)})`,
              badge: `×${routing.qty}`,
            },
            {
              label: 'VAT / GST Remitted',
              value: `${activeCurrency.symbol}${economics.vatLocal.toFixed(2)} ($${economics.vatUsd.toFixed(2)})`,
              badge: vatIncluded ? `${vatPct}% Incl.` : 'Tax Excl.',
            },
            {
              label: 'Gelato Prod + Local Ship',
              value: `${activeCurrency.symbol}${economics.totalCogsLocal.toFixed(2)} ($${economics.totalCogsUsd.toFixed(2)})`,
              badge: activeCountry.code,
            },
            {
              label: 'Net Profit (Local & USD)',
              value: `${economics.netProfitLocal < 0 ? '-' : ''}${activeCurrency.symbol}${Math.abs(economics.netProfitLocal).toFixed(2)} / $${economics.netProfitUsd.toFixed(2)}`,
              badge: `${economics.netMarginPct.toFixed(1)}%`,
            },
            {
              label: 'Break-Even Order Price',
              value: `${activeCurrency.symbol}${economics.breakEvenLocal.toFixed(2)}`,
              badge: '0% Net',
            },
            {
              label: 'Payment Fee',
              value: `${activeCurrency.symbol}${economics.channelFeeLocal.toFixed(2)}`,
              badge: `${channelFeePct}%`,
            },
          ]}
        />
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow={`LOCAL PRODUCTION VS CROSS-BORDER · ${activeCountry.name.toUpperCase()}`}
        title={`Gelato 32-Country Routing Impact (${activeProduct.label} ×${routing.qty})`}
        filename={`gelato-routing-${activeCountry.code.toLowerCase()}.csv`}
        accent={ACCENT_RAW}
        maxHeight={220}
        columns={[
          { key: 'route', label: 'Fulfillment Route' },
          { key: 'transit', label: 'Est. Transit', mono: true },
          { key: 'shipping', label: 'Shipping', mono: true, align: 'right' },
          { key: 'customs', label: 'Customs / VAT', mono: true, align: 'right' },
          { key: 'distance', label: 'Distance', mono: true, align: 'right' },
          { key: 'co2', label: 'Carbon', mono: true, align: 'right' },
          { key: 'status', label: 'Health' },
        ]}
        rows={routing.comparisonRows}
      />

      <SovereignCard
        index="03"
        eyebrow="GELATO ORDER API v4 PAYLOAD & CLI EXPORTER"
        title="POST https://order.gelatoapis.com/v4/orders"
        subtitle="Configure orderReferenceId, productUid, and recipient shipping address, then export gelato-order.json or local :8116 CLI commands"
        accent={ACCENT_RAW}
        right={<CodeIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.25 }}>
          <TextField
            size="small"
            label="orderReferenceId"
            value={orderRefId}
            onChange={(e) => {
              setOrderRefId(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 170px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <TextField
            size="small"
            label="customerReferenceId"
            value={customerRefId}
            onChange={(e) => {
              setCustomerRefId(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 150px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, alignItems: 'center' }}>
            {['draft', 'order'].map((mode) => {
              const active = orderType === mode;
              return (
                <Chip
                  key={mode}
                  label={`orderType: ${mode}`}
                  clickable
                  onClick={() => {
                    setOrderType(mode);
                    setCustomJsonOverride('');
                  }}
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
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.25 }}>
          <TextField
            size="small"
            label="Recipient Full Name"
            value={recipientName}
            onChange={(e) => {
              setRecipientName(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <TextField
            size="small"
            label="Address Line 1"
            value={addressLine1}
            onChange={(e) => {
              setAddressLine1(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '2 1 200px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <TextField
            size="small"
            label="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <TextField
            size="small"
            label="Postal Code"
            value={postCode}
            onChange={(e) => {
              setPostCode(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            label="Print-Ready Artwork URL (300 DPI PDF/PNG)"
            value={artworkUrl}
            onChange={(e) => {
              setArtworkUrl(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '2 1 240px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
          />
          <TextField
            size="small"
            label="Notification Email"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25, alignItems: 'center' }}>
          {[
            { id: 'json', label: 'Editable Order v4 JSON' },
            { id: 'curl', label: 'Order API v4 curl' },
            { id: 'cli', label: 'Local CLI (:8116)' },
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
                  ? `Valid Gelato Order API v4 payload · ${activeProduct.productUid} · Destination ${activeCountry.code}`
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
                onClick={handleDownloadOrder}
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
                Download gelato-order.json
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
                {copied === 'json' ? 'Copied JSON' : 'Copy Order v4 JSON'}
              </Button>
            </Box>
          </Box>
        ) : payloadTab === 'curl' ? (
          <SovereignCodeBlock
            title="POST https://order.gelatoapis.com/v4/orders"
            badge="CURL"
            code={curlSnippet}
            filename="gelato-order-v4.sh"
            accent={ACCENT_RAW}
            maxHeight={300}
          />
        ) : (
          <SovereignCodeBlock
            title="GELATO-CONNECTOR LOCAL CLI & DAEMON (:8116)"
            badge="LOCAL :8116"
            code={cliSnippet}
            filename="gelato-connector-cli.sh"
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
          title="Runtime Scope · 100% Client-Side 32-Country Router, FX Margin Engine & Order API v4 Studio"
          message="Local production hub routing, customs/VAT avoidance math, carbon-distance estimates, multi-currency margin calculations, and Gelato Order API v4 JSON synthesis run entirely in your browser with zero remote requests. Live order dispatch runs strictly locally via gelato-connector (:8116) using ~/.config/zothos/gelato.env."
        />
      </Box>
      <SovereignWorkstationShell
        id="gelato-connector"
        category="COMMERCE & POD · GELATO ORDER API v4 (:8116)"
        title="Gelato Connector & 32-Country Local Router"
        subtitle="Route orders to the nearest local Gelato production hub across 32 countries to eliminate cross-border tariffs and cut transit carbon, model multi-currency VAT margins, and export Order API v4 payloads."
        version="2.5.0"
        variant="braille-orbit"
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
