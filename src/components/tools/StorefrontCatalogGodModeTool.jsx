import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Slider,
  LinearProgress,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  downloadText,
  toCsv,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.gold;
const STORAGE_KEY = 'zoth_storefront_catalog_v2_5_skus';
const TITLE_MAX = 140;
const TARGET_TAGS = 13;
const TAG_CHAR_MAX = 20;

const CATEGORIES = [
  'Wall Art',
  'Heavyweight Apparel',
  'Ceramic Mugs',
  'Canvas Prints',
  'Tote Bags',
  'Journals',
  'Greeting Cards',
  'Framed Typography',
  'Garden Flags',
  'Coaster Sets',
];

const INITIAL_SKUS = [
  {
    id: 'yds-01-wall-art',
    sku: 'YDS-WA-01',
    category: 'Wall Art',
    title: 'English Countryside Botanical Wall Art Print Set, Vintage Wildflower Gallery Poster, Cottagecore Living Room Decor',
    retailPrice: 36.0,
    podCogs: 11.8,
    provider: 'Gelato',
    blueprint: '200gsm FSC Matte Archival Poster 18x24',
    status: 'Published',
    tags: [
      'botanical wall art',
      'vintage flower art',
      'wildflower poster',
      'cottagecore decor',
      'gallery wall print',
      'farmhouse wall art',
      'living room poster',
      'countryside print',
      'meadow flower art',
      'linen texture art',
      'housewarming gift',
      'garden lover decor',
      'archival art print',
    ],
  },
  {
    id: 'yds-02-apparel',
    sku: 'YDS-AP-02',
    category: 'Heavyweight Apparel',
    title: 'Grandma Garden Sweatshirt Custom Wildflower Crewneck, Heavyweight Garment Dyed Botanical Pullover, Gardener Gift',
    retailPrice: 42.99,
    podCogs: 18.4,
    provider: 'Printify',
    blueprint: 'Comfort Colors 1566 Heavyweight Crewneck',
    status: 'Published',
    tags: [
      'grandma sweatshirt',
      'wildflower sweater',
      'gardener gift idea',
      'grandmas garden',
      'grandma crewneck',
      'cottagecore shirt',
      'heavyweight fleece',
      'plant lover gift',
      'botanical crewneck',
      'mothers day gift',
      'garment dyed top',
      'gift for grandma',
      'floral pullover',
    ],
  },
  {
    id: 'yds-03-mugs',
    sku: 'YDS-MG-03',
    category: 'Ceramic Mugs',
    title: 'Cozy Backyard Songbirds Coffee Mug 15oz, Watercolor Cardinal & Chickadee Tea Cup, Bird Watcher Ceramic Gift',
    retailPrice: 24.99,
    podCogs: 8.95,
    provider: 'Printify',
    blueprint: 'ORCA Coated Ceramic Mug 15oz',
    status: 'Published',
    tags: [
      'bird watcher gift',
      'watercolor bird mug',
      'cottagecore mug',
      'coffee mug 15oz',
      'cardinal tea cup',
      'backyard birds mug',
      'grandma coffee mug',
      'garden lover gift',
      'ceramic coffee cup',
      'nature tea lover',
      'bird lover present',
      'songbird drinkware',
      'cozy morning mug',
    ],
  },
  {
    id: 'yds-04-canvas',
    sku: 'YDS-CV-04',
    category: 'Canvas Prints',
    title: 'French Lavender Meadow Stretched Canvas Print 16x20, Vintage Botanical Oil Painting Texture, Farmhouse Bedroom Art',
    retailPrice: 64.0,
    podCogs: 23.5,
    provider: 'Gelato',
    blueprint: 'Gallery-Wrapped Pine Stretched Canvas 16x20',
    status: 'Published',
    tags: [
      'lavender canvas art',
      'stretched canvas',
      'french country art',
      'botanical painting',
      'farmhouse canvas',
      'bedroom wall art',
      'vintage floral art',
      'gallery wrap print',
      'provence decor',
      'cottage wall art',
      'purple flower art',
      'ready to hang art',
      'meadow oil print',
    ],
  },
  {
    id: 'yds-05-totes',
    sku: 'YDS-TB-05',
    category: 'Tote Bags',
    title: 'Vintage French Seed Packet Canvas Tote Bag, Heavyweight Cotton Farmers Market Shopper, Botanical Library Book Bag',
    retailPrice: 26.99,
    podCogs: 9.8,
    provider: 'Printify',
    blueprint: '12oz Heavy Cotton Gusseted Market Tote',
    status: 'Published',
    tags: [
      'canvas tote bag',
      'farmers market bag',
      'french seed packet',
      'botanical tote bag',
      'library book tote',
      'gardener gift bag',
      'cottagecore tote',
      'heavy canvas bag',
      'flower market tote',
      'eco shopping bag',
      'vintage floral bag',
      'book club gift',
      'reusable tote bag',
    ],
  },
  {
    id: 'yds-06-journals',
    sku: 'YDS-JN-06',
    category: 'Journals',
    title: 'Heirloom Garden Planner & Hardcover Journal, Pressed Wildflower Linen Notebook, Ruled 150-Page Botanical Diary',
    retailPrice: 28.5,
    podCogs: 10.6,
    provider: 'Printify',
    blueprint: 'Matte Hardcover Ruled Journal 5.75x8',
    status: 'Published',
    tags: [
      'garden journal',
      'hardcover notebook',
      'wildflower diary',
      'botanical planner',
      'gardener notebook',
      'cottagecore diary',
      'lined journal gift',
      'planting log book',
      'floral stationery',
      'pressed flower art',
      'writer gift idea',
      'vintage notebook',
      'gift for mom',
    ],
  },
  {
    id: 'yds-07-cards',
    sku: 'YDS-GC-07',
    category: 'Greeting Cards',
    title: 'Watercolor Woodland Songbirds Greeting Card Set of 10, Blank Botanical Note Cards with Kraft Envelopes, Stationery',
    retailPrice: 19.99,
    podCogs: 6.4,
    provider: 'Gelato',
    blueprint: '300gsm Matte Folded A2 Cards (10-Pack)',
    status: 'Published',
    tags: [
      'botanical cards',
      'blank note cards',
      'bird greeting card',
      'thank you card set',
      'watercolor cards',
      'kraft envelopes',
      'stationery gift',
      'cottagecore cards',
      'floral note set',
      'all occasion card',
      'nature stationery',
      'grandma gift set',
      'illustrated cards',
    ],
  },
  {
    id: 'yds-08-framed',
    sku: 'YDS-FT-08',
    category: 'Framed Typography',
    title: 'Framed Botanical Quote Typography Print in Solid Oak 12x16, Minimalist Editorial Serif Wall Art, Reading Nook Decor',
    retailPrice: 58.0,
    podCogs: 22.9,
    provider: 'Gelato',
    blueprint: 'Solid Oak Framed Archival Print 12x16',
    status: 'Draft',
    tags: [
      'framed quote art',
      'oak framed print',
      'typography wall art',
      'reading nook decor',
      'editorial serif',
      'book lover art',
      'minimalist frame',
      'literary wall art',
      'study room poster',
      'cottagecore quote',
      'wooden frame print',
      'warm neutral decor',
      'gift for readers',
    ],
  },
  {
    id: 'yds-09-flags',
    sku: 'YDS-GF-09',
    category: 'Garden Flags',
    title: 'Welcome To Grandma Garden Flag 12x18 Double Sided, Wildflower Cottage Porch Banner, Outdoor Weatherproof Yard Decor',
    retailPrice: 24.5,
    podCogs: 8.75,
    provider: 'Printify',
    blueprint: '12x18 Poly-Linen Double-Sided Garden Flag',
    status: 'Published',
    tags: [
      'garden flag 12x18',
      'double sided flag',
      'grandma yard flag',
      'wildflower banner',
      'porch welcome flag',
      'cottagecore yard',
      'outdoor porch art',
      'spring garden flag',
      'flower yard decor',
      'housewarming flag',
      'farmhouse garden',
      'lawn flag gift',
      'botanical banner',
    ],
  },
  {
    id: 'yds-10-coasters',
    sku: 'YDS-CS-10',
    category: 'Coaster Sets',
    title: 'Pressed Botanical Herb Stone Coaster Set of 4, Cork-Backed Ceramic Tea Coasters, Cottagecore Coffee Table Gift',
    retailPrice: 27.99,
    podCogs: 10.4,
    provider: 'Printify',
    blueprint: 'Cork-Backed Gloss Ceramic Coasters (Set of 4)',
    status: 'Draft',
    tags: [
      'ceramic coaster set',
      'botanical coasters',
      'cork back coasters',
      'tea table coasters',
      'herb drink coaster',
      'housewarming gift',
      'cottagecore home',
      'coffee table decor',
      'floral coaster set',
      'hostess gift idea',
      'vintage kitchen',
      'stone drinkware',
      'set of 4 coasters',
    ],
  },
];

function fmtUsd(val) {
  const n = Number(val) || 0;
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`;
}

function toShopifyHandle(title) {
  return (
    String(title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, 7)
      .join('-')
      .slice(0, 60) || 'product'
  );
}

function evaluateSku(sku) {
  const retail = Math.max(0, Number(sku.retailPrice) || 0);
  const cogs = Math.max(0, Number(sku.podCogs) || 0);
  // Standard 2026 Etsy Organic fee schedule: $0.20 listing + 6.5% txn + 3% + $0.25 payment
  const etsyFees = retail > 0 ? 0.2 + retail * 0.065 + (retail * 0.03 + 0.25) : 0;
  const netProfit = retail - etsyFees - cogs;
  const netMarginPct = retail > 0 ? (netProfit / retail) * 100 : 0;

  const tags = Array.isArray(sku.tags) ? sku.tags : [];
  const seen = new Set();
  const tagAnalysis = tags.map((t, idx) => {
    const clean = String(t || '').trim();
    const low = clean.toLowerCase();
    const isDuplicate = seen.has(low);
    seen.add(low);
    const over20 = clean.length > TAG_CHAR_MAX;
    const overflowSlot = idx >= TARGET_TAGS;
    return {
      text: clean,
      len: clean.length,
      over20,
      isDuplicate,
      overflowSlot,
      valid: Boolean(clean) && !over20 && !isDuplicate && !overflowSlot,
    };
  });

  const invalidTagCount = tagAnalysis.filter((t) => !t.valid).length;
  const tagsReady = tags.length === TARGET_TAGS && invalidTagCount === 0;
  const titleLen = String(sku.title || '').trim().length;
  const titleReady = titleLen >= 40 && titleLen <= TITLE_MAX;

  return {
    ...sku,
    retail,
    cogs,
    etsyFees,
    netProfit,
    netMarginPct,
    tagAnalysis,
    invalidTagCount,
    tagsReady,
    titleLen,
    titleReady,
  };
}

export default function StorefrontCatalogGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [skus, setSkus] = useState(INITIAL_SKUS);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState(INITIAL_SKUS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minMarginFilter, setMinMarginFilter] = useState(0);
  const [newTagInput, setNewTagInput] = useState('');

  // SSR-safe localStorage hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkus(parsed);
          setSelectedId(parsed[0].id);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(skus));
    } catch {
      /* ignore quota errors */
    }
  }, [skus, hydrated]);

  const evaluatedSkus = useMemo(() => skus.map(evaluateSku), [skus]);

  const filteredSkus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedSkus.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (item.netMarginPct < minMarginFilter) return false;
      if (!q) return true;
      const haystack = `${item.sku} ${item.title} ${item.category} ${item.provider} ${item.blueprint} ${item.tags.join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [evaluatedSkus, searchQuery, categoryFilter, statusFilter, minMarginFilter]);

  const selectedSku = useMemo(
    () => evaluatedSkus.find((s) => s.id === selectedId) || evaluatedSkus[0],
    [evaluatedSkus, selectedId],
  );

  const portfolio = useMemo(() => {
    const totalRetail = evaluatedSkus.reduce((sum, s) => sum + s.retail, 0);
    const totalCogs = evaluatedSkus.reduce((sum, s) => sum + s.cogs, 0);
    const totalFees = evaluatedSkus.reduce((sum, s) => sum + s.etsyFees, 0);
    const totalNetProfit = evaluatedSkus.reduce((sum, s) => sum + s.netProfit, 0);
    const blendedMarginPct = totalRetail > 0 ? (totalNetProfit / totalRetail) * 100 : 0;
    const avgProfitPerOrder = evaluatedSkus.length > 0 ? totalNetProfit / evaluatedSkus.length : 0;
    const publishedCount = evaluatedSkus.filter((s) => s.status === 'Published').length;
    const draftCount = evaluatedSkus.length - publishedCount;
    const readyTagSkus = evaluatedSkus.filter((s) => s.tagsReady).length;
    const tagReadinessPct =
      evaluatedSkus.length > 0 ? Math.round((readyTagSkus / evaluatedSkus.length) * 100) : 0;
    const totalValidTags = evaluatedSkus.reduce(
      (sum, s) => sum + s.tagAnalysis.filter((t) => t.valid).length,
      0,
    );
    const maxPossibleTags = evaluatedSkus.length * TARGET_TAGS;

    return {
      totalRetail,
      totalCogs,
      totalFees,
      totalNetProfit,
      blendedMarginPct,
      avgProfitPerOrder,
      publishedCount,
      draftCount,
      readyTagSkus,
      tagReadinessPct,
      totalValidTags,
      maxPossibleTags,
    };
  }, [evaluatedSkus]);

  const updateSelected = (patch) => {
    if (!selectedSku) return;
    setSkus((prev) =>
      prev.map((item) => (item.id === selectedSku.id ? { ...item, ...patch } : item)),
    );
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim().toLowerCase();
    if (!clean || !selectedSku) return;
    updateSelected({ tags: [...selectedSku.tags, clean] });
    setNewTagInput('');
  };

  const handleRemoveTag = (idx) => {
    if (!selectedSku) return;
    updateSelected({ tags: selectedSku.tags.filter((_, i) => i !== idx) });
  };

  const handleAutoSanitizeTags = () => {
    if (!selectedSku) return;
    const seen = new Set();
    const cleaned = [];
    selectedSku.tags.forEach((raw) => {
      let t = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!t) return;
      if (t.length > TAG_CHAR_MAX) {
        t = t.slice(0, TAG_CHAR_MAX).replace(/\s+\S*$/, '').trim() || t.slice(0, TAG_CHAR_MAX);
      }
      if (!seen.has(t) && cleaned.length < TARGET_TAGS) {
        seen.add(t);
        cleaned.push(t);
      }
    });
    updateSelected({ tags: cleaned });
  };

  const handleResetCatalog = () => {
    setSkus(INITIAL_SKUS);
    setSelectedId(INITIAL_SKUS[0].id);
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setMinMarginFilter(0);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  };

  const exportPayload = useMemo(
    () => ({
      storeName: 'YourDigitalSpace',
      tool: 'storefront-catalog',
      version: '2.5.0',
      portfolioSummary: {
        totalSkus: evaluatedSkus.length,
        publishedSkus: portfolio.publishedCount,
        draftSkus: portfolio.draftCount,
        combinedRetailUsd: Number(portfolio.totalRetail.toFixed(2)),
        combinedCogsUsd: Number(portfolio.totalCogs.toFixed(2)),
        combinedEtsyFeesUsd: Number(portfolio.totalFees.toFixed(2)),
        combinedNetProfitUsd: Number(portfolio.totalNetProfit.toFixed(2)),
        blendedNetMarginPct: Number(portfolio.blendedMarginPct.toFixed(2)),
        avgProfitPerOrderUsd: Number(portfolio.avgProfitPerOrder.toFixed(2)),
        tagReadinessPct: portfolio.tagReadinessPct,
      },
      products: evaluatedSkus.map((s) => ({
        id: s.id,
        sku: s.sku,
        handle: toShopifyHandle(s.title),
        title: s.title,
        category: s.category,
        status: s.status,
        provider: s.provider,
        blueprint: s.blueprint,
        retailPriceUsd: Number(s.retail.toFixed(2)),
        podCogsUsd: Number(s.cogs.toFixed(2)),
        etsyFeesUsd: Number(s.etsyFees.toFixed(2)),
        netProfitUsd: Number(s.netProfit.toFixed(2)),
        netMarginPct: Number(s.netMarginPct.toFixed(2)),
        tagsCount: s.tags.length,
        tagsAllUnder20Chars: s.tagsReady,
        tags: s.tags,
      })),
    }),
    [evaluatedSkus, portfolio],
  );

  const exportCsvText = useMemo(
    () =>
      toCsv(
        evaluatedSkus.map((s) => ({
          SKU: s.sku,
          Handle: toShopifyHandle(s.title),
          Title: s.title,
          Category: s.category,
          Status: s.status,
          Provider: s.provider,
          Blueprint: s.blueprint,
          'Retail Price (USD)': s.retail.toFixed(2),
          'POD COGS (USD)': s.cogs.toFixed(2),
          'Etsy Fees (USD)': s.etsyFees.toFixed(2),
          'Net Profit (USD)': s.netProfit.toFixed(2),
          'Net Margin (%)': s.netMarginPct.toFixed(1),
          'Tag Count': s.tags.length,
          'Tags <=20 Valid': s.tagsReady ? 'PASS' : 'NEEDS_FIX',
          Tags: s.tags.join(', '),
        })),
      ),
    [evaluatedSkus],
  );

  const kpis = [
    {
      label: 'Blended Net Margin',
      value: `${portfolio.blendedMarginPct.toFixed(1)}%`,
      unit: `${evaluatedSkus.length} SKUs`,
      status: portfolio.blendedMarginPct >= 45 ? 'HIGH MARGIN' : 'WATCH',
      accent: SOV.emerald,
    },
    {
      label: 'Avg Profit / Order',
      value: fmtUsd(portfolio.avgProfitPerOrder),
      unit: 'Etsy Net',
      status: `Basket ${fmtUsd(portfolio.totalNetProfit)}`,
      accent: SOV.gold,
    },
    {
      label: 'Catalog Status',
      value: `${portfolio.publishedCount} / ${evaluatedSkus.length}`,
      unit: 'Published',
      status: `${portfolio.draftCount} Draft`,
      accent: SOV.cyber,
    },
    {
      label: '13/13 Tag Readiness',
      value: `${portfolio.tagReadinessPct}%`,
      unit: `${portfolio.totalValidTags}/${portfolio.maxPossibleTags}`,
      status: portfolio.tagReadinessPct === 100 ? 'ALL <=20 CHARS' : 'FIX TAGS',
      accent: portfolio.tagReadinessPct === 100 ? SOV.emerald : SOV.amber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
      <SovereignStatusPill
        label="STOREFRONT"
        status="YOURDIGITALSPACE"
        accent={SOV.gold}
        pulse
      />
      <SovereignStatusPill
        label="STORAGE"
        status="LOCALSTORAGE SYNC"
        accent={SOV.emerald}
      />
      <SovereignStatusPill
        label="DAEMON"
        status="127.0.0.1:8143"
        accent={SOV.cyber}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download storefront-catalog.csv',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(exportCsvText, 'storefront-catalog.csv', 'text/csv;charset=utf-8'),
      primary: true,
    },
    {
      label: 'Download storefront-catalog.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(exportPayload, 'storefront-catalog.json'),
    },
    {
      label: copied === 'catalog' ? 'Copied Catalog JSON' : 'Copy Catalog JSON',
      icon: copied === 'catalog' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(JSON.stringify(exportPayload, null, 2), 'catalog'),
    },
    {
      label: 'Reset 10-SKU Defaults',
      icon: <RestartAltIcon fontSize="small" />,
      onClick: handleResetCatalog,
    },
    {
      label: 'storefront-catalog on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/storefront-catalog',
    },
  ];

  const cliSnippet = `# Launch YourDigitalSpace local catalog workstation & REST API (port 8143)
cd ~/NullAITech/storefront-catalog && python3 server.py --port 8143

# Inspect CLI status & JSON summary
storefront-catalog --status
storefront-catalog --json

# Query local catalog endpoints
curl -s http://127.0.0.1:8143/health
curl -s http://127.0.0.1:8143/api/products`;

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="YOURDIGITALSPACE 10-SKU POD PORTFOLIO"
        title="Catalog Search, Filter & SKU Selector"
        subtitle="Filter by category, publish status, or minimum net margin %, then click any SKU row to open it in the live editor"
        accent={ACCENT_RAW}
        right={<StorefrontIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, title, provider, or tag..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 220px' }}
          />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {['All', 'Published', 'Draft'].map((st) => {
              const active = statusFilter === st;
              return (
                <Chip
                  key={st}
                  label={st}
                  clickable
                  onClick={() => setStatusFilter(st)}
                  sx={{
                    minHeight: 38,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? rgba(ACCENT_RAW, 0.16) : 'transparent',
                    color: active ? accent : 'text.primary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Category Filter Strip */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 1.5 }}>
          {['All', ...CATEGORIES].map((cat) => {
            const active = categoryFilter === cat;
            return (
              <Chip
                key={cat}
                size="small"
                label={cat}
                clickable
                onClick={() => setCategoryFilter(cat)}
                sx={{
                  minHeight: 30,
                  fontFamily: MONO,
                  fontSize: '0.66rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.emerald, 0.15) : 'transparent',
                  color: active ? resolveModeAccent(SOV.emerald, isDark) : 'text.secondary',
                  border: `1px solid ${active ? resolveModeAccent(SOV.emerald, isDark) : 'rgba(148,163,184,0.28)'}`,
                }}
              />
            );
          })}
        </Box>

        {/* Minimum Net Margin Filter */}
        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
              MINIMUM NET MARGIN FILTER
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: accent }}>
              &gt;= {minMarginFilter}% ({filteredSkus.length} / {evaluatedSkus.length} SKUs)
            </Typography>
          </Box>
          <Slider
            value={minMarginFilter}
            min={0}
            max={70}
            step={5}
            onChange={(_, v) => setMinMarginFilter(Number(v))}
            aria-label="Minimum Net Margin Filter"
            sx={{ color: accent }}
          />
        </Box>

        <TableContainer
          sx={{
            maxHeight: 460,
            borderRadius: 1.5,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(16,24,40,0.1)'}`,
            overflowX: 'auto',
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['SKU / Product', 'Retail', 'COGS', 'Margin', 'Tags', 'Status'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i >= 1 && i <= 3 ? 'right' : 'left'}
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      bgcolor: isDark ? '#0B0F1A' : '#F6F3EC',
                      color: accent,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSkus.map((item) => {
                const isSelected = selectedSku && item.id === selectedSku.id;
                const marginColor = resolveModeAccent(
                  item.netMarginPct < 15 ? SOV.crimson : item.netMarginPct < 35 ? SOV.amber : SOV.emerald,
                  isDark,
                );
                return (
                  <TableRow
                    key={item.id}
                    hover
                    selected={isSelected}
                    onClick={() => setSelectedId(item.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? isDark
                          ? rgba(ACCENT_RAW, 0.12)
                          : rgba(ACCENT_RAW, 0.1)
                        : 'transparent',
                    }}
                  >
                    <TableCell sx={{ minWidth: 185 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', fontWeight: 800, color: accent }}>
                        {item.sku} · {item.category}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {fmtUsd(item.retail)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.74rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {fmtUsd(item.cogs)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: marginColor, whiteSpace: 'nowrap' }}>
                      {item.netMarginPct.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size="small"
                        label={`${item.tags.length}/${TARGET_TAGS}`}
                        sx={{
                          height: 20,
                          fontFamily: MONO,
                          fontSize: '0.63rem',
                          fontWeight: 700,
                          bgcolor: rgba(item.tagsReady ? SOV.emerald : SOV.amber, 0.14),
                          color: resolveModeAccent(item.tagsReady ? SOV.emerald : SOV.amber, isDark),
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size="small"
                        label={item.status}
                        sx={{
                          height: 20,
                          fontFamily: MONO,
                          fontSize: '0.63rem',
                          fontWeight: 700,
                          bgcolor: rgba(item.status === 'Published' ? SOV.emerald : SOV.slate, 0.14),
                          color:
                            item.status === 'Published'
                              ? resolveModeAccent(SOV.emerald, isDark)
                              : isDark
                                ? SOV.slate
                                : '#475467',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredSkus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, fontFamily: MONO, fontSize: '0.76rem' }}>
                    No SKUs match the active filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="PORTFOLIO TAG & MARGIN TELEMETRY"
        title="13/13 Tag Readiness & Basket Summary"
        subtitle="Live portfolio-wide compliance gauge validating every SKU carries 13 unique Etsy tags at <= 20 characters"
        accent={SOV.emerald}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <SovereignGauge
            value={portfolio.tagReadinessPct}
            max={100}
            label="TAG READINESS"
            unit="%"
            status={`${portfolio.readyTagSkus}/${evaluatedSkus.length} SKUS`}
            thresholds={{ warn: 80, danger: 60 }}
            invertThresholds
            size={140}
          />
          <Box sx={{ flex: '1 1 220px' }}>
            <SovereignKeyValueGrid
              cols={2}
              accent={SOV.emerald}
              items={[
                { label: 'Basket Retail', value: fmtUsd(portfolio.totalRetail), badge: `${evaluatedSkus.length} items` },
                { label: 'Total POD COGS', value: fmtUsd(portfolio.totalCogs), badge: 'Fulfillment' },
                { label: 'Est. Etsy Fees', value: fmtUsd(portfolio.totalFees), badge: '2026 Rate' },
                { label: 'Net Basket Profit', value: fmtUsd(portfolio.totalNetProfit), badge: `${portfolio.blendedMarginPct.toFixed(1)}%` },
              ]}
            />
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = selectedSku ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow={`LIVE SKU INSPECTOR · ${selectedSku.sku}`}
        title={selectedSku.category}
        subtitle={`${selectedSku.provider} · ${selectedSku.blueprint} · Changes auto-save to browser localStorage`}
        accent={ACCENT_RAW}
        right={
          <Chip
            size="small"
            clickable
            onClick={() =>
              updateSelected({
                status: selectedSku.status === 'Published' ? 'Draft' : 'Published',
              })
            }
            icon={
              selectedSku.status === 'Published' ? (
                <CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: '14px !important' }} />
              )
            }
            label={`Status: ${selectedSku.status} (Click to Toggle)`}
            sx={{
              minHeight: 34,
              fontFamily: MONO,
              fontSize: '0.69rem',
              fontWeight: 700,
              bgcolor: rgba(selectedSku.status === 'Published' ? SOV.emerald : SOV.amber, 0.14),
              color: resolveModeAccent(selectedSku.status === 'Published' ? SOV.emerald : SOV.amber, isDark),
              border: `1px solid ${rgba(resolveModeAccent(selectedSku.status === 'Published' ? SOV.emerald : SOV.amber, isDark), 0.4)}`,
            }}
          />
        }
      >
        {/* Title Editor */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              PRODUCT TITLE (ETSY MAX {TITLE_MAX} CHARS)
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: selectedSku.titleLen > TITLE_MAX ? SOV.crimson : SOV.emerald,
              }}
            >
              {selectedSku.titleLen} / {TITLE_MAX}
            </Typography>
          </Box>
          <TextField
            multiline
            minRows={2}
            fullWidth
            size="small"
            error={selectedSku.titleLen > TITLE_MAX}
            value={selectedSku.title}
            onChange={(e) => updateSelected({ title: e.target.value })}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.5 } }}
          />
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (selectedSku.titleLen / TITLE_MAX) * 100)}
            sx={{
              mt: 0.75,
              height: 5,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: selectedSku.titleLen > TITLE_MAX ? SOV.crimson : SOV.emerald,
              },
            }}
          />
        </Box>

        {/* Pricing & Metadata Inputs */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
          <TextField
            size="small"
            select
            label="Category"
            value={selectedSku.category}
            onChange={(e) => updateSelected({ category: e.target.value })}
            sx={{ flex: '1 1 160px' }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Fulfillment"
            value={selectedSku.provider}
            onChange={(e) => updateSelected({ provider: e.target.value })}
            sx={{ flex: '1 1 120px' }}
          >
            {['Printify', 'Gelato'].map((prov) => (
              <MenuItem key={prov} value={prov}>
                {prov}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            label="Retail Price ($)"
            value={selectedSku.retailPrice}
            onChange={(e) => updateSelected({ retailPrice: Math.max(0, Number(e.target.value)) })}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="POD COGS ($)"
            value={selectedSku.podCogs}
            onChange={(e) => updateSelected({ podCogs: Math.max(0, Number(e.target.value)) })}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <SovereignKeyValueGrid
          cols={3}
          accent={selectedSku.netMarginPct < 15 ? SOV.crimson : SOV.emerald}
          items={[
            { label: 'Etsy 2026 Fees', value: fmtUsd(selectedSku.etsyFees), badge: '9.5%+$0.45' },
            { label: 'Net Profit / Unit', value: fmtUsd(selectedSku.netProfit), badge: selectedSku.netProfit > 0 ? 'PROFIT' : 'LOSS' },
            { label: 'Net Margin %', value: `${selectedSku.netMarginPct.toFixed(1)}%`, badge: selectedSku.netMarginPct >= 40 ? 'STRONG' : 'CHECK' },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        {/* 13/13 Etsy Tag Validator & Live Editor */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
            13/13 ETSY TAG ARRAY (STRICT &lt;= 20 CHARS PER TAG)
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: selectedSku.tagsReady ? resolveModeAccent(SOV.emerald, isDark) : resolveModeAccent(SOV.amber, isDark),
            }}
          >
            {selectedSku.tags.length} / {TARGET_TAGS} TAGS · {selectedSku.invalidTagCount === 0 ? 'ALL VALID' : `${selectedSku.invalidTagCount} ISSUE(S)`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {selectedSku.tagAnalysis.map((tag, idx) => {
            const chipCol = tag.valid ? SOV.emerald : tag.over20 || tag.overflowSlot ? SOV.crimson : SOV.amber;
            const modeChipCol = resolveModeAccent(chipCol, isDark);
            return (
              <Chip
                key={`${tag.text}-${idx}`}
                size="small"
                icon={<LocalOfferIcon sx={{ fontSize: '13px !important', color: `${modeChipCol} !important` }} />}
                label={`${tag.text} (${tag.len}/${TAG_CHAR_MAX})`}
                onDelete={() => handleRemoveTag(idx)}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: rgba(chipCol, isDark ? 0.14 : 0.1),
                  color: isDark ? '#F5F1E6' : '#101828',
                  border: `1px solid ${rgba(modeChipCol, 0.45)}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1.25 }}>
          <TextField
            size="small"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add tag (<= 20 chars) and press Enter..."
            helperText={
              newTagInput.trim().length > TAG_CHAR_MAX
                ? `Over limit by ${newTagInput.trim().length - TAG_CHAR_MAX} chars`
                : `${newTagInput.trim().length}/${TAG_CHAR_MAX} chars`
            }
            error={newTagInput.trim().length > TAG_CHAR_MAX}
            sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon fontSize="small" />}
            onClick={handleAddTag}
            disabled={!newTagInput.trim()}
            sx={{
              minHeight: 44,
              alignSelf: 'flex-start',
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: accent,
              borderColor: rgba(accent, 0.45),
            }}
          >
            Add Tag
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon fontSize="small" />}
            onClick={handleAutoSanitizeTags}
            sx={{
              minHeight: 44,
              alignSelf: 'flex-start',
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: resolveModeAccent(SOV.cyber, isDark),
              borderColor: rgba(resolveModeAccent(SOV.cyber, isDark), 0.45),
            }}
          >
            Dedupe &amp; Cap &lt;=20
          </Button>
        </Box>

        <TextField
          multiline
          minRows={2}
          fullWidth
          size="small"
          label="Bulk Tag Editor (comma-separated)"
          value={selectedSku.tags.join(', ')}
          onChange={(e) =>
            updateSelected({
              tags: e.target.value
                .split(/[,\n]+/)
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 } }}
        />
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="ETSY / SHOPIFY BULK EXPORTER & LOCAL DAEMON (:8143)"
        title="Catalog Export Preview & CLI Reference"
        subtitle="Download the full 10-SKU portfolio as Etsy/Shopify-ready CSV or canonical JSON manifest"
        accent={SOV.cyber}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() => downloadText(exportCsvText, 'storefront-catalog.csv', 'text/csv;charset=utf-8')}
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
            Download storefront-catalog.csv
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() => downloadJson(exportPayload, 'storefront-catalog.json')}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: resolveModeAccent(SOV.emerald, isDark),
              borderColor: rgba(resolveModeAccent(SOV.emerald, isDark), 0.45),
            }}
          >
            Download storefront-catalog.json
          </Button>
        </Box>

        <SovereignCodeBlock
          title="storefront-catalog-cli.sh"
          badge="CLI :8143"
          code={cliSnippet}
          filename="storefront-catalog-cli.sh"
          accent={SOV.cyber}
          maxHeight={220}
        />
      </SovereignCard>
    </Box>
  ) : null;

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · 100% Client-Side 10-SKU POD Catalog Manager & Tag Validator"
          message="All SKU filtering, live price/COGS margin recalculation, 13/13 Etsy tag (<=20 char) validation, localStorage persistence, and CSV/JSON bulk exports execute locally in your browser with zero remote network fetches. Local asset synthesis & REST serving run via storefront-catalog (:8143)."
        />
      </Box>
      <SovereignWorkstationShell
        id="storefront-catalog"
        category="COMMERCE & POD · YOURDIGITALSPACE CATALOG (:8143)"
        title="YourDigitalSpace 10-SKU POD Catalog Workstation"
        subtitle="Manage 10 print-on-demand SKUs across Wall Art, Heavyweight Apparel, Ceramic Mugs, Canvas Prints, Tote Bags, Journals, Greeting Cards, Framed Typography, Garden Flags, and Coaster Sets with live margin telemetry and 13/13 Etsy tag validation."
        version="2.5.0"
        variant="scanline-grid"
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
