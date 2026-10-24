import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const PROVIDERS = [
  {
    id: 'gelato-eu',
    name: 'Gelato Local Hub (32-Country Mesh)',
    baseCost: 11.4,
    shipCost: 3.9,
    transitDays: 2,
    customsRisk: 'ZERO (Local Print)',
    color: '#34D399',
  },
  {
    id: 'printify-choice',
    name: 'Printify Choice US/UK Network',
    baseCost: 9.8,
    shipCost: 4.8,
    transitDays: 4,
    customsRisk: 'LOW',
    color: '#38BDF8',
  },
  {
    id: 'direct-atelier',
    name: 'Sovereign Direct Fine-Art Atelier',
    baseCost: 13.5,
    shipCost: 4.2,
    transitDays: 3,
    customsRisk: 'ZERO',
    color: '#D4AF37',
  },
];

export default function PodCommerceGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [retailPrice, setRetailPrice] = useState(38);
  const [quantity, setQuantity] = useState(2);
  const [channel, setChannel] = useState('shopify');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const channelFeePct = channel === 'shopify' ? 0.029 : 0.095; // Shopify 2.9% vs Etsy 6.5%+3%

  const quotes = useMemo(() => {
    const grossRev = retailPrice * quantity;
    const platformFee = grossRev * channelFeePct + 0.3;

    return PROVIDERS.map((p) => {
      const fulfillment = p.baseCost * quantity + p.shipCost + (quantity - 1) * 1.5;
      const netProfit = grossRev - platformFee - fulfillment;
      const marginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;
      return {
        ...p,
        grossRev: Number(grossRev.toFixed(2)),
        platformFee: Number(platformFee.toFixed(2)),
        fulfillment: Number(fulfillment.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        marginPct: Number(marginPct.toFixed(1)),
      };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [retailPrice, quantity, channelFeePct]);

  const winner = quotes[0];

  const dispatchPayload = useMemo(
    () =>
      JSON.stringify(
        {
          routed_by: 'pod-smart-router-v2',
          selected_provider: winner.id,
          channel,
          quantity,
          margin_telemetry: {
            gross_revenue_usd: winner.grossRev,
            fulfillment_cost_usd: winner.fulfillment,
            platform_fee_usd: winner.platformFee,
            net_profit_usd: winner.netProfit,
            net_margin_pct: `${winner.marginPct}%`,
          },
          dispatch_contact: {
            operator: 'Neal Frazier Tech',
            phone: '+1-555-555-0199',
            email: 'neal@nealfrazier.tech',
          },
        },
        null,
        2
      ),
    [winner, channel, quantity]
  );

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

      const leftX = 56;
      const rightX = w - 66;
      const cy = h * 0.5;

      quotes.forEach((q, idx) => {
        const y = 38 + idx * 48;
        ctx.beginPath();
        ctx.moveTo(leftX, cy);
        ctx.bezierCurveTo(w * 0.4, cy, w * 0.55, y, rightX, y);
        ctx.strokeStyle = idx === 0 ? q.color : 'rgba(148,163,184,0.25)';
        ctx.lineWidth = idx === 0 ? 2.5 : 1.2;
        ctx.stroke();

        const p = (t * 0.65 + idx * 0.3) % 1;
        const px = leftX + (rightX - leftX) * p;
        const py = cy + (y - cy) * p;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = q.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rightX, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#07090F';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = q.color;
        ctx.stroke();
        ctx.fillStyle = '#EDEFF2';
        ctx.font = '700 8.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(q.marginPct)}%`, rightX, y + 3);
      });

      ctx.beginPath();
      ctx.arc(leftX, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52,211,153,0.18)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34D399';
      ctx.stroke();
      ctx.fillStyle = '#EDEFF2';
      ctx.font = '800 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ORDER', leftX, cy + 3);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [quotes]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(dispatchPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          icon={<LocalShippingIcon sx={{ fontSize: '0.95rem !important', color: '#34D399 !important' }} />}
          label="POD COMMERCE & MARGIN SENTINEL · SMART ROUTER"
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(52,211,153,0.14)',
            color: '#34D399',
            border: '1px solid rgba(52,211,153,0.35)',
          }}
        />
        <Chip
          icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: '#D4AF37 !important' }} />}
          label={`OPTIMAL NET MARGIN: ${winner.marginPct}% ($${winner.netProfit})`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(212,175,55,0.14)',
            color: '#F5E6AB',
          }}
        />
      </Stack>
      <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400, mb: 3 }}>
        Autonomous Printify × Gelato × Shopify × Etsy <span style={{ color: '#34D399' }}>Margin Arbitrage</span> Router
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Stack spacing={2.25}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Storefront Channel</InputLabel>
              <Select
                value={channel}
                label="Storefront Channel"
                onChange={(e) => setChannel(e.target.value)}
                sx={{ fontFamily: mono, fontSize: '0.8rem' }}
              >
                <MenuItem value="shopify" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                  Shopify Direct (2.9% + $0.30 Stripe)
                </MenuItem>
                <MenuItem value="etsy" sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                  Etsy Marketplace (6.5% Tx + 3% Payment)
                </MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                Unit Retail Price: ${retailPrice} USD
              </Typography>
              <Slider min={18} max={95} step={1} value={retailPrice} onChange={(_, v) => setRetailPrice(v)} sx={{ color: '#34D399' }} />
            </Box>

            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                Order Quantity: {quantity} units
              </Typography>
              <Slider min={1} max={15} step={1} value={quantity} onChange={(_, v) => setQuantity(v)} sx={{ color: '#38BDF8' }} />
            </Box>

            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(52,211,153,0.3)',
                bgcolor: '#06080C',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(52,211,153,0.18)',
                  bgcolor: 'rgba(52,211,153,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#34D399', fontWeight: 700 }}>
                  FULFILLMENT ARBITRAGE ROUTER
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                  60 FPS WATERFALL
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 165, display: 'block' }} />
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={7}>
          <Stack spacing={1.5}>
            {quotes.map((q, idx) => (
              <Box
                key={q.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                  border: `1px solid ${idx === 0 ? 'rgba(52,211,153,0.45)' : 'rgba(148,163,184,0.18)'}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: q.color }}>
                    {idx === 0 ? '★ WINNER: ' : ''}{q.name}
                  </Typography>
                  <Chip
                    label={`+$${q.netProfit} Net (${q.marginPct}%)`}
                    size="small"
                    sx={{
                      height: 20,
                      fontFamily: mono,
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      color: q.color,
                      bgcolor: 'rgba(0,0,0,0.35)',
                    }}
                  />
                </Stack>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary', mb: 0.75 }}>
                  Gross: ${q.grossRev} · Print+Ship: ${q.fulfillment} · Fee: ${q.platformFee} · Transit: {q.transitDays}d ({q.customsRisk})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(5, Math.min(100, q.marginPct))}
                  sx={{
                    height: 5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: q.color },
                  }}
                />
              </Box>
            ))}

            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#05060A',
                border: '1px solid rgba(212,175,55,0.28)',
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 1.5, py: 0.65, bgcolor: 'rgba(212,175,55,0.08)' }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#F5E6AB', fontWeight: 700 }}>
                  SIGNED FULFILLMENT DISPATCH PAYLOAD
                </Typography>
                <Button
                  size="small"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37' }}
                >
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.25,
                  maxHeight: 150,
                  overflow: 'auto',
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  color: '#E2E8F0',
                }}
              >
                {dispatchPayload}
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
