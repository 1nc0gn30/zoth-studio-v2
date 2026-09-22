import { createTheme } from '@mui/material/styles';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

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
    fontFamily: '"Google Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
        '.MuiGrid-container': {
          width: '100%',
          alignItems: 'stretch',
        },
        '.MuiGrid-container > .MuiGrid-root:has(> .MuiCard-root), .MuiGrid-container > .MuiGrid-root:has(> .MuiPaper-root)': {
          display: 'flex',
        },
        '.MuiGrid-container > .MuiGrid-root > .MuiCard-root, .MuiGrid-container > .MuiGrid-root > .MuiPaper-root': {
          flex: '1 1 auto',
          width: '100%',
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

export { mono };
