import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CodeIcon from '@mui/icons-material/Code';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
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

const ACCENT_RAW = SOV.emerald;
const SHOPIFY_API_VERSION = '2025-01';
const SEO_TITLE_MAX = 70;
const META_DESC_MAX = 160;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with',
  'by', 'at', 'from', 'gift', 'idea', 'best', 'new',
]);

const ETSY_PRESETS = [
  {
    id: 'japandi-poster',
    label: 'Japandi Wall Print',
    badge: 'Wall Art',
    etsyTitle: 'Minimalist Japandi Arch Wall Art Print, Warm Terracotta Linen Poster, Neutral Boho Living Room Decor, Modern Gallery Print',
    etsyTags: 'japandi wall art, minimalist arch art, terracotta poster, neutral boho decor, living room print, linen texture art, modern gallery wall, warm earthy art, wabi sabi print, beige abstract art, framed wall poster, scandinavian decor, housewarming gift',
    price: 44.0,
    compareAt: 58.0,
    vendor: 'NullAI Atelier',
    productType: 'Wall Art Prints',
    option1Name: 'Size',
    option1Values: '12x18 in, 18x24 in, 24x36 in',
    option2Name: 'Frame',
    option2Values: 'Unframed, Natural Oak, Matte Black',
    cogs: 17.5,
    buyerShipping: 0,
    etsyDescription:
      'Museum-grade archival giclee wall art print inspired by serene Japandi geometry and warm terracotta linen tones.\n\n- Printed on 200 gsm FSC-certified matte archival stock\n- Fade-resistant pigment inks with deep shadow fidelity\n- Available unframed or mounted in solid oak and matte black frames\n- Locally fulfilled across 32 countries for rapid, low-carbon shipping',
  },
  {
    id: 'heavyweight-hoodie',
    label: 'Heavyweight Hoodie',
    badge: 'Apparel',
    etsyTitle: 'Oversized Garment Dyed Streetwear Hoodie, Vintage Washed Heavyweight Cotton Pullover, Minimalist Embroidered Sweatshirt',
    etsyTags: 'oversized hoodie, garment dyed hoodie, heavyweight pullover, streetwear sweatshirt, vintage washed hoodie, minimalist apparel, unisex cotton hoodie, boxy fit sweatshirt, monochrome fashion, cozy winter gift, studio essentials, slow fashion top, neutral hoodie',
    price: 68.0,
    compareAt: 84.0,
    vendor: 'Zoth Supply Co',
    productType: 'Apparel & Hoodies',
    option1Name: 'Size',
    option1Values: 'S, M, L, XL',
    option2Name: 'Color',
    option2Values: 'Washed Black, Alabaster Bone',
    cogs: 27.9,
    buyerShipping: 5.95,
    etsyDescription:
      'Boxy 450 GSM heavyweight French terry pullover engineered for structured drape and everyday durability.\n\n- 100% combed ring-spun cotton with reactive garment dye\n- Double-lined structured hood without flimsy drawstrings\n- Drop-shoulder silhouette with ribbed cuffs and hem\n- Water-based ink print tested for 50+ wash cycles',
  },
  {
    id: 'ceramic-mug-set',
    label: 'Stoneware Mug',
    badge: 'Home Goods',
    etsyTitle: 'Speckled Matte Ceramic Coffee Mug 15oz, Minimalist Architectural Tea Cup, Modern Desk Mug, Gift For Architects & Developers',
    etsyTags: 'ceramic coffee mug, 15oz matte mug, speckled stoneware, minimalist tea cup, modern desk mug, architect gift, developer coffee cup, neutral kitchenware, stoneware drinkware, studio mug gift, geometric ceramic, dishwasher safe mug, morning coffee',
    price: 26.0,
    compareAt: 32.0,
    vendor: 'NullAI Atelier',
    productType: 'Drinkware',
    option1Name: 'Capacity',
    option1Values: '11oz, 15oz',
    option2Name: 'Glaze',
    option2Values: 'Ivory Speckle, Matte Obsidian',
    cogs: 10.45,
    buyerShipping: 4.5,
    etsyDescription:
      'Thick-walled matte ceramic mug built for studio mornings and long engineering sessions.\n\n- Lead-free speckled glaze with ergonomic C-handle\n- Microwave and top-rack dishwasher safe\n- Ships in crush-tested double-walled kraft mailer',
  },
];

function toHandle(title) {
  const tokens = String(title || 'shopify-product')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = tokens.filter((w) => !STOPWORDS.has(w));
  const picked = (meaningful.length >= 3 ? meaningful : tokens).slice(0, 7);
  return picked.join('-').replace(/-+/g, '-').slice(0, 64) || 'shopify-product';
}

function buildSeoTitle(etsyTitle, vendor) {
  const firstClause = String(etsyTitle || '')
    .split(/[|,\u2014]+/)[0]
    .replace(/\s+/g, ' ')
    .trim();
  const base = firstClause || String(etsyTitle || 'Untitled Product').trim();
  const suffix = vendor && vendor.trim() ? ` | ${vendor.trim()}` : '';
  const combined = `${base}${suffix}`;
  if (combined.length <= SEO_TITLE_MAX) return combined;
  const maxBase = Math.max(20, SEO_TITLE_MAX - suffix.length);
  const clipped = base.slice(0, maxBase).replace(/\s+\S*$/, '').trim() || base.slice(0, maxBase);
  return `${clipped}${suffix}`.slice(0, SEO_TITLE_MAX);
}

function buildMetaDescription(desc, price) {
  const clean = String(desc || '')
    .replace(/^[-*•]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  const cta = price > 0 ? ` Shop now for $${Number(price).toFixed(2)}.` : '';
  const maxBody = Math.max(40, META_DESC_MAX - cta.length);
  const body =
    clean.length <= maxBody
      ? clean
      : `${clean.slice(0, maxBody - 1).replace(/\s+\S*$/, '').trim()}…`;
  return `${body}${cta}`.slice(0, META_DESC_MAX);
}

function descToHtml(desc) {
  const lines = String(desc || '').split('\n');
  const out = [];
  let inList = false;
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      return;
    }
    const safe = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (/^[-*•]\s+/.test(safe)) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`  <li>${safe.replace(/^[-*•]\s+/, '')}</li>`);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<p>${safe}</p>`);
    }
  });
  if (inList) out.push('</ul>');
  return out.join('\n');
}

function skuCode(str, maxLen = 4) {
  return (
    String(str || 'STD')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, maxLen) || 'STD'
  );
}

function csvEscape(val) {
  const s = String(val ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

const GRAPHQL_OPS = [
  { id: 'productCreate', label: 'productCreate', badge: 'Mutation' },
  { id: 'productUpdate', label: 'productUpdate', badge: 'Mutation' },
  { id: 'inventorySetQuantities', label: 'inventorySetQuantities', badge: 'Mutation' },
  { id: 'productsSearch', label: 'products (Search)', badge: 'Query' },
];

export default function ShopifyConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [activePresetId, setActivePresetId] = useState(ETSY_PRESETS[0].id);
  const [etsyTitle, setEtsyTitle] = useState(ETSY_PRESETS[0].etsyTitle);
  const [etsyTags, setEtsyTags] = useState(ETSY_PRESETS[0].etsyTags);
  const [etsyDescription, setEtsyDescription] = useState(ETSY_PRESETS[0].etsyDescription);
  const [price, setPrice] = useState(ETSY_PRESETS[0].price);
  const [compareAt, setCompareAt] = useState(ETSY_PRESETS[0].compareAt);
  const [vendor, setVendor] = useState(ETSY_PRESETS[0].vendor);
  const [productType, setProductType] = useState(ETSY_PRESETS[0].productType);
  const [option1Name, setOption1Name] = useState(ETSY_PRESETS[0].option1Name);
  const [option1Values, setOption1Values] = useState(ETSY_PRESETS[0].option1Values);
  const [option2Name, setOption2Name] = useState(ETSY_PRESETS[0].option2Name);
  const [option2Values, setOption2Values] = useState(ETSY_PRESETS[0].option2Values);

  // GraphQL Workbench state
  const [storeDomain, setStoreDomain] = useState('your-store.myshopify.com');
  const [activeOp, setActiveOp] = useState('productCreate');
  const [snippetTab, setSnippetTab] = useState('graphql');
  const [outputTab, setOutputTab] = useState('variables');
  const [productGid, setProductGid] = useState('gid://shopify/Product/8942105512241');
  const [locationGid, setLocationGid] = useState('gid://shopify/Location/71294810411');
  const [inventoryItemGid, setInventoryItemGid] = useState('gid://shopify/InventoryItem/491028471201');
  const [inventoryQty, setInventoryQty] = useState(150);
  const [searchQuery, setSearchQuery] = useState('status:ACTIVE tag:japandi');

  // Margin comparator state
  const [cogs, setCogs] = useState(ETSY_PRESETS[0].cogs);
  const [buyerShipping, setBuyerShipping] = useState(ETSY_PRESETS[0].buyerShipping);
  const [monthlyOrders, setMonthlyOrders] = useState(120);

  const loadPreset = (p) => {
    setActivePresetId(p.id);
    setEtsyTitle(p.etsyTitle);
    setEtsyTags(p.etsyTags);
    setEtsyDescription(p.etsyDescription);
    setPrice(p.price);
    setCompareAt(p.compareAt);
    setVendor(p.vendor);
    setProductType(p.productType);
    setOption1Name(p.option1Name);
    setOption1Values(p.option1Values);
    setOption2Name(p.option2Name);
    setOption2Values(p.option2Values);
    setCogs(p.cogs);
    setBuyerShipping(p.buyerShipping);
  };

  // Deterministic Etsy -> Shopify Transpilation
  const transpiled = useMemo(() => {
    const handle = toHandle(etsyTitle);
    const seoTitle = buildSeoTitle(etsyTitle, vendor);
    const metaDescription = buildMetaDescription(etsyDescription, price);
    const bodyHtml = descToHtml(etsyDescription);

    const seenTags = new Set();
    const cleanTags = String(etsyTags || '')
      .split(/[,\n]+/)
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, ' '))
      .filter((t) => {
        if (!t || seenTags.has(t)) return false;
        seenTags.add(t);
        return true;
      });

    const opt1List = String(option1Values || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const opt2List = String(option2Values || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const vPrefix = skuCode(vendor, 3);
    const pPrefix = skuCode(handle.replace(/-/g, ''), 4);
    const variants = [];
    const safeOpt1 = opt1List.length > 0 ? opt1List : ['Default Title'];
    const safeOpt2 = opt2List.length > 0 ? opt2List : [''];

    safeOpt1.forEach((v1, i) => {
      safeOpt2.forEach((v2, j) => {
        const skuParts = [vPrefix, pPrefix, skuCode(v1, 4)];
        if (v2) skuParts.push(skuCode(v2, 4));
        const stepPrice = Number((Number(price || 0) + i * 2).toFixed(2));
        variants.push({
          id: `${i}-${j}`,
          sku: skuParts.join('-'),
          option1: v1,
          option2: v2 || '—',
          price: `$${stepPrice.toFixed(2)}`,
          rawPrice: stepPrice,
          compareAt: compareAt > stepPrice ? `$${Number(compareAt).toFixed(2)}` : '—',
          status: 'READY',
        });
      });
    });

    const graphqlVariables = {
      product: {
        title: seoTitle.split(' | ')[0],
        handle,
        vendor: vendor.trim() || 'NullAI Atelier',
        productType: productType.trim() || 'General',
        status: 'DRAFT',
        tags: cleanTags,
        descriptionHtml: bodyHtml,
        seo: {
          title: seoTitle,
          description: metaDescription,
        },
        productOptions: [
          ...(opt1List.length > 0
            ? [{ name: option1Name.trim() || 'Option 1', values: opt1List.map((name) => ({ name })) }]
            : []),
          ...(opt2List.length > 0
            ? [{ name: option2Name.trim() || 'Option 2', values: opt2List.map((name) => ({ name })) }]
            : []),
        ],
      },
    };

    // Shopify Bulk Import CSV (official column headers)
    const csvHeaders = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Option2 Name',
      'Option2 Value',
      'Variant SKU',
      'Variant Price',
      'Variant Compare At Price',
      'SEO Title',
      'SEO Description',
      'Status',
    ];
    const csvRows = variants.map((v, idx) =>
      [
        handle,
        idx === 0 ? graphqlVariables.product.title : '',
        idx === 0 ? bodyHtml.replace(/\n/g, ' ') : '',
        idx === 0 ? graphqlVariables.product.vendor : '',
        idx === 0 ? graphqlVariables.product.productType : '',
        idx === 0 ? cleanTags.join(', ') : '',
        idx === 0 ? 'FALSE' : '',
        option1Name.trim() || 'Title',
        v.option1,
        opt2List.length > 0 ? option2Name.trim() || 'Style' : '',
        opt2List.length > 0 ? v.option2 : '',
        v.sku,
        v.rawPrice.toFixed(2),
        compareAt > v.rawPrice ? Number(compareAt).toFixed(2) : '',
        idx === 0 ? seoTitle : '',
        idx === 0 ? metaDescription : '',
        idx === 0 ? 'draft' : '',
      ]
        .map(csvEscape)
        .join(','),
    );
    const bulkCsv = [csvHeaders.map(csvEscape).join(','), ...csvRows].join('\n');

    return {
      handle,
      seoTitle,
      metaDescription,
      bodyHtml,
      cleanTags,
      variants,
      graphqlVariables,
      bulkCsv,
    };
  }, [
    etsyTitle,
    etsyTags,
    etsyDescription,
    price,
    compareAt,
    vendor,
    productType,
    option1Name,
    option1Values,
    option2Name,
    option2Values,
  ]);

  // GraphQL Admin API 2025-01 Workbench payload generator
  const graphqlBundle = useMemo(() => {
    const cleanDomain = (storeDomain || 'your-store.myshopify.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const endpoint = `https://${cleanDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

    let query = '';
    let variables = {};

    if (activeOp === 'productCreate') {
      query = `mutation ProductCreate($product: ProductCreateInput!) {
  productCreate(product: $product) {
    product {
      id
      handle
      title
      status
      seo { title description }
      tags
    }
    userErrors {
      field
      message
    }
  }
}`;
      variables = transpiled.graphqlVariables;
    } else if (activeOp === 'productUpdate') {
      query = `mutation ProductUpdate($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product {
      id
      handle
      title
      status
      tags
      seo { title description }
    }
    userErrors {
      field
      message
    }
  }
}`;
      variables = {
        product: {
          id: productGid.trim(),
          title: transpiled.seoTitle.split(' | ')[0],
          handle: transpiled.handle,
          tags: transpiled.cleanTags,
          seo: {
            title: transpiled.seoTitle,
            description: transpiled.metaDescription,
          },
          status: 'ACTIVE',
        },
      };
    } else if (activeOp === 'inventorySetQuantities') {
      query = `mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup {
      createdAt
      reason
      changes {
        name
        delta
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
      variables = {
        input: {
          name: 'available',
          reason: 'correction',
          ignoreCompareQuantity: true,
          quantities: [
            {
              inventoryItemId: inventoryItemGid.trim(),
              locationId: locationGid.trim(),
              quantity: Math.max(0, Number(inventoryQty) || 0),
            },
          ],
        },
      };
    } else {
      query = `query ProductsSearch($first: Int!, $query: String!) {
  products(first: $first, query: $query) {
    edges {
      cursor
      node {
        id
        handle
        title
        status
        totalInventory
        tags
        variants(first: 10) {
          edges {
            node { id sku price }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
      variables = {
        first: 20,
        query: searchQuery.trim() || 'status:ACTIVE',
      };
    }

    const bodyPayload = JSON.stringify({ query, variables }, null, 2);
    const curlSnippet = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Shopify-Access-Token: \${SHOPIFY_ADMIN_TOKEN}" \\
  -d '${JSON.stringify({ query, variables }).replace(/'/g, "'\\''")}'`;

    const nodeSnippet = `// Shopify Admin GraphQL API ${SHOPIFY_API_VERSION} (Node 18+ built-in fetch)
const endpoint = "${endpoint}";
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
  },
  body: JSON.stringify(${bodyPayload}),
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));`;

    return { endpoint, query, variables, bodyPayload, curlSnippet, nodeSnippet };
  }, [storeDomain, activeOp, transpiled, productGid, locationGid, inventoryItemGid, inventoryQty, searchQuery]);

  // Shopify Plans vs Etsy Fee Comparator
  const feeComparison = useMemo(() => {
    const rev = Math.max(0, Number(price) || 0) + Math.max(0, Number(buyerShipping) || 0);
    const unitCogs = Math.max(0, Number(cogs) || 0);
    const vol = Math.max(1, Number(monthlyOrders) || 1);

    const channels = [
      { id: 'shopify-basic', name: 'Shopify Basic', rate: '2.9% + $0.30', monthlyPlan: 39, feeFn: (r) => r * 0.029 + 0.3 },
      { id: 'shopify-grow', name: 'Shopify Grow', rate: '2.7% + $0.30', monthlyPlan: 105, feeFn: (r) => r * 0.027 + 0.3 },
      { id: 'shopify-adv', name: 'Shopify Advanced', rate: '2.5% + $0.30', monthlyPlan: 399, feeFn: (r) => r * 0.025 + 0.3 },
      { id: 'etsy-organic', name: 'Etsy Organic', rate: '$0.20 + 6.5% + 3% + $0.25', monthlyPlan: 0, feeFn: (r) => 0.2 + r * 0.065 + (r * 0.03 + 0.25) },
      { id: 'etsy-ads', name: 'Etsy Offsite Ads (15%)', rate: 'Organic + 15% Ads', monthlyPlan: 0, feeFn: (r) => 0.2 + r * 0.065 + (r * 0.03 + 0.25) + r * 0.15 },
    ];

    const computed = channels.map((ch) => {
      const fee = rev > 0 ? ch.feeFn(rev) : 0;
      const net = rev - fee - unitCogs;
      const marginPct = rev > 0 ? (net / rev) * 100 : 0;
      const monthlyNetAfterPlan = net * vol - ch.monthlyPlan;
      return {
        ...ch,
        fee,
        net,
        marginPct,
        monthlyNetAfterPlan,
      };
    });

    const etsyOrg = computed.find((c) => c.id === 'etsy-organic');
    const etsyAds = computed.find((c) => c.id === 'etsy-ads');
    const shopBasic = computed.find((c) => c.id === 'shopify-basic');

    const rows = computed.map((c) => {
      const deltaVsEtsyOrg = c.net - etsyOrg.net;
      return {
        id: c.id,
        channel: c.name,
        formula: c.rate,
        fee: `$${c.fee.toFixed(2)}`,
        netProfit: `${c.net < 0 ? '-' : ''}$${Math.abs(c.net).toFixed(2)}`,
        netMargin: `${c.marginPct.toFixed(1)}%`,
        deltaOrder: `${deltaVsEtsyOrg >= 0 ? '+' : '-'}$${Math.abs(deltaVsEtsyOrg).toFixed(2)}`,
        monthlyNet: `${c.monthlyNetAfterPlan < 0 ? '-' : ''}$${Math.abs(c.monthlyNetAfterPlan).toFixed(0)}`,
        status: c.marginPct >= 30 ? 'PASS' : c.marginPct >= 15 ? 'WARN' : 'FAIL',
      };
    });

    return {
      rev,
      rows,
      savePerOrderVsOrganic: shopBasic.net - etsyOrg.net,
      savePerOrderVsAds: shopBasic.net - etsyAds.net,
      shopBasicMargin: shopBasic.marginPct,
      etsyOrganicMargin: etsyOrg.marginPct,
    };
  }, [price, buyerShipping, cogs, monthlyOrders]);

  const kpis = [
    {
      label: 'Shopify Basic Net',
      value: `${feeComparison.shopBasicMargin.toFixed(1)}%`,
      unit: `+${(feeComparison.shopBasicMargin - feeComparison.etsyOrganicMargin).toFixed(1)}% vs Etsy`,
      accent: SOV.emerald,
    },
    {
      label: 'Savings vs Etsy',
      value: `+$${Math.max(0, feeComparison.savePerOrderVsOrganic).toFixed(2)}`,
      unit: `+$${Math.max(0, feeComparison.savePerOrderVsAds).toFixed(2)} vs Ads`,
      accent: SOV.gold,
    },
    {
      label: 'Transpiled SKUs',
      value: String(transpiled.variants.length),
      unit: `${transpiled.cleanTags.length} clean tags`,
      accent: SOV.cyber,
    },
    {
      label: 'Admin API Target',
      value: SHOPIFY_API_VERSION,
      unit: activeOp,
      accent: SOV.emerald,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status="online"
        label={`ADMIN API ${SHOPIFY_API_VERSION} · HANDLE /${transpiled.handle} · ${transpiled.variants.length} SKUS`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download Shopify Bulk CSV',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(transpiled.bulkCsv, `${transpiled.handle}-shopify-import.csv`, 'text/csv;charset=utf-8'),
      primary: true,
    },
    {
      label: 'Download GraphQL Variables JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(graphqlBundle.variables, `${transpiled.handle}-${activeOp}.json`),
    },
    {
      label: copied === 'curl' ? 'Copied curl Command' : 'Copy Admin API curl',
      icon: copied === 'curl' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(graphqlBundle.curlSnippet, 'curl'),
    },
    {
      label: 'shopify-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/shopify-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ETSY-TO-SHOPIFY LISTING TRANSPILER"
        title="Source Etsy Listing Input"
        subtitle="Paste any Etsy listing to deterministically generate Shopify handle, <=70 SEO title, <=160 meta description, SKUs, and Bulk CSV"
        accent={ACCENT_RAW}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={ETSY_PRESETS}
            activeId={activePresetId}
            onSelect={loadPreset}
            onReset={() => loadPreset(ETSY_PRESETS[0])}
            accent={ACCENT_RAW}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            label="Etsy Source Title (up to 140 chars)"
            value={etsyTitle}
            onChange={(e) => setEtsyTitle(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            label="Etsy 13 Search Tags (comma separated)"
            value={etsyTags}
            onChange={(e) => setEtsyTags(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem' } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Vendor / Brand"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
            />
            <TextField
              size="small"
              label="Product Type"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              type="number"
              label="Base Price ($)"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="Compare-At ($)"
              value={compareAt}
              onChange={(e) => setCompareAt(Math.max(0, Number(e.target.value)))}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Option 1 Name"
              value={option1Name}
              onChange={(e) => setOption1Name(e.target.value)}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              label="Option 1 Values (CSV)"
              value={option1Values}
              onChange={(e) => setOption1Values(e.target.value)}
              sx={{ flex: '2 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Option 2 Name"
              value={option2Name}
              onChange={(e) => setOption2Name(e.target.value)}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              label="Option 2 Values (CSV)"
              value={option2Values}
              onChange={(e) => setOption2Values(e.target.value)}
              sx={{ flex: '2 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>
          <TextField
            size="small"
            multiline
            minRows={4}
            fullWidth
            label="Etsy Description (converts bullets to Shopify bodyHtml)"
            value={etsyDescription}
            onChange={(e) => setEtsyDescription(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.77rem', lineHeight: 1.5 } }}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="SHOPIFY VS ETSY FEE PARAMETERS"
        title="Plan Margin Simulator Controls"
        subtitle="Adjust COGS, buyer shipping, and monthly order volume to compare Basic / Grow / Advanced against Etsy"
        accent={SOV.gold}
        right={<CompareArrowsIcon sx={{ color: isDark ? SOV.gold : '#B8860B' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.75 }}>
          <TextField
            size="small"
            type="number"
            label="Unit POD COGS ($)"
            value={cogs}
            onChange={(e) => setCogs(Math.max(0, Number(e.target.value)))}
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
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              MONTHLY ORDER VOLUME (FOR PLAN BREAK-EVEN)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: accent }}>
              {monthlyOrders} orders / mo
            </Typography>
          </Box>
          <Slider
            value={monthlyOrders}
            min={10}
            max={1000}
            step={10}
            onChange={(_, v) => setMonthlyOrders(Number(v))}
            aria-label="Monthly Order Volume"
            sx={{ color: accent }}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="TRANSPILER OUTPUT · SHOPIFY-NATIVE FIELDS"
        title="SEO Fields, Variant SKUs & Bulk CSV"
        subtitle="Strict Shopify limits: <=70-char SEO title, <=160-char meta description, clean handle slug, and deduplicated tags"
        accent={ACCENT_RAW}
      >
        <SovereignKeyValueGrid
          cols={2}
          accent={ACCENT_RAW}
          items={[
            { label: 'Handle Slug', value: transpiled.handle, badge: `${transpiled.handle.length} chars` },
            {
              label: 'SEO Title (<=70)',
              value: transpiled.seoTitle,
              badge: `${transpiled.seoTitle.length}/${SEO_TITLE_MAX}`,
            },
            {
              label: 'Meta Description (<=160)',
              value: transpiled.metaDescription,
              badge: `${transpiled.metaDescription.length}/${META_DESC_MAX}`,
            },
            {
              label: 'Normalized Tags',
              value: transpiled.cleanTags.join(', '),
              badge: `${transpiled.cleanTags.length} tags`,
            },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        <SovereignDataTable
          eyebrow="GENERATED VARIANT MATRIX"
          title="Deterministic Variant SKUs"
          filename={`${transpiled.handle}-variants.csv`}
          accent={ACCENT_RAW}
          maxHeight={220}
          columns={[
            { key: 'sku', label: 'SKU', mono: true },
            { key: 'option1', label: option1Name || 'Option 1' },
            { key: 'option2', label: option2Name || 'Option 2' },
            { key: 'price', label: 'Price', mono: true, align: 'right' },
            { key: 'compareAt', label: 'Compare At', mono: true, align: 'right' },
            { key: 'status', label: 'State' },
          ]}
          rows={transpiled.variants}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2, mb: 1.25 }}>
          {[
            { id: 'variables', label: 'GraphQL Variables JSON' },
            { id: 'csv', label: 'Shopify Bulk CSV' },
            { id: 'html', label: 'bodyHtml Markup' },
          ].map((t) => {
            const active = outputTab === t.id;
            return (
              <Chip
                key={t.id}
                label={t.label}
                clickable
                onClick={() => setOutputTab(t.id)}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={
            outputTab === 'variables'
              ? `${transpiled.handle}-variables.json`
              : outputTab === 'csv'
              ? `${transpiled.handle}-shopify-import.csv`
              : `${transpiled.handle}-body.html`
          }
          badge={outputTab.toUpperCase()}
          code={
            outputTab === 'variables'
              ? JSON.stringify(transpiled.graphqlVariables, null, 2)
              : outputTab === 'csv'
              ? transpiled.bulkCsv
              : transpiled.bodyHtml
          }
          filename={
            outputTab === 'variables'
              ? `${transpiled.handle}-variables.json`
              : outputTab === 'csv'
              ? `${transpiled.handle}-shopify-import.csv`
              : `${transpiled.handle}-body.html`
          }
          accent={ACCENT_RAW}
          maxHeight={240}
        />
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow={`SHOPIFY GRAPHQL ADMIN API WORKBENCH (${SHOPIFY_API_VERSION})`}
        title="Query & Mutation Generator (curl + Node fetch)"
        subtitle="Zero live tokens required — generate production-ready 2025-01 Admin GraphQL operations hydrated from your listing"
        accent={SOV.cyber}
        right={<CodeIcon sx={{ color: isDark ? SOV.cyber : '#0369A1' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {GRAPHQL_OPS.map((op) => {
            const active = activeOp === op.id;
            return (
              <Chip
                key={op.id}
                label={`${op.label} · ${op.badge}`}
                clickable
                onClick={() => setActiveOp(op.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                  color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.primary',
                  border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            label="Shop Domain"
            value={storeDomain}
            onChange={(e) => setStoreDomain(e.target.value)}
            sx={{ flex: '1 1 200px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          {activeOp === 'productUpdate' && (
            <TextField
              size="small"
              label="Product GID"
              value={productGid}
              onChange={(e) => setProductGid(e.target.value)}
              sx={{ flex: '1 1 240px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
          )}
          {activeOp === 'inventorySetQuantities' && (
            <>
              <TextField
                size="small"
                label="InventoryItem GID"
                value={inventoryItemGid}
                onChange={(e) => setInventoryItemGid(e.target.value)}
                sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.74rem' } }}
              />
              <TextField
                size="small"
                label="Location GID"
                value={locationGid}
                onChange={(e) => setLocationGid(e.target.value)}
                sx={{ flex: '1 1 200px', '& input': { fontFamily: MONO, fontSize: '0.74rem' } }}
              />
              <TextField
                size="small"
                type="number"
                label="Available Qty"
                value={inventoryQty}
                onChange={(e) => setInventoryQty(Math.max(0, Number(e.target.value)))}
                sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
              />
            </>
          )}
          {activeOp === 'productsSearch' && (
            <TextField
              size="small"
              label="GraphQL Search Filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          {[
            { id: 'graphql', label: 'GraphQL Document' },
            { id: 'curl', label: 'curl Snippet' },
            { id: 'node', label: 'Node fetch()' },
          ].map((tab) => {
            const active = snippetTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setSnippetTab(tab.id)}
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

        <SovereignCodeBlock
          title={
            snippetTab === 'graphql'
              ? `${activeOp}-${SHOPIFY_API_VERSION}.graphql`
              : snippetTab === 'curl'
              ? `${activeOp}.sh`
              : `${activeOp}.mjs`
          }
          badge={snippetTab.toUpperCase()}
          code={
            snippetTab === 'graphql'
              ? `${graphqlBundle.query}\n\n# Variables\n${JSON.stringify(graphqlBundle.variables, null, 2)}`
              : snippetTab === 'curl'
              ? graphqlBundle.curlSnippet
              : graphqlBundle.nodeSnippet
          }
          filename={
            snippetTab === 'graphql'
              ? `${activeOp}.graphql`
              : snippetTab === 'curl'
              ? `${activeOp}.sh`
              : `${activeOp}.mjs`
          }
          accent={SOV.cyber}
          maxHeight={260}
        />
      </SovereignCard>
    </Box>
  );

  const bottomPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow="SHOPIFY PLANS VS ETSY 2026 ECONOMICS"
        title={`Side-by-Side Margin Simulator ($${feeComparison.rev.toFixed(2)} Order · $${Number(cogs).toFixed(2)} COGS · ${monthlyOrders} Orders/Mo)`}
        filename="shopify-vs-etsy-margins.csv"
        accent={SOV.gold}
        maxHeight={340}
        columns={[
          { key: 'channel', label: 'Channel / Plan' },
          { key: 'formula', label: 'Fee Schedule', mono: true },
          { key: 'fee', label: 'Fee / Order', mono: true, align: 'right' },
          { key: 'netProfit', label: 'Net / Order', mono: true, align: 'right' },
          { key: 'netMargin', label: 'Net Margin', mono: true, align: 'right' },
          { key: 'deltaOrder', label: 'vs Etsy Org', mono: true, align: 'right' },
          { key: 'monthlyNet', label: `Mo Net (${monthlyOrders})`, mono: true, align: 'right' },
          { key: 'status', label: 'Health' },
        ]}
        rows={feeComparison.rows}
      />

      <SovereignCard
        index="05"
        eyebrow="LOCAL CLI & MCP DAEMON (:8113)"
        title="Shopify Connector Local Execution"
        subtitle="Run live GraphQL mutations against your store locally without ever pasting Admin API tokens into a browser"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="SHOPIFY-CONNECTOR LOCAL CLI (:8113)"
          badge="LOCAL TOKEN"
          code={`# Check local Shopify connector & MCP tool registration\nshopify-connector status\n\n# Launch loopback workbench on http://127.0.0.1:8113 (reads ~/.config/zothos/shopify.env)\ncd ~/NullAITech/shopify-connector && python3 server.py --port 8113`}
          filename="shopify-connector.sh"
          accent={ACCENT_RAW}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · Zero-Token Browser Transpiler + Local Admin API Bridge (:8113)"
          message="Etsy-to-Shopify transpilation, Bulk CSV generation, GraphQL Admin API 2025-01 snippet synthesis, and Shopify vs Etsy margin comparisons run 100% client-side with zero outbound requests. Keep SHOPIFY_ADMIN_TOKEN strictly on localhost when running shopify-connector (:8113)."
        />
      </Box>
      <SovereignWorkstationShell
        id="shopify-connector"
        category="COMMERCE & MCP · SHOPIFY ADMIN API (:8113)"
        title="Shopify Connector & Etsy Transpiler"
        subtitle="Deterministic Etsy-to-Shopify listing transpiler (handle, SEO title/meta, SKUs, Bulk CSV), interactive GraphQL Admin API 2025-01 workbench, and Basic / Grow / Advanced vs Etsy margin simulator."
        version="2.5.0"
        variant="scanline-grid"
        accent={ACCENT_RAW}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        bottomPane={bottomPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
