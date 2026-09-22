import React from 'react';
import { Box, Container, Typography, Chip, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';
import VaultConsole from '../components/VaultConsole';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function HexStrikePage() {
  const securityTools = microTools.filter((tool) => tool.category === 'Security');

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Chip label="HARDWARE VAULT & ZERO-TELEMETRY SECURITY" size="small" sx={{ bgcolor: '#FEF3F2', color: '#B42318', fontWeight: 700 }} />
        <Chip label="VAULT DAEMON :8787" size="small" sx={{ bgcolor: '#ECFDF3', color: '#027A48', fontWeight: 700 }} />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
        HexStrike Security & Hardware Vault Suite
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780, mb: 4 }}>
        Zero-telemetry cryptographic security tools. Derive Argon2id keys, audit payload entropy, inspect JWT tokens, and secure local environment variables without cloud egress.
      </Typography>

      {/* Interactive Hardware Vault Console */}
      <VaultConsole />

      {/* Security Micro-Tools Catalog */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShieldIcon sx={{ color: '#B8860B' }} /> Published Security & Encryption Micro-Tools
      </Typography>

      <Grid container spacing={2.5}>
        {securityTools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #EAECF0', borderRadius: 2 }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 700, color: '#8A6A09' }}>
                    {tool.name}
                  </Typography>
                  <Chip label={`v${tool.version}`} size="small" sx={{ bgcolor: '#F2F4F7', color: '#344054', fontWeight: 600, fontFamily: mono }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {tool.description}
                </Typography>
                <Box sx={{ pt: 1, borderTop: '1px solid #F2F4F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#667085' }}>
                    {tool.cliCommand}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    component="a"
                    href={tool.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
