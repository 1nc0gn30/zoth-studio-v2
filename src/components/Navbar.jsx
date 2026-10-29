import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Menu, MenuItem,
  Dialog, DialogContent, InputBase, Paper, useTheme, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HubIcon from '@mui/icons-material/Hub';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import WebIcon from '@mui/icons-material/Web';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import GoldenZLogo3D from './GoldenZLogo3D';
const SwarmDaemonMultiplexer = React.lazy(() => import('./SwarmDaemonMultiplexer'));
import NetlifyShowcaseDialog from './NetlifyShowcaseDialog';
import { microTools } from '../data/toolsData';
import { workstations } from '../data/workstations';
import { arsenalStats } from '../data/arsenalData';
import { useSovereignRuntime } from '../utils/sovereignRuntime';
import { useStudioStatus } from '../studio/useStudioStatus';
import { useReality } from '../context/RealityContext';
import { RealityThemeIcon } from './RealityZothBotHUD';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// Flagship Primary Links
const primaryNav = [
  { label: 'Arsenal', path: '/arsenal', badge: `${arsenalStats.total}` },
  { label: 'Vaelor L1', path: '/vaelor', badge: 'DAG', pulse: true },
  { label: 'Voice Station', path: '/voice', badge: 'LIVE', pulse: true },
  { label: 'Zoth OS', path: '/zoth-os', badge: 'v3.3', pulse: true },
  { label: 'WebGen', path: '/webgen', badge: 'NEW' },
  { label: 'Agora', path: '/agora', badge: 'DAPP', pulse: true, wideOnly: true },
  { label: 'Swarm', path: '/swarm', wideOnly: true },
  { label: 'HexStrike', path: '/hexstrike', wideOnly: true },
];

// Secondary Ecosystem Apps (shown in More menu on standard laptops)
const ecosystemSecondaryItems = [
  { label: 'Agora DApp', path: '/agora', desc: 'Sovereign decentralized agent marketplace', icon: <HubIcon fontSize="small" sx={{ color: '#D4AF37' }} /> },
  { label: 'Swarm Pantheon', path: '/swarm', desc: '21 autonomous agent terminals & multiplexer', icon: <TerminalIcon fontSize="small" sx={{ color: '#38BDF8' }} /> },
  { label: 'HexStrike Enclave', path: '/hexstrike', desc: 'Cybersecurity defense & vulnerability hunter', icon: <SecurityIcon fontSize="small" sx={{ color: '#EF4444' }} /> },
];

// Knowledge Dropdown
const knowledgeItems = [
  { label: 'Documentation', path: '/docs', desc: 'Zero-egress invariants, system topology & architecture', icon: <MenuBookIcon fontSize="small" sx={{ color: '#D4AF37' }} /> },
  { label: 'Six Math Pillars', path: '/docs/math', desc: 'Formal theory: STDP, Byzantine math & Shannon entropy', icon: <FunctionsIcon fontSize="small" sx={{ color: '#60A5FA' }} /> },
  { label: 'Architecture FAQs', path: '/faqs', desc: 'Answers regarding Lucy Oracle, offline daemons & safety', icon: <HelpOutlineIcon fontSize="small" sx={{ color: 'var(--zs-mint)' }} /> },
  { label: 'Agent Experience (AX)', path: '/ax', desc: 'Machine-readable schemas & autonomous crawler endpoints', icon: <PrecisionManufacturingIcon fontSize="small" sx={{ color: '#A78BFA' }} /> },
  { label: 'Studio Gallery', path: '/gallery', desc: 'Desktop and mobile screenshots and motion intro recordings', icon: <OndemandVideoIcon fontSize="small" sx={{ color: '#D4AF37' }} /> },
];

export default function Navbar({ mode, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [knowledgeAnchor, setKnowledgeAnchor] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [swarmDaemonOpen, setSwarmDaemonOpen] = useState(false);
  const [netlifyOpen, setNetlifyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { realityId, reality, cycleReality } = useReality();

  const borderColor = theme.palette.divider;
  const brandColor = dark ? reality.accentSoft : '#101828';
  const navIdle = dark ? '#9CA3AF' : '#475467';
  const navActive = dark ? reality.accent : reality.accentLightMode;
  const goldAccent = dark ? reality.accent : reality.accentLightMode;
  const { isLocal, hasWebGPU, badgeLabel, badgeColor, badgeTooltip } = useSovereignRuntime();
  const { status: studioStatus } = useStudioStatus();
  const civSvc = studioStatus?.services?.civilization;
  const webgenSvc = studioStatus?.services?.webgen;
  const effectiveBadgeLabel = isLocal && civSvc?.up
    ? `LOCAL NODE · CIV DAY ${civSvc.detail?.day || 1}${webgenSvc?.up ? ' · WEBGEN UP' : ''}`
    : (!isLocal ? (hasWebGPU ? 'PUBLIC WEB · WEBGPU ACTIVE' : 'PUBLIC WEB · zoth.nullai.tech') : badgeLabel);
  const effectiveBadgeTooltip = isLocal && civSvc?.up
    ? `Connected to Local Sovereign Node (127.0.0.1). Zoth Civilization (:9393) Active — Imperator: ${String(civSvc.detail?.leader || 'Chronos').toUpperCase()} · Adytum Cycles: ${civSvc.adytumCycleCount || 0}.${webgenSvc?.up ? ' Zoth WebGen (:5173) Online.' : ''}`
    : badgeTooltip;

  // Global Keyboard Shortcuts: ⌘K for Command Palette, Ctrl+~ for Swarm Daemon
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setSwarmDaemonOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenKnowledge = (event) => setKnowledgeAnchor(event.currentTarget);
  const handleCloseKnowledge = () => setKnowledgeAnchor(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const isKnowledgeActive = knowledgeItems.some((item) => location.pathname.startsWith(item.path));

  // Search Results for Command Palette
  const filteredTools = microTools.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.localPort && String(t.localPort).includes(searchQuery))
  ).slice(0, 8);

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
          ? reality.navGradientDark
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
            ? reality.seamGradient
            : 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.25) 15%, rgba(184, 134, 11, 0.45) 50%, rgba(212, 175, 55, 0.25) 85%, transparent 100%)',
          pointerEvents: 'none',
        },
        overflowX: 'clip',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1720px', px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72, gap: { xs: 0.75, sm: 1.25, lg: 1.5 }, flexWrap: 'nowrap', minWidth: 0 }}>

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
                  borderRadius: reality.cardRadius,
                  background: `radial-gradient(circle at center, ${reality.accentWash} 0%, transparent 80%)`,
                  border: `1px solid ${reality.accentBorder}`,
                  boxShadow: `0 0 14px ${reality.accentWash}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <GoldenZLogo3D size={36} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  className="brand-title"
                  component="div"
                  sx={{
                    fontFamily: realityId === 'matrix' || realityId === 'ghost' ? mono : '"Celtic Garamond", Georgia, serif',
                    fontSize: { xs: '0.98rem', sm: '1.32rem', md: '1.45rem' },
                    lineHeight: 1.05,
                    letterSpacing: realityId === 'matrix' || realityId === 'ghost' ? '0.04em' : '0.01em',
                    fontWeight: 700,
                    color: brandColor,
                    whiteSpace: 'nowrap',
                    transition: 'color 0.25s ease, text-shadow 0.25s ease',
                  }}
                >
                  {reality.logoTitle}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.56rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: goldAccent,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {reality.logoSubtitle} • {reality.bot.name}
                </Typography>
              </Box>
            </Box>

            {/* Netlify Platform Architecture Showcase & Sovereign Runtime Pill */}
            <Tooltip title={`⚡ Netlify Edge Active · ${effectiveBadgeTooltip} · Click to open Enclave Diagnostics`} arrow>
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#00AD9F',
                      boxShadow: '0 0 8px #00AD9F, 0 0 2px #00AD9F',
                      ml: '6px !important',
                      animation: 'statusDotPulse 2.5s infinite ease-in-out',
                      '@keyframes statusDotPulse': {
                        '0%': { opacity: 0.8, transform: 'scale(0.95)' },
                        '50%': { opacity: 1, transform: 'scale(1.2)', boxShadow: '0 0 12px #00AD9F, 0 0 4px #00AD9F' },
                        '100%': { opacity: 0.8, transform: 'scale(0.95)' },
                      },
                    }}
                  />
                }
                label="⚡ NETLIFY EDGE"
                size="small"
                onClick={() => setNetlifyOpen(true)}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  bgcolor: dark ? 'rgba(0,173,159,0.14)' : '#F0FDFA',
                  color: dark ? '#5EEAD4' : '#0F766E',
                  border: `1px solid ${dark ? 'rgba(0,173,159,0.4)' : 'rgba(0,173,159,0.5)'}`,
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  fontFamily: mono,
                  height: 22,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#00AD9F',
                    bgcolor: dark ? 'rgba(0,173,159,0.28)' : '#CCFBF1',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 0 10px rgba(0,173,159,0.3)',
                  },
                }}
              />
            </Tooltip>
          </Box>

          {/* Center: Desktop Navigation Bar */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: { lg: 0.15, xl: 0.35 },
              flexShrink: 1,
              minWidth: 0,
              background: dark
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)'
                : 'linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.04) 100%)',
              p: '3px 5px',
              borderRadius: 9999,
              border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: dark
                ? 'inset 0 1px 1px rgba(255, 255, 255, 0.06), 0 4px 12px rgba(0, 0, 0, 0.35)'
                : 'inset 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            {primaryNav.map((item) => {
              const active =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`) ||
                (item.path === '/arsenal' && (location.pathname === '/tools' || location.pathname === '/workstations'));
              return (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    display: item.wideOnly ? { xs: 'none', '2xl': 'inline-flex' } : 'inline-flex',
                    position: 'relative',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    color: active ? navActive : navIdle,
                    fontWeight: active ? 800 : 600,
                    borderRadius: 9999,
                    px: { lg: 0.95, xl: 1.25 },
                    py: 0.55,
                    minWidth: 0,
                    fontSize: { lg: '0.76rem', xl: '0.80rem' },
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, position: 'relative', zIndex: 1 }}>
                    {item.pulse && (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
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
                          display: { xs: 'none', '2xl': 'inline-flex' },
                          height: 16,
                          minWidth: 18,
                          fontSize: '0.62rem',
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
                          borderRadius: '5px',
                          px: 0.4,
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

            {/* Knowledge / More Dropdown Trigger */}
            <Button
              onClick={handleOpenKnowledge}
              endIcon={
                <KeyboardArrowDownIcon
                  className="dropdown-icon"
                  sx={{
                    fontSize: '17px !important',
                    transform: knowledgeAnchor ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
                  }}
                />
              }
              sx={{
                color: isKnowledgeActive ? navActive : navIdle,
                fontWeight: isKnowledgeActive ? 800 : 600,
                borderRadius: 9999,
                px: { lg: 1.05, xl: 1.35 },
                py: 0.55,
                minWidth: 0,
                fontSize: { lg: '0.76rem', xl: '0.80rem' },
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
              <Box component="span" sx={{ display: { xs: 'none', '2xl': 'inline' } }}>Knowledge</Box>
              <Box component="span" sx={{ display: { xs: 'inline', '2xl': 'none' } }}>More</Box>
            </Button>
          </Box>

          {/* Right Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 }, flexShrink: 0 }}>
            {/* Universal Swarm Daemon 21-Terminal Trigger: Compact Icon on Tablets / Standard Desktops (< 2xl) */}
            <IconButton
              size="small"
              onClick={() => setSwarmDaemonOpen(true)}
              aria-label="Open 21 Swarm Matrix (Ctrl+~)"
              title="Open 21 Swarm Matrix (Ctrl+~)"
              sx={{
                display: { xs: 'none', sm: 'inline-flex', '2xl': 'none' },
                color: '#08080B',
                bgcolor: goldAccent,
                border: `1px solid ${goldAccent}`,
                borderRadius: '10px',
                p: 0.85,
                boxShadow: `0 0 10px ${goldAccent}66`,
                transition: 'all 0.22s ease',
                '&:hover': {
                  bgcolor: dark ? '#F5E6AB' : '#9A7209',
                  boxShadow: `0 0 16px ${goldAccent}99`,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <TerminalIcon fontSize="small" />
            </IconButton>

            {/* Universal Swarm Daemon 21-Terminal Trigger: Full Pill Button for Ultra-Wide Desktop (>= 2xl) */}
            <Button
              size="small"
              onClick={() => setSwarmDaemonOpen(true)}
              startIcon={<TerminalIcon sx={{ color: '#08080B', fontSize: '17px !important' }} />}
              sx={{
                display: { xs: 'none', '2xl': 'inline-flex' },
                color: '#08080B',
                bgcolor: goldAccent,
                borderRadius: 9999,
                px: 1.5,
                py: 0.55,
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: mono,
                textTransform: 'none',
                boxShadow: `0 0 14px ${goldAccent}66`,
                transition: 'all 0.22s ease',
                '&:hover': {
                  bgcolor: dark ? '#F5E6AB' : '#9A7209',
                  boxShadow: `0 0 20px ${goldAccent}99`,
                  transform: 'translateY(-1.5px)',
                },
              }}
            >
              SWARM [21]
            </Button>

            {/* Quick Command Palette Search Button: Compact Icon for Screens (< 2xl) */}
            <IconButton
              size="small"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search studio (⌘K)"
              title="Search studio capabilities (⌘K)"
              sx={{
                display: { xs: 'inline-flex', '2xl': 'none' },
                color: goldAccent,
                border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.28)' : 'rgba(212, 175, 55, 0.22)'}`,
                background: dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.06)',
                borderRadius: '10px',
                p: 0.85,
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: dark ? '#FFFFFF' : '#08080B',
                  borderColor: goldAccent,
                  background: dark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 12px ${goldAccent}44`,
                },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>

            {/* Quick Command Palette Search Button: Full Search Bar for Ultra-Wide Desktop (>= 2xl) */}
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
                display: { xs: 'none', '2xl': 'inline-flex' },
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

            {/* NullAI External Link (Ultra-Wide Desktop >= 2xl) */}
            <Button
              variant="contained"
              color="primary"
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Box component="img" src="/brand/ghostbyte-dark.png" alt="Ghostbyte Brand Logo" sx={{ height: 20, width: 'auto' }} />}
              sx={{
                display: { xs: 'none', '2xl': 'inline-flex' },
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

            {/* Reality Switcher Pill */}
            <Tooltip title={`Switch Reality Theme (Active: ${reality.name} • ${reality.bot.name} • Shift+R)`} arrow>
              <Button
                size="small"
                onClick={cycleReality}
                aria-label={`Switch Reality Theme (${reality.name})`}
                sx={{
                  color: dark ? reality.accentSoft : reality.accentLightMode,
                  bgcolor: reality.accentWash,
                  border: `1px solid ${reality.accentBorder}`,
                  borderRadius: reality.cardRadius,
                  px: { xs: 0.85, md: 1.3 },
                  py: 0.65,
                  minWidth: 0,
                  gap: 0.7,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: reality.accent,
                    bgcolor: reality.accent,
                    color: '#050609',
                  },
                }}
              >
                <RealityThemeIcon mode={realityId} size={16} />
                <Box component="span" sx={{ display: { xs: 'none', '2xl': 'inline' } }}>
                  {reality.shortName}
                </Box>
              </Button>
            </Tooltip>

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

            {/* Mobile / Tablet Menu Button (Shown on screens < lg) */}
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
        {/* Apps Section on screens < 2xl */}
        <Box sx={{ display: { xs: 'block', '2xl': 'none' }, mb: 1 }}>
          <Typography variant="caption" sx={{ px: 2, py: 0.75, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: mono, fontSize: '0.7rem' }}>
            Sovereign Ecosystem Apps
          </Typography>
          <Divider sx={{ mb: 1, opacity: 0.4, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)' }} />
          {ecosystemSecondaryItems.map((item) => {
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
                  py: 1,
                  px: 1.5,
                  mb: 0.5,
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: selected ? `1px solid ${dark ? 'rgba(212, 175, 55, 0.35)' : '#F0E1A8'}` : '1px solid transparent',
                  '&.Mui-selected': { bgcolor: dark ? 'rgba(212, 175, 55, 0.15)' : '#FEF9E7' },
                  '&:hover': {
                    bgcolor: selected ? (dark ? 'rgba(212, 175, 55, 0.22)' : '#FDF4D4') : (dark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)'),
                    transform: 'translateX(4px)',
                  },
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
          <Divider sx={{ my: 1, opacity: 0.4, borderColor: dark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)' }} />
        </Box>

        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: goldAccent, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: mono, fontSize: '0.7rem' }}>
          Theory & Specifications
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
              placeholder={`Search all ${arsenalStats.total} arsenal capabilities, documentation...`}
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
                        <TerminalIcon sx={{ color: 'var(--zs-emerald)', fontSize: 16 }} />
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
            width: { xs: '86vw', sm: 380, md: 420 },
            maxWidth: 440,
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
          display: { xs: 'block', xl: 'none' },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: dark ? '#9CA3AF' : '#6B7280', fontFamily: mono, fontSize: '0.68rem' }}>
                    Zero-Egress v2.0
                  </Typography>
                  <Chip
                    label={badgeLabel}
                    size="small"
                    sx={{
                      height: 18,
                      fontFamily: mono,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      bgcolor: dark ? `${badgeColor}22` : `${badgeColor}15`,
                      color: dark ? (isLocal ? '#6EE7B7' : '#7DD3FC') : (isLocal ? '#065F46' : '#0369A1'),
                      border: `1px solid ${badgeColor}35`,
                    }}
                  />
                </Box>
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

          {/* Mobile & Tablet Quick Actions (Search, Swarm, NullAI) */}
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                handleDrawerToggle();
                setPaletteOpen(true);
              }}
              startIcon={<SearchIcon sx={{ color: goldAccent }} />}
              endIcon={
                <Chip
                  label="⌘K"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontFamily: mono,
                    fontWeight: 700,
                    bgcolor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    color: dark ? '#9CA3AF' : '#6B7280',
                  }}
                />
              }
              sx={{
                justifyContent: 'space-between',
                py: 0.85,
                px: 1.5,
                borderRadius: '10px',
                bgcolor: dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: dark ? '#E5E7EB' : '#1F2937',
                fontSize: '0.82rem',
                fontFamily: mono,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: dark ? 'rgba(212, 175, 55, 0.1)' : '#FEF9E7',
                  borderColor: goldAccent,
                },
              }}
            >
              Quick Search (⌘K)
            </Button>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  handleDrawerToggle();
                  setSwarmDaemonOpen(true);
                }}
                startIcon={<TerminalIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  py: 0.75,
                  borderRadius: '10px',
                  bgcolor: goldAccent,
                  color: '#08080B',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  fontFamily: mono,
                  textTransform: 'none',
                  boxShadow: `0 0 10px ${goldAccent}44`,
                  '&:hover': {
                    bgcolor: dark ? '#F5E6AB' : '#9A7209',
                  },
                }}
              >
                SWARM [21]
              </Button>

              <Button
                size="small"
                component="a"
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Box component="img" src="/brand/ghostbyte-dark.png" alt="Ghostbyte Brand Logo" sx={{ height: 16, width: 'auto' }} />}
                sx={{
                  py: 0.75,
                  borderRadius: '10px',
                  bgcolor: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  color: dark ? '#F5E6AB' : '#101828',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  fontFamily: mono,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: goldAccent,
                    bgcolor: dark ? 'rgba(212, 175, 55, 0.1)' : '#FEF9E7',
                  },
                }}
              >
                NullAI Lab
              </Button>
            </Box>
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
                const selected =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`) ||
                  (item.path === '/arsenal' && (location.pathname === '/tools' || location.pathname === '/workstations'));
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
              Knowledge & Specs
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
              Offline-Capable Architecture · Zero External Egress
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Universal Swarm Daemon Modal Console (Available anywhere via Ctrl+~ or button) */}
      <Dialog
        open={swarmDaemonOpen}
        onClose={() => setSwarmDaemonOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: dark ? '#08080B' : '#F8FAFC',
            border: `1.5px solid ${goldAccent}`,
            borderRadius: 3,
            backgroundImage: 'none',
            p: { xs: 1, md: 2.5 },
            maxHeight: '94vh',
            boxShadow: dark ? '0 0 48px -8px rgba(212,175,55,0.4)' : '0 20px 48px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pb: 1, borderBottom: `1px solid ${borderColor}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TerminalIcon sx={{ color: goldAccent, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? '#FFFFFF' : '#101828' }}>
              UNIVERSAL SWARM DAEMON // 21 TERMINALS
            </Typography>
            <Chip
              size="small"
              label="GLOBAL SHORTCUT: CTRL+~"
              sx={{ fontFamily: mono, fontSize: '0.65rem', fontWeight: 800, bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7', color: goldAccent }}
            />
          </Box>
          <IconButton aria-label="Close" onClick={() => setSwarmDaemonOpen(false)} sx={{ color: dark ? '#9CA3AF' : '#475467' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: { xs: 0.5, md: 1 }, mt: 1 }}>
          <React.Suspense fallback={<Box role="status" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Loading swarm matrix…</Box>}>
            <SwarmDaemonMultiplexer embedded />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      {/* Netlify Community Stream Platform Architecture Showcase Dialog */}
      <NetlifyShowcaseDialog open={netlifyOpen} onClose={() => setNetlifyOpen(false)} />
    </AppBar>
  );
}