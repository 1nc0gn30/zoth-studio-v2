import React from 'react';
import { Box, Paper, Typography, Button, Container } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

function detectDarkMode() {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramTheme = params.get('theme');
    if (paramTheme === 'dark') return true;
    if (paramTheme === 'light') return false;
    const stored = window.localStorage?.getItem('zoth-studio-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    if (document.documentElement?.getAttribute('data-theme') === 'dark') return true;
  } catch {
    // ignore storage/DOM errors
  }
  return false;
}

// Class error boundary (must be a class to catch render errors). Sits OUTSIDE
// ThemeProvider in main.jsx, so it resolves Editorial Ivory Light vs Obsidian Dark directly.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Zoth Studio UI Error Boundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDark = detectDarkMode();
      const pageBg = isDark ? '#08080B' : '#FAF8F3';
      const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
      const borderCol = isDark ? '#26262F' : 'rgba(16, 24, 40, 0.14)';
      const accent = isDark ? '#D4AF37' : '#7A5808';
      const primaryText = isDark ? '#F5F1E6' : '#101828';
      const secondaryText = isDark ? '#A6A8B4' : '#475467';
      const codeBg = isDark ? '#101828' : '#F4F1EA';
      const codeText = isDark ? '#FDD663' : '#7A5808';

      return (
        <Box sx={{ minHeight: '100vh', bgcolor: pageBg, py: 10 }}>
          <Container maxWidth="md">
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: `1px solid ${borderCol}`,
                borderLeft: `6px solid ${accent}`,
                borderRadius: 3,
                bgcolor: cardBg,
                boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.45)' : '0 10px 30px rgba(16,24,40,0.06)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: primaryText, mb: 1.5 }}>
                ⚡ Zoth Studio Workstation UI Recovered
              </Typography>
              <Typography variant="body1" sx={{ color: secondaryText, mb: 3 }}>
                An interactive HMR or component rendering exception occurred. The error boundary intercepted the exception to prevent application downtime.
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: codeBg,
                  color: codeText,
                  border: `1px solid ${borderCol}`,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.85rem',
                  mb: 3,
                  borderRadius: 2,
                  overflowX: 'auto',
                }}
              >
                {this.state.error?.toString() || 'Unknown UI Error'}
              </Paper>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{
                  minHeight: 44,
                  fontWeight: 700,
                  bgcolor: isDark ? '#D4AF37' : '#101828',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  '&:hover': { bgcolor: isDark ? '#E8C55A' : '#1E293B' },
                }}
              >
                Reload Workstation UI
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
