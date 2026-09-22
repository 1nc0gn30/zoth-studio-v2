import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
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

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', '& > .MuiContainer-root': { flex: 1, width: '100%' } }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adytum" element={<AdytumPage />} />
          <Route path="/swarm" element={<SwarmPage />} />
          <Route path="/bridges" element={<BridgesPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/consensus" element={<ConsensusPage />} />
          <Route path="/webgen" element={<WebGenPage />} />
          <Route path="/hexstrike" element={<HexStrikePage />} />
          <Route path="/zoth-os" element={<ZothOSPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/math/:pillarId" element={<MathPillarDetailPage />} />
          <Route path="/docs/math" element={<MathPillarDetailPage />} />
        </Routes>
      </Box>
      <Box component="footer" sx={{ py: 3, px: 2, borderTop: '1px solid #EAECF0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.25, color: '#667085', fontSize: '0.88rem' }}>
        <Box component="span" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontSize: '1.25rem', color: '#101828' }}>Zoth Studio</Box>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 22, width: 'auto' }} />
          NullAI
        </Box>
      </Box>
    </Box>
  );
}
