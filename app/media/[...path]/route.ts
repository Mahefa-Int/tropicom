import { readFile } from "node:fs/promises";
import path from "node:path";

/** sert les images envoyées depuis l'admin (UPLOAD_DIR) : /media/nom-du-fichier.webp */
const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif" }; // pas de SVG (risque de script)

export async function GET(_: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const name = path.basename(parts.join("/")); // pas de sous-dossiers ni de « .. »
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("Introuvable", { status: 404 });
  try {
    const data = await readFile(path.join(path.resolve(process.env.UPLOAD_DIR || "./uploads"), name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
