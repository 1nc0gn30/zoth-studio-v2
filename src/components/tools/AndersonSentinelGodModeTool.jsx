import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldIcon from '@mui/icons-material/Shield';
import RadarIcon from '@mui/icons-material/Radar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DownloadIcon from '@mui/icons-material/Download';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { downloadJson } from '../sovereign/hooks.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:8103';

const OFFLINE_PREVIEW = {
  status: {
    version: '2.6.0',
    armed: false,
    status: 'OFFLINE_PREVIEW',
    enrolled_count: 0,
    camera_active: false,
    fps: 0,
    current_targets: 0,
    recent_events: [
      {
        timestamp: 'LOCAL PREVIEW',
        category: 'SYSTEM',
        message: 'Local daemon :8103 is idle. Start with `anderson-security-sentinel serve` or click Launch Standby Daemon.',
      },
    ],
  },
  wifi: {
    active: false,
    total_nodes: 4,
    disturbance_index: 2.4,
    room_bounds: { width_m: 12.0, length_m: 9.5 },
    building_perimeter: {
      footprint_sqm: 114,
      building_width_m: 12.0,
      building_length_m: 9.5,
      estimated_partitions: 2,
      confidence_pct: 91,
    },
    cameras: [],
    nodes: [
      { ssid: 'NODE_5G_#14', bssid: 'E0:63:DA:●●:●●:●●', rssi_dbm: -48, signal_pct: 84, band: '5GHz', channel: 36, distance_m: 2.4, x_m: 1.8, y_m: 1.5, vendor: 'Ubiquiti Inc.' },
      { ssid: 'NODE_2.4G_#27', bssid: '00:1B:2A:●●:●●:●●', rssi_dbm: -61, signal_pct: 64, band: '2.4GHz', channel: 6, distance_m: 5.2, x_m: -3.4, y_m: 3.9, vendor: 'Cisco Systems' },
      { ssid: 'NODE_5G_#42', bssid: 'C4:AD:34:●●:●●:●●', rssi_dbm: -68, signal_pct: 52, band: '5GHz', channel: 149, distance_m: 7.1, x_m: 4.5, y_m: -5.4, vendor: 'Mist Systems' },
      { ssid: 'NODE_2.4G_#81', bssid: '98:DE:D0:●●:●●:●●', rssi_dbm: -74, signal_pct: 40, band: '2.4GHz', channel: 11, distance_m: 9.4, x_m: -6.2, y_m: -7.0, vendor: 'TP-Link' },
    ],
  },
  usb: { active: false, trusted_count: 0, breach_detected: false, devices: [] },
  ble: { active: false, owner_present: false, total_devices: 0, trusted_macs_count: 0, devices: [] },
  dossier: {
    dossier_id: 'AS-AUDIT-PREVIEW',
    sentinel_version: '2.6.0',
    generated_at: 'Standby Preview',
    cryptographic_seal: {
      root_sha256: 'Start local :8103 daemon to compute live SHA-256 chain-of-custody root seal',
      verification_status: 'STANDBY_PREVIEW',
      signed_by: 'Anderson Sentinel Autonomous Core v2.6.0',
    },
  },
};

const MCP_TOOLS = [
  { name: 'sentinel_status', desc: 'Daemon health, armed posture, camera state, and enrolled biometric template count.' },
  { name: 'sentinel_scan_rf', desc: '802.11 Wi-Fi VRTI tomography snapshot, disturbance index, room bounds, and building perimeter.' },
  { name: 'sentinel_perimeter', desc: 'USB sysfs baseline, BlueZ BLE proximity devices, surveillance camera OUI hits, and envelope.' },
  { name: 'sentinel_dossier', desc: 'SHA-256 chain-of-custody forensic dossier JSON seal and event ledger.' },
];

export default function AndersonSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState(0);
  const [daemonUp, setDaemonUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [visionMode, setVisionMode] = useState('normal');
  const [telemetry, setTelemetry] = useState(OFFLINE_PREVIEW);

  const canvasRef = useRef(null);

  const bgCard = isDark ? '#0E1118' : '#FFFFFF';
  const bgSubtle = isDark ? '#141824' : '#F3EFE6';
  const inkPrimary = isDark ? '#F5F1E6' : '#181613';
  const inkSecondary = isDark ? '#9CA3AF' : '#475467';
  const gold = isDark ? '#D4AF37' : '#8C6A2E';
  const emerald = isDark ? '#00FF88' : '#047857';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const crimson = isDark ? '#FF3355' : '#BE123C';
  const borderCol = isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(24, 22, 19, 0.14)';

  const fetchLiveTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2200);
      const statusRes = await fetch(`${DAEMON_BASE}/api/status`, { signal: controller.signal });
      clearTimeout(timer);
      if (!statusRes.ok) throw new Error('offline');
      const statusJson = await statusRes.json();

      const [wifiR, usbR, bleR, dossierR, modeR] = await Promise.allSettled([
        fetch(`${DAEMON_BASE}/api/wifi_xray`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${DAEMON_BASE}/api/usb_status`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${DAEMON_BASE}/api/bluetooth_status`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${DAEMON_BASE}/api/export_dossier`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${DAEMON_BASE}/api/vision_mode`).then((r) => (r.ok ? r.json() : null)),
      ]);

      setDaemonUp(true);
      if (modeR.status === 'fulfilled' && modeR.value?.mode) {
        setVisionMode(modeR.value.mode);
      }
      setTelemetry({
        status: statusJson,
        wifi: (wifiR.status === 'fulfilled' && wifiR.value) ? wifiR.value : OFFLINE_PREVIEW.wifi,
        usb: (usbR.status === 'fulfilled' && usbR.value) ? usbR.value : OFFLINE_PREVIEW.usb,
        ble: (bleR.status === 'fulfilled' && bleR.value) ? bleR.value : OFFLINE_PREVIEW.ble,
        dossier: (dossierR.status === 'fulfilled' && dossierR.value) ? dossierR.value : OFFLINE_PREVIEW.dossier,
      });
    } catch {
      setDaemonUp(false);
      setTelemetry(OFFLINE_PREVIEW);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTelemetry();
    const id = setInterval(fetchLiveTelemetry, 6000);
    return () => clearInterval(id);
  }, [fetchLiveTelemetry]);

  // Draw crisp dual-theme RF spatial radar on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.41;

    ctx.fillStyle = isDark ? '#06090F' : '#FAF7F0';
    ctx.fillRect(0, 0, w, h);

    // Concentric range rings
    const rings = [0.25, 0.5, 0.75, 1.0];
    ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(3, 105, 161, 0.20)';
    ctx.lineWidth = 1;
    rings.forEach((f, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * f, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = inkSecondary;
      ctx.font = '11px monospace';
      ctx.fillText(`${(idx + 1) * 4}m`, cx + maxR * f + 4, cy - 4);
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.stroke();

    // Operator origin dot
    ctx.fillStyle = emerald;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = inkPrimary;
    ctx.font = 'bold 11px monospace';
    ctx.fillText('HOST', cx + 8, cy + 4);

    // Ambient RF nodes
    const nodes = Array.isArray(telemetry.wifi?.nodes) ? telemetry.wifi.nodes.slice(0, 18) : [];
    nodes.forEach((n, idx) => {
      const dist = Math.min(16, Math.max(1.2, Number(n.distance_m || 6)));
      const angle = (n.x_m != null && n.y_m != null)
        ? Math.atan2(Number(n.y_m), Number(n.x_m))
        : (idx / Math.max(1, nodes.length)) * Math.PI * 2;
      const r = (dist / 16) * maxR;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      ctx.fillStyle = n.is_camera ? crimson : (n.band === '5GHz' ? cyan : gold);
      ctx.beginPath();
      ctx.arc(px, py, n.is_camera ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (idx < 8) {
        const label = `${String(n.ssid || 'NODE').slice(0, 12)} (${dist}m)`;
        const tx = Math.min(w - 132, Math.max(8, px + 7));
        const ty = Math.min(h - 10, Math.max(16, py + 4));
        ctx.fillStyle = inkPrimary;
        ctx.font = '10.5px monospace';
        ctx.fillText(label, tx, ty);
      }
    });
  }, [telemetry, isDark, inkPrimary, inkSecondary, emerald, cyan, gold, crimson, tab]);

  const callDaemonPost = async (path, payload) => {
    if (!daemonUp) {
      setActionMsg('Local daemon :8103 is offline. Launch it first to mutate live hardware state.');
      return;
    }
    try {
      const res = await fetch(`${DAEMON_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentinel-Action': '1',
        },
        body: payload ? JSON.stringify(payload) : '{}',
      });
      const json = await res.json();
      setActionMsg(json.message || `${path} -> ${json.status || json.mode || 'OK'}`);
      await fetchLiveTelemetry();
    } catch (err) {
      setActionMsg(`Request failed: ${err.message}`);
    }
  };

  const handleOptInLaunch = async () => {
    setLaunching(true);
    setActionMsg('Launching Anderson Security Sentinel (:8103) in camera-standby mode (ANDERSON_CAMERA_INDEX=-1)...');
    try {
      const res = await fetch('/api/studio/tool/wake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'anderson-security-sentinel',
          repo: 'anderson-security-sentinel',
          port: 8103,
          optIn: true,
          cameraStandby: true,
        }),
      });
      const data = await res.json();
      if (data?.up) {
        setActionMsg('Standby daemon online on 127.0.0.1:8103 (hardware webcam remains idle).');
        await fetchLiveTelemetry();
      } else {
        setActionMsg(data?.error || 'Could not start :8103. Start manually with `anderson-security-sentinel serve`.');
      }
    } catch (err) {
      setActionMsg(`Launch error: ${err.message}`);
    } finally {
      setLaunching(false);
    }
  };

  const st = telemetry.status || OFFLINE_PREVIEW.status;
  const wifi = telemetry.wifi || OFFLINE_PREVIEW.wifi;
  const usb = telemetry.usb || OFFLINE_PREVIEW.usb;
  const ble = telemetry.ble || OFFLINE_PREVIEW.ble;
  const dossier = telemetry.dossier || OFFLINE_PREVIEW.dossier;
  const bp = wifi.building_perimeter || {};

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Status & Opt-In Daemon Controls */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: bgSubtle,
          border: `1px solid ${borderCol}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            <Chip
              size="small"
              icon={<ShieldIcon sx={{ fontSize: 15 }} />}
              label={daemonUp ? 'LIVE DAEMON :8103 CONNECTED' : 'DAEMON :8103 IDLE (PREVIEW MODE)'}
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: daemonUp ? (isDark ? 'rgba(0,255,136,0.14)' : '#ECFDF5') : (isDark ? 'rgba(212,175,55,0.14)' : '#FEF3C7'),
                color: daemonUp ? emerald : gold,
                border: `1px solid ${daemonUp ? emerald : gold}`,
              }}
            />
            <Chip
              size="small"
              label={`v${st.version || '2.6.0'}`}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: bgCard,
                color: inkPrimary,
                border: `1px solid ${borderCol}`,
              }}
            />
            <Chip
              size="small"
              label={st.armed ? 'PERIMETER ARMED' : 'STANDBY / DISARMED'}
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: bgCard,
                color: st.armed ? emerald : inkSecondary,
                border: `1px solid ${borderCol}`,
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: inkSecondary, fontFamily: mono, fontSize: '0.78rem' }}>
            {daemonUp
              ? 'Bound directly to 127.0.0.1:8103 with verified loopback CORS & ASGI CSRF protection.'
              : 'Opt-in hardware safety: browsing Studio never auto-activates /dev/video0. Launch in standby or run locally.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {!daemonUp && (
            <Button
              variant="contained"
              size="small"
              disabled={launching}
              onClick={handleOptInLaunch}
              startIcon={<PowerSettingsNewIcon />}
              sx={{
                minHeight: 44,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.74rem',
                textTransform: 'none',
                bgcolor: gold,
                color: isDark ? '#08080B' : '#FFFFFF',
                '&:hover': { bgcolor: isDark ? '#E5C158' : '#705423' },
              }}
            >
              {launching ? 'Starting :8103…' : 'Launch Standby Daemon (:8103)'}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            disabled={loading}
            onClick={fetchLiveTelemetry}
            startIcon={<RefreshIcon />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'none',
              color: inkPrimary,
              borderColor: borderCol,
            }}
          >
            {loading ? 'Syncing…' : 'Sync :8103'}
          </Button>
        </Stack>
      </Paper>

      {actionMsg && (
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.25,
            mb: 2,
            borderRadius: 1.5,
            bgcolor: bgSubtle,
            border: `1px solid ${gold}`,
            fontFamily: mono,
            fontSize: '0.76rem',
            color: inkPrimary,
          }}
        >
          {actionMsg}
        </Paper>
      )}

      {/* Telemetry Summary Strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { label: 'BIOMETRIC STATUS', value: st.status || 'STANDBY', sub: `${st.enrolled_count ?? 0} enrolled templates`, color: emerald },
          { label: 'AMBIENT RF NODES', value: `${wifi.total_nodes ?? (wifi.nodes || []).length} BEACONS`, sub: `Disturbance ${Number(wifi.disturbance_index || 0).toFixed(1)}%`, color: cyan },
          { label: 'USB SYSFS TRIPWIRE', value: `${usb.trusted_count ?? 0} TRUSTED`, sub: usb.breach_detected ? 'BREACH DETECTED' : 'Baseline intact', color: usb.breach_detected ? crimson : emerald },
          { label: 'BLE PROXIMITY', value: `${ble.total_devices ?? 0} BEACONS`, sub: ble.owner_present ? 'Trusted owner near' : 'Passive monitoring', color: gold },
        ].map((metric) => (
          <Grid key={metric.label} xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                height: '100%',
                borderRadius: 2,
                bgcolor: bgCard,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: inkSecondary }}>
                {metric.label}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '1.02rem', fontWeight: 800, color: metric.color, my: 0.4 }}>
                {metric.value}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: inkSecondary }}>
                {metric.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Navigation Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: `1px solid ${borderCol}`,
          '& .MuiTab-root': {
            minHeight: 44,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.76rem',
            color: inkSecondary,
            textTransform: 'none',
          },
          '& .Mui-selected': { color: `${gold} !important` },
          '& .MuiTabs-indicator': { bgcolor: gold },
        }}
      >
        <Tab icon={<RadarIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Wi-Fi VRTI Radar & Spectrum" />
        <Tab icon={<ShieldIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Perimeter Controls & Hardware" />
        <Tab icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="SHA-256 Dossier & 4-Tool MCP" />
      </Tabs>

      {/* Tab 0: Wi-Fi VRTI Radar */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary }}>
                  802.11 VRTI SPATIAL RADAR ({wifi.room_bounds?.width_m || '--'}m × {wifi.room_bounds?.length_m || '--'}m)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => callDaemonPost('/api/wifi_xray/scan')}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: cyan, borderColor: cyan, textTransform: 'none' }}
                >
                  Trigger RF Scan
                </Button>
              </Stack>
              <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 1.5, border: `1px solid ${borderCol}` }}>
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={320}
                  aria-label="Anderson Security Sentinel RF spatial radar"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary, mb: 1.25 }}>
                BUILDING ENVELOPE &amp; AMBIENT BEACONS
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: bgSubtle, border: `1px solid ${borderCol}` }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: inkSecondary }}>FOOTPRINT ESTIMATE</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.9rem', fontWeight: 800, color: cyan }}>
                    {bp.footprint_sqm ?? '--'} m² ({bp.building_width_m ?? '--'}m × {bp.building_length_m ?? '--'}m)
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: bgSubtle, border: `1px solid ${borderCol}` }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: inkSecondary }}>SURVEILLANCE OUI CAMERAS</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.9rem', fontWeight: 800, color: (wifi.cameras || []).length ? crimson : emerald }}>
                    {(wifi.cameras || []).length} DETECTED
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ borderColor: borderCol, mb: 1.25 }} />
              <Stack spacing={0.85} sx={{ maxHeight: 195, overflowY: 'auto' }}>
                {(wifi.nodes || []).slice(0, 8).map((n, i) => (
                  <Box key={`${n.bssid || i}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontFamily: mono, fontSize: '0.73rem' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 700, color: inkPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.ssid || 'HIDDEN'} · {n.band || '2.4GHz'}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', color: cyan, flexShrink: 0 }}>
                      {n.rssi_dbm} dBm · {n.distance_m}m
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Perimeter Controls & Hardware */}
      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary, mb: 1.5 }}>
                PERIMETER &amp; OPTICS SHADER CONTROLS (:8103)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => callDaemonPost('/api/arm')}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', bgcolor: emerald, color: isDark ? '#08080B' : '#FFFFFF', textTransform: 'none' }}
                >
                  Arm Perimeter
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => callDaemonPost('/api/disarm')}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, fontSize: '0.74rem', color: crimson, borderColor: crimson, textTransform: 'none' }}
                >
                  Disarm (Standby)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => callDaemonPost('/api/usb/baseline')}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700, fontSize: '0.74rem', color: gold, borderColor: gold, textTransform: 'none' }}
                >
                  Re-Baseline USB
                </Button>
              </Stack>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: inkSecondary, mb: 1 }}>
                ACTIVE OPTICS MODE: <strong>{visionMode.toUpperCase()}</strong>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['normal', 'thermal', 'predator'].map((m) => (
                  <Button
                    key={m}
                    size="small"
                    variant={visionMode === m ? 'contained' : 'outlined'}
                    onClick={() => callDaemonPost('/api/vision_mode', { mode: m })}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      textTransform: 'uppercase',
                      bgcolor: visionMode === m ? gold : 'transparent',
                      color: visionMode === m ? (isDark ? '#08080B' : '#FFFFFF') : inkPrimary,
                      borderColor: borderCol,
                    }}
                  >
                    {m === 'normal' ? 'OPTICAL' : m}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary, mb: 1.25 }}>
                RECENT SECURITY TELEMETRY LEDGER
              </Typography>
              <Stack spacing={0.9} sx={{ maxHeight: 220, overflowY: 'auto' }}>
                {(st.recent_events || []).slice(0, 8).map((ev, idx) => (
                  <Box key={idx} sx={{ p: 1, borderRadius: 1.25, bgcolor: bgSubtle, border: `1px solid ${borderCol}`, fontFamily: mono, fontSize: '0.72rem' }}>
                    <Typography component="span" sx={{ color: gold, fontWeight: 800, mr: 1, fontFamily: mono, fontSize: '0.72rem' }}>
                      [{ev.category || 'SYSTEM'}]
                    </Typography>
                    <Typography component="span" sx={{ color: inkPrimary, fontFamily: mono, fontSize: '0.72rem' }}>
                      {ev.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: SHA-256 Dossier & 4-Tool MCP */}
      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.25 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary }}>
                  SHA-256 FORENSIC CHAIN OF CUSTODY
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadJson(dossier, `${dossier.dossier_id || 'anderson-dossier'}.json`)}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: gold, borderColor: gold, textTransform: 'none' }}
                >
                  Export Dossier JSON
                </Button>
              </Stack>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: bgSubtle, border: `1px solid ${borderCol}`, fontFamily: mono, fontSize: '0.74rem', color: inkPrimary, wordBreak: 'break-all' }}>
                <div><strong>Dossier ID:</strong> {dossier.dossier_id}</div>
                <div><strong>Status:</strong> {dossier.cryptographic_seal?.verification_status || 'SEALED'}</div>
                <div><strong>Root SHA-256:</strong> {dossier.cryptographic_seal?.root_sha256 || '--'}</div>
              </Box>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: bgCard, border: `1px solid ${borderCol}` }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: inkPrimary, mb: 1.25 }}>
                4-TOOL STDIO MCP SERVER (anderson-security-sentinel mcp)
              </Typography>
              <Stack spacing={1}>
                {MCP_TOOLS.map((m) => (
                  <Box key={m.name} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: bgSubtle, border: `1px solid ${borderCol}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: emerald }}>
                      {m.name}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: inkSecondary }}>
                      {m.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
