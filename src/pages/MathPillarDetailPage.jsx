import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button, Grid, Stack, Slider, Divider,
  Breadcrumbs, Link, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, IconButton, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalculateIcon from '@mui/icons-material/Calculate';
import CodeIcon from '@mui/icons-material/Code';
import TuneIcon from '@mui/icons-material/Tune';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FunctionsIcon from '@mui/icons-material/Functions';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { mathPillars } from '../data/mathPillars';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarDetailPage() {
  const { pillarId } = useParams();
  const navigate = useNavigate();

  const pillarIndex = mathPillars.findIndex((p) => p.id === pillarId);
  const pillar = mathPillars[pillarIndex >= 0 ? pillarIndex : 0];

  const prevPillar = mathPillars[(pillarIndex - 1 + mathPillars.length) % mathPillars.length];
  const nextPillar = mathPillars[(pillarIndex + 1) % mathPillars.length];

  const [activeTierTab, setActiveTierTab] = useState(1); // 0: Beginner, 1: Intermediate, 2: Advanced
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  // Interactive Simulator States
  const [param1, setParam1] = useState(0.7);
  const [param2, setParam2] = useState(128);

  const computeSim = () => {
    switch (pillar.id) {
      case 'linear': {
        const d_model = param2 * 16;
        const heads = 16;
        const d_head = d_model / heads;
        const kv_cache_mb = ((2 * 32 * heads * d_head * 4096 * 2) / (1024 * 1024)).toFixed(2);
        return {
          title1: 'Embedding Dimension (d_model)',
          val1: `${d_model}`,
          title2: 'Attention Head Size (d_head)',
          val2: `${d_head}`,
          resultTitle: '4K Sequence KV-Cache Footprint',
          resultVal: `${kv_cache_mb} MB`,
          desc: 'Higher sequence length and head counts increase memory footprint quadratically without flash attention.'
        };
      }
      case 'calculus': {
        const lr = (param1 * 0.001).toFixed(5);
        const grad_norm = (param2 / 10).toFixed(1);
        const weight_update = (lr * grad_norm).toFixed(6);
        return {
          title1: 'Learning Rate (η)',
          val1: `${lr}`,
          title2: 'Gradient Norm (||g||₂)',
          val2: `${grad_norm}`,
          resultTitle: 'Parameter Step Magnitude (Δθ = η · ||g||₂)',
          resultVal: `${weight_update}`,
          desc: 'AdamW weight decay scales step magnitudes to prevent gradient explosion during swarm backpropagation.'
        };
      }
      case 'probability': {
        const tau = Math.max(0.05, param1).toFixed(2);
        const logits = [2.4, 1.1, -0.5, 0.2];
        const exps = logits.map((z) => Math.exp(z / Math.max(0.05, param1)));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map((e) => (e / sumExp).toFixed(4));
        const entropy = -probs.reduce((acc, p) => (p > 0 ? acc + p * Math.log2(p) : acc), 0).toFixed(3);
        return {
          title1: 'Softmax Temperature (τ)',
          val1: `${tau}`,
          title2: 'Top Token Probability P(w₀)',
          val2: `${probs[0]}`,
          resultTitle: 'Shannon Information Entropy H(X)',
          resultVal: `${entropy} bits`,
          desc: 'Lower temperature sharpens probability distributions towards deterministic token selection.'
        };
      }
      case 'hessian': {
        const lambda_max = (param1 * 10).toFixed(2);
        const lambda_min = Math.max(0.01, (param2 / 100)).toFixed(2);
        const kappa = (lambda_max / lambda_min).toFixed(2);
        return {
          title1: 'Max Eigenvalue (λ_max)',
          val1: `${lambda_max}`,
          title2: 'Min Eigenvalue (λ_min)',
          val2: `${lambda_min}`,
          resultTitle: 'Hessian Condition Number κ(H)',
          resultVal: `${kappa}`,
          desc: 'High condition numbers indicate sharp anisotropic loss valleys requiring second-order preconditioning.'
        };
      }
      case 'lyapunov': {
        const lambda = (param1 - 1.0).toFixed(2);
        const time_t = param2;
        const divergence = Math.exp(lambda * (time_t / 10)).toFixed(4);
        return {
          title1: 'Max Lyapunov Exponent (λ)',
          val1: `${lambda}`,
          title2: 'Trajectory Time Step (t)',
          val2: `${time_t} ms`,
          resultTitle: 'Swarm Phase Divergence ||δZ(t)|| / ||δZ(0)||',
          resultVal: `${divergence}`,
          desc: 'Negative Lyapunov exponents confirm exponential orbital stability in multi-agent consensus dynamics.'
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
          title1: 'Spike Timing Interval (Δt = t_post - t_pre)',
          val1: `${delta_t} ms`,
          title2: 'Plasticity Regime',
          val2: delta_t > 0 ? 'LTP (Potentiation)' : 'LTD (Depression)',
          resultTitle: 'Synaptic Weight Change (Δw)',
          resultVal: `${delta_w.toFixed(5)}`,
          desc: 'Causal pre-before-post firing triggers Long-Term Potentiation (LTP) in the Neuro Memory Daemon.'
        };
      }
      default:
        return { title1: '', val1: '', title2: '', val2: '', resultTitle: '', resultVal: '', desc: '' };
    }
  };

  const sim = computeSim();

  const codeExamples = {
    linear: `# PyTorch / WGSL Scaled Dot-Product Attention Projection
import torch
import torch.nn.functional as F

def compute_scaled_dot_product_attention(Q, K, V, d_k=128):
    """
    Computes Scaled Dot-Product Attention:
    Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V
    """
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V)
`,
    calculus: `# AdamW Weight Decay & Gradient Optimization Step
import torch

def adamw_step(param, grad, exp_avg, exp_avg_sq, lr=3e-4, beta1=0.9, beta2=0.999, weight_decay=0.01):
    """
    Decoupled Weight Decay AdamW Algorithm:
    W_t = W_{t-1} - lr * weight_decay * W_{t-1} - lr * m_t / (sqrt(v_t) + eps)
    """
    param.data.mul_(1.0 - lr * weight_decay)
    exp_avg.mul_(beta1).add_(grad, alpha=1 - beta1)
    exp_avg_sq.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)
    denom = exp_avg_sq.sqrt().add_(1e-8)
    param.data.addcdiv_(exp_avg, denom, value=-lr)
`,
    probability: `# Temperature-Scaled Softmax & Shannon Information Entropy
import numpy as np

def temperature_softmax_and_entropy(logits, tau=0.7):
    """
    Calculates temperature-scaled categorical distribution:
    P(w_i) = exp(z_i / tau) / sum_j exp(z_j / tau)
    Shannon Entropy: H(X) = -sum p(x) log2 p(x)
    """
    scaled_logits = logits / max(tau, 1e-5)
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
    probs = exp_logits / np.sum(exp_logits)
    entropy = -np.sum(probs * np.log2(probs + 1e-12))
    return probs, entropy
`,
    hessian: `# Matrix-Free Hessian-Vector Product (HVP)
import torch

def hessian_vector_product(loss, params, v):
    """
    Computes Hessian-vector product H * v without explicit Hessian matrix assembly:
    H * v = grad(<grad L(theta), v>, theta)
    """
    grads = torch.autograd.grad(loss, params, create_graph=True)
    flat_grad = torch.cat([g.view(-1) for g in grads])
    grad_v = torch.dot(flat_grad, v)
    hvp = torch.autograd.grad(grad_v, params)
    return torch.cat([h.view(-1) for h in hvp])
`,
    lyapunov: `# Swarm Phase Space Lyapunov Trajectory Exponent
import numpy as np

def compute_lyapunov_exponent(trajectory_a, trajectory_b, dt=0.01):
    """
    Estimates maximum Lyapunov exponent lambda:
    ||delta Z(t)|| = ||delta Z(0)|| * exp(lambda * t)
    """
    delta = np.linalg.norm(trajectory_a - trajectory_b, axis=-1)
    log_delta = np.log(np.maximum(delta, 1e-10))
    time_steps = np.arange(len(delta)) * dt
    poly = np.polyfit(time_steps, log_delta, 1)
    return poly[0]  # Lyapunov Exponent lambda
`,
    stdp: `# Neuromorphic STDP Synaptic Weight Update Rule
import numpy as np

def apply_stdp_rule(pre_spike_time, post_spike_time, A_plus=0.85, A_minus=0.45, tau_plus=16.8, tau_minus=33.7):
    """
    Biomorphic Spike-Timing-Dependent Plasticity (STDP):
    delta w = A_+ exp(-delta t / tau_+) if delta t > 0
    delta w = -A_- exp(delta t / tau_-) if delta t < 0
    """
    delta_t = post_spike_time - pre_spike_time
    if delta_t > 0:
        return A_plus * np.exp(-delta_t / tau_plus)
    else:
        return -A_minus * np.exp(delta_t / tau_minus)
`
  };

  const handleCopyCodeText = () => {
    navigator.clipboard.writeText(codeExamples[pillar.id] || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFormulaText = () => {
    const activeFormula = pillar.tiers[['Beginner', 'Intermediate', 'Advanced'][activeTierTab]];
    navigator.clipboard.writeText(activeFormula || '');
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
      
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5 }}>
        <Link component={RouterLink} to="/" color="inherit" underline="hover">Home</Link>
        <Link component={RouterLink} to="/docs" color="inherit" underline="hover">Documentation</Link>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>Pillar {pillar.numeral}: {pillar.title}</Typography>
      </Breadcrumbs>

      {/* Header Hero Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          border: '1px solid #EAECF0',
          borderLeft: `6px solid ${pillar.accent}`,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(16,24,40,0.03)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Chip label={`PILLAR ${pillar.numeral}`} size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 800, border: '1px solid #F0E1A8' }} />
              <Chip label="CLOSED-FORM PROOF" size="small" sx={{ bgcolor: '#ECFDF3', color: '#027A48', fontWeight: 800 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1, color: '#101828', fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' } }}>
              {pillar.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 850, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              {pillar.subtitle}
            </Typography>
          </Box>

          {/* Previous / Next Pillar Navigation Buttons */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/docs/math/${prevPillar.id}`)}
              sx={{ fontWeight: 700, borderColor: '#EAECF0' }}
            >
              Prev ({prevPillar.numeral})
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/docs/math/${nextPillar.id}`)}
              sx={{ fontWeight: 700 }}
            >
              Next ({nextPillar.numeral})
            </Button>
          </Stack>
        </Box>

        {/* Pillar Switcher Chips Bar */}
        <Divider sx={{ my: 2.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#475467', mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
          EXPLORE ALL SIX MATHEMATICAL PILLARS
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {mathPillars.map((p) => (
            <Chip
              key={p.id}
              label={`${p.numeral}. ${p.title}`}
              clickable
              onClick={() => navigate(`/docs/math/${p.id}`)}
              sx={{
                fontWeight: 700,
                bgcolor: p.id === pillar.id ? '#B8860B' : '#F8FAFC',
                color: p.id === pillar.id ? '#FFFFFF' : '#475467',
                border: '1px solid',
                borderColor: p.id === pillar.id ? '#D4AF37' : '#EAECF0',
                px: 0.5,
                '&:hover': { bgcolor: p.id === pillar.id ? '#8A6A09' : '#FEF9E7' }
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* SECTION 1: Mathematical Proofs & Tier Formulations (Full Width - Spacious & Un-squished) */}
      <Card sx={{ border: '1px solid #EAECF0', borderRadius: 3, mb: 4, bgcolor: '#FFFFFF', boxShadow: '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FunctionsIcon sx={{ color: '#B8860B', fontSize: '1.6rem' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#101828', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Mathematical Derivation &amp; Tier Formulations
              </Typography>
            </Box>

            <Tooltip title="Copy Selected Formula">
              <IconButton size="small" onClick={handleCopyFormulaText} sx={{ color: copiedFormula ? '#12B76A' : '#667085' }}>
                {copiedFormula ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tier Tabs (Beginner / Intermediate / Advanced) */}
          <Tabs
            value={activeTierTab}
            onChange={(e, val) => setActiveTierTab(val)}
            sx={{
              mb: 3,
              minHeight: 44,
              borderBottom: '1px solid #EAECF0',
              '& .MuiTab-root': {
                minHeight: 44,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                color: '#667085',
                '&.Mui-selected': { color: '#B8860B' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#B8860B', height: 3 }
            }}
          >
            <Tab label="1. Beginner (Intuition)" />
            <Tab label="2. Intermediate (Closed-Form)" />
            <Tab label="3. Advanced (Tensor Equation)" />
          </Tabs>

          {/* Active Tier Math Formula Display Box (Full Width, Wide, Readable) */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: '#0B0F19',
              color: '#F5E6AB',
              fontFamily: mono,
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              borderRadius: 2.5,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              border: '1px solid #1D2939',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontFamily: mono, fontWeight: 800, letterSpacing: '0.05em' }}>
              {activeTierTab === 0 ? '// CONCEPTUAL INTUITION' : activeTierTab === 1 ? '// CLOSED-FORM ENGINEERING FORMULA' : '// HIGH-DIMENSIONAL TENSOR EQUATION'}
            </Typography>
            {pillar.tiers[['Beginner', 'Intermediate', 'Advanced'][activeTierTab]]}
          </Box>

          <Alert severity="info" icon={<FunctionsIcon fontSize="inherit" />} sx={{ mt: 3, borderRadius: 2, bgcolor: '#FEF9E7', color: '#8A6A09', border: '1px solid #F0E1A8', '& .MuiAlert-icon': { color: '#B8860B' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Formulas carried directly from Zoth Studio Math Workstation. Tier definitions represent exact closed-form execution parameters in local daemons.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* SECTION 2: Balanced 6/6 Grid for Interactive Simulator & Operational Metrics */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        
        {/* Left 6/12: Interactive Formula Simulator */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid #EAECF0', borderRadius: 3, bgcolor: '#FFFFFF', boxShadow: '0 4px 16px rgba(16,24,40,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <TuneIcon sx={{ color: '#B8860B', fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#101828' }}>
                    Interactive Math Simulator
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Adjust system inputs to calculate closed-form outputs in real-time.
                </Typography>

                {/* Slider 1 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#344054' }}>
                      Control Input Slider
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: '#B8860B' }}>
                      {param1}
                    </Typography>
                  </Box>
                  <Slider
                    value={param1}
                    min={0.01}
                    max={2.0}
                    step={0.05}
                    onChange={(e, val) => setParam1(val)}
                    sx={{ color: '#B8860B', height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title1}: <Box component="span" sx={{ color: '#8A6A09' }}>{sim.val1}</Box>
                  </Typography>
                </Box>

                {/* Slider 2 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#344054' }}>
                      Dimension / Interval Slider
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: '#B8860B' }}>
                      {param2}
                    </Typography>
                  </Box>
                  <Slider
                    value={param2}
                    min={16}
                    max={256}
                    step={8}
                    onChange={(e, val) => setParam2(val)}
                    sx={{ color: '#B8860B', height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title2}: <Box component="span" sx={{ color: '#8A6A09' }}>{sim.val2}</Box>
                  </Typography>
                </Box>
              </Box>

              {/* Output Display Card */}
              <Paper sx={{ p: 2.5, bgcolor: '#0B0F19', color: '#10B981', borderRadius: 2, fontFamily: mono, border: '1px solid #1D2939' }}>
                <Typography variant="caption" sx={{ color: '#D4AF37', display: 'block', mb: 0.5, fontWeight: 800, letterSpacing: '0.04em' }}>
                  SIMULATED CLOSED-FORM OUTPUT
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#10B981', fontFamily: mono, mb: 1 }}>
                  {sim.resultTitle}: {sim.resultVal}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                  {sim.desc}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right 6/12: System Operational Metrics Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid #EAECF0', borderRadius: 3, bgcolor: '#FFFFFF', boxShadow: '0 4px 16px rgba(16,24,40,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <SpeedIcon sx={{ color: '#B8860B', fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#101828' }}>
                    System Operational Metrics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Recorded execution targets across studio micro-services and local daemons.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EAECF0', borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475467', py: 1.5 }}>Metric Identifier</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475467', py: 1.5 }}>Value Target</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pillar.metrics.map(([label, val]) => (
                        <TableRow key={label} hover>
                          <TableCell sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#344054', py: 1.75 }}>{label}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 800, color: '#8A6A09', fontSize: '0.88rem', py: 1.75 }}>
                            {val}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #EAECF0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                  ⚡ All metric constraints are validated during local swarm consensus evaluation.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* SECTION 3: Production Code Implementation (Full Width - Wide & Un-squished) */}
      <Card sx={{ border: '1px solid #EAECF0', borderRadius: 3, bgcolor: '#FFFFFF', boxShadow: '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CodeIcon sx={{ color: '#B8860B', fontSize: '1.6rem' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#101828', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Production Implementation Code
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={copiedCode ? <CheckIcon sx={{ color: '#12B76A' }} /> : <ContentCopyIcon />}
              onClick={handleCopyCodeText}
              sx={{ borderColor: '#EAECF0', color: '#475467', fontWeight: 700, py: 0.8, px: 2 }}
            >
              {copiedCode ? 'Copied Code!' : 'Copy Code'}
            </Button>
          </Box>

          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: '#0F172A', color: '#E2E8F0', borderRadius: 2.5, fontFamily: mono, fontSize: '0.88rem', border: '1px solid #1E293B', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)' }}>
            <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.65 }}>
              {codeExamples[pillar.id]}
            </pre>
          </Paper>
        </CardContent>
      </Card>

    </Container>
  );
}
