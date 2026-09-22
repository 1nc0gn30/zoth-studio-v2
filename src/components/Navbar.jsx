import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EAECF0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>
          
          {/* Brand Logo */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: '#101828' }}>
            <GoldenZLogo3D size={40} />
            <Typography component="div" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontSize: '1.7rem', lineHeight: 1, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 1 }}>
              Zoth Studio <Chip label="v2" size="small" sx={{ background: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, fontFamily: 'Inter, sans-serif' }} />
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
                    color: active ? '#B8860B' : '#475467',
                    fontWeight: active ? 700 : 500,
                    borderBottom: active ? '2px solid #D4AF37' : '2px solid transparent',
                    borderRadius: 0,
                    px: 1.15,
                    py: 1,
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                    '&:hover': { color: '#B8860B', background: 'transparent' }
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
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { lg: 'none' }, color: '#101828' }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Box onClick={handleDrawerToggle} sx={{ width: 260, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#B8860B' }}>
            ZOTH STUDIO v2
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} selected={location.pathname === item.path}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: location.pathname === item.path ? '#B8860B' : '#101828' }}>{item.label}</Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
