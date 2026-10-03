/**
 * Captures of the running studio: page screenshots and intro recordings.
 * Files live in public/studio-captures/ and are served from /studio-captures/.
 */

const capture = (slug) => ({
  desktopImage: `/studio-captures/${slug}-desktop.webp`,
  mobileImage: `/studio-captures/${slug}-mobile.webp`,
  desktopVideo: `/studio-captures/${slug}-intro-desktop.mp4`,
  mobileVideo: `/studio-captures/${slug}-intro-mobile.mp4`,
});

export const galleryGroups = [
  {
    id: 'main',
    title: 'Main pages',
    lede: 'Each flagship route plays its rendered intro, then opens the page. Wide screens use the desktop cut. Narrow screens use the mobile cut.',
    items: [
      { slug: 'home', title: 'Home', path: '/', ...capture('home') },
      { slug: 'adytum', title: 'Adytum', path: '/adytum', ...capture('adytum') },
      { slug: 'memory', title: 'Memory', path: '/memory', ...capture('memory') },
      { slug: 'swarm', title: 'Swarm', path: '/swarm', ...capture('swarm') },
      { slug: 'bridges', title: 'Bridges', path: '/bridges', ...capture('bridges') },
      { slug: 'tools', title: 'Tools', path: '/tools', ...capture('tools') },
      { slug: 'workstations', title: 'Workstations', path: '/workstations', ...capture('workstations') },
      { slug: 'consensus', title: 'Consensus', path: '/consensus', ...capture('consensus') },
      { slug: 'webgen', title: 'WebGen', path: '/webgen', ...capture('webgen') },
      { slug: 'hexstrike', title: 'HexStrike', path: '/hexstrike', ...capture('hexstrike') },
      { slug: 'zoth-os', title: 'Zoth OS', path: '/zoth-os', ...capture('zoth-os') },
      { slug: 'arsenal', title: 'Arsenal', path: '/arsenal', ...capture('arsenal') },
      { slug: 'docs', title: 'Documentation', path: '/docs', ...capture('docs') },
      { slug: 'docs-math', title: 'Six Math Pillars', path: '/docs/math', ...capture('docs-math') },
      { slug: 'faqs', title: 'FAQs', path: '/faqs', ...capture('faqs') },
      { slug: 'ax', title: 'Agent Experience', path: '/ax', ...capture('ax') },
    ],
  },
  {
    id: 'nested-docs',
    title: 'Section documentation',
    lede: 'Nested docs routes play that section’s intro. /adytum/docs uses the Adytum cut in public/intros/, and the same rule covers the other section docs.',
    items: [
      { slug: 'adytum-docs', title: 'Adytum docs', path: '/adytum/docs', ...capture('adytum-docs') },
      { slug: 'memory-docs', title: 'Memory docs', path: '/memory/docs', ...capture('memory-docs') },
      { slug: 'swarm-docs', title: 'Swarm docs', path: '/swarm/docs', ...capture('swarm-docs') },
      { slug: 'webgen-docs', title: 'WebGen docs', path: '/webgen/docs', ...capture('webgen-docs') },
      { slug: 'hexstrike-docs', title: 'HexStrike docs', path: '/hexstrike/docs', ...capture('hexstrike-docs') },
      { slug: 'zoth-os-docs', title: 'Zoth OS docs', path: '/zoth-os/docs', ...capture('zoth-os-docs') },
      { slug: 'ax-docs', title: 'Agent Experience docs', path: '/ax/docs', ...capture('ax-docs') },
    ],
  },
];
