import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Menu, MenuItem,
  Dialog, DialogContent, InputBase, Paper, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HubIcon from '@mui/icons-material/Hub';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import GavelIcon from '@mui/icons-material/Gavel';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import CableIcon from '@mui/icons-material/Cable';
import WebIcon from '@mui/icons-material/Web';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import GoldenZLogo3D from './GoldenZLogo3D';
import { microTools } from '../data/toolsData';
import { workstations } from '../data/workstations';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// Flagship Primary Links
const primaryNav = [
  { label: 'Workstations', path: '/workstations', badge: '37' },
  { label: 'Tools', path: '/tools', badge: '25' },
  { label: 'Memory', path: '/memory', pulse: true },
  { label: 'Swarm', path: '/swarm', badge: '21' },
  { label: 'Consensus', path: '/consensus' },
];

// Enclaves Dropdown
const enclaveItems = [
  { label: 'Adytum Sanctum Vault', path: '/adytum', desc: 'Argon2id KDF & hardware-anchored key derivation', icon: <VpnKeyIcon fontSize="small" sx={{ color: '#D4AF37' }} /> },
  { label: 'HexStrike Arsenal', path: '/hexstrike', desc: 'Threat intelligence, CVE matrix & offensive terminal', icon: <SecurityIcon fontSize="small" sx={{ color: '#EF4444' }} /> },
  { label: 'Zoth OS Sandbox', path: '/zoth-os', desc: 'Hardware-isolated Linux KVM hypervisor enclave', icon: <TerminalIcon fontSize="small" sx={{ color: '#10B981' }} /> },
  { label: 'Sovereign Bridges', path: '/bridges', desc: 'E2EE Signal mesh & loopback WebSocket pinger', icon: <CableIcon fontSize="small" sx={{ color: '#3B82F6' }} /> },
  { label: 'WebGen Layout Foundry', path: '/webgen', desc: 'Zero-cloud polyglot framework UI synthesizer', icon: <WebIcon fontSize="small" sx={{ color: '#F59E0B' }} /> },
  { label: 'Open-Source Templates', path: '/templates', desc: 'Curated library of sovereign agent scaffolds', icon: <FolderZipIcon fontSize="small" sx={{ color: '#8B5CF6' }} /> },
];

// Knowledge Dropdown
const knowledgeItems = [
  { label: 'Documentation', path: '/docs', desc: 'Zero-egress invariants, system topology & architecture', icon: <MenuBookIcon fontSize="small" sx={{ color: '#D4AF37' }} /> },
  { label: 'Six Math Pillars', path: '/docs/math', desc: 'Formal theory: STDP, Byzantine math & Shannon entropy', icon: <FunctionsIcon fontSize="small" sx={{ color: '#60A5FA' }} /> },
  { label: 'Architecture FAQs', path: '/faqs', desc: 'Answers regarding Lucy Oracle, offline daemons & safety', icon: <HelpOutlineIcon fontSize="small" sx={{ color: '#34D399' }} /> },
  { label: 'Agent Experience (AX)', path: '/ax', desc: 'Machine-readable schemas & autonomous crawler endpoints', icon: <PrecisionManufacturingIcon fontSize="small" sx={{ color: '#A78BFA' }} /> },
];

export default function Navbar({ mode, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enclaveAnchor, setEnclaveAnchor] = useState(null);
  const [knowledgeAnchor, setKnowledgeAnchor] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const appBarBg = dark ? 'rgba(8, 8, 11, 0.92)' : 'rgba(255, 255, 255, 0.96)';
  const borderColor = theme.palette.divider;
  const brandColor = dark ? '#F5E6AB' : '#101828';
  const navIdle = dark ? '#9CA3AF' : '#475467';
  const navActive = dark ? '#D4AF37' : '#B8860B';
  const goldAccent = dark ? '#D4AF37' : '#B8860B';

  // Global Keyboard Shortcut: ⌘K or Ctrl+K opens Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEnclaves = (event) => setEnclaveAnchor(event.currentTarget);
  const handleCloseEnclaves = () => setEnclaveAnchor(null);

  const handleOpenKnowledge = (event) => setKnowledgeAnchor(event.currentTarget);
  const handleCloseKnowledge = () => setKnowledgeAnchor(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const isEnclaveActive = enclaveItems.some((item) => location.pathname === item.path);
  const isKnowledgeActive = knowledgeItems.some((item) => location.pathname.startsWith(item.path));

  // Search Results for Command Palette
  const filteredTools = microTools.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const filteredWorkstations = workstations.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.band.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const handleSelectRoute = (path) => {
    setPaletteOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: appBarBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${borderColor}`,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72, gap: 1 }}>

          {/* Left: Brand Logo & Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none', color: brandColor }}>
              <GoldenZLogo3D size={38} />
              <Box>
                <Typography
                  component="div"
                  sx={{
                    fontFamily: '"Celtic Garamond", Georgia, serif',
                    fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.55rem' },
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                    fontWeight: 700,
                    color: brandColor,
                  }}
                >
                  Zoth Studio
                </Typography>
              </Box>
            </Box>

            {/* Enclave Air-Gapped Pill */}
            <Chip
              icon={
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                    ml: '6px !important',
                  }}
                />
              }
              label="AIR-GAPPED v2.0"
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                bgcolor: dark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                color: dark ? '#6EE7B7' : '#065F46',
                border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0'}`,
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: mono,
                height: 22,
                cursor: 'default',
              }}
            />
          </Box>

          {/* Center: Desktop Navigation Bar */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              bgcolor: dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              p: '4px 6px',
              borderRadius: 9999,
              border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
            }}
          >
            {primaryNav.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: active ? navActive : navIdle,
                    fontWeight: active ? 800 : 600,
                    borderRadius: 9999,
                    px: 1.4,
                    py: 0.6,
                    minWidth: 0,
                    fontSize: '0.84rem',
                    bgcolor: active ? (dark ? 'rgba(212,175,55,0.16)' : '#FEF9E7') : 'transparent',
                    border: active ? `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}` : '1px solid transparent',
                    transition: 'all 0.18s ease-in-out',
                    '&:hover': {
                      color: navActive,
                      bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {item.pulse && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: goldAccent,
                          boxShadow: `0 0 6px ${goldAccent}`,
                          animation: 'pulse 2s infinite',
                        }}
                      />
                    )}
                    <span>{item.label}</span>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          bgcolor: active ? (dark ? '#D4AF37' : '#B8860B') : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                          color: active ? '#08080B' : (dark ? '#D1D5DB' : '#4B5563'),
                          px: 0,
                          cursor: 'pointer',
                        }}
                      />
                    )}
                  </Box>
                </Button>
              );
            })}

            {/* Enclaves Dropdown Trigger */}
            <Button
              onClick={handleOpenEnclaves}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '18px !important', transform: enclaveAnchor ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
              sx={{
                color: isEnclaveActive ? navActive : navIdle,
                fontWeight: isEnclaveActive ? 800 : 600,
                borderRadius: 9999,
                px: 1.4,
                py: 0.6,
                minWidth: 0,
                fontSize: '0.84rem',
                bgcolor: isEnclaveActive ? (dark ? 'rgba(212,175,55,0.16)' : '#FEF9E7') : 'transparent',
                border: isEnclaveActive ? `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}` : '1px solid transparent',
                transition: 'all 0.18s ease-in-out',
                '&:hover': {
                  color: navActive,
                  bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
                },
              }}
            >
              Enclaves
            </Button>

            {/* Knowledge Dropdown Trigger */}
            <Button
              onClick={handleOpenKnowledge}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '18px !important', transform: knowledgeAnchor ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
              sx={{
                color: isKnowledgeActive ? navActive : navIdle,
                fontWeight: isKnowledgeActive ? 800 : 600,
                borderRadius: 9999,
                px: 1.4,
                py: 0.6,
                minWidth: 0,
                fontSize: '0.84rem',
                bgcolor: isKnowledgeActive ? (dark ? 'rgba(212,175,55,0.16)' : '#FEF9E7') : 'transparent',
                border: isKnowledgeActive ? `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}` : '1px solid transparent',
                transition: 'all 0.18s ease-in-out',
                '&:hover': {
                  color: navActive,
                  bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
                },
              }}
            >
              Knowledge
            </Button>
          </Box>

          {/* Right Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
            {/* Quick Command Palette Search Button */}
            <Button
              size="small"
              onClick={() => setPaletteOpen(true)}
              startIcon={<SearchIcon sx={{ color: goldAccent, fontSize: '18px !important' }} />}
              endIcon={
                <Chip
                  label="⌘K"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    color: dark ? '#9CA3AF' : '#6B7280',
                    px: 0,
                    cursor: 'pointer',
                  }}
                />
              }
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                color: navIdle,
                bgcolor: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                borderRadius: 9999,
                px: 1.5,
                py: 0.6,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  color: navActive,
                  bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
                  borderColor: goldAccent,
                },
              }}
            >
              Search studio...
            </Button>

            {/* Quick Enclave Status Indicator */}
            <Chip
              component={RouterLink}
              to="/bridges"
              clickable
              label="127.0.0.1"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: dark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
                color: goldAccent,
                border: `1px solid ${dark ? 'rgba(212,175,55,0.3)' : '#F5E6AB'}`,
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: mono,
                height: 28,
                '&:hover': { bgcolor: dark ? 'rgba(212,175,55,0.18)' : '#FDF3D0' },
              }}
            />

            {/* NullAI External Link */}
            <Button
              variant="contained"
              color="primary"
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 20, width: 'auto' }} />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 800,
                px: 2,
                py: 0.7,
                fontSize: '0.82rem',
                borderRadius: 9999,
              }}
            >
              NullAI
            </Button>

            {/* Theme Toggle */}
            <IconButton
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={onToggleTheme}
              sx={{
                color: dark ? '#F5E6AB' : '#101828',
                border: `1px solid ${borderColor}`,
                background: dark ? 'rgba(212,175,55,0.08)' : 'transparent',
                '&:hover': {
                  color: '#D4AF37',
                  borderColor: '#D4AF37',
                  background: dark ? 'rgba(212,175,55,0.16)' : 'rgba(212,175,55,0.08)',
                },
              }}
            >
              {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>

            {/* Mobile / Tablet Menu Button */}
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              aria-label="Open sovereign navigation drawer"
              sx={{
                display: { xs: 'inline-flex', lg: 'none' },
                color: brandColor,
                border: `1px solid ${borderColor}`,
                p: 0.85,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Enclaves Dropdown Menu */}
      <Menu
        anchorEl={enclaveAnchor}
        open={Boolean(enclaveAnchor)}
        onClose={handleCloseEnclaves}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            maxWidth: 440,
            p: 1,
            borderRadius: 3,
            bgcolor: dark ? '#0D0E15' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(212,175,55,0.35)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: dark ? '0 12px 36px rgba(0,0,0,0.7), 0 0 20px rgba(212,175,55,0.15)' : '0 12px 32px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Hardware Enclaves &amp; Sandboxes
        </Typography>
        <Divider sx={{ mb: 1, opacity: 0.5 }} />
        {enclaveItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <MenuItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={handleCloseEnclaves}
              selected={selected}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                mb: 0.5,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                '&.Mui-selected': { bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7' },
                '&:hover': { bgcolor: dark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>{item.icon}</ListItemIcon>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: selected ? goldAccent : (dark ? '#F3F4F6' : '#111827'), whiteSpace: 'normal' }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', display: 'block', fontSize: '0.74rem', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.35, mt: 0.25 }}>
                  {item.desc}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Knowledge Dropdown Menu */}
      <Menu
        anchorEl={knowledgeAnchor}
        open={Boolean(knowledgeAnchor)}
        onClose={handleCloseKnowledge}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            maxWidth: 440,
            p: 1,
            borderRadius: 3,
            bgcolor: dark ? '#0D0E15' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(212,175,55,0.35)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: dark ? '0 12px 36px rgba(0,0,0,0.7), 0 0 20px rgba(212,175,55,0.15)' : '0 12px 32px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Theory &amp; Specifications
        </Typography>
        <Divider sx={{ mb: 1, opacity: 0.5 }} />
        {knowledgeItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <MenuItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={handleCloseKnowledge}
              selected={selected}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                mb: 0.5,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                '&.Mui-selected': { bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7' },
                '&:hover': { bgcolor: dark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>{item.icon}</ListItemIcon>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: selected ? goldAccent : (dark ? '#F3F4F6' : '#111827'), whiteSpace: 'normal' }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', display: 'block', fontSize: '0.74rem', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.35, mt: 0.25 }}>
                  {item.desc}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Global Command Palette (⌘K) Dialog */}
      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: dark ? '#0A0A10' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#E5E7EB'}`,
            borderRadius: 3,
            boxShadow: dark ? '0 16px 48px rgba(0,0,0,0.8), 0 0 32px rgba(212,175,55,0.2)' : '0 16px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Input Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${borderColor}` }}>
            <SearchIcon sx={{ color: goldAccent }} />
            <InputBase
              autoFocus
              fullWidth
              placeholder="Search all 25 tools, 37 workstations, hubs, or documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ color: theme.palette.text.primary, fontSize: '1rem', fontFamily: 'inherit' }}
            />
            <IconButton size="small" onClick={() => setPaletteOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Quick Jump List */}
          <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }}>
            {/* Core Hubs */}
            <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase' }}>
              Flagship Studios
            </Typography>
            <List dense disablePadding>
              {primaryNav.map((n) => (
                <ListItem key={n.path} disablePadding>
                  <ListItemButton onClick={() => handleSelectRoute(n.path)} sx={{ borderRadius: 1.5, my: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><HubIcon sx={{ color: goldAccent, fontSize: 18 }} /></ListItemIcon>
                    <ListItemText primary={n.label} primaryTypographyProps={{ fontWeight: 700 }} />
                    <Chip label="Studio" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Matching Tools */}
            <Typography variant="caption" sx={{ px: 2, pt: 0.5, display: 'block', fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase' }}>
              Developer Tools ({filteredTools.length})
            </Typography>
            <List dense disablePadding>
              {filteredTools.map((t) => (
                <ListItem key={t.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectRoute(`/tools/${t.id}`)} sx={{ borderRadius: 1.5, my: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><FlashOnIcon sx={{ color: '#60A5FA', fontSize: 18 }} /></ListItemIcon>
                    <ListItemText
                      primary={t.name}
                      secondary={t.category}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                      secondaryTypographyProps={{ fontSize: '0.72rem' }}
                    />
                    <Chip label="Open Tool" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: dark ? 'rgba(96,165,250,0.12)' : '#EFF6FF', color: '#60A5FA', fontWeight: 700 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Matching Workstations */}
            <Typography variant="caption" sx={{ px: 2, pt: 0.5, display: 'block', fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase' }}>
              Workstations ({filteredWorkstations.length})
            </Typography>
            <List dense disablePadding>
              {filteredWorkstations.map((w) => (
                <ListItem key={w.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectRoute(`/workstations/${w.id}`)} sx={{ borderRadius: 1.5, my: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><TerminalIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                    <ListItemText
                      primary={w.name}
                      secondary={`Band: ${w.band}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                      secondaryTypographyProps={{ fontSize: '0.72rem' }}
                    />
                    <Chip label="Workstation" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', color: '#10B981', fontWeight: 700 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 300,
            bgcolor: dark ? '#08080B' : '#FFFFFF',
            borderRight: `1px solid ${borderColor}`,
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <GoldenZLogo3D size={32} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldAccent, lineHeight: 1.1 }}>
                ZOTH STUDIO
              </Typography>
              <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontFamily: mono }}>
                Zero-Egress v2.0
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Navigation Scrollable Area */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {/* Primary Hubs */}
            <Typography variant="caption" sx={{ px: 1.5, fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Core Studios
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {primaryNav.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={handleDrawerToggle}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 1.5,
                      my: 0.25,
                      '&.Mui-selected': { bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7' },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 800 : 600,
                        color: location.pathname === item.path ? goldAccent : theme.palette.text.primary,
                        fontSize: '0.9rem',
                      }}
                    />
                    {item.badge && (
                      <Chip label={item.badge} size="small" sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Enclaves */}
            <Typography variant="caption" sx={{ px: 1.5, fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enclaves &amp; Tools
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {enclaveItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={handleDrawerToggle}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 1.5,
                      my: 0.25,
                      '&.Mui-selected': { bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 800 : 500,
                        color: location.pathname === item.path ? goldAccent : theme.palette.text.primary,
                        fontSize: '0.86rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Knowledge */}
            <Typography variant="caption" sx={{ px: 1.5, fontWeight: 800, color: dark ? '#6B7280' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Knowledge &amp; Specs
            </Typography>
            <List dense>
              {knowledgeItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={handleDrawerToggle}
                    selected={location.pathname.startsWith(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      my: 0.25,
                      '&.Mui-selected': { bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: location.pathname.startsWith(item.path) ? 800 : 500,
                        color: location.pathname.startsWith(item.path) ? goldAccent : theme.palette.text.primary,
                        fontSize: '0.86rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Drawer Footer Status */}
          <Box sx={{ p: 1.5, bgcolor: dark ? 'rgba(212,175,55,0.06)' : '#FEF9E7', borderRadius: 2, border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : '#F0E1A8'}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: goldAccent, fontFamily: mono }}>
                LOCAL ENCLAVE ACTIVE
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', display: 'block', fontSize: '0.72rem', mt: 0.5 }}>
              127.0.0.1 loopback isolation · Zero external egress
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}