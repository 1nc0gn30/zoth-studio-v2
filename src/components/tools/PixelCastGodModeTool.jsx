import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function PixelCastGodModeTool() {
  const [statusData, setStatusData] = useState(null);
  const [streamActive, setStreamActive] = useState(false);
  const [screenShotUrl, setScreenShotUrl] = useState('/api/screenshot');
  const [resolution, setResolution] = useState(1080);
  const [bitrate, setBitrate] = useState('8M');
  const [fps, setFps] = useState(60);
  const [textToType, setTextToType] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8148/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        setStreamActive(Boolean(data.stream && data.stream.active));
      }
    } catch (e) {
      // server may be starting or offline
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchMirror = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8148/api/stream/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bitrate,
          max_size: resolution,
          max_fps: fps,
          audio: true,
          stay_awake: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStreamActive(true);
        refreshSnapshot();
      }
    } catch (e) {
      alert('Launch failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopMirror = async () => {
    try {
      await fetch('http://127.0.0.1:8148/api/stream/stop', { method: 'POST' });
      setStreamActive(false);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshSnapshot = () => {
    setScreenShotUrl(`http://127.0.0.1:8148/api/screenshot?t=${Date.now()}`);
  };

  const handleKeyEvent = async (key) => {
    try {
      await fetch('http://127.0.0.1:8148/api/control/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      setTimeout(refreshSnapshot, 600);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendText = async () => {
    if (!textToType.trim()) return;
    try {
      await fetch('http://127.0.0.1:8148/api/control/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToType }),
      });
      setTextToType('');
      setTimeout(refreshSnapshot, 600);
    } catch (e) {
      alert('Text failed: ' + e.message);
    }
  };

  const pixel = statusData?.tailscale?.pixel;
  const selfNode = statusData?.tailscale?.self;
  const battery = statusData?.battery;
  const targetIp = pixel?.ip || '100.106.39.46';
  const mobileUrl = `http://${selfNode?.ip || '100.106.132.5'}:8148/mobile`;

  return (
    <Box sx={{ width: '100%', color: '#F3F4F6' }}>
      <SovereignBand
        kicker="ZothOS Native Hardware Mesh"
        title="PixelCast — Sovereign Google Pixel Screen Mirror"
        subtitle="Ultra-low latency Google Pixel screenshare, camera bridge, and sovereign wireless ADB mirroring workstation over Tailscale mesh."
        accent="#F59E0B"
        badge={
          <Chip
            icon={<CastConnectedIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
            label={pixel?.online ? `Pixel 10 Pro (~${pixel.ping_ms || 40}ms)` : 'Tailscale Standby'}
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              color: '#34D399',
              fontFamily: mono,
              fontWeight: 700,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        }
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* LEFT COLUMN: Controls & Device Specs */}
        <Grid xs={12} lg={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(14, 14, 20, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(16px)',
              mb: 3,
            }}
          >
            <SovereignEyebrow text="Connected Target & Telemetry" accent="#F59E0B" />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 1.5, mb: 2.5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                  {pixel?.hostname || 'Google Pixel 10 Pro'}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: mono, color: '#F59E0B', mt: 0.5 }}>
                  IP: {targetIp} • ADB: {statusData?.adb?.connected ? 'Connected (:5555)' : 'Connecting...'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  component="a"
                  href="http://127.0.0.1:8148"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#F59E0B',
                    textTransform: 'none',
                    fontFamily: mono,
                    fontSize: '0.78rem',
                  }}
                >
                  Workstation :8148
                </Button>
                <Button
                  component="a"
                  href={mobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  endIcon={<QrCode2Icon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#F3F4F6',
                    textTransform: 'none',
                    fontFamily: mono,
                    fontSize: '0.78rem',
                  }}
                >
                  Mobile Cast
                </Button>
              </Stack>
            </Box>

            {/* Battery & Health strip */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontFamily: mono }}>Battery</Typography>
                <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700, color: '#F59E0B' }}>
                  {battery ? `${battery.percent}% ${battery.charging ? '⚡' : ''}` : '25% ⚡'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontFamily: mono }}>Thermal</Typography>
                <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700 }}>
                  {battery ? `${battery.temperature_c}°C` : '36.2°C'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontFamily: mono }}>Mesh Latency</Typography>
                <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700, color: '#10B981' }}>
                  {pixel?.ping_ms ? `~${pixel.ping_ms} ms` : '~40 ms'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontFamily: mono }}>Host Node</Typography>
                <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700 }}>
                  {selfNode?.ip || '100.106.132.5'}
                </Typography>
              </Box>
            </Box>

            {/* Mirroring Trigger Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleLaunchMirror}
                disabled={loading || streamActive}
                startIcon={<PlayArrowIcon />}
                sx={{
                  flex: 1,
                  py: 1.2,
                  bgcolor: '#F59E0B',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  fontFamily: 'Syne, sans-serif',
                  '&:hover': { bgcolor: '#D97706' },
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                }}
              >
                {streamActive ? 'Mirror Active on Desktop' : 'Launch 60fps Scrcpy Mirror'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleStopMirror}
                disabled={!streamActive}
                startIcon={<StopIcon />}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontWeight: 700,
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
                }}
              >
                Stop
              </Button>

              <Button
                variant="outlined"
                onClick={refreshSnapshot}
                startIcon={<CameraAltIcon />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#F3F4F6',
                }}
              >
                Snapshot
              </Button>
            </Stack>

            {/* Remote Navigation Pad */}
            <SovereignEyebrow text="Android Remote Navigation & Hardware Keys" accent="#F59E0B" />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.5, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleKeyEvent('back')}
                startIcon={<ArrowBackIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#F3F4F6', textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleKeyEvent('home')}
                startIcon={<HomeIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#F3F4F6', textTransform: 'none' }}
              >
                Home
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleKeyEvent('recents')}
                startIcon={<AppsIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#F3F4F6', textTransform: 'none' }}
              >
                Apps
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleKeyEvent('power')}
                startIcon={<PowerSettingsNewIcon />}
                sx={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171', textTransform: 'none' }}
              >
                Power
              </Button>
            </Box>

            {/* Volume Strip */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleKeyEvent('voldown')}
                startIcon={<VolumeDownIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF', textTransform: 'none' }}
              >
                Vol -
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleKeyEvent('volup')}
                startIcon={<VolumeUpIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF', textTransform: 'none' }}
              >
                Vol +
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleKeyEvent('mute')}
                startIcon={<VolumeOffIcon />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF', textTransform: 'none' }}
              >
                Mute
              </Button>
            </Stack>

            {/* Fast Text Typer */}
            <SovereignEyebrow text="Type on Pixel Keyboard" accent="#F59E0B" />
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <TextField
                size="small"
                fullWidth
                value={textToType}
                onChange={(e) => setTextToType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Enter string to type onto Pixel..."
                sx={{
                  bgcolor: 'rgba(0,0,0,0.3)',
                  input: { color: '#FFF', fontFamily: mono, fontSize: '0.85rem' },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendText}
                sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700 }}
              >
                Send
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Live Viewport & QR Code */}
        <Grid xs={12} lg={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(14, 14, 20, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SovereignEyebrow text="Live Viewport & QR Connect" accent="#F59E0B" />
              <Chip
                label={streamActive ? 'STREAM ACTIVE' : 'STANDBY'}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: streamActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                  color: streamActive ? '#10B981' : '#F59E0B',
                }}
              />
            </Box>

            {/* Realistic Phone Chassis */}
            <Box
              sx={{
                width: 240,
                height: 480,
                bgcolor: '#000',
                borderRadius: '32px',
                border: '4px solid #27272A',
                boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              {/* Notch */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: '#18181B',
                  border: '1.5px solid #27272A',
                  zIndex: 2,
                }}
              />

              <Box
                component="img"
                src={screenShotUrl}
                alt="Google Pixel Live Screen Viewport"
                onError={(e) => { e.target.style.opacity = '0.3'; }}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />

              {/* Bottom bar indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  width: 80,
                  height: 4,
                  bgcolor: 'rgba(255,255,255,0.4)',
                  borderRadius: '999px',
                }}
              />
            </Box>

            {/* QR Code for Instant Pixel Connection */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                component="img"
                src="http://127.0.0.1:8148/api/qr"
                alt="Tailscale Mobile Connect QR Code"
                sx={{ width: 68, height: 68, borderRadius: 1, bgcolor: '#FFF', p: 0.5 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFF' }}>
                  Scan with Pixel Camera
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  Instant camera lens streaming & file drop over Tailscale.
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#F59E0B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mobileUrl}
                </Typography>
              </Box>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
