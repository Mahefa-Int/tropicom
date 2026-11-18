import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { db, schema } from "@/lib/db";
import { readSession } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/util";

/**
 * Envoi d'une image depuis l'admin (formulaire multipart, champ « file »).
 * L'image est redimensionnée (2000 px max) et convertie en webp, enregistrée dans UPLOAD_DIR (hors du dossier public,
 * car Next.js ne sert pas les fichiers ajoutés à public après la compilation), puis servie par /media/….
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

  let out: { data: Buffer; info: OutputInfo };
  try {
    out = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return Response.json({ error: "Image illisible." }, { status: 400 });
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const filename = `${base}-${randomBytes(4).toString("hex")}.webp`;
  const dir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), out.data);

  const url = `/media/${filename}`;
  const res = await db.insert(schema.media).values({
    filename,
    originalName: file.name.slice(0, 200),
    url,
    mime: "image/webp",
    size: out.data.length,
    width: out.info.width,
    height: out.info.height,
    uploadedBy: user.id,
  });
  return Response.json({ id: res[0].insertId, url, width: out.info.width, height: out.info.height });
}
