import React from 'react';
import { Box, Paper, Typography, Button, Container } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Class error boundary (must be a class to catch render errors). Sits OUTSIDE
// ThemeProvider in main.jsx, so it uses static gold/void colors, not the theme.
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
      return (
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Paper sx={{ p: 4, border: '1px solid #26262F', borderLeft: '6px solid #D4AF37', borderRadius: 3, bgcolor: '#0B0B12' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#EDEFF2', mb: 1.5 }}>
              ⚡ Zoth Studio Workstation UI Recovered
            </Typography>
            <Typography variant="body1" sx={{ color: '#A6A8B4', mb: 3 }}>
              An interactive HMR or component rendering exception occurred. The error boundary intercepted the exception to prevent application downtime.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#101828', color: '#FDD663', fontFamily: 'monospace', fontSize: '0.85rem', mb: 3, borderRadius: 2 }}>
              {this.state.error?.toString() || 'Unknown UI Error'}
            </Paper>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{ fontWeight: 700 }}
            >
              Reload Workstation UI
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
