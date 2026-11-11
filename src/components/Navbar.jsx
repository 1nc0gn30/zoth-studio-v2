import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  InputBase,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import GoldenZLogo3D from './GoldenZLogo3D';
import { microTools } from '../data/toolsData';
import { workstations } from '../data/workstations';
import { arsenalStats } from '../data/arsenalData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const primaryNav = [
  { label: 'Arsenal', path: '/arsenal' },
  { label: 'ZothOS', path: '/zoth-os' },
  { label: 'Swarm', path: '/swarm' },
  { label: 'Memory', path: '/memory' },
  { label: 'WebGen', path: '/webgen' },
  { label: 'HexStrike', path: '/hexstrike' },
];

const moreSystemItems = [
  { label: 'Tool Repositories (77)', path: '/tools', desc: 'Searchable repository catalog & CLI specs' },
  { label: 'Architecture Dossiers (43)', path: '/workstations', desc: 'Studio modules, cadres & daemon topology' },
  { label: 'Adytum Chamber', path: '/adytum', desc: '22-key deterministic planning specification' },
  { label: 'Byzantine Consensus', path: '/consensus', desc: 'Multi-model verification & quorum protocol' },
  { label: 'Command Bridges', path: '/bridges', desc: 'Local IPC & authenticated relay topology' },
  { label: 'Voice Station', path: '/voice', desc: 'Local neural speech & DSP pipeline' },
  { label: 'Vaelor L1', path: '/vaelor', desc: 'PoUW directed acyclic graph specification' },
  { label: 'The Agora', path: '/agora', desc: 'Autonomous agent discourse protocol' },
];

const docsMenuItems = [
  { label: 'System Documentation', path: '/docs', desc: 'Zero-egress invariants & installation guides' },
  { label: 'Six Math Pillars', path: '/docs/math', desc: 'STDP, Byzantine quorum & Shannon entropy proofs' },
  { label: 'AX Protocol', path: '/ax', desc: 'Machine-readable agent discovery standard' },
  { label: 'Architecture FAQs', path: '/faqs', desc: 'Local execution, licensing & hardware requirements' },
  { label: 'Studio Gallery', path: '/gallery', desc: 'Architectural artifacts & visual captures' },
];

export default function Navbar({ onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const gold = dark ? '#D4AF37' : '#7A5808';
  const primaryText = dark ? '#F5F1E6' : '#101828';
  const mutedText = dark ? '#9CA3AF' : '#475467';
  const borderCol = dark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.11)';
  const surfaceBg = dark ? 'rgba(8, 8, 11, 0.92)' : 'rgba(250, 248, 243, 0.94)';

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

  const filteredTools = microTools
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .slice(0, 8);

  const filteredWorkstations = workstations
    .filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.band.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5);

  const handleSelectRoute = (path) => {
    setPaletteOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const isMoreActive = [...moreSystemItems, ...docsMenuItems].some(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: surfaceBg,
        color: primaryText,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${borderCol}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 68, gap: 1.5 }}>
          {/* Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.4,
              textDecoration: 'none',
              color: primaryText,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.4,
                borderRadius: 1.5,
                border: `1px solid ${borderCol}`,
                bgcolor: dark ? '#0E1017' : '#FFFFFF',
              }}
            >
              <GoldenZLogo3D size={32} />
            </Box>
            <Box>
              <Typography
                component="div"
                sx={{
                  fontFamily: display,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  fontWeight: 700,
                  lineHeight: 1.05,
                  color: primaryText,
                }}
              >
                Zoth Studio
              </Typography>
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: gold,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                LOCAL-FIRST AI SYSTEMS
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {primaryNav.map((item) => {
              const active =
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: active ? primaryText : mutedText,
                    fontWeight: active ? 800 : 600,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    px: 1.4,
                    py: 0.65,
                    borderRadius: 1.5,
                    bgcolor: active ? (dark ? 'rgba(212,175,55,0.14)' : 'rgba(16,24,40,0.06)') : 'transparent',
                    '&:hover': {
                      color: primaryText,
                      bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.04)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            <Button
              onClick={(e) => setMoreAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                color: isMoreActive ? primaryText : mutedText,
                fontWeight: isMoreActive ? 800 : 600,
                fontSize: '0.84rem',
                textTransform: 'none',
                px: 1.4,
                py: 0.65,
                borderRadius: 1.5,
                bgcolor: isMoreActive ? (dark ? 'rgba(212,175,55,0.14)' : 'rgba(16,24,40,0.06)') : 'transparent',
                '&:hover': {
                  color: primaryText,
                  bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.04)',
                },
              }}
            >
              Systems &amp; Docs
            </Button>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={() => setPaletteOpen(true)}
              startIcon={<SearchIcon sx={{ fontSize: '1rem !important', color: mutedText }} />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: mutedText,
                border: `1px solid ${borderCol}`,
                bgcolor: dark ? '#0D0F16' : '#FFFFFF',
                borderRadius: 1.5,
                px: 1.4,
                py: 0.55,
                fontSize: '0.76rem',
                fontFamily: mono,
                textTransform: 'none',
                '&:hover': { borderColor: gold, color: primaryText },
              }}
            >
              Search ⌘K
            </Button>

            <IconButton
              size="small"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search repositories (⌘K)"
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                color: primaryText,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                p: 0.8,
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>

            <Button
              size="small"
              variant="contained"
              href="https://github.com/NullAITech/zoth-studio-v2"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon sx={{ fontSize: '0.95rem !important' }} />}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                bgcolor: dark ? '#D4AF37' : '#101828',
                color: dark ? '#08080B' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.75,
                py: 0.65,
                borderRadius: 1.5,
                '&:hover': { bgcolor: dark ? '#E5C158' : '#1E293B' },
              }}
            >
              Get Repo
            </Button>

            <IconButton
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={onToggleTheme}
              sx={{
                color: primaryText,
                border: `1px solid ${borderCol}`,
                bgcolor: dark ? '#0D0F16' : '#FFFFFF',
                borderRadius: 1.5,
                p: 0.8,
                '&:hover': { borderColor: gold },
              }}
            >
              {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>

            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: 'inline-flex', lg: 'none' },
                color: primaryText,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
                p: 0.8,
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Systems & Docs Dropdown */}
      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            p: 1,
            borderRadius: 2,
            bgcolor: dark ? '#0E1017' : '#FFFFFF',
            border: `1px solid ${borderCol}`,
            boxShadow: dark ? '0 16px 40px rgba(0,0,0,0.65)' : '0 12px 32px rgba(16,24,40,0.1)',
          },
        }}
      >
        <Typography
          sx={{
            px: 1.5,
            py: 0.75,
            fontFamily: mono,
            fontSize: '0.66rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: gold,
          }}
        >
          Systems &amp; Catalogs
        </Typography>
        {moreSystemItems.map((item) => (
          <MenuItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => setMoreAnchor(null)}
            sx={{ borderRadius: 1.5, py: 0.85, px: 1.5, display: 'block' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: primaryText }}>
              {item.label}
            </Typography>
            <Typography variant="caption" sx={{ color: mutedText, display: 'block', whiteSpace: 'normal' }}>
              {item.desc}
            </Typography>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1, borderColor: borderCol }} />

        <Typography
          sx={{
            px: 1.5,
            py: 0.75,
            fontFamily: mono,
            fontSize: '0.66rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: gold,
          }}
        >
          Specifications &amp; Theory
        </Typography>
        {docsMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => setMoreAnchor(null)}
            sx={{ borderRadius: 1.5, py: 0.85, px: 1.5, display: 'block' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: primaryText }}>
              {item.label}
            </Typography>
            <Typography variant="caption" sx={{ color: mutedText, display: 'block', whiteSpace: 'normal' }}>
              {item.desc}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Command Palette (⌘K) */}
      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: dark ? '#0D0F16' : '#FFFFFF',
            border: `1px solid ${borderCol}`,
            borderRadius: 2.5,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.25, borderBottom: `1px solid ${borderCol}` }}>
            <SearchIcon sx={{ color: gold }} />
            <InputBase
              autoFocus
              fullWidth
              placeholder={`Search all ${arsenalStats.total} repositories & specifications…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ color: primaryText, fontSize: '0.95rem' }}
            />
            <IconButton size="small" aria-label="Close search" onClick={() => setPaletteOpen(false)} sx={{ color: mutedText }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1.25 }}>
            <Typography sx={{ px: 1.5, py: 0.5, fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: gold }}>
              REPOSITORIES ({filteredTools.length})
            </Typography>
            <List dense disablePadding>
              {filteredTools.map((t) => (
                <ListItem key={t.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectRoute(`/tools/${t.id}`)} sx={{ borderRadius: 1.5 }}>
                    <ListItemText
                      primary={t.name}
                      secondary={t.category}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem', color: primaryText }}
                      secondaryTypographyProps={{ fontFamily: mono, fontSize: '0.7rem', color: mutedText }}
                    />
                    <Chip
                      label="Specs"
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: mono,
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        bgcolor: dark ? 'rgba(212,175,55,0.12)' : '#FAF6EB',
                        color: gold,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {filteredWorkstations.length > 0 && (
              <>
                <Divider sx={{ my: 1, borderColor: borderCol }} />
                <Typography sx={{ px: 1.5, py: 0.5, fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: gold }}>
                  ARCHITECTURE MODULES ({filteredWorkstations.length})
                </Typography>
                <List dense disablePadding>
                  {filteredWorkstations.map((w) => (
                    <ListItem key={w.id} disablePadding>
                      <ListItemButton onClick={() => handleSelectRoute(`/workstations/${w.id}`)} sx={{ borderRadius: 1.5 }}>
                        <ListItemText
                          primary={w.name}
                          secondary={w.band}
                          primaryTypographyProps={{ fontWeight: 700, fontSize: '0.86rem', color: primaryText }}
                          secondaryTypographyProps={{ fontFamily: mono, fontSize: '0.7rem', color: mutedText }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 'min(340px, 88vw)',
            bgcolor: dark ? '#0B0D13' : '#FAF8F3',
            borderRight: `1px solid ${borderCol}`,
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontFamily: display, fontWeight: 700, fontSize: '1.25rem', color: primaryText }}>
              Zoth Studio
            </Typography>
            <IconButton size="small" aria-label="Close drawer" onClick={() => setMobileOpen(false)} sx={{ color: mutedText }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Button
            fullWidth
            variant="contained"
            href="https://github.com/NullAITech/zoth-studio-v2"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<GitHubIcon />}
            sx={{
              mb: 2,
              bgcolor: dark ? '#D4AF37' : '#101828',
              color: dark ? '#08080B' : '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Get Zoth Studio Repo
          </Button>

          <Divider sx={{ mb: 1.5, borderColor: borderCol }} />

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List dense>
              {[...primaryNav, ...moreSystemItems, ...docsMenuItems].map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      selected={selected}
                      sx={{ borderRadius: 1.5, py: 0.85 }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: selected ? 800 : 600,
                          color: selected ? gold : primaryText,
                          fontSize: '0.88rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
