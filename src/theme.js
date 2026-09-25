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
          '&::after': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.045) 0%, transparent 65%),' +
              'radial-gradient(ellipse 60% 40% at 85% 90%, rgba(212,175,55,0.03) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 50% at 10% 80%, rgba(212,175,55,0.025) 0%, transparent 55%)',
            opacity: 0.85,
            mixBlendMode: 'soft-light',
          },
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
          animation: 'fadeInPage 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.page-fade-up': {
          animation: 'fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.page-fade-scale': {
          animation: 'fadeInScale 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-in-quick': {
          animation: 'fadeInPage 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-in-slow': {
          animation: 'fadeInPage 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-up-medium': {
          animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.scale-in': {
          animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.stagger-item': {
          opacity: 0,
          animation: 'revealStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.stagger-item-delayed': {
          opacity: 0,
          animation: 'revealStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          animationDelay: '0.1s',
        },
        '.stagger-item-slow': {
          opacity: 0,
          animation: 'revealStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.gold-shimmer': {
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.08) 25%, rgba(212, 175, 55, 0.15) 50%, rgba(212, 175, 55, 0.08) 75%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'goldShimmer 4s ease-in-out infinite',
        },
        '.breathe-card': {
          animation: 'breatheGold 5s ease-in-out infinite',
        },
        '.pulse-glow-btn': {
          animation: 'pulseGlow 2.8s infinite',
        },
        '.chip-glow': {
          animation: 'pulseGlow 2.5s infinite',
        },
        '.ember-glow': {
          animation: 'emberGlow 8s ease-in-out infinite',
        },
        '.gold-ripple': {
          animation: 'goldRipple 3s ease-out infinite',
        },
        '.gold-ripple-delayed': {
          animation: 'goldRipple 3s ease-out 1.5s infinite',
        },
        '@keyframes fadeInPage': {
          '0%': { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
          '70%': { opacity: 0.92, transform: 'translateY(3px) scale(0.99)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes fadeInScale': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes revealStagger': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes pulseGlow': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.28), 0 0 14px -2px rgba(212, 175, 55, 0.18), 0 0 0 0 rgba(212, 175, 55, 0.08)',
          },
          '12.5%': {
            boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.38), 0 0 16px 0 rgba(212, 175, 55, 0.26), 0 0 0 0 rgba(212, 175, 55, 0.12)',
          },
          '25%': {
            boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.18), 0 0 18px 0 rgba(212, 175, 55, 0.26), 0 0 22px 2px rgba(212, 175, 55, 0.14)',
          },
          '37.5%': {
            boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.1), 0 0 20px 1px rgba(212, 175, 55, 0.22), 0 0 26px 4px rgba(212, 175, 55, 0.16)',
          },
          '50%': {
            boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.06), 0 0 22px 2px rgba(212, 175, 55, 0.2), 0 0 30px 6px rgba(212, 175, 55, 0.22)',
          },
          '62.5%': {
            boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.02), 0 0 18px -1px rgba(212, 175, 55, 0.16), 0 0 30px 6px rgba(212, 175, 55, 0.16)',
          },
          '75%': {
            boxShadow: '0 0 0 8px rgba(212, 175, 55, 0), 0 0 16px -1px rgba(212, 175, 55, 0.14), 0 0 34px 8px rgba(212, 175, 55, 0)',
          },
          '87.5%': {
            boxShadow: '0 0 0 6px rgba(212, 175, 55, 0), 0 0 14px -2px rgba(212, 175, 55, 0.08), 0 0 26px 4px rgba(212, 175, 55, 0)',
          },
        },
        '@keyframes breatheGold': {
          '0%, 100%': {
            borderColor: 'rgba(212, 175, 55, 0.25)',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.08), 0 0 0 1px rgba(212, 175, 55, 0.12)',
          },
          '30%': {
            borderColor: 'rgba(212, 175, 55, 0.48)',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.14), 0 0 0 1px rgba(212, 175, 55, 0.26)',
          },
          '50%': {
            borderColor: 'rgba(212, 175, 55, 0.7)',
            boxShadow: '0 6px 20px rgba(212, 175, 55, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.4)',
          },
          '70%': {
            borderColor: 'rgba(212, 175, 55, 0.38)',
            boxShadow: '0 3px 12px rgba(212, 175, 55, 0.11), 0 0 0 1px rgba(212, 175, 55, 0.18)',
          },
        },
        '@keyframes goldShimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        '@keyframes emberGlow': {
          '0%, 100%': {
            boxShadow: '0 0 16px 2px rgba(212, 175, 55, 0.12), 0 0 32px 4px rgba(212, 175, 55, 0.06)',
          },
          '50%': {
            boxShadow: '0 0 26px 4px rgba(212, 175, 55, 0.22), 0 0 52px 10px rgba(212, 175, 55, 0.12)',
          },
        },
        '@keyframes goldRipple': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.35)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(212, 175, 55, 0.08)',
          },
          '100%': {
            boxShadow: '0 0 0 16px rgba(212, 175, 55, 0)',
          },
        },
        '@keyframes voidPulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
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
        ':focus-visible': {
          outline: '2px solid rgba(212, 175, 55, 0.75)',
          outlineOffset: '2px',
          borderRadius: '4px',
        },
        '.link-gold': {
          color: '#8A6A09',
          textDecoration: 'none',
          position: 'relative',
          transition: 'color 0.22s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: '-2px',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, #B8860B, #D4AF37)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          },
          '&:hover': {
            color: '#B8860B',
            '&::after': {
              transform: 'scaleX(1)',
            },
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
          background: 'linear-gradient(135deg, #FBF1D6 0%, #F5E6AB 28%, #D4AF37 68%, #B8860B 100%)',
          boxShadow: '0 2px 4px rgba(184, 134, 11, 0.24), 0 4px 14px rgba(212, 175, 55, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F8E7A0 0%, #F5E08E 25%, #D4AF37 65%, #9A7209 100%)',
            boxShadow:
              '0 8px 24px -4px rgba(212, 175, 55, 0.45), 0 0 0 1.5px rgba(251, 241, 214, 0.65), 0 2px 6px rgba(212, 175, 55, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            background: 'linear-gradient(135deg, #FBF1D6 12%, #F5E6AB 35%, #D4AF37 65%, #B8860B 88%)',
            transform: 'translateY(1px)',
            boxShadow: '0 1px 4px rgba(184, 134, 11, 0.22), 0 1px 6px rgba(212, 175, 55, 0.2)',
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
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            borderColor: '#D4AF37',
            transform: 'translateY(-5px) scale(1.005)',
            boxShadow:
              '0 0 0 1px rgba(212, 175, 55, 0.55), 0 20px 36px -10px rgba(16, 24, 40, 0.1), 0 0 24px -4px rgba(212, 175, 55, 0.25), 0 0 48px 0 rgba(212, 175, 55, 0.12)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
          border: '1px solid rgba(212, 175, 55, 0.2)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(212, 175, 55, 0.5)',
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.18), 0 0 10px -2px rgba(212, 175, 55, 0.15)',
            transform: 'scale(1.02)',
          },
        },
        clickable: {
          '&:hover': {
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.25), 0 0 14px -3px rgba(212, 175, 55, 0.2)',
            borderColor: '#D4AF37',
          },
        },
        sizeSmall: {
          '&:hover': {
            transform: 'scale(1.04)',
          },
        },
        sizeLarge: {
          '&:hover': {
            transform: 'scale(1.01)',
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
          '@media (prefers-color-scheme: dark)': {
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(212, 175, 55, 0.25)',
              borderRadius: '9999px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(212, 175, 55, 0.45)',
            },
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
          animation: 'fadeInPage 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.page-fade-up': {
          animation: 'fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.page-fade-scale': {
          animation: 'fadeInScale 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-in-quick': {
          animation: 'fadeInPage 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-in-slow': {
          animation: 'fadeInPage 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.fade-up-medium': {
          animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.scale-in': {
          animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.stagger-item': {
          opacity: 0,
          animation: 'revealStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.stagger-item-delayed': {
          opacity: 0,
          animation: 'revealStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          animationDelay: '0.1s',
        },
        '.stagger-item-slow': {
          opacity: 0,
          animation: 'revealStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        '.gold-shimmer': {
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.08) 25%, rgba(212, 175, 55, 0.18) 50%, rgba(212, 175, 55, 0.08) 75%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'goldShimmer 4s ease-in-out infinite',
        },
        '.breathe-card': {
          animation: 'breatheGold 4.5s ease-in-out infinite',
        },
        '.pulse-glow-btn': {
          animation: 'pulseGlow 3s infinite',
        },
        '.chip-glow': {
          animation: 'pulseGlow 2.5s infinite',
        },
        '.ember-glow': {
          animation: 'emberGlow 8s ease-in-out infinite',
        },
        '.gold-ripple': {
          animation: 'goldRipple 3s ease-out infinite',
        },
        '.gold-ripple-delayed': {
          animation: 'goldRipple 3s ease-out 1.5s infinite',
        },
        '@keyframes fadeInPage': {
          '0%': { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
          '70%': { opacity: 0.92, transform: 'translateY(2px) scale(0.99)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes fadeInScale': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes revealStagger': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes pulseGlow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.38), 0 0 16px -2px rgba(212, 175, 55, 0.24), 0 0 0 0 rgba(212, 175, 55, 0.12)',
          },
          '25%': {
            boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.24), 0 0 20px 0 rgba(212, 175, 55, 0.34), 0 0 26px 2px rgba(212, 175, 55, 0.18)',
          },
          '50%': {
            boxShadow: '0 0 0 7px rgba(212, 175, 55, 0.08), 0 0 24px 2px rgba(212, 175, 55, 0.26), 0 0 36px 6px rgba(212, 175, 55, 0.28)',
          },
          '75%': {
            boxShadow: '0 0 0 10px rgba(212, 175, 55, 0), 0 0 18px -1px rgba(212, 175, 55, 0.16), 0 0 40px 8px rgba(212, 175, 55, 0)',
          },
        },
        '@keyframes breatheGold': {
          '0%, 100%': {
            borderColor: 'rgba(212, 175, 55, 0.35)',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.12)',
          },
          '30%': {
            borderColor: 'rgba(212, 175, 55, 0.62)',
            boxShadow: '0 6px 22px rgba(212, 175, 55, 0.2)',
          },
          '50%': {
            borderColor: 'rgba(212, 175, 55, 0.85)',
            boxShadow: '0 8px 28px rgba(212, 175, 55, 0.28)',
          },
          '70%': {
            borderColor: 'rgba(212, 175, 55, 0.48)',
            boxShadow: '0 5px 18px rgba(212, 175, 55, 0.16)',
          },
        },
        '@keyframes goldShimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        '@keyframes emberGlow': {
          '0%, 100%': {
            boxShadow: '0 0 18px 2px rgba(212, 175, 55, 0.16), 0 0 36px 5px rgba(212, 175, 55, 0.08)',
          },
          '50%': {
            boxShadow: '0 0 30px 6px rgba(212, 175, 55, 0.28), 0 0 60px 12px rgba(212, 175, 55, 0.15)',
          },
        },
        '@keyframes goldRipple': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.45)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(212, 175, 55, 0.1)',
          },
          '100%': {
            boxShadow: '0 0 0 16px rgba(212, 175, 55, 0)',
          },
        },
        '@keyframes voidPulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
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
        ':focus-visible': {
          outline: '2px solid rgba(212, 175, 55, 0.85)',
          outlineOffset: '2px',
          borderRadius: '4px',
        },
        '.link-gold': {
          color: '#F5E6AB',
          textDecoration: 'none',
          position: 'relative',
          transition: 'color 0.22s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: '-2px',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, #D4AF37, #F3D56A)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          },
          '&:hover': {
            color: '#FBF1D6',
            '&::after': {
              transform: 'scaleX(1)',
            },
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
          background: 'linear-gradient(135deg, #FBF1D6 0%, #F5E6AB 28%, #D4AF37 68%, #B8860B 100%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(212, 175, 55, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F8E7A0 0%, #F5E08E 25%, #D4AF37 65%, #9A7209 100%)',
            boxShadow:
              '0 8px 26px -4px rgba(212, 175, 55, 0.5), 0 0 0 1.5px rgba(251, 241, 214, 0.65), 0 2px 8px rgba(212, 175, 55, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            background: 'linear-gradient(135deg, #FBF1D6 12%, #F5E6AB 35%, #D4AF37 65%, #B8860B 88%)',
            transform: 'translateY(1px)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.6), 0 1px 8px rgba(212, 175, 55, 0.25)',
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
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            borderColor: '#D4AF37',
            transform: 'translateY(-5px) scale(1.005)',
            boxShadow:
              '0 0 0 1px rgba(212, 175, 55, 0.65), 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 28px -4px rgba(212, 175, 55, 0.35), 0 0 50px 0 rgba(212, 175, 55, 0.18), 0 0 70px 4px rgba(212, 175, 55, 0.08)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
          border: '1px solid rgba(212, 175, 55, 0.25)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(212, 175, 55, 0.6)',
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.2), inset 0 0 8px rgba(212, 175, 55, 0.15)',
            transform: 'scale(1.02)',
          },
        },
        clickable: {
          '&:hover': {
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.25), inset 0 0 10px rgba(212, 175, 55, 0.2)',
            borderColor: '#D4AF37',
          },
        },
        sizeSmall: {
          '&:hover': {
            transform: 'scale(1.04)',
          },
        },
        sizeLarge: {
          '&:hover': {
            transform: 'scale(1.01)',
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