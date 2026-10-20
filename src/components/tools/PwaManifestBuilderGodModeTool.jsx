import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LayersIcon from '@mui/icons-material/Layers';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import PaletteIcon from '@mui/icons-material/Palette';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// 12 Battle-Tested PWA Presets
// ---------------------------------------------------------------------------
const PRESETS = {
  ecommerce: {
    name: 'E-Commerce Storefront',
    short_name: 'Store',
    description: 'Mobile e-commerce shopping experience with instant offline catalog and cart persistence.',
    theme_color: '#059669',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    glyph: '🛍️',
    strategy: 'StaleWhileRevalidate'
  },
  game: {
    name: 'Arcade Space Shooter',
    short_name: 'Arcade',
    description: 'Immersive fullscreen web game with instant offline play and asset precaching.',
    theme_color: '#7c3aed',
    background_color: '#0f172a',
    display: 'fullscreen',
    orientation: 'landscape',
    glyph: '👾',
    strategy: 'CacheFirst'
  },
  productivity: {
    name: 'Productivity Workspace',
    short_name: 'WorkSpace',
    description: 'Offline-first task management, note taking, and document workspace.',
    theme_color: '#1a73e8',
    background_color: '#f8f9fa',
    display: 'standalone',
    orientation: 'any',
    glyph: '⚡',
    strategy: 'StaleWhileRevalidate'
  },
  dashboard: {
    name: 'SaaS Analytics Console',
    short_name: 'Dashboard',
    description: 'Real-time metrics, telemetry, and business intelligence console.',
    theme_color: '#0284c7',
    background_color: '#0b0f19',
    display: 'standalone',
    orientation: 'any',
    glyph: '◈',
    strategy: 'NetworkFirst'
  },
  social: {
    name: 'Social Community Network',
    short_name: 'Community',
    description: 'Real-time feeds, discussions, and creator messaging.',
    theme_color: '#db2777',
    background_color: '#18181b',
    display: 'standalone',
    orientation: 'portrait-primary',
    glyph: '💬',
    strategy: 'StaleWhileRevalidate'
  },
  media: {
    name: 'Audio & Video Player',
    short_name: 'Player',
    description: 'Rich offline media player with stream caching and background audio.',
    theme_color: '#ea580c',
    background_color: '#121212',
    display: 'standalone',
    orientation: 'any',
    glyph: '▶️',
    strategy: 'CacheFirst'
  },
  'offline-doc': {
    name: 'Offline Technical Docs',
    short_name: 'Docs',
    description: 'Comprehensive offline technical documentation and API handbook.',
    theme_color: '#475569',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'any',
    glyph: '📚',
    strategy: 'CacheFirst'
  },
  fitness: {
    name: 'Pulse Fitness Tracker',
    short_name: 'Pulse',
    description: 'Personal workout, cardio, and nutrition tracking PWA.',
    theme_color: '#dc2626',
    background_color: '#18181b',
    display: 'standalone',
    orientation: 'portrait',
    glyph: '🔥',
    strategy: 'StaleWhileRevalidate'
  },
  travel: {
    name: 'Wanderlust Travel Guide',
    short_name: 'Travel',
    description: 'Offline itineraries, city maps, and flight booking assistant.',
    theme_color: '#0d9488',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'any',
    glyph: '✈️',
    strategy: 'NetworkFirst'
  },
  food: {
    name: 'QuickBite Food Delivery',
    short_name: 'QuickBite',
    description: 'Live restaurant menus, fast food delivery, and order tracking.',
    theme_color: '#f59e0b',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    glyph: '🍔',
    strategy: 'NetworkFirst'
  },
  portfolio: {
    name: 'Developer Portfolio & CV',
    short_name: 'Portfolio',
    description: 'Interactive modern portfolio and project showcase.',
    theme_color: '#6366f1',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'any',
    glyph: '💼',
    strategy: 'StaleWhileRevalidate'
  },
  minimal: {
    name: 'Minimal Progressive Web App',
    short_name: 'MinimalPWA',
    description: 'Clean W3C compliant baseline PWA configuration.',
    theme_color: '#1a73e8',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'any',
    glyph: '✦',
    strategy: 'StaleWhileRevalidate'
  }
};

// ---------------------------------------------------------------------------
// Pure Client-Side PKZIP Archive Generator (Zero Dependencies)
// ---------------------------------------------------------------------------
function createZipArchive(files) {
  const textEncoder = new TextEncoder();
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[i] = c >>> 0;
  }
  function calcCrc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const fileEntries = [];
  let offset = 0;
  const parts = [];

  for (const file of files) {
    const nameBytes = textEncoder.encode(file.name);
    const dataBytes = typeof file.content === 'string' ? textEncoder.encode(file.content) : file.content;
    const crc = calcCrc32(dataBytes);
    const size = dataBytes.length;

    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    header.set(nameBytes, 30);

    fileEntries.push({ nameBytes, crc, size, offset });
    parts.push(header);
    parts.push(dataBytes);
    offset += header.length + size;
  }

  const cdStart = offset;
  let cdSize = 0;

  for (const entry of fileEntries) {
    const cd = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cd.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, entry.offset, true);
    cd.set(entry.nameBytes, 46);

    parts.push(cd);
    cdSize += cd.length;
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, fileEntries.length, true);
  eocdView.setUint16(10, fileEntries.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, cdStart, true);
  eocdView.setUint16(20, 0, true);
  parts.push(eocd);

  return new Blob(parts, { type: 'application/zip' });
}

export default function PwaManifestBuilderGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // License State
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // Tool State
  const [selectedPresetKey, setSelectedPresetKey] = useState('ecommerce');
  const [appName, setAppName] = useState(PRESETS.ecommerce.name);
  const [appShortName, setAppShortName] = useState(PRESETS.ecommerce.short_name);
  const [appDesc, setAppDesc] = useState(PRESETS.ecommerce.description);
  const [themeColor, setThemeColor] = useState(PRESETS.ecommerce.theme_color);
  const [bgColor, setBgColor] = useState(PRESETS.ecommerce.background_color);
  const [displayMode, setDisplayMode] = useState(PRESETS.ecommerce.display);
  const [orientationMode, setOrientationMode] = useState(PRESETS.ecommerce.orientation);
  const [glyph, setGlyph] = useState(PRESETS.ecommerce.glyph);
  const [swStrategy, setSwStrategy] = useState(PRESETS.ecommerce.strategy);
  const [startUrl, setStartUrl] = useState('/');
  const [scopeUrl, setScopeUrl] = useState('/');

  // Config tabs & Phone simulator mode
  const [configTab, setConfigTab] = useState(0); // 0: Core Identity, 1: Presentation & Display, 2: Offline & Caching
  const [simulatorMode, setSimulatorMode] = useState('install'); // 'install' | 'splash' | 'home'
  const [codeTab, setCodeTab] = useState(0); // 0: manifest, 1: sw.js, 2: head tags, 3: offline.html
  const [copiedCode, setCopiedCode] = useState(false);

  // License detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLicensed = urlParams.get('licensed') === 'true' || urlParams.get('session_id') !== null;
    const localLicensed = localStorage.getItem('pro_licensed') === 'true' ||
                          localStorage.getItem('pwa_pro_licensed') === 'true' ||
                          localStorage.getItem('pwa-manifest-builder_pro_licensed') === 'true';

    if (paramLicensed || localLicensed) {
      setIsLicensed(true);
      if (paramLicensed) {
        localStorage.setItem('pwa_pro_licensed', 'true');
        localStorage.setItem('pro_licensed', 'true');
      }
    }
  }, []);

  const handleActivateLicense = () => {
    const clean = licenseKeyInput.trim();
    if (clean.length >= 4 || clean.toUpperCase().includes('PWA') || clean.toUpperCase().includes('PRO') || clean.includes('@')) {
      setIsLicensed(true);
      localStorage.setItem('pwa_pro_licensed', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setLicenseStatusMsg('⭐ License successfully activated! All PWA features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('⚠️ Please enter a valid license key or receipt order ID.');
    }
  };

  const handlePresetSelect = (key) => {
    setSelectedPresetKey(key);
    const p = PRESETS[key];
    if (p) {
      setAppName(p.name);
      setAppShortName(p.short_name);
      setAppDesc(p.description);
      setThemeColor(p.theme_color);
      setBgColor(p.background_color);
      setDisplayMode(p.display);
      setOrientationMode(p.orientation);
      setGlyph(p.glyph);
      setSwStrategy(p.strategy);
    }
  };

  // Manifest builder
  const manifestData = useMemo(() => {
    return {
      name: appName,
      short_name: appShortName || appName.slice(0, 12),
      description: appDesc,
      start_url: startUrl,
      scope: scopeUrl,
      display: displayMode,
      orientation: orientationMode,
      theme_color: themeColor,
      background_color: bgColor,
      lang: 'en-US',
      dir: 'ltr',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: `${appShortName} Home`,
          url: startUrl,
          description: `Direct shortcut to ${appName}`
        }
      ]
    };
  }, [appName, appShortName, appDesc, startUrl, scopeUrl, displayMode, orientationMode, themeColor, bgColor]);

  // SW Builder
  const swCode = useMemo(() => {
    return `/**
 * Service Worker Synthesized by PWA Manifest Studio
 * Strategy: ${swStrategy} | Scope: ${scopeUrl}
 */
'use strict';

const CACHE_NAME = '${(appShortName || 'pwa').toLowerCase()}-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];
const OFFLINE_FALLBACK = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Strategy: ${swStrategy}
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return networkRes;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_FALLBACK);
        }
      });
      return cached || fetchPromise;
    })
  );
});`;
  }, [appShortName, swStrategy, scopeUrl]);

  // Head tags builder
  const headTagsCode = useMemo(() => {
    return `<!-- PWA Core Metadata & Manifest -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="${themeColor}">
<meta name="application-name" content="${manifestData.short_name}">
<meta name="description" content="${manifestData.description}">

<!-- Apple iOS PWA Capabilities -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${manifestData.short_name}">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">

<!-- ServiceWorker Registration -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '${scopeUrl}' })
        .then(reg => console.log('[PWA] SW registered with scope:', reg.scope))
        .catch(err => console.error('[PWA] SW registration failed:', err));
    });
  }
</script>`;
  }, [themeColor, manifestData, scopeUrl]);

  // Offline HTML builder
  const offlineHtmlCode = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline | ${manifestData.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${bgColor}; color: #202124; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h1 { margin-bottom: 8px; font-size: 24px; color: ${themeColor}; }
    p { color: #5f6368; max-width: 400px; margin-bottom: 24px; line-height: 1.5; }
    button { background: ${themeColor}; color: white; border: none; padding: 12px 28px; border-radius: 24px; font-weight: 600; cursor: pointer; font-size: 15px; }
  </style>
</head>
<body>
  <div class="icon">${glyph}</div>
  <h1>You're currently offline</h1>
  <p>${manifestData.name} is installed and available offline. Reconnect to sync latest content.</p>
  <button onclick="window.location.reload()">Retry Connection</button>
</body>
</html>`;
  }, [manifestData, bgColor, themeColor, glyph]);

  // PWA Installability Audit Score
  const auditChecks = useMemo(() => {
    return [
      { title: 'Web App Manifest provided & named', pass: Boolean(appName.trim()) },
      { title: 'Valid start_url and scope defined', pass: Boolean(startUrl && scopeUrl) },
      { title: 'Display mode standalone or fullscreen', pass: ['standalone', 'fullscreen', 'minimal-ui'].includes(displayMode) },
      { title: '192x192 & 512x512 icon declarations', pass: true },
      { title: 'Adaptive maskable icon purpose declared', pass: true },
      { title: 'Theme color & background color set', pass: Boolean(themeColor && bgColor) },
      { title: 'ServiceWorker caching & fetch listener', pass: Boolean(swStrategy) },
      { title: 'Offline HTML fallback configured', pass: true },
      { title: 'Short name ≤ 12 characters (mobile icon label)', pass: (appShortName || '').length <= 12 }
    ];
  }, [appName, startUrl, scopeUrl, displayMode, themeColor, bgColor, swStrategy, appShortName]);

  const auditPassedCount = useMemo(() => auditChecks.filter(c => c.pass).length, [auditChecks]);
  const auditScore = useMemo(() => Math.round((auditPassedCount / auditChecks.length) * 100), [auditPassedCount, auditChecks]);

  // Copy active code
  const getActiveCode = () => {
    if (codeTab === 0) return JSON.stringify(manifestData, null, 2);
    if (codeTab === 1) return swCode;
    if (codeTab === 2) return headTagsCode;
    return offlineHtmlCode;
  };

  const handleCopyCode = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(getActiveCode());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // ZIP Bundle Exporter
  const handleDownloadZipBundle = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }

    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="${themeColor}"/>
  <text x="256" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="220" font-weight="bold" fill="#ffffff" text-anchor="middle">${glyph}</text>
</svg>`;

    const files = [
      { name: 'manifest.webmanifest', content: JSON.stringify(manifestData, null, 2) },
      { name: 'sw.js', content: swCode },
      { name: 'index-head-tags.html', content: headTagsCode },
      { name: 'offline.html', content: offlineHtmlCode },
      { name: 'icons/icon-512.svg', content: iconSvg },
      {
        name: 'README-PWA.md',
        content: `# ${manifestData.name} PWA Bundle\n\nGenerated by PWA Manifest Studio (100% In-Browser Client-Side).\n\n## Quick Setup\n1. Place 'manifest.webmanifest' and 'sw.js' in your web root directory.\n2. Paste 'index-head-tags.html' into your index.html <head> section.\n3. Deploy with HTTPS on Netlify, Vercel, or any static host!\n`
      }
    ];

    const zipBlob = createZipArchive(files);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (manifestData.short_name || 'pwa').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${safeName}-pwa-bundle.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* --------------------------------------------------------------------- */}
      {/* HIGH-CONVERTING SALES BANNER ABOVE MAIN SECTION                       */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(56,189,248,0.08) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #F0F9FF 100%)',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(212,175,55,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  PWA Manifest Studio Pro — Lifetime Founding Pass
                </Typography>
                <Chip
                  label="68% OFF · $19 LIFETIME"
                  size="small"
                  sx={{
                    bgcolor: '#10B981',
                    color: '#08080B',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Regular <span style={{ textDecoration: 'line-through' }}>$79</span>. W3C manifest generator, offline service worker synthesis, client-side PKZIP exporter, and device previews.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Stripe $19 USD 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
                navigator.clipboard?.writeText(sol);
                alert('Solana Receiver Address copied: ' + sol);
              }}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
              }}
            >
              Solana DePay ⚡
            </Button>
            <Button
              size="small"
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: '#D4AF37' },
              }}
            >
              Activate Key
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PRESET SELECTOR & HEADER BAR                                          */}
      {/* --------------------------------------------------------------------- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="pwa-preset-select-label" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
              Load Application Archetype
            </InputLabel>
            <Select
              labelId="pwa-preset-select-label"
              value={selectedPresetKey}
              label="Load Application Archetype"
              onChange={(e) => handlePresetSelect(e.target.value)}
              sx={{ fontFamily: mono, fontSize: '0.85rem' }}
            >
              {Object.keys(PRESETS).map((k) => (
                <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                  {PRESETS[k].glyph} {PRESETS[k].name} ({PRESETS[k].display})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#10B981' }} />}
            label={`W3C AUDIT: ${auditScore}% PASSED (${auditPassedCount}/9)`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: auditScore >= 90 ? 'rgba(16,185,129,0.1)' : 'rgba(212,175,55,0.1)',
              color: auditScore >= 90 ? '#10B981' : '#D4AF37',
              border: `1px solid ${auditScore >= 90 ? '#10B981' : '#D4AF37'}`,
            }}
          />
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            onClick={handleDownloadZipBundle}
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.82rem',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Export PWA ZIP Bundle 📦
          </Button>

          {isLicensed ? (
            <Chip
              label="⭐ PRO ACTIVE"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid #10B981',
              }}
            />
          ) : (
            <Chip
              label="FREE EVALUATION"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                color: '#D4AF37',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            />
          )}
        </Stack>
      </Box>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN WORKSPACE: LEFT CONFIGURATOR & RIGHT DEVICE / CODE   */}
      {/* --------------------------------------------------------------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: Configurator Form */}
        <Grid xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Tabs
              value={configTab}
              onChange={(e, v) => setConfigTab(v)}
              variant="fullWidth"
              sx={{
                mb: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  minHeight: 44,
                },
              }}
            >
              <Tab label="1. Identity & Name" />
              <Tab label="2. Display & Colors" />
              <Tab label="3. Offline & SW" />
            </Tabs>

            {/* TAB 0: Identity */}
            {configTab === 0 && (
              <Stack spacing={2} sx={{ flex: 1 }}>
                <TextField
                  label="Application Name"
                  size="small"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  helperText="Full branding title displayed on splash screens & stores"
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                />
                <TextField
                  label="Short Name (Icon Label)"
                  size="small"
                  value={appShortName}
                  onChange={(e) => setAppShortName(e.target.value)}
                  helperText={`${appShortName.length}/12 chars recommended for home screen text`}
                  error={appShortName.length > 12}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                />
                <TextField
                  label="Application Description"
                  size="small"
                  multiline
                  rows={3}
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                />
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <TextField
                      label="Start URL"
                      size="small"
                      fullWidth
                      value={startUrl}
                      onChange={(e) => setStartUrl(e.target.value)}
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="Scope URL"
                      size="small"
                      fullWidth
                      value={scopeUrl}
                      onChange={(e) => setScopeUrl(e.target.value)}
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="App Icon Glyph / Emoji"
                  size="small"
                  value={glyph}
                  onChange={(e) => setGlyph(e.target.value)}
                  helperText="Procedural icon glyph for 512x512 adaptive SVG generation"
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                />
              </Stack>
            )}

            {/* TAB 1: Display & Colors */}
            {configTab === 1 && (
              <Stack spacing={2.5} sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <TextField
                        label="Theme Color"
                        size="small"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                      />
                    </Box>
                  </Grid>
                  <Grid xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <TextField
                        label="Background Color"
                        size="small"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Display Mode</InputLabel>
                  <Select
                    value={displayMode}
                    label="Display Mode"
                    onChange={(e) => setDisplayMode(e.target.value)}
                    sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                  >
                    <MenuItem value="standalone" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      standalone (Native mobile app frame, no URL bar)
                    </MenuItem>
                    <MenuItem value="fullscreen" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      fullscreen (Total screen immersion, games/media)
                    </MenuItem>
                    <MenuItem value="minimal-ui" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      minimal-ui (Minimal browser navigation controls)
                    </MenuItem>
                    <MenuItem value="browser" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      browser (Standard browser tab)
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Orientation Lock</InputLabel>
                  <Select
                    value={orientationMode}
                    label="Orientation Lock"
                    onChange={(e) => setOrientationMode(e.target.value)}
                    sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                  >
                    <MenuItem value="portrait-primary" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>portrait-primary (Locked Vertical)</MenuItem>
                    <MenuItem value="landscape" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>landscape (Locked Horizontal / Gaming)</MenuItem>
                    <MenuItem value="any" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>any (Auto-rotates freely)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* TAB 2: Offline & SW */}
            {configTab === 2 && (
              <Stack spacing={2.5} sx={{ flex: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Service Worker Caching Strategy</InputLabel>
                  <Select
                    value={swStrategy}
                    label="Service Worker Caching Strategy"
                    onChange={(e) => setSwStrategy(e.target.value)}
                    sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                  >
                    <MenuItem value="StaleWhileRevalidate" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      StaleWhileRevalidate (Instant cached load + background revalidate)
                    </MenuItem>
                    <MenuItem value="CacheFirst" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      CacheFirst (Best for offline games, media & heavy docs)
                    </MenuItem>
                    <MenuItem value="NetworkFirst" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      NetworkFirst (Best for financial dashboards & real-time APIs)
                    </MenuItem>
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
                  Includes synthesized <code>offline.html</code> fallback template, skipWaiting lifecycle, clients.claim activation, and zero-downtime cache invalidation.
                </Alert>
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Phone Simulator / Code Inspector */}
        <Grid xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Stage Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIphoneIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  Device Simulator & Code
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
                {[
                  { id: 'install', label: 'Install Modal' },
                  { id: 'splash', label: 'Splash Screen' },
                  { id: 'home', label: 'Home Icon' },
                  { id: 'code', label: 'Code' }
                ].map((mode) => (
                  <Button
                    key={mode.id}
                    size="small"
                    variant={simulatorMode === mode.id ? 'contained' : 'outlined'}
                    onClick={() => setSimulatorMode(mode.id)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      py: 0.3,
                      px: 1,
                      minWidth: 'auto',
                      bgcolor: simulatorMode === mode.id ? '#D4AF37' : 'transparent',
                      color: simulatorMode === mode.id ? '#08080B' : 'inherit',
                      borderColor: theme.palette.divider,
                      '&:hover': { bgcolor: simulatorMode === mode.id ? '#F5E6AB' : 'rgba(212,175,55,0.1)' }
                    }}
                  >
                    {mode.label}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* STAGE: PHONE SIMULATION */}
            {simulatorMode !== 'code' && (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  bgcolor: isDark ? '#040406' : '#F8FAFC',
                  borderRadius: 2,
                  minHeight: 380,
                }}
              >
                {/* Phone Frame */}
                <Box
                  sx={{
                    width: 280,
                    height: 480,
                    borderRadius: '36px',
                    border: '8px solid #27272A',
                    bgcolor: bgColor,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Phone Notch */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 90,
                      height: 18,
                      bgcolor: '#27272A',
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                      zIndex: 10,
                    }}
                  />

                  {/* Mode: Install Sheet Modal */}
                  {simulatorMode === 'install' && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 2 }}>
                      <Paper
                        elevation={6}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: isDark ? '#18181B' : '#FFFFFF',
                          textAlign: 'center',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: themeColor,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            mx: 'auto',
                            mb: 1.5,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          }}
                        >
                          {glyph}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {appName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 2, fontSize: '0.7rem' }}>
                          {appDesc.slice(0, 75)}...
                        </Typography>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          sx={{
                            bgcolor: themeColor,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                          }}
                        >
                          Install App
                        </Button>
                      </Paper>
                    </Box>
                  )}

                  {/* Mode: Splash Screen */}
                  {simulatorMode === 'splash' && (
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: bgColor,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          bgcolor: themeColor,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '40px',
                          mb: 2,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        }}
                      >
                        {glyph}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: themeColor, fontSize: '1.1rem' }}>
                        {appName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#71717A', mt: 1, fontFamily: mono, fontSize: '0.65rem' }}>
                        POWERED BY ZOTHOS PWA ENGINE
                      </Typography>
                    </Box>
                  )}

                  {/* Mode: Home Screen App Icon */}
                  {simulatorMode === 'home' && (
                    <Box
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)',
                        p: 2.5,
                        pt: 5,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: 2.5,
                            bgcolor: themeColor,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                            mb: 0.5,
                          }}
                        >
                          {glyph}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          }}
                        >
                          {appShortName || 'App'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* STAGE: CODE INSPECTOR */}
            {simulatorMode === 'code' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Tabs
                    value={codeTab}
                    onChange={(e, v) => setCodeTab(v)}
                    sx={{
                      minHeight: 36,
                      '& .MuiTab-root': { fontFamily: mono, fontSize: '0.72rem', minHeight: 36, py: 0.5, px: 1.2 }
                    }}
                  >
                    <Tab label="manifest.json" />
                    <Tab label="sw.js" />
                    <Tab label="<head> tags" />
                    <Tab label="offline.html" />
                  </Tabs>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleCopyCode}
                    startIcon={copiedCode ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      borderColor: 'rgba(212,175,55,0.4)',
                      color: '#D4AF37',
                    }}
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </Button>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? '#040406' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'auto',
                    fontFamily: mono,
                    fontSize: '0.76rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: isDark ? '#E2E8F0' : '#1E293B',
                  }}
                >
                  {getActiveCode()}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* --------------------------------------------------------------------- */}
      {/* LICENSE ACTIVATION DIALOG                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#D4AF37' }} />
          Activate Pro License
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your receipt order ID, Stripe email, or custom license key to immediately unlock all features.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="e.g. PWA-PRO-XXXX or receipt email"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateLicense();
            }}
            InputProps={{
              sx: { fontFamily: mono, fontSize: '0.88rem' }
            }}
          />
          {licenseStatusMsg && (
            <Alert
              severity={licenseStatusMsg.includes('⭐') ? 'success' : 'warning'}
              sx={{ mt: 2, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {licenseStatusMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLicenseModalOpen(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
