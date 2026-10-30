/** Public surface of the sovereign visual primitives. */
export { SOV, rgba, MONO, DISPLAY, hashSeed, rng, VARIANTS, VARIANT_META, ACCENTS, pickVariant, pickAccent, bandAccent, luma } from './palette.js';
export { BAYER8, bayer8, dither2Tone, ditherFieldToRGBA } from './bayer.js';
export { DOT_BITS, BLANK, cellChar, bitsFromDots, dotsFromBits, probeBrailleSupport, drawBrailleField } from './braille.js';
export { RENDERERS, getRenderer, sceneAccent, brailleOrbit, bayerField, scanlineGrid, particleOrbit } from './renderers.js';
export { useSovereignCanvas, SOV_SCENE_FALLBACK } from './useSovereignCanvas.js';
export { default as SovereignBand, SCANLINE_CSS } from './SovereignBand.jsx';
export { eyebrowSx, titleBaseSx, titleSx, ledeSx, metaSx, SovereignRule, SovereignSectionHead, SovereignEyebrow, SovereignLede, SovereignMeta } from './typography.jsx';
