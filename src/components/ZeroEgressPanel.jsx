import React from 'react';
import { Box, Chip, Unstable_Grid2 as Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldIcon from '@mui/icons-material/Shield';
import { zeroEgressInvariants } from '../data/zeroEgress';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ZeroEgressPanel({ embedded = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldText = isDark ? '#F5E6AB' : '#8A6A09';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const goldBorder = isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8';
  const { status } = useStudioStatus();
  const services = status ? Object.values(status.services) : [];
  return (
    <Box id={embedded ? undefined : 'sec-egress'} sx={{ scrollMarginTop: '88px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip
          icon={<ShieldIcon sx={{ color: '#027A48 !important' }} />}
          label="OWASP ZERO-EGRESS · 2026-09-15"
          size="small"
          sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', border: `1px solid ${isDark ? 'rgba(52,211,153,0.4)' : '#ABE5C6'}`, fontWeight: 700 }}
        />
        <Chip label="67 ASSETS · 0 VIOLATIONS" size="small" sx={{ bgcolor: goldSoft, color: goldText, border: `1px solid ${goldBorder}`, fontWeight: 700 }} />
      </Box>
      {!embedded && (
        <Typography variant="h5" sx={{ fontWeight: 750, mb: 1, letterSpacing: '-0.02em' }}>
          Hardware enclave and zero-egress policy
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 820 }}>
        The invariant list is the 15 Sep 2026 audit of the legacy static assets. The table is a live probe of this machine. A down row means nothing is listening.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="overline" sx={{ color: gold, fontWeight: 750, letterSpacing: '0.08em' }}>
              Verified invariants
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
              {zeroEgressInvariants.map((item) => (
                <Box key={item} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: '7px', width: 7, height: 7, borderRadius: '50%', bgcolor: '#12B76A', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid xs={12} md={7}>
          <Paper sx={{ border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', height: '100%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Loopback</TableCell>
                  <TableCell>Probe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((row) => (
                  <TableRow key={row.port} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                    <TableCell sx={{ fontFamily: mono, color: goldText, fontWeight: 650 }}>127.0.0.1:{row.port}</TableCell>
                    <TableCell sx={{ color: row.up ? '#027A48' : '#B42318', fontWeight: 700 }}>{row.up ? 'answering' : 'not answering'}</TableCell>
                  </TableRow>
                ))}
                {!services.length && (
                  <TableRow>
                    <TableCell colSpan={3}>Waiting for the studio probe.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
