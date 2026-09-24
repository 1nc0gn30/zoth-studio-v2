import React from 'react';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStudioStatus } from '../studio/useStudioStatus';

const LABELS = {
  'Neuro memory daemon': 'Memory :8788',
  'Sovereign agent bridge': 'Bridge :8789',
  'Vault daemon': 'Vault :8787',
  Ollama: 'Models :11434',
};

/** Live loopback status. Same probe the home page uses, reusable on any daemon page. */
export default function DaemonStatusStrip() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { status, error } = useStudioStatus();
  const services = status ? Object.values(status.services) : [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
      {error && <Chip size="small" label="Status probe unavailable" sx={{ fontWeight: 700 }} />}
      {!status && !error && <Chip size="small" label="Probing loopback…" sx={{ fontWeight: 700 }} />}
      {services.map((service) => (
        <Chip
          key={service.name}
          size="small"
          label={`${LABELS[service.name] || service.name} · ${service.up ? 'UP' : 'OFFLINE'}`}
          sx={{
            fontWeight: 750,
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: '0.7rem',
            bgcolor: service.up ? (dark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (dark ? 'rgba(148,163,184,0.1)' : '#F2F4F7'),
            color: service.up ? (dark ? '#34D399' : '#027A48') : theme.palette.text.secondary,
            border: '1px solid',
            borderColor: service.up ? (dark ? 'rgba(52,211,153,0.4)' : '#ABE5C6') : theme.palette.divider,
          }}
        />
      ))}
    </Box>
  );
}
