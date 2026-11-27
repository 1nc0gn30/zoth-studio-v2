/**
 * Pure deterministic engine for Digital Asset Forge v2.6.0 (Zoth Studio God-Mode Deck).
 * Aligned 100% with digital-asset-forge Python backend (ratios.py, pack_generator.py,
 * printing_guide.py, etsy_copywriter.py).
 */

export const ENGINE_VERSION = '2.6.0';

export const PRINT_RATIOS = [
  {
    id: '2x3',
    ratio: '2:3',
    label: '2:3 Classic Tall',
    shortCode: '2x3',
    inchesW: 24,
    inchesH: 36,
    aspect: 2 / 3,
    frameSizes: '4×6", 8×12", 12×18", 16×24", 20×30", 24×36"',
    cmSizes: '10×15, 20×30, 30×45, 40×60, 60×90 cm',
    exportW: 2400,
    exportH: 3600,
  },
  {
    id: '3x4',
    ratio: '3:4',
    label: '3:4 Gallery Vertical',
    shortCode: '3x4',
    inchesW: 18,
    inchesH: 24,
    aspect: 3 / 4,
    frameSizes: '6×8", 9×12", 12×16", 15×20", 18×24"',
    cmSizes: '15×20, 22×30, 30×40, 45×60 cm',
    exportW: 2700,
    exportH: 3600,
  },
  {
    id: '4x5',
    ratio: '4:5',
    label: '4:5 Portrait Standard',
    shortCode: '4x5',
    inchesW: 16,
    inchesH: 20,
    aspect: 4 / 5,
    frameSizes: '4×5", 8×10", 12×15", 16×20"',
    cmSizes: '10×12.5, 20×25, 30×38, 40×50 cm',
    exportW: 2880,
    exportH: 3600,
  },
  {
    id: '11x14',
    ratio: '11:14',
    label: '11:14 Frame Favorite',
    shortCode: '11x14',
    inchesW: 11,
    inchesH: 14,
    aspect: 11 / 14,
    frameSizes: '11×14" exact frame ratio',
    cmSizes: '27.9×35.6 cm exact standard',
    exportW: 3300,
    exportH: 4200,
  },
  {
    id: 'iso-a',
    ratio: 'ISO A-Series',
    label: 'ISO A-Series (A1/A2/A3/A4)',
    shortCode: 'ISO-A',
    inchesW: 23.3867,
    inchesH: 33.11,
    aspect: 1 / Math.SQRT2,
    frameSizes: 'A5, A4, A3, A2, A1 (1:√2 international)',
    cmSizes: '14.8×21, 21×29.7, 29.7×42, 42×59.4, 59.4×84.1 cm',
    exportW: 2546,
    exportH: 3600,
  },
];

export const NICHE_TAGS = {
  abstract: [
    'abstract wall art', 'digital download', 'printable wall art',
    'modern art print', 'large wall decor', 'gallery wall art',
    'minimalist poster', 'neutral home decor', 'aesthetic wall art',
    'living room decor', 'digital art prints', '300 dpi print', 'instant download',
  ],
  botanical: [
    'botanical wall art', 'plant lover gift', 'printable wall art',
    'greenery poster', 'floral art print', 'vintage botanical',
    'cottagecore decor', 'earthy wall decor', 'digital download',
    'nature art print', 'bedroom wall art', '300 dpi print', 'instant download',
  ],
  landscape: [
    'mountain wall art', 'landscape print', 'nature photography',
    'panoramic poster', 'large canvas art', 'scenic wall decor',
    'minimal landscape', 'moody landscape', 'printable wall art',
    'travel poster', 'digital download', '300 dpi print', 'instant download',
  ],
  geometric: [
    'geometric wall art', 'bauhaus print', 'mid century modern',
    'retro wall decor', 'abstract shapes', 'modern canvas art',
    'colorful poster', 'contemporary print', 'digital download',
    'studio apartment', 'gallery wall print', '300 dpi print', 'instant download',
  ],
};

function round1(v) {
  return Math.round(v * 10) / 10;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

/**
 * Matches Python ArtPackGenerator realistic sRGB JPEG sizing:
 * At Q92, (pxW * pxH) / 1048576 * 0.16 MB (2:3 = 11.9 MB, total 5 ratios + 1.2 MB guide = 36.1 MB).
 */
export function estimateJpegMb(pxW, pxH, jpegQuality = 92) {
  const q = Math.min(100, Math.max(70, Number(jpegQuality) || 92));
  const qMultiplier = q === 92 ? 1.0 : q >= 96 ? 1.35 : q >= 90 ? 0.94 + (q - 90) * 0.03 : 0.72 + (q - 70) * 0.011;
  const baseMb = ((pxW * pxH) / (1024 * 1024)) * 0.16 * qMultiplier;
  return Math.max(0.5, round1(baseMb));
}

export function computePackData({
  targetDpi = 300,
  jpegQuality = 92,
  uploadMeta = null,
  retailPrice = 11.99,
  monthlySales = 180,
} = {}) {
  const dpi = Math.max(150, Number(targetDpi) || 300);
  const q = Math.min(100, Math.max(70, Number(jpegQuality) || 92));
  const pngFactor = 0.24;
  const srcW = uploadMeta ? uploadMeta.width : 7200;
  const srcH = uploadMeta ? uploadMeta.height : 10800;

  const matrix = PRINT_RATIOS.map((r) => {
    const pxW = Math.round(r.inchesW * dpi);
    const pxH = Math.round(r.inchesH * dpi);
    const rawRgbMb = (pxW * pxH * 3) / (1024 * 1024);
    const estJpegMb = estimateJpegMb(pxW, pxH, q);
    const estPngMb = Math.max(2.1, round1(rawRgbMb * pngFactor));
    const upscaleRatio = Math.max(pxW / srcW, pxH / srcH);
    const sourceReadiness = !uploadMeta || upscaleRatio <= 1.05 ? 'PASS' : upscaleRatio <= 1.35 ? 'WARN' : 'FAIL';

    return {
      id: r.id,
      ratio: r.ratio,
      shortCode: r.shortCode,
      label: r.label,
      dimensions: `${pxW} × ${pxH} px`,
      pxW,
      pxH,
      maxPrint: r.id === 'iso-a' ? 'A1 (23.4×33.1")' : `${r.inchesW}×${r.inchesH}"`,
      frameSizes: r.frameSizes,
      cmSizes: r.cmSizes,
      rawMb: `${rawRgbMb.toFixed(1)} MB`,
      jpegMb: `${estJpegMb.toFixed(1)} MB`,
      pngMb: `${estPngMb.toFixed(1)} MB`,
      estJpegMbNum: estJpegMb,
      estPngMbNum: estPngMb,
      status: sourceReadiness,
    };
  });

  // Greedy <= 18.0 MB bin-packing (aligned with Python ArtPackGenerator._plan_zip_bundles)
  const BIN_CAP_MB = 18.0;
  const GUIDE_MB = 1.2;
  const bins = [];
  let currentItems = [];
  let currentMb = 0.0;

  matrix.forEach((item) => {
    if (currentMb + item.estJpegMbNum > BIN_CAP_MB && currentItems.length > 0) {
      bins.push({ items: currentItems, totalMb: round1(currentMb), hasGuide: false });
      currentItems = [];
      currentMb = 0.0;
    }
    currentItems.push(item);
    currentMb += item.estJpegMbNum;
  });

  currentMb += GUIDE_MB;
  bins.push({ items: currentItems, totalMb: round1(currentMb), hasGuide: true });

  const zipBundles = bins.map((b, idx) => {
    const codes = b.items.map((i) => i.shortCode);
    const archiveName = `Pack-Part-${idx + 1}-${codes.join('-')}.zip`;
    return {
      id: `zip-${idx + 1}`,
      archive: archiveName,
      ratiosIncluded: b.items.map((i) => i.ratio).join(' + ') + (b.hasGuide ? ' + Guide' : ''),
      fileCount: `${b.items.length} prints${b.hasGuide ? ' + Guide' : ''}`,
      estSize: `${b.totalMb.toFixed(1)} MB`,
      headroom: `${round1(20.0 - b.totalMb).toFixed(1)} MB free`,
      totalMbNum: b.totalMb,
      status: b.totalMb <= 20.0 ? 'PASS' : 'FAIL',
    };
  });

  const totalJpegMb = round1(matrix.reduce((s, m) => s + m.estJpegMbNum, 0) + GUIDE_MB);
  const etsyCompliant = zipBundles.length <= 5 && zipBundles.every((z) => z.status === 'PASS');

  // Digital Download Profit Breakdown (Zero COGS, Zero Shipping)
  const p = Math.max(0.5, Number(retailPrice) || 11.99);
  const vol = Math.max(1, Number(monthlySales) || 180);
  const etsyListingFee = 0.2;
  const etsyTxnFee = round2(p * 0.065);
  const etsyPayFee = round2(p * 0.03 + 0.25);
  const etsyTotalFee = round2(etsyListingFee + etsyTxnFee + etsyPayFee);
  const etsyNet = round2(Math.max(0, p - etsyTotalFee));
  const etsyNetMarginPct = round1((etsyNet / p) * 100);

  const offsiteFee = round2(etsyTotalFee + p * 0.15);
  const offsiteNet = round2(Math.max(0, p - offsiteFee));
  const offsiteMarginPct = round1((offsiteNet / p) * 100);

  const directStripeFee = round2(p * 0.029 + 0.3);
  const directNet = round2(Math.max(0, p - directStripeFee));
  const directMarginPct = round1((directNet / p) * 100);

  const profitRows = [
    {
      id: 'gross-digital',
      channel: 'Digital Product Gross (Zero COGS / Zero Shipping)',
      fees: '$0.00 COGS · $0.00 Ship',
      netUnit: `$${p.toFixed(2)}`,
      margin: '100.0%',
      monthlyNet: `$${(p * vol).toFixed(0)}`,
      status: 'PASS',
    },
    {
      id: 'etsy-organic',
      channel: 'Etsy Organic Digital Download ($0.20 + 6.5% + 3%+$0.25)',
      fees: `$${etsyTotalFee.toFixed(2)}`,
      netUnit: `$${etsyNet.toFixed(2)}`,
      margin: `${etsyNetMarginPct.toFixed(1)}%`,
      monthlyNet: `$${(etsyNet * vol).toFixed(0)}`,
      status: etsyNetMarginPct >= 80 ? 'PASS' : 'WARN',
    },
    {
      id: 'etsy-offsite',
      channel: 'Etsy Offsite Ads Digital (+15% Attribution)',
      fees: `$${offsiteFee.toFixed(2)}`,
      netUnit: `$${offsiteNet.toFixed(2)}`,
      margin: `${offsiteMarginPct.toFixed(1)}%`,
      monthlyNet: `$${(offsiteNet * vol).toFixed(0)}`,
      status: offsiteMarginPct >= 65 ? 'PASS' : 'WARN',
    },
    {
      id: 'direct-shopify',
      channel: 'Direct Shopify / Stripe Digital (2.9% + $0.30)',
      fees: `$${directStripeFee.toFixed(2)}`,
      netUnit: `$${directNet.toFixed(2)}`,
      margin: `${directMarginPct.toFixed(1)}%`,
      monthlyNet: `$${(directNet * vol).toFixed(0)}`,
      status: 'PASS',
    },
  ];

  return {
    matrix,
    zipBundles,
    totalJpegMb,
    etsyCompliant,
    etsyTotalFee,
    etsyNet,
    etsyNetMarginPct,
    directMarginPct,
    profitRows,
  };
}

export function generateEtsyListing({
  artworkTitle = 'Mid-Century Terracotta Arch Gallery Set',
  niche = 'abstract',
  retailPriceUsd = 11.99,
} = {}) {
  const key = String(niche || 'abstract').toLowerCase();
  const nicheKey = Object.prototype.hasOwnProperty.call(NICHE_TAGS, key) ? key : 'abstract';
  const tags = NICHE_TAGS[nicheKey].slice(0, 13).map((t) => t.trim().slice(0, 20));
  const titleBase = String(artworkTitle || 'Digital Wall Art Pack').trim() || 'Digital Wall Art Pack';
  const nicheLabel = nicheKey.charAt(0).toUpperCase() + nicheKey.slice(1);
  let title = `${titleBase} Digital Download, Printable Wall Art, Modern ${nicheLabel} Poster, 300 DPI High Res Art Pack`;
  if (title.length > 135) {
    title = `${title.slice(0, 132)}...`;
  }

  const p = Math.max(0.5, Number(retailPriceUsd) || 11.99);
  const totalFees = round2(0.2 + round2(p * 0.065) + round2(p * 0.03 + 0.25));
  const netProfit = round2(Math.max(0, p - totalFees));
  const marginPct = round1((netProfit / p) * 100);

  const description = [
    'INSTANT DIGITAL DOWNLOAD — NO PHYSICAL ITEM WILL BE SHIPPED',
    '',
    `Elevate your space with '${titleBase}'. Includes 5 high-resolution 300 DPI master files calibrated for standard framing at any scale.`,
    '',
    'Included in your download:',
    '- 5 High-Resolution Master Print Files (300 DPI: 2:3, 3:4, 4:5, 11:14, ISO A1-A5)',
    '- 2 Etsy-compliant <=20 MB ZIP archives (36.1 MB combined)',
    '- Buyer Printing & Paper Recommendation Guide (PRINTING_GUIDE.md)',
  ].join('\n');

  return {
    title,
    titleCharCount: title.length,
    niche: nicheKey,
    tagsCount: tags.length,
    tags,
    description,
    economics: {
      retailPriceUsd: round2(p),
      totalPlatformFeesUsd: totalFees,
      netProfitPerSaleUsd: netProfit,
      profitMarginPercentage: marginPct,
    },
  };
}
