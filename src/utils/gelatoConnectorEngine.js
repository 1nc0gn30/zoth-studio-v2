/**
 * Gelato Connector v2.6.0 — Pure Deterministic Engine (Zoth Studio v2)
 * Aligned with backend src/gelato_connector/ (7 products, 10 bundled local hubs,
 * FX-safe multi-currency margins, 300-DPI/Bleed auditor, Order API v4 draft builder
 * with public https:// SSRF validation, and 6 stdio MCP tools).
 *
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.
 */

export const GELATO_CONNECTOR_VERSION = '2.6.0';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', defaultFxToUsd: 1.0, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', defaultFxToUsd: 1.08, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', defaultFxToUsd: 1.27, label: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', defaultFxToUsd: 0.73, label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', defaultFxToUsd: 0.65, label: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', defaultFxToUsd: 1 / 150, label: 'JPY (¥)' },
];

export const DEFAULT_FX_TO_USD = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.defaultFxToUsd]),
);

// 10 Bundled Local Production Hubs (exact parity with backend LOCAL_HUBS)
export const LOCAL_HUBS = [
  {
    code: 'US',
    iso2: 'US',
    name: 'United States',
    region: 'NA',
    currency: 'USD',
    hub: 'Domestic United States Print Facility',
    carrier: 'USPS / FedEx Ground',
    localShipNative: 4.5,
    expressShipNative: 9.8,
    localDays: [2, 4],
    usCrossBorderDays: [4, 7],
    localKm: 490,
    usKm: 1850,
    dutyPct: 0.0,
    brokerageUsd: 0.0,
    vatPct: 0,
    sampleCity: 'Austin',
    samplePostCode: '78701',
  },
  {
    code: 'DE',
    iso2: 'DE',
    name: 'Germany',
    region: 'EU',
    currency: 'EUR',
    hub: 'Domestic Germany Print Facility',
    carrier: 'Deutsche Post / DHL',
    localShipNative: 4.2,
    expressShipNative: 8.5,
    localDays: [2, 4],
    usCrossBorderDays: [10, 16],
    localKm: 280,
    usKm: 7250,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 19,
    sampleCity: 'Berlin',
    samplePostCode: '10115',
  },
  {
    code: 'UK',
    iso2: 'GB',
    name: 'United Kingdom',
    region: 'UK',
    currency: 'GBP',
    hub: 'Domestic United Kingdom Print Facility',
    carrier: 'Royal Mail 48 / DPD',
    localShipNative: 3.9,
    expressShipNative: 7.5,
    localDays: [2, 3],
    usCrossBorderDays: [9, 14],
    localKm: 210,
    usKm: 6350,
    dutyPct: 0.09,
    brokerageUsd: 12.0,
    vatPct: 20,
    sampleCity: 'London',
    samplePostCode: 'EC1A 1BB',
  },
  {
    code: 'FR',
    iso2: 'FR',
    name: 'France',
    region: 'EU',
    currency: 'EUR',
    hub: 'Domestic France Print Facility',
    carrier: 'Colissimo / Chronopost',
    localShipNative: 4.6,
    expressShipNative: 8.9,
    localDays: [2, 4],
    usCrossBorderDays: [10, 15],
    localKm: 320,
    usKm: 6700,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 20,
    sampleCity: 'Paris',
    samplePostCode: '75001',
  },
  {
    code: 'IT',
    iso2: 'IT',
    name: 'Italy',
    region: 'EU',
    currency: 'EUR',
    hub: 'Domestic Italy Print Facility',
    carrier: 'Poste Italiane / BRT',
    localShipNative: 4.9,
    expressShipNative: 9.2,
    localDays: [2, 4],
    usCrossBorderDays: [10, 16],
    localKm: 340,
    usKm: 7100,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 22,
    sampleCity: 'Milan',
    samplePostCode: '20121',
  },
  {
    code: 'ES',
    iso2: 'ES',
    name: 'Spain',
    region: 'EU',
    currency: 'EUR',
    hub: 'Domestic Spain Print Facility',
    carrier: 'Correos / SEUR',
    localShipNative: 4.7,
    expressShipNative: 8.9,
    localDays: [2, 4],
    usCrossBorderDays: [11, 17],
    localKm: 340,
    usKm: 6450,
    dutyPct: 0.08,
    brokerageUsd: 11.5,
    vatPct: 21,
    sampleCity: 'Madrid',
    samplePostCode: '28013',
  },
  {
    code: 'NL',
    iso2: 'NL',
    name: 'Netherlands',
    region: 'EU',
    currency: 'EUR',
    hub: 'Domestic Netherlands Print Facility',
    carrier: 'PostNL / DPD',
    localShipNative: 4.1,
    expressShipNative: 7.9,
    localDays: [2, 3],
    usCrossBorderDays: [9, 15],
    localKm: 165,
    usKm: 6650,
    dutyPct: 0.08,
    brokerageUsd: 11.0,
    vatPct: 21,
    sampleCity: 'Amsterdam',
    samplePostCode: '1012 JS',
  },
  {
    code: 'CA',
    iso2: 'CA',
    name: 'Canada',
    region: 'NA',
    currency: 'CAD',
    hub: 'Domestic Canada Print Facility',
    carrier: 'Canada Post / Purolator',
    localShipNative: 6.8,
    expressShipNative: 12.5,
    localDays: [2, 4],
    usCrossBorderDays: [8, 13],
    localKm: 390,
    usKm: 2450,
    dutyPct: 0.07,
    brokerageUsd: 9.5,
    vatPct: 5,
    sampleCity: 'Toronto',
    samplePostCode: 'M5V 2T6',
  },
  {
    code: 'AU',
    iso2: 'AU',
    name: 'Australia',
    region: 'APAC',
    currency: 'AUD',
    hub: 'Domestic Australia Print Facility',
    carrier: 'Australia Post / StarTrack',
    localShipNative: 7.2,
    expressShipNative: 13.9,
    localDays: [2, 4],
    usCrossBorderDays: [12, 20],
    localKm: 410,
    usKm: 15100,
    dutyPct: 0.1,
    brokerageUsd: 13.0,
    vatPct: 10,
    sampleCity: 'Sydney',
    samplePostCode: '2000',
  },
  {
    code: 'JP',
    iso2: 'JP',
    name: 'Japan',
    region: 'APAC',
    currency: 'JPY',
    hub: 'Domestic Japan Print Facility',
    carrier: 'Japan Post / Yamato',
    localShipNative: 650,
    expressShipNative: 1200,
    localDays: [2, 3],
    usCrossBorderDays: [10, 16],
    localKm: 240,
    usKm: 10850,
    dutyPct: 0.08,
    brokerageUsd: 10.0,
    vatPct: 10,
    sampleCity: 'Tokyo',
    samplePostCode: '100-0001',
  },
];

// 7 Curated Products (exact parity with backend catalog.py)
export const GELATO_PRODUCTS = [
  {
    id: 'acrylic_print_16x24',
    label: 'Acrylic Print',
    badge: '16×24 · 3mm',
    fullName: 'Acrylic Glass Print (16×24 in / 40×60 cm)',
    category: 'Wall Art / Acrylic',
    productUid: 'acrylic_print_400x600-mm-16x24-inch_4mm-acrylic_4-0',
    baseCostUsd: 29.5,
    baseCostEur: 27.2,
    baseCostGbp: 23.4,
    defaultRetailUsd: 68.0,
    weightKg: 1.85,
    printWidthPx: 4800,
    printHeightPx: 7200,
    recommendedDpi: 300,
    bleedMm: 3.0,
    localCountries: ['US', 'DE', 'UK', 'CA', 'AU', 'FR', 'NL'],
  },
  {
    id: 'aluminum_print_16x24',
    label: 'Aluminum Dibond',
    badge: '16×24 · 3mm',
    fullName: 'Brushed Aluminum Dibond Print (16×24 in / 40×60 cm)',
    category: 'Wall Art / Aluminum',
    productUid: 'aluminum_print_dibond_400x600-mm-16x24-inch_3mm-brushed_4-0',
    baseCostUsd: 26.8,
    baseCostEur: 24.9,
    baseCostGbp: 21.2,
    defaultRetailUsd: 64.0,
    weightKg: 1.35,
    printWidthPx: 4800,
    printHeightPx: 7200,
    recommendedDpi: 300,
    bleedMm: 3.0,
    localCountries: ['US', 'DE', 'UK', 'CA', 'AU', 'NO'],
  },
  {
    id: 'wooden_framed_canvas_16x24',
    label: 'Framed Canvas',
    badge: '16×24 · 5mm',
    fullName: 'Framed Wooden Canvas Wrap (16×24 in)',
    category: 'Wall Art / Canvas',
    productUid: 'framed_canvas_mounted_400x600-mm-16x24-inch_wood_oak_4-0',
    baseCostUsd: 24.2,
    baseCostEur: 22.5,
    baseCostGbp: 19.3,
    defaultRetailUsd: 68.0,
    weightKg: 1.65,
    printWidthPx: 5100,
    printHeightPx: 7500,
    recommendedDpi: 300,
    bleedMm: 5.0,
    localCountries: ['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'CA', 'AU', 'JP'],
  },
  {
    id: 'stanley_stella_organic_tee',
    label: 'Organic Tee',
    badge: '180gsm · DTG',
    fullName: 'Stanley/Stella Organic Creator Unisex T-Shirt',
    category: 'Apparel / Organic T-Shirts',
    productUid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_organic_gsi_l_gco_black_gpr_4-0',
    baseCostUsd: 12.4,
    baseCostEur: 10.9,
    baseCostGbp: 9.5,
    defaultRetailUsd: 36.0,
    weightKg: 0.3,
    printWidthPx: 4000,
    printHeightPx: 4800,
    recommendedDpi: 300,
    bleedMm: 0.0,
    localCountries: ['DE', 'UK', 'FR', 'NL', 'ES', 'IT', 'US'],
  },
  {
    id: 'ceramic_mug_15oz',
    label: 'Ceramic Mug',
    badge: '15oz · 2mm',
    fullName: 'Large Ceramic Accent Mug 15oz',
    category: 'Home & Living / Mugs',
    productUid: 'mug_product_msz_15-oz_mmat_ceramic-accent_cl_4-0',
    baseCostUsd: 5.95,
    baseCostEur: 5.4,
    baseCostGbp: 4.6,
    defaultRetailUsd: 22.0,
    weightKg: 0.5,
    printWidthPx: 2850,
    printHeightPx: 1200,
    recommendedDpi: 300,
    bleedMm: 2.0,
    localCountries: ['US', 'UK', 'DE', 'CA', 'AU'],
  },
  {
    id: 'enamel_campfire_mug',
    label: 'Enamel Mug',
    badge: '12oz · 2mm',
    fullName: 'Vintage Stainless Steel Enamel Campfire Mug 12oz',
    category: 'Home & Living / Outdoor',
    productUid: 'mug_product_msz_12-oz_mmat_enamel-white_cl_4-0',
    baseCostUsd: 7.4,
    baseCostEur: 6.8,
    baseCostGbp: 5.8,
    defaultRetailUsd: 24.0,
    weightKg: 0.25,
    printWidthPx: 2500,
    printHeightPx: 950,
    recommendedDpi: 300,
    bleedMm: 2.0,
    localCountries: ['US', 'DE', 'UK', 'PL'],
  },
  {
    id: 'hardcover_photo_journal',
    label: 'Photo Journal',
    badge: 'A5 · 4mm',
    fullName: 'Hardcover Matte Photo Journal (A5 / 128 Pages)',
    category: 'Stationery / Journals',
    productUid: 'notebook_hardcover_a5_90gsm-uncoated_128p_4-0',
    baseCostUsd: 8.9,
    baseCostEur: 8.1,
    baseCostGbp: 6.9,
    defaultRetailUsd: 28.0,
    weightKg: 0.42,
    printWidthPx: 3700,
    printHeightPx: 2600,
    recommendedDpi: 300,
    bleedMm: 4.0,
    localCountries: ['US', 'DE', 'UK', 'NL', 'AU'],
  },
];

export const MCP_TOOLS = [
  {
    name: 'gelato_search_catalog',
    summary: 'Search the 7 bundled Gelato products and real Gelato Order API v4 product_uid strings by keyword or category.',
    exampleArgs: '{"query": "canvas"}',
  },
  {
    name: 'gelato_get_shipping_quote',
    summary: 'Calculate domestic or cross-border shipping, lead times, and FX-converted freight savings across 10 bundled local hubs.',
    exampleArgs: '{"product_id": "wooden_framed_canvas_16x24", "destination_country": "JP"}',
  },
  {
    name: 'gelato_calculate_margins',
    summary: 'Compute FX-safe COGS, Etsy/Shopify/Direct fees, net profit, margin %, and break-even in USD, EUR, GBP, CAD, AUD, or JPY.',
    exampleArgs: '{"product_id": "wooden_framed_canvas_16x24", "retail_price": 68, "currency": "USD", "destination_country": "JP"}',
  },
  {
    name: 'gelato_audit_print_spec',
    summary: 'Audit artwork pixel dimensions, effective DPI, aspect ratio, and bleed compliance (marking 0mm DTG apparel compliant).',
    exampleArgs: '{"product_id": "stanley_stella_organic_tee", "image_width_px": 4000, "image_height_px": 4800}',
  },
  {
    name: 'gelato_create_order_payload',
    summary: 'Build schema-valid Gelato Order API v4 JSON (safe "draft" default, real v4 productUid, strict https:// SSRF guard).',
    exampleArgs: '{"product_id": "acrylic_print_16x24", "image_url": "https://example.com/art-300dpi.png"}',
  },
  {
    name: 'gelato_get_shop_info',
    summary: 'Verify GELATO_API_KEY live against Product API v3 /catalogs or report honest offline mode.',
    exampleArgs: '{}',
  },
];

export function normalizeCountryCode(code) {
  const c = String(code || 'US').trim().toUpperCase();
  return c === 'GB' ? 'UK' : c;
}

export function getHubByCountry(code) {
  const norm = normalizeCountryCode(code);
  return LOCAL_HUBS.find((h) => h.code === norm) || LOCAL_HUBS[0];
}

export function getProductById(id) {
  return GELATO_PRODUCTS.find((p) => p.id === id) || GELATO_PRODUCTS[0];
}

export function convertCurrency(amount, fromCurrency, toCurrency, fxMap = DEFAULT_FX_TO_USD) {
  const src = String(fromCurrency || 'USD').trim().toUpperCase();
  const dst = String(toCurrency || 'USD').trim().toUpperCase();
  if (src === dst) return Number(Number(amount).toFixed(2));
  const srcRate = fxMap[src] ?? DEFAULT_FX_TO_USD[src];
  const dstRate = fxMap[dst] ?? DEFAULT_FX_TO_USD[dst];
  if (!srcRate || !dstRate) {
    throw new Error(`Unsupported currency conversion: ${src} -> ${dst}`);
  }
  return Number(((Number(amount) * srcRate) / dstRate).toFixed(2));
}

export function validatePublicHttpsUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) {
    return { valid: false, error: 'Artwork URL is required and must use https://' };
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { valid: false, error: 'Invalid URL syntax' };
  }
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only public https:// URLs are allowed (http:// and file:// are blocked)' };
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  const blockedHosts = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal', 'metadata']);
  const blockedSuffixes = ['.localhost', '.local', '.internal', '.invalid', '.home.arpa'];
  if (!host || blockedHosts.has(host) || blockedSuffixes.some((s) => host.endsWith(s))) {
    return { valid: false, error: `Blocked local/internal host '${host}'` };
  }
  if (
    host === '::1' ||
    host === '[::1]' ||
    /^fe80:/i.test(host.replace(/^\[|\]$/g, '')) ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host)
  ) {
    return { valid: false, error: `Blocked private/loopback/IMDS IP '${host}'` };
  }
  if (!host.includes('.')) {
    return { valid: false, error: `Host '${host}' must be a fully-qualified public domain` };
  }
  return { valid: true, url: raw, error: '' };
}

export function calculateRoutingAndEconomics({
  productId,
  countryCode,
  quantity = 1,
  currencyCode = 'EUR',
  fxRates = DEFAULT_FX_TO_USD,
  retailLocal = 68,
  buyerShipLocal = 0,
  vatIncluded = true,
  vatPct = 19,
  channelFeePct = 2.9,
}) {
  const product = getProductById(productId);
  const country = getHubByCountry(countryCode);
  const qty = Math.max(1, Number(quantity) || 1);
  const fxToUsd = Math.max(0.001, Number(fxRates[currencyCode]) || DEFAULT_FX_TO_USD[currencyCode] || 1.0);

  const isLocal = product.localCountries.includes(country.code);
  const prodUsd = Number((product.baseCostUsd * qty).toFixed(2));

  // Local shipping converted from hub's native currency to USD (and then to selected margin currency)
  const localShipNative = Number(
    (country.localShipNative + country.localShipNative * 0.4 * Math.max(0, qty - 1)).toFixed(2),
  );
  const localShipUsd = isLocal
    ? convertCurrency(localShipNative, country.currency, 'USD', fxRates)
    : Number((11.8 + 4.5 * Math.max(0, qty - 1)).toFixed(2));
  const crossShipUsd = Number((16.5 + 5.0 * Math.max(0, qty - 1)).toFixed(2));

  const declaredValUsd = Math.max(0, Number(retailLocal) || 0) * fxToUsd * qty;
  const avoidedDutyUsd = isLocal ? Number((declaredValUsd * country.dutyPct).toFixed(2)) : 0;
  const avoidedBrokerageUsd = isLocal ? country.brokerageUsd : 0;
  const totalTariffSavingsUsd = Number((avoidedDutyUsd + avoidedBrokerageUsd).toFixed(2));
  const freightSavingsUsd = Math.max(0, Number((crossShipUsd - localShipUsd).toFixed(2)));
  const totalLandedSavingsUsd = Number((freightSavingsUsd + totalTariffSavingsUsd).toFixed(2));

  const localAvgDays = (country.localDays[0] + country.localDays[1]) / 2;
  const crossAvgDays = (country.usCrossBorderDays[0] + country.usCrossBorderDays[1]) / 2;
  const daysSaved = isLocal ? Math.max(0, crossAvgDays - localAvgDays) : 0;

  const parcelTonnes = (product.weightKg * qty) / 1000;
  const localCo2Kg = Number(Math.max(0.08, parcelTonnes * country.localKm * 0.09 + 0.14).toFixed(2));
  const crossCo2Kg = Number(Math.max(0.45, parcelTonnes * country.usKm * 0.52 + 0.35).toFixed(2));
  const co2SavedKg = isLocal ? Math.max(0, Number((crossCo2Kg - localCo2Kg).toFixed(2))) : 0;
  const co2ReductionPct = isLocal && crossCo2Kg > 0 ? Number(((co2SavedKg / crossCo2Kg) * 100).toFixed(1)) : 0;
  const kmSaved = isLocal ? Math.max(0, country.usKm - country.localKm) : 0;

  // Economics in chosen currencyCode
  const grossLocal = Number(((Math.max(0, Number(retailLocal) || 0) * qty) + Math.max(0, Number(buyerShipLocal) || 0)).toFixed(2));
  const vatRate = Math.max(0, Number(vatPct) || 0) / 100;
  const vatLocal = vatIncluded && vatRate > 0 ? Number((grossLocal - grossLocal / (1 + vatRate)).toFixed(2)) : 0;
  const netRevExVatLocal = Number((grossLocal - vatLocal).toFixed(2));

  let prodLocal;
  if (currencyCode === 'EUR') prodLocal = Number((product.baseCostEur * qty).toFixed(2));
  else if (currencyCode === 'GBP') prodLocal = Number((product.baseCostGbp * qty).toFixed(2));
  else if (currencyCode === 'USD') prodLocal = prodUsd;
  else prodLocal = convertCurrency(prodUsd, 'USD', currencyCode, fxRates);

  const shipLocal = isLocal
    ? convertCurrency(localShipNative, country.currency, currencyCode, fxRates)
    : convertCurrency(localShipUsd, 'USD', currencyCode, fxRates);

  const totalCogsLocal = Number((prodLocal + shipLocal).toFixed(2));
  const feeRate = Math.max(0, Number(channelFeePct) || 0) / 100;
  const fixedFeeLocal = convertCurrency(0.3, 'USD', currencyCode, fxRates);
  const channelFeeLocal = Number((grossLocal * feeRate + fixedFeeLocal).toFixed(2));

  const netProfitLocal = Number((netRevExVatLocal - channelFeeLocal - totalCogsLocal).toFixed(2));
  const netProfitUsd = Number((netProfitLocal * fxToUsd).toFixed(2));
  const netMarginPct = netRevExVatLocal > 0 ? Number(((netProfitLocal / netRevExVatLocal) * 100).toFixed(1)) : 0;

  const keepFactor = vatIncluded ? 1 / (1 + vatRate) - feeRate : 1 - feeRate;
  const breakEvenLocal = keepFactor > 0 ? Number(((totalCogsLocal + fixedFeeLocal) / keepFactor).toFixed(2)) : 0;

  const comparisonRows = [
    {
      id: 'gelato-local',
      route: isLocal ? `Gelato Local (${country.code})` : `Gelato Regional (${country.code})`,
      transit: isLocal ? `${country.localDays[0]}–${country.localDays[1]}d` : '7–14d',
      shipping: `$${localShipUsd.toFixed(2)}`,
      customs: isLocal ? '$0.00 (Domestic)' : `$${totalTariffSavingsUsd.toFixed(2)} Est.`,
      distance: `${(isLocal ? country.localKm : country.usKm).toLocaleString()} km`,
      co2: `${(isLocal ? localCo2Kg : crossCo2Kg).toFixed(2)} kg`,
      status: isLocal ? 'PASS' : 'WARN',
    },
    {
      id: 'us-cross-border',
      route: 'Cross-Border Air',
      transit: `${country.usCrossBorderDays[0]}–${country.usCrossBorderDays[1]}d`,
      shipping: `$${crossShipUsd.toFixed(2)}`,
      customs: `$${totalTariffSavingsUsd.toFixed(2)} (Duty+Fee)`,
      distance: `${country.usKm.toLocaleString()} km`,
      co2: `${crossCo2Kg.toFixed(2)} kg`,
      status: country.code === 'US' ? 'WARN' : 'FAIL',
    },
  ];

  return {
    product,
    country,
    isLocal,
    qty,
    fxToUsd,
    routing: {
      prodUsd,
      localShipNative,
      localShipCurrency: isLocal ? country.currency : 'USD',
      localShipUsd,
      crossShipUsd,
      freightSavingsUsd,
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
    },
    economics: {
      grossLocal,
      grossUsd: Number((grossLocal * fxToUsd).toFixed(2)),
      vatLocal,
      vatUsd: Number((vatLocal * fxToUsd).toFixed(2)),
      netRevExVatLocal,
      prodLocal,
      shipLocal,
      totalCogsLocal,
      totalCogsUsd: Number((totalCogsLocal * fxToUsd).toFixed(2)),
      channelFeeLocal,
      netProfitLocal,
      netProfitUsd,
      netMarginPct,
      breakEvenLocal,
    },
  };
}

export function auditArtworkSpec(productId, widthPx, heightPx) {
  const product = getProductById(productId);
  const w = Number(widthPx);
  const h = Number(heightPx);
  if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
    throw new Error('Width and height must be positive integers (> 0)');
  }
  const scale = Math.min(w / product.printWidthPx, h / product.printHeightPx);
  const effectiveDpi = Math.round(product.recommendedDpi * scale);

  let grade = 'CRITICAL_LOW_RES';
  const feedback = [];
  if (effectiveDpi >= 300) {
    grade = 'EXCELLENT';
    feedback.push('Artwork satisfies Gelato 300+ DPI gallery print benchmark.');
  } else if (effectiveDpi >= 200) {
    grade = 'ACCEPTABLE';
    feedback.push(`Effective DPI is ${effectiveDpi}. Meets retail standards; 300 DPI recommended for wall art.`);
  } else if (effectiveDpi >= 150) {
    grade = 'WARNING';
    feedback.push(`Effective DPI is ${effectiveDpi}. May exhibit slight grain on large prints.`);
  } else {
    feedback.push(`Effective DPI is ${effectiveDpi}. High pixelation risk; upscale artwork before publishing.`);
  }

  const bleedNote =
    product.bleedMm > 0
      ? `Product requires ${product.bleedMm}mm perimeter bleed zone. Keep key typography inside the safe area.`
      : 'No bleed required for DTG apparel';
  const bleedCompliance = product.bleedMm > 0 ? effectiveDpi >= 200 : true;
  feedback.push(bleedNote);

  const targetAspect = product.printWidthPx / product.printHeightPx;
  const artAspect = w / h;
  if (Math.abs(targetAspect - artAspect) > 0.15) {
    feedback.push(`Aspect ratio discrepancy (${artAspect.toFixed(2)} vs target ${targetAspect.toFixed(2)}).`);
  }

  return {
    productId: product.id,
    productUid: product.productUid,
    effectiveDpi,
    grade,
    isPrintReady: effectiveDpi >= 200,
    bleedMm: product.bleedMm,
    bleedCompliance,
    bleedNote,
    feedback,
  };
}

export function buildOrderV4Payload({
  productId,
  countryCode,
  currencyCode,
  quantity = 1,
  orderType = 'draft',
  orderRefId = 'ZOTH-ORD-2026-8116',
  customerRefId = 'CUST-EU-0491',
  artworkUrl = 'https://assets.example.com/prints/botanical-arch-300dpi.png',
  artworkTitle = 'Botanical Archival Print',
  recipientName = 'Clara Lindqvist',
  addressLine1 = 'Torstrasse 114',
  city,
  postCode,
  recipientEmail = 'orders@example.com',
  co2ReductionPct = 67,
}) {
  const product = getProductById(productId);
  const country = getHubByCountry(countryCode);
  const mode = orderType === 'order' ? 'order' : 'draft';
  const urlCheck = validatePublicHttpsUrl(artworkUrl);
  const nameParts = String(recipientName || 'Alex Operator').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Alex';
  const lastName = nameParts.slice(1).join(' ') || 'Operator';

  return {
    urlValidation: urlCheck,
    payload: {
      orderType: mode,
      orderReferenceId: String(orderRefId || 'ZOTH-ORD-2026-8116').trim(),
      customerReferenceId: String(customerRefId || 'CUST-001').trim(),
      currency: String(currencyCode || country.currency).toUpperCase(),
      items: [
        {
          itemReferenceId: `ITEM-${product.id.toUpperCase()}-01`,
          productUid: product.productUid,
          title: String(artworkTitle || product.fullName).trim(),
          files: [
            {
              type: 'default',
              url: urlCheck.valid ? urlCheck.url : 'https://assets.example.com/prints/placeholder-300dpi.png',
            },
          ],
          quantity: Math.max(1, Number(quantity) || 1),
        },
      ],
      shipmentMethodUid: 'standard',
      shippingAddress: {
        firstName,
        lastName,
        addressLine1: String(addressLine1 || '123 Studio Way').trim(),
        city: String(city || country.sampleCity).trim(),
        postCode: String(postCode || country.samplePostCode).trim(),
        country: country.iso2,
        email: String(recipientEmail || 'orders@example.com').trim(),
      },
      metadata: {
        artworkTitle: String(artworkTitle || product.fullName).trim(),
        resolvedLocalHub: country.hub,
        estimatedTransitDays: `${country.localDays[0]}-${country.localDays[1]}`,
        carbonReductionPct: Number(Number(co2ReductionPct).toFixed(1)),
      },
    },
  };
}
