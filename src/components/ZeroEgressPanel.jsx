import React from 'react';
import { Box, Chip, Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { zeroEgressInvariants } from '../data/zeroEgress';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ZeroEgressPanel({ embedded = false }) {
  const { status } = useStudioStatus();
  const services = status ? Object.values(status.services) : [];
  return (
    <Box id={embedded ? undefined : 'sec-egress'} sx={{ scrollMarginTop: '88px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip
          icon={<ShieldIcon sx={{ color: '#027A48 !important' }} />}
          label="OWASP ZERO-EGRESS · 2026-09-15"
          size="small"
          sx={{ bgcolor: '#ECFDF3', color: '#027A48', border: '1px solid #ABE5C6', fontWeight: 700 }}
        />
        <Chip label="67 ASSETS · 0 VIOLATIONS" size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', border: '1px solid #F0E1A8', fontWeight: 700 }} />
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
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, height: '100%', border: '1px solid #EAECF0' }}>
            <Typography variant="overline" sx={{ color: '#B8860B', fontWeight: 750, letterSpacing: '0.08em' }}>
              Verified invariants
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
              {zeroEgressInvariants.map((item) => (
                <Box key={item} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: '7px', width: 7, height: 7, borderRadius: '50%', bgcolor: '#12B76A', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#344054' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ border: '1px solid #EAECF0', overflow: 'hidden', height: '100%' }}>
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
                    <TableCell sx={{ fontFamily: mono, color: '#8A6A09', fontWeight: 650 }}>127.0.0.1:{row.port}</TableCell>
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
