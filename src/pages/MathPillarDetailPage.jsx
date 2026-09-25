import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, Slider, Divider,
  Breadcrumbs, Link, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, IconButton, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import DownloadIcon from '@mui/icons-material/Download';
import SovereignFunnel from '../components/SovereignFunnel';
import { mathPillars } from '../data/mathPillars';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarDetailPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const { pillarId } = useParams();
  const navigate = useNavigate();

  const pillarIndex = mathPillars.findIndex((p) => p.id === pillarId);
  const pillar = mathPillars[pillarIndex >= 0 ? pillarIndex : 0];

  const prevPillar = mathPillars[(pillarIndex - 1 + mathPillars.length) % mathPillars.length];
  const nextPillar = mathPillars[(pillarIndex + 1) % mathPillars.length];

  const [activeTierTab, setActiveTierTab] = useState(1); // 0: Beginner, 1: Intermediate, 2: Advanced
  const [selectedLang, setSelectedLang] = useState('python'); // 'python' | 'rust' | 'typescript'
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

  // Multi-language implementations for all 6 mathematical pillars
  const codeExamples = {
    linear: {
      python: `# PyTorch Scaled Dot-Product Attention Projection & KV Cache Engine
import math
import torch
import torch.nn.functional as F

class ScaledDotProductAttention(torch.nn.Module):
    """
    Computes Scaled Dot-Product Attention with optional causal mask:
    Attention(Q, K, V) = softmax((Q @ K.T) / sqrt(d_k) + M) @ V
    """
    def __init__(self, d_k: int = 128, dropout: float = 0.0):
        super().__init__()
        self.d_k = d_k
        self.scale = 1.0 / math.sqrt(d_k)
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        # [B, H, S_q, d_k] @ [B, H, d_k, S_k] -> [B, H, S_q, S_k]
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        # [B, H, S_q, S_k] @ [B, H, S_k, d_v] -> [B, H, S_q, d_v]
        return torch.matmul(attn_weights, v)

def compute_kv_cache_memory(layers: int, heads: int, d_head: int, seq_len: int, dtype_bytes: int = 2) -> float:
    """Calculates KV-Cache footprint in Megabytes."""
    total_bytes = 2 * layers * heads * d_head * seq_len * dtype_bytes
    return total_bytes / (1024 * 1024)
`,
      rust: `// Rust SIMD / ndarray Scaled Dot-Product Attention Projection Kernel
use std::f32;

pub struct ScaledDotProductAttention {
    pub d_k: usize,
    pub scale: f32,
}

impl ScaledDotProductAttention {
    pub fn new(d_k: usize) -> Self {
        Self {
            d_k,
            scale: 1.0 / (d_k as f32).sqrt(),
        }
    }

    /// Computes Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
    /// Flattened row-major slice layout: [batch * heads, seq_len, dim]
    pub fn forward(
        &self,
        q: &[f32],
        k: &[f32],
        v: &[f32],
        seq_len: usize,
        causal: bool,
    ) -> Vec<f32> {
        let d = self.d_k;
        let mut scores = vec![0.0f32; seq_len * seq_len];
        let mut output = vec![0.0f32; seq_len * d];

        // 1. Matmul: S = (Q * K^T) * scale
        for i in 0..seq_len {
            for j in 0..seq_len {
                if causal && j > i {
                    scores[i * seq_len + j] = f32::NEG_INFINITY;
                    continue;
                }
                let mut dot = 0.0f32;
                for p in 0..d {
                    dot += q[i * d + p] * k[j * d + p];
                }
                scores[i * seq_len + j] = dot * self.scale;
            }
        }

        // 2. Row-wise Softmax
        for i in 0..seq_len {
            let row_start = i * seq_len;
            let mut max_val = f32::NEG_INFINITY;
            for j in 0..seq_len {
                let s = scores[row_start + j];
                if s > max_val { max_val = s; }
            }

            let mut sum_exp = 0.0f32;
            for j in 0..seq_len {
                let exp_val = (scores[row_start + j] - max_val).exp();
                scores[row_start + j] = exp_val;
                sum_exp += exp_val;
            }

            let inv_sum = 1.0 / sum_exp.max(1e-12);
            for j in 0..seq_len {
                scores[row_start + j] *= inv_sum;
            }
        }

        // 3. Matmul: Output = Weights * V
        for i in 0..seq_len {
            for p in 0..d {
                let mut acc = 0.0f32;
                for j in 0..seq_len {
                    acc += scores[i * seq_len + j] * v[j * d + p];
                }
                output[i * d + p] = acc;
            }
        }

        output
    }
}
`,
      typescript: `// TypeScript / WASM-Compatible Scaled Dot-Product Attention Projection
export interface AttentionConfig {
  dModel: number;
  heads: number;
  dHead: number;
  causalMask?: boolean;
}

export class ScaledDotProductAttentionWASM {
  private dHead: number;
  private scale: number;

  constructor(dHead: number = 128) {
    this.dHead = dHead;
    this.scale = 1.0 / Math.sqrt(dHead);
  }

  /**
   * Zero-allocation SIMD-friendly attention forward pass.
   * Q, K, V flattened Float32Arrays of shape [seqLen, dHead].
   */
  public forward(
    q: Float32Array,
    k: Float32Array,
    v: Float32Array,
    seqLen: number,
    causal: boolean = false
  ): Float32Array {
    const d = this.dHead;
    const scores = new Float32Array(seqLen * seqLen);
    const output = new Float32Array(seqLen * d);

    // Q * K^T with scaling and optional causal masking
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        if (causal && j > i) {
          scores[i * seqLen + j] = -1e9;
          continue;
        }
        let dot = 0.0;
        const qOffset = i * d;
        const kOffset = j * d;
        for (let p = 0; p < d; p++) {
          dot += q[qOffset + p] * k[kOffset + p];
        }
        scores[i * seqLen + j] = dot * this.scale;
      }
    }

    // Stable in-place softmax
    for (let i = 0; i < seqLen; i++) {
      const rowOffset = i * seqLen;
      let maxVal = -Infinity;
      for (let j = 0; j < seqLen; j++) {
        const val = scores[rowOffset + j];
        if (val > maxVal) maxVal = val;
      }

      let sumExp = 0.0;
      for (let j = 0; j < seqLen; j++) {
        const expVal = Math.exp(scores[rowOffset + j] - maxVal);
        scores[rowOffset + j] = expVal;
        sumExp += expVal;
      }

      const invSum = 1.0 / (sumExp || 1e-12);
      for (let j = 0; j < seqLen; j++) {
        scores[rowOffset + j] *= invSum;
      }
    }

    // Multiply softmax weights by V
    for (let i = 0; i < seqLen; i++) {
      for (let p = 0; p < d; p++) {
        let acc = 0.0;
        for (let j = 0; j < seqLen; j++) {
          acc += scores[i * seqLen + j] * v[j * d + p];
        }
        output[i * d + p] = acc;
      }
    }

    return output;
  }
}
`
    },
    calculus: {
      python: `# PyTorch Decoupled AdamW Weight Decay & Gradient Optimization Step
import math
import torch

class SovereignAdamW:
    """
    Decoupled Weight Decay AdamW Algorithm:
    W_t = W_{t-1} - lr * weight_decay * W_{t-1} - lr * m_t / (sqrt(v_t) + eps)
    """
    def __init__(self, params, lr: float = 3e-4, betas=(0.9, 0.999), eps: float = 1e-8, weight_decay: float = 0.01):
        self.params = list(params)
        self.lr = lr
        self.beta1, self.beta2 = betas
        self.eps = eps
        self.weight_decay = weight_decay
        self.step_count = 0
        self.exp_avg = [torch.zeros_like(p) for p in self.params]
        self.exp_avg_sq = [torch.zeros_like(p) for p in self.params]

    @torch.no_grad()
    def step(self):
        self.step_count += 1
        bias_correction1 = 1.0 - (self.beta1 ** self.step_count)
        bias_correction2 = 1.0 - (self.beta2 ** self.step_count)

        for p, m, v in zip(self.params, self.exp_avg, self.exp_avg_sq):
            if p.grad is None:
                continue
            grad = p.grad

            # 1. Decoupled weight decay
            p.mul_(1.0 - self.lr * self.weight_decay)

            # 2. Update 1st and 2nd raw moment estimates
            m.mul_(self.beta1).add_(grad, alpha=1.0 - self.beta1)
            v.mul_(self.beta2).addcmul_(grad, grad, value=1.0 - self.beta2)

            # 3. Apply bias-corrected step
            denom = (v.sqrt() / math.sqrt(bias_correction2)).add_(self.eps)
            step_size = self.lr / bias_correction1
            p.addcdiv_(m, denom, value=-step_size)
`,
      rust: `// Rust Decoupled AdamW Optimizer Engine with SIMD Vectorization
pub struct SovereignAdamW {
    pub lr: f32,
    pub beta1: f32,
    pub beta2: f32,
    pub eps: f32,
    pub weight_decay: f32,
    pub step_count: u32,
    pub exp_avg: Vec<f32>,
    pub exp_avg_sq: Vec<f32>,
}

impl SovereignAdamW {
    pub fn new(param_dim: usize, lr: f32, weight_decay: f32) -> Self {
        Self {
            lr,
            beta1: 0.9,
            beta2: 0.999,
            eps: 1e-8,
            weight_decay,
            step_count: 0,
            exp_avg: vec![0.0; param_dim],
            exp_avg_sq: vec![0.0; param_dim],
        }
    }

    /// Executes single in-place AdamW parameter update with decoupled weight decay
    pub fn step(&mut self, params: &mut [f32], grads: &[f32]) {
        self.step_count += 1;
        let bias_corr1 = 1.0 - self.beta1.powi(self.step_count as i32);
        let bias_corr2 = 1.0 - self.beta2.powi(self.step_count as i32);
        let step_size = self.lr / bias_corr1;

        for i in 0..params.len() {
            let g = grads[i];

            // 1. Decoupled weight decay: w = w - lr * wd * w
            params[i] *= 1.0 - self.lr * self.weight_decay;

            // 2. Exponential moving averages of gradients
            self.exp_avg[i] = self.beta1 * self.exp_avg[i] + (1.0 - self.beta1) * g;
            self.exp_avg_sq[i] = self.beta2 * self.exp_avg_sq[i] + (1.0 - self.beta2) * g * g;

            // 3. Normalized parameter update
            let denom = (self.exp_avg_sq[i] / bias_corr2).sqrt() + self.eps;
            params[i] -= step_size * (self.exp_avg[i] / denom);
        }
    }
}
`,
      typescript: `// TypeScript / TypedArray Decoupled AdamW Optimizer Step
export class SovereignAdamWEngine {
  private lr: number;
  private beta1: number;
  private beta2: number;
  private eps: number;
  private weightDecay: number;
  private stepCount: number = 0;
  private expAvg: Float32Array;
  private expAvgSq: Float32Array;

  constructor(
    paramSize: number,
    lr: number = 3e-4,
    weightDecay: number = 0.01,
    beta1: number = 0.9,
    beta2: number = 0.999,
    eps: number = 1e-8
  ) {
    this.lr = lr;
    this.weightDecay = weightDecay;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.eps = eps;
    this.expAvg = new Float32Array(paramSize);
    this.expAvgSq = new Float32Array(paramSize);
  }

  /**
   * In-place decoupled AdamW optimization step across Float32Array weights.
   */
  public step(params: Float32Array, grads: Float32Array): void {
    this.stepCount++;
    const bias1 = 1.0 - Math.pow(this.beta1, this.stepCount);
    const bias2 = 1.0 - Math.pow(this.beta2, this.stepCount);
    const stepSize = this.lr / bias1;
    const len = params.length;

    for (let i = 0; i < len; i++) {
      const g = grads[i];

      // Decoupled weight decay
      params[i] *= 1.0 - this.lr * this.weightDecay;

      // First and second moment accumulators
      this.expAvg[i] = this.beta1 * this.expAvg[i] + (1.0 - this.beta1) * g;
      this.expAvgSq[i] = this.beta2 * this.expAvgSq[i] + (1.0 - this.beta2) * g * g;

      // Update step
      const denom = Math.sqrt(this.expAvgSq[i] / bias2) + this.eps;
      params[i] -= stepSize * (this.expAvg[i] / denom);
    }
  }
}
`
    },
    probability: {
      python: `# Temperature-Scaled Softmax, Shannon Entropy, and Top-p Sampling
import numpy as np

def temperature_softmax_and_entropy(logits: np.ndarray, tau: float = 0.7):
    """
    Computes numerically stable temperature-scaled softmax and Shannon entropy:
    P(w_i) = exp(z_i / tau) / sum_j exp(z_j / tau)
    Shannon Entropy: H(X) = -sum p(x) log2(p(x))
    """
    tau = max(tau, 1e-5)
    scaled_logits = logits / tau
    max_logit = np.max(scaled_logits)
    exp_logits = np.exp(scaled_logits - max_logit)
    probs = exp_logits / np.sum(exp_logits)
    
    # Shannon Entropy in bits
    nonzero_probs = probs[probs > 1e-12]
    entropy = -np.sum(nonzero_probs * np.log2(nonzero_probs))
    return probs, float(entropy)

def sample_top_p(probs: np.ndarray, p: float = 0.9) -> int:
    """Samples next token index according to Nucleus (Top-p) threshold."""
    sorted_indices = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_indices]
    cumulative_probs = np.cumsum(sorted_probs)
    cutoff = cumulative_probs > p
    cutoff[1:] = cutoff[:-1]
    cutoff[0] = False
    sorted_probs[cutoff] = 0.0
    renorm_probs = sorted_probs / np.sum(sorted_probs)
    return int(np.random.choice(sorted_indices, p=renorm_probs))
`,
      rust: `// Rust Temperature-Scaled Softmax and Shannon Information Entropy
pub struct ProbabilityEngine;

impl ProbabilityEngine {
    /// Numerically stable Log-Sum-Exp temperature softmax and Shannon entropy H(X) in bits
    pub fn temperature_softmax(logits: &[f32], tau: f32) -> (Vec<f32>, f32) {
        let t = tau.max(1e-5);
        let mut max_val = f32::NEG_INFINITY;
        for &z in logits {
            let scaled = z / t;
            if scaled > max_val { max_val = scaled; }
        }

        let mut sum_exp = 0.0f32;
        let mut probs = vec![0.0f32; logits.len()];
        for (i, &z) in logits.iter().enumerate() {
            let exp_val = ((z / t) - max_val).exp();
            probs[i] = exp_val;
            sum_exp += exp_val;
        }

        let inv_sum = 1.0 / sum_exp.max(1e-12);
        let mut entropy_bits = 0.0f32;
        for p in probs.iter_mut() {
            *p *= inv_sum;
            if *p > 1e-12 {
                entropy_bits -= *p * p.log2();
            }
        }

        (probs, entropy_bits)
    }

    /// Nucleus (Top-p) filter over probability distribution
    pub fn filter_top_p(probs: &mut [f32], top_p: f32) {
        let mut indexed: Vec<(usize, f32)> = probs.iter().copied().enumerate().collect();
        indexed.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

        let mut cumsum = 0.0f32;
        let mut keep_count = 0;
        for (_, p) in &indexed {
            cumsum += *p;
            keep_count += 1;
            if cumsum >= top_p { break; }
        }

        let keep_set: std::collections.HashSet<usize> = indexed[..keep_count].iter().map(|(idx, _)| *idx).collect();
        for (i, p) in probs.iter_mut().enumerate() {
            if !keep_set.contains(&i) { *p = 0.0; }
        }
    }
}
`,
      typescript: `// TypeScript Temperature-Scaled Softmax, Shannon Entropy, & Nucleus Filter
export interface DistributionResult {
  probabilities: Float32Array;
  entropyBits: number;
}

export class ProbabilitySamplerWASM {
  /**
   * Computes temperature-scaled categorical distribution and Shannon entropy.
   */
  public static compute(logits: Float32Array, tau: number = 0.7): DistributionResult {
    const temperature = Math.max(tau, 1e-5);
    const len = logits.length;
    let maxVal = -Infinity;

    for (let i = 0; i < len; i++) {
      const scaled = logits[i] / temperature;
      if (scaled > maxVal) maxVal = scaled;
    }

    const expLogits = new Float32Array(len);
    let sumExp = 0.0;
    for (let i = 0; i < len; i++) {
      const e = Math.exp(logits[i] / temperature - maxVal);
      expLogits[i] = e;
      sumExp += e;
    }

    const probabilities = new Float32Array(len);
    const invSum = 1.0 / (sumExp || 1e-12);
    let entropyBits = 0.0;

    for (let i = 0; i < len; i++) {
      const p = expLogits[i] * invSum;
      probabilities[i] = p;
      if (p > 1e-12) {
        entropyBits -= p * Math.log2(p);
      }
    }

    return { probabilities, entropyBits };
  }

  /**
   * Top-p (Nucleus) filter with re-normalization
   */
  public static applyTopP(probs: Float32Array, p: number = 0.9): Float32Array {
    const indices = Array.from({ length: probs.length }, (_, i) => i);
    indices.sort((a, b) => probs[b] - probs[a]);

    const filtered = new Float32Array(probs.length);
    let cumulative = 0.0;
    for (const idx of indices) {
      filtered[idx] = probs[idx];
      cumulative += probs[idx];
      if (cumulative >= p) break;
    }

    // Re-normalize
    let total = 0.0;
    for (let i = 0; i < filtered.length; i++) total += filtered[i];
    for (let i = 0; i < filtered.length; i++) filtered[i] /= (total || 1);
    return filtered;
  }
}
`
    },
    hessian: {
      python: `# Matrix-Free Hessian-Vector Product (HVP) & Loss Curvature Solver
import torch

def hessian_vector_product(loss: torch.Tensor, params: list, v: torch.Tensor) -> torch.Tensor:
    """
    Computes Pearlmutter's Matrix-Free Hessian-vector product H * v:
    H * v = grad(<grad L(theta), v>, theta)
    Avoids assembling explicit O(d^2) Hessian memory.
    """
    grads = torch.autograd.grad(loss, params, create_graph=True)
    flat_grad = torch.cat([g.reshape(-1) for g in grads])
    grad_v = torch.dot(flat_grad, v)
    hvp = torch.autograd.grad(grad_v, params)
    return torch.cat([h.reshape(-1) for h in hvp])

def estimate_extreme_eigenvalues(loss_fn, params, max_iters: int = 25):
    """Power iteration for maximum eigenvalue lambda_max of the Hessian."""
    v = torch.randn_like(params)
    v = v / torch.norm(v)
    for _ in range(max_iters):
        loss = loss_fn(params)
        Hv = hessian_vector_product(loss, [params], v)
        v = Hv / torch.norm(Hv)
    lambda_max = torch.dot(v, Hv).item()
    return lambda_max
`,
      rust: `// Rust Matrix-Free Hessian-Vector Product (HVP) Finite-Difference Kernel
pub struct HessianSolver {
    pub epsilon: f64,
}

impl HessianSolver {
    pub fn new(epsilon: f64) -> Self {
        Self { epsilon: epsilon.max(1e-8) }
    }

    /// Matrix-free directional HVP via symmetric finite differences:
    /// H * v ≈ (∇L(θ + ε·v) - ∇L(θ - ε·v)) / (2 · ε)
    pub fn hvp<F>(&self, grad_fn: &F, theta: &[f64], v: &[f64]) -> Vec<f64>
    where
        F: Fn(&[f64]) -> Vec<f64>,
    {
        let d = theta.len();
        let mut forward_theta = vec![0.0; d];
        let mut backward_theta = vec![0.0; d];

        for i in 0..d {
            forward_theta[i] = theta[i] + self.epsilon * v[i];
            backward_theta[i] = theta[i] - self.epsilon * v[i];
        }

        let grad_forward = grad_fn(&forward_theta);
        let grad_backward = grad_fn(&backward_theta);

        let mut result = vec![0.0; d];
        let factor = 1.0 / (2.0 * self.epsilon);
        for i in 0..d {
            result[i] = (grad_forward[i] - grad_backward[i]) * factor;
        }

        result
    }

    /// Rayleigh quotient: R(θ, v) = (v^T * H * v) / (v^T * v)
    pub fn rayleigh_quotient(&self, hvp: &[f64], v: &[f64]) -> f64 {
        let mut num = 0.0;
        let mut denom = 0.0;
        for i in 0..v.len() {
            num += v[i] * hvp[i];
            denom += v[i] * v[i];
        }
        num / denom.max(1e-12)
    }
}
`,
      typescript: `// TypeScript Matrix-Free Hessian-Vector Product (HVP) Engine
export class HessianVectorProductEngine {
  private eps: number;

  constructor(eps: number = 1e-5) {
    this.eps = eps;
  }

  /**
   * Pearlmutter / finite difference matrix-free directional HVP:
   * H * v = (∇L(θ + ε·v) - ∇L(θ - ε·v)) / (2ε)
   */
  public computeHVP(
    gradFn: (theta: Float64Array) => Float64Array,
    theta: Float64Array,
    v: Float64Array
  ): Float64Array {
    const len = theta.length;
    const forwardTheta = new Float64Array(len);
    const backwardTheta = new Float64Array(len);

    for (let i = 0; i < len; i++) {
      forwardTheta[i] = theta[i] + this.eps * v[i];
      backwardTheta[i] = theta[i] - this.eps * v[i];
    }

    const gForward = gradFn(forwardTheta);
    const gBackward = gradFn(backwardTheta);

    const hvp = new Float64Array(len);
    const invTwoEps = 1.0 / (2.0 * this.eps);
    for (let i = 0; i < len; i++) {
      hvp[i] = (gForward[i] - gBackward[i]) * invTwoEps;
    }

    return hvp;
  }

  /**
   * Computes condition number κ(H) from extreme eigenvalues.
   */
  public computeConditionNumber(lambdaMax: number, lambdaMin: number): number {
    return Math.abs(lambdaMax) / Math.max(Math.abs(lambdaMin), 1e-7);
  }
}
`
    },
    lyapunov: {
      python: `# Swarm Phase Space Lyapunov Trajectory Exponent & Orbital Divergence
import numpy as np

def compute_max_lyapunov_exponent(trajectory_a: np.ndarray, trajectory_b: np.ndarray, dt: float = 0.01) -> float:
    """
    Estimates maximum Lyapunov exponent lambda across phase-space orbital divergence:
    ||delta Z(t)|| = ||delta Z(0)|| * exp(lambda * t)
    A negative lambda guarantees exponential orbit convergence and swarm stability.
    """
    deltas = np.linalg.norm(trajectory_a - trajectory_b, axis=-1)
    log_deltas = np.log(np.maximum(deltas, 1e-12))
    time_steps = np.arange(len(deltas)) * dt
    # Linear regression slope provides lambda
    poly = np.polyfit(time_steps, log_deltas, 1)
    return float(poly[0])

def evaluate_swarm_stability(lambda_max: float) -> dict:
    """Categorizes swarm dynamical regime based on Lyapunov threshold."""
    if lambda_max < -0.05:
        return {"status": "Asymptotically Stable", "divergence": "Exponential Contraction"}
    elif abs(lambda_max) <= 0.05:
        return {"status": "Marginally Stable", "divergence": "Limit Cycle / Quasi-Periodic"}
    else:
        return {"status": "Chaotic / Divergent", "divergence": "Exponential Sensitivity"}
`,
      rust: `// Rust Phase Space Swarm Trajectory Stability & Lyapunov Exponent Engine
pub struct LyapunovAnalyzer {
    pub dt: f64,
}

impl LyapunovAnalyzer {
    pub fn new(dt: f64) -> Self {
        Self { dt }
    }

    /// Evaluates the maximum Lyapunov exponent lambda from dual swarm trajectories:
    /// ln(||δZ(t)||) = ln(||δZ(0)||) + λ * t
    pub fn estimate_lambda(&self, traj_a: &[[f64; 3]], traj_b: &[[f64; 3]]) -> f64 {
        let n = traj_a.len().min(traj_b.len());
        if n < 2 { return 0.0; }

        let mut sum_t = 0.0;
        let mut sum_ln_delta = 0.0;
        let mut sum_t_sq = 0.0;
        let mut sum_t_ln_delta = 0.0;

        for i in 0..n {
            let t = (i as f64) * self.dt;
            let dx = traj_a[i][0] - traj_b[i][0];
            let dy = traj_a[i][1] - traj_b[i][1];
            let dz = traj_a[i][2] - traj_b[i][2];
            let delta = (dx * dx + dy * dy + dz * dz).sqrt().max(1e-12);
            let ln_delta = delta.ln();

            sum_t += t;
            sum_ln_delta += ln_delta;
            sum_t_sq += t * t;
            sum_t_ln_delta += t * ln_delta;
        }

        let nf = n as f64;
        let denom = nf * sum_t_sq - sum_t * sum_t;
        if denom.abs() < 1e-12 { return 0.0; }

        // Least-squares regression slope (lambda)
        (nf * sum_t_ln_delta - sum_t * sum_ln_delta) / denom
    }
}
`,
      typescript: `// TypeScript Real-Time Swarm Phase Space Lyapunov Divergence Tracker
export interface SwarmStabilityState {
  lambdaExponent: number;
  isStable: boolean;
  phaseDivergenceRatio: number;
}

export class LyapunovTrackerWASM {
  private dt: number;

  constructor(dt: number = 0.01) {
    this.dt = dt;
  }

  /**
   * Tracks divergence ratio between twin swarm agent trajectories in phase space.
   */
  public evaluateTrajectories(
    trajA: Float64Array, // Flat [x0, y0, z0, x1, y1, z1, ...]
    trajB: Float64Array,
    pointsCount: number
  ): SwarmStabilityState {
    let sumT = 0;
    let sumLn = 0;
    let sumT2 = 0;
    let sumTLn = 0;

    const initialDelta = Math.hypot(
      trajA[0] - trajB[0],
      trajA[1] - trajB[1],
      trajA[2] - trajB[2]
    ) || 1e-9;

    let finalDelta = initialDelta;

    for (let i = 0; i < pointsCount; i++) {
      const t = i * this.dt;
      const idx = i * 3;
      const dx = trajA[idx] - trajB[idx];
      const dy = trajA[idx + 1] - trajB[idx + 1];
      const dz = trajA[idx + 2] - trajB[idx + 2];
      const delta = Math.max(Math.hypot(dx, dy, dz), 1e-12);
      const lnDelta = Math.log(delta);

      sumT += t;
      sumLn += lnDelta;
      sumT2 += t * t;
      sumTLn += t * lnDelta;

      if (i === pointsCount - 1) finalDelta = delta;
    }

    const n = pointsCount;
    const denom = n * sumT2 - sumT * sumT;
    const lambda = denom !== 0 ? (n * sumTLn - sumT * sumLn) / denom : 0.0;

    return {
      lambdaExponent: lambda,
      isStable: lambda < 0,
      phaseDivergenceRatio: finalDelta / initialDelta,
    };
  }
}
`
    },
    stdp: {
      python: `# Neuromorphic STDP Synaptic Weight Update Rule & Memory Trace Daemon
import numpy as np

class BiomorphicSTDPMatrix:
    """
    Spike-Timing-Dependent Plasticity (STDP) Synapse Matrix:
    delta_w = A_+ * exp(-delta_t / tau_+) if delta_t > 0 (LTP Potentiation)
    delta_w = -A_- * exp(delta_t / tau_-) if delta_t < 0 (LTD Depression)
    """
    def __init__(self, n_pre: int = 512, n_post: int = 512, a_plus: float = 0.85, a_minus: float = 0.45, tau_plus: float = 16.8, tau_minus: float = 33.7):
        self.weights = np.random.uniform(0.1, 0.5, (n_pre, n_post))
        self.a_plus = a_plus
        self.a_minus = a_minus
        self.tau_plus = tau_plus
        self.tau_minus = tau_minus

    def update_synapse(self, pre_idx: int, post_idx: int, t_pre: float, t_post: float) -> float:
        delta_t = t_post - t_pre
        if delta_t > 0:
            delta_w = self.a_plus * np.exp(-delta_t / self.tau_plus)
        else:
            delta_w = -self.a_minus * np.exp(delta_t / self.tau_minus)

        # In-place bounded potentiation
        self.weights[pre_idx, post_idx] = np.clip(self.weights[pre_idx, post_idx] + delta_w, 0.0, 1.0)
        return float(delta_w)
`,
      rust: `// Rust Ultra-Low Latency STDP Synaptic Matrix Plasticity Engine
pub struct STDPMatrixEngine {
    pub a_plus: f32,
    pub a_minus: f32,
    pub tau_plus: f32,
    pub tau_minus: f32,
    pub weights: Vec<f32>,
    pub cols: usize,
}

impl STDPMatrixEngine {
    pub fn new(rows: usize, cols: usize) -> Self {
        Self {
            a_plus: 0.85,
            a_minus: 0.45,
            tau_plus: 16.8,
            tau_minus: 33.7,
            weights: vec![0.25f32; rows * cols],
            cols,
        }
    }

    /// Calculates STDP potentiation/depression step:
    /// Δt = t_post - t_pre
    #[inline(always)]
    pub fn calculate_delta_w(&self, delta_t_ms: f32) -> f32 {
        if delta_t_ms > 0.0 {
            self.a_plus * (-delta_t_ms / self.tau_plus).exp()
        } else {
            -self.a_minus * (delta_t_ms / self.tau_minus).exp()
        }
    }

    /// Applies plasticity update directly to synaptic memory matrix
    pub fn apply_spike_pair(&mut self, pre_idx: usize, post_idx: usize, delta_t_ms: f32) -> f32 {
        let dw = self.calculate_delta_w(delta_t_ms);
        let idx = pre_idx * self.cols + post_idx;
        if idx < self.weights.len() {
            let updated = (self.weights[idx] + dw).clamp(0.0, 1.0);
            self.weights[idx] = updated;
        }
        dw
    }
}
`,
      typescript: `// TypeScript Event-Driven STDP Synaptic Weight Trace Matrix
export class STDPPlasticityEngineWASM {
  private aPlus: number;
  private aMinus: number;
  private tauPlus: number;
  private tauMinus: number;
  private weights: Float32Array;
  private cols: number;

  constructor(
    rows: number = 256,
    cols: number = 256,
    aPlus: number = 0.85,
    aMinus: number = 0.45,
    tauPlus: number = 16.8,
    tauMinus: number = 33.7
  ) {
    this.aPlus = aPlus;
    this.aMinus = aMinus;
    this.tauPlus = tauPlus;
    this.tauMinus = tauMinus;
    this.cols = cols;
    this.weights = new Float32Array(rows * cols).fill(0.25);
  }

  /**
   * Evaluates delta W from pre and post spike timestamps (ms)
   */
  public computeDeltaW(tPre: number, tPost: number): number {
    const deltaT = tPost - tPre;
    if (deltaT > 0) {
      // Long-Term Potentiation (Causal)
      return this.aPlus * Math.exp(-deltaT / this.tauPlus);
    } else {
      // Long-Term Depression (Anti-Causal)
      return -this.aMinus * Math.exp(deltaT / this.tauMinus);
    }
  }

  /**
   * Applies bounded synaptic update in local Neuro Memory Daemon trace
   */
  public updateSynapse(pre: number, post: number, tPre: number, tPost: number): number {
    const dw = this.computeDeltaW(tPre, tPost);
    const idx = pre * this.cols + post;
    if (idx < this.weights.length) {
      this.weights[idx] = Math.max(0.0, Math.min(1.0, this.weights[idx] + dw));
    }
    return dw;
  }
}
`
    }
  };

  const handleCopyCodeText = () => {
    const activeCode = codeExamples[pillar.id]?.[selectedLang] || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const activeCode = codeExamples[pillar.id]?.[selectedLang] || '';
    const extension = selectedLang === 'rust' ? 'rs' : selectedLang === 'typescript' ? 'ts' : 'py';
    const filename = `zoth_${pillar.id}_${selectedLang === 'typescript' ? 'kernel' : selectedLang === 'rust' ? 'engine' : 'solver'}.${extension}`;
    const blob = new Blob([activeCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyFormulaText = () => {
    const activeFormula = pillar.tiers[['Beginner', 'Intermediate', 'Advanced'][activeTierTab]];
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeFormula || '');
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
      
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5 }}>
        <Link component={RouterLink} to="/" color="inherit" underline="hover">Home</Link>
        <Link component={RouterLink} to="/docs" color="inherit" underline="hover">Documentation</Link>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>Pillar {pillar.numeral}: {pillar.title}</Typography>
      </Breadcrumbs>

      {/* Header Hero Card — gold glow behind equation header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          border: `1px solid ${divider}`,
          borderLeft: `6px solid ${pillar.accent}`,
          bgcolor: surface,
          borderRadius: 3,
          boxShadow: dark
            ? '0 4px 20px rgba(0,0,0,0.35), 0 0 40px -12px rgba(212,175,55,0.25)'
            : '0 4px 20px rgba(16,24,40,0.03), 0 0 30px -14px rgba(212,175,55,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: dark
              ? 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
          }}
        />
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Chip label={`PILLAR ${pillar.numeral}`} size="small" sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 800, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}` }} />
              <Chip label="CLOSED-FORM PROOF" size="small" sx={{ bgcolor: dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3', color: dark ? '#34D399' : '#027A48', fontWeight: 800 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1, color: textPrimary, fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' } }}>
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
              sx={{ fontWeight: 700, borderColor: divider, color: textPrimary }}
            >
              Prev ({prevPillar.numeral})
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/docs/math/${nextPillar.id}`)}
              sx={{
                fontWeight: 700,
                bgcolor: gold,
                color: dark ? '#08080B' : '#101828',
                '&:hover': { bgcolor: dark ? goldLight : '#9A7209', color: dark ? '#08080B' : '#FFFFFF' }
              }}
            >
              Next ({nextPillar.numeral})
            </Button>
          </Stack>
        </Box>

        {/* Pillar Switcher Chips Bar */}
        <Divider sx={{ my: 2.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
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
                bgcolor: p.id === pillar.id ? gold : (dark ? '#14141D' : '#F8FAFC'),
                color: p.id === pillar.id ? (dark ? '#08080B' : '#101828') : textPrimary,
                border: '1px solid',
                borderColor: p.id === pillar.id ? gold : divider,
                px: 0.5,
                '&:hover': {
                  bgcolor: p.id === pillar.id ? (dark ? goldLight : '#9A7209') : (dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7'),
                  color: p.id === pillar.id ? (dark ? '#08080B' : '#FFFFFF') : textPrimary
                }
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* SECTION 1: Mathematical Proofs & Tier Formulations (Full Width - Spacious & Un-squished) */}
      <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, mb: 4, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FunctionsIcon sx={{ color: gold, fontSize: '1.6rem' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: textPrimary, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Mathematical Derivation &amp; Tier Formulations
              </Typography>
            </Box>

            <Tooltip title="Copy Selected Formula">
              <IconButton size="small" onClick={handleCopyFormulaText} sx={{ color: copiedFormula ? (dark ? '#34D399' : '#12B76A') : textSecondary }}>
                {copiedFormula ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tier Tabs (Beginner / Intermediate / Advanced) */}
          <Tabs
            value={activeTierTab}
            onChange={(e, val) => setActiveTierTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 3,
              minHeight: 44,
              borderBottom: `1px solid ${divider}`,
              '& .MuiTab-root': {
                minHeight: 44,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                color: textSecondary,
                '&.Mui-selected': { color: dark ? gold : '#8A6A09' }
              },
              '& .MuiTabs-indicator': { bgcolor: gold, height: 3 }
            }}
          >
            <Tab label="1. Beginner (Intuition)" />
            <Tab label="2. Intermediate (Closed-Form)" />
            <Tab label="3. Advanced (Tensor Equation)" />
          </Tabs>

          {/* Active Tier Math Formula Display Box (Full Width, Wide, Readable) — gold-tinted formula card */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: dark ? '#0B0F19' : '#F8FAFC',
              color: dark ? '#F5E6AB' : '#0F172A',
              fontFamily: mono,
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              borderRadius: 2.5,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              border: `1px solid ${dark ? '#1D2939' : '#E2E8F0'}`,
              borderLeft: `4px solid ${gold}`,
              boxShadow: dark
                ? 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 24px -10px rgba(212,175,55,0.3)'
                : '0 2px 8px rgba(16,24,40,0.04), inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <Typography variant="caption" sx={{ color: dark ? '#94A3B8' : '#475467', display: 'block', mb: 1.5, fontFamily: mono, fontWeight: 800, letterSpacing: '0.05em' }}>
              {activeTierTab === 0 ? '// CONCEPTUAL INTUITION' : activeTierTab === 1 ? '// CLOSED-FORM ENGINEERING FORMULA' : '// HIGH-DIMENSIONAL TENSOR EQUATION'}
            </Typography>
            {pillar.tiers[['Beginner', 'Intermediate', 'Advanced'][activeTierTab]]}
          </Box>

          <Alert
            severity="info"
            icon={<FunctionsIcon fontSize="inherit" />}
            sx={{
              mt: 3,
              borderRadius: 2,
              bgcolor: goldBg,
              color: dark ? goldLight : '#715106',
              border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
              '& .MuiAlert-icon': { color: gold }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: dark ? goldLight : '#715106' }}>
              Formulas carried directly from Zoth Studio Math Workstation. Tier definitions represent exact closed-form execution parameters in local daemons.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* SECTION 2: Balanced 6/6 Grid for Interactive Simulator & Operational Metrics */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        
        {/* Left 6/12: Interactive Formula Simulator */}
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%', border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <TuneIcon sx={{ color: gold, fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: textPrimary }}>
                    Interactive Math Simulator
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Adjust system inputs to calculate closed-form outputs in real-time.
                </Typography>

                {/* Slider 1 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textSecondary }}>
                      Control Input Slider
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                      {param1}
                    </Typography>
                  </Box>
                  <Slider
                    value={param1}
                    min={0.01}
                    max={2.0}
                    step={0.05}
                    onChange={(e, val) => setParam1(val)}
                    sx={{ color: gold, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title1}: <Box component="span" sx={{ color: dark ? goldLight : '#8A6A09', fontWeight: 700 }}>{sim.val1}</Box>
                  </Typography>
                </Box>

                {/* Slider 2 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textSecondary }}>
                      Dimension / Interval Slider
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                      {param2}
                    </Typography>
                  </Box>
                  <Slider
                    value={param2}
                    min={16}
                    max={256}
                    step={8}
                    onChange={(e, val) => setParam2(val)}
                    sx={{ color: gold, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title2}: <Box component="span" sx={{ color: dark ? goldLight : '#8A6A09', fontWeight: 700 }}>{sim.val2}</Box>
                  </Typography>
                </Box>
              </Box>

              {/* Output Display Card */}
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: dark ? '#0B0F19' : '#F0FDF4',
                  color: dark ? '#10B981' : '#065F46',
                  borderRadius: 2,
                  fontFamily: mono,
                  border: `1px solid ${dark ? '#1D2939' : '#BBF7D0'}`,
                  borderLeft: `4px solid ${gold}`,
                  boxShadow: dark ? 'inset 0 2px 8px rgba(0,0,0,0.5)' : '0 1px 3px rgba(16,24,40,0.03)'
                }}
              >
                <Typography variant="caption" sx={{ color: dark ? gold : '#854D0E', display: 'block', mb: 0.5, fontWeight: 800, letterSpacing: '0.04em' }}>
                  SIMULATED CLOSED-FORM OUTPUT
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? '#10B981' : '#047857', fontFamily: mono, mb: 1 }}>
                  {sim.resultTitle}: {sim.resultVal}
                </Typography>
                <Typography variant="caption" sx={{ color: dark ? '#94A3B8' : '#334155', display: 'block', lineHeight: 1.5, fontWeight: 500 }}>
                  {sim.desc}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right 6/12: System Operational Metrics Table */}
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%', border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <SpeedIcon sx={{ color: gold, fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: textPrimary }}>
                    System Operational Metrics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Recorded execution targets across studio micro-services and local daemons.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${divider}`, borderRadius: 2, bgcolor: surface }}>
                  <Table>
                    <TableHead sx={{ bgcolor: dark ? '#14141D' : '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: textPrimary, py: 1.5 }}>Metric Identifier</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: textPrimary, py: 1.5 }}>Value Target</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pillar.metrics.map(([label, val]) => (
                        <TableRow key={label} hover>
                          <TableCell sx={{ fontSize: '0.88rem', fontWeight: 600, color: textPrimary, py: 1.75 }}>{label}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? goldLight : '#8A6A09', fontSize: '0.88rem', py: 1.75 }}>
                            {val}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: dark ? '#14141D' : '#F8FAFC', borderRadius: 2, border: `1px solid ${divider}` }}>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontWeight: 600 }}>
                  ⚡ All metric constraints are validated during local swarm consensus evaluation.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* SECTION 3: Production Code Implementation (Full Width - Wide & Un-squished) */}
      <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CodeIcon sx={{ color: gold, fontSize: '1.6rem' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: textPrimary, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Production Implementation Code
              </Typography>
            </Box>

            {/* Language Switcher & Action Buttons */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
              <Tabs
                value={selectedLang}
                onChange={(e, val) => setSelectedLang(val)}
                sx={{
                  minHeight: 36,
                  bgcolor: dark ? '#11131F' : '#F1F5F9',
                  borderRadius: 2,
                  p: 0.3,
                  '& .MuiTab-root': {
                    minHeight: 32,
                    py: 0.5,
                    px: 1.5,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                    color: textSecondary,
                    '&.Mui-selected': {
                      color: dark ? '#08080B' : '#101828',
                      bgcolor: gold,
                    }
                  },
                  '& .MuiTabs-indicator': { display: 'none' }
                }}
              >
                <Tab value="python" label="Python" />
                <Tab value="rust" label="Rust" />
                <Tab value="typescript" label="TypeScript / WASM" />
              </Tabs>

              <Button
                size="small"
                variant="outlined"
                startIcon={copiedCode ? <CheckIcon sx={{ color: dark ? '#34D399' : '#12B76A' }} /> : <ContentCopyIcon fontSize="small" />}
                onClick={handleCopyCodeText}
                sx={{ borderColor: divider, color: textPrimary, fontWeight: 700, py: 0.6, px: 1.5, fontSize: '0.8rem' }}
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleDownloadCode}
                sx={{ borderColor: divider, color: textPrimary, fontWeight: 700, py: 0.6, px: 1.5, fontSize: '0.8rem' }}
              >
                Download
              </Button>
            </Stack>
          </Box>

          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: dark ? '#0F172A' : '#0B0F19',
              color: dark ? '#E2E8F0' : '#F8FAFC',
              borderRadius: 2.5,
              fontFamily: mono,
              fontSize: '0.88rem',
              border: `1px solid ${dark ? '#1E293B' : '#334155'}`,
              borderLeft: `4px solid ${gold}`,
              boxShadow: dark ? 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 24px -10px rgba(212,175,55,0.3)' : '0 4px 12px rgba(15,23,42,0.08)'
            }}
          >
            <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.65 }}>
              {codeExamples[pillar.id]?.[selectedLang] || ''}
            </pre>
          </Paper>
        </CardContent>
      </Card>

      {/* SECTION 4: Sovereign Deployment Funnel */}
      <SovereignFunnel
        title={`Sovereign ${pillar.title} Engine & AI Solvers`}
        subtitle={`Run the ${pillar.title} closed-form engine, local tensor solvers, and STDP matrices with complete zero-telemetry sovereignty. Deploy standalone micro-solvers, integrate with Zoth Studio, or run bare-metal on Zoth OS.`}
        toolTitle={`${pillar.title} Sovereign Solver`}
        toolTag="ZERO-TELEMETRY SOLVER"
        toolDescription={
          pillar.id === 'stdp'
            ? "Deploy neuromorphic Spike-Timing-Dependent Plasticity (STDP) synaptic weight matrices with sub-millisecond local tensor memory and biomorphic causality."
            : pillar.id === 'linear'
            ? "Execute SIMD/WASM-accelerated scaled dot-product attention projection kernels and KV-cache bounds locally with zero egress."
            : pillar.id === 'lyapunov'
            ? "Run continuous-time Lyapunov phase space stability solvers and swarm divergence monitors with zero external network dependencies."
            : pillar.id === 'hessian'
            ? "Calculate matrix-free Hessian-vector products (HVP) and loss manifold curvature eigenvalues on private GPU/NPU hardware."
            : pillar.id === 'calculus'
            ? "Execute decoupled AdamW weight decay and adaptive tensor gradient optimization routines with complete deterministic auditability."
            : "Deploy zero-telemetry temperature-scaled logit distribution and Shannon information entropy estimators for private local inference."
        }
        toolRepo="https://github.com/NullAITech/zoth-studio-v2"
        toolCommand={`git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2/solvers && cargo build --release --bin ${pillar.id}-solver`}
        sx={{ mt: 5 }}
      />

    </Container>
  );
}
