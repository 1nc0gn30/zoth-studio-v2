import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'zoth-reality-theme';

export const REALITY_THEMES = {
  gold: {
    id: 'gold',
    name: 'Sovereign Gold Master',
    shortName: '24K Gold',
    badge: 'RING-0 SANCTUM',
    tagline: 'Canonical 24K Alchemical Gold • Sacred Orbital Geometry & Sovereign Pantheon',
    accent: '#D4AF37',
    accentLightMode: '#8A6508',
    accentSoft: '#F5E6AB',
    accentWash: 'rgba(212, 175, 55, 0.14)',
    accentBorder: 'rgba(212, 175, 55, 0.38)',
    bgDark: '#08080B',
    cardBgDark: 'rgba(15, 16, 24, 0.86)',
    navGradientDark: 'linear-gradient(180deg, rgba(16, 15, 22, 0.92) 0%, rgba(8, 8, 11, 0.86) 100%)',
    seamGradient: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.25) 15%, #D4AF37 50%, rgba(212,175,55,0.25) 85%, transparent 100%)',
    cardRadius: '14px',
    uiStyle: 'alchemical',
    logoTitle: 'Zoth Studio',
    logoSubtitle: '24K SANCTUM',
    bot: {
      id: 'aurum-archon',
      name: 'AURUM-IX',
      title: '24K Sovereign Archon Bot',
      chassis: 'crowned-orb',
      primary: '#D4AF37',
      secondary: '#FFF1B8',
      greeting: 'Sovereign Gold Master engaged. 21-Agent orbital rings & Ring-0 enclave nominal.',
      quotes: [
        '24K Alchemical Gold invariance locked across all 131 routes.',
        'Byzantine quorum rings rotating at 60Hz deterministic phase.',
        'Zero external egress verified on 127.0.0.1 loopback bus.',
      ],
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Hermetic Matrix Emerald',
    shortName: 'Matrix Rain',
    badge: 'P39 PHOSPHOR',
    tagline: 'P39 Phosphor CRT Terminal • Interactive Katakana Digital Rain & Sobel Contours',
    accent: '#00FF9D',
    accentLightMode: '#047857',
    accentSoft: '#A7F3D0',
    accentWash: 'rgba(0, 255, 157, 0.13)',
    accentBorder: 'rgba(0, 255, 157, 0.42)',
    bgDark: '#020804',
    cardBgDark: 'rgba(4, 18, 9, 0.88)',
    navGradientDark: 'linear-gradient(180deg, rgba(3, 18, 8, 0.94) 0%, rgba(2, 8, 4, 0.90) 100%)',
    seamGradient: 'linear-gradient(90deg, transparent 0%, rgba(0,255,157,0.25) 15%, #00FF9D 50%, rgba(0,255,157,0.25) 85%, transparent 100%)',
    cardRadius: '4px',
    uiStyle: 'terminal',
    logoTitle: 'ZOTH_MATRIX',
    logoSubtitle: '0x9D // CRT',
    bot: {
      id: 'cipher-droid',
      name: 'CIPHER-0x9D',
      title: 'Phosphor Kernel Construct',
      chassis: 'matrix-hood',
      primary: '#00FF9D',
      secondary: '#34D399',
      greeting: 'wake_up_operator(); // P39 Phosphor Digital Rain & syscall hooks engaged.',
      quotes: [
        'Katakana rain buffer streaming at 60fps with zero packet loss.',
        'Sobel directional glyph quantizer locked onto cursor vector.',
        'All DOM containers recalibrated to 4px tactical terminal geometry.',
      ],
    },
  },
  ghost: {
    id: 'ghost',
    name: 'NullAI Ghostmode Stealth',
    shortName: 'Ghostmode',
    badge: 'AMNESIC TOR',
    tagline: 'Crimson Amnesic Stealth • Onion Sonar Field, MAC Cloaking & Volatile RAM Guard',
    accent: '#F43F5E',
    accentLightMode: '#BE123C',
    accentSoft: '#FDA4AF',
    accentWash: 'rgba(244, 63, 94, 0.14)',
    accentBorder: 'rgba(244, 63, 94, 0.42)',
    bgDark: '#090306',
    cardBgDark: 'rgba(22, 6, 13, 0.88)',
    navGradientDark: 'linear-gradient(180deg, rgba(24, 6, 14, 0.94) 0%, rgba(9, 3, 6, 0.90) 100%)',
    seamGradient: 'linear-gradient(90deg, transparent 0%, rgba(244,63,94,0.25) 15%, #F43F5E 50%, rgba(244,63,94,0.25) 85%, transparent 100%)',
    cardRadius: '8px',
    uiStyle: 'stealth',
    logoTitle: 'GHOST // NULL',
    logoSubtitle: 'TOR :9050',
    bot: {
      id: 'specter-wraith',
      name: 'SPECTER-V',
      title: 'Amnesic Stealth Wraith',
      chassis: 'stealth-wraith',
      primary: '#F43F5E',
      secondary: '#FB7185',
      greeting: 'Ghostmode cloaking active. MAC randomized, swap disabled, Tor SOCKS5 locked.',
      quotes: [
        'Sonar perimeter sweep active — zero unauthorized outbound sockets.',
        'Volatile RAM enclave armed; forensic disk footprint is 0 bytes.',
        'Crimson low-lux HUD optics engaged for darkroom operations.',
      ],
    },
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan Quantum',
    shortName: 'Quantum Cyan',
    badge: 'STDP TENSOR',
    tagline: 'High-Frequency Quantum Cyan • 4D Hypercube Lattice & STDP Neural Synapses',
    accent: '#00F0FF',
    accentLightMode: '#0369A1',
    accentSoft: '#A5F3FC',
    accentWash: 'rgba(0, 240, 255, 0.13)',
    accentBorder: 'rgba(0, 240, 255, 0.42)',
    bgDark: '#030811',
    cardBgDark: 'rgba(6, 18, 34, 0.88)',
    navGradientDark: 'linear-gradient(180deg, rgba(6, 20, 38, 0.94) 0%, rgba(3, 8, 17, 0.90) 100%)',
    seamGradient: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.25) 15%, #00F0FF 50%, rgba(0,240,255,0.25) 85%, transparent 100%)',
    cardRadius: '10px',
    uiStyle: 'holographic',
    logoTitle: 'Zoth Quantum',
    logoSubtitle: '4D TESSERACT',
    bot: {
      id: 'kitsune-mecha',
      name: 'KITSUNE-Q9',
      title: 'Quantum Tensor Familiar',
      chassis: 'kitsune-mecha',
      primary: '#00F0FF',
      secondary: '#C084FC',
      greeting: 'Quantum Cyan lattice online! Nine tensor tails & STDP vector synapses aligned.',
      quotes: [
        'Firing Hebbian STDP action potentials across the 4D hypercube mesh.',
        'WebGPU & SIMD vector lanes humming at sub-millisecond latency.',
        'Move your cursor across the quantum lattice to excite neural nodes!',
      ],
    },
  },
  incognito: {
    id: 'incognito',
    name: 'Covert Chameleon Guise',
    shortName: 'Chameleon',
    badge: 'FLUENT COVERT',
    tagline: 'Undercover Enterprise Guise • Fluent Mica Aurora & Discreet Corporate Shell',
    accent: '#38BDF8',
    accentLightMode: '#0284C7',
    accentSoft: '#BAE6FD',
    accentWash: 'rgba(56, 189, 248, 0.12)',
    accentBorder: 'rgba(56, 189, 248, 0.35)',
    bgDark: '#0B111B',
    cardBgDark: 'rgba(17, 25, 39, 0.90)',
    navGradientDark: 'linear-gradient(180deg, rgba(17, 24, 39, 0.94) 0%, rgba(11, 17, 27, 0.90) 100%)',
    seamGradient: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.22) 15%, #38BDF8 50%, rgba(56,189,248,0.22) 85%, transparent 100%)',
    cardRadius: '16px',
    uiStyle: 'fluent',
    logoTitle: 'Workspace Hub',
    logoSubtitle: 'ENTERPRISE v11',
    bot: {
      id: 'cortex-exec',
      name: 'CORTEX-PRO',
      title: 'Covert Enterprise Assistant',
      chassis: 'fluent-drone',
      primary: '#38BDF8',
      secondary: '#94A3B8',
      greeting: 'Covert Chameleon active. Alchemical markings cloaked under standard enterprise UI.',
      quotes: [
        'All offensive & sovereign daemons hidden behind corporate telemetry.',
        'Fluent Mica acrylic surfaces and neutral enterprise emblems active.',
        'Press Shift+R anytime to drop disguise and return to Gold Master.',
      ],
    },
  },
};

export const REALITY_ORDER = ['gold', 'matrix', 'ghost', 'cyan', 'incognito'];

// Enrich each theme object with normalized alias fields so components using either
// `reality.accent` or `activeTheme.primary` work seamlessly.
Object.values(REALITY_THEMES).forEach((t) => {
  t.primary = t.accent;
  t.secondary = t.bot?.secondary || t.accentSoft;
  t.bgVoid = t.bgDark;
  t.border = t.accentBorder;
  t.borderRadius = t.cardRadius;
  t.shortLabel = t.shortName;
  t.botName = t.bot?.name || 'AURUM-IX';
  t.botTitle = t.bot?.title || 'Sovereign Companion';
  t.cardGlow = `0 20px 60px rgba(0, 0, 0, 0.72), 0 0 36px ${t.accentWash}`;
});

const RealityContext = createContext(null);

export function RealityProvider({ children }) {
  const [realityId, setRealityId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('reality');
      if (fromUrl && REALITY_THEMES[fromUrl]) return fromUrl;
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && REALITY_THEMES[saved]) return saved;
    } catch (_) {
      /* ignore */
    }
    return 'gold';
  });

  const setReality = (nextId, syncOs = true) => {
    const resolved = REALITY_THEMES[nextId] ? nextId : 'gold';
    setRealityId(resolved);
    try {
      window.localStorage.setItem(STORAGE_KEY, resolved);
    } catch (_) {
      /* ignore */
    }
    if (syncOs && typeof window !== 'undefined') {
      fetch('/api/studio/reality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: resolved }),
      }).catch(() => {});
    }
  };

  const cycleReality = () => {
    const idx = REALITY_ORDER.indexOf(realityId);
    const next = REALITY_ORDER[(idx + 1) % REALITY_ORDER.length];
    setReality(next);
  };

  // Two-way synchronization with OS reality engine (/usr/local/bin/zoth-mode)
  useEffect(() => {
    let unmounted = false;
    const syncFromOS = async () => {
      try {
        const res = await fetch('/api/studio/reality');
        if (res.ok && !unmounted) {
          const data = await res.json();
          if (data?.mode && REALITY_THEMES[data.mode] && data.mode !== realityId) {
            setReality(data.mode, false);
          }
        }
      } catch (_) {}
    };

    syncFromOS();
    const interval = setInterval(syncFromOS, 3000);
    return () => {
      unmounted = true;
      clearInterval(interval);
    };
  }, [realityId]);

  const activeReality = REALITY_THEMES[realityId] || REALITY_THEMES.gold;

  // Apply global CSS variables & data-reality attribute for distinct per-reality UI chrome
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    document.body.dataset.reality = activeReality.id;
    root.style.setProperty('--reality-accent', activeReality.accent);
    root.style.setProperty('--reality-accent-soft', activeReality.accentSoft);
    root.style.setProperty('--reality-accent-wash', activeReality.accentWash);
    root.style.setProperty('--reality-accent-border', activeReality.accentBorder);
    root.style.setProperty('--reality-bg-dark', activeReality.bgDark);
    root.style.setProperty('--reality-card-bg', activeReality.cardBgDark);
    root.style.setProperty('--reality-card-radius', activeReality.cardRadius);
    root.style.setProperty('--reality-seam', activeReality.seamGradient);
  }, [activeReality]);

  // Global Shift+R shortcut to cycle Reality Themes
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'r') {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
        e.preventDefault();
        cycleReality();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [realityId]);

  const value = useMemo(
    () => ({
      realityId: activeReality.id,
      reality: activeReality,
      activeTheme: activeReality,
      realities: REALITY_THEMES,
      themes: REALITY_THEMES,
      realityOrder: REALITY_ORDER,
      setReality,
      setRealityId: setReality,
      cycleReality,
    }),
    [activeReality]
  );

  return <RealityContext.Provider value={value}>{children}</RealityContext.Provider>;
}

export function useReality() {
  const ctx = useContext(RealityContext);
  if (!ctx) {
    return {
      realityId: 'gold',
      reality: REALITY_THEMES.gold,
      activeTheme: REALITY_THEMES.gold,
      realities: REALITY_THEMES,
      themes: REALITY_THEMES,
      realityOrder: REALITY_ORDER,
      setReality: () => {},
      setRealityId: () => {},
      cycleReality: () => {},
    };
  }
  return ctx;
}
