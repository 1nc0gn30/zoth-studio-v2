#!/usr/bin/env node
/**
 * Zoth Studio v2 Prerender, AEO Indexing & Static Route Engine
 * Generates static HTML entry points with route-specific head metadata,
 * Schema.org JSON-LD graphs, and crawler-readable semantic content for all 71 routes.
 * Also synchronizes public/sitemap.xml and dist/sitemap.xml.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig, getAllStaticRoutes, generateSchemaGraph, getRouteMeta } from '../src/config/site.js';
import { microTools } from '../src/data/toolsData.js';
import { workstations } from '../src/data/workstations.js';
import { mathPillars } from '../src/data/mathPillars.js';
import { FAQS_DATA } from '../src/data/faqsData.js';
import { pantheonAgents, pantheonCadres } from '../src/data/pantheon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

const template = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('⚡ Prerendering static route HTML files for SEO, AEO, and AX indexing...');

const allRoutes = getAllStaticRoutes();
const routeEntries = Object.entries(allRoutes);
let generatedCount = 0;

/**
 * Builds rich, accessible, crawler-readable semantic content for the static HTML shell.
 * This is cleanly cleared and replaced when React hydrates with createRoot().
 */
function buildSemanticContent(routePath, meta) {
  let extraContent = '';

  if (routePath === '/') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Zero-Egress Sovereign Agent Development Studio</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Zoth Studio v2 is an air-gapped development environment engineered for orchestrating autonomous AI agent pantheons, local LLMs, and biomorphic synaptic memory matrices with zero outbound telemetry.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div style="padding: 1rem; border: 1px solid #1E2230; border-radius: 4px; background: #0D0E15;">
            <h3 style="color: #D4AF37; font-size: 1rem; margin: 0 0 0.5rem 0;">Zero-Cloud Telemetry</h3>
            <p style="color: #9CA3AF; font-size: 0.88rem; margin: 0;">All LLM queries, vector embeddings, and memory retention stay strictly bound to local loopback (127.0.0.1).</p>
          </div>
          <div style="padding: 1rem; border: 1px solid #1E2230; border-radius: 4px; background: #0D0E15;">
            <h3 style="color: #38BDF8; font-size: 1rem; margin: 0 0 0.5rem 0;">WebGPU WASM Engine</h3>
            <p style="color: #9CA3AF; font-size: 0.88rem; margin: 0;">Client-side tensor matmul and neural inference running directly on hardware GPU via WGSL shaders.</p>
          </div>
          <div style="padding: 1rem; border: 1px solid #1E2230; border-radius: 4px; background: #0D0E15;">
            <h3 style="color: #34D399; font-size: 1rem; margin: 0 0 0.5rem 0;">STDP Neuro Memory (:8094)</h3>
            <p style="color: #9CA3AF; font-size: 0.88rem; margin: 0;">Biomorphic Spike-Timing-Dependent Plasticity daemon for persistent, decay-resistant episodic recall.</p>
          </div>
          <div style="padding: 1rem; border: 1px solid #1E2230; border-radius: 4px; background: #0D0E15;">
            <h3 style="color: #F87171; font-size: 1rem; margin: 0 0 0.5rem 0;">Sovereign Agent Bridge (:8102)</h3>
            <p style="color: #9CA3AF; font-size: 0.88rem; margin: 0;">Decentralized peer-to-peer simplex agent communication bus with Byzantine AST consensus verification.</p>
          </div>
        </div>

        <h3 style="color: #D4AF37; font-size: 1.1rem; margin-top: 1.5rem;">Autonomous Local CLI Quickstart</h3>
        <pre style="background: #0D0E15; padding: 0.85rem; border: 1px solid #1E2230; border-radius: 4px; color: #D4AF37; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;"><code>$ npx zoth up          # Starts offline daemons (memory, bridge, vault, studio)
$ npx zoth status      # Probes loopback enclaves & hardware readiness
$ npx zoth clone       # Scaffolds open-source templates and 21-agent cadres</code></pre>
      </section>
    `;
  } else if (routePath === '/adytum') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Adytum Sanctum // Sovereign Key Management &amp; Zero-Egress Secrets</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">The Adytum Rite unifies ancient Hermetic principles with zero-egress hardware encryption. 22 Major Arcana keys (Key 0 The Fool to Key XXI The World) guide the software engineering lifecycle.</p>
        
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Cryptographic Architecture</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Memory-Hard KDF:</strong> Argon2id (t=3 iterations, m=64MB memory cost, p=4 parallelism lanes) running on loopback port 8787.</li>
          <li><strong>Symmetric Cipher:</strong> XChaCha20-Poly1305 with extended 192-bit nonces to eliminate nonce-reuse collisions.</li>
          <li><strong>Kernel Page Locking:</strong> Decrypted secret bytes are pinned in non-swappable memory (mlock) and zeroized immediately post-task.</li>
          <li><strong>5-Minute Incubation Rule:</strong> Cognitive stillness mechanism generating SHA-256 thesis commitment digests.</li>
        </ul>
      </section>
    `;
  } else if (routePath === '/swarm') {
    const agentsList = pantheonAgents.slice(0, 10).map((a) => `<li><strong>${a.name}</strong> (${a.role}) — Cadre: ${a.cadre}</li>`).join('');
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">21 Swarm Pantheon // Autonomous Agent Command &amp; IPC Topology</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Coordinate the 21 sovereign agents organized across five specialized operational cadres: Architects, Code, Security, Creative, and Swarm.</p>

        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Pantheon Agents &amp; Roles</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          ${agentsList}
        </ul>
        <p style="color: #9CA3AF; font-size: 0.9rem;">Inter-agent communication operates over local Unix domain sockets (<code>ipc:///run/zoth/*.sock</code>) with zero cloud egress.</p>
      </section>
    `;
  } else if (routePath === '/bridges') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Sovereign Bridges // E2EE Signal Mesh &amp; Loopback Bus Monitor</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">End-to-end encrypted inter-agent communication bus listening on port 8102. Simplex channels eliminate single-point-of-failure deadlocks across peer nodes.</p>

        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Core Sovereign Nodes</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Azoth (Prime Architect):</strong> Port :8790 | Lead consensus coordinator</li>
          <li><strong>Athena (Cognitive Arbiter):</strong> Socratic synthesis &amp; verification</li>
          <li><strong>Lucy (Synaptic Latent Stream):</strong> Port :8094 | STDP memory routing</li>
          <li><strong>Lycan (OWASP Enclave Sentinel):</strong> Port :8787 | Zero-egress sandbox enforcement</li>
        </ul>
      </section>
    `;
  } else if (routePath === '/tools') {
    const toolsList = microTools.map((t) => `
      <li style="margin-bottom: 0.5rem;">
        <a href="/tools/${t.id}" style="color: #D4AF37; text-decoration: underline;"><strong>${t.name}</strong></a>: ${t.description} 
        <span style="color: #9CA3AF;">(${t.category} · ${t.executionType})</span>
      </li>
    `).join('');
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Sovereign Tool Nexus // 25 Air-Gapped Micro-Tools</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Standalone, schema-validated air-gapped developer utilities for JWT verification, payload entropy analysis, 3D modeling, and code generation.</p>
        <ul style="line-height: 1.8; color: #E5E7EB; margin-top: 1rem;">
          ${toolsList}
        </ul>
      </section>
    `;
  } else if (routePath === '/workstations') {
    const stationList = workstations.map((w) => `
      <li style="margin-bottom: 0.5rem;">
        <a href="/workstations/${w.id}" style="color: #D4AF37; text-decoration: underline;"><strong>${w.name}</strong></a> [${w.band}]: ${w.description}
      </li>
    `).join('');
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Workstations // 24 Studio Environments &amp; Interactive Consoles</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Full directory of 24 native studio workstations organized across the 6 operational bands: Build, Observe, Security, Spatial, Studio, and Swarm &amp; Consensus.</p>
        <ul style="line-height: 1.8; color: #E5E7EB; margin-top: 1rem;">
          ${stationList}
        </ul>
      </section>
    `;
  } else if (routePath === '/memory') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Lucy Cognitive Memory Hub &amp; Biomorphic STDP Matrix</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Guardian: Lucy // Semantic Bus :8094 // Whitespace Cyberspace Stratum</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Spike-Timing-Dependent Plasticity (STDP) Equations</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Long-Term Potentiation (Causal Spikes Δt &gt; 0):</strong> <code>Δw = A₊ · e^(-Δt / τ₊)</code> (A₊ = 0.05, τ = 20ms)</li>
          <li><strong>Long-Term Depression (Acausal Spikes Δt &lt; 0):</strong> <code>Δw = -A₋ · e^(Δt / τ₋)</code> (A₋ = 0.025, τ = 20ms)</li>
          <li><strong>Exponential Vector Memory Decay:</strong> <code>w(t) = w₀ · e^(-λ · Δt)</code> with decay constant λ = 0.0018 hr⁻¹</li>
        </ul>
        <p style="color: #9CA3AF; font-size: 0.9rem;">Biomorphic long-term potentiation reinforces verified decision vectors while decaying stale telemetry, keeping memory bounds strictly bounded.</p>
      </section>
    `;
  } else if (routePath === '/consensus') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Consensus Battle Arena // 3-Agent Byzantine Triangulation</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Triadic Socratic debate arena and AST diff synthesizer executing over loopback port 8102. Guarantees provably sound code generation through formal consensus arbitration.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Debate Triad Roles</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Azoth (The Proponent):</strong> Formulates the constructive thesis and proposes idempotent AST mutation DAGs.</li>
          <li><strong>Kai (The Skeptic):</strong> Adversarially probes for race conditions, asynchronous deadlock vectors, and macro recursion loops.</li>
          <li><strong>Draco (The Arbitrator):</strong> Computes Bayesian posterior confidence <code>P(H|E) = [P(E|H)·P(H)]/P(E)</code> and issues the ratified execution verdict.</li>
        </ul>
        <p style="color: #9CA3AF; font-size: 0.9rem;">Byzantine fault tolerance ceiling: <code>f &lt; n/3</code> with mandatory 2f + 1 (≥ 66.7%) supermajority quorum and Merkle-trie rollback verification.</p>
      </section>
    `;
  } else if (routePath === '/webgen') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">WebGen // Autonomous Layout Foundry &amp; Polyglot Exporter</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Air-gapped layout generator and polyglot framework exporter for instant React, Vue 3, Svelte 5, and Solid.js components with zero cloud dependencies.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">5-Stage Generation Workflow</h3>
        <ol style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Spec Prompt Foundry:</strong> Articulate specifications or seed layout tokens from 6 curated archetype presets.</li>
          <li><strong>Design System Tokens:</strong> Configure color palettes, typography hierarchies, and border radii.</li>
          <li><strong>Layout Blueprint:</strong> Reorder and toggle modular page sections (Hero, Features, Showcase, Pricing, CTA).</li>
          <li><strong>Live Component Sandbox:</strong> Real-time in-browser code compilation across React, Vue, Svelte, and Solid.js.</li>
          <li><strong>Deployment &amp; Git Export:</strong> One-click Netlify production deployment and local git repository clone.</li>
        </ol>
      </section>
    `;
  } else if (routePath === '/hexstrike') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">HexStrike // Cybersec Arsenal &amp; Threat Intelligence Terminal</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Air-gapped cybersecurity testing terminal, CVE matrix analyzer, and offensive security tooling operating inside local KVM sandboxes.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Security Invariants &amp; Capabilities</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>Deterministic Cryptographic Engine:</strong> Pure JS FIPS 180-4 compliant SHA-256 fallback.</li>
          <li><strong>CVE Threat Matrix:</strong> Comprehensive vulnerability analysis without sending queries to external networks.</li>
          <li><strong>VaultConsole Integration:</strong> Direct hardware secret validation and memory-hard Argon2id key testing.</li>
        </ul>
      </section>
    `;
  } else if (routePath === '/zoth-os') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Zoth OS // KVM Hypervisor Sandbox &amp; Bare-Metal Operating System</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Hardware-isolated Linux virtualization, thin QEMU disk management, and edge dispatch inside air-gapped sovereign enclaves.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Deployment Options</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><strong>QEMU/KVM Virtual Machine:</strong> <code>qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2</code></li>
          <li><strong>Bare-Metal Physical ISO:</strong> <code>sudo dd if=zothos-1.0-amd64.iso of=/dev/sdX status=progress bs=4M conv=fdatasync</code></li>
          <li><strong>Resource Allocations:</strong> 4 vCPU isolation, 8GB locked RAM, NVMe thin pool storage with cgroupv2 memory containment.</li>
        </ul>
      </section>
    `;
  } else if (routePath === '/docs') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Documentation // Zoth Architecture, Principles &amp; Five Enclave Binds</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Complete architectural specifications and operational invariants governing the Zoth Studio v2 zero-egress runtime.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Local Loopback Port Bindings</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem; color: #E5E7EB; font-size: 0.88rem;">
          <tr style="border-bottom: 1px solid #1E2230; text-align: left;">
            <th style="padding: 0.5rem; color: #D4AF37;">Port</th>
            <th style="padding: 0.5rem; color: #D4AF37;">Service</th>
            <th style="padding: 0.5rem; color: #D4AF37;">Role</th>
          </tr>
          <tr style="border-bottom: 1px solid #141724;">
            <td style="padding: 0.5rem;"><code>127.0.0.1:3000</code></td>
            <td style="padding: 0.5rem;">Studio Client</td>
            <td style="padding: 0.5rem;">React 18 MUI UI &amp; WebGPU Engine</td>
          </tr>
          <tr style="border-bottom: 1px solid #141724;">
            <td style="padding: 0.5rem;"><code>127.0.0.1:8094</code></td>
            <td style="padding: 0.5rem;">Neuro Memory Daemon</td>
            <td style="padding: 0.5rem;">STDP synaptic memory &amp; SQLite vec0 store</td>
          </tr>
          <tr style="border-bottom: 1px solid #141724;">
            <td style="padding: 0.5rem;"><code>127.0.0.1:8102</code></td>
            <td style="padding: 0.5rem;">Signal Bridge</td>
            <td style="padding: 0.5rem;">E2EE simplex agent mesh &amp; Byzantine consensus bus</td>
          </tr>
          <tr style="border-bottom: 1px solid #141724;">
            <td style="padding: 0.5rem;"><code>127.0.0.1:8787</code></td>
            <td style="padding: 0.5rem;">Hardware Vault</td>
            <td style="padding: 0.5rem;">Argon2id key derivation &amp; XChaCha20-Poly1305 enclave</td>
          </tr>
          <tr style="border-bottom: 1px solid #141724;">
            <td style="padding: 0.5rem;"><code>127.0.0.1:8989</code></td>
            <td style="padding: 0.5rem;">Swarm Multiplexer</td>
            <td style="padding: 0.5rem;">21-terminal autonomous agent multiplexer daemon</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem;"><code>127.0.0.1:11434</code></td>
            <td style="padding: 0.5rem;">Ollama Foundry</td>
            <td style="padding: 0.5rem;">Zero-cloud local LLM &amp; GGUF inference</td>
          </tr>
        </table>
      </section>
    `;
  } else if (routePath === '/docs/math') {
    const pillarsList = mathPillars.map((p) => `
      <li style="margin-bottom: 0.6rem;">
        <a href="/docs/math/${p.id}" style="color: #D4AF37; text-decoration: underline;"><strong>Pillar ${p.numeral}: ${p.title}</strong></a>
        <br/><span style="color: #9CA3AF; font-size: 0.88rem;">${p.subtitle}</span>
      </li>
    `).join('');
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Six Mathematical Pillars // Interactive Theory Academy</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Formal mathematical foundations powering Zoth Studio and autonomous agent swarms across three tiers of mastery: Beginner Intuition, Intermediate Closed-Form, and Advanced Tensor Equations.</p>
        <ul style="line-height: 1.8; color: #E5E7EB; margin-top: 1rem;">
          ${pillarsList}
        </ul>
      </section>
    `;
  } else if (routePath === '/faqs') {
    const faqsList = FAQS_DATA.map((f, i) => `
      <article style="margin-bottom: 1.25rem; padding: 1rem; border: 1px solid #1E2230; border-radius: 4px; background: #0D0E15;">
        <h3 style="color: #D4AF37; font-size: 1.05rem; margin: 0 0 0.5rem 0;">${i + 1}. ${f.q}</h3>
        <p style="color: #D1D5DB; line-height: 1.6; margin: 0 0 0.75rem 0;">${f.a.replace(/\n+/g, '<br/>')}</p>
        <blockquote style="margin: 0; padding: 0.5rem 0.75rem; border-left: 2px solid #38BDF8; background: #08080B; color: #93C5FD; font-size: 0.85rem;">
          <strong>Architectural Summary:</strong> ${f.summary || f.oracleResponse}
        </blockquote>
      </article>
    `).join('');
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Frequently Asked Questions // Architectural Knowledge Base</h2>
        <p style="color: #D1D5DB; line-height: 1.6; margin-bottom: 1.5rem;">Comprehensive architectural reference answering foundational questions on zero-egress invariants, WebGPU tensor acceleration, STDP synaptic equations, Byzantine consensus arbitration, and local CLI workflows.</p>
        <div>
          ${faqsList}
        </div>
      </section>
    `;
  } else if (routePath === '/ax') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1.25rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.35rem; color: #D4AF37; margin-top: 0;">Agent Experience (AX) // Machine-Readable Entity Profile &amp; Endpoints</h2>
        <p style="color: #D1D5DB; line-height: 1.6;">Zoth Studio v2 exposes structured, token-optimized discovery endpoints designed for autonomous AI agents, LLM search engines, and web crawlers.</p>
        <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Discovery Endpoints</h3>
        <ul style="color: #9CA3AF; line-height: 1.8;">
          <li><a href="/llms.txt" style="color: #38BDF8;">/llms.txt</a> — Concise LLM Context &amp; Entity Profile (614 tokens)</li>
          <li><a href="/llms-full.txt" style="color: #38BDF8;">/llms-full.txt</a> — Comprehensive Agent Grounding &amp; Capabilities Map (3,220 tokens)</li>
          <li><a href="/robots.txt" style="color: #38BDF8;">/robots.txt</a> — AI Crawler &amp; Answer Engine Policy</li>
          <li><a href="/sitemap.xml" style="color: #38BDF8;">/sitemap.xml</a> — Full static route sitemap (71 routes)</li>
        </ul>
      </section>
    `;
  } else if (routePath.startsWith('/tools/')) {
    const toolId = routePath.replace('/tools/', '');
    const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
    if (tool) {
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <h2 style="font-size: 1.25rem; color: #D4AF37;">${tool.name} Developer Workspace</h2>
          <p><strong>Category:</strong> ${tool.category} | <strong>Execution Engine:</strong> ${tool.executionType} | <strong>Version:</strong> ${tool.version}</p>
          <p style="color: #D1D5DB; line-height: 1.6;">${tool.description}</p>
          <pre style="background: #0D0E15; padding: 0.75rem; border: 1px solid #1E2230; border-radius: 4px; color: #D4AF37; overflow-x: auto;"><code>${tool.pull || `npx zoth pull ${tool.id}`}</code></pre>
          ${tool.github ? `<p><a href="${tool.github}" target="_blank" rel="noopener noreferrer" style="color: #60A5FA;">View Open-Source Repository ↗</a></p>` : ''}
        </section>
      `;
    }
  } else if (routePath.startsWith('/workstations/')) {
    const stationId = routePath.replace('/workstations/', '');
    const station = workstations.find((w) => w.id === stationId);
    if (station) {
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <h2 style="font-size: 1.25rem; color: #D4AF37;">${station.name} Sovereign Workstation</h2>
          <p><strong>Operational Band:</strong> ${station.band} | <strong>Runtime:</strong> Decoupled v2 Native | <strong>Mode:</strong> Zero-Egress Air-Gapped</p>
          <p style="color: #D1D5DB; line-height: 1.6;">${station.description}</p>
        </section>
      `;
    }
  } else if (routePath.startsWith('/docs/math/')) {
    const pillarId = routePath.replace('/docs/math/', '');
    const pillar = mathPillars.find((p) => p.id === pillarId);
    if (pillar) {
      const metricRows = pillar.metrics.map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('');
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <h2 style="font-size: 1.25rem; color: #D4AF37;">Pillar ${pillar.numeral}: ${pillar.title} Formal Systems</h2>
          <p><em>${pillar.subtitle}</em></p>
          <ul style="line-height: 1.8; margin-top: 0.5rem; color: #D1D5DB;">
            ${metricRows}
          </ul>
          <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Closed-Form Mathematical Formulation</h3>
          <blockquote style="margin: 0.75rem 0; padding: 0.75rem 1rem; border-left: 3px solid #D4AF37; background: #0D0E15; color: #F5E6AB; font-family: 'JetBrains Mono', monospace;">
            <code>${pillar.tiers.Intermediate}</code>
          </blockquote>
          <h3 style="color: #D4AF37; font-size: 1rem; margin-top: 1rem;">Advanced Tensor Equation</h3>
          <blockquote style="margin: 0.75rem 0; padding: 0.75rem 1rem; border-left: 3px solid #38BDF8; background: #0D0E15; color: #BAE6FD; font-family: 'JetBrains Mono', monospace;">
            <code>${pillar.tiers.Advanced}</code>
          </blockquote>
        </section>
      `;
    }
  }

  return `
    <div id="root">
      <div class="zoth-crawler-pre-render" style="padding: 2rem; max-width: 960px; margin: 0 auto; color: #E5E7EB; background: #08080B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100vh;">
        <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 1.5rem;">
          <a href="/" style="color: #D4AF37; text-decoration: none;">Home</a>
          ${routePath !== '/' ? ` &gt; <span style="color: #E5E7EB;">${meta.title.split('//')[0].trim()}</span>` : ''}
        </nav>

        <header style="margin-bottom: 2rem;">
          <h1 style="color: #D4AF37; font-size: 2.2rem; margin: 0 0 0.75rem 0; line-height: 1.2;">${meta.title}</h1>
          <p style="color: #9CA3AF; font-size: 1.12rem; line-height: 1.6; margin: 0;">${meta.description}</p>
        </header>

        <main>
          ${extraContent}

          <div style="margin-top: 2.5rem; padding: 1.25rem; border-top: 1px solid #1E2230;">
            <h3 style="font-size: 1rem; color: #D4AF37; margin-bottom: 0.75rem;">Sovereign Studio Navigation Hub</h3>
            <ul style="display: flex; flex-wrap: wrap; gap: 1rem; padding: 0; list-style: none; font-size: 0.9rem;">
              <li><a href="/" style="color: #D4AF37; text-decoration: underline;">Home Hub</a></li>
              <li><a href="/adytum" style="color: #D4AF37; text-decoration: underline;">Adytum Sanctum</a></li>
              <li><a href="/memory" style="color: #D4AF37; text-decoration: underline;">Lucy Cognitive Memory</a></li>
              <li><a href="/swarm" style="color: #D4AF37; text-decoration: underline;">21 Swarm Pantheon</a></li>
              <li><a href="/bridges" style="color: #D4AF37; text-decoration: underline;">Signal Bridge (:8102)</a></li>
              <li><a href="/tools" style="color: #D4AF37; text-decoration: underline;">25 Micro-Tools</a></li>
              <li><a href="/workstations" style="color: #D4AF37; text-decoration: underline;">24 Workstations</a></li>
              <li><a href="/consensus" style="color: #D4AF37; text-decoration: underline;">Consensus Battle Arena</a></li>
              <li><a href="/webgen" style="color: #D4AF37; text-decoration: underline;">WebGen Foundry</a></li>
              <li><a href="/hexstrike" style="color: #D4AF37; text-decoration: underline;">HexStrike Cybersec</a></li>
              <li><a href="/zoth-os" style="color: #D4AF37; text-decoration: underline;">Zoth OS KVM</a></li>
              <li><a href="/arsenal" style="color: #D4AF37; text-decoration: underline;">Sovereign Arsenal</a></li>
              <li><a href="/docs" style="color: #D4AF37; text-decoration: underline;">Documentation</a></li>
              <li><a href="/docs/math" style="color: #D4AF37; text-decoration: underline;">Six Math Pillars</a></li>
              <li><a href="/faqs" style="color: #D4AF37; text-decoration: underline;">Frequently Asked Questions</a></li>
              <li><a href="/ax" style="color: #D4AF37; text-decoration: underline;">Agent Experience (AX)</a></li>
            </ul>
          </div>
        </main>

        <footer style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1E2230; font-size: 0.82rem; color: #6B7280; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <span>© 2026 NullAI Tech. Zero-Egress Air-Gapped Sovereign Agent Studio.</span>
          <span><a href="/llms.txt" style="color: #9CA3AF;">llms.txt</a> | <a href="/llms-full.txt" style="color: #9CA3AF;">llms-full.txt</a> | <a href="/robots.txt" style="color: #9CA3AF;">robots.txt</a> | <a href="/sitemap.xml" style="color: #9CA3AF;">sitemap.xml</a></span>
        </footer>

        <noscript>
          <div style="margin-top: 2rem; padding: 1rem; background: #1B1300; border: 1px solid #D4AF37; color: #FDF3D0; border-radius: 4px;">
            <strong>JavaScript Required for Live Interactive Enclave:</strong> Zoth Studio v2 runs full interactive WebGL/WebGPU 3D matrices, live STDP plasticity curve plots, and local model orchestration when JavaScript is enabled in your browser.
          </div>
        </noscript>
      </div>
    </div>
  `;
}

// ── 1. PRERENDER ALL STATIC ROUTES ──
for (const [routePath, meta] of routeEntries) {
  const fullUrl = `${siteConfig.url}${routePath === '/' ? '' : routePath}`;
  const schemaJson = JSON.stringify(generateSchemaGraph(routePath), null, 2);

  let html = template;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // 2. Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${meta.description}" />`
  );

  // 3. Replace Keywords
  const keywords = meta.keywords || siteConfig.keywords.join(', ');
  html = html.replace(
    /<meta name="keywords" content=".*?" \/>/i,
    `<meta name="keywords" content="${keywords}" />`
  );

  // 4. Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="${fullUrl}" />`
  );

  // 5. Replace Open Graph Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${fullUrl}" />`
  );
  html = html.replace(
    /<meta property="og:type" content=".*?" \/>/i,
    `<meta property="og:type" content="${meta.type || 'website'}" />`
  );

  // 6. Replace Twitter Tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  // 7. Replace Schema.org JSON-LD
  html = html.replace(
    /<script type="application\/ld\+json" id="zoth-schema-graph">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="zoth-schema-graph">\n${schemaJson}\n    </script>`
  );

  // 8. Inject Semantic Static HTML Shell for Crawlers and Answer Engines
  const semanticShell = buildSemanticContent(routePath, meta);
  html = html.replace(/<div id="root"><\/div>/i, semanticShell.trim());

  // Determine Target File Path
  let targetPath;
  if (routePath === '/') {
    targetPath = indexHtmlPath;
  } else {
    const cleanRoute = routePath.replace(/^\//, '');
    const routeDir = path.join(distDir, cleanRoute);
    fs.mkdirSync(routeDir, { recursive: true });
    targetPath = path.join(routeDir, 'index.html');
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  generatedCount++;
}

console.log(`✔ Prerendered ${generatedCount} static HTML routes with Schema.org graphs and semantic shells.`);

// ── 2. SYNCHRONIZE SITEMAP.XML ──
console.log('⚡ Generating synchronized sitemap.xml for search and answer engines...');

function getSitemapPriority(routePath) {
  if (routePath === '/') return '1.0';
  if (routePath === '/memory') return '0.95';
  if (['/arsenal', '/swarm', '/workstations', '/tools'].includes(routePath)) return '0.90';
  if (['/consensus', '/bridges', '/webgen', '/hexstrike', '/faqs', '/ax', '/docs'].includes(routePath)) return '0.85';
  if (['/zoth-os', '/adytum', '/docs/math'].includes(routePath)) return '0.80';
  if (routePath.startsWith('/tools/')) return '0.75';
  if (routePath.startsWith('/workstations/')) return '0.75';
  if (routePath.startsWith('/docs/math/')) return '0.75';
  return '0.70';
}

function getSitemapChangeFreq(routePath) {
  if (['/', '/memory', '/swarm'].includes(routePath)) return 'daily';
  if (routePath.startsWith('/docs')) return 'monthly';
  return 'weekly';
}

const today = new Date().toISOString().split('T')[0];

const sitemapUrls = routeEntries.map(([routePath]) => {
  const loc = `${siteConfig.url}${routePath === '/' ? '/' : routePath}`;
  const priority = getSitemapPriority(routePath);
  const changefreq = getSitemapChangeFreq(routePath);

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;

const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distSitemapPath = path.join(distDir, 'sitemap.xml');

fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf8');
fs.writeFileSync(distSitemapPath, sitemapXml, 'utf8');

console.log(`✔ Generated sitemap.xml with ${routeEntries.length} routes in public/ and dist/.`);
console.log(`\n🎉 Prerendering complete: All ${generatedCount} static routes and sitemaps are production-ready!`);
