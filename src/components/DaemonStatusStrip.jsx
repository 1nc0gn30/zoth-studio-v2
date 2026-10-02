import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import { useStudioStatus } from '../studio/useStudioStatus';
import { useSovereignRuntime } from '../utils/sovereignRuntime';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const getServiceLabel = (service) => {
  const shortName = service.name
    .replace(/ multiplexer/i, '')
    .replace(/ daemon/i, '')
    .replace(/ protocol/i, '')
    .replace(/ local agent/i, '')
    .replace(/ engine/i, '');
  const portStr = service.port ? ` :${service.port}` : '';
  const modelStr = service.models?.length ? ` (${service.models.length} models)` : '';
  return `${shortName}${portStr}${modelStr}`;
};

/** Live loopback status. Differentiates public web mirror vs local sovereign node. */
export default function DaemonStatusStrip() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { isLocal } = useSovereignRuntime();
  const { status, error } = useStudioStatus();
  const services = status ? Object.values(status.services) : [];

  // When viewed on public website (e.g. zoth.nullai.tech), daemons run air-gapped on the operator's bare-metal node
  if (!isLocal) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 3 }}>
        <Chip
          icon={<PublicIcon sx={{ fontSize: '0.85rem !important', color: dark ? '#38BDF8' : '#0284C7' }} />}
          size="small"
          label="PUBLIC WEB MIRROR · AIR-GAPPED FROM BARE-METAL DAEMONS"
          sx={{
            fontWeight: 800,
            fontFamily: mono,
            fontSize: '0.68rem',
            bgcolor: dark ? 'rgba(56,189,248,0.12)' : '#F0F9FF',
            color: dark ? '#38BDF8' : '#0284C7',
            border: '1px solid',
            borderColor: dark ? 'rgba(56,189,248,0.35)' : '#BAE6FD',
          }}
        />
        <Tooltip title="Loopback microdaemons (Swarm :8790, Neuro Memory :8094, Bridge :8102, Vault :8787, Ollama :11434) execute exclusively on the sovereign bare-metal host with zero cloud egress.">
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '0.82rem !important', color: dark ? '#34D399' : '#059669' }} />}
            size="small"
            label="ZERO-EGRESS INVARIANT ENFORCED"
            sx={{
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.66rem',
              bgcolor: dark ? 'rgba(52,211,153,0.1)' : '#ECFDF3',
              color: dark ? '#34D399' : '#059669',
              border: '1px solid',
              borderColor: dark ? 'rgba(52,211,153,0.3)' : '#A7F3D0',
              cursor: 'help',
            }}
          />
        </Tooltip>
      </Box>
    );
  }

  // Local sovereign host (127.0.0.1 / localhost)
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 3 }}>
      {error && (
        <Chip
          size="small"
          label="Loopback probe standby (daemons dormant)"
          sx={{
            fontWeight: 700,
            fontFamily: mono,
            fontSize: '0.68rem',
            bgcolor: dark ? 'rgba(245,158,11,0.12)' : '#FEF3C7',
            color: dark ? '#FBBF24' : '#D97706',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        />
      )}
      {!status && !error && (
        <Chip
          size="small"
          label="Probing local loopback…"
          sx={{ fontWeight: 700, fontFamily: mono, fontSize: '0.68rem' }}
        />
      )}
      {services.map((service) => (
        <Chip
          key={service.name}
          size="small"
          label={`${getServiceLabel(service)} · ${service.up ? 'UP' : 'OFFLINE'}`}
          sx={{
            fontWeight: 750,
            fontFamily: mono,
            fontSize: '0.7rem',
            bgcolor: service.up
              ? dark
                ? 'rgba(52,211,153,0.12)'
                : '#ECFDF3'
              : dark
                ? 'rgba(148,163,184,0.1)'
                : '#F2F4F7',
            color: service.up ? (dark ? '#34D399' : '#027A48') : theme.palette.text.secondary,
            border: '1px solid',
            borderColor: service.up
              ? dark
                ? 'rgba(52,211,153,0.4)'
                : '#ABE5C6'
              : theme.palette.divider,
          }}
        />
      ))}
    </Box>
  );
}
