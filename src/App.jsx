import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, useTheme, createTheme } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ShortcutsHelp from './components/ShortcutsHelp';
import ErrorBoundary from './components/ErrorBoundary';
import SEO from './components/SEO';
import Footer from './components/Footer';
import { IntroDirector, PageStage } from './motion/IntroDirector';
import { RealityProvider, useReality } from './context/RealityContext';
import RealityBackgroundCanvas from './components/RealityBackgroundCanvas';
import RealityZothBotHUD from './components/RealityZothBotHUD';

// Code-split route modules for instant initial load and on-demand streaming
const SwarmPage = lazy(() => import('./pages/SwarmPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
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
const FaqsPage = lazy(() => import('./pages/FaqsPage'));
const AXPage = lazy(() => import('./pages/AXPage'));
const AXShowcasePage = lazy(() => import('./pages/AXShowcasePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const VoiceStationPage = lazy(() => import('./pages/VoiceStationPage'));
const AgoraPage = lazy(() => import('./pages/AgoraPage'));

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
  // Page-level boundary keyed on the route: a crashing page no longer takes down the
  // navbar, and navigating to another page recovers automatically.
  const { pathname: routePath } = useLocation();
  const theme = useTheme();
  const { reality } = useReality();

  return (
    <IntroDirector>
    <RealityBackgroundCanvas />
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        position: 'relative',
        zIndex: 2,
        '& .MuiPaper-root': {
          borderRadius: reality.cardRadius,
        },
        '& .text-gradient-gold': {
          backgroundImage: `linear-gradient(135deg, ${reality.accent} 0%, ${reality.accentSoft} 50%, ${reality.accent} 100%) !important`,
        },
        '& .MuiButton-containedPrimary': {
          backgroundColor: `${reality.accent} !important`,
          color: '#050609 !important',
          borderRadius: reality.cardRadius,
        },
        '& .section-kicker': {
          color: `${theme.palette.mode === 'dark' ? reality.accent : reality.accentLightMode} !important`,
        },
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
          <ErrorBoundary key={routePath}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/arsenal" element={<ArsenalPage />} />
              <Route path="/adytum" element={<AdytumShowcasePage />} />
              <Route path="/adytum/docs" element={<AdytumPage />} />
              <Route path="/swarm" element={<SwarmShowcasePage />} />
              <Route path="/swarm/docs" element={<SwarmPage />} />
              <Route path="/voice" element={<VoiceStationPage />} />
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
              <Route path="/zothos" element={<Navigate to="/zoth-os" replace />} />
              <Route path="/zoth-os" element={<ZothOSShowcasePage />} />
              <Route path="/zoth-os/docs" element={<ZothOSPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs/math/:pillarId" element={<MathPillarDetailPage />} />
              <Route path="/docs/math" element={<MathPillarsPage />} />
              <Route path="/math-pillars" element={<Navigate to="/docs/math" replace />} />
              <Route path="/faqs" element={<FaqsPage />} />
              <Route path="/ax" element={<AXShowcasePage />} />
              <Route path="/ax/docs" element={<AXPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/agora" element={<AgoraPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <ShortcutsHelp />
          </Suspense>
          </ErrorBoundary>
        </PageStage>
      </Box>
      <RealityZothBotHUD />
      <Footer />
    </Box>
    </IntroDirector>
  );
}

function RealityThemedApp({ mode, onToggleTheme }) {
  const { reality } = useReality();
  const isDark = mode === 'dark';

  const activeTheme = useMemo(() => {
    const base = isDark ? darkTheme : lightTheme;
    return createTheme(base, {
      palette: {
        primary: {
          main: isDark ? reality.accent : reality.accentLightMode,
          light: reality.accentSoft,
          dark: reality.accentLightMode,
        },
        background: {
          default: isDark ? reality.bgDark : '#FFFFFF',
          paper: isDark ? reality.cardBgDark : '#FFFFFF',
        },
      },
      shape: {
        borderRadius: parseInt(reality.cardRadius, 10) || 12,
      },
    });
  }, [isDark, reality]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <AppShell mode={mode} onToggleTheme={onToggleTheme} />
    </ThemeProvider>
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

  const handleToggleTheme = () => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  };

  return (
    <RealityProvider>
      <RealityThemedApp mode={mode} onToggleTheme={handleToggleTheme} />
    </RealityProvider>
  );
}