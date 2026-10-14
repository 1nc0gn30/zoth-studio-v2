import React, { useState } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import BoltIcon from '@mui/icons-material/Bolt';
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
  const adytumStr = service.adytumCycleCount !== undefined ? ` [Adytum: ${service.adytumCycleCount} cycles]` : '';
  return `${shortName}${portStr}${modelStr}${adytumStr}`;
};

/** Live loopback status. Differentiates public web mirror (zoth.nullai.tech) vs local sovereign node. */
export default function DaemonStatusStrip() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { isLocal } = useSovereignRuntime();
  const { status, error, refresh } = useStudioStatus();
  const [bootingKey, setBootingKey] = useState(null);
  const services = status ? Object.entries(status.services) : [];

  const handleAutoBoot = async (serviceKey) => {
    if (!isLocal || bootingKey) return;
    const bootTarget = serviceKey === 'civilization' ? 'civilization'
      : serviceKey === 'webgen' ? 'webgen'
      : 'daemons';
    setBootingKey(serviceKey);
    try {
      await fetch('/api/studio/supervisor/boot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: bootTarget }),
      });
      if (typeof refresh === 'function') refresh();
    } catch (_) {
      // Handled by next status poll
    } finally {
      setTimeout(() => setBootingKey(null), 1500);
    }
  };

  // When viewed on public website (zoth.nullai.tech), daemons run air-gapped on the operator's bare-metal node
  if (!isLocal) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 3 }}>
        <Chip
          icon={<PublicIcon sx={{ fontSize: '0.85rem !important', color: dark ? '#38BDF8' : '#0369A1' }} />}
          size="small"
          label="PUBLIC WEB SHOWCASE (zoth.nullai.tech) · CLIENT WASM & WEBGPU ACTIVE"
          sx={{
            fontWeight: 800,
            fontFamily: mono,
            fontSize: '0.68rem',
            bgcolor: dark ? 'rgba(56,189,248,0.12)' : '#F0F9FF',
            color: dark ? '#38BDF8' : '#0369A1',
            border: '1px solid',
            borderColor: dark ? 'rgba(56,189,248,0.35)' : '#BAE6FD',
          }}
        />
        <Tooltip title="On zoth.nullai.tech, in-browser WebGPU & WASM tools run directly in your browser. Heavy local engines (Zoth Civilization :9393, Zoth WebGen Bolt.DIY :5173, Swarm :8790, Neuro Memory :8094, Ollama :11434) execute on your local machine when you clone the repos or boot ZothOS.">
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '0.82rem !important', color: dark ? '#34D399' : '#047857' }} />}
            size="small"
            label="BARE-METAL DAEMONS REQUIRE LOCAL NODE / ZOTHOS ISO"
            sx={{
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.66rem',
              bgcolor: dark ? 'rgba(52,211,153,0.1)' : '#ECFDF3',
              color: dark ? '#34D399' : '#047857',
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
          icon={<BoltIcon sx={{ fontSize: '0.85rem !important', color: dark ? '#FBBF24' : '#D97706' }} />}
          label={bootingKey ? 'Booting local sovereign daemons…' : 'Loopback daemons dormant · Click to Auto-Boot'}
          onClick={() => handleAutoBoot('daemons')}
          sx={{
            fontWeight: 700,
            fontFamily: mono,
            fontSize: '0.68rem',
            bgcolor: dark ? 'rgba(245,158,11,0.12)' : '#FEF3C7',
            color: dark ? '#FBBF24' : '#D97706',
            border: '1px solid rgba(245,158,11,0.3)',
            cursor: 'pointer',
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
      {services.map(([key, service]) => {
        const isBooting = bootingKey === key;
        const canBoot = !service.up && (key === 'civilization' || key === 'webgen' || key === 'swarm' || key === 'memory' || key === 'bridge');
        const tooltipTitle = service.latestReflection
          ? `[Adytum Reflection · ${service.latestReflection.agentName || 'Hermes'}] "${service.latestReflection.reflection}"`
          : canBoot
            ? `${service.name} is offline on 127.0.0.1:${service.port}. Click to auto-boot locally.`
            : (service.name || 'Daemon');
        return (
          <Tooltip key={service.name} title={tooltipTitle} arrow>
            <Chip
              size="small"
              onClick={canBoot ? () => handleAutoBoot(key) : undefined}
              label={`${getServiceLabel(service)} · ${isBooting ? 'BOOTING…' : service.up ? 'UP' : (canBoot ? 'OFFLINE (⚡ BOOT)' : 'OFFLINE')}`}
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
                color: service.up ? (dark ? '#34D399' : '#027A48') : (canBoot ? '#FBBF24' : theme.palette.text.secondary),
                border: '1px solid',
                borderColor: service.up
                  ? dark
                    ? 'rgba(52,211,153,0.4)'
                    : '#ABE5C6'
                  : (canBoot ? 'rgba(245,158,11,0.4)' : theme.palette.divider),
                cursor: (canBoot || service.latestReflection) ? 'pointer' : 'default',
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

