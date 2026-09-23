import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Divider, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import GoldenZLogo3D from './GoldenZLogo3D';


const navItems = [
  { label: 'Ecosystem', path: '/' },
  { label: 'Adytum', path: '/adytum' },
  { label: '21 Swarm', path: '/swarm' },
  { label: 'Bridges', path: '/bridges' },
  { label: 'Tools', path: '/tools' },
  { label: 'Memory', path: '/memory' },
  { label: 'Consensus', path: '/consensus' },
  { label: 'WebGen', path: '/webgen' },
  { label: 'HexStrike', path: '/hexstrike' },
  { label: 'Zoth OS', path: '/zoth-os' },
  { label: 'Docs', path: '/docs' },
];

export default function Navbar({ mode, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const appBarBg = dark ? 'rgba(11, 11, 18, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = theme.palette.divider;
  const brandColor = dark ? '#F5E6AB' : '#101828';
  const navIdle = dark ? '#A6A8B4' : '#475467';
  const navActive = dark ? '#D4AF37' : '#B8860B';
  const chipBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const chipColor = dark ? '#F5E6AB' : '#B8860B';
  const chipBorder = dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: appBarBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${borderColor}` }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>

          {/* Brand Logo */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: brandColor }}>
            <GoldenZLogo3D size={40} />
            <Typography component="div" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontSize: '1.7rem', lineHeight: 1, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 1 }}>
              Zoth Studio <Chip label="v2" size="small" sx={{ background: chipBg, color: chipColor, border: `1px solid ${chipBorder}`, fontWeight: 700, fontFamily: 'Inter, sans-serif' }} />
            </Typography>
          </Box>

          {/* Desktop Navigation Items */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: active ? navActive : navIdle,
                    fontWeight: active ? 700 : 500,
                    borderBottom: active ? '2px solid #D4AF37' : '2px solid transparent',
                    borderRadius: 0,
                    px: 1.15,
                    py: 1,
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                    '&:hover': { color: navActive, background: 'transparent' }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 22, width: 'auto' }} />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              NullAI
            </Button>
            <IconButton
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={onToggleTheme}
              sx={{
                color: dark ? '#F5E6AB' : '#101828',
                border: `1px solid ${borderColor}`,
                background: dark ? 'rgba(212,175,55,0.08)' : 'transparent',
                '&:hover': { color: '#D4AF37', borderColor: '#D4AF37', background: dark ? 'rgba(212,175,55,0.16)' : 'rgba(212,175,55,0.08)' },
              }}
            >
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { lg: 'none' }, color: brandColor }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Box onClick={handleDrawerToggle} sx={{ width: 260, p: 2, bgcolor: theme.palette.background.paper, height: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: navActive }}>
            ZOTH STUDIO v2
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} selected={location.pathname === item.path}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: location.pathname === item.path ? navActive : theme.palette.text.primary }}>{item.label}</Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}