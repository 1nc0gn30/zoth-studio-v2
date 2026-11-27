/**
 * Pure-JS Etsy Connector Engine (v2.6.0)
 * Mirrors Python src/etsy_connector/{seo_engine,pod_bridge,taxonomy,mcp_server}.py
 * + RFC 7636 PKCE SHA-256 + Etsy v3 QPS/QPD Quota Planner.
 * Zero external runtime dependencies.
 */

export const ETSY_CONNECTOR_VERSION = '2.6.0';
export const ETSY_QPS_LIMIT = 10;
export const ETSY_QPD_LIMIT = 10000;

export const ETSY_OAUTH_SCOPES = [
  { id: 'listings_r', label: 'listings_r', desc: 'Read active & draft shop listings' },
  { id: 'listings_w', label: 'listings_w', desc: 'Create & update draft listings, tags, and images' },
  { id: 'shops_r', label: 'shops_r', desc: 'Read shop profile, sections, and shipping profiles' },
  { id: 'shops_w', label: 'shops_w', desc: 'Update shop announcement and digital buyer messages' },
  { id: 'transactions_r', label: 'transactions_r', desc: 'Read completed order line-items & receipts' },
];

export const REST_ENDPOINTS = [
  {
    id: 'active-listings',
    method: 'GET',
    path: '/v3/application/listings/active',
    label: 'GET /listings/active',
    badge: 'Public Search',
    requiresOAuth: false,
  },
  {
    id: 'create-draft',
    method: 'POST',
    path: '/v3/application/shops/{shop_id}/listings',
    label: 'POST /shops/{id}/listings',
    badge: 'OAuth Draft',
    requiresOAuth: true,
  },
  {
    id: 'seller-taxonomy',
    method: 'GET',
    path: '/v3/application/seller-taxonomy/nodes',
    label: 'GET /seller-taxonomy/nodes',
    badge: 'Taxonomy Tree',
    requiresOAuth: false,
  },
  {
    id: 'get-shop',
    method: 'GET',
    path: '/v3/application/shops/{shop_id}',
    label: 'GET /shops/{id}',
    badge: 'Shop Metrics',
    requiresOAuth: false,
  },
];

// Canonical 8-entry Etsy taxonomy matching src/etsy_connector/taxonomy.py
export const TAXONOMY_CATALOG = [
  {
    id: 'tax-1099',
    taxonomyId: 1099,
    group: 'Apparel',
    category: 'Clothing > Gender-Neutral Adult Clothing > Sweaters & Sweatshirts > Sweatshirts',
    fulfillment: 'DTG / Embroidery POD (Gildan 18000 / Gelato)',
    typicalMargin: '46% – 55%',
    keywords: ['crewneck', 'sweatshirt', 'pullover', 'hoodie', 'fleece', 'gildan 18000'],
  },
  {
    id: 'tax-1098',
    taxonomyId: 1098,
    group: 'Apparel',
    category: 'Clothing > Gender-Neutral Adult Clothing > Tops & Tees > T-shirts',
    fulfillment: 'DTG POD (Comfort Colors 1717 / Printify #29 / Gelato)',
    typicalMargin: '44% – 54%',
    keywords: ['tshirt', 'tee', 'shirt', 'graphic tee', 'comfort colors 1717'],
  },
  {
    id: 'tax-1085',
    taxonomyId: 1085,
    group: 'Mugs',
    category: 'Home & Living > Kitchen & Dining > Drink & Barware > Drinkware > Mugs',
    fulfillment: 'Sublimation POD (15oz Ceramic · Printify #26 / Gelato)',
    typicalMargin: '48% – 58%',
    keywords: ['mug', 'coffee mug', 'tea cup', 'ceramic mug', '15oz mug'],
  },
  {
    id: 'tax-1095',
    taxonomyId: 1095,
    group: 'Totes',
    category: 'Bags & Purses > Handbags > Totes',
    fulfillment: 'Heavyweight Canvas Tote (Printify #3 / Gelato)',
    typicalMargin: '48% – 58%',
    keywords: ['tote', 'canvas tote', 'market bag', 'library tote', 'grocery bag'],
  },
  {
    id: 'tax-1089',
    taxonomyId: 1089,
    group: 'Digital Prints',
    category: 'Art & Collectibles > Prints > Digital Prints',
    fulfillment: 'Instant Digital Download (300 DPI Multi-Ratio ZIP)',
    typicalMargin: '88% – 94%',
    keywords: ['wall art', 'printable', 'digital download', 'botanical print', 'gallery wall'],
  },
  {
    id: 'tax-1077',
    taxonomyId: 1077,
    group: 'Patterns',
    category: 'Craft Supplies & Tools > Patterns & How To > Patterns & Blueprints',
    fulfillment: 'Instant Digital PDF Pattern / Blueprint',
    typicalMargin: '88% – 94%',
    keywords: ['pattern', 'quilt pattern', 'embroidery pattern', 'cross stitch', 'crochet pattern'],
  },
  {
    id: 'tax-1065',
    taxonomyId: 1065,
    group: 'Stationery',
    category: 'Paper & Party Supplies > Paper > Greeting Cards',
    fulfillment: 'Archival Cardstock Print / Digital Printable',
    typicalMargin: '55% – 88%',
    keywords: ['card', 'greeting card', 'stationery', 'postcard', 'note card'],
  },
  {
    id: 'tax-1092',
    taxonomyId: 1092,
    group: 'Home Decor',
    category: 'Home & Living > Home Decor > Decorative Pillows',
    fulfillment: 'Cut & Sew Sublimation POD Pillow',
    typicalMargin: '46% – 56%',
    keywords: ['pillow', 'throw pillow', 'cushion', 'cottagecore pillow'],
  },
];

export const PRINTIFY_BLUEPRINTS = {
  comfort_colors_1717: {
    blueprint_id: 638,
    name: 'Comfort Colors 1717 Garment-Dyed T-Shirt',
    cadre: 'apparel',
    print_provider_id: 29,
    provider_name: 'Monster Digital',
    recommended_retail_usd: 32.99,
    base_cost_usd: 12.8,
    canvas_size: { width: 4500, height: 5400, dpi: 300 },
  },
  gildan_18000: {
    blueprint_id: 49,
    name: 'Gildan 18000 Heavy Blend Crewneck Sweatshirt',
    cadre: 'apparel',
    print_provider_id: 29,
    provider_name: 'Monster Digital',
    recommended_retail_usd: 38.99,
    base_cost_usd: 15.5,
    canvas_size: { width: 4500, height: 5400, dpi: 300 },
  },
  ceramic_mug_15oz: {
    blueprint_id: 68,
    name: 'Ceramic Accent Mug 15oz',
    cadre: 'drinkware',
    print_provider_id: 26,
    provider_name: 'Spoke Custom Products',
    recommended_retail_usd: 21.99,
    base_cost_usd: 6.8,
    canvas_size: { width: 2400, height: 1100, dpi: 300 },
  },
  canvas_tote_heavy: {
    blueprint_id: 611,
    name: 'Liberty Bags Heavyweight Canvas Tote',
    cadre: 'accessories',
    print_provider_id: 3,
    provider_name: 'Printify Accessories Partner',
    recommended_retail_usd: 24.99,
    base_cost_usd: 7.2,
    canvas_size: { width: 3600, height: 3600, dpi: 300 },
  },
  digital_wall_art_pack: {
    blueprint_id: 0,
    name: 'Instant Digital Download Wall Art Pack (300 DPI 5-Ratio ZIP)',
    cadre: 'digital',
    print_provider_id: 0,
    provider_name: 'Direct Etsy Digital Delivery',
    recommended_retail_usd: 9.99,
    base_cost_usd: 0.0,
    canvas_size: { width: 7200, height: 10800, dpi: 300 },
  },
};

export const GELATO_PRODUCTS = {
  comfort_colors_1717: {
    product_uid: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_m_gco_white_gpr_4-0',
    name: 'Gelato Heavyweight Unisex Crewneck T-Shirt',
    cadre: 'apparel',
    recommended_retail_usd: 32.99,
    base_cost_usd: 11.95,
    fulfillment_regions: ['US', 'EU', 'UK', 'AU', 'CA'],
    canvas_size: { width: 4500, height: 5400, dpi: 300 },
  },
  gildan_18000: {
    product_uid: 'apparel_product_gca_sweatshirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_m_gco_sand_gpr_4-0',
    name: 'Gelato Heavy Blend Unisex Crewneck Sweatshirt',
    cadre: 'apparel',
    recommended_retail_usd: 38.99,
    base_cost_usd: 14.9,
    fulfillment_regions: ['US', 'EU', 'UK', 'CA'],
    canvas_size: { width: 4500, height: 5400, dpi: 300 },
  },
  ceramic_mug_15oz: {
    product_uid: 'mug_product_msz_15-oz_mmat_ceramic-white_cl_4-0',
    name: 'Gelato White Ceramic Mug 15oz',
    cadre: 'drinkware',
    recommended_retail_usd: 21.99,
    base_cost_usd: 6.45,
    fulfillment_regions: ['US', 'EU', 'UK', 'AU'],
    canvas_size: { width: 2400, height: 1100, dpi: 300 },
  },
  canvas_tote_heavy: {
    product_uid: 'bag_product_bt_tote-bag_bmat_cotton-heavy_bco_natural_gpr_4-0',
    name: 'Gelato Heavyweight Cotton Tote Bag',
    cadre: 'accessories',
    recommended_retail_usd: 24.99,
    base_cost_usd: 7.1,
    fulfillment_regions: ['US', 'EU', 'UK'],
    canvas_size: { width: 3600, height: 3600, dpi: 300 },
  },
  fine_art_poster_18x24: {
    product_uid: 'flat_18x24-inch-45x60-cm_200-gsm-uncoated-matte_4-0_ver',
    name: 'Gelato Archival Matte Fine Art Poster (18×24 in / 200gsm)',
    cadre: 'wall_art',
    recommended_retail_usd: 29.99,
    base_cost_usd: 9.4,
    fulfillment_regions: ['US', 'EU', 'UK', 'AU', 'JP', 'CA'],
    canvas_size: { width: 5400, height: 7200, dpi: 300 },
  },
  digital_wall_art_pack: {
    product_uid: 'digital_direct_etsy_zip_300dpi',
    name: 'Instant Digital Download Wall Art Pack (300 DPI 5-Ratio ZIP)',
    cadre: 'digital',
    recommended_retail_usd: 9.99,
    base_cost_usd: 0.0,
    fulfillment_regions: ['GLOBAL_DIGITAL'],
    canvas_size: { width: 7200, height: 10800, dpi: 300 },
  },
};

// All 8 real MCP tools matching src/etsy_connector/mcp_server.py
export const MCP_TOOLS = [
  {
    id: 'etsy_search_listings',
    label: 'etsy_search_listings',
    badge: 'Search',
    defaultArgs: { keywords: 'wildflower sweatshirt', limit: 10, min_price: 20, max_price: 50 },
  },
  {
    id: 'etsy_audit_listing_seo',
    label: 'etsy_audit_listing_seo',
    badge: '13-Tag SEO',
    defaultArgs: {
      title: 'Botanical Wildflower Heavy Blend Crewneck Sweatshirt, Cottagecore Floral Gift, Garment Dyed Pullover',
      tags: [
        'wildflower crewneck', 'botanical sweatshirt', 'cottagecore gift', 'floral pullover',
        'garden lover gift', 'nature crewneck', 'cozy floral shirt', 'spring botanical',
        'pressed flower art', 'embroidered look', 'comfort colors 1717', 'gift for gardener',
        'aesthetic sweater',
      ],
      description: 'Heavyweight unisex crewneck sweatshirt printed with archival botanical wildflower artwork. Includes sizing guide and cold-wash care instructions.',
    },
  },
  {
    id: 'etsy_calculate_profit_margins',
    label: 'etsy_calculate_profit_margins',
    badge: '12%/15% Fees',
    defaultArgs: {
      retail_price: 38.99,
      pod_base_cost: 15.5,
      shipping_charged: 4.99,
      shipping_cost: 0.0,
      offsite_ads_rate: 0.12,
    },
  },
  {
    id: 'etsy_get_taxonomy_categories',
    label: 'etsy_get_taxonomy_categories',
    badge: 'Taxonomy',
    defaultArgs: { query: 'sweatshirt' },
  },
  {
    id: 'etsy_create_draft_listing',
    label: 'etsy_create_draft_listing',
    badge: 'Draft API',
    defaultArgs: {
      title: 'Botanical Archival Printable Wall Art Pack, 300 DPI Multi-Ratio Download',
      description: 'Instant 300 DPI digital download covering 2:3, 3:4, 4:5, 11:14, and ISO A-Series frames.',
      price: 11.99,
      quantity: 999,
      taxonomy_id: 1089,
      listing_type: 'download',
      who_made: 'i_did',
      when_made: '2020_2026',
      is_supply: false,
      confirm: false,
      tags: ['botanical wall art', 'printable wall art', 'gallery poster', 'instant download'],
    },
  },
  {
    id: 'etsy_upload_listing_image',
    label: 'etsy_upload_listing_image',
    badge: 'Image Upload',
    defaultArgs: {
      listing_id: '1827495001',
      image_path: '/tmp/mockup_hero.jpg',
      rank: 1,
      alt_text: 'Botanical wildflower crewneck sweatshirt flatlay mockup',
      confirm: false,
    },
  },
  {
    id: 'etsy_get_shop_details',
    label: 'etsy_get_shop_details',
    badge: 'Shop Info',
    defaultArgs: { shop_id: 'me' },
  },
  {
    id: 'etsy_generate_pod_payload',
    label: 'etsy_generate_pod_payload',
    badge: 'Printify / Gelato',
    defaultArgs: {
      provider: 'gelato',
      blueprint_key: 'fine_art_poster_18x24',
      title: 'Botanical Archival Matte Fine Art Poster 18x24',
      description: '200gsm museum-grade matte archival print fulfilled locally via Gelato.',
      tags: ['botanical poster', 'archival wall art', 'fine art print', 'living room decor'],
      design_image_url: 'https://assets.nullai.tech/sample_wildflower.png',
      retail_price_usd: 29.99,
    },
  },
];

// RFC 6234 pure-JS SHA-256
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256BytesSync(inputStr) {
  const bytes = new TextEncoder().encode(String(inputStr || ''));
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((val, idx) => outView.setUint32(idx * 4, val, false));
  return out;
}

export function bytesToBase64Url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function derivePkceChallenge(verifier) {
  return bytesToBase64Url(sha256BytesSync(verifier));
}

const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

export function generateVerifierString(len = 64) {
  const arr = new Uint8Array(len);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < len; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < len; i += 1) out += PKCE_CHARSET[arr[i] % PKCE_CHARSET.length];
  return out;
}

export function generateStateNonce() {
  const bytes = new Uint8Array(12);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 12; i += 1) bytes[i] = (i * 37 + 19) & 0xff;
  }
  return bytesToBase64Url(bytes);
}

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function auditTitle(title) {
  const cleanTitle = String(title || '').trim();
  const charLen = cleanTitle.length;
  const words = cleanTitle ? cleanTitle.split(/\s+/) : [];
  const issues = [];
  const recommendations = [];
  let score = 100;

  if (charLen === 0) {
    return {
      valid: false,
      char_length: 0,
      word_count: 0,
      first_40_chars: '',
      score: 0,
      issues: ['Title cannot be empty'],
      recommendations: ['Provide a descriptive title between 80 and 130 characters.'],
    };
  }
  if (charLen > 140) {
    score -= 40;
    issues.push(`Title exceeds Etsy's 140-character maximum limit (${charLen}/140 chars).`);
    recommendations.push('Trim title to under 140 characters to prevent API rejection.');
  } else if (charLen < 40) {
    score -= 25;
    issues.push(`Title is too short (${charLen}/140 chars). Missing critical keyword search real estate.`);
    recommendations.push('Expand title to at least 70–120 characters with high-volume search phrases.');
  }
  const first40 = cleanTitle.slice(0, 40).trim();
  if (first40.split(/\s+/).filter(Boolean).length < 3) {
    score -= 10;
    issues.push('First 40 characters lack descriptive long-tail search terms.');
    recommendations.push('Front-load primary product keywords in the first 40 characters for mobile display.');
  }
  const sepCount = (cleanTitle.match(/[,|\-/•]/g) || []).length;
  if (sepCount > 6) {
    score -= 15;
    issues.push('Excessive separators detected. Excessive punctuation can look like keyword stuffing.');
    recommendations.push("Use natural phrasing or 2–4 clean separators like pipes '|' or commas.");
  }
  if (cleanTitle === cleanTitle.toUpperCase() && /[A-Z]/.test(cleanTitle) && charLen > 15) {
    score -= 20;
    issues.push('Title is in ALL CAPS. Etsy algorithm and shoppers penalize aggressive all-caps titles.');
    recommendations.push('Use Title Case or Sentence Case for better buyer trust.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    valid: charLen > 0 && charLen <= 140,
    char_length: charLen,
    word_count: words.length,
    first_40_chars: first40,
    score,
    issues,
    recommendations,
  };
}

export function auditTags(tags) {
  const cleanedTags = (Array.isArray(tags) ? tags : [])
    .map((t) => String(t || '').trim().toLowerCase())
    .filter(Boolean);
  const issues = [];
  const recommendations = [];
  const invalidTags = [];
  let score = 100;
  const tagCount = cleanedTags.length;

  if (tagCount < 13) {
    score -= (13 - tagCount) * 4;
    issues.push(`Only ${tagCount}/13 tags used. You are leaving free search traffic on the table.`);
    recommendations.push(`Add ${13 - tagCount} more multi-word tags to maximize search impression coverage.`);
  } else if (tagCount > 13) {
    score -= 30;
    issues.push(`Exceeded Etsy's limit of 13 tags (${tagCount} provided). API will reject this.`);
    recommendations.push('Limit tag array to exactly 13 tags.');
  }

  const seen = new Set();
  let singleWordCount = 0;
  for (const tag of cleanedTags) {
    if (tag.length > 20) {
      score -= 15;
      invalidTags.push({ tag, length: tag.length, error: 'Exceeds 20-char limit' });
      issues.push(`Tag '${tag}' is ${tag.length} characters (max allowed is 20).`);
    }
    if (seen.has(tag)) {
      score -= 10;
      issues.push(`Duplicate tag '${tag}' detected.`);
      recommendations.push('Remove duplicate tags to cover more distinct buyer searches.');
    }
    seen.add(tag);
    if (tag.split(/\s+/).length === 1) singleWordCount += 1;
  }

  if (singleWordCount > 3) {
    score -= 10;
    issues.push(`${singleWordCount} single-word tags detected. Long-tail phrases (2–3 words) convert significantly higher.`);
    recommendations.push("Replace single-word tags with specific 2-to-3 word phrases (e.g., 'wildflower mug' instead of 'mug').");
  }

  score = Math.max(0, Math.min(100, score));
  return {
    valid: invalidTags.length === 0 && tagCount > 0 && tagCount <= 13,
    tag_count: tagCount,
    tags: cleanedTags,
    invalid_tags: invalidTags,
    single_word_count: singleWordCount,
    score,
    issues,
    recommendations,
  };
}

export function auditListing(title, tags, description = '') {
  const tAudit = auditTitle(title);
  const tagAudit = auditTags(tags);
  const descClean = String(description || '').trim();
  const descLen = descClean.length;
  const descIssues = [];
  let descScore = 100;
  if (descLen < 100) {
    descScore -= 30;
    descIssues.push('Description is very brief (<100 characters).');
  } else if (descLen > 4000) {
    descIssues.push('Description is exceptionally long (>4000 chars).');
  }

  const titleWords = new Set(String(title || '').toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const tagWords = new Set();
  for (const tag of tagAudit.tags) {
    for (const w of tag.match(/\b[a-z]{3,}\b/g) || []) tagWords.add(w);
  }
  const sharedKeywords = [...titleWords].filter((w) => tagWords.has(w)).sort();
  const overallScore = Math.round(tAudit.score * 0.45 + tagAudit.score * 0.45 + descScore * 0.1);
  const grade =
    overallScore >= 95 ? 'A+' : overallScore >= 88 ? 'A' : overallScore >= 75 ? 'B' : overallScore >= 60 ? 'C' : 'F';
  const ready = tAudit.valid && tagAudit.valid && overallScore >= 75;

  return {
    overall_score: overallScore,
    grade,
    is_ready_to_publish: ready,
    title_audit: tAudit,
    tags_audit: tagAudit,
    description_length: descLen,
    description_score: descScore,
    description_issues: descIssues,
    shared_keywords_count: sharedKeywords.length,
    shared_keywords: sharedKeywords.slice(0, 8),
  };
}

export function calculateProfit({
  retailPrice = 38.99,
  podBaseCost = 15.5,
  shippingCharged = 0,
  shippingCost = 0,
  offsiteAdsRate = 0,
}) {
  const retail = round2(Math.max(0, Number(retailPrice) || 0));
  const pod = round2(Math.max(0, Number(podBaseCost) || 0));
  const shipChg = round2(Math.max(0, Number(shippingCharged) || 0));
  const shipCost = round2(Math.max(0, Number(shippingCost) || 0));
  const rawRate = Number(offsiteAdsRate) || 0;
  const adsRate = rawRate === 0.12 || rawRate === 12 ? 0.12 : rawRate === 0.15 || rawRate === 15 ? 0.15 : 0;

  const grossRevenue = round2(retail + shipChg);
  const listingFee = 0.2;
  const transactionFee = round2(grossRevenue * 0.065);
  const paymentProcessingFee = round2(grossRevenue * 0.03 + 0.25);
  const offsiteAdsFee = adsRate > 0 ? round2(grossRevenue * adsRate) : 0;
  const totalEtsyFees = round2(listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee);
  const totalProductionCost = round2(pod + shipCost);
  const totalCosts = round2(totalEtsyFees + totalProductionCost);
  const netProfit = round2(grossRevenue - totalCosts);
  const netMarginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 1000) / 10 : 0;
  const roiPct = totalProductionCost > 0 ? Math.round((netProfit / totalProductionCost) * 1000) / 10 : 0;
  const varRate = 0.065 + 0.03 + adsRate;
  const breakEvenPrice = round2(Math.max(0, (totalProductionCost + 0.45) / (1 - varRate) - shipChg));

  return {
    retail_price: retail,
    shipping_charged: shipChg,
    gross_revenue: grossRevenue,
    pod_base_cost: pod,
    shipping_cost: shipCost,
    total_production_cost: totalProductionCost,
    offsite_ads_rate: adsRate,
    offsite_ads_tier: adsRate === 0.15 ? '15% (<$10k/yr)' : adsRate === 0.12 ? '12% (>=$10k/yr)' : '0% (Organic)',
    etsy_fees: {
      listing_fee: listingFee,
      transaction_fee: transactionFee,
      payment_processing_fee: paymentProcessingFee,
      offsite_ads_fee: offsiteAdsFee,
      total_etsy_fees: totalEtsyFees,
    },
    total_costs: totalCosts,
    net_profit: netProfit,
    net_margin_pct: netMarginPct,
    roi_pct: roiPct,
    break_even_price: breakEvenPrice,
    profitable: netProfit > 0,
  };
}

export function generatePodPayload({
  provider = 'printify',
  blueprintKey = 'comfort_colors_1717',
  title = '',
  description = '',
  tags = [],
  designImageUrl = 'https://assets.nullai.tech/sample_wildflower.png',
  retailPriceUsd = null,
}) {
  const prov = String(provider || 'printify').toLowerCase();
  if (prov === 'gelato') {
    const key = GELATO_PRODUCTS[blueprintKey] ? blueprintKey : 'comfort_colors_1717';
    const gp = GELATO_PRODUCTS[key];
    const price = round2(retailPriceUsd != null ? retailPriceUsd : gp.recommended_retail_usd);
    return {
      provider: 'gelato',
      blueprint_key: key,
      apiVersion: 'v4',
      endpoint: 'POST https://ecommerce.gelatoapis.com/v1/stores/{storeId}/products:create-from-template',
      title,
      description,
      tags: (Array.isArray(tags) ? tags : []).slice(0, 13),
      isVisibleInTheOnlineStore: false,
      salesChannels: ['etsy'],
      variants: [
        {
          productUid: gp.product_uid,
          retailPrice: { amount: price, currency: 'USD' },
          imagePlaceholders: [{ name: 'front', fileUrl: designImageUrl, fitMethod: 'meet' }],
        },
      ],
      metadata: {
        source: 'etsy-connector',
        provider: 'gelato',
        cadre: gp.cadre,
        base_cost_usd: gp.base_cost_usd,
        retail_price_usd: price,
        fulfillment_regions: gp.fulfillment_regions,
        canvas_specs: gp.canvas_size,
      },
    };
  }
  const key = PRINTIFY_BLUEPRINTS[blueprintKey] ? blueprintKey : 'comfort_colors_1717';
  const bp = PRINTIFY_BLUEPRINTS[key];
  const price = round2(retailPriceUsd != null ? retailPriceUsd : bp.recommended_retail_usd);
  return {
    provider: 'printify',
    blueprint_key: key,
    title,
    description,
    blueprint_id: bp.blueprint_id,
    print_provider_id: bp.print_provider_id,
    tags: (Array.isArray(tags) ? tags : []).slice(0, 13),
    variants: [{ id: 1, price: Math.round(price * 100), is_enabled: true }],
    print_areas: [
      {
        position: 'front',
        images: [{ id: 'img_primary_design', src: designImageUrl, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }],
      },
    ],
    metadata: {
      source: 'etsy-connector',
      provider: 'printify',
      provider_name: bp.provider_name,
      cadre: bp.cadre,
      base_cost_usd: bp.base_cost_usd,
      retail_price_usd: price,
      canvas_specs: bp.canvas_size,
    },
  };
}

export function buildMcpBundle({ toolId, argsText, clientId, shopId }) {
  let parsedArgs = null;
  let parseError = '';
  try {
    parsedArgs = JSON.parse(argsText);
  } catch (err) {
    parseError = err instanceof Error ? err.message : 'Invalid JSON arguments';
  }

  const jsonRpcEnvelope = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: toolId,
      arguments: parsedArgs || {},
    },
  };

  const mcpConfigObj = {
    mcpServers: {
      'etsy-connector': {
        command: 'python3',
        args: ['-m', 'etsy_connector.cli', 'mcp'],
        env: {
          PYTHONPATH: '/opt/etsy-connector/src',
          ETSY_API_KEY: clientId?.trim() || '${ETSY_API_KEY}',
          ETSY_ACCESS_TOKEN: '${ETSY_ACCESS_TOKEN}',
          ETSY_SHOP_ID: String(shopId || 'me').trim() || 'me',
        },
      },
    },
  };

  const stdioPipeCmd = `printf '%s\\n' '${JSON.stringify(jsonRpcEnvelope).replace(/'/g, "'\\''")}' | PYTHONPATH=/opt/etsy-connector/src python3 -m etsy_connector.cli mcp`;

  return {
    parsedArgs,
    parseError,
    jsonRpcText: JSON.stringify(jsonRpcEnvelope, null, 2),
    mcpConfigObj,
    mcpConfigText: JSON.stringify(mcpConfigObj, null, 2),
    stdioPipeCmd,
  };
}

export function analyzeQuota({
  activeListingCount = 140,
  pollIntervalMin = 30,
  callsPerListing = 2,
  parallelWorkers = 4,
  dailyDrafts = 25,
}) {
  const listings = Math.max(1, Number(activeListingCount) || 1);
  const interval = Math.max(5, Number(pollIntervalMin) || 30);
  const cpl = Math.max(1, Number(callsPerListing) || 1);
  const workers = Math.max(1, Number(parallelWorkers) || 1);
  const drafts = Math.max(0, Number(dailyDrafts) || 0);

  const pollsPerDay = Math.floor(1440 / interval);
  const listSweepCallsPerPoll = Math.ceil(listings / 100);
  const detailCallsPerPoll = cpl > 1 ? listings * (cpl - 1) : 0;
  const syncCallsPerDay = pollsPerDay * (listSweepCallsPerPoll + detailCallsPerPoll);
  const draftCallsPerDay = drafts * 5;
  const totalDailyCalls = syncCallsPerDay + draftCallsPerDay;
  const qpdUtilizationPct = Number(((totalDailyCalls / ETSY_QPD_LIMIT) * 100).toFixed(1));
  const remainingQpd = Math.max(0, ETSY_QPD_LIMIT - totalDailyCalls);

  const unthrottledPeakQps = Number((workers * 2.2).toFixed(1));
  const safeDelayMs = Math.max(105, Math.ceil((workers / ETSY_QPS_LIMIT) * 1000 * 1.15));
  const qpsSafe = unthrottledPeakQps <= ETSY_QPS_LIMIT;
  const qpdSafe = totalDailyCalls <= ETSY_QPD_LIMIT;

  let healthScore = 100;
  if (qpdUtilizationPct > 100) healthScore -= 55;
  else if (qpdUtilizationPct > 80) healthScore -= 25;
  else if (qpdUtilizationPct > 60) healthScore -= 10;
  if (unthrottledPeakQps > ETSY_QPS_LIMIT) healthScore -= 25;
  else if (unthrottledPeakQps > 8) healthScore -= 10;
  healthScore = Math.max(5, Math.min(100, healthScore));

  return {
    pollsPerDay,
    listSweepCallsPerPoll,
    detailCallsPerPoll,
    draftCallsPerDay,
    totalDailyCalls,
    qpdUtilizationPct,
    remainingQpd,
    unthrottledPeakQps,
    safeDelayMs,
    qpsSafe,
    qpdSafe,
    healthScore,
  };
}
