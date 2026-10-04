import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, useTheme } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SEO from './components/SEO';
import Footer from './components/Footer';
import { IntroDirector, PageStage } from './motion/IntroDirector';

// Code-split route modules for instant initial load and on-demand streaming
const SwarmPage = lazy(() => import('./pages/SwarmPage'));
const SwarmShowcasePage = lazy(() => import('./pages/SwarmShowcasePage'));
const WebGenPage = lazy(() => import('./pages/WebGenPage'));
const WebGenShowcasePage = lazy(() => import('./pages/WebGenShowcasePage'));
const HexStrikePage = lazy(() => import('./pages/HexStrikePage'));
const HexStrikeShowcasePage = lazy(() => import('./pages/HexStrikeShowcasePage'));
const ZothOSPage = lazy(() => import('./pages/ZothOSPage'));
const ZothOSShowcasePage = lazy(() => import('./pages/ZothOSShowcasePage'));
const MemoryPage = lazy(() => import('./pages/MemoryPage'));
const MemoryShowcasePage = lazy(() => import('./pages/MemoryShowcasePage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const AdytumPage = lazy(() => import('./pages/AdytumPage'));
const AdytumShowcasePage = lazy(() => import('./pages/AdytumShowcasePage'));
const MathPillarDetailPage = lazy(() => import('./pages/MathPillarDetailPage'));
const MathPillarsPage = lazy(() => import('./pages/MathPillarsPage'));
const RealToolWorkspacePage = lazy(() => import('./pages/RealToolWorkspacePage'));
const ArsenalPage = lazy(() => import('./pages/ArsenalPage'));
const BridgesPage = lazy(() => import('./pages/BridgesPage'));
const WorkstationsPage = lazy(() => import('./pages/WorkstationsPage'));
const ConsensusPage = lazy(() => import('./pages/ConsensusPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const FaqsPage = lazy(() => import('./pages/FaqsPage'));
const AXPage = lazy(() => import('./pages/AXPage'));
const AXShowcasePage = lazy(() => import('./pages/AXShowcasePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));

function RouteFallback() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        opacity: 0.85,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '2px solid rgba(212, 175, 55, 0.15)',
          borderTopColor: '#D4AF37',
          animation: 'zoth-spin 0.9s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
        }}
      />
      <Box
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.22em',
          color: dark ? 'rgba(212, 175, 55, 0.75)' : '#B8860B',
          textTransform: 'uppercase',
        }}
      >
        INITIALIZING ENCLAVE
      </Box>
    </Box>
  );
}

const STORAGE_KEY = 'zoth-studio-theme';

function getInitialMode() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    /* ignore */
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function WorkstationRedirect() {
  const { workstationId } = useParams();
  return <Navigate to={`/tools/${workstationId}`} replace />;
}

/**
 * Ensures user is immediately landed at the top of the page on every route navigation.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function AppShell({ mode, onToggleTheme }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <IntroDirector>
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <ScrollToTop />
      <SEO />
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          minWidth: 0,
          overflowX: 'clip',
          '& > .MuiContainer-root, & > .page-stage > .MuiContainer-root': { flex: 1, width: '100%', minWidth: 0 },
          '& > .page-stage': { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
        }}
      >
        <PageStage>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/arsenal" element={<ArsenalPage />} />
              <Route path="/adytum" element={<AdytumShowcasePage />} />
              <Route path="/adytum/docs" element={<AdytumPage />} />
              <Route path="/swarm" element={<SwarmShowcasePage />} />
              <Route path="/swarm/docs" element={<SwarmPage />} />
              <Route path="/bridges" element={<BridgesPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/workstations" element={<WorkstationsPage />} />
              <Route path="/workstations/:workstationId" element={<WorkstationRedirect />} />
              <Route path="/templates" element={<Navigate to="/arsenal" replace />} />
              <Route path="/tools/:toolId" element={<RealToolWorkspacePage />} />
              <Route path="/memory" element={<MemoryShowcasePage />} />
              <Route path="/memory/docs" element={<MemoryPage />} />
              <Route path="/consensus" element={<ConsensusPage />} />
              <Route path="/webgen" element={<WebGenShowcasePage />} />
              <Route path="/webgen/docs" element={<WebGenPage />} />
              <Route path="/hexstrike" element={<HexStrikeShowcasePage />} />
              <Route path="/hexstrike/docs" element={<HexStrikePage />} />
              <Route path="/zoth-os" element={<ZothOSShowcasePage />} />
              <Route path="/zoth-os/docs" element={<ZothOSPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs/math/:pillarId" element={<MathPillarDetailPage />} />
              <Route path="/docs/math" element={<MathPillarsPage />} />
              <Route path="/faqs" element={<FaqsPage />} />
              <Route path="/ax" element={<AXShowcasePage />} />
              <Route path="/ax/docs" element={<AXPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
            </Routes>
          </Suspense>
        </PageStage>
      </Box>
      <Footer />
    </Box>
    </IntroDirector>
  );
}

export default function App() {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      /* ignore */
    }
  }, [mode]);

  // Seamlessly fade out and dismiss the zero-latency sovereign splash veil
  useEffect(() => {
    const preloader = document.getElementById('zoth-preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      const timer = setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 420);
      return () => clearTimeout(timer);
    }
  }, []);

  const activeTheme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  const handleToggleTheme = () => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <AppShell mode={mode} onToggleTheme={handleToggleTheme} />
    </ThemeProvider>
  );
}