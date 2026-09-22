import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button, Grid, Stack, Slider, Divider, Breadcrumbs, Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalculateIcon from '@mui/icons-material/Calculate';
import CodeIcon from '@mui/icons-material/Code';
import TuneIcon from '@mui/icons-material/Tune';
import { mathPillars } from '../data/mathPillars';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarDetailPage() {
  const { pillarId } = useParams();
  const navigate = useNavigate();

  const pillarIndex = mathPillars.findIndex((p) => p.id === pillarId);
  const pillar = mathPillars[pillarIndex] || mathPillars[0];

  const prevPillar = mathPillars[(pillarIndex - 1 + mathPillars.length) % mathPillars.length];
  const nextPillar = mathPillars[(pillarIndex + 1) % mathPillars.length];

  // Interactive Simulator States per Pillar
  const [param1, setParam1] = useState(0.7); // Temperature / LR / tau / etc.
  const [param2, setParam2] = useState(128); // dimension / heads / delta t

  // Compute live mathematical values for simulator
  const computeSim = () => {
    switch (pillar.id) {
      case 'linear': {
        const d_model = param2 * 16;
        const heads = 16;
        const d_head = d_model / heads;
        const kv_cache_mb = ((2 * 32 * heads * d_head * 4096 * 2) / (1024 * 1024)).toFixed(2);
        return {
          label1: `Embedding Dimension d_model: ${d_model}`,
          label2: `Head Dimension d_head: ${d_head}`,
          resultLabel: `KV Cache Memory per 4K sequence: ${kv_cache_mb} MB`,
        };
      }
      case 'calculus': {
        const lr = (param1 * 0.001).toFixed(5);
        const grad_norm = (param2 / 10).toFixed(1);
        const weight_update = (lr * grad_norm).toFixed(6);
        return {
          label1: `Learning Rate η: ${lr}`,
          label2: `Gradient Norm ||g||: ${grad_norm}`,
          resultLabel: `Step Magnitude Δθ = η · ||g||: ${weight_update}`,
        };
      }
      case 'probability': {
        const tau = param1.toFixed(2);
        const logits = [2.4, 1.1, -0.5, 0.2];
        const exps = logits.map((z) => Math.exp(z / Math.max(0.01, param1)));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map((e) => (e / sumExp).toFixed(4));
        const entropy = -probs.reduce((acc, p) => (p > 0 ? acc + p * Math.log2(p) : acc), 0).toFixed(3);
        return {
          label1: `Softmax Temperature τ: ${tau}`,
          label2: `Top Token Probability P(w₀): ${probs[0]}`,
          resultLabel: `Shannon Entropy H(X): ${entropy} bits`,
        };
      }
      case 'hessian': {
        const lambda_max = (param1 * 10).toFixed(2);
        const lambda_min = Math.max(0.01, (param2 / 100)).toFixed(2);
        const kappa = (lambda_max / lambda_min).toFixed(2);
        return {
          label1: `Max Eigenvalue λ_max: ${lambda_max}`,
          label2: `Min Eigenvalue λ_min: ${lambda_min}`,
          resultLabel: `Hessian Condition Number κ(H) = λ_max / λ_min: ${kappa}`,
        };
      }
      case 'lyapunov': {
        const lambda = (param1 - 1.0).toFixed(2);
        const time_t = param2;
        const divergence = Math.exp(lambda * (time_t / 10)).toFixed(4);
        return {
          label1: `Max Lyapunov Exponent λ: ${lambda}`,
          label2: `Time Step t: ${time_t}ms`,
          resultLabel: `State Divergence ||δZ(t)|| / ||δZ(0)||: ${divergence}`,
        };
      }
      case 'stdp': {
        const delta_t = (param2 - 64).toFixed(1);
        const tau_plus = 16.8;
        const tau_minus = 33.7;
        let delta_w = 0;
        if (delta_t > 0) {
          delta_w = 0.85 * Math.exp(-delta_t / tau_plus);
        } else {
          delta_w = -0.45 * Math.exp(delta_t / tau_minus);
        }
        return {
          label1: `Spike Interval Δt (pre - post): ${delta_t} ms`,
          label2: `Plasticity Regime: ${delta_t > 0 ? 'LTP (Potentiation)' : 'LTD (Depression)'}`,
          resultLabel: `Synaptic Weight Change Δw: ${delta_w.toFixed(5)}`,
        };
      }
      default:
        return { label1: '', label2: '', resultLabel: '' };
    }
  };

  const sim = computeSim();

  // Code Snippet implementation examples
  const codeExamples = {
    linear: `# PyTorch / WGSL Matrix Attention Projection
import torch
import torch.nn.functional as F

def compute_scaled_dot_product_attention(Q, K, V, d_k=128):
    # Q, K, V shape: [batch, heads, seq_len, d_k]
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V)
`,
    calculus: `# AdamW Gradient Update Step
import torch

def adamw_step(param, grad, exp_avg, exp_avg_sq, lr=3e-4, beta1=0.9, beta2=0.999, weight_decay=0.01):
    # Perform weight decay
    param.data.mul_(1.0 - lr * weight_decay)
    # Update first and second moments
    exp_avg.mul_(beta1).add_(grad, alpha=1 - beta1)
    exp_avg_sq.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)
    denom = exp_avg_sq.sqrt().add_(1e-8)
    param.data.addcdiv_(exp_avg, denom, value=-lr)
`,
    probability: `# Temperature-Scaled Softmax & Shannon Entropy
import numpy as np

def temperature_softmax_and_entropy(logits, tau=0.7):
    scaled_logits = logits / max(tau, 1e-5)
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
    probs = exp_logits / np.sum(exp_logits)
    entropy = -np.sum(probs * np.log2(probs + 1e-12))
    return probs, entropy
`,
    hessian: `# Matrix-Free Hessian-Vector Product (HVP)
import torch

def hessian_vector_product(loss, params, v):
    grads = torch.autograd.grad(loss, params, create_graph=True)
    flat_grad = torch.cat([g.view(-1) for g in grads])
    grad_v = torch.dot(flat_grad, v)
    hvp = torch.autograd.grad(grad_v, params)
    return torch.cat([h.view(-1) for h in hvp])
`,
    lyapunov: `# Swarm State Phase Space Lyapunov Trajectory
import numpy as np

def compute_lyapunov_exponent(trajectory_a, trajectory_b, dt=0.01):
    delta = np.linalg.norm(trajectory_a - trajectory_b, axis=-1)
    # Exponential fit: ln(||delta(t)||) = ln(||delta(0)||) + lambda * t
    log_delta = np.log(np.maximum(delta, 1e-10))
    time_steps = np.arange(len(delta)) * dt
    poly = np.polyfit(time_steps, log_delta, 1)
    return poly[0]  # Lyapunov Exponent lambda
`,
    stdp: `# Biomorphic STDP Synaptic Plasticity Matrix
import numpy as np

def apply_stdp_rule(pre_spike_time, post_spike_time, A_plus=0.85, A_minus=0.45, tau_plus=16.8, tau_minus=33.7):
    delta_t = post_spike_time - pre_spike_time
    if delta_t > 0:
        return A_plus * np.exp(-delta_t / tau_plus)
    else:
        return -A_minus * np.exp(delta_t / tau_minus)
`
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit" underline="hover">Home</Link>
        <Link component={RouterLink} to="/docs" color="inherit" underline="hover">Documentation</Link>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>Pillar {pillar.numeral}: {pillar.title}</Typography>
      </Breadcrumbs>

      {/* Header Banner */}
      <Paper sx={{ p: 4, mb: 4, border: '1px solid #EAECF0', borderLeft: `6px solid ${pillar.accent}`, bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Chip label={`MATH PILLAR ${pillar.numeral}`} size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 800, mb: 1.5, border: '1px solid #F0E1A8' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
              {pillar.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              {pillar.subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/docs/math/${prevPillar.id}`)}
            >
              Prev ({prevPillar.numeral})
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/docs/math/${nextPillar.id}`)}
            >
              Next ({nextPillar.numeral})
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3.5}>
        {/* Left Column: Tiers & Mathematical Proofs */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon sx={{ color: '#B8860B' }} /> Mathematical Derivation & Tier Formulations
          </Typography>

          <Stack spacing={2.5} sx={{ mb: 4 }}>
            {['Beginner', 'Intermediate', 'Advanced'].map((tierName) => (
              <Paper key={tierName} sx={{ p: 2.5, border: '1px solid #EAECF0', bgcolor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Chip
                    label={tierName}
                    size="small"
                    sx={{
                      bgcolor: tierName === 'Beginner' ? '#ECFDF3' : tierName === 'Intermediate' ? '#FEF3C7' : '#EFF8FF',
                      color: tierName === 'Beginner' ? '#027A48' : tierName === 'Intermediate' ? '#B54708' : '#175CD3',
                      fontWeight: 800
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#344054' }}>
                    {tierName === 'Beginner' ? 'Conceptual Intuition' : tierName === 'Intermediate' ? 'Core Closed-Form Formula' : 'High-Dimensional Tensor Scaling'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    p: 2,
                    bgcolor: '#101828',
                    color: '#F5E6AB',
                    fontFamily: mono,
                    fontSize: '0.9rem',
                    borderRadius: 1.5,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto',
                    border: '1px solid #1D2939'
                  }}
                >
                  {pillar.tiers[tierName]}
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Code Implementation Box */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon sx={{ color: '#B8860B' }} /> Production Implementation Code
          </Typography>
          <Paper sx={{ p: 2.5, bgcolor: '#1E293B', color: '#E2E8F0', borderRadius: 2, fontFamily: mono, fontSize: '0.84rem' }}>
            <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {codeExamples[pillar.id]}
            </pre>
          </Paper>
        </Grid>

        {/* Right Column: Parameters & Interactive Simulator */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Metrics Table */}
          <Paper sx={{ p: 3, border: '1px solid #EAECF0', mb: 3.5, bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#101828' }}>
              Studio System Operational Metrics
            </Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              {pillar.metrics.map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, color: '#8A6A09' }}>
                    {val}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Interactive Formula Parameter Simulator */}
          <Paper sx={{ p: 3, border: '1px solid #EAECF0', bgcolor: '#FAFAFA' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneIcon sx={{ color: '#B8860B' }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Interactive Math Simulator
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Parameter 1 (Control Input)
              </Typography>
              <Slider
                value={param1}
                min={0.01}
                max={2.0}
                step={0.05}
                onChange={(e, val) => setParam1(val)}
                sx={{ color: '#B8860B' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                {sim.label1}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Parameter 2 (Dimension / Interval)
              </Typography>
              <Slider
                value={param2}
                min={16}
                max={256}
                step={8}
                onChange={(e, val) => setParam2(val)}
                sx={{ color: '#B8860B' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                {sim.label2}
              </Typography>
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#101828', color: '#12B76A', borderRadius: 1.5, fontFamily: mono, fontSize: '0.85rem' }}>
              <Typography variant="caption" sx={{ color: '#D4AF37', display: 'block', mb: 0.5, fontWeight: 700 }}>
                SIMULATED CLOSED-FORM OUTPUT
              </Typography>
              {sim.resultLabel}
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
