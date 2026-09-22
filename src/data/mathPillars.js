/** Six engineering pillars carried from studio/math-pillars.html. */
export const mathPillars = [
  {
    id: 'linear',
    numeral: 'I',
    title: 'Linear Algebra',
    subtitle: 'Tensors, projections, geometry, and attention',
    accent: '#B8860B',
    metrics: [
      ['Embedding dimension d_model', '2048 / 4096'],
      ['Attention heads h', '16 / 32'],
      ['Head dimension d_k = d/h', '128'],
    ],
    tiers: {
      Beginner: 'Attention is a spotlight: score what you already hold against what matches, then look only at the brightest matches.',
      Intermediate: 'cos(θ) = (A · B) / (‖A‖ · ‖B‖)',
      Advanced: 'M_KV = 2 · n_layers · n_heads · d_head · S · bytes',
    },
  },
  {
    id: 'calculus',
    numeral: 'II',
    title: 'Multivariable Calculus',
    subtitle: 'Gradients, loss optimization, and momentum',
    accent: '#7C5CBF',
    metrics: [
      ['Learning rate η', '3.0 × 10⁻⁴'],
      ['AdamW moments β1, β2', '0.90 / 0.999'],
      ['Gradient norm clip ‖g‖₂', '1.0'],
    ],
    tiers: {
      Beginner: 'The loss is a hillside. The gradient is the steepest step downhill, and the learning rate is how long that step is.',
      Intermediate: 'θ ← θ − η · ∇L(θ)',
      Advanced: 'W = W₀ + (α / r) · (B · A)',
    },
  },
  {
    id: 'probability',
    numeral: 'III',
    title: 'Probability & Info Theory',
    subtitle: 'Logit distributions, Shannon entropy, and sampling',
    accent: '#0E9384',
    metrics: [
      ['Softmax temperature τ', '0.70'],
      ['Nucleus cutoff p', '0.90 (top-p)'],
      ['Shannon entropy H', '1.482 bits'],
    ],
    tiers: {
      Beginner: 'Temperature loosens or tightens the lottery over the next token. Entropy measures how surprised that lottery still is.',
      Intermediate: 'P(wᵢ) = exp(zᵢ / τ) / Σ exp(zⱼ / τ)',
      Advanced: 'H(X) = −Σ p(x) log₂ p(x)',
    },
  },
  {
    id: 'hessian',
    numeral: 'IV',
    title: 'Hessian & Loss Manifolds',
    subtitle: 'Curvature tensors, saddles, and second-order dynamics',
    accent: '#B54708',
    metrics: [
      ['Condition number κ(H)', '14.2 (bounded)'],
      ['Spectral radius λ_max', '4.82'],
      ['HVP compute cost', 'O(d) matrix-free'],
    ],
    tiers: {
      Beginner: 'The Hessian tells you whether the hillside is a bowl, a ridge, or a saddle. Sharp bowls need shorter steps.',
      Intermediate: 'H = ∇²L(θ)',
      Advanced: 'κ(H) = λ_max(H) / λ_min(H)',
    },
  },
  {
    id: 'lyapunov',
    numeral: 'V',
    title: 'Lyapunov & Phase Dynamics',
    subtitle: 'Attractors, dynamic coherence, and stability bounds',
    accent: '#C11574',
    metrics: [
      ['Max Lyapunov exponent λ', '−0.42 (stable flow)'],
      ['System coherence index C', '0.918'],
      ['Phase-space measure', 'Ergodic Liouville'],
    ],
    tiers: {
      Beginner: 'A negative Lyapunov exponent means nearby swarm states fall back together instead of flying apart.',
      Intermediate: '‖δZ(t)‖ ≈ ‖δZ(0)‖ · exp(λ t)',
      Advanced: 'C = exp(−H(X) / H_max)',
    },
  },
  {
    id: 'stdp',
    numeral: 'VI',
    title: 'Neuromorphic STDP',
    subtitle: 'Synaptic plasticity, memory traces, and causality',
    accent: '#175CD3',
    metrics: [
      ['LTP window τ₊', '16.8 ms'],
      ['LTD window τ₋', '33.7 ms'],
      ['Memory potentiation Δw', '+0.124 causal'],
    ],
    tiers: {
      Beginner: 'If a cause fires just before an effect, the synapse strengthens. If the order flips, it weakens. That is how the memory daemon keeps traces.',
      Intermediate: 'Δw = A₊ · exp(−Δt / τ₊) when Δt > 0;  −A₋ · exp(Δt / τ₋) when Δt < 0',
      Advanced: 'Δw = { A₊ e^(−Δt/τ₊) if Δt > 0 (LTP);  −A₋ e^(Δt/τ₋) if Δt < 0 (LTD) }',
    },
  },
];

export const mathTiers = ['Beginner', 'Intermediate', 'Advanced'];
