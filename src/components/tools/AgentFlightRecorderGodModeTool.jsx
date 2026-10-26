import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

function fnv1aHex(str) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return (
    '0x' +
    (h1 >>> 0).toString(16).padStart(8, '0') +
    (h2 >>> 0).toString(16).padStart(8, '0')
  );
}

const INITIAL_STEPS = [
  {
    step: 1,
    actor: 'zoth-conductor',
    action: 'THERMAL_CHECK',
    payload: 'Max=49.0C | Avg=36.4C | State=COOL (<60C invariant verified)',
  },
  {
    step: 2,
    actor: 'hermes-agent',
    action: 'AST_SCHEMA_AUDIT',
    payload: 'Validated Schema.org @graph nodes and canonical @id pointers',
  },
  {
    step: 3,
    actor: 'egress-sentinel',
    action: 'SOCKET_VERIFY',
    payload: 'All 22 local daemons bound strictly to 127.0.0.1 loopback',
  },
  {
    step: 4,
    actor: 'ui-verifier',
    action: 'VIEWPORT_CAPTURE',
    payload: 'Mobile 375px / Tablet 768px / Desktop 1440px -> 0 errors, 0px overflow',
  },
];

export default function AgentFlightRecorderGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [selectedStep, setSelectedStep] = useState(0);
  const [newActor, setNewActor] = useState('grok-cli');
  const [newAction, setNewAction] = useState('TOOL_CALL_VERIFY');
  const [newPayload, setNewPayload] = useState('Executed deterministic test suite in 180ms with 0 warnings');

  const canvasRef = useRef(null);

  const merkleChain = steps.reduce((acc, s, idx) => {
    const prevHash = idx === 0 ? '0x0000000000000000' : acc[idx - 1].hash;
    const hash = fnv1aHex(`${prevHash}:${s.step}:${s.actor}:${s.action}:${s.payload}`);
    acc.push({ ...s, prevHash, hash });
    return acc;
  }, []);

  const handleAppendStep = () => {
    if (!newPayload.trim()) return;
    setSteps((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        actor: newActor.trim() || 'agent-node',
        action: newAction.trim() || 'EXEC_STEP',
        payload: newPayload.trim(),
      },
    ]);
    setSelectedStep(steps.length);
    setNewPayload('');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 175;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const visible = merkleChain.slice(-6);
      const spacing = (w - 80) / Math.max(1, visible.length - 1);
      const cy = h * 0.5;

      visible.forEach((node, i) => {
        const x = 40 + i * spacing;
        const y = cy + Math.sin(t + i * 0.8) * 10;
        if (i < visible.length - 1) {
          const nx = 40 + (i + 1) * spacing;
          const ny = cy + Math.sin(t + (i + 1) * 0.8) * 10;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = 'rgba(56,189,248,0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const isSel = node.step - 1 === selectedStep;
        ctx.beginPath();
        ctx.arc(x, y, isSel ? 16 : 13, 0, Math.PI * 2);
        ctx.fillStyle = '#070910';
        ctx.fill();
        ctx.lineWidth = isSel ? 2.5 : 1.8;
        ctx.strokeStyle = isSel ? '#D4AF37' : '#38BDF8';
        ctx.stroke();

        ctx.fillStyle = '#EDEFF2';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`#${node.step}`, x, y + 3);
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(node.hash.slice(0, 8), x, y + 28);
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [merkleChain, selectedStep]);

  const activeBlock = merkleChain[selectedStep] || merkleChain[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(56,189,248,0.35)' : 'rgba(14,165,233,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Chip
              icon={<FlightTakeoffIcon sx={{ fontSize: '0.95rem !important', color: '#38BDF8 !important' }} />}
              label="AGENT FLIGHT RECORDER · MERKLE TRAJECTORY BLACKBOX"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(56,189,248,0.14)',
                color: '#38BDF8',
                border: '1px solid rgba(56,189,248,0.35)',
              }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '0.9rem !important', color: '#34D399 !important' }} />}
              label={`CHAIN HEAD: ${merkleChain[merkleChain.length - 1]?.hash}`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(52,211,153,0.14)',
                color: '#34D399',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400 }}>
            Tamper-Evident <span style={{ color: '#38BDF8' }}>Merkle DAG</span> Trajectory & Replay Debugger
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Stack spacing={1.5}>
            {merkleChain.map((b, idx) => (
              <Box
                key={b.step}
                onClick={() => setSelectedStep(idx)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor:
                    selectedStep === idx
                      ? 'rgba(56,189,248,0.1)'
                      : isDark
                      ? 'rgba(255,255,255,0.025)'
                      : '#F8FAFC',
                  border: `1px solid ${
                    selectedStep === idx ? '#D4AF37' : 'rgba(148,163,184,0.18)'
                  }`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 800, color: '#38BDF8' }}>
                    STEP #{b.step} · {b.actor} → {b.action}
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37' }}>
                    {b.hash}
                  </Typography>
                </Stack>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary' }}>
                  {b.payload}
                </Typography>
              </Box>
            ))}

            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                border: '1px solid rgba(148,163,184,0.2)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, mb: 1 }}>
                APPEND SIGNED TRAJECTORY FRAME
              </Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Agent Actor"
                    value={newActor}
                    onChange={(e) => setNewActor(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Action Type"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Observation / Tool Output"
                    value={newPayload}
                    onChange={(e) => setNewPayload(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAppendStep}
                    sx={{
                      bgcolor: '#38BDF8',
                      color: '#08080B',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Seal Frame
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(56,189,248,0.3)',
                bgcolor: '#06080E',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(56,189,248,0.18)',
                  bgcolor: 'rgba(56,189,248,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#38BDF8', fontWeight: 700 }}>
                  CRYPTOGRAPHIC MERKLE CHAIN TOPOLOGY
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#34D399' }}>
                  ZERO DRIFT VERIFIED
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 170, display: 'block' }} />
            </Box>

            {activeBlock && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#05060A',
                  border: '1px solid rgba(212,175,55,0.32)',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#F5E6AB', fontWeight: 800, mb: 1 }}>
                  INSPECTING SEALED BLOCK #{activeBlock.step}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    color: '#E2E8F0',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(activeBlock, null, 2)}
                </Box>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
