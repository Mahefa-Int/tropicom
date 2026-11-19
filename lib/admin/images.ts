import "server-only";
import path from "node:path";
import sharp, { type Metadata } from "sharp";

/**
 * Images de la médiathèque.
 * - À l'envoi, l'image est gardée telle quelle (seuls les formats que les navigateurs n'affichent pas sont convertis).
 * - Le bouton « Optimiser » de la médiathèque la convertit en webp, la redimensionne et la compresse
 *   avec des réglages sans perte visible (voir OPTIMIZE).
 */
export const uploadDir = () => path.resolve(process.env.UPLOAD_DIR || "./uploads");

/** formats servis tels quels (affichés par tous les navigateurs) */
export const WEB_FORMATS: Record<string, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
  gif: { ext: "gif", mime: "image/gif" },
};

export const OPTIMIZE = {
  /** côté le plus long : 2560 px suffit pour une image pleine largeur sur écran haute définition */
  maxSide: 2560,
  /** qualité webp 80 : différence invisible à l'œil, fichier 3 à 10 fois plus léger qu'un jpeg d'appareil photo */
  quality: 80,
  /** transparence (logos, PNG) un peu mieux gardée */
  alphaQuality: 90,
};

/** dimensions affichées, en tenant compte de la rotation EXIF des photos de téléphone */
export function displaySize(meta: Metadata) {
  const swap = (meta.orientation ?? 1) >= 5;
  return { width: (swap ? meta.height : meta.width) ?? 0, height: (swap ? meta.width : meta.height) ?? 0 };
}

/** conversion webp + redimensionnement + compression ; renvoie le nouveau fichier et ses dimensions */
export async function toOptimizedWebp(input: Buffer) {
  const { data, info } = await sharp(input, { animated: false })
    .rotate()
    .resize({ width: OPTIMIZE.maxSide, height: OPTIMIZE.maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality: OPTIMIZE.quality, alphaQuality: OPTIMIZE.alphaQuality, effort: 6, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
