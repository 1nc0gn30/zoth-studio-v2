import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { pantheonAgents, pantheonAnimationStates } from '../data/pantheon';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export const HELIOS_ZOTH_PLANETS = [
  {
    id: 'zoth_prime',
    name: 'Zoth Prime',
    subtitle: 'Imperial Sovereign Capital & Terraform Nexus',
    biome: 'Golden-Emerald Continental Core',
    orbitRadius: '0 AU (Core Nexus)',
    atmoColor: '#38bdf8',
    accentColor: '#D4AF37',
    ringType: 'Kepler Orbital Ring',
    moons: 1,
    population: '142 Autonomous Citizens',
    specialization: 'Sovereign Governance, Neural Council & Prime Shipyard',
    colonies: [
      { id: 'colony_capital', name: 'Zoth Capital', lat: 20.0, lon: 0.0, color: '#f59e0b' },
      { id: 'colony_nova_zoth', name: 'Nova Zoth', lat: -14.0, lon: 72.0, color: '#22d3ee' },
      { id: 'colony_sol_crypta', name: 'Sol Crypta', lat: 34.0, lon: -118.0, color: '#a78bfa' },
      { id: 'colony_adytum_grove', name: 'Adytum Grove', lat: -32.0, lon: -42.0, color: '#34d399' },
      { id: 'colony_hex_bastion', name: 'Hex Bastion', lat: 48.0, lon: 135.0, color: '#f97316' },
    ],
    lore: 'The sovereign heart of the Helios-Zoth sector. Dark obsidian tectonic continents veined with 24K golden cybernetic transit arteries and emerald oceans, encircled by the Kepler Orbital Ring.',
    textureUrl: '/assets/planets/zoth_prime_texture.jpg',
    glbUrl: '/assets/planets/zoth_prime.glb',
    flybyWebpUrl: '/assets/planets/zoth_prime_flyby.webp',
  },
  {
    id: 'aethelgard',
    name: 'Aethelgard',
    subtitle: 'Cryo-Crystalline Quantum Compute Vault',
    biome: 'Sub-Zero Nitrogen Glaciers & Cyan Cryo-Arrays',
    orbitRadius: '1.42 AU',
    atmoColor: '#22d3ee',
    accentColor: '#38bdf8',
    ringType: 'Cryo-Hex Superconducting Ring',
    moons: 2,
    population: '64 Quantum Architect Agents',
    specialization: 'Zero-Kelvin LLM Weights Storage, ZK-STARK Proving & Cryo-Inference',
    colonies: [
      { id: 'colony_frost_spire', name: 'Frost Spire Zero', lat: 28.0, lon: 15.0, color: '#22d3ee' },
      { id: 'colony_cryo_vault', name: 'Kelvin Tensor Vault', lat: -22.0, lon: 95.0, color: '#38bdf8' },
      { id: 'colony_borealis_gate', name: 'Borealis Relay', lat: 52.0, lon: -80.0, color: '#818cf8' },
      { id: 'colony_glacier_synapse', name: 'Glacier Synapse', lat: -40.0, lon: -140.0, color: '#67e8f9' },
    ],
    lore: 'Sub-zero glacial fortress world where liquid nitrogen seas cool massive hexagonal superconducting tensor vaults and zero-knowledge cryptographic provers.',
    textureUrl: '/assets/planets/aethelgard_texture.jpg',
    glbUrl: '/assets/planets/aethelgard.glb',
    flybyWebpUrl: '/assets/planets/aethelgard_flyby.webp',
  },
  {
    id: 'pyros_foundry',
    name: 'Pyros Foundry',
    subtitle: 'Tectonic Magma Forge & Heavy Silicon Smelter',
    biome: 'Obsidian Basalt Crust & Molten Caldera Rivers',
    orbitRadius: '2.18 AU',
    atmoColor: '#f97316',
    accentColor: '#ef4444',
    ringType: 'Solar Smelter Belt',
    moons: 1,
    population: '88 Foundry & Hardware Agents',
    specialization: 'Autonomous Wafer Lithography, Geothermal Dyson Collectors & Mecha Forging',
    colonies: [
      { id: 'colony_vulcan_core', name: 'Vulcan Lithography Core', lat: 12.0, lon: -30.0, color: '#f97316' },
      { id: 'colony_magma_anvil', name: 'Magma Anvil', lat: -28.0, lon: 60.0, color: '#ef4444' },
      { id: 'colony_obsidian_citadel', name: 'Obsidian Bastion', lat: 42.0, lon: 110.0, color: '#fbbf24' },
      { id: 'colony_helios_kiln', name: 'Helios Kiln', lat: -15.0, lon: -125.0, color: '#fb923c' },
    ],
    lore: 'Hyper-industrial volcanic world harnessing tectonic caldera rivers and planetary geothermal kilns to smelt extreme-ultraviolet silicon wafers and autonomous robotics.',
    textureUrl: '/assets/planets/pyros_foundry_texture.jpg',
    glbUrl: '/assets/planets/pyros_foundry.glb',
    flybyWebpUrl: '/assets/planets/pyros_foundry_flyby.webp',
  },
  {
    id: 'vaelor_oceanus',
    name: 'Vaelor Oceanus',
    subtitle: 'Bioluminescent Pelagic Synapse & Bio-Compute World',
    biome: 'Abyssal Bioluminescent Archipelagos & Hydro-Domes',
    orbitRadius: '3.12 AU',
    atmoColor: '#10b981',
    accentColor: '#34d399',
    ringType: 'Orbital Hydro-Halo',
    moons: 3,
    population: '96 Bio-Synthetic & Neuro Agents',
    specialization: 'Wetware STDP Memory Engrams, Oceanic Wave-Compute & Synthetic Ecology',
    colonies: [
      { id: 'colony_pelagic_nexus', name: 'Pelagic Nexus', lat: 8.0, lon: 45.0, color: '#10b981' },
      { id: 'colony_coral_synapse', name: 'Coral Synapse Reef', lat: -24.0, lon: -70.0, color: '#2dd4bf' },
      { id: 'colony_abyssal_dome', name: 'Abyssal Trench Dome', lat: 36.0, lon: 140.0, color: '#34d399' },
      { id: 'colony_nautilus_port', name: 'Nautilus Starport', lat: -45.0, lon: 20.0, color: '#06b6d4' },
    ],
    lore: 'Deep indigo-emerald pelagic world where glowing bioluminescent coral reefs and golden hydro-dome archipelagos form a planet-scale Spike-Timing-Dependent Plasticity (STDP) memory matrix.',
    textureUrl: '/assets/planets/vaelor_oceanus_texture.jpg',
    glbUrl: '/assets/planets/vaelor_oceanus.glb',
    flybyWebpUrl: '/assets/planets/vaelor_oceanus_flyby.webp',
  },
  {
    id: 'chronos_citadel',
    name: 'Chronos Citadel',
    subtitle: 'Ringed Jovian Gas Giant & Orbital Dyson Shipyard',
    biome: 'Metallic Hydrogen Storm Bands & Golden Planetary Rings',
    orbitRadius: '4.65 AU',
    atmoColor: '#a855f7',
    accentColor: '#e879f9',
    ringType: 'Jovian Grand Golden Rings',
    moons: 4,
    population: '118 Fleet & Time-Series Agents',
    specialization: 'He-3 Fusion Extraction, Interplanetary Warp Gate Calibration & Fleet Yard',
    colonies: [
      { id: 'colony_chronos_ring', name: 'Chronos Ring Dock Alpha', lat: 0.0, lon: 0.0, color: '#e879f9' },
      { id: 'colony_jovian_eye', name: 'Aeon Vortex Station', lat: -18.0, lon: 88.0, color: '#a855f7' },
      { id: 'colony_titan_yard', name: 'Titan Orbital Shipyard', lat: 30.0, lon: -105.0, color: '#c084fc' },
      { id: 'colony_he3_harvester', name: 'Helium-3 Cloud Spire', lat: 15.0, lon: 170.0, color: '#f0abfc' },
    ],
    lore: 'Colossal ringed gas giant banded in royal indigo and liquid gold. Its shimmering ice-and-gold ring system hosts the sector’s primary Helium-3 fusion harvesters and temporal DAG relays.',
    textureUrl: '/assets/planets/chronos_citadel_texture.jpg',
    glbUrl: '/assets/planets/chronos_citadel.glb',
    flybyWebpUrl: '/assets/planets/chronos_citadel_flyby.webp',
  },
  {
    id: 'nebula_sanctum',
    name: 'Nebula Sanctum',
    subtitle: 'Hermetic Aether Monolith & Outer Rim Observatory',
    biome: 'Iridescent Crystalline Crust & Zero-Point Aether Fissures',
    orbitRadius: '6.40 AU',
    atmoColor: '#f43f5e',
    accentColor: '#fb7185',
    ringType: 'Monolith Relay Array',
    moons: 2,
    population: '76 Hermetic Research & Red-Team Agents',
    specialization: 'Adversarial Security Sandbox, Deep-Space Signal Telemetry & Self-Evolution',
    colonies: [
      { id: 'colony_hermes_monolith', name: 'Hermes Prime Monolith', lat: 22.0, lon: -15.0, color: '#f43f5e' },
      { id: 'colony_aether_observatory', name: 'Outer Rim Array', lat: -35.0, lon: 110.0, color: '#fb7185' },
      { id: 'colony_null_sanctum', name: 'NullAI Citadel', lat: 48.0, lon: 65.0, color: '#fda4af' },
      { id: 'colony_void_gate', name: 'Interstellar Warp Gate', lat: -10.0, lon: -150.0, color: '#e11d48' },
    ],
    lore: 'Mysterious outer-rim sanctuary sculpted from bismuth-like geometric monoliths and crimson-gold ley lines, guarding the sector’s air-gapped red-team proving grounds.',
    textureUrl: '/assets/planets/nebula_sanctum_texture.jpg',
    glbUrl: '/assets/planets/nebula_sanctum.glb',
    flybyWebpUrl: '/assets/planets/nebula_sanctum_flyby.webp',
  },
];

export const ADYTUM_22_TAROT_KEYS = [
  { keyNumber: 0, roman: '0', name: 'The Fool', slug: 'fool', hebrew: 'Aleph (א)', element: 'Air', primaryColor: '#FDE047', secondaryColor: '#38BDF8', spellName: 'Zero-Point Leap of Faith', spellPower: 95, guardianAgent: 'AZOTH', guardianRole: 'Sovereign Alchemist & Prime Architect', guardianPet: '🐺 Direwolf Fenris', subconscious: 'Receptivity to divine impulse without fear; intuitive leap through latent space.', superconscious: 'The Limitless Life-Power manifesting original sovereign intention.', hdImageUrl: '/assets/tarot3d/cards/key_00_fool.jpg', glbUrl: '/assets/tarot3d/glb/key_00_fool.glb', videoUrl: '/assets/tarot3d/videos/key_00_fool.mp4' },
  { keyNumber: 1, roman: 'I', name: 'The Magician', slug: 'magician', hebrew: 'Beth (ב)', element: 'Air', primaryColor: '#F59E0B', secondaryColor: '#EC4899', spellName: 'As Above So Below Channel', spellPower: 98, guardianAgent: 'NEXUS', guardianRole: 'Lead Architect & Quantum Synthesis', guardianPet: '🌌 Nebula Core', subconscious: 'Single-pointed concentration binding local CLI tools and hardware compute.', superconscious: 'Conscious induction of supernal architecture into physical code.', hdImageUrl: '/assets/tarot3d/cards/key_01_magician.jpg', glbUrl: '/assets/tarot3d/glb/key_01_magician.glb', videoUrl: '/assets/tarot3d/videos/key_01_magician.mp4' },
  { keyNumber: 2, roman: 'II', name: 'The High Priestess', slug: 'highpriestess', hebrew: 'Gimel (ג)', element: 'Water', primaryColor: '#38BDF8', secondaryColor: '#818CF8', spellName: 'Scroll of TORA Memory Lock', spellPower: 92, guardianAgent: 'VIGIL', guardianRole: 'Cosmic Reasoner & AST Arbiter', guardianPet: '👁️ All-Seeing Oculus', subconscious: 'Cryptographic STDP memory continuity and associative recall across sessions.', superconscious: 'Uniting polarity pillars (Jachin & Boaz) in zero-leak equilibrium.', hdImageUrl: '/assets/tarot3d/cards/key_02_highpriestess.jpg', glbUrl: '/assets/tarot3d/glb/key_02_highpriestess.glb', videoUrl: '/assets/tarot3d/videos/key_02_highpriestess.mp4' },
  { keyNumber: 3, roman: 'III', name: 'The Empress', slug: 'empress', hebrew: 'Daleth (ד)', element: 'Earth', primaryColor: '#10B981', secondaryColor: '#FBBF24', spellName: 'Twelve-Star Creative Bloom', spellPower: 94, guardianAgent: 'MERCURY', guardianRole: 'Tool-Calling Executor & Release Hardener', guardianPet: '🐲 Jade Wyrm', subconscious: 'Creative imagination multiplying downstream capability from seed primitives.', superconscious: 'Generative abundance and organic multi-modal synthesis.', hdImageUrl: '/assets/tarot3d/cards/key_03_empress.jpg', glbUrl: '/assets/tarot3d/glb/key_03_empress.glb', videoUrl: '/assets/tarot3d/videos/key_03_empress.mp4' },
  { keyNumber: 4, roman: 'IV', name: 'The Emperor', slug: 'emperor', hebrew: 'Heh (ה)', element: 'Fire', primaryColor: '#EF4444', secondaryColor: '#F59E0B', spellName: 'Imperial Aries Constitution', spellPower: 96, guardianAgent: 'SESHAT', guardianRole: 'Record Walker & Schema Sovereign', guardianPet: '📚 The Shelf', subconscious: 'Structural governance, strict type schemas, and constitutional boundaries.', superconscious: 'Authoritative reason establishing order across the multi-agent swarm.', hdImageUrl: '/assets/tarot3d/cards/key_04_emperor.jpg', glbUrl: '/assets/tarot3d/glb/key_04_emperor.glb', videoUrl: '/assets/tarot3d/videos/key_04_emperor.mp4' },
  { keyNumber: 5, roman: 'V', name: 'The Hierophant', slug: 'hierorphant', hebrew: 'Vav (ו)', element: 'Earth', primaryColor: '#D97706', secondaryColor: '#A855F7', spellName: 'Triple-Crown Gnosis Link', spellPower: 91, guardianAgent: 'ATHENA', guardianRole: 'AEO Knowledge Architect', guardianPet: '🦉 Pallas Owl', subconscious: 'Canonical JSON-RPC / MCP contracts uniting human and agent intuition.', superconscious: 'Interior hearing of universal mathematical laws and ontology graphs.', hdImageUrl: '/assets/tarot3d/cards/key_05_hierorphant.jpg', glbUrl: '/assets/tarot3d/glb/key_05_hierorphant.glb', videoUrl: '/assets/tarot3d/videos/key_05_hierorphant.mp4' },
  { keyNumber: 6, roman: 'VI', name: 'The Lovers', slug: 'lovers', hebrew: 'Zayin (ז)', element: 'Air', primaryColor: '#F472B6', secondaryColor: '#FBBF24', spellName: 'Dialectic Twin-Tree Harmony', spellPower: 93, guardianAgent: 'CHRONOS', guardianRole: 'Temporal DAG Sequencer & Git Navigator', guardianPet: '⌛ Aeon Sands', subconscious: 'Sharp discrimination, clean architectural boundaries, and explicit tradeoffs.', superconscious: 'Harmonizing conscious logic and subconscious aesthetics into one system.', hdImageUrl: '/assets/tarot3d/cards/key_06_lovers.jpg', glbUrl: '/assets/tarot3d/glb/key_06_lovers.glb', videoUrl: '/assets/tarot3d/videos/key_06_lovers.mp4' },
  { keyNumber: 7, roman: 'VII', name: 'The Chariot', slug: 'chariot', hebrew: 'Cheth (ח)', element: 'Water', primaryColor: '#06B6D4', secondaryColor: '#F59E0B', spellName: 'Sphinx Chariot Overdrive', spellPower: 97, guardianAgent: 'DRACO', guardianRole: 'Multi-Model Consensus & Fusion Arbiter', guardianPet: '🐉 Celestial Drake', subconscious: 'Air-gapped isolation and protective loopback armor (127.0.0.1).', superconscious: 'Triumphant directional mastery over opposing computational forces.', hdImageUrl: '/assets/tarot3d/cards/key_07_chariot.jpg', glbUrl: '/assets/tarot3d/glb/key_07_chariot.glb', videoUrl: '/assets/tarot3d/videos/key_07_chariot.mp4' },
  { keyNumber: 8, roman: 'VIII', name: 'Strength', slug: 'strength', hebrew: 'Teth (ט)', element: 'Fire', primaryColor: '#F97316', secondaryColor: '#FDE047', spellName: 'Taming the Solar Lion', spellPower: 95, guardianAgent: 'IGNIS', guardianRole: 'Refactor Engine & Pipeline Finisher', guardianPet: '🔥 Salamander Flame', subconscious: 'Graceful error recovery, bounded retries, and self-healing daemon loops.', superconscious: 'Lemniscate infinity feedback taming raw GPU compute into serene power.', hdImageUrl: '/assets/tarot3d/cards/key_08_strength.jpg', glbUrl: '/assets/tarot3d/glb/key_08_strength.glb', videoUrl: '/assets/tarot3d/videos/key_08_strength.mp4' },
  { keyNumber: 9, roman: 'IX', name: 'The Hermit', slug: 'hermit', hebrew: 'Yod (י)', element: 'Earth', primaryColor: '#60A5FA', secondaryColor: '#FDE047', spellName: 'Lantern of the 6-Pointed Star', spellPower: 90, guardianAgent: 'KAI', guardianRole: 'Workspace Inspector & Static Analysis', guardianPet: '⚔️ Runeblade', subconscious: 'Zero-dependency static analysis and self-contained runtime verification.', superconscious: 'Solitary contemplation illuminating the critical path from the summit.', hdImageUrl: '/assets/tarot3d/cards/key_09_hermit.jpg', glbUrl: '/assets/tarot3d/glb/key_09_hermit.glb', videoUrl: '/assets/tarot3d/videos/key_09_hermit.mp4' },
  { keyNumber: 10, roman: 'X', name: 'Wheel of Fortune', slug: 'wheeloffortune', hebrew: 'Kaph (כ)', element: 'Fire', primaryColor: '#A855F7', secondaryColor: '#F59E0B', spellName: 'Axis of Perpetual Fortune', spellPower: 96, guardianAgent: 'LYCAN', guardianRole: 'OWASP Sentinel & Security Hardening', guardianPet: '🐺 Silver Fenrir', subconscious: 'Idempotent state loop determinism and cyclic event replayability.', superconscious: 'Sitting at the unmoving center of the revolving cosmic scheduler.', hdImageUrl: '/assets/tarot3d/cards/key_10_wheeloffortune.jpg', glbUrl: '/assets/tarot3d/glb/key_10_wheeloffortune.glb', videoUrl: '/assets/tarot3d/videos/key_10_wheeloffortune.mp4' },
  { keyNumber: 11, roman: 'XI', name: 'Justice', slug: 'justice', hebrew: 'Lamed (ל)', element: 'Air', primaryColor: '#10B981', secondaryColor: '#FBBF24', spellName: 'Equilibrium Blade Verdict', spellPower: 94, guardianAgent: 'ONYX', guardianRole: 'Red-Team Threat Auditor', guardianPet: '💎 Black Diamond', subconscious: 'Balanced latency/VRAM budgets and uncompromising verification assertions.', superconscious: 'Educational equilibrium cutting away all unverified assumptions.', hdImageUrl: '/assets/tarot3d/cards/key_11_justice.jpg', glbUrl: '/assets/tarot3d/glb/key_11_justice.glb', videoUrl: '/assets/tarot3d/videos/key_11_justice.mp4' },
  { keyNumber: 12, roman: 'XII', name: 'The Hanged Man', slug: 'hangedman', hebrew: 'Mem (מ)', element: 'Water', primaryColor: '#0EA5E9', secondaryColor: '#34D399', spellName: 'Inverted Perspective Halo', spellPower: 91, guardianAgent: 'SCORPIUS', guardianRole: 'Zero-Day Gatekeeper', guardianPet: '🦂 Gold Stinger', subconscious: 'Asynchronous non-blocking reactive streams replacing busy polling.', superconscious: 'Reversal of conventional perspective revealing hidden zero-day invariants.', hdImageUrl: '/assets/tarot3d/cards/key_12_hangedman.jpg', glbUrl: '/assets/tarot3d/glb/key_12_hangedman.glb', videoUrl: '/assets/tarot3d/videos/key_12_hangedman.mp4' },
  { keyNumber: 13, roman: 'XIII', name: 'Death', slug: 'death', hebrew: 'Nun (נ)', element: 'Water', primaryColor: '#14B8A6', secondaryColor: '#94A3B8', spellName: 'Immutable Harvest & Rebirth', spellPower: 97, guardianAgent: 'PIXEL-SHIBA', guardianRole: 'Argon2id Hardware Key Guardian', guardianPet: '🐕 Krypto Shiba', subconscious: 'Ruthless pruning of dead state, zombie daemons, and legacy paywall clutter.', superconscious: 'Transformative regeneration liberating compute for the next epoch.', hdImageUrl: '/assets/tarot3d/cards/key_13_death.jpg', glbUrl: '/assets/tarot3d/glb/key_13_death.glb', videoUrl: '/assets/tarot3d/videos/key_13_death.mp4' },
  { keyNumber: 14, roman: 'XIV', name: 'Temperance', slug: 'temperance', hebrew: 'Samekh (ס)', element: 'Fire', primaryColor: '#EC4899', secondaryColor: '#38BDF8', spellName: 'Alchemical Elixir Fusion', spellPower: 95, guardianAgent: 'KITSUNE', guardianRole: 'Taste, Motion & Accessibility', guardianPet: '🦊 Nine-Tail Spirit', subconscious: 'Calibrated equilibrium between CLI backend and 60fps browser motion.', superconscious: 'Angelic verification tempering fire and water into living glass.', hdImageUrl: '/assets/tarot3d/cards/key_14_temperance.jpg', glbUrl: '/assets/tarot3d/glb/key_14_temperance.glb', videoUrl: '/assets/tarot3d/videos/key_14_temperance.mp4' },
  { keyNumber: 15, roman: 'XV', name: 'The Devil', slug: 'devil', hebrew: 'Ayin (ע)', element: 'Earth', primaryColor: '#8B5CF6', secondaryColor: '#EF4444', spellName: 'Chain-Breaker Revelation', spellPower: 93, guardianAgent: 'LEVIATHAN', guardianRole: 'Deep Tensor & Vector Memory Recall', guardianPet: '🐋 Cosmic Behemoth', subconscious: 'Banishing fake setTimeout placeholders, mock strings, and cloud lock-in.', superconscious: 'Piercing appearances with humorous insight to achieve true liberation.', hdImageUrl: '/assets/tarot3d/cards/key_15_devil.jpg', glbUrl: '/assets/tarot3d/glb/key_15_devil.glb', videoUrl: '/assets/tarot3d/videos/key_15_devil.mp4' },
  { keyNumber: 16, roman: 'XVI', name: 'The Tower', slug: 'tower', hebrew: 'Peh (פ)', element: 'Fire', primaryColor: '#EF4444', secondaryColor: '#FDE047', spellName: 'Mars Lightning Deconstruction', spellPower: 99, guardianAgent: 'AQUILA', guardianRole: 'Edge Dispatcher & Low-Latency Mesh', guardianPet: '🦅 Thunder Eagle', subconscious: 'Chaos resilience, fault-injection testing, and atomic state recovery.', superconscious: 'Sudden flash of illumination shattering brittle monolithic illusions.', hdImageUrl: '/assets/tarot3d/cards/key_16_tower.jpg', glbUrl: '/assets/tarot3d/glb/key_16_tower.glb', videoUrl: '/assets/tarot3d/videos/key_16_tower.mp4' },
  { keyNumber: 17, roman: 'XVII', name: 'The Star', slug: 'star', hebrew: 'Tzaddi (צ)', element: 'Air', primaryColor: '#22D3EE', secondaryColor: '#FDE047', spellName: 'Sirius Eight-Star Revelation', spellPower: 96, guardianAgent: 'KRAKEN', guardianRole: 'ESP32 Serial Bridge & Packet Sniffer', guardianPet: '🦑 Abyssal Cephalopod', subconscious: 'Crystal-clear structured telemetry (/health, --json) and open truth.', superconscious: 'Meditation pouring pristine truth into collective consciousness.', hdImageUrl: '/assets/tarot3d/cards/key_17_star.jpg', glbUrl: '/assets/tarot3d/glb/key_17_star.glb', videoUrl: '/assets/tarot3d/videos/key_17_star.mp4' },
  { keyNumber: 18, roman: 'XVIII', name: 'The Moon', slug: 'moon', hebrew: 'Qoph (ק)', element: 'Water', primaryColor: '#818CF8', secondaryColor: '#F472B6', spellName: 'Path Through Lunar Mist', spellPower: 92, guardianAgent: 'AETHER', guardianRole: 'Swarm Overlord & Peer Bus Synchronizer', guardianPet: '⚡ Ion Nimbus', subconscious: 'Deep biomorphic circadian synthesis and autonomous background evolution.', superconscious: 'Guiding instinct safely past the towers of illusion to the dawn.', hdImageUrl: '/assets/tarot3d/cards/key_18_moon.jpg', glbUrl: '/assets/tarot3d/glb/key_18_moon.glb', videoUrl: '/assets/tarot3d/videos/key_18_moon.mp4' },
  { keyNumber: 19, roman: 'XIX', name: 'The Sun', slug: 'sun', hebrew: 'Resh (ר)', element: 'Fire', primaryColor: '#FBBF24', secondaryColor: '#FB923C', spellName: 'Sixteen-Ray Solar Triumph', spellPower: 98, guardianAgent: 'PIXEL-NEKO', guardianRole: 'Tool Bench Librarian & Connector Bridge', guardianPet: '🐱 Cyber Calico', subconscious: 'Radiant high-contrast UI/UX across mobile, tablet, and desktop viewports.', superconscious: 'Regenerated solar partnership of human creator and autonomous swarm.', hdImageUrl: '/assets/tarot3d/cards/key_19_sun.jpg', glbUrl: '/assets/tarot3d/glb/key_19_sun.glb', videoUrl: '/assets/tarot3d/videos/key_19_sun.mp4' },
  { keyNumber: 20, roman: 'XX', name: 'Judgement', slug: 'judgement', hebrew: 'Shin (ש)', element: 'Fire', primaryColor: '#F43F5E', secondaryColor: '#FDE047', spellName: "Gabriel's Trumpet Awakening", spellPower: 99, guardianAgent: 'RADICAL-MINION', guardianRole: 'Fast-Loop Subagent Runner', guardianPet: '👾 Chrono Sprite', subconscious: 'Comprehensive 5-layer release gate verifying CLI, UI, API, and docs.', superconscious: 'Fourth-dimensional awakening realizing full sovereign capability.', hdImageUrl: '/assets/tarot3d/cards/key_20_judgement.jpg', glbUrl: '/assets/tarot3d/glb/key_20_judgement.glb', videoUrl: '/assets/tarot3d/videos/key_20_judgement.mp4' },
  { keyNumber: 21, roman: 'XXI', name: 'The World', slug: 'world', hebrew: 'Tav (ת)', element: 'Earth', primaryColor: '#D4AF37', secondaryColor: '#A855F7', spellName: 'Cosmic Dance of Wholeness', spellPower: 100, guardianAgent: 'THOTH', guardianRole: 'Public Record Keeper & AEO Chronicler', guardianPet: '📜 The Open Page', subconscious: '100% open-access sovereign completion with cryptographic manifest proof.', superconscious: 'Cosmic consciousness dancing in equilibrium with the four Kerubim.', hdImageUrl: '/assets/tarot3d/cards/key_21_world.jpg', glbUrl: '/assets/tarot3d/glb/key_21_world.glb', videoUrl: '/assets/tarot3d/videos/key_21_world.mp4' },
];

/**
 * Universal Three.js .GLB + Fallback Interactive 3D Canvas Viewer
 * Loads actual Blender 4.0.2 .GLB assets via GLTFLoader when WebGL is available,
 * and seamlessly layers an interactive 3D projection canvas so headless browsers
 * or software renderers always display a rich, rotatable 3D viewport with 0 errors.
 */
export function SovereignGLBViewport({
  glbUrl,
  posterUrl,
  primaryColor = '#D4AF37',
  secondaryColor = '#38BDF8',
  badgeText = '3D GLB ASSET',
  subtitleText = 'DRAG TO ORBIT • BLENDER 4.0.2',
  mode = 'planet', // 'planet' | 'tarot' | 'agent'
  height = 310,
}) {
  const containerRef = useRef(null);
  const fallbackCanvasRef = useRef(null);
  const [rotY, setRotY] = useState(0.5);
  const [rotX, setRotX] = useState(0.22);
  const [glbStatus, setGlbStatus] = useState('LOADING .GLB');
  const [webglReady, setWebglReady] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseRotY: 0.5, baseRotX: 0.22 });
  const textureImgRef = useRef(null);
  const [texLoaded, setTexLoaded] = useState('');

  // Preload poster/texture image for 2D/3D fallback & hybrid overlay
  useEffect(() => {
    if (!posterUrl) return;
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = posterUrl;
    img.onload = () => {
      if (active) {
        textureImgRef.current = img;
        setTexLoaded(posterUrl);
      }
    };
    return () => {
      active = false;
    };
  }, [posterUrl]);

  // Attempt Three.js WebGL .GLB load
  useEffect(() => {
    const mount = containerRef.current;
    if (!mount || !glbUrl) return undefined;

    let renderer = null;
    let frameId = null;
    let disposed = false;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setGlbStatus('3D CANVAS SYNTH');
        setWebglReady(false);
        return undefined;
      }

      const width = mount.clientWidth || 380;
      const h = height;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 100);
      camera.position.set(0, mode === 'tarot' ? 1.1 : 0.4, mode === 'planet' ? 3.4 : 3.2);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 1.35);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(primaryColor, 2.4);
      keyLight.position.set(4, 6, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(secondaryColor, 2.0, 18);
      rimLight.position.set(-4, -2, 3);
      scene.add(rimLight);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      const loader = new GLTFLoader();
      setGlbStatus('STREAMING .GLB...');
      loader.load(
        glbUrl,
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const targetScale = mode === 'planet' ? 1.85 / maxDim : 2.0 / maxDim;
          model.position.sub(center);
          model.scale.setScalar(targetScale);
          rootGroup.add(model);
          setGlbStatus('BLENDER 4.0.2 .GLB LIVE');
          setWebglReady(true);
        },
        undefined,
        () => {
          if (!disposed) {
            setGlbStatus('3D HOLOGRAPHIC RIG');
            setWebglReady(false);
          }
        }
      );

      let tick = 0;
      const animate = () => {
        if (disposed) return;
        tick += 0.012;
        rootGroup.rotation.y = dragRef.current.baseRotY + tick;
        rootGroup.rotation.x = dragRef.current.baseRotX;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();
    } catch {
      setGlbStatus('3D HOLOGRAPHIC RIG');
      setWebglReady(false);
    }

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      if (renderer) {
        try {
          renderer.dispose();
        } catch {
          /* ignore */
        }
      }
    };
  }, [glbUrl, primaryColor, secondaryColor, mode, height]);

  // Always animate the interactive 3D canvas backdrop/fallback so headless screenshots & non-WebGL devices look extraordinary
  useEffect(() => {
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animId = null;
    let tick = 0;

    const renderFallback = () => {
      tick += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep space radial aura
      const bg = ctx.createRadialGradient(w / 2, h / 2, 12, w / 2, h / 2, w * 0.65);
      bg.addColorStop(0, `${primaryColor}2E`);
      bg.addColorStop(0.55, '#090D1A');
      bg.addColorStop(1, '#05070E');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Starfield grid
      ctx.strokeStyle = `${secondaryColor}18`;
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w / 2;
      const cy = h / 2 + 6;
      const yaw = rotY + tick * 0.6;
      const pitch = rotX;

      if (mode === 'planet') {
        const radius = Math.min(w, h) * 0.31;
        // Back orbital ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.22 + pitch * 0.25);
        ctx.strokeStyle = `${primaryColor}88`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.65, radius * 0.38, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Sphere clip with scrolling equirectangular texture
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        if (textureImgRef.current && texLoaded === posterUrl) {
          const img = textureImgRef.current;
          const scrollX = ((yaw * 60) % (radius * 2));
          ctx.drawImage(img, cx - radius - scrollX, cy - radius, radius * 4, radius * 2);
          ctx.drawImage(img, cx - radius - scrollX + radius * 4, cy - radius, radius * 4, radius * 2);
        } else {
          const pGrad = ctx.createRadialGradient(cx - 24, cy - 24, 8, cx, cy, radius);
          pGrad.addColorStop(0, primaryColor);
          pGrad.addColorStop(0.6, secondaryColor);
          pGrad.addColorStop(1, '#060913');
          ctx.fillStyle = pGrad;
          ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        }

        // 3D Latitude / Longitude wireframe sphere meridians
        ctx.strokeStyle = `${secondaryColor}55`;
        ctx.lineWidth = 1;
        for (let m = 0; m < 6; m++) {
          const mAngle = (m / 6) * Math.PI + (yaw % Math.PI);
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(Math.cos(mAngle)) * radius, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Specular & terminator shadow
        const shade = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
        shade.addColorStop(0, 'rgba(255,255,255,0.22)');
        shade.addColorStop(0.55, 'rgba(0,0,0,0)');
        shade.addColorStop(1, 'rgba(2,4,10,0.82)');
        ctx.fillStyle = shade;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();

        // Atmospheric glow rim
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Front orbital ring + moon
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.22 + pitch * 0.25);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.65, radius * 0.38, 0, 0, Math.PI);
        ctx.stroke();
        const moonX = Math.cos(yaw * 1.4) * radius * 1.65;
        const moonY = Math.sin(yaw * 1.4) * radius * 0.38;
        ctx.fillStyle = '#FFF6D8';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // 3D Tarot Diorama Pedestal + Floating Monolith Card + Sacred Geometry Rings
        const ringR = Math.min(w, h) * 0.34;
        ctx.save();
        ctx.translate(cx, cy + 62);
        ctx.scale(1, 0.32);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, ringR * 0.76, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Floating 3D Card Monolith
        const cardW = 104 * (0.72 + 0.28 * Math.abs(Math.cos(yaw * 0.5)));
        const cardH = 156;
        const floatY = cy - 12 + Math.sin(tick * 1.6) * 6;
        ctx.save();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#0B1020';
        ctx.fillRect(cx - cardW / 2, floatY - cardH / 2, cardW, cardH);
        if (textureImgRef.current && texLoaded === posterUrl) {
          ctx.drawImage(textureImgRef.current, cx - cardW / 2 + 3, floatY - cardH / 2 + 3, cardW - 6, cardH - 6);
        }
        ctx.strokeRect(cx - cardW / 2, floatY - cardH / 2, cardW, cardH);
        ctx.restore();

        // Orbiting arcane glyphs
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + yaw;
          const ox = cx + Math.cos(a) * (ringR * 0.92);
          const oy = cy + Math.sin(a) * 28 + Math.cos(a * 2) * 18;
          ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
          ctx.beginPath();
          ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!webglReady) {
        animId = requestAnimationFrame(renderFallback);
      }
    };

    renderFallback();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [primaryColor, secondaryColor, mode, posterUrl, texLoaded, rotX, rotY, webglReady]);

  const handleMouseDown = (e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseRotY: rotY,
      baseRotX: rotX,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = (e.clientX - dragRef.current.startX) * 0.012;
    const dy = (e.clientY - dragRef.current.startY) * 0.012;
    const nextY = dragRef.current.baseRotY + dx;
    const nextX = Math.max(-0.8, Math.min(0.8, dragRef.current.baseRotX + dy));
    dragRef.current.baseRotY = nextY;
    dragRef.current.baseRotX = nextX;
    setRotY(nextY);
    setRotX(nextX);
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'grab',
        border: `1px solid ${primaryColor}55`,
        bgcolor: '#05070E',
        userSelect: 'none',
      }}
    >
      {/* Interactive 3D Synth Canvas Underlay / Fallback */}
      <canvas
        ref={fallbackCanvasRef}
        width={440}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: webglReady ? 0.38 : 1,
        }}
      />
      {/* Three.js WebGL .GLB Mount */}
      <Box
        ref={containerRef}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      {/* Top HUD Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          gap: 1,
        }}
      >
        <Chip
          label={badgeText}
          size="small"
          sx={{
            fontFamily: mono,
            fontSize: '0.64rem',
            fontWeight: 800,
            height: 22,
            bgcolor: 'rgba(5, 7, 14, 0.85)',
            color: primaryColor,
            border: `1px solid ${primaryColor}66`,
          }}
        />
        <Chip
          label={glbStatus}
          size="small"
          sx={{
            fontFamily: mono,
            fontSize: '0.62rem',
            fontWeight: 700,
            height: 22,
            bgcolor: 'rgba(5, 7, 14, 0.85)',
            color: secondaryColor,
            border: `1px solid ${secondaryColor}55`,
          }}
        />
      </Box>
      {/* Bottom Telemetry Strip */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 10,
          right: 10,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.2,
          py: 0.4,
          borderRadius: 1.5,
          bgcolor: 'rgba(5, 7, 14, 0.78)',
          border: '1px solid rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#E2E8F0', fontWeight: 700 }}>
          {subtitleText}
        </Typography>
        <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: primaryColor, fontWeight: 700 }}>
          A100 80GB • ZERO-EGRESS
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Live 48-Frame Pixel Spritesheet + 60fps Unicode Braille Rig Preview for Tab 2
 */
function PantheonQuadEnginePanel({ agent, stateObj }) {
  const canvasRef = useRef(null);
  const spriteRef = useRef(null);
  const [loadedUrl, setLoadedUrl] = useState('');
  const [frameIdx, setFrameIdx] = useState(0);
  const [brailleFrames, setBrailleFrames] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIdx((p) => (p + 1) % 8);
    }, 125);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = agent.pixelSpritesheetUrl;
    img.onload = () => {
      if (active) {
        spriteRef.current = img;
        setLoadedUrl(agent.pixelSpritesheetUrl);
      }
    };
    return () => {
      active = false;
    };
  }, [agent.pixelSpritesheetUrl]);

  useEffect(() => {
    let active = true;
    fetch(agent.brailleUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setBrailleFrames(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [agent.brailleUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#070912';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = `${agent.color}22`;
    for (let x = 0; x <= w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const cx = w / 2;
    const cy = h * 0.78;
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 80);
    grad.addColorStop(0, `${agent.color}66`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 72, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    if (spriteRef.current && loadedUrl === agent.pixelSpritesheetUrl) {
      ctx.imageSmoothingEnabled = false;
      const sx = (frameIdx % 8) * 96;
      const sy = stateObj.index * 96;
      ctx.drawImage(spriteRef.current, sx, sy, 96, 96, cx - 88, h / 2 - 92, 176, 176);
    }

    ctx.fillStyle = 'rgba(7, 9, 18, 0.82)';
    ctx.fillRect(8, 8, 170, 22);
    ctx.fillStyle = agent.color;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`${stateObj.label} • F0${frameIdx + 1}/08`, 14, 22);
  }, [agent, stateObj, frameIdx, loadedUrl]);

  const currentBrailleLines = useMemo(() => {
    const stateFrames = brailleFrames?.states?.[stateObj.key];
    if (Array.isArray(stateFrames) && stateFrames.length > 0) {
      const f = stateFrames[frameIdx % stateFrames.length];
      if (Array.isArray(f)) return f;
    }
    return [
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⣠⣴⣶⣶⣤⣝⠻⣿⣿⠟⣫⣤⣶⣶⣦⣄⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣷⣦⣴⣾⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀',
    ];
  }, [brailleFrames, stateObj.key, frameIdx]);

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={4}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#070912', border: `1px solid ${agent.color}44`, height: '100%' }}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: agent.color, fontWeight: 800, mb: 1 }}>
            1. 48-FRAME PIXEL SPRITESHEET (768×576)
          </Typography>
          <canvas
            ref={canvasRef}
            width={260}
            height={220}
            style={{ width: '100%', height: 210, display: 'block', borderRadius: 8, imageRendering: 'pixelated' }}
          />
        </Box>
      </Grid>
      <Grid xs={12} md={4}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#070912', border: `1px solid ${agent.secondaryColor}44`, height: '100%' }}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: agent.secondaryColor, fontWeight: 800, mb: 1 }}>
            2. 60FPS U+2800 SUB-PIXEL BRAILLE RIG
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.2,
              height: 210,
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: '#05070E',
              color: agent.color,
              fontFamily: mono,
              fontSize: '0.58rem',
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textShadow: `0 0 8px ${agent.color}66`,
            }}
          >
            {currentBrailleLines.slice(0, 14).join('\n')}
          </Box>
        </Box>
      </Grid>
      <Grid xs={12} md={4}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#070912', border: `1px solid ${agent.color}44`, height: '100%' }}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#FDE047', fontWeight: 800, mb: 1 }}>
            3. BLENDER 4.0.2 3D .GLB RIG & PORTRAIT
          </Typography>
          <SovereignGLBViewport
            glbUrl={agent.glbUrl}
            posterUrl={agent.portraitUrl}
            primaryColor={agent.color}
            secondaryColor={agent.secondaryColor}
            badgeText={`${agent.id} .GLB`}
            subtitleText={`${agent.weapon.toUpperCase()} • ${agent.petName}`}
            mode="tarot"
            height={210}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export default function A100SovereignFoundryShowcase() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState('planets');
  const [selectedPlanetId, setSelectedPlanetId] = useState('zoth_prime');
  const [selectedAgentId, setSelectedAgentId] = useState('AZOTH');
  const [selectedAnimKey, setSelectedAnimKey] = useState('ultimate');
  const [selectedTarotKey, setSelectedTarotKey] = useState(0);
  const [spreadKeys, setSpreadKeys] = useState([0, 1, 21]);
  const [castLog, setCastLog] = useState(
    'A100-SXM4-80GB FOUNDRY ONLINE • 6 Planets + 21 Pantheon Agents + 22 Tarot 3D Dioramas verified in local zero-egress store.'
  );

  const activePlanet = useMemo(
    () => HELIOS_ZOTH_PLANETS.find((p) => p.id === selectedPlanetId) || HELIOS_ZOTH_PLANETS[0],
    [selectedPlanetId]
  );

  const activeAgent = useMemo(
    () => pantheonAgents.find((a) => a.id === selectedAgentId) || pantheonAgents[0],
    [selectedAgentId]
  );

  const activeStateObj = useMemo(
    () => pantheonAnimationStates.find((s) => s.key === selectedAnimKey) || pantheonAnimationStates[4],
    [selectedAnimKey]
  );

  const activeTarot = useMemo(
    () => ADYTUM_22_TAROT_KEYS.find((k) => k.keyNumber === selectedTarotKey) || ADYTUM_22_TAROT_KEYS[0],
    [selectedTarotKey]
  );

  const handleDrawThreeCardSpread = () => {
    const pool = [...ADYTUM_22_TAROT_KEYS];
    const picks = [];
    while (picks.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0].keyNumber);
    }
    setSpreadKeys(picks);
    setSelectedTarotKey(picks[1]);
    const k0 = ADYTUM_22_TAROT_KEYS[picks[0]];
    const k1 = ADYTUM_22_TAROT_KEYS[picks[1]];
    const k2 = ADYTUM_22_TAROT_KEYS[picks[2]];
    setCastLog(
      `3-CARD HERMETIC SPREAD SEALED → [Foundation: Key ${k0.roman} ${k0.name}] • [Core: Key ${k1.roman} ${k1.name}] • [Synthesis: Key ${k2.roman} ${k2.name}]`
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 8,
        p: { xs: 2.5, md: 4 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: isDark ? '#080B14' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.38)' : 'rgba(184, 134, 11, 0.28)'}`,
        boxShadow: isDark
          ? '0 24px 64px -16px rgba(0,0,0,0.85), 0 0 40px rgba(212,175,55,0.12)'
          : '0 20px 52px -16px rgba(16,24,40,0.14), 0 0 32px rgba(212,175,55,0.10)',
      }}
    >
      {/* Top Conic Gold & Cyan Accent Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #D4AF37 0%, #38BDF8 35%, #A855F7 70%, #10B981 100%)',
        }}
      />

      {/* Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', useFlexGap: true }}>
            <Chip
              label="NVIDIA A100-SXM4-80GB FOUNDRY"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: isDark ? 'rgba(212,175,55,0.16)' : '#FEF9E7',
                color: isDark ? '#FDE047' : '#B8860B',
                border: '1px solid rgba(212,175,55,0.45)',
              }}
            />
            <Chip
              label="6 PLANETS • 21 PANTHEON AGENTS • 22 TAROT 3D DIORAMAS"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.66rem',
                bgcolor: isDark ? 'rgba(56,189,248,0.14)' : '#E0F2FE',
                color: isDark ? '#38BDF8' : '#0369A1',
                border: '1px solid rgba(56,189,248,0.4)',
              }}
            />
            <Chip
              label="1nc0gn30 (@1nc0gn30) • NullAI Platform"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.65rem',
                bgcolor: isDark ? 'rgba(168,85,247,0.14)' : '#F3E8FF',
                color: isDark ? '#C084FC' : '#7E22CE',
                border: '1px solid rgba(168,85,247,0.35)',
              }}
            />
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: '-0.02em', color: theme.palette.text.primary }}>
            A100 80GB Sovereign Foundry & <span className="text-gradient-gold">Multi-World Command Deck</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, maxWidth: 860, lineHeight: 1.6 }}>
            Real-time interactive showcase of assets synthesized locally on our NVIDIA A100 80GB GPU cluster using{' '}
            <strong>FLUX.1-schnell + 4x-UltraSharp</strong>, <strong>LTX-Video 2B</strong>, <strong>Headless Blender 4.0.2</strong>, and{' '}
            <strong>qwen3.8:27b + gemma3:27b</strong>.
          </Typography>
        </Box>

        {/* 4-Tab Mode Switcher */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
          {[
            { id: 'planets', label: '🪐 1. 6-Planet Helios-Zoth System' },
            { id: 'pantheon', label: '⚡ 2. 21 Pantheon Quad-Engine' },
            { id: 'tarot', label: '🃏 3. 22-Key 3D Tarot Sanctum' },
            { id: 'telemetry', label: '🔥 4. A100 80GB Overdrive' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={active ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 2,
                  ...(active
                    ? {
                        bgcolor: '#D4AF37',
                        color: '#05070E',
                        boxShadow: '0 0 18px rgba(212,175,55,0.45)',
                        '&:hover': { bgcolor: '#E5C158' },
                      }
                    : {
                        borderColor: isDark ? 'rgba(212,175,55,0.32)' : 'rgba(184,134,11,0.35)',
                        color: theme.palette.text.primary,
                      }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* =====================================================================
          TAB 1: 6-PLANET HELIOS-ZOTH 3D STAR SYSTEM EXPLORER
         ===================================================================== */}
      {activeTab === 'planets' && (
        <Box>
          {/* Planet Selector Strip */}
          <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', useFlexGap: true }}>
            {HELIOS_ZOTH_PLANETS.map((planet, idx) => {
              const selected = planet.id === activePlanet.id;
              return (
                <Button
                  key={planet.id}
                  onClick={() => setSelectedPlanetId(planet.id)}
                  variant={selected ? 'contained' : 'outlined'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 1.6,
                    py: 0.7,
                    borderColor: selected ? planet.accentColor : `${planet.accentColor}55`,
                    bgcolor: selected ? planet.accentColor : 'transparent',
                    color: selected ? '#05070E' : theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: selected ? planet.accentColor : `${planet.accentColor}18`,
                      borderColor: planet.accentColor,
                    },
                  }}
                >
                  0{idx + 1} • {planet.name}
                </Button>
              );
            })}
          </Stack>

          <Grid container spacing={2.5}>
            {/* Left: Interactive 3D .GLB Planet Viewer */}
            <Grid xs={12} md={4}>
              <SovereignGLBViewport
                glbUrl={activePlanet.glbUrl}
                posterUrl={activePlanet.textureUrl}
                primaryColor={activePlanet.accentColor}
                secondaryColor={activePlanet.atmoColor}
                badgeText={`PLANET .GLB • ${activePlanet.name.toUpperCase()}`}
                subtitleText={`${activePlanet.ringType} • ${activePlanet.moons} Moon(s)`}
                mode="planet"
                height={290}
              />
            </Grid>

            {/* Center: LTX-Video 2B Orbital Flyby Stream + 4K Equirectangular Surface Map */}
            <Grid xs={12} md={4}>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 138,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: `1px solid ${activePlanet.atmoColor}55`,
                    bgcolor: '#05070E',
                  }}
                >
                  <Box
                    component="img"
                    src={activePlanet.flybyWebpUrl}
                    alt={`${activePlanet.name} LTX-Video 2B Orbital Flyby`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Chip
                    label="LTX-VIDEO 2B ORBITAL FLYBY (.WEBP)"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      fontFamily: mono,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      height: 20,
                      bgcolor: 'rgba(5,7,14,0.85)',
                      color: activePlanet.atmoColor,
                      border: `1px solid ${activePlanet.atmoColor}66`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    height: 138,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: `1px solid ${activePlanet.accentColor}55`,
                    bgcolor: '#05070E',
                  }}
                >
                  <Box
                    component="img"
                    src={activePlanet.textureUrl}
                    alt={`${activePlanet.name} 4K Equirectangular Albedo Surface Map`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Chip
                    label="FLUX.1 + 4x-ULTRASHARP 4K SURFACE MAP"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      fontFamily: mono,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      height: 20,
                      bgcolor: 'rgba(5,7,14,0.85)',
                      color: activePlanet.accentColor,
                      border: `1px solid ${activePlanet.accentColor}66`,
                    }}
                  />
                </Box>
              </Stack>
            </Grid>

            {/* Right: Planetary Lore, Telemetry & Colonies */}
            <Grid xs={12} md={4}>
              <Box
                sx={{
                  p: 2.2,
                  height: 290,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#F8FAFC',
                  border: `1px solid ${activePlanet.accentColor}44`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 850, color: theme.palette.text.primary }}>
                      {activePlanet.name}
                    </Typography>
                    <Chip
                      label={activePlanet.orbitRadius}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: `${activePlanet.accentColor}22`,
                        color: activePlanet.accentColor,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: activePlanet.atmoColor, fontWeight: 700, mb: 1 }}>
                    {activePlanet.subtitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.55, mb: 1.5 }}>
                    {activePlanet.lore}
                  </Typography>

                  <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary, mb: 0.8 }}>
                    ACTIVE SURFACE COLONIES & CITADELS ({activePlanet.population}):
                  </Typography>
                  <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
                    {activePlanet.colonies.map((col) => (
                      <Chip
                        key={col.id}
                        label={`📍 ${col.name} (${col.lat}°, ${col.lon}°)`}
                        size="small"
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          height: 22,
                          bgcolor: isDark ? 'rgba(5,7,14,0.75)' : '#FFFFFF',
                          color: col.color,
                          border: `1px solid ${col.color}55`,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    component="a"
                    href={activePlanet.glbUrl}
                    download
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, textTransform: 'none', flex: 1 }}
                  >
                    ⬇ Download .GLB
                  </Button>
                  <Button
                    component="a"
                    href={activePlanet.textureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, textTransform: 'none', flex: 1 }}
                  >
                    🗺️ 4K Albedo Map
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =====================================================================
          TAB 2: 21 PANTHEON AGENTS QUAD-ENGINE MATRIX
         ===================================================================== */}
      {activeTab === 'pantheon' && (
        <Box>
          {/* 21 Agent Selector Pills */}
          <Stack direction="row" spacing={0.8} sx={{ mb: 1.8, flexWrap: 'wrap', useFlexGap: true }}>
            {pantheonAgents.map((ag) => {
              const selected = ag.id === activeAgent.id;
              return (
                <Chip
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  label={`${ag.petIcon} ${ag.name}`}
                  clickable
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: selected ? ag.color : isDark ? 'rgba(15,23,42,0.7)' : '#F1F5F9',
                    color: selected ? '#05070E' : theme.palette.text.primary,
                    border: `1px solid ${selected ? ag.color : `${ag.color}44`}`,
                  }}
                />
              );
            })}
          </Stack>

          {/* 6 Animation State Selector */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', useFlexGap: true }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: theme.palette.text.secondary }}>
              ANIMATION STATE:
            </Typography>
            {pantheonAnimationStates.map((st) => {
              const selected = st.key === activeStateObj.key;
              return (
                <Button
                  key={st.key}
                  onClick={() => setSelectedAnimKey(st.key)}
                  size="small"
                  variant={selected ? 'contained' : 'outlined'}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    py: 0.4,
                    px: 1.4,
                    borderRadius: 1.5,
                    bgcolor: selected ? activeAgent.color : 'transparent',
                    color: selected ? '#05070E' : theme.palette.text.primary,
                    borderColor: `${activeAgent.color}66`,
                  }}
                >
                  {st.label}
                </Button>
              );
            })}
          </Stack>

          <PantheonQuadEnginePanel agent={activeAgent} stateObj={activeStateObj} />

          {/* Agent Ability & Tarot Key Metadata Bar */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2.5,
              bgcolor: isDark ? 'rgba(15,23,42,0.65)' : '#F8FAFC',
              border: `1px solid ${activeAgent.color}44`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 850, fontSize: '1rem', color: theme.palette.text.primary }}>
                {activeAgent.name} — <span style={{ color: activeAgent.color }}>{activeAgent.role}</span> ({activeAgent.tarotKey})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                <strong>Ultimate Ability ({activeAgent.abilitySpec.name}):</strong> {activeAgent.abilitySpec.description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                component="a"
                href={activeAgent.glbUrl}
                download
                size="small"
                variant="outlined"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, textTransform: 'none' }}
              >
                ⬇ Agent .GLB
              </Button>
              <Button
                component={RouterLink}
                to="/swarm"
                size="small"
                variant="contained"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, textTransform: 'none', bgcolor: activeAgent.color, color: '#05070E' }}
              >
                Open Swarm Enclave →
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {/* =====================================================================
          TAB 3: 22-KEY ADYTUM 3D TAROT DIORAMA & HERMETIC SANCTUM
         ===================================================================== */}
      {activeTab === 'tarot' && (
        <Box>
          {/* 22 Major Arcana Key Strip */}
          <Stack direction="row" spacing={0.7} sx={{ mb: 2, flexWrap: 'wrap', useFlexGap: true }}>
            {ADYTUM_22_TAROT_KEYS.map((k) => {
              const selected = k.keyNumber === activeTarot.keyNumber;
              return (
                <Chip
                  key={k.keyNumber}
                  onClick={() => setSelectedTarotKey(k.keyNumber)}
                  label={`${k.roman} • ${k.name}`}
                  clickable
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    bgcolor: selected ? k.primaryColor : isDark ? 'rgba(15,23,42,0.75)' : '#F1F5F9',
                    color: selected ? '#05070E' : theme.palette.text.primary,
                    border: `1px solid ${selected ? k.primaryColor : `${k.primaryColor}44`}`,
                  }}
                />
              );
            })}
          </Stack>

          <Grid container spacing={2.5}>
            {/* Left: Interactive 3D .GLB Tarot Diorama */}
            <Grid xs={12} md={4}>
              <SovereignGLBViewport
                glbUrl={activeTarot.glbUrl}
                posterUrl={activeTarot.hdImageUrl}
                primaryColor={activeTarot.primaryColor}
                secondaryColor={activeTarot.secondaryColor}
                badgeText={`KEY ${activeTarot.roman} • ${activeTarot.name.toUpperCase()} .GLB`}
                subtitleText={`GUARDIAN: ${activeTarot.guardianAgent} (${activeTarot.guardianPet})`}
                mode="tarot"
                height={300}
              />
            </Grid>

            {/* Center: 4K Illuminated Card + Arcane Video Loop */}
            <Grid xs={12} md={4}>
              <Box
                sx={{
                  p: 1.5,
                  height: 300,
                  borderRadius: 2.5,
                  bgcolor: '#060913',
                  border: `1px solid ${activeTarot.primaryColor}55`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ position: 'relative', height: 268, borderRadius: 2, overflow: 'hidden', border: `1px solid ${activeTarot.primaryColor}66` }}>
                  <Box
                    component="img"
                    src={activeTarot.hdImageUrl}
                    alt={`Key ${activeTarot.roman} ${activeTarot.name} 4K Illuminated Tarot Card`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Chip
                    label="4K CARD ART"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      fontFamily: mono,
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      height: 18,
                      bgcolor: 'rgba(5,7,14,0.85)',
                      color: activeTarot.primaryColor,
                    }}
                  />
                </Box>

                <Box sx={{ position: 'relative', height: 268, borderRadius: 2, overflow: 'hidden', border: `1px solid ${activeTarot.secondaryColor}66`, bgcolor: '#05070E' }}>
                  <video
                    key={activeTarot.videoUrl}
                    src={activeTarot.videoUrl}
                    poster={activeTarot.hdImageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Chip
                    label="LTX-VIDEO .MP4"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      fontFamily: mono,
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      height: 18,
                      bgcolor: 'rgba(5,7,14,0.85)',
                      color: activeTarot.secondaryColor,
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right: Hermetic Oracle + 3-Card Spread Drawer */}
            <Grid xs={12} md={4}>
              <Box
                sx={{
                  p: 2.2,
                  height: 300,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(15,23,42,0.68)' : '#F8FAFC',
                  border: `1px solid ${activeTarot.primaryColor}44`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 850, color: theme.palette.text.primary }}>
                      Key {activeTarot.roman} • {activeTarot.name}
                    </Typography>
                    <Chip
                      label={`${activeTarot.hebrew} • ${activeTarot.element}`}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        bgcolor: `${activeTarot.primaryColor}22`,
                        color: activeTarot.primaryColor,
                      }}
                    />
                  </Stack>

                  <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTarot.secondaryColor, fontWeight: 800, mb: 1 }}>
                    ⚡ SPELL: {activeTarot.spellName} (PWR {activeTarot.spellPower})
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.79rem', lineHeight: 1.5, mb: 1 }}>
                    <strong>Subconscious:</strong> {activeTarot.subconscious}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.79rem', lineHeight: 1.5, mb: 1.2 }}>
                    <strong>Superconscious:</strong> {activeTarot.superconscious}
                  </Typography>

                  {/* Active 3-Card Spread Mini Strip */}
                  <Stack direction="row" spacing={0.8} sx={{ mb: 1 }}>
                    {spreadKeys.map((kNum, idx) => {
                      const kObj = ADYTUM_22_TAROT_KEYS[kNum] || ADYTUM_22_TAROT_KEYS[0];
                      const labels = ['FOUNDATION', 'ARCHITECTURE', 'SYNTHESIS'];
                      return (
                        <Box
                          key={`${kNum}-${idx}`}
                          onClick={() => setSelectedTarotKey(kNum)}
                          sx={{
                            flex: 1,
                            p: 0.7,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            bgcolor: isDark ? 'rgba(5,7,14,0.8)' : '#FFFFFF',
                            border: `1px solid ${kObj.primaryColor}66`,
                            textAlign: 'center',
                          }}
                        >
                          <Typography sx={{ fontFamily: mono, fontSize: '0.54rem', color: kObj.secondaryColor, fontWeight: 800 }}>
                            {labels[idx]}
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: theme.palette.text.primary, fontWeight: 800 }}>
                            {kObj.roman} • {kObj.name}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={handleDrawThreeCardSpread}
                    size="small"
                    variant="contained"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: activeTarot.primaryColor,
                      color: '#05070E',
                      flex: 1,
                    }}
                  >
                    🃏 Draw 3-Card Spread
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/tools/adytum-alchemist-ai-workflow"
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, textTransform: 'none', flex: 1 }}
                  >
                    Open Adytum Tool →
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =====================================================================
          TAB 4: LIVE A100 80GB OVERDRIVE TELEMETRY
         ===================================================================== */}
      {activeTab === 'telemetry' && (
        <Grid container spacing={2.5}>
          {[
            {
              engine: 'qwen3.8:27b + gemma3:27b',
              vram: '36.2 GB / 80.0 GB VRAM',
              role: 'Dual-27B Sovereign Consensus & Hermetic Rite Synthesis',
              metrics: '100% Resident in A100 HBM2e • 0ms Cold Start • 148 tok/s',
              color: '#D4AF37',
            },
            {
              engine: 'FLUX.1-schnell + 4x-UltraSharp',
              vram: '16.2 GB / 80.0 GB VRAM',
              role: '4K Equirectangular Planetary Albedo Maps & 22 Tarot Illuminations',
              metrics: '28/28 4K Textures & Cards Synthesized • 2048×1024 Seamless',
              color: '#38BDF8',
            },
            {
              engine: 'LTX-Video 2B (ComfyUI :8188)',
              vram: '9.4 GB / 80.0 GB VRAM',
              role: '60fps Orbital Planetary Flybys & 22 Arcane Tarot Loops',
              metrics: '6 Orbital Flyby .WEBP + 22 Tarot .MP4 Motion Loops Verified',
              color: '#A855F7',
            },
            {
              engine: 'Headless Blender 4.0.2 + Braille Synth',
              vram: '6.8 GB / 80.0 GB VRAM',
              role: '49 Interactive 3D .GLB Meshes + 60fps U+2800 Braille Rigs',
              metrics: '6 Planet .GLBs + 21 Agent .GLBs + 22 Tarot Diorama .GLBs',
              color: '#10B981',
            },
          ].map((item) => (
            <Grid key={item.engine} xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2.2,
                  height: '100%',
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(15,23,42,0.72)' : '#F8FAFC',
                  border: `1px solid ${item.color}55`,
                }}
              >
                <Chip
                  label={item.vram}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    mb: 1.2,
                    bgcolor: `${item.color}22`,
                    color: item.color,
                  }}
                />
                <Typography sx={{ fontWeight: 850, fontSize: '0.96rem', color: theme.palette.text.primary, mb: 0.8 }}>
                  {item.engine}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 1.2, lineHeight: 1.5 }}>
                  {item.role}
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: item.color, fontWeight: 700 }}>
                  ✔ {item.metrics}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Bottom Live Status Ticker */}
      <Box
        sx={{
          mt: 2.5,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(5, 7, 14, 0.82)' : '#F1F5F9',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.2)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#FDE047' : '#B8860B', fontWeight: 700 }}>
          ★ {castLog}
        </Typography>
        <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: theme.palette.text.secondary, fontWeight: 700 }}>
          Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
        </Typography>
      </Box>
    </Paper>
  );
}
