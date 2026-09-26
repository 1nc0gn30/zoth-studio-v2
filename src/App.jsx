import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, useTheme } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SwarmPage from './pages/SwarmPage';
import WebGenPage from './pages/WebGenPage';
import HexStrikePage from './pages/HexStrikePage';
import ZothOSPage from './pages/ZothOSPage';
import MemoryPage from './pages/MemoryPage';
import DocsPage from './pages/DocsPage';
import AdytumPage from './pages/AdytumPage';
import MathPillarDetailPage from './pages/MathPillarDetailPage';
import MathPillarsPage from './pages/MathPillarsPage';
import RealToolWorkspacePage from './pages/RealToolWorkspacePage';
import ArsenalPage from './pages/ArsenalPage';
import FaqsPage from './pages/FaqsPage';
import AXPage from './pages/AXPage';
import SEO from './components/SEO';
import Footer from './components/Footer';

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
          '& > .MuiContainer-root': { flex: 1, width: '100%', minWidth: 0 },
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/arsenal" element={<ArsenalPage />} />
          <Route path="/adytum" element={<AdytumPage />} />
          <Route path="/swarm" element={<SwarmPage />} />
          <Route path="/bridges" element={<Navigate to="/arsenal" replace />} />
          <Route path="/tools" element={<Navigate to="/arsenal" replace />} />
          <Route path="/workstations" element={<Navigate to="/arsenal" replace />} />
          <Route path="/workstations/:workstationId" element={<WorkstationRedirect />} />
          <Route path="/templates" element={<Navigate to="/arsenal" replace />} />
          <Route path="/tools/:toolId" element={<RealToolWorkspacePage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/consensus" element={<Navigate to="/arsenal" replace />} />
          <Route path="/webgen" element={<WebGenPage />} />
          <Route path="/hexstrike" element={<HexStrikePage />} />
          <Route path="/zoth-os" element={<ZothOSPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/math/:pillarId" element={<MathPillarDetailPage />} />
          <Route path="/docs/math" element={<MathPillarsPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/ax" element={<AXPage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
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