import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { db, schema } from "@/lib/db";
import { readSession } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/util";
import { WEB_FORMATS, displaySize, toOptimizedWebp, uploadDir } from "@/lib/admin/images";

/**
 * Envoi d'une image depuis l'admin (formulaire multipart, champ « file »).
 * L'image est gardée telle quelle (JPEG, PNG, WebP, GIF) ; on l'optimise ensuite depuis la médiathèque (bouton « Optimiser »).
 * Les formats que les navigateurs n'affichent pas (HEIC d'iPhone, TIFF, SVG…) sont convertis et optimisés tout de suite.
 * Fichiers dans UPLOAD_DIR (hors du dossier public, car Next.js ne sert pas les fichiers ajoutés à public après la compilation),
 * servis par /media/….
 */
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return Response.json({ error: "Non connecté." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Aucun fichier." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Seules les images sont acceptées." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image trop lourde (15 Mo maximum)." }, { status: 400 });

  const input = Buffer.from(await file.arrayBuffer());
  let meta: Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    return Response.json({ error: "Image illisible." }, { status: 400 });
  }

  const web = meta.format ? WEB_FORMATS[meta.format] : undefined;
  let data = input;
  let ext: string;
  let mime: string;
  let size: { width: number; height: number };
  let optimizedAt: Date | null = null;
  if (web) {
    ({ ext, mime } = web);
    size = displaySize(meta);
  } else {
    try {
      const out = await toOptimizedWebp(input);
      data = out.data;
      size = { width: out.width, height: out.height };
    } catch {
      return Response.json({ error: "Format non pris en charge." }, { status: 400 });
    }
    ext = "webp";
    mime = "image/webp";
    optimizedAt = new Date();
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const filename = `${base}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), data);

  const url = `/media/${filename}`;
  const res = await db.insert(schema.media).values({
    filename,
    originalName: file.name.slice(0, 200),
    url,
    mime,
    size: data.length,
    originalSize: input.length,
    optimizedAt,
    width: size.width,
    height: size.height,
    uploadedBy: user.id,
  });
  return Response.json({ id: res[0].insertId, url, width: size.width, height: size.height });
}
