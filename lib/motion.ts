/**
 * Animations et réglage Windows / macOS « réduire les animations ».
 *
 * Choix du client : les animations du site tournent pour tout le monde, même quand l'ordinateur
 * demande de les réduire (Windows : Paramètres → Accessibilité → Effets visuels → « Effets d'animation »
 * désactivé, réglage fréquent sur les PC de bureau) — sinon le colibri reste figé, la ligne ne se dessine
 * pas, etc.
 *
 * Pour respecter à nouveau ce réglage : passer RESPECT_REDUCED_MOTION à true. Le JS s'arrête alors
 * d'animer, et RevealObserver pose data-reduce-motion sur <html>, ce qui active les règles CSS
 * « :root[data-reduce-motion] … » de globals.css.
 */
export const RESPECT_REDUCED_MOTION = false;

export function prefersReducedMotion() {
  return RESPECT_REDUCED_MOTION && typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
