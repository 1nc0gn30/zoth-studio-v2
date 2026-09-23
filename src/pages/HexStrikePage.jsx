import React from 'react';
import { Box, Container, Typography, Chip, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import VaultConsole from '../components/VaultConsole';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function HexStrikePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const securityTools = microTools.filter((tool) => tool.category === 'Security');

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* HexStrikePage signature: gold radial glow behind the header */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '100%', md: '860px' },
          height: { xs: 380, md: 480 },
          pointerEvents: 'none',
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.20) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(184,134,11,0.10) 0%, transparent 70%)',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Chip label="HARDWARE VAULT & CIPHER SUITE" size="small" sx={{ bgcolor: isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2', color: isDark ? '#FB7185' : '#B42318', fontWeight: 800 }} />
          <Chip label="VAULT DAEMON :8787" size="small" sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', fontWeight: 800 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
          HexStrike Cyber-Security & <span className="text-gradient-gold">Vault Suite</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Zero-telemetry cryptographic security tools. Secure local environment variables with <span className="text-highlight-gold">AES-256-GCM</span>, calculate Shannon payload entropy, derive memory-hard <span className="text-highlight-dark">Argon2id</span> keys, and inspect JWT tokens locally without cloud egress.
        </Typography>
      </Box>

      {/* Security Architecture Feature Grid */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <KeyIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Argon2id Key Derivation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Memory-hard password hashing with configurable time-cost iterations to defeat GPU rainbow table attacks.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EnhancedEncryptionIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Shannon Entropy Analysis</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Calculates information entropy (H(X) = -Σ P(x) log₂ P(x)) to detect hidden encrypted payloads or obfuscated code.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Local Secret Vault Daemon</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Zero-cloud key storage daemon running locally on port <span className="text-highlight-gold">8787</span> with TPM/HW-backed key sealing options.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interactive Hardware Vault Console */}
      <Box sx={{ mb: 6 }}>
        <Typography className="section-kicker">Interactive Cipher Console</Typography>
        <VaultConsole />
      </Box>

      {/* Security Micro-Tools Catalog */}
      <Box>
        <Typography className="section-kicker">Security Tool Catalog</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.primary }}>
          <ShieldIcon sx={{ color: gold.accent }} /> Published Security & Encryption Micro-Tools
        </Typography>

        <Grid container spacing={2.5}>
          {securityTools.map((tool) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tool.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: gold.accent,
                  transform: 'translateY(-3px)',
                  boxShadow: isDark
                    ? '0 12px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.3), 0 0 22px -4px rgba(212,175,55,0.25)'
                    : '0 12px 28px rgba(16,24,40,0.1), 0 0 0 1px rgba(184,134,11,0.2), 0 0 18px -4px rgba(184,134,11,0.2)',
                },
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 750, color: gold.soft }}>
                      {tool.name}
                    </Typography>
                    <Chip label={`v${tool.version}`} size="small" sx={{ bgcolor: gold.wash, color: gold.soft, fontWeight: 750, fontFamily: mono }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.55 }}>
                    {tool.description}
                  </Typography>
                  <Box sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: theme.palette.text.secondary, fontWeight: 600 }}>
                      {tool.repo}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      component="a"
                      href={tool.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Repo
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      </Box>
    </Container>
  );
}
