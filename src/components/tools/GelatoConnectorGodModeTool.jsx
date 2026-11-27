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
import HighQualityIcon from '@mui/icons-material/HighQuality';
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
import {
  GELATO_CONNECTOR_VERSION,
  CURRENCIES,
  DEFAULT_FX_TO_USD,
  LOCAL_HUBS,
  GELATO_PRODUCTS,
  MCP_TOOLS,
  calculateRoutingAndEconomics,
  auditArtworkSpec,
  buildOrderV4Payload,
} from '../../utils/gelatoConnectorEngine';

const ACCENT_RAW = SOV.cyber;

export default function GelatoConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const goldAccent = isDark ? SOV.gold : '#8C6A1D';
  const { copied, copy } = useCopy();

  // Fulfillment Router state
  const [countryCode, setCountryCode] = useState('DE');
  const [productId, setProductId] = useState(GELATO_PRODUCTS[2].id);
  const [quantity, setQuantity] = useState(1);

  // Multi-Currency Margin Engine state
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [fxRates, setFxRates] = useState({ ...DEFAULT_FX_TO_USD });
  const [vatIncluded, setVatIncluded] = useState(true);
  const [vatPct, setVatPct] = useState(19);
  const [retailLocal, setRetailLocal] = useState(63.0);
  const [buyerShipLocal, setBuyerShipLocal] = useState(0);
  const [channelFeePct, setChannelFeePct] = useState(2.9);

  // Artwork DPI & Bleed Auditor state
  const [artWidthPx, setArtWidthPx] = useState(5100);
  const [artHeightPx, setArtHeightPx] = useState(7500);

  // Gelato Order API v4 Payload state (safe 'draft' default)
  const [orderRefId, setOrderRefId] = useState('ZOTH-ORD-2026-8116');
  const [customerRefId, setCustomerRefId] = useState('CUST-EU-0491');
  const [orderType, setOrderType] = useState('draft');
  const [artworkTitle, setArtworkTitle] = useState('Botanical Wildflower Archival Print');
  const [artworkUrl, setArtworkUrl] = useState('https://assets.example.com/prints/japandi-arch-300dpi.png');
  const [recipientName, setRecipientName] = useState('Clara Lindqvist');
  const [addressLine1, setAddressLine1] = useState('Torstrasse 114');
  const [city, setCity] = useState('Berlin');
  const [postCode, setPostCode] = useState('10115');
  const [recipientEmail, setRecipientEmail] = useState('orders@example.com');
  const [payloadTab, setPayloadTab] = useState('json');
  const [customJsonOverride, setCustomJsonOverride] = useState('');

  const activeCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0],
    [currencyCode],
  );

  const calc = useMemo(
    () =>
      calculateRoutingAndEconomics({
        productId,
        countryCode,
        quantity,
        currencyCode,
        fxRates,
        retailLocal,
        buyerShipLocal,
        vatIncluded,
        vatPct,
        channelFeePct,
      }),
    [productId, countryCode, quantity, currencyCode, fxRates, retailLocal, buyerShipLocal, vatIncluded, vatPct, channelFeePct],
  );

  const activeCountry = calc.country;
  const activeProduct = calc.product;
  const routing = calc.routing;
  const economics = calc.economics;
  const fxToUsd = calc.fxToUsd;

  const auditResult = useMemo(() => {
    try {
      return auditArtworkSpec(productId, Math.max(1, Math.round(Number(artWidthPx) || 1)), Math.max(1, Math.round(Number(artHeightPx) || 1)));
    } catch {
      return auditArtworkSpec(productId, activeProduct.printWidthPx, activeProduct.printHeightPx);
    }
  }, [productId, artWidthPx, artHeightPx, activeProduct]);

  const handleSelectCountry = (dest) => {
    setCountryCode(dest.code);
    setVatPct(dest.vatPct);
    setCity(dest.sampleCity);
    setPostCode(dest.samplePostCode);
    const nextCurr = CURRENCIES.find((c) => c.code === dest.currency) || CURRENCIES[0];
    setCurrencyCode(nextCurr.code);
    const rate = fxRates[nextCurr.code] || nextCurr.defaultFxToUsd;
    setRetailLocal(Number((activeProduct.defaultRetailUsd / rate).toFixed(nextCurr.code === 'JPY' ? 0 : 2)));
    setCustomJsonOverride('');
  };

  const handleSelectProduct = (prod) => {
    setProductId(prod.id);
    setArtWidthPx(prod.printWidthPx);
    setArtHeightPx(prod.printHeightPx);
    setRetailLocal(Number((prod.defaultRetailUsd / fxToUsd).toFixed(currencyCode === 'JPY' ? 0 : 2)));
    setCustomJsonOverride('');
  };

  const handleSelectCurrency = (curr) => {
    const prevRate = fxToUsd;
    const nextRate = Math.max(0.001, Number(fxRates[curr.code]) || curr.defaultFxToUsd);
    const currentUsd = retailLocal * prevRate;
    setCurrencyCode(curr.code);
    setRetailLocal(Number((currentUsd / nextRate).toFixed(curr.code === 'JPY' ? 0 : 2)));
    setCustomJsonOverride('');
  };

  const orderBuild = useMemo(
    () =>
      buildOrderV4Payload({
        productId,
        countryCode,
        currencyCode,
        quantity: calc.qty,
        orderType,
        orderRefId,
        customerRefId,
        artworkUrl,
        artworkTitle,
        recipientName,
        addressLine1,
        city,
        postCode,
        recipientEmail,
        co2ReductionPct: routing.co2ReductionPct,
      }),
    [
      productId,
      countryCode,
      currencyCode,
      calc.qty,
      orderType,
      orderRefId,
      customerRefId,
      artworkUrl,
      artworkTitle,
      recipientName,
      addressLine1,
      city,
      postCode,
      recipientEmail,
      routing.co2ReductionPct,
    ],
  );

  const generatedOrderPayload = orderBuild.payload;
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
    () => `# Start or inspect Gelato Connector v${GELATO_CONNECTOR_VERSION} user systemd daemon (:8116)
systemctl --user status gelato-connector.service
gelato-connector status --json
curl -s http://127.0.0.1:8116/health

# Optional live Product v3 / Order v4 API key (never required for offline planning)
export GELATO_API_KEY="your-gelato-dashboard-key"

# Inspect bundled 7-product catalog, 10-hub shipping, FX-safe margins & 300-DPI audit
gelato-connector catalog
gelato-connector shipping --product ${activeProduct.id} --country ${activeCountry.code}
gelato-connector margins --product ${activeProduct.id} --price ${retailLocal} --currency ${currencyCode} --country ${activeCountry.code}
gelato-connector audit --product ${activeProduct.id} --width ${artWidthPx} --height ${artHeightPx}

# Start the 6-tool JSON-RPC 2.0 stdio MCP server or Braille benchmark TUI
gelato-connector mcp
gelato-connector-tui --status --json`,
    [activeCountry.code, activeProduct.id, retailLocal, currencyCode, artWidthPx, artHeightPx],
  );

  const mcpSnippet = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            'gelato-connector': {
              command: 'gelato-connector',
              args: ['mcp'],
            },
          },
          localDiscoveryEndpoint: 'http://127.0.0.1:8116/api/mcp/tools',
          tools: MCP_TOOLS.map((t) => ({ name: t.name, summary: t.summary })),
        },
        null,
        2,
      ),
    [],
  );

  const handleDownloadOrder = () => {
    if (jsonValidation.valid && jsonValidation.parsed) {
      downloadJson(jsonValidation.parsed, 'gelato-order-v4.json');
    } else {
      downloadText(effectiveJsonString, 'gelato-order-v4.json', 'application/json;charset=utf-8');
    }
  };

  const kpis = [
    {
      label: 'Resolved Local Hub',
      value: activeCountry.code,
      unit: calc.isLocal
        ? `${activeCountry.localDays[0]}–${activeCountry.localDays[1]}d (${routing.daysSaved.toFixed(0)}d faster)`
        : 'Cross-Border (7–14d)',
      accent: SOV.cyber,
    },
    {
      label: 'Net Profit (Local / USD)',
      value: `${economics.netProfitLocal < 0 ? '-' : ''}${activeCurrency.symbol}${Math.abs(economics.netProfitLocal).toFixed(currencyCode === 'JPY' ? 0 : 2)}`,
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
      label: 'Print & Carbon Grade',
      value: `${auditResult.effectiveDpi} DPI`,
      unit: `${auditResult.grade} · −${routing.co2ReductionPct.toFixed(0)}% CO₂e`,
      accent: auditResult.isPrintReady ? SOV.emerald : SOV.crimson,
    },
  ];

  const statusNode = `${activeCountry.code} HUB · ${currencyCode} (1=${fxToUsd.toFixed(currencyCode === 'JPY' ? 4 : 2)} USD) · ${auditResult.effectiveDpi} DPI`;

  const actions = [
    {
      label: 'Download Order v4 JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadOrder,
      primary: true,
    },
    {
      label: copied === 'curl' ? 'Copied Order v4 curl' : 'Copy Order v4 curl',
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
        eyebrow="10 BUNDLED LOCAL HUBS · 7 PRODUCTS"
        title="Destination Hub & Product Selector"
        subtitle="Select buyer destination and Gelato catalog SKU to resolve local hub routing, customs savings, and carbon reduction"
        accent={ACCENT_RAW}
        right={<PublicIcon sx={{ color: accent }} />}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          BUNDLED GELATO PRODUCT (REAL ORDER API v4 UID)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={GELATO_PRODUCTS}
            activeId={productId}
            onSelect={handleSelectProduct}
            onReset={() => handleSelectProduct(GELATO_PRODUCTS[2])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          DESTINATION COUNTRY (10 BUNDLED HUBS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {LOCAL_HUBS.map((dest) => {
            const active = dest.code === countryCode;
            return (
              <Chip
                key={dest.code}
                label={`${dest.code} · ${dest.name}`}
                clickable
                onClick={() => handleSelectCountry(dest)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.38)'}`,
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <SovereignGauge
              value={routing.co2ReductionPct}
              max={100}
              label="CO₂e REDUCTION"
              unit="%"
              status={calc.isLocal ? 'LOCAL HUB' : 'CROSS-BORDER'}
              thresholds={{ warn: 55, danger: 25 }}
              invertThresholds
            />
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: accent, mb: 0.35 }}>
                {calc.isLocal ? activeCountry.hub : 'Nearest Regional Hub (Cross-Border)'}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}>
                Carrier: <strong>{calc.isLocal ? activeCountry.carrier : 'DHL Express / Asendia'}</strong> ({calc.isLocal ? `${activeCountry.localDays[0]}–${activeCountry.localDays[1]}d` : '7–14d'})<br />
                Saved: <strong>${routing.totalLandedSavingsUsd.toFixed(2)} USD</strong> (${routing.totalTariffSavingsUsd.toFixed(2)} duty/fee avoided)
              </Typography>
            </Box>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="FX-SAFE MULTI-CURRENCY MARGIN ENGINE"
        title="USD · EUR · GBP · CAD · AUD · JPY Economics"
        subtitle="Automatic FX shipping conversion (including JPY -> USD), VAT/GST handling, and dual local + USD profit readout"
        accent={SOV.gold}
        right={<CurrencyExchangeIcon sx={{ color: goldAccent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {CURRENCIES.map((c) => {
            const active = c.code === currencyCode;
            return (
              <Chip
                key={c.code}
                label={c.label}
                clickable
                onClick={() => handleSelectCurrency(c)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.gold, 0.16) : 'transparent',
                  color: active ? goldAccent : 'text.primary',
                  border: `1px solid ${active ? goldAccent : 'rgba(148,163,184,0.38)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label={`Retail Price (${activeCurrency.symbol})`}
            value={retailLocal}
            onChange={(e) => setRetailLocal(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: currencyCode === 'JPY' ? 100 : 0.5, min: 0 }}
            sx={{ flex: '1 1 175px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label={`Buyer Shipping (${activeCurrency.symbol})`}
            value={buyerShipLocal}
            onChange={(e) => setBuyerShipLocal(Math.max(0, Number(e.target.value)))}
            inputProps={{ step: 0.5, min: 0 }}
            sx={{ flex: '1 1 175px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label={`FX (1 ${currencyCode} to USD)`}
            value={Number(fxToUsd.toFixed(currencyCode === 'JPY' ? 5 : 2))}
            onChange={(e) =>
              setFxRates((prev) => ({
                ...prev,
                [currencyCode]: Math.max(0.001, Number(e.target.value)),
              }))
            }
            inputProps={{ step: currencyCode === 'JPY' ? 0.0005 : 0.01, min: 0.001 }}
            sx={{ flex: '1 1 175px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="VAT / GST (%)"
            value={vatPct}
            onChange={(e) => setVatPct(Math.max(0, Math.min(35, Number(e.target.value))))}
            inputProps={{ step: 1, min: 0, max: 35 }}
            sx={{ flex: '1 1 165px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Card / Channel Fee (%)"
            value={channelFeePct}
            onChange={(e) => setChannelFeePct(Math.max(0, Math.min(25, Number(e.target.value))))}
            inputProps={{ step: 0.1, min: 0, max: 25 }}
            sx={{ flex: '1 1 185px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={vatIncluded}
              onChange={(e) => setVatIncluded(e.target.checked)}
              inputProps={{ 'aria-label': 'VAT or GST included in retail price' }}
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: 'text.secondary' }}>
              VAT/GST Included in Retail Price (deducts {activeCurrency.symbol}{economics.vatLocal.toFixed(2)} tax)
            </Typography>
          }
          sx={{ mb: 1.5, minHeight: 44 }}
        />

        <SovereignKeyValueGrid
          cols={2}
          accent={SOV.gold}
          items={[
            {
              label: `Gross Revenue (${currencyCode})`,
              value: `${activeCurrency.symbol}${economics.grossLocal.toFixed(2)} ($${economics.grossUsd.toFixed(2)})`,
              badge: `×${calc.qty}`,
            },
            {
              label: 'VAT / GST Remitted',
              value: `${activeCurrency.symbol}${economics.vatLocal.toFixed(2)} ($${economics.vatUsd.toFixed(2)})`,
              badge: vatIncluded ? `${vatPct}% Incl.` : 'Tax Excl.',
            },
            {
              label: 'Prod + FX-Converted Ship',
              value: `${activeCurrency.symbol}${economics.totalCogsLocal.toFixed(2)} ($${economics.totalCogsUsd.toFixed(2)})`,
              badge: `${routing.localShipNative} ${routing.localShipCurrency}`,
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
              label: 'Channel Fee (+$0.30)',
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
        eyebrow={`LOCAL HUB VS CROSS-BORDER · ${activeCountry.name.toUpperCase()}`}
        title={`10-Hub Routing Impact (${activeProduct.label} ×${calc.qty})`}
        filename={`gelato-routing-${activeCountry.code.toLowerCase()}.csv`}
        accent={ACCENT_RAW}
        maxHeight={360}
        columns={[
          { key: 'route', label: 'Route' },
          { key: 'transit', label: 'Transit', mono: true },
          { key: 'shipping', label: 'Ship', mono: true, align: 'right' },
          { key: 'co2', label: 'Carbon', mono: true, align: 'right' },
          { key: 'status', label: 'Health' },
        ]}
        rows={routing.comparisonRows}
      />

      <SovereignCard
        index="03"
        eyebrow="300-DPI PRINT & BLEED AUDITOR"
        title="Substrate Resolution & DTG Bleed Validator"
        subtitle={`Target for ${activeProduct.label}: ${activeProduct.printWidthPx} × ${activeProduct.printHeightPx} px @ ${activeProduct.recommendedDpi} DPI (${activeProduct.bleedMm}mm bleed)`}
        accent={SOV.emerald}
        right={<HighQualityIcon sx={{ color: isDark ? SOV.emerald : '#047857' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label="Artwork Width (px)"
            value={artWidthPx}
            onChange={(e) => setArtWidthPx(Math.max(1, Number(e.target.value) || 1))}
            inputProps={{ min: 1, step: 100 }}
            sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Artwork Height (px)"
            value={artHeightPx}
            onChange={(e) => setArtHeightPx(Math.max(1, Number(e.target.value) || 1))}
            inputProps={{ min: 1, step: 100 }}
            sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO } }}
          />
        </Box>
        <SovereignKeyValueGrid
          cols={2}
          accent={auditResult.isPrintReady ? SOV.emerald : SOV.crimson}
          items={[
            { label: 'Effective DPI & Grade', value: `${auditResult.effectiveDpi} DPI (${auditResult.grade})`, badge: auditResult.isPrintReady ? 'READY' : 'UPSCALE' },
            { label: 'Bleed Spec Compliance', value: auditResult.bleedNote, badge: auditResult.bleedCompliance ? 'PASS' : 'CHECK' },
          ]}
        />
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="GELATO ORDER API v4 · CLI · 6 MCP TOOLS"
        title="POST https://order.gelatoapis.com/v4/orders"
        subtitle="Safe 'draft' default, real Gelato v4 productUid, public https:// SSRF validation, CLI commands, and 6 stdio MCP tools"
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
            label="Artwork Title"
            value={artworkTitle}
            onChange={(e) => {
              setArtworkTitle(e.target.value);
              setCustomJsonOverride('');
            }}
            sx={{ flex: '1 1 190px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
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
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.primary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.38)'}`,
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
            sx={{ flex: '2 1 190px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
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
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            label="Public HTTPS Artwork URL (SSRF-Guarded)"
            value={artworkUrl}
            error={!orderBuild.urlValidation.valid}
            helperText={orderBuild.urlValidation.valid ? 'Public https:// verified' : orderBuild.urlValidation.error}
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
            { id: 'json', label: 'Order v4 JSON' },
            { id: 'curl', label: 'Order API v4 curl' },
            { id: 'cli', label: 'Local CLI (:8116)' },
            { id: 'mcp', label: '6 Stdio MCP Tools' },
          ].map((tab) => {
            const active = payloadTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setPayloadTab(tab.id)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: isDark ? ACCENT_RAW : accent, color: isDark ? '#08080B' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.4)' }),
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
                minHeight: 44,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                color: isDark ? SOV.amber : '#B45309',
                borderColor: rgba(SOV.amber, 0.45),
              }}
            >
              Reset JSON
            </Button>
          )}
        </Box>

        {payloadTab === 'json' ? (
          <Box>
            <TextField
              label="Editable Gelato Order API v4 JSON Payload"
              multiline
              minRows={11}
              maxRows={16}
              fullWidth
              size="small"
              error={!jsonValidation.valid}
              helperText={
                jsonValidation.valid
                  ? `Valid Order API v4 payload · ${activeProduct.productUid} · ISO2 ${activeCountry.iso2}`
                  : `JSON Parse Error: ${jsonValidation.error}`
              }
              inputProps={{ 'aria-label': 'Editable Gelato Order API v4 JSON Payload' }}
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
                Download gelato-order-v4.json
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
            maxHeight={320}
          />
        ) : payloadTab === 'cli' ? (
          <SovereignCodeBlock
            title="GELATO-CONNECTOR LOCAL CLI & DAEMON (:8116)"
            badge="LOCAL :8116"
            code={cliSnippet}
            filename="gelato-connector-cli.sh"
            accent={SOV.gold}
            maxHeight={320}
          />
        ) : (
          <SovereignCodeBlock
            title="6 STDIO MCP TOOLS (gelato-connector mcp)"
            badge="6 MCP TOOLS"
            code={mcpSnippet}
            filename="gelato-connector-mcp.json"
            accent={SOV.emerald}
            maxHeight={320}
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
          title="Runtime Scope · 100% Client-Side 10-Hub Router, FX Margin Engine, 300-DPI Auditor & Order API v4 Studio"
          message="Local production hub routing across 10 bundled countries, FX-safe shipping conversion, 300-DPI/DTG bleed auditing, and Order API v4 draft JSON synthesis run in your browser with zero remote requests. Live Product v3 catalog checks run locally via gelato-connector (:8116) when GELATO_API_KEY is exported."
        />
      </Box>
      <SovereignWorkstationShell
        id="gelato-connector"
        category="COMMERCE & POD · PRODUCT v3 & ORDER v4 (:8116)"
        title="Gelato Connector & 10-Hub Local Router"
        subtitle="Route 7 curated print SKUs across 10 bundled local Gelato hubs, compute FX-safe multi-currency margins, audit 300-DPI bleed specs, and export SSRF-guarded Order API v4 draft payloads."
        version={GELATO_CONNECTOR_VERSION}
        variant="braille-orbit"
        accent={ACCENT_RAW}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={6}
        rightCols={6}
      />
    </Box>
  );
}
