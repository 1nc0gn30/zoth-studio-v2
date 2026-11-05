import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function SovereignTutorialModal({
  toolId,
  toolName,
  tagline,
  steps = [],
  accentColor = '#FFB800',
  open,
  onClose,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    } else {
      const seen = localStorage.getItem(`sov_tutorial_seen_${toolId}`);
      if (!seen) {
        const timer = setTimeout(() => setInternalOpen(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [open, toolId]);

  // Live Sub-pixel Unicode Braille Wave Animation
  useEffect(() => {
    if (!internalOpen) return;
    let tick = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const interval = setInterval(() => {
      tick += 0.16;
      const W = 38;
      const H = 7;
      let out = '';
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let mask = 0;
          const dots = [
            [0, 0, 0x01], [0, 1, 0x02], [0, 2, 0x04], [0, 3, 0x40],
            [1, 0, 0x08], [1, 1, 0x10], [1, 2, 0x20], [1, 3, 0x80]
          ];
          for (let d = 0; d < 8; d++) {
            const px = x * 2 + dots[d][0];
            const py = y * 4 + dots[d][1];
            const v = Math.sin(px * 0.18 + tick) * Math.cos(py * 0.32 + tick);
            if (v > 0.08) mask |= dots[d][2];
          }
          out += String.fromCharCode(0x2800 | mask);
        }
        out += '\n';
      }
      canvas.textContent = out;
    }, 55);

    return () => clearInterval(interval);
  }, [internalOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const handleDontShow = (e) => {
    if (e.target.checked) {
      localStorage.setItem(`sov_tutorial_seen_${toolId}`, 'true');
    } else {
      localStorage.removeItem(`sov_tutorial_seen_${toolId}`);
    }
  };

  return (
    <Dialog
      open={internalOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0D111E',
          color: '#F8FAFC',
          borderRadius: 3,
          border: `2px solid ${accentColor}`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 35px ${accentColor}33`,
          backdropFilter: 'blur(20px)',
          fontFamily: mono,
          p: 1,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: '#94A3B8',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 32, lineHeight: 1 }}>✨</Typography>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: accentColor, fontFamily: mono, letterSpacing: '0.04em' }}>
              {toolName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>
              {tagline} · Kid-Friendly Quickstart
            </Typography>
          </Box>
        </Stack>

        {/* Live Animated Braille ASCII Screen */}
        <Box
          sx={{
            bgcolor: '#05070D',
            border: `1px solid ${accentColor}44`,
            borderRadius: 2,
            p: 1.5,
            mb: 2.5,
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <pre
            ref={canvasRef}
            style={{
              fontSize: '10px',
              lineHeight: '10px',
              color: '#38BDF8',
              margin: 0,
              fontFamily: mono,
              whiteSpace: 'pre',
            }}
          />
        </Box>

        {/* Kid-Friendly Explanations / Steps */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {steps.map((s, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                p: 1.8,
                alignItems: 'flex-start',
              }}
            >
              <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{s.icon}</Typography>
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: idx === 0 ? accentColor : '#38BDF8', mb: 0.5, fontFamily: mono }}>
                  Step {idx + 1}: {s.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.5, fontFamily: mono }}>
                  {s.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Bottom Actions */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1.5}
          sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <FormControlLabel
            control={<Checkbox size="small" onChange={handleDontShow} sx={{ color: '#94A3B8', '&.Mui-checked': { color: accentColor } }} />}
            label={<Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: mono }}>Don't show automatically on first visit</Typography>}
          />
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              bgcolor: accentColor,
              color: '#000',
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.82rem',
              borderRadius: 999,
              px: 3,
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            Got It, Let's Build! 🚀
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
