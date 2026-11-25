/**
 * Mode maintenance + accès « aperçu » au site.
 *
 * - Maintenance : en production, toutes les pages publiques affichent /maintenance (l'admin reste accessible).
 *   Pour ouvrir le site au public : variable d'environnement MAINTENANCE=off (puis redémarrer l'application).
 *   En local (npm run dev), la maintenance est coupée ; MAINTENANCE=on pour la tester.
 * - Aperçu : le cadenas de la page de maintenance demande un code d'accès STATIQUE (sans base de données) :
 *   « UPGRADE » par défaut (majuscules ou minuscules), modifiable par PREVIEW_CODE.
 *   Une fois le code saisi, un cookie laisse voir le site normalement pendant 30 jours.
 */
export const PREVIEW_COOKIE = "tc_preview";
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30;

/** code d'accès, comparé sans tenir compte des majuscules */
export const previewCode = () => (process.env.PREVIEW_CODE || "UPGRADE").trim().toUpperCase();

/** valeur du cookie : dérivée du code (changer le code invalide les anciens accès) */
export async function previewToken() {
  const data = new TextEncoder().encode(`tropicom-preview:${previewCode()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function maintenanceOn() {
  const v = (process.env.MAINTENANCE || "").toLowerCase();
  if (v === "on" || v === "1" || v === "true") return true;
  if (v === "off" || v === "0" || v === "false") return false;
  return process.env.NODE_ENV === "production";
}
