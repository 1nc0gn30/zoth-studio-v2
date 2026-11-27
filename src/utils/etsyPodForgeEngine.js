/**
 * Pure deterministic engine for Etsy POD Forge v2.6.0 (Zoth Studio v2 God-Mode Deck)
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.
 * Zero browser/DOM dependencies so Node test suites can verify all invariants directly.
 */

export const ETSY_POD_FORGE_VERSION = '2.6.0';
export const TITLE_MAX = 140;
export const FRONTLOAD_WINDOW = 40;
export const MAX_TAGS = 13;
export const TAG_CHAR_MAX = 20;

export const SAFE_ACRONYMS = new Set([
  'POD', 'DPI', 'PDF', 'SVG', 'PNG', 'JPG', 'JPEG', 'RGB', 'CMYK',
  'XL', 'XXL', 'XXXL', 'XS', 'USA', 'UK', 'EU', 'UV', 'DTG', 'DTF',
  'ISO', 'DIY', 'B2B', 'LED', 'HD', '4K', '3D', 'A1', 'A2', 'A3', 'A4',
]);

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with',
  'by', 'at', 'from', 'as', 'is', 'it', 'your', 'our', 'this', 'that',
]);

/** Canonical 5 Etsy POD Forge Cadres with real Printify Blueprint/Provider IDs & Gelato v4 UIDs */
export const POD_CADRES = [
  {
    id: 'apparel',
    label: "Apparel · 4500×5400",
    name: "Grandma's Garden Floral & Family Apparel",
    productType: 'Comfort Colors 1717 Tee / Gildan 18000 Sweatshirt',
    canvasWidth: 4500,
    canvasHeight: 5400,
    dpi: 300,
    printifyBlueprintId: 638,
    printifyProviderId: 29,
    printifyVariantId: 73199,
    gelatoUid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavyweight',
    defaultRetail: 34.99,
    defaultProd: 12.50,
    defaultShip: 4.75,
    promptCount: 12,
  },
  {
    id: 'mugs',
    label: 'Mugs · 2000×2000',
    name: 'Whimsical Watercolor Animal & Bird Mugs',
    productType: '15oz Ceramic Coffee & Tea Mug',
    canvasWidth: 2000,
    canvasHeight: 2000,
    dpi: 300,
    printifyBlueprintId: 68,
    printifyProviderId: 26,
    printifyVariantId: 33719,
    gelatoUid: 'mug_product_msz_15-oz_mmat_ceramic-white_cl_4-0',
    defaultRetail: 21.99,
    defaultProd: 6.80,
    defaultShip: 4.50,
    promptCount: 11,
  },
  {
    id: 'totes',
    label: 'Totes · 3600×3600',
    name: 'Heavyweight Canvas Farmers Market & Library Totes',
    productType: 'Liberty Bags OAD 12oz Cotton Canvas Tote',
    canvasWidth: 3600,
    canvasHeight: 3600,
    dpi: 300,
    printifyBlueprintId: 1090,
    printifyProviderId: 3,
    printifyVariantId: 82411,
    gelatoUid: 'bag_product_bt_tote-bag_bmat_heavyweight-cotton',
    defaultRetail: 24.99,
    defaultProd: 7.20,
    defaultShip: 4.25,
    promptCount: 10,
  },
  {
    id: 'wall_art',
    label: 'Wall Art · 4500×6000',
    name: 'High-Res Archival Wall Art & Printable Packs',
    productType: '300 DPI 5-Ratio Archival Print Bundle (18×24)',
    canvasWidth: 4500,
    canvasHeight: 6000,
    dpi: 300,
    printifyBlueprintId: 49,
    printifyProviderId: 29,
    printifyVariantId: 21401,
    gelatoUid: 'flat_18x24-inch_200gsm-uncoated',
    defaultRetail: 29.99,
    defaultProd: 8.50,
    defaultShip: 4.95,
    promptCount: 10,
  },
  {
    id: 'crafting',
    label: 'Crafting · 3600×3600',
    name: 'Printable Quilting, Embroidery & Crafting Blueprints',
    productType: 'Printable Pattern Guide & Stitch Blueprint',
    canvasWidth: 3600,
    canvasHeight: 3600,
    dpi: 300,
    printifyBlueprintId: 554,
    printifyProviderId: 29,
    printifyVariantId: 52104,
    gelatoUid: 'notebook_product_nsz_a5_nmat_spiral-matte',
    defaultRetail: 18.99,
    defaultProd: 4.20,
    defaultShip: 3.50,
    promptCount: 10,
  },
];

export const POD_PRESETS = [
  {
    id: 'apparel-garden',
    cadreId: 'apparel',
    label: "Grandma's Garden Tee",
    badge: '95+ SEO',
    title: 'Grandma Garden Sweatshirt, Custom Wildflower Sweater, Personalized Grandma Gift, Mothers Day Crewneck Pullover',
    tags: [
      'grandma sweatshirt', 'gardener gift', 'wildflower sweater', 'grandmas garden',
      'grandma crewneck', 'mom birthday gift', 'cottagecore clothes', 'comfort colors tee',
      'plant lover gift', 'gift for grandma', 'botanical shirt', 'grandkids names', 'mothers day gift',
    ],
    price: 34.99,
    buyerShipping: 0,
    provider: 'printify',
    prodCost: 12.50,
    podShipCost: 4.75,
    extraCost: 0.50,
    offsiteAdsRate: 0,
    description:
      'Comfort Colors 1717 tee / Gildan 18000 heavy blend crewneck printed at 300 DPI (4500x5400 RGBA) with personalized birth-month wildflowers.\n\n- Soft ring-spun cotton blend with water-based DTG inks\n- Includes full unisex sizing chart and cold-wash care guide\n- Ready for Printify BP #638 (Provider #29) or Gelato v4 fulfillment',
  },
  {
    id: 'mugs-songbird',
    cadreId: 'mugs',
    label: 'Songbird 15oz Mug',
    badge: 'Mugs',
    title: 'Watercolor Bird Coffee Mug 15oz, Bird Watcher Gift, Cozy Cottagecore Tea Cup, Nature Lover Ceramic Mug',
    tags: [
      'bird watcher gift', 'watercolor bird mug', 'cottagecore mug', 'bird lover gift',
      'coffee mug 15oz', 'tea lover cup', 'cardinal mug', 'backyard birds',
      'grandma mug', 'garden lover gift', 'ceramic coffee mug', 'nature coffee cup', 'cute bird gifts',
    ],
    price: 21.99,
    buyerShipping: 4.99,
    provider: 'printify',
    prodCost: 6.80,
    podShipCost: 4.50,
    extraCost: 0.35,
    offsiteAdsRate: 0.12,
    description:
      '15oz white ceramic mug featuring dual-sided 300-DPI watercolor songbird artwork (2000x2000 wrap).\n\n- Dishwasher & microwave safe lead-free sublimation print\n- Printify BP #68 (Provider #26) & Gelato 15oz ceramic compatible',
  },
  {
    id: 'wall-botanical',
    cadreId: 'wall_art',
    label: 'Botanical Wall Art',
    badge: 'Wall Art',
    title: 'Vintage Botanical Prints Set of 12, Printable Wildflower Wall Art, Cottagecore Gallery Decor, Archival 300 DPI Print',
    tags: [
      'botanical wall art', 'vintage flower prints', 'wildflower decor', 'digital download art',
      'gallery wall set', 'cottagecore decor', 'printable wall art', 'farmhouse wall decor',
      'living room prints', 'bathroom art print', 'vintage botanical', 'flower poster', 'large wall art',
    ],
    price: 29.99,
    buyerShipping: 0,
    provider: 'gelato',
    prodCost: 8.50,
    podShipCost: 4.95,
    extraCost: 0.50,
    offsiteAdsRate: 0,
    description:
      'Archival 300-DPI botanical wildflower print set formatted at 4500x6000 px across 5 standard aspect ratios (2:3, 3:4, 4:5, 11:14, ISO).\n\n- 200 gsm FSC-certified matte archival paper via Gelato v4 or Printify BP #49',
  },
  {
    id: 'needs-audit',
    cadreId: 'wall_art',
    label: 'Unoptimized Draft',
    badge: 'Fix Me',
    title: 'BEST SALE!!! AWESOME RETRO CYBERPUNK POSTER WALL ART PRINT GIFT IDEA ||| COOL POSTER PRINT ART DECOR FOR BEDROOM OFFICE GAMING ROOM WALL ART PRINT DECORATION EXTRA LONG TITLE OVER LIMIT',
    tags: [
      'cyberpunk wall art poster print', 'poster', 'art', 'cyberpunk',
      'cyberpunk art', 'wall art', 'wall arts', 'gaming decor', 'GIFT',
    ],
    price: 22.0,
    buyerShipping: 0,
    provider: 'printify',
    prodCost: 9.8,
    podShipCost: 4.99,
    extraCost: 0.5,
    offsiteAdsRate: 0.15,
    description: 'Retro neon poster printed on matte paper and shipped to order.',
  },
];

export const MCP_TOOLS = [
  { name: 'pod_list_cadres', args: '{}', summary: 'Return all 5 POD cadres, 300-DPI specs, Printify blueprint/provider IDs, and Gelato v4 UIDs.' },
  { name: 'pod_generate_canvas', args: '{"cadre":"apparel","preview":true}', summary: 'Synthesize 300-DPI RGBA transparent print PNG metadata + base64 preview.' },
  { name: 'pod_generate_mockup', args: '{"cadre":"mugs","color":"white"}', summary: 'Composite artwork onto 1400×1400 / 1600×1200 lifestyle mockup JPEG.' },
  { name: 'pod_synthesize_listing', args: '{"cadre":"apparel","offsite_ads_rate":0.12}', summary: 'Generate <=140-char title, 13 unique <=20-char tags, SEO score, and 2026 fee breakdown.' },
  { name: 'pod_calculate_margins', args: '{"retail_price":34.99,"production_cost":12.50,"offsite_ads_rate":0.15}', summary: 'Compute exact 0%/12%/15% Offsite Ads fees, net profit, ROI %, and break-even price.' },
  { name: 'pod_search_prompts', args: '{"cadre":"mugs","query":"cardinal"}', summary: 'Filter the 53-recipe curated POD Prompt Vault by cadre and keyword.' },
];

export const PROMPT_VAULT_RECIPES = [
  { id: 'apparel-01', cadre: 'apparel', title: "Grandma's Garden Birth Month Bouquet", ratio: '4:5', model: 'Midjourney v6.1 / Flux.1', prompt: 'Delicate vintage watercolor bouquet of birth-month flowers tied with a sage ribbon, isolated on pure white background --ar 4:5 --v 6.1' },
  { id: 'apparel-02', cadre: 'apparel', title: 'In My Gardening Era Wildflower Meadow', ratio: '4:5', model: 'Midjourney v6.1 / Flux.1', prompt: 'Watercolor copper watering can overflowing with daisies, cosmos, and bumblebees, isolated clean transparent background --ar 4:5 --v 6.1' },
  { id: 'mug-01', cadre: 'mugs', title: 'Cozy Chickadees & Porcelain Teacup', ratio: '1:1', model: 'Midjourney v6.1 / Flux.1', prompt: 'Two black-capped chickadees perched on an antique rose-patterned porcelain teacup with winter berries, isolated white background --ar 1:1 --v 6.1' },
  { id: 'mug-02', cadre: 'mugs', title: 'Northern Cardinal on Snow-Dusted Pine', ratio: '1:1', model: 'Flux.1', prompt: 'Scarlet male cardinal perched on snow-dusted eastern white pine bough with holly berries, naturalist watercolor, pure white ground --ar 1:1 --v 6.1' },
  { id: 'tote-01', cadre: 'totes', title: 'Vintage French Seed Packet Fleurs Sauvages', ratio: '1:1', model: 'Midjourney v6.1 / Flux.1', prompt: '19th-century French botanical seed catalog label for Fleurs Sauvages with wild poppies and lavender, crisp vector-clean border --ar 1:1 --v 6.1' },
  { id: 'tote-02', cadre: 'totes', title: 'Heirloom Tomato Varieties Botanical Poster', ratio: '1:1', model: 'Flux.1', prompt: 'Scientific botanical watercolor grid of six heirloom tomato varieties on leafy vines, pure white background --ar 1:1 --v 6.1' },
  { id: 'wallart-01', cadre: 'wall_art', title: 'English Countryside Wildflower Gallery', ratio: '4:5', model: 'Midjourney v6.1 / Flux.1', prompt: 'Botanical specimen plate of English foxglove and wild meadow poppies on cold-press parchment, balanced margins --ar 4:5 --v 6.1' },
  { id: 'wallart-02', cadre: 'wall_art', title: 'Vintage Songbird Field Guide Plate', ratio: '3:4', model: 'Flux.1', prompt: 'Pair of Cedar Waxwings on an autumn mountain ash branch with orange berries, Audubon naturalist watercolor --ar 3:4 --v 6.1' },
  { id: 'craft-01', cadre: 'crafting', title: 'Traditional Barn Star Quilt Block Blueprint', ratio: '1:1', model: 'Flux.1 / Midjourney v6.1', prompt: 'Crisp geometric 8-point Lone Star patchwork quilt block blueprint with 1/4 inch seam indicators, pure white background --ar 1:1 --v 6.1' },
  { id: 'craft-02', cadre: 'crafting', title: 'Wildflower Meadow Embroidery Transfer', ratio: '1:1', model: 'Flux.1', prompt: 'Botanical line art hand embroidery hoop pattern of lavender, chamomile, bees, and poppies on pure white ground --ar 1:1 --v 6.1' },
];

export function lightStem(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (w.length <= 3) return w;
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

export function parseTagsInput(raw) {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t || '').trim()).filter(Boolean);
  }
  return String(raw || '')
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function slugify(str) {
  return (
    String(str || 'etsy-pod-listing')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'etsy-pod-listing'
  );
}

export function auditEtsyListing(titleRaw, tagsRaw) {
  const title = String(titleRaw || '').trim();
  const titleLen = title.length;
  const tags = parseTagsInput(tagsRaw);

  const fixes = [];
  const checks = [];
  let score = 0;

  const titleLenOk = titleLen >= 70 && titleLen <= TITLE_MAX;
  const titleLenPts =
    titleLen === 0 ? 0 : titleLen > TITLE_MAX ? 0 : titleLen >= 90 ? 18 : titleLen >= 60 ? 14 : 8;
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
    detail: stuffOk ? 'Zero over-repeated root words in title' : `Repeated stems in title: ${stuffedTitleStems.join(', ')}`,
  });
  if (!stuffOk) fixes.push(`Deduplicate title stems: ${stuffedTitleStems.slice(0, 3).join(', ')}`);

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

  const titleStemSet = new Set(titleWords.map(lightStem));
  const tagDetails = tags.map((tag) => {
    const words = tag.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const stems = words.map(lightStem);
    return {
      text: tag,
      len: tag.length,
      over20: tag.length > TAG_CHAR_MAX,
      multiWord: tag.split(/\s+/).filter(Boolean).length >= 2,
      matchedInTitle: stems.some((s) => titleStemSet.has(s)),
      repeatedStems: stems.filter((s) => (tagStemMap[s] || 0) >= 3),
    };
  });

  const overlapCount = tagDetails.filter((d) => d.matchedInTitle).length;
  const overlapRatio = tagCount > 0 ? overlapCount / tagCount : 0;
  const overlapOk = overlapCount >= 3 && overlapRatio >= 0.25;
  const overlapPts = tagCount === 0 ? 0 : overlapOk ? 10 : Math.round(Math.min(1, overlapRatio / 0.25) * 8);
  score += overlapPts;
  checks.push({
    label: `Title-Tag Synergy (${overlapCount}/${tagCount})`,
    pts: overlapPts,
    max: 10,
    ok: overlapOk,
    detail: overlapOk
      ? `${Math.round(overlapRatio * 100)}% of tags reinforce title keywords`
      : 'Align at least 3–5 primary tags with keywords in your title',
  });
  if (!overlapOk && tagCount > 0) fixes.push('Mirror top 3–5 long-tail tags inside your listing title');

  const finalScore = Math.max(0, Math.min(100, score));
  const tier =
    finalScore >= 90 ? 'TOP RANKING' : finalScore >= 75 ? 'STRONG SEO' : finalScore >= 55 ? 'NEEDS POLISH' : 'AT RISK';

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

export function normalizeTitle(rawTitle) {
  const cleaned = String(rawTitle || '')
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
  return cleaned.length > TITLE_MAX ? cleaned.slice(0, TITLE_MAX).replace(/\s+\S*$/, '').trim() : cleaned;
}

export function cleanTagsList(tagsRaw) {
  const tags = parseTagsInput(tagsRaw);
  const seen = new Set();
  const cleaned = [];
  tags.forEach((t) => {
    let norm = t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
    if (norm.length > TAG_CHAR_MAX) {
      norm = norm.slice(0, TAG_CHAR_MAX).replace(/\s+\S*$/, '').trim() || norm.slice(0, TAG_CHAR_MAX);
    }
    if (norm && !seen.has(norm) && cleaned.length < MAX_TAGS) {
      seen.add(norm);
      cleaned.push(norm);
    }
  });
  return cleaned;
}

export function calculatePodMargins({
  price = 0,
  buyerShipping = 0,
  prodCost = 0,
  podShipCost = 0,
  extraCost = 0,
  offsiteAdsRate = 0,
}) {
  const itemPrice = Math.max(0, Number(price) || 0);
  const shipCharged = Math.max(0, Number(buyerShipping) || 0);
  const grossRevenue = Number((itemPrice + shipCharged).toFixed(2));
  const adsRate = [0, 0.12, 0.15].includes(Number(offsiteAdsRate)) ? Number(offsiteAdsRate) : 0;

  const listingFee = 0.2;
  const transactionFee = Number((grossRevenue * 0.065).toFixed(2));
  const paymentProcessingFee = grossRevenue > 0 ? Number((grossRevenue * 0.03 + 0.25).toFixed(2)) : 0;
  const offsiteAdsFee = Number((grossRevenue * adsRate).toFixed(2));
  const totalEtsyFees = Number((listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee).toFixed(2));

  const totalCogs = Number(
    (Math.max(0, Number(prodCost) || 0) + Math.max(0, Number(podShipCost) || 0) + Math.max(0, Number(extraCost) || 0)).toFixed(2),
  );

  const netProfit = Number((grossRevenue - totalEtsyFees - totalCogs).toFixed(2));
  const grossMarginPct = grossRevenue > 0 ? Number((((grossRevenue - totalCogs) / grossRevenue) * 100).toFixed(1)) : 0;
  const netMarginPct = grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0;
  const feePctOfRev = grossRevenue > 0 ? Number(((totalEtsyFees / grossRevenue) * 100).toFixed(1)) : 0;
  const breakEvenRoas = netProfit > 0 ? Number((grossRevenue / netProfit).toFixed(2)) : null;

  const keepRate = 1 - 0.095 - adsRate;
  const breakEvenGross = keepRate > 0 ? Number(((totalCogs + 0.45) / keepRate).toFixed(2)) : 0;
  const target30MarginGross = keepRate > 0.3 ? Number(((totalCogs + 0.45) / (keepRate - 0.3)).toFixed(2)) : 0;

  return {
    itemPrice,
    shipCharged,
    grossRevenue,
    listingFee,
    transactionFee,
    paymentProcessingFee,
    offsiteAdsRate: adsRate,
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
}

export function validateCanvasSpec({ cadreId = 'apparel', width, height, dpi = 300 }) {
  const cadre = POD_CADRES.find((c) => c.id === cadreId) || POD_CADRES[0];
  const w = Number(width || cadre.canvasWidth);
  const h = Number(height || cadre.canvasHeight);
  const d = Number(dpi || cadre.dpi);
  const inchesW = Number((w / Math.max(1, d)).toFixed(2));
  const inchesH = Number((h / Math.max(1, d)).toFixed(2));
  const meetsDpi = d >= 300;
  const meetsSize = w >= cadre.canvasWidth && h >= cadre.canvasHeight;
  return {
    cadreId: cadre.id,
    width: w,
    height: h,
    dpi: d,
    printInches: `${inchesW}" × ${inchesH}"`,
    meetsDpi,
    meetsSize,
    printReady: meetsDpi && meetsSize,
    targetSpec: `${cadre.canvasWidth}×${cadre.canvasHeight} px @ ${cadre.dpi} DPI`,
  };
}

export function buildFulfillmentPayloads({ cadreId = 'apparel', title = '', description = '', tags = [], itemPrice = 34.99 }) {
  const cadre = POD_CADRES.find((c) => c.id === cadreId) || POD_CADRES[0];
  const cleanTitle = String(title || '').trim().slice(0, TITLE_MAX);
  const cleanDesc = String(description || '').trim();
  const cleanTags = parseTagsInput(tags).slice(0, MAX_TAGS);

  const printify = {
    title: cleanTitle,
    description: cleanDesc,
    blueprint_id: cadre.printifyBlueprintId,
    print_provider_id: cadre.printifyProviderId,
    tags: cleanTags,
    variants: [
      {
        id: cadre.printifyVariantId,
        price: Math.round(Math.max(0, Number(itemPrice) || 0) * 100),
        is_enabled: true,
      },
    ],
    print_areas: [
      {
        variant_ids: [cadre.printifyVariantId],
        placeholders: [
          {
            position: 'front',
            images: [{ id: 'UPLOAD_300DPI_MASTER_PNG', x: 0.5, y: 0.5, scale: 1, angle: 0 }],
          },
        ],
      },
    ],
  };

  const gelato = {
    apiVersion: 'v4',
    templateId: `tpl-${slugify(cadre.id)}`,
    title: cleanTitle,
    description: cleanDesc,
    isVisibleInTheOnlineStore: false,
    salesChannels: ['etsy'],
    tags: cleanTags,
    variants: [
      {
        productUid: cadre.gelatoUid,
        currency: 'USD',
        retailPrice: Number(Math.max(0, Number(itemPrice) || 0).toFixed(2)),
        imagePlaceholders: [
          {
            name: 'front',
            fileUrl: `https://etsy-pod.nullai.tech/exports/${cadre.id}_300dpi_master.png`,
          },
        ],
      },
    ],
  };

  return { cadre, printify, gelato };
}
