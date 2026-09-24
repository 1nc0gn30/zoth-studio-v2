import { createTheme } from '@mui/material/styles';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const sans = '"Google Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D4AF37',
      dark: '#B8860B',
      light: '#F5E6AB',
      contrastText: '#101828',
    },
    secondary: {
      main: '#101828',
      dark: '#0B0F19',
      light: '#1D2939',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828',
      secondary: '#475467',
    },
    divider: '#EAECF0',
    success: {
      main: '#12B76A',
    },
  },
  typography: {
    fontFamily: sans,
    h1: { fontFamily: display, fontWeight: 400, letterSpacing: '0.01em', lineHeight: 0.92 },
    h2: { fontFamily: display, fontWeight: 400, letterSpacing: '0.01em', lineHeight: 0.96 },
    h3: { fontFamily: display, fontWeight: 400, letterSpacing: '0.012em', lineHeight: 1 },
    h4: { fontFamily: display, fontWeight: 400, letterSpacing: '0.015em', lineHeight: 1.05 },
    h5: { fontFamily: display, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.1 },
    h6: { fontFamily: display, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.15 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 650, letterSpacing: '0.01em' },
    caption: { letterSpacing: '0.04em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          color: '#101828',
        },
        '.text-highlight-gold': {
          backgroundColor: '#FEF9E7',
          color: '#8A6A09',
          border: '1px solid #F5E6AB',
          borderRadius: '4px',
          padding: '2px 8px',
          fontWeight: 650,
        },
        '.text-highlight-dark': {
          backgroundColor: '#0F172A',
          color: '#F5E6AB',
          border: '1px solid #1E293B',
          borderRadius: '4px',
          padding: '2px 8px',
          fontFamily: mono,
          fontSize: '0.88em',
          fontWeight: 600,
        },
        '.text-gradient-gold': {
          backgroundImage: 'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #9A7209 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        },
        '.text-gradient-dark': {
          backgroundImage: 'linear-gradient(135deg, #101828 0%, #344054 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        },
        '.section-kicker': {
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          fontWeight: 800,
          color: '#B8860B',
          marginBottom: '6px',
          display: 'block',
        },
        '.code-box-emphasis': {
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: mono,
          fontSize: '0.85rem',
          lineHeight: 1.6,
        },
        '.page-fade-in': {
          animation: 'fadeInPage 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.breathe-card': {
          animation: 'breatheGold 4s ease-in-out infinite',
        },
        '.pulse-glow-btn': {
          animation: 'pulseGlow 2.5s infinite',
        },
        '@keyframes fadeInPage': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes pulseGlow': {
          '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '70%': { boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
        },
        '@keyframes breatheGold': {
          '0%, 100%': { borderColor: 'rgba(212, 175, 55, 0.35)', boxShadow: '0 4px 16px rgba(212, 175, 55, 0.12)' },
          '50%': { borderColor: 'rgba(212, 175, 55, 0.85)', boxShadow: '0 8px 28px rgba(212, 175, 55, 0.28)' },
        },
        '.MuiGrid-container, .MuiGrid2-container': {
          width: '100%',
          alignItems: 'stretch',
        },
        '.MuiGrid-container > .MuiGrid-root:has(> .MuiCard-root), .MuiGrid-container > .MuiGrid-root:has(> .MuiPaper-root), .MuiGrid2-container > .MuiGrid2-root:has(> .MuiCard-root), .MuiGrid2-container > .MuiGrid2-root:has(> .MuiPaper-root)': {
          display: 'flex',
          minWidth: 0,
        },
        '.MuiGrid-container > .MuiGrid-root > .MuiCard-root, .MuiGrid-container > .MuiGrid-root > .MuiPaper-root, .MuiGrid2-container > .MuiGrid2-root > .MuiCard-root, .MuiGrid2-container > .MuiGrid2-root > .MuiPaper-root': {
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          height: '100%',
        },
        'code, kbd, samp, pre': {
          fontFamily: mono,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          padding: '8px 22px',
          fontWeight: 650,
          transition: 'background 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease, color 0.22s ease',
        },
        containedPrimary: {
          color: '#101828',
          background: 'linear-gradient(135deg, #F3D56A 0%, #D4AF37 48%, #B8860B 100%)',
          boxShadow: '0 4px 14px rgba(212, 175, 55, 0.32)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F8E7A0 0%, #D4AF37 40%, #9A7209 100%)',
            boxShadow: '0 8px 22px rgba(212, 175, 55, 0.42)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: '#E4C56A',
          color: '#8A6A09',
          '&:hover': {
            borderColor: '#D4AF37',
            backgroundColor: '#FEF9E7',
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.16)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
          '&:hover': {
            borderColor: '#D4AF37',
            transform: 'translateY(-3px)',
            boxShadow: '0 14px 28px -8px rgba(212, 175, 55, 0.28), 0 0 0 1px rgba(212, 175, 55, 0.35)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
            '&:hover': { transform: 'none' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
          '&:hover': {
            borderColor: '#D4AF37',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 650,
          borderRadius: 9999,
          letterSpacing: '0.02em',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        },
        clickable: {
          '&:hover': {
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.16)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        hover: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#FEF9E7 !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          letterSpacing: '0.04em',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          color: '#667085',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37',
      dark: '#B8860B',
      light: '#F5E6AB',
      contrastText: '#101828',
    },
    secondary: {
      main: '#EDEFF2',
      dark: '#B9BCC6',
      light: '#FFFFFF',
      contrastText: '#08080B',
    },
    background: {
      default: '#08080B',
      paper: '#0B0B12',
    },
    text: {
      primary: '#EDEFF2',
      secondary: '#A6A8B4',
    },
    divider: '#26262F',
    success: {
      main: '#34D399',
    },
  },
  typography: {
    fontFamily: sans,
    h1: { fontFamily: display, fontWeight: 400, letterSpacing: '0.01em', lineHeight: 0.92 },
    h2: { fontFamily: display, fontWeight: 400, letterSpacing: '0.01em', lineHeight: 0.96 },
    h3: { fontFamily: display, fontWeight: 400, letterSpacing: '0.012em', lineHeight: 1 },
    h4: { fontFamily: display, fontWeight: 400, letterSpacing: '0.015em', lineHeight: 1.05 },
    h5: { fontFamily: display, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.1 },
    h6: { fontFamily: display, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.15 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 650, letterSpacing: '0.01em' },
    caption: { letterSpacing: '0.04em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#08080B',
          color: '#EDEFF2',
          // Ambient void flavor (dark mode only): subtle scanlines + gold grid,
          // gold glow vignette. Motion disables automatically under prefers-reduced-motion.
          '&::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(212,175,55,0.045) 0px, rgba(212,175,55,0.045) 1px, transparent 1px, transparent 4px),' +
              'repeating-linear-gradient(90deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 44px)',
            opacity: 0.55,
            animation: 'zothScan 26s linear infinite',
            mixBlendMode: 'overlay',
          },
          '&::after': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background:
              'radial-gradient(ellipse 90% 45% at 50% -5%, rgba(212,175,55,0.10) 0%, transparent 62%),' +
              'radial-gradient(ellipse 120% 95% at 50% 115%, rgba(0,0,0,0.62) 0%, transparent 62%),' +
              'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 60%, rgba(0,0,0,0.4) 100%)',
            opacity: 0.8,
          },
          '@keyframes zothScan': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '0 26px' },
          },
        },
        '.text-highlight-gold': {
          backgroundColor: 'rgba(212, 175, 55, 0.14)',
          color: '#F5E6AB',
          border: '1px solid rgba(212, 175, 55, 0.42)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontWeight: 650,
        },
        '.text-highlight-dark': {
          backgroundColor: '#0B0B12',
          color: '#F5E6AB',
          border: '1px solid #2A2A38',
          borderRadius: '4px',
          padding: '2px 8px',
          fontFamily: mono,
          fontSize: '0.88em',
          fontWeight: 600,
        },
        '.text-gradient-gold': {
          backgroundImage: 'linear-gradient(135deg, #F3D56A 0%, #D4AF37 50%, #C9A227 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        },
        '.text-gradient-dark': {
          backgroundImage: 'linear-gradient(135deg, #E8E9EE 0%, #A6A8B4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        },
        '.section-kicker': {
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          fontWeight: 800,
          color: '#D4AF37',
          marginBottom: '6px',
          display: 'block',
        },
        '.code-box-emphasis': {
          backgroundColor: '#0B0B12',
          color: '#F5E6AB',
          border: '1px solid #2A2A38',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: mono,
          fontSize: '0.85rem',
          lineHeight: 1.6,
        },
        '.page-fade-in': {
          animation: 'fadeInPage 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.breathe-card': {
          animation: 'breatheGold 4s ease-in-out infinite',
        },
        '.pulse-glow-btn': {
          animation: 'pulseGlow 2.5s infinite',
        },
        '@keyframes fadeInPage': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes pulseGlow': {
          '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '70%': { boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
        },
        '@keyframes breatheGold': {
          '0%, 100%': { borderColor: 'rgba(212, 175, 55, 0.35)', boxShadow: '0 4px 16px rgba(212, 175, 55, 0.12)' },
          '50%': { borderColor: 'rgba(212, 175, 55, 0.85)', boxShadow: '0 8px 28px rgba(212, 175, 55, 0.28)' },
        },
        '.MuiGrid-container, .MuiGrid2-container': {
          width: '100%',
          alignItems: 'stretch',
        },
        '.MuiGrid-container > .MuiGrid-root:has(> .MuiCard-root), .MuiGrid-container > .MuiGrid-root:has(> .MuiPaper-root), .MuiGrid2-container > .MuiGrid2-root:has(> .MuiCard-root), .MuiGrid2-container > .MuiGrid2-root:has(> .MuiPaper-root)': {
          display: 'flex',
          minWidth: 0,
        },
        '.MuiGrid-container > .MuiGrid-root > .MuiCard-root, .MuiGrid-container > .MuiGrid-root > .MuiPaper-root, .MuiGrid2-container > .MuiGrid2-root > .MuiCard-root, .MuiGrid2-container > .MuiGrid2-root > .MuiPaper-root': {
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          height: '100%',
        },
        'code, kbd, samp, pre': {
          fontFamily: mono,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
          'body::before': {
            animation: 'none',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          padding: '8px 22px',
          fontWeight: 650,
          transition: 'background 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease, color 0.22s ease',
        },
        containedPrimary: {
          color: '#101828',
          background: 'linear-gradient(135deg, #F3D56A 0%, #D4AF37 48%, #B8860B 100%)',
          boxShadow: '0 4px 14px rgba(212, 175, 55, 0.32)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F8E7A0 0%, #D4AF37 40%, #9A7209 100%)',
            boxShadow: '0 8px 22px rgba(212, 175, 55, 0.42)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: '#D4AF37',
          color: '#F5E6AB',
          '&:hover': {
            borderColor: '#E8CB6F',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.16)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #26262F',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
          '&:hover': {
            borderColor: '#D4AF37',
            transform: 'translateY(-3px)',
            boxShadow: '0 14px 30px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.35), 0 0 24px -6px rgba(212, 175, 55, 0.18)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
            '&:hover': { transform: 'none' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
          '&:hover': {
            borderColor: '#D4AF37',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 650,
          borderRadius: 9999,
          letterSpacing: '0.02em',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        },
        clickable: {
          '&:hover': {
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.16)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        hover: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.08) !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          letterSpacing: '0.04em',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          color: '#8B8D99',
        },
      },
    },
  },
});

export { mono };