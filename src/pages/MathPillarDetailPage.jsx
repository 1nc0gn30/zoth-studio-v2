import React, { useState, useEffect, useMemo } from 'react';
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
import DownloadIcon from '@mui/icons-material/Download';
import SEO from '../components/SEO';
import SovereignFunnel from '../components/SovereignFunnel';
import { mathPillars } from '../data/mathPillars';
import { evaluatePillar } from '../utils/mathPillarsEngine';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const SIM_CONFIGS = {
  linear: {
    s1: { label: 'Attention Heads (H)', min: 4, max: 64, step: 4, defaultVal: 16, unit: 'heads' },
    s2: { label: 'Sequence Context Length (S)', min: 512, max: 16384, step: 512, defaultVal: 4096, unit: 'tokens' },
  },
  calculus: {
    s1: { label: 'AdamW Learning Rate (η)', min: 0.005, max: 0.25, step: 0.005, defaultVal: 0.05, unit: '' },
    s2: { label: 'Gradient L2 Clip Threshold (‖g‖₂)', min: 0.2, max: 5.0, step: 0.1, defaultVal: 1.0, unit: '' },
  },
  probability: {
    s1: { label: 'Softmax Temperature (τ)', min: 0.1, max: 2.5, step: 0.05, defaultVal: 0.7, unit: '' },
    s2: { label: 'Top-p Nucleus Cutoff (p)', min: 0.2, max: 1.0, step: 0.05, defaultVal: 0.9, unit: '' },
  },
  hessian: {
    s1: { label: 'Diagonal Curvature H₁₁', min: -4.0, max: 10.0, step: 0.2, defaultVal: 4.2, unit: '' },
    s2: { label: 'Diagonal Curvature H₂₂', min: -4.0, max: 10.0, step: 0.2, defaultVal: 1.4, unit: '' },
  },
  lyapunov: {
    s1: { label: 'Max Lyapunov Exponent (λ)', min: -3.0, max: 3.0, step: 0.05, defaultVal: -0.42, unit: 's⁻¹' },
    s2: { label: 'Integration Horizon (t)', min: 0.5, max: 20.0, step: 0.5, defaultVal: 4.0, unit: 's' },
  },
  stdp: {
    s1: { label: 'Spike Timing Interval (Δt = t_post − t_pre)', min: -80, max: 80, step: 1, defaultVal: 12, unit: 'ms' },
    s2: { label: 'LTP Potentiation Amplitude (A₊)', min: 0.1, max: 1.5, step: 0.05, defaultVal: 0.85, unit: '' },
  },
};

export default function MathPillarDetailPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#7A5600';
  const goldLight = dark ? '#F5E6AB' : '#7A5600';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const { pillarId } = useParams();
  const navigate = useNavigate();

  const pillarIndex = mathPillars.findIndex((p) => p.id === pillarId);
  const isKnownPillar = pillarIndex >= 0;
  const pillar = isKnownPillar ? mathPillars[pillarIndex] : null;

  const prevPillar = isKnownPillar
    ? mathPillars[(pillarIndex - 1 + mathPillars.length) % mathPillars.length]
    : null;
  const nextPillar = isKnownPillar
    ? mathPillars[(pillarIndex + 1) % mathPillars.length]
    : null;

  const [activeTierTab, setActiveTierTab] = useState(1); // 0: Beginner, 1: Intermediate, 2: Advanced
  const [selectedLang, setSelectedLang] = useState('python'); // 'python' | 'rust' | 'typescript'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  const simCfg = SIM_CONFIGS[pillar?.id || 'linear'];
  const [param1, setParam1] = useState(simCfg.s1.defaultVal);
  const [param2, setParam2] = useState(simCfg.s2.defaultVal);

  useEffect(() => {
    const cfg = SIM_CONFIGS[pillar?.id || 'linear'];
    setParam1(cfg.s1.defaultVal);
    setParam2(cfg.s2.defaultVal);
  }, [pillar?.id]);

  const sim = useMemo(() => {
    if (!pillar) {
      return { title1: '', val1: '', title2: '', val2: '', resultTitle: '', resultVal: '', desc: '' };
    }
    switch (pillar.id) {
      case 'linear': {
        const res = evaluatePillar('linear', { heads: param1, seqLen: param2, layers: 32, dHead: 128, dtypeBytes: 2 });
        return {
          title1: 'Embedding Dimension d_model (H × 128)',
          val1: `${res.data.dModel} (${res.data.heads} heads)`,
          title2: 'Cosine Alignment / Attention Output',
          val2: `cos(θ)=${res.data.cosineSimilarity} · out=${res.data.attentionOutput}`,
          resultTitle: `${res.data.seqLen}-Token KV-Cache Footprint`,
          resultVal: `${res.data.kvCacheMiB.toFixed(2)} MiB (${res.data.kvCacheGiB.toFixed(3)} GiB)`,
          desc: res.summary,
        };
      }
      case 'calculus': {
        const res = evaluatePillar('calculus', { learningRate: param1, gradClip: param2, steps: 20 });
        return {
          title1: 'Final Parameter θ₂₀ (from θ₀ = 2.5)',
          val1: `${res.data.finalTheta} (last Δθ = ${res.data.lastDeltaTheta})`,
          title2: 'Clipped Optimizer Steps',
          val2: `${res.data.clippedCount} / ${res.data.steps} steps clipped`,
          resultTitle: 'Final Loss L(θ₂₀) after Decoupled AdamW',
          resultVal: `${res.data.finalLoss} (from ${res.data.initialLoss})`,
          desc: res.summary,
        };
      }
      case 'probability': {
        const res = evaluatePillar('probability', { temperature: param1, topP: param2 });
        return {
          title1: 'Top Token Probability P(w₀)',
          val1: `${res.data.probs[0]} (τ = ${res.data.temperature})`,
          title2: 'Top-p Nucleus Retained Tokens',
          val2: `${res.data.nucleusCount} / ${res.data.tokens.length} (p = ${res.data.topP})`,
          resultTitle: 'Shannon Entropy H(X) & Perplexity 2^H',
          resultVal: `${res.data.entropyBits.toFixed(4)} bits · PPL ${res.data.perplexity.toFixed(3)}`,
          desc: res.summary,
        };
      }
      case 'hessian': {
        const res = evaluatePillar('hessian', { h11: param1, h22: param2, h12: 1.1 });
        return {
          title1: 'Eigenvalues (λ₁, λ₂)',
          val1: `${res.data.lambda1.toFixed(3)}, ${res.data.lambda2.toFixed(3)}`,
          title2: 'Manifold Geometry Classification',
          val2: res.data.classification,
          resultTitle: 'Hessian Condition Number κ(H)',
          resultVal: res.data.conditionNumber === null ? 'Singular (∞)' : `${res.data.conditionNumber.toFixed(3)}`,
          desc: res.summary,
        };
      }
      case 'lyapunov': {
        const res = evaluatePillar('lyapunov', { lambda: param1, timeSec: param2 });
        return {
          title1: 'Stability Classification',
          val1: res.data.stabilityClass,
          title2: 'Clamped Exponent clamp(λ·t, −50, 50)',
          val2: `${res.data.clampedExponent.toFixed(3)}${res.data.wasClamped ? ' (clamped)' : ''}`,
          resultTitle: 'Orbital Divergence ‖δZ(t)‖ / ‖δZ(0)‖',
          resultVal: `${res.data.divergenceFormatted} (C = ${res.data.coherenceIndex.toFixed(4)})`,
          desc: res.summary,
        };
      }
      case 'stdp': {
        const res = evaluatePillar('stdp', { deltaTMs: param1, aPlus: param2 });
        return {
          title1: 'Plasticity Regime',
          val1: res.data.regime,
          title2: 'Bounded Multi-Spike Weight Trace',
          val2: `${res.data.initialWeight} → ${res.data.finalWeight} ∈ [0, 1]`,
          resultTitle: 'Exact Synaptic Weight Change Δw(Δt)',
          resultVal: `${res.data.deltaW >= 0 ? '+' : ''}${res.data.deltaW.toFixed(5)}`,
          desc: res.summary,
        };
      }
      default:
        return { title1: '', val1: '', title2: '', val2: '', resultTitle: '', resultVal: '', desc: '' };
    }
  }, [pillar, param1, param2]);

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
        elif delta_t < 0:
            delta_w = -self.a_minus * np.exp(delta_t / self.tau_minus)
        else:
            delta_w = 0.0

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
        } else if delta_t_ms < 0.0 {
            -self.a_minus * (delta_t_ms / self.tau_minus).exp()
        } else {
            0.0
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
    } else if (deltaT < 0) {
      // Long-Term Depression (Anti-Causal)
      return -this.aMinus * Math.exp(deltaT / this.tauMinus);
    }
    return 0;
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
    if (!pillar) return;
    const activeCode = codeExamples[pillar.id]?.[selectedLang] || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (!pillar) return;
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
    if (!pillar) return;
    const activeFormula = pillar.tiers[['Beginner', 'Intermediate', 'Advanced'][activeTierTab]];
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeFormula || '');
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  if (!isKnownPillar) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <SEO
          title="Unknown Mathematical Pillar // Zoth Math Academy"
          description="The requested mathematical pillar specification does not exist. Explore all six mathematical pillars or launch the interactive Math Pillars Workstation."
        />
        <Breadcrumbs sx={{ mb: 2.5 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}>
            Home
          </Link>
          <Link component={RouterLink} to="/docs/math" color="inherit" underline="hover" sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}>
            Six Math Pillars
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 700 }}>Unknown Pillar</Typography>
        </Breadcrumbs>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: surface,
            border: `1px solid ${divider}`,
          }}
        >
          <Chip
            label="PILLAR NOT FOUND"
            size="small"
            sx={{ mb: 2, bgcolor: goldBg, color: goldLight, fontWeight: 800, border: `1px solid ${gold}` }}
          />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: textPrimary, mb: 1.5 }}>
            Unknown Mathematical Pillar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
            No formal specification matches <code>{pillarId}</code>. Choose one of the six mathematical pillars below or open the interactive Six Mathematical Pillars Workstation.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5, mb: 3 }}>
            <Button
              component={RouterLink}
              to="/docs/math"
              variant="contained"
              sx={{
                minHeight: 44,
                bgcolor: gold,
                color: dark ? '#08080B' : '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
              }}
            >
              Back to Six Math Pillars Academy
            </Button>
            <Button
              component={RouterLink}
              to="/workstations/math-pillars"
              variant="outlined"
              sx={{ minHeight: 44, borderColor: divider, color: textPrimary, fontWeight: 700, textTransform: 'none' }}
            >
              Open Math Pillars Workstation
            </Button>
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5 }}>
            AVAILABLE MATHEMATICAL PILLARS
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {mathPillars.map((p) => (
              <Chip
                key={p.id}
                label={`${p.numeral}. ${p.title}`}
                clickable
                onClick={() => navigate(`/docs/math/${p.id}`)}
                sx={{
                  minHeight: 44,
                  px: 1,
                  fontWeight: 700,
                  bgcolor: dark ? '#14141D' : '#F4F1EA',
                  color: textPrimary,
                  border: `1px solid ${divider}`,
                }}
              />
            ))}
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
      <SEO
        title={`Pillar ${pillar.numeral}: ${pillar.title} // Zoth Math Academy`}
        description={`${pillar.subtitle}. Closed-form derivations, interactive deterministic simulator, and multi-language implementations inside Zoth Studio v2.`}
      />

      {/* Navigation Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5 }}>
        <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}>
          Home
        </Link>
        <Link component={RouterLink} to="/docs" color="inherit" underline="hover" sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}>
          Documentation
        </Link>
        <Link component={RouterLink} to="/docs/math" color="inherit" underline="hover" sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}>
          Six Math Pillars
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>Pillar {pillar.numeral}: {pillar.title}</Typography>
      </Breadcrumbs>

      {/* Header Hero Card — gold glow behind equation header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip label={`PILLAR ${pillar.numeral}`} size="small" sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 800, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#8A6508'}` }} />
              <Chip label="CLOSED-FORM PROOF" size="small" sx={{ bgcolor: dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3', color: dark ? '#34D399' : '#027A48', fontWeight: 800 }} />
            </Box>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                mb: 1,
                color: textPrimary,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.2rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {pillar.title}
            </Typography>
            <Typography component="p" variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 850, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              {pillar.subtitle}
            </Typography>
          </Box>

          {/* Previous / Next Pillar & Workstation Navigation Buttons */}
          <Stack direction="row" spacing={1.25} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' }, gap: 1 }}>
            <Button
              component={RouterLink}
              to="/workstations/math-pillars"
              variant="outlined"
              startIcon={<CalculateIcon />}
              sx={{
                minHeight: 44,
                fontWeight: 700,
                borderColor: divider,
                color: textPrimary,
                textTransform: 'none',
                flex: { xs: '1 1 100%', sm: 'initial' },
              }}
            >
              Math Workstation
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/docs/math/${prevPillar.id}`)}
              sx={{ minHeight: 44, fontWeight: 700, borderColor: divider, color: textPrimary, flex: { xs: 1, sm: 'initial' } }}
            >
              Prev ({prevPillar.numeral})
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/docs/math/${nextPillar.id}`)}
              sx={{
                minHeight: 44,
                fontWeight: 700,
                bgcolor: gold,
                color: dark ? '#08080B' : '#FFFFFF',
                flex: { xs: 1, sm: 'initial' },
                '&:hover': { bgcolor: dark ? goldLight : '#5E4200', color: dark ? '#08080B' : '#FFFFFF' },
              }}
            >
              Next ({nextPillar.numeral})
            </Button>
          </Stack>
        </Box>

        {/* Pillar Switcher Chips Bar — clean flexWrap prevents tablet scrollbar occlusion */}
        <Divider sx={{ my: 2.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
          EXPLORE ALL SIX MATHEMATICAL PILLARS
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {mathPillars.map((p) => (
            <Chip
              key={p.id}
              className={p.id === pillar.id && !dark ? 'zs-ondark' : undefined}
              label={`${p.numeral}. ${p.title}`}
              clickable
              onClick={() => navigate(`/docs/math/${p.id}`)}
              sx={{
                minHeight: 44,
                fontWeight: 700,
                bgcolor: p.id === pillar.id ? gold : (dark ? '#14141D' : '#F4F1EA'),
                color: p.id === pillar.id ? (dark ? '#08080B' : '#FFFFFF') : textPrimary,
                '& .MuiChip-label': {
                  color: p.id === pillar.id ? (dark ? '#08080B !important' : '#FFFFFF !important') : textPrimary,
                },
                border: '1px solid',
                borderColor: p.id === pillar.id ? gold : divider,
                px: 0.75,
                '&:hover': {
                  bgcolor: p.id === pillar.id ? (dark ? goldLight : '#5E4200') : (dark ? 'rgba(212,175,55,0.1)' : '#FEF9E7'),
                  color: p.id === pillar.id ? (dark ? '#08080B' : '#FFFFFF') : textPrimary,
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* SECTION 1: Mathematical Proofs & Tier Formulations */}
      <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, mb: 4, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FunctionsIcon sx={{ color: gold, fontSize: '1.6rem' }} />
              <Typography component="h2" variant="h5" sx={{ fontWeight: 800, color: textPrimary, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Mathematical Derivation &amp; Tier Formulations
              </Typography>
            </Box>

            <Tooltip title="Copy Selected Formula">
              <IconButton
                aria-label="Copy selected formula"
                onClick={handleCopyFormulaText}
                sx={{ minWidth: 44, minHeight: 44, color: copiedFormula ? (dark ? '#34D399' : '#047857') : textSecondary }}
              >
                {copiedFormula ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tier Tabs — concise responsive labels prevent mobile clipping */}
          <Tabs
            value={activeTierTab}
            onChange={(e, val) => setActiveTierTab(val)}
            variant="fullWidth"
            aria-label="Formula Complexity Tier"
            sx={{
              mb: 3,
              minHeight: 44,
              borderBottom: `1px solid ${divider}`,
              '& .MuiTab-root': {
                minHeight: 44,
                minWidth: 0,
                px: { xs: 1, sm: 2 },
                fontWeight: 700,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                textTransform: 'none',
                color: textSecondary,
                '&.Mui-selected': { color: gold },
              },
              '& .MuiTabs-indicator': { bgcolor: gold, height: 3 },
            }}
          >
            <Tab label="1. Intuition" />
            <Tab label="2. Closed-Form" />
            <Tab label="3. Tensor Form" />
          </Tabs>

          {/* Active Tier Math Formula Display Box */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: dark ? '#0B0F19' : '#F4F1EA',
              color: dark ? '#F5E6AB' : '#101828',
              fontFamily: mono,
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              borderRadius: 2.5,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              border: `1px solid ${dark ? '#1D2939' : '#D6CFC2'}`,
              borderLeft: `4px solid ${gold}`,
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
              color: dark ? goldLight : '#5E4200',
              border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#D6CFC2'}`,
              '& .MuiAlert-icon': { color: gold },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: dark ? goldLight : '#5E4200' }}>
              Equations executed directly by the pure deterministic engine (<code>src/utils/mathPillarsEngine.js</code>) shared with the interactive Six Mathematical Pillars Workstation.
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
                  <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: textPrimary }}>
                    Interactive Math Simulator
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Adjust both live inputs to compute exact closed-form outputs via <code>mathPillarsEngine.js</code>.
                </Typography>

                {/* Slider 1 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: textSecondary }}>
                      {simCfg.s1.label}
                    </Typography>
                    <Typography component="span" variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                      {param1}{simCfg.s1.unit ? ` ${simCfg.s1.unit}` : ''}
                    </Typography>
                  </Box>
                  <Slider
                    aria-label={simCfg.s1.label}
                    value={param1}
                    min={simCfg.s1.min}
                    max={simCfg.s1.max}
                    step={simCfg.s1.step}
                    onChange={(e, val) => setParam1(val)}
                    sx={{ color: gold, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title1}: <Box component="span" sx={{ color: goldLight, fontWeight: 700 }}>{sim.val1}</Box>
                  </Typography>
                </Box>

                {/* Slider 2 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: textSecondary }}>
                      {simCfg.s2.label}
                    </Typography>
                    <Typography component="span" variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                      {param2}{simCfg.s2.unit ? ` ${simCfg.s2.unit}` : ''}
                    </Typography>
                  </Box>
                  <Slider
                    aria-label={simCfg.s2.label}
                    value={param2}
                    min={simCfg.s2.min}
                    max={simCfg.s2.max}
                    step={simCfg.s2.step}
                    onChange={(e, val) => setParam2(val)}
                    sx={{ color: gold, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {sim.title2}: <Box component="span" sx={{ color: goldLight, fontWeight: 700 }}>{sim.val2}</Box>
                  </Typography>
                </Box>
              </Box>

              {/* Output Display Card */}
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: dark ? '#0B0F19' : '#ECFDF5',
                  color: dark ? '#10B981' : '#065F46',
                  borderRadius: 2,
                  fontFamily: mono,
                  border: `1px solid ${dark ? '#1D2939' : '#A7F3D0'}`,
                  borderLeft: `4px solid ${gold}`,
                  boxShadow: dark ? 'inset 0 2px 8px rgba(0,0,0,0.5)' : '0 1px 3px rgba(16,24,40,0.03)',
                }}
              >
                <Typography variant="caption" sx={{ color: dark ? gold : '#7A5600', display: 'block', mb: 0.5, fontWeight: 800, letterSpacing: '0.04em' }}>
                  DETERMINISTIC CLOSED-FORM OUTPUT
                </Typography>
                <Typography component="p" variant="subtitle1" sx={{ fontWeight: 800, color: dark ? '#34D399' : '#047857', fontFamily: mono, mb: 1 }}>
                  {sim.resultTitle}: {sim.resultVal}
                </Typography>
                <Typography variant="caption" sx={{ color: dark ? '#CBD5E1' : '#1E293B', display: 'block', lineHeight: 1.5, fontWeight: 500 }}>
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
                  <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: textPrimary }}>
                    System Operational Metrics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Recorded execution targets across studio micro-services and local daemons.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${divider}`, borderRadius: 2, bgcolor: surface }}>
                  <Table>
                    <TableHead sx={{ bgcolor: dark ? '#14141D' : '#F4F1EA' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: textPrimary, py: 1.5 }}>Metric Identifier</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: textPrimary, py: 1.5 }}>Value Target</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pillar.metrics.map(([label, val]) => (
                        <TableRow key={label} hover>
                          <TableCell sx={{ fontSize: '0.88rem', fontWeight: 600, color: textPrimary, py: 1.75 }}>{label}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 800, color: goldLight, fontSize: '0.88rem', py: 1.75 }}>
                            {val}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: dark ? '#14141D' : '#F4F1EA', borderRadius: 2, border: `1px solid ${divider}` }}>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontWeight: 600 }}>
                  All numerical bounds are verified by <code>npm run test:math-pillars</code> and mirrored in <code>server/math-pillars-engine.mjs</code>.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 3: Production Code Implementation */}
      <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(16,24,40,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CodeIcon sx={{ color: gold, fontSize: '1.6rem' }} />
              <Typography component="h2" variant="h5" sx={{ fontWeight: 800, color: textPrimary, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Reference Implementation Code
              </Typography>
            </Box>

            {/* Language Switcher & Action Buttons — >= 6.1:1 Light Mode contrast (#FFFFFF on #7A5600) & >= 44px tap targets */}
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
              <Tabs
                value={selectedLang}
                onChange={(e, val) => setSelectedLang(val)}
                aria-label="Implementation Language"
                sx={{
                  minHeight: 44,
                  bgcolor: dark ? '#11131F' : '#F4F1EA',
                  borderRadius: 2,
                  p: 0.35,
                  border: `1px solid ${divider}`,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    py: 0.5,
                    px: 1.75,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                    color: dark ? '#CBD5E1' : '#1E293B',
                    '&.Mui-selected': {
                      color: dark ? '#08080B' : '#FFFFFF',
                      bgcolor: gold,
                    },
                  },
                  '& .MuiTabs-indicator': { display: 'none' },
                }}
              >
                <Tab value="python" label="Python" />
                <Tab value="rust" label="Rust" />
                <Tab value="typescript" label="TypeScript" />
              </Tabs>

              <Button
                size="small"
                variant="outlined"
                startIcon={copiedCode ? <CheckIcon sx={{ color: dark ? '#34D399' : '#047857' }} /> : <ContentCopyIcon fontSize="small" />}
                onClick={handleCopyCodeText}
                sx={{ minHeight: 44, borderColor: divider, color: textPrimary, fontWeight: 700, px: 1.75, fontSize: '0.82rem', textTransform: 'none' }}
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleDownloadCode}
                sx={{ minHeight: 44, borderColor: divider, color: textPrimary, fontWeight: 700, px: 1.75, fontSize: '0.82rem', textTransform: 'none' }}
              >
                Download
              </Button>
            </Stack>
          </Box>

          {/* Theme-aware Editorial Ivory Light code card (#F4F1EA / #101828) vs Obsidian Dark (#0B0F19 / #E2E8F0) */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: dark ? '#0B0F19' : '#F4F1EA',
              color: dark ? '#E2E8F0' : '#101828',
              borderRadius: 2.5,
              fontFamily: mono,
              fontSize: '0.86rem',
              border: `1px solid ${dark ? '#1E293B' : '#D6CFC2'}`,
              borderLeft: `4px solid ${gold}`,
            }}
          >
            <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.65 }}>
              {codeExamples[pillar.id]?.[selectedLang] || ''}
            </pre>
          </Paper>
        </CardContent>
      </Card>

      {/* SECTION 4: Sovereign Deployment Funnel (single Coffee/Solana bar in Footer only) */}
      <SovereignFunnel
        title={`Run ${pillar.title} Solvers Locally`}
        subtitle={`Verify the ${pillar.title} deterministic engine locally with zero cloud telemetry. Run Node unit tests directly inside Zoth Studio v2 or open the interactive workstation via zoth open math-pillars.`}
        toolTitle={`${pillar.title} Pure ESM Engine`}
        toolTag="ZERO-TELEMETRY SOLVER"
        toolDescription={
          pillar.id === 'stdp'
            ? 'Deterministic neuromorphic Spike-Timing-Dependent Plasticity (STDP) with neutral Δw(0) = 0, full [-80, +80] ms curves, and bounded [0, 1] weight traces.'
            : pillar.id === 'linear'
            ? 'Deterministic scaled dot-product attention projection kernels, cosine alignment, and KV-cache memory bounds with zero external egress.'
            : pillar.id === 'lyapunov'
            ? 'Clamped Lyapunov phase-space divergence, dual-trajectory OLS exponent estimation, and coherence bounds with zero overflow.'
            : pillar.id === 'hessian'
            ? 'Symmetric 2×2 Hessian eigenvalue decomposition, condition number κ(H), definiteness classification, and matrix-free finite-difference HVP.'
            : pillar.id === 'calculus'
            ? 'Decoupled AdamW optimizer trajectory with bias correction, L2 gradient norm clipping, and LoRA parameter budgets.'
            : 'Log-sum-exp temperature-scaled softmax, top-p nucleus cutoff, Shannon entropy H(X), perplexity 2^H, and KL divergence.'
        }
        toolRepo="https://github.com/NullAITech/zoth-studio-v2"
        toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2 && npm run test:math-pillars"
        showSupportStrip={false}
        sx={{ mt: 5 }}
      />
    </Container>
  );
}
