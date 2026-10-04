import { createContext, useContext } from 'react';

/**
 * Intro gate — lets any component know whether the route's motion-edit intro
 * has handed off to the page yet.
 *
 * phase:
 *   'intro'    → intro overlay is covering the page; hold entrance animations.
 *   'handoff'  → aperture is opening; entrance animations should start NOW so
 *                they land in sync with the reveal.
 *   'idle'     → no overlay; behave normally.
 *
 * Default value is 'idle' so components work outside the provider (tests,
 * isolated renders, prerender).
 */
export const IntroGateContext = createContext({ phase: 'idle', routeKey: null });

export function useIntroPhase() {
  return useContext(IntroGateContext).phase;
}

/** True once the page is allowed to animate in (handoff or idle). */
export function useIntroReleased() {
  return useContext(IntroGateContext).phase !== 'intro';
}
