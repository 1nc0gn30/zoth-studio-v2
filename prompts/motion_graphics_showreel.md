# Zoth Studio v2 — Deterministic Motion Graphics & Launch Showreel Prompts

> **Product**: Zoth Studio v2 (`https://zoth.nullai.tech`)
> **Engineered by**: Neal Frazier Tech (`@1nc0gn30`) • NullAI Platform (`https://nullai.tech`)
> **Hero Anchor Shape**: The **24K Gold Aperture Seam & Extruded 3D Z Sigil (`#D4AF37` on `#08080B` Obsidian / `#B8860B` on `#FAF8F3` Editorial Ivory)** — a precision 2px gold horizon line that ignites at center, splits like a machined camera aperture, and guides the viewer's eye across every workstation, daemon, and repository card with zero visual dead space.

---

## 1. Master 15-Second Showreel Prompt (Revid.ai / Claude Motion / Remotion)

```text
Act as a world-class motion graphics director and lead interface architect. Create a deterministic, code-first 15-second motion graphics showreel (60fps, 1920x1080 widescreen + 1080x1920 vertical) for Zoth Studio v2 (https://zoth.nullai.tech).

Product: Zoth Studio v2 — Local-First Sovereign AI Engineering Suite & 80 Open-Access Developer Tools
Hero Anchor: The 24K Gold Aperture Seam (#D4AF37) and Extruded 3D Z Sigil lead every frame. A razor-sharp 2px gold horizon line flares across obsidian (#08080B), splits vertically to reveal UI surfaces, and docks cleanly into the Zoth Studio emblem at resolve.

Scene Breakdown & Exact On-Screen Copy:
- Scene 1 (0:00 - 0:02): Darkness fractures with a 2px #D4AF37 gold horizon flare. Kinetic serif display drop in Celtic Garamond.
  Text: "CLOUD LOCK-IN ENDS ON 127.0.0.1."
- Scene 2 (0:02 - 0:05): Aperture seam opens cleanly into the Zoth Studio v2 command deck with tactile corner-tick Bento plates.
  Text: "80 FREE OPEN-ACCESS TOOLS · 56 WEBGPU + 24 CLI"
- Scene 3 (0:05 - 0:08): Rapid isometric snap-zoom across live loopback ports (:3000 Studio, :8094 STDP Neuro-Memory, :5173 Zoth Bolt WebGen, :8888 HexStrike AI).
  Text: "79 PUBLIC GITHUB REPOS · 43 STUDIO WORKSTATIONS"
- Scene 4 (0:08 - 0:11): Dual-theme split wipe — Obsidian Gold (#08080B / #D4AF37) on left, Editorial Alabaster Ivory (#FAF8F3 / #B8860B) on right — bridged by the Sovereign Ecosystem Matrix.
  Text: "ZOTHOS v3.4.0 · ZOTHOS-LITE v1.2 · CIVILIZATION v3.0"
- Scene 5 (0:11 - 0:13): Telemetry counters lock to 0 WAN Egress, 23 ZothOS Loopback Daemons, 56 Curated Models, and 23 Pantheon Agents.
  Text: "100% UNLOCKED. ZERO PAYWALLS. ZERO TELEMETRY."
- Scene 6 (0:13 - 0:15): Gold horizon seam converges into the 3D Orbital Z Sigil lockup on warm ivory title card for clean route handoff.
  Text: "ZOTH STUDIO v2 — zoth.nullai.tech"

Style, Typography & Choreography Constraints:
- Palette: Obsidian Void (#08080B), Elevated Slate (#0D0F16), Sovereign Gold (#D4AF37), Light Tint (#F5E6AB), and Editorial Ivory (#FAF8F3) with Burnished Bronze (#B8860B / #7A5808).
- Typography: Display headings in Celtic Garamond (400), UI copy in Google Sans / Inter, telemetry eyebrows & ports in JetBrains Mono (uppercase, 0.18em tracking).
- Motion Curves: Deterministic cubic-bezier(0.16, 1, 0.3, 1) snap easing, transform/opacity-only GPU composition, 120 BPM beat-synced cuts, and final 0.62s Aperture Seam handoff.
```

---

## 2. 30-Second Ecosystem Launch Film Prompt

```text
Create a cinematic, code-directed 30-second product launch film (16:9, 60fps) for Zoth Studio v2 and the NullAI Sovereign Ecosystem.

Narrative Arc:
1. The Problem (0:00 - 0:06):
   - Monospace terminal warnings of SaaS paywalls, leaked API payloads, and cloud latency spinners dissolve behind a razor-sharp #D4AF37 gold scanline.
   - Text: "Your code, prompts, and keys belong on your own silicon."
2. The Sovereign Studio (0:06 - 0:13):
   - The Gold Aperture Seam opens into Zoth Studio v2 running locally on 127.0.0.1:3000.
   - Showcase instant `npx @nullaitech/zoth studio` launch, searchable 80-tool Arsenal (56 in-browser/WebGPU + 24 CLI/daemon across 79 public GitHub repos), and 43 interactive Studio workstations.
3. The Connected Ecosystem (0:13 - 0:23):
   - Card 1 (3.5s): ZothOS v3.4.0 (zothos.nullai.tech) — Debian 13 + KDE Plasma 6 live workstation OS with 23 resident loopback daemons.
   - Card 2 (3.5s): ZothOS-Lite v1.2 (zothos-lite.nullai.tech) — Amnesic Monotone Live USB/ISO (`toram`) with 56 curated models across 8 providers.
   - Card 3 (3.0s): Zoth Civilization v3.0 (zoth-civilization.netlify.app) — 23 Pantheon Agents, 22-Key Sanctuary, DeepSeek Flash × Hermes BYOK, plus ZothNet (zothnet.nullai.tech) & FieldKit (nullai.tech/fieldkit).
4. Resolve & Open-Access Guarantee (0:23 - 0:30):
   - Floating dual-theme Studio showcase resolves into the 24K Gold Z Sigil.
   - Closing Lockup: "Zoth Studio v2 • 100% Free & Open Access • Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform • https://zoth.nullai.tech"
```

---

## 3. In-App Motion Assets in `zoth-studio-v2`

- **Route Aperture Intros**: Pre-rendered 60fps WebM + MP4 cuts in `public/intros/<route>-{desktop,mobile}.{webm,mp4}` orchestrated by `src/motion/IntroDirector.jsx` with skip affordance, `prefers-reduced-motion` respect, and `?intro=0` / `?intro=1` controls.
- **Interactive 3D Anchor**: `src/components/GoldenZLogo3D.jsx` — 60fps HTML5 Canvas extruded 24K Z sigil with 3 orbital Pantheon rings.
- **Home Hero Showreel Modal**: Interactive **"Watch 15s Launch Reel"** player embedded directly on `HomePage.jsx` playing `/intros/home-desktop.webm` (with MP4 fallback) inside a framed Sovereign Studio dialog.
