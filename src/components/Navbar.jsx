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
        position: 'sticky',
        top: 0,
        background: dark
          ? 'linear-gradient(180deg, rgba(14, 15, 22, 0.88) 0%, rgba(8, 8, 11, 0.82) 100%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 249, 250, 0.90) 100%)',
        backdropFilter: 'blur(32px) saturate(190%)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        zIndex: 1100,
        borderBottom: 'none',
        boxShadow: dark
          ? '0 12px 32px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
          : '0 4px 20px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: dark
            ? 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 15%, rgba(212, 175, 55, 0.55) 50%, rgba(212, 175, 55, 0.2) 85%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.25) 15%, rgba(184, 134, 11, 0.45) 50%, rgba(212, 175, 55, 0.25) 85%, transparent 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72, gap: 1 }}>

          {/* Left: Brand Logo & Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: brandColor,
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  '& .brand-logo-container': {
                    transform: 'scale(1.06)',
                    borderColor: goldAccent,
                    boxShadow: dark
                      ? '0 0 20px rgba(212, 175, 55, 0.35), inset 0 0 10px rgba(212, 175, 55, 0.2)'
                      : '0 0 16px rgba(212, 175, 55, 0.3), inset 0 0 8px rgba(212, 175, 55, 0.15)',
                    '&::before': {
                      opacity: 1,
                      transform: 'scale(1.15)',
                    },
                  },
                  '& .brand-title': {
                    color: goldAccent,
                    textShadow: dark ? '0 0 16px rgba(212, 175, 55, 0.45)' : 'none',
                  },
                },
              }}
            >
              <Box
                className="brand-logo-container"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  borderRadius: '12px',
                  background: dark
                    ? 'radial-gradient(circle at center, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.06) 55%, transparent 80%)'
                    : 'radial-gradient(circle at center, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.04) 55%, transparent 80%)',
                  border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.2)'}`,
                  boxShadow: dark
                    ? '0 0 14px rgba(212, 175, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 0 10px rgba(212, 175, 55, 0.08), inset 0 1px 0 #FFFFFF',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -5,
                    borderRadius: '16px',
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.28) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 75%)',
                    opacity: 0.6,
                    filter: 'blur(8px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    pointerEvents: 'none',
                  },
                }}
              >
                <GoldenZLogo3D size={38} />
              </Box>
              <Box>
                <Typography
                  className="brand-title"
                  component="div"
                  sx={{
                    fontFamily: '"Celtic Garamond", Georgia, serif',
                    fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.55rem' },
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                    fontWeight: 700,
                    color: brandColor,
                    transition: 'color 0.25s ease, text-shadow 0.25s ease',
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
                    boxShadow: '0 0 8px #10B981, 0 0 2px #10B981',
                    ml: '6px !important',
                    animation: 'statusDotPulse 2.5s infinite ease-in-out',
                    '@keyframes statusDotPulse': {
                      '0%': { opacity: 0.8, transform: 'scale(0.95)' },
                      '50%': { opacity: 1, transform: 'scale(1.2)', boxShadow: '0 0 12px #10B981, 0 0 4px #10B981' },
                      '100%': { opacity: 0.8, transform: 'scale(0.95)' },
                    },
                  }}
                />
              }
              label="AIR-GAPPED v2.0"
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                bgcolor: dark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                color: dark ? '#6EE7B7' : '#065F46',
                border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.28)' : '#A7F3D0'}`,
                boxShadow: dark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none',
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: mono,
                height: 22,
                cursor: 'default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#10B981',
                  bgcolor: dark ? 'rgba(16, 185, 129, 0.12)' : '#D1FAE5',
                },
              }}
            />
          </Box>

          {/* Center: Desktop Navigation Bar */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              background: dark
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)'
                : 'linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.04) 100%)',
              p: '4px 6px',
              borderRadius: 9999,
              border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: dark
                ? 'inset 0 1px 1px rgba(255, 255, 255, 0.06), 0 4px 12px rgba(0, 0, 0, 0.35)'
                : 'inset 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.04)',
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
                    position: 'relative',
                    overflow: 'hidden',
                    color: active ? navActive : navIdle,
                    fontWeight: active ? 800 : 600,
                    borderRadius: 9999,
                    px: 1.5,
                    py: 0.65,
                    minWidth: 0,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    bgcolor: active
                      ? (dark ? 'rgba(212, 175, 55, 0.16)' : '#FEF9E7')
                      : 'transparent',
                    border: active
                      ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                      : '1px solid transparent',
                    boxShadow: active
                      ? (dark
                          ? '0 0 16px rgba(212, 175, 55, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                          : '0 2px 8px rgba(212, 175, 55, 0.18), inset 0 1px 0 #FFFFFF')
                      : 'none',
                    transform: 'translateY(0) scale(1)',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': active ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '60%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
                      transform: 'skewX(-25deg)',
                      transition: 'left 0.75s ease',
                      pointerEvents: 'none',
                    } : undefined,
                    '&:hover': {
                      color: navActive,
                      transform: 'translateY(-1.5px) scale(1.025)',
                      bgcolor: active
                        ? (dark ? 'rgba(212, 175, 55, 0.24)' : '#FDF4D4')
                        : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.06)'),
                      borderColor: active
                        ? (dark ? 'rgba(212, 175, 55, 0.65)' : '#E8D48E')
                        : (dark ? 'rgba(212, 175, 55, 0.28)' : 'rgba(212, 175, 55, 0.22)'),
                      boxShadow: active
                        ? (dark
                            ? '0 6px 20px rgba(212, 175, 55, 0.35), 0 0 10px rgba(212, 175, 55, 0.3)'
                            : '0 4px 14px rgba(212, 175, 55, 0.28)')
                        : (dark ? '0 3px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.06)'),
                      '&::after': active ? {
                        left: '150%',
                      } : undefined,
                    },
                    '&:active': {
                      transform: 'translateY(0.5px) scale(0.985)',
                      boxShadow: dark
                        ? 'inset 0 2px 5px rgba(0, 0, 0, 0.5)'
                        : 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, position: 'relative', zIndex: 1 }}>
                    {item.pulse && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: goldAccent,
                          boxShadow: `0 0 8px ${goldAccent}, 0 0 2px ${goldAccent}`,
                          animation: 'navPulse 2s infinite ease-in-out',
                          '@keyframes navPulse': {
                            '0%': { transform: 'scale(0.95)', boxShadow: `0 0 4px ${goldAccent}` },
                            '50%': { transform: 'scale(1.25)', boxShadow: `0 0 12px ${goldAccent}, 0 0 4px ${goldAccent}` },
                            '100%': { transform: 'scale(0.95)', boxShadow: `0 0 4px ${goldAccent}` },
                          },
                        }}
                      />
                    )}
                    <span>{item.label}</span>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 17,
                          minWidth: 20,
                          fontSize: '0.65rem',
                          fontFamily: mono,
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          bgcolor: active
                            ? (dark ? '#D4AF37' : '#B8860B')
                            : (dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'),
                          color: active
                            ? (dark ? '#08080B' : '#FFFFFF')
                            : (dark ? '#D1D5DB' : '#4B5563'),
                          border: active
                            ? 'none'
                            : `1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                          boxShadow: active
                            ? `0 0 8px ${dark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(184, 134, 11, 0.35)'}`
                            : 'none',
                          borderRadius: '6px',
                          px: 0.5,
                          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                          '.MuiButtonBase-root:hover &': {
                            bgcolor: active
                              ? (dark ? '#E2C35D' : '#996F08')
                              : (dark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(212, 175, 55, 0.18)'),
                            color: active
                              ? (dark ? '#08080B' : '#FFFFFF')
                              : (dark ? '#F5E6AB' : '#856404'),
                            borderColor: dark ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.3)',
                          },
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
              endIcon={
                <KeyboardArrowDownIcon
                  className="dropdown-icon"
                  sx={{
                    fontSize: '18px !important',
                    transform: enclaveAnchor ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
                  }}
                />
              }
              sx={{
                color: isEnclaveActive ? navActive : navIdle,
                fontWeight: isEnclaveActive ? 800 : 600,
                borderRadius: 9999,
                px: 1.5,
                py: 0.65,
                minWidth: 0,
                fontSize: '0.84rem',
                textTransform: 'none',
                bgcolor: isEnclaveActive
                  ? (dark ? 'rgba(212, 175, 55, 0.16)' : '#FEF9E7')
                  : (enclaveAnchor ? (dark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)') : 'transparent'),
                border: isEnclaveActive
                  ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                  : `1px dashed ${enclaveAnchor ? goldAccent : (dark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(0, 0, 0, 0.14)')}`,
                boxShadow: isEnclaveActive
                  ? (dark
                      ? '0 0 16px rgba(212, 175, 55, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                      : '0 2px 8px rgba(212, 175, 55, 0.18), inset 0 1px 0 #FFFFFF')
                  : 'none',
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: navActive,
                  transform: 'translateY(-1.5px) scale(1.025)',
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7',
                  borderColor: goldAccent,
                  borderStyle: 'solid',
                  boxShadow: dark
                    ? '0 4px 16px rgba(212, 175, 55, 0.25), inset 0 0 8px rgba(212, 175, 55, 0.1)'
                    : '0 3px 12px rgba(212, 175, 55, 0.18)',
                  '& .dropdown-icon': {
                    color: goldAccent,
                    transform: enclaveAnchor ? 'rotate(180deg)' : 'translateY(1.5px)',
                  },
                },
                '&:active': {
                  transform: 'translateY(0.5px) scale(0.985)',
                  boxShadow: dark
                    ? 'inset 0 2px 5px rgba(0, 0, 0, 0.5)'
                    : 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                },
              }}
            >
              Enclaves
            </Button>

            {/* Knowledge Dropdown Trigger */}
            <Button
              onClick={handleOpenKnowledge}
              endIcon={
                <KeyboardArrowDownIcon
                  className="dropdown-icon"
                  sx={{
                    fontSize: '18px !important',
                    transform: knowledgeAnchor ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
                  }}
                />
              }
              sx={{
                color: isKnowledgeActive ? navActive : navIdle,
                fontWeight: isKnowledgeActive ? 800 : 600,
                borderRadius: 9999,
                px: 1.5,
                py: 0.65,
                minWidth: 0,
                fontSize: '0.84rem',
                textTransform: 'none',
                bgcolor: isKnowledgeActive
                  ? (dark ? 'rgba(212, 175, 55, 0.16)' : '#FEF9E7')
                  : (knowledgeAnchor ? (dark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)') : 'transparent'),
                border: isKnowledgeActive
                  ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                  : `1px dashed ${knowledgeAnchor ? goldAccent : (dark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(0, 0, 0, 0.14)')}`,
                boxShadow: isKnowledgeActive
                  ? (dark
                      ? '0 0 16px rgba(212, 175, 55, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                      : '0 2px 8px rgba(212, 175, 55, 0.18), inset 0 1px 0 #FFFFFF')
                  : 'none',
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: navActive,
                  transform: 'translateY(-1.5px) scale(1.025)',
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7',
                  borderColor: goldAccent,
                  borderStyle: 'solid',
                  boxShadow: dark
                    ? '0 4px 16px rgba(212, 175, 55, 0.25), inset 0 0 8px rgba(212, 175, 55, 0.1)'
                    : '0 3px 12px rgba(212, 175, 55, 0.18)',
                  '& .dropdown-icon': {
                    color: goldAccent,
                    transform: knowledgeAnchor ? 'rotate(180deg)' : 'translateY(1.5px)',
                  },
                },
                '&:active': {
                  transform: 'translateY(0.5px) scale(0.985)',
                  boxShadow: dark
                    ? 'inset 0 2px 5px rgba(0, 0, 0, 0.5)'
                    : 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
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
                    bgcolor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    color: dark ? '#9CA3AF' : '#6B7280',
                    border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    px: 0.2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '.MuiButtonBase-root:hover &': {
                      bgcolor: dark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                      color: goldAccent,
                      borderColor: dark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.3)',
                    },
                  }}
                />
              }
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                color: navIdle,
                bgcolor: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                boxShadow: dark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04)' : 'none',
                borderRadius: 9999,
                px: 1.6,
                py: 0.65,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: navActive,
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.1)' : '#FEF9E7',
                  borderColor: goldAccent,
                  transform: 'translateY(-1.5px) scale(1.025)',
                  boxShadow: dark
                    ? '0 4px 16px rgba(212, 175, 55, 0.22)'
                    : '0 3px 12px rgba(212, 175, 55, 0.15)',
                },
                '&:active': {
                  transform: 'translateY(0.5px) scale(0.985)',
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
                bgcolor: dark ? 'rgba(212, 175, 55, 0.08)' : '#FEF9E7',
                color: goldAccent,
                border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.3)' : '#F5E6AB'}`,
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: mono,
                height: 28,
                borderRadius: 9999,
                boxShadow: dark ? '0 0 10px rgba(212, 175, 55, 0.1)' : 'none',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.18)' : '#FDF3D0',
                  borderColor: goldAccent,
                  transform: 'translateY(-1px) scale(1.03)',
                  boxShadow: dark ? '0 4px 14px rgba(212, 175, 55, 0.25)' : '0 2px 8px rgba(212, 175, 55, 0.2)',
                },
                '&:active': {
                  transform: 'translateY(0.5px) scale(0.98)',
                },
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
                textTransform: 'none',
                boxShadow: dark ? '0 2px 10px rgba(212, 175, 55, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1.5px) scale(1.025)',
                  boxShadow: dark
                    ? '0 6px 20px rgba(212, 175, 55, 0.4), 0 0 12px rgba(212, 175, 55, 0.3)'
                    : '0 4px 14px rgba(0, 0, 0, 0.15)',
                },
                '&:active': {
                  transform: 'translateY(0.5px) scale(0.985)',
                },
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
                background: dark ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                borderRadius: '10px',
                p: 0.85,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#D4AF37',
                  borderColor: '#D4AF37',
                  background: dark ? 'rgba(212, 175, 55, 0.18)' : 'rgba(212, 175, 55, 0.1)',
                  transform: 'scale(1.08) rotate(8deg)',
                  boxShadow: '0 0 14px rgba(212, 175, 55, 0.3)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
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
                borderRadius: '10px',
                p: 0.85,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: goldAccent,
                  borderColor: goldAccent,
                  background: dark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.08)',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
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
          elevation: 0,
          sx: {
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 410 },
            maxWidth: 440,
            p: 1.2,
            borderRadius: '16px',
            bgcolor: dark ? 'rgba(13, 14, 21, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.25)'}`,
            boxShadow: dark
              ? '0 20px 48px -8px rgba(0, 0, 0, 0.85), 0 0 24px rgba(212, 175, 55, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 20px 40px -8px rgba(0, 0, 0, 0.14), 0 0 16px rgba(212, 175, 55, 0.12), inset 0 1px 0 #FFFFFF',
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: mono, fontSize: '0.7rem' }}>
          Hardware Enclaves &amp; Sandboxes
        </Typography>
        <Divider sx={{ mb: 1, opacity: 0.4, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)' }} />
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
                borderRadius: '10px',
                py: 1.2,
                px: 1.5,
                mb: 0.5,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: selected
                  ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.35)' : '#F0E1A8'}`
                  : '1px solid transparent',
                '&.Mui-selected': {
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7',
                  boxShadow: dark ? 'inset 0 1px 0 rgba(212, 175, 55, 0.2)' : 'none',
                },
                '&:hover': {
                  bgcolor: selected
                    ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4')
                    : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                  borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  mt: 0.25,
                  transition: 'transform 0.2s ease',
                  '.MuiMenuItem-root:hover &': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
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
          elevation: 0,
          sx: {
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 410 },
            maxWidth: 440,
            p: 1.2,
            borderRadius: '16px',
            bgcolor: dark ? 'rgba(13, 14, 21, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.25)'}`,
            boxShadow: dark
              ? '0 20px 48px -8px rgba(0, 0, 0, 0.85), 0 0 24px rgba(212, 175, 55, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 20px 40px -8px rgba(0, 0, 0, 0.14), 0 0 16px rgba(212, 175, 55, 0.12), inset 0 1px 0 #FFFFFF',
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: mono, fontSize: '0.7rem' }}>
          Theory &amp; Specifications
        </Typography>
        <Divider sx={{ mb: 1, opacity: 0.4, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)' }} />
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
                borderRadius: '10px',
                py: 1.2,
                px: 1.5,
                mb: 0.5,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: selected
                  ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.35)' : '#F0E1A8'}`
                  : '1px solid transparent',
                '&.Mui-selected': {
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7',
                  boxShadow: dark ? 'inset 0 1px 0 rgba(212, 175, 55, 0.2)' : 'none',
                },
                '&:hover': {
                  bgcolor: selected
                    ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4')
                    : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                  borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  mt: 0.25,
                  transition: 'transform 0.2s ease',
                  '.MuiMenuItem-root:hover &': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
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
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundColor: dark ? 'rgba(3, 4, 7, 0.78)' : 'rgba(15, 23, 42, 0.4)',
            },
          },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: dark ? 'rgba(10, 10, 16, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
            border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.25)'}`,
            borderRadius: '20px',
            boxShadow: dark
              ? '0 24px 64px -8px rgba(0, 0, 0, 0.9), 0 0 32px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 24px 50px -8px rgba(0, 0, 0, 0.18), 0 0 24px rgba(212, 175, 55, 0.12), inset 0 1px 0 #FFFFFF',
            overflow: 'hidden',
            animation: 'commandPaletteEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes commandPaletteEnter': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.96) translateY(12px)',
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1) translateY(0)',
              },
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Input Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderBottom: `1px solid ${dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
              background: dark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: dark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.08)',
                border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)'}`,
                boxShadow: dark ? '0 0 12px rgba(212, 175, 55, 0.15)' : 'none',
                flexShrink: 0,
                transition: 'all 0.25s ease',
              }}
            >
              <SearchIcon sx={{ color: goldAccent, fontSize: 20 }} />
            </Box>
            <InputBase
              autoFocus
              fullWidth
              placeholder="Search all 25 tools, 37 workstations, hubs, or documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: theme.palette.text.primary,
                fontSize: '0.98rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                '& input::placeholder': {
                  color: dark ? '#9CA3AF' : '#6B7280',
                  opacity: 0.75,
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => setPaletteOpen(false)}
              aria-label="Close command palette"
              sx={{
                p: 0.7,
                borderRadius: '8px',
                color: dark ? '#9CA3AF' : '#6B7280',
                border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                bgcolor: dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: dark ? '#FFFFFF' : '#111827',
                  bgcolor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  borderColor: dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)',
                  transform: 'scale(1.06)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Quick Jump List */}
          <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1.25 }}>
            {/* Core Hubs */}
            <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  color: goldAccent,
                  textTransform: 'uppercase',
                  fontFamily: mono,
                }}
              >
                Flagship Studios
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.66rem', color: dark ? '#6B7280' : '#9CA3AF', fontFamily: mono }}>
                CORE HUBS
              </Typography>
            </Box>
            <List dense disablePadding>
              {primaryNav.map((n) => (
                <ListItem key={n.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectRoute(n.path)}
                    sx={{
                      borderRadius: '10px',
                      my: 0.35,
                      px: 1.5,
                      py: 0.9,
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid transparent',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: dark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
                        borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.25)',
                        transform: 'translateX(4px)',
                        boxShadow: dark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        background: dark
                          ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.04) 100%)'
                          : 'linear-gradient(90deg, rgba(254, 249, 231, 0.9) 0%, rgba(254, 249, 231, 0.4) 100%)',
                      },
                      '&:active': {
                        transform: 'translateX(2px) scale(0.99)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: dark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7',
                          border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.25)' : '#F5E6AB'}`,
                        }}
                      >
                        <HubIcon sx={{ color: goldAccent, fontSize: 16 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={n.label}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                    />
                    <Chip
                      label="Studio"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontFamily: mono,
                        fontWeight: 700,
                        bgcolor: dark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7',
                        color: goldAccent,
                        border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.25)' : '#F5E6AB'}`,
                        borderRadius: '6px',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1.2, borderColor: dark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.06)' }} />

            {/* Matching Tools */}
            <Box sx={{ px: 2, pt: 0.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  color: goldAccent,
                  textTransform: 'uppercase',
                  fontFamily: mono,
                }}
              >
                Developer Tools ({filteredTools.length})
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.66rem', color: dark ? '#6B7280' : '#9CA3AF', fontFamily: mono }}>
                EXECUTABLES
              </Typography>
            </Box>
            <List dense disablePadding>
              {filteredTools.map((t) => (
                <ListItem key={t.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectRoute(`/tools/${t.id}`)}
                    sx={{
                      borderRadius: '10px',
                      my: 0.35,
                      px: 1.5,
                      py: 0.9,
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid transparent',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: dark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.06)',
                        borderColor: dark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.25)',
                        transform: 'translateX(4px)',
                        boxShadow: dark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        background: dark
                          ? 'linear-gradient(90deg, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.03) 100%)'
                          : 'linear-gradient(90deg, rgba(239, 246, 255, 0.9) 0%, rgba(239, 246, 255, 0.4) 100%)',
                      },
                      '&:active': {
                        transform: 'translateX(2px) scale(0.99)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: dark ? 'rgba(96, 165, 250, 0.12)' : '#EFF6FF',
                          border: `1px solid ${dark ? 'rgba(96, 165, 250, 0.25)' : '#BFDBFE'}`,
                        }}
                      >
                        <FlashOnIcon sx={{ color: '#60A5FA', fontSize: 16 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={t.name}
                      secondary={t.category}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                      secondaryTypographyProps={{ fontSize: '0.72rem', fontFamily: mono }}
                    />
                    <Chip
                      label="Open Tool"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontFamily: mono,
                        bgcolor: dark ? 'rgba(96, 165, 250, 0.14)' : '#EFF6FF',
                        color: '#60A5FA',
                        border: `1px solid ${dark ? 'rgba(96, 165, 250, 0.3)' : '#BFDBFE'}`,
                        fontWeight: 700,
                        borderRadius: '6px',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1.2, borderColor: dark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.06)' }} />

            {/* Matching Workstations */}
            <Box sx={{ px: 2, pt: 0.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  color: goldAccent,
                  textTransform: 'uppercase',
                  fontFamily: mono,
                }}
              >
                Workstations ({filteredWorkstations.length})
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.66rem', color: dark ? '#6B7280' : '#9CA3AF', fontFamily: mono }}>
                TERMINALS
              </Typography>
            </Box>
            <List dense disablePadding>
              {filteredWorkstations.map((w) => (
                <ListItem key={w.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectRoute(`/workstations/${w.id}`)}
                    sx={{
                      borderRadius: '10px',
                      my: 0.35,
                      px: 1.5,
                      py: 0.9,
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid transparent',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: dark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)',
                        borderColor: dark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                        transform: 'translateX(4px)',
                        boxShadow: dark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        background: dark
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.03) 100%)'
                          : 'linear-gradient(90deg, rgba(236, 253, 245, 0.9) 0%, rgba(236, 253, 245, 0.4) 100%)',
                      },
                      '&:active': {
                        transform: 'translateX(2px) scale(0.99)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: dark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                          border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0'}`,
                        }}
                      >
                        <TerminalIcon sx={{ color: '#10B981', fontSize: 16 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={w.name}
                      secondary={`Band: ${w.band}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                      secondaryTypographyProps={{ fontSize: '0.72rem', fontFamily: mono }}
                    />
                    <Chip
                      label="Workstation"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontFamily: mono,
                        bgcolor: dark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
                        color: '#10B981',
                        border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0'}`,
                        fontWeight: 700,
                        borderRadius: '6px',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Palette Footer with keyboard navigation cues */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: `1px solid ${dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
              bgcolor: dark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Chip label="↑↓" size="small" sx={{ height: 18, fontSize: '0.65rem', fontFamily: mono, fontWeight: 700, bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontSize: '0.7rem' }}>Navigate</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Chip label="↵" size="small" sx={{ height: 18, fontSize: '0.65rem', fontFamily: mono, fontWeight: 700, bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontSize: '0.7rem' }}>Select</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Chip label="ESC" size="small" sx={{ height: 18, fontSize: '0.65rem', fontFamily: mono, fontWeight: 700, bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
              <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontSize: '0.7rem' }}>Close</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: 310, sm: 340 },
            bgcolor: dark ? 'rgba(10, 10, 15, 0.97)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            borderRight: `1px solid ${dark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.15)'}`,
            boxShadow: dark
              ? '16px 0 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(212, 175, 55, 0.1)'
              : '8px 0 24px rgba(0, 0, 0, 0.08)',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: dark ? 'rgba(3, 4, 7, 0.72)' : 'rgba(15, 23, 42, 0.3)',
            },
          },
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              component={RouterLink}
              to="/"
              onClick={handleDrawerToggle}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: brandColor,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  borderRadius: '10px',
                  background: dark
                    ? 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
                  border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)'}`,
                }}
              >
                <GoldenZLogo3D size={32} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Celtic Garamond", Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1.1,
                    color: brandColor,
                    letterSpacing: '0.02em',
                  }}
                >
                  Zoth Studio
                </Typography>
                <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontFamily: mono, fontSize: '0.7rem' }}>
                  Zero-Egress v2.0
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleDrawerToggle}
              aria-label="Close drawer"
              sx={{
                color: dark ? '#9CA3AF' : '#6B7280',
                border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                borderRadius: '8px',
                p: 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: goldAccent,
                  borderColor: goldAccent,
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.15)' }} />

          {/* Navigation Scrollable Area */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {/* Primary Hubs */}
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                pb: 0.75,
                display: 'block',
                fontWeight: 800,
                color: goldAccent,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: mono,
                fontSize: '0.7rem',
              }}
            >
              Core Studios
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {primaryNav.map((item) => {
                const selected = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      onClick={handleDrawerToggle}
                      selected={selected}
                      sx={{
                        borderRadius: '10px',
                        my: 0.35,
                        px: 1.5,
                        py: 0.9,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: selected
                          ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                          : '1px solid transparent',
                        bgcolor: selected
                          ? (dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7')
                          : 'transparent',
                        boxShadow: selected
                          ? (dark ? '0 2px 10px rgba(212, 175, 55, 0.18)' : '0 1px 4px rgba(212, 175, 55, 0.1)')
                          : 'none',
                        '&:hover': {
                          bgcolor: selected
                            ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4')
                            : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                          borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                          transform: 'translateX(4px)',
                        },
                        '&:active': {
                          transform: 'translateX(2px) scale(0.99)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: selected ? 800 : 600,
                          color: selected ? goldAccent : theme.palette.text.primary,
                          fontSize: '0.9rem',
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: mono,
                            bgcolor: selected ? (dark ? '#D4AF37' : '#B8860B') : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                            color: selected ? '#08080B' : (dark ? '#D1D5DB' : '#4B5563'),
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* Enclaves */}
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                pb: 0.75,
                display: 'block',
                fontWeight: 800,
                color: goldAccent,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: mono,
                fontSize: '0.7rem',
              }}
            >
              Enclaves &amp; Tools
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {enclaveItems.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      onClick={handleDrawerToggle}
                      selected={selected}
                      sx={{
                        borderRadius: '10px',
                        my: 0.35,
                        px: 1.5,
                        py: 0.9,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: selected
                          ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                          : '1px solid transparent',
                        bgcolor: selected
                          ? (dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7')
                          : 'transparent',
                        boxShadow: selected
                          ? (dark ? '0 2px 10px rgba(212, 175, 55, 0.18)' : '0 1px 4px rgba(212, 175, 55, 0.1)')
                          : 'none',
                        '&:hover': {
                          bgcolor: selected
                            ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4')
                            : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                          borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                          transform: 'translateX(4px)',
                        },
                        '&:active': {
                          transform: 'translateX(2px) scale(0.99)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: selected ? 800 : 500,
                          color: selected ? goldAccent : theme.palette.text.primary,
                          fontSize: '0.86rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* Knowledge */}
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                pb: 0.75,
                display: 'block',
                fontWeight: 800,
                color: goldAccent,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: mono,
                fontSize: '0.7rem',
              }}
            >
              Knowledge &amp; Specs
            </Typography>
            <List dense>
              {knowledgeItems.map((item) => {
                const selected = location.pathname.startsWith(item.path);
                return (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      onClick={handleDrawerToggle}
                      selected={selected}
                      sx={{
                        borderRadius: '10px',
                        my: 0.35,
                        px: 1.5,
                        py: 0.9,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: selected
                          ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.45)' : '#F0E1A8'}`
                          : '1px solid transparent',
                        bgcolor: selected
                          ? (dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7')
                          : 'transparent',
                        boxShadow: selected
                          ? (dark ? '0 2px 10px rgba(212, 175, 55, 0.18)' : '0 1px 4px rgba(212, 175, 55, 0.1)')
                          : 'none',
                        '&:hover': {
                          bgcolor: selected
                            ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4')
                            : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                          borderColor: dark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                          transform: 'translateX(4px)',
                        },
                        '&:active': {
                          transform: 'translateX(2px) scale(0.99)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: selected ? 800 : 500,
                          color: selected ? goldAccent : theme.palette.text.primary,
                          fontSize: '0.86rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.15)' }} />

          {/* Drawer Footer Status */}
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              background: dark
                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                : 'linear-gradient(135deg, #FEF9E7 0%, #ECFDF5 100%)',
              border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.3)' : '#F0E1A8'}`,
              boxShadow: dark
                ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                : '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 #FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 60,
                height: 60,
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    boxShadow: '0 0 10px #10B981, 0 0 4px #10B981',
                    animation: 'beaconPulse 2s infinite ease-in-out',
                    '@keyframes beaconPulse': {
                      '0%': { transform: 'scale(0.9)', boxShadow: '0 0 4px #10B981' },
                      '50%': { transform: 'scale(1.25)', boxShadow: '0 0 12px #10B981, 0 0 6px #10B981' },
                      '100%': { transform: 'scale(0.9)', boxShadow: '0 0 4px #10B981' },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 800, color: goldAccent, fontFamily: mono, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  LOCAL ENCLAVE ACTIVE
                </Typography>
              </Box>
              <Chip
                label="v2.0"
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.62rem',
                  fontFamily: mono,
                  fontWeight: 800,
                  bgcolor: dark ? 'rgba(16, 185, 129, 0.12)' : '#D1FAE5',
                  color: dark ? '#6EE7B7' : '#065F46',
                  border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0'}`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', display: 'block', fontSize: '0.72rem', lineHeight: 1.4 }}>
              127.0.0.1 loopback isolation · Zero external egress
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}