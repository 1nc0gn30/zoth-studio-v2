import React, { useState, useMemo, useCallback } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';
import CodeIcon from '@mui/icons-material/Code';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignPresetBar,
  SovereignGauge,
  SovereignDataTable,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = '#E06D3B';
const ETSY_QPS_LIMIT = 10;
const ETSY_QPD_LIMIT = 10000;

const ETSY_OAUTH_SCOPES = [
  { id: 'listings_r', label: 'listings_r', desc: 'Read active & draft shop listings' },
  { id: 'listings_w', label: 'listings_w', desc: 'Create & update draft listings, tags, and images' },
  { id: 'shops_r', label: 'shops_r', desc: 'Read shop profile, sections, and shipping profiles' },
  { id: 'transactions_r', label: 'transactions_r', desc: 'Read completed order line-items & receipts' },
  { id: 'address_r', label: 'address_r', desc: 'Read buyer shipping addresses for POD dispatch' },
];

const REST_ENDPOINTS = [
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

const MCP_TOOLS = [
  {
    id: 'etsy_search_listings',
    label: 'etsy_search_listings',
    badge: 'Search',
    defaultArgs: {
      keywords: 'minimalist terracotta arch wall art printable',
      limit: 25,
      min_price: 6,
      max_price: 25,
    },
  },
  {
    id: 'etsy_audit_listing_seo',
    label: 'etsy_audit_listing_seo',
    badge: '13-Tag SEO',
    defaultArgs: {
      title: 'Minimalist Terracotta Arch Wall Art Print | Japandi Printable Gallery Poster | Neutral Boho Living Room Decor',
      tags: [
        'terracotta wall art',
        'japandi arch print',
        'minimalist poster',
        'printable wall art',
        'neutral boho decor',
        'living room print',
        'modern gallery art',
        'warm earthy print',
        'wabi sabi decor',
        'abstract arch art',
        'digital wall print',
        'scandinavian art',
        'housewarming gift',
      ],
      description: '300 DPI multi-ratio digital wall art pack (2:3, 3:4, 4:5, 11:14, ISO A-Series) ready for home or archival print shop framing.',
    },
  },
  {
    id: 'etsy_calculate_profit_margins',
    label: 'etsy_calculate_profit_margins',
    badge: 'Margins',
    defaultArgs: {
      retail_price: 38.99,
      pod_base_cost: 15.5,
      shipping_charged: 4.99,
      is_offsite_ads: false,
    },
  },
  {
    id: 'etsy_create_draft_listing',
    label: 'etsy_create_draft_listing',
    badge: 'Draft API',
    defaultArgs: {
      shop_id: '42891044',
      title: 'Mid-Century Terracotta Arch Printable Wall Art Set, 300 DPI Multi-Ratio Download',
      description: 'Instant 300 DPI digital download covering 2:3, 3:4, 4:5, 11:14, and ISO A-Series frames.',
      price: 11.99,
      quantity: 999,
      taxonomy_id: 2078,
      who_made: 'i_did',
      when_made: '2020_2025',
      is_digital: true,
      tags: [
        'terracotta wall art',
        'mid century print',
        'printable arch art',
        'japandi wall decor',
        'digital art bundle',
        '300 dpi wall print',
        'boho living room',
        'neutral abstract',
        'modern poster art',
        'minimalist gallery',
        'warm earthy decor',
        'instant download',
        'gift for new home',
      ],
    },
  },
  {
    id: 'etsy_generate_pod_payload',
    label: 'etsy_generate_pod_payload',
    badge: 'Printify POD',
    defaultArgs: {
      blueprint_key: 'comfort_colors_1717',
      print_provider_id: 99,
      title: 'Vintage Botanical Geometry Heavyweight Tee, Garment Dyed Cotton Shirt',
      description: '100% ring-spun US cotton garment-dyed heavyweight tee printed with water-based pigment inks.',
      tags: ['comfort colors tee', 'botanical shirt', 'garment dyed tee', 'minimalist graphic'],
      design_image_url: 'https://assets.example.com/designs/botanical-gold-4500x5400.png',
    },
  },
];

const TAXONOMY_CATALOG = [
  {
    id: 'tax-2078',
    taxonomyId: 2078,
    group: 'Digital Prints',
    category: 'Art & Collectibles > Prints > Digital Prints',
    fulfillment: 'Instant Digital (<=20 MB ZIP)',
    typicalMargin: '88% – 96%',
    notes: 'Primary node for multi-ratio 300 DPI wall art downloads',
  },
  {
    id: 'tax-1027',
    taxonomyId: 1027,
    group: 'Digital Prints',
    category: 'Art & Collectibles > Prints > Giclée & Fine Art',
    fulfillment: 'POD Giclée (Gelato / Printify)',
    typicalMargin: '48% – 60%',
    notes: 'Physical archival posters & framed gallery art',
  },
  {
    id: 'tax-482',
    taxonomyId: 482,
    group: 'Apparel',
    category: 'Clothing > Unisex Adult Clothing > Tops & Tees > T-shirts',
    fulfillment: 'DTG POD (Comfort Colors 1717 / Bella 3001)',
    typicalMargin: '44% – 54%',
    notes: 'High-volume graphic tees; front-load niche in first 40 chars',
  },
  {
    id: 'tax-489',
    taxonomyId: 489,
    group: 'Apparel',
    category: 'Clothing > Unisex Adult Clothing > Hoodies & Sweatshirts',
    fulfillment: 'DTG / Embroidery POD (Gildan 18000 / 18500)',
    typicalMargin: '46% – 55%',
    notes: 'Strong Q4 AOV; verify sleeve/chest placement dimensions',
  },
  {
    id: 'tax-1004',
    taxonomyId: 1004,
    group: 'Mugs',
    category: 'Home & Living > Kitchen & Dining > Drink & Barware > Mugs',
    fulfillment: 'Sublimation POD (11oz / 15oz Ceramic)',
    typicalMargin: '48% – 58%',
    notes: 'Wrap artwork 2475×1155 px @ 300 DPI for 11oz',
  },
  {
    id: 'tax-1246',
    taxonomyId: 1246,
    group: 'Stickers',
    category: 'Paper & Party Supplies > Paper > Stickers, Labels & Tags',
    fulfillment: 'Kiss-Cut Vinyl / Holographic POD',
    typicalMargin: '50% – 64%',
    notes: 'Bundle 5–10 sticker sheets to protect $0.20 + $0.25 fixed fees',
  },
  {
    id: 'tax-1247',
    taxonomyId: 1247,
    group: 'Planners',
    category: 'Paper & Party Supplies > Calendars & Planners > Planners',
    fulfillment: 'Hyperlinked GoodNotes PDF / Printable',
    typicalMargin: '89% – 96%',
    notes: 'Keep hyperlinked PDF under 20 MB Etsy attachment limit',
  },
  {
    id: 'tax-1179',
    taxonomyId: 1179,
    group: 'Jewelry',
    category: 'Jewelry > Necklaces > Pendant & Engraved Necklaces',
    fulfillment: 'ShineOn / Handmade Laser Engraving',
    typicalMargin: '55% – 68%',
    notes: 'Pair with custom message card for higher gift conversion',
  },
];

// RFC 6234 pure-JS SHA-256 so PKCE S256 works synchronously on first paint & on non-TLS hosts
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

function sha256BytesSync(inputStr) {
  const bytes = new TextEncoder().encode(inputStr);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((val, idx) => outView.setUint32(idx * 4, val, false));
  return out;
}

function bytesToBase64Url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function generateVerifierString(len = 64) {
  const arr = new Uint8Array(len);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < len; i += 1) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += PKCE_CHARSET[arr[i] % PKCE_CHARSET.length];
  }
  return out;
}

function generateStateNonce() {
  const bytes = new Uint8Array(12);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 12; i += 1) bytes[i] = (i * 37 + 19) & 0xff;
  }
  return bytesToBase64Url(bytes);
}

const DEFAULT_VERIFIER = 'zoth_etsy_pkce_v3_9f8e7d6c5b4a3210_RFC7636_S256_verifier_token_01';

export default function EtsyConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  // OAuth2 PKCE State
  const [clientId, setClientId] = useState('YOUR_ETSY_API_KEYSTRING');
  const [redirectUri, setRedirectUri] = useState('http://127.0.0.1:8108/oauth/callback');
  const [oauthState, setOauthState] = useState('zoth_state_8f3a2c91');
  const [authCodePlaceholder, setAuthCodePlaceholder] = useState('PASTE_REDIRECT_AUTH_CODE_HERE');
  const [selectedScopes, setSelectedScopes] = useState(['listings_r', 'listings_w', 'shops_r', 'transactions_r']);
  const [codeVerifier, setCodeVerifier] = useState(DEFAULT_VERIFIER);
  const [codeChallenge, setCodeChallenge] = useState(() => bytesToBase64Url(sha256BytesSync(DEFAULT_VERIFIER)));
  const [cryptoEngineLabel, setCryptoEngineLabel] = useState('RFC-7636 SHA-256 (Pure-JS + WebCrypto)');
  const [oauthSnippetTab, setOauthSnippetTab] = useState('authorize');

  // REST Endpoint & MCP Workbench State
  const [workbenchMode, setWorkbenchMode] = useState('mcp');
  const [activeEndpointId, setActiveEndpointId] = useState(REST_ENDPOINTS[0].id);
  const [shopId, setShopId] = useState('42891044');
  const [searchKeywords, setSearchKeywords] = useState('minimalist terracotta arch wall art');
  const [searchLimit, setSearchLimit] = useState(25);
  const [draftTaxonomyId, setDraftTaxonomyId] = useState(2078);
  const [draftTitle, setDraftTitle] = useState('Mid-Century Terracotta Arch Printable Wall Art Set | 300 DPI Multi-Ratio');
  const [draftPrice, setDraftPrice] = useState(11.99);

  const [activeMcpToolId, setActiveMcpToolId] = useState(MCP_TOOLS[0].id);
  const [mcpArgsText, setMcpArgsText] = useState(() => JSON.stringify(MCP_TOOLS[0].defaultArgs, null, 2));
  const [mcpOutputTab, setMcpOutputTab] = useState('jsonrpc');

  // Taxonomy Filter & Rate-Limit Quota Planner State
  const [taxonomyFilter, setTaxonomyFilter] = useState('');
  const [activeListingCount, setActiveListingCount] = useState(140);
  const [pollIntervalMin, setPollIntervalMin] = useState(30);
  const [callsPerListing, setCallsPerListing] = useState(2);
  const [parallelWorkers, setParallelWorkers] = useState(4);
  const [dailyDrafts, setDailyDrafts] = useState(25);

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) => {
      if (prev.includes(scopeId)) {
        return prev.length > 1 ? prev.filter((s) => s !== scopeId) : prev;
      }
      return [...prev, scopeId];
    });
  };

  const regeneratePkce = useCallback(async () => {
    const nextVerifier = generateVerifierString(64);
    const nextState = generateStateNonce();
    setCodeVerifier(nextVerifier);
    setOauthState(nextState);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(nextVerifier));
        setCodeChallenge(bytesToBase64Url(new Uint8Array(digest)));
        setCryptoEngineLabel('Web Crypto API (crypto.subtle SHA-256)');
        return;
      } catch {
        // Fall through to deterministic RFC 6234 SHA-256
      }
    }
    setCodeChallenge(bytesToBase64Url(sha256BytesSync(nextVerifier)));
    setCryptoEngineLabel('Deterministic RFC-6234 SHA-256 Fallback');
  }, []);

  const handleVerifierEdit = useCallback(async (val) => {
    const cleaned = val.replace(/[^A-Za-z0-9\-._~]/g, '').slice(0, 128);
    setCodeVerifier(cleaned);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(cleaned));
        setCodeChallenge(bytesToBase64Url(new Uint8Array(digest)));
        setCryptoEngineLabel('Web Crypto API (crypto.subtle SHA-256)');
        return;
      } catch {
        // Fallback below
      }
    }
    setCodeChallenge(bytesToBase64Url(sha256BytesSync(cleaned)));
    setCryptoEngineLabel('Deterministic RFC-6234 SHA-256');
  }, []);

  const selectMcpTool = (tool) => {
    setActiveMcpToolId(tool.id);
    setMcpArgsText(JSON.stringify(tool.defaultArgs, null, 2));
  };

  // OAuth2 URLs & Token Exchange Snippets
  const oauthBundle = useMemo(() => {
    const scopeStr = selectedScopes.join(' ');
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: redirectUri.trim() || 'http://127.0.0.1:8108/oauth/callback',
      scope: scopeStr,
      client_id: clientId.trim() || 'YOUR_ETSY_API_KEYSTRING',
      state: oauthState.trim() || 'zoth_state',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    const authorizeUrl = `https://www.etsy.com/oauth/connect?${params.toString()}`;

    const tokenCurl = `curl -X POST "https://api.etsy.com/v3/public/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId.trim() || 'YOUR_ETSY_API_KEYSTRING'}" \\
  -d "redirect_uri=${encodeURIComponent(redirectUri.trim() || 'http://127.0.0.1:8108/oauth/callback')}" \\
  -d "code=${authCodePlaceholder.trim() || 'PASTE_REDIRECT_AUTH_CODE_HERE'}" \\
  -d "code_verifier=${codeVerifier}"`;

    const refreshCurl = `curl -X POST "https://api.etsy.com/v3/public/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "client_id=${clientId.trim() || 'YOUR_ETSY_API_KEYSTRING'}" \\
  -d "refresh_token=\${ETSY_REFRESH_TOKEN}"`;

    return {
      scopeStr,
      authorizeUrl,
      tokenCurl,
      refreshCurl,
      verifierValid: codeVerifier.length >= 43 && codeVerifier.length <= 128,
    };
  }, [clientId, redirectUri, oauthState, selectedScopes, codeChallenge, codeVerifier, authCodePlaceholder]);

  // REST Endpoint Builder
  const restBundle = useMemo(() => {
    const cleanShop = String(shopId || '42891044').replace(/[^0-9]/g, '') || '42891044';
    const ep = REST_ENDPOINTS.find((e) => e.id === activeEndpointId) || REST_ENDPOINTS[0];
    const resolvedPath = ep.path.replace('{shop_id}', cleanShop);
    let fullUrl = `https://openapi.etsy.com${resolvedPath}`;
    let bodyObj = null;

    if (ep.id === 'active-listings') {
      const qs = new URLSearchParams({
        keywords: searchKeywords.trim() || 'wall art',
        limit: String(Math.min(100, Math.max(1, Number(searchLimit) || 25))),
        sort_on: 'score',
      });
      fullUrl = `${fullUrl}?${qs.toString()}`;
    } else if (ep.id === 'create-draft') {
      bodyObj = {
        quantity: 999,
        title: draftTitle.trim() || 'Untitled Digital Print',
        description: '300 DPI multi-ratio digital art download (2:3, 3:4, 4:5, 11:14, ISO A-Series).',
        price: Math.max(0.2, Number(draftPrice) || 9.99),
        who_made: 'i_did',
        when_made: '2020_2025',
        taxonomy_id: Math.max(1, Number(draftTaxonomyId) || 2078),
        is_digital: true,
        tags: ['terracotta wall art', 'japandi arch print', 'minimalist poster', '300 dpi printable'],
      };
    }

    const headers = [`-H "x-api-key: \${ETSY_API_KEYSTRING}"`];
    if (ep.requiresOAuth) {
      headers.push(`-H "Authorization: Bearer \${ETSY_OAUTH_ACCESS_TOKEN}"`);
      headers.push(`-H "Content-Type: application/json"`);
    }

    const curl =
      ep.method === 'POST'
        ? `curl -X POST "${fullUrl}" \\\n  ${headers.join(' \\\n  ')} \\\n  -d '${JSON.stringify(bodyObj).replace(/'/g, "'\\''")}'`
        : `curl -X GET "${fullUrl}" \\\n  ${headers.join(' \\\n  ')}`;

    return { ep, fullUrl, bodyObj, curl };
  }, [activeEndpointId, shopId, searchKeywords, searchLimit, draftTaxonomyId, draftTitle, draftPrice]);

  // MCP JSON-RPC & Config Builder
  const mcpBundle = useMemo(() => {
    let parsedArgs = null;
    let parseError = '';
    try {
      parsedArgs = JSON.parse(mcpArgsText);
    } catch (err) {
      parseError = err instanceof Error ? err.message : 'Invalid JSON arguments';
    }

    const jsonRpcEnvelope = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: activeMcpToolId,
        arguments: parsedArgs || {},
      },
    };

    const mcpConfigObj = {
      mcpServers: {
        'etsy-connector': {
          command: 'python3',
          args: ['~/NullAITech/etsy-connector/mcp_server.py'],
          env: {
            ETSY_API_KEYSTRING: clientId.trim() || 'YOUR_ETSY_API_KEYSTRING',
            ETSY_SHOP_ID: String(shopId || '42891044').trim(),
            ETSY_OAUTH_ACCESS_TOKEN: '${ETSY_OAUTH_ACCESS_TOKEN}',
            ETSY_SIMULATION_MODE: 'true',
          },
        },
      },
    };

    const stdioPipeCmd = `printf '%s\\n' '${JSON.stringify(jsonRpcEnvelope).replace(/'/g, "'\\''")}' | python3 ~/NullAITech/etsy-connector/mcp_server.py`;

    return {
      parsedArgs,
      parseError,
      jsonRpcText: JSON.stringify(jsonRpcEnvelope, null, 2),
      mcpConfigObj,
      mcpConfigText: JSON.stringify(mcpConfigObj, null, 2),
      stdioPipeCmd,
    };
  }, [activeMcpToolId, mcpArgsText, clientId, shopId]);

  // Taxonomy Filtered Rows
  const filteredTaxonomy = useMemo(() => {
    const q = taxonomyFilter.trim().toLowerCase();
    if (!q) return TAXONOMY_CATALOG;
    return TAXONOMY_CATALOG.filter(
      (row) =>
        row.group.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        String(row.taxonomyId).includes(q) ||
        row.notes.toLowerCase().includes(q),
    );
  }, [taxonomyFilter]);

  // Etsy v3 QPS / QPD Quota Budget Calculator
  const quotaAnalysis = useMemo(() => {
    const listings = Math.max(1, Number(activeListingCount) || 1);
    const interval = Math.max(5, Number(pollIntervalMin) || 30);
    const cpl = Math.max(1, Number(callsPerListing) || 1);
    const workers = Math.max(1, Number(parallelWorkers) || 1);
    const drafts = Math.max(0, Number(dailyDrafts) || 0);

    const pollsPerDay = Math.floor(1440 / interval);
    // Batch list reads use 100 items/call + per-listing detail/inventory calls
    const listSweepCallsPerPoll = Math.ceil(listings / 100);
    const detailCallsPerPoll = cpl > 1 ? listings * (cpl - 1) : 0;
    const syncCallsPerDay = pollsPerDay * (listSweepCallsPerPoll + detailCallsPerPoll);
    // Draft creation = 1 draft + 3 image uploads + 1 shipping/inventory sync = 5 calls/draft
    const draftCallsPerDay = drafts * 5;
    const totalDailyCalls = syncCallsPerDay + draftCallsPerDay;
    const qpdUtilizationPct = Number(((totalDailyCalls / ETSY_QPD_LIMIT) * 100).toFixed(1));
    const remainingQpd = Math.max(0, ETSY_QPD_LIMIT - totalDailyCalls);

    // Peak burst QPS assumes each parallel worker fires up to 2.2 req/sec without throttling
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

    const budgetRows = [
      {
        id: 'sweep',
        operation: 'Paginated Shop Listings Sweep (100/page)',
        frequency: `${pollsPerDay} cycles / day`,
        callsDay: String(pollsPerDay * listSweepCallsPerPoll),
        sharePct: `${((pollsPerDay * listSweepCallsPerPoll / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: 'PASS',
      },
      {
        id: 'detail',
        operation: `Per-Listing Detail / Inventory Sync (${Math.max(0, cpl - 1)} calls/item)`,
        frequency: `${listings} items × ${pollsPerDay} polls`,
        callsDay: String(pollsPerDay * detailCallsPerPoll),
        sharePct: `${((pollsPerDay * detailCallsPerPoll / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: pollsPerDay * detailCallsPerPoll > 7500 ? 'FAIL' : pollsPerDay * detailCallsPerPoll > 5000 ? 'WARN' : 'PASS',
      },
      {
        id: 'drafts',
        operation: 'New Draft + Mockup Image Uploads (5 calls/draft)',
        frequency: `${drafts} drafts / day`,
        callsDay: String(draftCallsPerDay),
        sharePct: `${((draftCallsPerDay / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: draftCallsPerDay > 2000 ? 'WARN' : 'PASS',
      },
      {
        id: 'total',
        operation: 'Total Projected Etsy Open API v3 Quota',
        frequency: `Limit: ${ETSY_QPD_LIMIT.toLocaleString()} QPD · ${ETSY_QPS_LIMIT} QPS`,
        callsDay: totalDailyCalls.toLocaleString(),
        sharePct: `${qpdUtilizationPct}%`,
        status: qpdSafe && qpsSafe ? 'PASS' : totalDailyCalls <= ETSY_QPD_LIMIT * 1.15 ? 'WARN' : 'FAIL',
      },
    ];

    return {
      pollsPerDay,
      totalDailyCalls,
      qpdUtilizationPct,
      remainingQpd,
      unthrottledPeakQps,
      safeDelayMs,
      qpsSafe,
      qpdSafe,
      healthScore,
      budgetRows,
    };
  }, [activeListingCount, pollIntervalMin, callsPerListing, parallelWorkers, dailyDrafts]);

  const kpis = [
    {
      label: 'PKCE Method',
      value: 'S256',
      unit: `${selectedScopes.length} scopes active`,
      accent: ACCENT_RAW,
    },
    {
      label: 'MCP Bridge Tools',
      value: String(MCP_TOOLS.length),
      unit: activeMcpToolId.replace('etsy_', ''),
      accent: SOV.cyber,
    },
    {
      label: 'Daily Quota Use',
      value: `${quotaAnalysis.qpdUtilizationPct}%`,
      unit: `${quotaAnalysis.totalDailyCalls.toLocaleString()} / 10k QPD`,
      accent: quotaAnalysis.qpdSafe ? SOV.emerald : '#EF4444',
    },
    {
      label: 'Worker Throttle',
      value: `${quotaAnalysis.safeDelayMs} ms`,
      unit: `${ETSY_QPS_LIMIT} QPS hard cap`,
      accent: SOV.gold,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={quotaAnalysis.qpdSafe && !mcpBundle.parseError ? 'online' : 'warn'}
        label={`OPEN API V3 · PKCE S256 READY · ${quotaAnalysis.totalDailyCalls.toLocaleString()}/10,000 QPD`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download etsy-mcp-config.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(mcpBundle.mcpConfigObj, 'etsy-mcp-config.json'),
      primary: true,
    },
    {
      label: copied === 'oauth-url' ? 'Copied OAuth2 URL' : 'Copy OAuth2 Connect URL',
      icon: copied === 'oauth-url' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(oauthBundle.authorizeUrl, 'oauth-url'),
    },
    {
      label: copied === 'token-curl' ? 'Copied Token curl' : 'Copy Token Exchange curl',
      icon: copied === 'token-curl' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(oauthBundle.tokenCurl, 'token-curl'),
    },
    {
      label: 'etsy-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/etsy-connector',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ETSY OPEN API V3 · RFC 7636 PKCE"
        title="OAuth2 PKCE & Scope Builder"
        subtitle="Generate RFC 7636 S256 code_verifier + SHA-256 code_challenge, assemble Etsy authorization URLs, and copy token-exchange curl commands"
        accent={ACCENT_RAW}
        right={<KeyIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Client ID (API Keystring)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              sx={{ flex: '1 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              label="CSRF State Nonce"
              value={oauthState}
              onChange={(e) => setOauthState(e.target.value)}
              sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>

          <TextField
            size="small"
            fullWidth
            label="OAuth2 Redirect URI"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              SELECT ETSY V3 OAUTH2 SCOPES ({selectedScopes.length} ACTIVE)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {ETSY_OAUTH_SCOPES.map((sc) => {
                const active = selectedScopes.includes(sc.id);
                return (
                  <Chip
                    key={sc.id}
                    label={sc.label}
                    clickable
                    onClick={() => toggleScope(sc.id)}
                    sx={{
                      minHeight: 36,
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.secondary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                    }}
                  />
                );
              })}
            </Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', color: 'text.secondary', mt: 0.75 }}>
              {ETSY_OAUTH_SCOPES.filter((s) => selectedScopes.includes(s.id))
                .map((s) => `${s.id}: ${s.desc}`)
                .join(' · ')}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
              PKCE PAIR · {cryptoEngineLabel}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={regeneratePkce}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: accent,
                borderColor: rgba(accent, 0.45),
              }}
            >
              Generate Fresh PKCE Pair
            </Button>
          </Box>

          <TextField
            size="small"
            fullWidth
            label={`PKCE code_verifier (${codeVerifier.length} chars · RFC 7636 requires 43–128)`}
            value={codeVerifier}
            error={!oauthBundle.verifierValid}
            onChange={(e) => handleVerifierEdit(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.74rem' } }}
          />

          <SovereignKeyValueGrid
            cols={1}
            accent={ACCENT_RAW}
            items={[
              {
                label: 'SHA-256 code_challenge (Base64URL)',
                value: codeChallenge,
                badge: 'S256',
              },
            ]}
          />

          <TextField
            size="small"
            fullWidth
            label="Returned Authorization Code (for Token Exchange curl)"
            value={authCodePlaceholder}
            onChange={(e) => setAuthCodePlaceholder(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.75rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              { id: 'authorize', label: 'Authorization URL' },
              { id: 'token', label: 'Token Exchange curl' },
              { id: 'refresh', label: 'Refresh Token curl' },
            ].map((t) => {
              const active = oauthSnippetTab === t.id;
              return (
                <Chip
                  key={t.id}
                  label={t.label}
                  clickable
                  onClick={() => setOauthSnippetTab(t.id)}
                  sx={{
                    minHeight: 34,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                  }}
                />
              );
            })}
          </Box>

          <SovereignCodeBlock
            title={
              oauthSnippetTab === 'authorize'
                ? 'etsy-oauth-connect.url'
                : oauthSnippetTab === 'token'
                ? 'etsy-oauth-token-exchange.sh'
                : 'etsy-oauth-refresh.sh'
            }
            badge={oauthSnippetTab.toUpperCase()}
            code={
              oauthSnippetTab === 'authorize'
                ? oauthBundle.authorizeUrl
                : oauthSnippetTab === 'token'
                ? oauthBundle.tokenCurl
                : oauthBundle.refreshCurl
            }
            filename={oauthSnippetTab === 'authorize' ? 'etsy-oauth-url.txt' : `etsy-oauth-${oauthSnippetTab}.sh`}
            accent={ACCENT_RAW}
            maxHeight={210}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="ETSY V3 RATE-LIMIT BUDGET (10 QPS / 10,000 QPD)"
        title="QPS & QPD Quota Planner"
        subtitle="Model polling cadence, listing inventory sweeps, parallel workers, and daily draft uploads against Etsy's hard quota"
        accent={SOV.gold}
        right={<SpeedIcon sx={{ color: isDark ? SOV.gold : '#B8860B' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1.5 }}>
          <SovereignGauge
            value={quotaAnalysis.healthScore}
            label="Quota Headroom"
            unit="/100"
            size={112}
            accent={quotaAnalysis.qpdSafe ? SOV.emerald : '#EF4444'}
          />
          <Box sx={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: 'text.primary' }}>
              {quotaAnalysis.totalDailyCalls.toLocaleString()} / {ETSY_QPD_LIMIT.toLocaleString()} req/day ({quotaAnalysis.qpdUtilizationPct}%)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.71rem', color: 'text.secondary' }}>
              Headroom: {quotaAnalysis.remainingQpd.toLocaleString()} calls/day · Peak burst: {quotaAnalysis.unthrottledPeakQps} QPS
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.71rem', color: quotaAnalysis.qpsSafe ? (isDark ? SOV.emerald : '#047857') : '#DC2626' }}>
              Recommended per-worker pacing: {quotaAnalysis.safeDelayMs} ms/request
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'text.secondary' }}>ACTIVE SHOP LISTINGS</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: accent }}>{activeListingCount} listings</Typography>
            </Box>
            <Slider
              value={activeListingCount}
              min={10}
              max={1000}
              step={10}
              onChange={(_, v) => setActiveListingCount(Number(v))}
              aria-label="Active Shop Listings"
              sx={{ color: accent }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'text.secondary' }}>POLL / SYNC INTERVAL</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: accent }}>Every {pollIntervalMin} min ({quotaAnalysis.pollsPerDay}×/day)</Typography>
            </Box>
            <Slider
              value={pollIntervalMin}
              min={5}
              max={180}
              step={5}
              onChange={(_, v) => setPollIntervalMin(Number(v))}
              aria-label="Poll Interval Minutes"
              sx={{ color: accent }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              type="number"
              label="Calls / Listing"
              value={callsPerListing}
              onChange={(e) => setCallsPerListing(Math.max(1, Math.min(8, Number(e.target.value))))}
              inputProps={{ min: 1, max: 8 }}
              sx={{ flex: '1 1 100px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="Parallel Workers"
              value={parallelWorkers}
              onChange={(e) => setParallelWorkers(Math.max(1, Math.min(12, Number(e.target.value))))}
              inputProps={{ min: 1, max: 12 }}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="Daily Drafts"
              value={dailyDrafts}
              onChange={(e) => setDailyDrafts(Math.max(0, Math.min(500, Number(e.target.value))))}
              inputProps={{ min: 0, max: 500 }}
              sx={{ flex: '1 1 100px', '& input': { fontFamily: MONO } }}
            />
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="REST V3 & ANTIGRAVITY MCP WORKBENCH"
        title="Etsy v3 Endpoints & MCP JSON-RPC Builder"
        subtitle="Switch between Open API v3 REST curl synthesis and live Antigravity MCP JSON-RPC tool-call payloads with editable arguments"
        accent={SOV.cyber}
        right={<CodeIcon sx={{ color: isDark ? SOV.cyber : '#0369A1' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {[
            { id: 'mcp', label: 'Antigravity MCP JSON-RPC (5 Tools)' },
            { id: 'rest', label: 'Open API v3 REST Endpoints (4 Routes)' },
          ].map((m) => {
            const active = workbenchMode === m.id;
            return (
              <Button
                key={m.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setWorkbenchMode(m.id)}
                sx={{
                  minHeight: 40,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: isDark ? SOV.cyber : '#0369A1', color: isDark ? '#08080B' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.36)' }),
                }}
              >
                {m.label}
              </Button>
            );
          })}
        </Box>

        {workbenchMode === 'mcp' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SovereignPresetBar
              presets={MCP_TOOLS}
              activeId={activeMcpToolId}
              onSelect={selectMcpTool}
              onReset={() => selectMcpTool(MCP_TOOLS[0])}
              accent={SOV.cyber}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                LIVE EDITABLE TOOL ARGUMENTS (JSON)
              </Typography>
              <Chip
                size="small"
                label={mcpBundle.parseError ? `JSON ERROR: ${mcpBundle.parseError}` : 'VALID JSON-RPC 2.0 ARGUMENTS'}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  bgcolor: mcpBundle.parseError ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
                  color: mcpBundle.parseError ? '#DC2626' : isDark ? SOV.emerald : '#047857',
                }}
              />
            </Box>

            <TextField
              size="small"
              multiline
              minRows={6}
              maxRows={12}
              fullWidth
              value={mcpArgsText}
              error={Boolean(mcpBundle.parseError)}
              onChange={(e) => setMcpArgsText(e.target.value)}
              aria-label="MCP JSON Arguments"
              sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 } }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {[
                  { id: 'jsonrpc', label: 'JSON-RPC tools/call' },
                  { id: 'config', label: 'etsy-mcp-config.json' },
                  { id: 'stdio', label: 'Local stdio Pipe' },
                ].map((t) => {
                  const active = mcpOutputTab === t.id;
                  return (
                    <Chip
                      key={t.id}
                      label={t.label}
                      clickable
                      onClick={() => setMcpOutputTab(t.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                        color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.secondary',
                        border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={() => downloadJson(mcpBundle.mcpConfigObj, 'etsy-mcp-config.json')}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: isDark ? SOV.cyber : '#0369A1',
                  borderColor: rgba(SOV.cyber, 0.45),
                }}
              >
                Download etsy-mcp-config.json
              </Button>
            </Box>

            <SovereignCodeBlock
              title={
                mcpOutputTab === 'jsonrpc'
                  ? `${activeMcpToolId}-rpc.json`
                  : mcpOutputTab === 'config'
                  ? 'etsy-mcp-config.json'
                  : 'etsy-mcp-stdio.sh'
              }
              badge={mcpOutputTab.toUpperCase()}
              code={
                mcpOutputTab === 'jsonrpc'
                  ? mcpBundle.jsonRpcText
                  : mcpOutputTab === 'config'
                  ? mcpBundle.mcpConfigText
                  : mcpBundle.stdioPipeCmd
              }
              filename={
                mcpOutputTab === 'jsonrpc'
                  ? `${activeMcpToolId}-rpc.json`
                  : mcpOutputTab === 'config'
                  ? 'etsy-mcp-config.json'
                  : 'etsy-mcp-stdio.sh'
              }
              accent={SOV.cyber}
              maxHeight={260}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {REST_ENDPOINTS.map((ep) => {
                const active = activeEndpointId === ep.id;
                return (
                  <Chip
                    key={ep.id}
                    label={`${ep.label} · ${ep.badge}`}
                    clickable
                    onClick={() => setActiveEndpointId(ep.id)}
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

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <TextField
                size="small"
                label="Shop ID"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
              />
              {activeEndpointId === 'active-listings' && (
                <>
                  <TextField
                    size="small"
                    label="Search Keywords"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    sx={{ flex: '2 1 200px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Limit (1–100)"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
                    sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO } }}
                  />
                </>
              )}
              {activeEndpointId === 'create-draft' && (
                <>
                  <TextField
                    size="small"
                    type="number"
                    label="Taxonomy ID"
                    value={draftTaxonomyId}
                    onChange={(e) => setDraftTaxonomyId(Math.max(1, Number(e.target.value)))}
                    sx={{ flex: '0 1 125px', '& input': { fontFamily: MONO } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Price ($)"
                    value={draftPrice}
                    onChange={(e) => setDraftPrice(Math.max(0.2, Number(e.target.value)))}
                    sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO } }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Draft Title (<= 140 chars)"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    sx={{ '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
                  />
                </>
              )}
            </Box>

            <SovereignKeyValueGrid
              cols={2}
              accent={SOV.cyber}
              items={[
                { label: 'Resolved Endpoint', value: restBundle.fullUrl, badge: restBundle.ep.method },
                {
                  label: 'Auth Header Requirement',
                  value: restBundle.ep.requiresOAuth ? 'x-api-key + Bearer OAuth2' : 'x-api-key (Public v3)',
                  badge: restBundle.ep.requiresOAuth ? 'OAUTH2' : 'KEYSTRING',
                },
              ]}
            />

            <SovereignCodeBlock
              title={`etsy-v3-${restBundle.ep.id}.sh`}
              badge="CURL"
              code={restBundle.curl}
              filename={`etsy-v3-${restBundle.ep.id}.sh`}
              accent={SOV.cyber}
              maxHeight={240}
            />
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="SELLER TAXONOMY CATEGORY ID LOOKUP"
        title="Etsy v3 Seller Taxonomy Reference"
        subtitle="Filter common POD & digital download seller taxonomy IDs; click a category chip to apply its taxonomy_id to your draft builder"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Filter taxonomy (e.g. Digital Prints, Apparel, Mugs, 2078)..."
            value={taxonomyFilter}
            onChange={(e) => setTaxonomyFilter(e.target.value)}
            sx={{ flex: '1 1 240px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          {['All', 'Digital Prints', 'Apparel', 'Mugs', 'Stickers', 'Planners', 'Jewelry'].map((grp) => {
            const active = (grp === 'All' && !taxonomyFilter) || taxonomyFilter.toLowerCase() === grp.toLowerCase();
            return (
              <Chip
                key={grp}
                label={grp}
                size="small"
                clickable
                onClick={() => setTaxonomyFilter(grp === 'All' ? '' : grp)}
                sx={{
                  minHeight: 32,
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignDataTable
          eyebrow="VERIFIED ETSY SELLER TAXONOMY NODES"
          title={`Quick Taxonomy ID Table (${filteredTaxonomy.length} nodes · Active Draft ID: ${draftTaxonomyId})`}
          filename="etsy-seller-taxonomy-ids.csv"
          accent={ACCENT_RAW}
          maxHeight={260}
          columns={[
            { key: 'taxonomyId', label: 'ID', mono: true },
            { key: 'group', label: 'Group' },
            { key: 'category', label: 'Taxonomy Path' },
            { key: 'fulfillment', label: 'Fulfillment' },
            { key: 'typicalMargin', label: 'Margin', mono: true, align: 'right' },
          ]}
          rows={filteredTaxonomy}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {filteredTaxonomy.map((t) => {
            const applied = Number(draftTaxonomyId) === t.taxonomyId;
            return (
              <Chip
                key={t.id}
                label={`Apply #${t.taxonomyId} (${t.group})`}
                clickable
                onClick={() => {
                  setDraftTaxonomyId(t.taxonomyId);
                  if (activeMcpToolId === 'etsy_create_draft_listing' && mcpBundle.parsedArgs) {
                    setMcpArgsText(JSON.stringify({ ...mcpBundle.parsedArgs, taxonomy_id: t.taxonomyId }, null, 2));
                  }
                }}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: applied ? 700 : 500,
                  bgcolor: applied ? rgba(SOV.emerald, 0.16) : 'transparent',
                  color: applied ? (isDark ? SOV.emerald : '#047857') : 'text.secondary',
                  border: `1px solid ${applied ? SOV.emerald : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const bottomPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow="ETSY V3 RATE-LIMIT BREAKDOWN"
        title={`Daily Request Budget (${quotaAnalysis.totalDailyCalls.toLocaleString()} / 10,000 QPD · ${quotaAnalysis.unthrottledPeakQps} Peak QPS)`}
        filename="etsy-v3-quota-budget.csv"
        accent={SOV.gold}
        maxHeight={280}
        columns={[
          { key: 'operation', label: 'API Workload' },
          { key: 'frequency', label: 'Cadence', mono: true },
          { key: 'callsDay', label: 'Req / Day', mono: true, align: 'right' },
          { key: 'sharePct', label: '% of 10k QPD', mono: true, align: 'right' },
          { key: 'status', label: 'Quota' },
        ]}
        rows={quotaAnalysis.budgetRows}
      />

      <SovereignCard
        index="05"
        eyebrow="LOCAL CLI & MCP DAEMON (:8108)"
        title="Etsy Connector Local Execution"
        subtitle="Keep Etsy OAuth2 access tokens and API keystrings strictly on loopback when executing live draft writes or MCP calls"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="ETSY-CONNECTOR LOCAL CLI (:8108)"
          badge="LOCAL TOKEN"
          code={`# Check local Etsy connector status & MCP server health\netsy-connector --status\n\n# Launch loopback workbench on http://127.0.0.1:8108\ncd ~/NullAITech/etsy-connector && python3 server.py --port 8108`}
          filename="etsy-connector.sh"
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
          title="Runtime Scope · Client-Side PKCE S256 & MCP Builder + Local Loopback Bridge (:8108)"
          message="RFC 7636 PKCE SHA-256 generation, OAuth2 connect URLs, Open API v3 REST curl snippets, Antigravity MCP JSON-RPC payloads, taxonomy lookups, and QPS/QPD rate-limit planning execute 100% client-side with zero outbound network calls. Run live OAuth token exchanges and shop writes locally via etsy-connector (:8108)."
        />
      </Box>
      <SovereignWorkstationShell
        id="etsy-connector"
        category="COMMERCE & MCP · ETSY OPEN API V3 (:8108)"
        title="Etsy Connector & MCP Bridge"
        subtitle="RFC 7636 OAuth2 PKCE S256 & scope builder, Open API v3 REST + Antigravity MCP JSON-RPC workbench, seller taxonomy ID lookup, and 10 QPS / 10,000 QPD quota planner."
        version="2.5.0"
        variant="hex-lattice"
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
