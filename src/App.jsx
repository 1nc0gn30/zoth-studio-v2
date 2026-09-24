import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, useTheme } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SwarmPage from './pages/SwarmPage';
import BridgesPage from './pages/BridgesPage';
import ToolsPage from './pages/ToolsPage';
import ConsensusPage from './pages/ConsensusPage';
import WebGenPage from './pages/WebGenPage';
import HexStrikePage from './pages/HexStrikePage';
import ZothOSPage from './pages/ZothOSPage';
import MemoryPage from './pages/MemoryPage';
import DocsPage from './pages/DocsPage';
import AdytumPage from './pages/AdytumPage';
import MathPillarDetailPage from './pages/MathPillarDetailPage';
import RealToolWorkspacePage from './pages/RealToolWorkspacePage';
import WorkstationsPage from './pages/WorkstationsPage';
import WorkstationDetailPage from './pages/WorkstationDetailPage';
import TemplatesPage from './pages/TemplatesPage';
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
          <Route path="/adytum" element={<AdytumPage />} />
          <Route path="/swarm" element={<SwarmPage />} />
          <Route path="/bridges" element={<BridgesPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/workstations" element={<WorkstationsPage />} />
          <Route path="/workstations/:workstationId" element={<WorkstationDetailPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/tools/:toolId" element={<RealToolWorkspacePage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/consensus" element={<ConsensusPage />} />
          <Route path="/webgen" element={<WebGenPage />} />
          <Route path="/hexstrike" element={<HexStrikePage />} />
          <Route path="/zoth-os" element={<ZothOSPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/math/:pillarId" element={<MathPillarDetailPage />} />
          <Route path="/docs/math" element={<MathPillarDetailPage />} />
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