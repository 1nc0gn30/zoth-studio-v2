import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  LinearProgress,
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = '#F1641E';
const TITLE_MAX = 140;
const FRONTLOAD_WINDOW = 40;
const MAX_TAGS = 13;
const TAG_CHAR_MAX = 20;

const SAFE_ACRONYMS = new Set([
  'POD', 'DPI', 'PDF', 'SVG', 'PNG', 'JPG', 'JPEG', 'RGB', 'CMYK',
  'XL', 'XXL', 'XXXL', 'XS', 'USA', 'UK', 'EU', 'UV', 'DTG', 'DTF',
  'ISO', 'DIY', 'B2B', 'LED', 'HD', '4K', '3D', 'A1', 'A2', 'A3', 'A4',
]);

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with',
  'by', 'at', 'from', 'as', 'is', 'it', 'your', 'our', 'this', 'that',
]);

const PRESETS = [
  {
    id: 'japandi-wall-art',
    label: 'Japandi Wall Art',
    badge: '95+ SEO',
    title: 'Minimalist Japandi Arch Wall Art Print, Warm Terracotta Linen Poster, Neutral Boho Living Room Decor, Modern Gallery Framed Print',
    tags: [
      'japandi wall art',
      'minimalist arch art',
      'terracotta poster',
      'neutral boho decor',
      'living room print',
      'linen texture art',
      'modern gallery wall',
      'warm earthy art',
      'wabi sabi print',
      'beige abstract art',
      'framed wall poster',
      'scandinavian decor',
      'housewarming gift',
    ],
    price: 44.0,
    buyerShipping: 0,
    provider: 'gelato',
    blueprint: 'Museum-Grade Matte Poster 18x24 + Oak Frame',
    prodCost: 14.8,
    podShipCost: 5.95,
    extraCost: 0.75,
    offsiteAdsRate: 0,
    description:
      'Museum-grade archival giclee print inspired by Japandi minimalism and warm terracotta tones.\n\n- Printed on 200 gsm (80 lb) FSC-certified matte archival paper\n- Fade-resistant pigment inks with crisp tonal depth\n- Ships locally via Gelato 32-country fulfillment to cut transit time\n- Ready to hang in solid oak, walnut, or matte black gallery frames\n\nIdeal for neutral living rooms, serene bedrooms, or thoughtful housewarming gifts.',
  },
  {
    id: 'heavyweight-tee',
    label: 'Comfort Colors Tee',
    badge: 'Apparel',
    title: 'Vintage Botanical Mushroom Graphic Tee, Garment Dyed Heavyweight Cotton T-Shirt, Cottagecore Nature Lover Gift, Unisex Oversized Top',
    tags: [
      'mushroom graphic tee',
      'garment dyed shirt',
      'comfort colors 1717',
      'heavyweight cotton',
      'botanical t-shirt',
      'cottagecore shirt',
      'nature lover gift',
      'unisex oversized tee',
      'foraging apparel',
      'retro forest tee',
      'earthy streetwear',
      'mycology gift idea',
      'soft washed tshirt',
    ],
    price: 34.0,
    buyerShipping: 4.99,
    provider: 'printify',
    blueprint: 'Comfort Colors 1717 Garment-Dyed Heavyweight Tee',
    prodCost: 12.65,
    podShipCost: 4.75,
    extraCost: 0.5,
    offsiteAdsRate: 0.12,
    description:
      'Soft-washed, garment-dyed heavyweight cotton tee featuring a vintage botanical mushroom field illustration.\n\n- 100% ring-spun US cotton (6.1 oz/yd², Comfort Colors 1717)\n- Relaxed unisex fit with double-needle stitched collar and hem\n- Eco-friendly water-based DTG inks that breathe and age naturally\n- Pre-shrunk fabric for reliable sizing wash after wash',
  },
  {
    id: 'needs-audit',
    label: 'Unoptimized Draft',
    badge: 'Fix Me',
    title: 'BEST SALE!!! AWESOME RETRO CYBERPUNK POSTER WALL ART PRINT GIFT IDEA ||| COOL POSTER PRINT ART DECOR FOR BEDROOM OFFICE GAMING ROOM WALL ART PRINT DECORATION EXTRA LONG TITLE OVER LIMIT',
    tags: [
      'cyberpunk wall art poster print',
      'poster',
      'art',
      'cyberpunk',
      'cyberpunk art',
      'wall art',
      'wall arts',
      'gaming decor',
      'GIFT',
    ],
    price: 22.0,
    buyerShipping: 0,
    provider: 'printify',
    blueprint: 'Standard Matte Poster 12x18',
    prodCost: 9.8,
    podShipCost: 4.99,
    extraCost: 0.5,
    offsiteAdsRate: 0.15,
    description:
      'Cool retro neon poster for your room. Printed on paper and shipped directly to you.',
  },
];

const BLUEPRINTS = [
  { id: 'poster-18x24', label: 'Museum Matte Poster 18×24', printifyBlueprintId: 282, gelatoUid: 'flat_18x24-inch_200gsm-uncoated', defaultProd: 11.4, defaultShip: 5.4 },
  { id: 'framed-18x24', label: 'Framed Oak Print 18×24', printifyBlueprintId: 492, gelatoUid: 'framed_poster_wood_oak_18x24-inch', defaultProd: 18.6, defaultShip: 6.95 },
  { id: 'cc-1717', label: 'Comfort Colors 1717 Tee', printifyBlueprintId: 706, gelatoUid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavyweight', defaultProd: 12.65, defaultShip: 4.75 },
  { id: 'bc-3001', label: 'Bella+Canvas 3001 Tee', printifyBlueprintId: 12, gelatoUid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic', defaultProd: 9.95, defaultShip: 4.75 },
  { id: 'hoodie-18500', label: 'Heavy Blend Hoodie 18500', printifyBlueprintId: 77, gelatoUid: 'apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_heavyweight', defaultProd: 21.4, defaultShip: 8.49 },
];

function lightStem(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (w.length <= 3) return w;
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

function parseTagsInput(raw) {
  return String(raw || '')
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function auditEtsyListing(titleRaw, tagsRaw) {
  const title = String(titleRaw || '').trim();
  const titleLen = title.length;
  const tags = parseTagsInput(tagsRaw);

  const fixes = [];
  const checks = [];
  let score = 0;

  // 1. Title length (18 pts)
  const titleLenOk = titleLen >= 70 && titleLen <= TITLE_MAX;
  const titleLenPts =
    titleLen === 0
      ? 0
      : titleLen > TITLE_MAX
      ? 0
      : titleLen >= 90
      ? 18
      : titleLen >= 60
      ? 14
      : 8;
  score += titleLenPts;
  checks.push({
    label: `Title Length (${titleLen}/${TITLE_MAX})`,
    pts: titleLenPts,
    max: 18,
    ok: titleLenOk,
    detail:
      titleLen > TITLE_MAX
        ? `Exceeds Etsy 140-char limit by ${titleLen - TITLE_MAX} chars`
        : titleLen < 70
        ? 'Under-utilized title space; target 90–140 chars for search indexing'
        : 'Optimal character utilization within Etsy 140-char ceiling',
  });
  if (titleLen > TITLE_MAX) fixes.push(`Trim title by ${titleLen - TITLE_MAX} chars to <= 140`);
  if (titleLen > 0 && titleLen < 70) fixes.push('Expand title with secondary buyer intent phrases (90–140 chars)');

  // 2. Front-loaded primary keyword in first 40 chars (14 pts)
  const front40 = title.slice(0, FRONTLOAD_WINDOW);
  const frontWords = front40
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const promoNoise = /^(best|sale|hot|cheap|wow|new|free shipping|awesome)/i.test(front40);
  const frontOk = frontWords.length >= 3 && !promoNoise;
  const frontPts = frontOk ? 14 : frontWords.length >= 2 && !promoNoise ? 9 : 3;
  score += frontPts;
  checks.push({
    label: 'Front-Loaded First 40 Chars',
    pts: frontPts,
    max: 14,
    ok: frontOk,
    detail: promoNoise
      ? 'Starts with promotional filler instead of primary buyer keyword'
      : frontWords.length < 3
      ? 'Pack 3+ concrete descriptor keywords inside the first 40 characters'
      : `Primary keyword anchored cleanly: "${front40.trim()}"`,
  });
  if (promoNoise) fixes.push('Remove leading promo filler ("BEST", "SALE") from first 40 chars');
  else if (frontWords.length < 3) fixes.push('Front-load product noun + style in first 40 chars');

  // 3. Separator hygiene & zero ALL-CAPS spam (14 pts)
  const sepCount = (title.match(/[|,/\u2014]| - /g) || []).length;
  const repeatedSep = /([|,!])\1{1,}/.test(title) || /!/.test(title);
  const shoutWords = (title.match(/\b[A-Z]{4,}\b/g) || []).filter((w) => !SAFE_ACRONYMS.has(w));
  const cleanPunct = sepCount <= 5 && !repeatedSep && shoutWords.length === 0;
  const punctPts =
    (shoutWords.length === 0 ? 7 : Math.max(0, 7 - shoutWords.length * 3)) +
    (!repeatedSep && sepCount <= 5 ? 7 : repeatedSep ? 1 : 4);
  score += punctPts;
  checks.push({
    label: 'Separator & Casing Hygiene',
    pts: punctPts,
    max: 14,
    ok: cleanPunct,
    detail:
      shoutWords.length > 0
        ? `ALL-CAPS spam flagged: ${shoutWords.slice(0, 4).join(', ')}`
        : repeatedSep
        ? 'Repeated separators or exclamation marks hurt mobile CTR'
        : sepCount > 5
        ? `Too many separators (${sepCount}); keep <= 5 clean phrases`
        : 'Clean Title Case and balanced phrase separators',
  });
  if (shoutWords.length > 0) fixes.push(`Convert ALL-CAPS spam to Title Case (${shoutWords.slice(0, 3).join(', ')})`);
  if (repeatedSep) fixes.push('Replace repeated punctuation (|||, !!!) with clean commas');

  // 4. Title keyword stuffing check (8 pts)
  const titleWords = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const titleStemCounts = {};
  titleWords.forEach((w) => {
    const s = lightStem(w);
    titleStemCounts[s] = (titleStemCounts[s] || 0) + 1;
  });
  const stuffedTitleStems = Object.entries(titleStemCounts)
    .filter(([, c]) => c >= 3)
    .map(([s, c]) => `${s} (×${c})`);
  const stuffOk = stuffedTitleStems.length === 0;
  const stuffPts = stuffOk ? 8 : stuffedTitleStems.length === 1 ? 4 : 0;
  score += stuffPts;
  checks.push({
    label: 'Anti-Stuffing Cadence',
    pts: stuffPts,
    max: 8,
    ok: stuffOk,
    detail: stuffOk
      ? 'Zero over-repeated root words in title'
      : `Repeated stems in title: ${stuffedTitleStems.join(', ')}`,
  });
  if (!stuffOk) fixes.push(`Deduplicate title stems: ${stuffedTitleStems.slice(0, 3).join(', ')}`);

  // 5. 13-Tag Slot Utilization (12 pts)
  const tagCount = tags.length;
  const tagCountOk = tagCount === MAX_TAGS;
  const tagCountPts = tagCount > MAX_TAGS ? 6 : Math.round((Math.min(tagCount, MAX_TAGS) / MAX_TAGS) * 12);
  score += tagCountPts;
  checks.push({
    label: `13-Tag Slots (${tagCount}/${MAX_TAGS})`,
    pts: tagCountPts,
    max: 12,
    ok: tagCountOk,
    detail:
      tagCount > MAX_TAGS
        ? `Remove ${tagCount - MAX_TAGS} extra tags (Etsy accepts max 13)`
        : tagCount < MAX_TAGS
        ? `Add ${MAX_TAGS - tagCount} more tags to maximize long-tail indexing`
        : 'All 13 Etsy search tag slots populated',
  });
  if (tagCount < MAX_TAGS) fixes.push(`Fill remaining ${MAX_TAGS - tagCount} empty tag slots`);
  if (tagCount > MAX_TAGS) fixes.push(`Trim ${tagCount - MAX_TAGS} overflow tags (max 13)`);

  // 6. <= 20-char Per-Tag Compliance (12 pts)
  const over20Tags = tags.filter((t) => t.length > TAG_CHAR_MAX);
  const tagLenOk = tagCount > 0 && over20Tags.length === 0;
  const tagLenPts = tagCount === 0 ? 0 : Math.max(0, 12 - over20Tags.length * 4);
  score += tagLenPts;
  checks.push({
    label: '20-Char Tag Limit',
    pts: tagLenPts,
    max: 12,
    ok: tagLenOk,
    detail:
      over20Tags.length > 0
        ? `${over20Tags.length} tag(s) exceed 20 chars: ${over20Tags.slice(0, 2).join(', ')}`
        : tagCount === 0
        ? 'No tags entered yet'
        : 'All tags fit within Etsy 20-character limit',
  });
  if (over20Tags.length > 0) fixes.push(`Shorten ${over20Tags.length} tag(s) over 20 chars`);

  // 7. Multi-word long-tail bonus + Duplicate stem check (12 pts)
  const multiWordCount = tags.filter((t) => t.split(/\s+/).filter(Boolean).length >= 2).length;
  const multiRatio = tagCount > 0 ? multiWordCount / tagCount : 0;

  const seenExact = new Set();
  const exactDupes = [];
  const tagStemMap = {};
  tags.forEach((t) => {
    const low = t.toLowerCase();
    if (seenExact.has(low)) exactDupes.push(t);
    seenExact.add(low);
    const words = low.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const uniqueInTag = new Set(words.map(lightStem));
    uniqueInTag.forEach((stem) => {
      tagStemMap[stem] = (tagStemMap[stem] || 0) + 1;
    });
  });

  const duplicateStems = Object.entries(tagStemMap)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  const longTailPts = Math.round(multiRatio * 7);
  const dupePenalty = exactDupes.length * 3 + Math.min(5, duplicateStems.length * 2);
  const varietyPts = Math.max(0, 5 - dupePenalty);
  const tagQualityPts = Math.min(12, longTailPts + varietyPts);
  const tagQualityOk = multiRatio >= 0.75 && exactDupes.length === 0 && duplicateStems.length <= 1;
  score += tagQualityPts;
  checks.push({
    label: 'Long-Tail & Stem Variety',
    pts: tagQualityPts,
    max: 12,
    ok: tagQualityOk,
    detail: `${multiWordCount}/${tagCount} multi-word tags · ${exactDupes.length} exact dupes · ${duplicateStems.length} repeated stems`,
  });
  if (multiRatio < 0.75 && tagCount > 0) fixes.push('Replace single-word tags with 2–3 word buyer phrases');
  if (exactDupes.length > 0) fixes.push(`Remove exact duplicate tags: ${exactDupes.join(', ')}`);
  if (duplicateStems.length > 0) {
    fixes.push(`Diversify overused tag stems: ${duplicateStems.slice(0, 3).map(([s, c]) => `${s}×${c}`).join(', ')}`);
  }

  // 8. Title-Tag Overlap Coverage (10 pts)
  const titleStemSet = new Set(titleWords.map(lightStem));
  const tagDetails = tags.map((tag) => {
    const words = tag
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const stems = words.map(lightStem);
    const matchedInTitle = stems.some((s) => titleStemSet.has(s));
    const repeatedStems = stems.filter((s) => (tagStemMap[s] || 0) >= 3);
    return {
      text: tag,
      len: tag.length,
      over20: tag.length > TAG_CHAR_MAX,
      multiWord: tag.split(/\s+/).filter(Boolean).length >= 2,
      matchedInTitle,
      repeatedStems,
    };
  });
  const overlapCount = tagDetails.filter((d) => d.matchedInTitle).length;
  const overlapRatio = tagCount > 0 ? overlapCount / tagCount : 0;
  // Ideal overlap is 30%–85% (anchoring primary keywords while leaving room for synonyms)
  const overlapOk = overlapCount >= 3 && overlapRatio >= 0.25;
  const overlapPts = tagCount === 0 ? 0 : overlapOk ? 10 : Math.round(Math.min(1, overlapRatio / 0.25) * 8);
  score += overlapPts;
  checks.push({
    label: `Title-Tag Synergy (${overlapCount}/${tagCount})`,
    pts: overlapPts,
    max: 10,
    ok: overlapOk,
    detail: overlapOk
      ? `${Math.round(overlapRatio * 100)}% of tags reinforce title keywords for strong exact/broad ranking`
      : 'Align at least 3–5 primary tags with keywords in your title',
  });
  if (!overlapOk && tagCount > 0) fixes.push('Mirror top 3–5 long-tail tags inside your listing title');

  const finalScore = Math.max(0, Math.min(100, score));
  const tier =
    finalScore >= 90
      ? 'TOP RANKING'
      : finalScore >= 75
      ? 'STRONG SEO'
      : finalScore >= 55
      ? 'NEEDS POLISH'
      : 'AT RISK';

  return {
    score: finalScore,
    tier,
    titleLen,
    front40,
    tags,
    tagDetails,
    over20Count: over20Tags.length,
    multiWordCount,
    duplicateStems,
    overlapCount,
    checks,
    fixes,
  };
}

function slugify(str) {
  return (
    String(str || 'etsy-pod-listing')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'etsy-pod-listing'
  );
}

export default function EtsyPodForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [activePresetId, setActivePresetId] = useState(PRESETS[0].id);
  const [title, setTitle] = useState(PRESETS[0].title);
  const [tagsText, setTagsText] = useState(PRESETS[0].tags.join(', '));
  const [description, setDescription] = useState(PRESETS[0].description);

  const [price, setPrice] = useState(PRESETS[0].price);
  const [buyerShipping, setBuyerShipping] = useState(PRESETS[0].buyerShipping);
  const [provider, setProvider] = useState(PRESETS[0].provider);
  const [blueprintId, setBlueprintId] = useState(BLUEPRINTS[1].id);
  const [prodCost, setProdCost] = useState(PRESETS[0].prodCost);
  const [podShipCost, setPodShipCost] = useState(PRESETS[0].podShipCost);
  const [extraCost, setExtraCost] = useState(PRESETS[0].extraCost);
  const [offsiteAdsRate, setOffsiteAdsRate] = useState(PRESETS[0].offsiteAdsRate);
  const [payloadTab, setPayloadTab] = useState('printify');

  const activeBlueprint = useMemo(
    () => BLUEPRINTS.find((b) => b.id === blueprintId) || BLUEPRINTS[0],
    [blueprintId],
  );

  const loadPreset = (preset) => {
    setActivePresetId(preset.id);
    setTitle(preset.title);
    setTagsText(preset.tags.join(', '));
    setDescription(preset.description);
    setPrice(preset.price);
    setBuyerShipping(preset.buyerShipping);
    setProvider(preset.provider);
    setProdCost(preset.prodCost);
    setPodShipCost(preset.podShipCost);
    setExtraCost(preset.extraCost);
    setOffsiteAdsRate(preset.offsiteAdsRate);
  };

  const audit = useMemo(() => auditEtsyListing(title, tagsText), [title, tagsText]);

  // Exact 2026 Etsy Fee & POD Net Margin Math
  const margin = useMemo(() => {
    const itemPrice = Math.max(0, Number(price) || 0);
    const shipCharged = Math.max(0, Number(buyerShipping) || 0);
    const grossRevenue = itemPrice + shipCharged;

    const listingFee = 0.2;
    const transactionFee = grossRevenue * 0.065;
    const paymentProcessingFee = grossRevenue > 0 ? grossRevenue * 0.03 + 0.25 : 0;
    const offsiteAdsFee = grossRevenue * (Number(offsiteAdsRate) || 0);
    const totalEtsyFees = listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee;

    const totalCogs =
      Math.max(0, Number(prodCost) || 0) +
      Math.max(0, Number(podShipCost) || 0) +
      Math.max(0, Number(extraCost) || 0);

    const netProfit = grossRevenue - totalEtsyFees - totalCogs;
    const grossMarginPct = grossRevenue > 0 ? ((grossRevenue - totalCogs) / grossRevenue) * 100 : 0;
    const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const feePctOfRev = grossRevenue > 0 ? (totalEtsyFees / grossRevenue) * 100 : 0;
    const breakEvenRoas = netProfit > 0 ? grossRevenue / netProfit : null;

    // Solve minimum gross revenue where netProfit == 0:
    // rev * (1 - 0.065 - 0.03 - offsiteAdsRate) - 0.20 - 0.25 - totalCogs = 0
    const keepRate = 1 - 0.095 - (Number(offsiteAdsRate) || 0);
    const breakEvenGross = keepRate > 0 ? (totalCogs + 0.45) / keepRate : 0;
    const target30MarginGross = keepRate > 0.3 ? (totalCogs + 0.45) / (keepRate - 0.3) : 0;

    return {
      itemPrice,
      shipCharged,
      grossRevenue,
      listingFee,
      transactionFee,
      paymentProcessingFee,
      offsiteAdsFee,
      totalEtsyFees,
      feePctOfRev,
      totalCogs,
      netProfit,
      grossMarginPct,
      netMarginPct,
      breakEvenRoas,
      breakEvenGross,
      target30MarginGross,
    };
  }, [price, buyerShipping, prodCost, podShipCost, extraCost, offsiteAdsRate]);

  // Quick-fix helpers
  const handleFixTitleCase = () => {
    const cleaned = title
      .replace(/[!]{1,}/g, '')
      .replace(/[|]{2,}/g, ', ')
      .replace(/\s*\|\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((w) => {
        const bare = w.replace(/[^A-Za-z0-9]/g, '');
        if (SAFE_ACRONYMS.has(bare.toUpperCase())) return w.toUpperCase();
        if (bare.length >= 4 && bare === bare.toUpperCase()) {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }
        return w;
      })
      .join(' ');
    const trimmed = cleaned.length > TITLE_MAX ? cleaned.slice(0, TITLE_MAX).replace(/\s+\S*$/, '').trim() : cleaned;
    setTitle(trimmed);
  };

  const handleCleanTags = () => {
    const seen = new Set();
    const cleaned = [];
    audit.tags.forEach((t) => {
      let norm = t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
      if (norm.length > TAG_CHAR_MAX) {
        norm = norm.slice(0, TAG_CHAR_MAX).replace(/\s+\S*$/, '').trim() || norm.slice(0, TAG_CHAR_MAX);
      }
      if (norm && !seen.has(norm) && cleaned.length < MAX_TAGS) {
        seen.add(norm);
        cleaned.push(norm);
      }
    });
    setTagsText(cleaned.join(', '));
  };

  const removeTagAt = (idx) => {
    const next = audit.tags.filter((_, i) => i !== idx);
    setTagsText(next.join(', '));
  };

  // Draft Payloads
  const printifyPayload = useMemo(
    () => ({
      title: title.trim().slice(0, TITLE_MAX),
      description: description.trim(),
      blueprint_id: activeBlueprint.printifyBlueprintId,
      print_provider_id: 99,
      tags: audit.tags.slice(0, MAX_TAGS),
      variants: [
        {
          id: 4012,
          price: Math.round(margin.itemPrice * 100),
          is_enabled: true,
        },
      ],
      print_areas: [
        {
          variant_ids: [4012],
          placeholders: [
            {
              position: 'front',
              images: [
                {
                  id: 'UPLOAD_ARTWORK_ID',
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
    }),
    [title, description, activeBlueprint, audit.tags, margin.itemPrice],
  );

  const gelatoPayload = useMemo(
    () => ({
      templateId: `tpl-${slugify(activeBlueprint.id)}`,
      title: title.trim().slice(0, TITLE_MAX),
      description: description.trim(),
      isVisibleInTheOnlineStore: false,
      salesChannels: ['etsy'],
      tags: audit.tags.slice(0, MAX_TAGS),
      variants: [
        {
          productUid: activeBlueprint.gelatoUid,
          currency: 'USD',
          retailPrice: Number(margin.itemPrice.toFixed(2)),
          imagePlaceholders: [
            {
              name: 'front',
              fileUrl: 'https://assets.example.com/300dpi-master.png',
            },
          ],
        },
      ],
    }),
    [title, description, activeBlueprint, audit.tags, margin.itemPrice],
  );

  const formattedListingText = useMemo(() => {
    const tagList = audit.tags.slice(0, MAX_TAGS).join(', ');
    return `ETSY LISTING PACK — ${title.trim()}

TITLE (${audit.titleLen}/${TITLE_MAX} chars):
${title.trim()}

13 SEARCH TAGS (${audit.tags.length}/${MAX_TAGS}):
${tagList}

PRICING & 2026 MARGIN SUMMARY:
- Retail Price: $${margin.itemPrice.toFixed(2)} (+ $${margin.shipCharged.toFixed(2)} buyer shipping)
- Total Etsy Fees: $${margin.totalEtsyFees.toFixed(2)} (${margin.feePctOfRev.toFixed(1)}%)
- POD COGS (${provider.toUpperCase()}): $${margin.totalCogs.toFixed(2)}
- Net Profit: $${margin.netProfit.toFixed(2)} (${margin.netMarginPct.toFixed(1)}% net margin)
- Break-Even ROAS: ${margin.breakEvenRoas ? `${margin.breakEvenRoas.toFixed(2)}x` : 'N/A (Negative Margin)'}

DESCRIPTION:
${description.trim()}
`;
  }, [title, audit, margin, provider, description]);

  const listingPackJson = useMemo(
    () => ({
      schema: 'zoth.etsy.listing_pack.v2',
      seo_audit: {
        score: audit.score,
        tier: audit.tier,
        title_chars: audit.titleLen,
        tag_count: audit.tags.length,
        over_20_char_tags: audit.over20Count,
        multi_word_tags: audit.multiWordCount,
        title_tag_overlap: audit.overlapCount,
        recommended_fixes: audit.fixes,
      },
      etsy_listing: {
        title: title.trim(),
        tags: audit.tags.slice(0, MAX_TAGS),
        price_usd: Number(margin.itemPrice.toFixed(2)),
        buyer_shipping_usd: Number(margin.shipCharged.toFixed(2)),
        description: description.trim(),
      },
      margin_2026: {
        gross_revenue_usd: Number(margin.grossRevenue.toFixed(2)),
        listing_fee_usd: Number(margin.listingFee.toFixed(2)),
        transaction_fee_6_5_pct: Number(margin.transactionFee.toFixed(2)),
        payment_processing_3_pct_plus_25c: Number(margin.paymentProcessingFee.toFixed(2)),
        offsite_ads_rate: offsiteAdsRate,
        offsite_ads_fee_usd: Number(margin.offsiteAdsFee.toFixed(2)),
        total_etsy_fees_usd: Number(margin.totalEtsyFees.toFixed(2)),
        total_pod_cogs_usd: Number(margin.totalCogs.toFixed(2)),
        net_profit_usd: Number(margin.netProfit.toFixed(2)),
        gross_margin_pct: Number(margin.grossMarginPct.toFixed(2)),
        net_margin_pct: Number(margin.netMarginPct.toFixed(2)),
        break_even_roas: margin.breakEvenRoas ? Number(margin.breakEvenRoas.toFixed(2)) : null,
      },
      fulfillment: {
        selected_provider: provider,
        blueprint: activeBlueprint.label,
        printify_draft: printifyPayload,
        gelato_draft: gelatoPayload,
      },
    }),
    [audit, title, margin, description, offsiteAdsRate, provider, activeBlueprint, printifyPayload, gelatoPayload],
  );

  const activeCodeContent = useMemo(() => {
    if (payloadTab === 'printify') return JSON.stringify(printifyPayload, null, 2);
    if (payloadTab === 'gelato') return JSON.stringify(gelatoPayload, null, 2);
    if (payloadTab === 'pack') return JSON.stringify(listingPackJson, null, 2);
    return formattedListingText;
  }, [payloadTab, printifyPayload, gelatoPayload, listingPackJson, formattedListingText]);

  const kpis = [
    {
      label: 'Etsy SEO Score',
      value: `${audit.score}/100`,
      unit: audit.tier,
      accent: audit.score >= 85 ? SOV.emerald : audit.score >= 60 ? SOV.amber : SOV.crimson,
    },
    {
      label: 'Net Profit / Order',
      value: `${margin.netProfit < 0 ? '-' : ''}$${Math.abs(margin.netProfit).toFixed(2)}`,
      unit: `${margin.netMarginPct.toFixed(1)}% net margin`,
      accent: margin.netProfit > 0 ? SOV.emerald : SOV.crimson,
    },
    {
      label: '2026 Etsy Fees',
      value: `$${margin.totalEtsyFees.toFixed(2)}`,
      unit: `${margin.feePctOfRev.toFixed(1)}% of rev`,
      accent: ACCENT_RAW,
    },
    {
      label: 'Break-Even ROAS',
      value: margin.breakEvenRoas ? `${margin.breakEvenRoas.toFixed(2)}×` : 'LOSS',
      unit: `Gross ${margin.grossMarginPct.toFixed(0)}%`,
      accent: SOV.cyber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={audit.score >= 75 && margin.netProfit > 0 ? 'online' : 'standby'}
        label={`SEO ${audit.score}/100 (${audit.tier}) · NET ${margin.netProfit >= 0 ? '+' : '-'}$${Math.abs(margin.netProfit).toFixed(2)}`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download etsy-listing-pack.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(listingPackJson, 'etsy-listing-pack.json'),
      primary: true,
    },
    {
      label: copied === 'desc' ? 'Copied Listing Pack' : 'Copy Formatted Listing',
      icon: copied === 'desc' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(formattedListingText, 'desc'),
    },
    {
      label: 'Download Listing .txt',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(formattedListingText, `${slugify(title)}-etsy.txt`, 'text/plain;charset=utf-8'),
    },
    {
      label: 'etsy-pod-forge on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/etsy-pod-forge',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ETSY RANKING ALGORITHM AUDITOR"
        title="140-Char Title & 13-Tag SEO Inspector"
        subtitle="Validates front-loaded 40-char keyword window, separator hygiene, 20-char tag cap, long-tail variety, and stem deduplication"
        accent={ACCENT_RAW}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={PRESETS}
            activeId={activePresetId}
            onSelect={loadPreset}
            onReset={() => loadPreset(PRESETS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        {/* Title Editor */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              ETSY LISTING TITLE (MAX {TITLE_MAX} CHARS)
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: audit.titleLen > TITLE_MAX ? SOV.crimson : audit.titleLen >= 90 ? SOV.emerald : SOV.amber,
              }}
            >
              {audit.titleLen} / {TITLE_MAX}
            </Typography>
          </Box>
          <TextField
            multiline
            minRows={2}
            fullWidth
            size="small"
            error={audit.titleLen > TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Front-load your primary buyer keyword in the first 40 characters..."
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.5 } }}
          />
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (audit.titleLen / TITLE_MAX) * 100)}
            sx={{
              mt: 0.75,
              height: 5,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: audit.titleLen > TITLE_MAX ? SOV.crimson : audit.titleLen >= 90 ? SOV.emerald : SOV.amber,
              },
            }}
          />

          {/* First 40-char mobile search preview */}
          <Box
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1.25,
              border: '1px dashed',
              borderColor: rgba(accent, 0.4),
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
            }}
          >
            <Typography sx={{ fontFamily: MONO, fontSize: '0.64rem', color: 'text.secondary', mb: 0.35 }}>
              MOBILE SEARCH SNIPPET (FIRST 40 CHARS HIGHLIGHTED):
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', wordBreak: 'break-word' }}>
              <Box component="span" sx={{ color: accent, fontWeight: 700, textDecoration: 'underline' }}>
                {title.slice(0, FRONTLOAD_WINDOW) || '(empty)'}
              </Box>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {title.slice(FRONTLOAD_WINDOW, TITLE_MAX)}
              </Box>
              {title.length > TITLE_MAX && (
                <Box component="span" sx={{ color: SOV.crimson, fontWeight: 700, bgcolor: rgba(SOV.crimson, 0.14) }}>
                  {title.slice(TITLE_MAX)}
                </Box>
              )}
            </Typography>
          </Box>
        </Box>

        {/* 13 Tags Editor */}
        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              13 SEARCH TAGS (COMMA OR NEWLINE SEPARATED · &lt;= 20 CHARS EACH)
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: audit.tags.length === MAX_TAGS && audit.over20Count === 0 ? SOV.emerald : SOV.amber,
              }}
            >
              {audit.tags.length} / {MAX_TAGS} TAGS
            </Typography>
          </Box>
          <TextField
            multiline
            minRows={3}
            fullWidth
            size="small"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="japandi wall art, minimalist arch art, terracotta poster..."
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.5 } }}
          />

          {/* Interactive parsed tag chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
            {audit.tagDetails.map((tag, idx) => {
              const bad = tag.over20 || idx >= MAX_TAGS;
              const warn = !bad && (!tag.multiWord || tag.repeatedStems.length > 0);
              const chipColor = bad ? SOV.crimson : warn ? SOV.amber : SOV.emerald;
              return (
                <Chip
                  key={`${tag.text}-${idx}`}
                  size="small"
                  icon={<LocalOfferIcon sx={{ fontSize: '13px !important', color: `${chipColor} !important` }} />}
                  label={`${tag.text} (${tag.len}/20)`}
                  onDelete={() => removeTagAt(idx)}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    bgcolor: rgba(chipColor, isDark ? 0.14 : 0.1),
                    color: isDark ? '#F5F1E6' : '#101828',
                    border: `1px solid ${rgba(chipColor, 0.45)}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* One-Click Hygiene Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon fontSize="small" />}
            onClick={handleFixTitleCase}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: accent, borderColor: rgba(accent, 0.45) }}
          >
            Normalize Title Case & Trim &lt;=140
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon fontSize="small" />}
            onClick={handleCleanTags}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: isDark ? SOV.cyber : '#0369A1', borderColor: rgba(SOV.cyber, 0.45) }}
          >
            Dedupe & Cap Tags &lt;=20 Chars
          </Button>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="EXACT 2026 ETSY FEE & POD COGS ENGINE"
        title="Net Margin & Break-Even ROAS Calculator"
        subtitle="$0.20 listing + 6.5% transaction (item+ship) + 3%+$0.25 US payment processing + optional 12%/15% Offsite Ads"
        accent={SOV.emerald}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
          <TextField
            size="small"
            type="number"
            label="Item Price ($)"
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Buyer Shipping ($)"
            value={buyerShipping}
            onChange={(e) => setBuyerShipping(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="POD Base Cost ($)"
            value={prodCost}
            onChange={(e) => setProdCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="POD Ship Cost ($)"
            value={podShipCost}
            onChange={(e) => setPodShipCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Extra / Pack ($)"
            value={extraCost}
            onChange={(e) => setExtraCost(Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              QUICK RETAIL PRICE TUNER
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: accent }}>
              ${margin.itemPrice.toFixed(2)}
            </Typography>
          </Box>
          <Slider
            value={Math.min(180, margin.itemPrice)}
            min={8}
            max={180}
            step={1}
            onChange={(_, v) => setPrice(Number(v))}
            aria-label="Retail Price"
            sx={{ color: accent }}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          ETSY OFFSITE ADS ATTRIBUTION TIER
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.75 }}>
          {[
            { rate: 0, label: 'Organic (0%)' },
            { rate: 0.12, label: 'Offsite Ads 12% (>$10k/yr)' },
            { rate: 0.15, label: 'Offsite Ads 15% (Standard)' },
          ].map((opt) => {
            const active = offsiteAdsRate === opt.rate;
            return (
              <Chip
                key={opt.label}
                label={opt.label}
                clickable
                onClick={() => setOffsiteAdsRate(opt.rate)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.35)'}`,
                }}
              />
            );
          })}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={buyerShipping === 0}
              onChange={(e) => setBuyerShipping(e.target.checked ? 0 : 4.99)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Free Shipping Guarantee ($0 buyer ship; POD shipping absorbed in margin)
            </Typography>
          }
        />

        <Divider sx={{ my: 1.5 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          POD BLUEPRINT PRESET (AUTO-LOADS TYPICAL PRINTIFY / GELATO COST)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {BLUEPRINTS.map((bp) => {
            const active = bp.id === blueprintId;
            return (
              <Chip
                key={bp.id}
                label={bp.label}
                clickable
                onClick={() => {
                  setBlueprintId(bp.id);
                  setProdCost(bp.defaultProd);
                  setPodShipCost(bp.defaultShip);
                }}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.emerald, 0.14) : 'transparent',
                  color: active ? (isDark ? SOV.emerald : '#047857') : 'text.primary',
                  border: `1px solid ${active ? SOV.emerald : 'rgba(148,163,184,0.32)'}`,
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
        eyebrow="LIVE SCORE & ACTIONABLE FIX CHIPS"
        title="Etsy SEO Score & Diagnostic Matrix"
        subtitle="Deterministic 100-point score across title front-loading, tag limits, long-tail density, and stem uniqueness"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <SovereignGauge
            value={audit.score}
            max={100}
            label="ETSY SEO"
            unit="%"
            status={audit.tier}
            thresholds={{ warn: 75, danger: 55 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {audit.checks.map((c) => (
              <Box key={c.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                {c.ok ? (
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: SOV.emerald, mt: 0.15, flexShrink: 0 }} />
                ) : (
                  <WarningAmberIcon sx={{ fontSize: 16, color: SOV.amber, mt: 0.15, flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700 }}>
                    {c.label} · {c.pts}/{c.max}
                  </Typography>
                  <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary', lineHeight: 1.35 }}>
                    {c.detail}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.85 }}>
          ACTIONABLE FIX CHIPS ({audit.fixes.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {audit.fixes.length === 0 ? (
            <Chip
              size="small"
              icon={<CheckCircleOutlineIcon sx={{ fontSize: '15px !important', color: `${SOV.emerald} !important` }} />}
              label="All Etsy 2026 Title & 13-Tag Ranking Checks Passed"
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: rgba(SOV.emerald, 0.14),
                color: isDark ? SOV.emerald : '#047857',
                border: `1px solid ${rgba(SOV.emerald, 0.4)}`,
              }}
            />
          ) : (
            audit.fixes.map((fix, idx) => (
              <Chip
                key={idx}
                size="small"
                icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: `${SOV.amber} !important` }} />}
                label={fix}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.69rem',
                  fontWeight: 600,
                  bgcolor: rgba(SOV.amber, 0.13),
                  color: isDark ? '#F5F1E6' : '#101828',
                  border: `1px solid ${rgba(SOV.amber, 0.4)}`,
                  height: 'auto',
                  py: 0.4,
                  '& .MuiChip-label': { whiteSpace: 'normal' },
                }}
              />
            ))
          )}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="2026 FEE WATERFALL & BREAK-EVEN SOLVER"
        title="Exact Order Economics Breakdown"
        subtitle="Real-time unit economics including Etsy transaction, payment processing, offsite ads, and fulfillment costs"
        accent={SOV.emerald}
        right={<CalculateIcon sx={{ color: isDark ? SOV.emerald : '#047857' }} />}
      >
        <SovereignKeyValueGrid
          cols={3}
          accent={SOV.emerald}
          items={[
            { label: 'Gross Revenue', value: `$${margin.grossRevenue.toFixed(2)}`, badge: 'Item+Ship' },
            { label: 'Listing Fee', value: `$${margin.listingFee.toFixed(2)}`, badge: 'Flat' },
            { label: 'Transaction (6.5%)', value: `$${margin.transactionFee.toFixed(2)}`, badge: 'Etsy' },
            { label: 'Payment (3%+$0.25)', value: `$${margin.paymentProcessingFee.toFixed(2)}`, badge: 'US Pay' },
            {
              label: `Offsite Ads (${Math.round(offsiteAdsRate * 100)}%)`,
              value: `$${margin.offsiteAdsFee.toFixed(2)}`,
              badge: offsiteAdsRate > 0 ? 'Active' : 'Off',
            },
            { label: 'Total POD COGS', value: `$${margin.totalCogs.toFixed(2)}`, badge: provider.toUpperCase() },
            {
              label: 'Net Profit',
              value: `${margin.netProfit < 0 ? '-' : ''}$${Math.abs(margin.netProfit).toFixed(2)} (${margin.netMarginPct.toFixed(1)}%)`,
              badge: margin.netProfit > 0 ? 'PROFIT' : 'LOSS',
            },
            {
              label: 'Break-Even Price',
              value: `$${margin.breakEvenGross.toFixed(2)}`,
              badge: '0% Net',
            },
            {
              label: 'Target 30% Net Price',
              value: `$${margin.target30MarginGross.toFixed(2)}`,
              badge: 'Recommended',
            },
          ]}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="PRINTIFY / GELATO PAYLOAD & LISTING EXPORT"
        title="Fulfillment Draft Payload & Description"
        subtitle="Switch between Printify v1 draft, Gelato v4 draft, full Etsy listing pack JSON, or copyable listing copy"
        accent={ACCENT_RAW}
        right={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {[
              { id: 'printify', label: 'Printify v1' },
              { id: 'gelato', label: 'Gelato v4' },
              { id: 'pack', label: 'Pack JSON' },
              { id: 'text', label: 'Listing Copy' },
            ].map((tab) => {
              const active = payloadTab === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => {
                    setPayloadTab(tab.id);
                    if (tab.id === 'printify' || tab.id === 'gelato') setProvider(tab.id);
                  }}
                  sx={{
                    minHeight: 34,
                    fontFamily: MONO,
                    fontSize: '0.69rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                  }}
                />
              );
            })}
          </Box>
        }
      >
        <TextField
          multiline
          minRows={4}
          fullWidth
          size="small"
          label="Listing Description (synced into payloads & export)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 1.5, '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
        />

        <SovereignCodeBlock
          title={
            payloadTab === 'printify'
              ? 'printify-draft-payload.json'
              : payloadTab === 'gelato'
              ? 'gelato-draft-payload.json'
              : payloadTab === 'pack'
              ? 'etsy-listing-pack.json'
              : 'etsy-listing-copy.txt'
          }
          badge={payloadTab === 'text' ? 'TEXT' : 'JSON'}
          code={activeCodeContent}
          filename={payloadTab === 'text' ? 'etsy-listing-copy.txt' : `${payloadTab}-etsy-payload.json`}
          accent={ACCENT_RAW}
          maxHeight={280}
        />

        <Box sx={{ mt: 1.5 }}>
          <SovereignCodeBlock
            title="LOCAL COMPANION DAEMONS (:8107 / :8108)"
            badge="CLI"
            code={`# Etsy POD Forge local server (port 8107)\ncd ~/NullAITech/etsy-pod-forge && python3 server.py --port 8107\netsy-pod-forge status\n\n# Etsy Open API v3 & MCP Connector (port 8108)\ncd ~/NullAITech/etsy-connector && python3 server.py --port 8108\netsy-connector --status`}
            filename="etsy-pod-commands.sh"
            accent={SOV.gold}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · 100% Client-Side Etsy SEO Auditor & 2026 Margin Engine"
          message="All title/13-tag ranking diagnostics, 2026 Etsy fee calculations, and Printify/Gelato draft payloads execute locally in your browser with zero remote API calls. Live Etsy Open API v3 draft publishing stays strictly local via etsy-pod-forge (:8107) and etsy-connector (:8108) using credentials in ~/.config/zothos/."
        />
      </Box>
      <SovereignWorkstationShell
        id="etsy-pod-forge"
        category="COMMERCE & POD · ETSY CONNECTOR (:8107 / :8108)"
        title="Etsy POD Forge & 13-Tag SEO Workstation"
        subtitle="Deterministic 140-character Etsy title & 13-tag SEO auditor, exact 2026 fee & Offsite Ads net margin calculator, and Printify / Gelato fulfillment payload exporter."
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
