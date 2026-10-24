import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Slider,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import PanToolIcon from '@mui/icons-material/PanTool';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import { useReality } from '../../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

const KINEMATIC_MODES = [
  {
    id: 'hand-21',
    label: '21-Joint Hand Skeleton (Gesture Control)',
    joints: 21,
    fpsTarget: 60,
    bindings: [
      { gesture: 'PINCH_INDEX_THUMB (< 0.045m)', action: 'zoth-mode --cycle-reality', ring: 'Ring 2' },
      { gesture: 'SWIPE_LEFT_TWO_FINGER', action: 'qdbus org.kde.KWin /KWin nextDesktop', ring: 'Ring 1' },
      { gesture: 'FIST_HOLD_800MS', action: 'zoth-amnesia --lock-vault', ring: 'Ring 0' },
      { gesture: 'OPEN_PALM_SPREAD', action: 'zoth-voice-call --ptt-toggle', ring: 'Ring 2' },
    ],
  },
  {
    id: 'face-viseme',
    label: '68-Point Facial Mesh & Viseme Lip-Sync (Likeness Desk)',
    joints: 68,
    fpsTarget: 60,
    bindings: [
      { gesture: 'JAW_OPEN_RATIO (> 0.38)', action: 'Viseme_AA_Weight = 0.92 (Kokoro TTS Sync)', ring: 'Ring 2' },
      { gesture: 'BROW_INNER_UP (> 0.25)', action: 'Avatar_Expressiveness_Boost (+18%)', ring: 'Ring 2' },
      { gesture: 'HEAD_YAW_GAZE_TRACK', action: 'ZothBot_EyeTrack_Target (x, y, z)', ring: 'Ring 3' },
      { gesture: 'BLINK_BILATERAL_SYNC', action: 'Keyframe_Natural_Blink_140ms', ring: 'Ring 3' },
    ],
  },
];

export default function VisionKinematicsGodModeTool() {
  const { activeTheme, cycleReality } = useReality();
  const [modeId, setModeId] = useState(KINEMATIC_MODES[0].id);
  const [pinchThreshold, setPinchThreshold] = useState(0.045);
  const [kalmanSmoothing, setKalmanSmoothing] = useState(0.72);
  const [visemeGain, setVisemeGain] = useState(1.15);
  const [cursorNorm, setCursorNorm] = useState({ x: 0.5, y: 0.5, pinching: false });
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const activeMode = useMemo(
    () => KINEMATIC_MODES.find((m) => m.id === modeId) || KINEMATIC_MODES[0],
    [modeId]
  );

  // 60fps 21-Joint Hand Skeleton / 68-Point Face Mesh Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      t += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#05070C';
      ctx.fillRect(0, 0, w, h);

      // Coordinate grid
      ctx.strokeStyle = `${activeTheme.primary}18`;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w * (0.28 + (cursorNorm.x - 0.5) * 0.25);
      const cy = h * (0.58 + (cursorNorm.y - 0.5) * 0.2);

      if (modeId === 'hand-21') {
        // Wrist root (0)
        const wrist = { x: cx, y: cy + 55 };
        const pinchFactor = cursorNorm.pinching ? 0.22 : 0.65 + Math.sin(t * 2) * 0.25;

        // 5 Finger chains (4 joints each = 20 + wrist = 21)
        const fingerAngles = [-0.85, -0.38, -0.05, 0.28, 0.62];
        const fingerLengths = [64, 88, 96, 86, 68];

        const allJoints = [wrist];
        let thumbTip = wrist;
        let indexTip = wrist;

        fingerAngles.forEach((baseAngle, fIdx) => {
          let prev = wrist;
          const totalLen = fingerLengths[fIdx];
          for (let j = 1; j <= 4; j++) {
            const segRatio = j / 4;
            const curl =
              fIdx <= 1
                ? (1 - pinchFactor) * (fIdx === 0 ? 0.55 : -0.45) * segRatio
                : Math.sin(t + fIdx * 0.6) * 0.12 * segRatio;
            const ang = -Math.PI / 2 + baseAngle + curl;
            const r = totalLen * segRatio;
            const jx = wrist.x + Math.cos(ang) * r;
            const jy = wrist.y + Math.sin(ang) * r;
            const pt = { x: jx, y: jy };

            ctx.strokeStyle = fIdx <= 1 ? activeTheme.primary : `${activeTheme.secondary}AA`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();

            prev = pt;
            allJoints.push(pt);
            if (fIdx === 0 && j === 4) thumbTip = pt;
            if (fIdx === 1 && j === 4) indexTip = pt;
          }
        });

        // Draw pinch vector between Thumb Tip (4) and Index Tip (8)
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        ctx.strokeStyle = pinchDist < 42 ? '#10B981' : '#F43F5E';
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(thumbTip.x, thumbTip.y);
        ctx.lineTo(indexTip.x, indexTip.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw all 21 joints
        allJoints.forEach((pt, idx) => {
          ctx.fillStyle = idx === 4 || idx === 8 ? '#10B981' : activeTheme.primary;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, idx === 0 ? 5 : 3.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Telemetry HUD on right side of canvas
        ctx.fillStyle = activeTheme.primary;
        ctx.font = `700 11px ${mono}`;
        ctx.fillText(`MEDIAPIPE 21-JOINT HAND KINEMATICS`, w - 265, 36);
        ctx.fillStyle = '#F5F0E8';
        ctx.font = `500 10px ${mono}`;
        ctx.fillText(`PINCH DIST (J4-J8): ${(pinchDist * 0.001).toFixed(4)}m`, w - 265, 58);
        ctx.fillText(`KALMAN ALPHA:       ${kalmanSmoothing.toFixed(2)}`, w - 265, 76);
        ctx.fillText(`GESTURE STATE:      ${pinchDist < 42 ? 'PINCH_ACTIVE' : 'OPEN_TRACKING'}`, w - 265, 94);
      } else {
        // 68-Point Facial Mesh & Viseme Lip-Sync
        const fcx = w * 0.3;
        const fcy = h * 0.5;
        const jawOpen = (0.25 + Math.abs(Math.sin(t * 2.4)) * 0.45) * visemeGain;

        // Outer jawline & cranium contour
        ctx.strokeStyle = `${activeTheme.primary}88`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(fcx, fcy, 54, 68 + jawOpen * 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Eyes with cursor gaze tracking
        [-22, 22].forEach((ox) => {
          ctx.strokeStyle = activeTheme.primary;
          ctx.beginPath();
          ctx.ellipse(fcx + ox, fcy - 14, 12, 6, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = activeTheme.secondary;
          ctx.beginPath();
          ctx.arc(
            fcx + ox + (cursorNorm.x - 0.5) * 8,
            fcy - 14 + (cursorNorm.y - 0.5) * 4,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });

        // Animated Phoneme Viseme Mouth Mesh
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(fcx, fcy + 26, 20, Math.max(3, jawOpen * 18), 0, 0, Math.PI * 2);
        ctx.stroke();

        // Right-side Viseme Waveform Bars
        const visemes = ['AA', 'EE', 'IH', 'OH', 'OU', 'MM'];
        visemes.forEach((v, idx) => {
          const weight = Math.max(0.08, Math.abs(Math.sin(t * 2.1 + idx * 0.9)) * Math.min(1, visemeGain * 0.8));
          const bx = w - 255;
          const by = 32 + idx * 26;
          ctx.fillStyle = '#94A3B8';
          ctx.font = `700 10px ${mono}`;
          ctx.fillText(`VISEME_${v}`, bx, by + 10);

          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(bx + 72, by, 140, 12);
          ctx.fillStyle = idx % 2 === 0 ? activeTheme.primary : activeTheme.secondary;
          ctx.fillRect(bx + 72, by, 140 * weight, 12);
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTheme, modeId, cursorNorm, kalmanSmoothing, visemeGain]);

  const exportedConfigJson = useMemo(() => {
    return JSON.stringify(
      {
        engine: 'ZothOS Vision & Likeness Kinematics Engine v3.2',
        mode: modeId,
        realityTheme: activeTheme.id,
        parameters: {
          pinchThresholdMeters: pinchThreshold,
          kalmanFilterAlpha: kalmanSmoothing,
          visemeLipSyncGain: visemeGain,
          zeroEgressWebGPU: true,
        },
        bindings: activeMode.bindings,
      },
      null,
      2
    );
  }, [modeId, activeTheme.id, pinchThreshold, kalmanSmoothing, visemeGain, activeMode]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(exportedConfigJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportedConfigJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-${modeId}-kinematics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 5,
        borderRadius: activeTheme.borderRadius || '12px',
        bgcolor: 'rgba(9, 11, 17, 0.9)',
        border: `1px solid ${activeTheme.border}`,
        boxShadow: activeTheme.cardGlow,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap', useFlexGap: true }}>
            <Chip
              icon={<PanToolIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />}
              label="60FPS WEBGPU HAND & FACIAL KINEMATICS ENGINE"
              size="small"
              sx={{
                bgcolor: `${activeTheme.primary}18`,
                color: activeTheme.primary,
                border: `1px solid ${activeTheme.border}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              label={`${activeMode.joints} LANDMARKS @ 60FPS`}
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.14)',
                color: '#10B981',
                border: '1px solid rgba(16,185,129,0.35)',
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 800 }}>
            Vision Gesture Control & AI Likeness Viseme Rig
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
            Move or click inside the 60fps viewport to test 21-joint skeletal hand pinch gestures, 68-point facial gaze/viseme weights, and KWin desktop triggers.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
          {KINEMATIC_MODES.map((m) => (
            <Button
              key={m.id}
              size="small"
              variant={modeId === m.id ? 'contained' : 'outlined'}
              onClick={() => setModeId(m.id)}
              startIcon={m.id === 'hand-21' ? <PanToolIcon /> : <FaceRetouchingNaturalIcon />}
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: modeId === m.id ? activeTheme.primary : 'transparent',
                color: modeId === m.id ? '#06080D' : activeTheme.primary,
                borderColor: activeTheme.border,
              }}
            >
              {m.label.split(' (')[0]}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Left Column: Interactive 60fps Kinematics Viewport & Sliders */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#05070B',
                border: `1px solid ${activeTheme.border}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, fontWeight: 700 }}>
                  INTERACTIVE KINEMATIC STAGE (HOVER TO STEER • CLICK TO PINCH)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={cycleReality}
                  sx={{ fontFamily: mono, fontSize: '0.66rem', py: 0.2, color: activeTheme.primary, borderColor: activeTheme.border }}
                >
                  Trigger Pinch → Cycle Reality
                </Button>
              </Stack>
              <canvas
                ref={canvasRef}
                width={540}
                height={210}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setCursorNorm((prev) => ({
                    ...prev,
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height,
                  }));
                }}
                onMouseDown={() => setCursorNorm((prev) => ({ ...prev, pinching: true }))}
                onMouseUp={() => setCursorNorm((prev) => ({ ...prev, pinching: false }))}
                style={{ width: '100%', height: 210, display: 'block', borderRadius: 6, cursor: 'crosshair' }}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    PINCH THRESHOLD ({pinchThreshold.toFixed(3)}m)
                  </Typography>
                  <Slider
                    min={0.02}
                    max={0.09}
                    step={0.005}
                    value={pinchThreshold}
                    onChange={(_, v) => setPinchThreshold(v)}
                    sx={{ color: activeTheme.primary }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    KALMAN SMOOTHING ({kalmanSmoothing.toFixed(2)})
                  </Typography>
                  <Slider
                    min={0.2}
                    max={0.95}
                    step={0.05}
                    value={kalmanSmoothing}
                    onChange={(_, v) => setKalmanSmoothing(v)}
                    sx={{ color: activeTheme.primary }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    VISEME GAIN ({visemeGain.toFixed(2)}x)
                  </Typography>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={visemeGain}
                    onChange={(_, v) => setVisemeGain(v)}
                    sx={{ color: activeTheme.primary }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Gesture-to-Action Dispatch Table & Config Export */}
        <Grid xs={12} md={6}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                },
              }}
            >
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="ZothOS Gesture Bindings" />
              <Tab icon={<CodeIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Kinematics Profile (.json)" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Stack spacing={1.25}>
              {activeMode.bindings.map((b, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: '#06080E',
                    border: `1px solid ${activeTheme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: activeTheme.primary }}>
                      {b.gesture}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary', mt: 0.25 }}>
                      ↳ <code>{b.action}</code>
                    </Typography>
                  </Box>
                  <Chip
                    label={b.ring}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: `${activeTheme.primary}20`,
                      color: activeTheme.primary,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                  ZothOS Kinematics & Viseme Rig JSON
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={handleCopy}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, borderColor: activeTheme.border }}
                  >
                    {copied ? 'Copied' : 'Copy JSON'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: activeTheme.primary, color: '#05070B', fontWeight: 800 }}
                  >
                    Export .json
                  </Button>
                </Stack>
              </Stack>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 1.5,
                  bgcolor: '#05070B',
                  border: `1px solid ${activeTheme.border}`,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  overflowX: 'auto',
                  maxHeight: 310,
                }}
              >
                {exportedConfigJson}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
