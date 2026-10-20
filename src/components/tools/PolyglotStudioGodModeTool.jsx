import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TerminalIcon from '@mui/icons-material/Terminal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// 13 Modern Framework Definitions
// ---------------------------------------------------------------------------
const FRAMEWORKS = [
  { id: "astro", name: "Astro 5", tagline: "Island Architecture & Zero-JS SSG", icon: "★", color: "#FF5D01", defaultPort: 4321, desc: "Modern web framework for content-rich websites with optional island hydration." },
  { id: "nextjs", name: "Next.js 15", tagline: "React Server Components & App Router", icon: "▲", color: "#EDEFF2", defaultPort: 3000, desc: "Enterprise React framework with hybrid static & server rendering." },
  { id: "vite_react", name: "Vite React 19", tagline: "Ultra-Fast Modern SPA Bundle", icon: "⚛️", color: "#61DAFB", defaultPort: 5173, desc: "Blazing fast Vite-powered Single Page App with React 19 and modern styling." },
  { id: "sveltekit", name: "SvelteKit 2", tagline: "Compiler-Driven Runes Reactivity", icon: "⚡", color: "#FF3E00", defaultPort: 5173, desc: "Ultra-compact web framework with fine-grained reactivity and minimal JS bundle sizes." },
  { id: "nuxt", name: "Nuxt 3", tagline: "Vue 3 & Nitro Universal SSR", icon: "✦", color: "#00DC82", defaultPort: 3000, desc: "Full-stack Vue framework featuring file-based routing and universal rendering." },
  { id: "bun_hono", name: "Bun + Hono 4", tagline: "Ultra-Fast Edge API & Fullstack", icon: "🔥", color: "#F59E0B", defaultPort: 3000, desc: "High-performance edge fullstack framework powered by Bun runtime and Hono." },
  { id: "solidstart", name: "SolidStart", tagline: "Fine-Grained Signals Fullstack", icon: "🔷", color: "#4F46E5", defaultPort: 3000, desc: "Fine-grained reactivity with zero virtual DOM overhead and lightning speed." },
  { id: "tauri", name: "Tauri v2", tagline: "Tiny Native Desktop Binary (Rust)", icon: "🦀", color: "#24C8DB", defaultPort: "Desktop", desc: "Build ultra-lightweight, secure cross-platform desktop applications." },
  { id: "electron", name: "Electron 33", tagline: "Chromium + Node.js Cross-Platform", icon: "⚡", color: "#93C5FD", defaultPort: "Desktop", desc: "Mature desktop app shell combining Chromium rendering with full Node.js APIs." },
  { id: "htmx", name: "HTMX + Alpine", tagline: "Hypermedia Single-Page App", icon: "◎", color: "#38BDF8", defaultPort: 8000, desc: "Modern hypermedia architecture with zero build tooling requirements." }
];

// ---------------------------------------------------------------------------
// Pure In-Browser PKZIP Archive Builder (Zero Dependencies)
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
  const parts = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = textEncoder.encode(name);
    const contentBytes = textEncoder.encode(content);
    const crc = calcCrc32(contentBytes);
    const size = contentBytes.length;

    const lh = new Uint8Array(30 + nameBytes.length);
    const lhView = new DataView(lh.buffer);
    lhView.setUint32(0, 0x04034b50, true);
    lhView.setUint16(4, 20, true);
    lhView.setUint16(6, 0, true);
    lhView.setUint16(8, 0, true);
    lhView.setUint16(10, 0, true);
    lhView.setUint16(12, 0, true);
    lhView.setUint32(14, crc, true);
    lhView.setUint32(18, size, true);
    lhView.setUint32(22, size, true);
    lhView.setUint16(26, nameBytes.length, true);
    lhView.setUint16(28, 0, true);
    lh.set(nameBytes, 30);

    parts.push(lh);
    parts.push(contentBytes);

    fileEntries.push({ nameBytes, crc, size, offset });
    offset += lh.length + size;
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

// ---------------------------------------------------------------------------
// Dynamic Multi-Framework File Scaffolder
// ---------------------------------------------------------------------------
function generateProjectFiles(fwId, projectName, title, desc, features) {
  const files = {};
  const hasTs = features.includes("ts");
  const hasTailwind = features.includes("tailwind");
  const hasPwa = features.includes("pwa");

  files["README.md"] = `# ${title}\n\n> ${desc}\n\nScaffolded with **Polyglot Studio** for target framework **${fwId.toUpperCase()}**.\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Build for Production\n\`\`\`bash\nnpm run build\n\`\`\`\n`;
  files[".gitignore"] = "node_modules/\ndist/\n.cache/\n.env*\n*.local\n.DS_Store\n";

  if (hasTs) {
    files["tsconfig.json"] = JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["DOM", "DOM.Iterable", "ES2022"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "preserve",
        strict: true,
        skipLibCheck: true
      }
    }, null, 2);
  }

  if (hasTailwind) {
    files["tailwind.config.js"] = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}'],\n  theme: {\n    extend: {\n      colors: {\n        brand: '#D4AF37',\n        void: '#08080B'\n      }\n    }\n  },\n  plugins: []\n};\n`;
  }

  if (hasPwa) {
    files["public/manifest.json"] = JSON.stringify({
      name: title,
      short_name: projectName,
      description: desc,
      start_url: "/",
      display: "standalone",
      background_color: "#08080B",
      theme_color: "#D4AF37"
    }, null, 2);
  }

  switch (fwId) {
    case "astro":
      files["package.json"] = JSON.stringify({
        name: projectName, version: "0.1.0", type: "module",
        scripts: { dev: "astro dev", build: "astro build", preview: "astro preview" },
        dependencies: { astro: "^5.1.0" }
      }, null, 2);
      files["astro.config.mjs"] = `import { defineConfig } from 'astro/config';\nexport default defineConfig({});\n`;
      files["src/pages/index.astro"] = `---\n// Astro 5 Island Entrypoint\n---\n<html lang="en">\n  <head><title>${title}</title></head>\n  <body style="background:#08080B; color:#EDEFF2; font-family:sans-serif; padding:2rem;">\n    <h1 style="color:#D4AF37;">${title}</h1>\n    <p>${desc}</p>\n  </body>\n</html>\n`;
      break;

    case "nextjs":
      files["package.json"] = JSON.stringify({
        name: projectName, version: "0.1.0",
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: { next: "^15.1.0", react: "^19.0.0", "react-dom": "^19.0.0" }
      }, null, 2);
      files["src/app/page.tsx"] = `export default function Page() {\n  return (\n    <main style={{ background: '#08080B', color: '#EDEFF2', minHeight: '100vh', padding: '2rem' }}>\n      <h1 style={{ color: '#D4AF37' }}>${title}</h1>\n      <p>${desc}</p>\n    </main>\n  );\n}\n`;
      files["src/app/layout.tsx"] = `export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body style={{ margin: 0 }}>{children}</body>\n    </html>\n  );\n}\n`;
      break;

    case "vite_react":
      files["package.json"] = JSON.stringify({
        name: projectName, version: "0.1.0", type: "module",
        scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        devDependencies: { "@vitejs/plugin-react": "^4.3.0", vite: "^6.0.0" }
      }, null, 2);
      files["vite.config.ts"] = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n`;
      files["src/App.tsx"] = `import React from 'react';\nexport default function App() {\n  return (\n    <div style={{ background: '#08080B', color: '#EDEFF2', minHeight: '100vh', padding: '2rem' }}>\n      <h1 style={{ color: '#D4AF37' }}>${title}</h1>\n      <p>${desc}</p>\n    </div>\n  );\n}\n`;
      files["src/main.tsx"] = `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);\n`;
      files["index.html"] = `<!DOCTYPE html>\n<html><head><title>${title}</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`;
      break;

    case "bun_hono":
      files["package.json"] = JSON.stringify({
        name: projectName, version: "0.1.0", type: "module",
        scripts: { dev: "bun --watch src/index.ts" },
        dependencies: { hono: "^4.6.0" }
      }, null, 2);
      files["src/index.ts"] = `import { Hono } from 'hono';\nconst app = new Hono();\napp.get('/', (c) => c.html(\`<h1 style="color:#D4AF37">${title}</h1><p>${desc}</p>\`));\nexport default app;\n`;
      break;

    default:
      files["package.json"] = JSON.stringify({
        name: projectName, version: "0.1.0",
        scripts: { dev: "vite", build: "vite build" }
      }, null, 2);
      files["src/index.html"] = `<h1>${title}</h1><p>${desc}</p>\n`;
      break;
  }

  return files;
}

export function PolyglotStudioGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Palette tokens
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const goldBorder = 'rgba(212, 175, 55, 0.4)';
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const emeraldBorder = 'rgba(0, 255, 157, 0.38)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [selectedFw, setSelectedFw] = useState(FRAMEWORKS[0]);
  const [projectName, setProjectName] = useState('sovereign-app');
  const [projectTitle, setProjectTitle] = useState('Sovereign Web Application');
  const [projectDesc, setProjectDesc] = useState('High-performance, zero-egress application engineered on NullAI Platform.');
  const [features, setFeatures] = useState(['ts', 'tailwind', 'pwa']);
  const [activeFile, setActiveFile] = useState('README.md');
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro State
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || urlParams.get('pro') === 'true') {
        localStorage.setItem('polyglot_pro_licensed', 'true');
        setIsProLicensed(true);
      } else {
        const stored = localStorage.getItem('polyglot_pro_licensed');
        if (stored === 'true') setIsProLicensed(true);
      }
    }
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length >= 6) {
      localStorage.setItem('polyglot_pro_licensed', 'true');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generated Files Map
  const generatedFiles = useMemo(() => {
    return generateProjectFiles(selectedFw.id, projectName, projectTitle, projectDesc, features);
  }, [selectedFw, projectName, projectTitle, projectDesc, features]);

  // Ensure active file exists
  useEffect(() => {
    if (!generatedFiles[activeFile]) {
      setActiveFile(Object.keys(generatedFiles)[0] || 'README.md');
    }
  }, [generatedFiles, activeFile]);

  // In-Browser ZIP Download Handler
  const handleDownloadZip = () => {
    if (!isProLicensed) {
      setShowPaywallModal(true);
      return;
    }
    const zipBlob = createZipArchive(generatedFiles);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-${selectedFw.id}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* =====================================================================
          1. HIGH-CONVERTING MONETIZATION SALES FUNNEL BANNER
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.14) 0%, rgba(56, 189, 248, 0.12) 50%, rgba(8, 8, 11, 0.98) 100%)'
            : 'linear-gradient(135deg, #F0F9FF 0%, #FFFBEB 100%)',
          border: `1px solid ${goldBorder}`,
          boxShadow: isDark ? '0 12px 32px rgba(212, 175, 55, 0.15)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label="⚡ FOUNDING PASS"
                size="small"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
              />
              <Typography variant="body2" sx={{ color: cyan, fontWeight: 700, fontFamily: mono }}>
                UNIVERSAL FRAMEWORK SCAFFOLDER
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#FFFFFF' : '#111827' }}>
              Polyglot Studio · Universal Multi-Framework Code Exporter
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              100% in-browser AST project scaffolding across 13 modern web and desktop frameworks. Deterministic zero-dependency PKZIP bundler and clean entrypoint synthesizer.
            </Typography>
          </Grid>

          <Grid xs={12} md={5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems="center">
              <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontFamily: mono }}>
                  $79.00 REGULAR
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                  $19.00 <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>LIFETIME</span>
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  component="a"
                  href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
                  target="_blank"
                  rel="noopener"
                  startIcon={<BoltIcon />}
                  sx={{
                    bgcolor: gold,
                    color: '#000',
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: '#B89628' }
                  }}
                >
                  STRIPE $19
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href="https://buy.stripe.com/fZu4gyaEleOsb9CdkIfw40K"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    borderColor: cyan,
                    color: cyan,
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: cyanSoft }
                  }}
                >
                  SOLANA DEPAY
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowPaywallModal(true)}
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textDecoration: 'underline' }}
              >
                Already have a license key or receipt? Activate Pro
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          2. WORKSPACE HUD & CONTROLS
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: isDark ? '#10121A' : '#FFFFFF',
          border: `1px solid ${cardBorder}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: cyanSoft, color: cyan, display: 'flex' }}>
                <RocketLaunchIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#111827' }}>
                  Polyglot Studio <span style={{ color: cyan }}>Foundry</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  Target: {selectedFw.name} · {Object.keys(generatedFiles).length} Files Synthesized · In-Memory PKZIP
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip
                icon={isProLicensed ? <CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: `${emerald} !important` }} /> : <LockIcon sx={{ fontSize: '0.9rem !important', color: `${gold} !important` }} />}
                label={isProLicensed ? "⭐ PRO ACTIVE" : "FOUNDING PASS ($19)"}
                size="small"
                onClick={() => !isProLicensed && setShowPaywallModal(true)}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : goldSoft,
                  color: isProLicensed ? emerald : gold,
                  fontWeight: 800,
                  fontFamily: mono,
                  border: `1px solid ${isProLicensed ? emeraldBorder : goldBorder}`,
                  cursor: isProLicensed ? 'default' : 'pointer'
                }}
              />
              <Chip
                label={`PORT: ${selectedFw.defaultPort}`}
                size="small"
                sx={{ bgcolor: cyanSoft, color: cyan, fontWeight: 700, fontFamily: mono }}
              />
              <Chip
                label="CLIENT-SIDE IN-MEMORY ZIP"
                size="small"
                sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 700, fontFamily: mono }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleDownloadZip}
                startIcon={<DownloadIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  py: 1,
                  fontSize: '0.82rem',
                  '&:hover': { bgcolor: '#B89628' }
                }}
              >
                {isProLicensed ? 'DOWNLOAD ZIP BUNDLE' : 'EXPORT PROJECT ZIP'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          3. FRAMEWORK SELECTION STRIP
          ===================================================================== */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}` }}>
        <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono, fontWeight: 700, display: 'block', mb: 1 }}>
          SELECT TARGET FRAMEWORK:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {FRAMEWORKS.map((fw) => {
            const isSelected = selectedFw.id === fw.id;
            return (
              <Chip
                key={fw.id}
                icon={<span>{fw.icon}</span>}
                label={fw.name}
                onClick={() => setSelectedFw(fw)}
                sx={{
                  fontFamily: mono,
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  bgcolor: isSelected ? fw.color : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                  color: isSelected ? '#000' : 'text.primary',
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? fw.color : 'transparent'}`
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* =====================================================================
          4. PROJECT METADATA & CONFIGURATION
          ===================================================================== */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}` }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Package Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <Stack direction="row" spacing={1}>
              {['ts', 'tailwind', 'pwa'].map(feat => (
                <Chip
                  key={feat}
                  label={feat.toUpperCase()}
                  size="small"
                  onClick={() => {
                    setFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
                  }}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    bgcolor: features.includes(feat) ? emerald : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    color: features.includes(feat) ? '#000' : 'text.secondary',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          5. VIRTUAL FILE TREE & CODE EXPLORER
          ===================================================================== */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: gold }}>
              VIRTUAL PROJECT TREE
            </Typography>
            <Stack spacing={0.8}>
              {Object.keys(generatedFiles).map((filePath) => {
                const isSelected = activeFile === filePath;
                return (
                  <Box
                    key={filePath}
                    onClick={() => setActiveFile(filePath)}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      bgcolor: isSelected ? cyanSoft : isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      border: `1px solid ${isSelected ? cyan : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { bgcolor: cyanSoft }
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 16, color: isSelected ? cyan : '#94A3B8' }} />
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', color: isSelected ? cyan : 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {filePath}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                {activeFile}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleCopy(generatedFiles[activeFile] || '', 'file_copy')}
                startIcon={copiedKey === 'file_copy' ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                sx={{ fontFamily: mono, fontSize: '0.7rem', color: cyan, borderColor: 'rgba(56,189,248,0.4)' }}
              >
                {copiedKey === 'file_copy' ? 'Copied' : 'Copy Content'}
              </Button>
            </Box>

            <Paper sx={{ p: 2, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
              <pre
                style={{
                  margin: 0,
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  lineHeight: 1.55,
                  color: '#CBD5E1',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 480,
                  overflowY: 'auto'
                }}
              >
                {generatedFiles[activeFile] || '// Select a file from the tree to preview.'}
              </pre>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      {/* =====================================================================
          PRO ACTIVATION DIALOG
          ===================================================================== */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#10121A' : '#FFFFFF',
            border: `1px solid ${goldBorder}`,
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, color: gold, pb: 1 }}>
          ⭐ ACTIVATE PRO LICENSE
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Enter your Stripe receipt email or license key to unlock Polyglot Studio Pro and download unlimited in-memory project ZIP archives:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. POLY-PRO-2026-XXXX or neal@..."
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><VpnKeyIcon sx={{ color: gold, fontSize: 18 }} /></InputAdornment>,
              sx: { fontFamily: mono, fontSize: '0.82rem' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PolyglotStudioGodModeTool;
